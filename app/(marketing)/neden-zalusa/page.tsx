import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import { HTML } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("neden-zalusa", {
  title: "Neden Zalusa?",
  description: "Tek panelde fiyat karşılaştırma, gönderi takibi ve operasyon yönetimi ile Zalusa farkını keşfedin.",
  });
}

export default function Page() {
  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
