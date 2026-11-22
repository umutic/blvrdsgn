import { INITIAL_PRODUCTS } from './initialProducts';
import { SIZES } from './sizes';
import { FRAMES } from './frames';
import { INITIAL_COUPONS } from './initialCoupons';
import { calculateCartTotals, getUnitPrice } from '@/utils/pricing';

/** @typedef {'Hazırlanıyor'|'Baskı Aşamasında'|'Kargoya Verildi'|'Teslim Edildi'} OrderStatus */
export const ORDER_STATUSES = ['Hazırlanıyor', 'Baskı Aşamasında', 'Kargoya Verildi', 'Teslim Edildi'];

const FIRST = ['Elif', 'Mert', 'Zeynep', 'Can', 'Ayşe', 'Emre', 'Deniz', 'Selin', 'Burak', 'Ece', 'Kerem', 'Defne', 'Ali', 'Naz', 'Ozan', 'İpek', 'Barış', 'Melis', 'Kaan', 'Yağmur'];
const LAST = ['Yılmaz', 'Kaya', 'Demir', 'Şahin', 'Çelik', 'Aydın', 'Öztürk', 'Arslan', 'Doğan', 'Koç', 'Kurt', 'Aksoy'];
const CITIES = [['İstanbul', 'Kadıköy'], ['İstanbul', 'Beşiktaş'], ['Ankara', 'Çankaya'], ['İzmir', 'Urla'], ['İzmir', 'Karşıyaka'], ['Bursa', 'Nilüfer'], ['Antalya', 'Muratpaşa'], ['Eskişehir', 'Tepebaşı']];
const GIFT_MESSAGES = [
  'İyi ki doğdun! Yeni evinin duvarları senin kadar güzel olsun.',
  'Yeni evinize hoş geldiniz. Sevgiyle, Ece & Kaan',
  'Mutlu yıllar canım annem, seni çok seviyorum.',
  'Yeni ofisinde bol şans! Bu tablo sana ilham versin.',
  '',
  'Evlilik yıldönümümüz kutlu olsun ❤',
];
const COMPANIES = ['Kaya Mimarlık Ltd.', 'Nova Ofis A.Ş.', 'Atölye Kare', 'Moda Kafe Ltd.'];

/** Deterministik PRNG (mulberry32) — her kurulumda aynı içerik, tarihler bugüne göre. */
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Son 60 güne yayılmış, hafif artan trendli örnek siparişler üretir. */
export function generateSeedOrders(now = Date.now()) {
  const rand = rng(20261121);
  const giftRand = rng(1225); // hediye alanları ayrı akıştan: diğer seed alanları değişmez
  const pick = (arr) => arr[Math.floor(rand() * arr.length)];
  const DAY = 86400000;
  const orders = [];
  let seq = 100200;

  for (let daysAgo = 59; daysAgo >= 0; daysAgo -= 1) {
    const perDay = Math.floor(rand() * 2.2 + (60 - daysAgo) / 30 + 0.4);
    for (let n = 0; n < perDay; n += 1) {
      const createdAt = now - daysAgo * DAY - Math.floor(rand() * 20) * 3600000;
      const items = Array.from({ length: 1 + Math.floor(rand() * rand() * 3) }, () => {
        const p = rand() < 0.45 ? pick(INITIAL_PRODUCTS.filter((x) => x.isBestseller)) : pick(INITIAL_PRODUCTS);
        const sizeId = pick(SIZES).id;
        const frameId = rand() < 0.25 ? FRAMES[0].id : pick(FRAMES.slice(1)).id;
        const mat = frameId !== FRAMES[0].id && rand() < 0.35;
        return { productId: p.id, slug: p.slug, title: p.title, image: p.image, sizeId, frameId, mat, quantity: rand() < 0.15 ? 2 : 1, unitPrice: getUnitPrice(p.basePrice, sizeId, frameId, mat) };
      });
      const coupon = rand() < 0.3 ? pick(INITIAL_COUPONS) : null;
      const totals = calculateCartTotals(items, coupon);
      const ageDays = (now - createdAt) / DAY;
      const stage = ageDays > 7 ? 3 : ageDays > 4 ? 2 : ageDays > 1.5 ? 1 : 0;
      const [city, district] = pick(CITIES);
      const first = pick(FIRST);
      const last = pick(LAST);
      const corporate = rand() < 0.15;
      seq += 1;
      orders.push({
        id: `BLV-${seq}`,
        createdAt: new Date(createdAt).toISOString(),
        status: ORDER_STATUSES[stage],
        statusHistory: ORDER_STATUSES.slice(0, stage + 1).map((s, i) => ({ status: s, at: new Date(createdAt + i * 1.6 * DAY).toISOString() })),
        customer: { fullName: `${first} ${last}`, email: `${first}.${last}`.toLocaleLowerCase('tr').replace(/[^a-z.]/g, '') + '@example.com', phone: '05xx xxx xx xx' },
        shippingAddress: { city, district, address: `${pick(['Moda', 'Bahariye', 'Tunalı', 'İskele', 'Çarşı', 'Lale'])} Cd. No:${1 + Math.floor(rand() * 90)}` },
        invoice: corporate ? { type: 'kurumsal', companyName: pick(COMPANIES), taxOffice: district, taxNo: String(1000000000 + Math.floor(rand() * 8999999999)) } : { type: 'bireysel' },
        items,
        totals: { subtotal: totals.subtotal, discount: totals.discount, shipping: totals.shipping, total: totals.total },
        couponCode: totals.discount > 0 ? coupon.code : null,
        note: rand() < 0.12 ? 'Kapıcıya bırakılabilir.' : '',
        gift: giftRand() < 0.18
          ? { isGift: true, recipientName: `${FIRST[Math.floor(giftRand() * FIRST.length)]} ${LAST[Math.floor(giftRand() * LAST.length)]}`, message: GIFT_MESSAGES[Math.floor(giftRand() * GIFT_MESSAGES.length)], hidePrices: giftRand() < 0.7 }
          : null,
      });
    }
  }
  return orders;
}
