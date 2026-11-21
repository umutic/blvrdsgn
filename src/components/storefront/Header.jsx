'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, useMotionValueEvent, useScroll, AnimatePresence } from 'framer-motion';
import { Heart, Search, ShoppingBag, Menu, X } from 'lucide-react';
import { MegaMenu } from './MegaMenu';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useUiStore } from '@/store/useUiStore';
import { useHasMounted } from '@/hooks/useHasMounted';
import { CATEGORIES } from '@/data/categories';
import { FREE_SHIPPING_THRESHOLD, formatTL } from '@/utils/pricing';
import { Marquee } from '@/components/motion/Marquee';

function CountBadge({ value }) {
  return (
    <AnimatePresence>
      {value > 0 && (
        <motion.span
          key={value}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-white"
        >
          {value}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

const ANNOUNCEMENTS = [
  `${formatTL(FREE_SHIPPING_THRESHOLD)} üzeri ücretsiz kargo`,
  'İlk siparişe özel HOSGELDIN15 ile %15 indirim',
  'Müze kalitesinde arşiv baskı',
  'El yapımı masif ahşap çerçeveler',
  '14 gün koşulsuz iade',
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const mounted = useHasMounted();
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.quantity, 0));
  const wishCount = useWishlistStore((s) => s.ids.length);
  const openCart = useCartStore((s) => s.openCart);
  const openSearch = useUiStore((s) => s.openSearch);

  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    setHidden(y > 400 && y > prev && !menuOpen);
  });

  const solid = !isHome || scrolled || menuOpen || mobileOpen;
  const tone = 'text-ink'; // Karşılama aydınlık: başlık her zaman koyu metinli

  return (
    <motion.header
      className="fixed inset-x-0 top-0 z-40"
      animate={{ y: hidden ? '-100%' : '0%' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Duyuru bandı */}
      <motion.div
        className="overflow-hidden border-b border-line bg-accent-soft text-ink"
        animate={{ height: scrolled ? 0 : 36 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Marquee duration={45} className="h-9 text-xs font-medium uppercase tracking-[0.16em]">
          {ANNOUNCEMENTS.map((a) => (
            <span key={a} className="flex items-center px-8">
              {a} <span className="ml-16 text-accent">✦</span>
            </span>
          ))}
        </Marquee>
      </motion.div>

      <div
        className={`relative transition-colors duration-500 ${solid ? 'border-b border-line bg-canvas/90 backdrop-blur-xl' : 'border-b border-transparent bg-transparent'}`}
        onMouseLeave={() => setMenuOpen(false)}
      >
        <div className={`mx-auto grid h-[72px] max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-5 sm:px-6 lg:px-10 ${tone} transition-colors duration-500`}>
          <nav className="hidden items-center gap-8 lg:flex">
            <MegaMenu open={menuOpen} onOpenChange={setMenuOpen} />
            <Link href="/koleksiyonlar/tumu?sirala=yeni" className="link-underline whitespace-nowrap text-[13px] font-medium uppercase tracking-[0.18em]">Yeni Gelenler</Link>
            <Link href="/koleksiyonlar/tumu" className="link-underline hidden whitespace-nowrap xl:inline text-[13px] font-medium uppercase tracking-[0.18em]">Tüm Posterler</Link>
          </nav>
          <button type="button" className="lg:hidden" onClick={() => setMobileOpen((o) => !o)} aria-label="Menü">
            {mobileOpen ? <X className="size-6" strokeWidth={1.5} /> : <Menu className="size-6" strokeWidth={1.5} />}
          </button>

          <Link href="/" className="font-display text-[21px] font-semibold tracking-[0.16em] sm:text-[28px] sm:tracking-[0.22em] md:text-[32px]">
            BLVRDSGN
          </Link>

          <div className="flex items-center justify-end gap-3.5 sm:gap-5">
            <button type="button" onClick={openSearch} aria-label="Ara" className="group hidden items-center gap-2 md:flex">
              <Search className="size-[18px]" strokeWidth={1.5} />
              <span className="text-[13px] uppercase tracking-[0.18em] opacity-70 group-hover:opacity-100">Ara</span>
              <kbd className="rounded border border-line px-1.5 py-0.5 text-[11px] text-muted">⌘K</kbd>
            </button>
            <button type="button" onClick={openSearch} aria-label="Ara" className="md:hidden">
              <Search className="size-5" strokeWidth={1.5} />
            </button>
            <Link href="/favoriler" aria-label="Favoriler" className="relative hidden transition-transform hover:scale-110 sm:block">
              <Heart className="size-5" strokeWidth={1.5} />
              <CountBadge value={mounted ? wishCount : 0} />
            </Link>
            <button type="button" onClick={openCart} aria-label="Sepet" className="relative transition-transform hover:scale-110">
              <ShoppingBag className="size-5" strokeWidth={1.5} />
              <CountBadge value={mounted ? cartCount : 0} />
            </button>
          </div>
        </div>

        {/* Mobil menü */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.nav
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden border-t border-line bg-canvas lg:hidden"
            >
              <ul className="space-y-1 px-6 py-6">
                {CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/koleksiyonlar/${c.slug}`} onClick={() => setMobileOpen(false)} className="block py-1.5 font-display text-2xl">{c.name}</Link>
                  </li>
                ))}
                <li className="pt-4">
                  <Link href="/siparis-takip" onClick={() => setMobileOpen(false)} className="text-xs uppercase tracking-[0.18em]">Sipariş Takip</Link>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
