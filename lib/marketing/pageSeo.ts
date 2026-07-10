import type { Metadata } from "next";

// Sayfa SEO — admin pages tablosundan çekilir, hardcoded fallback ile birleştirilir.
// DB'de değer yoksa/erişilemezse fallback kullanılır (mevcut metadata korunur).
// Marketing sayfalarının generateMetadata'sında çağrılır.

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "";

type PageSeo = {
  seo_title?: string;
  seo_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
};

export type SeoFallback = { title: string; description: string };

export async function getPageMetadata(slug: string, fallback: SeoFallback): Promise<Metadata> {
  let seo: PageSeo = {};
  if (API) {
    try {
      const res = await fetch(`${API}/api/pages/${encodeURIComponent(slug)}`, {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) seo = (await res.json()) as PageSeo;
    } catch {
      // fail-safe: fallback kullanılır
    }
  }

  const title = (seo.seo_title || "").trim() || fallback.title;
  const description = (seo.seo_description || "").trim() || fallback.description;
  const ogTitle = (seo.og_title || "").trim() || title;
  const ogDescription = (seo.og_description || "").trim() || description;
  const keywords = (seo.meta_keywords || "").trim();

  const md: Metadata = {
    title,
    description,
    openGraph: { title: ogTitle, description: ogDescription },
  };
  if (keywords) md.keywords = keywords;
  return md;
}
