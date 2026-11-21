import { Marquee } from '@/components/motion/Marquee';

const ROW_A = ['Minimalist', 'Soyut', 'Tipografi', 'Botanik', 'Mimari'];
const ROW_B = ['Retro', 'Modern Hat', 'Geometri', 'Çocuk Odası', 'Fotoğraf'];

export function BigMarquee() {
  return (
    <section className="overflow-hidden border-y border-line bg-canvas py-10">
      <Marquee duration={50} className="font-display text-[clamp(3rem,8vw,7.5rem)] leading-none">
        {ROW_A.map((w) => (
          <span key={w} className="flex items-center px-8">
            <span className="italic">{w}</span>
            <span className="ml-16 text-[0.4em] text-accent">✦</span>
          </span>
        ))}
      </Marquee>
      <Marquee duration={55} reverse className="mt-2 font-display text-[clamp(3rem,8vw,7.5rem)] leading-none text-transparent [-webkit-text-stroke:1px_#121214]">
        {ROW_B.map((w) => (
          <span key={w} className="flex items-center px-8">
            {w}
            <span className="ml-16 text-[0.4em] text-accent [-webkit-text-stroke:0]">✦</span>
          </span>
        ))}
      </Marquee>
    </section>
  );
}
