import React from "react";
import { CheckCircle2, Clock, Truck, MapPin, Package } from "lucide-react";
import { cn } from "@/lib/cn";

export interface TrackingEvent {
  date: string;
  location: string;
  status: string;
  description: string;
}

export interface CargoTrackingViewProps {
  trackingCode: string;
  mainStatus: string;
  carrier: string;
  targetCountry: string;
  domesticEvents?: TrackingEvent[];
  internationalEvents?: TrackingEvent[];
}

function TimelineList({ events }: { events: TrackingEvent[] }) {
  if (!events || events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-slate-400">
        <Package className="h-10 w-10 mb-2 opacity-50" />
        <p className="text-xs font-medium">Bu aşama için henüz veri bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-6 before:w-px before:bg-slate-200">
      {events.map((event, index) => {
        const isLatest = index === events.length - 1;
        const isTransfer = event.status === "Ön Transfer" || event.status === "Hazırlanıyor";
        
        return (
          <div key={index} className="relative pl-10">
            {/* Timeline dot */}
            <div className={cn(
              "absolute left-[-2px] top-1 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white",
              isLatest ? "bg-indigo-600" : isTransfer ? "bg-slate-400" : "bg-emerald-500"
            )}>
              {isLatest ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
              ) : isTransfer ? (
                <Clock className="h-3.5 w-3.5 text-white" />
              ) : (
                <Truck className="h-3.5 w-3.5 text-white" />
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center flex-wrap gap-2">
                <span className={cn(
                  "text-sm font-bold",
                  isLatest ? "text-indigo-900" : "text-slate-700"
                )}>
                  {event.status}
                </span>
                <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {event.date}
                </span>
                {event.location && (
                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {event.location}
                  </span>
                )}
              </div>
              <p className="text-[13px] text-slate-600 leading-relaxed mt-0.5">
                {event.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CargoTrackingView({ trackingCode, mainStatus, carrier, targetCountry, domesticEvents, internationalEvents }: CargoTrackingViewProps) {
  const hasDomestic = domesticEvents && domesticEvents.length > 0;
  const hasInternational = internationalEvents && internationalEvents.length > 0;

  if (!hasDomestic && !hasInternational) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Package className="h-12 w-12 mb-3" />
        <p className="text-sm font-medium">Bu kargo için henüz hareket verisi bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-indigo-50/50 p-5 ring-1 ring-indigo-100/50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Takip Kodu</div>
            <div className="text-sm font-semibold text-slate-900">{trackingCode}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Durum</div>
            <div className="text-sm font-semibold text-indigo-700">{mainStatus}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kargo Firması</div>
            <div className="text-sm font-semibold text-slate-900">{carrier}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Varış Ülkesi</div>
            <div className="text-sm font-semibold text-slate-900">{targetCountry}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Truck className="h-5 w-5 text-indigo-500" />
            Yurt İçi Süreciniz
          </h3>
          <TimelineList events={domesticEvents || []} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-500" />
            Yurt Dışı Süreciniz
          </h3>
          <TimelineList events={internationalEvents || []} />
        </div>
      </div>
    </div>
  );
}
