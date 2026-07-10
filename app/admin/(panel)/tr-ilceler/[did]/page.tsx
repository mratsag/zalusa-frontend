"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

import { SeoFieldsForm } from "@/components/admin/seo-fields-form";
import { AiGenerateButton } from "@/components/admin/ai-generate-button";
import { getTrDistrict, updateTrDistrict, deleteTrDistrict, type SeoTr } from "@/lib/services/seoGeoService";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[80] max-w-sm">
      <div className={`flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg ring-1 ${type === "success" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
        {type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

export default function TrIlceEditPage({ params }: { params: Promise<{ did: string }> }) {
  const { did } = use(params);
  const distId = Number(did);
  const router = useRouter();

  const [form, setForm] = useState<SeoTr | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setForm(await getTrDistrict(distId)); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" }); }
    finally { setLoading(false); }
  }, [distId]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try { await updateTrDistrict(distId, form); setToast({ message: "Kaydedildi", type: "success" }); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Kaydedilemedi", type: "error" }); }
    finally { setSaving(false); }
  };
  const remove = async () => {
    if (!form || !confirm("Bu ilçeyi silmek istediğinize emin misiniz?")) return;
    try { await deleteTrDistrict(distId); router.push(`/admin/tr-iller/${form.province_id}`); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Silinemedi", type: "error" }); }
  };

  if (loading || !form) return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-400 md:px-6">Yükleniyor…</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <Link href={`/admin/tr-iller/${form.province_id}`} className="inline-flex items-center gap-1 font-medium hover:text-brand-600"><ArrowLeft className="h-4 w-4" /> İle Dön</Link>
          <span>/</span><span className="font-bold text-slate-800">{form.name}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-800">{form.name} (İlçe)</h1>
          <div className="flex items-center gap-2">
            <AiGenerateButton type="tr_district" id={distId} modes={["content", "seo", "faqs"]} onDone={async () => { await load(); setToast({ message: "AI içeriği üretildi", type: "success" }); }} onError={(msg) => setToast({ message: msg, type: "error" })} />
            <button onClick={remove} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white"><Trash2 className="h-4 w-4" /> İlçeyi Sil</button>
          </div>
        </div>
      </div>

      <SeoFieldsForm value={form} onChange={(patch) => setForm((p) => (p ? { ...p, ...patch } : p))} variant="tr" />

      <div className="mt-6">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Kaydediliyor…" : "Kaydet"}</button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
