'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Headset, Palette, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { btn, input } from '@/components/admin/PageHeader';
import { getRolePermissions, ROLE_DESCRIPTIONS, ROLE_LABELS } from '@/config/permissions';
import { MIN_PASSWORD } from '@/services/userService';

export const ROLE_ICONS = { admin: ShieldCheck, sales_director: TrendingUp, catalog_editor: Palette, support: Headset };

/** Okunabilir, rastgele geçici şifre. */
export function generatePassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = new Uint32Array(10);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

/**
 * Kullanıcı ekleme/düzenleme. user verilirse düzenleme modundadır (şifre alanı gösterilmez).
 * lockRole: kişi kendi rolünü değiştiremez (kendini yetkisiz bırakmasın diye).
 */
export function UserFormModal({ open, user, lockRole = false, matrix, onClose, onSubmit }) {
  const editing = Boolean(user);
  const [showPw, setShowPw] = useState(true);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm();
  const role = watch('role');

  useEffect(() => {
    if (open) {
      reset(editing ? { name: user.name, email: user.email, role: user.role } : { name: '', email: '', role: 'support', password: generatePassword() });
    }
  }, [open, editing, user, reset]);

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Kullanıcıyı düzenle' : 'Yeni kullanıcı'} className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-[13px] font-medium">Ad soyad</span>
            <input autoFocus {...register('name', { required: 'Zorunlu alan' })} placeholder="Ayşe Yılmaz" className={`${input} ${errors.name ? 'border-red-400' : ''}`} />
            {errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name.message}</span>}
          </label>
          <label>
            <span className="mb-1.5 block text-[13px] font-medium">E-posta</span>
            <input type="email" {...register('email', { required: 'Zorunlu alan', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Geçersiz e-posta' } })} placeholder="ayse@galeri.com" className={`${input} ${errors.email ? 'border-red-400' : ''}`} />
            {errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email.message}</span>}
          </label>
        </div>

        <fieldset disabled={lockRole}>
          <legend className="mb-2 flex w-full items-center justify-between text-[13px] font-medium">
            Rol
            {lockRole && <span className="text-xs font-normal text-muted">Kendi rolünüzü değiştiremezsiniz</span>}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.keys(ROLE_LABELS).map((r) => {
              const Icon = ROLE_ICONS[r];
              const count = getRolePermissions(r, matrix).length;
              const active = role === r;
              return (
                <label key={r} className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${active ? 'border-ink bg-[#FAFAFA] ring-1 ring-ink' : 'border-[#E4E4E7] hover:border-ink/40'} ${lockRole ? 'cursor-not-allowed opacity-60' : ''}`}>
                  <input type="radio" value={r} {...register('role', { required: true })} className="sr-only" />
                  <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${active ? 'bg-ink text-white' : 'bg-[#F4F4F5]'}`}>
                    <Icon className="size-[18px]" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {ROLE_LABELS[r]}
                      <span className="rounded-full bg-[#F4F4F5] px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-muted">{count} yetki</span>
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted">{ROLE_DESCRIPTIONS[r]}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        {!editing && (
          <label className="block">
            <span className="mb-1.5 flex items-center justify-between text-[13px] font-medium">
              Geçici şifre
              <button type="button" onClick={() => setValue('password', generatePassword(), { shouldValidate: true })} className="inline-flex items-center gap-1 text-xs font-medium text-accent hover:underline">
                <Sparkles className="size-3.5" /> Yeni üret
              </button>
            </span>
            <span className="relative block">
              <input
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                {...register('password', { required: 'Zorunlu alan', minLength: { value: MIN_PASSWORD, message: `En az ${MIN_PASSWORD} karakter` } })}
                className={`${input} pr-10 font-mono ${errors.password ? 'border-red-400' : ''}`}
              />
              <button type="button" onClick={() => setShowPw((s) => !s)} aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </span>
            {errors.password ? (
              <span className="mt-1 block text-xs text-red-600">{errors.password.message}</span>
            ) : (
              <span className="mt-1 block text-xs text-muted">Şifreyi kullanıcıyla güvenli bir kanaldan paylaşın.</span>
            )}
          </label>
        )}

        <div className="flex justify-end gap-2 border-t border-[#EFEFF1] pt-5">
          <button type="button" onClick={onClose} className={btn.secondary}>Vazgeç</button>
          <button type="submit" disabled={isSubmitting} className={btn.primary}>{editing ? 'Değişiklikleri kaydet' : 'Kullanıcıyı oluştur'}</button>
        </div>
      </form>
    </Modal>
  );
}
