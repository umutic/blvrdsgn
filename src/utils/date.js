/** Türkçe tarih biçimleri (admin tabloları ve detay ekranları). */

/** 22 Kas 2026 */
export function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** 14:32 */
export function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

/** 22 Kas 2026, 14:32 */
export function formatDateTime(iso) {
  if (!iso) return '—';
  return `${formatDate(iso)}, ${formatTime(iso)}`;
}

/** 22 Kasım 2026 Pazar, 14:32 */
export function formatLongDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' })}, ${formatTime(iso)}`;
}

/** İki tarih arası süre: "2 gün 4 sa" */
export function formatDuration(fromIso, toIso) {
  const mins = Math.max(0, Math.round((new Date(toIso) - new Date(fromIso)) / 60000));
  const days = Math.floor(mins / 1440);
  const hours = Math.floor((mins % 1440) / 60);
  const m = mins % 60;
  if (days) return hours ? `${days} gün ${hours} sa` : `${days} gün`;
  if (hours) return m ? `${hours} sa ${m} dk` : `${hours} sa`;
  return `${m} dk`;
}
