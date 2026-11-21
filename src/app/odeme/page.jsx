'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { useHasMounted } from '@/hooks/useHasMounted';
import { orderService } from '@/services/orderService';
import { calculateCartTotals, formatTL, getFrame, getSize } from '@/utils/pricing';

export default function CheckoutPage() {
  const mounted = useHasMounted();
  const router = useRouter();
  const { items, coupon, note, clearCart } = useCartStore();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm({ defaultValues: { invoiceType: 'bireysel' } });
  const invoiceType = watch('invoiceType');

  if (!mounted) return null;

  const totals = calculateCartTotals(items, coupon);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl">Sepetiniz boş</h1>
        <Button href="/koleksiyonlar/tumu" variant="outline" className="mt-6">Alışverişe Başla</Button>
      </div>
    );
  }

  const onSubmit = async (values) => {
    setSubmitting(true);
    try {
      const invoice =
        values.invoiceType === 'kurumsal'
          ? { type: 'kurumsal', companyName: values.companyName, taxOffice: values.taxOffice, taxNo: values.taxNo }
          : { type: 'bireysel', tcNo: values.tcNo || '' };
      const order = await orderService.createOrder({
        customer: { fullName: values.fullName, email: values.email, phone: values.phone },
        shippingAddress: { city: values.city, district: values.district, address: values.address },
        invoice,
        items: items.map(({ key, ...rest }) => rest),
        totals: { subtotal: totals.subtotal, discount: totals.discount, shipping: totals.shipping, total: totals.total },
        couponCode: totals.discount > 0 ? coupon?.code : null,
        note,
      });
      clearCart();
      toast.success(`Siparişiniz alındı: ${order.id}`);
      router.push(`/siparis-takip?no=${order.id}`);
    } catch (err) {
      toast.error(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-10">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">Güvenli ödeme</p>
      <h1 className="mb-12 mt-2 font-display text-6xl">Siparişi <em className="text-accent">tamamla</em></h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-10">
          <Fieldset title="İletişim">
            <Field label="Ad Soyad" error={errors.fullName} {...register('fullName', { required: 'Zorunlu alan' })} />
            <Field label="E-posta" type="email" error={errors.email} {...register('email', { required: 'Zorunlu alan', pattern: { value: /\S+@\S+\.\S+/, message: 'Geçersiz e-posta' } })} />
            <Field label="Telefon" error={errors.phone} {...register('phone', { required: 'Zorunlu alan' })} />
          </Fieldset>

          <Fieldset title="Teslimat Adresi">
            <Field label="İl" error={errors.city} {...register('city', { required: 'Zorunlu alan' })} />
            <Field label="İlçe" error={errors.district} {...register('district', { required: 'Zorunlu alan' })} />
            <Field label="Açık Adres" className="sm:col-span-2" error={errors.address} {...register('address', { required: 'Zorunlu alan' })} />
          </Fieldset>

          <Fieldset title="Fatura">
            <div className="flex gap-6 sm:col-span-2">
              {['bireysel', 'kurumsal'].map((t) => (
                <label key={t} className="flex items-center gap-2 text-sm capitalize">
                  <input type="radio" value={t} {...register('invoiceType')} className="accent-ink" /> {t === 'bireysel' ? 'Bireysel' : 'Kurumsal'}
                </label>
              ))}
            </div>
            {invoiceType === 'kurumsal' ? (
              <>
                <Field label="Firma Ünvanı" className="sm:col-span-2" error={errors.companyName} {...register('companyName', { required: 'Zorunlu alan' })} />
                <Field label="Vergi Dairesi" error={errors.taxOffice} {...register('taxOffice', { required: 'Zorunlu alan' })} />
                <Field label="Vergi No" error={errors.taxNo} {...register('taxNo', { required: 'Zorunlu alan' })} />
              </>
            ) : (
              <Field label="T.C. Kimlik No (opsiyonel)" {...register('tcNo')} />
            )}
          </Fieldset>

          <p className="bg-surface p-4 text-sm text-muted">
            Demo mağaza: ödeme adımı simüle edilir, kart bilgisi alınmaz. Sipariş localStorage’a kaydedilir ve Admin &gt; Siparişler ekranında görünür.
          </p>
        </div>

        <aside className="h-fit bg-surface p-8 lg:sticky lg:top-28">
          <h2 className="mb-4 font-display text-2xl">Sipariş Özeti</h2>
          <ul className="space-y-4">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3">
                <div className="relative h-20 w-15 shrink-0 bg-surface">
                  <Image src={i.image} alt={i.title} fill sizes="60px" className="object-cover" />
                </div>
                <div className="flex-1 text-sm">
                  <p className="font-medium">{i.title} × {i.quantity}</p>
                  <p className="text-xs text-muted">{getSize(i.sizeId).label} · {getFrame(i.frameId).name}{i.mat && ' · Paspartu'}</p>
                </div>
                <p className="text-sm">{formatTL(i.unitPrice * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
            <Row label="Ara Toplam" value={formatTL(totals.subtotal)} />
            {totals.discount > 0 && <Row label={`İndirim (${coupon.code})`} value={`−${formatTL(totals.discount)}`} />}
            <Row label="Kargo" value={totals.shipping ? formatTL(totals.shipping) : 'Ücretsiz'} />
            <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
              <span>Toplam</span><span>{formatTL(totals.total)}</span>
            </div>
          </div>
          <Button type="submit" size="lg" className="mt-6 w-full" disabled={submitting}>
            {submitting ? 'Gönderiliyor…' : 'Siparişi Tamamla'}
          </Button>
        </aside>
      </form>
    </div>
  );
}

function Fieldset({ title, children }) {
  return (
    <fieldset>
      <legend className="mb-4 text-xs uppercase tracking-[0.2em] text-muted">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({ label, error, className = '', ...props }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm">{label}</span>
      <input {...props} className={`h-11 w-full border bg-transparent px-3 text-sm outline-none focus:border-ink ${error ? 'border-red-600' : 'border-line'}`} />
      {error && <span className="mt-1 block text-xs text-red-600">{error.message}</span>}
    </label>
  );
}

function Row({ label, value }) {
  return <div className="flex justify-between"><span className="text-muted">{label}</span><span>{value}</span></div>;
}
