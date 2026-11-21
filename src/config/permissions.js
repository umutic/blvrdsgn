/**
 * Merkezi RBAC yetki matrisi (CLAUDE.md §4.2).
 * Bileşenlerde asla `role === 'admin'` kontrolü yazılmaz; hasPermission() kullanılır.
 */
export const ROLES = {
  ADMIN: 'admin',
  SALES_DIRECTOR: 'sales_director',
  CATALOG_EDITOR: 'catalog_editor',
};

export const ROLE_LABELS = {
  admin: 'Sistem Yöneticisi',
  sales_director: 'Satış Direktörü',
  catalog_editor: 'Katalog & İçerik Editörü',
};

export const PERMISSIONS = {
  VIEW_ANALYTICS: ['admin', 'sales_director'],
  MANAGE_ORDERS: ['admin', 'sales_director'],
  VIEW_CUSTOMER_INVOICES: ['admin', 'sales_director'],
  MANAGE_PRODUCTS: ['admin', 'catalog_editor'],
  DELETE_PRODUCTS: ['admin'],
  MANAGE_COUPONS: ['admin'],
  MANAGE_SETTINGS: ['admin'],
};

/**
 * @param {string | undefined} role
 * @param {keyof typeof PERMISSIONS} permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  return PERMISSIONS[permission]?.includes(role) ?? false;
}

/**
 * Admin rotaları ve gereken yetki. permission: null → oturum açmış her rol erişebilir
 * (Dashboard içerikleri kendi içinde yetkiye göre filtrelenir).
 */
export const ADMIN_ROUTES = [
  { href: '/admin', label: 'Genel Bakış', icon: 'dashboard', permission: null },
  { href: '/admin/siparisler', label: 'Siparişler', icon: 'orders', permission: 'MANAGE_ORDERS' },
  { href: '/admin/urunler', label: 'Ürünler', icon: 'products', permission: 'MANAGE_PRODUCTS' },
  { href: '/admin/kuponlar', label: 'Kuponlar', icon: 'coupons', permission: 'MANAGE_COUPONS' },
];

function findRoute(pathname) {
  return [...ADMIN_ROUTES]
    .sort((a, b) => b.href.length - a.href.length)
    .find((r) => pathname === r.href || pathname.startsWith(`${r.href}/`));
}

export function canAccessRoute(role, pathname) {
  if (!role || !ROLE_LABELS[role]) return false;
  const route = findRoute(pathname);
  if (!route || !route.permission) return true;
  return hasPermission(role, route.permission);
}

export function getAllowedRoutes(role) {
  return ADMIN_ROUTES.filter((r) => canAccessRoute(role, r.href));
}

export function getDefaultAdminRoute(role) {
  return getAllowedRoutes(role)[0]?.href ?? '/admin/login';
}
