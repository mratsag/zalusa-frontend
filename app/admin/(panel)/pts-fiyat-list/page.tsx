"use client";

import React, { useState, useMemo } from "react";
import {
  Search, Package, Globe, Loader2, ChevronDown, ChevronUp, RefreshCw,
  DollarSign, Truck, Ruler, AlertTriangle, Download, Settings,
  TrendingUp, ShieldAlert, Plus, X
} from "lucide-react";
import * as XLSX from "xlsx";

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

  const [activeModifiers, setActiveModifiers] = useState({
    marj: true, genelGider: true, desiFarki: true
  });
  const [modifierValues, setModifierValues] = useState({
    marj: 25, genelGider: 80, desiFarki: 7
  });
  const [modifierTypes, setModifierTypes] = useState({
    marj: "percentage", genelGider: "fixed", desiFarki: "percentage"
  });
  const [rates, setRates] = useState<any[]>([]);

  // Veritabanından güncel marjları ve kurları çek
  React.useEffect(() => {
    async function loadData() {
      try {
        const [mRes, eRes, rRes] = await Promise.all([
          fetch(`${API_BASE}/api/admin/margin-rules`, { headers: { Authorization: `Bearer ${getAdminToken()}` } }),
          fetch(`${API_BASE}/api/admin/extra-margins`, { headers: { Authorization: `Bearer ${getAdminToken()}` } }),
          fetch(`${API_BASE}/api/exchange-rates`)
        ]);
        
        const mData = await mRes.json();
        const eData = await eRes.json();
        const rData = await rRes.json();

        setRates(rData.rates || []);

        // Genel Marj (%25)
        const globalMargin = mData.rules?.find((r: any) => r.ruleType === "global");
        if (globalMargin) {
          setModifierValues(prev => ({ ...prev, marj: globalMargin.marginValue }));
          setModifierTypes(prev => ({ ...prev, marj: globalMargin.marginType }));
        }

        // Ekstra Marjlar (Desi %7, Genel Gider 80 TL)
        const margins = eData.margins || [];
        const desiMargin = margins.find((m: any) => m.marginCategory === "desi_margin");
        const overhead = margins.find((m: any) => m.marginCategory === "overhead");

        if (desiMargin) {
          setModifierValues(prev => ({ ...prev, desiFarki: desiMargin.marginValue }));
          setModifierTypes(prev => ({ ...prev, desiFarki: desiMargin.marginType }));
        }
        if (overhead) {
          setModifierValues(prev => ({ ...prev, genelGider: overhead.marginValue }));
          setModifierTypes(prev => ({ ...prev, genelGider: overhead.marginType }));
        }
      } catch (err) {
        console.error("Başlangıç verileri yüklenemedi:", err);
      }
    }
    loadData();
  }, []);

  const getPriceWithModifiers = (basePrice: number, baseCurrency: string) => {
    let price = basePrice;
    
    // Kur çevrimi için yardımcı
    const getRate = (cur: string) => {
      const r = rates.find(x => x.from_currency === cur);
      return r ? (Number(r.rate) + (Number(r.markup) || 0)) : 1;
    };
    const currentRate = getRate(baseCurrency);

    // 1. Genel Marj
    if (activeModifiers.marj) {
      if (modifierTypes.marj === "percentage") {
        price += (price * (modifierValues.marj / 100));
      } else {
        price += (modifierValues.marj / currentRate);
      }
    }

    // 2. Desi Farkı
    if (activeModifiers.desiFarki) {
      if (modifierTypes.desiFarki === "percentage") {
        price += (price * (modifierValues.desiFarki / 100));
      } else {
        price += (modifierValues.desiFarki / currentRate);
      }
    }

    // 3. Genel Gider
    if (activeModifiers.genelGider) {
      if (modifierTypes.genelGider === "percentage") {
        price += (price * (modifierValues.genelGider / 100));
      } else {
        price += (modifierValues.genelGider / currentRate);
      }
    }

    return price;
  };

  const calculatedPrices = useMemo(() => {
    return prices.map(p => {
      const hamPrice = Number(String(p.price || "0").replace(/,/g, "")) || 0;
      const marjliPrice = getPriceWithModifiers(hamPrice, p.currency || "USD");
      
      const rateObj = rates.find(x => x.from_currency === p.currency);
      const currentRate = rateObj ? (Number(rateObj.rate) + (Number(rateObj.markup) || 0)) : 1;

      return {
        ...p,
        calcPrice: marjliPrice.toFixed(2),
        calcPriceTL: (marjliPrice * currentRate).toFixed(2)
      };
    });
  }, [prices, activeModifiers, modifierValues, modifierTypes, rates]);

  const toggleModifier = (key: keyof typeof activeModifiers) => {
    setActiveModifiers(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const updateValue = (key: keyof typeof modifierValues, val: number) => {
    setModifierValues(prev => ({ ...prev, [key]: val }));
  };

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

  const exportToExcel = () => {
    const sheetData = [
      ["ZALUSA DİNAMİK PTS FİYAT LİSTESİ"],
      ["Oluşturulma Tarihi:", new Date().toLocaleDateString("tr-TR")],
      ["Hedef Ülke:", countryCode],
      ["Paket Sayısı:", packages.length],
      ["Aktif Çarpanlar:"],
      [
        activeModifiers.marj ? `+ Marj (%${modifierValues.marj})` : "",
        activeModifiers.genelGider ? `+ Genel Gider (%${modifierValues.genelGider})` : "",
        activeModifiers.desiFarki ? `+ Desi Farkı (%${modifierValues.desiFarki})` : "",
      ].filter(Boolean),
      [],
      ["Servis", "Kod", "Firma", "Döviz", "Ham Fiyat", "Marjlı Fiyat", "Marjlı Fiyat (TL)", "Ücretli Ağırlık (kg)", "Gümrük"]
    ];

    calculatedPrices.forEach(p => {
      sheetData.push([
        p.serviceName || "-",
        p.serviceCode || "-",
        p.companyName || p.companyCode || "-",
        p.currency || "-",
        p.price || "-",
        p.calcPrice || "-",
        p.calcPriceTL || "-",
        p.chargableWeight || "-",
        p.customsType === "D" ? "DDP" : p.customsType === "H" ? "DAP" : p.customsType || "-"
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    worksheet["!cols"] = [
      { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 10 }, 
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 10 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fiyatlar");
    XLSX.writeFile(workbook, `Zalusa_PTS_${countryCode}_Fiyatlari.xlsx`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">PTS Fiyat Listesi & Dinamik Excel</h1>
          <p className="text-sm text-slate-500 mt-1">
            PTS API üzerinden gerçek zamanlı kargo fiyatlarını sorgulayın, marj ekleyin ve Excel olarak indirin.
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

          {/* Company Code */}
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
            <><Search className="h-4 w-4" /> API'den Fiyat Getir</>
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

      {/* Modifiers (Only shown if data fetched) */}
      {prices.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 relative">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" /> Dinamik Fiyat Çarpanları
            </h2>
            <button 
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-100 transition-colors border border-indigo-200"
            >
              <Download className="w-4 h-4" /> Excel İndir
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* MARJ */}
            <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${activeModifiers.marj ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${activeModifiers.marj ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span className={`font-bold text-sm ${activeModifiers.marj ? 'text-emerald-900' : 'text-slate-600'}`}>Genel Marj</span>
                </div>
                <button onClick={() => toggleModifier('marj')} className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${activeModifiers.marj ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {activeModifiers.marj ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="number" value={modifierValues.marj} onChange={(e) => updateValue('marj', +e.target.value)} disabled={!activeModifiers.marj} className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 font-semibold text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none disabled:opacity-50" />
                <span className="text-sm font-bold text-slate-400">{modifierTypes.marj === "percentage" ? "%" : "₺"}</span>
              </div>
            </div>

            {/* GENEL GİDER */}
            <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${activeModifiers.genelGider ? 'border-amber-500 bg-amber-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${activeModifiers.genelGider ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <span className={`font-bold text-sm ${activeModifiers.genelGider ? 'text-amber-900' : 'text-slate-600'}`}>Genel Gider</span>
                </div>
                <button onClick={() => toggleModifier('genelGider')} className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${activeModifiers.genelGider ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {activeModifiers.genelGider ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="number" value={modifierValues.genelGider} onChange={(e) => updateValue('genelGider', +e.target.value)} disabled={!activeModifiers.genelGider} className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 font-semibold text-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none disabled:opacity-50" />
                <span className="text-sm font-bold text-slate-400">{modifierTypes.genelGider === "percentage" ? "%" : "₺"}</span>
              </div>
            </div>

            {/* DESİ FARKI */}
            <div className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${activeModifiers.desiFarki ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${activeModifiers.desiFarki ? 'bg-blue-100 text-blue-600' : 'bg-slate-200 text-slate-500'}`}>
                    <Package className="w-4 h-4" />
                  </div>
                  <span className={`font-bold text-sm ${activeModifiers.desiFarki ? 'text-blue-900' : 'text-slate-600'}`}>Desi Farkı</span>
                </div>
                <button onClick={() => toggleModifier('desiFarki')} className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${activeModifiers.desiFarki ? 'bg-blue-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {activeModifiers.desiFarki ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="number" value={modifierValues.desiFarki} onChange={(e) => updateValue('desiFarki', +e.target.value)} disabled={!activeModifiers.desiFarki} className="w-full h-10 bg-white border border-slate-200 rounded-xl px-3 font-semibold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none disabled:opacity-50" />
                <span className="text-sm font-bold text-slate-400">{modifierTypes.desiFarki === "percentage" ? "%" : "₺"}</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Results */}
      {calculatedPrices.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              <h2 className="text-base font-bold text-slate-800">Fiyat Sonuçları</h2>
              <span className="text-xs bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">{calculatedPrices.length} servis</span>
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
                  <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Ham Fiyat</th>
                  <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Marjlı (Yeni)</th>
                  <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Marjlı (TL)</th>
                  <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider text-right">Ücretl. Ağırlık</th>
                  <th className="px-6 py-3 font-bold text-slate-500 text-xs uppercase tracking-wider">Gümrük</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calculatedPrices.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-800">{p.serviceName || "-"}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-mono text-xs font-bold">
                        {p.serviceCode || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 font-medium">{p.companyName || p.companyCode || "-"}</td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="font-semibold text-slate-400 text-xs line-through mr-1">{p.currency} {p.price}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="font-black text-emerald-600 text-base">{p.currency} {p.calcPrice}</span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold text-slate-500">
                      {p.calcPriceTL !== "-" ? `₺${p.calcPriceTL}` : "-"}
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
              Ham JSON Yanıtı (PTS API)
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
