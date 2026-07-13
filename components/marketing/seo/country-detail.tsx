"use client";

import { useMemo, useState } from "react";

import { QuickCalculatorForm } from "@/components/marketing/quick-calculator";
import type { SeoPayload, SeoStory, SeoFaq } from "@/lib/marketing/seo";
import { getCountrySections } from "@/lib/marketing/country-sections";
import { AddressFormat, DeliveryTimes, Restrictions, TopCategories, RelatedCountries } from "@/components/marketing/seo/country-sections";

// templates/country-detail.php portu — ülke / şehir / TR il / TR ilçe (tek şablon, PHP gibi).
// Bölümler: hero (+hesaplayıcı), şehir/ilçe grid, hikayeler, SSS, SEO içerik, CTA'lar, destek.

const CARRIERS = ["dhl", "fedex", "ups", "tnt", "gls"];

function priceSentence(name: string, min: number | null, max: number | null, cur: string): string | null {
  if (min == null && max == null) return null;
  const c = cur || "₺";
  if (min != null && max != null) return `${name} kargo fiyatları ${min}–${max} ${c} aralığında başlar.`;
  if (min != null) return `${name} kargo fiyatları ${min} ${c}'den başlar.`;
  return `${name} kargo fiyatları ${max} ${c}'e kadar.`;
}

function fallbackStories(name: string): SeoStory[] {
  return [
    { id: -1, author_name: "Mehmet Y.", author_role: "E-ticaret Satıcısı", rating: 5, content: `${name} gönderilerimi Zalusa ile yönetiyorum, fiyatlar çok uygun ve teslimat hızlı.`, date_label: "2 hafta önce", is_verified: true },
    { id: -2, author_name: "Ayşe K.", author_role: "Butik Sahibi", rating: 5, content: `${name}'ya düzenli kargo gönderiyorum. Tek panelden takip harika.`, date_label: "1 ay önce", is_verified: true },
    { id: -3, author_name: "Can D.", author_role: "İhracatçı", rating: 4.9, content: `Gümrük süreçleri ${name} için sorunsuz ilerledi, destek ekibi çok ilgili.`, date_label: "3 hafta önce", is_verified: true },
  ];
}

function fallbackFaqs(name: string): SeoFaq[] {
  return [
    { question: `${name}'ya kargo ne kadar sürede ulaşır?`, answer: `Taşıyıcıya ve hizmete göre ${name} için ortalama teslimat 2-6 iş günüdür. Express seçeneklerle daha hızlı gönderim mümkündür.` },
    { question: `${name}'ya kargo fiyatı nasıl hesaplanır?`, answer: `Fiyat; ağırlık, hacim (desi) ve seçilen taşıyıcıya göre belirlenir. Yukarıdaki hesaplayıcıdan anında fiyat alabilirsiniz.` },
    { question: `${name}'ya hangi kargo firmalarıyla gönderim yapılır?`, answer: `DHL, FedEx, UPS, TNT ve GLS gibi global taşıyıcılarla ${name}'ya gönderim yapabilirsiniz.` },
    { question: `${name}'ya gönderemeyeceğim ürünler var mı?`, answer: `Tehlikeli maddeler, sıvılar ve ülkeye özel yasaklı ürünler gönderilemez. Detaylar için destek ekibimizle iletişime geçin.` },
  ];
}

