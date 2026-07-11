import type { MetadataRoute } from "next";

// Dinamik sitemap — statik marketing sayfaları + programatik SEO (ülke/şehir/TR) + blog.
// sitemap.php portu. ISR: 1 saat.
export const revalidate = 3600;

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://zalusa.com";
const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "";

type Freq = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

// Next route'u olan statik marketing sayfaları
const STATIC: { path: string; freq: Freq; priority: number }[] = [
  { path: "/", freq: "daily", priority: 1 },
  { path: "/yurtdisi-kargo", freq: "weekly", priority: 0.9 },
  { path: "/yurtdisi-kargo-fiyat-hesaplama", freq: "weekly", priority: 0.9 },
  { path: "/nasil-calisir", freq: "monthly", priority: 0.7 },
  { path: "/hakkimizda", freq: "monthly", priority: 0.6 },
  { path: "/neden-zalusa", freq: "monthly", priority: 0.6 },
  { path: "/is-ortaklarimiz", freq: "monthly", priority: 0.5 },
  { path: "/anlasmali-kargolar", freq: "monthly", priority: 0.5 },
  { path: "/kariyer", freq: "monthly", priority: 0.5 },
  { path: "/entegrasyonlar", freq: "monthly", priority: 0.6 },
  { path: "/iletisim", freq: "monthly", priority: 0.5 },
  { path: "/sss", freq: "monthly", priority: 0.6 },
  { path: "/yorumlar", freq: "weekly", priority: 0.5 },
  { path: "/blog", freq: "weekly", priority: 0.8 },
];

type ApiUrl = { path: string; lastmod?: string; changefreq: Freq; priority: string };

async function fetchDynamic(): Promise<ApiUrl[]> {
  if (!API) return [];
  try {
    const res = await fetch(`${API}/api/seo/sitemap`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const dynamic = await fetchDynamic();

  const staticEntries: MetadataRoute.Sitemap = STATIC.map((s) => ({
    url: `${SITE}${s.path}`,
    lastModified: now,
    changeFrequency: s.freq,
    priority: s.priority,
  }));

  const dynamicEntries: MetadataRoute.Sitemap = dynamic.map((u) => ({
    url: `${SITE}${u.path}`,
    lastModified: u.lastmod ? new Date(u.lastmod) : now,
    changeFrequency: u.changefreq,
    priority: Number(u.priority) || 0.5,
  }));

  return [...staticEntries, ...dynamicEntries];
}
