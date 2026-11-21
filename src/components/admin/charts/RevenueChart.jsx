'use client';

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART } from './chartTokens';
import { formatCompactTL } from '@/utils/analytics';
import { formatTL } from '@/utils/pricing';

function RevenueTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-white px-3.5 py-2.5 text-[13px] shadow-lg">
      <p className="text-xs text-muted">{new Date(d.date).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      <p className="mt-1 font-semibold text-ink">{formatTL(d.revenue)}</p>
      <p className="text-xs text-muted">{d.orders} sipariş</p>
    </div>
  );
}

/** Günlük ciro — tek seri alan grafiği (2px çizgi, %10 dolgu, crosshair + ipucu). */
export function RevenueChart({ data }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={CHART.grid} strokeWidth={1} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: CHART.axis, fontSize: 11 }} interval="preserveStartEnd" minTickGap={28} dy={8} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: CHART.axis, fontSize: 11 }} tickFormatter={formatCompactTL} width={64} />
          <Tooltip content={<RevenueTooltip />} cursor={{ stroke: '#A1A1AA', strokeWidth: 1 }} />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={CHART.series}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            fill={CHART.series}
            fillOpacity={0.1}
            activeDot={{ r: 5, fill: CHART.series, stroke: CHART.surface, strokeWidth: 2 }}
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
