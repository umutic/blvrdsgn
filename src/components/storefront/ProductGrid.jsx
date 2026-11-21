'use client';

import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';

const EASE = [0.16, 1, 0.3, 1];

export function ProductGrid({ products, columns = 'lg:grid-cols-4' }) {
  return (
    <motion.div layout className={`grid grid-cols-2 gap-x-5 gap-y-12 ${columns}`}>
      {products.map((p, i) => (
        <motion.div
          key={p.id}
          layout
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-5% 0px' }}
          transition={{ duration: 0.9, ease: EASE, delay: (i % 4) * 0.08 }}
        >
          <ProductCard product={p} priority={i < 4} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-surface" />
          <div className="mt-4 h-4 w-2/3 bg-surface" />
          <div className="mt-2 h-3 w-1/3 bg-surface" />
        </div>
      ))}
    </div>
  );
}
