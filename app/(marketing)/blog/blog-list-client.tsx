/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/components/marketing/page-header";

export type Post = {
  slug: string;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt: string;
};

export const STATIC_POSTS: Post[] = [
  {
    slug: "e-ihracat-bilinmesi-gereken-tarihler-guncel-takvim",
    title: "E-İhracat Bilinmesi Gereken Tarihler (2026 Güncel Takvim)",
    category: "E-İhracat",
    date: "24 Feb 2026",
    image: "/assets/blog/blog-7-1771947261.png",
    excerpt: "E-ihracat yapan işletmeler için kritik tarihler; vergi beyannameleri, devlet destek başvuruları,...",
  },
  {
    slug: "dropshipping-nedir-ve-nasil-yapilir-ultimate-rehber",
    title: "Dropshipping Nedir ve Nasıl Yapılır? (2026 Ultimate Rehber)",
    category: "E-ticaret",
    date: "24 Feb 2026",
    image: "/assets/blog/blog-6-1776981999.png",
    excerpt: "Dropshipping, stok tutmadan ürün satışı yapılan bir e-ticaret modelidir.",
  },
  {
    slug: "lucid-kaydi-nedir-almanya-ambalaj-yasasi-rehberi-guncel",
    title: "LUCID Kaydı Nedir? Almanya Ambalaj Yasası Rehberi (2026 Güncel)",
    category: "Dış Ticaret",
    date: "24 Feb 2026",
    image: "/assets/blog/blog-5-1776980837.png",
    excerpt: "LUCID kaydı, Almanya’da ambalaj atıklarını yönetme ve geri dönüşüm süreçlerini düzenleyen resmi b...",
  },
];

export function BlogListContent({ posts }: { posts?: Post[] }) {
  const list = posts && posts.length ? posts : STATIC_POSTS;
  const CATEGORIES = ["Tümü", ...Array.from(new Set(list.map((p) => p.category)))];

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tümü");

  const filtered = useMemo(
    () =>
      list.filter((p) => {
        const matchCat = cat === "Tümü" || p.category === cat;
        const matchQ = !q.trim() || p.title.toLowerCase().includes(q.toLowerCase().trim());
        return matchCat && matchQ;
      }),
    [q, cat, list],
  );

  return (
    <>
      <PageHeader current="Blog" title="Blog" subtitle="E-ihracat rehberi, sektör analizleri ve pratik ipuçları." />

      <section className="pt-8 md:pt-10 pb-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Arama + kategori */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
            <div className="relative w-full md:w-[420px]">
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Blogda ara..."
                className="w-full bg-white border-2 border-slate-200 rounded-xl py-3 pl-4 pr-11 text-sm text-slate-900 focus:outline-none focus:border-[#0000BE]"
              />
              <svg className="w-6 h-6 absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
              </svg>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                    cat === c
                      ? "bg-[#0000BE] text-white border-[#0000BE]"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Kartlar */}
          {filtered.length ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              {filtered.map((p) => (
                <a
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:shadow-[0_14px_36px_-12px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 hover:border-slate-300 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                    <img loading="lazy" decoding="async" src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col flex-1 p-5 md:p-6">
                    <div className="flex items-center gap-2 text-[11.5px] mb-3">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#EEF0FF] text-[#0000BE] font-semibold uppercase tracking-wider">{p.category}</span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500">{p.date}</span>
                    </div>
                    <h3 className="text-[17px] md:text-[18px] font-semibold tracking-tight text-slate-900 leading-snug mb-2 line-clamp-2 group-hover:text-[#0000BE] transition-colors">{p.title}</h3>
                    <p className="text-[14px] text-slate-500 leading-relaxed line-clamp-2 mb-4">{p.excerpt}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0000BE]">
                      Yazıyı oku
                      <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-16">Aramanızla eşleşen yazı bulunamadı.</p>
          )}
        </div>
      </section>
    </>
  );
}
