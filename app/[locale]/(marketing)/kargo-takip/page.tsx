import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import { TrackClient } from "./track-client";

// Public kargo takip — giriş gerektirmez. Üst bandaki "Yurt Dışı Kargo Takip"
// linkinin hedefi. Sorgu: GET {API}/api/shipments/track/:code (public endpoint).
export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("kargo-takip", {
    title: "Yurt Dışı Kargo Takip - Zalusa",
    description:
      "Zalusa takip kodunuz (ZLS-SHP-...) veya taşıyıcı takip numaranız ile yurt dışı kargonuzu anında sorgulayın. Yurt içi ve yurt dışı hareketleri tek ekranda görün.",
  });
}

export default function KargoTakipPage() {
  return <TrackClient />;
}
