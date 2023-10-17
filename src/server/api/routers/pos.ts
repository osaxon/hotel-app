import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  ItemCategory,
  OrderStatus,
  PaymentStatus,
  Reservation,
  type PrismaClient,
  InvoiceType,
} from "@prisma/client";
import { isHappyHour } from "@/lib/utils";
import { Decimal } from "@prisma/client/runtime/library";
import { generateInvoiceNumber } from "@/utils/generateInvoiceNumber";
import { type Item } from "@prisma/client";
import { prisma } from "@/server/db";
import { AppliedDiscount } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";

interface ItemToUpdate {
  itemId: string;
  qtyToSubtract: Decimal;
}

interface CurrencyConversionResponse {
  rates: {
    [currency: string]: number;
  };
}

export type ItemWithQuantity = Item & {
  quantity: number;
};

export type ItemWithQuantityAndDiscount = Item & {
  quantity: number;
  appliedDiscount: AppliedDiscount;
};

// Function to calculate the price and discount applied for an item
async function calculateItemPriceAndDiscount(
  guestId: string | undefined,
  item: Item,
  happyHourOverride: boolean
): Promise<{
  price: Decimal;
  discountApplied: AppliedDiscount | null;
  cost: Decimal;
}> {
  const { priceUSD, happyHourPriceUSD, staffPriceUSD, totalCostUSD } = item;

  let price = priceUSD;
  let discountApplied: AppliedDiscount = AppliedDiscount.NONE;
  const cost = totalCostUSD ?? new Decimal(0);

  console.log(
    `Calculating item price and discount for guest ID ${guestId ?? "None"}`
  );

  if (!guestId) {
    console.log("Not a guest");
    console.log("Happy hour?");
    console.log(isHappyHour());
    console.log(happyHourOverride);
    isHappyHour() || happyHourOverride
      ? ((discountApplied = AppliedDiscount.HAPPY_HOUR),
        (price = happyHourPriceUSD ?? priceUSD))
      : ((discountApplied = AppliedDiscount.NONE), (price = priceUSD));
  } else if (guestId) {
    console.log("Guest");
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: { type: true },
    });
    if (!isHappyHour() && !happyHourOverride) {
      console.log("Not happy hour");
      console.log(`Guest type ${guest?.type ?? ""}`);

      guest?.type === "STAFF"
        ? ((discountApplied = AppliedDiscount.STAFF),
          (price = staffPriceUSD ?? priceUSD))
        : ((discountApplied = AppliedDiscount.NONE), (price = priceUSD));
    } else {
      console.log("Happy hour");
      console.log(`Guest type ${guest?.type ?? ""}`);

      guest?.type === "STAFF"
        ? ((discountApplied = AppliedDiscount.STAFF),
          (price = staffPriceUSD ?? priceUSD))
        : ((discountApplied = AppliedDiscount.HAPPY_HOUR),
          (price = happyHourPriceUSD ?? priceUSD));
    }
  }
  return { price, discountApplied, cost };
}

async function updateItemStockLevels(
  prisma: PrismaClient,
  itemsToUpdate: ItemToUpdate[]
) {
  for (const item of itemsToUpdate) {
    const existingItem = await prisma.item.findUnique({
      where: { id: item.itemId },
    });

    if (existingItem) {
      const existingQuantity = new Decimal(existingItem.quantityInStock);
      const qtyToSubtract = new Decimal(item.qtyToSubtract);
      const updatedQuantity = existingQuantity.minus(qtyToSubtract);

      await prisma.item.update({
        where: { id: item.itemId },
        data: { quantityInStock: updatedQuantity.toString() },
      });
    }
  }
}

const updateItemInputSchema = z.object({
  id: z.string(),
  priceUSD: z.number().refine((value) => !isNaN(value)),
  happyHourPriceUSD: z.number().refine((value) => !isNaN(value)),
  staffPriceUSD: z.number().refine((value) => !isNaN(value)),
  quantityInStock: z.number().refine((value) => !isNaN(value)),
  category: z.nativeEnum(ItemCategory),
});

