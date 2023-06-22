import { convertToNormalCase } from "@/lib/utils";
import { api } from "@/utils/api";
import { type Item } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import DataTable from "./DataTable";
import { LoadingPage } from "./loading";

export const columnsWithQty: ColumnDef<Item>[] = [
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

export const columnsWithPrice: ColumnDef<Item>[] = [
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
    accessorKey: "priceUSD",
    header: "Price USD",
    cell: ({ row }) => {
      const price: string = row.getValue("priceUSD");
      return <div>${price.toString()}</div>;
    },
  },
];

export const columnsNoQty: ColumnDef<Item>[] = [
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
];

type ItemTableVariant = "default" | "inventory" | "pos";

export function ItemsTable({
  filterItems = true,
  displayQty = true,
  variant = "default",
}: {
  filterItems?: boolean;
  displayQty?: boolean;
  variant?: ItemTableVariant;
}) {
  const { data: items, isLoading } = api.pos.getItems.useQuery();

  if (isLoading) return <LoadingPage />;
  if (!items) return null;

  const inventoryItems = items.filter(
    (item) => item.ingredients.length < 1 && item.category !== "FOOD"
  );

  return (
    <DataTable
      filterColumn="name"
      data={
        variant === "inventory"
          ? inventoryItems
          : variant === "pos"
          ? items
          : items
      }
      columns={
        variant === "inventory"
          ? columnsWithQty
          : variant === "pos"
          ? columnsWithPrice
          : columnsNoQty
      }
    />
  );
}
