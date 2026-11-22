'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, KeyRound, LogIn, Pencil, Search, ShieldCheck, ShoppingBag, Trash2, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar } from '@/components/admin/Avatar';
import { PageHeader, btn, input } from '@/components/admin/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { generatePassword, ROLE_ICONS, UserFormModal } from '@/components/admin/users/UserFormModal';
import { PermissionMatrix } from '@/components/admin/users/PermissionMatrix';
import { usePermissionMatrix } from '@/components/admin/RoleGuard';
import { useAuthStore } from '@/store/useAuthStore';
import { useServiceQuery } from '@/hooks/useServiceQuery';
import { userService } from '@/services/userService';
import { roleService } from '@/services/roleService';
import { auditService } from '@/services/auditService';
import { ROLE_LABELS } from '@/config/permissions';
import { relativeTime } from '@/utils/analytics';
import { formatDate, formatDateTime } from '@/utils/date';

const TABS = [
  { value: 'users', label: 'Kullanıcılar' },
  { value: 'roles', label: 'Rol & Yetki Matrisi' },
  { value: 'activity', label: 'Aktivite Günlüğü' },
];

const LOG_META = {
  auth: { icon: LogIn, label: 'Giriş', tone: 'bg-sky-50 text-sky-700' },
  user: { icon: Users, label: 'Kullanıcı', tone: 'bg-violet-50 text-violet-700' },
  role: { icon: ShieldCheck, label: 'Yetki', tone: 'bg-amber-50 text-amber-700' },
  order: { icon: ShoppingBag, label: 'Sipariş', tone: 'bg-emerald-50 text-emerald-700' },
};

