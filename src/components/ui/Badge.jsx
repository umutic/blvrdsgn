const TONES = {
  neutral: 'bg-surface text-ink',
  dark: 'bg-ink text-canvas',
  accent: 'bg-accent text-white',
  success: 'bg-emerald-50 text-emerald-800',
  warning: 'bg-amber-50 text-amber-800',
  info: 'bg-sky-50 text-sky-800',
};

export function Badge({ tone = 'neutral', className = '', children }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}
