import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  _id: string; name: string; email: string;
  role: 'student' | 'trainer' | 'admin';
  avatar?: { url: string }; trainerApproved?: boolean;
}
interface AuthState {
  user: AuthUser | null; accessToken: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  setToken: (token: string) => void; clearAuth: () => void;
}
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      setToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
    }),
    { name: 'lms-auth', partialize: (s) => ({ user: s.user }) }
  )
);