"use client";

import { useCallback, useEffect, useState } from "react";
import { Settings as SettingsIcon, Save, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

import { getSettings, updateSettings, type Settings } from "@/lib/services/settingsService";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[60] max-w-sm">
      <div className={`flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg ring-1 ${type === "success" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
        {type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

type Field = { key: string; label: string; type?: "text" | "textarea" | "toggle" };
type Group = { title: string; fields: Field[] };

const GROUPS: Group[] = [
  {
    title: "İletişim",
    fields: [
      { key: "contact_email", label: "E-posta" },
      { key: "contact_phone", label: "Telefon" },
      { key: "contact_whatsapp", label: "WhatsApp" },
      { key: "contact_address", label: "Adres" },
      { key: "map_embed_url", label: "Harita Embed URL" },
    ],
  },
  {
    title: "Sosyal Medya",
    fields: [
      { key: "social_instagram", label: "Instagram" },
      { key: "social_facebook", label: "Facebook" },
      { key: "social_twitter", label: "X / Twitter" },
      { key: "social_linkedin", label: "LinkedIn" },
      { key: "social_youtube", label: "YouTube" },
    ],
  },
  {
    title: "Çalışma Saatleri",
    fields: [
      { key: "working_hours_weekdays", label: "Hafta içi" },
      { key: "working_hours_saturday", label: "Cumartesi" },
      { key: "working_hours_sunday", label: "Pazar" },
    ],
  },
  {
    title: "Header & Logo",
    fields: [
      { key: "header_banner_show", label: "Üst banner göster", type: "toggle" },
      { key: "header_cta_url", label: "Header CTA URL" },
      { key: "logo_icon_url", label: "Logo ikon URL" },
      { key: "favicon_url", label: "Favicon URL" },
    ],
  },
  {
    title: "Analytics & SEO",
    fields: [
      { key: "seo_google_analytics_id", label: "Google Analytics ID (G-…)" },
      { key: "seo_google_tag_manager_id", label: "Google Tag Manager ID (GTM-…)" },
      { key: "marketing_meta_pixel_id", label: "Meta Pixel ID" },
      { key: "seo_google_site_verification", label: "Google Site Verification" },
      { key: "seo_robots_meta", label: "Robots meta (index, follow)" },
      { key: "marketing_custom_head_code", label: "Özel <head> kodu", type: "textarea" },
    ],
  },
  {
    title: "Promosyon Popup",
    fields: [
      { key: "promo_popup_show", label: "Popup göster", type: "toggle" },
      { key: "promo_popup_title", label: "Başlık" },
      { key: "promo_popup_text", label: "Metin", type: "textarea" },
      { key: "promo_popup_badge", label: "Rozet" },
      { key: "promo_popup_code", label: "Kod" },
      { key: "promo_popup_cta_text", label: "CTA metni" },
      { key: "promo_popup_cta_url", label: "CTA URL" },
    ],
  },
];

const INPUT = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export default function AyarlarPage() {
  const [values, setValues] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setValues(await getSettings());
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const set = (k: string, v: string) => setValues((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setBusy(true);
    try {
      await updateSettings(values);
      setToast({ message: "Ayarlar kaydedildi", type: "success" });
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Kaydedilemedi", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <SettingsIcon className="h-6 w-6 text-brand-600" /> Site Ayarları
        </h1>
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Yenile
          </button>
          <button onClick={save} disabled={busy || loading} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
            <Save className="h-4 w-4" /> {busy ? "Kaydediliyor…" : "Kaydet"}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Yükleniyor…</div>
      ) : (
        <div className="space-y-6">
          {GROUPS.map((g) => (
            <div key={g.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">{g.title}</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {g.fields.map((f) => (
                  <div key={f.key} className={f.type === "textarea" ? "sm:col-span-2" : ""}>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">{f.label}</label>
                    {f.type === "toggle" ? (
                      <label className="inline-flex cursor-pointer items-center gap-2 pt-1 text-sm text-slate-700">
                        <input
                          type="checkbox"
                          checked={values[f.key] === "1" || values[f.key] === "true"}
                          onChange={(e) => set(f.key, e.target.checked ? "1" : "0")}
                        />
                        Aktif
                      </label>
                    ) : f.type === "textarea" ? (
                      <textarea value={values[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} rows={3} className={`${INPUT} font-mono text-xs`} />
                    ) : (
                      <input value={values[f.key] || ""} onChange={(e) => set(f.key, e.target.value)} className={INPUT} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
