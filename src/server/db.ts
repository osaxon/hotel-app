import { PrismaClient, Reservation } from "@prisma/client";
import { env } from "@/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

/*
 * This extended client ensures the outstanding balance on an invoice is correct
 * by executing a function which aggregates outstanding reservations and orders
 * on an invoice whenever a reservation, order or invoice is created or updated.
 */
export const xprisma = prisma.$extends({
  query: {
    reservation: {
      create: async ({ model, operation, args, query }) => {
        const reservation = await prisma.reservation.create(args);
        if (!reservation) {
          throw new Error("Error creating reservation");
        }
        console.log(reservation.invoiceId);
        if (reservation.invoiceId) {
          console.log("updated the total");
          await updateInvoiceTotal(reservation.invoiceId);
        }
        return reservation;
      },
      update: async ({ model, operation, args, query }) => {
        const { data } = args;
        const { paymentStatus } = data;
        const updatedReservation = await query(args);

        if (updatedReservation && paymentStatus) {
          const previousReservation = await prisma.reservation.findUnique({
            where: { id: args.where.id },
            select: { paymentStatus: true, invoiceId: true },
          });

          if (
            previousReservation &&
            previousReservation.paymentStatus !== paymentStatus
          ) {
            // Payment status has been changed, update the invoice
            const { invoiceId } = previousReservation;
            if (invoiceId) {
              await updateInvoiceTotal(invoiceId);
            }
          }
        }

        return updatedReservation;
      },
    },
    invoice: {
      create: async ({ model, operation, args, query }) => {
        const invoice = await prisma.invoice.create(args);

        if (!invoice) {
          throw new Error("Error creating invoice");
        }
        await updateInvoiceTotal(invoice.id);
        return invoice;
      },
    },
    order: {
      create: async ({ model, operation, args, query }) => {
        const order = await prisma.order.create(args);
        if (!order) {
          throw new Error("Error creating order");
        }
        console.log(order.invoiceId);
        if (order.invoiceId) {
          console.log("updated the total");
          await updateInvoiceTotal(order.invoiceId);
        }
        return order;
      },
    },
  },
});

const updateInvoiceTotal = async (invoiceId: string) => {
  console.log("updating invoice total function");

  const aggregatedOutstandingReservations = await prisma.reservation.aggregate({
    where: {
      invoiceId: invoiceId,
      paymentStatus: "UNPAID",
    },
    _sum: {
      subTotalUSD: true,
    },
  });

  const aggregatedOutstandingOrders = await prisma.order.aggregate({
    where: {
      invoiceId: invoiceId,
      status: "UNPAID",
    },
    _sum: {
      subTotalUSD: true,
    },
  });

  const aggregatedReservations = await prisma.reservation.aggregate({
    where: {
      invoiceId: invoiceId,
      paymentStatus: "UNPAID",
    },
    _sum: {
      subTotalUSD: true,
    },
  });

  const aggregatedOrders = await prisma.order.aggregate({
    where: {
      invoiceId: invoiceId,
      status: "UNPAID",
    },
    _sum: {
      subTotalUSD: true,
    },
  });

  let newTotal;

  // set the invoice total
  if (
    !aggregatedOrders._sum.subTotalUSD &&
    !aggregatedReservations._sum.subTotalUSD
  ) {
    throw new Error("failed to aggregate totals");
  }

  if (
    aggregatedOrders._sum.subTotalUSD &&
    aggregatedReservations._sum.subTotalUSD
  ) {
    newTotal = aggregatedReservations._sum.subTotalUSD.add(
      aggregatedOrders._sum.subTotalUSD
    );
  } else if (
    !aggregatedOrders._sum.subTotalUSD &&
    aggregatedReservations._sum.subTotalUSD
  ) {
    newTotal = aggregatedReservations._sum.subTotalUSD;
  } else if (
    aggregatedOrders._sum.subTotalUSD &&
    !aggregatedReservations._sum.subTotalUSD
  ) {
    newTotal = aggregatedOrders._sum.subTotalUSD;
  }

  let newRemainingBalance;

  // set the remaining balance
  if (
    !aggregatedOutstandingOrders._sum.subTotalUSD &&
    !aggregatedOutstandingReservations._sum.subTotalUSD
  ) {
    throw new Error("failed to aggregate totals");
  }

  if (
    aggregatedOutstandingOrders._sum.subTotalUSD &&
    aggregatedOutstandingReservations._sum.subTotalUSD
  ) {
    newRemainingBalance =
      aggregatedOutstandingReservations._sum.subTotalUSD.add(
        aggregatedOutstandingOrders._sum.subTotalUSD
      );
  } else if (
    !aggregatedOutstandingOrders._sum.subTotalUSD &&
    aggregatedOutstandingReservations._sum.subTotalUSD
  ) {
    newRemainingBalance = aggregatedOutstandingReservations._sum.subTotalUSD;
  } else if (
    aggregatedOutstandingOrders._sum.subTotalUSD &&
    !aggregatedOutstandingReservations._sum.subTotalUSD
  ) {
    newRemainingBalance = aggregatedOutstandingOrders._sum.subTotalUSD;
  }

  console.log("new balance");
  console.log(newRemainingBalance);

  await prisma.invoice.update({
    where: {
      id: invoiceId,
    },
    data: {
      remainingBalanceUSD: newRemainingBalance,
      totalUSD: newTotal,
    },
  });
};

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
