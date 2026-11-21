'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { RoomComposite } from './RoomComposite';
import { getCategory } from '@/data/categories';
import { getScene } from '@/data/scenes';
import { SIZES } from '@/data/sizes';
import { FRAMES } from '@/data/frames';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useHasMounted } from '@/hooks/useHasMounted';
import { formatTL, getStartingPrice, getUnitPrice } from '@/utils/pricing';

const HOVER_SCENE = getScene('salon');
const QUICK_SIZES = SIZES.slice(0, 3);

export function ProductCard({ product, priority = false }) {
  const mounted = useHasMounted();
  const [hover, setHover] = useState(false);
  const isFav = useWishlistStore((s) => s.ids.includes(product.id));
  const toggleFav = useWishlistStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);
  const startingPrice = getStartingPrice(product.basePrice);

  const quickAdd = (sizeId) => {
    addItem({
      productId: product.id,
      slug: product.slug,
      title: product.title,
      image: product.image,
      sizeId,
      frameId: FRAMES[0].id,
      mat: false,
      unitPrice: getUnitPrice(product.basePrice, sizeId, FRAMES[0].id, false),
    });
    toast.success(`${product.title} · ${sizeId.replace('x', '×')} sepete eklendi`);
  };

  return (
    <article className="group" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <Link href={`/urun/${product.slug}`} className="absolute inset-0 block" aria-label={product.title}>
          {/* Varsayılan: eserin kendisi, galeri paspartusu içinde */}
          <div className="absolute inset-0 flex items-center justify-center bg-[#EDEDEB] p-[11%] transition-transform duration-[1.2s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.04]">
            <div className="relative h-full w-full shadow-[0_18px_30px_-18px_rgba(0,0,0,.45)]">
              <Image src={product.image} alt={product.title} fill sizes="(min-width:1024px) 25vw, 50vw" priority={priority} className="object-cover" />
            </div>
          </div>
          {/* Hover: gerçek odada çerçeveli */}
          <AnimatePresence>
            {hover && (
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <RoomComposite scene={HOVER_SCENE} product={product} sizeId="50x70" frameId="siyah-ahsap" sizes="(min-width:1024px) 25vw, 50vw" />
              </motion.div>
            )}
          </AnimatePresence>
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex gap-1.5">
          {product.isNew && <span className="bg-ink px-2 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-canvas">Yeni</span>}
          {product.isBestseller && <span className="bg-accent px-2 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white">Çok Satan</span>}
        </div>

        <motion.button
          type="button"
          whileTap={{ scale: 0.85 }}
          onClick={() => toggleFav(product.id)}
          aria-label={isFav ? 'Favorilerden çıkar' : 'Favorilere ekle'}
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-canvas/90 backdrop-blur transition hover:bg-canvas"
        >
          <Heart className={`size-4 transition-colors ${mounted && isFav ? 'fill-accent text-accent' : ''}`} strokeWidth={1.5} />
        </motion.button>

        {/* Hızlı boyut seçimi */}
        <div className="absolute inset-x-3 bottom-3 translate-y-[calc(100%+12px)] bg-canvas/95 p-2 backdrop-blur transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0">
          <p className="mb-1.5 text-center text-[11px] uppercase tracking-[0.18em] text-muted">Hızlı ekle · çerçevesiz</p>
          <div className="grid grid-cols-3 gap-1">
            {QUICK_SIZES.map((s) => (
              <button key={s.id} type="button" onClick={() => quickAdd(s.id)} className="py-1.5 text-xs font-medium transition-colors hover:bg-ink hover:text-canvas">
                {s.id.replace('x', '×')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">{getCategory(product.category)?.name}</p>
          <Link href={`/urun/${product.slug}`} className="mt-1 block font-display text-[22px] leading-tight transition-colors hover:text-accent">
            {product.title}
          </Link>
        </div>
        <p className="shrink-0 pt-4 text-sm">
          <span className="text-muted">’den </span>
          {formatTL(startingPrice)}
        </p>
      </div>
    </article>
  );
}
