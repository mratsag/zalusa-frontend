/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";

// yurtdisi-kargo.php hub — ülke grid + TR il grid (canlı arama). Statik güven bölümleri server'da.

export type HubCountry = { name: string; slug: string; iso2: string };
export type HubProvince = { name: string; slug: string };

function flag(iso2: string) {
  return iso2 ? `https://flagcdn.com/w40/${iso2.toLowerCase()}.png` : "";
}

const FALLBACK_COUNTRIES: HubCountry[] = [
  { name: "Almanya", slug: "almanya", iso2: "DE" },
  { name: "Hollanda", slug: "hollanda", iso2: "NL" },
  { name: "Fransa", slug: "fransa", iso2: "FR" },
  { name: "İngiltere", slug: "ingiltere", iso2: "GB" },
  { name: "İspanya", slug: "ispanya", iso2: "ES" },
  { name: "İtalya", slug: "italya", iso2: "IT" },
  { name: "Amerika", slug: "amerika", iso2: "US" },
  { name: "BAE", slug: "bae", iso2: "AE" },
];

export function YurtdisiKargoGrids({ countries, provinces }: { countries: HubCountry[]; provinces: HubProvince[] }) {
  const list = countries.length ? countries : FALLBACK_COUNTRIES;
  const [cq, setCq] = useState("");
  const [pq, setPq] = useState("");

  const fc = useMemo(() => (cq.trim() ? list.filter((c) => c.name.toLowerCase().includes(cq.toLowerCase().trim())) : list), [cq, list]);
  const fp = useMemo(() => (pq.trim() ? provinces.filter((p) => p.name.toLowerCase().includes(pq.toLowerCase().trim())) : provinces), [pq, provinces]);

  return (
    <>
      {/* Ülke grid */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Ülkelere Göre Kargo</h2>
              <p className="mt-2 text-slate-600">Gönderim yaptığımız ülkeleri keşfedin</p>
            </div>
            <input value={cq} onChange={(e) => setCq(e.target.value)} placeholder="Ülke ara…" className="w-full sm:w-64 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0000BE] focus:ring-1 focus:ring-[#0000BE]" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {fc.map((c) => (
              <a key={c.slug} href={`/yurtdisi-kargo/${c.slug}`} className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 zal-hover-card">
                {c.iso2 ? <img src={flag(c.iso2)} alt="" className="w-6 h-4 object-cover rounded-sm ring-1 ring-slate-200 shrink-0" loading="lazy" /> : <span className="w-6 h-4 rounded-sm bg-slate-100 shrink-0" />}
                <span className="text-sm font-semibold text-slate-800 truncate">{c.name}</span>
                <svg className="w-4 h-4 text-slate-300 group-hover:text-[#0000BE] transition shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </a>
            ))}
            {fc.length === 0 && <p className="col-span-full text-center text-slate-400 py-6">Sonuç bulunamadı.</p>}
          </div>
        </div>
      </section>

      {/* TR il grid */}
      {provinces.length > 0 && (
        <section className="py-14 md:py-20 bg-slate-50/60 border-y border-slate-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">Türkiye Çıkış İlleri</h2>
                <p className="mt-2 text-slate-600">İlinizden yurtdışına kargo gönderin</p>
              </div>
              <input value={pq} onChange={(e) => setPq(e.target.value)} placeholder="İl ara…" className="w-full sm:w-64 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#0000BE] focus:ring-1 focus:ring-[#0000BE]" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {fp.map((p) => (
                <a key={p.slug} href={`/yurtdisi-kargo/${p.slug}`} className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 zal-hover-card">
                  <span className="inline-flex items-center justify-center text-[10px] font-bold text-[#0000BE] bg-blue-50 rounded px-1.5 py-0.5 shrink-0">TR</span>
                  <span className="text-sm font-semibold text-slate-800 truncate">{p.name}</span>
                </a>
              ))}
              {fp.length === 0 && <p className="col-span-full text-center text-slate-400 py-6">Sonuç bulunamadı.</p>}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
