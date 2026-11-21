/**
 * Unsplash CDN URL üreticisi. Tüm kimlikler unsplash.com'daki herkese açık arama
 * sayfalarından alınmış ve CDN'de doğrulanmıştır.
 *
 * ÖNEMLİ: Unsplash lisansı fotoğrafların değiştirilmeden baskı olarak satılmasına
 * izin vermez. Bu görseller yalnızca demo/yer tutucu amaçlıdır; canlıda kendi
 * lisanslı eserlerinizle değiştirin.
 */
export function unsplash(id, { w = 1200, h, q = 80 } = {}) {
  const params = new URLSearchParams({ auto: 'format', fit: 'crop', crop: 'center', w: String(w), q: String(q) });
  if (h) params.set('h', String(h));
  return `https://images.unsplash.com/photo-${id}?${params.toString()}`;
}

/** Site genelindeki editoryal görseller (ürün olmayan). */
export const SITE_MEDIA = {
  heroRoom: '1663296766506-f95f7d8c87af', // beyaz duvar & vazolar
  heroLiving: '1583847268964-b28dc8f51f92', // pencereli salon
  galleryWall: '1771287490586-356754be24dc', // koltuk üstünde altı çerçeve
  livingTall: '1784790601988-7915393bc5a1', // uzun salon, soyut tablo
  loginSide: '1616486029423-aaa4789e8c9a', // duvar sanatlı yatak odası
  studioTeaser: '1625585598750-3535fe40efb3', // boş beyaz oda, sandalye
};
