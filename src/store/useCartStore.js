'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/config/storageKeys';

/**
 * @typedef {Object} CartItem
 * @property {string} key       - productId-sizeId-frameId-mat
 * @property {string} productId
 * @property {string} slug
 * @property {string} title
 * @property {string} image
 * @property {string} sizeId
 * @property {string} frameId
 * @property {boolean} mat
 * @property {number} quantity
 * @property {number} unitPrice
 */

export const buildCartKey = ({ productId, sizeId, frameId, mat }) =>
  `${productId}-${sizeId}-${frameId}-${mat ? 1 : 0}`;

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      coupon: null,
      note: '',
      isOpen: false,

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      addItem: (item, { open = true } = {}) =>
        set((state) => {
          const key = buildCartKey(item);
          const quantity = item.quantity ?? 1;
          const exists = state.items.find((i) => i.key === key);
          const items = exists
            ? state.items.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i))
            : [...state.items, { ...item, key, quantity }];
          return { items, isOpen: open ? true : state.isOpen };
        }),

      updateQuantity: (key, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.key !== key)
              : state.items.map((i) => (i.key === key ? { ...i, quantity } : i)),
        })),

      removeItem: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      applyCoupon: (coupon) => set({ coupon }),
      removeCoupon: () => set({ coupon: null }),
      setNote: (note) => set({ note }),
      clearCart: () => set({ items: [], coupon: null, note: '' }),
    }),
    {
      name: STORAGE_KEYS.CART,
      storage: createJSONStorage(() => window.localStorage),
      partialize: ({ items, coupon, note }) => ({ items, coupon, note }),
    }
  )
);
