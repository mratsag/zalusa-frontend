"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, CheckCircle2, AlertCircle, MapPinned } from "lucide-react";

import { listSeoCountries, type SeoCountryListItem } from "@/lib/services/seoCountriesService";
import { listCities, createCity, toggleCity, deleteCity, listRegions, createRegion, toggleRegion, deleteRegion, type CityListItem, type Region } from "@/lib/services/seoGeoService";

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

const INPUT = "rounded-xl border border-slate-200 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40";

export default function SehirlerPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<SeoCountryListItem[]>([]);
  const [countryId, setCountryId] = useState<number | "">("");
  const [cities, setCities] = useState<CityListItem[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [newCity, setNewCity] = useState("");
  const [newRegion, setNewRegion] = useState("");

  const loadBase = useCallback(async () => {
    setLoading(true);
    try {
      setCountries(await listSeoCountries());
      setCities(await listCities());
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBase(); }, [loadBase]);

  useEffect(() => {
    (async () => {
      try {
        setCities(await listCities(countryId === "" ? undefined : Number(countryId)));
        setRegions(countryId === "" ? [] : await listRegions(Number(countryId)));
      } catch (e) {
        setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" });
      }
    })();
  }, [countryId]);

  const addCity = async () => {
    if (countryId === "") { setToast({ message: "Önce ülke seçin", type: "error" }); return; }
    if (!newCity.trim()) return;
    try {
      const res = await createCity({ country_id: Number(countryId), name: newCity.trim() });
      router.push(`/admin/sehirler/${res.id}`);
    } catch (e) { setToast({ message: e instanceof Error ? e.message : "Eklenemedi", type: "error" }); }
  };

  const onToggleCity = async (r: CityListItem) => {
    try { await toggleCity(r.id); setCities((p) => p.map((x) => (x.id === r.id ? { ...x, is_active: !x.is_active } : x))); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Hata", type: "error" }); }
  };
  const onDeleteCity = async (r: CityListItem) => {
    if (!confirm(`"${r.name}" şehrini silmek istediğinize emin misiniz?`)) return;
    try { await deleteCity(r.id); setCities((p) => p.filter((x) => x.id !== r.id)); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Hata", type: "error" }); }
  };

  const addRegion = async () => {
    if (countryId === "" || !newRegion.trim()) return;
    try { await createRegion({ country_id: Number(countryId), name: newRegion.trim() }); setNewRegion(""); setRegions(await listRegions(Number(countryId))); }
    catch (e) { setToast({ message: e instanceof Error ? e.message : "Hata", type: "error" }); }
  };
  const onToggleRegion = async (r: Region) => {
    try { await toggleRegion(r.id); setRegions((p) => p.map((x) => (x.id === r.id ? { ...x, is_active: !x.is_active } : x))); }
    catch { /* noop */ }
  };
  const onDeleteRegion = async (r: Region) => {
    try { await deleteRegion(r.id); setRegions((p) => p.filter((x) => x.id !== r.id)); }
    catch { /* noop */ }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Building className="h-6 w-6 text-brand-600" /> Şehir SEO Sayfaları</h1>
          <p className="mt-1 text-sm text-slate-500">Ülkeye bağlı şehir landing sayfaları. /yurtdisi-kargo/&#123;ülke&#125;/&#123;şehir&#125; adresinde yayınlanır.</p>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <select value={countryId} onChange={(e) => setCountryId(e.target.value === "" ? "" : Number(e.target.value))} className={INPUT}>
          <option value="">Tüm ülkeler</option>
          {countries.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {countryId !== "" && (
          <div className="flex items-center gap-2">
            <input value={newCity} onChange={(e) => setNewCity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addCity()} placeholder="Yeni şehir adı" className={INPUT} />
            <button onClick={addCity} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"><Plus className="h-4 w-4" /> Ekle</button>
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="border-b border-slate-100 bg-slate-50 font-medium text-slate-500">
            <tr><th className="px-5 py-3">Şehir</th><th className="px-5 py-3">Ülke</th><th className="px-5 py-3">URL</th><th className="px-5 py-3">Durum</th><th className="px-5 py-3 text-right">İşlemler</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cities.map((r) => {
              const co = countries.find((c) => c.id === r.country_id);
              return (
                <tr key={r.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 font-medium text-slate-800">{r.name}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{r.country_name}</td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {co && <a href={`/yurtdisi-kargo/${co.slug}/${r.slug}`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 hover:text-brand-600">/{co.slug}/{r.slug} <ExternalLink className="h-3 w-3" /></a>}
                  </td>
                  <td className="px-5 py-4">{r.is_active ? <span className="text-xs font-bold text-emerald-600">Aktif</span> : <span className="text-xs font-bold text-slate-400">Pasif</span>}</td>
                  <td className="space-x-1 px-5 py-4 text-right">
                    <Link href={`/admin/sehirler/${r.id}`} className="inline-flex rounded-lg p-1.5 text-blue-600 hover:bg-blue-50"><Pencil className="h-4 w-4" /></Link>
                    <button onClick={() => onToggleCity(r)} className="rounded-lg p-1.5 text-slate-400 hover:bg-amber-50 hover:text-amber-600">{r.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                    <button onClick={() => onDeleteCity(r)} className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!loading && cities.length === 0 && <div className="p-8 text-center text-slate-500">Şehir yok.</div>}
        {loading && <div className="p-8 text-center text-slate-400">Yükleniyor…</div>}
      </div>

      {/* Bölgeler (seçili ülke) */}
      {countryId !== "" && (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-slate-800"><MapPinned className="h-5 w-5 text-brand-600" /> Bölgeler</h2>
          <p className="mb-4 text-xs text-slate-500">Şehir yoksa ülke sayfasında bölge listesi gösterilir.</p>
          <div className="mb-4 flex items-center gap-2">
            <input value={newRegion} onChange={(e) => setNewRegion(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addRegion()} placeholder="Yeni bölge adı" className={INPUT} />
            <button onClick={addRegion} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-white hover:bg-slate-900"><Plus className="h-4 w-4" /> Ekle</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {regions.map((r) => (
              <span key={r.id} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${r.is_active ? "border-slate-200 bg-slate-50 text-slate-700" : "border-slate-200 bg-white text-slate-400 line-through"}`}>
                {r.name}
                <button onClick={() => onToggleRegion(r)} className="text-slate-400 hover:text-amber-600" title="Aktif/Pasif">{r.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}</button>
                <button onClick={() => onDeleteRegion(r)} className="text-slate-400 hover:text-red-600" title="Sil"><Trash2 className="h-3.5 w-3.5" /></button>
              </span>
            ))}
            {regions.length === 0 && <span className="text-sm text-slate-400">Bölge yok.</span>}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
