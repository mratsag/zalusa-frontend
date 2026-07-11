import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/marketing/page-header";

// sayfa.php portu — pages CMS'indeki tek segment slug'ları (yasal sayfalar +
// panelden eklenen yeni sayfalar). Explicit route'lar ve /yurtdisi-kargo bundan öncelikli.
export const dynamicParams = true;
export const revalidate = 300;

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "";

type CmsPage = { slug: string; name: string; seo_title: string; seo_description: string; seo_content: string };
type Faq = { question: string; answer: string };

async function getPage(slug: string): Promise<CmsPage | null> {
  if (!API) return null;
  try {
    const res = await fetch(`${API}/api/pages/${encodeURIComponent(slug)}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d || !d.slug) return null;
    return d as CmsPage;
  } catch {
    return null;
  }
}

async function getFaqs(slug: string): Promise<Faq[]> {
  if (!API) return [];
  try {
    const res = await fetch(`${API}/api/faqs?page_slug=${encodeURIComponent(slug)}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    const d = await res.json();
    return Array.isArray(d) ? d.map((f: Faq) => ({ question: f.question, answer: f.answer })) : [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return {};
  const title = (page.seo_title || "").trim() || `${page.name} - Zalusa`;
  const description = (page.seo_description || "").trim() || `${page.name} - Zalusa`;
  return { title, description, openGraph: { title, description } };
}

export default async function CmsSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  const faqs = await getFaqs(slug);
  const faqMid = Math.ceil(faqs.length / 2);
  const faqLd =
    faqs.length > 0
      ? { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })) }
      : null;

  return (
    <>
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}
      <PageHeader title={page.name} current={page.name} />

      {page.seo_content.trim() && (
        <section className="py-10 md:py-14 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="zalusa-rich-content prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: page.seo_content }} />
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="py-12 md:py-16 bg-slate-50/60 border-t border-slate-200/50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight text-center mb-8">Sıkça sorulan sorular</h2>
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
