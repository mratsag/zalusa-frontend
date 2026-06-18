"use client";

import { useState } from "react";
import {
  PackageSearch, Search, Truck, CheckCircle2, ChevronRight, PackageCheck,
  AlertCircle, Loader2, MapPin, Clock, Globe, ArrowRight, ExternalLink, Package
} from "lucide-react";

interface TrackingEvent {
  date: string;
  location: string;
  status: string;
  description: string;
}

interface ShipmentInfo {
  handler?: string;
  handlerShipmentCode?: string;
  handlerTrackingLink?: string;
  lastState?: string;
  deliveredTime?: string;
  orderNumber?: string;
  recipient?: string;
  sender?: string;
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
    last_mile_tracking_no: string;
    last_mile_tracking_url: string;
    last_mile_carrier: string;
    domestic_events: TrackingEvent[];
    international_events: TrackingEvent[];
  };
}

export default function KargomNeredePage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [data, setData] = useState<DebugResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!trackingCode.trim()) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      const API = process.env.NEXT_PUBLIC_API_URL ?? "";
      const res = await fetch(`${API}/api/debug/track/${trackingCode.trim()}`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || "Girdiğiniz takip numarasına ait kargo bulunamadı.");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      if (err.message?.includes("Failed to fetch")) {
        setError("Kargo sorgulama servisi şu anda yanıt vermiyor. Lütfen daha sonra tekrar deneyin.");
      } else {
        setError(err.message || "Bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Basit Kargo parsed verisinden ek bilgileri çıkar
  const shipmentInfo: ShipmentInfo | null = data?.basit_kargo?.parsed
    ? extractShipmentInfo(data.basit_kargo.parsed)
    : null;

  const ut = data?.unified_tracking;
  const hasDomestic = (ut?.domestic_events?.length ?? 0) > 0;
  const hasInternational = (ut?.international_events?.length ?? 0) > 0;
  const hasAnyEvents = hasDomestic || hasInternational;

  // Basit Kargo'dan traces varsa domestic_events olarak kullan
  const domesticEvents = hasDomestic
    ? ut!.domestic_events
    : (data?.basit_kargo?.parsed?.traces ?? []).map((t: any) => ({
        date: formatDate(t.time),
        location: [t.location, t.locationDetail].filter(Boolean).join(" / "),
        status: "Yurt İçi Transfer",
        description: t.status || "",
      }));

  const internationalEvents = ut?.international_events ?? [];

  const translateStatus = (s: string) => {
    if (!s) return s;
    const m: Record<string, string> = {
      draft: "Taslak", pending_payment: "Ödeme Bekleniyor", paid: "Sipariş Alındı",
      label_created: "Etiket Oluşturuldu", shipped: "Gönderildi", delivered: "Teslim Edildi",
      cancelled: "İptal Edildi", created: "Oluşturuldu", completed: "Tamamlandı",
      "Sorgulanıyor": "Sorgulanıyor", "Bilinmiyor": "Bilinmiyor",
    };
    const lower = s.toLowerCase();
    for (const [k, v] of Object.entries(m)) {
      if (lower.includes(k)) return v;
    }
    return s;
  };

  const getMainStatus = () => {
    if (shipmentInfo?.lastState) return shipmentInfo.lastState;
    if (ut?.main_status && ut.main_status !== "Sorgulanıyor") return translateStatus(ut.main_status);
    if (data?.basit_kargo?.parsed?.status) return translateStatus(data.basit_kargo.parsed.status);
    return "Sorgulanıyor";
  };

  const getCarrier = () => {
    if (shipmentInfo?.handler) return shipmentInfo.handler;
    if (ut?.carrier && ut.carrier !== "Bilinmiyor") return ut.carrier;
    return "";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/20 flex items-start justify-center pt-6 sm:pt-12 px-4 pb-20">
      <div className="w-full max-w-3xl">

        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-100/50 overflow-hidden border border-slate-100/80">
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 p-6 sm:p-10 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-white" />
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 relative z-10">
              Kargom Nerede?
            </h1>
            <p className="text-indigo-100/90 text-xs sm:text-sm font-medium max-w-md mx-auto mb-6 relative z-10">
              ZLS takip kodunuz, kargo barkodunuz veya kargo firması takip numaranız ile sorgulama yapın.
            </p>

            <form onSubmit={handleSearch} className="relative z-10 max-w-lg mx-auto">
              <div className="relative flex items-center bg-white/10 backdrop-blur-md rounded-2xl ring-1 ring-white/20 focus-within:ring-2 focus-within:ring-white/40 transition-all">
                <div className="pl-4">
                  <Search className="w-5 h-5 text-white/60" />
                </div>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                  placeholder="ZLS-SHP-12345 veya 704388124138"
                  className="flex-1 h-12 sm:h-14 pl-3 pr-4 bg-transparent text-white placeholder:text-white/40 font-bold text-sm sm:text-base uppercase tracking-wide focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-9 sm:h-10 px-5 mr-2 bg-white text-indigo-700 hover:bg-indigo-50 active:scale-95 transition-all font-extrabold rounded-xl flex items-center justify-center text-sm"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sorgula"}
                </button>
              </div>
            </form>
          </div>

          {/* Content */}
          <div className="p-5 sm:p-8">

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 mb-6 animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center py-16">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-400 mx-auto mb-4" />
                <p className="text-slate-400 font-medium text-sm">Kargo bilgileri sorgulanıyor...</p>
              </div>
            )}

            {/* Empty State */}
            {!data && !loading && !error && (
              <div className="text-center py-16 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
                  <PackageSearch className="w-8 h-8 text-indigo-300" />
                </div>
                <p className="text-slate-400 font-medium">Sorgulama yapmak için takip kodunuzu girin.</p>
                <p className="text-slate-300 text-xs mt-1">ZLS kodu, kargo barkod no veya firma takip no</p>
              </div>
            )}

            {/* Results */}
            {data && !loading && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Status Summary Card */}
                <div className="bg-gradient-to-r from-slate-50 to-indigo-50/50 rounded-2xl border border-slate-200/80 p-5">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        getMainStatus().includes("Teslim") ? "bg-emerald-100" :
                        getMainStatus().includes("Yolda") || getMainStatus().includes("Gönderildi") ? "bg-amber-100" :
                        "bg-indigo-100"
                      }`}>
                        {getMainStatus().includes("Teslim") ? (
                          <PackageCheck className="w-6 h-6 text-emerald-600" />
                        ) : getMainStatus().includes("Yolda") || getMainStatus().includes("Gönderildi") ? (
                          <Truck className="w-6 h-6 text-amber-600" />
                        ) : (
                          <Package className="w-6 h-6 text-indigo-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Kargo Durumu</p>
                        <p className="text-lg font-black text-slate-800">{getMainStatus()}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      {getCarrier() && (
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Taşıyıcı</p>
                          <p className="font-bold text-slate-700">{getCarrier()}</p>
                        </div>
                      )}
                      {ut?.target_country && ut.target_country !== "Bilinmiyor" && (
                        <>
                          <ChevronRight className="w-4 h-4 text-slate-300" />
                          <div className="text-center">
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Hedef</p>
                            <p className="font-bold text-slate-700">{ut.target_country}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Kargo firması takip linki */}
                  {shipmentInfo?.handlerTrackingLink && (
                    <a
                      href={shipmentInfo.handlerTrackingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-700 font-semibold bg-white px-3 py-2 rounded-xl border border-indigo-100 w-fit transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {shipmentInfo.handler} Takip Sayfası
                    </a>
                  )}
                </div>

                {/* Son Dağıtıcı (Last Mile) Takip Kartı */}
                {ut?.last_mile_tracking_no && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/80 p-5">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-amber-100">
                          <Truck className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Son Dağıtıcı</p>
                          <p className="text-lg font-black text-slate-800">{ut.last_mile_carrier || "Taşıyıcı"}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:items-end gap-1">
                        <p className="text-[10px] font-bold text-amber-500 uppercase">Acente Takip No</p>
                        <p className="font-mono font-bold text-slate-700 text-sm tracking-wider">{ut.last_mile_tracking_no}</p>
                      </div>
                    </div>

                    {ut.last_mile_tracking_url && (
                      <a
                        href={ut.last_mile_tracking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-2 text-sm text-white font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 px-5 py-2.5 rounded-xl shadow-lg shadow-amber-200/50 transition-all active:scale-95"
                      >
                        <ExternalLink className="w-4 h-4" />
                        {ut.last_mile_carrier || "Taşıyıcı"} Takip Sayfası
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                )}

                {/* Timeline Section */}
                {(domesticEvents.length > 0 || internationalEvents.length > 0) && (
                  <div className="grid gap-6 lg:grid-cols-2">

                    {/* Yurt İçi */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/50 to-transparent">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Truck className="w-5 h-5 text-indigo-500" />
                          Yurt İçi Süreç
                          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-bold ml-auto">
                            {domesticEvents.length}
                          </span>
                        </h3>
                      </div>
                      <div className="p-5 max-h-[500px] overflow-y-auto">
                        <TimelineList events={domesticEvents} color="indigo" />
                      </div>
                    </div>

                    {/* Yurt Dışı */}
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/50 to-transparent">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <Globe className="w-5 h-5 text-emerald-500" />
                          Uluslararası Süreç
                          <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full font-bold ml-auto">
                            {internationalEvents.length}
                          </span>
                        </h3>
                      </div>
                      <div className="p-5 max-h-[500px] overflow-y-auto">
                        <TimelineList events={internationalEvents} color="emerald" />
                      </div>
                    </div>
                  </div>
                )}

                {/* No events at all */}
                {!hasAnyEvents && domesticEvents.length === 0 && internationalEvents.length === 0 && (
                  <div className="text-center py-10 bg-white rounded-2xl border border-slate-100">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-400 font-medium">Bu kargo için henüz hareket verisi bulunmuyor.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Component ─────────────────────────────────────────────────────
function TimelineList({ events, color = "indigo" }: { events: TrackingEvent[]; color?: "indigo" | "emerald" }) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-slate-300">
        <Package className="w-10 h-10 mb-2" />
        <p className="text-xs font-medium">Bu aşama için henüz veri bulunmuyor.</p>
      </div>
    );
  }

  const dotColor = color === "indigo" ? "bg-indigo-500" : "bg-emerald-500";
  const lineColor = color === "indigo" ? "before:bg-indigo-100" : "before:bg-emerald-100";

  return (
    <div className={`relative pl-4 space-y-5 before:absolute before:inset-y-0 before:left-[7px] before:w-[2px] ${lineColor}`}>
      {events.map((event, index) => {
        const isFirst = index === 0;
        return (
          <div key={index} className="relative pl-7">
            <div className={`absolute left-0 top-1 w-4 h-4 rounded-full ring-3 ring-white ${
              isFirst ? dotColor : "bg-slate-200"
            }`}>
              {isFirst && <CheckCircle2 className="w-4 h-4 text-white p-[1px]" />}
            </div>
            <div>
              <p className={`text-sm font-bold ${isFirst ? "text-slate-900" : "text-slate-600"}`}>
                {event.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {event.date}
                </span>
                {event.location && (
                  <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function extractShipmentInfo(parsed: any): ShipmentInfo | null {
  if (!parsed) return null;
  return {
    handler: parsed.shipmentInfo?.handler?.name || "",
    handlerShipmentCode: parsed.shipmentInfo?.handlerShipmentCode || "",
    handlerTrackingLink: parsed.shipmentInfo?.handlerShipmentTrackingLink || "",
    lastState: parsed.shipmentInfo?.lastState || "",
    deliveredTime: parsed.shipmentInfo?.deliveredTime || "",
    orderNumber: parsed.orderNumber || "",
    recipient: parsed.recipient?.name || "",
    sender: parsed.sender?.name || "",
  };
}

function formatDate(d: string): string {
  if (!d) return "";
  try {
    const date = new Date(d);
    return date.toLocaleString("tr-TR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch {
    return d;
  }
}
