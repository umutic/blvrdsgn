# Site adı: BLVRDSGN

# CLAUDE.md — Modern Çok Kategorili Poster & Duvar Sanatı E-Ticaret Platformu + RBAC Yönetici Paneli

Bu dosya, Claude Code ve geliştirici asistanlar için projenin mimari kurallarını, tasarım sistemini, `localStorage` tabanlı veri katmanını, ileride **Supabase + Vercel** geçişine uyumlu servis yapısını ve **Rol Tabanlı Yönetici Paneli (RBAC)** standartlarını tanımlar. Kod üretmeden önce bu kurallara sıkı sıkıya uyulmalıdır.

---

## 1. Proje Vizyonu ve Temel İlkeler

1. **Çok Kategorili Modern Poster Mağazası:** `babamodern.com` iş modelinden ilham alan; ancak görsel dili, kullanıcı deneyimi (UX) ve altyapısı açısından çok daha modern, editoryal sanat galerisi hissiyatı veren bir e-ticaret platformudur. Yalnızca İslami sanatla sınırlı kalmayıp; *Minimalist, Soyut (Abstract), Tipografi, Botanik & Doğa, Mimari & Şehir, Retro & Vintage, İslami Sanat & Modern Hat ve Çocuk Odası* kategorilerini barındırır.
2. **Sıfır Kurulumla Hemen Çalışma (Zero-Setup & Instant Boot):** Proje klonlanıp `npm install && npm run dev` çalıştırıldığı anda hiçbir `.env` anahtarı veya harici veritabanı bağlantısı gerektirmeden **eksiksiz çalışmalıdır**.
3. **Saf JavaScript Zorunluluğu (NO TypeScript):** Projede kesinlikle TypeScript (`.ts`, `.tsx`), `interface`, `type` veya `enum` kullanılmayacaktır. Tüm dosyalar modern ES2022+ **JavaScript (`.js`, `.jsx`)** formatında yazılacaktır. Veri şemaları kod okunabilirliği için JSDoc yorumları ile dokümante edilebilir.
4. **Supabase & Vercel Hazır Mimari (Adapter / Repository Pattern):** Şimdilik tüm veriler statik başlangıç verileri (`seed`) ve `localStorage` üzerinde tutulacaktır. Ancak UI bileşenleri doğrudan `localStorage`'a erişmeyecek; tüm veri işlemleri `src/services/` altındaki soyutlama katmanı üzerinden yürüyecektir. Böylece canlıya geçerken (Vercel + Supabase) yalnızca `services/` içindeki veri sağlayıcı (`local` -> `supabase`) değiştirilecektir.
5. **Rol Tabanlı Yönetici Paneli (Admin & RBAC):** Mağaza yönetimi için `/admin` rotasında çalışan, giriş ekranlı ve rol bazlı yetkilendirmeye sahip bir yönetim paneli bulunacaktır.

---

## 2. Teknoloji Yığını (Tech Stack)

* **Framework:** Next.js 15+ (App Router — **JavaScript `.js` / `.jsx` kurulumu**) — *Vercel üzerinde sıfır konfigürasyonla (Zero-Config) doğrudan deploy edilebilir mimari.*
* **Dil:** Saf JavaScript (ES2022+, `.js` ve `.jsx`). *`jsconfig.json` ile `@/*` path alias desteği aktif edilmelidir.*
* **Stil & Tasarım:** Tailwind CSS + CSS Variables (Tasarım tokenları için).
* **Animasyon:** Framer Motion (Drawer sepet, mega menü, çerçeve/oda önizleme geçişleri).
* **State Yönetimi & Kalıcılık:** Zustand (`persist` middleware ile `localStorage` entegrasyonu).
* **İkon Seti:** `lucide-react`.
* **Form Yönetimi:** `react-hook-form` (Checkout, ürün ekleme/düzenleme ve admin giriş formları).
* **Bildirimler:** `sonner` (Minimalist toast bildirimleri).

---

## 3. Tasarım Sistemi (Modern Gallery & Editorial UI)

Sıradan bir e-ticaret şablonu yerine **Kinfolk / Desenio / Juniqe** estetiğinde, ferah ve sanat eserini ön plana çıkaran bir tasarım dili uygulanmalıdır.

