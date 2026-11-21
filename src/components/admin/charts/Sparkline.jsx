import { CHART } from './chartTokens';

/** Mini trend: geçmiş de-emphasis tonda, son dönem vurgu renginde. */
export function Sparkline({ values, width = 120, height = 36 }) {
  if (!values?.length) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const step = width / Math.max(1, values.length - 1);
  const pts = values.map((v, i) => [i * step, height - 4 - ((v - min) / (max - min || 1)) * (height - 8)]);
  const line = (arr) => arr.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" className="overflow-visible">
      <path d={line(pts.slice(0, -1))} fill="none" stroke={CHART.deemphasis} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <path d={line(pts.slice(-2))} fill="none" stroke={CHART.series} strokeWidth={2} strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={4} fill={CHART.series} stroke={CHART.surface} strokeWidth={2} />
    </svg>
  );
}
