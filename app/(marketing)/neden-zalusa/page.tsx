import type { Metadata } from "next";

import { HTML } from "./content";

export const metadata: Metadata = {
  title: "Neden Zalusa?",
  description: "Tek panelde fiyat karşılaştırma, gönderi takibi ve operasyon yönetimi ile Zalusa farkını keşfedin.",
};

export default function Page() {
  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
