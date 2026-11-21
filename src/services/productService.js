import { DATA_PROVIDER } from '@/config/env';
import { STORAGE_KEYS } from '@/config/storageKeys';
import { INITIAL_PRODUCTS } from '@/data/initialProducts';
import { readCollection, writeCollection, subscribeCollection } from './local/localDb';
import { createPendingSupabaseProvider } from './supabaseClient';
import { createId, slugify } from '@/utils/id';

const KEY = STORAGE_KEYS.PRODUCTS;
const load = () => readCollection(KEY, INITIAL_PRODUCTS);

function uniqueSlug(base, products, ignoreId) {
  const root = slugify(base) || 'poster';
  let slug = root;
  let i = 2;
  while (products.some((p) => p.slug === slug && p.id !== ignoreId)) slug = `${root}-${i++}`;
  return slug;
}

/** localStorage sağlayıcısı */
const localProvider = {
  async getAllProducts() {
    return load();
  },
  async getProductBySlug(slug) {
    return load().find((p) => p.slug === slug) ?? null;
  },
  async getProductById(id) {
    return load().find((p) => p.id === id) ?? null;
  },
  async createProduct(input) {
    const products = load();
    const product = {
      tags: [],
      rooms: [],
      isNew: true,
      isBestseller: false,
      ...input,
      id: createId('prd'),
      slug: uniqueSlug(input.slug || input.title, products),
      basePrice: Number(input.basePrice),
      createdAt: new Date().toISOString(),
    };
    writeCollection(KEY, [product, ...products]);
    return product;
  },
  async updateProduct(id, patch) {
    const products = load();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Ürün bulunamadı');
    const next = { ...products[idx], ...patch, id };
    if (patch.title || patch.slug) next.slug = uniqueSlug(patch.slug || next.slug, products, id);
    if (patch.basePrice !== undefined) next.basePrice = Number(patch.basePrice);
    products[idx] = next;
    writeCollection(KEY, products);
    return next;
  },
  async deleteProduct(id) {
    writeCollection(KEY, load().filter((p) => p.id !== id));
  },
  subscribe(callback) {
    return subscribeCollection(KEY, callback);
  },
};

export const productService =
  DATA_PROVIDER === 'supabase'
    ? createPendingSupabaseProvider('productService', Object.keys(localProvider))
    : localProvider;
