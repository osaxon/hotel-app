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
      reservations: { include: { guest: true; reservationItem: true } };
      orders: {
        include: {
          items: { include: { item: true } };
        };
      };
    };
  }>;
}) {
  const orders: OrderWithItems[] = invoice.orders;
  const reservations: ReservationWithResItem[] | [] = invoice.reservations;

  const {
    data: KHRConversionRate,
    isLoading,
    isError,
  } = api.pos.currencyConversion.useQuery({
    fromCurrency: "USD",
    toCurrency: "KHR",
    amount: 0,
  });

  let duration;
  let formattedReservationTotal;
  let KHRTotal: string;
  const currentConversionRate = formatCurrency({
    amount: Number(KHRConversionRate && KHRConversionRate.rates.KHR),
    currency: "KHR",
  });

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
          <TableHead>Desc</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
          <TableHead className="text-right">Sub-Total USD</TableHead>
          <TableHead className="text-right">Sub-Total KHR</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservations &&
          reservations.map((reservation) => {
            duration = getDurationOfStay(
              reservation.checkIn,
              reservation.checkOut
            );

            formattedReservationTotal = formatCurrency({
              amount: Number(reservation.subTotalUSD),
            });

            if (KHRConversionRate && KHRConversionRate?.rates?.KHR) {
              KHRTotal = formatCurrency({
                amount: Number(
                  KHRConversionRate?.rates?.KHR *
                    Number(reservation.subTotalUSD)
                ),
                currency: "KHR",
              });
            }

            return (
              <TableRow key={reservation.id}>
                <TableCell className="flex flex-col gap-1">
                  <Link
                    className="underline"
                    href={`/reservations/${reservation.id}`}
                  >
                    {reservation.reservationItem?.descForInvoice}
                  </Link>
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
            );
          })}

        {orders &&
          orders
            .filter((order) => order.isManualOrder === false)
            .map(
              (order, index) =>
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
                      <TableCell>
                        <Link
                          className="underline"
                          href={`/orders/${order.id}`}
                        >
                          {item.item.descForInvoice}{" "}
                          {order.appliedDiscount !== "NONE"
                            ? order.appliedDiscount + " discount"
                            : ""}
                        </Link>
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
        {orders &&
          orders
            .filter((order) => order.isManualOrder === true)
            .map((order) => {
              const formattedSubTotal = formatCurrency({
                amount: Number(order.subTotalUSD),
                currency: "USD",
              });
              return (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link className="underline" href={`/orders/${order.id}`}>
                      {order.note}{" "}
                      {order.appliedDiscount !== "NONE"
                        ? order.appliedDiscount + " discount"
                        : ""}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {dayjs(order.createdAt).format("DD MMM YY")}
                  </TableCell>

                  <TableCell>-</TableCell>
                  <TableCell className="text-right">-</TableCell>
                  <TableCell className="text-right">
                    {formattedSubTotal}
                  </TableCell>
                  <TableCell className="text-right">
                    {KHRConversionRate?.rates.KHR &&
                      formatCurrency({
                        amount:
                          Number(order.subTotalUSD) *
                          KHRConversionRate?.rates.KHR,
                        currency: "KHR",
                      })}
                  </TableCell>
                </TableRow>
              );
            })}
      </TableBody>
    </Table>
  );
}
