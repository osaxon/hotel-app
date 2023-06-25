import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDurationOfStay, getRateTotal } from "@/lib/utils";
import { Prisma } from "@prisma/client";

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { items: { include: { item: true } } };
}>;

type ReservationWithResItem = Prisma.ReservationGetPayload<{
  include: { reservationItem: true };
}>;

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function Invoice({
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

  let duration;
  let rateTotals;
  let formattedReservationTotal;
  let formattedRateTotal;
  if (reservation && reservation.reservationItem) {
    duration = getDurationOfStay(reservation.checkIn, reservation.checkOut);
    rateTotals = getRateTotal(duration, reservation.reservationItem);

    formattedReservationTotal = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(rateTotals.value);

    formattedRateTotal = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(reservation.reservationItem.dailyRateUSD));
  }

  return (
    <Table>
      <TableCaption>Transtions for {invoice?.customerName}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">No.</TableHead>
          <TableHead>Desc</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
          <TableHead className="text-right">Sub-Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reservation && (
          <TableRow>
            <TableCell className="font-medium uppercase">
              {reservation.id.slice(0, 10)}
            </TableCell>
            <TableCell>{reservation.reservationItem?.descForInvoice}</TableCell>
            <TableCell>{duration} nights</TableCell>
            <TableCell className="text-right">{formattedRateTotal}</TableCell>
            <TableCell className="text-right">
              {formattedReservationTotal}
            </TableCell>
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
                    <TableCell className="font-medium uppercase">
                      {order.id.slice(0, 10)}
                    </TableCell>
                    <TableCell>
                      {" "}
                      {item.item.name} {order.appliedDiscount}
                    </TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      {formattedPrice}
                    </TableCell>
                    <TableCell className="text-right">
                      {formattedSubTotal}
                    </TableCell>
                  </TableRow>
                );
              })
          )}
      </TableBody>
    </Table>
  );
}
