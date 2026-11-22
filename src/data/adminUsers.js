/**
 * YALNIZCA DEMO: Supabase Auth'a geçildiğinde bu dosya kaldırılacak.
 * Şifreler düz metindir çünkü gerçek bir kimlik doğrulama değildir.
 * Bu liste yalnızca ilk kurulumda kullanıcı koleksiyonunu (userService) besler.
 */
export const DEMO_ADMIN_USERS = [
  { id: 'usr_admin', name: 'Sistem Yöneticisi', email: 'admin@galeri.com', password: 'admin123', role: 'admin', demo: true },
  { id: 'usr_sales', name: 'Satış Direktörü', email: 'satis@galeri.com', password: 'satis123', role: 'sales_director', demo: true },
  { id: 'usr_editor', name: 'Katalog Editörü', email: 'editor@galeri.com', password: 'editor123', role: 'catalog_editor', demo: true },
  { id: 'usr_support', name: 'Müşteri Destek', email: 'destek@galeri.com', password: 'destek123', role: 'support', demo: true },
];

const EXTRA_USERS = [
  { id: 'usr_ayse', name: 'Ayşe Demir', email: 'ayse.demir@galeri.com', password: 'ayse1234', role: 'catalog_editor', daysAgo: 41, lastLoginDaysAgo: 2 },
  { id: 'usr_kerem', name: 'Kerem Aksoy', email: 'kerem.aksoy@galeri.com', password: 'kerem1234', role: 'support', daysAgo: 18, lastLoginDaysAgo: 0.3 },
  { id: 'usr_naz', name: 'Naz Öztürk', email: 'naz.ozturk@galeri.com', password: 'naz12345', role: 'sales_director', daysAgo: 96, lastLoginDaysAgo: 34, isActive: false },
];

/** Kullanıcı koleksiyonunun seed'i (tarihler bugüne göre). */
export function generateSeedUsers(now = Date.now()) {
  const DAY = 86400000;
  const iso = (daysAgo) => (daysAgo == null ? null : new Date(now - daysAgo * DAY).toISOString());
  return [
    ...DEMO_ADMIN_USERS.map((u) => ({ ...u, isActive: true, createdAt: iso(120), lastLoginAt: null })),
    ...EXTRA_USERS.map(({ daysAgo, lastLoginDaysAgo, ...u }) => ({ isActive: true, ...u, createdAt: iso(daysAgo), lastLoginAt: iso(lastLoginDaysAgo) })),
  ];
}
