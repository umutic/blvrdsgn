'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { AccessDenied } from '@/components/admin/AccessDenied';
import { useAuthStore } from '@/store/useAuthStore';
import { useHasMounted } from '@/hooks/useHasMounted';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { orderService } from '@/services/orderService';
import { productService } from '@/services/productService';
import { canAccessRoute, getAllowedRoutes, getDefaultAdminRoute, hasPermission } from '@/config/permissions';

/** Admin Auth + RBAC Guard (CLAUDE.md §4.2). */
export default function AdminLayout({ children }) {
  const mounted = useHasMounted();
  const pathname = usePathname();
  const router = useRouter();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (!mounted) return;
    if (!session && !isLoginPage) router.replace('/admin/login');
    if (session && isLoginPage) router.replace(getDefaultAdminRoute(session.role));
  }, [mounted, session, isLoginPage, router]);

  if (isLoginPage) return children;

  if (!mounted || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F6F6F7]">
        <span className="size-6 animate-spin rounded-full border-2 border-ink/20 border-t-ink" />
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/admin/login');
  };

  return <AdminFrame session={session} onLogout={handleLogout} pathname={pathname}>{children}</AdminFrame>;
}

function AdminFrame({ session, onLogout, pathname, children }) {
  const canOrders = hasPermission(session.role, 'MANAGE_ORDERS');
  // Sipariş yetkisi olmayan rol sipariş verisini hiç çekmez.
  const { data: orders } = useServiceQuery(canOrders ? orderService.getAllOrders : async () => [], orderService.subscribe, [canOrders]);
  const { data: products } = useServiceQuery(productService.getAllProducts, productService.subscribe);
  const pending = (orders ?? []).filter((o) => o.status !== 'Teslim Edildi').length;

  return (
    <div className="flex min-h-screen bg-[#F6F6F7] text-ink">
      <AdminSidebar session={session} onLogout={onLogout} badges={{ orders: canOrders ? pending : null, products: products?.length ?? null }} />
      <div className="min-w-0 flex-1">
        <AdminTopbar session={session} onLogout={onLogout} orders={orders ?? []} products={products ?? []} />
        {/* Mobil gezinme (kenar çubuğu lg altında gizli) */}
        <nav className="no-scrollbar flex gap-1 overflow-x-auto border-b border-[#E4E4E7] bg-white px-4 py-2 lg:hidden">
          {getAllowedRoutes(session.role).map((r) => {
            const active = r.href === '/admin' ? pathname === '/admin' : pathname.startsWith(r.href);
            return (
              <Link key={r.href} href={r.href} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${active ? 'bg-ink text-white' : 'text-muted'}`}>
                {r.label}
              </Link>
            );
          })}
        </nav>
        <motion.main key={pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="px-6 py-8 lg:px-8">
          {canAccessRoute(session.role, pathname) ? children : <AccessDenied role={session.role} />}
        </motion.main>
      </div>
    </div>
  );
}
