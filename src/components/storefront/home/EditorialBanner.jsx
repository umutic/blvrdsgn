'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { CountUp } from '@/components/motion/CountUp';
import { SplitText } from '@/components/motion/Reveal';
import { SITE_MEDIA, unsplash } from '@/utils/media';

const STATS = [
  { to: 12000, suffix: '+', label: 'Dönüşen duvar' },
  { to: 4.9, decimals: 1, label: 'Ortalama puan' },
  { to: 48, suffix: ' sa', label: 'İçinde kargoda' },
  { to: 100, prefix: '%', label: 'Masif ahşap çerçeve' },
];

export function EditorialBanner() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-15%', '15%']);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1.25, 1.1, 1.25]);

  return (
    <section ref={ref} className="relative overflow-hidden text-canvas">
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <Image src={unsplash(SITE_MEDIA.galleryWall, { w: 2000 })} alt="" fill sizes="100vw" className="object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/30 to-black/20" />
      <div className="relative mx-auto flex min-h-[90vh] max-w-[1440px] flex-col justify-between px-6 py-24 lg:px-10">
        <p className="text-xs uppercase tracking-[0.2em] text-canvas/70">Atölyemizden</p>
        <h2 className="max-w-4xl font-display text-[clamp(2.8rem,6.5vw,6.5rem)] leading-[0.95]">
          <SplitText text={'Her duvarın anlatacak\nbir hikâyesi var.'} italicWords={['hikâyesi']} italicClassName="text-accent-light" />
        </h2>
        <div className="grid grid-cols-2 gap-8 border-t border-canvas/20 pt-10 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-display text-5xl md:text-6xl">
                <CountUp to={s.to} decimals={s.decimals ?? 0} suffix={s.suffix ?? ''} prefix={s.prefix ?? ''} />
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-canvas/60">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
