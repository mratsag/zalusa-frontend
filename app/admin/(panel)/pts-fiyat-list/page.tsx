"use client";

import React, { useState } from "react";
import {
  Search, Package, Globe, Loader2, ChevronDown, ChevronUp, RefreshCw,
  DollarSign, Truck, Weight, Ruler, AlertTriangle
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getAdminToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("zalusa.admin.token") || "";
}

interface PriceItem {
  serviceName?: string;
  serviceCode?: string;
  currency?: string;
  price?: string;
  priceTL?: string;
  chargableWeight?: string;
  customsType?: string;
  companyCode?: string;
  companyName?: string;
  [key: string]: any;
}

export default function PTSFiyatListPage() {
  const [countryCode, setCountryCode] = useState("DE");
  const [customsType, setCustomsType] = useState("");
  const [packages, setPackages] = useState([
    { en: 20, boy: 20, yukseklik: 20, agirlik: 2 },
  ]);
  const [companyCode, setCompanyCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any>(null);
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [showRaw, setShowRaw] = useState(false);

  async function fetchPrices() {
    setLoading(true);
    setError(null);
    setRawData(null);
    setPrices([]);
    try {
      const res = await fetch(`${API_BASE}/api/admin/pts-prices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAdminToken()}`,
        },
        body: JSON.stringify({
          ulke_kodu: countryCode.toUpperCase(),
          customsType,
          ebat: packages.map((p) => ({
            en: Number(p.en),
            boy: Number(p.boy),
            yukseklik: Number(p.yukseklik),
            agirlik: Number(p.agirlik),
          })),
          companyCode: companyCode || undefined,
        }),
      });
      const json = await res.json();
      setRawData(json);

      // Parse prices
      const data = json.data || json;
      const priceArr = data?.Price || data?.price || [];
      // PTS returns nested array [[{...}, {...}]]
      const flat: PriceItem[] = [];
      if (Array.isArray(priceArr)) {
        for (const group of priceArr) {
          if (Array.isArray(group)) {
            flat.push(...group);
          } else if (typeof group === "object") {
            flat.push(group);
          }
        }
      }
      setPrices(flat.filter(p => p.serviceCode !== "D"));
      if (flat.length === 0 && !json.error) {
        setError("Sorgu başarılı ancak fiyat bulunamadı. PTS hesabınızda bu ülke/ebat için tanımlı fiyat olmayabilir.");
      }
    } catch (err: any) {
      setError(err.message || "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  }

  function addPackage() {
    setPackages((prev) => [...prev, { en: 20, boy: 20, yukseklik: 20, agirlik: 1 }]);
  }

  function removePackage(idx: number) {
    setPackages((prev) => prev.filter((_, i) => i !== idx));
  }

  function updatePackage(idx: number, field: string, val: number) {
    setPackages((prev) => prev.map((p, i) => (i === idx ? { ...p, [field]: val } : p)));
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">PTS Fiyat Listesi</h1>
          <p className="text-sm text-slate-500 mt-1">
            PTS API üzerinden kargo firmalarının fiyatlarını sorgulayın (UPS, FedEx, DHL vb.)
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Ülke Kodu */}
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> Hedef Ülke Kodu (ISO 2)
            </label>
            <input
              type="text"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="DE"
              maxLength={2}
              className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all uppercase"
            />
          </div>

          {/* Customs Type */}
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" /> Gümrük Tipi
            </label>
            <select
              value={customsType}
              onChange={(e) => setCustomsType(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all bg-white"
            >
              <option value="">Belirtme (Opsiyonel)</option>
              <option value="D">DDP (Vergi Dahil)</option>
              <option value="H">DAP / DDU (Vergi Hariç)</option>
            </select>
          </div>

          {/* Company Code (Optional) */}
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" /> Firma Kodu (Opsiyonel)
            </label>
            <input
              type="text"
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              placeholder="Boş bırakılırsa tüm firmalar"
              className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
            />
          </div>
        </div>

        {/* Paketler */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
              <Ruler className="h-3.5 w-3.5" /> Paket Ebatları
            </label>
            <button type="button" onClick={addPackage} className="text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
              + Paket Ekle
            </button>
          </div>
          <div className="space-y-2">
            {packages.map((pkg, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 rounded-xl p-3">
                <span className="text-[11px] font-bold text-slate-400 w-6 shrink-0">#{idx + 1}</span>
                <div className="flex-1 grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium">En (cm)</label>
                    <input type="number" value={pkg.en} onChange={(e) => updatePackage(idx, "en", +e.target.value)} className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium">Boy (cm)</label>
                    <input type="number" value={pkg.boy} onChange={(e) => updatePackage(idx, "boy", +e.target.value)} className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium">Yükseklik (cm)</label>
                    <input type="number" value={pkg.yukseklik} onChange={(e) => updatePackage(idx, "yukseklik", +e.target.value)} className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400" />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-medium">Ağırlık (kg)</label>
                    <input type="number" step="0.1" value={pkg.agirlik} onChange={(e) => updatePackage(idx, "agirlik", +e.target.value)} className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-400" />
                  </div>
                </div>
                {packages.length > 1 && (
                  <button type="button" onClick={() => removePackage(idx)} className="text-red-400 hover:text-red-600 text-xs font-bold transition-colors shrink-0">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          onClick={fetchPrices}
          disabled={loading || !countryCode}
          className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Sorgulanıyor...</>
          ) : (
            <><Search className="h-4 w-4" /> PTS Fiyat Sorgula</>
          )}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Uyarı</p>
            <p className="text-sm text-amber-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Results */}
      {prices.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-800">Fiyat Sonuçları</h2>
              <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">{prices.length} servis</span>
            </div>
            <span className="text-xs text-slate-400 font-medium">Ülke: {countryCode}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Servis</th>
                  <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Kod</th>
                  <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Firma</th>
                  <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Fiyat</th>
                  <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Fiyat (TL)</th>
                  <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Ücretl. Ağırlık</th>
                  <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Gümrük</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prices.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-800">{p.serviceName || "-"}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-xs font-bold">
                        {p.serviceCode || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 font-medium">{p.companyName || p.companyCode || "-"}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="font-black text-emerald-600 text-base">{p.currency} {p.price}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-500">
                      {p.priceTL ? `₺${p.priceTL}` : "-"}
                    </td>
                    <td className="px-6 py-3.5 text-right font-medium text-slate-500">{p.chargableWeight ? `${p.chargableWeight} kg` : "-"}</td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${p.customsType === "D" ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                        {p.customsType === "D" ? "DDP" : p.customsType === "H" ? "DAP" : p.customsType || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw JSON Toggle */}
      {rawData && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRaw(!showRaw)}
            className="w-full px-6 py-3 flex items-center justify-between text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Ham JSON Yanıtı
            </span>
            {showRaw ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          {showRaw && (
            <div className="px-6 pb-4">
              <pre className="bg-slate-900 text-emerald-400 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
