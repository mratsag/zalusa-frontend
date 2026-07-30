import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getPageMetadata } from "@/lib/marketing/pageSeo";
import { PageHeader } from "@/components/marketing/page-header";
import { ReviewsClient, type Review } from "./reviews-client";
import { FeedbackForm } from "./feedback-form";

// Müşteri yorumları — veriler DB'den (GET /api/testimonials), admin'den yönetilir.
// Önceden 1,3 MB statik HTML (content.ts) idi; DB'ye taşındı.
const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return getPageMetadata("yorumlar", {
    title: "Yorumlar - Zalusa",
    description:
      "Zalusa kullanıcı yorumları ve değerlendirmeleri. Genel ve ülke sayfalarındaki tüm değerlendirmeler burada listelenir.",
  }, locale);
}

type ApiResponse = { testimonials: Review[]; total: number; averageRating: number };

async function getReviews(locale: string): Promise<ApiResponse> {
  const empty: ApiResponse = { testimonials: [], total: 0, averageRating: 0 };
  if (!API) return empty;
  try {
    const res = await fetch(`${API}/api/testimonials?lang=${encodeURIComponent(locale)}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return empty;
    const data = (await res.json()) as ApiResponse;
    return Array.isArray(data?.testimonials) ? data : empty;
  } catch {
    return empty; // fail-safe: sayfa yine açılır, liste boş görünür
  }
}

export default async function YorumlarPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const [data, t] = await Promise.all([getReviews(locale), getTranslations("reviews")]);

  return (
    <>
      <PageHeader current={t("title")} title={t("title")} subtitle={t("subtitle")} />

      <section className="py-10 md:py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 md:space-y-14">
          <ReviewsClient
            reviews={data.testimonials}
            total={data.total}
            averageRating={data.averageRating}
          />
          <FeedbackForm />
        </div>
      </section>
    </>
  );
}
