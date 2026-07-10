"use client";

import { useCallback, useEffect, useState } from "react";
import { HelpCircle, Plus, Pencil, Trash2, Check, X, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

import { listFAQs, createFAQ, updateFAQ, deleteFAQ, type FAQ, type FAQInput } from "@/lib/services/faqService";

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

const EMPTY: FAQInput = { question: "", answer: "", pageSlug: "", displayOrder: 0 };
const INPUT = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

export default function SssAdminPage() {
  const [items, setItems] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<FAQInput>({ ...EMPTY });
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<FAQInput>({ ...EMPTY });
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listFAQs());
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onAdd = async () => {
    if (!adding.question.trim() || !adding.answer.trim()) {
      setToast({ message: "Soru ve cevap zorunlu", type: "error" });
      return;
    }
    setBusy(true);
    try {
      await createFAQ(adding);
      setAdding({ ...EMPTY });
      await load();
      setToast({ message: "SSS eklendi", type: "success" });
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Eklenemedi", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (f: FAQ) => {
    setEditId(f.id);
    setEditData({ question: f.question, answer: f.answer, pageSlug: f.pageSlug, displayOrder: f.displayOrder });
  };

  const saveEdit = async (id: number) => {
    setBusy(true);
    try {
      await updateFAQ(id, editData);
      setEditId(null);
      await load();
      setToast({ message: "Güncellendi", type: "success" });
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Güncellenemedi", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Bu SSS'i silmek istediğinize emin misiniz?")) return;
    try {
      await deleteFAQ(id);
      setItems((prev) => prev.filter((f) => f.id !== id));
      setToast({ message: "Silindi", type: "success" });
    } catch {
      setToast({ message: "Silinemedi", type: "error" });
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <HelpCircle className="h-6 w-6 text-brand-600" /> SSS Yönetimi
          </h1>
          <p className="mt-1 text-sm text-slate-500">Genel sorular (sss sayfası). page-slug ile sayfaya özel SSS eklenebilir.</p>
        </div>
        <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Yenile
        </button>
      </div>

      {/* Yeni ekle */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
        <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-800"><Plus className="h-4 w-4" /> Yeni SSS</h2>
        <div className="space-y-3">
          <input value={adding.question} onChange={(e) => setAdding({ ...adding, question: e.target.value })} placeholder="Soru" className={INPUT} />
          <textarea value={adding.answer} onChange={(e) => setAdding({ ...adding, answer: e.target.value })} placeholder="Cevap" rows={3} className={INPUT} />
          <div className="flex flex-wrap gap-3">
            <input value={adding.pageSlug} onChange={(e) => setAdding({ ...adding, pageSlug: e.target.value })} placeholder="page-slug (opsiyonel, boş = genel)" className={`${INPUT} flex-1 min-w-[220px]`} />
            <input type="number" value={adding.displayOrder || ""} onChange={(e) => setAdding({ ...adding, displayOrder: parseInt(e.target.value) || 0 })} placeholder="Sıra" className={`${INPUT} w-28`} />
            <button onClick={onAdd} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              <Plus className="h-4 w-4" /> Ekle
            </button>
          </div>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">Yükleniyor…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-slate-400">Henüz SSS yok.</div>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <div key={f.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              {editId === f.id ? (
                <div className="space-y-3">
                  <input value={editData.question} onChange={(e) => setEditData({ ...editData, question: e.target.value })} className={INPUT} />
                  <textarea value={editData.answer} onChange={(e) => setEditData({ ...editData, answer: e.target.value })} rows={3} className={INPUT} />
                  <div className="flex flex-wrap gap-3">
                    <input value={editData.pageSlug} onChange={(e) => setEditData({ ...editData, pageSlug: e.target.value })} placeholder="page-slug" className={`${INPUT} flex-1 min-w-[200px]`} />
                    <input type="number" value={editData.displayOrder || ""} onChange={(e) => setEditData({ ...editData, displayOrder: parseInt(e.target.value) || 0 })} className={`${INPUT} w-24`} />
                    <button onClick={() => saveEdit(f.id)} disabled={busy} className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"><Check className="h-4 w-4" /> Kaydet</button>
                    <button onClick={() => setEditId(null)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"><X className="h-4 w-4" /> İptal</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">#{f.displayOrder}</span>
                      {f.pageSlug && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-500">{f.pageSlug}</span>}
                      <h3 className="font-semibold text-slate-900">{f.question}</h3>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{f.answer}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button onClick={() => startEdit(f)} title="Düzenle" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => onDelete(f.id)} title="Sil" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