### 3.1. Renk Paleti & Tipografi
* **Ana Arka Plan (Gallery Canvas):** `#FAF9F6` (Sıcak kırık beyaz)
* **İkincil Yüzey / Kart Arka Planı:** `#F3F1EC` (Yumuşak taş tonu)
* **Ana Metin & Başlıklar:** `#18181B` (Derin antrasit)
* **İkincil Metinler:** `#52525B` (Nötr koyu gri)
* **Kenarlıklar:** `#E4E2DD` (İnce, zarif çizgiler)
* **Birincil Aksiyon (CTA):** `#18181B` zemin üzerine `#FAF9F6` metin
* **Vurgu Rengi (Accent):** `#B85D3B` (Sıcak Terracotta — indirim etiketleri ve ücretsiz kargo ilerleme çubuğu için)
* **Başlık Fontu:** `Cormorant Garamond` veya `Playfair Display` (Google Fonts — editoryal serif).
* **Gövde & UI Fontu:** `Plus Jakarta Sans` (Google Fonts — modern sans-serif).

### 3.2. Müşteri Vitrin Bileşenleri
1. **Duyuru Çubuğu & Sticky Mega Menü:** Üstte ücretsiz kargo duyurusu; altında kategoriler, yaşam alanları, anlık arama modalı, favoriler ve sepet çekmecesi sayacı.
2. **Ürün Kartı:** Hover'da oda içi mockup görseline geçiş, sağ üstte favori ikonu, altta başlangıç fiyatı (*"249 TL'den başlayan fiyatlarla"*) ve hızlı seçenek seçimi.
3. **Canlı Çerçeve & Oda Önizleme Stüdyosu (`/urun/[slug]`):** Seçilen çerçeve rengine (`Çerçevesiz`, `Siyah Ahşap`, `Doğal Meşe`, `Ceviz`, `Beyaz`, `Gold Metal`) ve `Paspartu` seçeneğine göre posterin etrafında gerçekçi çerçeve gölgesi oluşur. Kullanıcı farklı oda arka planları (Salon, Yatak Odası, Çalışma Odası) ve boyut ölçekleri üzerinde posteri canlı test edebilir.
4. **Slide-Over Sepet Çekmecesi:** Ücretsiz kargo ilerleme çubuğu (`1.000 TL` üzeri ücretsiz kargo), varyant özeti, kupon kodu uygulaması (`HOSGELDIN15`, `GALERI20`, `IKILISET`) ve satıcı notu.

---

## 4. Rol Tabanlı Yönetici Paneli (Admin & RBAC Mimarisi)

`/admin` rotası altında çalışan, modern bir SaaS dashboard görünümünde yönetim paneli oluşturulacaktır.

### 4.1. Demo Giriş Bilgileri ve Roller (`/admin/login`)
Giriş ekranında test etmeyi kolaylaştırmak için **"Tek Tıkla Demo Giriş"** butonları da yer almalıdır:

| Rol Kodu | Rol Adı | Demo E-posta | Şifre | Yetki Kapsamı |
| :--- | :--- | :--- | :--- | :--- |
| `admin` | **Sistem Yöneticisi (Tam Yetki)** | `admin@galeri.com` | `admin123` | Tüm panel sayfaları, ürün ekleme/düzenleme/silme, stok ve fiyat güncelleme, sipariş yönetimi & durum değiştirme, kupon yönetimi, rol/kullanıcı yönetimi ve mağaza ayarları. |
| `sales_director` | **Satış Direktörü** | `satis@galeri.com` | `satis123` | Dashboard satış özetleri (ciro, sipariş sayısı, çok satanlar) ve **Sipariş Yönetimi** (sipariş detaylarını görüntüleme, fatura bilgilerini inceleme ve kargo/sipariş durumunu güncelleme). **Ürün silme, fiyat/katalog değiştirme ve sistem ayarlarına erişemez.** |
| `catalog_editor` | **Katalog & İçerik Editörü** | `editor@galeri.com` | `editor123` | Ürün kataloğu (yeni poster ekleme, görsel/açıklama/kategori düzenleme) ve koleksiyon yönetimi. **Siparişleri, müşteri fatura bilgilerini ve ciro raporlarını göremez.** |

### 4.2. RBAC Yetki Matrisi ve Koruma Kuralları (`src/config/permissions.js`)
Yetkiler bileşenlerin içine dağınık `if (role === 'admin')` şeklinde yazılmamalı, merkezi bir yetki matrisi ile yönetilmelidir:

```javascript
// src/config/permissions.js
export const ROLES = {
  ADMIN: 'admin',
  SALES_DIRECTOR: 'sales_director',
  CATALOG_EDITOR: 'catalog_editor',
};

export const PERMISSIONS = {
  VIEW_ANALYTICS: ['admin', 'sales_director'],
  MANAGE_ORDERS: ['admin', 'sales_director'],
  VIEW_CUSTOMER_INVOICES: ['admin', 'sales_director'],
  MANAGE_PRODUCTS: ['admin', 'catalog_editor'],
  DELETE_PRODUCTS: ['admin'],
  MANAGE_COUPONS: ['admin'],
  MANAGE_SETTINGS: ['admin'],
};
```
* **Route & UI Koruması:** Kullanıcının rolünün yetkisi olmayan menü öğeleri sidebar'da gizlenmeli ve ilgili URL'ye doğrudan erişmeye çalışırsa *"Bu sayfayı görüntüleme yetkiniz bulunmamaktadır"* uyarısı veya yetkili olduğu ilk sayfaya yönlendirme yapılmalıdır.

