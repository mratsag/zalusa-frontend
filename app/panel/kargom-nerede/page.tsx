"use client";

import { useState } from "react";
import { PackageSearch, Search, Truck, CheckCircle2, ChevronRight, PackageCheck, AlertCircle, Loader2, Info } from "lucide-react";

interface TrackingEvent {
  date: string;
  location: string;
  status: string;
  description: string;
}

interface TrackingData {
  tracking_code: string;
  main_status: string;
  carrier: string;
  target_country: string;
  events: TrackingEvent[];
}

export default function KargomNeredePage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!trackingCode.trim()) return;

    setLoading(true);
    setError("");
    setData(null);

    try {
      // API call to the unified tracking endpoint
      const res = await fetch(`http://localhost:8080/api/shipments/track/${trackingCode.trim()}`);
      if (!res.ok) {
        throw new Error("Kargo bulunamadı veya geçersiz takip numarası.");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  // Status to icon mapper
  const getIconForStatus = (status: string, index: number, isLast: boolean) => {
    if (index === 0) return <PackageSearch className="w-5 h-5 text-indigo-500" />;
    if (isLast && status.toLowerCase().includes("teslim")) return <PackageCheck className="w-5 h-5 text-green-500" />;
    return <Truck className="w-5 h-5 text-amber-500" />;
  };

  const translateStatus = (s: string) => {
    if (!s) return s;
    const lower = s.toLowerCase();
    
    if (lower.includes("draft")) return "Taslak";
    if (lower.includes("pending_payment")) return "Ödeme Bekleniyor";
    if (lower.includes("paid")) return "Sipariş Alındı";
    if (lower.includes("label_created")) return "Etiket Oluşturuldu";
    if (lower.includes("shipped")) return "Gönderildi (Taşımada)";
    if (lower.includes("delivered")) return "Teslim Edildi";
    if (lower.includes("cancelled")) return "İptal Edildi";
    if (lower.includes("created")) return "Oluşturuldu";
    
    return s;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-start justify-center pt-10 sm:pt-20 px-4 pb-20">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        
        {/* Header / Arama Bölümü */}
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <PackageSearch className="w-48 h-48 text-white -rotate-12 transform scale-150" />
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 relative z-10">
            Kargom Nerede?
          </h1>
          <p className="text-indigo-100 text-sm sm:text-base font-medium max-w-md mx-auto mb-8 relative z-10">
            Zalusa takip numaranızı girerek kargonuzun tüm güncel hareketlerini anlık ve kesintisiz izleyin.
          </p>

          <form onSubmit={handleSearch} className="relative z-10 max-w-lg mx-auto">
            <div className="relative flex items-center">
              <div className="absolute flex items-center justify-center pl-4 pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                placeholder="Örn: ZLS-SHP-12345"
                className="w-full h-14 pl-12 pr-32 rounded-2xl border-0 shadow-lg ring-1 ring-white/20 bg-white/95 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-white/40 focus:outline-none transition-all font-bold text-lg uppercase tracking-wide"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-2 h-10 px-5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 transition-all text-white font-bold rounded-xl flex items-center justify-center"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sorgula"}
              </button>
            </div>
          </form>
        </div>

        {/* Sonuç Alanı */}
        <div className="p-6 sm:p-10">
          
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 mb-6">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-semibold">{error}</p>
            </div>
          )}

          {!data && !loading && !error && (
            <div className="text-center py-12 flex flex-col items-center justify-center opacity-60">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">Sorgulama yapmak için takip kodunuzu girin.</p>
            </div>
          )}

          {data && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              
              {/* Özet Kartı */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-200 mb-8 gap-4">
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left min-w-0">
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Durum</span>
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <span className="text-lg font-extrabold text-slate-800 line-clamp-1">{translateStatus(data.main_status)}</span>
                  </div>
                </div>
                
                <div className="hidden sm:block w-px h-10 bg-slate-200"></div>
                
                <div className="flex flex-col items-center sm:items-start text-center sm:text-left min-w-0">
                  <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Taşıyıcı / Hedef</span>
                  <div className="flex items-center gap-1.5 mt-1 font-semibold text-slate-700 text-sm">
                    {data.carrier}
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                    {data.target_country}
                  </div>
                </div>
              </div>

              {/* Dikey Timeline */}
              <div className="relative pl-4 sm:pl-8">
                {/* Sol taraftaki ana çizgi */}
                <div className="absolute top-4 bottom-4 left-[27px] sm:left-[43px] w-[2px] bg-indigo-100"></div>

                <div className="space-y-8 relative">
                  {data.events.map((event, idx) => {
                    const isLast = idx === data.events.length - 1;
                    const isFirst = idx === 0;
                    
                    return (
                      <div key={idx} className="flex gap-4 sm:gap-6 relative group">
                        {/* Status Icon */}
                        <div className="relative flex-none">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-sm ring-1 ring-slate-100 z-10 relative bg-white transition-transform group-hover:scale-110 ${isLast ? 'bg-green-50 shadow-green-100 ring-green-200' : 'bg-slate-50'}`}>
                            {getIconForStatus(event.status, idx, isLast)}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-2">
                          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-1">
                            <h3 className="text-base font-bold text-slate-900">{event.status}</h3>
                            <span className="text-xs font-bold text-slate-400 tabular-nums">
                              {event.date}
                            </span>
                          </div>
                          
                          <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-sm">
                            {event.description}
                          </p>
                          
                          {event.location && (
                            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-400">
                              <Info className="w-3.5 h-3.5" />
                              Konum: {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}
