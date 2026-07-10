import type { Metadata } from "next";

import { IletisimContent } from "./iletisim-client";

// PHP iletisim.php portu. İçerik ham HTML (cf-email'ler çözüldü); form + chip +
// FAQ + scroll davranışları client component'te. Form → /api/contact.
export const metadata: Metadata = {
  title: "İletişim - Zalusa",
  description:
    "Zalusa ile iletişime geçin. Sorularınız, teklif talepleriniz ve kurumsal çözümler için bize ulaşın.",
};

export default function IletisimPage() {
  return <IletisimContent />;
}
