import { SIZES } from '@/data/sizes';
import { FRAMES, MAT } from '@/data/frames';

export const FREE_SHIPPING_THRESHOLD = 1000;
export const SHIPPING_FEE = 89;

export const getSize = (id) => SIZES.find((s) => s.id === id) ?? SIZES[0];
export const getFrame = (id) => FRAMES.find((f) => f.id === id) ?? FRAMES[0];

/** Fiyatı "...9" ile biten en yakın üst değere yuvarlar (348.6 → 349). */
export function roundPrice(value) {
  return Math.ceil((value + 1) / 10) * 10 - 1;
}

/**
 * Tek bir varyantın birim fiyatı.
 * @param {number} basePrice - Ürünün 21×30 çerçevesiz fiyatı
 */
export function getUnitPrice(basePrice, sizeId, frameId, withMat = false) {
  const size = getSize(sizeId);
  const frame = getFrame(frameId);
  const poster = basePrice * size.priceMultiplier;
  const frameCost = frame.price * size.frameFactor;
  const matCost = withMat && frame.price > 0 ? MAT.price * size.frameFactor : 0;
  return roundPrice(poster + frameCost + matCost);
}

export function getStartingPrice(basePrice) {
  return getUnitPrice(basePrice, SIZES[0].id, FRAMES[0].id, false);
}

export function formatTL(value) {
  return `${new Intl.NumberFormat('tr-TR').format(Math.round(value || 0))} TL`;
}

/** Kupon koşulları sağlanmıyorsa 0 döner. */
export function calculateDiscount(subtotal, itemCount, coupon) {
  if (!coupon || !coupon.isActive) return 0;
  if (subtotal < (coupon.minSubtotal ?? 0) || itemCount < (coupon.minItems ?? 0)) return 0;
  if (coupon.type === 'fixed') return Math.min(coupon.value, subtotal);
  return Math.round((subtotal * coupon.value) / 100);
}

/** Sepet özetini hesaplar: ara toplam, indirim, kargo (1.000 TL barajı), toplam. */
export function calculateCartTotals(items = [], coupon = null) {
  const itemCount = items.reduce((n, i) => n + i.quantity, 0);
  const subtotal = items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);
  const discount = calculateDiscount(subtotal, itemCount, coupon);
  const afterDiscount = subtotal - discount;
  const shipping = itemCount === 0 || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return {
    itemCount,
    subtotal,
    discount,
    shipping,
    total: afterDiscount + shipping,
    remainingForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - afterDiscount),
    freeShippingProgress: Math.min(1, afterDiscount / FREE_SHIPPING_THRESHOLD),
  };
}
