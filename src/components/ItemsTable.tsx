import { convertToNormalCase } from "@/lib/utils";
import { api } from "@/utils/api";
import { type Item } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import DataTable from "./DataTable";
import { LoadingPage } from "./loading";

export const columns: ColumnDef<Item>[] = [
  {
    accessorKey: "id",
    header: () => <div className="">Item ID</div>,
    cell: ({ row }) => {
      const itemId: string = row.getValue("id");
      return (
        <Link href={`/items/${itemId}`} className="w-10 uppercase underline">
          ...{itemId.slice(-8)}
        </Link>
      );
    },
  },

  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <div>{convertToNormalCase(row.getValue("category"))}</div>
    ),
  },
  {
    accessorKey: "quantityUnit",
    header: () => <div className="hidden" />,
    cell: () => <div className="hidden" />,
  },
  {
    accessorKey: "quantityInStock",
    header: "In Stock",
    cell: ({ row }) => {
      const unit: string = row.getValue("quantityUnit");
      const inStock: string = row.getValue("quantityInStock");
      return <div>{`${inStock} (${unit})`}</div>;
    },
  },
];

export function ItemsTable() {
  const { data: items, isLoading } = api.pos.getItems.useQuery();

  if (isLoading) return <LoadingPage />;
  if (!items) return null;

  const filteredItems = items.filter(
    (item) => item.ingredients.length < 1 && item.category !== "FOOD"
  );

  return (
    <DataTable filterColumn="name" data={filteredItems} columns={columns} />
  );
}
