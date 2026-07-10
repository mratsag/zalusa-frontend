import type { Metadata } from "next";

import { HTML } from "./content";

// PHP sss.php portu — Sıkça Sorulan Sorular (native <details>, JSON-LD dahil).
export const metadata: Metadata = {
  title: "Sıkça Sorulan Sorular - Zalusa",
  description:
    "Zalusa hakkında sıkça sorulan sorular: kargo süreçleri, fiyatlandırma, teslimat, entegrasyonlar ve daha fazlası.",
};

export default function SssPage() {
  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
