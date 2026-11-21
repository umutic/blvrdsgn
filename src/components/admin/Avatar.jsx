const TINTS = ['bg-[#E2F3EA] text-[#123F2B]', 'bg-[#E3E8EE] text-[#2F4A63]', 'bg-[#E3EEEA] text-[#255345]', 'bg-[#EEE9F6] text-[#4A3A72]', 'bg-[#E9ECEF] text-[#3A4048]'];

export function Avatar({ name = '?', size = 'size-9', className = '' }) {
  const initials = name.split(' ').map((p) => p[0]).slice(0, 2).join('').toLocaleUpperCase('tr');
  const tint = TINTS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % TINTS.length];
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-full text-xs font-semibold ${size} ${tint} ${className}`}>{initials}</span>;
}
