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
  customerName: z.string().optional(),
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

// Define the response schema using Zod
const createOrderResponseSchema = z.object({
  orderId: z.string(),
  customer: z.object({
    id: z.string(),
    username: z.string(),
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
    const items = await ctx.prisma.item.findMany();

    return items;
  }),

  createOrder: publicProcedure
    .input(createOrderInputSchema)
    .mutation(async ({ ctx, input }) => {
      const { customerName, items, guestId, reservationId } = input;
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
            customerName: customerName,
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
            customerName: customerName,
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
            customerName: customerName,
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
});
