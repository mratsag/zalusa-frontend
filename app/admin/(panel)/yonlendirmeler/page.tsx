"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRightLeft, Plus, Pencil, Trash2, Power, CheckCircle2, AlertCircle, X } from "lucide-react";

import {
  listRedirects,
  createRedirect,
  updateRedirect,
  toggleRedirect,
  deleteRedirect,
  type Redirect,
  type RedirectInput,
} from "@/lib/services/redirectsService";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[70] max-w-sm">
      <div className={`flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg ring-1 ${type === "success" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
        {type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

const EMPTY: RedirectInput = { source_url: "", target_url: "", status_code: 301 };
const INPUT = "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export default function YonlendirmelerPage() {
  const [items, setItems] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<RedirectInput>(EMPTY);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listRedirects());
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditId(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (r: Redirect) => {
    setEditId(r.id);
    setForm({ source_url: r.source_url, target_url: r.target_url, status_code: r.status_code });
    setModalOpen(true);
  };

  const submit = async () => {
    if (!form.source_url.trim() || !form.target_url.trim()) {
      setToast({ message: "Kaynak ve hedef URL zorunlu", type: "error" });
      return;
    }
    setBusy(true);
    try {
      if (editId == null) await createRedirect(form);
      else await updateRedirect(editId, form);
      setModalOpen(false);
      setToast({ message: editId == null ? "Yönlendirme eklendi" : "Yönlendirme güncellendi", type: "success" });
      await load();
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Kaydedilemedi", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const onToggle = async (r: Redirect) => {
    try {
      await toggleRedirect(r.id);
      setItems((prev) => prev.map((x) => (x.id === r.id ? { ...x, is_active: !x.is_active } : x)));
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Güncellenemedi", type: "error" });
    }
  };

  const onDelete = async (r: Redirect) => {
    if (!confirm("Silmek istediğinize emin misiniz?")) return;
    try {
      await deleteRedirect(r.id);
      setItems((prev) => prev.filter((x) => x.id !== r.id));
      setToast({ message: "Yönlendirme silindi", type: "success" });
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Silinemedi", type: "error" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <ArrowRightLeft className="h-6 w-6 text-brand-600" /> 301 Yönlendirmeler
          </h1>
          <p className="mt-1 text-sm text-slate-500">Eski URL&apos;leri yeni URL&apos;lere yönlendirin. SEO değerini koruyun.</p>
        </div>
        <button onClick={openAdd} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Yeni Yönlendirme
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-100 bg-slate-50 font-medium text-slate-500">
              <tr>
                <th className="px-5 py-3">Kaynak URL</th>
                <th className="px-5 py-3">Hedef URL</th>
                <th className="px-5 py-3">Kod</th>
                <th className="px-5 py-3">Durum</th>
                <th className="px-5 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-mono text-xs text-slate-800">{r.source_url}</td>
                  <td className="px-5 py-4 font-mono text-xs text-blue-600">{r.target_url}</td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.status_code === 301 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{r.status_code}</span>
                  </td>
                  <td className="px-5 py-4">
                    {r.is_active ? (
                      <span className="text-xs font-bold text-emerald-600">Aktif</span>
                    ) : (
                      <span className="text-xs font-bold text-slate-400">Pasif</span>
                    )}
                  </td>
                  <td className="space-x-1 px-5 py-4 text-right">
                    <button onClick={() => onToggle(r)} title="Durum değiştir" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-emerald-600">
                      <Power className="h-4 w-4" />
                    </button>
                    <button onClick={() => openEdit(r)} title="Düzenle" className="rounded p-1.5 text-blue-600 hover:bg-blue-50">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => onDelete(r)} title="Sil" className="rounded p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && items.length === 0 && (
          <div className="p-8 text-center text-slate-500">Henüz yönlendirme eklenmemiş.</div>
        )}
        {loading && <div className="p-8 text-center text-slate-400">Yükleniyor…</div>}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => setModalOpen(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">{editId == null ? "Yeni Yönlendirme Ekle" : "Yönlendirme Düzenle"}</h3>
              <button onClick={() => setModalOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Kaynak URL</label>
                <input value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} placeholder="/eski-sayfa" className={`${INPUT} font-mono`} />
                <p className="mt-1 text-xs text-slate-400">Başında / olmalı. Örn: /eski-blog-yazisi</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Hedef URL</label>
                <input value={form.target_url} onChange={(e) => setForm({ ...form, target_url: e.target.value })} placeholder="/yeni-sayfa" className={`${INPUT} font-mono`} />
                <p className="mt-1 text-xs text-slate-400">Tam URL veya relative path. Örn: /blog/yeni-yazi veya https://…</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Durum Kodu</label>
                <select value={form.status_code} onChange={(e) => setForm({ ...form, status_code: Number(e.target.value) })} className={INPUT}>
                  <option value={301}>301 - Kalıcı Yönlendirme (SEO)</option>
                  <option value={302}>302 - Geçici Yönlendirme</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">İptal</button>
              <button onClick={submit} disabled={busy} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
                {busy ? "Kaydediliyor…" : editId == null ? "Ekle" : "Güncelle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
