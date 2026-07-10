import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { resolveSeo, buildSeoJsonLd } from "@/lib/marketing/seo";
import { CountryDetail } from "@/components/marketing/seo/country-detail";

// router.php tek segment: /yurtdisi-kargo/{slug} → ülke veya TR ili.
export const dynamicParams = true;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await resolveSeo(slug);
  if (!data) return {};
  const p = data.primary;
  const title = (p.seo_title || "").trim() || `${p.name} Kargo ve Lojistik Hizmetleri - Zalusa`;
  const description = (p.seo_description || "").trim() || `${p.name} için en uygun kargo fiyatları ve hızlı teslimat çözümleri.`;
  return {
    title,
    description,
    keywords: (p.meta_keywords || "").trim() || undefined,
    alternates: (p.canonical_url || "").trim() ? { canonical: p.canonical_url } : undefined,
    openGraph: { title: (p.og_title || "").trim() || title, description: (p.og_description || "").trim() || description },
  };
}

export default async function CountrySlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await resolveSeo(slug);
  if (!data) notFound();

  const jsonLd = buildSeoJsonLd(data);
  return (
    <>
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      ))}
      <CountryDetail data={data} />
    </>
  );
}
