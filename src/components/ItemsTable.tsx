import { formatCurrency } from "@/lib/utils";
import { api } from "@/utils/api";
import { ItemCategory, type Item } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import DataTable from "./DataTable";
import { LoadingPage } from "./loading";

export const itemCats = Object.values(ItemCategory).map((cat) => {
  return {
    label: cat,
    value: cat.toString(),
    icon: undefined,
  };
});

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
    id: "category",
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const cat = itemCats.find(
        (cat) => cat.value === row.getValue("category")
      );

      if (!cat) {
        return null;
      }

      return <div className="flex items-center">{cat.label}</div>;
    },
    filterFn: (row, id, value) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      return value.includes(row.getValue(id));
    },
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
    id: "category",
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const cat = itemCats.find(
        (cat) => cat.value === row.getValue("category")
      );

      if (!cat) {
        return null;
      }

      return <div className="flex items-center">{cat.label}</div>;
    },
    filterFn: (row, id, value) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priceUSD",
    header: "Price USD",
    cell: ({ row }) => {
      const price: string = row.getValue("priceUSD");
      return <div>{formatCurrency({ amount: Number(price) })}</div>;
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
    id: "category",
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => {
      const cat = itemCats.find(
        (cat) => cat.value === row.getValue("category")
      );

      if (!cat) {
        return null;
      }

      return <div className="flex items-center">{cat.label}</div>;
    },
    filterFn: (row, id, value) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      return value.includes(row.getValue(id));
    },
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

  return (
    <DataTable
      filterColumn="name"
      data={
        variant === "inventory"
          ? items.filter((item) => item.stockManaged === true)
          : variant === "pos"
          ? items.filter((item) => item.displayOnPOS)
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
