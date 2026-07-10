import type { Metadata } from "next";

import { getPageMetadata } from "@/lib/marketing/pageSeo";
import { QuickCalculatorForm } from "@/components/marketing/quick-calculator";
import { YurtdisiKargoGrids, type HubCountry, type HubProvince } from "@/components/marketing/seo/yurtdisi-kargo-hub";

// yurtdisi-kargo.php hub — /yurtdisi-kargo. ISR 5dk.
const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "";
const FB = { title: "Yurt Dışı Kargo - Ülke ve Şehir Rehberi | Zalusa", description: "220+ ülkeye ve Türkiye çıkışlı illere uygun fiyatlı yurt dışı kargo. Ülke ve şehir bazlı rehberler, anlık fiyat hesaplama." };

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("yurtdisi-kargo", FB);
}

async function getIndex(): Promise<{ countries: HubCountry[]; tr_provinces: HubProvince[] }> {
  if (!API) return { countries: [], tr_provinces: [] };
  try {
    const res = await fetch(`${API}/api/seo/index`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return { countries: [], tr_provinces: [] };
    const d = await res.json();
    return { countries: d.countries ?? [], tr_provinces: d.tr_provinces ?? [] };
  } catch {
    return { countries: [], tr_provinces: [] };
  }
}

async function getPageContent(): Promise<string> {
  if (!API) return "";
  try {
    const res = await fetch(`${API}/api/pages/yurtdisi-kargo`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return "";
    const d = await res.json();
    return typeof d?.seo_content === "string" ? d.seo_content : "";
  } catch {
    return "";
  }
}

async function getPageFaqs(): Promise<{ question: string; answer: string }[]> {
  if (!API) return [];
  try {
    const res = await fetch(`${API}/api/faqs?page_slug=yurtdisi-kargo`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    const d = await res.json();
    return Array.isArray(d) ? d.map((f: { question: string; answer: string }) => ({ question: f.question, answer: f.answer })) : [];
  } catch {
    return [];
  }
}

const CARRIERS = ["dhl", "fedex", "ups", "tnt", "gls"];
const STEPS = [
  { n: "1", t: "Fiyat hesapla", d: "Ülke, ağırlık ve boyut girin; taşıyıcıları anında karşılaştırın." },
  { n: "2", t: "Gönderini oluştur", d: "En uygun taşıyıcıyı seçin, etiketinizi tek tıkla oluşturun." },
  { n: "3", t: "Takip et", d: "Tüm gönderilerinizi tek panelden anlık takip edin." },
];

export default async function YurtdisiKargoHubPage() {
  const [{ countries, tr_provinces }, content, faqs] = await Promise.all([getIndex(), getPageContent(), getPageFaqs()]);

  const faqLd =
    faqs.length > 0
      ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }
      : null;
  const faqMid = Math.ceil(faqs.length / 2);

  return (
    <>
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      {/* Hero */}
      <section className="relative overflow-hidden zal-hero-wash border-b border-slate-200/60">
        <div className="absolute inset-0 zal-hero-grid pointer-events-none" aria-hidden="true" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 md:pt-14 md:pb-20">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
            <a href="/" className="hover:text-[#0000BE] transition">Anasayfa</a>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">Yurt Dışı Kargo</span>
          </nav>
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
            <div className="zal-rise">
              <h1 className="text-3xl md:text-4xl lg:text-[42px] font-bold tracking-tight text-slate-900 leading-[1.1]">Yurt Dışı Kargo Rehberi</h1>
              <p className="mt-4 text-base md:text-lg text-slate-600 leading-relaxed max-w-xl">220+ ülkeye ve Türkiye çıkışlı tüm illere uygun fiyatlı, hızlı yurt dışı kargo. Ülke ve şehir rehberleriyle en uygun fiyatı bulun.</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 opacity-70">
                {CARRIERS.map((c) => (
                  <img key={c} src={`/assets/${c}.png`} alt={c.toUpperCase()} className="h-5 md:h-6 w-auto object-contain" loading="lazy" />
                ))}
              </div>
            </div>
            <div className="zal-rise-d1">
              <QuickCalculatorForm />
            </div>
          </div>
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight text-center mb-10">Yurt dışı kargo gönderimi nasıl yapılır?</h2>
          <div className="grid md:grid-cols-3 gap-5">
            {STEPS.map((s) => (
              <div key={s.n} className="rounded-2xl border border-slate-200 bg-white p-6 zal-shadow-soft">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-[#0000BE] text-white font-bold">{s.n}</span>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{s.t}</h3>
                <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ülke + TR il grid'leri */}
      <YurtdisiKargoGrids countries={countries} provinces={tr_provinces} />

      {/* Multimodal CTA */}
      <section className="bg-[#070B1A] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Hava, kara, deniz — tek panelden</h2>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto">Z-Fly, Z-Truck, Z-Ship ve Z-Cargo çözümleriyle her gönderiye en uygun taşıma modu.</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a href="#calculator-form" className="inline-flex items-center gap-2 px-6 py-3 bg-[#BFFF00] hover:bg-[#aee600] text-slate-900 font-semibold rounded-xl transition">Ücretsiz Fiyat Al</a>
            <a href="https://app.zalusa.com" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl border border-white/15 transition">Hemen Başla</a>
          </div>
        </div>
      </section>

      {/* Panel SEO içeriği */}
      {content.trim() && (
        <section className="py-14 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="zalusa-rich-content prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </section>
      )}

      {/* Panel SSS */}
      {faqs.length > 0 && (
        <section className="py-14 md:py-20 bg-slate-50/60 border-y border-slate-200/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight text-center mb-10">Sıkça sorulan sorular</h2>
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
          </div>
        </section>
      )}
    </>
  );
}
