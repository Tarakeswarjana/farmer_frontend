"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark" | "system";

interface UiState {
  theme: ThemeMode;
  installDismissed: boolean;
  setTheme: (theme: ThemeMode) => void;
  dismissInstall: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      theme: "light",
      installDismissed: false,
      setTheme: (theme) => set({ theme }),
      dismissInstall: () => set({ installDismissed: true }),
    }),
    { name: "vm-ui" },
  ),
);

interface FavoriteState {
  listingIds: string[];
  toggle: (id: string) => void;
  has: (id: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      listingIds: [],
      toggle: (id) => {
        const current = get().listingIds;
        set({ listingIds: current.includes(id) ? current.filter((item) => item !== id) : [...current, id] });
      },
      has: (id) => get().listingIds.includes(id),
    }),
    { name: "vm-favorites" },
  ),
);

export interface OrderDraft {
  listingId: string;
  quantity: number;
  fulfillment: "PICKUP" | "DELIVERY";
  address: string;
  transportCharge: number;
  scheduledPickupDate: string;
  method: "CASH" | "UPI" | "BANK_TRANSFER" | "RAZORPAY";
}

interface DraftState {
  orderDraft: OrderDraft | null;
  setOrderDraft: (draft: OrderDraft | null) => void;
}

export const useDraftStore = create<DraftState>((set) => ({
  orderDraft: null,
  setOrderDraft: (orderDraft) => set({ orderDraft }),
}));
