"use client";

import { useState } from "react";
import {
  PackageSearch, Search, Truck, CheckCircle2, Globe, Package, Loader2,
  AlertCircle, Clock, MapPin, ExternalLink, ChevronDown, ChevronRight,
  PackageCheck, Copy, Check, Database
} from "lucide-react";

interface TrackingEvent {
  date: string;
  location: string;
  status: string;
  description: string;
}

interface DebugResponse {
  input_code: string;
  timestamp: string;
  db_lookup: any;
  basit_kargo: { queried_code: string; raw_response: any; parsed: any; error: string };
  pts: { queried_code: string; raw_response: any; parsed: any; error: string };
  unified_tracking: {
    tracking_code: string;
    main_status: string;
    carrier: string;
    target_country: string;
    domestic_events: TrackingEvent[];
    international_events: TrackingEvent[];
  };
}

export default function AdminKargoTakipPage() {
  const [code, setCode] = useState("");
  const [data, setData] = useState<DebugResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError("");
    setData(null);
    const start = Date.now();

    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${API}/api/debug/track/${code.trim()}`);
      setElapsed(Date.now() - start);
      if (!res.ok) throw new Error("Sorgu başarısız oldu.");
      setData(await res.json());
    } catch (err: any) {
      setElapsed(Date.now() - start);
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Extract rich info from Basit Kargo parsed response
  const bkParsed = data?.basit_kargo?.parsed;
  const shipmentInfo = bkParsed?.shipmentInfo;
  const handlerName = shipmentInfo?.handler?.name || "";
  const handlerLink = shipmentInfo?.handlerShipmentTrackingLink || "";
  const lastState = shipmentInfo?.lastState || "";

  // Build domestic events from Basit Kargo traces
  const domesticEvents: TrackingEvent[] =
    (data?.unified_tracking?.domestic_events?.length || 0) > 0
      ? data!.unified_tracking.domestic_events
      : (bkParsed?.traces ?? []).map((t: any) => ({
          date: t.time ? new Date(t.time).toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "",
          location: [t.location, t.locationDetail].filter(Boolean).join(" / "),
          status: "Yurt İçi",
          description: t.status || "",
        }));

  const internationalEvents = data?.unified_tracking?.international_events ?? [];
  const ut = data?.unified_tracking;
  const dbOk = data?.db_lookup?.found === true;
  const basitOk = !!bkParsed;
  const ptsOk = data?.pts?.parsed && !data.pts.error;

  const mainStatus = lastState || (ut?.main_status !== "Sorgulanıyor" ? ut?.main_status : bkParsed?.status) || "Sorgulanıyor";

  return (
    <div className="min-h-full py-8 sm:py-12 px-4 flex items-start justify-center">
      <div className="w-full max-w-4xl space-y-8">

        {/* Header / Search Area */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Decorative background icons */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <PackageSearch className="w-64 h-64 text-indigo-900 -rotate-12 transform translate-x-8 -translate-y-8" />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 mb-6">
                <Search className="w-8 h-8" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">Kargo Takip Sorgulama</h1>
              <p className="text-slate-500 text-sm sm:text-base max-w-lg mx-auto mb-10">
                Gönderi kodunu girerek yurt içi ve yurt dışı kargo hareketlerini, arka plandaki ham API yanıtlarıyla birlikte görüntüleyin.
              </p>

              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="relative flex items-center bg-white rounded-2xl shadow-lg shadow-slate-200/50 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                  <div className="pl-5">
                    <PackageSearch className="w-6 h-6 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="ZLS-SHP-728769, 704388124138, 5400584454..."
                    className="w-full h-16 pl-4 pr-32 bg-transparent text-slate-900 font-bold text-lg placeholder:text-slate-400 placeholder:font-medium focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="absolute right-2 h-12 px-8 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sorgula"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 shadow-sm animate-in fade-in">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Bağlantılar kuruluyor ve veriler çekiliyor...</p>
          </div>
        )}

        {/* Results Area */}
        {data && !loading && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Status indicators */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex flex-wrap items-center gap-3">
                <StatusPill ok={dbOk} label="Veritabanı" />
                <StatusPill ok={basitOk} label="Basit Kargo API" />
                <StatusPill ok={!!ptsOk} label="PTS API" />
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-lg">
                  <Clock className="w-4 h-4" /> {elapsed}ms
                </div>
                <button
                  onClick={copyJSON}
                  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-4 py-1.5 rounded-lg font-semibold transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Kopyalandı" : "JSON İndir"}
                </button>
              </div>
            </div>

            {/* Main Result Card */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-8 flex flex-col md:flex-row items-center text-center md:text-left gap-6 md:gap-8">
                <div className={`w-24 h-24 rounded-3xl flex items-center justify-center shrink-0 shadow-inner ${
                  mainStatus.includes("Teslim") || mainStatus === "COMPLETED" ? "bg-emerald-50 text-emerald-500 ring-1 ring-emerald-100" :
                  mainStatus.includes("Yolda") || mainStatus.includes("SHIPPED") ? "bg-amber-50 text-amber-500 ring-1 ring-amber-100" :
                  "bg-indigo-50 text-indigo-500 ring-1 ring-indigo-100"
                }`}>
                  {mainStatus.includes("Teslim") || mainStatus === "COMPLETED" ? (
                    <PackageCheck className="w-12 h-12" />
                  ) : mainStatus.includes("Yolda") || mainStatus.includes("SHIPPED") ? (
                    <Truck className="w-12 h-12" />
                  ) : (
                    <Package className="w-12 h-12" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Güncel Durum</p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">{mainStatus}</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                    {handlerName && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-xl font-bold text-slate-700 text-sm">
                        <Truck className="w-4 h-4 text-slate-500" /> {handlerName}
                      </span>
                    )}
                    {bkParsed?.orderNumber && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-xl font-bold text-indigo-700 text-sm">
                        #{bkParsed.orderNumber}
                      </span>
                    )}
                    {ut?.target_country && ut.target_country !== "Bilinmiyor" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-xl font-bold text-emerald-700 text-sm">
                        <Globe className="w-4 h-4 text-emerald-500" /> {ut.target_country}
                      </span>
                    )}
                  </div>
                </div>

                {handlerLink && (
                  <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                    <a
                      href={handlerLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95"
                    >
                      Kargo Sitesinde Aç <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              {/* Technical identifiers row */}
              {dbOk && (
                <div className="bg-slate-50 border-t border-slate-100 px-8 py-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <InfoCell label="Zalusa Gönderi ID" value={data.db_lookup.shipment_id} />
                    <InfoCell label="Takip Kodu" value={data.db_lookup.tracking_code} />
                    <InfoCell label="PTS AWB No" value={data.db_lookup.pts_awb} />
                    <InfoCell label="Yurt İçi Barkod" value={data.db_lookup.basit_kargo_barcode} />
                  </div>
                </div>
              )}
            </div>

            {/* Timelines */}
            {(domesticEvents.length > 0 || internationalEvents.length > 0) && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Domestic Timeline */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                        <Truck className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-800">Yurt İçi Süreç</h3>
                    </div>
                    <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">{domesticEvents.length} Kayıt</span>
                  </div>
                  <div className="p-6 max-h-[600px] overflow-y-auto flex-1">
                    <TimelineList events={domesticEvents} accent="indigo" />
                  </div>
                </div>

                {/* International Timeline */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <Globe className="w-5 h-5" />
                      </div>
                      <h3 className="font-bold text-lg text-slate-800">Uluslararası Süreç</h3>
                    </div>
                    <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm">{internationalEvents.length} Kayıt</span>
                  </div>
                  <div className="p-6 max-h-[600px] overflow-y-auto flex-1">
                    <TimelineList events={internationalEvents} accent="emerald" />
                  </div>
                </div>
              </div>
            )}

            {/* Fallback no events */}
            {domesticEvents.length === 0 && internationalEvents.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Kayıt Bulunamadı</h3>
                <p className="text-slate-500 mt-2">Bu gönderiye ait herhangi bir hareket dökümü alınamadı.</p>
              </div>
            )}

            {/* Debug Payload View */}
            <div className="mt-12">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-slate-400" />
                Ham API Yanıtları (Debug)
              </h3>
              <div className="space-y-4">
                <JSONBlock title="1. Veritabanı Çapraz Sorgusu (DB Lookup)" data={data.db_lookup} />
                <JSONBlock title="2. Basit Kargo API Yanıtı (Yurt İçi)" data={data.basit_kargo} />
                <JSONBlock title="3. PTS API Yanıtı (Yurt Dışı)" data={data.pts} />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

// ─── Components ──────────────────────────────────────────────────────────────
function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
      ok ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" : "bg-red-50 text-red-600 border border-red-200/50"
    }`}>
      {ok ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
      {label}
    </span>
  );
}

