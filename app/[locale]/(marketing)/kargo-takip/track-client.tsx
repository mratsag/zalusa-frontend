"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/marketing/page-header";

// Public takip sorgusu — {API}/api/shipments/track/:code (UnifiedTracking döner).
// ?kod= / ?code= parametresi varsa otomatik sorgular (derin bağlantı).
const API = process.env.NEXT_PUBLIC_API_URL;

interface TrackingEvent {
  date: string;
  location: string;
  status: string;
  description: string;
}

interface UnifiedTracking {
  tracking_code: string;
  main_status: string;
  carrier: string;
  target_country: string;
  last_mile_tracking_no: string;
  last_mile_tracking_url: string;
  last_mile_carrier: string;
  domestic_events: TrackingEvent[] | null;
  international_events: TrackingEvent[] | null;
}

const STATUS_KEYS = ["draft","pending_payment","paid","label_created","shipped","in_transit","delivered","cancelled","returned"] as const;

// API "❓ label_created" gibi emoji önekli dönebilir -> anahtarı içerikten bul.
function statusKey(s: string): string {
  if (!s) return "unknown";
  const lower = s.toLowerCase();
  for (const k of STATUS_KEYS) {
    if (lower === k || lower.includes(k)) return k;
  }
  return "";
}

// Teslim/yolda/iptal durumuna göre renk sınıfları
function statusTone(s: string): string {
  const l = (s || "").toLowerCase();
  if (l.includes("delivered") || l.includes("teslim")) return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (l.includes("cancel") || l.includes("iptal") || l.includes("return") || l.includes("iade"))
    return "bg-red-50 text-red-700 ring-red-200";
  if (l.includes("draft") || l.includes("taslak") || l.includes("payment") || l.includes("ödeme"))
    return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-blue-50 text-[#0000BE] ring-blue-200";
}

function Timeline({ title, icon, events }: { title: string; icon: string; events: TrackingEvent[] }) {
  const tEvent = useTranslations("tracking")("event");
  if (!events.length) return null;
  return (
    <div>
      <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-900 mb-4">
        <i className={`ph-bold ${icon} text-[17px] text-[#0000BE]`} aria-hidden="true" />
        {title}
      </h3>
      <ol className="relative border-l border-slate-200 ml-2 space-y-5">
        {events.map((ev, i) => (
          <li key={i} className="ml-5">
            <span
              className={`absolute -left-[6.5px] mt-1.5 w-3 h-3 rounded-full ring-4 ring-white ${
                i === 0 ? "bg-[#0000BE]" : "bg-slate-300"
              }`}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-sm font-semibold text-slate-900">{ev.status || tEvent}</span>
              {ev.date && <span className="text-xs text-slate-400">{ev.date}</span>}
            </div>
            {ev.description && <p className="mt-0.5 text-sm text-slate-600">{ev.description}</p>}
            {ev.location && (
              <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                <i className="ph-bold ph-map-pin text-[12px]" aria-hidden="true" />
                {ev.location}
              </p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function TrackClient() {
  const t = useTranslations("tracking");
  const [code, setCode] = useState("");
  const [data, setData] = useState<UnifiedTracking | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = useCallback(async (raw: string) => {
    const q = raw.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setData(null);
    try {
      const res = await fetch(`${API}/api/shipments/track/${encodeURIComponent(q)}`);
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || t("notFound"));
      }
      setData(await res.json());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg.includes("Failed to fetch") ? t("serviceDown") : msg || t("genericError"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Derin bağlantı: /kargo-takip?kod=ZLS-SHP-XXXXXX
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const pre = sp.get("kod") || sp.get("code");
    if (pre) {
      setCode(pre);
      void search(pre);
    }
  }, [search]);

  const domestic = data?.domestic_events ?? [];
  const international = data?.international_events ?? [];
  const hasEvents = domestic.length > 0 || international.length > 0;

  return (
    <>
      <PageHeader
        current={t("breadcrumb")}
        title={t("title")}
        subtitle={t("subtitle")}
      />

      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Sorgu formu */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void search(code);
            }}
            className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200/80 ring-1 ring-slate-900/[0.03] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)]"
          >
            <label htmlFor="track-code" className="block text-sm font-bold text-slate-900 mb-2">
              {t("label")}
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="track-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t("placeholder")}
                autoComplete="off"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg py-3 px-4 text-slate-900 font-medium text-sm focus:ring-2 focus:ring-[#4D4DF2] focus:border-transparent outline-none"
              />
              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-br from-[#4D4DF2] to-[#0000BE] hover:from-[#5959FF] hover:to-[#00009c] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg transition-all whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <i className="ph-bold ph-circle-notch text-[15px] animate-spin" aria-hidden="true" />
                    {t("searching")}
                  </>
                ) : (
                  <>
                    <i className="ph-bold ph-magnifying-glass text-[15px]" aria-hidden="true" />
                    {t("submit")}
                  </>
                )}
              </button>
            </div>
            <p className="mt-2.5 text-xs text-slate-500">
              {t("hintBefore")}{" "}
              <a href="/giris" className="font-semibold text-[#0000BE] hover:underline">
                {t("hintLink")}
              </a>{" "}
              {t("hintAfter")}
            </p>
          </form>

          {/* Hata */}
          {error && (
            <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
              <i className="ph-bold ph-warning-circle text-[17px] text-red-600 mt-0.5" aria-hidden="true" />
              <p className="text-sm font-medium text-red-700">{error}</p>
            </div>
          )}

          {/* Sonuç */}
          {data && (
            <div className="mt-6 space-y-5">
              {/* Özet */}
              <div className="p-5 md:p-6 rounded-2xl border border-slate-200/80 bg-slate-50/60">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {t("trackingCode")}
                    </span>
                    <p className="text-lg font-bold text-slate-900">{data.tracking_code || code}</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 ring-1 ${statusTone(data.main_status)}`}
                  >
                    <i className="ph-bold ph-package text-[13px]" aria-hidden="true" />
                    {statusKey(data.main_status) ? t(`status.${statusKey(data.main_status)}`) : data.main_status}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  {data.carrier && data.carrier !== "Bilinmiyor" && (
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <dt className="text-slate-500">{t("carrier")}</dt>
                      <dd className="font-semibold text-slate-900">{data.carrier}</dd>
                    </div>
                  )}
                  {data.target_country && (
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <dt className="text-slate-500">{t("destination")}</dt>
                      <dd className="font-semibold text-slate-900">{data.target_country}</dd>
                    </div>
                  )}
                  {data.last_mile_carrier && (
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <dt className="text-slate-500">{t("lastMileCarrier")}</dt>
                      <dd className="font-semibold text-slate-900">{data.last_mile_carrier}</dd>
                    </div>
                  )}
                  {data.last_mile_tracking_no && (
                    <div className="flex items-center justify-between sm:justify-start sm:gap-2">
                      <dt className="text-slate-500">{t("lastMileNo")}</dt>
                      <dd className="font-semibold text-slate-900">
                        {data.last_mile_tracking_url ? (
                          <a
                            href={data.last_mile_tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#0000BE] hover:underline"
                          >
                            {data.last_mile_tracking_no}
                            <i className="ph-bold ph-arrow-square-out text-[13px]" aria-hidden="true" />
                          </a>
                        ) : (
                          data.last_mile_tracking_no
                        )}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Hareketler */}
              {hasEvents ? (
                <div className="p-5 md:p-6 rounded-2xl border border-slate-200/80 space-y-7">
                  <Timeline title={t("intlEvents")} icon="ph-globe" events={international} />
                  <Timeline title={t("domesticEvents")} icon="ph-truck" events={domestic} />
                </div>
              ) : (
                <div className="p-5 rounded-2xl border border-slate-200/80 bg-white text-center">
                  <i className="ph-bold ph-clock text-[22px] text-slate-300" aria-hidden="true" />
                  <p className="mt-2 text-sm text-slate-600">
                    {t("noEvents")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
