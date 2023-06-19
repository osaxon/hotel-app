import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const guestsRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const guests = await ctx.prisma.guest.findMany({
      include: {
        reservations: {
          include: {
            room: true,
          },
        },
      },
    });
    return guests;
  }),

  getById: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const guest = await ctx.prisma.guest.findUnique({
        where: { id: input.id },
        include: {
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

      return guest;
    }),
});
