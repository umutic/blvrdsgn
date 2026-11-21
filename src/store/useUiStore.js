'use client';

import { create } from 'zustand';

/** Kalıcı olmayan arayüz durumu: giriş animasyonu ve arama modalı. */
export const useUiStore = create((set) => ({
  introDone: false,
  setIntroDone: () => set({ introDone: true }),
  searchOpen: false,
  openSearch: () => set({ searchOpen: true }),
  closeSearch: () => set({ searchOpen: false }),
}));
