/**
 * Standart boyutlar. Fiyat = ürün.basePrice × priceMultiplier (+ çerçeve × frameFactor).
 * previewScale: oda önizlemesinde posterin kısa kenarının sahne genişliğine oranı.
 */
export const SIZES = [
  { id: '21x30', label: '21 × 30 cm', width: 21, height: 30, priceMultiplier: 1, frameFactor: 1, previewScale: 0.18 },
  { id: '30x40', label: '30 × 40 cm', width: 30, height: 40, priceMultiplier: 1.4, frameFactor: 1.3, previewScale: 0.23 },
  { id: '50x70', label: '50 × 70 cm', width: 50, height: 70, priceMultiplier: 2.2, frameFactor: 1.9, previewScale: 0.31 },
  { id: '70x100', label: '70 × 100 cm', width: 70, height: 100, priceMultiplier: 3.2, frameFactor: 2.6, previewScale: 0.4 },
];