function InfoCell({ label, value }: { label: string; value: any }) {
  const v = value === null || value === undefined || value === "" ? "—" : String(value);
  return (
    <div className="flex flex-col">
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</span>
      <span className={`font-mono font-bold text-sm ${v === "—" ? "text-slate-300" : "text-slate-800"}`}>{v}</span>
    </div>
  );
}

function TimelineList({ events, accent = "indigo" }: { events: TrackingEvent[]; accent?: string }) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-300">
        <Package className="w-12 h-12 mb-3 opacity-50" />
        <p className="text-sm font-medium">Bu süreç için veri yok</p>
      </div>
    );
  }

  const dotActive = accent === "emerald" ? "bg-emerald-500" : "bg-indigo-600";
  const lineClass = accent === "emerald" ? "before:bg-emerald-100" : "before:bg-indigo-100";

  return (
    <div className={`relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 ${lineClass}`}>
      {events.map((ev, i) => (
        <div key={i} className="relative pl-8">
          <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white ${i === 0 ? dotActive : "bg-slate-200"}`}>
            {i === 0 && <Check className="w-3.5 h-3.5 text-white" />}
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className={`text-sm font-bold leading-snug ${i === 0 ? "text-slate-900" : "text-slate-700"}`}>{ev.description}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {ev.date && (
                <span className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-100">
                  <Clock className="w-3.5 h-3.5" /> {ev.date}
                </span>
              )}
              {ev.location && (
                <span className="text-[12px] text-slate-500 font-medium flex items-center gap-1.5 bg-white px-2 py-1 rounded-lg border border-slate-100">
                  <MapPin className="w-3.5 h-3.5" /> {ev.location}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function JSONBlock({ title, data }: { title: string; data: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <button 
        onClick={() => setOpen(!open)} 
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition text-left"
      >
        <span className="text-sm font-bold text-slate-700">{title}</span>
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </button>
      {open && (
        <div className="p-5 bg-slate-900 border-t border-slate-200">
          <pre className="text-[13px] text-emerald-400 font-mono whitespace-pre-wrap break-words leading-relaxed">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
