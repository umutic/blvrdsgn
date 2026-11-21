'use client';

import { Suspense, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, LayoutGrid, List, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ProductFormModal } from '@/components/admin/ProductFormModal';
import { RoleGuard } from '@/components/admin/RoleGuard';
import { PageHeader, btn, input } from '@/components/admin/PageHeader';
import { productService } from '@/services/productService';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { CATEGORIES, getCategory } from '@/data/categories';
import { formatTL } from '@/utils/pricing';

function ProductsView() {
  const searchParams = useSearchParams();
  const { data: products, loading } = useServiceQuery(productService.getAllProducts, productService.subscribe);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState('');
  const [view, setView] = useState('grid');
  const [modal, setModal] = useState({ open: false, product: null });

  const list = useMemo(() => {
    const q = query.toLocaleLowerCase('tr');
    return (products ?? []).filter((p) => (!category || p.category === category) && (!q || `${p.title} ${p.tags?.join(' ')}`.toLocaleLowerCase('tr').includes(q)));
  }, [products, query, category]);

  const stats = [
    { label: 'Toplam poster', value: products?.length ?? 0 },
    { label: 'Yeni etiketli', value: (products ?? []).filter((p) => p.isNew).length },
    { label: 'Çok satan', value: (products ?? []).filter((p) => p.isBestseller).length },
    { label: 'Ort. taban fiyat', value: formatTL((products ?? []).reduce((n, p) => n + p.basePrice, 0) / Math.max(1, products?.length ?? 1)) },
  ];

  const handleDelete = async (p) => {
    if (!window.confirm(`"${p.title}" kalıcı olarak silinsin mi?`)) return;
    await productService.deleteProduct(p.id);
    toast.success('Ürün silindi');
  };

  const edit = (p) => setModal({ open: true, product: p });

  return (
    <div>
      <PageHeader
        title="Ürün kataloğu"
        description="Eklenen ve güncellenen posterler vitrinde anında görünür."
        actions={<button type="button" onClick={() => setModal({ open: true, product: null })} className={btn.primary}><Plus className="size-4" /> Yeni poster</button>}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#E4E4E7] bg-white px-5 py-4">
            <p className="text-[13px] text-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Poster veya etiket ara" className={`${input} pl-9`} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="h-10 rounded-xl border border-[#E4E4E7] bg-white px-3 text-sm outline-none focus:border-ink/40">
          <option value="">Tüm kategoriler</option>
          {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <span className="text-[13px] text-muted">{list.length} sonuç</span>
        <div className="ml-auto flex rounded-xl border border-[#E4E4E7] bg-white p-1">
          {[['grid', LayoutGrid], ['table', List]].map(([id, Icon]) => (
            <button key={id} type="button" onClick={() => setView(id)} aria-label={id === 'grid' ? 'Izgara' : 'Tablo'} className={`rounded-lg p-1.5 transition ${view === id ? 'bg-ink text-white' : 'text-muted hover:text-ink'}`}>
              <Icon className="size-4" />
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="aspect-[4/5] animate-pulse rounded-2xl bg-white" />)}</div>
      ) : view === 'grid' ? (
        <motion.div layout className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          <AnimatePresence>
            {list.map((p) => (
              <motion.div key={p.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="group overflow-hidden rounded-2xl border border-[#E4E4E7] bg-white">
                <div className="relative flex aspect-[4/5] items-center justify-center bg-[#EDEDEB] p-[12%]">
                  <div className="relative h-full w-full shadow-[0_14px_24px_-14px_rgba(0,0,0,.45)]">
                    <Image src={p.image} alt={p.title} fill sizes="20vw" className="object-cover" />
                  </div>
                  <div className="absolute left-2.5 top-2.5 flex gap-1">
                    {p.isNew && <span className="rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-medium text-white">Yeni</span>}
                    {p.isBestseller && <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">Çok satan</span>}
                  </div>
                  <div className="absolute inset-x-2.5 bottom-2.5 flex translate-y-2 justify-center gap-1.5 opacity-0 transition group-hover:translate-y-0 group-hover:opacity-100">
                    <button type="button" onClick={() => edit(p)} className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium shadow-md hover:bg-ink hover:text-white"><Pencil className="size-3.5" /> Düzenle</button>
                    <Link href={`/urun/${p.slug}`} target="_blank" aria-label="Vitrinde gör" className="rounded-lg bg-white p-1.5 shadow-md hover:bg-ink hover:text-white"><ExternalLink className="size-3.5" /></Link>
                    <RoleGuard permission="DELETE_PRODUCTS">
                      <button type="button" onClick={() => handleDelete(p)} aria-label="Sil" className="rounded-lg bg-white p-1.5 text-red-700 shadow-md hover:bg-red-700 hover:text-white"><Trash2 className="size-3.5" /></button>
                    </RoleGuard>
                  </div>
                </div>
                <div className="p-3.5">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <div className="mt-0.5 flex items-center justify-between text-xs text-muted">
                    <span className="truncate">{getCategory(p.category)?.name}</span>
                    <span className="font-medium tabular-nums text-ink">{formatTL(p.basePrice)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E4E4E7] bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-[#EFEFF1] bg-[#FAFAFA] text-left text-xs text-muted">
              <tr><th className="px-5 py-3 font-medium">Poster</th><th className="px-5 py-3 font-medium">Kategori</th><th className="px-5 py-3 font-medium">Yönelim</th><th className="px-5 py-3 font-medium">Odalar</th><th className="px-5 py-3 text-right font-medium">Taban fiyat</th><th className="px-5 py-3" /></tr>
            </thead>
            <tbody className="divide-y divide-[#EFEFF1]">
              {list.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-[#FAFAFA]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-surface"><Image src={p.image} alt="" fill sizes="40px" className="object-cover" /></div>
                      <div>
                        <p className="font-medium">{p.title}</p>
                        <p className="text-xs text-muted">{p.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">{getCategory(p.category)?.name}</td>
                  <td className="px-5 py-3 capitalize text-muted">{p.orientation}</td>
                  <td className="px-5 py-3 text-xs text-muted">{p.rooms?.length ?? 0} oda</td>
                  <td className="px-5 py-3 text-right font-medium tabular-nums">{formatTL(p.basePrice)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => edit(p)} aria-label="Düzenle" className="rounded-lg p-2 text-muted hover:bg-[#F4F4F5] hover:text-ink"><Pencil className="size-4" /></button>
                      <RoleGuard permission="DELETE_PRODUCTS">
                        <button type="button" onClick={() => handleDelete(p)} aria-label="Sil" className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-700"><Trash2 className="size-4" /></button>
                      </RoleGuard>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal open={modal.open} product={modal.product} onClose={() => setModal({ open: false, product: null })} />
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsView />
    </Suspense>
  );
}
