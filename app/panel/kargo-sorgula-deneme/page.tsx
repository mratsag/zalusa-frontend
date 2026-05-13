"use client";

import { useState } from "react";
import {
  PackageSearch, Search, Loader2, AlertCircle, Truck, Package,
  Database, Globe, ChevronDown, ChevronRight, CheckCircle2, XCircle, Clock
} from "lucide-react";

interface DebugResponse {
  input_code: string;
  timestamp: string;
  db_lookup: any;
  basit_kargo: {
    queried_code: string;
    raw_response: any;
    parsed: any;
    error: string;
  };
  pts: {
    queried_code: string;
    raw_response: any;
    parsed: any;
    error: string;
  };
  unified_tracking: {
    tracking_code: string;
    main_status: string;
    carrier: string;
    target_country: string;
    domestic_events: any[];
    international_events: any[];
  };
}

function StatusBadge({ success, label }: { success: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
      success
        ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
        : "bg-red-100 text-red-600 border border-red-200"
    }`}>
      {success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
}

function CollapsibleJSON({ title, data, defaultOpen = false }: { title: string; data: any; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  if (data === null || data === undefined) return null;

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 transition text-left"
      >
        {open ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        <span className="font-semibold text-sm text-slate-700">{title}</span>
        <span className="text-xs text-slate-400 ml-auto">
          {typeof data === "object" ? "JSON" : typeof data}
        </span>
      </button>
      {open && (
        <div className="p-4 bg-slate-900 overflow-x-auto max-h-[500px] overflow-y-auto">
          <pre className="text-xs text-emerald-400 font-mono whitespace-pre-wrap break-words leading-relaxed">
            {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function KargoSorgulaDenemePage() {
  const [code, setCode] = useState("");
  const [data, setData] = useState<DebugResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");
    setData(null);
    setElapsed(0);

    const start = Date.now();

    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${API}/api/debug/track/${code.trim()}`);
      const ms = Date.now() - start;
      setElapsed(ms);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || `HTTP ${res.status}: İstek başarısız oldu.`);
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setElapsed(Date.now() - start);
      if (err.message?.includes("Failed to fetch")) {
        setError("Backend'e bağlanılamıyor. Backend çalışıyor mu?");
      } else {
        setError(err.message || "Bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const basitOk = data?.basit_kargo && !data.basit_kargo.error && data.basit_kargo.parsed;
  const ptsOk = data?.pts && !data.pts.error && data.pts.parsed;
  const dbOk = data?.db_lookup?.found === true;

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-8 sm:py-12">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4">
            <PackageSearch className="w-4 h-4" />
            Debug / Test Modu
          </div>
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Kargo Takip Test Paneli
          </h1>
          <p className="text-slate-400 mt-2 text-sm sm:text-base max-w-xl mx-auto">
            Tek bir kod ile hem Basit Kargo (yurt içi) hem PTS (yurt dışı) API&apos;lerinden ham yanıtları görün.
            ZLS kodu, PTS AWB veya Basit Kargo barkod girebilirsiniz.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-10">
          <div className="relative flex items-center bg-slate-900 rounded-2xl border border-slate-700 focus-within:border-amber-500/50 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all shadow-2xl">
            <div className="pl-5">
              <Search className="w-5 h-5 text-slate-500" />
            </div>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ZLS-SHP-289664 veya 5515086564 veya barkod..."
              className="flex-1 h-14 pl-4 pr-4 bg-transparent text-white placeholder:text-slate-500 font-mono font-bold text-base tracking-wide focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="h-10 px-6 mr-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 active:scale-95 text-slate-900 font-extrabold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sorgula"}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 flex items-center gap-3 p-4 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-amber-400 mx-auto mb-4" />
            <p className="text-slate-400 font-medium">API&apos;ler sorgulanıyor... (PTS timeout 15sn olabilir)</p>
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Quick Summary Bar */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-slate-400 font-medium">{elapsed}ms</span>
              </div>
              <div className="w-px h-5 bg-slate-700" />
              <StatusBadge success={dbOk} label={dbOk ? "DB Bulundu" : "DB Bulunamadı"} />
              <StatusBadge success={!!basitOk} label={basitOk ? "Basit Kargo ✓" : "Basit Kargo ✗"} />
              <StatusBadge success={!!ptsOk} label={ptsOk ? "PTS ✓" : "PTS ✗"} />
              <div className="ml-auto text-xs text-slate-500 font-mono">{data.timestamp}</div>
            </div>

            {/* 3-Column Grid */}
            <div className="grid lg:grid-cols-3 gap-6">

              {/* DB Lookup */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${dbOk ? "bg-blue-500/20" : "bg-slate-800"}`}>
                    <Database className={`w-5 h-5 ${dbOk ? "text-blue-400" : "text-slate-500"}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Veritabanı Eşleşme</h3>
                    <p className="text-xs text-slate-500">shipments + pts_logs + domestic</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {dbOk ? (
                    <>
                      <InfoRow label="Shipment ID" value={data.db_lookup.shipment_id} />
                      <InfoRow label="Tracking Code" value={data.db_lookup.tracking_code} />
                      <InfoRow label="Status" value={data.db_lookup.status} />
                      <InfoRow label="Carrier" value={data.db_lookup.carrier_name} />
                      <InfoRow label="PTS AWB" value={data.db_lookup.pts_awb} highlight />
                      <InfoRow label="BK Barcode" value={data.db_lookup.basit_kargo_barcode} highlight />
                      <InfoRow label="Ülke" value={data.db_lookup.receiver_country} />
                    </>
                  ) : (
                    <div className="text-center py-6">
                      <XCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-slate-500">Bu kod DB&apos;de bulunamadı</p>
                      {data.db_lookup.db_error && (
                        <p className="text-xs text-slate-600 mt-1 font-mono">{data.db_lookup.db_error}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Basit Kargo */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${basitOk ? "bg-indigo-500/20" : "bg-slate-800"}`}>
                    <Truck className={`w-5 h-5 ${basitOk ? "text-indigo-400" : "text-slate-500"}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Basit Kargo (Yurt İçi)</h3>
                    <p className="text-xs text-slate-500 font-mono">Kod: {data.basit_kargo.queried_code}</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {data.basit_kargo.error ? (
                    <div className="text-center py-4">
                      <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                      <p className="text-xs text-red-400 font-medium break-all">{data.basit_kargo.error}</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm text-emerald-400 font-bold">Başarılı</p>
                    </div>
                  )}
                  <CollapsibleJSON title="Ham API Yanıtı (raw)" data={data.basit_kargo.raw_response} />
                  <CollapsibleJSON title="Parse Edilmiş Veri" data={data.basit_kargo.parsed} defaultOpen={!!basitOk} />
                </div>
              </div>

              {/* PTS */}
              <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${ptsOk ? "bg-emerald-500/20" : "bg-slate-800"}`}>
                    <Globe className={`w-5 h-5 ${ptsOk ? "text-emerald-400" : "text-slate-500"}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">PTS (Yurt Dışı)</h3>
                    <p className="text-xs text-slate-500 font-mono">Kod: {data.pts.queried_code}</p>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {data.pts.error ? (
                    <div className="text-center py-4">
                      <AlertCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
                      <p className="text-xs text-red-400 font-medium break-all">{data.pts.error}</p>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                      <p className="text-sm text-emerald-400 font-bold">Başarılı</p>
                    </div>
                  )}
                  <CollapsibleJSON title="Ham API Yanıtı (raw)" data={data.pts.raw_response} />
                  <CollapsibleJSON title="Parse Edilmiş Veri" data={data.pts.parsed} defaultOpen={!!ptsOk} />
                </div>
              </div>

            </div>

            {/* Unified Tracking Preview */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <PackageSearch className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Birleştirilmiş Tracking Sonucu</h3>
                  <p className="text-xs text-slate-500">unified_tracking objesi</p>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <span className="text-xs text-slate-400">Durum:</span>
                  <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg">{data.unified_tracking.main_status}</span>
                  <span className="text-xs text-slate-400 mx-1">•</span>
                  <span className="text-xs text-slate-300">{data.unified_tracking.carrier}</span>
                  <span className="text-xs text-slate-500">→</span>
                  <span className="text-xs text-slate-300">{data.unified_tracking.target_country}</span>
                </div>
              </div>
              <div className="p-4 grid md:grid-cols-2 gap-4">
                {/* Domestic Events */}
                <div>
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Truck className="w-3.5 h-3.5" />
                    Yurt İçi ({data.unified_tracking.domestic_events?.length || 0})
                  </h4>
                  {data.unified_tracking.domestic_events?.length > 0 ? (
                    <div className="space-y-2">
                      {data.unified_tracking.domestic_events.map((ev: any, i: number) => (
                        <div key={i} className="p-3 bg-slate-800 rounded-lg border border-slate-700 text-xs">
                          <div className="font-bold text-indigo-300">{ev.description}</div>
                          <div className="text-slate-500 mt-1">{ev.date} {ev.location && `• ${ev.location}`}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 italic">Yurt içi event bulunamadı</p>
                  )}
                </div>
                {/* International Events */}
                <div>
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5" />
                    Uluslararası ({data.unified_tracking.international_events?.length || 0})
                  </h4>
                  {data.unified_tracking.international_events?.length > 0 ? (
                    <div className="space-y-2">
                      {data.unified_tracking.international_events.map((ev: any, i: number) => (
                        <div key={i} className="p-3 bg-slate-800 rounded-lg border border-slate-700 text-xs">
                          <div className="font-bold text-emerald-300">{ev.description}</div>
                          <div className="text-slate-500 mt-1">{ev.date} {ev.location && `• ${ev.location}`}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-600 italic">Uluslararası event bulunamadı</p>
                  )}
                </div>
              </div>
            </div>

            {/* Full Raw JSON */}
            <CollapsibleJSON title="🔍 Tüm Ham Yanıt (Full Debug Response)" data={data} />

          </div>
        )}

        {/* Empty State */}
        {!data && !loading && !error && (
          <div className="text-center py-20 opacity-40">
            <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-500 font-medium text-lg">Sorgulama yapmak için bir kod girin</p>
            <p className="text-slate-600 text-sm mt-2">ZLS-SHP kodu, PTS AWB numarası veya Basit Kargo barkod no</p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: any; highlight?: boolean }) {
  const displayVal = value === null || value === undefined || value === "" ? "—" : String(value);
  const hasValue = displayVal !== "—";

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-800 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-mono font-bold ${
        !hasValue ? "text-slate-600" :
        highlight ? "text-amber-400" : "text-white"
      }`}>
        {displayVal}
      </span>
    </div>
  );
}
