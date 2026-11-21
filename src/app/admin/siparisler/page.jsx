'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { OrderDetailDrawer } from '@/components/admin/OrderDetailDrawer';
import { Avatar } from '@/components/admin/Avatar';
import { PageHeader, btn, input } from '@/components/admin/PageHeader';
import { orderService, ORDER_STATUSES } from '@/services/orderService';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { downloadCsv, relativeTime } from '@/utils/analytics';
import { formatTL } from '@/utils/pricing';

const PAGE_SIZE = 12;
const SELECT_TONE = {
  'Hazırlanıyor': 'bg-zinc-100 text-zinc-700 ring-zinc-300',
  'Baskı Aşamasında': 'bg-sky-50 text-sky-800 ring-sky-200',
  'Kargoya Verildi': 'bg-indigo-50 text-indigo-800 ring-indigo-200',
  'Teslim Edildi': 'bg-emerald-50 text-emerald-800 ring-emerald-200',
};

function OrdersView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: orders, loading } = useServiceQuery(orderService.getAllOrders, orderService.subscribe);
  const [tab, setTab] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const selectedId = searchParams.get('no');
  const selected = orders?.find((o) => o.id === selectedId) ?? null;

  useEffect(() => setPage(0), [tab, query]);

  const counts = useMemo(() => Object.fromEntries(ORDER_STATUSES.map((s) => [s, (orders ?? []).filter((o) => o.status === s).length])), [orders]);
  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    return (orders ?? []).filter((o) => (!tab || o.status === tab) && (!q || `${o.id} ${o.customer.fullName} ${o.customer.email}`.toLocaleLowerCase('tr').includes(q)));
  }, [orders, tab, query]);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const open = (id) => router.replace(id ? `/admin/siparisler?no=${id}` : '/admin/siparisler', { scroll: false });

  const changeStatus = async (id, status) => {
    try {
      await orderService.updateOrderStatus(id, status);
      toast.success(`${id} · ${status}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const exportCsv = () =>
    downloadCsv('blvrdsgn-siparisler.csv', [
      ['Sipariş', 'Tarih', 'Müşteri', 'E-posta', 'Şehir', 'Durum', 'Kupon', 'Toplam'],
      ...filtered.map((o) => [o.id, o.createdAt.slice(0, 10), o.customer.fullName, o.customer.email, o.shippingAddress.city, o.status, o.couponCode ?? '', o.totals.total]),
    ]);

  const tabs = [{ value: '', label: 'Tümü', count: orders?.length ?? 0 }, ...ORDER_STATUSES.map((s) => ({ value: s, label: s, count: counts[s] }))];

  return (
    <div>
      <PageHeader
        title="Siparişler"
        description="Vitrinden gelen siparişleri takip edin, aşamalarını güncelleyin."
        actions={<button type="button" onClick={exportCsv} className={btn.secondary}><Download className="size-4" /> Dışa aktar</button>}
      />

      <div className="rounded-2xl border border-[#E4E4E7] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E4E4E7] px-4">
          <div className="no-scrollbar flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.label} type="button" onClick={() => setTab(t.value)} className={`relative flex items-center gap-2 whitespace-nowrap px-3 py-4 text-[13px] font-medium transition-colors ${tab === t.value ? 'text-ink' : 'text-muted hover:text-ink'}`}>
                {t.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${tab === t.value ? 'bg-ink text-white' : 'bg-[#F4F4F5]'}`}>{t.count}</span>
                {tab === t.value && <motion.span layoutId="orders-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ink" />}
              </button>
            ))}
          </div>
          <div className="relative w-full py-3 sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Sipariş no veya müşteri" className={`${input} pl-9`} />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#EFEFF1] bg-[#FAFAFA] text-left text-xs text-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Sipariş</th>
                <th className="px-5 py-3 font-medium">Müşteri</th>
                <th className="px-5 py-3 font-medium">Ürünler</th>
                <th className="px-5 py-3 font-medium">Tarih</th>
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
                <tr key={o.id} onClick={() => open(o.id)} className="cursor-pointer transition-colors hover:bg-[#FAFAFA]">
                  <td className="px-5 py-3.5">
                    <p className="font-medium">{o.id}</p>
                    {o.couponCode && <p className="text-xs text-accent">{o.couponCode}</p>}
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
                  <td className="whitespace-nowrap px-5 py-3.5 text-muted">{relativeTime(o.createdAt)}</td>
                  <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                    <select value={o.status} onChange={(e) => changeStatus(o.id, e.target.value)} aria-label="Sipariş durumu" className={`cursor-pointer rounded-full border-0 py-1 pl-3 pr-7 text-xs font-medium ring-1 ring-inset outline-none ${SELECT_TONE[o.status]}`}>
                      {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
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

      <OrderDetailDrawer order={selected} onClose={() => open(null)} onAdvance={changeStatus} />
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
