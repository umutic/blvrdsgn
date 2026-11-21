'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, EyeOff, Palette, ShieldCheck, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { getDefaultAdminRoute, ROLE_LABELS } from '@/config/permissions';
import { DEMO_ADMIN_USERS } from '@/data/adminUsers';
import { SITE_MEDIA, unsplash } from '@/utils/media';
import { input } from '@/components/admin/PageHeader';

const ROLE_META = {
  admin: { icon: ShieldCheck, desc: 'Tüm sayfalar, silme, kupon ve ayarlar' },
  sales_director: { icon: TrendingUp, desc: 'Ciro raporları ve sipariş yönetimi' },
  catalog_editor: { icon: Palette, desc: 'Ürün kataloğu ve içerik düzenleme' },
};
const EASE = [0.16, 1, 0.3, 1];

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(null);
  const { register, handleSubmit } = useForm();

  const doLogin = async (email, password, key = 'form') => {
    setError('');
    setBusy(key);
    try {
      const session = await login(email, password);
      toast.success(`Hoş geldiniz, ${session.name}`);
      router.replace(getDefaultAdminRoute(session.role));
    } catch (err) {
      setError(err.message);
      setBusy(null);
    }
  };

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-night lg:block">
        <motion.div className="absolute inset-0" initial={{ scale: 1.15 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: EASE }}>
          <Image src={unsplash(SITE_MEDIA.loginSide, { w: 1400, h: 1800 })} alt="" fill sizes="50vw" priority className="object-cover opacity-70" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/30 to-night/40" />
        <div className="relative flex h-full flex-col justify-between p-12 text-canvas">
          <Link href="/" className="font-display text-3xl font-semibold tracking-[0.2em]">BLVRDSGN</Link>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.3 }}>
            <p className="max-w-md font-display text-5xl leading-[1.05]">Mağazanızın tüm hikâyesi, <em className="text-accent-light">tek ekranda.</em></p>
            <p className="mt-4 max-w-sm text-sm text-canvas/60">Siparişler, katalog ve kampanyalar — rol bazlı yetkilerle güvenle yönetin.</p>
          </motion.div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-12">
        <motion.div className="w-full max-w-sm" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }}>
          <p className="font-display text-2xl font-semibold tracking-[0.2em] lg:hidden">BLVRDSGN</p>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight lg:mt-0">Yönetim paneline giriş</h1>
          <p className="mt-1 text-sm text-muted">Hesabınızla giriş yapın veya bir demo rol seçin.</p>

          <form onSubmit={handleSubmit(({ email, password }) => doLogin(email, password))} className="mt-8 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium">E-posta</span>
              <input type="email" autoComplete="username" placeholder="ornek@galeri.com" {...register('email', { required: true })} className={input} />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium">Şifre</span>
              <span className="relative block">
                <input type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••" {...register('password', { required: true })} className={`${input} pr-10`} />
                <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </span>
            </label>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={Boolean(busy)} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-ink text-sm font-medium text-white transition hover:bg-ink/85 disabled:opacity-60">
              {busy === 'form' ? 'Giriş yapılıyor…' : <>Giriş yap <ArrowRight className="size-4" /></>}
            </button>
          </form>

          <div className="my-8 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-[#E4E4E7]" /> veya tek tıkla demo giriş <span className="h-px flex-1 bg-[#E4E4E7]" />
          </div>

          <div className="space-y-2.5">
            {DEMO_ADMIN_USERS.map((u, i) => {
              const { icon: Icon, desc } = ROLE_META[u.role];
              return (
                <motion.button
                  key={u.id}
                  type="button"
                  disabled={Boolean(busy)}
                  onClick={() => doLogin(u.email, u.password, u.id)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.07 }}
                  className="group flex w-full items-center gap-4 rounded-xl border border-[#E4E4E7] p-3.5 text-left transition hover:border-ink hover:shadow-sm disabled:opacity-60"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#F4F4F5] transition group-hover:bg-ink group-hover:text-white">
                    <Icon className="size-5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{ROLE_LABELS[u.role]}</span>
                    <span className="block truncate text-xs text-muted">{desc}</span>
                  </span>
                  {busy === u.id ? <span className="size-4 animate-spin rounded-full border-2 border-ink/20 border-t-ink" /> : <ArrowRight className="size-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-ink" />}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
