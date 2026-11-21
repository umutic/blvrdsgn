'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { STATUS_RAMP } from './chartTokens';

/**
 * Sipariş aşamaları — tek bütünün parçaları: segmentli çubuk (2px boşluk) + her zaman görünen gösterge.
 * Aşamalar sıralı olduğu için tek tonlu ordinal rampa kullanılır.
 */
export function StatusBreakdown({ statuses, counts }) {
  const [hover, setHover] = useState(null);
  const total = statuses.reduce((n, s) => n + (counts[s] ?? 0), 0) || 1;

  return (
    <div>
      <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full">
        {statuses.map((s, i) => {
          const pct = ((counts[s] ?? 0) / total) * 100;
          if (!pct) return null;
          return (
            <motion.div
              key={s}
              title={`${s}: ${counts[s]}`}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(null)}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%`, opacity: hover && hover !== s ? 0.45 : 1 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
              style={{ background: STATUS_RAMP[i] }}
              className="h-full first:rounded-l-full last:rounded-r-full"
            />
          );
        })}
      </div>
      <ul className="mt-5 space-y-2.5">
        {statuses.map((s, i) => (
          <li key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(null)} className={`flex items-center justify-between text-[13px] transition-opacity ${hover && hover !== s ? 'opacity-50' : ''}`}>
            <span className="flex items-center gap-2.5 text-ink">
              <span className="size-2.5 rounded-sm" style={{ background: STATUS_RAMP[i] }} />
              {s}
            </span>
            <span className="tabular-nums text-muted">
              <span className="font-medium text-ink">{counts[s] ?? 0}</span> · %{Math.round(((counts[s] ?? 0) / total) * 100)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
