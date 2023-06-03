import { create } from "zustand";
import { addDays } from "date-fns";
import { type DateRange } from "react-day-picker";

type Store = {
  selectedDate: DateRange;
  setSelectedDate: (date: DateRange) => void;
};

export const useStore = create<Store>((set) => ({
  selectedDate: {
    from: new Date(2023, 0, 20),
    to: addDays(new Date(2023, 0, 20), 20),
  },
  setSelectedDate: (date) =>
    set(({ selectedDate }) => ({
      selectedDate: { ...selectedDate, from: date?.from, to: date?.to },
    })),
}));
