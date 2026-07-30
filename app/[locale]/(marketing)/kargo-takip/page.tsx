import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getPageMetadata } from "@/lib/marketing/pageSeo";

import { TrackClient } from "./track-client";

// Public kargo takip — giriş gerektirmez. Üst bandaki "Yurt Dışı Kargo Takip"
// linkinin hedefi. Sorgu: GET {API}/api/shipments/track/:code (public endpoint).
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "tracking" });
  return getPageMetadata("kargo-takip", {
    title: t("metaTitle"),
    description: t("metaDesc"),
  }, locale);
}

export default function KargoTakipPage() {
  return <TrackClient />;
}
