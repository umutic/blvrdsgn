'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { ImageOff } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { CATEGORIES, ORIENTATIONS, ROOMS } from '@/data/categories';
import { productService } from '@/services/productService';
import { btn, input } from './PageHeader';
import { formatTL, getStartingPrice } from '@/utils/pricing';

const EMPTY = {
  title: '',
  artist: 'BLVRDSGN Studio',
  category: CATEGORIES[0].slug,
  rooms: [],
  orientation: 'dikey',
  basePrice: 249,
  image: '',
  description: '',
  tags: '',
  isNew: true,
  isBestseller: false,
};

/** product verilirse düzenleme, verilmezse ekleme modu. Sol tarafta canlı kart önizlemesi. */
export function ProductFormModal({ open, product, onClose }) {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: EMPTY });

  useEffect(() => {
    if (open) reset(product ? { ...EMPTY, ...product, tags: (product.tags ?? []).join(', ') } : EMPTY);
  }, [open, product, reset]);

  const v = watch();
  const validImage = isUsableUrl(v.image);

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      basePrice: Number(values.basePrice),
      rooms: values.rooms || [],
      tags: String(values.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
    };
    try {
      if (product) {
        await productService.updateProduct(product.id, payload);
        toast.success('Ürün güncellendi — vitrinde anında görünür.');
      } else {
        await productService.createProduct(payload);
        toast.success('Yeni poster eklendi — vitrinde anında görünür.');
      }
      onClose();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={product ? 'Posteri düzenle' : 'Yeni poster'} className="max-w-4xl">
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 md:grid-cols-[240px_1fr]">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted">Önizleme</p>
          <div className="relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-xl bg-[#EDEDEB] p-6">
            {validImage ? (
              <div className={`relative w-full shadow-[0_18px_30px_-18px_rgba(0,0,0,.45)] ${v.orientation === 'yatay' ? 'aspect-[4/3]' : 'aspect-[3/4]'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element -- yazılırken değişen URL için düz img */}
                <img src={v.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
              </div>
            ) : (
              <span className="flex flex-col items-center gap-2 text-xs text-muted"><ImageOff className="size-6" /> Görsel URL girin</span>
            )}
            <div className="absolute left-2 top-2 flex gap-1">
              {v.isNew && <span className="rounded bg-ink px-1.5 py-0.5 text-[9px] font-medium uppercase text-white">Yeni</span>}
              {v.isBestseller && <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-medium uppercase text-white">Çok satan</span>}
            </div>
          </div>
          <p className="mt-3 font-display text-xl leading-tight">{v.title || 'Poster başlığı'}</p>
          <p className="text-sm text-muted">{formatTL(getStartingPrice(Number(v.basePrice) || 0))}’den başlayan</p>
        </div>

        <div className="grid content-start gap-4 sm:grid-cols-2">
          <Field label="Başlık" error={errors.title}><input className={input} {...register('title', { required: 'Zorunlu alan' })} /></Field>
          <Field label="Sanatçı"><input className={input} {...register('artist')} /></Field>
          <Field label="Kategori">
            <select className={input} {...register('category')}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
          </Field>
          <Field label="Yönelim">
            <select className={input} {...register('orientation')}>{ORIENTATIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>
          </Field>
          <Field label="Taban fiyat (21×30, TL)" error={errors.basePrice}>
            <input type="number" className={input} {...register('basePrice', { required: 'Zorunlu alan', min: { value: 1, message: 'Geçerli bir fiyat girin' } })} />
          </Field>
          <Field label="Etiketler (virgülle)"><input className={input} placeholder="istanbul, şehir" {...register('tags')} /></Field>
          <Field label="Görsel URL" error={errors.image} className="sm:col-span-2">
            <input className={input} placeholder="https://images.unsplash.com/photo-…" {...register('image', { required: 'Zorunlu alan', pattern: { value: /^(https?:\/\/|\/)/, message: 'http(s):// veya / ile başlamalı' } })} />
          </Field>
          <div className="sm:col-span-2">
            <span className="mb-1.5 block text-[13px] font-medium">Uygun odalar</span>
            <div className="flex flex-wrap gap-2">
              {ROOMS.map((r) => (
                <label key={r.slug} className="cursor-pointer">
                  <input type="checkbox" value={r.slug} {...register('rooms')} className="peer sr-only" />
                  <span className="inline-block rounded-full border border-[#E4E4E7] px-3 py-1.5 text-xs transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-white">{r.name}</span>
                </label>
              ))}
            </div>
          </div>
          <Field label="Açıklama" className="sm:col-span-2">
            <textarea rows={3} {...register('description')} className={`${input} h-auto py-2`} />
          </Field>
          <div className="flex gap-6 sm:col-span-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('isNew')} className="size-4 accent-ink" /> Yeni etiketi</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...register('isBestseller')} className="size-4 accent-ink" /> Çok satan</label>
          </div>
          <div className="flex justify-end gap-2 border-t border-[#EFEFF1] pt-4 sm:col-span-2">
            <button type="button" onClick={onClose} className={btn.secondary}>Vazgeç</button>
            <button type="submit" disabled={isSubmitting} className={btn.primary}>{product ? 'Değişiklikleri kaydet' : 'Posteri ekle'}</button>
          </div>
        </div>
      </form>
    </Modal>
  );
}

/** Yazım sırasında yarım kalmış URL'lerde önizlemeyi denememek için. */
function isUsableUrl(value = '') {
  if (value.startsWith('/')) return value.length > 1;
  try {
    const u = new URL(value);
    return /^https?:$/.test(u.protocol) && u.hostname.includes('.');
  } catch {
    return false;
  }
}

function Field({ label, error, className = '', children }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[13px] font-medium">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error.message}</span>}
    </label>
  );
}
