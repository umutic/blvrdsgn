import { CATEGORIES } from '@/data/categories';

const DAY = 86400000;
const startOfDay = (t) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const sumTotals = (orders) => orders.reduce((n, o) => n + o.totals.total, 0);
export const delta = (cur, prev) => (prev ? (cur - prev) / prev : null);

/**
 * Dashboard metrikleri. Seçilen aralık (rangeDays) ile bir önceki eşit aralık karşılaştırılır.
 * Supabase'e geçişte bu hesaplar bir SQL view/RPC'ye taşınabilir.
 */
export function buildDashboard(orders = [], products = [], rangeDays = 30, now = Date.now()) {
  const start = startOfDay(now) - (rangeDays - 1) * DAY;
  const prevStart = start - rangeDays * DAY;
  const t = (o) => new Date(o.createdAt).getTime();
  const current = orders.filter((o) => t(o) >= start);
  const previous = orders.filter((o) => t(o) >= prevStart && t(o) < start);

  const revenue = sumTotals(current);
  const prevRevenue = sumTotals(previous);
  const aov = current.length ? revenue / current.length : 0;
  const prevAov = previous.length ? prevRevenue / previous.length : 0;
  const customers = new Set(current.map((o) => o.customer.email)).size;
  const prevCustomers = new Set(previous.map((o) => o.customer.email)).size;

  const daily = Array.from({ length: rangeDays }, (_, i) => {
    const dayStart = start + i * DAY;
    const dayOrders = current.filter((o) => t(o) >= dayStart && t(o) < dayStart + DAY);
    return {
      date: new Date(dayStart).toISOString(),
      label: new Date(dayStart).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
      revenue: sumTotals(dayOrders),
      orders: dayOrders.length,
      aov: dayOrders.length ? sumTotals(dayOrders) / dayOrders.length : 0,
      customers: new Set(dayOrders.map((o) => o.customer.email)).size,
    };
  });

  const productById = Object.fromEntries(products.map((p) => [p.id, p]));
  const catMap = {};
  const prodMap = {};
  for (const o of current) {
    for (const it of o.items) {
      const p = productById[it.productId];
      const cat = p?.category ?? 'diger';
      const line = it.unitPrice * it.quantity;
      catMap[cat] = catMap[cat] ?? { revenue: 0, units: 0 };
      catMap[cat].revenue += line;
      catMap[cat].units += it.quantity;
      prodMap[it.productId] = prodMap[it.productId] ?? { productId: it.productId, title: p?.title ?? it.title, image: p?.image ?? it.image, category: cat, units: 0, revenue: 0 };
      prodMap[it.productId].units += it.quantity;
      prodMap[it.productId].revenue += line;
    }
  }
  const categoryRevenue = CATEGORIES.map((c) => ({ slug: c.slug, name: c.name, revenue: catMap[c.slug]?.revenue ?? 0, units: catMap[c.slug]?.units ?? 0, count: products.filter((p) => p.category === c.slug).length })).sort((a, b) => b.revenue - a.revenue);
  const topProducts = Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return {
    range: rangeDays,
    revenue: { value: revenue, delta: delta(revenue, prevRevenue) },
    orders: { value: current.length, delta: delta(current.length, previous.length) },
    aov: { value: aov, delta: delta(aov, prevAov) },
    customers: { value: customers, delta: delta(customers, prevCustomers) },
    daily,
    categoryRevenue,
    topProducts,
  };
}

/** Sparkline için seriyi en fazla n noktaya indirger (toplayarak). */
export function bucket(values, n = 14) {
  if (values.length <= n) return values;
  const size = values.length / n;
  return Array.from({ length: n }, (_, i) => values.slice(Math.floor(i * size), Math.floor((i + 1) * size)).reduce((a, b) => a + b, 0));
}

/** Kısa TL biçimi: 8.400 → "8,4 bin TL", 1.250.000 → "1,3 mn TL" (Türkçe "B" kısaltması milyarla karışmasın). */
export function formatCompactTL(v) {
  const n = (x) => new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 1 }).format(x);
  if (Math.abs(v) >= 1e6) return `${n(v / 1e6)} mn TL`;
  if (Math.abs(v) >= 1e3) return `${n(v / 1e3)} bin TL`;
  return `${n(v)} TL`;
}

export function relativeTime(iso, now = Date.now()) {
  const diff = (now - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'az önce';
  if (diff < 3600) return `${Math.floor(diff / 60)} dk önce`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} sa önce`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} gün önce`;
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

/** Basit CSV indirme (tarayıcı). */
export function downloadCsv(filename, rows) {
  const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(escape).join(';')).join('\n');
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
