'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useMotionValue, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowDownRight, ArrowRight, Star } from 'lucide-react';
import { Magnetic } from '@/components/motion/Magnetic';
import { RoomComposite } from '../RoomComposite';
import { HeroAmbient } from './HeroAmbient';
import { useUiStore } from '@/store/useUiStore';
import { productService } from '@/services/productService';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { INITIAL_PRODUCTS } from '@/data/initialProducts';
import { getScene } from '@/data/scenes';
import { getFrame } from '@/utils/pricing';

const EASE = [0.16, 1, 0.3, 1];
const SCENE = getScene('salon');
const FRAME_CYCLE = ['siyah-ahsap', 'beyaz', 'gold-metal'];
const HERO_SLUGS = ['mor-susen', 'galata-sabahi', 'kubbe-nakisi', 'monstera-noir', 'kis-sporlari-1924', 'siyah-beyaz-gecme'];
const CYCLE_MS = 3800;

export function Hero() {
  const introDone = useUiStore((s) => s.introDone);
  const { data } = useServiceQuery(() => productService.getAllProducts(), productService.subscribe);
  const all = data ?? INITIAL_PRODUCTS;
  const products = useMemo(() => {
    const curated = HERO_SLUGS.map((slug) => all.find((p) => p.slug === slug)).filter(Boolean);
    return curated.length ? curated : all.filter((p) => p.orientation === 'dikey').slice(0, 6);
  }, [all]);

  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!introDone) return undefined;
    const t = setInterval(() => setIndex((i) => i + 1), CYCLE_MS);
    return () => clearInterval(t);
  }, [introDone]);

  const current = products[index % products.length];
  const frameId = FRAME_CYCLE[index % FRAME_CYCLE.length];

  // Kaydırma: sahne hafifçe küçülür ve yukarı kayar
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const fade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  // İmleç parallax'ı (yüzen posterler)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 60, damping: 20 });
  const py = useSpring(my, { stiffness: 60, damping: 20 });
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 30);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 30);
  };

  return (
    <section ref={ref} onMouseMove={onMove} className="relative flex min-h-[100svh] items-center overflow-hidden bg-canvas pt-[108px] text-ink">
      {/* Atmosfer */}
      {/* Aydınlık atmosfer: yumuşak pastel ışık lekeleri + ince galeri ızgarası */}
      <div className="pointer-events-none absolute -right-32 top-10 size-[620px] rounded-full bg-accent-soft blur-[120px]" />
      <div className="pointer-events-none absolute -left-40 bottom-0 size-[520px] rounded-full bg-[#F7E8EF] blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(18,18,20,.035)_1px,transparent_1px)] bg-[size:120px_100%]" />

      <div className="relative mx-auto grid w-full max-w-[1440px] items-center gap-14 px-6 pb-20 lg:grid-cols-12 lg:px-10">
        <motion.div style={{ y: textY, opacity: fade }} className="min-w-0 lg:col-span-6">
          <motion.p
            className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-muted"
            initial={{ opacity: 0, x: -20 }}
            animate={introDone ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 1, ease: EASE }}
          >
            <span className="font-display text-base normal-case italic tracking-normal text-accent">№ 01</span>
            <span className="h-px w-10 bg-ink/20" /> Kış Seçkisi 2026
          </motion.p>

          <h1
            aria-label="Duvarlarınız bir galeriye dönüşsün."
            className="mt-8 font-display text-[clamp(3rem,5.8vw,6.5rem)] font-normal leading-[1.02] tracking-[-0.02em]"
          >
            <MaskLine play={introDone} delay={0.1}>Duvarlarınız</MaskLine>
            <MaskLine play={introDone} delay={0.24} className="pl-[0.8em] sm:pl-[1.5em]">
              <span className="mr-[0.25em] font-display not-italic">bir</span>
              <span className="italic text-accent">galeriye</span>
            </MaskLine>
            <MaskLine play={introDone} delay={0.38} className="flex items-end gap-[0.28em]">
              <span>dönüşsün</span>
              <motion.span
                aria-hidden="true"
                className="mb-[0.3em] h-px min-w-[0.6em] flex-1 origin-left bg-ink/25"
                initial={{ scaleX: 0 }}
                animate={introDone ? { scaleX: 1 } : undefined}
                transition={{ duration: 1.4, ease: EASE, delay: 0.9 }}
              />
            </MaskLine>
          </h1>

          <motion.p
            className="mt-10 max-w-md text-[17px] leading-relaxed text-muted"
            initial={{ opacity: 0, y: 20 }}
            animate={introDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease: EASE, delay: 0.7 }}
          >
            Sekiz kategoride küratörlü posterler. Çerçeveyi seçin, gerçek bir odada canlı görün, kapınıza gelsin.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={introDone ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 1, ease: EASE, delay: 0.85 }}
          >
            <Magnetic>
              <Link href="/koleksiyonlar/tumu" className="group flex h-14 items-center gap-3 rounded-full bg-ink pl-7 pr-2 text-[13px] font-semibold uppercase tracking-[0.12em] text-canvas transition-colors hover:bg-accent">
                Koleksiyonu Keşfet
                <span className="flex size-10 items-center justify-center rounded-full bg-canvas text-ink transition-transform duration-500 group-hover:rotate-[-45deg]">
                  <ArrowRight className="size-4" />
                </span>
              </Link>
            </Magnetic>
            <Magnetic>
              <Link href={`/urun/${current.slug}`} className="flex h-14 items-center rounded-full border border-ink/20 px-7 text-[13px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-ink hover:bg-ink hover:text-canvas">
                Stüdyoyu Dene
              </Link>
            </Magnetic>
          </motion.div>

          <motion.div
            className="mt-14 flex items-center gap-5"
            initial={{ opacity: 0 }}
            animate={introDone ? { opacity: 1 } : undefined}
            transition={{ duration: 1, delay: 1.1 }}
          >
            <div className="flex -space-x-3">
              {products.slice(0, 4).map((p) => (
                <span key={p.id} className="size-10 overflow-hidden rounded-full border-2 border-canvas bg-surface bg-cover bg-center" style={{ backgroundImage: `url(${p.image})` }} />
              ))}
            </div>
            <div className="text-sm">
              <div className="flex items-center gap-1 text-accent">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}
                <span className="ml-1.5 font-medium text-ink">4,9</span>
              </div>
              <p className="text-muted">12.000+ duvar dönüştürüldü</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Canlı oda önizlemesi */}
        <motion.div
          style={{ y: sceneY, width: 'min(100%, calc((100svh - 190px) * 0.8))' }}
          className="relative ml-auto min-w-0 lg:col-span-6 xl:mr-2"
        >
          {/* Galeri paspartusu: sahnenin etrafında ince çerçeve */}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-5 border border-ink/10 xl:-inset-7"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={introDone ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: 1.4, ease: EASE, delay: 0.9 }}
          />

          <motion.div
            initial={{ clipPath: 'inset(100% 0 0 0)', scale: 1.1 }}
            animate={introDone ? { clipPath: 'inset(0% 0 0 0)', scale: 1 } : undefined}
            transition={{ duration: 1.6, ease: EASE, delay: 0.2 }}
            className="relative shadow-[0_60px_120px_-50px_rgba(18,18,20,.5)]"
          >
            <RoomComposite scene={SCENE} product={current} sizeId="50x70" frameId={frameId} sizes="(min-width:1024px) 48vw, 100vw" priority animateKey={`${current.id}-${frameId}`} />

            <motion.div
              className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4 bg-canvas/90 px-5 py-4 text-ink shadow-lg backdrop-blur-md"
              initial={{ opacity: 0, y: 20 }}
              animate={introDone ? { opacity: 1, y: 0 } : undefined}
              transition={{ delay: 1.2, duration: 0.8, ease: EASE }}
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-muted">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                    <span className="relative inline-flex size-2 rounded-full bg-accent" />
                  </span>
                  Canlı önizleme
                </p>
                <motion.p key={current.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-1 truncate font-display text-xl">
                  {current.title}
                </motion.p>
                <motion.p key={frameId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-muted">
                  50 × 70 cm · {getFrame(frameId).name}
                </motion.p>
              </div>
              <Link href={`/urun/${current.slug}`} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-ink text-canvas transition-transform hover:scale-110" aria-label="Ürüne git">
                <ArrowDownRight className="size-4 -rotate-90" />
              </Link>
            </motion.div>

            {/* Döngü ilerlemesi */}
            <div className="absolute left-4 right-4 top-4 flex gap-1.5">
              {products.map((p, i) => (
                <div key={p.id} className="h-0.5 flex-1 overflow-hidden bg-white/30">
                  {i === index % products.length && (
                    <motion.div key={index} className="h-full bg-white" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: CYCLE_MS / 1000, ease: 'linear' }} />
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Çevrede rastgele beliren eserler ve yorumlar */}
          <HeroAmbient products={all} play={introDone} px={px} py={py} />
        </motion.div>
      </div>

      {/* Kaydır göstergesi */}
      <motion.div
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 text-xs font-medium uppercase tracking-[0.22em] text-muted md:flex"
        initial={{ opacity: 0 }}
        animate={introDone ? { opacity: 1 } : undefined}
        transition={{ delay: 1.6 }}
      >
        Kaydır
        <span className="relative h-12 w-px overflow-hidden bg-ink/15">
          <motion.span className="absolute inset-x-0 top-0 h-1/2 bg-ink" animate={{ y: ['-100%', '200%'] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} />
        </span>
      </motion.div>
    </section>
  );
}

/**
 * Satır maskesi: dikey dolgu + negatif margin ile maske kutusu satırdan geniştir;
 * böylece İ, Ö, Ü, ş, ğ gibi Türkçe aksanlar ve italik taşmaları kesilmez.
 */
function MaskLine({ children, play, delay = 0, className = '' }) {
  return (
    <span className="-my-[0.2em] block overflow-hidden py-[0.2em] pr-[0.08em]" aria-hidden="true">
      <motion.span
        className={`block ${className}`}
        initial={{ y: '115%', rotate: 2 }}
        animate={play ? { y: '0%', rotate: 0 } : undefined}
        transition={{ duration: 1.3, ease: EASE, delay }}
        style={{ transformOrigin: '0% 100%' }}
      >
        {children}
      </motion.span>
    </span>
  );
}
