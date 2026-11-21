'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

/** Kaydırmaya bağlı dikey parallax. speed: px cinsinden toplam kayma. */
export function Parallax({ children, speed = 120, className = '' }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [-speed / 2, speed / 2]);
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="h-full w-full">
        {children}
      </motion.div>
    </div>
  );
}
