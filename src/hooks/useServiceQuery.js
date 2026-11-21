'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Bir servis metodunu çağırır ve ilgili koleksiyon değiştiğinde (admin güncellemesi,
 * başka sekme vb.) otomatik yeniden yükler.
 *
 * @param {() => Promise<any>} fetcher
 * @param {(cb: () => void) => () => void} [subscribe] - örn. productService.subscribe
 * @param {any[]} [deps]
 */
export function useServiceQuery(fetcher, subscribe, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState((s) => ({ ...s, loading: false, error }));
    }
  }, deps);

  useEffect(() => {
    load();
    return subscribe ? subscribe(load) : undefined;
  }, [load, subscribe]);

  return { ...state, refresh: load };
}
