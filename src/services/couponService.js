import { DATA_PROVIDER } from '@/config/env';
import { STORAGE_KEYS } from '@/config/storageKeys';
import { INITIAL_COUPONS } from '@/data/initialCoupons';
import { readCollection, writeCollection, subscribeCollection } from './local/localDb';
import { createPendingSupabaseProvider } from './supabaseClient';
import { formatTL } from '@/utils/pricing';

const KEY = STORAGE_KEYS.COUPONS;
const load = () => readCollection(KEY, INITIAL_COUPONS);
const normalize = (code) => String(code || '').trim().toUpperCase();

const localProvider = {
  async getAllCoupons() {
    return load();
  },
  /**
   * @returns {Promise<{ valid: boolean, coupon?: object, message: string }>}
   */
  async validateCoupon(code, { subtotal = 0, itemCount = 0 } = {}) {
    const coupon = load().find((c) => c.code === normalize(code));
    if (!coupon) return { valid: false, message: 'Kupon kodu bulunamadı.' };
    if (!coupon.isActive) return { valid: false, message: 'Bu kupon şu anda aktif değil.' };
    if (subtotal < coupon.minSubtotal)
      return { valid: false, message: `Bu kupon ${formatTL(coupon.minSubtotal)} ve üzeri siparişlerde geçerlidir.` };
    if (itemCount < coupon.minItems)
      return { valid: false, message: `Bu kupon en az ${coupon.minItems} ürün için geçerlidir.` };
    return { valid: true, coupon, message: `${coupon.code} uygulandı: ${coupon.description}` };
  },
  async createCoupon(input) {
    const coupons = load();
    const code = normalize(input.code);
    if (!code) throw new Error('Kupon kodu zorunludur.');
    if (coupons.some((c) => c.code === code)) throw new Error('Bu kupon kodu zaten mevcut.');
    const coupon = {
      type: 'percent',
      minSubtotal: 0,
      minItems: 0,
      isActive: true,
      ...input,
      code,
      value: Number(input.value),
      minSubtotal: Number(input.minSubtotal || 0),
      minItems: Number(input.minItems || 0),
    };
    writeCollection(KEY, [...coupons, coupon]);
    return coupon;
  },
  async setCouponActive(code, isActive) {
    const coupons = load().map((c) => (c.code === normalize(code) ? { ...c, isActive } : c));
    writeCollection(KEY, coupons);
  },
  subscribe(callback) {
    return subscribeCollection(KEY, callback);
  },
};

export const couponService =
  DATA_PROVIDER === 'supabase'
    ? createPendingSupabaseProvider('couponService', Object.keys(localProvider))
    : localProvider;
