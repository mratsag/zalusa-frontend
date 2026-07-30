"use client";

import { useMemo, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";

// Yorum listesi — veriler DB'den (GET /api/testimonials) sunucuda çekilir, prop olarak gelir.
// Önceden 1,3 MB statik HTML'di. Filtre ve "daha fazla" istemci tarafında.

export type Review = {
  id: number;
  author: string;
  authorMeta: string;
  rating: number;
  sourceType: string;
  sourceLabel: string;
  sourceUrl: string;
  quote: string;
  publishedAt: string;
  isVerified: boolean;
};

const PAGE = 24;
type Filter = "all" | "general" | "country";

export function ReviewsClient({ reviews, total, averageRating }: { reviews: Review[]; total: number; averageRating: number }) {
  const t = useTranslations("reviews");
  const format = useFormatter();
  const [filter, setFilter] = useState<Filter>("all");
  const [limit, setLimit] = useState(PAGE);

  const filtered = useMemo(
    () => (filter === "all" ? reviews : reviews.filter((r) => r.sourceType === filter)),
    [reviews, filter],
  );
  const visible = filtered.slice(0, limit);
  const verifiedCount = useMemo(() => reviews.filter((r) => r.isVerified).length, [reviews]);

  const pick = (f: Filter) => {
    setFilter(f);
    setLimit(PAGE);
  };

  const TABS: { key: Filter; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "general", label: t("filterGeneral") },
    { key: "country", label: t("filterCountry") },
  ];

  return (
    <div className="space-y-8">
      {/* Özet */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {[
          { label: t("statTotal"), value: String(total) },
          { label: t("statAvg"), value: averageRating ? averageRating.toFixed(1) : "—" },
          { label: t("statVerified"), value: String(verifiedCount) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 md:p-5 text-center">
            <p className="text-[11px] md:text-xs font-semibold uppercase tracking-wide text-slate-400">{s.label}</p>
            <p className="mt-1 text-2xl md:text-3xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filtre */}
      <div className="rounded-xl bg-slate-100/80 p-1 ring-1 ring-slate-200/70">
        <div className="grid grid-cols-3 gap-0.5">
          {TABS.map((tab) => {
            const on = filter === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                aria-pressed={on}
                onClick={() => pick(tab.key)}
                className={`flex min-h-[2.5rem] items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] sm:text-[13px] font-semibold transition-all cursor-pointer ${
                  on ? "bg-white text-[#0000BE] shadow-sm ring-1 ring-slate-200/80" : "bg-transparent text-slate-600 hover:bg-white/70 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kartlar */}
      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-slate-500">{t("empty")}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {visible.map((r) => (
            <article
              key={r.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-[#0000BE]/20 transition-all"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-lg bg-[#0000BE]/10 px-2.5 py-1 text-sm font-bold text-[#0000BE]">
                    ★ {r.rating.toFixed(1)}
                  </span>
                  {r.sourceLabel &&
                    (r.sourceUrl ? (
                      <a
                        href={r.sourceUrl}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-[#0000BE] hover:bg-[#0000BE]/5 transition"
                      >
                        {r.sourceLabel}
                      </a>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                        {r.sourceLabel}
                      </span>
                    ))}
                </div>
                {r.publishedAt && (
                  <span className="whitespace-nowrap text-xs text-slate-400">
                    {format.dateTime(new Date(r.publishedAt), { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>

              <p className="text-sm leading-relaxed text-slate-700 md:text-[15px]">&ldquo;{r.quote}&rdquo;</p>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{r.author}</p>
                  {r.authorMeta && <p className="truncate text-xs text-slate-500">{r.authorMeta}</p>}
                </div>
                {r.isVerified && (
                  <span className="flex shrink-0 items-center rounded-full bg-[#0000BE]/10 px-2 py-1 text-[10px] font-bold text-[#0000BE]">
                    <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#0000BE]" />
                    {t("verified")}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Daha fazla */}
      {visible.length < filtered.length && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setLimit((l) => l + PAGE)}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-6 h-11 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            {t("loadMore")}
          </button>
          <p className="mt-3 text-xs text-slate-400">
            {t("showing", { count: visible.length, total: filtered.length })}
          </p>
        </div>
      )}
    </div>
  );
}
