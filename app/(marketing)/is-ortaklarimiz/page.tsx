import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import { HTML } from "./content";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("is-ortaklarimiz", {
  title: "İş Ortaklarımız",
  description: "Zalusa'nın birlikte çalıştığı teknoloji, operasyon ve lojistik iş ortaklarını inceleyin.",
  });
}

export default function Page() {
  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
