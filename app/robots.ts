import type { MetadataRoute } from "next";

// robots.php portu. Admin/API/auth kapalı; sitemap referansı.
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://zalusa.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // /en GEÇİCİ olarak kapalı: İngilizce çeviriler (Faz 2-4) tamamlanana kadar
      // sayfalar çoğunlukla Türkçe içerik gösteriyor → yinelenen/karışık içerik
      // olarak indekslenmesini engelliyoruz. Çeviriler bitince bu satır kaldırılıp
      // sitemap'e /en URL'leri + hreflang eklenecek.
      disallow: ["/admin", "/api", "/giris", "/panel", "/en"],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
