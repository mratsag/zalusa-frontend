/* eslint-disable @next/next/no-img-element */
// homepage-v2.php "Hava, Kara, Deniz — Tek Panel" multi-modal showcase
// (live 2057-2315) portu. 4 servis kartı (Cargo/Truck/Fly/Ship).
// Kart illüstrasyonları statik SVG (public/assets/home/mode-*.svg).
// Arbitrary renk class'ları Tailwind purge için tam literal yazıldı.

type Mode = {
  title: string;
  subtitle: string;
  subtitleColor: string;
  icon: string;
  iconWrap: string;
  desc: string;
  cardHover: string;
  modeColor: string;
  glowBg: string;
  imgBoxBg: string;
  img: string;
  imgClass: string;
  underlineVia: string;
  tags: string[];
};

const MODES: Mode[] = [
  {
    title: "Zalusa-Cargo",
    subtitle: "Parsiyel & Kargo",
    subtitleColor: "text-[#3B82F6]",
    icon: "ph-package",
    iconWrap: "bg-[#3B82F6] text-white shadow-[0_8px_24px_-8px_rgba(59,130,246,0.7)]",
    desc: "Hızlı teklif, otomatik etiket ve canlı takip ile kargo süreçlerini sadeleştirin.",
    cardHover: "hover:border-[#3B82F6]/40 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_40px_-18px_rgba(59,130,246,0.18)]",
    modeColor: "#3B82F6",
    glowBg: "radial-gradient(circle at 50% 0%, rgba(59,130,246,0.08), transparent 60%)",
    imgBoxBg: "bg-[#F8FAFF]",
    img: "/assets/home/mode-cargo.svg",
    imgClass: "max-w-[210px] drop-shadow-[0_6px_20px_rgba(59,130,246,0.18)]",
    underlineVia: "via-[#3B82F6]",
    tags: ["SLA", "Canlı takip", "Otomatik etiket"],
  },
  {
    title: "Zalusa-Truck",
    subtitle: "Karayolu & Dağıtım",
    subtitleColor: "text-[#A855F7]",
    icon: "ph-truck",
    iconWrap: "bg-[#A855F7] text-white shadow-[0_8px_24px_-8px_rgba(168,85,247,0.7)]",
    desc: "Rota planlama, sürücü atama ve teslimat kanıtı (POD) ile saha operasyonlarını uçtan uca yönetin.",
    cardHover: "hover:border-[#A855F7]/40 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_40px_-18px_rgba(168,85,247,0.18)]",
    modeColor: "#A855F7",
    glowBg: "radial-gradient(circle at 50% 0%, rgba(168,85,247,0.08), transparent 60%)",
    imgBoxBg: "bg-[#FBF7FF]",
    img: "/assets/home/mode-truck.svg",
    imgClass: "max-w-[210px] drop-shadow-[0_6px_20px_rgba(168,85,247,0.18)]",
    underlineVia: "via-[#A855F7]",
    tags: ["Rota", "POD", "Optimizasyon"],
  },
  {
    title: "Zalusa-Fly",
    subtitle: "Havayolu & Express",
    subtitleColor: "text-[#0891B2]",
    icon: "ph-airplane-tilt",
    iconWrap: "bg-[#22D3EE] text-slate-900 shadow-[0_8px_24px_-8px_rgba(34,211,238,0.7)]",
    desc: "Kritik ve süreye duyarlı gönderiler için transit görünürlük ve anlık gecikme uyarıları.",
    cardHover: "hover:border-[#22D3EE]/40 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_40px_-18px_rgba(34,211,238,0.18)]",
    modeColor: "#22D3EE",
    glowBg: "radial-gradient(circle at 50% 0%, rgba(34,211,238,0.08), transparent 60%)",
    imgBoxBg: "bg-[#F0FBFF]",
    img: "/assets/home/mode-fly.svg",
    imgClass: "max-w-[200px] drop-shadow-[0_6px_20px_rgba(34,211,238,0.22)]",
    underlineVia: "via-[#22D3EE]",
    tags: ["Express", "Alarm", "Hız"],
  },
  {
    title: "Zalusa-Ship",
    subtitle: "Denizyolu & Konteyner",
    subtitleColor: "text-[#059669]",
    icon: "ph-boat",
    iconWrap: "bg-[#10B981] text-white shadow-[0_8px_24px_-8px_rgba(16,185,129,0.7)]",
    desc: "Konteyner planlama, ETA takibi ve doküman süreçlerinin merkezi yönetimi.",
    cardHover: "hover:border-[#10B981]/40 hover:shadow-[0_2px_4px_rgba(15,23,42,0.05),0_18px_40px_-18px_rgba(16,185,129,0.18)]",
    modeColor: "#10B981",
    glowBg: "radial-gradient(circle at 50% 0%, rgba(16,185,129,0.08), transparent 60%)",
    imgBoxBg: "bg-[#F0FDF7]",
    img: "/assets/home/mode-ship.svg",
    imgClass: "max-w-[210px] drop-shadow-[0_6px_20px_rgba(16,185,129,0.18)]",
    underlineVia: "via-[#10B981]",
    tags: ["ETA", "Doküman", "Takip"],
  },
];

