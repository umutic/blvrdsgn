'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { hasPermission } from '@/config/permissions';

/** Yetki yoksa children yerine fallback render eder. Kullanım: <RoleGuard permission="DELETE_PRODUCTS">…</RoleGuard> */
export function RoleGuard({ permission, fallback = null, children }) {
  const role = useAuthStore((s) => s.session?.role);
  return hasPermission(role, permission) ? children : fallback;
}

/** Bileşen içinde yetki kontrolü için hook. */
export function usePermission(permission) {
  const role = useAuthStore((s) => s.session?.role);
  return hasPermission(role, permission);
}
