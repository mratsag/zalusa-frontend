"use client";

import { useEffect, useRef } from "react";

// blog-detay.php: içerik ham HTML (blog CSS gömülü). Okuma-ilerleme çubuğu React'e alındı.
export function BlogDetayContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bar = document.getElementById("zal-read-progress");
    const article = document.getElementById("blog-article-body");
    if (!bar || !article) return;
    const onScroll = () => {
      const rect = article.getBoundingClientRect();
      const total = article.offsetHeight - window.innerHeight;
      const scrolled = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 0;
      bar.style.width = (scrolled * 100).toFixed(1) + "%";
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}
