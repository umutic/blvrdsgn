/**
 * Veri sağlayıcı seçimi.
 * 'local'    → seed + localStorage (varsayılan, sıfır kurulum)
 * 'supabase' → services/ içindeki Supabase implementasyonları (henüz taslak)
 */
export const DATA_PROVIDER = process.env.NEXT_PUBLIC_DATA_PROVIDER || 'local';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
