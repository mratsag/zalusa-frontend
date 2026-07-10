"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus, Pencil, Eye, EyeOff, ExternalLink, CheckCircle2, AlertCircle } from "lucide-react";

import { SeoFieldsForm } from "@/components/admin/seo-fields-form";
import { AiGenerateButton } from "@/components/admin/ai-generate-button";
import { getTrProvince, updateTrProvince, deleteTrProvince, listTrDistricts, createTrDistrict, toggleTrDistrict, deleteTrDistrict, type SeoTr, type TrDistrictListItem } from "@/lib/services/seoGeoService";

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

export default function TrIlEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const provId = Number(id);
  const router = useRouter();

  const [form, setForm] = useState<SeoTr | null>(null);
  const [districts, setDistricts] = useState<TrDistrictListItem[]>([]);
  const [newDistrict, setNewDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setForm(await getTrProvince(provId)); setDistricts(await listTrDistricts(provId)); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" }); }
    finally { setLoading(false); }
  }, [provId]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try { await updateTrProvince(provId, form); setToast({ message: "Kaydedildi", type: "success" }); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Kaydedilemedi", type: "error" }); }
    finally { setSaving(false); }
  };
  const removeProv = async () => {
    if (!confirm("Bu ili ve ilçelerini silmek istediğinize emin misiniz?")) return;
    try { await deleteTrProvince(provId); router.push("/admin/tr-iller"); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Silinemedi", type: "error" }); }
  };

  const addDistrict = async () => {
    if (!newDistrict.trim()) return;
    try { await createTrDistrict(provId, { name: newDistrict.trim() }); setNewDistrict(""); setDistricts(await listTrDistricts(provId)); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Hata", type: "error" }); }
  };
  const onToggleD = async (d: TrDistrictListItem) => {
    try { await toggleTrDistrict(d.id); setDistricts((p) => p.map((x) => (x.id === d.id ? { ...x, is_active: !x.is_active } : x))); }
    catch { /* noop */ }
  };
  const onDeleteD = async (d: TrDistrictListItem) => {
    if (!confirm("Bu ilçeyi silmek istediğinize emin misiniz?")) return;
    try { await deleteTrDistrict(d.id); setDistricts((p) => p.filter((x) => x.id !== d.id)); }
    catch { /* noop */ }
  };

  if (loading || !form) return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-400 md:px-6">Yükleniyor…</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/admin/tr-iller" className="inline-flex items-center gap-1 font-medium hover:text-brand-600"><ArrowLeft className="h-4 w-4" /> Tüm İller</Link>
          <span>/</span><span className="font-bold text-slate-800">{form.name}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-800">{form.name}</h1>
          <div className="flex items-center gap-2">
            <AiGenerateButton type="tr_province" id={provId} modes={["content", "seo", "faqs"]} onDone={async () => { await load(); setToast({ message: "AI içeriği üretildi", type: "success" }); }} onError={(msg) => setToast({ message: msg, type: "error" })} />
            <button onClick={removeProv} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white"><Trash2 className="h-4 w-4" /> İli Sil</button>
          </div>
        </div>
      </div>

      <SeoFieldsForm
        value={form}
        onChange={(patch) => setForm((p) => (p ? { ...p, ...patch } : p))}
        variant="tr"
        extraTop={
          <div className="mb-4">
            <label className="mb-1 block text-xs font-medium text-slate-600">Plaka kodu</label>
            <input value={form.plate_code ?? ""} onChange={(e) => setForm((p) => (p ? { ...p, plate_code: e.target.value } : p))} maxLength={3} className="w-28 rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
          </div>
        }
      />

      {/* İlçeler */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="mb-1 text-sm font-bold text-slate-800">İlçeler</h4>
        <p className="mb-4 text-xs text-slate-500">İl sayfasında grid olarak listelenir. Düzenle ile ilçeye özel SEO/içerik girin.</p>
        <div className="mb-4 flex items-center gap-2">
          <input value={newDistrict} onChange={(e) => setNewDistrict(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addDistrict()} placeholder="İlçe adı" className="rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
          <button onClick={addDistrict} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-900"><Plus className="h-4 w-4" /> Ekle</button>
        </div>
        <div className="divide-y divide-slate-100">
          {districts.map((d) => (
            <div key={d.id} className={`flex items-center justify-between gap-3 py-2.5 ${!d.is_active ? "opacity-50" : ""}`}>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-slate-700 truncate">{d.name}</span>
                <a href={`/yurtdisi-kargo/${form.slug}/${d.slug}`} target="_blank" rel="noopener" className="text-slate-300 hover:text-brand-600"><ExternalLink className="h-3.5 w-3.5" /></a>
              </div>
              <div className="flex shrink-0 gap-1">
                <Link href={`/admin/tr-ilceler/${d.id}`} className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><Pencil className="h-4 w-4" /></Link>
                <button onClick={() => onToggleD(d)} className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600">{d.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button onClick={() => onDeleteD(d)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          {districts.length === 0 && <p className="py-3 text-sm text-slate-400">İlçe yok.</p>}
        </div>
      </div>

      <div className="mt-6">
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Kaydediliyor…" : "Kaydet"}</button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
