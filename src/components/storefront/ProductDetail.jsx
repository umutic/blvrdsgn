'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Heart, Minus, Plus, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { FramePreviewStudio } from './FramePreviewStudio';
import { ProductGrid } from './ProductGrid';
import { productService } from '@/services/productService';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useHasMounted } from '@/hooks/useHasMounted';
import { getCategory } from '@/data/categories';
import { SIZES } from '@/data/sizes';
import { FRAMES, MAT } from '@/data/frames';
import { FREE_SHIPPING_THRESHOLD, formatTL, getUnitPrice } from '@/utils/pricing';

const EASE = [0.16, 1, 0.3, 1];

export function ProductDetail({ slug }) {
  const mounted = useHasMounted();
  const { data: all, loading } = useServiceQuery(() => productService.getAllProducts(), productService.subscribe);
  const product = all?.find((p) => p.slug === slug) ?? null;

  const [sizeId, setSizeId] = useState(SIZES[2].id);
  const [frameId, setFrameId] = useState('siyah-ahsap');
  const [mat, setMat] = useState(false);
  const [roomId, setRoomId] = useState('salon');
  const [quantity, setQuantity] = useState(1);

  const addItem = useCartStore((s) => s.addItem);
  const isFav = useWishlistStore((s) => (product ? s.ids.includes(product.id) : false));
  const toggleFav = useWishlistStore((s) => s.toggle);

  if (loading) return <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-10"><div className="aspect-[4/5] max-w-2xl animate-pulse bg-surface" /></div>;
  if (!product)
    return (
      <div className="mx-auto max-w-[1440px] px-6 py-32 text-center">
        <p className="font-display text-5xl">Ürün bulunamadı</p>
        <Link href="/koleksiyonlar/tumu" className="mt-6 inline-block border-b border-ink pb-1 text-xs uppercase tracking-[0.2em]">Koleksiyona dön</Link>
      </div>
    );

  const hasFrame = frameId !== 'cercevesiz';
  const effectiveMat = hasFrame && mat;
  const unitPrice = getUnitPrice(product.basePrice, sizeId, frameId, effectiveMat);
  const category = getCategory(product.category);
  const frame = FRAMES.find((f) => f.id === frameId);
  const related = (all ?? []).filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAdd = () => {
    addItem({ productId: product.id, slug: product.slug, title: product.title, image: product.image, sizeId, frameId, mat: effectiveMat, quantity, unitPrice });
    toast.success(`${product.title} sepete eklendi`);
  };

  return (
    <>
      <div className="mx-auto max-w-[1440px] px-6 pt-8 lg:px-10">
        <nav className="text-xs uppercase tracking-[0.18em] text-muted">
          <Link href="/" className="hover:text-ink">Ana Sayfa</Link> <span className="mx-2">/</span>
          {category && <><Link href={`/koleksiyonlar/${category.slug}`} className="hover:text-ink">{category.name}</Link> <span className="mx-2">/</span></>}
          <span className="text-ink">{product.title}</span>
        </nav>
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-8 lg:grid-cols-12 lg:gap-16 lg:px-10">
        <motion.div className="min-w-0 lg:col-span-7" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE }}>
          <div className="lg:sticky lg:top-24">
            <FramePreviewStudio product={product} sizeId={sizeId} frameId={frameId} mat={effectiveMat} roomId={roomId} onRoomChange={setRoomId} />
          </div>
        </motion.div>

        <motion.div className="min-w-0 lg:col-span-5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.1 }}>
          <div className="flex items-start justify-between gap-4">
            <div>
              {category && <p className="text-xs uppercase tracking-[0.18em] text-accent">{category.name}</p>}
              <h1 className="mt-3 font-display text-[clamp(2.6rem,4vw,4rem)] leading-[0.95]">{product.title}</h1>
              <p className="mt-2 text-sm text-muted">{product.artist}</p>
            </div>
            <motion.button type="button" whileTap={{ scale: 0.85 }} onClick={() => toggleFav(product.id)} aria-label="Favori" className="mt-2 flex size-12 shrink-0 items-center justify-center rounded-full border border-line transition-colors hover:border-ink">
              <Heart className={`size-5 ${mounted && isFav ? 'fill-accent text-accent' : ''}`} strokeWidth={1.5} />
            </motion.button>
          </div>

          <div className="mt-8 flex items-baseline gap-3 border-y border-line py-6">
            <AnimatePresence mode="popLayout">
              <motion.span key={unitPrice} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="font-display text-4xl">
                {formatTL(unitPrice)}
              </motion.span>
            </AnimatePresence>
            <span className="text-sm text-muted">KDV dahil</span>
          </div>

          <Section title="Boyut" value={SIZES.find((s) => s.id === sizeId)?.label}>
            <div className="grid grid-cols-2 gap-2">
              {SIZES.map((s) => (
                <button key={s.id} type="button" onClick={() => setSizeId(s.id)} className={`relative flex items-center justify-between border px-4 py-3.5 text-sm transition-colors ${s.id === sizeId ? 'border-ink' : 'border-line hover:border-ink/40'}`}>
                  {s.id === sizeId && <motion.span layoutId="size-active" className="absolute inset-0 bg-surface" transition={{ type: 'spring', stiffness: 400, damping: 35 }} />}
                  <span className="relative">{s.label}</span>
                  <span className="relative text-xs text-muted">{formatTL(getUnitPrice(product.basePrice, s.id, frameId, effectiveMat))}</span>
                </button>
              ))}
            </div>
          </Section>

          <Section title="Çerçeve" value={frame?.name}>
            <div className="flex flex-wrap gap-3">
              {FRAMES.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  title={f.name}
                  aria-label={f.name}
                  onClick={() => setFrameId(f.id)}
                  className={`relative size-12 rounded-full ring-offset-2 transition ${f.id === frameId ? 'ring-2 ring-ink' : 'ring-1 ring-line hover:ring-ink/40'}`}
                  style={{ background: f.finish ?? 'repeating-linear-gradient(45deg,#fff 0 4px,#E1E1DD 4px 6px)' }}
                >
                  {f.id === frameId && <Check className={`absolute inset-0 m-auto size-4 ${f.id === 'beyaz' || !f.finish ? 'text-ink' : 'text-white'}`} />}
                </button>
              ))}
            </div>
          </Section>

          <Section title={MAT.label} value={hasFrame ? (effectiveMat ? 'Var' : 'Yok') : 'Çerçeve gerekli'}>
            <button type="button" disabled={!hasFrame} onClick={() => setMat((m) => !m)} className="flex items-center gap-3 text-sm disabled:opacity-40">
              <span className={`relative h-6 w-11 rounded-full transition-colors ${effectiveMat ? 'bg-ink' : 'bg-line'}`}>
                <motion.span layout className={`absolute top-1 size-4 rounded-full bg-white ${effectiveMat ? 'right-1' : 'left-1'}`} />
              </span>
              Esere nefes aldıran beyaz paspartu ekle
            </button>
          </Section>

          <div className="mt-10 flex gap-3">
            <div className="flex items-center border border-line">
              <button type="button" className="px-4 py-4" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Azalt"><Minus className="size-4" /></button>
              <span className="w-8 text-center tabular-nums">{quantity}</span>
              <button type="button" className="px-4 py-4" onClick={() => setQuantity((q) => q + 1)} aria-label="Arttır"><Plus className="size-4" /></button>
            </div>
            <motion.button type="button" whileTap={{ scale: 0.98 }} onClick={handleAdd} className="group relative flex-1 overflow-hidden bg-ink text-[13px] font-medium uppercase tracking-[0.16em] text-canvas">
              <span className="absolute inset-0 translate-y-full bg-accent transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] group-hover:translate-y-0" />
              <span className="relative">Sepete Ekle · {formatTL(unitPrice * quantity)}</span>
            </motion.button>
          </div>

          <ul className="mt-6 grid grid-cols-3 gap-2 text-center text-xs text-muted">
            <li className="flex flex-col items-center gap-1.5 bg-surface py-3"><Truck className="size-4 text-ink" strokeWidth={1.5} />{formatTL(FREE_SHIPPING_THRESHOLD)}+ ücretsiz</li>
            <li className="flex flex-col items-center gap-1.5 bg-surface py-3"><RotateCcw className="size-4 text-ink" strokeWidth={1.5} />14 gün iade</li>
            <li className="flex flex-col items-center gap-1.5 bg-surface py-3"><ShieldCheck className="size-4 text-ink" strokeWidth={1.5} />Güvenli ödeme</li>
          </ul>

          <div className="mt-10 border-t border-line">
            <Accordion title="Eser hakkında" defaultOpen>
              <p>{product.description}</p>
              {product.tags?.length > 0 && <p className="mt-3 text-xs uppercase tracking-[0.14em]">{product.tags.map((t) => `#${t}`).join('  ')}</p>}
            </Accordion>
            <Accordion title="Baskı & malzeme">
              <p>310 gr/m² asitsiz müze kâğıdına 12 renk pigment baskı. Çerçeveler masif ahşap veya fırçalanmış alüminyum, kırılmaz pleksi korumalı ve asmaya hazır gelir.</p>
            </Accordion>
            <Accordion title="Kargo & iade">
              <p>Siparişler 48 saat içinde özel korumalı ambalajla kargoya verilir. {formatTL(FREE_SHIPPING_THRESHOLD)} üzeri siparişlerde kargo ücretsizdir. 14 gün içinde koşulsuz iade.</p>
            </Accordion>
          </div>
        </motion.div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10">
          <h2 className="mb-12 font-display text-5xl">Bunları da <em className="text-accent">sevebilirsiniz</em></h2>
          <ProductGrid products={related} />
        </section>
      )}
    </>
  );
}

function Section({ title, value, children }) {
  return (
    <div className="mt-8">
      <p className="mb-3 flex justify-between text-xs uppercase tracking-[0.22em] text-muted">
        <span>{title}</span>
        <span className="text-ink">{value}</span>
      </p>
      {children}
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-line">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between py-5 text-left text-[13px] font-medium uppercase tracking-[0.18em]">
        {title}
        <ChevronDown className={`size-4 transition-transform duration-500 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
            <div className="pb-6 text-sm leading-relaxed text-muted">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
