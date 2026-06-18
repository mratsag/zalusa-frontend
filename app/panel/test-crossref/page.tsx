"use client";

import { useState } from "react";
import {
  Search, Loader2, CheckCircle2, AlertCircle, ExternalLink,
  Truck, Package, Globe, ArrowRight
} from "lucide-react";

export default function TestCrossRefPage() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [crossRefData, setCrossRefData] = useState<any>(null);
  const [trackData, setTrackData] = useState<any>(null);
  const [debugData, setDebugData] = useState<any>(null);
  const [error, setError] = useState("");

  const API = process.env.NEXT_PUBLIC_API_URL ?? "";

  async function fetchAll() {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setCrossRefData(null);
    setTrackData(null);
    setDebugData(null);

    try {
      // 3 endpoint'e paralel istek at
      const [crossRefRes, trackRes, debugRes] = await Promise.allSettled([
        fetch(`${API}/api/shipments/test-crossref/${code.trim()}`),
        fetch(`${API}/api/shipments/track/${code.trim()}`),
        fetch(`${API}/api/debug/track/${code.trim()}`),
      ]);

      if (crossRefRes.status === "fulfilled" && crossRefRes.value.ok) {
        setCrossRefData(await crossRefRes.value.json());
      }
      if (trackRes.status === "fulfilled" && trackRes.value.ok) {
        setTrackData(await trackRes.value.json());
      }
      if (debugRes.status === "fulfilled" && debugRes.value.ok) {
        setDebugData(await debugRes.value.json());
      }
    } catch (e: any) {
      setError(e.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
            🔬 PTS CrossRef & Tracking Test
          </h1>
          <p className="text-slate-400 mt-2">
            PTS CrossRef, Tracking ve Debug endpoint'lerini aynı anda test et
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchAll()}
              placeholder="PTS AWB No veya Tracking Code girin..."
              className="w-full pl-12 pr-4 py-4 bg-slate-800/80 border border-slate-700 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-lg font-mono"
            />
          </div>
          <button
            onClick={fetchAll}
            disabled={loading || !code.trim()}
            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 rounded-2xl font-bold text-lg transition-all active:scale-95 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Sorgula
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-300">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        <div className="grid gap-6">
          {/* 1. CrossRef Response */}
          {crossRefData && (
            <div className="bg-slate-800/60 backdrop-blur border border-amber-500/30 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-b border-amber-500/20 flex items-center gap-3">
                <Truck className="w-6 h-6 text-amber-400" />
                <h2 className="text-xl font-bold text-amber-300">1. PTS CrossRef — Ham Yanıt</h2>
                <span className="ml-auto text-xs font-mono px-3 py-1 bg-amber-500/20 rounded-full text-amber-300">
                  /api/shipments/test-crossref/{code.trim()}
                </span>
              </div>
              <div className="p-6">
                {/* Key Fields */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <InfoCard
                    label="HTTP Status"
                    value={crossRefData.http_status}
                    color={crossRefData.http_status === 200 ? "green" : "red"}
                  />
                  <InfoCard
                    label="AGENTCROSS"
                    value={crossRefData.parsed?.AGENTCROSS || "NULL"}
                    color={crossRefData.parsed?.AGENTCROSS ? "green" : "yellow"}
                  />
                  <InfoCard
                    label="Status"
                    value={crossRefData.parsed?.status ? "true" : "false"}
                    color={crossRefData.parsed?.status ? "green" : "red"}
                  />
                  <InfoCard
                    label="AWB"
                    value={crossRefData.parsed?.Awb || "—"}
                    color="blue"
                  />
                </div>

                {/* AGENTURL */}
                {crossRefData.parsed?.AGENTURL && (
                  <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                    <p className="text-xs text-emerald-400 font-bold mb-1">AGENTURL (Etiket PDF)</p>
                    <a
                      href={crossRefData.parsed.AGENTURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-emerald-300 hover:text-emerald-200 underline break-all"
                    >
                      {crossRefData.parsed.AGENTURL}
                    </a>
                  </div>
                )}

                {/* Raw JSON */}
                <details className="group">
                  <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 font-medium">
                    ▶ Ham JSON Yanıt
                  </summary>
                  <pre className="mt-3 p-4 bg-slate-900 rounded-xl text-xs text-slate-300 overflow-x-auto max-h-96 font-mono whitespace-pre-wrap">
                    {JSON.stringify(crossRefData, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {/* 2. Unified Tracking Response */}
          {trackData && (
            <div className="bg-slate-800/60 backdrop-blur border border-indigo-500/30 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border-b border-indigo-500/20 flex items-center gap-3">
                <Package className="w-6 h-6 text-indigo-400" />
                <h2 className="text-xl font-bold text-indigo-300">2. Unified Tracking — Son Kullanıcı</h2>
                <span className="ml-auto text-xs font-mono px-3 py-1 bg-indigo-500/20 rounded-full text-indigo-300">
                  /api/shipments/track/{code.trim()}
                </span>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <InfoCard label="Durum" value={trackData.main_status || "—"} color="blue" />
                  <InfoCard label="Taşıyıcı" value={trackData.carrier || "—"} color="blue" />
                  <InfoCard label="Ülke" value={trackData.target_country || "—"} color="blue" />
                  <InfoCard
                    label="Son Dağıtıcı"
                    value={trackData.last_mile_carrier || "YOK"}
                    color={trackData.last_mile_carrier ? "green" : "yellow"}
                  />
                </div>

                {/* Last Mile */}
                {trackData.last_mile_tracking_no && (
                  <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p className="text-xs text-amber-400 font-bold">Acente Takip No</p>
                        <p className="font-mono font-bold text-lg text-white">{trackData.last_mile_tracking_no}</p>
                      </div>
                      {trackData.last_mile_tracking_url && (
                        <a
                          href={trackData.last_mile_tracking_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all text-sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {trackData.last_mile_carrier} Takip
                          <ArrowRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                <details className="group">
                  <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 font-medium">
                    ▶ Tam JSON Yanıt
                  </summary>
                  <pre className="mt-3 p-4 bg-slate-900 rounded-xl text-xs text-slate-300 overflow-x-auto max-h-96 font-mono whitespace-pre-wrap">
                    {JSON.stringify(trackData, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}

          {/* 3. Debug Full Response */}
          {debugData && (
            <div className="bg-slate-800/60 backdrop-blur border border-emerald-500/30 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border-b border-emerald-500/20 flex items-center gap-3">
                <Globe className="w-6 h-6 text-emerald-400" />
                <h2 className="text-xl font-bold text-emerald-300">3. Debug Track — Tüm Ham Veriler</h2>
                <span className="ml-auto text-xs font-mono px-3 py-1 bg-emerald-500/20 rounded-full text-emerald-300">
                  /api/debug/track/{code.trim()}
                </span>
              </div>
              <div className="p-6">
                {/* DB Lookup */}
                <details className="group mb-3" open>
                  <summary className="cursor-pointer text-sm text-emerald-400 hover:text-emerald-300 font-bold">
                    📦 DB Lookup
                  </summary>
                  <pre className="mt-2 p-4 bg-slate-900 rounded-xl text-xs text-slate-300 overflow-x-auto max-h-60 font-mono whitespace-pre-wrap">
                    {JSON.stringify(debugData.db_lookup, null, 2)}
                  </pre>
                </details>

                {/* PTS Raw */}
                <details className="group mb-3">
                  <summary className="cursor-pointer text-sm text-indigo-400 hover:text-indigo-300 font-bold">
                    🌐 PTS Ham Yanıt
                  </summary>
                  <pre className="mt-2 p-4 bg-slate-900 rounded-xl text-xs text-slate-300 overflow-x-auto max-h-60 font-mono whitespace-pre-wrap">
                    {JSON.stringify(debugData.pts, null, 2)}
                  </pre>
                </details>

                {/* Unified */}
                <details className="group mb-3">
                  <summary className="cursor-pointer text-sm text-amber-400 hover:text-amber-300 font-bold">
                    🔗 Unified Tracking
                  </summary>
                  <pre className="mt-2 p-4 bg-slate-900 rounded-xl text-xs text-slate-300 overflow-x-auto max-h-60 font-mono whitespace-pre-wrap">
                    {JSON.stringify(debugData.unified_tracking, null, 2)}
                  </pre>
                </details>

                {/* Full Debug */}
                <details className="group">
                  <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 font-medium">
                    ▶ Tam Debug JSON (Büyük)
                  </summary>
                  <pre className="mt-2 p-4 bg-slate-900 rounded-xl text-xs text-slate-300 overflow-x-auto max-h-96 font-mono whitespace-pre-wrap">
                    {JSON.stringify(debugData, null, 2)}
                  </pre>
                </details>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, color }: { label: string; value: any; color: string }) {
  const colorMap: Record<string, string> = {
    green: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    red: "bg-red-500/10 border-red-500/30 text-red-300",
    yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-300",
    blue: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
  };

  return (
    <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.blue}`}>
      <p className="text-[10px] uppercase font-bold opacity-70 tracking-wider">{label}</p>
      <p className="text-sm font-mono font-bold mt-1 break-all">{String(value)}</p>
    </div>
  );
}
