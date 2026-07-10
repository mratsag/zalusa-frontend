import type { Metadata } from "next";

import { HTML } from "./content";

export const metadata: Metadata = {
  title: "İş Ortaklarımız",
  description: "Zalusa'nın birlikte çalıştığı teknoloji, operasyon ve lojistik iş ortaklarını inceleyin.",
};

export default function Page() {
  return <div dangerouslySetInnerHTML={{ __html: HTML }} />;
}
