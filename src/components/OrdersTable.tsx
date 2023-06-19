import { api } from "@/utils/api";
import DataTable from "./DataTable";
import { type Order } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { Badge } from "./ui/badge";
import Link from "next/link";
import { Button } from "./ui/button";
import { ArrowUpDown } from "lucide-react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingPage } from "./loading";

export const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "id",
    header: () => <div className="">Order ID</div>,
    cell: ({ row }) => {
      const orderID: string = row.getValue("id");
      return (
        <Link href={`/orders/${orderID}`} className="uppercase underline">
          {orderID.slice(0, 10)}...
        </Link>
      );
    },
  },
  {
    accessorKey: "customerName",
    header: "Name",
  },
  //   {
  //     accessorKey: "guest.email",
  //     header: "Customer Email",
  //   },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const status: string = row.getValue("status");
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [updatedStatus, setUpdatedStatus] = useState<string>();

      return (
        <Badge
          className="ml-4"
          onClick={() => setUpdatedStatus("PAID")}
          variant={status === "UNPAID" ? "destructive" : "default"}
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "happyHour",
    header: "Happy Hour",
    cell: ({ row }) => {
      const happyHour: boolean = row.getValue("happyHour");
      return (
        <div className="font-medium text-muted-foreground">
          {happyHour ? "YES" : "NO"}
        </div>
      );
    },
  },
  {
    accessorKey: "subTotalUSD",
    header: () => <div className="">Amount</div>,
    cell: ({ row }) => {
      const amount = Number(row.getValue("subTotalUSD"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const order = row.original;
      const name: string = row.original.customerName ?? "";
      const orderId: string = row.original.id;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {/* <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.id)}
            >
              Copy Order ID
            </DropdownMenuItem> */}
            <DropdownMenuItem>
              <Link href={`/orders/guests/${encodeURIComponent(name)}`}>
                View all for {name}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Mark as Paid</DropdownMenuItem>
            <DropdownMenuItem>View Order Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function OrdersTable() {
  const { data: orders, isLoading } = api.pos.getAllOrders.useQuery();
  if (isLoading) return <LoadingPage />;
  if (!orders) return null;
  return <DataTable data={orders} columns={columns} />;
}