export const addItemInputSchema = z.object({
  name: z.string(),
  descForInvoice: z.string(),
  priceUSD: z.number().positive(),
  happyHourPriceUSD: z.number().positive().optional(),
  category: z.nativeEnum(ItemCategory),
  quantityInStock: z.number().positive().optional(),
  mixedItem: z.boolean(),
  ingredients: z
    .array(
      z.object({
        id: z.string(),
        name: z.string().nullable(),
        quantity: z.number().positive(),
        ingredientId: z.string().optional(),
        quantityUnit: z.string().optional(),
      })
    )
    .optional(),
});

const addIngredientInputSchema = z.object({
  name: z.string(),
  itemId: z.string(),
  quantityUnit: z.string(),
  quantity: z.number().refine((value) => !isNaN(value)),
});

export const createManualOrderInputSchema = z.object({
  name: z.string(),
  note: z.string(),
  subTotalUSD: z.number().positive(),
  guestId: z.string(),
  invoiceId: z.string(),
});

// Define the input schema using Zod
const createOrderInputSchema = z
  .object({
    name: z.string().optional(),
    room: z.string().optional(),
    items: z.array(
      z.object({
        id: z.string(),
        quantity: z.number(),
      })
    ),
    guestId: z.string().optional(),
    invoiceId: z.string().optional(),
    reservationId: z.string().optional(),
    useHappyHourPrice: z.boolean().default(false),
  })
  .transform(async (data) => {
    const itemsWithDetails = await Promise.all(
      data.items.map(async (item) => {
        const itemDetails = await getItemDetails(item.id);
        return { ...item, ...itemDetails };
      })
    );
    return { ...data, items: itemsWithDetails };
  });

async function getItemDetails(itemId: string) {
  const item = prisma.item.findUnique({ where: { id: itemId } });
  return item;
}

