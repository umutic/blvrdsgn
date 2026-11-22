import { DATA_PROVIDER } from '@/config/env';
import { STORAGE_KEYS } from '@/config/storageKeys';
import { ROLES, ROLE_LABELS } from '@/config/permissions';
import { generateSeedUsers } from '@/data/adminUsers';
import { readCollection, writeCollection, subscribeCollection } from './local/localDb';
import { createPendingSupabaseProvider } from './supabaseClient';
import { createId } from '@/utils/id';

/**
 * Yönetim paneli kullanıcıları. Supabase'e geçişte auth.users + profiles(role, is_active)
 * tablosu ve yalnızca MANAGE_USERS yetkisine izin veren RLS politikalarıyla değiştirilir.
 * UI'a asla şifre döndürülmez.
 */
const KEY = STORAGE_KEYS.ADMIN_USERS;
const load = () => readCollection(KEY, () => generateSeedUsers());
const normalizeEmail = (email) => String(email || '').trim().toLocaleLowerCase('tr');
const isEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const strip = ({ password: _omit, ...user }) => user;
export const MIN_PASSWORD = 6;

function assertRole(role) {
  if (!ROLE_LABELS[role]) throw new Error('Geçersiz rol.');
}

function assertPassword(password) {
  if (String(password || '').length < MIN_PASSWORD) throw new Error(`Şifre en az ${MIN_PASSWORD} karakter olmalıdır.`);
}

/** Değişiklik sonrası en az bir aktif Sistem Yöneticisi kalmalı. */
function assertAdminRemains(users) {
  if (!users.some((u) => u.role === ROLES.ADMIN && u.isActive)) {
    throw new Error('En az bir aktif Sistem Yöneticisi bulunmalıdır.');
  }
}

const localProvider = {
  async getAllUsers() {
    return load()
      .map(strip)
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''));
  },

  async getUserById(id) {
    const user = load().find((u) => u.id === id);
    return user ? strip(user) : null;
  },

  /** Giriş doğrulaması (yalnızca authService kullanır). */
  async authenticate(email, password) {
    const users = load();
    const user = users.find((u) => u.email === normalizeEmail(email) && u.password === password);
    if (!user) throw new Error('E-posta veya şifre hatalı.');
    if (!user.isActive) throw new Error('Hesabınız pasif durumda. Lütfen sistem yöneticisiyle iletişime geçin.');
    user.lastLoginAt = new Date().toISOString();
    writeCollection(KEY, users);
    return strip(user);
  },

  async createUser({ name, email, role, password }) {
    const users = load();
    const cleanEmail = normalizeEmail(email);
    if (!String(name || '').trim()) throw new Error('Ad soyad zorunludur.');
    if (!isEmail(cleanEmail)) throw new Error('Geçerli bir e-posta girin.');
    if (users.some((u) => u.email === cleanEmail)) throw new Error('Bu e-posta ile kayıtlı bir kullanıcı zaten var.');
    assertRole(role);
    assertPassword(password);
    const user = {
      id: createId('usr'),
      name: String(name).trim(),
      email: cleanEmail,
      password,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLoginAt: null,
    };
    writeCollection(KEY, [...users, user]);
    return strip(user);
  },

  /** patch: { name?, email?, role?, isActive? } */
  async updateUser(id, patch) {
    const users = load();
    if (!users.some((u) => u.id === id)) throw new Error('Kullanıcı bulunamadı.');
    const clean = {};
    if (patch.role !== undefined) {
      assertRole(patch.role);
      clean.role = patch.role;
    }
    if (patch.isActive !== undefined) clean.isActive = Boolean(patch.isActive);
    if (patch.name !== undefined) {
      if (!String(patch.name).trim()) throw new Error('Ad soyad zorunludur.');
      clean.name = String(patch.name).trim();
    }
    if (patch.email !== undefined) {
      const cleanEmail = normalizeEmail(patch.email);
      if (!isEmail(cleanEmail)) throw new Error('Geçerli bir e-posta girin.');
      if (users.some((u) => u.id !== id && u.email === cleanEmail)) throw new Error('Bu e-posta başka bir kullanıcıya ait.');
      clean.email = cleanEmail;
    }
    const next = users.map((u) => (u.id === id ? { ...u, ...clean } : u));
    assertAdminRemains(next);
    writeCollection(KEY, next);
    return strip(next.find((u) => u.id === id));
  },

  async resetPassword(id, password) {
    assertPassword(password);
    const users = load();
    const user = users.find((u) => u.id === id);
    if (!user) throw new Error('Kullanıcı bulunamadı.');
    user.password = password;
    writeCollection(KEY, users);
  },

  async deleteUser(id) {
    const users = load();
    const next = users.filter((u) => u.id !== id);
    if (next.length === users.length) throw new Error('Kullanıcı bulunamadı.');
    assertAdminRemains(next);
    writeCollection(KEY, next);
  },

  subscribe(callback) {
    return subscribeCollection(KEY, callback);
  },
};

export const userService =
  DATA_PROVIDER === 'supabase'
    ? createPendingSupabaseProvider('userService', Object.keys(localProvider))
    : localProvider;
