'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, animate } from 'framer-motion';
import { useUiStore } from '@/store/useUiStore';

const EASE = [0.76, 0, 0.24, 1];
const WORD = 'BLVRDSGN';

/**
 * Oturumun ilk ziyaretinde oynayan marka girişi. html[data-intro] layout.jsx'teki
 * satır içi script tarafından boyamadan önce ayarlanır, böylece içerik "parlamaz".
 */
export function IntroLoader() {
  const setIntroDone = useUiStore((s) => s.setIntroDone);
  const [active, setActive] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const html = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (html.dataset.intro !== '1' || reduce) {
      delete html.dataset.intro;
      setActive(false);
      setIntroDone();
      return undefined;
    }
    try {
      sessionStorage.setItem('blvrd_intro_seen', '1');
    } catch {}
    const controls = animate(0, 100, { duration: 1.6, ease: [0.65, 0, 0.35, 1], onUpdate: (v) => setProgress(Math.round(v)) });
    let t2;
    const t = setTimeout(() => {
      setActive(false);
      t2 = setTimeout(setIntroDone, 300); // Hero animasyonları perde kalkarken başlar.
    }, 2100);
    return () => {
      controls.stop();
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [setIntroDone]);

  return (
    <AnimatePresence onExitComplete={() => delete document.documentElement.dataset.intro}>
      {active && (
        <motion.div
          className="intro-overlay fixed inset-0 z-[100] flex-col items-center justify-center bg-canvas text-ink"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 1, ease: EASE }}
          style={{ clipPath: 'inset(0 0 0% 0)' }}
        >
          <div className="flex overflow-hidden font-display text-[14vw] leading-none tracking-[0.08em] md:text-[9vw]">
            {WORD.split('').map((ch, i) => (
              <motion.span
                key={i}
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.15 + i * 0.06 }}
              >
                {ch}
              </motion.span>
            ))}
          </div>
          <div className="mt-8 flex w-56 items-center gap-4 text-xs font-medium uppercase tracking-[0.2em] text-muted">
            <div className="h-px flex-1 bg-ink/10">
              <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
            </div>
            <span className="w-8 tabular-nums">{progress}</span>
          </div>
          <motion.p
            className="absolute bottom-10 text-xs font-medium uppercase tracking-[0.18em] text-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Poster & Duvar Sanatı
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
