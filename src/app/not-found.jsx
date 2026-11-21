import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-6 py-24 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-muted">404</p>
      <h1 className="mt-2 font-display text-5xl">Sayfa bulunamadı</h1>
      <Button href="/" variant="outline" className="mt-8">Ana Sayfaya Dön</Button>
    </div>
  );
}
