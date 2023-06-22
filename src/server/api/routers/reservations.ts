import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import dayjs from "dayjs";

import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "@/server/api/trpc";

import { type Prisma, ReservationStatus, RoomStatus } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime";

type ReservationWithRoom = Prisma.ReservationGetPayload<{
  include: { room: true };
}>;

const addClerkUserData = async (reservations: ReservationWithRoom[]) => {
  // Extract all user IDs from reservations data and filter out null values
  const userIds = reservations
    .map((reservation) => reservation.userId)
    .filter((userId): userId is string => userId !== null);

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
      user: {
        ...user,
        username: user.username,
        firstName: user.firstName,
      },
    };
  });
};

export const reservationsRouter = createTRPCRouter({
  getAll: privateProcedure.query(async ({ ctx }) => {
    const reservations = await ctx.prisma.reservation.findMany({
      take: 100,
    });
    return reservations;
  }),

  createReservation: privateProcedure
    .input(
      z.object({
        guestName: z.string(),
        checkIn: z.date(),
        checkOut: z.date(),
        guestId: z.string().optional(),
        guestEmail: z.string().email(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let reservation;
      if (input.guestId) {
        reservation = await ctx.prisma.reservation.create({
          data: {
            guestName: input.guestName,
            checkIn: input.checkIn,
            checkOut: input.checkOut,
            guest: {
              connect: { id: input.guestId },
            },
            guestEmail: input.guestEmail,
          },
          include: {
            room: true,
            guest: true,
          },
        });
      } else {
        reservation = await ctx.prisma.reservation.create({
          data: {
            guestName: input.guestName,
            checkIn: input.checkIn,
            checkOut: input.checkOut,
            guestEmail: input.guestEmail,
          },
          include: {
            room: true,
          },
        });
      }

      return reservation;
    }),

  getRoomReservations: privateProcedure
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
      const withUserData = await addClerkUserData(reservations);
      return withUserData;
    }),

  getByID: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const reservation = await ctx.prisma.reservation.findUnique({
        where: { id: input.id },
        include: {
          room: true,
          orders: {
            include: {
              items: {
                include: {
                  item: true,
                },
              },
            },
          },
          guest: {
            include: {
              orders: {
                include: {
                  items: true,
                },
              },
            },
          },
        },
      });
      return reservation;
    }),

  checkIn: privateProcedure
    .input(
      z.object({
        reservationId: z.string(),
        guestName: z.string(),
        firstName: z.string(),
        surname: z.string(),
        guestEmail: z.string().email(),
        roomId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.prisma.reservation.update({
        where: { id: input.reservationId },
        data: {
          status: ReservationStatus.CHECKED_IN,

          guest: {
            create: {
              email: input.guestEmail,
              firstName: input.firstName,
              surname: input.surname,
              currentReservationId: input.reservationId,
            },
          },

          room: {
            connect: {
              id: input.roomId,
            },
            update: {
              status: RoomStatus.OCCUPIED,
            },
          },
        },
        include: {
          room: true,
        },
      });
      return reservation;
    }),

  calculateSubTotal: privateProcedure
    .input(
      z.object({
        reservationId: z.string(),
        checkIn: z.date(),
        checkOut: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const totalDays = dayjs(input.checkOut).diff(dayjs(input.checkIn), "day");

      // Fetch the Reservation and include the associated Room
      const reservation = await ctx.prisma.reservation.findUnique({
        where: { id: input.reservationId },
        include: { room: true },
      });

      if (!reservation) {
        throw new Error("Reservation not found");
      }

      const dailyRate = reservation.room?.dailyRateUSD?.toString();
      const subTotal = dailyRate ? parseFloat(dailyRate) * totalDays : 0;

      const updatedReservation = await ctx.prisma.reservation.update({
        where: { id: input.reservationId },
        data: {
          subTotalUSD: new Decimal(subTotal),
          status: ReservationStatus.FINAL_BILL,
        },
      });

      return updatedReservation;
    }),

  checkOut: privateProcedure
    .input(
      z.object({
        reservationId: z.string(),
        roomId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const reservation = await ctx.prisma.reservation.update({
        where: { id: input.reservationId },
        data: {
          status: ReservationStatus.CHECKED_OUT,

          guest: {
            update: { currentReservationId: "" },
          },

          room: {
            update: {
              status: RoomStatus.VACANT,
            },
          },
        },
        include: {
          room: true,
        },
      });
      return reservation;
    }),

  getActiveReservations: privateProcedure.query(async ({ ctx }) => {
    const reservations = await ctx.prisma.reservation.findMany({
      where: {
        status: {
          in: ["CHECKED_IN", "CONFIRMED", "FINAL_BILL"],
        },
      },
      include: {
        room: true,
        guest: true,
      },
    });
    return reservations;
  }),
});
