import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/utils/api";
import { type ItemIngredient } from "@prisma/client";
import { type ColumnDef } from "@tanstack/react-table";
import DataTable from "./DataTable";

import { LoadingPage } from "./loading";

export const columns: ColumnDef<ItemIngredient>[] = [
  {
    id: "select",

    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "quantity",
    header: "Qty",
  },
];

export function IngredientsTable() {
  const { data: ingredients, isLoading } = api.pos.getIngredients.useQuery();
  if (isLoading) return <LoadingPage />;
  if (!ingredients) return null;
  return (
    <DataTable
      displayFilter={true}
      filterColumn="name"
      data={ingredients}
      columns={columns}
    />
  );
}
