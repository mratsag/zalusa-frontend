import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import { PricingContent } from "./pricing-client";

// PHP fiyat_hesaplama.php portu — Yurtdışı Kargo Fiyat Hesaplama.
// Homepage calculator'ın "Hesapla" redirect hedefi. İçerik ham HTML; calculator +
// FAQ/scroll JS client component'te. Gerçek fiyat app.zalusa.com'da (quick-start).
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("yurtdisi-kargo-fiyat-hesaplama", {
  title: "Yurtdışı Kargo Fiyat Hesaplama - Zalusa",
  description:
    "Yurtdışı kargo fiyatını saniyeler içinde hesaplayın. Ülke, ağırlık ve boyut girin; taşıyıcıları karşılaştırın, en uygun uluslararası kargo fiyatını görün.",
  });
}

export default function PricingPage() {
  return <PricingContent />;
}
