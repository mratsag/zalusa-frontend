import type { Metadata } from "next";

import { HTML } from "./content";

export const metadata: Metadata = {
  title: "Anlaşmalı Kargolar",
  description: "Zalusa üzerinden çalışabileceğiniz anlaşmalı kargo seçeneklerini ve operasyon avantajlarını görüntüleyin.",
};

export default function Page() {
  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
