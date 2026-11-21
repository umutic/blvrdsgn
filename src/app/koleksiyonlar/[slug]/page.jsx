import { Suspense } from 'react';
import { CollectionView } from '@/components/storefront/CollectionView';
import { ProductGridSkeleton } from '@/components/storefront/ProductGrid';

export default async function CollectionPage({ params }) {
  const { slug } = await params;
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-6 py-12"><ProductGridSkeleton /></div>}>
      <CollectionView slug={slug} />
    </Suspense>
  );
}
