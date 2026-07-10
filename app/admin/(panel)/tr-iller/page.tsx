"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, CheckCircle2, AlertCircle, X } from "lucide-react";

import { listTrProvinces, createTrProvince, toggleTrProvince, deleteTrProvince, type TrProvinceListItem } from "@/lib/services/seoGeoService";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[70] max-w-sm">
      <div className={`flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg ring-1 ${type === "success" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
        {type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

export default function TrIllerPage() {
  const router = useRouter();
  const [items, setItems] = useState<TrProvinceListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [plate, setPlate] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await listTrProvinces()); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!name.trim()) { setToast({ message: "İl adı girin", type: "error" }); return; }
    setBusy(true);
    try { const res = await createTrProvince({ name: name.trim(), plate_code: plate.trim() }); router.push(`/admin/tr-iller/${res.id}`); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Oluşturulamadı", type: "error" }); setBusy(false); }
  };

  const onToggle = async (r: TrProvinceListItem) => {
    try { await toggleTrProvince(r.id); setItems((p) => p.map((x) => (x.id === r.id ? { ...x, is_active: !x.is_active } : x))); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Hata", type: "error" }); }
  };
  const onDelete = async (r: TrProvinceListItem) => {
    if (!confirm(`"${r.name}" ilini ve ilçelerini silmek istediğinize emin misiniz?`)) return;
    try { await deleteTrProvince(r.id); setItems((p) => p.filter((x) => x.id !== r.id)); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Hata", type: "error" }); }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><MapPin className="h-6 w-6 text-brand-600" /> Türkiye Çıkış İlleri</h1>
          <p className="mt-1 text-sm text-slate-500">TR çıkışlı yurtdışı kargo landing sayfaları. /yurtdisi-kargo/&#123;il&#125; adresinde yayınlanır.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"><Plus className="h-4 w-4" /> Yeni İl</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-100 bg-slate-50 font-medium text-slate-500">
            <tr><th className="px-5 py-3">İl</th><th className="px-5 py-3">Plaka</th><th className="px-5 py-3">URL</th><th className="px-5 py-3">İlçe</th><th className="px-5 py-3">Durum</th><th className="px-5 py-3 text-right">İşlemler</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50/50">
                <td className="px-5 py-4 font-medium text-slate-800">{r.name}</td>
                <td className="px-5 py-4 text-xs text-slate-500">{r.plate_code || "—"}</td>
                <td className="px-5 py-4 text-xs text-slate-400"><a href={`/yurtdisi-kargo/${r.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-brand-600">/{r.slug} <ExternalLink className="h-3 w-3" /></a></td>
                <td className="px-5 py-4 text-xs">{r.district_count}</td>
                <td className="px-5 py-4">{r.is_active ? <span className="text-xs font-bold text-emerald-600">Aktif</span> : <span className="text-xs font-bold text-slate-400">Pasif</span>}</td>
                <td className="space-x-1 px-5 py-4 text-right">
                  <Link href={`/admin/tr-iller/${r.id}`} className="inline-flex rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><Pencil className="h-4 w-4" /></Link>
                  <button onClick={() => onToggle(r)} className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600">{r.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  <button onClick={() => onDelete(r)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && items.length === 0 && <div className="p-8 text-center text-slate-500">Henüz il eklenmemiş.</div>}
        {loading && <div className="p-8 text-center text-slate-400">Yükleniyor…</div>}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => !busy && setModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="flex items-center gap-2 text-lg font-bold text-slate-800"><Plus className="h-5 w-5 text-brand-600" /> Yeni İl</h3><button onClick={() => setModalOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
            <div className="space-y-4">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">İl adı</label><input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && create()} placeholder="Örn: İstanbul" autoFocus className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40" /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Plaka kodu</label><input value={plate} onChange={(e) => setPlate(e.target.value)} maxLength={3} placeholder="34" className="w-28 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40" /></div>
            </div>
            <div className="mt-5 flex justify-end gap-3"><button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">İptal</button><button onClick={create} disabled={busy} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">{busy ? "Oluşturuluyor…" : "Oluştur ve düzenle"}</button></div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
