'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES, coverUrl } from '@/data/categories';
import { SplitText } from '@/components/motion/Reveal';

/** Dikey kaydırmayla yatay ilerleyen (sticky) koleksiyon şeridi. Mobilde yerel yatay kaydırma. */
export function CategoryRail() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);

  useLayoutEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      setDistance(Math.max(0, trackRef.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(trackRef.current);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const raw = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const x = useSpring(raw, { stiffness: 120, damping: 30, mass: 0.3 });
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <section ref={sectionRef} className="relative bg-canvas lg:h-[320vh]">
      <div className="flex flex-col justify-center overflow-hidden py-20 lg:sticky lg:top-0 lg:h-screen lg:py-0">
        <div className="mx-auto mb-12 flex w-full max-w-[1440px] items-end justify-between gap-6 px-6 lg:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">Koleksiyonlar · 08</p>
            <h2 className="mt-3 font-display text-[clamp(2.6rem,5vw,5rem)] leading-[0.95]">
              <SplitText text="Tarzınızı bulun." italicWords={['bulun']} />
            </h2>
          </div>
          <div className="hidden w-64 lg:block">
            <div className="h-px w-full bg-line">
              <motion.div className="h-full bg-ink" style={{ width: progress }} />
            </div>
            <p className="mt-3 text-right text-xs uppercase tracking-[0.2em] text-muted">Kaydırarak keşfedin</p>
          </div>
        </div>

        <motion.div
          ref={trackRef}
          style={{ x }}
          className="no-scrollbar flex gap-6 overflow-x-auto px-6 max-lg:!transform-none lg:overflow-visible lg:px-10"
        >
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.slug}
              href={`/koleksiyonlar/${c.slug}`}
              className="group relative w-[72vw] shrink-0 sm:w-[44vw] lg:w-[27vw]"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                <Image src={coverUrl(c, { w: 800, h: 1000 })} alt={c.name} fill sizes="(min-width:1024px) 27vw, 72vw" className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-80 transition-opacity duration-700 group-hover:opacity-100" />
                <span className="absolute left-5 top-5 text-xs tabular-nums tracking-[0.2em] text-white/80">0{i + 1}</span>
                <span className="absolute right-5 top-5 flex size-11 scale-0 items-center justify-center rounded-full bg-canvas text-ink transition-transform duration-500 group-hover:scale-100">
                  <ArrowUpRight className="size-4" />
                </span>
                <div className="absolute inset-x-5 bottom-5 text-white">
                  <p className="font-display text-[34px] leading-none">{c.name}</p>
                  <p className="mt-2 max-h-0 overflow-hidden text-sm text-white/80 transition-all duration-700 group-hover:max-h-12">{c.description}</p>
                </div>
              </div>
            </Link>
          ))}
          <Link href="/koleksiyonlar/tumu" className="group flex w-[72vw] shrink-0 items-center justify-center border border-line sm:w-[44vw] lg:w-[20vw]">
            <span className="text-center">
              <span className="mx-auto flex size-20 items-center justify-center rounded-full border border-ink transition-colors duration-500 group-hover:bg-ink group-hover:text-canvas">
                <ArrowUpRight className="size-6" />
              </span>
              <span className="mt-5 block font-display text-3xl">Tümünü gör</span>
            </span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
