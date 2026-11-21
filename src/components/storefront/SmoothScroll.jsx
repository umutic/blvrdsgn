'use client';

import { ReactLenis } from 'lenis/react';

/** Vitrin genelinde akıcı (inertial) kaydırma. */
export function SmoothScroll({ children }) {
  return (
    <ReactLenis root options={{ lerp: 0.09, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
