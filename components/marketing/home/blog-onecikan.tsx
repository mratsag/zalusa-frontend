/* eslint-disable @next/next/no-img-element */
import { getTranslations } from "next-intl/server";
// homepage-v2.php BLOG bölümü (live 2398-2513) portu.
// Canlıda DB'den son 3 yayınlanmış yazı gelir; cutover'da Go backend'e bağlanacak.
// Şimdilik canlıdaki 3 yazı statik data olarak (pixel-perfect referans).

export type BlogPost = {
  slug: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
};

const POSTS: BlogPost[] = [
  {
    slug: "e-ihracat-bilinmesi-gereken-tarihler-guncel-takvim",
    title: "E-İhracat Bilinmesi Gereken Tarihler (2026 Güncel Takvim)",
    category: "E-İhracat",
    date: "24 Feb 2026",
    image: "/assets/blog/blog-7-1771947261.png",
    excerpt:
      "E-ihracat yapan işletmeler için kritik tarihler; vergi beyannameleri, devlet destek başvuruları,...",
  },
  {
    slug: "dropshipping-nedir-ve-nasil-yapilir-ultimate-rehber",
    title: "Dropshipping Nedir ve Nasıl Yapılır? (2026 Ultimate Rehber)",
    category: "E-ticaret",
    date: "24 Feb 2026",
    image: "/assets/blog/blog-6-1776981999.png",
    excerpt: "Dropshipping, stok tutmadan ürün satışı yapılan bir e-ticaret modelidir.",
  },
  {
    slug: "lucid-kaydi-nedir-almanya-ambalaj-yasasi-rehberi-guncel",
    title: "LUCID Kaydı Nedir? Almanya Ambalaj Yasası Rehberi (2026 Güncel)",
    category: "Dış Ticaret",
    date: "24 Feb 2026",
    image: "/assets/blog/blog-5-1776980837.png",
    excerpt:
      "LUCID kaydı, Almanya’da ambalaj atıklarını yönetme ve geri dönüşüm süreçlerini düzenleyen resmi b...",
  },
];

function ArrowRight({ className }: { className: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

export async function BlogOneCikan() {
  const t = await getTranslations("blogSection");

  return (
    <section className="py-16 md:py-24 bg-white cv-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 md:mb-14">
          <div className="max-w-2xl">
            <span className="inline-block text-[12px] font-semibold uppercase tracking-[0.18em] text-[#4D4DF2] mb-3">
              Kaynaklar
            </span>
            <h2 className="text-[32px] md:text-[44px] font-semibold tracking-tight text-slate-900 leading-[1.1]">
              {t("titleStart")} <span className="text-[#0000BE]">{t("titleHighlight")}</span>.
            </h2>
            <p className="mt-4 text-[15px] md:text-[16px] text-slate-500 leading-relaxed">
              {t("subtitle")}
            </p>
          </div>
          <a
            href="/blog"
            className="hidden md:inline-flex items-center gap-2 text-[14px] font-semibold text-[#0000BE] hover:text-[#00009c] transition group shrink-0"
          >
            {t("allPosts")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </a>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 mb-10">
          {POSTS.map((p) => (
            <a
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_14px_36px_-12px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-300"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                <img
                  loading="lazy"
                  decoding="async"
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                />
              </div>
              <div className="flex flex-col flex-1 p-5 md:p-6">
                <div className="flex items-center gap-2 text-[11.5px] mb-3">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-[#EEF0FF] text-[#0000BE] font-semibold uppercase tracking-wider">
                    {p.category}
                  </span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500">{p.date}</span>
                </div>
                <h3 className="text-[17px] md:text-[18px] font-semibold tracking-tight text-slate-900 leading-snug mb-2 line-clamp-2 group-hover:text-[#0000BE] transition-colors">
                  {p.title}
                </h3>
                <p className="text-[14px] text-slate-500 leading-relaxed line-clamp-2 mb-4">{p.excerpt}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0000BE]">
                  {t("readPost")}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </span>
              </div>
            </a>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="text-center md:hidden">
          <a
            href="/blog"
            className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#0000BE] hover:text-[#00009c] transition group"
          >
            {t("allBlogPosts")}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition" />
          </a>
        </div>
      </div>
    </section>
  );
}
