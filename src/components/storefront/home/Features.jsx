'use client';

import { motion } from 'framer-motion';
import { Frame, Printer, RotateCcw, Truck } from 'lucide-react';
import { Marquee } from '@/components/motion/Marquee';
import { REVIEWS } from '@/data/reviews';

const FEATURES = [
  { icon: Printer, title: 'Arşiv kalitesinde baskı', text: '12 renk pigment mürekkep, 200 yıl solmayan 310 gr müze kâğıdı.' },
  { icon: Frame, title: 'El yapımı çerçeve', text: 'Masif meşe, ceviz ve alüminyum; kırılmaz pleksi koruma.' },
  { icon: Truck, title: '1.000 TL üzeri ücretsiz kargo', text: 'Özel korumalı ambalajla 48 saat içinde kargoda.' },
  { icon: RotateCcw, title: '14 gün koşulsuz iade', text: 'Duvarınıza yakışmazsa, soru sormadan geri alıyoruz.' },
];


export function Features() {
  return (
    <section className="py-28">
      <div className="mx-auto grid max-w-[1440px] gap-px bg-line px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            className="group bg-canvas p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-6">
              <f.icon className="size-6" strokeWidth={1.5} />
            </span>
            <p className="mt-6 font-display text-2xl">{f.title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.text}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-24">
        <Marquee duration={60}>
          {REVIEWS.map((r) => (
            <figure key={r.name} className="mx-3 w-[380px] shrink-0 border border-line bg-surface p-8">
              <p className="text-accent">★★★★★</p>
              <blockquote className="mt-4 font-display text-[22px] leading-snug">“{r.text}”</blockquote>
              <figcaption className="mt-6 text-xs uppercase tracking-[0.2em] text-muted">{r.name} · {r.city}</figcaption>
            </figure>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
