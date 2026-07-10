"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, Pencil, CheckCircle2, AlertCircle, ExternalLink, X } from "lucide-react";

import { listPages, createPage, type Page } from "@/lib/services/pagesService";

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

const GROUP_LEGAL = ["kullanim-sozlesmesi", "iptal-ve-iadeler", "cerez-politikasi", "gizlilik-politikasi", "kvkk-aydinlatma-metni"];
const GROUP_KURUMSAL = ["hakkimizda", "kariyer", "neden-zalusa", "is-ortaklarimiz", "anlasmali-kargolar"];
const GROUP_ORDER = ["Yasal & Gizlilik", "Kurumsal", "Diğer"] as const;

function hasContent(html: string) {
  return html.replace(/<[^>]*>/g, "").trim().length > 0;
}

export default function SayfalarPage() {
  const router = useRouter();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPages(await listPages());
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo(() => {
    const g: Record<string, Page[]> = { "Yasal & Gizlilik": [], Kurumsal: [], Diğer: [] };
    for (const p of pages) {
      if (GROUP_LEGAL.includes(p.slug)) g["Yasal & Gizlilik"].push(p);
      else if (GROUP_KURUMSAL.includes(p.slug)) g["Kurumsal"].push(p);
      else g["Diğer"].push(p);
    }
    return g;
  }, [pages]);

  const create = async () => {
    if (!newName.trim()) {
      setToast({ message: "Sayfa adı girin", type: "error" });
      return;
    }
    setBusy(true);
    try {
      const res = await createPage(newName.trim());
      router.push(`/admin/sayfalar/${res.id}`);
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Oluşturulamadı", type: "error" });
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <FileText className="h-6 w-6 text-brand-600" /> Sayfa İçerikleri
          </h1>
          <p className="mt-1 text-sm text-slate-500">Sayfaların içeriğini, SEO ayarlarını ve SSS sorularını düzenleyin. Panelden eklenen slug otomatik çalışır.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700">
          <Plus className="h-4 w-4" /> Yeni Sayfa Ekle
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">Yükleniyor…</div>
      ) : (
        <div className="space-y-6">
          {GROUP_ORDER.map((groupName) => {
            const gp = grouped[groupName];
            if (!gp || gp.length === 0) return null;
            return (
              <div key={groupName} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
                  <h3 className="font-bold text-slate-700">{groupName}</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="border-b border-slate-100 bg-slate-50/80 font-medium text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Sayfa</th>
                        <th className="px-5 py-3">URL</th>
                        <th className="px-5 py-3">İçerik</th>
                        <th className="px-5 py-3">SSS</th>
                        <th className="px-5 py-3 text-right">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {gp.map((p) => {
                        const url = p.slug === "index" ? "/" : `/${p.slug}`;
                        return (
                          <tr key={p.id} className="transition-colors hover:bg-slate-50/50">
                            <td className="px-5 py-4 font-medium text-slate-800">{p.name}</td>
                            <td className="px-5 py-4 text-xs text-slate-400">
                              <a href={url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-brand-600">
                                {url} <ExternalLink className="h-3 w-3" />
                              </a>
                            </td>
                            <td className="px-5 py-4">
                              {hasContent(p.seo_content || "") ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Var</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600"><AlertCircle className="h-3.5 w-3.5" /> Eklenmeli</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-xs font-medium ${(p.faq_count ?? 0) > 0 ? "text-emerald-600" : "text-slate-400"}`}>{p.faq_count ?? 0} soru</span>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <Link href={`/admin/sayfalar/${p.id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-brand-700">
                                <Pencil className="h-3.5 w-3.5" /> Düzenle
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={() => !busy && setModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-800"><Plus className="h-5 w-5 text-brand-600" /> Yeni Sayfa Oluştur</h3>
              <button onClick={() => setModalOpen(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
            </div>
            <p className="mb-5 text-sm text-slate-500">Sadece sayfa adını girin. Açılan ekranda URL (slug) ve içeriği düzenleyebilirsiniz.</p>
            <label className="mb-1 block text-sm font-medium text-slate-700">Sayfa adı</label>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && create()}
              placeholder="Örn: Kariyer"
              autoFocus
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
            <p className="mt-1 text-xs text-slate-400">URL otomatik oluşturulur (Kariyer → /kariyer).</p>
            <div className="mt-5 flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">İptal</button>
              <button onClick={create} disabled={busy} className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-60">
                {busy ? "Oluşturuluyor…" : "Oluştur ve düzenle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
