import { getTranslations } from "next-intl/server";

// "KURYE OTOMASYONU" bölümü — gönderiyi şubeye götürmeden, istenen adresten alım.
// Tasarım dili diğer ana sayfa bölümleriyle aynı: eyebrow + h2 (mavi vurgu) + alt metin,
// ardından ikonlu özellik kartları ve CTA. İkonlar Phosphor (marketing layout'ta yüklü).
// Metinler çeviri kataloğunda: courier.*

type Feature = { title: string; desc: string };

// Kart ikonları — sıra courier.features dizisiyle eşleşir.
const ICONS = ["ph-map-pin-line", "ph-clock-user", "ph-lightning", "ph-eye"];

// Kart başına aksan rengi (ikon kutusu)
const TONES = [
  "bg-[#0000BE]/[0.07] text-[#0000BE]",
  "bg-[#4D4DF2]/[0.09] text-[#4D4DF2]",
  "bg-emerald-500/10 text-emerald-600",
  "bg-amber-500/10 text-amber-600",
];

export async function KuryeOtomasyonu() {
  const t = await getTranslations("courier");
  const features = t.raw("features") as Feature[];

  return (
    <section className="relative py-16 md:py-28 bg-slate-50/70 border-y border-slate-100 overflow-hidden cv-auto">
      {/* Ambient dekor — diğer bölümlerdeki dil ile aynı */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-28 -left-24 w-[460px] h-[460px] rounded-full bg-gradient-to-br from-indigo-200/35 via-blue-100/25 to-transparent blur-3xl" />
        <div className="absolute -bottom-28 -right-24 w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-emerald-200/30 via-teal-100/20 to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#4D4DF2] mb-3">
            {t("eyebrow")}
          </span>
          <h2 className="text-[34px] md:text-[44px] font-semibold tracking-tight text-slate-900 leading-[1.1]">
            {t("titleStart")} <span className="text-[#0000BE]">{t("titleHighlight")}</span>
          </h2>
          <p className="mt-4 text-base md:text-[17px] text-slate-500 leading-relaxed">
            {t("subtitle")}
          </p>
        </div>

        {/* Özellik kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {features.map((f, i) => (
            <article
              key={f.title}
              className="group h-full rounded-2xl border border-slate-200/80 ring-1 ring-slate-900/[0.02] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_10px_30px_-18px_rgba(15,23,42,0.18)] hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_44px_-20px_rgba(0,0,190,0.28)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <span
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${TONES[i % TONES.length]} mb-4`}
              >
                <i className={`ph-bold ${ICONS[i % ICONS.length]} text-[22px]`} aria-hidden="true" />
              </span>
              <h3 className="text-[16px] font-semibold text-slate-900 tracking-tight">{f.title}</h3>
              <p className="mt-2 text-[14px] text-slate-500 leading-relaxed">{f.desc}</p>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-10 md:mt-12">
          <a
            href="/panel/kurye-cagir"
            className="inline-flex items-center justify-center gap-2 px-6 h-11 md:h-12 bg-[#BFFF00] hover:bg-[#aee600] text-slate-900 text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap"
          >
            {t("ctaPrimary")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
          <a
            href="/nasil-calisir"
            className="inline-flex items-center justify-center px-6 h-11 md:h-12 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold rounded-lg transition-all whitespace-nowrap"
          >
            {t("ctaSecondary")}
          </a>
        </div>
      </div>
    </section>
  );
}
