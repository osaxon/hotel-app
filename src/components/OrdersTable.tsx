import { api } from "@/utils/api";
import DataTable from "./DataTable";
import { Order, Prisma, OrderStatus } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
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
        <Link href={`/orders/${orderID}`} className="w-10 uppercase underline">
          {orderID}
        </Link>
      );
    },
  },
  {
    accessorKey: "customerName",
    header: "Name",
  },
  {
    accessorKey: "customerEmail",
    header: "Customer Email",
  },
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
      return (
        <Badge
          className="ml-4"
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(order.id)}
            >
              Copy Order ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Print Invoice</DropdownMenuItem>
            <DropdownMenuItem>View Order Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function OrdersTable() {
  const { data: orders, isError, isLoading } = api.pos.getAllOrders.useQuery();
  if (isLoading) return <LoadingPage />;
  if (!orders) return null;
  return <DataTable data={orders} columns={columns} />;
}
