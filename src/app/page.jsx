import { Hero } from '@/components/storefront/home/Hero';
import { BigMarquee } from '@/components/storefront/home/BigMarquee';
import { CategoryRail } from '@/components/storefront/home/CategoryRail';
import { FeaturedProducts } from '@/components/storefront/home/FeaturedProducts';
import { StudioTeaser } from '@/components/storefront/home/StudioTeaser';
import { RoomBento } from '@/components/storefront/home/RoomBento';
import { EditorialBanner } from '@/components/storefront/home/EditorialBanner';
import { Features } from '@/components/storefront/home/Features';

export default function HomePage() {
  return (
    <>
      <Hero />
      <BigMarquee />
      <CategoryRail />
      <FeaturedProducts />
      <StudioTeaser />
      <RoomBento />
      <EditorialBanner />
      <Features />
    </>
  );
}
