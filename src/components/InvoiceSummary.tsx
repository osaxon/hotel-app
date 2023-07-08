import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, getDurationOfStay } from "@/lib/utils";
import { api } from "@/utils/api";
import { type Prisma } from "@prisma/client";
import dayjs from "dayjs";
import Link from "next/link";
import LoadingSpinner from "./loading";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: { include: { item: true } } };
}>;

type ReservationWithResItem = Prisma.ReservationGetPayload<{
  include: { reservationItem: true };
}>;

export default function InvoiceSummary({
  invoice,
}: {
  invoice: Prisma.InvoiceGetPayload<{
    include: {
      lineItems: true;
      reservation: { include: { guest: true; reservationItem: true } };
      orders: {
        include: {
          items: { include: { item: true } };
        };
      };
    };
  }>;
}) {
  const orders: OrderWithItems[] = invoice.orders;
  const reservation: ReservationWithResItem | null = invoice.reservation;

  const {
    data: KHRConversionRate,
    isLoading,
    isError,
  } = api.pos.currencyConversion.useQuery({
    fromCurrency: "USD",
    toCurrency: "KHR",
    amount: Number(reservation?.subTotalUSD),
  });

  let duration;
  let formattedReservationTotal;
  let KHRTotal;
  let currentConversionRate;
  if (reservation && reservation.reservationItem && KHRConversionRate) {
    duration = getDurationOfStay(reservation.checkIn, reservation.checkOut);

    formattedReservationTotal = formatCurrency({
      amount: Number(reservation.subTotalUSD),
    });

    KHRTotal = formatCurrency({
      amount: Number(KHRConversionRate.converted),
      currency: "KHR",
    });

    currentConversionRate = formatCurrency({
      amount: Number(KHRConversionRate.rates.KHR),
      currency: "KHR",
    });
  }

  return (
    <Table>
      <TableCaption>
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <p>
            {" "}
            Currency conversion as of {dayjs().format("DD MMM YYYY")}: 1 USD ={" "}
            {currentConversionRate}
          </p>
        )}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">No.</TableHead>
          <TableHead>Desc</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
          <TableHead className="text-right">Sub-Total USD</TableHead>
          <TableHead className="text-right">Sub-Total KHR</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservation && (
          <TableRow>
            <TableCell className="cursor-pointer font-medium uppercase underline">
              {reservation.id.slice(0, 10)}
            </TableCell>
            <TableCell className="flex flex-col gap-1">
              <p>{reservation.reservationItem?.descForInvoice}</p>
            </TableCell>
            <TableCell>
              {dayjs(reservation.createdAt).format("DD MMM YY")}
            </TableCell>
            <TableCell>{duration} nights</TableCell>
            <TableCell className="text-center">-</TableCell>
            <TableCell className="text-right">
              {formattedReservationTotal}
            </TableCell>
            <TableCell className="text-right">{KHRTotal}</TableCell>
          </TableRow>
        )}
        {orders &&
          orders.map(
            (order) =>
              order.items &&
              order.items.map((item) => {
                const itemPrice =
                  order.appliedDiscount === "HAPPY_HOUR"
                    ? item.item.happyHourPriceUSD
                    : order.appliedDiscount === "STAFF"
                    ? item.item.staffPriceUSD
                    : item.item.priceUSD;
                const amount = Number(itemPrice);
                const formattedPrice = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(amount);
                const formattedSubTotal = new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                }).format(amount * item.quantity);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="cursor-pointer font-medium uppercase underline">
                      <Link href={`/orders/${order.id}`}>
                        {order.id.slice(0, 10)}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {item.item.name}{" "}
                      {order.appliedDiscount !== "NONE"
                        ? order.appliedDiscount + " discount applied"
                        : ""}
                    </TableCell>
                    <TableCell>
                      {dayjs(order.createdAt).format("DD MMM YY")}
                    </TableCell>

                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formattedPrice}
                    </TableCell>
                    <TableCell className="text-right">
                      {formattedSubTotal}
                    </TableCell>
                    <TableCell className="text-right">
                      {KHRConversionRate?.rates.KHR &&
                        formatCurrency({
                          amount:
                            amount *
                            item.quantity *
                            KHRConversionRate?.rates.KHR,
                          currency: "KHR",
                        })}
                    </TableCell>
                  </TableRow>
                );
              })
          )}
      </TableBody>
    </Table>
  );
}
