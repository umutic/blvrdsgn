/**
 * localStorage tabanlı minimal "veritabanı". YALNIZCA services/ katmanı tarafından kullanılır;
 * UI bileşenleri buraya doğrudan erişmez (CLAUDE.md §1.4).
 */
import { SEED_VERSION } from '@/config/storageKeys';

const isBrowser = () => typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const CHANGE_EVENT = 'blvrd:db-change';
const clone = (v) => JSON.parse(JSON.stringify(v));
const seedKey = (key) => `${key}__seed`;

/**
 * Koleksiyonu okur. Anahtar yoksa veya seed sürümü eskiyse seed verisini yazar.
 * @param {string} key
 * @param {any[] | (() => any[])} seed - dizi veya tembel üretici fonksiyon
 * @param {string} [version] - koleksiyona özel seed sürümü (yalnızca o koleksiyonu yeniler)
 */
export function readCollection(key, seed, version = SEED_VERSION) {
  const getSeed = () => clone(typeof seed === 'function' ? seed() : seed);
  if (!isBrowser()) return getSeed();
  const raw = window.localStorage.getItem(key);
  const upToDate = window.localStorage.getItem(seedKey(key)) === version;
  if (raw !== null && upToDate) {
    try {
      return JSON.parse(raw);
    } catch {
      // Bozuk veri → seed ile yeniden başlat.
    }
  }
  const fresh = getSeed();
  writeCollection(key, fresh, { silent: true });
  window.localStorage.setItem(seedKey(key), version);
  return fresh;
}

export function writeCollection(key, value, { silent = false } = {}) {
  if (!isBrowser()) return;
  window.localStorage.setItem(key, JSON.stringify(value));
  if (!silent) window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { key } }));
}

/** Aynı sekmede (custom event) ve diğer sekmelerde (storage event) değişiklikleri dinler. */
export function subscribeCollection(key, callback) {
  if (!isBrowser()) return () => {};
  const onCustom = (e) => e.detail?.key === key && callback();
  const onStorage = (e) => e.key === key && callback();
  window.addEventListener(CHANGE_EVENT, onCustom);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onCustom);
    window.removeEventListener('storage', onStorage);
  };
}
