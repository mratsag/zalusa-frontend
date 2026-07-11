import type { MetadataRoute } from "next";

// robots.php portu. Admin/API/auth kapalı; sitemap referansı.
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://zalusa.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/giris", "/panel"],
    },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
