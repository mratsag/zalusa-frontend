import { defineRouting } from "next-intl/routing";

// Marketing sitesi dil yapılandırması.
// - tr = varsayılan, URL öneki YOK → mevcut TR URL'leri birebir korunur (SEO güvenliği).
// - en = /en öneki.
// - localeDetection: false → tarayıcı diline göre otomatik yönlendirme YAPILMAZ.
//   (Aksi halde İngilizce tarayıcılı ziyaretçi zalusa.com'da /en'e atılır; TR pazarı
//    ve mevcut SEO için istenmeyen davranış. Dil değişimi yalnızca seçiciyle olur.)
export const routing = defineRouting({
  locales: ["tr", "en"],
  defaultLocale: "tr",
  localePrefix: "as-needed",
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
