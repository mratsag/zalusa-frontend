"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Plus, Pencil, Trash2, ArrowLeft, Star, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

import {
  listBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
  slugify,
  type BlogListItem,
  type BlogInput,
} from "@/lib/services/blogService";

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

const EMPTY: BlogInput = {
  title: "", slug: "", excerpt: "", content: "", category: "", author: "",
  featuredImage: "", isFeatured: false, status: "draft", seoTitle: "", seoDescription: "",
};
const INPUT = "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
const LABEL = "mb-1 block text-xs font-semibold text-slate-600";

export default function BlogAdminPage() {
  const [items, setItems] = useState<BlogListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{ id: number | null; data: BlogInput } | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listBlogs());
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setSlugTouched(false);
    setEditing({ id: null, data: { ...EMPTY } });
  };

  const openEdit = async (id: number) => {
    try {
      const b = await getBlog(id);
      setSlugTouched(true);
      setEditing({
        id,
        data: {
          title: b.title, slug: b.slug, excerpt: b.excerpt, content: b.content, category: b.category,
          author: b.author, featuredImage: b.featuredImage, isFeatured: b.isFeatured, status: b.status,
          seoTitle: b.seoTitle, seoDescription: b.seoDescription,
        },
      });
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Açılamadı", type: "error" });
    }
  };

  const setField = (k: keyof BlogInput, v: string | boolean) =>
    setEditing((prev) => (prev ? { ...prev, data: { ...prev.data, [k]: v } } : prev));

  const save = async () => {
    if (!editing) return;
    const d = editing.data;
    if (!d.title.trim() || !d.slug.trim()) {
      setToast({ message: "Başlık ve slug zorunlu", type: "error" });
      return;
    }
    setBusy(true);
    try {
      if (editing.id == null) await createBlog(d);
      else await updateBlog(editing.id, d);
      setEditing(null);
      await load();
      setToast({ message: "Kaydedildi", type: "success" });
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Kaydedilemedi", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteBlog(id);
      setItems((prev) => prev.filter((b) => b.id !== id));
      setToast({ message: "Silindi", type: "success" });
    } catch {
      setToast({ message: "Silinemedi", type: "error" });
    }
  };

  // ── Editör görünümü ──
  if (editing) {
    const d = editing.data;
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-6">
        <button onClick={() => setEditing(null)} className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Listeye dön
        </button>
        <h1 className="mb-5 text-2xl font-bold text-slate-900">{editing.id == null ? "Yeni Yazı" : "Yazıyı Düzenle"}</h1>
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div>
            <label className={LABEL}>Başlık *</label>
            <input
              value={d.title}
              onChange={(e) => {
                setField("title", e.target.value);
                if (!slugTouched) setField("slug", slugify(e.target.value));
              }}
              className={INPUT}
            />
          </div>
          <div>
            <label className={LABEL}>Slug *</label>
            <input value={d.slug} onChange={(e) => { setSlugTouched(true); setField("slug", e.target.value); }} className={INPUT} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Kategori</label>
              <input value={d.category} onChange={(e) => setField("category", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Yazar</label>
              <input value={d.author} onChange={(e) => setField("author", e.target.value)} className={INPUT} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Öne çıkan görsel (URL)</label>
            <input value={d.featuredImage} onChange={(e) => setField("featuredImage", e.target.value)} placeholder="/assets/blog/... veya https://..." className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>Özet</label>
            <textarea value={d.excerpt} onChange={(e) => setField("excerpt", e.target.value)} rows={2} className={INPUT} />
          </div>
          <div>
            <label className={LABEL}>İçerik (HTML)</label>
            <textarea value={d.content} onChange={(e) => setField("content", e.target.value)} rows={12} className={`${INPUT} font-mono text-xs`} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>SEO Başlık</label>
              <input value={d.seoTitle} onChange={(e) => setField("seoTitle", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>SEO Açıklama</label>
              <input value={d.seoDescription} onChange={(e) => setField("seoDescription", e.target.value)} className={INPUT} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-5 pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={d.isFeatured} onChange={(e) => setField("isFeatured", e.target.checked)} /> Öne çıkar
            </label>
            <div className="inline-flex items-center gap-2">
              <span className="text-sm text-slate-600">Durum:</span>
              <select value={d.status} onChange={(e) => setField("status", e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                <option value="draft">Taslak</option>
                <option value="published">Yayında</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={save} disabled={busy} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
              {busy ? "Kaydediliyor…" : "Kaydet"}
            </button>
            <button onClick={() => setEditing(null)} className="rounded-lg border border-slate-200 px-5 py-2 text-sm text-slate-600 hover:bg-slate-50">İptal</button>
          </div>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    );
  }

  // ── Liste görünümü ──
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <FileText className="h-6 w-6 text-brand-600" /> Blog Yönetimi
        </h1>
        <div className="flex gap-2">
          <button onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Yenile
          </button>
          <button onClick={openNew} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            <Plus className="h-4 w-4" /> Yeni Yazı
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">Yükleniyor…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-16 text-center text-slate-400">Henüz yazı yok.</div>
      ) : (
        <div className="space-y-2">
          {items.map((b) => (
            <div key={b.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 md:p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {b.isFeatured && <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />}
                  <span className="truncate font-semibold text-slate-900">{b.title}</span>
                  <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${b.status === "published" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                    {b.status === "published" ? "Yayında" : "Taslak"}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-slate-400">
                  {b.category && <span className="mr-2">{b.category}</span>}/{b.slug} · {b.createdAt}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button onClick={() => openEdit(b.id)} title="Düzenle" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => onDelete(b.id)} title="Sil" className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
