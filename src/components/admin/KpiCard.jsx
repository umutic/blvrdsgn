'use client';

import { motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { Sparkline } from './charts/Sparkline';

/** Stat tile: etiket · değer · önceki döneme göre değişim (ikon + metin, yalnız renk değil) · sparkline. */
export function KpiCard({ label, value, delta, periodLabel, trend, icon: Icon, index = 0 }) {
  const up = delta != null && delta > 0.005;
  const down = delta != null && delta < -0.005;
  const DeltaIcon = up ? ArrowUpRight : down ? ArrowDownRight : Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 }}
      className="rounded-2xl border border-[#E4E4E7] bg-white p-5"
    >
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-muted">{label}</p>
        {Icon && (
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#F4F4F5] text-ink">
            <Icon className="size-4" strokeWidth={1.75} />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="whitespace-nowrap text-[26px] font-semibold leading-none tracking-tight text-ink tabular-nums">{value}</p>
        {trend && <span className="shrink-0"><Sparkline values={trend} width={72} height={30} /></span>}
      </div>
      {delta !== undefined && (
        <p className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium ${up ? 'bg-emerald-50 text-emerald-700' : down ? 'bg-red-50 text-red-700' : 'bg-[#F4F4F5] text-muted'}`}>
            <DeltaIcon className="size-3" />
            {delta == null ? '—' : `%${Math.abs(delta * 100).toFixed(1).replace('.', ',')}`}
          </span>
          <span className="truncate text-muted">{periodLabel}</span>
        </p>
      )}
    </motion.div>
  );
}
