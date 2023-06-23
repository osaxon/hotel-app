import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  ItemCategory,
  OrderStatus,
  Prisma,
  ItemIngredient,
} from "@prisma/client";
import { isHappyHour } from "@/lib/utils";
import { Decimal } from "@prisma/client/runtime";

interface ItemToUpdate {
  itemId: string | null;
  itemName: string | undefined;
  qtyToSubtract: Decimal | null;
  qtyUnit: string | undefined;
}

function getSubTotal(
  items: { priceUSD: Prisma.Decimal; quantity: number }[]
): string {
  const fn = (
    total: number,
    { priceUSD, quantity }: { priceUSD: Prisma.Decimal; quantity: number }
  ) => total + Number(priceUSD) * quantity;

  const subTotal = items.reduce(fn, 0);
  return subTotal.toFixed(2); // Return the sub-total as a string with 2 decimal places
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
const createOrderInputSchema = z.object({
  name: z.string().optional(),
  room: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string(),
      quantity: z.number().positive(),
      priceUSD: z.string().transform((value) => new Prisma.Decimal(value)),
    })
  ),
  reservationId: z.string().optional(),
  guestId: z.string().optional(),
});

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

  createOrder: privateProcedure
    .input(createOrderInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, items, guestId, reservationId } = input;
      let order;

      // Extract the IDs from the items in the order
      const itemIds = items.map((item) => item.itemId);

      // Get Item data from the databse
      const itemData = await ctx.prisma.item.findMany({
        where: {
          id: {
            in: itemIds,
          },
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

      // For stock updates we only need the stock tracked Items - parent items are removed
      const parentItems = itemData.filter(
        (item) => item.ingredients.length > 0
      );

      // This is for mixed items - checks how much to subtract from the Items used as ingredients
      // If more than one mixed item is ordered - checks how many of the items are on the order and calculates total to subtract
      const itemIngredientsToUpdate: ItemToUpdate[] = [];
      for (const item of itemData) {
        const itemQuantities: Record<string, number> = {};

        for (const orderItem of items) {
          if (orderItem.itemId === item.id) {
            const quantity = itemQuantities[item.id] || 0;
            itemQuantities[item.id] = quantity + orderItem.quantity;
          }
        }

        for (const ingredient of item.ingredients) {
          const quantityToUpdate =
            ingredient.quantity !== null && ingredient.quantity !== undefined
              ? Number(ingredient.quantity) * (itemQuantities[item.id] || 0)
              : 0;
          const itemToUpdate: ItemToUpdate = {
            itemId: ingredient.ingredientId ?? "",
            itemName: ingredient.ingredient?.name ?? "",
            qtyToSubtract: new Decimal(quantityToUpdate),
            qtyUnit: ingredient.quantityUnit ?? "",
          };

          itemIngredientsToUpdate.push(itemToUpdate);
        }
      }

      // This is for all other Items to be updated
      const itemsToUpdate = items.filter((ogItem) => {
        const isIngredientItem = itemIngredientsToUpdate.some(
          (updatedItem) => updatedItem.itemId === ogItem.itemId
        );
        const isParentItem = parentItems.some(
          (updatedItem) => updatedItem.id === ogItem.itemId
        );
        return !isIngredientItem && !isParentItem;
      });

      console.log(itemIngredientsToUpdate);
      console.log(itemsToUpdate);

      // For Hotel Guest with an active reservation, link the order to current booking
      if (guestId && reservationId) {
        order = await ctx.prisma.order.create({
          data: {
            items: {
              create: items.map((item) => ({
                item: {
                  connect: { id: item.itemId },
                },
                quantity: item.quantity,
              })),
            },
            guest: {
              connect: { id: input.guestId },
            },
            name: name,
            reservation: {
              connect: { id: reservationId },
            },
            happyHour: false,
            subTotalUSD: getSubTotal(items),
          },
          include: {
            items: true,
          },
        });
        // For outside guests or guests with no active reservation, link to Guest record
      } else if (guestId && !reservationId) {
        order = await ctx.prisma.order.create({
          data: {
            items: {
              create: items.map((item) => ({
                item: {
                  connect: { id: item.itemId },
                },
                quantity: item.quantity,
              })),
            },
            guest: {
              connect: { id: input.guestId },
            },
            name: name,
            happyHour: false,
            subTotalUSD: getSubTotal(items),
          },
          include: {
            items: true,
          },
        });
        // For everyone else...
      } else {
        order = await ctx.prisma.order.create({
          data: {
            items: {
              create: items.map((item) => ({
                item: {
                  connect: { id: item.itemId },
                },
                quantity: item.quantity,
              })),
            },
            name: name,
            happyHour: isHappyHour(),
            subTotalUSD: getSubTotal(items),
          },
          include: {
            items: true,
          },
        });
      }
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
});
