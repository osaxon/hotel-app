import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { GuestType } from "@prisma/client";

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
          invoices: {
            include: {
              orders: {
                include: { items: { include: { item: true } } },
              },
              reservations: {
                include: { reservationItem: true, room: true },
              },
            },
          },
        },
      });

      return guest;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string(),
        surname: z.string(),
        email: z.string().email(),
        address: z.object({
          street: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          postalCode: z.string().optional(),
          country: z.string().optional(),
        }),
        type: z.nativeEnum(GuestType),
        availableCredits: z.number().refine((value) => !isNaN(value)),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const guest = await ctx.prisma.guest.update({
        where: { id: input.id },
        data: {
          ...input,
        },
      });
      return guest;
    }),
});
