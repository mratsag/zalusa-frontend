"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MessageSquareQuote, Plus, Save, Trash2, X, RefreshCw, Search, CheckCircle2, AlertCircle } from "lucide-react";

import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  type Testimonial,
  type TestimonialInput,
} from "@/lib/services/testimonialsService";

// Müşteri yorumları yönetimi. Yorumlar /yorumlar sayfasında listelenir.
// quote_en doldurulursa /en tarafında İngilizce alıntı gösterilir.

const INPUT =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

const EMPTY: TestimonialInput = {
  author: "",
  authorMeta: "",
  rating: 5,
  sourceType: "general",
  sourceLabel: "",
  sourceUrl: "",
  quote: "",
  quoteEn: "",
  publishedAt: "",
  isVerified: true,
  isPublished: true,
  sortOrder: 0,
};

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[60] max-w-sm">
      <div
        className={`flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg ring-1 ${
          type === "success" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"
        }`}
      >
        {type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

export default function AdminYorumlarPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [draft, setDraft] = useState<TestimonialInput>(EMPTY);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await getTestimonials();
      setItems(d.testimonials || []);
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (i) =>
        i.author.toLowerCase().includes(s) ||
        i.quote.toLowerCase().includes(s) ||
        (i.sourceLabel || "").toLowerCase().includes(s),
    );
  }, [items, q]);

  const openNew = () => {
    setEditing(null);
    setDraft(EMPTY);
  };
  const openEdit = (t: Testimonial) => {
    setEditing(t);
    const { id: _id, ...rest } = t;
    void _id;
    setDraft({ ...EMPTY, ...rest, quoteEn: t.quoteEn || "" });
  };

  const save = async () => {
    if (!draft.author.trim() || !draft.quote.trim()) {
      setToast({ message: "Yazar ve yorum zorunlu", type: "error" });
      return;
    }
    setBusy(true);
    try {
      if (editing) await updateTestimonial(editing.id, draft);
      else await createTestimonial(draft);
      setToast({ message: "Kaydedildi", type: "success" });
      setDraft(EMPTY);
      setEditing(null);
      await load();
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Kaydedilemedi", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (t: Testimonial) => {
    if (!confirm(`"${t.author}" yorumunu silmek istediğinize emin misiniz?`)) return;
    setBusy(true);
    try {
      await deleteTestimonial(t.id);
      setToast({ message: "Silindi", type: "success" });
      if (editing?.id === t.id) {
        setEditing(null);
        setDraft(EMPTY);
      }
      await load();
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Silinemedi", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const set = <K extends keyof TestimonialInput>(k: K, v: TestimonialInput[K]) =>
    setDraft((p) => ({ ...p, [k]: v }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <MessageSquareQuote className="h-6 w-6 text-brand-600" /> Müşteri Yorumları
          <span className="ml-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-semibold text-slate-500">
            {items.length}
          </span>
        </h1>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Yenile
          </button>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> Yeni Yorum
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            {editing ? `Düzenle #${editing.id}` : "Yeni Yorum"}
          </h2>
          {editing && (
            <button
              onClick={() => {
                setEditing(null);
                setDraft(EMPTY);
              }}
              className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800"
            >
              <X className="h-3.5 w-3.5" /> Vazgeç
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Yazar *</label>
            <input value={draft.author} onChange={(e) => set("author", e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Ünvan / Açıklama</label>
            <input value={draft.authorMeta} onChange={(e) => set("authorMeta", e.target.value)} className={INPUT} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Puan (1-5)</label>
            <input
              type="number"
              step="0.1"
              min="1"
              max="5"
              value={draft.rating}
              onChange={(e) => set("rating", parseFloat(e.target.value) || 5)}
              className={INPUT}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Kaynak Tipi</label>
            <select value={draft.sourceType} onChange={(e) => set("sourceType", e.target.value)} className={INPUT}>
              <option value="general">Genel</option>
              <option value="country">Ülke</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Kaynak Etiketi</label>
            <input
              value={draft.sourceLabel}
              onChange={(e) => set("sourceLabel", e.target.value)}
              placeholder="Odessa · Ukrayna"
              className={INPUT}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Kaynak Linki</label>
            <input
              value={draft.sourceUrl}
              onChange={(e) => set("sourceUrl", e.target.value)}
              placeholder="/yurtdisi-kargo/ukrayna/odessa"
              className={INPUT}
            />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1 block text-xs font-semibold text-slate-600">Yorum (TR) *</label>
            <textarea value={draft.quote} onChange={(e) => set("quote", e.target.value)} rows={3} className={INPUT} />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="mb-1 block text-xs font-semibold text-slate-600">
              Yorum (EN) <span className="font-normal text-slate-400">— boşsa /en tarafında Türkçesi gösterilir</span>
            </label>
            <textarea
              value={draft.quoteEn || ""}
              onChange={(e) => set("quoteEn", e.target.value)}
              rows={3}
              className={INPUT}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Tarih</label>
            <input
              type="date"
              value={draft.publishedAt || ""}
              onChange={(e) => set("publishedAt", e.target.value)}
              className={INPUT}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-600">Sıra</label>
            <input
              type="number"
              value={draft.sortOrder}
              onChange={(e) => set("sortOrder", parseInt(e.target.value) || 0)}
              className={INPUT}
            />
          </div>
          <div className="flex items-end gap-5 pb-1">
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={draft.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />
              Yayında
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={draft.isVerified} onChange={(e) => set("isVerified", e.target.checked)} />
              Doğrulanmış
            </label>
          </div>
        </div>

        <button
          onClick={save}
          disabled={busy}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> {busy ? "Kaydediliyor…" : editing ? "Güncelle" : "Ekle"}
        </button>
      </div>

      {/* Liste */}
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Yazar, yorum veya ülke ara…"
            className={`${INPUT} pl-9`}
          />
        </div>
        <span className="text-xs text-slate-400">{filtered.length} kayıt</span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Yükleniyor…</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Yazar</th>
                <th className="px-4 py-3">Yorum</th>
                <th className="px-4 py-3">Kaynak</th>
                <th className="px-4 py-3">Puan</th>
                <th className="px-4 py-3">Durum</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.slice(0, 200).map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{t.author}</p>
                    <p className="text-xs text-slate-500">{t.authorMeta}</p>
                  </td>
                  <td className="max-w-md px-4 py-3">
                    <p className="line-clamp-2 text-slate-700">{t.quote}</p>
                    {t.quoteEn ? (
                      <span className="mt-0.5 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                        EN ✓
                      </span>
                    ) : (
                      <span className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                        EN yok
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">{t.sourceLabel || t.sourceType}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{t.rating}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        t.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {t.isPublished ? "Yayında" : "Gizli"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(t)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => remove(t)}
                        className="rounded-lg border border-red-200 p-1.5 text-red-500 hover:bg-red-50"
                        title="Sil"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length > 200 && (
            <p className="border-t border-slate-100 px-4 py-3 text-center text-xs text-slate-400">
              İlk 200 kayıt gösteriliyor — daraltmak için arama kullanın.
            </p>
          )}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
