import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { POSTS, SLUGS } from "./content";
import { BlogDetayContent } from "./blog-detay-client";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const p = POSTS[slug];
  if (!p) return {};
  return { title: p.title, description: p.description };
}

export default async function BlogDetayPage({ params }: Params) {
  const { slug } = await params;
  const p = POSTS[slug];
  if (!p) notFound();
  return <BlogDetayContent html={p.html} />;
}
