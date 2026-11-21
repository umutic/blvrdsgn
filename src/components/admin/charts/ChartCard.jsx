'use client';

import { useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';

/**
 * Grafik kartı: başlık, alt başlık, sağ üst aksiyonlar ve Grafik/Tablo geçişi.
 * table: { columns: string[], rows: (string|number)[][] } — erişilebilir tablo görünümü.
 */
export function ChartCard({ title, subtitle, actions, table, children, className = '' }) {
  const [view, setView] = useState('chart');
  return (
    <section className={`rounded-2xl border border-[#E4E4E7] bg-white p-6 ${className}`}>
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[13px] text-muted">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {actions}
          {table && (
            <div className="flex rounded-lg bg-[#F4F4F5] p-0.5" role="tablist" aria-label="Görünüm">
              {[
                ['chart', BarChart3, 'Grafik'],
                ['table', Table2, 'Tablo'],
              ].map(([id, Icon, label]) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={view === id}
                  aria-label={label}
                  title={label}
                  onClick={() => setView(id)}
                  className={`rounded-md p-1.5 transition ${view === id ? 'bg-white text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
                >
                  <Icon className="size-3.5" />
                </button>
              ))}
            </div>
          )}
        </div>
      </header>
      {view === 'table' && table ? (
        <div className="max-h-[320px] overflow-auto" data-lenis-prevent>
          <table className="w-full text-[13px]">
            <thead className="sticky top-0 bg-white text-left text-xs text-muted">
              <tr>{table.columns.map((c, i) => <th key={c} className={`pb-2 font-medium ${i ? 'text-right' : ''}`}>{c}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFF1]">
              {table.rows.map((r, ri) => (
                <tr key={ri}>{r.map((v, i) => <td key={i} className={`py-2 ${i ? 'text-right tabular-nums' : ''}`}>{v}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        children
      )}
    </section>
  );
}
