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
import { prisma } from "@/server/db";

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
  getAllOrders: publicProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      include: {
        items: true,
        guest: true,
      },
    });

    return orders;
  }),

  getLastDay: publicProcedure.query(async ({ ctx }) => {
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
      const { ingredients, ...itemData } = validatedInput;

      // Create the item
      const item = await ctx.prisma.item.create({
        data: {
          happyHourPriceUSD: new Decimal(
            validatedInput.happyHourPriceUSD ?? validatedInput.priceUSD
          ),
          ...itemData,
        },
      });

      // Process the ingredients if provided
      if (validatedInput.ingredients && validatedInput.ingredients.length > 0) {
        const ingredientIds = validatedInput.ingredients
          .filter((ingredient) => ingredient !== undefined)
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          .map((ingredient) => ingredient?.id);

        // Find the ingredients in the database
        const ingredients = await ctx.prisma.item.findMany({
          where: {
            id: {
              in: ingredientIds,
            },
          },
        });

        // Establish the relationship between the item and ingredients
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

  createOrder: publicProcedure
    .input(createOrderInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { name, items, guestId, reservationId } = input;
      let order;
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
