'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { ExternalLink, Images, LayoutDashboard, LogOut, ShieldCheck, ShoppingBag, TicketPercent, Sparkles } from 'lucide-react';
import { getAllowedRoutes, ROLE_LABELS } from '@/config/permissions';
import { Avatar } from './Avatar';

const ICONS = { dashboard: LayoutDashboard, orders: ShoppingBag, products: Images, coupons: TicketPercent, users: ShieldCheck };

export function AdminSidebar({ session, onLogout, badges = {} }) {
  const pathname = usePathname();
  const routes = getAllowedRoutes(session.role); // Yetkisiz menü öğeleri hiç render edilmez.

  return (
    <aside className="sticky top-0 hidden h-screen w-[260px] shrink-0 flex-col border-r border-[#E4E4E7] bg-white lg:flex">
      <div className="flex h-16 items-center gap-3 border-b border-[#E4E4E7] px-6">
        <span className="flex size-8 items-center justify-center rounded-lg bg-ink font-display text-lg font-semibold text-canvas">B</span>
        <div>
          <p className="font-display text-lg font-semibold leading-none tracking-[0.14em]">BLVRDSGN</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-muted">Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted/70">Yönetim</p>
        <ul className="space-y-0.5">
          {routes.map((r) => {
            const Icon = ICONS[r.icon];
            const active = r.href === '/admin' ? pathname === '/admin' : pathname.startsWith(r.href);
            return (
              <li key={r.href}>
                <Link href={r.href} className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'text-white' : 'text-muted hover:bg-[#F4F4F5] hover:text-ink'}`}>
                  {active && <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-lg bg-ink" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                  <Icon className="relative size-[18px]" strokeWidth={1.75} />
                  <span className="relative flex-1">{r.label}</span>
                  {badges[r.icon] != null && (
                    <span className={`relative rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums ${active ? 'bg-white/15 text-white' : 'bg-[#F4F4F5] text-ink'}`}>{badges[r.icon]}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mb-2 mt-8 px-3 text-[11px] font-medium uppercase tracking-wider text-muted/70">Mağaza</p>
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-[#F4F4F5] hover:text-ink">
          <ExternalLink className="size-[18px]" strokeWidth={1.75} /> Mağazayı görüntüle
        </Link>

        <div className="mx-1 mt-8 overflow-hidden rounded-xl bg-night p-4 text-canvas">
          <Sparkles className="size-5 text-accent-light" />
          <p className="mt-3 text-sm font-semibold">Supabase’e hazır</p>
          <p className="mt-1 text-xs leading-relaxed text-canvas/60">Veriler şu an tarayıcıda. Canlıya geçişte yalnızca servis katmanı değişir.</p>
        </div>
      </nav>

      <div className="border-t border-[#E4E4E7] p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <Avatar name={session.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{session.name}</p>
            <p className="truncate text-xs text-muted">{ROLE_LABELS[session.role]}</p>
          </div>
          <button type="button" onClick={onLogout} aria-label="Çıkış yap" title="Çıkış yap" className="rounded-md p-2 text-muted transition hover:bg-[#F4F4F5] hover:text-ink">
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
