'use client';

import { useSyncExternalStore } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getPermissionMatrix, hasPermission, PERMISSIONS, subscribePermissionMatrix } from '@/config/permissions';

/** Aktif yetki matrisine abone olur; yönetici matrisi değiştirdiğinde bileşen yeniden çizilir. */
export function usePermissionMatrix() {
  return useSyncExternalStore(subscribePermissionMatrix, getPermissionMatrix, () => PERMISSIONS);
}

/** Yetki yoksa children yerine fallback render eder. Kullanım: <RoleGuard permission="DELETE_PRODUCTS">…</RoleGuard> */
export function RoleGuard({ permission, fallback = null, children }) {
  return usePermission(permission) ? children : fallback;
}

/** Bileşen içinde yetki kontrolü için hook. */
export function usePermission(permission) {
  const role = useAuthStore((s) => s.session?.role);
  usePermissionMatrix();
  return hasPermission(role, permission);
}
