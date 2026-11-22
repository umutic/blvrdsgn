'use client';

import { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowUpDown, ChevronLeft, ChevronRight, Download, Gift, Search } from 'lucide-react';
import { toast } from 'sonner';
import { OrderDetailModal } from '@/components/admin/OrderDetailModal';
import { Avatar } from '@/components/admin/Avatar';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { usePermission } from '@/components/admin/RoleGuard';
import { PageHeader, btn, input } from '@/components/admin/PageHeader';
import { orderService, ORDER_STATUSES } from '@/services/orderService';
import { auditService } from '@/services/auditService';
import { useAuthStore } from '@/store/useAuthStore';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { downloadCsv, relativeTime } from '@/utils/analytics';
import { formatDate, formatTime } from '@/utils/date';
import { formatTL } from '@/utils/pricing';

const PAGE_SIZE = 12;
const DAY = 86400000;
const SELECT_TONE = {
  'Hazırlanıyor': 'bg-zinc-100 text-zinc-700 ring-zinc-300',
  'Baskı Aşamasında': 'bg-sky-50 text-sky-800 ring-sky-200',
  'Kargoya Verildi': 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  'Teslim Edildi': 'bg-emerald-50 text-emerald-800 ring-emerald-200',
};
const RANGES = [
  { value: 'all', label: 'Tüm zamanlar' },
  { value: 'today', label: 'Bugün' },
  { value: '7', label: 'Son 7 gün' },
  { value: '30', label: 'Son 30 gün' },
];

function rangeStart(range) {
  if (range === 'all') return 0;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return range === 'today' ? d.getTime() : d.getTime() - (Number(range) - 1) * DAY;
}