export const posRouter = createTRPCRouter({
  getAllOrders: privateProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      include: {
        items: true,
        guest: true,
      },
      take: 100,
    });

    return orders;
  }),

  getTotalSales: privateProcedure.query(async ({ ctx }) => {
    const today = dayjs().endOf("day");
    const oneWeekAgo = dayjs().startOf("day").subtract(6, "day");

    const salesData = await ctx.prisma.order.groupBy({
      by: ["createdDate"],
      _sum: {
        subTotalUSD: true,
        totalCostUSD: true,
      },
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: oneWeekAgo.toDate(),
          lt: today.toDate(),
        },
      },
    });

    console.log(salesData);

    const formattedSalesData = salesData.map((data) => ({
      date: dayjs(data.createdDate).format("DD MMM"),
      totalOrders: data._count.id ?? 0,
      subTotal: Number(data._sum.subTotalUSD) ?? 0,
      totalCost: Number(data._sum.totalCostUSD) ?? 0,
    }));

    console.log(formattedSalesData);

    return formattedSalesData;
  }),

  getOrderById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const order = await ctx.prisma.order.findUnique({
        where: { id: input.id },
        include: {
          items: { include: { item: true } },
          guest: true,
          invoice: true,
        },
      });
      return order;
    }),

  getOrdersByName: privateProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const orders = await ctx.prisma.order.findMany({
        where: { name: input.name },
        include: { items: { include: { item: true } }, guest: true },
      });
      return orders;
    }),

  getLastDay: privateProcedure.query(async ({ ctx }) => {
    const currentDate = new Date();
    const twentyFourHoursAgo = new Date(
      currentDate.getTime() - 24 * 60 * 60 * 1000
    );
    const orders = await ctx.prisma.order.findMany({
      where: {
        createdAt: {
          gte: twentyFourHoursAgo,
        },
      },
      include: {
        items: {
          include: {
            item: true,
          },
        },
      },
    });

    return orders;
  }),

  getItems: publicProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.item.findMany({
      include: {
        _count: true,
        ingredients: {
          include: {
            _count: true,
          },
        },
      },
    });

    return items;
  }),

  getIngredients: privateProcedure.query(async ({ ctx }) => {
    const ingredients = await ctx.prisma.itemIngredient.findMany({
      include: {
        parentItems: true,
        ingredient: true,
      },
    });
    return ingredients;
  }),

  addItem: privateProcedure
    .input(addItemInputSchema)
    .mutation(async ({ ctx, input }) => {
      const validatedInput = addItemInputSchema.parse(input);

      // split ingredients from input
      const { mixedItem, ingredients, ...itemData } = validatedInput;

      // Create the item
      const item = await ctx.prisma.item.create({
        data: {
          happyHourPriceUSD: new Decimal(
            validatedInput.happyHourPriceUSD ?? validatedInput.priceUSD
          ),
          ...itemData,
        },
      });

      // Add Item Ingredients if provided

      if (mixedItem && ingredients && ingredients.length > 0) {
        // Extract the IDs from the Ingredients
        const ingredientIds = ingredients
          .filter((ingredient) => ingredient !== undefined)
          .map((ingredient) => ingredient?.id);

        // Find the Items in the database
        const items = await ctx.prisma.item.findMany({
          where: {
            id: {
              in: ingredientIds,
            },
          },
        });

        // Update the new Item in the database with the Ingredients
        await ctx.prisma.item.update({
          where: {
            id: item.id,
          },
          data: {
            ingredients: {
              connect: ingredients.map((ingredient) => ({ id: ingredient.id })),
            },
          },
        });
      }
      return item;
    }),

  updateItem: privateProcedure
    .input(updateItemInputSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedItem = await ctx.prisma.item.update({
        where: { id: input.id },
        data: {
          ...input,
        },
      });
      return updatedItem;
    }),

  addIngredient: privateProcedure
    .input(addIngredientInputSchema)
    .mutation(async ({ ctx, input }) => {
      const ingredient = await ctx.prisma.itemIngredient.create({
        data: {
          name: input.name,
          quantity: input.quantity,
          quantityUnit: input.quantityUnit,
          ingredient: {
            connect: {
              id: input.itemId,
            },
          },
        },
      });
      if (!ingredient) {
        throw new TRPCError({
          message: "Error creating the ingredient.",
          code: "UNPROCESSABLE_CONTENT",
        });
      }
      return ingredient;
    }),

  deactivateItem: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const updatedItem = await ctx.prisma.item.update({
        where: { id: input.id },
        data: { active: false },
      });
      return updatedItem;
    }),

  getItemById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const item = await ctx.prisma.item.findUnique({
        where: { id: input.id },
        include: {
          ingredients: {
            include: {
              ingredient: true,
            },
          },
          itemOrders: { include: { order: true, item: true } },
        },
      });

      return item;
    }),

  createOrder: privateProcedure
    .input(createOrderInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, items, guestId } = input;

      // Extract the itemIds and retrieve the item data from db
      const itemIds = items.map((item) => item.id);
      const itemData = await ctx.prisma.item.findMany({
        where: {
          id: { in: itemIds },
        },
        include: {
          ingredients: {
            include: {
              ingredient: true,
              parentItems: true,
            },
          },
        },
      });

      // START OF UPDATES
      // Calculate the price and discount for each item
      const calculatedItems = await Promise.all(
        items.map(async (item) => {
          // get rest of item data
          const itemDataItem = itemData.find((data) => data.id === item.id);

          if (!itemDataItem) {
            // Handle the case when item data is not found
            throw new TRPCError({
              message: "Item not found",
              code: "NOT_FOUND",
            });
          }

          const { price, discountApplied, cost } =
            await calculateItemPriceAndDiscount(
              guestId, // Pass the guestId if available
              itemDataItem,
              input.useHappyHourPrice // overrides happyhour
            );

          const subTotal = price.times(item.quantity);
          const totalCost = cost.times(item.quantity);
          return { item, price, discountApplied, subTotal, totalCost };
        })
      );

      // Create an array to store the calculated items with their respective discounts
      const orderItems = calculatedItems.map(({ item }) => ({
        item: { connect: { id: item.id } },
        quantity: item.quantity,
      }));

      // Calculate the total subTotal
      const subTotalUSD = calculatedItems.reduce(
        (total, { subTotal }) => total.plus(subTotal),
        new Decimal(0)
      );

      const totalCost = calculatedItems.reduce(
        (total, { totalCost }) => total.plus(totalCost),
        new Decimal(0)
      );

      // END OF UPDATES

      // This will contain any items which need to be updated that are used in a mixed item
      const itemIngredientsToUpdate: ItemToUpdate[] = [];
      // This contains any other items
      const itemsToUpdate: ItemToUpdate[] = [];

      // Adds the items to the above array for stock updates later in this mutation
      for (const item of itemData) {
        const itemQuantities: Record<string, number> = {};

        // Get the quantities of any items used
        for (const orderItem of items) {
          if (orderItem.id === item.id) {
            const quantity = itemQuantities[item.id] || 0;
            itemQuantities[item.id] = quantity + orderItem.quantity;
          }
        }

        // Add details of any items used as ingredients
        for (const ingredient of item.ingredients) {
          const quantityToUpdate =
            ingredient.quantity !== null && ingredient.quantity !== undefined
              ? Number(ingredient.quantity) * (itemQuantities[item.id] || 0)
              : 0;
          const itemToUpdate: ItemToUpdate = {
            itemId: ingredient.ingredientId ?? "",
            qtyToSubtract: new Decimal(quantityToUpdate),
          };

          itemIngredientsToUpdate.push(itemToUpdate);
        }

        const isIngredientItem = itemIngredientsToUpdate.some(
          (updatedItem) => updatedItem.itemId === item.id
        );
        const isParentItem = item.ingredients.length > 0;

        if (!isIngredientItem && !isParentItem) {
          itemsToUpdate.push({
            itemId: item.id,
            qtyToSubtract: new Decimal(itemQuantities[item.id] || 0),
          });
        }
      }
      console.log(calculatedItems);
      // Initialise the order data
      const orderData = {
        items: {
          create: orderItems,
        },
        guest: {} as { connect?: { id: string } },
        name: name,
        happyHour: isHappyHour(),
        subTotalUSD: subTotalUSD,
        totalCostUSD: totalCost,
        appliedDiscount: calculatedItems[0]?.discountApplied as AppliedDiscount,
        invoice: {} as { connect?: { id: string } },
      };

      if (input.guestId) {
        orderData.guest.connect = {
          id: input.guestId,
        };
      }

      let invoiceId = input.invoiceId; // To store the generated or provided invoiceId

      if (invoiceId) {
        orderData.invoice = {
          connect: {
            id: invoiceId,
          },
        };
      } else {
        const newInvoice = await ctx.xprisma.invoice.create({
          data: {
            invoiceNumber: "", // Leave this empty for now, it will be generated by the hook
            customerName: name ?? "",
            type: "BAR",
          },
        });
        invoiceId = newInvoice.id;
      }

      // Set the invoiceId for the order
      orderData.invoice = {
        connect: {
          id: invoiceId,
        },
      };

      const order = await ctx.xprisma.order.create({
        data: {
          ...orderData,
          invoice: {
            connect: { id: invoiceId },
          },
        },
        include: {
          items: true,
          reservation: {
            include: {
              invoice: {
                include: {
                  lineItems: true,
                },
              },
            },
          },
          invoice: true,
        },
      });

      // Update item stock levels
      await Promise.all([
        updateItemStockLevels(ctx.prisma, itemIngredientsToUpdate),
        updateItemStockLevels(ctx.prisma, itemsToUpdate),
      ]);

      return order;
    }),

  createManualOrder: privateProcedure
    .input(createManualOrderInputSchema)
    .mutation(async ({ ctx, input }) => {
      const order = await ctx.xprisma.order.create({
        data: {
          subTotalUSD: input.subTotalUSD,
          invoice: { connect: { id: input.invoiceId } },
          guest: { connect: { id: input.guestId } },
          note: input.note,
          isManualOrder: true,
          name: input.name,
        },
      });
      return order;
    }),

  markAsPaid: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      console.log(input.id);
      const updatedOrder = await ctx.prisma.order.update({
        where: { id: input.id },
        data: {
          status: OrderStatus.PAID,
        },
        include: {
          invoice: true,
          reservation: { include: { reservationItem: true } },
        },
      });

      console.log(updatedOrder);

      const invoiceId = updatedOrder.invoiceId;
      const reservation = updatedOrder.reservation;

      if (!updatedOrder || !invoiceId) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Not found",
        });
      }

      // Calculate the sum of all outstanding orders for the Invoice
      const outstandingOrders = await ctx.prisma.order.aggregate({
        where: {
          invoiceId: invoiceId,
          status: { not: OrderStatus.PAID },
        },
        _sum: { subTotalUSD: true },
      });

      console.log(outstandingOrders);

      let totalUSD = new Decimal(0); // Initialize totalUSD as a Decimal

      if (outstandingOrders._sum.subTotalUSD) {
        totalUSD = totalUSD.add(outstandingOrders._sum.subTotalUSD);
      }

      if (reservation && reservation.subTotalUSD) {
        // Calculate the Reservation subTotal and add it to the total
        totalUSD = totalUSD.add(reservation.subTotalUSD);
      }

      // Update the Invoice total
      const updatedInvoice = await ctx.prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          totalUSD: totalUSD,
        },
      });

      return updatedOrder;
    }),

  getInvoiceByNumber: privateProcedure
    .input(z.object({ invoiceNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { invoiceNumber: input.invoiceNumber },
        include: {
          guest: true,
          lineItems: true,
          reservations: {
            include: { guest: true, reservationItem: true },
          },
          orders: {
            include: {
              items: {
                include: {
                  item: true,
                },
              },
            },
          },
        },
      });

      return invoice;
    }),

  updateInvoiceStatus: privateProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(PaymentStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedInvoice = await ctx.prisma.invoice.update({
        where: { id: input.id },
        data: {
          status: input.status,
          orders: {
            updateMany: {
              where: { status: "UNPAID" },
              data: {
                status: input.status,
              },
            },
          },
          reservations: {
            updateMany: {
              where: {
                invoiceId: input.id,
              },
              data: {
                paymentStatus: input.status,
              },
            },
          },
        },
      });

      return updatedInvoice;
    }),

  updateStatus: privateProcedure
    .input(z.object({ id: z.string(), status: z.nativeEnum(OrderStatus) }))
    .mutation(async ({ ctx, input }) => {
      const updatedOrder = await ctx.xprisma.order.update({
        where: { id: input.id },
        data: {
          status: input.status,
        },
        include: {
          invoice: {
            include: {
              reservations: true,
            },
          },
          reservation: { include: { reservationItem: true } },
        },
      });

      return updatedOrder;
    }),

  getOpenInvoices: privateProcedure.query(async ({ ctx }) => {
    const invoices = await ctx.prisma.invoice.findMany({
      where: {
        status: {
          not: "CANCELLED",
        },
      },
      include: {
        guest: true,
        orders: {
          include: {
            items: {
              include: {
                item: true,
              },
            },
          },
        },
        reservations: {
          include: {
            reservationItem: true,
            room: true,
          },
        },
      },
    });

    return invoices;
  }),

  currencyConversion: privateProcedure
    .input(
      z.object({
        fromCurrency: z.string(),
        toCurrency: z.string(),
        amount: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { fromCurrency, toCurrency, amount } = input;
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );

      if (!response.ok) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to fetch currency.",
        });
      }

      const data = (await response.json()) as CurrencyConversionResponse;

      const conversionRate = data.rates[toCurrency];

      if (!conversionRate) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid currency",
        });
      }
      return {
        rates: {
          [toCurrency]: conversionRate,
        },
        converted: amount * conversionRate,
      };
    }),
});
