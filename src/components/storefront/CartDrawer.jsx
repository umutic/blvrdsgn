'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Drawer } from '@/components/ui/Drawer';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { useHasMounted } from '@/hooks/useHasMounted';
import { couponService } from '@/services/couponService';
import { calculateCartTotals, formatTL, getFrame, getSize } from '@/utils/pricing';

export function CartDrawer() {
  const mounted = useHasMounted();
  const { items, coupon, note, isOpen, closeCart, updateQuantity, removeItem, applyCoupon, removeCoupon, setNote } =
    useCartStore();
  const [code, setCode] = useState('');
  const [applying, setApplying] = useState(false);

  if (!mounted) return null;

  const totals = calculateCartTotals(items, coupon);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;
    setApplying(true);
    const result = await couponService.validateCoupon(code, { subtotal: totals.subtotal, itemCount: totals.itemCount });
    setApplying(false);
    if (result.valid) {
      applyCoupon(result.coupon);
      setCode('');
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  const footer = items.length > 0 && (
    <div className="space-y-2 text-sm">
      <Row label="Ara Toplam" value={formatTL(totals.subtotal)} />
      {totals.discount > 0 && <Row label={`İndirim (${coupon.code})`} value={`−${formatTL(totals.discount)}`} accent />}
      <Row label="Kargo" value={totals.shipping === 0 ? 'Ücretsiz' : formatTL(totals.shipping)} />
      <Row label="Toplam" value={formatTL(totals.total)} strong />
      <Button href="/odeme" onClick={closeCart} size="lg" className="mt-3 w-full">
        Ödemeye Geç
      </Button>
    </div>
  );

  return (
    <Drawer open={isOpen} onClose={closeCart} title={`Sepetim (${totals.itemCount})`} footer={footer}>
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
          <p className="font-display text-2xl">Sepetiniz boş</p>
          <p className="text-sm text-muted">Duvarlarınıza hikâye katacak eserleri keşfedin.</p>
          <Button href="/koleksiyonlar/tumu" onClick={closeCart} variant="outline">
            Koleksiyonu Keşfet
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Ücretsiz kargo ilerleme çubuğu */}
          <div>
            <p className="mb-2 text-xs text-muted">
              {totals.remainingForFreeShipping > 0 ? (
                <>Ücretsiz kargo için <strong className="text-ink">{formatTL(totals.remainingForFreeShipping)}</strong> daha ekleyin.</>
              ) : (
                <strong className="text-accent">Tebrikler! Kargonuz ücretsiz.</strong>
              )}
            </p>
            <div className="h-1 w-full bg-line">
              <div className="h-full bg-accent transition-all" style={{ width: `${totals.freeShippingProgress * 100}%` }} />
            </div>
          </div>

          <ul className="divide-y divide-line">
            {items.map((item) => (
              <li key={item.key} className="flex gap-4 py-4">
                <Link href={`/urun/${item.slug}`} onClick={closeCart} className="relative h-28 w-21 shrink-0 bg-surface">
                  <Image src={item.image} alt={item.title} fill sizes="84px" className="object-cover" />
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-2">
                    <p className="font-display text-lg leading-tight">{item.title}</p>
                    <button type="button" onClick={() => removeItem(item.key)} aria-label="Kaldır" className="text-muted hover:text-ink">
                      <Trash2 className="size-4" strokeWidth={1.5} />
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {getSize(item.sizeId).label} · {getFrame(item.frameId).name}
                    {item.mat && ' · Paspartu'}
                  </p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center border border-line">
                      <button type="button" className="p-1.5" onClick={() => updateQuantity(item.key, item.quantity - 1)} aria-label="Azalt">
                        <Minus className="size-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button type="button" className="p-1.5" onClick={() => updateQuantity(item.key, item.quantity + 1)} aria-label="Arttır">
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-medium">{formatTL(item.unitPrice * item.quantity)}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Kupon */}
          {coupon ? (
            <div className="flex items-center justify-between bg-surface px-3 py-2 text-sm">
              <span><strong>{coupon.code}</strong> · {coupon.description}</span>
              <button type="button" onClick={removeCoupon} aria-label="Kuponu kaldır"><X className="size-4" /></button>
            </div>
          ) : (
            <form onSubmit={handleApply} className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Kupon kodu"
                className="h-10 flex-1 border border-line bg-transparent px-3 text-sm uppercase outline-none focus:border-ink"
              />
              <Button type="submit" variant="outline" size="sm" className="h-10" disabled={applying}>Uygula</Button>
            </form>
          )}

          <label className="block">
            <span className="mb-1.5 block text-xs uppercase tracking-[0.14em] text-muted">Satıcıya not</span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Hediye paketi, teslimat notu…"
              className="w-full border border-line bg-transparent p-3 text-sm outline-none focus:border-ink"
            />
          </label>
        </div>
      )}
    </Drawer>
  );
}

function Row({ label, value, strong, accent }) {
  return (
    <div className={`flex justify-between ${strong ? 'border-t border-line pt-2 text-base font-semibold' : ''} ${accent ? 'text-accent' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
