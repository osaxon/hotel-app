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
  Guest,
  PaymentStatus,
} from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

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

  updateStatus: privateProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.nativeEnum(PaymentStatus),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // use xprisma extended client to ensure invoice
      const updatedReservation = await ctx.xprisma.reservation.update({
        where: { id: input.id },
        data: {
          paymentStatus: input.status,
        },
      });
      return updatedReservation;
    }),

  update: privateProcedure
    .input(
      z.object({
        id: z.string(),
        firstName: z.string(),
        surname: z.string(),
        invoiceId: z.string(),
        resItemId: z.string(),
        roomId: z.string().optional(),
        guestId: z.string().optional(),
        checkIn: z.date(),
        checkOut: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updatedReservation = await ctx.xprisma.reservation.update({
        where: { id: input.id },
        data: {
          firstName: input.firstName,
          surname: input.surname,
          invoiceId: input.invoiceId,
          reservationItemId: input.resItemId,
          roomId: input.roomId,
          guestId: input.guestId,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
        },
      });
      return updatedReservation;
    }),

  createReservation: privateProcedure
    .input(
      z.object({
        addToInvoice: z.boolean(),
        firstName: z.string(),
        surname: z.string(),
        checkIn: z.date(),
        checkOut: z.date(),
        guestId: z.string().optional(),
        invoiceId: z.string().optional(),
        email: z.string().email(),
        resItemId: z.string(),
        subTotalUSD: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { guestId } = input ?? "";
      const resItem = await ctx.prisma.reservationItem.findUnique({
        where: { id: input.resItemId },
      });

      if (!resItem) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reservation Option not found.",
        });
      }

      let invoice;
      let guest;

      if (input.invoiceId && input.addToInvoice) {
        console.info("fetching the invoice");

        // Get the existing invoice
        invoice = await ctx.prisma.invoice.findUnique({
          where: { id: input.invoiceId },
        });
      } else {
        // Create new invoice
        // Find the latest invoice number from the database
        console.info("creating invoice");

        const latestInvoice = await ctx.prisma.invoice.findFirst({
          orderBy: { invoiceNumber: "desc" },
          select: { invoiceNumber: true },
        });

        let invoiceNumber: number;

        if (latestInvoice) {
          // Increment the latest invoice number by 1
          invoiceNumber = parseInt(latestInvoice.invoiceNumber, 10) + 1;
        } else {
          // Use the starting number if no invoice exists
          invoiceNumber = 2000;
        }

        // Format the invoice number with leading zeros
        const formattedInvoiceNumber = invoiceNumber
          .toString()
          .padStart(6, "0");

        invoice = await ctx.prisma.invoice.create({
          data: {
            totalUSD: input.subTotalUSD,
            invoiceNumber: formattedInvoiceNumber,
            customerName: input.firstName + " " + input.surname,
            customerEmail: input.email,
          },
        });
      }

      if (!invoice) {
        throw new TRPCError({
          message: "Failed to create / retrieve the Invoice.",
          code: "UNPROCESSABLE_CONTENT",
        });
      }

      if (input.guestId || invoice.guestId) {
        let guestId;
        if (invoice.guestId) {
          guestId = invoice.guestId;
        } else {
          guestId = input.guestId;
        }
        // Connect to existing guest
        guest = await ctx.prisma.guest.findUnique({
          where: { id: guestId },
        });

        if (!guest) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Guest not found.",
          });
        }
      } else if (!input.guestId && !invoice.guestId) {
        // Create new guest
        guest = await ctx.prisma.guest.create({
          data: {
            firstName: input.firstName,
            surname: input.surname,
            fullName: `${input.firstName} ${input.surname}`,
            email: input.email,
          },
        });
      }

      if (!guest) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Failed to create / find guest.",
        });
      }

      console.info("Creating reservation");
      // Create the reservation
      const reservation = await ctx.xprisma.reservation.create({
        data: {
          firstName: input.firstName,
          surname: input.surname,
          checkIn: input.checkIn,
          checkOut: input.checkOut,

          guest: {
            connect: { id: guest.id },
          },

          reservationItem: {
            connect: { id: input.resItemId },
          },

          subTotalUSD: input.subTotalUSD,
          email: input.email,
          invoice: {
            connect: { id: invoice.id },
          },
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

      if (!reservation) {
        throw new TRPCError({
          message: "Failed to create the reservation.",
          code: "UNPROCESSABLE_CONTENT",
        });
      }

      // if no guest or invoice provided then we need to relate the new guest to the new invoice
      if (!input.guestId && !input.addToInvoice && reservation.guest) {
        invoice = await ctx.prisma.invoice.update({
          where: { id: invoice.id },
          data: {
            guest: {
              connect: {
                id: reservation.guest.id,
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
          in: ["CHECKED_IN", "CONFIRMED"],
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
