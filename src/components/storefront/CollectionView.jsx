'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { productService } from '@/services/productService';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { CATEGORIES, ORIENTATIONS, getCategory, getRoom } from '@/data/categories';
import { ProductGrid, ProductGridSkeleton } from './ProductGrid';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { coverUrl } from '@/data/categories';
import { SplitText } from '@/components/motion/Reveal';

const SORTS = {
  onerilen: { label: 'Önerilen', fn: (a, b) => Number(b.isBestseller) - Number(a.isBestseller) },
  yeni: { label: 'En Yeniler', fn: (a, b) => b.createdAt.localeCompare(a.createdAt) },
  'fiyat-artan': { label: 'Fiyat (Artan)', fn: (a, b) => a.basePrice - b.basePrice },
  'fiyat-azalan': { label: 'Fiyat (Azalan)', fn: (a, b) => b.basePrice - a.basePrice },
};

/** slug: 'tumu' | kategori slug'ı | yaşam alanı slug'ı */
export function CollectionView({ slug }) {
  const searchParams = useSearchParams();
  const [orientation, setOrientation] = useState('');
  const [sort, setSort] = useState(SORTS[searchParams.get('sirala')] ? searchParams.get('sirala') : 'onerilen');
  const [query, setQuery] = useState('');
  const { data, loading } = useServiceQuery(() => productService.getAllProducts(), productService.subscribe);

  const category = getCategory(slug);
  const room = getRoom(slug);
  const isAll = slug === 'tumu';
  const title = isAll ? 'Tüm Posterler' : category?.name ?? room?.name;

  const products = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLocaleLowerCase('tr');
    return data
      .filter((p) => isAll || (category && p.category === category.slug) || (room && p.rooms?.includes(room.slug)))
      .filter((p) => !orientation || p.orientation === orientation)
      .filter((p) => !q || `${p.title} ${p.tags?.join(' ')}`.toLocaleLowerCase('tr').includes(q))
      .sort(SORTS[sort].fn);
  }, [data, isAll, category, room, orientation, query, sort]);

  if (!title) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <p className="font-display text-3xl">Koleksiyon bulunamadı</p>
        <Link href="/koleksiyonlar/tumu" className="mt-4 inline-block underline">Tüm posterlere göz atın</Link>
      </div>
    );
  }

  const cover = category ?? room;

  return (
    <div>
      <header className="relative flex min-h-[46vh] items-end overflow-hidden bg-surface text-white">
        {cover && (
          <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}>
            <Image src={coverUrl(cover, { w: 2000, h: 900 })} alt="" fill sizes="100vw" priority className="object-cover" />
          </motion.div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-transparent" />
        <div className="relative mx-auto w-full max-w-[1440px] px-6 pb-14 pt-24 lg:px-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/85">{room ? 'Yaşam Alanı' : 'Koleksiyon'} · {products.length} eser</p>
          <h1 className="mt-3 font-display text-[clamp(3rem,7vw,7rem)] leading-[0.9]">
            <SplitText key={slug} text={title} />
          </h1>
          {category?.description && <p className="mt-4 max-w-lg text-lg text-white/90">{category.description}</p>}
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-10">
      <div className="sticky top-[72px] z-20 -mx-6 mb-10 flex flex-wrap items-center gap-3 border-b border-line bg-canvas/90 px-6 py-4 backdrop-blur-xl lg:-mx-10 lg:px-10">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ara…"
          className="h-10 w-56 rounded-full border border-line bg-transparent px-4 text-sm outline-none focus:border-ink"
        />
        {[{ value: '', label: 'Tümü' }, ...ORIENTATIONS].map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setOrientation(o.value)}
            className={`h-10 rounded-full border px-4 text-xs uppercase tracking-[0.12em] transition-colors ${orientation === o.value ? 'border-ink bg-ink text-canvas' : 'border-line hover:border-ink'}`}
          >
            {o.label}
          </button>
        ))}
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="ml-auto h-10 rounded-full border border-line bg-transparent px-4 text-sm">
          {Object.entries(SORTS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      {isAll && (
        <div className="mb-8 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link key={c.slug} href={`/koleksiyonlar/${c.slug}`} className="rounded-full border border-line px-4 py-2 text-xs transition-colors hover:border-ink hover:bg-ink hover:text-canvas">
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {loading ? (
        <ProductGridSkeleton />
      ) : products.length ? (
        <ProductGrid products={products} />
      ) : (
        <p className="py-16 text-center text-muted">Bu filtrelere uygun poster bulunamadı.</p>
      )}
      </div>
    </div>
  );
}
