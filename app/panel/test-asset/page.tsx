"use client";

import { useState } from "react";
import { Loader2, Search, Database } from "lucide-react";

export default function TestAssetPage() {
  const [reference, setReference] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${API}/api/debug/asset/${reference.trim()}`);
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-6">
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800">Asset API Ham Test</h1>
              <p className="text-sm text-slate-500">Zalusa veritabanından tamamen bağımsız, direkt olarak Asset API'ye gider.</p>
            </div>
          </div>

          <form onSubmit={handleSearch} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Asset Referans No (Örn: 267841606)"
                className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !reference.trim()}
              className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sorgula"}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 font-medium">
            {error}
          </div>
        )}

        {data && (
          <div className="bg-slate-900 rounded-2xl p-6 shadow-lg overflow-hidden">
            <h3 className="text-slate-400 text-sm font-semibold mb-4 uppercase tracking-wider">Asset API Ham Yanıtı</h3>
            <pre className="text-emerald-400 text-xs sm:text-sm overflow-x-auto">
              <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
          </div>
        )}

      </div>
    </div>
  );
}
