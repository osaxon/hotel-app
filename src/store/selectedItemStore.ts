// appStore.ts

import { Prisma, type ItemIngredient } from "@prisma/client";
import { create } from "zustand";

type IngredientWithItems = Prisma.ItemIngredientGetPayload<{
  include: { ingredient: true };
}>;

interface AppState {
  ingredients: IngredientWithItems[];
  setSelectedIngredients: (selectedIngredient: IngredientWithItems) => void;
  removeSelectedIngredient: (id: string) => void;
}

export const useSelectedItemStore = create<AppState>((set) => ({
  ingredients: [],
  setSelectedIngredients: (newIngredient) =>
    set((state) => ({ ingredients: [...state.ingredients, newIngredient] })),
  removeSelectedIngredient: (id) =>
    set((state) => ({
      ingredients: state.ingredients.filter(
        (ingredient) => ingredient.id !== id
      ),
    })),
}));
