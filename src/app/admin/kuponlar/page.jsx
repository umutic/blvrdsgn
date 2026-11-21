'use client';

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Copy, Plus, TicketPercent } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader, btn, input } from '@/components/admin/PageHeader';
import { couponService } from '@/services/couponService';
import { orderService } from '@/services/orderService';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { formatTL } from '@/utils/pricing';

export default function AdminCouponsPage() {
  const { data: coupons } = useServiceQuery(couponService.getAllCoupons, couponService.subscribe);
  const { data: orders } = useServiceQuery(orderService.getAllOrders, orderService.subscribe);
  const { register, handleSubmit, reset, formState: { isSubmitting, errors } } = useForm({
    defaultValues: { code: '', description: '', value: 10, minSubtotal: 0, minItems: 0 },
  });

  const usage = useMemo(() => {
    const map = {};
    for (const o of orders ?? []) {
      if (!o.couponCode) continue;
      map[o.couponCode] = map[o.couponCode] ?? { count: 0, discount: 0 };
      map[o.couponCode].count += 1;
      map[o.couponCode].discount += o.totals.discount;
    }
    return map;
  }, [orders]);

  const onCreate = async (values) => {
    try {
      await couponService.createCoupon({ ...values, type: 'percent' });
      toast.success('Kupon oluşturuldu');
      reset();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const copy = (code) => {
    navigator.clipboard?.writeText(code);
    toast.success(`${code} kopyalandı`);
  };

  return (
    <div>
      <PageHeader title="Kuponlar" description="İndirim kodlarını yönetin; kullanım istatistikleri siparişlerden hesaplanır." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {(coupons ?? []).map((c, i) => (
          <motion.div
            key={c.code}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`relative overflow-hidden rounded-2xl border bg-white p-5 transition ${c.isActive ? 'border-[#E4E4E7]' : 'border-dashed border-[#D4D4D8] opacity-70'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <button type="button" onClick={() => copy(c.code)} className="group flex items-center gap-2 font-mono text-lg font-semibold tracking-wider">
                  {c.code} <Copy className="size-3.5 text-muted opacity-0 transition group-hover:opacity-100" />
                </button>
                <p className="mt-0.5 text-[13px] text-muted">{c.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={c.isActive}
                aria-label={`${c.code} ${c.isActive ? 'aktif' : 'pasif'}`}
                onClick={() => couponService.setCouponActive(c.code, !c.isActive)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${c.isActive ? 'bg-emerald-600' : 'bg-[#D4D4D8]'}`}
              >
                <motion.span layout className={`absolute top-1 size-4 rounded-full bg-white shadow ${c.isActive ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <p className="text-4xl font-semibold tracking-tight">%{c.value}</p>
              <p className="text-right text-xs text-muted">
                {[c.minSubtotal > 0 && `Min. ${formatTL(c.minSubtotal)}`, c.minItems > 0 && `Min. ${c.minItems} ürün`].filter(Boolean).join(' · ') || 'Koşulsuz'}
              </p>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-dashed border-[#E4E4E7] pt-4 text-[13px]">
              <div><p className="text-muted">Kullanım</p><p className="font-semibold tabular-nums">{usage[c.code]?.count ?? 0} sipariş</p></div>
              <div><p className="text-muted">Toplam indirim</p><p className="font-semibold tabular-nums">{formatTL(usage[c.code]?.discount ?? 0)}</p></div>
            </div>
            <span className={`absolute -right-3 top-1/2 size-6 -translate-y-1/2 rounded-full border bg-[#F6F6F7] ${c.isActive ? 'border-[#E4E4E7]' : 'border-dashed border-[#D4D4D8]'}`} />
            <span className={`absolute -left-3 top-1/2 size-6 -translate-y-1/2 rounded-full border bg-[#F6F6F7] ${c.isActive ? 'border-[#E4E4E7]' : 'border-dashed border-[#D4D4D8]'}`} />
          </motion.div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onCreate)} className="mt-8 max-w-3xl rounded-2xl border border-[#E4E4E7] bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-accent-soft text-accent"><TicketPercent className="size-5" /></span>
          <div>
            <p className="font-semibold">Yeni kupon</p>
            <p className="text-[13px] text-muted">Yüzde bazlı indirim tanımlayın.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-6">
          <label className="sm:col-span-2"><span className="mb-1.5 block text-[13px] font-medium">Kod</span><input placeholder="YAZ25" {...register('code', { required: true })} className={`${input} font-mono uppercase ${errors.code ? 'border-red-400' : ''}`} /></label>
          <label className="sm:col-span-4"><span className="mb-1.5 block text-[13px] font-medium">Açıklama</span><input placeholder="Yaz kampanyası" {...register('description')} className={input} /></label>
          <label className="sm:col-span-2"><span className="mb-1.5 block text-[13px] font-medium">İndirim (%)</span><input type="number" {...register('value', { required: true, min: 1, max: 100 })} className={input} /></label>
          <label className="sm:col-span-2"><span className="mb-1.5 block text-[13px] font-medium">Min. tutar (TL)</span><input type="number" {...register('minSubtotal')} className={input} /></label>
          <label className="sm:col-span-2"><span className="mb-1.5 block text-[13px] font-medium">Min. ürün</span><input type="number" {...register('minItems')} className={input} /></label>
        </div>
        <div className="mt-5 flex justify-end">
          <button type="submit" disabled={isSubmitting} className={btn.primary}><Plus className="size-4" /> Kupon ekle</button>
        </div>
      </form>
    </div>
  );
}
