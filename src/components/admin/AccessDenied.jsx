import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { getDefaultAdminRoute, ROLE_LABELS } from '@/config/permissions';

export function AccessDenied({ role }) {
  return (
    <div className="mx-auto mt-20 max-w-md rounded-2xl border border-[#E4E4E7] bg-white p-10 text-center">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <ShieldAlert className="size-7" strokeWidth={1.5} />
      </span>
      <h1 className="mt-5 text-xl font-semibold">Erişim kısıtlı</h1>
      <p className="mt-2 text-sm text-muted">Bu sayfayı görüntüleme yetkiniz bulunmamaktadır. Rolünüz: <strong className="text-ink">{ROLE_LABELS[role]}</strong></p>
      <Link href={getDefaultAdminRoute(role)} className="mt-6 inline-flex h-10 items-center rounded-xl bg-ink px-5 text-sm font-medium text-white">Yetkili olduğum sayfaya git</Link>
    </div>
  );
}
