import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  userId: string | null;
  email: string | null;
  setAuth: (token: string, refreshToken: string, userId?: string, email?: string) => void;
  clearAuth: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      userId: null,
      email: null,

      setAuth: (token, refreshToken, userId, email) =>
        set({ token, refreshToken, userId: userId ?? null, email: email ?? null }),

      clearAuth: () =>
        set({ token: null, refreshToken: null, userId: null, email: null }),

      isAuthenticated: () => !!get().token,
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        userId: state.userId,
        email: state.email,
      }),
    }
  )
);
