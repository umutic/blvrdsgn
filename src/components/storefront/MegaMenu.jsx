'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { CATEGORIES, ROOMS, coverUrl } from '@/data/categories';

const EASE = [0.16, 1, 0.3, 1];

export function MegaMenu({ open, onOpenChange }) {
  const [active, setActive] = useState(CATEGORIES[0]);
  const close = () => onOpenChange(false);

  return (
    <div onMouseEnter={() => onOpenChange(true)}>
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className="flex items-center gap-1.5 whitespace-nowrap py-6 text-[13px] font-medium uppercase tracking-[0.18em]"
        aria-expanded={open}
      >
        Koleksiyonlar <ChevronDown className={`size-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            animate={{ opacity: 1, clipPath: 'inset(0 0 0% 0)' }}
            exit={{ opacity: 0, clipPath: 'inset(0 0 100% 0)' }}
            transition={{ duration: 0.55, ease: EASE }}
            className="absolute inset-x-0 top-full border-b border-line bg-canvas text-ink shadow-[0_30px_60px_-30px_rgba(0,0,0,.25)]"
          >
            <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-10 px-10 py-12">
              <div className="col-span-5">
                <p className="mb-5 text-xs uppercase tracking-[0.18em] text-muted">Kategoriler</p>
                <ul>
                  {CATEGORIES.map((c, i) => (
                    <motion.li
                      key={c.slug}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + i * 0.035, duration: 0.5, ease: EASE }}
                    >
                      <Link
                        href={`/koleksiyonlar/${c.slug}`}
                        onClick={close}
                        onMouseEnter={() => setActive(c)}
                        className="group flex items-baseline gap-4 py-1.5"
                      >
                        <span className="w-6 text-xs tabular-nums text-muted">0{i + 1}</span>
                        <span className={`font-display text-[30px] leading-tight transition-all duration-500 ${active.slug === c.slug ? 'translate-x-2 italic text-accent' : 'text-ink'}`}>
                          {c.name}
                        </span>
                      </Link>
                    </motion.li>
                  ))}
                </ul>
              </div>

              <div className="col-span-4">
                <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={active.slug}
                      className="absolute inset-0"
                      initial={{ opacity: 0, scale: 1.08 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.7, ease: EASE }}
                    >
                      <Image src={coverUrl(active, { w: 700, h: 875 })} alt={active.name} fill sizes="30vw" className="object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                      <p className="absolute bottom-5 left-5 right-5 text-sm text-white/90">{active.description}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="col-span-3 flex flex-col">
                <p className="mb-5 text-xs uppercase tracking-[0.18em] text-muted">Yaşam Alanları</p>
                <ul className="space-y-3">
                  {ROOMS.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/koleksiyonlar/${r.slug}`} onClick={close} className="link-underline text-[15px]">{r.name}</Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/koleksiyonlar/tumu"
                  onClick={close}
                  className="group mt-auto flex items-center justify-between border-t border-line pt-5 text-[13px] uppercase tracking-[0.18em]"
                >
                  Tüm Koleksiyon
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
