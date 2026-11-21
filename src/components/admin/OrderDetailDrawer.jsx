'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, MapPin, StickyNote, User } from 'lucide-react';
import { Drawer } from '@/components/ui/Drawer';
import { RoleGuard } from './RoleGuard';
import { StatusBadge } from './StatusBadge';
import { ORDER_STATUSES } from '@/services/orderService';
import { formatTL, getFrame, getSize } from '@/utils/pricing';

export function OrderDetailDrawer({ order, onClose, onAdvance }) {
  const stage = order ? ORDER_STATUSES.indexOf(order.status) : -1;
  const next = ORDER_STATUSES[stage + 1];
  const historyAt = (s) => order?.statusHistory?.find((h) => h.status === s)?.at;

  return (
    <Drawer
      open={Boolean(order)}
      onClose={onClose}
      width="max-w-xl"
      title={order ? order.id : ''}
      headerExtra={order && <p className="mt-1 text-xs text-muted">{new Date(order.createdAt).toLocaleString('tr-TR')}</p>}
      footer={
        order && (
          <div className="flex items-center justify-between gap-3">
            <StatusBadge status={order.status} />
            {next ? (
              <button type="button" onClick={() => onAdvance(order.id, next)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-white transition hover:bg-ink/85">
                “{next}” olarak işaretle <ArrowRight className="size-4" />
              </button>
            ) : (
              <span className="text-sm text-muted">Sipariş tamamlandı</span>
            )}
          </div>
        )
      }
    >
      {order && (
        <div className="space-y-7 text-sm">
          {/* Zaman çizelgesi */}
          <ol className="relative grid grid-cols-4">
            <div className="absolute left-[12.5%] right-[12.5%] top-3.5 h-0.5 bg-[#E4E4E7]">
              <motion.div className="h-full bg-ink" initial={{ width: 0 }} animate={{ width: `${(stage / (ORDER_STATUSES.length - 1)) * 100}%` }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
            </div>
            {ORDER_STATUSES.map((s, i) => (
              <li key={s} className="relative flex flex-col items-center text-center">
                <span className={`flex size-7 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${i <= stage ? 'border-ink bg-ink text-white' : 'border-[#E4E4E7] bg-white text-muted'}`}>{i + 1}</span>
                <span className={`mt-2 text-[11px] leading-tight ${i <= stage ? 'font-medium text-ink' : 'text-muted'}`}>{s}</span>
                {historyAt(s) && <span className="mt-0.5 text-[10px] text-muted">{new Date(historyAt(s)).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>}
              </li>
            ))}
          </ol>

          <section>
            <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Ürünler · {order.items.reduce((n, i) => n + i.quantity, 0)}</h3>
            <ul className="divide-y divide-[#EFEFF1] rounded-xl border border-[#E4E4E7]">
              {order.items.map((i, idx) => (
                <li key={idx} className="flex items-center gap-3 p-3">
                  <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-surface"><Image src={i.image} alt="" fill sizes="44px" className="object-cover" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{i.title}</p>
                    <p className="text-xs text-muted">{getSize(i.sizeId).label} · {getFrame(i.frameId).name}{i.mat ? ' · Paspartu' : ''}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium tabular-nums">{formatTL(i.unitPrice * i.quantity)}</p>
                    <p className="text-xs text-muted">{i.quantity} × {formatTL(i.unitPrice)}</p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 rounded-xl bg-[#F6F6F7] p-4">
              <Row label="Ara toplam" value={formatTL(order.totals.subtotal)} />
              {order.totals.discount > 0 && <Row label={`İndirim · ${order.couponCode}`} value={`−${formatTL(order.totals.discount)}`} />}
              <Row label="Kargo" value={order.totals.shipping ? formatTL(order.totals.shipping) : 'Ücretsiz'} />
              <div className="flex justify-between border-t border-[#E4E4E7] pt-2 text-base font-semibold"><dt>Toplam</dt><dd className="tabular-nums">{formatTL(order.totals.total)}</dd></div>
            </dl>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard icon={User} title="Müşteri">
              <p className="font-medium">{order.customer.fullName}</p>
              <p className="text-muted">{order.customer.email}</p>
              <p className="text-muted">{order.customer.phone}</p>
            </InfoCard>
            <InfoCard icon={MapPin} title="Teslimat">
              <p>{order.shippingAddress.address}</p>
              <p className="text-muted">{order.shippingAddress.district} / {order.shippingAddress.city}</p>
            </InfoCard>
            <RoleGuard permission="VIEW_CUSTOMER_INVOICES">
              <InfoCard icon={Building2} title={`Fatura · ${order.invoice.type === 'kurumsal' ? 'Kurumsal' : 'Bireysel'}`}>
                {order.invoice.type === 'kurumsal' ? (
                  <>
                    <p className="font-medium">{order.invoice.companyName}</p>
                    <p className="text-muted">{order.invoice.taxOffice} V.D. · {order.invoice.taxNo}</p>
                  </>
                ) : (
                  <p>{order.customer.fullName}{order.invoice.tcNo ? ` · TC ${order.invoice.tcNo}` : ''}</p>
                )}
              </InfoCard>
            </RoleGuard>
            {order.note && (
              <InfoCard icon={StickyNote} title="Müşteri notu">
                <p>{order.note}</p>
              </InfoCard>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between text-muted"><dt>{label}</dt><dd className="tabular-nums text-ink">{value}</dd></div>;
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-[#E4E4E7] p-4">
      <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted"><Icon className="size-3.5" /> {title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
