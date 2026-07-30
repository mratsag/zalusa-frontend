import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import * as content from "./content";
import { pickHTML } from "@/lib/marketing/content";
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

export default async function EntegrasyonlarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <EntegrasyonlarContent html={pickHTML(content, locale)} />;
}
