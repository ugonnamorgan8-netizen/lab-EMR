import { create } from "zustand";
import type { NotificationItem } from "../types/app";

type NotificationStore = {
  open: boolean;
  items: NotificationItem[];
  setOpen: (open: boolean) => void;
  setItems: (items: NotificationItem[]) => void;
  pushItem: (item: NotificationItem) => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  open: false,
  items: [],
  setOpen: (open) => set({ open }),
  setItems: (items) => set({ items }),
  pushItem: (item) =>
    set((state) => ({
      items: [item, ...state.items],
    })),
}));
