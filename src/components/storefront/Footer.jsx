'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, AtSign } from 'lucide-react';
import { toast } from 'sonner';
import { CATEGORIES } from '@/data/categories';

export function Footer() {
  const onSubscribe = (e) => {
    e.preventDefault();
    e.currentTarget.reset();
    toast.success('Bültene kaydoldunuz. İlk mektup yolda!');
  };

  return (
    <footer className="grain relative overflow-hidden bg-night text-canvas">
      <div className="mx-auto max-w-[1440px] px-6 pt-24 lg:px-10">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-display text-5xl leading-[1.05]">
              Duvarınız için <em className="text-accent-light">mektuplar.</em>
            </p>
            <p className="mt-4 max-w-sm text-sm text-canvas/60">Yeni seçkiler, sanatçı hikâyeleri ve abonelere özel erken erişim. Ayda iki kez, asla spam yok.</p>
            <form onSubmit={onSubscribe} className="mt-8 flex max-w-md border-b border-canvas/30 focus-within:border-canvas">
              <input type="email" required placeholder="E-posta adresiniz" className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-canvas/40" />
              <button type="submit" aria-label="Kaydol" className="group px-2">
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          </div>
          <FooterCol title="Koleksiyonlar" className="lg:col-span-3 lg:col-start-7">
            {CATEGORIES.map((c) => (
              <li key={c.slug}><Link href={`/koleksiyonlar/${c.slug}`} className="link-underline text-canvas/70 hover:text-canvas">{c.name}</Link></li>
            ))}
          </FooterCol>
          <FooterCol title="Yardım" className="lg:col-span-2">
            <li><Link href="/siparis-takip" className="link-underline text-canvas/70 hover:text-canvas">Sipariş Takip</Link></li>
            <li><Link href="/favoriler" className="link-underline text-canvas/70 hover:text-canvas">Favorilerim</Link></li>
            <li><Link href="/odeme" className="link-underline text-canvas/70 hover:text-canvas">Ödeme</Link></li>
            <li><Link href="/admin/login" className="link-underline text-canvas/70 hover:text-canvas">Yönetici Girişi</Link></li>
          </FooterCol>
          <FooterCol title="Takip Edin" className="lg:col-span-2">
            <li className="flex items-center gap-2 text-canvas/70"><AtSign className="size-4" /> @blvrdsgn</li>
          </FooterCol>
        </div>
      </div>

      <motion.p
        className="mt-20 select-none whitespace-nowrap text-center font-display text-[19vw] font-semibold leading-[0.8] tracking-[0.04em] text-canvas/[0.06]"
        initial={{ y: '30%', opacity: 0 }}
        whileInView={{ y: '0%', opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
      >
        BLVRDSGN
      </motion.p>
      <div className="relative border-t border-canvas/10">
        <div className="mx-auto flex max-w-[1440px] flex-wrap justify-between gap-2 px-6 py-6 text-xs text-canvas/40 lg:px-10">
          <span>© 2026 BLVRDSGN. Tüm hakları saklıdır.</span>
          <span>Görseller: Unsplash (demo amaçlı)</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, className = '', children }) {
  return (
    <div className={className}>
      <p className="mb-5 text-xs uppercase tracking-[0.18em] text-canvas/40">{title}</p>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}
