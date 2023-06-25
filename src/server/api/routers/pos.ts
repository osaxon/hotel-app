import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { ItemCategory, OrderStatus, type PrismaClient } from "@prisma/client";
import { isHappyHour } from "@/lib/utils";
import { Decimal } from "@prisma/client/runtime";
import { generateInvoiceNumber } from "@/utils/generateInvoiceNumber";
import { type Item } from "@prisma/client";
import { prisma } from "@/server/db";
import { AppliedDiscount } from "@prisma/client";
import { TRPCError } from "@trpc/server";

interface ItemToUpdate {
  itemId: string;
  qtyToSubtract: Decimal;
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
  item: Item
): Promise<{ price: Decimal; discountApplied: AppliedDiscount | null }> {
  const { priceUSD, happyHourPriceUSD, staffPriceUSD } = item;

  let price = priceUSD;
  let discountApplied: AppliedDiscount | null = null;

  if (guestId) {
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      select: { type: true },
    });

    if (guest?.type === AppliedDiscount.STAFF) {
      price = staffPriceUSD || priceUSD;
      discountApplied = AppliedDiscount.STAFF;
    }
  } else if (isHappyHour() && happyHourPriceUSD) {
    price = happyHourPriceUSD;
    discountApplied = AppliedDiscount.HAPPY_HOUR;
  }

  return { price, discountApplied };
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

