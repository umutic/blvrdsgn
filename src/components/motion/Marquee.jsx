/** Sonsuz kayan bant. İçerik iki kez basılır, CSS animasyonu ile -%50 kaydırılır. */
export function Marquee({ children, duration = 40, reverse = false, className = '', pauseOnHover = true }) {
  return (
    <div className={`group relative flex overflow-hidden ${className}`}>
      <div
        className={`flex w-max shrink-0 ${reverse ? 'animate-marquee-reverse' : 'animate-marquee'} ${pauseOnHover ? 'group-hover:[animation-play-state:paused]' : ''}`}
        style={{ '--marquee-duration': `${duration}s` }}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">{children}</div>
      </div>
    </div>
  );
}
