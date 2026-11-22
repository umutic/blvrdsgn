import { DATA_PROVIDER } from '@/config/env';
import { STORAGE_KEYS } from '@/config/storageKeys';
import { PERMISSIONS, normalizeMatrix } from '@/config/permissions';
import { readCollection, writeCollection, subscribeCollection } from './local/localDb';
import { createPendingSupabaseProvider } from './supabaseClient';

/**
 * Rol → yetki matrisi. Supabase'e geçişte role_permissions tablosu olur ve aynı kurallar
 * (RLS) sunucuda da uygulanmalıdır; istemci kontrolü tek başına güvenlik sağlamaz.
 */
const KEY = STORAGE_KEYS.ROLE_MATRIX;
const load = () => normalizeMatrix(readCollection(KEY, PERMISSIONS));

const localProvider = {
  async getMatrix() {
    return load();
  },
  async saveMatrix(matrix) {
    const clean = normalizeMatrix(matrix);
    writeCollection(KEY, clean);
    return clean;
  },
  async resetMatrix() {
    const clean = normalizeMatrix(PERMISSIONS);
    writeCollection(KEY, clean);
    return clean;
  },
  subscribe(callback) {
    return subscribeCollection(KEY, callback);
  },
};

export const roleService =
  DATA_PROVIDER === 'supabase'
    ? createPendingSupabaseProvider('roleService', Object.keys(localProvider))
    : localProvider;
