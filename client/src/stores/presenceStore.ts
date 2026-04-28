import { create } from "zustand";

type PresenceState = {
  activeUsers: number;
  setActiveUsers: (activeUsers: number) => void;
  reset: () => void;
};

export const usePresenceStore = create<PresenceState>((set) => ({
  activeUsers: 0,
  setActiveUsers: (activeUsers) => set({ activeUsers }),
  reset: () => set({ activeUsers: 0 }),
}));
