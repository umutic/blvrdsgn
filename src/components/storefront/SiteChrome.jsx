'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { SearchModal } from './SearchModal';
import { IntroLoader } from './IntroLoader';
import { SmoothScroll } from './SmoothScroll';

/** Vitrin kabuğu. /admin rotalarında hiçbiri render edilmez. */
export function SiteChrome({ children }) {
  const pathname = usePathname();
  if (pathname?.startsWith('/admin')) return children;
  const isHome = pathname === '/';

  return (
    <SmoothScroll>
      <IntroLoader />
      <Header />
      <main className={`min-h-[60vh] ${isHome ? '' : 'pt-[108px]'}`}>{children}</main>
      <Footer />
      <CartDrawer />
      <SearchModal />
    </SmoothScroll>
  );
}
