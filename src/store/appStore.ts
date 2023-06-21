import { create } from "zustand";
import { addDays } from "date-fns";
import { type DateRange } from "react-day-picker";

type UploadedImgs = {
  fileUrl: string;
  fileKey: string;
};

type ItemIngredient = {
  id: string;
  name: string;
  quantity: number;
  quantityUnit: string;
};

type Store = {
  selectedDate: DateRange;
  selectedIngredients: ItemIngredient[];
  setSelectedDate: (date: DateRange) => void;
  uploadedImgs: UploadedImgs[];
  setUploadedImgs: (response: UploadedImgs[]) => void;
};

export const useStore = create<Store>((set) => ({
  selectedDate: {
    from: new Date(2023, 0, 20),
    to: addDays(new Date(2023, 0, 20), 20),
  },
  selectedIngredients: [],
  uploadedImgs: [],
  setSelectedDate: (date) =>
    set(({ selectedDate }) => ({
      selectedDate: { ...selectedDate, from: date?.from, to: date?.to },
    })),
  setUploadedImgs: (response) => set(() => ({ uploadedImgs: response })),
  setSelectedIngredients: (data: ItemIngredient[]) =>
    set((state) => ({ selectedIngredients: data })),
}));
