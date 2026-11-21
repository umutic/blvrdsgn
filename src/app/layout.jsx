import { Fraunces, Bricolage_Grotesque } from 'next/font/google';
import { Toaster } from 'sonner';
import { SiteChrome } from '@/components/storefront/SiteChrome';
import './globals.css';

// Başlıklar: Fraunces — yumuşak (SOFT) ve oynak (WONK) eksenleriyle sanatsal, kalın gövdesiyle okunur.
const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  style: ['normal', 'italic'],
  axes: ['SOFT', 'WONK', 'opsz'],
  variable: '--font-fraunces',
  display: 'swap',
});

// Metin & arayüz: Bricolage Grotesque — karakterli ama gövde metninde rahat okunan grotesk.
const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz'],
  variable: '--font-bricolage',
  display: 'swap',
});

export const metadata = {
  title: { default: 'BLVRDSGN — Poster & Duvar Sanatı', template: '%s · BLVRDSGN' },
  description: 'Minimalist, soyut, tipografi, botanik, mimari, retro, modern hat ve çocuk odası posterleri. Gerçek odalarda canlı çerçeve önizleme.',
};

// Oturumun ilk ziyaretinde, boyamadan önce giriş animasyonunu etkinleştirir (içerik parlamasını önler).
const introScript = `try{if(!location.pathname.startsWith('/admin')&&!sessionStorage.getItem('blvrd_intro_seen')){document.documentElement.dataset.intro='1'}}catch(e){}`;

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${fraunces.variable} ${bricolage.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
      </head>
      <body>
        <SiteChrome>{children}</SiteChrome>
        <Toaster position="bottom-center" toastOptions={{ style: { borderRadius: 0, fontFamily: 'var(--font-bricolage)' } }} />
      </body>
    </html>
  );
}
