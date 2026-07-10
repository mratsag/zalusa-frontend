"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Search, MessageSquareQuote, HelpCircle, Plus, Pencil, ExternalLink, CheckCircle2, AlertCircle, X } from "lucide-react";

import { AiGenerateButton } from "@/components/admin/ai-generate-button";
import {
  getSeoCountry, updateSeoCountry, deleteSeoCountry,
  listSeoStories, createSeoStory, updateSeoStory, deleteSeoStory,
  listCountryFaqs, createCountryFaq, updateCountryFaq, deleteCountryFaq,
  type SeoCountry, type SeoStory, type CountryFaq,
} from "@/lib/services/seoCountriesService";

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

const INPUT = "w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40";
type Tab = "seo" | "stories" | "faqs";

export default function UlkeEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const cid = Number(id);
  const router = useRouter();

  const [form, setForm] = useState<SeoCountry | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("seo");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [stories, setStories] = useState<SeoStory[]>([]);
  const [faqs, setFaqs] = useState<CountryFaq[]>([]);
  const [editStory, setEditStory] = useState<Partial<SeoStory> | null>(null);
  const [editFaq, setEditFaq] = useState<Partial<CountryFaq> | null>(null);

  const set = (k: keyof SeoCountry, v: string | number | boolean | null) => setForm((p) => (p ? { ...p, [k]: v } : p));
  const numOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setForm(await getSeoCountry(cid));
      setStories(await listSeoStories(cid));
      setFaqs(await listCountryFaqs(cid));
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  }, [cid]);

  useEffect(() => { load(); }, [load]);

  const nextFaqOrder = useMemo(() => (faqs.length ? Math.max(...faqs.map((f) => f.display_order)) + 1 : 1), [faqs]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      await updateSeoCountry(cid, form);
      setToast({ message: "Kaydedildi", type: "success" });
      setForm(await getSeoCountry(cid));
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Kaydedilemedi", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const removeCountry = async () => {
    if (!confirm("Bu ülkeyi ve bağlı tüm kayıtları silmek istediğinize emin misiniz?")) return;
    try { await deleteSeoCountry(cid); router.push("/admin/ulkeler"); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Silinemedi", type: "error" }); }
  };

  // Stories
  const saveStory = async () => {
    if (!editStory) return;
    try {
      if (editStory.id) await updateSeoStory(editStory.id, editStory);
      else await createSeoStory({ ...editStory, country_id: cid });
      setEditStory(null);
      setStories(await listSeoStories(cid));
    } catch (e) { setToast({ message: e instanceof Error ? e.message : "Kaydedilemedi", type: "error" }); }
  };
  const removeStory = async (s: SeoStory) => {
    if (!confirm("Bu hikayeyi silmek istediğinize emin misiniz?")) return;
    try { await deleteSeoStory(s.id); setStories((p) => p.filter((x) => x.id !== s.id)); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Silinemedi", type: "error" }); }
  };

  // FAQs
  const saveFaq = async () => {
    if (!editFaq || !(editFaq.question || "").trim()) { setToast({ message: "Soru zorunlu", type: "error" }); return; }
    try {
      if (editFaq.id) await updateCountryFaq(editFaq.id, editFaq);
      else await createCountryFaq(cid, editFaq);
      setEditFaq(null);
      setFaqs(await listCountryFaqs(cid));
    } catch (e) { setToast({ message: e instanceof Error ? e.message : "Kaydedilemedi", type: "error" }); }
  };
  const removeFaq = async (f: CountryFaq) => {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;
    try { await deleteCountryFaq(f.id); setFaqs((p) => p.filter((x) => x.id !== f.id)); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Silinemedi", type: "error" }); }
  };

  if (loading || !form) return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-400 md:px-6">Yükleniyor…</div>;

  const TabBtn = ({ id: t, icon: Icon, label, badge }: { id: Tab; icon: typeof Search; label: string; badge?: number }) => (
    <button onClick={() => setTab(t)} className={`flex items-center gap-1.5 border-b-2 px-5 py-3 text-sm font-bold transition ${tab === t ? "border-brand-600 text-brand-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
      <Icon className="h-4 w-4" /> {label}{badge != null && <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600">{badge}</span>}
    </button>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 md:px-6">
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
          <Link href="/admin/ulkeler" className="inline-flex items-center gap-1 font-medium hover:text-brand-600"><ArrowLeft className="h-4 w-4" /> Tüm Ülkeler</Link>
          <span>/</span><span className="font-bold text-slate-800">{form.name}</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{form.name}</h1>
            <p className="mt-0.5 text-sm text-slate-400">URL: <a href={`/yurtdisi-kargo/${form.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-brand-600 hover:underline">/yurtdisi-kargo/{form.slug} <ExternalLink className="h-3 w-3" /></a></p>
          </div>
          <div className="flex items-center gap-2">
            <AiGenerateButton type="country" id={cid} modes={["content", "seo", "faqs"]} onDone={async (m) => { await load(); setToast({ message: m === "faqs" ? "SSS üretildi" : m === "seo" ? "SEO üretildi" : "İçerik üretildi", type: "success" }); }} onError={(msg) => setToast({ message: msg, type: "error" })} />
            <button onClick={removeCountry} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-600 hover:text-white"><Trash2 className="h-4 w-4" /> Ülkeyi Sil</button>
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-slate-200">
        <TabBtn id="seo" icon={Search} label="İçerik & SEO" />
        <TabBtn id="stories" icon={MessageSquareQuote} label="Hikayeler" badge={stories.length} />
        <TabBtn id="faqs" icon={HelpCircle} label="SSS" badge={faqs.length} />
      </div>

      {tab === "seo" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="mb-4 text-sm font-bold text-slate-800">Temel bilgiler</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="md:col-span-1"><label className="mb-1 block text-xs font-medium text-slate-600">Ülke adı</label><input value={form.name} onChange={(e) => set("name", e.target.value)} className={INPUT} /></div>
              <div className="md:col-span-1"><label className="mb-1 block text-xs font-medium text-slate-600">Slug</label><input value={form.slug} onChange={(e) => set("slug", e.target.value)} className={INPUT} /></div>
              <div className="md:col-span-1"><label className="mb-1 block text-xs font-medium text-slate-600">ISO2</label><input value={form.iso2} onChange={(e) => set("iso2", e.target.value.toUpperCase())} maxLength={2} className={`${INPUT} uppercase`} /></div>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div><label className="mb-1 block text-xs font-medium text-slate-600">Fiyat min</label><input type="number" step="0.01" value={form.price_min ?? ""} onChange={(e) => set("price_min", numOrNull(e.target.value))} className={INPUT} /></div>
              <div><label className="mb-1 block text-xs font-medium text-slate-600">Fiyat max</label><input type="number" step="0.01" value={form.price_max ?? ""} onChange={(e) => set("price_max", numOrNull(e.target.value))} className={INPUT} /></div>
              <div><label className="mb-1 block text-xs font-medium text-slate-600">Para birimi</label><input value={form.price_currency} onChange={(e) => set("price_currency", e.target.value)} placeholder="₺ / € / $" className={INPUT} /></div>
            </div>
            <label className="mt-4 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} /> Sayfa aktif (yayında)
            </label>
          </div>

          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-800">SEO alanları</h4>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">SEO Başlık</label><input value={form.seo_title} onChange={(e) => set("seo_title", e.target.value)} className={INPUT} /></div>
            <div><label className="mb-1 block text-sm font-medium text-slate-700">Meta Description</label><textarea value={form.seo_description} onChange={(e) => set("seo_description", e.target.value)} rows={2} className={INPUT} /></div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div><label className="mb-1 block text-sm font-medium text-slate-700">Meta Keywords</label><input value={form.meta_keywords} onChange={(e) => set("meta_keywords", e.target.value)} className={INPUT} /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">H1 Override</label><input value={form.h1_override} onChange={(e) => set("h1_override", e.target.value)} className={INPUT} /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">OG Title</label><input value={form.og_title} onChange={(e) => set("og_title", e.target.value)} className={INPUT} /></div>
              <div><label className="mb-1 block text-sm font-medium text-slate-700">OG Description</label><input value={form.og_description} onChange={(e) => set("og_description", e.target.value)} className={INPUT} /></div>
              <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium text-slate-700">Canonical URL</label><input value={form.canonical_url} onChange={(e) => set("canonical_url", e.target.value)} className={INPUT} /></div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="mb-2 text-sm font-bold text-slate-800">Sayfa İçeriği (SEO rehber HTML)</h4>
            <textarea value={form.content} onChange={(e) => set("content", e.target.value)} spellCheck={false} className="h-[360px] w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-[13px] leading-6 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
          </div>

          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"><Save className="h-4 w-4" /> {saving ? "Kaydediliyor…" : "Kaydet"}</button>
        </div>
      )}

      {tab === "stories" && (
        <div className="space-y-4">
          <div className="flex justify-end"><button onClick={() => setEditStory({ rating: 5, is_verified: true })} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"><Plus className="h-4 w-4" /> Yeni Hikaye</button></div>
          {stories.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">Henüz hikaye yok.</div>
          ) : stories.map((s) => (
            <div key={s.id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-800">{s.author_name || "—"} <span className="text-xs font-normal text-slate-400">{s.author_role}</span> <span className="text-amber-500">★ {s.rating}</span></div>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{s.content}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button onClick={() => setEditStory(s)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => removeStory(s)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "faqs" && (
        <div className="space-y-4">
          <div className="flex justify-end"><button onClick={() => setEditFaq({ display_order: nextFaqOrder })} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"><Plus className="h-4 w-4" /> Yeni Soru</button></div>
          {faqs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">Henüz soru yok.</div>
          ) : faqs.map((f) => (
            <div key={f.id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="min-w-0"><div className="text-sm font-bold text-slate-800"><span className="mr-2 font-mono text-xs text-slate-400">#{f.display_order}</span>{f.question}</div><p className="mt-1 line-clamp-2 text-sm text-slate-600">{f.answer}</p></div>
              <div className="flex shrink-0 gap-1"><button onClick={() => setEditFaq(f)} className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"><Pencil className="h-4 w-4" /></button><button onClick={() => removeFaq(f)} className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div>
            </div>
          ))}
        </div>
      )}

      {/* Story modal */}
      {editStory && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setEditStory(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold text-slate-800">{editStory.id ? "Hikaye Düzenle" : "Yeni Hikaye"}</h3><button onClick={() => setEditStory(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input value={editStory.author_name ?? ""} onChange={(e) => setEditStory({ ...editStory, author_name: e.target.value })} placeholder="İsim" className={INPUT} />
                <input value={editStory.author_role ?? ""} onChange={(e) => setEditStory({ ...editStory, author_role: e.target.value })} placeholder="Ünvan" className={INPUT} />
              </div>
              <textarea value={editStory.content ?? ""} onChange={(e) => setEditStory({ ...editStory, content: e.target.value })} rows={4} placeholder="Yorum metni" className={INPUT} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" step="0.1" min="1" max="5" value={editStory.rating ?? 5} onChange={(e) => setEditStory({ ...editStory, rating: Number(e.target.value) })} placeholder="Puan" className={INPUT} />
                <input value={editStory.date_label ?? ""} onChange={(e) => setEditStory({ ...editStory, date_label: e.target.value })} placeholder="2 hafta önce" className={INPUT} />
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={editStory.is_verified ?? true} onChange={(e) => setEditStory({ ...editStory, is_verified: e.target.checked })} /> Onaylı (yayında)</label>
            </div>
            <div className="mt-5 flex justify-end gap-3"><button onClick={() => setEditStory(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">İptal</button><button onClick={saveStory} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700">Kaydet</button></div>
          </div>
        </div>
      )}

      {/* FAQ modal */}
      {editFaq && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4" onClick={() => setEditFaq(null)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between"><h3 className="text-lg font-bold text-slate-800">{editFaq.id ? "Soru Düzenle" : "Yeni Soru"}</h3><button onClick={() => setEditFaq(null)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
            <div className="space-y-3">
              <input value={editFaq.question ?? ""} onChange={(e) => setEditFaq({ ...editFaq, question: e.target.value })} placeholder="Soru" className={INPUT} />
              <textarea value={editFaq.answer ?? ""} onChange={(e) => setEditFaq({ ...editFaq, answer: e.target.value })} rows={4} placeholder="Cevap" className={INPUT} />
              <input type="number" value={editFaq.display_order ?? 0} onChange={(e) => setEditFaq({ ...editFaq, display_order: Number(e.target.value) })} placeholder="Sıra" className={`${INPUT} w-24`} />
            </div>
            <div className="mt-5 flex justify-end gap-3"><button onClick={() => setEditFaq(null)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">İptal</button><button onClick={saveFaq} className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-bold text-white hover:bg-brand-700">Kaydet</button></div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
