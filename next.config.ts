import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dockerfile'ın çalışması için en kritik satır:
  output: "standalone",

  // Ekranda gördüğünüz resim ayarını da ekliyorum (Google profil fotoğrafları vb. kullanacaksanız ileride hata vermesin)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // Cutover: PHP .htaccess'teki yapısal 301'ler (eski .php URL'leri + /kargo/*).
  // Admin'den yönetilen 301'ler proxy.ts + redirects tablosunda; bunlar sabit yapısal.
  async redirects() {
    return [
      // Ana sayfa
      { source: "/index.php", destination: "/", statusCode: 301 },
      { source: "/homepage-v2.php", destination: "/", statusCode: 301 },

      // Fiyat hesaplama (eski adlar → yeni temiz URL)
      { source: "/fiyat_hesaplama.php", destination: "/yurtdisi-kargo-fiyat-hesaplama", statusCode: 301 },
      { source: "/fiyat_hesaplama", destination: "/yurtdisi-kargo-fiyat-hesaplama", statusCode: 301 },
      { source: "/fiyat-hesaplama", destination: "/yurtdisi-kargo-fiyat-hesaplama", statusCode: 301 },
      { source: "/fiyat_hesaplama_ulkeler.php", destination: "/yurtdisi-kargo-fiyat-hesaplama", statusCode: 301 },
      { source: "/fiyat-hesaplama-ulkeler", destination: "/yurtdisi-kargo-fiyat-hesaplama", statusCode: 301 },

      // Blog detay: /blog-detay.php?slug=X → /blog/X
      {
        source: "/blog-detay.php",
        has: [{ type: "query", key: "slug", value: "(?<slug>[^&]+)" }],
        destination: "/blog/:slug",
        statusCode: 301,
      },

      // Eski /kargo/* → /yurtdisi-kargo/*
      { source: "/kargo", destination: "/yurtdisi-kargo", statusCode: 301 },
      { source: "/kargo/:path*", destination: "/yurtdisi-kargo/:path*", statusCode: 301 },

      // Diğer landing .php → temiz URL
      { source: "/nasil-calisir.php", destination: "/nasil-calisir", statusCode: 301 },
      { source: "/hakkimizda.php", destination: "/hakkimizda", statusCode: 301 },
      { source: "/iletisim.php", destination: "/iletisim", statusCode: 301 },
      { source: "/sss.php", destination: "/sss", statusCode: 301 },
      { source: "/blog.php", destination: "/blog", statusCode: 301 },
      { source: "/entegrasyonlar.php", destination: "/entegrasyonlar", statusCode: 301 },
      { source: "/kariyer.php", destination: "/kariyer", statusCode: 301 },
      { source: "/neden-zalusa.php", destination: "/neden-zalusa", statusCode: 301 },
      { source: "/is-ortaklarimiz.php", destination: "/is-ortaklarimiz", statusCode: 301 },
      { source: "/anlasmali-kargolar.php", destination: "/anlasmali-kargolar", statusCode: 301 },
      { source: "/yorumlar.php", destination: "/yorumlar", statusCode: 301 },
      { source: "/yurtdisi-kargo.php", destination: "/yurtdisi-kargo", statusCode: 301 },
    ];
  },
};

export default nextConfig;
