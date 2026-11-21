import { unsplash } from '@/utils/media';

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} slug
 * @property {string} title
 * @property {string} artist
 * @property {string} description
 * @property {string} category      - CATEGORIES[].slug
 * @property {string[]} rooms       - ROOMS[].slug
 * @property {'dikey'|'yatay'} orientation
 * @property {number} basePrice     - 21×30 çerçevesiz fiyatı (TL)
 * @property {string} image         - Poster görseli (URL veya /public yolu)
 * @property {string[]} tags
 * @property {boolean} isNew
 * @property {boolean} isBestseller
 * @property {string} createdAt     - ISO tarih
 */

let counter = 0;
/** @returns {Product} */
function product({ photo, local, ...p }) {
  counter += 1;
  const orientation = p.orientation ?? 'dikey';
  const size = orientation === 'yatay' ? { w: 1200, h: 900 } : { w: 900, h: 1200 };
  return {
    id: `prd_${String(counter).padStart(3, '0')}`,
    artist: 'BLVRDSGN Studio',
    tags: [],
    isNew: false,
    isBestseller: false,
    orientation,
    image: local ?? unsplash(photo, size),
    createdAt: new Date(Date.UTC(2026, 9, counter)).toISOString(),
    ...p,
  };
}

/** @type {Product[]} */
export const INITIAL_PRODUCTS = [
  // Minimalist
  product({ slug: 'tek-daire', title: 'Tek Daire', photo: '1785443242105-aaa3b93177fc', category: 'minimalist', rooms: ['salon', 'yatak-odasi'], basePrice: 249, tags: ['turuncu', 'geometrik'], description: 'Şeftali çizgilerin üzerinde yükselen tek bir turuncu daire: denge ve sükûnet üzerine bir çalışma.' }),
  product({ slug: 'sisli-zirve', title: 'Sisli Zirve', photo: '1683659635051-39336c5476b8', category: 'minimalist', rooms: ['salon', 'calisma-odasi'], basePrice: 269, isNew: true, tags: ['dağ', 'japon'], description: 'Japon baskı geleneğinden ilham alan, kum tonlarında sakin bir dağ silueti.' }),
  product({ slug: 'kiyi-sessizligi', title: 'Kıyı Sessizliği', photo: '1775313088830-d049b7e27c2f', category: 'minimalist', rooms: ['yatak-odasi', 'salon'], orientation: 'yatay', basePrice: 279, tags: ['deniz', 'pastel'], description: 'Yumuşak pastel katmanlarla resmedilmiş, nefes aldıran bir sahil ufku.' }),
  product({ slug: 'tas-formlar', title: 'Taş Formlar', photo: '1580136607993-fd598cf5c4f5', category: 'minimalist', rooms: ['calisma-odasi', 'salon'], basePrice: 259, tags: ['organik', 'nötr'], description: 'İki organik formun sessiz diyaloğu; toprak ve taş tonlarında.' }),
  // Soyut
  product({ slug: 'renk-bahcesi', title: 'Renk Bahçesi', photo: '1760292343776-e8e35bb469c6', category: 'soyut', rooms: ['salon'], basePrice: 299, isBestseller: true, tags: ['renkli', 'organik'], description: 'Organik formların neşeli ve cesur buluşması; mekâna anında enerji katar.' }),
  product({ slug: 'kor-ve-gece', title: 'Kor ve Gece', photo: '1552250575-e508473b090f', category: 'soyut', rooms: ['salon', 'calisma-odasi'], basePrice: 309, tags: ['turuncu', 'lacivert'], description: 'Turuncu korun lacivert geceyle kesiştiği grafik bir kompozisyon.' }),
  product({ slug: 'komur-dokusu', title: 'Kömür Dokusu', photo: '1541512416146-3cf58d6b27cc', category: 'soyut', rooms: ['calisma-odasi', 'yatak-odasi'], basePrice: 289, isNew: true, tags: ['monokrom', 'doku'], description: 'Kalın fırça darbeleriyle örülmüş siyah-beyaz bir doku çalışması.' }),
  product({ slug: 'yaz-bahcesi', title: 'Yaz Bahçesi', photo: '1766083274533-0013e10828f7', category: 'soyut', rooms: ['salon', 'mutfak'], basePrice: 299, tags: ['yeşil', 'mozaik'], description: 'Yeşilin onlarca tonundan oluşan, bahçe hissi veren soyut bir mozaik.' }),
  // Tipografi (yerel SVG posterler)
  product({ slug: 'bugun-guzel-bir-gun', title: 'Bugün Güzel Bir Gün', local: '/posters/bugun-guzel-bir-gun.svg', category: 'tipografi', rooms: ['mutfak', 'calisma-odasi'], basePrice: 229, isBestseller: true, tags: ['motivasyon'], description: 'Her sabah hatırlatılması gereken o basit gerçek; terracotta bir güneşin altında.' }),
  product({ slug: 'once-kahve', title: 'Önce Kahve', local: '/posters/once-kahve.svg', category: 'tipografi', rooms: ['mutfak'], basePrice: 229, tags: ['kahve', 'mutfak'], description: 'Mutfağınızın en dürüst cümlesi; derin yeşil üzerine krem harfler.' }),
  product({ slug: 'yavas-yasa', title: 'Yavaş Yaşa', local: '/posters/yavas-yasa.svg', category: 'tipografi', rooms: ['yatak-odasi', 'salon'], basePrice: 239, isNew: true, tags: ['slow living'], description: 'Acele eden dünyaya zarif bir itiraz.' }),
  // Botanik
  product({ slug: 'mor-susen', title: 'Mor Süsen', photo: '1727527248663-5b0c475061b9', category: 'botanik', rooms: ['yatak-odasi', 'salon'], basePrice: 269, isBestseller: true, tags: ['çiçek', 'vintage botanik'], description: 'Klasik botanik illüstrasyon geleneğinde iki koyu mor süsen.' }),
  product({ slug: 'yaban-gulu', title: 'Yaban Gülü', photo: '1584282617200-32f377e493ef', category: 'botanik', rooms: ['yatak-odasi', 'mutfak'], basePrice: 259, tags: ['gül', 'krem'], description: 'Krem zemin üzerinde beyaz yaban gülleri; zamansız bir botanik baskı.' }),
  product({ slug: 'monstera-noir', title: 'Monstera Noir', photo: '1538898780761-268f71f67675', category: 'botanik', rooms: ['salon', 'calisma-odasi'], basePrice: 279, isNew: true, isBestseller: true, tags: ['monokrom', 'yaprak'], description: 'Siyah-beyaz bir monstera yaprağının grafik silueti.' }),
  product({ slug: 'kus-ve-dal', title: 'Kuş ve Dal', photo: '1579762715118-a6f1d4b934f1', category: 'botanik', rooms: ['cocuk-odasi', 'salon'], basePrice: 259, tags: ['kuş', 'doğa tarihi'], description: '19. yüzyıl doğa tarihi plakalarından ilham alan zarif bir kuş çalışması.' }),
  // Mimari & Şehir
  product({ slug: 'galata-sabahi', title: 'Galata Sabahı', photo: '1524231757912-21f4fe3a7200', category: 'mimari', rooms: ['salon', 'calisma-odasi'], basePrice: 299, isBestseller: true, tags: ['istanbul', 'galata'], description: 'Martıların eşliğinde Galata Kulesi ve Beyoğlu’nun çatıları.' }),
  product({ slug: 'suleymaniye-silueti', title: 'Süleymaniye Silueti', photo: '1623439844752-524658b16ce6', category: 'mimari', rooms: ['salon'], orientation: 'yatay', basePrice: 329, tags: ['istanbul', 'haliç'], description: 'Haliç’ten bakışla Süleymaniye ve tarihi yarımadanın silueti.' }),
  product({ slug: 'kiz-kulesi-aksami', title: 'Kız Kulesi Akşamı', photo: '1636537511494-c3e558e0702b', category: 'mimari', rooms: ['yatak-odasi', 'salon'], basePrice: 299, isNew: true, tags: ['istanbul', 'gün batımı'], description: 'Turuncu bir göğün altında Kız Kulesi’nin dingin duruşu.' }),
  product({ slug: 'brutalist-cephe', title: 'Brutalist Cephe', photo: '1787228770216-669baf984e87', category: 'mimari', rooms: ['calisma-odasi'], basePrice: 279, tags: ['beton', 'brutalizm'], description: 'Mavi göğe karşı ahşap kalıp izli kavisli bir beton yapı.' }),
  product({ slug: 'beyaz-zirveler', title: 'Beyaz Zirveler', photo: '1787728165633-e7c56bc88623', category: 'mimari', rooms: ['calisma-odasi', 'salon'], basePrice: 279, tags: ['geometrik', 'cephe'], description: 'Tırtıklı beyaz bir cephenin derin maviye karşı ritmi.' }),
  // Retro & Vintage
  product({ slug: 'kis-sporlari-1924', title: 'Kış Sporları 1924', photo: '1584448141569-69f342da535c', category: 'retro', rooms: ['salon', 'calisma-odasi'], basePrice: 289, isBestseller: true, tags: ['vintage afiş', 'kayak'], description: '1920’lerin kış sporları afişlerinden nostaljik bir seçki.' }),
  product({ slug: 'sahil-afisi', title: 'Sahil Afişi', photo: '1584448097764-374f81551427', category: 'retro', rooms: ['salon', 'mutfak'], basePrice: 279, tags: ['vintage afiş', 'deniz'], description: 'Art deco döneminin seyahat afişi estetiğiyle bir sahil günü.' }),
  // İslami Sanat & Modern Hat
  product({ slug: 'yildiz-geometrisi', title: 'Yıldız Geometrisi', photo: '1739478469935-65b0ac94355c', category: 'islami', rooms: ['salon', 'calisma-odasi'], basePrice: 299, isBestseller: true, tags: ['geometri', 'desen'], description: 'Kırmızı, yeşil ve altın tonlarında klasik bir yıldız geçme deseni.' }),
  product({ slug: 'siyah-beyaz-gecme', title: 'Siyah Beyaz Geçme', photo: '1775259608507-2ae6837c251a', category: 'islami', rooms: ['salon', 'yatak-odasi'], basePrice: 289, isNew: true, tags: ['geometri', 'monokrom'], description: 'Geleneksel geçme geometrisinin modern, monokrom bir yorumu.' }),
  product({ slug: 'kubbe-nakisi', title: 'Kubbe Nakışı', photo: '1573765727997-e02883182ba7', category: 'islami', rooms: ['salon'], basePrice: 319, isBestseller: true, tags: ['çini', 'kubbe'], description: 'Mavi ve altın çinilerle bezeli bir kubbenin büyüleyici simetrisi.' }),
  product({ slug: 'hat-rolyefi', title: 'Hat Rölyefi', photo: '1646229227468-ba6eb534d368', category: 'islami', rooms: ['salon', 'calisma-odasi'], basePrice: 309, tags: ['hat', 'rölyef'], description: 'Taş üzerine işlenmiş hat harflerinin ışık ve gölgeyle dansı.' }),
  // Çocuk Odası
  product({ slug: 'kucuk-buyucu', title: 'Küçük Büyücü', photo: '1761398601374-490e91b95818', category: 'cocuk', rooms: ['cocuk-odasi'], basePrice: 229, isNew: true, tags: ['illüstrasyon', 'masal'], description: 'Şapkasında kuşuyla sevimli bir büyücü; masal saatlerinin yeni kahramanı.' }),
  product({ slug: 'atlikarinca', title: 'Atlıkarınca', photo: '1787820005183-592b632c8b39', category: 'cocuk', rooms: ['cocuk-odasi'], basePrice: 239, tags: ['renkli', 'lunapark'], description: 'Desenli tentesiyle rengârenk bir atlıkarınca.' }),
];
