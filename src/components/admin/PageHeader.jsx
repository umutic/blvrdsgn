export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Segmented({ options, value, onChange, layoutId }) {
  return (
    <div className="flex rounded-xl border border-[#E4E4E7] bg-white p-1">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} className={`relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${value === o.value ? 'text-white' : 'text-muted hover:text-ink'}`}>
          {value === o.value && <span className="absolute inset-0 rounded-lg bg-ink" data-layout={layoutId} />}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

export const btn = {
  primary: 'inline-flex h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-medium text-white transition hover:bg-ink/85 disabled:opacity-50',
  secondary: 'inline-flex h-10 items-center gap-2 rounded-xl border border-[#E4E4E7] bg-white px-4 text-sm font-medium transition hover:bg-[#F6F6F7] disabled:opacity-50',
};

export const input = 'h-10 w-full rounded-xl border border-[#E4E4E7] bg-white px-3 text-sm outline-none transition focus:border-ink/40 focus:ring-4 focus:ring-ink/5';
