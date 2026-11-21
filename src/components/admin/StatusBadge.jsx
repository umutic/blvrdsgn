import { Check, Clock, Printer, Truck } from 'lucide-react';

/** Sipariş durumu: ikon + etiket (renk tek başına anlam taşımaz). */
const MAP = {
  'Hazırlanıyor': { icon: Clock, cls: 'bg-zinc-100 text-zinc-700 ring-zinc-300' },
  'Baskı Aşamasında': { icon: Printer, cls: 'bg-sky-50 text-sky-800 ring-sky-200' },
  'Kargoya Verildi': { icon: Truck, cls: 'bg-indigo-50 text-indigo-800 ring-indigo-200' },
  'Teslim Edildi': { icon: Check, cls: 'bg-emerald-50 text-emerald-800 ring-emerald-200' },
};

export function StatusBadge({ status }) {
  const { icon: Icon, cls } = MAP[status] ?? { icon: Clock, cls: 'bg-[#F4F4F5] text-muted ring-line' };
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${cls}`}>
      <Icon className="size-3" strokeWidth={2} /> {status}
    </span>
  );
}
