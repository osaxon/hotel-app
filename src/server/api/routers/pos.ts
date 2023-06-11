import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "@/server/api/trpc";
import { env } from "@/env.mjs";
import type { Order, Item, ItemOrders } from "@prisma/client";

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

// Define the input schema using Zod
const createOrderInputSchema = z.object({
  customer: z.string(),
  items: z.array(
    z.object({
      itemId: z.string(),
      quantity: z.number().positive(),
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
        },
        include: {
          items: true,
        },
      });
    }),
});