export function TasimaModlari() {
  return (
    <section className="relative py-20 md:py-28 bg-white text-slate-900 overflow-hidden border-y border-slate-100 cv-auto">
      {/* Ambient accents */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-[radial-gradient(ellipse_at_top,rgba(77,77,242,0.04),transparent_60%)]" />
        <div className="absolute -bottom-32 -left-32 w-[360px] h-[360px] rounded-full bg-cyan-50/40 blur-3xl" />
        <div className="absolute -top-20 -right-32 w-[360px] h-[360px] rounded-full bg-indigo-50/40 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-[12px] font-semibold shadow-sm">
            <i className="ph-fill ph-stack text-[14px] text-[#4D4DF2]" />
            Her İhtiyaca Uygun Taşımacılık
          </span>
          <h2 className="mt-6 text-[36px] sm:text-5xl md:text-[60px] font-semibold tracking-tight leading-[1.05] text-slate-900">
            <span className="text-[#0891B2]">Hava</span>
            <span className="text-slate-300">,</span> <span className="text-[#7C3AED]">Kara</span>
            <span className="text-slate-300">,</span> <span className="text-[#059669]">Deniz</span>
            <span className="block mt-1 md:inline md:mt-0 text-slate-800"> — Tek Panel.</span>
          </h2>
          <p className="mt-5 text-[16px] md:text-[18px] text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Tüm taşıma modlarını tek panelden yönetin. Parsiyel, konteyner, express — hangi mod olursa
            olsun, operasyon sıfır.
          </p>
        </div>

        {/* Cards */}
        <div className="flex items-stretch overflow-x-auto overflow-y-visible snap-x snap-mandatory scrollbar-hide gap-4 md:gap-5 pt-1 pb-3 lg:grid lg:grid-cols-4 lg:overflow-x-visible lg:snap-none">
          {MODES.map((m) => (
            <article
              key={m.title}
              className={`zal-mode-card group relative min-w-[88%] sm:min-w-[340px] lg:min-w-0 snap-center lg:snap-start rounded-3xl bg-white border border-slate-200/80 ring-1 ring-slate-900/[0.02] p-5 md:p-6 flex flex-col gap-4 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.10)] hover:-translate-y-1.5 transition-all duration-300 ${m.cardHover}`}
              style={{ ["--mode-color" as string]: m.modeColor }}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: m.glowBg }}
              />
              <header className="relative flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-[22px] font-semibold tracking-tight text-slate-900">{m.title}</h3>
                  <p className={`mt-1 text-[10.5px] font-bold uppercase tracking-[0.14em] ${m.subtitleColor}`}>{m.subtitle}</p>
                </div>
                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl transition-transform group-hover:rotate-6 group-hover:scale-105 ${m.iconWrap}`}>
                  <i className={`ph-fill ${m.icon} text-[16px]`} />
                </span>
              </header>

              <p className="relative text-[13.5px] text-slate-500 leading-relaxed min-h-[60px]">{m.desc}</p>

              <div className={`relative aspect-[4/3] rounded-2xl overflow-hidden border border-slate-200/80 flex items-center justify-center p-5 ${m.imgBoxBg}`}>
                <img src={m.img} alt="" aria-hidden="true" className={`w-full h-full ${m.imgClass}`} />
                <div aria-hidden="true" className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-[70%] bg-gradient-to-r from-transparent ${m.underlineVia} to-transparent opacity-80`} />
              </div>

              <div className="relative flex flex-wrap items-center gap-1.5 pt-1">
                {m.tags.map((t) => (
                  <span key={t} className="text-[10.5px] font-medium text-slate-600 bg-slate-50 border border-slate-200/80 rounded-full px-2.5 py-1">
                    {t}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>

        {/* CTAs */}
        <div className="mt-10 md:mt-12 flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <a
              href="/giris"
              className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 h-12 rounded-lg bg-[#BFFF00] hover:bg-[#aee600] text-slate-900 text-[14px] font-semibold shadow-sm transition-all"
            >
              Ücretsiz Teklif Al
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="/yurtdisi-kargo-fiyat-hesaplama"
              className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-7 h-12 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-[14px] font-semibold shadow-sm transition-all"
            >
              Fiyat Hesapla
            </a>
          </div>
          <p className="inline-flex items-center gap-2 text-[12.5px] text-slate-400">
            <i className="ph-fill ph-check-circle text-emerald-500 text-[14px]" />
            Tek platform, tüm taşıma modları, tam görünürlük.
          </p>
        </div>
      </div>
    </section>
  );
}
