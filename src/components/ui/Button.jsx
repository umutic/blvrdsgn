import Link from 'next/link';

const VARIANTS = {
  primary: 'bg-ink text-canvas hover:bg-accent',
  secondary: 'bg-surface text-ink hover:bg-line',
  outline: 'border border-ink text-ink hover:bg-ink hover:text-canvas',
  ghost: 'text-ink hover:bg-surface',
  danger: 'bg-red-700 text-white hover:bg-red-800',
};

const SIZES = {
  sm: 'h-9 px-3 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-14 px-8 text-[13px]',
};

export function Button({ href, variant = 'primary', size = 'md', className = '', ...props }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-full font-medium uppercase tracking-[0.14em] transition-colors duration-300 disabled:pointer-events-none disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`;
  if (href) return <Link href={href} className={cls} {...props} />;
  return <button type="button" className={cls} {...props} />;
}
