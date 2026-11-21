'use client';

import { Button } from '@/components/ui/Button';
import { ProductGrid, ProductGridSkeleton } from '@/components/storefront/ProductGrid';
import { productService } from '@/services/productService';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useHasMounted } from '@/hooks/useHasMounted';

export default function WishlistPage() {
  const mounted = useHasMounted();
  const ids = useWishlistStore((s) => s.ids);
  const { data, loading } = useServiceQuery(() => productService.getAllProducts(), productService.subscribe);
  const products = (data ?? []).filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-[1440px] px-6 py-12">
      <h1 className="mb-14 text-center font-display text-6xl">Favori<em className="text-accent">lerim</em></h1>
      {!mounted || loading ? (
        <ProductGridSkeleton count={4} />
      ) : products.length ? (
        <ProductGrid products={products} />
      ) : (
        <div className="py-16 text-center">
          <p className="text-muted">Henüz favori posteriniz yok.</p>
          <Button href="/koleksiyonlar/tumu" variant="outline" className="mt-6">Koleksiyonu Keşfet</Button>
        </div>
      )}
    </div>
  );
}
