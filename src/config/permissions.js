/**
 * Merkezi RBAC yetki matrisi (CLAUDE.md §4.2).
 * Bileşenlerde asla `role === 'admin'` kontrolü yazılmaz; hasPermission() kullanılır.
 *
 * PERMISSIONS varsayılan matristir. Yönetici "Kullanıcılar & Yetkiler" ekranından rollerin
 * yetkilerini değiştirebilir; kaydedilen matris roleService üzerinden okunur ve
 * setPermissionMatrix() ile buraya aktarılır. hasPermission() her zaman aktif matrisi kullanır.
 */
export const ROLES = {
  ADMIN: 'admin',
  SALES_DIRECTOR: 'sales_director',
  CATALOG_EDITOR: 'catalog_editor',
  SUPPORT: 'support',
};

export const ROLE_LABELS = {
  admin: 'Sistem Yöneticisi',
  sales_director: 'Satış Direktörü',
  catalog_editor: 'Katalog & İçerik Editörü',
  support: 'Müşteri Destek',
};

export const ROLE_DESCRIPTIONS = {
  admin: 'Tüm sayfalar, kullanıcı ve yetki yönetimi, silme, kupon ve ayarlar.',
  sales_director: 'Ciro raporları, sipariş yönetimi ve fatura bilgileri.',
  catalog_editor: 'Ürün kataloğu ve içerik düzenleme; siparişleri göremez.',
  support: 'Siparişleri ve müşteri bilgilerini görüntüler; durum değiştiremez.',
};

/** Varsayılan yetki matrisi. */
export const PERMISSIONS = {
  VIEW_ANALYTICS: ['admin', 'sales_director'],
  VIEW_ORDERS: ['admin', 'sales_director', 'support'],
  UPDATE_ORDER_STATUS: ['admin', 'sales_director'],
  EXPORT_ORDERS: ['admin', 'sales_director'],
  VIEW_CUSTOMER_INVOICES: ['admin', 'sales_director'],
  MANAGE_PRODUCTS: ['admin', 'catalog_editor'],
  DELETE_PRODUCTS: ['admin'],
  MANAGE_COUPONS: ['admin'],
  MANAGE_USERS: ['admin'],
  MANAGE_SETTINGS: ['admin'],
};

/** Yetki ekranındaki gruplar ve açıklamalar. */
export const PERMISSION_GROUPS = [
  {
    label: 'Raporlar',
    items: [{ key: 'VIEW_ANALYTICS', label: 'Ciro ve satış raporları', desc: 'Dashboard grafikleri, ciro, ortalama sepet' }],
  },
  {
    label: 'Siparişler',
    items: [
      { key: 'VIEW_ORDERS', label: 'Siparişleri görüntüleme', desc: 'Sipariş listesi ve detayları' },
      { key: 'UPDATE_ORDER_STATUS', label: 'Sipariş durumunu güncelleme', desc: 'Hazırlanıyor → Teslim Edildi aşamaları' },
      { key: 'EXPORT_ORDERS', label: 'Siparişleri dışa aktarma', desc: 'CSV olarak indirme' },
      { key: 'VIEW_CUSTOMER_INVOICES', label: 'Fatura bilgilerini görme', desc: 'Vergi no, T.C. kimlik no, firma bilgileri' },
    ],
  },
  {
    label: 'Katalog',
    items: [
      { key: 'MANAGE_PRODUCTS', label: 'Ürün ekleme ve düzenleme', desc: 'Görsel, fiyat, kategori, açıklama' },
      { key: 'DELETE_PRODUCTS', label: 'Ürün silme', desc: 'Kalıcı olarak katalogdan kaldırma' },
    ],
  },
  {
    label: 'Yönetim',
    items: [
      { key: 'MANAGE_COUPONS', label: 'Kupon yönetimi', desc: 'Kupon oluşturma, aktif/pasif yapma' },
      { key: 'MANAGE_USERS', label: 'Kullanıcı ve yetki yönetimi', desc: 'Hesap açma, rol atama, yetki matrisi', locked: true },
      { key: 'MANAGE_SETTINGS', label: 'Mağaza ayarları', desc: 'Genel mağaza yapılandırması' },
    ],
  },
];

/**
 * Kilitli kurallar: Sistem Yöneticisi her yetkiye sahiptir (kendini kilitleyemez) ve
 * kullanıcı yönetimi yalnızca Sistem Yöneticisine aittir.
 */
export function isLockedCell(role, permission) {
  return role === ROLES.ADMIN || permission === 'MANAGE_USERS';
}

/** Kaydedilmiş bir matrisi kurallara göre temizler (bilinmeyen anahtar/rol atılır, kilitler uygulanır). */
export function normalizeMatrix(matrix = {}) {
  const roles = Object.keys(ROLE_LABELS);
  return Object.fromEntries(
    Object.keys(PERMISSIONS).map((perm) => {
      const saved = Array.isArray(matrix[perm]) ? matrix[perm] : PERMISSIONS[perm];
      const list = roles.filter((r) => {
        if (r === ROLES.ADMIN) return true;
        if (perm === 'MANAGE_USERS') return false;
        return saved.includes(r);
      });
      return [perm, list];
    })
  );
}

let activeMatrix = PERMISSIONS;
let lastInput = null;
const listeners = new Set();

/**
 * roleService'ten gelen matrisi etkinleştirir. Aynı nesne tekrar verilirse hiçbir şey yapmaz
 * (render sırasında güvenle çağrılabilir). Aboneleri bilgilendirmek için notifyPermissionMatrix().
 * @returns {boolean} matris değişti mi
 */
export function setPermissionMatrix(matrix) {
  if (matrix === lastInput) return false;
  lastInput = matrix;
  activeMatrix = matrix ? normalizeMatrix(matrix) : PERMISSIONS;
  return true;
}

export function notifyPermissionMatrix() {
  listeners.forEach((cb) => cb());
}

/** useSyncExternalStore uyumlu abonelik. */
export function subscribePermissionMatrix(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getPermissionMatrix() {
  return activeMatrix;
}

/**
 * @param {string | undefined} role
 * @param {keyof typeof PERMISSIONS} permission
 */
export function hasPermission(role, permission) {
  if (!role || !permission) return false;
  return activeMatrix[permission]?.includes(role) ?? false;
}

/** Bir rolün sahip olduğu yetki anahtarları. */
export function getRolePermissions(role, matrix = activeMatrix) {
  return Object.keys(matrix).filter((p) => matrix[p].includes(role));
}

/**
 * Admin rotaları ve gereken yetki. permission: null → oturum açmış her rol erişebilir
 * (Dashboard içerikleri kendi içinde yetkiye göre filtrelenir).
 */
export const ADMIN_ROUTES = [
  { href: '/admin', label: 'Genel Bakış', icon: 'dashboard', permission: null },
  { href: '/admin/siparisler', label: 'Siparişler', icon: 'orders', permission: 'VIEW_ORDERS' },
  { href: '/admin/urunler', label: 'Ürünler', icon: 'products', permission: 'MANAGE_PRODUCTS' },
  { href: '/admin/kuponlar', label: 'Kuponlar', icon: 'coupons', permission: 'MANAGE_COUPONS' },
  { href: '/admin/kullanicilar', label: 'Kullanıcılar & Yetkiler', icon: 'users', permission: 'MANAGE_USERS' },
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
