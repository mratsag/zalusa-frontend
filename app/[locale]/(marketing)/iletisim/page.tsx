import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import { IletisimContent } from "./iletisim-client";

// PHP iletisim.php portu. İçerik ham HTML (cf-email'ler çözüldü); form + chip +
// FAQ + scroll davranışları client component'te. Form → /api/contact.
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("iletisim", {
  title: "İletişim - Zalusa",
  description:
    "Zalusa ile iletişime geçin. Sorularınız, teklif talepleriniz ve kurumsal çözümler için bize ulaşın.",
  });
}

export default function IletisimPage() {
  return <IletisimContent />;
}
