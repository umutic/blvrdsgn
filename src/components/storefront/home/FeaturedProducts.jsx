'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { productService } from '@/services/productService';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { ProductGrid, ProductGridSkeleton } from '../ProductGrid';
import { SplitText } from '@/components/motion/Reveal';

const TABS = [
  { id: 'bestseller', label: 'Çok Satanlar', fn: (p) => p.isBestseller },
  { id: 'new', label: 'Yeni Gelenler', fn: (p) => p.isNew },
  { id: 'all', label: 'Editörün Seçimi', fn: (_, i) => i % 3 === 0 },
];

export function FeaturedProducts() {
  const [tab, setTab] = useState(TABS[0]);
  const { data, loading } = useServiceQuery(() => productService.getAllProducts(), productService.subscribe);
  const products = (data ?? []).filter(tab.fn).slice(0, 8);

  return (
    <section className="mx-auto max-w-[1440px] px-6 py-28 lg:px-10">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Seçki</p>
          <h2 className="mt-3 font-display text-[clamp(2.6rem,5vw,5rem)] leading-[0.95]">
            <SplitText text="Bu sezonun favorileri" italicWords={['favorileri']} />
          </h2>
        </div>
        <div className="flex gap-8 border-b border-line">
          {TABS.map((t) => (
            <button key={t.id} type="button" onClick={() => setTab(t)} className={`relative pb-3 text-[13px] uppercase tracking-[0.18em] transition-colors ${tab.id === t.id ? 'text-ink' : 'text-muted hover:text-ink'}`}>
              {t.label}
              {tab.id === t.id && <motion.span layoutId="featured-tab" className="absolute inset-x-0 -bottom-px h-px bg-ink" />}
            </button>
          ))}
        </div>
      </div>

      {loading ? <ProductGridSkeleton /> : <ProductGrid key={tab.id} products={products} />}

      <div className="mt-16 flex justify-center">
        <Link href="/koleksiyonlar/tumu" className="group flex items-center gap-3 border-b border-ink pb-1 text-[13px] uppercase tracking-[0.2em]">
          Tüm posterleri gör <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
