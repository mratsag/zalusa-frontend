import { getTranslations } from "next-intl/server";

// homepage-v2.php "KİMLER İÇİN" (live 1818-1870) portu. 5 hedef kitle kartı.
// Kart etiketleri çeviri kataloğunda: audience.cards.*
const CARDS = [
  { key: "individual", icon: "ph-user", wrap: "bg-emerald-50 text-emerald-600 border-emerald-200/70", extra: "" },
  { key: "startups", icon: "ph-rocket-launch", wrap: "bg-orange-50 text-orange-600 border-orange-200/70", extra: "" },
  { key: "sme", icon: "ph-storefront", wrap: "bg-cyan-50 text-cyan-600 border-cyan-200/70", extra: "" },
  { key: "companies", icon: "ph-buildings", wrap: "bg-purple-50 text-purple-600 border-purple-200/70", extra: "" },
  { key: "enterprise", icon: "ph-globe-hemisphere-west", wrap: "bg-indigo-50 text-[#0000BE] border-indigo-200/70", extra: "col-span-2 sm:col-span-1" },
];

export async function KimlerIcin() {
  const t = await getTranslations("audience");

  return (
    <section className="py-16 md:py-28 bg-slate-50/60 border-y border-slate-200/60 overflow-hidden cv-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#4D4DF2] mb-3">
            {t("eyebrow")}
          </span>
          <h2 className="text-[32px] md:text-[44px] font-semibold tracking-tight text-slate-900 leading-[1.1]">
            {t("titleStart")} <span className="text-[#0000BE]">{t("titleHighlight")}</span>.
          </h2>
          <p className="mt-4 text-base md:text-[17px] text-slate-500 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
          {CARDS.map((c) => (
            <article
              key={c.key}
              className={`group bg-white rounded-2xl border border-slate-200/80 ring-1 ring-slate-900/[0.02] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.10)] p-5 md:p-6 text-center transition hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_40px_-18px_rgba(15,23,42,0.18)] ${c.extra}`}
            >
              <span className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl border mb-4 ${c.wrap}`}>
                <i className={`ph-fill ${c.icon} text-[28px]`} />
              </span>
              <h3 className="text-[15px] md:text-[16px] font-semibold text-slate-900">{t(`cards.${c.key}`)}</h3>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
