import { DATA_PROVIDER } from '@/config/env';
import { STORAGE_KEYS } from '@/config/storageKeys';
import { readCollection, writeCollection, subscribeCollection } from './local/localDb';
import { createPendingSupabaseProvider } from './supabaseClient';
import { createId } from '@/utils/id';

/**
 * Yönetim paneli aktivite günlüğü (kim, ne zaman, ne yaptı).
 * Supabase'e geçişte yalnızca ekleme yapılabilen bir audit_log tablosu olmalıdır.
 */
const KEY = STORAGE_KEYS.AUDIT_LOG;
const MAX_ENTRIES = 300;

/** @typedef {'auth'|'user'|'role'|'order'} AuditCategory */

function seed(now = Date.now()) {
  const H = 3600000;
  const at = (hoursAgo) => new Date(now - hoursAgo * H).toISOString();
  return [
    { id: 'log_seed_5', at: at(7), category: 'auth', actor: { name: 'Kerem Aksoy', role: 'support' }, message: 'Panele giriş yaptı' },
    { id: 'log_seed_4', at: at(31), category: 'order', actor: { name: 'Satış Direktörü', role: 'sales_director' }, message: 'Sipariş durumunu güncelledi', target: 'Kargoya Verildi' },
    { id: 'log_seed_3', at: at(52), category: 'user', actor: { name: 'Sistem Yöneticisi', role: 'admin' }, message: 'Kullanıcıyı pasif yaptı', target: 'Naz Öztürk' },
    { id: 'log_seed_2', at: at(18 * 24), category: 'user', actor: { name: 'Sistem Yöneticisi', role: 'admin' }, message: 'Yeni kullanıcı ekledi', target: 'Kerem Aksoy · Müşteri Destek' },
    { id: 'log_seed_1', at: at(41 * 24), category: 'user', actor: { name: 'Sistem Yöneticisi', role: 'admin' }, message: 'Yeni kullanıcı ekledi', target: 'Ayşe Demir · Katalog & İçerik Editörü' },
  ];
}

const load = () => readCollection(KEY, () => seed());

const localProvider = {
  async getLogs() {
    return [...load()].sort((a, b) => b.at.localeCompare(a.at));
  },
  /**
   * @param {{ actor?: { name: string, role: string } | null, category: AuditCategory, message: string, target?: string }} entry
   */
  async log({ actor, category, message, target }) {
    const entry = {
      id: createId('log'),
      at: new Date().toISOString(),
      category,
      actor: actor ? { name: actor.name, role: actor.role } : null,
      message,
      ...(target ? { target } : {}),
    };
    writeCollection(KEY, [entry, ...load()].slice(0, MAX_ENTRIES));
    return entry;
  },
  subscribe(callback) {
    return subscribeCollection(KEY, callback);
  },
};

export const auditService =
  DATA_PROVIDER === 'supabase'
    ? createPendingSupabaseProvider('auditService', Object.keys(localProvider))
    : localProvider;
