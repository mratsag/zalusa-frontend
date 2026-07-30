import type { Metadata } from "next";

import { getPageMetadata } from "@/lib/marketing/pageSeo";
import { formatTrDate } from "@/lib/date";
import { BlogListContent, type Post } from "./blog-list-client";

// PHP blog.php portu — blog listesi. DB'den (/api/blogs) beslenir, boşsa statik snapshot fallback. ISR 5dk.
export const revalidate = 300;

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "";

export async function generateMetadata(): Promise<Metadata> {
  return getPageMetadata("blog", {
    title: "Blog - Zalusa",
    description: "Zalusa Blog: e-ihracat rehberleri, sektör analizleri, dropshipping, LUCID kaydı, e-ticaret ipuçları ve güncel içerikler.",
  });
}

type ApiBlog = { title: string; slug: string; excerpt: string; category: string; featuredImage: string; createdAt: string };

async function getPosts(): Promise<Post[]> {
  if (!API) return [];
  try {
    const res = await fetch(`${API}/api/blogs`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    const data = (await res.json()) as ApiBlog[];
    if (!Array.isArray(data)) return [];
    return data.map((b) => ({
      slug: b.slug,
      title: b.title,
      category: b.category || "Genel",
      date: formatTrDate(b.createdAt, { day: "numeric", month: "long", year: "numeric" }),
      image: b.featuredImage || "/assets/blog/blog-7-1771947261.png",
      excerpt: b.excerpt || "",
    }));
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();
  return <BlogListContent posts={posts} />;
}