export const addItemInputSchema = z.object({
  name: z.string(),
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
      where: { category: { not: { equals: "INGREDIENT" } } },
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

        return item;
      }
    }),

  //   createOrder: privateProcedure
  //     .input(createOrderInputSchema)
  //     .mutation(async ({ ctx, input }) => {
  //       const { name, items, guestId, reservationId, invoiceId } = input;
  //       let order;

  //       // Extract the IDs from the items in the order
  //       const itemIds = items.map((item) => item.itemId);

  //       // Get Item data from the databse
  //       const itemData = await ctx.prisma.item.findMany({
  //         where: {
  //           id: {
  //             in: itemIds,
  //           },
  //         },
  //         include: {
  //           ingredients: {
  //             include: {
  //               ingredient: true,
  //               parentItems: true,
  //             },
  //           },
  //         },
  //       });

  //       // For stock updates we only need the stock tracked Items - parent items are removed
  //       const parentItems = itemData.filter(
  //         (item) => item.ingredients.length > 0
  //       );

  //       // This is for mixed items - checks how much to subtract from the Items used as ingredients
  //       // If more than one mixed item is ordered - checks how many of the items are on the order and calculates total to subtract
  //       const itemIngredientsToUpdate: ItemToUpdate[] = [];
  //       for (const item of itemData) {
  //         const itemQuantities: Record<string, number> = {};

  //         for (const orderItem of items) {
  //           if (orderItem.itemId === item.id) {
  //             const quantity = itemQuantities[item.id] || 0;
  //             itemQuantities[item.id] = quantity + orderItem.quantity;
  //           }
  //         }

  //         for (const ingredient of item.ingredients) {
  //           const quantityToUpdate =
  //             ingredient.quantity !== null && ingredient.quantity !== undefined
  //               ? Number(ingredient.quantity) * (itemQuantities[item.id] || 0)
  //               : 0;
  //           const itemToUpdate: ItemToUpdate = {
  //             itemId: ingredient.ingredientId ?? "",
  //             itemName: ingredient.ingredient?.name ?? "",
  //             qtyToSubtract: new Decimal(quantityToUpdate),
  //             qtyUnit: ingredient.quantityUnit ?? "",
  //           };

  //           itemIngredientsToUpdate.push(itemToUpdate);
  //         }
  //       }

  //       // This is for all other Items to be updated
  //       const itemsToUpdate = items.filter((ogItem) => {
  //         const isIngredientItem = itemIngredientsToUpdate.some(
  //           (updatedItem) => updatedItem.itemId === ogItem.itemId
  //         );
  //         const isParentItem = parentItems.some(
  //           (updatedItem) => updatedItem.id === ogItem.itemId
  //         );
  //         return !isIngredientItem && !isParentItem;
  //       });

  //       console.log(itemIngredientsToUpdate);
  //       console.log(itemsToUpdate);

  //       // For Hotel Guest with an active reservation & open invoice, link the order to current booking
  //       if (guestId && reservationId && invoiceId) {
  //         order = await ctx.prisma.order.create({
  //           data: {
  //             items: {
  //               create: items.map((item) => ({
  //                 item: {
  //                   connect: { id: item.itemId },
  //                 },
  //                 quantity: item.quantity,
  //               })),
  //             },
  //             // TODO: do I need to connect the Order to Guest if Invoice is already connected to Guest?
  //             guest: {
  //               connect: { id: input.guestId },
  //             },
  //             name: name,
  //             // TODO: similarly is this required if the Invoice is linked to the Reservation already?
  //             reservation: {
  //               connect: { id: reservationId },
  //             },
  //             invoice: {
  //               connect: { reservationId: reservationId, id: invoiceId },
  //             },
  //             happyHour: false,
  //             subTotalUSD: getSubTotal(items),
  //           },
  //           include: {
  //             items: true,
  //             reservation: {
  //               include: {
  //                 invoice: {
  //                   include: {
  //                     lineItems: true,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         });

  //         // For outside guests or guests with no active reservation, link to Guest record
  //       } else if (guestId && !reservationId) {
  //         order = await ctx.prisma.order.create({
  //           data: {
  //             items: {
  //               create: items.map((item) => ({
  //                 item: {
  //                   connect: { id: item.itemId },
  //                 },
  //                 quantity: item.quantity,
  //               })),
  //             },
  //             guest: {
  //               connect: { id: input.guestId },
  //             },
  //             name: name,
  //             happyHour: false,
  //             subTotalUSD: getSubTotal(items),
  //           },
  //           include: {
  //             items: true,
  //           },
  //         });
  //         // For everyone else...
  //       } else {
  //         order = await ctx.prisma.order.create({
  //           data: {
  //             items: {
  //               create: items.map((item) => ({
  //                 item: {
  //                   connect: { id: item.itemId },
  //                 },
  //                 quantity: item.quantity,
  //               })),
  //             },
  //             invoice: {
  //               create: {
  //                 customerName: name,
  //                 // Initialise a new Invoice for the order
  //                 invoiceNumber: await generateInvoiceNumber(),
  //                 totalUSD: getSubTotal(items),
  //               },
  //             },
  //             name: name,
  //             happyHour: isHappyHour(),
  //             subTotalUSD: getSubTotal(items),
  //           },
  //           include: {
  //             items: true,
  //             invoice: true,
  //           },
  //         });
  //       }

  //       return order;
  //     }),

  createOrder: privateProcedure
    .input(createOrderInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, items, invoiceId, guestId } = input;

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
      // Calculate the subTotal and discount for each item
      const calculatedItems = await Promise.all(
        items.map(async (item) => {
          const itemDataItem = itemData.find((data) => data.id === item.id);

          if (!itemDataItem) {
            // Handle the case when item data is not found
            throw new TRPCError({
              message: "Items not found",
              code: "NOT_FOUND",
            });
          }

          const { price, discountApplied } =
            await calculateItemPriceAndDiscount(
              guestId, // Pass the guestId if available
              itemDataItem
            );

          const subTotal = price.times(item.quantity);
          return { item, price, discountApplied, subTotal };
        })
      );

      // Create an array to store the calculated items with their respective discounts
      const orderItems = calculatedItems.map(
        ({ item, discountApplied, subTotal }) => ({
          item: { connect: { id: item.id } },
          quantity: item.quantity,
        })
      );

      // Calculate the total subTotal
      const subTotalUSD = calculatedItems.reduce(
        (total, { subTotal }) => total.plus(subTotal),
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

      // Initialise the order data
      const orderData = {
        items: {
          create: orderItems,
        },
        name: name,
        happyHour: isHappyHour(),
        subTotalUSD: subTotalUSD,
        appliedDiscount: calculatedItems.some(
          (item) => item.discountApplied !== AppliedDiscount.NONE
        )
          ? AppliedDiscount.STAFF
          : AppliedDiscount.NONE,
        invoice: {} as { connect?: { id: string } } & {
          create?: {
            customerName: string;
            invoiceNumber: string;
            totalUSD: Decimal;
          };
        },
      };

      if (invoiceId) {
        // Retrieve the current totalUSD of the invoice
        const invoice = await ctx.prisma.invoice.findUnique({
          where: { id: invoiceId },
          select: { totalUSD: true },
        });

        if (invoice && invoice.totalUSD) {
          // Calculate the new totalUSD by adding the current totalUSD and the subTotal of the order
          const newTotalUSD = invoice.totalUSD.plus(subTotalUSD);

          // Update the Invoice totalUSD
          await ctx.prisma.invoice.update({
            where: { id: invoiceId },
            data: {
              totalUSD: newTotalUSD,
            },
          });
        }

        orderData.invoice.connect = {
          id: invoiceId,
        };
      } else {
        orderData.invoice.create = {
          customerName: name ?? "",
          invoiceNumber: await generateInvoiceNumber(),
          totalUSD: subTotalUSD, //
        };

        if (invoiceId) {
          orderData.invoice = {
            connect: { id: invoiceId },
          };
        } else {
          orderData.invoice.create = {
            customerName: name ?? "",
            invoiceNumber: await generateInvoiceNumber(),
            totalUSD: subTotalUSD,
          };
        }
      }
      const order = await ctx.prisma.order.create({
        data: orderData,
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

  markAsPaid: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const updatedItem = await ctx.prisma.order.update({
        where: { id: input.id },
        data: {
          status: OrderStatus.PAID,
        },
      });
      return updatedItem;
    }),

  getInvoiceByNumber: privateProcedure
    .input(z.object({ invoiceNumber: z.string() }))
    .query(async ({ ctx, input }) => {
      const invoice = await ctx.prisma.invoice.findUnique({
        where: { invoiceNumber: input.invoiceNumber },
        include: {
          guest: true,
          lineItems: true,
          reservation: { include: { guest: true, reservationItem: true } },
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

  getOpenInvoices: privateProcedure.query(async ({ ctx }) => {
    const invoices = await ctx.prisma.invoice.findMany({
      where: {
        status: "UNPAID",
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
        reservation: {
          include: {
            reservationItem: true,
            room: true,
          },
        },
      },
    });

    return invoices;
  }),
});
