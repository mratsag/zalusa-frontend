"use client";

import React, { useState } from "react";
import { 
  Download, FileSpreadsheet, Search, Loader2, AlertTriangle, ChevronDown, ChevronUp, RefreshCw, Globe
} from "lucide-react";
import * as XLSX from "xlsx";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function getAdminToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("zalusa.admin.token") || "";
}

interface ZonePrice {
  zone: string;
  countries: string;
  prices: Record<string, number>;
  carriers?: Record<string, string>;
}

const ZONE_COUNTRIES: Record<string, string> = {
  "Z1": "Almanya, Fransa, Hollanda, Belçika, Lüksemburg, Avusturya, Birleşik Krallık",
  "Z2": "İtalya, İspanya, İrlanda, İsveç, Portekiz, Yunanistan, Danimarka",
  "Z3": "İsviçre, Norveç, Finlandiya, Polonya, Çekya, Macaristan, Slovakya",
  "Z4": "Romanya, Bulgaristan, Slovenya, Hırvatistan, Sırbistan, Litvanya, Letonya",
  "Z5": "Estonya, Kıbrıs, Malta, İzlanda, Karadağ",
  "Z6": "Amerika Birleşik Devletleri, Kanada, Meksika",
  "Z7": "Japonya, Güney Kore, Avustralya, Yeni Zelanda",
  "Z8": "Çin, Hindistan, Tayvan, Singapur, Hong Kong",
  "Z9": "Birleşik Arap Emirlikleri, Suudi Arabistan, Katar, Kuveyt",
  "Z10": "Güney Afrika, Brezilya, Arjantin, Şili"
};

function getCountriesForZone(zone: string): string {
  const upperZone = zone.toUpperCase().trim();
  if (ZONE_COUNTRIES[upperZone]) return ZONE_COUNTRIES[upperZone];
  if (upperZone.startsWith("Z") && ZONE_COUNTRIES[upperZone.substring(1)]) return ZONE_COUNTRIES[upperZone.substring(1)];
  if (!upperZone.startsWith("Z") && ZONE_COUNTRIES["Z" + upperZone]) return ZONE_COUNTRIES["Z" + upperZone];
  return "Bölge ülkeleri tanımlı değil";
}

