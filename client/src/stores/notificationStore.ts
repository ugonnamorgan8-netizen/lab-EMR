import { create } from "zustand";
import type { NotificationItem } from "../types/app";

type NotificationStore = {
  open: boolean;
  items: NotificationItem[];
  unreadCount: number;
  toast: NotificationItem | null;
  setOpen: (open: boolean) => void;
  setItems: (items: NotificationItem[]) => void;
  pushItem: (item: NotificationItem) => void;
  clearUnread: () => void;
  setToast: (item: NotificationItem | null) => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  open: false,
  items: [],
  unreadCount: 0,
  toast: null,
  setOpen: (open) => set({ open }),
  // Initial load: count how many came back unread from the server
  setItems: (items) =>
    set({ items, unreadCount: items.filter((i) => !i.read).length }),
  // Socket push: prepend item and bump unread count
  pushItem: (item) =>
    set((state) => ({
      items: [item, ...state.items],
      unreadCount: state.unreadCount + 1,
    })),
  // Called when the drawer opens — resets the badge
  clearUnread: () => set({ unreadCount: 0 }),
  // Drives the floating toast pop-up
  setToast: (toast) => set({ toast }),
}));
