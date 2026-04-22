"use client";

import React from "react";
import { Loader2, Package, RefreshCw } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "";

function getToken(): string {
  try { return localStorage.getItem("zalusa.token") ?? ""; } catch { return ""; }
}

export default function DomesticDebugPage() {
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [width, setWidth] = React.useState("30");
  const [height, setHeight] = React.useState("20");
  const [depth, setDepth] = React.useState("15");
  const [weight, setWeight] = React.useState("5");

  async function fetchPrices() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const token = getToken();
      const res = await fetch(`${API}/api/domestic/prices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          packages: [{
            width: parseFloat(width) || 30,
            height: parseFloat(height) || 20,
            depth: parseFloat(depth) || 15,
            weight: parseFloat(weight) || 5,
          }],
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || "Hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">🔍 Basit Kargo - Firma Debug</h1>
        <p className="text-sm text-slate-500 mb-6">
          Bu sayfa Basit Kargo API&apos;sinden dönen ham firma verilerini gösterir.
          <br/>Marjlı fiyat = Kullanıcının gördüğü fiyat (domestic_carrier_margins tablosundaki marj uygulanmış)
        </p>

        {/* Input */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="text-sm font-bold text-slate-700 mb-3">Paket Ölçüleri (Test)</h2>
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xs text-slate-500">Genişlik (cm)</label>
              <input value={width} onChange={e => setWidth(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Yükseklik (cm)</label>
              <input value={height} onChange={e => setHeight(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Derinlik (cm)</label>
              <input value={depth} onChange={e => setDepth(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs text-slate-500">Ağırlık (kg)</label>
              <input value={weight} onChange={e => setWeight(e.target.value)} className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm" />
            </div>
          </div>
          <button
            onClick={fetchPrices}
            disabled={loading}
            className="mt-4 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Fiyat Sorgula
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">{error}</div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-800">
              Sonuçlar ({result.carriers?.length || 0} firma)
            </h2>

            {/* Carriers Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Handler Code</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Görünen İsim</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Logo URL</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Fiyat (Marjlı)</th>
                    <th className="text-right px-4 py-3 font-semibold text-slate-600">Desi (kg)</th>
                    <th className="text-left px-4 py-3 font-semibold text-slate-600">Tahmini Süre</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.carriers || []).map((c: any, i: number) => (
                    <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg text-xs font-mono font-bold">
                          {c.handlerCode}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3">
                        {c.logoUrl ? (
                          <div className="flex items-center gap-2">
                            <img src={c.logoUrl} alt="" className="w-6 h-6 object-contain" />
                            <span className="text-xs text-slate-400 truncate max-w-[150px]">{c.logoUrl}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-green-700">₺{c.price?.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">{c.desiKg}</td>
                      <td className="px-4 py-3 text-slate-500">{c.estimatedDays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Raw JSON */}
            <div className="bg-slate-900 rounded-xl p-4 overflow-auto max-h-96">
              <h3 className="text-xs font-bold text-slate-400 mb-2">Ham JSON Yanıtı</h3>
              <pre className="text-xs text-emerald-400 whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
