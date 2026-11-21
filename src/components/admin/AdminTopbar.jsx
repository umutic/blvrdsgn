'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, ChevronDown, LogOut, Search, Store } from 'lucide-react';
import { Avatar } from './Avatar';
import { StatusBadge } from './StatusBadge';
import { ROLE_LABELS, hasPermission } from '@/config/permissions';
import { relativeTime } from '@/utils/analytics';
import { formatTL } from '@/utils/pricing';

/** Üst bar: global arama (sipariş/ürün), bildirimler (son siparişler) ve kullanıcı menüsü. */
export function AdminTopbar({ session, onLogout, orders = [], products = [] }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [openPanel, setOpenPanel] = useState(null); // 'search' | 'bell' | 'user'
  const inputRef = useRef(null);
  const canOrders = hasPermission(session.role, 'MANAGE_ORDERS');
  const canProducts = hasPermission(session.role, 'MANAGE_PRODUCTS');

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') setOpenPanel(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const q = query.trim().toLocaleLowerCase('tr');
  const orderHits = canOrders && q ? orders.filter((o) => `${o.id} ${o.customer.fullName}`.toLocaleLowerCase('tr').includes(q)).slice(0, 4) : [];
  const productHits = canProducts && q ? products.filter((p) => p.title.toLocaleLowerCase('tr').includes(q)).slice(0, 4) : [];
  const fresh = orders.filter((o) => o.status === 'Hazırlanıyor').slice(0, 5);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[#E4E4E7] bg-white/85 px-6 backdrop-blur-xl lg:px-8">
      <div className="relative w-full max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpenPanel('search')}
          onBlur={() => setTimeout(() => setOpenPanel((p) => (p === 'search' ? null : p)), 150)}
          placeholder={canOrders ? 'Sipariş no, müşteri veya ürün ara…' : 'Ürün ara…'}
          className="h-10 w-full rounded-xl border border-[#E4E4E7] bg-[#F6F6F7] pl-9 pr-14 text-sm outline-none transition focus:border-ink/30 focus:bg-white"
        />
        <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded border border-[#E4E4E7] bg-white px-1.5 py-0.5 text-[10px] text-muted">⌘K</kbd>
        <Dropdown open={openPanel === 'search' && q.length > 0} className="left-0 right-0">
          {orderHits.length + productHits.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted">Sonuç yok</p>
          ) : (
            <>
              {orderHits.length > 0 && <p className="px-4 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted">Siparişler</p>}
              {orderHits.map((o) => (
                <button key={o.id} type="button" onMouseDown={() => router.push(`/admin/siparisler?no=${o.id}`)} className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-[#F6F6F7]">
                  <span><span className="font-medium">{o.id}</span> <span className="text-muted">· {o.customer.fullName}</span></span>
                  <span className="text-muted">{formatTL(o.totals.total)}</span>
                </button>
              ))}
              {productHits.length > 0 && <p className="px-4 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted">Ürünler</p>}
              {productHits.map((p) => (
                <button key={p.id} type="button" onMouseDown={() => router.push(`/admin/urunler?q=${encodeURIComponent(p.title)}`)} className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-[#F6F6F7]">
                  <span className="size-8 shrink-0 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${p.image})` }} />
                  {p.title}
                </button>
              ))}
              <div className="h-2" />
            </>
          )}
        </Dropdown>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Link href="/" target="_blank" className="hidden items-center gap-2 rounded-xl border border-[#E4E4E7] px-3 py-2 text-sm font-medium transition hover:bg-[#F6F6F7] md:flex">
          <Store className="size-4" /> Mağaza
        </Link>

        {canOrders && (
          <div className="relative">
            <button type="button" onClick={() => setOpenPanel((p) => (p === 'bell' ? null : 'bell'))} aria-label="Bildirimler" className="relative rounded-xl p-2.5 transition hover:bg-[#F4F4F5]">
              <Bell className="size-[18px]" />
              {fresh.length > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-accent ring-2 ring-white" />}
            </button>
            <Dropdown open={openPanel === 'bell'} className="right-0 w-80">
              <div className="flex items-center justify-between border-b border-[#EFEFF1] px-4 py-3">
                <p className="text-sm font-semibold">Yeni siparişler</p>
                <span className="text-xs text-muted">{fresh.length} bekliyor</span>
              </div>
              {fresh.length === 0 && <p className="px-4 py-6 text-center text-sm text-muted">Bekleyen sipariş yok</p>}
              {fresh.map((o) => (
                <Link key={o.id} href={`/admin/siparisler?no=${o.id}`} onClick={() => setOpenPanel(null)} className="flex items-center gap-3 px-4 py-3 hover:bg-[#F6F6F7]">
                  <Avatar name={o.customer.fullName} size="size-8" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="truncate"><span className="font-medium">{o.customer.fullName}</span> sipariş verdi</p>
                    <p className="text-xs text-muted">{o.id} · {formatTL(o.totals.total)} · {relativeTime(o.createdAt)}</p>
                  </div>
                </Link>
              ))}
            </Dropdown>
          </div>
        )}

        <div className="relative">
          <button type="button" onClick={() => setOpenPanel((p) => (p === 'user' ? null : 'user'))} className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2.5 transition hover:bg-[#F4F4F5]">
            <Avatar name={session.name} size="size-8" />
            <span className="hidden text-left md:block">
              <span className="block text-sm font-medium leading-tight">{session.name}</span>
              <span className="block text-[11px] text-muted">{ROLE_LABELS[session.role]}</span>
            </span>
            <ChevronDown className="size-4 text-muted" />
          </button>
          <Dropdown open={openPanel === 'user'} className="right-0 w-56">
            <div className="border-b border-[#EFEFF1] px-4 py-3">
              <p className="text-sm font-medium">{session.name}</p>
              <p className="truncate text-xs text-muted">{session.email}</p>
            </div>
            <button type="button" onClick={onLogout} className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-700 hover:bg-red-50">
              <LogOut className="size-4" /> Çıkış yap
            </button>
          </Dropdown>
        </div>
      </div>
    </header>
  );
}

function Dropdown({ open, className = '', children }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.16 }}
          className={`absolute top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-[#E4E4E7] bg-white shadow-xl ${className}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { StatusBadge };
