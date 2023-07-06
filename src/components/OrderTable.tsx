import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";

type OrderWithItemsAndGuest = Prisma.OrderGetPayload<{
  include: { items: { include: { item: true } }; guest: true };
}>;

export default function OrderTable({
  order,
}: {
  order: OrderWithItemsAndGuest;
}) {
  return (
    <Table>
      <TableCaption>Transtions for {order.name}</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">No.</TableHead>
          <TableHead>Desc</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Qty</TableHead>
          <TableHead className="text-right">Unit Price</TableHead>
          <TableHead className="text-right">Sub-Total</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {order.items &&
          order.items.map((item) => {
            const itemPrice =
              order.appliedDiscount === "HAPPY_HOUR"
                ? item.item.happyHourPriceUSD
                : order.appliedDiscount === "STAFF"
                ? item.item.staffPriceUSD
                : item.item.priceUSD;
            const amount = Number(itemPrice);
            const formattedPrice = formatCurrency({ amount });
            const formattedSubTotal = formatCurrency({
              amount: amount * item.quantity,
            });
            return (
              <TableRow key={item.id}>
                <TableCell className="font-medium uppercase">
                  {order.id.slice(0, 10)}
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
                <TableCell className="text-right">{formattedPrice}</TableCell>
                <TableCell className="text-right">
                  {formattedSubTotal}
                </TableCell>
              </TableRow>
            );
          })}
      </TableBody>
    </Table>
  );
}
