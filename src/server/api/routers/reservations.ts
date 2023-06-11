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

import type { Reservation, Room, Prisma } from "@prisma/client";

type ReservationWithRoom = Prisma.ReservationGetPayload<{
  include: { room: true };
}>;

const addUserDataToReservation = async (
  reservations: ReservationWithRoom[]
) => {
  // Extract all user IDs from reservations data
  const userIds = reservations.map((reservation) => reservation.userId);

  // Fetch user data for the extracted IDs
  const users = await clerkClient.users.getUserList({
    userId: userIds,
    limit: 100,
  });

  // Map user data to corresponding reservation
  return reservations.map((reservation) => {
    const user = users.find((user) => user.id === reservation.userId);

    if (!user || !user.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "No user found",
      });

    return {
      ...reservation,
      // Causes ESLint Type error if just author object returned. Error fixed by returning this way
      user: {
        ...user,
        username: user.username,
        firstName: user.firstName,
      },
    };
  });
};

export const reservationsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const reservations = await ctx.prisma.reservation.findMany({
      take: 100,
    });
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
        include: {
          room: true,
        },
        take: 100,
      });
      const withUserData = await addUserDataToReservation(reservations);
      return withUserData;
    }),

  getActiveReservations: publicProcedure.query(async ({ ctx }) => {
    const reservations = await ctx.prisma.reservation.findMany({
      where: {
        status: {
          in: ["CHECKED_IN", "CONFIRMED"],
        },
      },
      include: {
        room: true,
      },
    });
    const withUserData = await addUserDataToReservation(reservations);
    return withUserData;
  }),
});
