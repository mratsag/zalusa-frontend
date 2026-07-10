// Programmatik SEO — public çözümleme (server-side).
// /api/seo/resolve/:slug(/:sub) → normalize edilmiş payload.

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "";

export type SeoLoc = {
  id: number;
  name: string;
  slug: string;
  iso2?: string;
  plate_code?: string;
  content: string;
  seo_title: string;
  seo_description: string;
  seo_text?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  h1_override?: string;
  price_min: number | null;
  price_max: number | null;
  price_currency: string;
};

export type SeoStory = {
  id: number;
  author_name: string;
  author_role: string;
  rating: number;
  content: string;
  date_label: string;
  is_verified: boolean;
};

export type SeoFaq = { question: string; answer: string };
export type SeoRef = { name: string; slug?: string; code?: string };

export type SeoPayload = {
  type: "country" | "city" | "tr_province" | "tr_district";
  isTr: boolean;
  isChild: boolean;
  primary: SeoLoc; // page_data
  parent: SeoLoc | null; // country (city) / province (tr_district)
  stories: SeoStory[];
  faqs: SeoFaq[];
  children: SeoRef[]; // cities | districts | tr_districts
  regions: SeoRef[];
};

type RawResolve = {
  type: SeoPayload["type"];
  country?: SeoLoc;
  city?: SeoLoc;
  province?: SeoLoc;
  district?: SeoLoc;
  stories?: SeoStory[];
  faqs?: SeoFaq[];
  cities?: SeoRef[];
  districts?: SeoRef[];
  regions?: SeoRef[];
};

const SITE = "https://zalusa.com";

// BreadcrumbList + Service + AggregateRating + FAQPage JSON-LD (head.php portu).
export function buildSeoJsonLd(data: SeoPayload): object[] {
  const { primary, parent, isChild } = data;
  const path = isChild && parent ? `/yurtdisi-kargo/${parent.slug}/${primary.slug}` : `/yurtdisi-kargo/${primary.slug}`;
  const url = `${SITE}${path}`;

  const crumbs = [
    { name: "Anasayfa", item: `${SITE}/` },
    { name: "Yurt Dışı Kargo", item: `${SITE}/yurtdisi-kargo` },
  ];
  if (isChild && parent) crumbs.push({ name: parent.name, item: `${SITE}/yurtdisi-kargo/${parent.slug}` });
  crumbs.push({ name: primary.name, item: url });

  const out: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.item })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${primary.name} Kargo ve Lojistik`,
      serviceType: "Uluslararası kargo ve lojistik",
      areaServed: primary.name,
      provider: { "@type": "Organization", name: "Zalusa", url: SITE },
      url,
    },
  ];

  const stories = data.stories;
  if (stories.length > 0) {
    const avg = stories.reduce((s, x) => s + (x.rating || 5), 0) / stories.length;
    out.push({
      "@context": "https://schema.org",
      "@type": "AggregateRating",
      itemReviewed: { "@type": "Service", name: `${primary.name} Kargo` },
      ratingValue: Math.round(avg * 10) / 10,
      reviewCount: stories.length,
      bestRating: 5,
      worstRating: 1,
    });
  }

  const faqs = data.faqs;
  if (faqs.length > 0) {
    out.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    });
  }
  return out;
}

export async function resolveSeo(slug: string, sub?: string): Promise<SeoPayload | null> {
  if (!API) return null;
  const path = sub
    ? `/api/seo/resolve/${encodeURIComponent(slug)}/${encodeURIComponent(sub)}`
    : `/api/seo/resolve/${encodeURIComponent(slug)}`;
  let raw: RawResolve | null = null;
  try {
    const res = await fetch(`${API}${path}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    raw = (await res.json()) as RawResolve;
  } catch {
    return null;
  }
  if (!raw || !raw.type) return null;

  const stories = raw.stories ?? [];
  const faqs = raw.faqs ?? [];

  switch (raw.type) {
    case "country":
      if (!raw.country) return null;
      return { type: "country", isTr: false, isChild: false, primary: raw.country, parent: null, stories, faqs, children: raw.cities ?? [], regions: raw.regions ?? [] };
    case "city":
      if (!raw.city || !raw.country) return null;
      return { type: "city", isTr: false, isChild: true, primary: raw.city, parent: raw.country, stories, faqs, children: raw.districts ?? [], regions: [] };
    case "tr_province":
      if (!raw.province) return null;
      return { type: "tr_province", isTr: true, isChild: false, primary: raw.province, parent: null, stories, faqs, children: raw.districts ?? [], regions: [] };
    case "tr_district":
      if (!raw.district || !raw.province) return null;
      return { type: "tr_district", isTr: true, isChild: true, primary: raw.district, parent: raw.province, stories, faqs, children: [], regions: [] };
    default:
      return null;
  }
}
