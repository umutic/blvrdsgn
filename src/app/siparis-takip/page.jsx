'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { orderService, ORDER_STATUSES } from '@/services/orderService';
import { formatTL } from '@/utils/pricing';

function OrderTracking() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialNo = searchParams.get('no') ?? '';
  const [orderNo, setOrderNo] = useState(initialNo);
  const [order, setOrder] = useState(undefined); // undefined: sorgulanmadı, null: bulunamadı

  useEffect(() => {
    if (!initialNo) return;
    orderService.getOrderById(initialNo).then(setOrder);
  }, [initialNo]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (orderNo.trim()) router.replace(`/siparis-takip?no=${encodeURIComponent(orderNo.trim().toUpperCase())}`);
  };

  const stepIndex = order ? ORDER_STATUSES.indexOf(order.status) : -1;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-center font-display text-6xl">Siparişim <em className="text-accent">nerede?</em></h1>
      <form onSubmit={onSubmit} className="mx-auto mt-8 flex max-w-md gap-2">
        <input
          value={orderNo}
          onChange={(e) => setOrderNo(e.target.value)}
          placeholder="Sipariş no (örn. BLV-100231)"
          className="h-11 flex-1 border border-line bg-transparent px-3 text-sm uppercase outline-none focus:border-ink"
        />
        <Button type="submit">Sorgula</Button>
      </form>

      {order === null && <p className="mt-10 text-center text-muted">Bu numaraya ait sipariş bulunamadı.</p>}

      {order && (
        <div className="mt-12 border border-line p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-display text-2xl">{order.id}</p>
            <p className="text-sm text-muted">{new Date(order.createdAt).toLocaleString('tr-TR')}</p>
          </div>
          <ol className="mt-8 grid grid-cols-4 gap-2">
            {ORDER_STATUSES.map((s, i) => (
              <li key={s} className="text-center">
                <span className={`mx-auto flex size-8 items-center justify-center rounded-full border ${i <= stepIndex ? 'border-ink bg-ink text-canvas' : 'border-line text-muted'}`}>
                  {i <= stepIndex ? <Check className="size-4" /> : i + 1}
                </span>
                <span className={`mt-2 block text-xs ${i <= stepIndex ? '' : 'text-muted'}`}>{s}</span>
              </li>
            ))}
          </ol>
          <ul className="mt-8 divide-y divide-line border-t border-line text-sm">
            {order.items.map((i, idx) => (
              <li key={idx} className="flex justify-between py-3">
                <span>{i.title} × {i.quantity}</span>
                <span>{formatTL(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-right font-semibold">Toplam: {formatTL(order.totals.total)}</p>
          {order.gift?.isGift && (
            <div className="mt-6 border-t border-line pt-5 text-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-accent">Hediye paketi{order.gift.recipientName ? ` · ${order.gift.recipientName}` : ''}</p>
              {order.gift.message ? <p className="mt-2 font-display text-xl leading-snug">“{order.gift.message}”</p> : <p className="mt-2 text-muted">Hediye notu eklenmedi.</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={null}>
      <OrderTracking />
    </Suspense>
  );
}
