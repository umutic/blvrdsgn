'use client';

import { useEffect, useState } from 'react';

/** localStorage okuyan bileşenlerde SSR hydration uyumsuzluğunu önler. */
export function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
