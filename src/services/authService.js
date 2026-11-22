import { DATA_PROVIDER } from '@/config/env';
import { createPendingSupabaseProvider } from './supabaseClient';
import { userService } from './userService';
import { auditService } from './auditService';

/**
 * Demo kimlik doğrulama: kullanıcılar userService koleksiyonundan doğrulanır, böylece
 * panelden eklenen/pasif yapılan kullanıcılar girişe anında yansır. Supabase'e geçişte
 * supabase.auth.signInWithPassword + profiles.role / profiles.is_active ile değiştirilecek.
 */
const localProvider = {
  async login(email, password) {
    const user = await userService.authenticate(email, password);
    await auditService.log({ actor: user, category: 'auth', message: 'Panele giriş yaptı' });
    return { id: user.id, name: user.name, email: user.email, role: user.role, loggedInAt: new Date().toISOString() };
  },
  async logout() {},
};

export const authService =
  DATA_PROVIDER === 'supabase'
    ? createPendingSupabaseProvider('authService', Object.keys(localProvider))
    : localProvider;
