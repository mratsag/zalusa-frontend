import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import { HTML } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("kariyer", {
  title: "Kariyer Fırsatları",
  description: "Zalusa kariyer fırsatlarını keşfedin. Ürün, operasyon ve teknoloji ekiplerimizde açık pozisyonları inceleyin.",
  });
}

export default function Page() {
  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
