import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import dayjs from "dayjs";
import { getDurationOfStay } from "@/lib/utils";
import {
  createTRPCRouter,
  publicProcedure,
  privateProcedure,
} from "@/server/api/trpc";

import {
  type Prisma,
  ReservationStatus,
  RoomStatus,
  ReservationItem,
  Reservation,
  Invoice,
} from "@prisma/client";
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

  getReservationItems: privateProcedure.query(async ({ ctx }) => {
    const resItems = await ctx.prisma.reservationItem.findMany();
    return resItems;
  }),

  getResItemById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const resItem = await ctx.prisma.reservationItem.findUnique({
        where: { id: input.id },
      });
      return resItem;
    }),

  createReservation: privateProcedure
    .input(
      z.object({
        guestName: z.string(),
        checkIn: z.date(),
        checkOut: z.date(),
        guestId: z.string().optional(),
        guestEmail: z.string().email(),
        resItemId: z.string(),
        subTotalUSD: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      let reservation;

      const durationInDays = getDurationOfStay(input.checkIn, input.checkOut);
      const resItem = await ctx.prisma.reservationItem.findUnique({
        where: { id: input.resItemId },
      });

      if (!resItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reservation Option not found.",
        });
      }

      //   const rateTotal = getRateTotal(durationInDays, resItem);

      // If we already have the Guest details stored
      if (input.guestId) {
        reservation = await ctx.prisma.reservation.create({
          data: {
            firstName: input.guestName,
            checkIn: input.checkIn,
            checkOut: input.checkOut,
            guest: {
              connect: { id: input.guestId },
            },
            reservationItem: {
              connect: { id: input.resItemId },
            },
            subTotalUSD: input.subTotalUSD,
            email: input.guestEmail,
          },
          include: {
            room: true,
            guest: true,
            reservationItem: true,
            invoice: {
              include: {
                reservations: true,
              },
            },
          },
        });
        // For new guests.
      } else {
        reservation = await ctx.prisma.reservation.create({
          data: {
            firstName: input.guestName,
            checkIn: input.checkIn,
            checkOut: input.checkOut,
            reservationItem: {
              connect: { id: input.resItemId },
            },
            subTotalUSD: input.subTotalUSD,
            email: input.guestEmail,
          },
          include: {
            room: true,
            reservationItem: true,
            invoice: {
              include: {
                reservations: true,
              },
            },
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
          reservationItem: true,
          guest: {
            include: {
              orders: {
                include: {
                  items: true,
                },
              },
              invoices: {
                include: {
                  lineItems: true,
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
        firstName: z.string(),
        surname: z.string(),
        checkIn: z.date(),
        checkOut: z.date(),
        email: z.string().email(),
        roomId: z.string(),
        address: z.object({
          street: z.string(),
          city: z.string(),
          state: z.string(),
          postalCode: z.string(),
          country: z.string(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingGuest = await ctx.prisma.guest.findFirst({
        where: {
          email: input.email,
        },
      });

      const updatedGuest = existingGuest
        ? await ctx.prisma.guest.update({
            where: {
              id: existingGuest.id,
            },
            data: {
              firstName: input.firstName,
              surname: input.surname,
              email: input.email,
              address: input.address,
            },
          })
        : await ctx.prisma.guest.create({
            data: {
              firstName: input.firstName,
              surname: input.surname,
              fullName: `${input.firstName} ${input.surname}`,
              email: input.email,
              address: input.address,
            },
          });

      const reservation: Prisma.ReservationGetPayload<{
        include: { reservationItem: true; guest: true };
      }> = await ctx.prisma.reservation.update({
        where: { id: input.reservationId },
        data: {
          status: ReservationStatus.CHECKED_IN,

          guest: {
            connect: { id: updatedGuest.id },
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
          reservationItem: true,
          guest: true,
          invoice: {
            include: {
              lineItems: true,
            },
          },
        },
      });

      if (!reservation) {
        throw new TRPCError({
          message: "Failed to update the reservation record.",
          code: "UNPROCESSABLE_CONTENT",
        });
      }

      if (!reservation.guestId) {
        throw new TRPCError({
          message: "Failed to create the Guest record",
          code: "UNPROCESSABLE_CONTENT",
        });
      }

      return reservation;
    }),

  aggOrderTotal: privateProcedure
    .input(z.object({ resId: z.string() }))
    .query(async ({ ctx, input }) => {
      const aggregatedOrder = await ctx.prisma.order.aggregate({
        where: {
          reservation: {
            id: input.resId,
          },
        },
        _sum: {
          subTotalUSD: true,
        },
      });
      return aggregatedOrder;
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
        reservationItem: true,
        invoice: {
          include: {
            lineItems: true,
          },
        },
      },
    });
    return reservations;
  }),
});