export default function AdminUsersPage() {
  const session = useAuthStore((s) => s.session);
  const matrix = usePermissionMatrix();
  const { data: users, loading } = useServiceQuery(userService.getAllUsers, userService.subscribe);
  const { data: logs } = useServiceQuery(auditService.getLogs, auditService.subscribe);

  const [tab, setTab] = useState('users');
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [logFilter, setLogFilter] = useState('');
  const [formUser, setFormUser] = useState(null); // null: kapalı, 'new': yeni, {user}: düzenle
  const [pwUser, setPwUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteUser, setDeleteUser] = useState(null);
  const [created, setCreated] = useState(null); // oluşturulan kullanıcının giriş bilgileri

  const audit = (category, message, target) => auditService.log({ actor: session, category, message, target });
  const all = users ?? [];
  const userCounts = useMemo(() => all.reduce((m, u) => ({ ...m, [u.role]: (m[u.role] ?? 0) + 1 }), {}), [all]);

  const stats = useMemo(() => {
    const day = Date.now() - 86400000;
    return [
      { label: 'Toplam kullanıcı', value: all.length },
      { label: 'Aktif', value: all.filter((u) => u.isActive).length },
      { label: 'Pasif', value: all.filter((u) => !u.isActive).length },
      { label: 'Son 24 saatte giriş', value: all.filter((u) => u.lastLoginAt && new Date(u.lastLoginAt).getTime() > day).length },
    ];
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    return all.filter(
      (u) =>
        (!roleFilter || u.role === roleFilter) &&
        (!statusFilter || (statusFilter === 'active' ? u.isActive : !u.isActive)) &&
        (!q || `${u.name} ${u.email}`.toLocaleLowerCase('tr').includes(q))
    );
  }, [all, query, roleFilter, statusFilter]);

  const visibleLogs = useMemo(() => (logs ?? []).filter((l) => !logFilter || l.category === logFilter), [logs, logFilter]);

  /* ---------- İşlemler ---------- */
  const submitUser = async (values) => {
    try {
      if (formUser === 'new') {
        const user = await userService.createUser(values);
        await audit('user', 'Yeni kullanıcı ekledi', `${user.name} · ${ROLE_LABELS[user.role]}`);
        setCreated({ ...user, password: values.password });
        toast.success(`${user.name} oluşturuldu`);
      } else {
        const before = formUser;
        const isSelf = before.id === session.id;
        const patch = { name: values.name, email: values.email, ...(isSelf ? {} : { role: values.role }) };
        const user = await userService.updateUser(before.id, patch);
        if (user.role !== before.role) await audit('user', 'Rolünü değiştirdi', `${user.name}: ${ROLE_LABELS[before.role]} → ${ROLE_LABELS[user.role]}`);
        if (user.name !== before.name || user.email !== before.email) await audit('user', 'Kullanıcı bilgilerini güncelledi', user.name);
        toast.success('Kullanıcı güncellendi');
      }
      setFormUser(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleActive = async (u) => {
    try {
      await userService.updateUser(u.id, { isActive: !u.isActive });
      await audit('user', u.isActive ? 'Kullanıcıyı pasif yaptı' : 'Kullanıcıyı aktif yaptı', u.name);
      toast.success(`${u.name} ${u.isActive ? 'pasif' : 'aktif'} yapıldı`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openReset = (u) => {
    setNewPassword(generatePassword());
    setPwUser(u);
  };

  const confirmReset = async () => {
    try {
      await userService.resetPassword(pwUser.id, newPassword);
      await audit('user', 'Şifresini sıfırladı', pwUser.name);
      navigator.clipboard?.writeText(newPassword);
      toast.success('Şifre sıfırlandı ve panoya kopyalandı');
      setPwUser(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDelete = async () => {
    try {
      await userService.deleteUser(deleteUser.id);
      await audit('user', 'Kullanıcıyı sildi', `${deleteUser.name} · ${deleteUser.email}`);
      toast.success(`${deleteUser.name} silindi`);
      setDeleteUser(null);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const saveMatrix = async (draft, changes) => {
    try {
      await roleService.saveMatrix(draft);
      await audit('role', 'Yetki matrisini güncelledi', changes.join(' · '));
      toast.success('Yetkiler kaydedildi ve tüm kullanıcılara uygulandı');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const resetMatrix = async () => {
    await roleService.resetMatrix();
    await audit('role', 'Yetki matrisini varsayılana döndürdü');
    toast.success('Varsayılan yetkiler geri yüklendi');
  };

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    toast.success('Panoya kopyalandı');
  };

  return (
    <div>
      <PageHeader
        title="Kullanıcılar & Yetkiler"
        description="Panel hesaplarını yönetin, rol atayın ve her rolün neye erişebileceğini belirleyin."
        actions={
          <button type="button" onClick={() => setFormUser('new')} className={btn.primary}>
            <UserPlus className="size-4" /> Yeni kullanıcı
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#E4E4E7] bg-white px-5 py-4">
            <p className="text-[13px] text-muted">{s.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="no-scrollbar mb-5 flex gap-1 overflow-x-auto border-b border-[#E4E4E7]">
        {TABS.map((t) => (
          <button key={t.value} type="button" onClick={() => setTab(t.value)} className={`relative whitespace-nowrap px-3 py-3 text-sm font-medium transition-colors ${tab === t.value ? 'text-ink' : 'text-muted hover:text-ink'}`}>
            {t.label}
            {tab === t.value && <motion.span layoutId="users-tab" className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-ink" />}
          </button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="rounded-2xl border border-[#E4E4E7] bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-[#E4E4E7] p-4">
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ad veya e-posta ara" className={`${input} pl-9`} />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Rol filtresi" className={`${input} w-auto!`}>
              <option value="">Tüm roller</option>
              {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Durum filtresi" className={`${input} w-auto!`}>
              <option value="">Tüm durumlar</option>
              <option value="active">Aktif</option>
              <option value="passive">Pasif</option>
            </select>
            <span className="ml-auto text-[13px] text-muted">{filtered.length} kullanıcı</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-sm">
              <thead className="border-b border-[#EFEFF1] bg-[#FAFAFA] text-left text-xs text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Kullanıcı</th>
                  <th className="px-5 py-3 font-medium">Rol</th>
                  <th className="px-5 py-3 font-medium">Durum</th>
                  <th className="px-5 py-3 font-medium">Son giriş</th>
                  <th className="px-5 py-3 font-medium">Oluşturulma</th>
                  <th className="px-5 py-3 text-right font-medium">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFEFF1]">
                {loading && Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-5 animate-pulse rounded bg-[#F4F4F5]" /></td></tr>
                ))}
                {!loading && filtered.length === 0 && <tr><td colSpan={6} className="px-5 py-16 text-center text-muted">Bu filtreye uyan kullanıcı yok.</td></tr>}
                {filtered.map((u) => {
                  const isSelf = u.id === session.id;
                  const RoleIcon = ROLE_ICONS[u.role];
                  return (
                    <tr key={u.id} className={`transition-colors hover:bg-[#FAFAFA] ${u.isActive ? '' : 'text-muted'}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={u.name} size="size-9" className={u.isActive ? '' : 'opacity-50'} />
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 truncate font-medium text-ink">
                              {u.name}
                              {isSelf && <span className="rounded-full bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white">Siz</span>}
                              {u.demo && <span className="rounded-full bg-[#F4F4F5] px-1.5 py-0.5 text-[10px] font-medium text-muted">Demo</span>}
                            </p>
                            <p className="truncate text-xs text-muted">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#F4F4F5] px-2.5 py-1 text-xs font-medium text-ink">
                          <RoleIcon className="size-3.5" strokeWidth={1.75} /> {ROLE_LABELS[u.role]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={u.isActive}
                          aria-label={`${u.name} ${u.isActive ? 'aktif' : 'pasif'}`}
                          disabled={isSelf}
                          title={isSelf ? 'Kendi hesabınızı pasif yapamazsınız' : undefined}
                          onClick={() => toggleActive(u)}
                          className="flex items-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${u.isActive ? 'bg-emerald-600' : 'bg-[#D4D4D8]'}`}>
                            <motion.span layout className={`absolute top-0.5 size-4 rounded-full bg-white shadow ${u.isActive ? 'right-0.5' : 'left-0.5'}`} />
                          </span>
                          <span className="text-xs font-medium">{u.isActive ? 'Aktif' : 'Pasif'}</span>
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5">
                        {u.lastLoginAt ? (
                          <>
                            <p className="text-ink">{relativeTime(u.lastLoginAt)}</p>
                            <p className="text-xs text-muted">{formatDateTime(u.lastLoginAt)}</p>
                          </>
                        ) : (
                          <span className="text-xs text-muted">Henüz giriş yok</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-muted">{formatDate(u.createdAt)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-1">
                          <IconBtn label="Düzenle" onClick={() => setFormUser(u)}><Pencil className="size-4" /></IconBtn>
                          <IconBtn label="Şifre sıfırla" onClick={() => openReset(u)}><KeyRound className="size-4" /></IconBtn>
                          <IconBtn label={isSelf ? 'Kendi hesabınızı silemezsiniz' : 'Sil'} disabled={isSelf} danger onClick={() => setDeleteUser(u)}><Trash2 className="size-4" /></IconBtn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'roles' && <PermissionMatrix matrix={matrix} userCounts={userCounts} onSave={saveMatrix} onReset={resetMatrix} />}

      {tab === 'activity' && (
        <div className="rounded-2xl border border-[#E4E4E7] bg-white">
          <div className="flex flex-wrap items-center gap-2 border-b border-[#E4E4E7] p-4">
            {[['', 'Tümü'], ...Object.entries(LOG_META).map(([k, v]) => [k, v.label])].map(([k, label]) => (
              <button key={k} type="button" onClick={() => setLogFilter(k)} className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition ${logFilter === k ? 'bg-ink text-white' : 'bg-[#F4F4F5] text-muted hover:text-ink'}`}>
                {label}
              </button>
            ))}
            <span className="ml-auto text-[13px] text-muted">{visibleLogs.length} kayıt</span>
          </div>
          {visibleLogs.length === 0 ? (
            <p className="px-5 py-16 text-center text-sm text-muted">Kayıt yok.</p>
          ) : (
            <ol className="divide-y divide-[#EFEFF1]">
              {visibleLogs.slice(0, 120).map((l) => {
                const meta = LOG_META[l.category] ?? LOG_META.user;
                return (
                  <li key={l.id} className="flex items-start gap-4 px-5 py-3.5">
                    <span className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ${meta.tone}`}><meta.icon className="size-4" /></span>
                    <div className="min-w-0 flex-1 text-sm">
                      <p>
                        <span className="font-medium">{l.actor?.name ?? 'Sistem'}</span>
                        {l.actor && <span className="text-muted"> · {ROLE_LABELS[l.actor.role] ?? l.actor.role}</span>}
                      </p>
                      <p className="text-ink/80">{l.message}{l.target && <span className="text-muted"> — {l.target}</span>}</p>
                    </div>
                    <div className="shrink-0 text-right text-xs">
                      <p className="font-medium">{relativeTime(l.at)}</p>
                      <p className="text-muted">{formatDateTime(l.at)}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      )}

      {/* Ekle / düzenle */}
      <UserFormModal
        open={formUser !== null}
        user={formUser === 'new' ? null : formUser}
        lockRole={formUser !== 'new' && formUser?.id === session.id}
        matrix={matrix}
        onClose={() => setFormUser(null)}
        onSubmit={submitUser}
      />

      {/* Oluşturulan kullanıcının giriş bilgileri */}
      <Modal open={Boolean(created)} onClose={() => setCreated(null)} title="Kullanıcı oluşturuldu" className="max-w-md">
        {created && (
          <div className="space-y-4 text-sm">
            <p className="text-muted">Aşağıdaki giriş bilgilerini <strong className="text-ink">{created.name}</strong> ile güvenli bir kanaldan paylaşın. Şifre bir daha gösterilmeyecek.</p>
            <div className="space-y-2 rounded-xl bg-[#F6F6F7] p-4 font-mono text-[13px]">
              <CopyRow label="E-posta" value={created.email} onCopy={copy} />
              <CopyRow label="Şifre" value={created.password} onCopy={copy} />
              <p className="pt-1 font-sans text-xs text-muted">Rol: {ROLE_LABELS[created.role]}</p>
            </div>
            <div className="flex justify-end"><button type="button" onClick={() => setCreated(null)} className={btn.primary}>Tamam</button></div>
          </div>
        )}
      </Modal>

      {/* Şifre sıfırlama */}
      <Modal open={Boolean(pwUser)} onClose={() => setPwUser(null)} title="Şifre sıfırla" className="max-w-md">
        {pwUser && (
          <div className="space-y-4 text-sm">
            <p className="text-muted"><strong className="text-ink">{pwUser.name}</strong> için yeni geçici şifre. Onayladığınızda eski şifre geçersiz olur.</p>
            <div className="flex gap-2">
              <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={`${input} font-mono`} aria-label="Yeni şifre" />
              <button type="button" onClick={() => setNewPassword(generatePassword())} className={btn.secondary}>Üret</button>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setPwUser(null)} className={btn.secondary}>Vazgeç</button>
              <button type="button" onClick={confirmReset} className={btn.primary}><KeyRound className="size-4" /> Sıfırla ve kopyala</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Silme onayı */}
      <Modal open={Boolean(deleteUser)} onClose={() => setDeleteUser(null)} title="Kullanıcıyı sil" className="max-w-md">
        {deleteUser && (
          <div className="space-y-5 text-sm">
            <p className="text-muted">
              <strong className="text-ink">{deleteUser.name}</strong> ({deleteUser.email}) kalıcı olarak silinecek ve oturumu kapatılacak. Geçici olarak erişimi kesmek istiyorsanız bunun yerine hesabı <strong className="text-ink">pasif</strong> yapabilirsiniz.
            </p>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setDeleteUser(null)} className={btn.secondary}>Vazgeç</button>
              <button type="button" onClick={confirmDelete} className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700"><Trash2 className="size-4" /> Kalıcı olarak sil</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 text-muted transition disabled:cursor-not-allowed disabled:opacity-35 ${danger ? 'hover:bg-red-50 hover:text-red-700' : 'hover:bg-[#F4F4F5] hover:text-ink'}`}
    >
      {children}
    </button>
  );
}

function CopyRow({ label, value, onCopy }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted">{label}</span>
      <button type="button" onClick={() => onCopy(value)} className="group flex min-w-0 items-center gap-2 font-medium">
        <span className="truncate">{value}</span>
        <Copy className="size-3.5 shrink-0 text-muted group-hover:text-ink" />
      </button>
    </div>
  );
}
