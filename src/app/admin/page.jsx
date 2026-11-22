'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Download, Images, Layers, ShoppingCart, Sparkles, Tag, Users, Wallet } from 'lucide-react';
import { KpiCard } from '@/components/admin/KpiCard';
import { ChartCard } from '@/components/admin/charts/ChartCard';
import { RevenueChart } from '@/components/admin/charts/RevenueChart';
import { CategoryChart } from '@/components/admin/charts/CategoryChart';
import { StatusBreakdown } from '@/components/admin/charts/StatusBreakdown';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { Avatar } from '@/components/admin/Avatar';
import { PageHeader, Segmented, btn } from '@/components/admin/PageHeader';
import { usePermission } from '@/components/admin/RoleGuard';
import { orderService, ORDER_STATUSES } from '@/services/orderService';
import { productService } from '@/services/productService';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { useAuthStore } from '@/store/useAuthStore';
import { CATEGORIES, getCategory } from '@/data/categories';
import { buildDashboard, bucket, downloadCsv, formatCompactTL, relativeTime } from '@/utils/analytics';
import { formatTL } from '@/utils/pricing';

const RANGES = [
  { value: 7, label: '7 gün' },
  { value: 30, label: '30 gün' },
  { value: 60, label: '60 gün' },
];

const noOrders = async () => [];

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Günaydın' : h < 18 ? 'İyi günler' : 'İyi akşamlar';
}

