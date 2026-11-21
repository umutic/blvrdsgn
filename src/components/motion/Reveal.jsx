'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const EASE = [0.16, 1, 0.3, 1];

/** Görünür alana girince yukarı kayarak beliren kapsayıcı. */
export function Reveal({ children, delay = 0, y = 40, className = '', as = 'div', once = true }) {
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-10% 0px' }}
      transition={{ duration: 1, ease: EASE, delay }}
    >
      {children}
    </Comp>
  );
}

/** Çocukları sırayla beliren grid/list kapsayıcısı. */
export function Stagger({ children, className = '', stagger = 0.08, as = 'div' }) {
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-10% 0px' }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
    >
      {children}
    </Comp>
  );
}

export const staggerItem = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

/**
 * Kelime kelime maskeli metin açılışı. text içinde '\n' satır kırar.
 * italicWords: italik + vurgu rengiyle yazılacak kelimeler.
 */
export function SplitText({ text, className = '', delay = 0, stagger = 0.06, italicWords = [], italicClassName = 'text-accent', start = true }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-5% 0px' });
  const play = start && inView;
  let index = 0;
  return (
    <span ref={ref} className={className} aria-label={text.replace(/\n/g, ' ')}>
      {text.split('\n').map((line, li) => (
        <span key={li} className="block" aria-hidden="true">
          {line.split(' ').map((word, wi) => {
            const i = index++;
            const italic = italicWords.includes(word.replace(/[.,!?]/g, ''));
            return (
              <span key={wi} className="-my-[0.2em] inline-block overflow-hidden py-[0.2em] align-top">
                <motion.span
                  className={`inline-block ${italic ? `italic ${italicClassName}` : ''}`}
                  initial={{ y: '110%', rotate: 4 }}
                  animate={play ? { y: '0%', rotate: 0 } : undefined}
                  transition={{ duration: 1.1, ease: EASE, delay: delay + i * stagger }}
                >
                  {word}
                </motion.span>
                {' '}
              </span>
            );
          })}
        </span>
      ))}
    </span>
  );
}
