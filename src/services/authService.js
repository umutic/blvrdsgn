import { DATA_PROVIDER } from '@/config/env';
import { DEMO_ADMIN_USERS } from '@/data/adminUsers';
import { createPendingSupabaseProvider } from './supabaseClient';

/**
 * Demo kimlik doğrulama. Supabase'e geçişte supabase.auth.signInWithPassword +
 * kullanıcı profilindeki rol alanı ile değiştirilecek.
 */
const localProvider = {
  async login(email, password) {
    const user = DEMO_ADMIN_USERS.find(
      (u) => u.email === String(email).trim().toLowerCase() && u.password === password
    );
    if (!user) throw new Error('E-posta veya şifre hatalı.');
    const { password: _omit, ...session } = user;
    return { ...session, loggedInAt: new Date().toISOString() };
  },
  async logout() {},
};

export const authService =
  DATA_PROVIDER === 'supabase'
    ? createPendingSupabaseProvider('authService', Object.keys(localProvider))
    : localProvider;