### 4.3. Admin Paneli Sayfaları (`/admin/*`)
* `/admin` — **Genel Bakış (Dashboard):** Toplam ciro, bekleyen siparişler, toplam ürün sayısı, kategori dağılımı ve son siparişler tablosu (Yetkiye göre filtrelenir).
* `/admin/siparisler` — **Sipariş Yönetimi:** Müşterilerin vitrinden verdiği siparişleri listeleme, sipariş durumunu güncelleme (`Hazırlanıyor` -> `Baskı Aşamasında` -> `Kargoya Verildi` -> `Teslim Edildi`), bireysel/kurumsal fatura detaylarını görüntüleme.
* `/admin/urunler` — **Ürün & Katalog Yönetimi:** Mevcut posterleri arama/filtreleme, yeni poster ekleme modalı/sayfası (görsel URL, başlık, kategori, oda, yönelim, taban fiyat), ürün düzenleme ve silme. *(Admin panelinden eklenen veya güncellenen bir ürün anında vitrinde görünmelidir!)*
* `/admin/kuponlar` — **Kupon Yönetimi:** İndirim kuponlarını aktif/pasif yapma veya yeni kupon tanımlama (Sadece `admin`).

---

## 5. Klasör ve Dosya Mimarisi (Saf JavaScript)

```text
src/
├── app/                            # Next.js App Router (Tamamı .js / .jsx)
│   ├── layout.jsx                  # Ana fontlar, Toaster ve global sağlayıcılar
│   ├── page.jsx                    # Vitrin Ana Sayfa
│   ├── koleksiyonlar/
│   │   └── [slug]/page.jsx         # Kategori ve çoklu filtreleme sayfası
│   ├── urun/
│   │   └── [slug]/page.jsx         # Ürün Detay & Canlı Çerçeve/Oda Stüdyosu
│   ├── favoriler/page.jsx          # İstek Listesi
│   ├── odeme/page.jsx              # Tek sayfa Checkout (Bireysel/Kurumsal fatura)
│   ├── siparis-takip/page.jsx      # Müşteri sipariş numarası sorgulama ekranı
│   └── admin/                      # Yönetici Paneli Rotaları
│       ├── layout.jsx              # Admin Sidebar, Header ve Auth/RBAC Guard
│       ├── login/page.jsx          # Rol bazlı giriş & tek tıkla demo giriş ekranı
│       ├── page.jsx                # Dashboard özet metrikleri
│       ├── siparisler/page.jsx     # Sipariş listesi ve durum güncelleme
│       ├── urunler/page.jsx        # Ürün CRUD (Ekle/Düzenle/Sil)
│       └── kuponlar/page.jsx       # Kupon yönetimi
├── components/
│   ├── storefront/                 # Vitrin bileşenleri (Header, MegaMenu, ProductCard, FramePreviewStudio, CartDrawer)
│   ├── admin/                      # Admin bileşenleri (AdminSidebar, OrderDetailModal, ProductFormModal, RoleGuard)
│   └── ui/                         # Ortak UI bileşenleri (Button, Badge, Modal, Drawer)
├── config/
│   ├── permissions.js              # Rol ve yetki matrisi (RBAC)
│   └── env.js                      # Veri sağlayıcı seçimi: 'local' veya 'supabase'
├── data/                           # İlk kurulumda localStorage'ı besleyen zengin başlangıç (seed) verileri
│   ├── initialProducts.js          # En az 20 adet çok kategorili örnek poster
│   ├── categories.js               # Kategoriler ve yaşam alanları
│   ├── frames.js                   # Çerçeve seçenekleri ve ek ücretler
│   ├── sizes.js                    # Standart boyutlar ve taban fiyatlar
│   └── initialCoupons.js           # Varsayılan indirim kuponları
├── services/                       # SUPABASE & VERCEL GEÇİŞ KATMANI (Repository Pattern)
│   ├── productService.js           # Ürün okuma/ekleme/güncelleme/silme (Şimdilik localStorage, ileride Supabase)
│   ├── orderService.js             # Sipariş oluşturma, listeleme, durum güncelleme
│   ├── couponService.js            # Kupon doğrulama ve yönetimi
│   └── supabaseClient.js           # İleride .env eklendiğinde aktif olacak hazır Supabase istemci taslağı
├── store/                          # Zustand + localStorage store'ları
│   ├── useCartStore.js             # Sepet, kupon ve kargo hesaplama
│   ├── useWishlistStore.js         # Favoriler
│   └── useAuthStore.js             # Admin oturumu ve aktif rol yönetimi
├── hooks/
│   └── useHasMounted.js            # Next.js SSR Hydration uyumsuzluklarını önleyen hook
└── utils/
    └── pricing.js                  # Dinamik fiyat, kargo (1000 TL barajı) ve TL formatlama
```

