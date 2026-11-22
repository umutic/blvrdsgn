'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Building2, CalendarClock, ChevronLeft, ChevronRight, Copy, EyeOff, Gift, Lock, Mail, MapPin, Phone, StickyNote, TicketPercent, User, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { RoleGuard, usePermission } from './RoleGuard';
import { StatusBadge } from './StatusBadge';
import { ORDER_STATUSES } from '@/services/orderService';
import { formatTL, getFrame, getSize } from '@/utils/pricing';
import { relativeTime } from '@/utils/analytics';
import { formatDateTime, formatDuration, formatLongDateTime, formatTime } from '@/utils/date';

const EASE = [0.16, 1, 0.3, 1];

/**
 * Geniş sipariş detay penceresi. onPrev/onNext verilirse ←/→ tuşlarıyla listedeki
 * önceki/sonraki siparişe geçilir.
 */
export function OrderDetailModal({ order, onClose, onStatusChange, onPrev, onNext, position }) {
  const open = Boolean(order);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.target.closest?.('select, input, textarea')) return;
      if (e.key === 'ArrowLeft' && onPrev) onPrev();
      if (e.key === 'ArrowRight' && onNext) onNext();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, onPrev, onNext]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-ink/50 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Sipariş ${order.id}`}
            className="relative flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <OrderDetailBody order={order} onClose={onClose} onStatusChange={onStatusChange} onPrev={onPrev} onNext={onNext} position={position} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function OrderDetailBody({ order, onClose, onStatusChange, onPrev, onNext, position }) {
  const canUpdate = usePermission('UPDATE_ORDER_STATUS');
  const stage = ORDER_STATUSES.indexOf(order.status);
  const next = ORDER_STATUSES[stage + 1];
  const history = order.statusHistory ?? [];
  const historyAt = (s) => history.find((h) => h.status === s)?.at;
  const lastUpdate = history.at(-1)?.at ?? order.createdAt;
  const deliveredAt = historyAt('Teslim Edildi');
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const gift = order.gift?.isGift ? order.gift : null;

  const copyId = () => {
    navigator.clipboard?.writeText(order.id);
    toast.success(`${order.id} kopyalandı`);
  };

  return (
    <>
      {/* Başlık */}
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E4E4E7] px-6 py-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-2xl font-semibold tracking-tight">{order.id}</h2>
            <button type="button" onClick={copyId} aria-label="Sipariş numarasını kopyala" className="rounded-md p-1 text-muted hover:bg-[#F4F4F5] hover:text-ink"><Copy className="size-4" /></button>
            <StatusBadge status={order.status} />
            {gift && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-200">
                <Gift className="size-3" /> Hediye siparişi
              </span>
            )}
          </div>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
            <CalendarClock className="size-4" />
            <span><span className="font-medium text-ink">{formatLongDateTime(order.createdAt)}</span> tarihinde verildi</span>
            <span aria-hidden="true">·</span>
            <span>{relativeTime(order.createdAt)}</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {position && <span className="mr-1 hidden text-xs tabular-nums text-muted sm:inline">{position}</span>}
          <NavBtn label="Önceki sipariş (←)" onClick={onPrev}><ChevronLeft className="size-4" /></NavBtn>
          <NavBtn label="Sonraki sipariş (→)" onClick={onNext}><ChevronRight className="size-4" /></NavBtn>
          <span className="mx-1 h-6 w-px bg-[#E4E4E7]" />
          <NavBtn label="Kapat (Esc)" onClick={onClose}><X className="size-4" /></NavBtn>
        </div>
      </header>

      {/* İçerik */}
      <div className="flex-1 overflow-y-auto" data-lenis-prevent>
        <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="grid gap-6 p-6 text-sm lg:grid-cols-[1.55fr_1fr]">
          <div className="min-w-0 space-y-6">
            {/* Aşamalar */}
            <section className="rounded-xl border border-[#E4E4E7] p-5">
              <ol className="relative grid grid-cols-4">
                <div className="absolute left-[12.5%] right-[12.5%] top-4 h-0.5 bg-[#E4E4E7]">
                  <motion.div className="h-full bg-ink" initial={{ width: 0 }} animate={{ width: `${(stage / (ORDER_STATUSES.length - 1)) * 100}%` }} transition={{ duration: 0.8, ease: EASE }} />
                </div>
                {ORDER_STATUSES.map((s, i) => (
                  <li key={s} className="relative flex flex-col items-center text-center">
                    <span className={`flex size-8 items-center justify-center rounded-full border-2 text-xs font-semibold ${i <= stage ? 'border-ink bg-ink text-white' : 'border-[#E4E4E7] bg-white text-muted'}`}>{i + 1}</span>
                    <span className={`mt-2 text-xs leading-tight ${i <= stage ? 'font-medium text-ink' : 'text-muted'}`}>{s}</span>
                    {historyAt(s) ? (
                      <span className="mt-1 text-[11px] leading-tight text-muted">
                        {new Date(historyAt(s)).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}<br />{formatTime(historyAt(s))}
                      </span>
                    ) : (
                      <span className="mt-1 text-[11px] text-muted/60">Bekliyor</span>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            {/* Ürünler */}
            <section>
              <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Ürünler · {itemCount} adet</h3>
              <ul className="divide-y divide-[#EFEFF1] rounded-xl border border-[#E4E4E7]">
                {order.items.map((i, idx) => (
                  <li key={idx} className="flex items-center gap-4 p-4">
                    <div className="relative h-24 w-[72px] shrink-0 overflow-hidden rounded-lg bg-surface shadow-sm"><Image src={i.image} alt="" fill sizes="72px" className="object-cover" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-medium">{i.title}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                        <Chip>{getSize(i.sizeId).label}</Chip>
                        <Chip>{getFrame(i.frameId).name}</Chip>
                        {i.mat && <Chip>Paspartu</Chip>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold tabular-nums">{formatTL(i.unitPrice * i.quantity)}</p>
                      <p className="text-xs text-muted">{i.quantity} × {formatTL(i.unitPrice)}</p>
                    </div>
                  </li>
                ))}
              </ul>
              <dl className="mt-3 space-y-1.5 rounded-xl bg-[#F6F6F7] p-4">
                <Row label="Ara toplam" value={formatTL(order.totals.subtotal)} />
                {order.totals.discount > 0 && <Row label={`İndirim · ${order.couponCode}`} value={`−${formatTL(order.totals.discount)}`} />}
                <Row label="Kargo" value={order.totals.shipping ? formatTL(order.totals.shipping) : 'Ücretsiz'} />
                {gift && <Row label="Hediye paketi" value="Ücretsiz" />}
                <div className="flex justify-between border-t border-[#E4E4E7] pt-2 text-base font-semibold"><dt>Toplam</dt><dd className="tabular-nums">{formatTL(order.totals.total)}</dd></div>
              </dl>
            </section>

            {/* Hediye */}
            {gift && (
              <section className="overflow-hidden rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-100 px-5 py-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-700"><Gift className="size-4" /> Hediye paketi</p>
                  {gift.hidePrices && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-rose-700 ring-1 ring-rose-200">
                      <EyeOff className="size-3" /> Pakete fiyat ve fatura koyulmayacak
                    </span>
                  )}
                </div>
                <div className="p-5">
                  {gift.message ? (
                    <figure className="relative mx-auto max-w-md rotate-[-0.6deg] rounded-sm bg-white px-7 py-6 shadow-[0_12px_30px_-14px_rgba(18,18,20,.35)] ring-1 ring-[#EFEFF1]">
                      <span aria-hidden="true" className="absolute -top-4 left-5 font-display text-5xl leading-none text-rose-300">“</span>
                      {gift.recipientName && <p className="mb-2 text-xs uppercase tracking-[0.18em] text-muted">Sevgili {gift.recipientName},</p>}
                      <blockquote className="whitespace-pre-line font-display text-xl leading-snug text-ink">{gift.message}</blockquote>
                      <figcaption className="mt-3 text-right text-xs text-muted">— {order.customer.fullName}</figcaption>
                    </figure>
                  ) : (
                    <p className="text-muted">
                      Müşteri hediye notu eklemedi.{gift.recipientName && <> Alıcı: <span className="font-medium text-ink">{gift.recipientName}</span></>}
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Sağ sütun */}
          <div className="min-w-0 space-y-4">
            <InfoCard icon={CalendarClock} title="Sipariş bilgileri">
              <dl className="space-y-1.5">
                <KV label="Sipariş tarihi" value={formatDateTime(order.createdAt)} />
                <KV label="Son güncelleme" value={formatDateTime(lastUpdate)} />
                {deliveredAt ? <KV label="Teslim süresi" value={formatDuration(order.createdAt, deliveredAt)} /> : <KV label="Geçen süre" value={formatDuration(order.createdAt, new Date().toISOString())} />}
                <KV label="Ürün adedi" value={`${itemCount} adet · ${order.items.length} kalem`} />
                {order.couponCode && <KV label="Kupon" value={<span className="inline-flex items-center gap-1 font-mono text-accent"><TicketPercent className="size-3.5" />{order.couponCode}</span>} />}
              </dl>
            </InfoCard>

            <InfoCard icon={User} title="Müşteri">
              <p className="font-medium">{order.customer.fullName}</p>
              <a href={`mailto:${order.customer.email}`} className="flex items-center gap-1.5 text-muted hover:text-ink"><Mail className="size-3.5" />{order.customer.email}</a>
              <a href={`tel:${order.customer.phone}`} className="flex items-center gap-1.5 text-muted hover:text-ink"><Phone className="size-3.5" />{order.customer.phone}</a>
            </InfoCard>

            <InfoCard icon={MapPin} title={gift ? 'Teslimat · Hediye alıcısı' : 'Teslimat'}>
              {gift?.recipientName && <p className="font-medium">{gift.recipientName}</p>}
              <p>{order.shippingAddress.address}</p>
              <p className="text-muted">{order.shippingAddress.district} / {order.shippingAddress.city}</p>
            </InfoCard>

            <RoleGuard
              permission="VIEW_CUSTOMER_INVOICES"
              fallback={
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#D4D4D8] p-4 text-muted">
                  <Lock className="size-4 shrink-0" /> Fatura bilgilerini görüntüleme yetkiniz yok.
                </div>
              }
            >
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

            <InfoCard icon={CalendarClock} title="Durum geçmişi">
              <ol className="relative mt-1 space-y-3 border-l border-[#E4E4E7] pl-4">
                {[...history].reverse().map((h, i) => (
                  <li key={`${h.status}-${h.at}`} className="relative">
                    <span className={`absolute -left-[21px] top-1 size-2.5 rounded-full ring-4 ring-white ${i === 0 ? 'bg-ink' : 'bg-[#D4D4D8]'}`} />
                    <p className={i === 0 ? 'font-medium' : ''}>{h.status}</p>
                    <p className="text-xs text-muted">{formatDateTime(h.at)}</p>
                  </li>
                ))}
              </ol>
            </InfoCard>
          </div>
        </motion.div>
      </div>

      {/* Alt bar */}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4E7] bg-[#FAFAFA] px-6 py-4">
        {canUpdate ? (
          <>
            <label className="flex items-center gap-2 text-sm text-muted">
              Durum
              <select
                value={order.status}
                onChange={(e) => onStatusChange(order.id, e.target.value)}
                className="h-10 rounded-xl border border-[#E4E4E7] bg-white px-3 text-sm font-medium text-ink outline-none focus:border-ink/40"
              >
                {ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            {next ? (
              <button type="button" onClick={() => onStatusChange(order.id, next)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-white transition hover:bg-ink/85">
                “{next}” olarak işaretle <ArrowRight className="size-4" />
              </button>
            ) : (
              <span className="text-sm font-medium text-emerald-700">Sipariş tamamlandı</span>
            )}
          </>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted"><Lock className="size-4" /> Sipariş durumunu değiştirme yetkiniz yok.</p>
        )}
      </footer>
    </>
  );
}

function NavBtn({ label, onClick, children }) {
  return (
    <button type="button" onClick={onClick} disabled={!onClick} aria-label={label} title={label} className="rounded-lg border border-[#E4E4E7] p-2 text-muted transition hover:bg-[#F4F4F5] hover:text-ink disabled:opacity-35">
      {children}
    </button>
  );
}

function Chip({ children }) {
  return <span className="rounded-md bg-[#F4F4F5] px-2 py-0.5 text-muted">{children}</span>;
}

function Row({ label, value }) {
  return <div className="flex justify-between text-muted"><dt>{label}</dt><dd className="tabular-nums text-ink">{value}</dd></div>;
}

function KV({ label, value }) {
  return <div className="flex justify-between gap-3"><dt className="text-muted">{label}</dt><dd className="text-right font-medium">{value}</dd></div>;
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-xl border border-[#E4E4E7] p-4">
      <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted"><Icon className="size-3.5" /> {title}</p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