function StoryCard({ s, featured }: { s: SeoStory; featured?: boolean }) {
  const initials = (s.author_name || "Z").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={`rounded-2xl border p-6 zal-hover-card ${featured ? "bg-[#070B1A] border-white/10 text-white md:row-span-2" : "bg-white border-slate-200 zal-shadow-soft"}`}>
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className={`w-4 h-4 ${i < Math.round(s.rating) ? "text-amber-400" : "text-slate-300"}`} viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.447a1 1 0 00-.363 1.118l1.287 3.955c.3.922-.755 1.688-1.54 1.118l-3.37-2.446a1 1 0 00-1.175 0l-3.37 2.446c-.784.57-1.838-.196-1.539-1.118l1.287-3.955a1 1 0 00-.363-1.118L2.049 9.372c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.955z" />
          </svg>
        ))}
      </div>
      <p className={`text-sm leading-relaxed mb-5 ${featured ? "text-white/90 md:text-base" : "text-slate-700"}`}>{s.content}</p>
      <div className="flex items-center gap-3">
        <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-bold ${featured ? "bg-white/10 text-white" : "bg-[#0000BE]/10 text-[#0000BE]"}`}>{initials}</span>
        <div className="min-w-0">
          <div className={`flex items-center gap-1.5 text-sm font-bold ${featured ? "text-white" : "text-slate-900"}`}>
            {s.author_name}
            {s.is_verified && (
              <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" /></svg>
            )}
          </div>
          <div className={`text-xs ${featured ? "text-white/50" : "text-slate-400"}`}>{s.author_role}{s.date_label ? ` · ${s.date_label}` : ""}</div>
        </div>
      </div>
    </div>
  );
}

export function CountryDetail({ data }: { data: SeoPayload }) {
  const { primary, parent, isTr, isChild, type } = data;
  const name = primary.name;
  const iso2 = primary.iso2 || "";
  const h1 = (primary.h1_override || "").trim() || `${name} Kargo ve Lojistik Hizmetleri`;
  const priceLine = priceSentence(name, primary.price_min, primary.price_max, primary.price_currency);
  // Curated bölümler (data.php) — sadece verisi olan ülkede (bugün BE). TR'de iso2 boş → null.
  const sections = getCountrySections(iso2);

  const stories = data.stories.length ? data.stories : fallbackStories(name);
  const faqs = data.faqs.length ? data.faqs : fallbackFaqs(name);
  const featuredStory = stories[0];
  const restStories = stories.slice(1, 6);

  // Şehir/ilçe grid için canlı arama.
  const [q, setQ] = useState("");
  const gridItems = data.children;
  const filtered = useMemo(
    () => (q.trim() ? gridItems.filter((c) => c.name.toLowerCase().includes(q.toLowerCase().trim())) : gridItems),
    [q, gridItems],
  );

  const childBase = isChild && parent ? `/yurtdisi-kargo/${parent.slug}` : `/yurtdisi-kargo/${primary.slug}`;
  const gridLabel = isTr ? "İlçe" : "Şehir";

  // Breadcrumb parçaları
  const crumbs: { label: string; href?: string }[] = [
    { label: "Anasayfa", href: "/" },
    { label: "Yurt Dışı Kargo", href: "/yurtdisi-kargo" },
  ];
  if (isChild && parent) crumbs.push({ label: parent.name, href: `/yurtdisi-kargo/${parent.slug}` });
  crumbs.push({ label: name });

  const faqMid = Math.ceil(faqs.length / 2);

  return (
    <>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden zal-hero-wash border-b border-slate-200/60">
        <div className="absolute inset-0 zal-hero-grid pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 md:pt-12 md:pb-16">
          {/* Breadcrumb */}
          <nav className="flex items-center flex-wrap gap-1.5 text-xs text-slate-500 mb-6" aria-label="breadcrumb">
            {crumbs.map((c, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                {c.href ? <a href={c.href} className="hover:text-[#0000BE] transition">{c.label}</a> : <span className="text-slate-800 font-semibold">{c.label}</span>}
                {i < crumbs.length - 1 && <span className="text-slate-300">/</span>}
              </span>
            ))}
          </nav>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="zal-rise">
              <span className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-1 text-[12px] font-semibold text-[#0000BE] zal-shadow-xs mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#BFFF00]" />
                {isTr ? `${name} çıkışlı yurtdışı kargo` : `${name}'ya güvenli kargo`}
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-slate-900 leading-[1.1]">{h1}</h1>
              <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed max-w-xl">
                {priceLine || `${name} için en uygun kargo fiyatlarını karşılaştırın, tek panelden gönderin ve anlık takip edin.`}
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <a href="#calculator-form" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#0000BE] hover:bg-blue-800 text-white font-semibold rounded-xl zal-shadow-cta transition">
                  Fiyat Hesapla
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </a>
                <a href="/iletisim" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-200 transition">İletişime Geç</a>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <span className="inline-flex items-center gap-1.5 text-slate-600"><strong className="text-slate-900">4.9/5</strong> · 1.200+ değerlendirme</span>
                <span className="inline-flex items-center gap-1.5 text-slate-600"><strong className="text-slate-900">10.000+</strong> gönderi</span>
                <span className="inline-flex items-center gap-1.5 text-slate-600"><strong className="text-slate-900">220+</strong> ülke</span>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 opacity-70">
                {CARRIERS.map((c) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={c} src={`/assets/${c}.png`} alt={c.toUpperCase()} className="h-5 md:h-6 w-auto object-contain" loading="lazy" />
                ))}
              </div>
            </div>

            <div className="zal-rise-d1">
              <QuickCalculatorForm preselectIso2={iso2} />
            </div>
          </div>
        </div>
      </section>

      {/* ===== ŞEHİR / İLÇE GRID ===== */}
      {gridItems.length > 0 ? (
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {isTr ? `${name} İlçelerine Kargo` : `${name} Şehirlerine Kargo`}
                </h2>
                <p className="mt-2 text-slate-600">{gridItems.length} {gridLabel.toLowerCase()} için özel kargo çözümleri</p>
              </div>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`${gridLabel} ara…`} className="w-full sm:w-64 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0000BE] focus:ring-1 focus:ring-[#0000BE]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filtered.map((c) => (
                <a key={c.slug || c.name} href={c.slug ? `${childBase}/${c.slug}` : "#"} className="group flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 zal-hover-card">
                  <span className="text-sm font-semibold text-slate-800 truncate">{c.name}</span>
                  <svg className="w-4 h-4 text-slate-300 group-hover:text-[#0000BE] transition shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </a>
              ))}
              {filtered.length === 0 && <p className="col-span-full text-center text-slate-400 py-6">Sonuç bulunamadı.</p>}
            </div>
          </div>
        </section>
      ) : data.regions.length > 0 ? (
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight mb-8">{name} Bölgelerine Kargo</h2>
            <div className="flex flex-wrap gap-2.5">
              {data.regions.map((r) => (
                <span key={r.code || r.name} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">{r.name}</span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ===== ÖNE ÇIKAN MAHALLELER (şehir sayfası) ===== */}
      {isChild && !isTr && data.children.length > 0 && (
        <section className="py-10 bg-slate-50/60 border-y border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">{name} Öne Çıkan Mahalleler</h2>
            <div className="flex flex-wrap gap-2">
              {data.children.slice(0, 24).map((d) => (
                <span key={d.name} className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-sm text-slate-700">{d.name}</span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CURATED BÖLÜMLER (data.php — sadece BE) ===== */}
      {sections?.address_format && <AddressFormat data={sections.address_format} />}
      {sections?.delivery_times && <DeliveryTimes data={sections.delivery_times} />}
      {sections?.restrictions && <Restrictions data={sections.restrictions} />}
      {sections?.top_categories && <TopCategories data={sections.top_categories} />}

      {/* ===== MID CTA ===== */}
      <section className="bg-[#070B1A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Zalusa ile dünyaya açılın</h2>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto">{name} ve 220+ ülkeye uçtan uca lojistik. Tek panel, şeffaf fiyat, anlık takip.</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href="#calculator-form" className="inline-flex items-center gap-2 px-6 py-3 bg-[#BFFF00] hover:bg-[#aee600] text-slate-900 font-semibold rounded-xl transition">Ücretsiz Fiyat Al</a>
            <a href="/giris" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/15 transition">Hemen Başla</a>
          </div>
        </div>
      </section>

      {/* ===== HİKAYELER ===== */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Zalusa ile büyüme hikayeleri</h2>
            <p className="mt-2 text-slate-600">{name} gönderilerini Zalusa ile yönetenlerin deneyimleri</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {featuredStory && <StoryCard s={featuredStory} featured />}
            {restStories.map((s) => <StoryCard key={s.id} s={s} />)}
          </div>
          <div className="text-center mt-8">
            <a href="/yorumlar" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0000BE] hover:underline">Tüm değerlendirmeleri gör
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </a>
          </div>
        </div>
      </section>

      {/* ===== SSS ===== */}
      <section className="py-14 md:py-20 bg-slate-50/60 border-y border-slate-200/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Sıkça sorulan sorular</h2>
            <p className="mt-2 text-slate-600">{name} kargo süreçleri hakkında merak edilenler</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[faqs.slice(0, faqMid), faqs.slice(faqMid)].map((col, ci) => (
              <div key={ci} className="space-y-3">
                {col.map((f, i) => (
                  <details key={i} className="group rounded-xl border border-slate-200 bg-white overflow-hidden">
                    <summary className="flex items-center justify-between gap-3 cursor-pointer list-none px-5 py-4 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                      {f.question}
                      <svg className="w-5 h-5 shrink-0 text-slate-400 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </summary>
                    <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{f.answer}</div>
                  </details>
                ))}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="/iletisim" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0000BE] hover:underline">Sorunuz mu var? İletişime geçin</a>
          </div>
        </div>
      </section>

      {/* ===== SEO REHBER İÇERİĞİ ===== */}
      {primary.content.trim() && (
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="zalusa-rich-content prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: primary.content }} />
          </div>
        </section>
      )}

      {/* ===== İLGİLİ ÜLKELER (data.php — sadece BE) ===== */}
      {sections?.related_countries && <RelatedCountries data={sections.related_countries} currentIso2={iso2} />}

      {/* ===== DESTEK ===== */}
      <section className="py-12 bg-slate-50/60 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Nasıl Yardımcı Olabiliriz?</h3>
            <p className="text-sm text-slate-600 mt-1">{name} kargo süreçleriniz için 7/24 destek ekibimiz yanınızda.</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="tel:08502551840" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 hover:bg-slate-50 transition">0850 255 18 40</a>
            <a href="mailto:destek@zalusa.com" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0000BE] text-white rounded-xl text-sm font-semibold hover:bg-blue-800 transition">E-posta Gönder</a>
          </div>
        </div>
      </section>
    </>
  );
}
