import { api } from "@/utils/api";
import Link from "next/link";
import dayjs from "dayjs";
import LoadingSpinner from "./loading";
import { BeerIcon } from "lucide-react";

export function RecentSales() {
  const { data: orders, isLoading } = api.pos.getLastDay.useQuery();

  if (isLoading) return <LoadingSpinner />;
  if (!orders) return <>No data</>;

  return (
    <div className="space-y-8">
      {orders
        .sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)))
        .map((order) => (
          <div key={order.id} className="flex items-center">
            <BeerIcon />
            <div className="ml-4 space-y-1">
              <Link
                href={`/orders/${order.id}`}
                className="text-sm font-medium leading-none"
              >
                {order.customerName}
              </Link>
              {order.items.map((itemOrder) => (
                <p key={itemOrder.id} className="text-sm text-muted-foreground">
                  x{itemOrder.quantity} - {itemOrder.item.name}
                </p>
              ))}
            </div>
            <div className="ml-auto font-medium">
              +${order.subTotalUSD.toString()}
            </div>
          </div>
        ))}
    </div>
  );
}
