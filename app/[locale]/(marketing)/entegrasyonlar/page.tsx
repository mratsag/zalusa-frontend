import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import { EntegrasyonlarContent } from "./entegrasyonlar-client";

// PHP entegrasyonlar.php portu. İçerik + gömülü <style> ham HTML; sticky-nav
// scroll-spy client component'te (IntersectionObserver).
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata("entegrasyonlar", {
  title: "Entegrasyonlar: Pazaryeri, E-ticaret ve Muhasebe Çözümleri",
  description:
    "Zalusa entegrasyonları ile pazaryeri, e-ticaret altyapısı ve muhasebe süreçlerinizi tek panelde yönetin.",
  }, locale);
}

export default function EntegrasyonlarPage() {
  return <EntegrasyonlarContent />;
}