function OrdersView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = useAuthStore((s) => s.session);
  const canUpdate = usePermission('UPDATE_ORDER_STATUS');
  const canExport = usePermission('EXPORT_ORDERS');
  const { data: orders, loading } = useServiceQuery(orderService.getAllOrders, orderService.subscribe);
  const [tab, setTab] = useState('');
  const [query, setQuery] = useState('');
  const [range, setRange] = useState('all');
  const [giftOnly, setGiftOnly] = useState(false);
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const selectedId = searchParams.get('no');

  useEffect(() => setPage(0), [tab, query, range, giftOnly, sortAsc]);

  const counts = useMemo(() => Object.fromEntries(ORDER_STATUSES.map((s) => [s, (orders ?? []).filter((o) => o.status === s).length])), [orders]);
  const giftCount = useMemo(() => (orders ?? []).filter((o) => o.gift?.isGift).length, [orders]);
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    const from = rangeStart(range);
    const list = (orders ?? []).filter(
      (o) =>
        (!tab || o.status === tab) &&
        (!giftOnly || o.gift?.isGift) &&
        new Date(o.createdAt).getTime() >= from &&
        (!q || `${o.id} ${o.customer.fullName} ${o.customer.email} ${o.gift?.recipientName ?? ''}`.toLocaleLowerCase('tr').includes(q))
    );
    return sortAsc ? [...list].reverse() : list; // servis yeniden eskiye sıralı döner
  }, [orders, tab, query, range, giftOnly, sortAsc]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const selected = orders?.find((o) => o.id === selectedId) ?? null;
  const selectedIndex = selected ? filtered.findIndex((o) => o.id === selected.id) : -1;

  const open = useCallback((id) => router.replace(id ? `/admin/siparisler?no=${id}` : '/admin/siparisler', { scroll: false }), [router]);
  const close = useCallback(() => open(null), [open]);
  const goPrev = selectedIndex > 0 ? () => open(filtered[selectedIndex - 1].id) : undefined;
  const goNext = selectedIndex >= 0 && selectedIndex < filtered.length - 1 ? () => open(filtered[selectedIndex + 1].id) : undefined;

  const changeStatus = async (id, status) => {
    if (!canUpdate) return toast.error('Sipariş durumunu değiştirme yetkiniz yok.');
    try {
      await orderService.updateOrderStatus(id, status);
      await auditService.log({ actor: session, category: 'order', message: 'Sipariş durumunu güncelledi', target: `${id} → ${status}` });
      toast.success(`${id} · ${status}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const exportCsv = () =>
    downloadCsv('blvrdsgn-siparisler.csv', [
      ['Sipariş', 'Tarih', 'Saat', 'Müşteri', 'E-posta', 'Şehir', 'Durum', 'Hediye', 'Hediye alıcısı', 'Hediye notu', 'Kupon', 'Toplam'],
      ...filtered.map((o) => [
        o.id, formatDate(o.createdAt), formatTime(o.createdAt), o.customer.fullName, o.customer.email, o.shippingAddress.city, o.status,
        o.gift?.isGift ? 'Evet' : 'Hayır', o.gift?.recipientName ?? '', o.gift?.message ?? '', o.couponCode ?? '', o.totals.total,
      ]),
    ]);

  const tabs = [{ value: '', label: 'Tümü', count: orders?.length ?? 0 }, ...ORDER_STATUSES.map((s) => ({ value: s, label: s, count: counts[s] }))];

  return (
    <div>
      <PageHeader
        title="Siparişler"
        description="Vitrinden gelen siparişleri takip edin, aşamalarını güncelleyin. Detay için bir satıra tıklayın."
        actions={canExport && <button type="button" onClick={exportCsv} className={btn.secondary}><Download className="size-4" /> Dışa aktar</button>}
      />

      <div className="rounded-2xl border border-[#E4E4E7] bg-white">
        <div className="no-scrollbar flex gap-1 overflow-x-auto border-b border-[#E4E4E7] px-4">
          {tabs.map((t) => (
            <button key={t.label} type="button" onClick={() => setTab(t.value)} className={`relative flex items-center gap-2 whitespace-nowrap px-3 py-4 text-[13px] font-medium transition-colors ${tab === t.value ? 'text-ink' : 'text-muted hover:text-ink'}`}>
              {t.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${tab === t.value ? 'bg-ink text-white' : 'bg-[#F4F4F5]'}`}>{t.count}</span>
              {tab === t.value && <motion.span layoutId="orders-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ink" />}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-[#E4E4E7] p-4">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Sipariş no, müşteri veya alıcı" className={`${input} pl-9`} />
          </div>
          <select value={range} onChange={(e) => setRange(e.target.value)} aria-label="Tarih aralığı" className={`${input} w-auto!`}>
            {RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <button
            type="button"
            aria-pressed={giftOnly}
            onClick={() => setGiftOnly((g) => !g)}
            className={`inline-flex h-10 items-center gap-2 rounded-xl border px-3 text-sm font-medium transition ${giftOnly ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-[#E4E4E7] bg-white text-muted hover:text-ink'}`}
          >
            <Gift className="size-4" /> Hediye siparişleri
            <span className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${giftOnly ? 'bg-rose-600 text-white' : 'bg-[#F4F4F5]'}`}>{giftCount}</span>
          </button>
          <span className="ml-auto text-[13px] text-muted">{filtered.length} sipariş</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b border-[#EFEFF1] bg-[#FAFAFA] text-left text-xs text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Sipariş</th>
                <th className="px-5 py-3 font-medium">
                  <button type="button" onClick={() => setSortAsc((s) => !s)} className="inline-flex items-center gap-1 hover:text-ink">
                    Sipariş tarihi <ArrowUpDown className="size-3" />
                    <span className="sr-only">{sortAsc ? 'Eskiden yeniye' : 'Yeniden eskiye'}</span>
                  </button>
                </th>
                <th className="px-5 py-3 font-medium">Müşteri</th>
                <th className="px-5 py-3 font-medium">Ürünler</th>
                <th className="px-5 py-3 font-medium">Durum</th>
                <th className="px-5 py-3 text-right font-medium">Tutar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFF1]">
              {loading && Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-5 animate-pulse rounded bg-[#F4F4F5]" /></td></tr>
              ))}
              {!loading && visible.length === 0 && <tr><td colSpan={6} className="px-5 py-16 text-center text-muted">Bu filtreye uyan sipariş yok.</td></tr>}
              {visible.map((o) => (
                <tr key={o.id} onClick={() => open(o.id)} className={`cursor-pointer transition-colors hover:bg-[#FAFAFA] ${o.id === selectedId ? 'bg-[#FAFAFA]' : ''}`}>
                  <td className="px-5 py-3.5">
                    <p className="flex items-center gap-1.5 font-medium">
                      {o.id}
                      {o.gift?.isGift && (
                        <span title={o.gift.message ? `Hediye notu: ${o.gift.message}` : 'Hediye siparişi'} className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-inset ring-rose-200">
                          <Gift className="size-3" /> Hediye
                        </span>
                      )}
                    </p>
                    {o.couponCode && <p className="text-xs text-accent">{o.couponCode}</p>}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5">
                    <p className="font-medium">{formatDate(o.createdAt)}</p>
                    <p className="text-xs text-muted">{formatTime(o.createdAt)} · {relativeTime(o.createdAt)}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={o.customer.fullName} size="size-8" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{o.customer.fullName}</p>
                        <p className="truncate text-xs text-muted">{o.shippingAddress.city}{o.invoice.type === 'kurumsal' ? ' · Kurumsal' : ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex -space-x-2">
                      {o.items.slice(0, 3).map((it, i) => (
                        <span key={i} className="relative h-9 w-7 overflow-hidden rounded ring-2 ring-white"><Image src={it.image} alt="" fill sizes="28px" className="object-cover" /></span>
                      ))}
                      {o.items.length > 3 && <span className="flex h-9 w-7 items-center justify-center rounded bg-[#F4F4F5] text-[10px] ring-2 ring-white">+{o.items.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-3.5" onClick={(e) => canUpdate && e.stopPropagation()}>
                    {canUpdate ? (
                      <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)} aria-label="Sipariş durumu" className={`cursor-pointer rounded-full border-0 py-1 pl-3 pr-7 text-xs font-medium ring-1 ring-inset outline-none ${SELECT_TONE[o.status]}`}>
                        {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    ) : (
                      <StatusBadge status={o.status} />
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums">{formatTL(o.totals.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#E4E4E7] px-5 py-3 text-[13px] text-muted">
          <span>{filtered.length} siparişten {filtered.length ? page * PAGE_SIZE + 1 : 0}–{Math.min(filtered.length, (page + 1) * PAGE_SIZE)} arası</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={page === 0} onClick={() => setPage((p) => p - 1)} className="rounded-lg border border-[#E4E4E7] p-1.5 disabled:opacity-40" aria-label="Önceki"><ChevronLeft className="size-4" /></button>
            <span className="tabular-nums">{page + 1} / {pages}</span>
            <button type="button" disabled={page >= pages - 1} onClick={() => setPage((p) => p + 1)} className="rounded-lg border border-[#E4E4E7] p-1.5 disabled:opacity-40" aria-label="Sonraki"><ChevronRight className="size-4" /></button>
          </div>
        </div>
      </div>

      <OrderDetailModal
        order={selected}
        onClose={close}
        onStatusChange={changeStatus}
        onPrev={goPrev}
        onNext={goNext}
        position={selectedIndex >= 0 ? `${selectedIndex + 1} / ${filtered.length}` : null}
      />
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersView />
    </Suspense>
  );
}
