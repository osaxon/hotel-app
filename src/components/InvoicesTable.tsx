import { api } from "@/utils/api";
import { type Invoice } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import DataTable from "./DataTable";
import { LoadingPage } from "./loading";

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: () => <div className="">Number</div>,
    cell: ({ row }) => {
      const invoiceNumber: string = row.getValue("invoiceNumber");
      return (
        <Link
          href={`/invoices/${invoiceNumber}`}
          className="uppercase underline"
        >
          IN{invoiceNumber}
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
    header: "Status",
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

export function InvoicesTable() {
  const { data: invoices, isLoading } = api.pos.getOpenInvoices.useQuery();
  if (isLoading) return <LoadingPage />;
  if (!invoices) return null;
  return (
    <DataTable filterColumn="customerName" data={invoices} columns={columns} />
  );
}
