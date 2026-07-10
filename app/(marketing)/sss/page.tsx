import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import { HTML } from "./content";

// PHP sss.php portu — Sıkça Sorulan Sorular (native <details>, JSON-LD dahil).
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("sss", {
  title: "Sıkça Sorulan Sorular - Zalusa",
  description:
    "Zalusa hakkında sıkça sorulan sorular: kargo süreçleri, fiyatlandırma, teslimat, entegrasyonlar ve daha fazlası.",
  });
}

export default function SssPage() {
  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
