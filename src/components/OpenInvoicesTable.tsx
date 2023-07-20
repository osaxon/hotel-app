import { api } from "@/utils/api";
import { type Invoice } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import DataTable from "./DataTable";
import { LoadingPage } from "./loading";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: () => <div className="">Invoice No</div>,
    cell: ({ row }) => {
      const invoiceNumber: string = row.getValue("invoiceNumber");
      return (
        <Link
          href={`/invoices/${invoiceNumber}`}
          className="uppercase underline"
        >
          {invoiceNumber}
        </Link>
      );
    },
  },
  {
    accessorKey: "customerName",
    header: "Name",
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
    accessorKey: "totalUSD",
    header: () => <div className="">Amount</div>,
    cell: ({ row }) => {
      const amount = Number(row.getValue("totalUSD"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
];

export function OpenInvoicesTable() {
  const { data: invoices, isLoading } = api.pos.getOpenInvoices.useQuery();
  if (isLoading) return <LoadingPage />;
  if (!invoices) return null;
  return (
    <DataTable data={invoices} filterColumn="customerName" columns={columns} />
  );
}
