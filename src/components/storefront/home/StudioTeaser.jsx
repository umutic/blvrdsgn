'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { RoomComposite } from '../RoomComposite';
import { ROOM_SCENES } from '@/data/scenes';
import { FRAMES } from '@/data/frames';
import { SIZES } from '@/data/sizes';
import { INITIAL_PRODUCTS } from '@/data/initialProducts';
import { productService } from '@/services/productService';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { Reveal, SplitText } from '@/components/motion/Reveal';

export function StudioTeaser() {
  const { data } = useServiceQuery(() => productService.getAllProducts(), productService.subscribe);
  const product = useMemo(() => (data ?? INITIAL_PRODUCTS).find((p) => p.slug === 'mor-susen') ?? (data ?? INITIAL_PRODUCTS)[0], [data]);
  const [frameId, setFrameId] = useState('siyah-ahsap');
  const [sceneId, setSceneId] = useState('minimal');
  const [sizeId, setSizeId] = useState('50x70');
  const [mat, setMat] = useState(true);
  const scene = ROOM_SCENES.find((s) => s.id === sceneId);

  return (
    <section className="bg-surface py-28">
      <div className="mx-auto grid max-w-[1440px] items-center gap-16 px-6 lg:grid-cols-12 lg:px-10">
        <div className="lg:col-span-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Canlı Çerçeve Stüdyosu</p>
          <h2 className="mt-3 font-display text-[clamp(2.6rem,5vw,4.8rem)] leading-[0.95]">
            <SplitText text={'Satın almadan önce\nduvarınızda görün.'} italicWords={['duvarınızda']} />
          </h2>
          <Reveal delay={0.2}>
            <p className="mt-6 max-w-md text-muted">Çerçeveyi, paspartuyu, boyutu ve odayı değiştirin. Poster, gerçek ölçeğiyle sahneye yerleşir.</p>
          </Reveal>

          <Reveal delay={0.3} className="mt-10 space-y-7">
            <Control label="Çerçeve">
              <div className="flex flex-wrap gap-2.5">
                {FRAMES.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    title={f.name}
                    onClick={() => setFrameId(f.id)}
                    className={`relative size-10 rounded-full ring-offset-2 ring-offset-surface transition ${f.id === frameId ? 'ring-2 ring-ink' : 'ring-1 ring-line hover:ring-ink/40'}`}
                    style={{ background: f.finish ?? 'repeating-linear-gradient(45deg,#fff 0 4px,#E1E1DD 4px 6px)' }}
                  >
                    {f.id === frameId && <Check className={`absolute inset-0 m-auto size-4 ${f.id === 'beyaz' || !f.finish ? 'text-ink' : 'text-white'}`} />}
                  </button>
                ))}
              </div>
            </Control>
            <Control label="Boyut">
              <div className="flex flex-wrap gap-2">
                {SIZES.map((s) => (
                  <Chip key={s.id} active={s.id === sizeId} onClick={() => setSizeId(s.id)}>{s.label}</Chip>
                ))}
              </div>
            </Control>
            <Control label="Oda">
              <div className="flex flex-wrap gap-2">
                {ROOM_SCENES.map((s) => (
                  <Chip key={s.id} active={s.id === sceneId} onClick={() => setSceneId(s.id)}>{s.name}</Chip>
                ))}
              </div>
            </Control>
            <label className="flex items-center gap-3 text-sm">
              <button type="button" role="switch" aria-checked={mat} onClick={() => setMat((m) => !m)} className={`relative h-6 w-11 rounded-full transition-colors ${mat ? 'bg-ink' : 'bg-line'}`}>
                <motion.span layout className={`absolute top-1 size-4 rounded-full bg-white ${mat ? 'right-1' : 'left-1'}`} />
              </button>
              Paspartu
            </label>
          </Reveal>

          <Reveal delay={0.4}>
            <Link href={`/urun/${product.slug}`} className="group mt-12 inline-flex h-14 items-center gap-3 rounded-full bg-ink px-8 text-[13px] font-medium uppercase tracking-[0.14em] text-canvas">
              Stüdyoyu tam ekran aç <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <Reveal className="lg:col-span-6 lg:col-start-7" y={80}>
          <RoomComposite scene={scene} product={product} sizeId={sizeId} frameId={frameId} mat={mat} sizes="(min-width:1024px) 45vw, 100vw" />
        </Reveal>
      </div>
    </section>
  );
}

function Control({ label, children }) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.22em] text-muted">{label}</p>
      {children}
    </div>
  );
}

function Chip({ active, children, ...props }) {
  return (
    <button type="button" className={`rounded-full border px-4 py-2 text-xs transition-colors ${active ? 'border-ink bg-ink text-canvas' : 'border-line bg-canvas hover:border-ink'}`} {...props}>
      {children}
    </button>
  );
}
