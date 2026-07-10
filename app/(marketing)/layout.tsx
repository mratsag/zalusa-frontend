import { Outfit, Inter, Montserrat } from "next/font/google";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { OfferModalProvider } from "@/components/marketing/offer-modal";
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

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${inter.variable} ${outfit.variable} ${montserrat.variable} zal-marketing bg-white text-slate-800`}
    >
      <OfferModalProvider>
        <SiteHeader />
        {children}
        <SiteFooter />
      </OfferModalProvider>
    </div>
  );
}
