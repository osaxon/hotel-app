// appStore.ts

import { type ReservationItem } from "@prisma/client";
import { create } from "zustand";

interface AppState {
  reservationItem: ReservationItem | undefined;
  toggleResItem: (selectedReservationItem: ReservationItem) => void;
}

export const useReservationStore = create<AppState>((set) => ({
  reservationItem: undefined,
  toggleResItem: (resItem: ReservationItem) =>
    set((state) => ({
      reservationItem:
        resItem.id === state.reservationItem?.id ? undefined : resItem,
    })),
}));
