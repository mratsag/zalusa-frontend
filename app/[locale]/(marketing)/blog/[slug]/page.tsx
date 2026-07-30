import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { POSTS, SLUGS } from "./content";
import { BlogDetayContent } from "./blog-detay-client";
import { BlogArticle, type DbBlogPost } from "@/components/marketing/blog-article";

type Params = { params: Promise<{ slug: string }> };

// Statik 3 yazı SSG; DB yazıları için dynamicParams. Önce DB, yoksa statik snapshot fallback.
export const dynamicParams = true;
export const revalidate = 300;

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "";

async function getDbPost(slug: string): Promise<DbBlogPost | null> {
  if (!API) return null;
  try {
    const res = await fetch(`${API}/api/blogs/${encodeURIComponent(slug)}`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return null;
    const d = await res.json();
    if (!d || !d.slug) return null;
    return d as DbBlogPost;
  } catch {
    return null;
  }
}

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const db = await getDbPost(slug);
  if (db) {
    const title = (db.seoTitle || "").trim() || `${db.title} - Zalusa`;
    const description = (db.seoDescription || "").trim() || db.excerpt || db.title;
    return { title, description, openGraph: { title, description, images: db.featuredImage ? [db.featuredImage] : undefined } };
  }
  const p = POSTS[slug];
  if (!p) return {};
  return { title: p.title, description: p.description };
}

export default async function BlogDetayPage({ params }: Params) {
  const { slug } = await params;

  // Önce DB (admin'de yönetilen yazılar)
  const db = await getDbPost(slug);
  if (db) return <BlogArticle post={db} />;

  // Fallback: statik snapshot (ilk 3 yazı, birebir HTML)
  const p = POSTS[slug];
  if (!p) notFound();
  return <BlogDetayContent html={p.html} />;
}
