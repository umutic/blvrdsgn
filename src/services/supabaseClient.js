import { isSupabaseConfigured, SUPABASE_URL, SUPABASE_ANON_KEY } from '@/config/env';

/**
 * Supabase istemci taslağı.
 * Etkinleştirmek için:
 *   1) npm install @supabase/supabase-js
 *   2) .env.local → NEXT_PUBLIC_DATA_PROVIDER=supabase, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   3) Aşağıdaki yorumu açıp services/*Service.js içindeki `supabase` sağlayıcılarını doldurun.
 *
 * import { createClient } from '@supabase/supabase-js';
 * export const supabase = isSupabaseConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;
 */
export const supabase = null;
export const supabaseConfig = { isSupabaseConfigured, url: SUPABASE_URL, hasKey: Boolean(SUPABASE_ANON_KEY) };

/**
 * Henüz yazılmamış Supabase sağlayıcısı için yer tutucu: her metot açık bir hata fırlatır.
 * subscribe() ise sessizce no-op döner.
 */
export function createPendingSupabaseProvider(serviceName, methodNames) {
  return Object.fromEntries(
    methodNames.map((name) => [
      name,
      name === 'subscribe'
        ? () => () => {}
        : async () => {
            throw new Error(`[${serviceName}.${name}] Supabase sağlayıcısı henüz uygulanmadı. DATA_PROVIDER='local' kullanın.`);
          },
    ])
  );
}
