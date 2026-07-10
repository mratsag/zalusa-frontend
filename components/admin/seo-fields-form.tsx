"use client";

// Programmatik SEO düzenleme formu — şehir / TR il / TR ilçe ortak alanları.
// variant: "full" (meta/canonical/og dahil) | "tr" (yalın).

const INPUT = "w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40";

export type SeoFormValue = {
  name: string;
  slug: string;
  content: string;
  seo_title: string;
  seo_description: string;
  h1_override: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  price_min: number | null;
  price_max: number | null;
  price_currency: string;
  is_active: boolean;
};

export function SeoFieldsForm<T extends SeoFormValue>({
  value,
  onChange,
  variant = "full",
  extraTop,
}: {
  value: T;
  onChange: (patch: Partial<T>) => void;
  variant?: "full" | "tr";
  extraTop?: React.ReactNode;
}) {
  const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-4 text-sm font-bold text-slate-800">Temel bilgiler</h4>
        {extraTop}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div><label className="mb-1 block text-xs font-medium text-slate-600">Ad</label><input value={value.name} onChange={(e) => onChange({ name: e.target.value } as Partial<T>)} className={INPUT} /></div>
          <div><label className="mb-1 block text-xs font-medium text-slate-600">Slug</label><input value={value.slug} onChange={(e) => onChange({ slug: e.target.value } as Partial<T>)} className={INPUT} /></div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div><label className="mb-1 block text-xs font-medium text-slate-600">Fiyat min</label><input type="number" step="0.01" value={value.price_min ?? ""} onChange={(e) => onChange({ price_min: numOrNull(e.target.value) } as Partial<T>)} className={INPUT} /></div>
          <div><label className="mb-1 block text-xs font-medium text-slate-600">Fiyat max</label><input type="number" step="0.01" value={value.price_max ?? ""} onChange={(e) => onChange({ price_max: numOrNull(e.target.value) } as Partial<T>)} className={INPUT} /></div>
          <div><label className="mb-1 block text-xs font-medium text-slate-600">Para birimi</label><input value={value.price_currency} onChange={(e) => onChange({ price_currency: e.target.value } as Partial<T>)} placeholder="₺ / € / $" className={INPUT} /></div>
        </div>
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={value.is_active} onChange={(e) => onChange({ is_active: e.target.checked } as Partial<T>)} /> Aktif (yayında)
        </label>
      </div>

      <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-sm font-bold text-slate-800">SEO alanları</h4>
        <div><label className="mb-1 block text-sm font-medium text-slate-700">SEO Başlık</label><input value={value.seo_title} onChange={(e) => onChange({ seo_title: e.target.value } as Partial<T>)} className={INPUT} /></div>
        <div><label className="mb-1 block text-sm font-medium text-slate-700">Meta Description</label><textarea value={value.seo_description} onChange={(e) => onChange({ seo_description: e.target.value } as Partial<T>)} rows={2} className={INPUT} /></div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div><label className="mb-1 block text-sm font-medium text-slate-700">H1 Override</label><input value={value.h1_override} onChange={(e) => onChange({ h1_override: e.target.value } as Partial<T>)} className={INPUT} /></div>
          {variant === "full" && (
            <>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Meta Keywords</label><input value={value.meta_keywords ?? ""} onChange={(e) => onChange({ meta_keywords: e.target.value } as Partial<T>)} className={INPUT} /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">OG Title</label><input value={value.og_title ?? ""} onChange={(e) => onChange({ og_title: e.target.value } as Partial<T>)} className={INPUT} /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">OG Description</label><input value={value.og_description ?? ""} onChange={(e) => onChange({ og_description: e.target.value } as Partial<T>)} className={INPUT} /></div>
              <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700">Canonical URL</label><input value={value.canonical_url ?? ""} onChange={(e) => onChange({ canonical_url: e.target.value } as Partial<T>)} className={INPUT} /></div>
            </>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-2 text-sm font-bold text-slate-800">Sayfa İçeriği (SEO rehber HTML)</h4>
        <textarea value={value.content} onChange={(e) => onChange({ content: e.target.value } as Partial<T>)} spellCheck={false} className="h-[360px] w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-[13px] leading-6 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
      </div>
    </div>
  );
}
