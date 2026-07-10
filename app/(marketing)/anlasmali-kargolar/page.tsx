import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import { HTML } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("anlasmali-kargolar", {
  title: "Anlaşmalı Kargolar",
  description: "Zalusa üzerinden çalışabileceğiniz anlaşmalı kargo seçeneklerini ve operasyon avantajlarını görüntüleyin.",
  });
}

export default function Page() {
  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
