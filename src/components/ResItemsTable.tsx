import { api } from "@/utils/api";
import { ReservationItem } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import DataTable from "./DataTable";
import { LoadingPage } from "./loading";

export const columns: ColumnDef<ReservationItem>[] = [
  {
    accessorKey: "id",
    header: () => <div className="">Option ID</div>,
    cell: ({ row }) => {
      const resItemId: string = row.getValue("id");
      return (
        <Link
          href={`/reservations/res-items/${resItemId}`}
          className="w-10 uppercase underline"
        >
          ...{resItemId.slice(-8)}
        </Link>
      );
    },
  },

  {
    accessorKey: "description",
    header: "Name",
  },

  {
    accessorKey: "descForInvoice",
    header: "Description",
  },
  {
    accessorKey: "roomType",
    header: "Type",
  },
  {
    accessorKey: "roomVariant",
    header: "Variant",
  },
  {
    accessorKey: "boardType",
    header: "Board",
  },
];

export function ResItemsTable() {
  const { data: items, isLoading } =
    api.reservations.getReservationItems.useQuery();

  if (isLoading) return <LoadingPage />;
  if (!items) return null;

  return (
    <DataTable
      filterColumn="description"
      filterPlaceholder="Filter name"
      data={items}
      columns={columns}
    />
  );
}
