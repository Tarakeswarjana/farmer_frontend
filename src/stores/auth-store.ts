"use client";

import { create } from "zustand";
import { tokenStore } from "@/lib/auth/token-store";
import type { User } from "@/types/api";

type Status = "loading" | "authenticated" | "anonymous";

interface AuthState {
  user: User | null;
  status: Status;
  setUser: (user: User | null) => void;
  setStatus: (status: Status) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  setUser: (user) => set({ user, status: user ? "authenticated" : "anonymous" }),
  setStatus: (status) => set({ status }),
}));

if (typeof window !== "undefined") {
  tokenStore.subscribe((user) => {
    useAuthStore.getState().setUser(user);
  });
}
