import { create } from "zustand";
import type { AuthUser } from "@shared/index";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
  setSession: (session: { accessToken: string; user: AuthUser }) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  user: null,
  setSession: ({ accessToken, user }) => set({ accessToken, user }),
  clearSession: () => set({ accessToken: null, user: null }),
}));