export default function PTSExcelExportPage() {
  const [companyCode, setCompanyCode] = useState("FEDEX");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<any>(null);
  const [zonePrices, setZonePrices] = useState<ZonePrice[]>([]);
  const [desis, setDesis] = useState<string[]>([]);
  const [showRaw, setShowRaw] = useState(false);
  const [progressMsg, setProgressMsg] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  async function fetchPrices() {
    setLoading(true);
    setError(null);
    setRawData(null);
    setZonePrices([]);
    setDesis([]);
    setProgressMsg("Başlatılıyor...");
    setProgressPercent(0);

    try {
      const token = getAdminToken();
      const res = await fetch(`${API_BASE}/api/admin/pts-matrix/stream?companyCode=${companyCode}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.body) {
        throw new Error("Stream yanıtı alınamadı");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "");
              try {
                const event = JSON.parse(dataStr);
                setProgressPercent(event.progress);
                setProgressMsg(event.message);

                if (event.progress === 100 && event.data) {
                  setRawData(event.data);
                  
                  const rawArray = event.data;
                  const zonesMap: Record<string, { prices: Record<string, number>, currency: string, carrier: Record<string, string> }> = {};
                  const allDesis = new Set<string>();
                  const parsedZones: ZonePrice[] = [];

                  if (Array.isArray(rawArray)) {
                    rawArray.forEach((row: any) => {
                      const desiStr = String(row.KG);
                      allDesis.add(desiStr);

                      for (const key of Object.keys(row)) {
                        if (key !== "KG") {
                          if (!zonesMap[key]) {
                            zonesMap[key] = { prices: {}, currency: "", carrier: {} };
                          }
                          const pInfo = row[key];
                          if (pInfo && pInfo.price) {
                            zonesMap[key].prices[desiStr] = pInfo.price;
                            zonesMap[key].currency = pInfo.currency || "";
                            zonesMap[key].carrier[desiStr] = pInfo.carrier || "";
                          }
                        }
                      }
                    });

                    for (const [zoneKey, zoneData] of Object.entries(zonesMap)) {
                      if (Object.keys(zoneData.prices).length > 0) {
                        parsedZones.push({
                          zone: zoneKey,
                          countries: getCountriesForZone(zoneKey) + (zoneData.currency ? ` (${zoneData.currency})` : ""),
                          prices: zoneData.prices,
                          carriers: zoneData.carrier
                        });
                      }
                    }
                  }

                  // Sort zones: Z1, Z2, ..., Z10
                  parsedZones.sort((a, b) => {
                    const numA = parseInt(a.zone.replace(/\D/g, "")) || 0;
                    const numB = parseInt(b.zone.replace(/\D/g, "")) || 0;
                    return numA - numB;
                  });

                  const sortedDesis = Array.from(allDesis).sort((a, b) => Number(a) - Number(b));
                  setDesis(sortedDesis);
                  setZonePrices(parsedZones);
                }
              } catch (e) {
                console.error("Parse error on stream data:", e);
              }
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  }

  const exportToExcel = () => {
    const sheetData = [
      ["ZALUSA PTS BÖLGESEL FİYAT LİSTESİ"],
      ["Oluşturulma Tarihi:", new Date().toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })],
      ["Kargo Firması:", companyCode],
      [],
      ["Bölge", "Ülkeler", ...desis.map(d => `${d} Desi`)]
    ];

    zonePrices.forEach(zp => {
      const row: string[] = [zp.zone, zp.countries];
      desis.forEach(desi => {
        if (zp.prices[desi] !== undefined) {
          const carrier = zp.carriers && zp.carriers[desi] ? ` (${zp.carriers[desi]})` : "";
          row.push(`${zp.prices[desi]}${carrier}`);
        } else {
          row.push("-");
        }
      });
      sheetData.push(row);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    
    const cols = [{ wch: 10 }, { wch: 45 }];
    desis.forEach(() => cols.push({ wch: 14 }));
    worksheet["!cols"] = cols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Fiyatlar");
    XLSX.writeFile(workbook, `Zalusa_PTS_${companyCode}_BolgeFiyatlari.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-indigo-950 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/10">
              <FileSpreadsheet className="w-6 h-6 text-indigo-100" />
            </span>
            <h1 className="text-3xl font-black tracking-tight">PTS Tüm Bölgeler & Fiyatlar</h1>
          </div>
          <p className="text-indigo-200 text-sm max-w-xl leading-relaxed">
            Seçilen kargo firmasına ait tüm bölge ve desi fiyat listesini PTS API'den anlık çekin ve Excel olarak dışa aktarın.
          </p>
        </div>

        <button 
          onClick={exportToExcel}
          disabled={zonePrices.length === 0}
          className="relative z-10 flex items-center gap-2 bg-white text-indigo-950 px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-50 hover:scale-105 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] border border-indigo-100/50 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Download className="w-5 h-5" />
          Excel İndir
        </button>
      </div>

      {/* API Form */}
      <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 relative">
        <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-500" /> PTS Taşıyıcı Firma Seçimi
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Kargo Firması</label>
            <select
              value={companyCode}
              onChange={e => setCompanyCode(e.target.value)}
              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 font-bold text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none appearance-none"
            >
              <option value="FEDEX">FEDEX</option>
              <option value="DHL">DHL</option>
              <option value="UPS">UPS</option>
              <option value="PTS">PTS (Eco)</option>
              <option value="">Tüm Firmalar</option>
            </select>
          </div>

          <button
            onClick={fetchPrices}
            disabled={loading}
            className="w-full sm:w-auto h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor...</>
            ) : (
              <><Search className="h-4 w-4" /> Tüm Fiyat Listesini Getir</>
            )}
          </button>
        </div>
          
        {/* Progress Bar */}
        {loading && (
          <div className="mt-6 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
            <div className="flex justify-between items-center text-sm font-bold text-indigo-900 mb-3">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                {progressMsg}
              </div>
              <span>%{progressPercent}</span>
            </div>
            <div className="w-full bg-indigo-200/50 rounded-full h-3 overflow-hidden shadow-inner">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-300 ease-out relative" 
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Uyarı</p>
              <p className="text-sm text-amber-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Table Section */}
      {zonePrices.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-slate-800">Bölge & Desi Matrisi</h2>
              <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full">{zonePrices.length} Bölge bulundu</span>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-sm">
              Firma: <span className="text-indigo-600">{companyCode || "Tümü"}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-indigo-50/30">
                  <th className="px-6 py-4 text-left font-black text-indigo-900 text-xs uppercase tracking-wider sticky left-0 bg-indigo-50/90 backdrop-blur-sm shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-20 min-w-[280px]">Bölge / Ülkeler</th>
                  {desis.map(d => (
                    <th key={d} className="px-5 py-4 text-center font-bold text-slate-600 text-xs uppercase tracking-wider whitespace-nowrap border-l border-indigo-100/50">
                      {d} Desi
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {zonePrices.map((zp, i) => (
                  <tr key={i} className="hover:bg-indigo-50/10 transition-colors group">
                    <td className="px-6 py-4 sticky left-0 bg-white group-hover:bg-indigo-50/50 transition-colors shadow-[2px_0_10px_rgba(0,0,0,0.02)] z-10 min-w-[280px]">
                      <div className="flex items-start gap-3">
                        <span className="inline-flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-black text-sm">
                          {zp.zone.replace('Z', '')}
                        </span>
                        <div>
                          <div className="font-black text-slate-800">{zp.zone}</div>
                          <div className="text-xs font-medium text-slate-500 leading-relaxed mt-1 line-clamp-2" title={zp.countries}>
                            {zp.countries}
                          </div>
                        </div>
                      </div>
                    </td>
                    {desis.map(d => (
                      <td key={d} className="px-5 py-4 text-center border-l border-slate-50">
                        {zp.prices[d] !== undefined ? (
                          <div className="flex flex-col items-center">
                            <span className="font-black text-emerald-600 text-sm whitespace-nowrap bg-emerald-50 px-2.5 py-1 rounded-md">
                              {zp.prices[d].toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            {zp.carriers && zp.carriers[d] && (
                              <span className="text-[10px] text-slate-400 mt-1 uppercase font-bold truncate max-w-[80px]" title={zp.carriers[d]}>
                                {zp.carriers[d]}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Raw JSON Toggle */}
      {rawData && (
        <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowRaw(!showRaw)}
            className="w-full px-6 py-4 flex items-center justify-between text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <span className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-indigo-500" />
              Ham JSON Yanıtı (PTS API'den Gelen Orjinal Veri)
            </span>
            {showRaw ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          {showRaw && (
            <div className="px-6 pb-6">
              <pre className="bg-slate-900 text-emerald-400 rounded-2xl p-5 text-xs font-mono overflow-x-auto max-h-[500px] overflow-y-auto whitespace-pre-wrap border border-slate-800 shadow-inner">
                {JSON.stringify(rawData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