---

## 6. `localStorage` ve Supabase Geçiş Mimarisi (Kritik Kural)

1. **Tek Noktadan Veri Yönetimi (`services/`):**
   * Ürünler ilk açılışta `src/data/initialProducts.js` dosyasından okunur ve `poster_db_products_v1` anahtarıyla `localStorage`'a yazılır (Seed mekanizması).
   * Böylece **Admin Panelinden yeni bir poster eklendiğinde veya fiyatı güncellendiğinde**, vitrin sayfaları da `productService.getAllProducts()` üzerinden okuma yaptığı için değişiklik anında mağazaya yansır.
   * Aynı şekilde vitrinden verilen her sipariş `poster_db_orders_v1` anahtarına kaydedilir ve **Admin > Siparişler** ekranında anında görünür.
2. **Supabase & Vercel Uyumluluğu:**
   * `src/config/env.js` içinde `export const DATA_PROVIDER = process.env.NEXT_PUBLIC_DATA_PROVIDER || 'local';` tanımı yer almalıdır.
   * Vercel'e deploy edildiğinde `DATA_PROVIDER` varsayılan olarak `'local'` kalacağı için site **hiçbir veritabanı ayarı olmadan** canlıda da sorunsuz çalışır.
   * İleride Supabase bağlanmak istendiğinde yalnızca `.env` dosyasına `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` eklenip `services/` içindeki ilgili metotlara Supabase sorgularının bağlanması yeterli olacaktır.
3. **Storage Anahtarları:**
   * `poster_db_products_v1` (Katalog verisi)
   * `poster_db_orders_v1` (Siparişler)
   * `poster_db_coupons_v1` (Kuponlar)
   * `poster_store_cart_v1` (Müşteri sepeti)
   * `poster_store_wishlist_v1` (Müşteri favorileri)
   * `poster_admin_session_v1` (Admin oturum ve rol bilgisi)
4. **SSR Hydration Kuralı:** `localStorage` okuyan tüm bileşenlerde (`CartDrawer`, `Header` sayaçları, `AdminLayout`, ürün listeleri) `useHasMounted` hook'u kullanılarak Next.js SSR hydration hataları tamamen engellenmelidir.

---

## 7. Kodlama Standartları ve Geliştirme Fazları

### 7.1. Kurallar
* **Kesinlikle TypeScript kullanma:** Hiçbir `.ts` veya `.tsx` dosyası oluşturma. `package.json` içinde `typescript` veya `@types/*` paketleri bulunmamalıdır.
* **Hazır Görseller:** `next.config.mjs` dosyasında `images: { unoptimized: true }` veya Unsplash/Picsum uzak alan adları (`remotePatterns`) tanımlanmalı; böylece Vercel ve lokal ortamda kırık görsel veya Next Image domain hatası alınmamalıdır.
* **Tek Komutla Çalışma:** Proje oluşturulduktan sonra `npm run build` ve `npm run dev` hatasız tamamlanmalıdır.

### 7.2. Uygulama Fazları
* **Faz 1 (Kurulum & Veri Katmanı):** Next.js (JavaScript) kurulumu, `jsconfig.json`, Tailwind/Font ayarları, `data/` içindeki zengin başlangıç verileri, `services/` soyutlama katmanı ve `config/permissions.js` RBAC matrisi.
* **Faz 2 (Vitrin & Canlı Çerçeve Stüdyosu):** Ana Sayfa, Mega Menü, Kategori/Filtreleme sayfası, Ürün Detay (`FramePreviewStudio` ile canlı çerçeve, paspartu ve oda önizleme), Slide-over Sepet, Checkout ve Sipariş Takip sayfası.
* **Faz 3 (Rol Tabanlı Yönetici Paneli):** `/admin/login` (Admin, Satış Direktörü, Katalog Editörü tek tıkla demo giriş), RBAC korumalı `AdminLayout`, Dashboard istatistikleri, Sipariş Yönetimi (durum güncelleme & fatura detayı) ve Ürün CRUD (ekleme/düzenleme/silme).