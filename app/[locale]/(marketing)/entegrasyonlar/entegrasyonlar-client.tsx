"use client";

import { useEffect, useRef } from "react";


// entegrasyonlar.php sticky-nav scroll-spy portu (IntersectionObserver).
// İçerik ham HTML gömülü; effect render sonrası DOM üzerinde çalışır.
// HTML sunucudan prop olarak gelir (dile göre seçilir; ayrıca client bundle'a gömülmez).
export function EntegrasyonlarContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nav = root.querySelector("[data-integration-nav]");
    if (!nav) return;
    const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    if (!links.length) return;

    const map: { id: string; link: HTMLAnchorElement; target: HTMLElement }[] = [];
    links.forEach((link) => {
      const id = (link.getAttribute("href") || "").replace("#", "");
      const target = id ? document.getElementById(id) : null;
      if (target) map.push({ id, link, target });
    });

    const markActive = (id: string) => {
      links.forEach((l) => l.classList.remove("is-active"));
      const found = map.find((m) => m.id === id);
      if (found) found.link.classList.add("is-active");
    };

    let observer: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) markActive((e.target as HTMLElement).id);
          });
        },
        { rootMargin: "-35% 0px -55% 0px", threshold: 0 },
      );
      map.forEach((m) => observer!.observe(m.target));
    }

    if (window.location.hash) markActive(window.location.hash.replace("#", ""));

    const handlers: [HTMLAnchorElement, () => void][] = [];
    links.forEach((link) => {
      const h = () => markActive((link.getAttribute("href") || "").replace("#", ""));
      link.addEventListener("click", h);
      handlers.push([link, h]);
    });

    return () => {
      observer?.disconnect();
      handlers.forEach(([l, h]) => l.removeEventListener("click", h));
    };
  }, []);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: html }} />;
}
