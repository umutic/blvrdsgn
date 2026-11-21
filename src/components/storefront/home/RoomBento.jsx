'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { ROOMS, coverUrl } from '@/data/categories';
import { SplitText } from '@/components/motion/Reveal';

const LAYOUT = ['md:col-span-2 md:row-span-2', '', '', 'md:col-span-1', ''];

export function RoomBento() {
  return (
    <section className="mx-auto max-w-[1440px] px-6 py-28 lg:px-10">
      <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted">Yaşam Alanları</p>
          <h2 className="mt-3 font-display text-[clamp(2.6rem,5vw,5rem)] leading-[0.95]">
            <SplitText text="Her oda için bir hikâye." italicWords={['hikâye']} />
          </h2>
        </div>
        <p className="max-w-sm text-muted">Mekânın ışığına ve ruhuna göre seçilmiş kombinler. Salondan çocuk odasına.</p>
      </div>
      <div className="grid auto-rows-[260px] grid-cols-2 gap-4 md:grid-cols-4 md:auto-rows-[300px]">
        {ROOMS.map((r, i) => (
          <motion.div
            key={r.slug}
            className={`${LAYOUT[i]} ${i === 0 ? 'col-span-2' : ''}`}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
          >
            <Link href={`/koleksiyonlar/${r.slug}`} className="group relative block h-full overflow-hidden bg-surface">
              <Image src={coverUrl(r, { w: i === 0 ? 1200 : 700, h: i === 0 ? 1200 : 700 })} alt={r.name} fill sizes={i === 0 ? '50vw' : '25vw'} className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between text-white">
                <p className={`font-display leading-none ${i === 0 ? 'text-5xl' : 'text-3xl'}`}>{r.name}</p>
                <span className="flex size-10 items-center justify-center rounded-full border border-white/50 transition-all duration-500 group-hover:rotate-45 group-hover:border-white group-hover:bg-white group-hover:text-ink">
                  <ArrowUpRight className="size-4" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
