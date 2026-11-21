'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Search, X } from 'lucide-react';
import { useUiStore } from '@/store/useUiStore';
import { productService } from '@/services/productService';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { CATEGORIES, getCategory } from '@/data/categories';
import { formatTL, getStartingPrice } from '@/utils/pricing';

const TRENDING = ['istanbul', 'botanik', 'geometri', 'monokrom', 'vintage afiş', 'kahve'];
const norm = (s) => s.toLocaleLowerCase('tr');

/** ⌘K / Ctrl+K ile açılan anlık arama. */
export function SearchModal() {
  const { searchOpen, openSearch, closeSearch } = useUiStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const { data } = useServiceQuery(() => productService.getAllProducts(), productService.subscribe);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        useUiStore.getState().searchOpen ? closeSearch() : openSearch();
      }
      if (e.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openSearch, closeSearch]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 80);
    else setQuery('');
  }, [searchOpen]);

  const results = useMemo(() => {
    const q = norm(query.trim());
    if (!data) return [];
    if (!q) return data.filter((p) => p.isBestseller).slice(0, 4);
    return data
      .filter((p) => norm(`${p.title} ${p.tags?.join(' ')} ${getCategory(p.category)?.name ?? ''}`).includes(q))
      .slice(0, 8);
  }, [data, query]);

  return (
    <AnimatePresence>
      {searchOpen && (
        <motion.div className="fixed inset-0 z-[60]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-night/60 backdrop-blur-sm" onClick={closeSearch} />
          <motion.div
            className="relative max-h-[85vh] overflow-y-auto bg-canvas"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            data-lenis-prevent
          >
            <div className="mx-auto max-w-[1200px] px-6 py-10 lg:px-10">
              <div className="flex items-center gap-4 border-b border-ink pb-4">
                <Search className="size-6 text-muted" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Poster, sanatçı veya kategori ara…"
                  className="flex-1 bg-transparent font-display text-3xl outline-none placeholder:text-muted/50 md:text-5xl"
                />
                <button type="button" onClick={closeSearch} aria-label="Kapat" className="rounded-full p-2 hover:bg-surface">
                  <X className="size-6" strokeWidth={1.5} />
                </button>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-2">
                <span className="mr-2 text-xs uppercase tracking-[0.2em] text-muted">Trend</span>
                {TRENDING.map((t) => (
                  <button key={t} type="button" onClick={() => setQuery(t)} className="rounded-full border border-line px-3 py-1 text-xs hover:border-ink">
                    {t}
                  </button>
                ))}
              </div>

              <p className="mb-4 mt-10 text-xs uppercase tracking-[0.2em] text-muted">
                {query.trim() ? `${results.length} sonuç` : 'Çok satanlar'}
              </p>
              {results.length ? (
                <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
                  {results.map((p, i) => (
                    <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <Link href={`/urun/${p.slug}`} onClick={closeSearch} className="group block">
                        <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                          <Image src={p.image} alt={p.title} fill sizes="25vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                        </div>
                        <p className="mt-2 font-display text-lg leading-tight">{p.title}</p>
                        <p className="text-xs text-muted">{formatTL(getStartingPrice(p.basePrice))}’den</p>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-muted">“{query}” için sonuç bulunamadı. Kategorilere göz atın:</p>
              )}

              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-t border-line pt-6">
                {CATEGORIES.map((c) => (
                  <Link key={c.slug} href={`/koleksiyonlar/${c.slug}`} onClick={closeSearch} className="group flex items-center gap-1 text-sm">
                    {c.name} <ArrowUpRight className="size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
