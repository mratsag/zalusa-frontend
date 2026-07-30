import { notFound } from "next/navigation";
import { Outfit, Inter, Montserrat } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/marketing/site-header";
import { PromoPopup } from "@/components/marketing/promo-popup";
import { getPromoPopup } from "@/lib/marketing/settings";
import { SiteFooter } from "@/components/marketing/site-footer";
import { OfferModalProvider } from "@/components/marketing/offer-modal";
import { getSiteMenu } from "@/lib/marketing/menu";
// Phosphor ikonları (PHP head.php'de unpkg'den yüklenen regular/bold/fill).
// <i class="ph ph-*" | "ph-bold ph-*" | "ph-fill ph-*"> markup'ı birebir çalışır.
import "@phosphor-icons/web/regular";
import "@phosphor-icons/web/bold";
import "@phosphor-icons/web/fill";
import "./marketing.css";

// PHP head.php: Outfit (başlık) + Inter (gövde) + Montserrat.
// latin-ext = Türkçe karakter desteği (ş, ğ, ı, İ, ç, ö, ü).
const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});
const montserrat = Montserrat({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

// Statik render için dilleri önden üret (tr, en).
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Desteklenmeyen dil (ör. /foo) → 404; [locale] segmenti her yolu yakalamasın.
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [menu, promo] = await Promise.all([getSiteMenu(locale), getPromoPopup()]);

  return (
    <div
      className={`${inter.variable} ${outfit.variable} ${montserrat.variable} zal-marketing bg-white text-slate-800`}
    >
      <NextIntlClientProvider>
        <OfferModalProvider>
          <SiteHeader menu={menu} />
          {children}
          <SiteFooter />
          {promo && <PromoPopup promo={promo} />}
        </OfferModalProvider>
      </NextIntlClientProvider>
    </div>
  );
}
