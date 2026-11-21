'use client';

import { Bar, BarChart, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CHART } from './chartTokens';

function CatTooltip({ active, payload, format }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-[#E4E4E7] bg-white px-3.5 py-2.5 text-[13px] shadow-lg">
      <p className="font-medium text-ink">{d.name}</p>
      <p className="text-muted">{format(payload[0].value)}</p>
    </div>
  );
}

/** Kategori bazlı yatay çubuklar — tek seri, sıralı, değer çubuk ucunda. */
export function CategoryChart({ data, valueKey = 'revenue', format = (v) => v }) {
  const sorted = [...data].sort((a, b) => b[valueKey] - a[valueKey]);
  return (
    <div className="w-full" style={{ height: sorted.length * 38 + 10 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 72, left: 0, bottom: 0 }} barCategoryGap={12}>
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="name" width={150} tickLine={false} axisLine={false} tick={{ fill: CHART.textSecondary, fontSize: 12 }} />
          <Tooltip content={<CatTooltip format={format} />} cursor={{ fill: '#F5F5F6' }} />
          <Bar dataKey={valueKey} fill={CHART.series} barSize={14} radius={[0, 4, 4, 0]} animationDuration={900}>
            <LabelList dataKey={valueKey} position="right" formatter={format} style={{ fill: CHART.textSecondary, fontSize: 12 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
