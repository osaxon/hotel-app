import { createTRPCRouter, privateProcedure } from "@/server/api/trpc";
import { ReservationStatus } from "@prisma/client";
import { z } from "zod";

export const newInvoiceInputSchema = z.object({
  returningGuest: z.boolean().default(false),
  guestId: z.string().optional(),
  firstName: z.string(),
  surname: z.string(),
  email: z.string(),
  reservations: z.array(
    z.object({
      // Define the properties of each object in the array
      firstName: z.string(),
      surname: z.string(),
      email: z.string(),
      reservationItemId: z.string(),
      checkIn: z.date(),
      checkOut: z.date(),
      subTotalUSD: z.number().positive().optional(),
      status: z.nativeEnum(ReservationStatus),
    })
  ),
});

export const invoiceRouter = createTRPCRouter({
  create: privateProcedure
    .input(newInvoiceInputSchema)
    .mutation(async ({ ctx, input }) => {
      // Find the latest invoice number from the database
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
      const formattedInvoiceNumber = invoiceNumber.toString().padStart(6, "0");

      const invoice = await ctx.prisma.invoice.create({
        data: {
          invoiceNumber: formattedInvoiceNumber,
          reservations: {
            createMany: {
              data: input.reservations,
            },
          },
          guest: {
            connectOrCreate: {
              where: { email: input.email },
              create: {
                firstName: input.firstName ?? "",
                surname: input.surname ?? "",
                fullName: input.firstName + " " + input.surname,
                email: input.email ?? "",
              },
            },
          },
        },
      });

      const aggregatedReservations = await ctx.prisma.reservation.aggregate({
        where: {
          invoiceId: invoice.id,
        },
        _sum: {
          subTotalUSD: true,
        },
      });

      const invoiceWithTotal = await ctx.prisma.invoice.update({
        where: {
          id: invoice.id,
        },
        data: {
          totalUSD: aggregatedReservations._sum.subTotalUSD,
        },
      });

      return invoiceWithTotal;
    }),
});
