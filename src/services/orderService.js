import { DATA_PROVIDER } from '@/config/env';
import { SEED_VERSION, STORAGE_KEYS } from '@/config/storageKeys';
import { generateSeedOrders, ORDER_STATUSES } from '@/data/initialOrders';
import { readCollection, writeCollection, subscribeCollection } from './local/localDb';
import { createPendingSupabaseProvider } from './supabaseClient';
import { createOrderNumber } from '@/utils/id';

export { ORDER_STATUSES };

const KEY = STORAGE_KEYS.ORDERS;
// Sipariş seed'ine özel sürüm: hediye alanı eklendiğinde yalnızca örnek siparişler yenilenir.
const ORDERS_SEED_VERSION = `${SEED_VERSION}.gift-1`;
const load = () => readCollection(KEY, () => generateSeedOrders(), ORDERS_SEED_VERSION);

const localProvider = {
  async getAllOrders() {
    return [...load()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async getOrderById(id) {
    const needle = String(id).trim().toUpperCase();
    return load().find((o) => o.id === needle) ?? null;
  },
  /**
   * Not: Supabase'e geçildiğinde toplamlar sunucu tarafında yeniden hesaplanmalıdır.
   */
  async createOrder(payload) {
    const orders = load();
    let id = createOrderNumber();
    while (orders.some((o) => o.id === id)) id = createOrderNumber();
    const order = {
      ...payload,
      id,
      status: ORDER_STATUSES[0],
      createdAt: new Date().toISOString(),
      statusHistory: [{ status: ORDER_STATUSES[0], at: new Date().toISOString() }],
    };
    writeCollection(KEY, [order, ...orders]);
    return order;
  },
  async updateOrderStatus(id, status) {
    if (!ORDER_STATUSES.includes(status)) throw new Error('Geçersiz sipariş durumu');
    const orders = load();
    const order = orders.find((o) => o.id === id);
    if (!order) throw new Error('Sipariş bulunamadı');
    order.status = status;
    order.statusHistory = [...(order.statusHistory ?? []), { status, at: new Date().toISOString() }];
    writeCollection(KEY, orders);
    return order;
  },
  subscribe(callback) {
    return subscribeCollection(KEY, callback);
  },
};

export const orderService =
  DATA_PROVIDER === 'supabase'
    ? createPendingSupabaseProvider('orderService', Object.keys(localProvider))
    : localProvider;
