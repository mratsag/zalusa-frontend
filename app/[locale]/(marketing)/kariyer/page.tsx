import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import * as content from "./content";
import { pickHTML } from "@/lib/marketing/content";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata("kariyer", {
  title: "Kariyer Fırsatları",
  description: "Zalusa kariyer fırsatlarını keşfedin. Ürün, operasyon ve teknoloji ekiplerimizde açık pozisyonları inceleyin.",
  }, locale);
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const HTML = pickHTML(content, locale);

  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
