import type { Metadata } from "next";

import { BlogListContent } from "./blog-list-client";

// PHP blog.php portu — blog listesi (arama + kategori filtre). 3 yazı.
export const metadata: Metadata = {
  title: "Blog - Zalusa",
  description:
    "Zalusa Blog: e-ihracat rehberleri, sektör analizleri, dropshipping, LUCID kaydı, e-ticaret ipuçları ve güncel içerikler.",
};

export default function BlogPage() {
  return <BlogListContent />;
}
