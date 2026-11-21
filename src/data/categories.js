import { unsplash } from '@/utils/media';

export const CATEGORIES = [
  { slug: 'minimalist', name: 'Minimalist', description: 'Sade çizgiler, nefes alan kompozisyonlar.', cover: '1522743791393-522312deeebf' },
  { slug: 'soyut', name: 'Soyut', description: 'Renk, form ve dokunun özgür dansı.', cover: '1760292343776-e8e35bb469c6' },
  { slug: 'tipografi', name: 'Tipografi', description: 'Duvarınıza söz söyleten harfler.', cover: null, coverLocal: '/posters/bugun-guzel-bir-gun.svg' },
  { slug: 'botanik', name: 'Botanik & Doğa', description: 'Yapraklar, çiçekler ve doğanın ritmi.', cover: '1727527248663-5b0c475061b9' },
  { slug: 'mimari', name: 'Mimari & Şehir', description: 'Siluetler, cepheler ve şehir hikâyeleri.', cover: '1524231757912-21f4fe3a7200' },
  { slug: 'retro', name: 'Retro & Vintage', description: 'Geçmişin afişlerinden modern yorumlar.', cover: '1584448097764-374f81551427' },
  { slug: 'islami', name: 'İslami Sanat & Modern Hat', description: 'Geleneksel geometri ve hattın çağdaş yorumu.', cover: '1739478469935-65b0ac94355c' },
  { slug: 'cocuk', name: 'Çocuk Odası', description: 'Hayal gücünü besleyen neşeli posterler.', cover: '1761398601374-490e91b95818' },
];

export const ROOMS = [
  { slug: 'salon', name: 'Salon', cover: '1631679706909-1844bbd07221' },
  { slug: 'yatak-odasi', name: 'Yatak Odası', cover: '1615874959474-d609969a20ed' },
  { slug: 'calisma-odasi', name: 'Çalışma Odası', cover: '1600494603989-9650cf6ddd3d' },
  { slug: 'cocuk-odasi', name: 'Çocuk Odası', cover: '1761398601374-490e91b95818' },
  { slug: 'mutfak', name: 'Mutfak', cover: '1487700160041-babef9c3cb55' },
];

export const ORIENTATIONS = [
  { value: 'dikey', label: 'Dikey' },
  { value: 'yatay', label: 'Yatay' },
];

export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug);
export const getRoom = (slug) => ROOMS.find((r) => r.slug === slug);

/** Kategori/oda kapak görseli URL'si */
export function coverUrl(item, { w = 900, h = 1200 } = {}) {
  if (!item) return '';
  if (item.coverLocal) return item.coverLocal;
  return unsplash(item.cover, { w, h });
}
