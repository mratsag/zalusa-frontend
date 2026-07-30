import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import * as content from "./content";
import { pickHTML } from "@/lib/marketing/content";

// PHP sss.php portu — Sıkça Sorulan Sorular (native <details>, JSON-LD dahil).
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata("sss", {
  title: "Sıkça Sorulan Sorular - Zalusa",
  description:
    "Zalusa hakkında sıkça sorulan sorular: kargo süreçleri, fiyatlandırma, teslimat, entegrasyonlar ve daha fazlası.",
  }, locale);
}

export default async function SssPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const HTML = pickHTML(content, locale);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
