import type { Metadata } from "next";
import { getPageMetadata } from "@/lib/marketing/pageSeo";

import { Hero } from "@/components/marketing/home/hero";
import { Referanslar } from "@/components/marketing/home/referanslar";
import { Istatistik } from "@/components/marketing/home/istatistik";
import { UcAdimda } from "@/components/marketing/home/uc-adimda";
import { KimlerIcin } from "@/components/marketing/home/kimler-icin";
import { KuryeOtomasyonu } from "@/components/marketing/home/kurye-otomasyonu";
import { NedenZalusa } from "@/components/marketing/home/neden-zalusa";
import { TasimaModlari } from "@/components/marketing/home/tasima-modlari";
import { Testimonials } from "@/components/marketing/home/testimonials";
import { BlogOneCikan } from "@/components/marketing/home/blog-onecikan";
import { StickyCalculator } from "@/components/marketing/home/sticky-calculator";

// PHP homepage-v2.php / index.php portu — zalusa.com anasayfası.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata("index", {
  title: "Zalusa - E-ihracat Lojistik ve Kargo Çözümleri",
  description:
    "E-ihracat yapan işletmeler için uçtan uca lojistik. Uluslararası kargo fiyat hesaplama, tek panelden gönderi takibi, DHL, FedEx, UPS entegrasyonu. Ücretsiz deneyin.",
  }, locale);
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Referanslar />
      <Istatistik />
      <UcAdimda />
      <KuryeOtomasyonu />
      <KimlerIcin />
      <NedenZalusa />
      <TasimaModlari />
      <Testimonials />
      <BlogOneCikan />
      <StickyCalculator />
    </>
  );
}
