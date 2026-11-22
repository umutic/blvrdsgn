'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Lock, RotateCcw, Save } from 'lucide-react';
import { btn } from '@/components/admin/PageHeader';
import { isLockedCell, PERMISSION_GROUPS, ROLE_LABELS } from '@/config/permissions';
import { ROLE_ICONS } from './UserFormModal';

const ROLES = Object.keys(ROLE_LABELS);
const sameList = (a, b) => a.length === b.length && a.every((x) => b.includes(x));

/** Değişiklikleri insan okunur özet listesine çevirir (aktivite günlüğü için). */
export function diffMatrix(before, after) {
  const labels = Object.fromEntries(PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => [i.key, i.label])));
  const changes = [];
  for (const perm of Object.keys(after)) {
    for (const role of ROLES) {
      const had = before[perm]?.includes(role);
      const has = after[perm]?.includes(role);
      if (had !== has) changes.push(`${ROLE_LABELS[role]}: ${has ? '+' : '−'} ${labels[perm] ?? perm}`);
    }
  }
  return changes;
}

/**
 * Rol × yetki matrisi. Değişiklikler yerel taslakta tutulur; "Kaydet" ile roleService'e yazılır.
 * Kilitli hücreler (Sistem Yöneticisi, kullanıcı yönetimi) değiştirilemez.
 */
export function PermissionMatrix({ matrix, userCounts, onSave, onReset }) {
  const [draft, setDraft] = useState(matrix);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(matrix), [matrix]);

  const dirty = useMemo(() => Object.keys(matrix).some((p) => !sameList(matrix[p], draft[p] ?? [])), [matrix, draft]);
  const changes = useMemo(() => (dirty ? diffMatrix(matrix, draft) : []), [dirty, matrix, draft]);

  const toggle = (perm, role) => {
    if (isLockedCell(role, perm)) return;
    setDraft((d) => {
      const list = d[perm] ?? [];
      return { ...d, [perm]: list.includes(role) ? list.filter((r) => r !== role) : [...list, role] };
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await onSave(draft, changes);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#E4E4E7] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E4E4E7] px-5 py-4">
        <div>
          <p className="font-semibold">Rol & yetki matrisi</p>
          <p className="text-[13px] text-muted">Bir hücreye tıklayarak o rolün yetkisini açın/kapatın. Değişiklikler kaydedildiğinde tüm kullanıcılara anında uygulanır.</p>
        </div>
        <button type="button" onClick={onReset} className={btn.secondary}>
          <RotateCcw className="size-4" /> Varsayılana dön
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-[#EFEFF1] bg-[#FAFAFA]">
              <th className="w-[38%] px-5 py-4 text-left text-xs font-medium text-muted">Yetki</th>
              {ROLES.map((r) => {
                const Icon = ROLE_ICONS[r];
                const count = Object.keys(draft).filter((p) => draft[p].includes(r)).length;
                return (
                  <th key={r} className="px-3 py-4 text-center align-bottom">
                    <span className="mx-auto flex size-8 items-center justify-center rounded-lg bg-white ring-1 ring-[#E4E4E7]"><Icon className="size-4" strokeWidth={1.75} /></span>
                    <span className="mt-2 block text-[13px] font-semibold leading-tight">{ROLE_LABELS[r]}</span>
                    <span className="mt-0.5 block text-[11px] font-normal text-muted">{count} yetki · {userCounts[r] ?? 0} kişi</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          {PERMISSION_GROUPS.map((group) => (
            <tbody key={group.label} className="border-b border-[#EFEFF1] last:border-0">
              <tr>
                <td colSpan={ROLES.length + 1} className="bg-white px-5 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-muted">{group.label}</td>
              </tr>
              {group.items.map((item) => (
                <tr key={item.key} className="hover:bg-[#FAFAFA]">
                  <td className="px-5 py-3">
                    <p className="flex items-center gap-1.5 font-medium">
                      {item.label}
                      {item.locked && <Lock className="size-3 text-muted" aria-label="Kilitli" />}
                    </p>
                    <p className="text-xs text-muted">{item.desc}</p>
                  </td>
                  {ROLES.map((r) => {
                    const on = draft[item.key]?.includes(r);
                    const locked = isLockedCell(r, item.key);
                    const changed = on !== matrix[item.key]?.includes(r);
                    return (
                      <td key={r} className="px-3 py-3 text-center">
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          aria-label={`${ROLE_LABELS[r]} · ${item.label}`}
                          disabled={locked}
                          title={locked ? (r === 'admin' ? 'Sistem Yöneticisi tüm yetkilere sahiptir' : 'Bu yetki yalnızca Sistem Yöneticisine aittir') : undefined}
                          onClick={() => toggle(item.key, r)}
                          className={`relative mx-auto flex size-7 items-center justify-center rounded-lg border transition ${
                            on ? 'border-ink bg-ink text-white' : 'border-[#D4D4D8] bg-white text-transparent hover:border-ink/50'
                          } ${locked ? 'cursor-not-allowed opacity-45' : ''} ${changed ? 'ring-2 ring-accent ring-offset-2' : ''}`}
                        >
                          {locked && !on ? <Lock className="size-3 text-muted" /> : <Check className="size-4" strokeWidth={2.5} />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          ))}
        </table>
      </div>

      <AnimatePresence>
        {dirty && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="sticky bottom-4 mx-4 mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink px-5 py-3 text-white shadow-xl"
          >
            <div className="min-w-0 text-sm">
              <p className="font-medium">{changes.length} kaydedilmemiş değişiklik</p>
              <p className="truncate text-xs text-white/60">{changes.slice(0, 3).join(' · ')}{changes.length > 3 ? ' …' : ''}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setDraft(matrix)} className="h-9 rounded-lg px-3 text-sm font-medium text-white/80 hover:bg-white/10">Vazgeç</button>
              <button type="button" onClick={save} disabled={saving} className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-4 text-sm font-medium text-ink disabled:opacity-60">
                <Save className="size-4" /> Kaydet
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
