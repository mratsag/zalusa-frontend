/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

// PHP includes/footer.php portu:
// - "Güvenilir platformlarda değerlendirildik" + "Bugüne Kadar Biz" bandı
// - 4 sütun link + logo/newsletter + alt bar (sosyal + dil)
// Not: newsletter/dil butonları şimdilik statik UI; countdown/mobil-menü JS'i
// React tarafında (SiteHeader) ele alındığı için portlanmadı.

const TRUST: { svg: ReactNode; score: string; max: string; is100?: boolean }[] = [
  {
    svg: (
      <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <circle cx="11" cy="11" r="5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 16l5 5" />
      </svg>
    ),
    score: "4,9",
    max: "/ 5",
  },
  {
    svg: (
      <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5-3.5 9-7 11-3.5-2-7-6-7-11V7l7-4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
      </svg>
    ),
    score: "100",
    max: "/ 100",
    is100: true,
  },
  {
    svg: (
      <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <circle cx="12" cy="8" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l-2 7 5-3 5 3-2-7" />
      </svg>
    ),
    score: "4,7",
    max: "/ 5",
  },
  {
    svg: (
      <svg className="w-6 h-6 lg:w-7 lg:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 19h18" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 19V9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 19v-7" />
      </svg>
    ),
    score: "4,8",
    max: "/ 5",
  },
];

// text yerine çeviri anahtarı (footer.stats.*)
const STATS: { iconClass: string; svg: ReactNode; key: "shipments" | "businesses" | "countries" }[] = [
  {
    iconClass: "stat-icon-blue",
    svg: <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />,
    key: "shipments",
  },
  {
    iconClass: "stat-icon-green",
    svg: <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
    key: "businesses",
  },
  {
    iconClass: "stat-icon-amber",
    svg: <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0h.5a2.5 2.5 0 002.5-2.5V3.935M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    key: "countries",
  },
];

// labelKey = footer.links.* çeviri anahtarı; label = çevrilmeyen sabit (marka adları).
// NOT: blog başlıkları bilerek Türkçe bırakıldı — hedef yazılar Türkçe (bloglar Faz 3'te
// DB üzerinden çevrilecek); başlığı çevirip Türkçe içeriğe yönlendirmek yanıltıcı olurdu.
type FooterLink = { href: string; label?: string; labelKey?: string };
const COLUMNS: { titleKey: string; links: FooterLink[] }[] = [
  {
    titleKey: "company",
    links: [
      { href: "/hakkimizda", labelKey: "about" },
      { href: "/kariyer", labelKey: "careers" },
      { href: "/neden-zalusa", labelKey: "why" },
      { href: "/is-ortaklarimiz", labelKey: "partners" },
      { href: "/anlasmali-kargolar", labelKey: "carriers" },
      { href: "/blog", labelKey: "blog" },
      { href: "/sss", labelKey: "faq" },
    ],
  },
  {
    titleKey: "integrations",
    links: [
      { href: "/entegrasyonlar#pazaryerleri", label: "Etsy" },
      { href: "/entegrasyonlar#e-ticaret", label: "Shopify" },
      { href: "/entegrasyonlar#e-ticaret", label: "WOO Commerce" },
      { href: "/entegrasyonlar#pazaryerleri", label: "Amazon" },
      { href: "/entegrasyonlar#pazaryerleri", label: "Wish" },
      { href: "/entegrasyonlar#muhasebe", label: "Paraşüt" },
      { href: "/entegrasyonlar#pazaryerleri", label: "AliExpress" },
      { href: "/entegrasyonlar#muhasebe", label: "Logo Yazılım" },
    ],
  },
  {
    titleKey: "legal",
    links: [
      { href: "/kullanim-sozlesmesi", labelKey: "terms" },
      { href: "/iptal-ve-iadeler", labelKey: "returns" },
      { href: "/cerez-politikasi", labelKey: "cookies" },
      { href: "/gizlilik-politikasi", labelKey: "privacy" },
      { href: "/kvkk-aydinlatma-metni", labelKey: "kvkk" },
    ],
  },
  {
    titleKey: "topBlogs",
    links: [
      { href: "/blog/e-ihracat-bilinmesi-gereken-tarihler-guncel-takvim", label: "E-İhracat Bilinmesi Gereken Tarihler (2026 Güncel Takvim)" },
      { href: "/blog/dropshipping-nedir-ve-nasil-yapilir-ultimate-rehber", label: "Dropshipping Nedir ve Nasıl Yapılır? (2026 Ultimate Rehber)" },
      { href: "/blog/lucid-kaydi-nedir-almanya-ambalaj-yasasi-rehberi-guncel", label: "LUCID Kaydı Nedir? Almanya Ambalaj Yasası Rehberi (2026 Güncel)" },
    ],
  },
];

