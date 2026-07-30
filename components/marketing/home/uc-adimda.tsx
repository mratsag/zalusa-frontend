/* eslint-disable @next/next/no-img-element */
import { getTranslations } from "next-intl/server";

// homepage-v2.php "3 ADIMDA KOLAY GÖNDERİ" (live 1524-1817) portu.
// Büyük adım illüstrasyonları statik SVG dosyaları (public/assets/home/stepN.svg).
// Metinler çeviri kataloğunda: howItWorks.* (adım 2 başlığı <ai> etiketiyle zengin metin).

type Step = { n: string; key: "s1" | "s2" | "s3"; bg: string; shadow: string; img: string };

const STEPS: Step[] = [
  {
    n: "1",
    key: "s1",
    bg: "from-[#F0F4FF] via-[#F8F9FF] to-white",
    shadow: "drop-shadow-[0_8px_24px_rgba(0,0,190,0.15)]",
    img: "/assets/home/step1.svg",
  },
  {
    n: "2",
    key: "s2",
    bg: "from-[#F0F1FF] via-[#F8F8FF] to-white",
    shadow: "drop-shadow-[0_8px_24px_rgba(124,124,227,0.2)]",
    img: "/assets/home/step2.svg",
  },
  {
    n: "3",
    key: "s3",
    bg: "from-[#ECFDF5] via-[#F0FAF5] to-white",
    shadow: "drop-shadow-[0_8px_24px_rgba(16,185,129,0.18)]",
    img: "/assets/home/step3.svg",
  },
];

const PRICING_ROWS = ["setup", "integration", "hidden"] as const;

export async function UcAdimda() {
  const t = await getTranslations("howItWorks");

  return (
    <section className="py-16 md:py-28 bg-white overflow-hidden cv-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#4D4DF2] mb-3">
            {t("eyebrow")}
          </span>
          <h2 className="text-[34px] md:text-[44px] font-semibold tracking-tight text-slate-900 leading-[1.1]">
            <span className="text-[#0000BE]">{t("titleHighlight")}</span> {t("titleRest")}
          </h2>
          <p className="mt-4 text-base md:text-[17px] text-slate-500 leading-relaxed">
            {t.rich("subtitle", {
              b: (chunks) => <span className="font-semibold text-slate-700">{chunks}</span>,
            })}
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {/* Connector line (desktop) */}
          <div
            aria-hidden="true"
            className="hidden md:block absolute top-[260px] left-[16.66%] right-[16.66%] h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"
          />
          {STEPS.map((s) => (
            <article
              key={s.n}
              className="group relative bg-white rounded-2xl border border-slate-200/80 ring-1 ring-slate-900/[0.02] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.10)] p-6 md:p-7 transition hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_40px_-18px_rgba(15,23,42,0.18)]"
            >
              <div
                className={`relative h-[260px] md:h-[280px] -mx-6 md:-mx-7 -mt-6 md:-mt-7 mb-5 rounded-t-2xl overflow-hidden bg-gradient-to-br ${s.bg} flex items-center justify-center p-6`}
              >
                <img src={s.img} alt="" aria-hidden="true" className={`w-full max-w-[280px] h-auto ${s.shadow}`} />
              </div>
              <div className="flex items-center gap-3 mb-1">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#0000BE] text-white text-[22px] font-extrabold shadow-[0_6px_16px_-4px_rgba(0,0,190,0.45)] ring-4 ring-[#0000BE]/10">
                  {s.n}
                </span>
                <h3 className="text-[19px] font-semibold tracking-tight text-slate-900">
                  {t.rich(`steps.${s.key}`, {
                    ai: (chunks) => (
                      <span className="bg-gradient-to-r from-[#4D4DF2] to-[#0000BE] bg-clip-text text-transparent">
                        {chunks}
                      </span>
                    ),
                  })}
                </h3>
              </div>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 mt-12 md:mt-14">
          <a
            href="/giris"
            className="inline-flex items-center justify-center gap-2 px-6 h-11 md:h-12 bg-[#BFFF00] hover:bg-[#aee600] text-slate-900 text-sm font-semibold rounded-lg shadow-sm cursor-pointer transition-all whitespace-nowrap"
          >
            {t("cta")}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>

        {/* Şeffaf Fiyatlandırma bannerı */}
        <div className="mt-14 md:mt-20">
          <div className="relative rounded-3xl bg-gradient-to-br from-[#0000BE] via-[#1414C8] to-[#0000BE] p-8 md:p-14 overflow-hidden shadow-[0_20px_60px_-20px_rgba(0,0,190,0.4)]">
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none opacity-[0.07]"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
                backgroundSize: "24px 24px",
              }}
            />
            <div aria-hidden="true" className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
            <div aria-hidden="true" className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-[#BFFF00]/10 blur-3xl" />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-7">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/90 text-[11px] font-semibold uppercase tracking-[0.16em] mb-5">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t("pricing.badge")}
                </span>
                <h2 className="text-[34px] sm:text-[42px] md:text-[48px] font-bold tracking-tight leading-[1.05] text-white">
                  {t("pricing.titleLine1")}
                  <span className="block">
                    <span className="bg-gradient-to-r from-[#BFFF00] to-[#A8E600] bg-clip-text text-transparent">
                      {t("pricing.titleLine2")}
                    </span>
                  </span>
                </h2>
                <p className="mt-5 text-[16px] md:text-[17px] text-white/70 leading-relaxed max-w-xl">
                  {t("pricing.text")}
                </p>
              </div>
              <div className="lg:col-span-5 grid grid-cols-1 gap-3">
                {PRICING_ROWS.map((rowKey) => (
                  <div
                    key={rowKey}
                    className="flex items-center justify-between gap-3 px-4 md:px-5 py-3.5 rounded-xl bg-white/[0.08] border border-white/10 backdrop-blur-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-[#BFFF00] text-slate-900">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-white font-semibold text-[16px] md:text-[18px] leading-tight">
                        {t(`pricing.rows.${rowKey}`)}
                      </span>
                    </div>
                    <span className="shrink-0 text-[#BFFF00] font-black text-[30px] md:text-[36px] uppercase tracking-tight leading-none">
                      {t("pricing.none")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
