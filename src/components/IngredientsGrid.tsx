import { useSelectedItemStore } from "@/store/selectedItemStore";
import { Check, Plus } from "lucide-react";
import LoadingSpinner from "./loading";

import { cn } from "@/lib/utils";
import { Prisma } from "@prisma/client";

type IngredientWithItems = Prisma.ItemIngredientGetPayload<{
  include: { ingredient: true };
}>;

export default function IngredientsGrid({
  itemIngredients,
}: {
  itemIngredients: IngredientWithItems[];
}) {
  const selectedIngredients: IngredientWithItems[] = useSelectedItemStore(
    (state) => state.ingredients
  );
  const add = useSelectedItemStore((state) => state.setSelectedIngredients);
  const remove = useSelectedItemStore(
    (state) => state.removeSelectedIngredient
  );
  if (!itemIngredients) return <LoadingSpinner />;

  const handleClick = (item: IngredientWithItems) => {
    if (selectedIngredients.some((selected) => selected?.id === item.id)) {
      remove(item.id);
    } else {
      add(item);
    }
  };

  return (
    <div className="relative">
      <section className="flex max-h-[33vh] flex-col gap-4 overflow-y-scroll border">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Select Ingredients
          </h2>
        </div>
        <div className="relative flex flex-col gap-4">
          {itemIngredients &&
            itemIngredients.map((item) => {
              const isSelected = selectedIngredients.some(
                (selected) => selected?.id === item.id
              );
              return (
                <div
                  className={cn(
                    "relative flex cursor-pointer justify-between rounded border p-4",
                    isSelected && "bg-emerald-500"
                  )}
                  onClick={() => handleClick(item)}
                  key={item.id}
                >
                  <div className="flex grow justify-between">
                    <div className="flex grow flex-col gap-4">
                      <p className="select-none font-semibold">{item.name}</p>
                      <p className="select-none text-muted-foreground">
                        {item.quantity?.toString()} {item.quantityUnit}
                      </p>
                    </div>
                    <div>
                      {selectedIngredients.some(
                        (selected) => selected?.id === item.id
                      ) ? (
                        <div className="flex h-full grow flex-col justify-between">
                          <Check size={36} />
                        </div>
                      ) : (
                        <Plus size={36} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
      <div className="pointer-events-none absolute bottom-0 h-10 w-full bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
}
