import type { Metadata } from "next";

import { HTML } from "./content";

export const metadata: Metadata = {
  title: "Kariyer Fırsatları",
  description: "Zalusa kariyer fırsatlarını keşfedin. Ürün, operasyon ve teknoloji ekiplerimizde açık pozisyonları inceleyin.",
};

export default function Page() {
  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
