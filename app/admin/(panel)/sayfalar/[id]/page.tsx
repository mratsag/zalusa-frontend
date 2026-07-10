"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, AlignLeft, Search, HelpCircle, Plus, Pencil, ExternalLink, CheckCircle2, AlertCircle, X } from "lucide-react";

import { AiGenerateButton } from "@/components/admin/ai-generate-button";
import { getPage, updatePage, deletePage, type Page } from "@/lib/services/pagesService";
import { listFAQsByPage, createFAQ, updateFAQ, deleteFAQ, type FAQ } from "@/lib/services/faqService";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[80] max-w-sm">
      <div className={`flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg ring-1 ${type === "success" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
        {type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

const INPUT = "w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40";
type Tab = "content" | "seo" | "sss";

export default function SayfaEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const pageId = Number(id);
  const router = useRouter();

  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("content");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // form state
  const [form, setForm] = useState<Page | null>(null);
  const set = (k: keyof Page, v: string) => setForm((p) => (p ? { ...p, [k]: v } : p));

  // FAQ state
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [faqQ, setFaqQ] = useState("");
  const [faqA, setFaqA] = useState("");
  const [editFaq, setEditFaq] = useState<FAQ | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await getPage(pageId);
      setPage(p);
      setForm(p);
      const f = await listFAQsByPage(p.slug);
      setFaqs(f);
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [pageId]);

  useEffect(() => {
    load();
  }, [load]);

  const nextOrder = useMemo(() => (faqs.length ? Math.max(...faqs.map((f) => f.displayOrder)) + 1 : 1), [faqs]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await updatePage(pageId, {
        name: form.name,
        slug: form.slug,
        seo_title: form.seo_title,
        seo_description: form.seo_description,
        meta_keywords: form.meta_keywords,
        og_title: form.og_title,
        og_description: form.og_description,
        seo_content: form.seo_content,
      });
      setToast({ message: "Kaydedildi", type: "success" });
      await load();
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Kaydedilemedi", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const removePage = async () => {
    if (!page || page.undeletable) return;
    if (!confirm("Bu sayfayı silmek istediğinize emin misiniz? SSS soruları da silinir.")) return;
    try {
      await deletePage(pageId);
      router.push("/admin/sayfalar");
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Silinemedi", type: "error" });
    }
  };

  const addFaq = async () => {
    if (!page || !faqQ.trim() || !faqA.trim()) {
      setToast({ message: "Soru ve cevap zorunlu", type: "error" });
      return;
    }
    try {
      await createFAQ({ pageSlug: page.slug, question: faqQ.trim(), answer: faqA.trim(), displayOrder: nextOrder });
      setFaqQ("");
      setFaqA("");
      setFaqs(await listFAQsByPage(page.slug));
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Eklenemedi", type: "error" });
    }
  };

  const saveFaqEdit = async () => {
    if (!editFaq || !page) return;
    try {
      await updateFAQ(editFaq.id, {
        pageSlug: page.slug,
        question: editFaq.question,
        answer: editFaq.answer,
        displayOrder: editFaq.displayOrder,
      });
      setEditFaq(null);
      setFaqs(await listFAQsByPage(page.slug));
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Güncellenemedi", type: "error" });
    }
  };

  const removeFaq = async (f: FAQ) => {
    if (!page || !confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;
    try {
      await deleteFAQ(f.id);
      setFaqs((prev) => prev.filter((x) => x.id !== f.id));
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Silinemedi", type: "error" });
    }
  };

  if (loading || !page || !form) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-400 md:px-6">Yükleniyor…</div>;
  }

  const url = page.slug === "index" ? "/" : `/${page.slug}`;
  const canEditBasics = !page.undeletable;

  const TabBtn = ({ id: t, icon: Icon, label, badge }: { id: Tab; icon: typeof AlignLeft; label: string; badge?: number }) => (
    <button
      onClick={() => setTab(t)}
      className={`flex items-center gap-1.5 border-b-2 px-5 py-3 text-sm font-bold transition ${tab === t ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
    >
      <Icon className="h-4 w-4" /> {label}
      {badge != null && <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600">{badge}</span>}
    </button>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
      {/* Başlık */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/admin/sayfalar" className="inline-flex items-center gap-1 font-medium hover:text-brand-600"><ArrowLeft className="h-4 w-4" /> Tüm Sayfalar</Link>
          <span>/</span>
          <span className="font-bold text-slate-800">{page.name}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{page.name}</h1>
            <p className="mt-0.5 text-sm text-slate-400">
              URL:{" "}
              <a href={url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-brand-600 hover:underline">
                {url} <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <AiGenerateButton type="page" id={pageId} modes={["content", "seo", "faqs"]} onDone={async () => { await load(); setToast({ message: "AI içeriği üretildi", type: "success" }); }} onError={(msg) => setToast({ message: msg, type: "error" })} />
            {!page.undeletable && (
              <button onClick={removePage} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white">
                <Trash2 className="h-4 w-4" /> Sayfayı Sil
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 border-b border-slate-200">
        <TabBtn id="content" icon={AlignLeft} label="İçerik" />
        <TabBtn id="seo" icon={Search} label="SEO Ayarları" />
        <TabBtn id="sss" icon={HelpCircle} label="SSS" badge={faqs.length} />
      </div>

      {/* Temel bilgiler (kilitli değilse) */}
      {canEditBasics && tab !== "sss" && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="mb-3 text-sm font-bold text-slate-800">Sayfa adı ve URL</h4>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">Sayfa adı</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={INPUT} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-600">URL (slug)</label>
              <div className="flex items-center">
                <span className="rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400">/</span>
                <input value={form.slug} onChange={(e) => set("slug", e.target.value)} pattern="[a-z0-9-]+" className={`${INPUT} rounded-l-none`} />
              </div>
              <p className="mt-0.5 text-xs text-slate-400">Değiştirirseniz mevcut link çalışmaz.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: İçerik */}
      {tab === "content" && (
        <div>
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-800"><AlignLeft className="h-4 w-4 text-brand-600" /> Sayfa İçeriği</h4>
            <p className="mb-3 text-xs text-slate-500">HTML + Tailwind sınıfları kullanabilirsiniz. Bu içerik sayfada ziyaretçiye gösterilir.</p>
            <textarea
              value={form.seo_content}
              onChange={(e) => set("seo_content", e.target.value)}
              spellCheck={false}
              className="h-[460px] w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-[13px] leading-6 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <SaveBtn onClick={save} saving={saving} />
        </div>
      )}

      {/* TAB: SEO */}
      {tab === "seo" && (
        <div>
          <div className="mb-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="flex items-center gap-2 text-sm font-bold text-slate-800"><Search className="h-4 w-4 text-brand-600" /> SEO Ayarları</h4>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">SEO Başlık (Title)</label>
              <input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} placeholder="Sayfa başlığı - Zalusa" className={INPUT} />
              <p className="mt-1 text-xs text-slate-400">Önerilen: 50-60 karakter</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Meta Description</label>
              <textarea value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} rows={2} className={INPUT} />
              <p className="mt-1 text-xs text-slate-400">Önerilen: 150-160 karakter</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Meta Keywords</label>
              <input value={form.meta_keywords} onChange={(e) => set("meta_keywords", e.target.value)} placeholder="kargo, lojistik, e-ihracat" className={INPUT} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">OG Title (Sosyal paylaşım)</label>
                <input value={form.og_title} onChange={(e) => set("og_title", e.target.value)} className={INPUT} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">OG Description</label>
                <input value={form.og_description} onChange={(e) => set("og_description", e.target.value)} className={INPUT} />
              </div>
            </div>
          </div>
          <SaveBtn onClick={save} saving={saving} />
        </div>
      )}

      {/* TAB: SSS */}
      {tab === "sss" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50 px-5 py-4">
            <div>
              <h4 className="font-bold text-slate-800">Sıkça Sorulan Sorular</h4>
              <p className="text-xs text-slate-500">Bu sayfada gösterilecek SSS soruları. Schema.org FAQPage otomatik oluşturulur.</p>
            </div>
          </div>

          {/* Yeni soru */}
          <div className="border-b border-slate-100 bg-blue-50/30 p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <div className="md:col-span-5">
                <label className="mb-1 block text-xs font-medium text-slate-600">Soru</label>
                <input value={faqQ} onChange={(e) => setFaqQ(e.target.value)} placeholder="Örn: Kargo ne zaman teslim edilir?" className={INPUT} />
              </div>
              <div className="md:col-span-5">
                <label className="mb-1 block text-xs font-medium text-slate-600">Cevap</label>
                <textarea value={faqA} onChange={(e) => setFaqA(e.target.value)} rows={2} className={INPUT} />
              </div>
              <div className="flex items-end md:col-span-2">
                <button onClick={addFaq} className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-bold text-white hover:bg-brand-700">
                  <Plus className="h-4 w-4" /> Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Liste */}
          {faqs.length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <HelpCircle className="mx-auto mb-2 h-8 w-8" />
              Henüz soru eklenmemiş. SEO için en az 3-5 soru öneriyoruz.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {faqs.map((f) => (
                <div key={f.id} className="group px-5 py-4 transition hover:bg-slate-50/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-400">#{f.displayOrder}</span>
                        <p className="text-sm font-bold text-slate-800">{f.question}</p>
                      </div>
                      <p className="line-clamp-2 text-sm text-slate-500">{f.answer}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 opacity-0 transition group-hover:opacity-100">
                      <button onClick={() => setEditFaq(f)} title="Düzenle" className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-brand-600"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => removeFaq(f)} title="Sil" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAQ düzenleme modalı */}
      {editFaq && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setEditFaq(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800"><Pencil className="h-5 w-5 text-brand-600" /> Soru Düzenle</h3>
              <button onClick={() => setEditFaq(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Soru</label>
                <input value={editFaq.question} onChange={(e) => setEditFaq({ ...editFaq, question: e.target.value })} className={INPUT} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Cevap</label>
                <textarea value={editFaq.answer} onChange={(e) => setEditFaq({ ...editFaq, answer: e.target.value })} rows={4} className={INPUT} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Sıra</label>
                <input type="number" value={editFaq.displayOrder} onChange={(e) => setEditFaq({ ...editFaq, displayOrder: Number(e.target.value) })} className={`${INPUT} w-24`} />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditFaq(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">İptal</button>
              <button onClick={saveFaqEdit} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700">Güncelle</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function SaveBtn({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button onClick={onClick} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
      <Save className="h-4 w-4" /> {saving ? "Kaydediliyor…" : "Kaydet"}
    </button>
  );
}