export default function AdminDashboardPage() {
  const session = useAuthStore((s) => s.session);
  const canAnalytics = usePermission('VIEW_ANALYTICS');
  const canOrders = usePermission('VIEW_ORDERS');
  const [range, setRange] = useState(30);

  const { data: orders } = useServiceQuery(canAnalytics || canOrders ? orderService.getAllOrders : noOrders, orderService.subscribe, [canAnalytics, canOrders]);
  const { data: products } = useServiceQuery(productService.getAllProducts, productService.subscribe);
  const d = useMemo(() => buildDashboard(orders ?? [], products ?? [], range), [orders, products, range]);
  const statusCounts = useMemo(() => Object.fromEntries(ORDER_STATUSES.map((s) => [s, (orders ?? []).filter((o) => o.status === s).length])), [orders]);
  const period = `önceki ${range} güne göre`;

  const exportCsv = () =>
    downloadCsv(`blvrdsgn-ciro-${range}g.csv`, [['Tarih', 'Ciro (TL)', 'Sipariş'], ...d.daily.map((x) => [x.date.slice(0, 10), x.revenue, x.orders])]);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${greeting()}, ${session?.name?.split(' ')[0]} 👋`}
        description={new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) + (canAnalytics ? ' · Mağazanızın performans özeti' : ' · Katalog özeti')}
        actions={
          canAnalytics && (
            <>
              <Segmented options={RANGES} value={range} onChange={setRange} />
              <button type="button" onClick={exportCsv} className={btn.secondary}>
                <Download className="size-4" /> CSV
              </button>
            </>
          )
        }
      />

      {canAnalytics ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard index={0} icon={Wallet} label="Toplam ciro" value={formatTL(d.revenue.value)} delta={d.revenue.delta} periodLabel={period} trend={bucket(d.daily.map((x) => x.revenue))} />
          <KpiCard index={1} icon={ShoppingCart} label="Sipariş" value={d.orders.value} delta={d.orders.delta} periodLabel={period} trend={bucket(d.daily.map((x) => x.orders))} />
          <KpiCard index={2} icon={Tag} label="Ortalama sepet" value={formatTL(d.aov.value)} delta={d.aov.delta} periodLabel={period} trend={bucket(d.daily.map((x) => x.aov)).map((v, i, a) => v / Math.max(1, Math.ceil(d.daily.length / a.length)))} />
          <KpiCard index={3} icon={Users} label="Müşteri" value={d.customers.value} delta={d.customers.delta} periodLabel={period} trend={bucket(d.daily.map((x) => x.customers))} />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard index={0} icon={Images} label="Toplam poster" value={products?.length ?? '—'} />
          <KpiCard index={1} icon={Sparkles} label="Yeni etiketli" value={(products ?? []).filter((p) => p.isNew).length} />
          <KpiCard index={2} icon={Layers} label="Kategori" value={CATEGORIES.length} />
          <KpiCard index={3} icon={Tag} label="Ortalama taban fiyat" value={formatTL((products ?? []).reduce((n, p) => n + p.basePrice, 0) / Math.max(1, products?.length ?? 1))} />
        </div>
      )}

      {canAnalytics && (
        <div className="grid gap-6 xl:grid-cols-3">
          <ChartCard
            className="xl:col-span-2"
            title="Günlük ciro"
            subtitle={`Son ${range} gün · toplam ${formatTL(d.revenue.value)}`}
            table={{ columns: ['Tarih', 'Ciro', 'Sipariş'], rows: d.daily.map((x) => [x.label, formatTL(x.revenue), x.orders]) }}
          >
            <RevenueChart data={d.daily} />
          </ChartCard>
          <ChartCard
            title="Sipariş aşamaları"
            subtitle={`${(orders ?? []).filter((o) => o.status !== 'Teslim Edildi').length} aktif sipariş`}
            actions={canOrders && <Link href="/admin/siparisler" className="text-[13px] font-medium text-muted hover:text-ink">Yönet</Link>}
          >
            <StatusBreakdown statuses={ORDER_STATUSES} counts={statusCounts} />
            <div className="mt-6 rounded-xl bg-[#F6F6F7] p-4">
              <p className="text-xs text-muted">Bugün hazırlanması gereken</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{statusCounts['Hazırlanıyor']}</p>
            </div>
          </ChartCard>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title={canAnalytics ? 'Kategoriye göre ciro' : 'Kategoriye göre poster sayısı'}
          subtitle={canAnalytics ? `Son ${range} gün` : 'Katalog dağılımı'}
          table={{
            columns: ['Kategori', canAnalytics ? 'Ciro' : 'Poster'],
            rows: d.categoryRevenue.map((c) => [c.name, canAnalytics ? formatTL(c.revenue) : c.count]),
          }}
        >
          <CategoryChart data={d.categoryRevenue} valueKey={canAnalytics ? 'revenue' : 'count'} format={canAnalytics ? formatCompactTL : (v) => `${v}`} />
        </ChartCard>

        {canAnalytics ? (
          <ChartCard title="En çok kazandıranlar" subtitle={`Son ${range} gün · ilk 5`}>
            <ul className="divide-y divide-[#EFEFF1]">
              {d.topProducts.map((p, i) => {
                const max = d.topProducts[0]?.revenue || 1;
                return (
                  <li key={p.productId} className="flex items-center gap-4 py-3">
                    <span className="w-4 text-xs font-medium tabular-nums text-muted">{i + 1}</span>
                    <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-surface">
                      <Image src={p.image} alt="" fill sizes="44px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-[#EFEFF1]">
                          <div className="h-full rounded-full bg-accent" style={{ width: `${(p.revenue / max) * 100}%` }} />
                        </div>
                        <span className="w-14 text-right text-xs text-muted">{p.units} adet</span>
                      </div>
                    </div>
                    <span className="w-20 text-right text-sm font-medium tabular-nums">{formatCompactTL(p.revenue)}</span>
                  </li>
                );
              })}
            </ul>
          </ChartCard>
        ) : (
          <ChartCard title="Son eklenen posterler" actions={<Link href="/admin/urunler" className="text-[13px] font-medium text-muted hover:text-ink">Tümü</Link>}>
            <ul className="divide-y divide-[#EFEFF1]">
              {[...(products ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-3">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-surface"><Image src={p.image} alt="" fill sizes="44px" className="object-cover" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.title}</p>
                    <p className="text-xs text-muted">{getCategory(p.category)?.name}</p>
                  </div>
                  <span className="text-sm tabular-nums">{formatTL(p.basePrice)}</span>
                </li>
              ))}
            </ul>
          </ChartCard>
        )}
      </div>

      {canOrders && (
        <ChartCard title="Son siparişler" actions={<Link href="/admin/siparisler" className="inline-flex items-center gap-1 text-[13px] font-medium text-muted hover:text-ink">Tümünü gör <ArrowRight className="size-3.5" /></Link>}>
          <div className="-mx-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-y border-[#EFEFF1] bg-[#FAFAFA] text-left text-xs text-muted">
                <tr><th className="px-6 py-2.5 font-medium">Sipariş</th><th className="px-6 py-2.5 font-medium">Müşteri</th><th className="px-6 py-2.5 font-medium">Tarih</th><th className="px-6 py-2.5 font-medium">Durum</th><th className="px-6 py-2.5 text-right font-medium">Tutar</th></tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFF1]">
                {(orders ?? []).slice(0, 6).map((o) => (
                  <tr key={o.id} className="transition-colors hover:bg-[#FAFAFA]">
                    <td className="px-6 py-3"><Link href={`/admin/siparisler?no=${o.id}`} className="font-medium hover:text-accent">{o.id}</Link></td>
                    <td className="px-6 py-3"><span className="flex items-center gap-2.5"><Avatar name={o.customer.fullName} size="size-7" />{o.customer.fullName}</span></td>
                    <td className="px-6 py-3 text-muted">{relativeTime(o.createdAt)}</td>
                    <td className="px-6 py-3"><StatusBadge status={o.status} /></td>
                    <td className="px-6 py-3 text-right font-medium tabular-nums">{formatTL(o.totals.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
