'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/config/storageKeys';
import { authService } from '@/services/authService';

export const useAuthStore = create(
  persist(
    (set) => ({
      /** @type {{ id: string, name: string, email: string, role: string, loggedInAt: string } | null} */
      session: null,
      login: async (email, password) => {
        const session = await authService.login(email, password);
        set({ session });
        return session;
      },
      /** Kullanıcı kaydı panelden değiştiğinde (rol, ad, e-posta) oturumu günceller. */
      syncSession: (user) =>
        set((state) => (state.session ? { session: { ...state.session, name: user.name, email: user.email, role: user.role } } : state)),
      logout: async () => {
        await authService.logout();
        set({ session: null });
      },
    }),
    { name: STORAGE_KEYS.ADMIN_SESSION, storage: createJSONStorage(() => window.localStorage) }
  )
);
