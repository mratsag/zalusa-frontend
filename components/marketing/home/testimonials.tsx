import { getTranslations } from "next-intl/server";
// homepage-v2.php TESTIMONIALS (live 2317-2395) portu. 3 yorum kartı.
type Testimonial = {
  quote: string;
  name: string;
  roleKey: "r1" | "r2" | "r3";
  initials: string;
  avatarBg: string; // gradient + text color class
  featured?: boolean;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Canlı takip, bildirimler ve tek panel yönetimi sayesinde operasyon ekibinin yükü ciddi azaldı. Artık sadece işimize odaklanıyoruz.",
    name: "Ahmet K.",
    roleKey: "r1",
    initials: "AK",
    avatarBg: "from-blue-100 to-indigo-100 text-[#0000BE]",
  },
  {
    quote:
      "ETGB tarafı bizi çok rahatlattı. Evrak süreçleri daha düzenli, destek ekibi hızlı ve net. Tavsiye ederim.",
    name: "Zeynep S.",
    roleKey: "r2",
    initials: "ZS",
    avatarBg: "from-pink-100 to-rose-100 text-rose-700",
    featured: true,
  },
  {
    quote:
      "Tek panelden teklifleri görüyoruz, en mantıklı rotayı seçiyoruz. Takip ekranı sayesinde müşteriye anında bilgi geçiyoruz.",
    name: "Emre S.",
    roleKey: "r3",
    initials: "ES",
    avatarBg: "from-emerald-100 to-teal-100 text-emerald-700",
  },
];

function Star() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function QuoteMark({ className }: { className: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z" />
    </svg>
  );
}

export async function Testimonials() {
  const t = await getTranslations("testimonials");

  return (
    <section className="py-16 md:py-24 bg-slate-50/60 border-y border-slate-200/40 cv-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <span className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#4D4DF2] mb-3">
            {t("eyebrow")}
          </span>
          <h2 className="text-[32px] md:text-[44px] font-semibold tracking-tight text-slate-900 leading-[1.1]">
            {t("titleStart")} <span className="text-[#0000BE]">{t("titleHighlight")}</span>.
          </h2>
          <div className="mt-5 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
            <span className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} />
              ))}
            </span>
            <span className="text-[13px] font-semibold text-slate-900">4.9/5</span>
            <span className="text-slate-300">·</span>
            <span className="text-[13px] text-slate-600">{t("reviews")}</span>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className={
                item.featured
                  ? "group bg-white rounded-2xl p-6 md:p-7 border border-[#0000BE]/20 ring-1 ring-[#0000BE]/5 shadow-[0_8px_24px_-12px_rgba(0,0,190,0.20)] hover:shadow-[0_14px_36px_-12px_rgba(0,0,190,0.30)] hover:-translate-y-0.5 transition-all duration-300"
                  : "group bg-white rounded-2xl p-6 md:p-7 border border-slate-200/80 shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_12px_30px_-12px_rgba(15,23,42,0.15)] hover:-translate-y-0.5 transition-all duration-300"
              }
            >
              <QuoteMark className={`w-7 h-7 mb-4 ${item.featured ? "text-[#0000BE]/30" : "text-[#0000BE]/15"}`} />
              <blockquote
                className={`text-[15px] md:text-[15.5px] leading-relaxed mb-6 ${
                  item.featured ? "text-slate-800 font-medium" : "text-slate-700"
                }`}
              >
                {item.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center font-semibold text-[14px] ${item.avatarBg}`}>
                  {item.initials}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-[14px] leading-tight">{item.name}</p>
                  <p className="text-[12.5px] text-slate-500 mt-0.5">{t(`roles.${item.roleKey}`)}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-10 md:mt-12">
          <a
            href="/yorumlar"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#0000BE] hover:text-[#00009c] transition group"
          >
            {t("viewAll")}
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
