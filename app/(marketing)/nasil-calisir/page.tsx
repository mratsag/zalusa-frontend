import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import { NASIL_CALISIR_HTML } from "./content";

// PHP nasil-calisir.php portu. İçerik statik mockup bölümü → birebir ham HTML
// (dangerouslySetInnerHTML). Header/footer/modal marketing layout'tan gelir.
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("nasil-calisir", {
  title: "Zalusa Nasıl Çalışır?",
  description:
    "Zalusa olarak, e-ihracat süreçlerinizi kolaylaştırmak için geliştirilmiş intuitif bir platform sunuyoruz. Gönderi hazırlamadan takip aşamasına kadar her adımda yanınızdayız.",
  });
}

export default function NasilCalisirPage() {
  return <div dangerouslySetInnerHTML={{ __html: NASIL_CALISIR_HTML }} />;
}
