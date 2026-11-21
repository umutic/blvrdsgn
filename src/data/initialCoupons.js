/**
 * @typedef {Object} Coupon
 * @property {string} code
 * @property {string} description
 * @property {'percent'|'fixed'} type
 * @property {number} value
 * @property {number} minSubtotal
 * @property {number} minItems
 * @property {boolean} isActive
 */

/** @type {Coupon[]} */
export const INITIAL_COUPONS = [
  { code: 'HOSGELDIN15', description: 'Hoş geldin indirimi: %15', type: 'percent', value: 15, minSubtotal: 0, minItems: 0, isActive: true },
  { code: 'GALERI20', description: '750 TL ve üzeri siparişlerde %20', type: 'percent', value: 20, minSubtotal: 750, minItems: 0, isActive: true },
  { code: 'IKILISET', description: '2 ve üzeri posterde %25', type: 'percent', value: 25, minSubtotal: 0, minItems: 2, isActive: true },
];
