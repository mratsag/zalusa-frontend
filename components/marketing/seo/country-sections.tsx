"use client";

import { useEffect, useState } from "react";

import type {
  AddressFormatData, DeliveryTimesData, RestrictionsData, TopCategoriesData, RelatedCountriesData, AddressLine,
} from "@/lib/marketing/country-sections";

// templates/sections/*.php portu. Sadece verisi olan ülkede (bugün BE) render edilir.
const API = process.env.NEXT_PUBLIC_API_URL;

// ---------- Adres formatı ----------
export function AddressFormat({ data }: { data: AddressFormatData }) {
  const codeBody = (body: string) =>
    body.split(/`([^`]+)`/).map((part, i) =>
      i % 2 === 1 ? (
        <code key={i} className="bg-white border border-amber-200/70 text-amber-800 px-1.5 py-0.5 rounded text-[12px] font-mono">{part}</code>
      ) : (
        <span key={i}>{part}</span>
      ),
    );

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Sol */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              {data.eyebrow && <span className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#4D4DF2] mb-3">{data.eyebrow}</span>}
              <h2 className="text-[34px] md:text-[44px] font-semibold tracking-tight text-slate-900 leading-[1.05]">{data.title}</h2>
              {data.subtitle && <p className="mt-1 text-[26px] md:text-[34px] tracking-tight italic font-serif text-slate-500 leading-[1.15]">{data.subtitle}</p>}
            </div>
            {data.description && <p className="text-[15px] md:text-[16px] leading-relaxed text-slate-600 max-w-2xl">{data.description}</p>}
            {data.postal_ranges && data.postal_ranges.length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white zal-shadow-soft overflow-hidden divide-y divide-slate-100">
                {data.postal_ranges.map((r, i) => (
                  <div key={i} className="grid grid-cols-[120px,1fr] md:grid-cols-[160px,1fr] items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                    <code className="text-[13px] font-semibold tracking-wide text-[#0000BE] font-mono">{r.range}</code>
                    <span className="text-[13.5px] md:text-[14px] text-slate-700">{r.note}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sağ */}
          <div className="lg:col-span-5 space-y-5">
            {data.example_address && (
              <div className="rounded-2xl border-2 border-dashed border-[#0000BE]/30 bg-[#F8FAFF] p-6 md:p-7 relative">
                <span className="absolute -top-3 left-5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#0000BE]/30 text-[10.5px] font-bold uppercase tracking-[0.16em] text-[#0000BE]">
                  <i className="ph-bold ph-envelope text-[11px]" /> Örnek adres
                </span>
                <div className="font-mono text-[14px] md:text-[15px] text-slate-900 leading-[1.9] pt-1 break-words">
                  {data.example_address.lines.map((line: AddressLine, i) =>
                    typeof line === "string" ? (
                      <div key={i}>{line}</div>
                    ) : (
                      <div key={i}><span className="bg-[#BFFF00] px-1.5 py-0.5 rounded font-semibold">{line.highlight}</span>{line.after}</div>
                    ),
                  )}
                </div>
              </div>
            )}
            {data.rules && data.rules.length > 0 && (
              <ol className="mt-6 space-y-2.5 text-[13.5px] text-slate-700 leading-snug">
                {data.rules.map((rule, i) => {
                  const idx = rule.indexOf("·");
                  const head = idx >= 0 ? rule.slice(0, idx).trim() : rule.trim();
                  const tail = idx >= 0 ? rule.slice(idx + 1).trim() : "";
                  return (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0000BE] text-white text-[10.5px] font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span><strong className="font-semibold text-slate-900">{head}</strong>{tail && <span className="text-slate-500"> · {tail}</span>}</span>
                    </li>
                  );
                })}
              </ol>
            )}
            {data.common_mistake && (
              <div className="rounded-2xl border border-amber-200/80 bg-amber-50/70 p-4 md:p-5 flex items-start gap-3">
                <i className="ph-fill ph-warning-circle text-[20px] text-amber-500 shrink-0 mt-0.5" />
                <div className="text-[13px] text-slate-700 leading-relaxed">
                  <strong className="font-semibold text-slate-900 block mb-1">{data.common_mistake.title}</strong>
                  {codeBody(data.common_mistake.body)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------- Teslim süreleri ----------
const badgePalette: Record<string, string> = {
  lime: "bg-[#BFFF00] text-slate-900",
  amber: "bg-amber-100 text-amber-800 border border-amber-200/70",
  emerald: "bg-emerald-100 text-emerald-800 border border-emerald-200/70",
  slate: "bg-slate-100 text-slate-700 border border-slate-200/70",
};
const servicePillPalette: Record<string, string> = {
  amber: "bg-amber-50 text-amber-700 border border-amber-200/60",
  lime: "bg-lime-50 text-lime-800 border border-lime-200/70",
  emerald: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  slate: "bg-slate-100 text-slate-700 border border-slate-200/70",
};
const pricePalette: Record<string, string> = { amber: "text-amber-600", emerald: "text-emerald-600", slate: "text-slate-500" };

export function DeliveryTimes({ data }: { data: DeliveryTimesData }) {
  return (
    <section className="py-16 md:py-24 bg-slate-50/60 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          {data.eyebrow && <span className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#4D4DF2] mb-3">{data.eyebrow}</span>}
          <h2 className="text-[34px] md:text-[44px] font-semibold tracking-tight text-slate-900 leading-[1.1]">
            {data.title_lhs}
            <span className="inline-block mx-1 text-slate-400 align-middle"><i className="ph-bold ph-arrow-right text-[26px]" /></span>
            {data.title_rhs} {data.title_suffix} <span className="italic font-serif text-[#0000BE] font-normal">{data.title_italic}</span>
          </h2>
          {data.subtitle && <p className="mt-3 text-[15px] md:text-[16px] text-slate-500 leading-relaxed">{data.subtitle}</p>}
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 zal-shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  <th className="px-5 py-4 md:px-6">Servis Tipi</th>
                  {data.columns.map((c, i) => <th key={i} className="px-5 py-4 md:px-6 whitespace-nowrap">{c}</th>)}
                  <th className="px-5 py-4 md:px-6 text-right">Fiyat farkı</th>
                </tr>
              </thead>
              <tbody className="text-[13.5px] md:text-[14px]">
                {data.rows.map((row, i) => {
                  const highlight = !!(row.badge && row.badge !== "");
                  const pill = servicePillPalette[row.badge_color || "slate"] || servicePillPalette.slate;
                  const badge = badgePalette[row.badge_color || "amber"] || badgePalette.amber;
                  const price = pricePalette[row.price_color || "slate"] || pricePalette.slate;
                  return (
                    <tr key={i} className={`border-t border-slate-100 ${highlight ? "bg-[#0000BE]/[0.025]" : ""} hover:bg-slate-50/50 transition-colors align-middle`}>
                      <td className="px-5 py-5 md:px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-semibold ${pill}`}>
                          {row.icon && <i className={`${row.icon} text-[12px]`} />} {row.service}
                        </span>
                        {row.tagline && <div className="text-[11.5px] text-slate-400 italic mt-1.5">{row.tagline}</div>}
                        {row.badge && <span className={`inline-block mt-1.5 px-1.5 py-0.5 rounded text-[9.5px] font-bold tracking-[0.14em] ${badge}`}>{row.badge}</span>}
                      </td>
                      {row.cells.map((cell, ci) => <td key={ci} className="px-5 py-5 md:px-6 font-semibold text-slate-900 whitespace-nowrap">{cell}</td>)}
                      <td className={`px-5 py-5 md:px-6 whitespace-nowrap text-right font-semibold ${price}`}>{row.price_diff}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {data.notes && data.notes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
            {data.notes.map((n, i) => (
              <div key={i} className="rounded-2xl bg-white border border-slate-200/80 zal-shadow-xs p-5 flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-[#0000BE] shrink-0">{n.icon && <i className={`${n.icon} text-[16px]`} />}</span>
                <div>
                  <div className="text-[13.5px] font-semibold text-slate-900">{n.title}</div>
                  <p className="text-[12.5px] text-slate-500 leading-relaxed mt-1">{n.body}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ---------- Kısıtlamalar ----------
const kindStyles: Record<string, { iconBg: string; iconText: string }> = {
  forbidden: { iconBg: "bg-rose-50 border-rose-200/70", iconText: "text-rose-500" },
  restricted: { iconBg: "bg-amber-50 border-amber-200/70", iconText: "text-amber-500" },
  allowed: { iconBg: "bg-emerald-50 border-emerald-200/70", iconText: "text-emerald-500" },
};

export function Restrictions({ data }: { data: RestrictionsData }) {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          {data.eyebrow && <span className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#4D4DF2] mb-3">{data.eyebrow}</span>}
          <h2 className="text-[34px] md:text-[44px] font-semibold tracking-tight text-slate-900 leading-[1.1]">{data.title}</h2>
          {data.subtitle && <p className="mt-3 text-[15px] md:text-[16px] text-slate-500 leading-relaxed max-w-2xl mx-auto">{data.subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {data.columns.map((col, i) => {
            const st = kindStyles[col.kind] || kindStyles.restricted;
            return (
              <article key={i} className="rounded-2xl bg-white border border-slate-200/80 zal-shadow-soft p-6 md:p-7">
                <span className={`inline-flex items-center justify-center w-11 h-11 rounded-xl border ${st.iconBg}`}>{col.icon && <i className={`${col.icon} text-[18px] ${st.iconText}`} />}</span>
                <h3 className="mt-5 text-[20px] md:text-[22px] font-semibold tracking-tight text-slate-900 font-serif italic">{col.title}</h3>
                {col.kicker && <p className="text-[12.5px] text-slate-400 italic mt-1">{col.kicker}</p>}
                <ul className="mt-5 space-y-2">
                  {col.items.map((it, j) => (
                    <li key={j} className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50/70 border border-slate-100 text-[13px] text-slate-700">
                      <span className="text-[14px] leading-none shrink-0" aria-hidden="true">{it.emoji}</span>
                      <span className="truncate">{it.label}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {data.cta_box && (
          <div className="mt-6 md:mt-8 rounded-2xl bg-slate-50 border border-slate-200/80 px-5 py-4 md:px-6 md:py-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[13.5px] md:text-[14px] text-slate-700 leading-relaxed">{data.cta_box.body}</div>
            <a href={data.cta_box.button_url} className="inline-flex items-center justify-center gap-2 w-full md:w-auto px-6 h-11 rounded-full bg-gradient-to-br from-[#4D4DF2] to-[#0000BE] hover:from-[#5959FF] hover:to-[#00009c] hover:-translate-y-0.5 text-white text-[13.5px] font-semibold zal-shadow-cta transition-all whitespace-nowrap md:shrink-0">
              {data.cta_box.button_label} <i className="ph-bold ph-arrow-right text-[13px]" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

// ---------- En çok gönderilen kategoriler ----------
export function TopCategories({ data }: { data: TopCategoriesData }) {
  return (
    <section className="py-16 md:py-24 bg-slate-50/60 border-y border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10 md:mb-14">
          {data.eyebrow && <span className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#4D4DF2] mb-3">{data.eyebrow}</span>}
          <h2 className="text-[34px] md:text-[44px] font-semibold tracking-tight text-slate-900 leading-[1.05]">
            {data.title_lhs}
            <span className="inline-block mx-1 text-slate-400 align-middle"><i className="ph-bold ph-arrow-right text-[26px]" /></span>
            {data.title_rhs} {data.title_main} <span className="italic font-serif text-[#0000BE] font-normal">{data.title_italic}</span>
          </h2>
          {data.subtitle && <p className="mt-3 text-[15px] md:text-[16px] text-slate-500 leading-relaxed max-w-2xl">{data.subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.cards.map((card, i) => {
            const barW = Math.max(6, Math.min(100, Math.round((card.percent / 30) * 100)));
            const showVat = !!card.vat && card.vat !== "—";
            const showHs = !!card.hs && card.hs !== "";
            return (
              <article key={i} className="rounded-2xl bg-white border border-slate-200/80 zal-shadow-soft zal-hover-card p-5 md:p-6 flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="text-[28px] md:text-[32px] font-semibold tracking-tight text-[#0000BE] font-serif italic leading-none">{card.percent}%</div>
                  <span className="text-[20px] leading-none" aria-hidden="true">{card.emoji}</span>
                </div>
                <div>
                  <h3 className="text-[15.5px] font-semibold tracking-tight text-slate-900 leading-snug">{card.name}</h3>
                  {card.desc && <p className="mt-1.5 text-[12.5px] text-slate-500 leading-relaxed">{card.desc}</p>}
                </div>
                {(showHs || showVat) && (
                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-3 text-[10.5px] font-bold uppercase tracking-[0.1em] text-slate-400">
                    {showHs && <span>HS: <span className="text-slate-700">{card.hs}</span></span>}
                    {showVat && (
                      <>
                        {showHs && <span className="text-slate-200">·</span>}
                        <span>KDV: <span className="text-slate-700">{card.vat}</span></span>
                      </>
                    )}
                  </div>
                )}
                {card.badges && card.badges.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 -mt-1">
                    {card.badges.map((b, j) => <span key={j} className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200 text-[10.5px] font-semibold text-slate-600">{b}</span>)}
                  </div>
                )}
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0000BE] via-[#4FC3F7] to-[#BFFF00] rounded-full" style={{ width: `${barW}%` }} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ---------- İlgili ülkeler ----------
function flagEmoji(iso2: string): string {
  const c = (iso2 || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(c)) return "🌐";
  return String.fromCodePoint(0x1f1e6 + (c.charCodeAt(0) - 65)) + String.fromCodePoint(0x1f1e6 + (c.charCodeAt(1) - 65));
}

type IdxCountry = { name: string; slug: string; iso2: string };

export function RelatedCountries({ data, currentIso2 }: { data: RelatedCountriesData; currentIso2: string }) {
  const [countries, setCountries] = useState<IdxCountry[]>([]);

  useEffect(() => {
    if (!API) return;
    const want = data.iso2_list.map((c) => c.toUpperCase()).filter((c) => c !== (currentIso2 || "").toUpperCase());
    fetch(`${API}/api/seo/index`)
      .then((r) => r.json())
      .then((d: { countries?: IdxCountry[] }) => {
        const all = d.countries ?? [];
        const byIso = new Map(all.map((c) => [(c.iso2 || "").toUpperCase(), c]));
        const ordered = want.map((iso) => byIso.get(iso)).filter((c): c is IdxCountry => !!c).slice(0, 6);
        setCountries(ordered);
      })
      .catch(() => setCountries([]));
  }, [data.iso2_list, currentIso2]);

  if (countries.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 md:mb-12">
          {data.eyebrow && <span className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#4D4DF2] mb-3">{data.eyebrow}</span>}
          <h2 className="text-[34px] md:text-[44px] font-semibold tracking-tight text-slate-900 leading-[1.05]">
            {data.title_lhs} <span className="italic font-serif text-slate-500 font-normal">{data.title_italic}</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {countries.map((c) => (
            <a key={c.slug} href={`/yurtdisi-kargo/${c.slug}`} className="group flex items-center gap-4 px-5 py-4 md:px-6 md:py-5 rounded-2xl bg-white border border-slate-200/80 zal-shadow-xs hover:border-[#0000BE]/30 hover:zal-shadow-soft transition-all">
              <span className="text-[26px] leading-none shrink-0" aria-hidden="true">{flagEmoji(c.iso2)}</span>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] md:text-[15.5px] font-semibold tracking-tight text-slate-900 truncate">{c.name}</div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0000BE] shrink-0 transition-transform group-hover:translate-x-1"><i className="ph-bold ph-arrow-right text-[14px]" /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