const SOCIAL: { href: string; label: string; path: string }[] = [
  { href: "https://www.instagram.com/zalusacom", label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" },
  { href: "https://x.com/zalusacom", label: "Twitter", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" },
  { href: "https://www.linkedin.com/company/zalusa/", label: "LinkedIn", path: "M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" },
  { href: "https://www.youtube.com/@zalusa", label: "YouTube", path: "M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.263-4.356 2.698-4.381 4.802 0 .011 0 .022 0 .033v6.398c0 .011 0 .022 0 .033.025 2.105.484 4.54 4.381 4.802 3.6.245 11.626.246 15.23 0 3.897-.263 4.356-2.697 4.381-4.802 0-.011 0-.022 0-.033v-6.398c0-.011 0-.022 0-.033-.025-2.104-.484-4.539-4.381-4.802zm-10.615 12.816v-8l8 4-8 4z" },
];

export async function SiteFooter() {
  const t = await getTranslations("footer");

  return (
    <>
      {/* Güven + istatistik bandı */}
      <section className="py-10 md:py-14 bg-gradient-to-b from-slate-50 to-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            <div>
              <p className="footer-section-title text-center lg:text-left text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                {t("trustTitle")}
              </p>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-3">
                {TRUST.map((t, i) => (
                  <div key={i} className={`trust-card${t.is100 ? " trust-card-100" : ""}`}>
                    <span className="trust-card-icon trust-logo-color trust-icon-purple">{t.svg}</span>
                    <span className={`trust-score-wrap${t.is100 ? " trust-score-full-wrap" : ""}`}>
                      <span className={`trust-card-score ${t.is100 ? "trust-score-full" : "trust-score-high"}`}>{t.score}</span>
                      <span className="trust-card-max">{t.max}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:text-right">
              <p className="footer-section-title text-center lg:text-right text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
                {t("statsTitle")}
              </p>
              <div className="stat-frame flex flex-row flex-wrap lg:flex-nowrap items-center justify-center lg:justify-end gap-2 sm:gap-4 lg:gap-3 text-center sm:text-left lg:items-center">
                {STATS.map((s) => (
                  <div key={s.key} className="flex items-center gap-2 lg:gap-2.5 stat-item">
                    <span className={`stat-icon ${s.iconClass}`}>
                      <svg className="stat-icon-svg" fill="none" stroke="currentColor" strokeWidth="2.25" viewBox="0 0 24 24">
                        {s.svg}
                      </svg>
                    </span>
                    <span className="stat-text">{t(`stats.${s.key}`)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ana footer */}
      <footer className="bg-white pt-12 md:pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16 border-b border-gray-100 pb-16">
            {COLUMNS.map((col) => (
              <div key={col.titleKey}>
                <p className="font-bold text-[#0A0F29] text-lg mb-6">{t(`columns.${col.titleKey}`)}</p>
                <ul className="space-y-3">
                  {col.links.map((l, i) => (
                    <li key={`${l.href}-${i}`}>
                      <a href={l.href} className="text-slate-600 hover:text-[#0000BE] transition text-sm">
                        {l.labelKey ? t(`links.${l.labelKey}`) : l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
            <div className="max-w-md">
              <a href="/" className="site-logo-link flex items-center gap-2 text-[#0000BE] hover:opacity-90 transition mb-4" title={t("homeTitle")}>
                <img src="/assets/logo-ikon.png" alt="Zalusa Logo İkonu" title="Zalusa Logo İkonu" className="site-logo-icon flex-shrink-0 w-8 h-8 rounded-lg object-contain" width={48} height={48} />
                <span className="text-3xl font-bold tracking-tighter font-montserrat">Zalusa</span>
              </a>
              <p className="text-slate-600 font-medium text-lg leading-snug">
                {t("tagline")}
              </p>
            </div>
            <div className="w-full md:w-auto">
              <p className="font-bold text-[#0A0F29] text-lg mb-3">{t("newsletterTitle")}</p>
              <p className="text-slate-500 text-sm mb-4 max-w-sm">
                {t("newsletterText")}
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className="flex-1 min-w-[240px] px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button className="px-6 py-3 bg-[#0000BE] text-white font-bold text-sm rounded-lg hover:bg-[#00009c] transition">
                  {t("subscribe")}
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-xs text-slate-500 leading-relaxed text-center md:text-left">
              <p className="font-bold text-slate-700">© 2026 Zalusa Lojistik ve Teknoloji Anonim Şirketi.</p>
              <p>{t("rights")}</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="flex space-x-5 text-slate-800">
                {SOCIAL.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-[#0000BE] transition" aria-label={s.label}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
