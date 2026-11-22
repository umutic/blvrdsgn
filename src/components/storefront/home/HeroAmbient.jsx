'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion, useTransform } from 'framer-motion';
import { Star } from 'lucide-react';
import { FramedArt } from '../FramedArt';
import { REVIEWS } from '@/data/reviews';
import { getFrame } from '@/utils/pricing';

const EASE = [0.16, 1, 0.3, 1];

/**
 * Sahnenin çevresindeki yuvalar. Konumlar sahne kapsayıcısına göredir;
 * depth: imleç parallax çarpanı (negatif = ters yön).
 */
const SLOTS = [
  { kind: 'art', className: '-left-20 top-[6%] w-[24%]', rotate: -6, frame: 'siyah-ahsap', depth: 1 },
  { kind: 'art', className: '-right-6 top-[3%] w-[15%]', rotate: 4, frame: 'beyaz', mat: true, depth: -0.8 },
  { kind: 'art', className: '-right-8 bottom-[17%] w-[19%]', rotate: 5, frame: 'gold-metal', mat: true, depth: -1.6 },
  { kind: 'review', className: '-left-32 bottom-[21%] w-[min(260px,44%)]', rotate: -2, depth: 0.6 },
  { kind: 'review', className: '-right-4 top-[27%] w-[min(236px,40%)]', rotate: 2, depth: -1.1 },
];

const rand = (min, max) => min + Math.random() * (max - min);

/**
 * Hero sahnesinin çevresinde rastgele kaybolup yeniden beliren küçük eserler ve müşteri yorumları.
 * İçerik ilk render'da deterministiktir (hydration güvenli); rastgelelik yalnızca effect'lerde.
 */
export function HeroAmbient({ products, play, px, py }) {
  const reduce = useReducedMotion();
  const pools = useMemo(
    () => ({
      art: products.filter((p) => p.image && p.orientation !== 'yatay'),
      review: REVIEWS.map((r, i) => ({ ...r, id: `rev_${i}`, thumb: products.find((p) => p.slug === r.product)?.image })),
    }),
    [products],
  );

  // Her yuvaya başlangıçta farklı bir öğe
  const [picks, setPicks] = useState(() => {
    const counters = { art: 3, review: 0 }; // art: sahnede dönenlerle çakışmasın diye kaydır
    return SLOTS.map((s) => counters[s.kind]++);
  });
  const picksRef = useRef(picks);
  picksRef.current = picks;

  useEffect(() => {
    if (!play || reduce) return undefined;
    const timers = [];
    const schedule = (slot, delay) => {
      timers[slot] = setTimeout(() => {
        const { kind } = SLOTS[slot];
        const pool = pools[kind];
        if (pool.length > 1) {
          const inUse = new Set(SLOTS.map((s, i) => (s.kind === kind ? picksRef.current[i] % pool.length : -1)));
          let next = Math.floor(Math.random() * pool.length);
          for (let n = 0; n < pool.length && inUse.has(next); n++) next = (next + 1) % pool.length;
          setPicks((prev) => prev.map((v, i) => (i === slot ? next : v)));
        }
        schedule(slot, rand(4200, 8200));
      }, delay);
    };
    SLOTS.forEach((_, i) => schedule(i, rand(2200, 6500) + i * 400));
    return () => timers.forEach(clearTimeout);
  }, [play, reduce, pools]);

  return (
    <>
      {SLOTS.map((slot, i) => {
        const pool = pools[slot.kind];
        if (!pool.length) return null;
        const item = pool[picks[i] % pool.length];
        return (
          <Parallax key={i} px={px} py={py} depth={slot.depth} className={`pointer-events-none absolute z-10 hidden xl:block ${slot.className}`}>
            <AnimatePresence mode="wait">
              {play && (
                <motion.div
                  key={item.id}
                  className="pointer-events-auto"
                  initial={{ opacity: 0, scale: 0.82, rotate: slot.rotate * 2, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, scale: 1, rotate: slot.rotate, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 0.9, rotate: slot.rotate * 0.4, filter: 'blur(6px)' }}
                  transition={{ duration: 0.9, ease: EASE }}
                  whileHover={{ scale: 1.05, rotate: 0 }}
                >
                  {slot.kind === 'art' ? (
                    <FramedArt image={item.image} alt={item.title} frame={getFrame(slot.frame)} mat={slot.mat} ratio={3 / 4} thickness={slot.mat ? '4%' : '6%'} sizes="12vw" />
                  ) : (
                    <ReviewCard review={item} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </Parallax>
        );
      })}
    </>
  );
}

function Parallax({ px, py, depth, className, children }) {
  const x = useDepth(px, depth);
  const y = useDepth(py, depth);
  return (
    <motion.div className={className} style={{ x, y }}>
      {children}
    </motion.div>
  );
}

function useDepth(value, depth) {
  return useTransform(value, (v) => v * depth);
}

function ReviewCard({ review }) {
  return (
    <figure className="relative border border-line bg-canvas/95 p-5 shadow-[0_24px_50px_-24px_rgba(18,18,20,.45)] backdrop-blur-md">
      <span aria-hidden="true" className="absolute -top-5 right-4 font-display text-6xl leading-none text-accent/80">“</span>
      <div className="flex items-center gap-0.5 text-accent">
        {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-3 fill-current" />)}
      </div>
      <blockquote className="mt-2.5 line-clamp-3 font-display text-[15px] leading-snug 2xl:text-[17px] text-ink">{review.text}</blockquote>
      <figcaption className="mt-3.5 flex items-center gap-2.5">
        {review.thumb && (
          <span className="relative size-8 shrink-0 overflow-hidden rounded-full border border-line bg-surface">
            <Image src={review.thumb} alt="" fill sizes="32px" className="object-cover" />
          </span>
        )}
        <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
          {review.name} · {review.city}
        </span>
      </figcaption>
    </figure>
  );
}
