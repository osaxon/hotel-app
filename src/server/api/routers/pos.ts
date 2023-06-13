import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import type { Order, Item, ItemOrders } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { isHappyHour } from "@/lib/utils";

const addUserDataToOrder = async (orders: Order[]) => {
  const users = await clerkClient.users.getUserList({
    userId: orders.map((order) => order.userId ?? ""),
    limit: 100,
  });

  return orders.map((order) => {
    const customer = users.find((user) => user.id === order.userId);
    if (!customer)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No author found",
      });

    return {
      ...order,
      // Causes ESLint Type error if just author object returned. Error fixed by returning this way
      customer: {
        ...customer,
        username: customer.username,
      },
    };
  });
};

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

// Define the input schema using Zod
const createOrderInputSchema = z.object({
  customer: z.string(),
  room: z.string().optional(),
  items: z.array(
    z.object({
      itemId: z.string(),
      quantity: z.number().positive(),
      priceUSD: z.string().transform((value) => new Prisma.Decimal(value)),
    })
  ),
});

// Define the response schema using Zod
const createOrderResponseSchema = z.object({
  orderId: z.string(),
  customer: z.object({
    id: z.string(),
    username: z.string(),

    // TODO: Add other properties
  }),
});

export const posRouter = createTRPCRouter({
  getAllOrders: publicProcedure.query(async ({ ctx }) => {
    const orders = await ctx.prisma.order.findMany({
      include: {
        items: true,
      },
    });

    return orders;
  }),

  getItems: publicProcedure.query(async ({ ctx }) => {
    const items = await ctx.prisma.item.findMany();

    return items;
  }),

  createOrder: publicProcedure
    .input(createOrderInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { customer, items } = input;
      const order = await ctx.prisma.order.create({
        data: {
          customerName: customer,
          items: {
            create: items.map((item) => ({
              item: {
                connect: { id: item.itemId },
              },
              quantity: item.quantity,
            })),
          },
          happyHour: false,
          subTotalUSD: getSubTotal(items),
        },
        include: {
          items: true,
        },
      });
    }),
});
