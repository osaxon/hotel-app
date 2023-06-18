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
import { Guest, GuestType, Prisma } from "@prisma/client";

type GuestWithReservation = Prisma.GuestGetPayload<{
  include: { reservations: true };
}>;

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
});
