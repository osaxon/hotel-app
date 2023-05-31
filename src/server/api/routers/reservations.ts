import { clerkClient } from "@clerk/nextjs/server";
import type { User } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import dayjs from "dayjs";

import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "@/server/api/trpc";

import type { Reservation, Room } from "@prisma/client";

// Create a new ratelimiter, that allows 3 requests per 1 min
// const ratelimit = new Ratelimit({
//   redis: Redis.fromEnv(),
//   limiter: Ratelimit.slidingWindow(3, "1 m"),
//   analytics: true,
// });

const addUserDataToReservation = async (reservations: Reservation[]) => {
  const users = await clerkClient.users.getUserList({
    userId: reservations.map((reservation) => reservation.userId),
    limit: 100,
  });

  return reservations.map((reservation) => {
    const guest = users.find((user) => user.id === reservation.userId);
    if (!guest)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No author found",
      });

    return {
      ...reservation,
      // Causes ESLint Type error if just author object returned. Error fixed by returning this way
      guest: {
        ...guest,
        username: guest.username,
      },
    };
  });
};

export const reservationsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const reservations = await ctx.prisma.reservation.findMany({
      take: 100,
    });
    console.log(reservations);
    return reservations;
  }),

  getRoomReservations: publicProcedure
    .input(z.object({ roomId: z.string() }))
    .query(async ({ ctx, input }) => {
      const reservations = await ctx.prisma.reservation.findMany({
        where: {
          roomId: input.roomId,
          checkIn: {
            gte: new Date(),
          },
        },
        take: 100,
      });
      return addUserDataToReservation(reservations);
    }),
});
