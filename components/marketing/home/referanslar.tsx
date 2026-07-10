/* eslint-disable @next/next/no-img-element */
import type { ReactNode } from "react";

// homepage-v2.php REFERANSLAR bölümü (satır 142 / live 751-819) portu.
// Admin'de referans varsa dinamik marquee (logolar), yoksa stilize fallback (PHP ile birebir).
// Marquee: animate-scroll (translateX -50%), kartlar 2 kez basılır (seamless loop).

type ApiReference = { name: string; logo_path: string; link_url: string };

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "";

// Aktif referanslar — hata durumunda boş (fallback devreye girer). ISR: 5 dk.
async function getReferences(): Promise<ApiReference[]> {
  if (!API) return [];
  try {
    const res = await fetch(`${API}/api/references`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as ApiReference[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Dinamik referans logoları — PHP array_chunk + yön alternasyonu birebir.
function DynamicMarquee({ refs }: { refs: ApiReference[] }) {
  const count = refs.length;
  const rows = count >= 15 ? 3 : count >= 8 ? 2 : 1;
  const perRow = Math.max(1, Math.ceil(count / rows));
  const chunks = chunk(refs, perRow);

  const Card = ({ r, dup }: { r: ApiReference; dup?: boolean }) => (
    <div className="ref-card flex h-16 md:h-20 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white px-6 md:px-8 shadow-sm" {...(dup ? { "aria-hidden": true } : {})}>
      <img
        src={r.logo_path}
        alt={dup ? "" : r.name}
        className="max-h-9 md:max-h-11 w-auto max-w-[150px] object-contain opacity-70 transition hover:opacity-100"
        loading="lazy"
        decoding="async"
      />
    </div>
  );

  return (
    <div className="space-y-4 md:space-y-5">
      {chunks.map((row, ri) => (
        <div key={ri} className="relative overflow-hidden ref-marquee">
          <div className={`flex ${ri % 2 === 1 ? "animate-scroll-rev" : "animate-scroll"} gap-4 md:gap-5 w-max items-center`}>
            {row.map((r, i) =>
              r.link_url ? (
                <a key={`a-${i}`} href={r.link_url} target="_blank" rel="noopener" className="ref-card flex h-16 md:h-20 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 bg-white px-6 md:px-8 shadow-sm">
                  <img src={r.logo_path} alt={r.name} className="max-h-9 md:max-h-11 w-auto max-w-[150px] object-contain opacity-70 transition hover:opacity-100" loading="lazy" decoding="async" />
                </a>
              ) : (
                <Card key={`c-${i}`} r={r} />
              ),
            )}
            {/* ikinci kopya = kesintisiz döngü */}
            {row.map((r, i) => (
              <Card key={`d-${i}`} r={r} dup />
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-slate-50 to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-slate-50 to-transparent z-10" />
        </div>
      ))}
    </div>
  );
}

type Brand = { gap?: boolean; node: ReactNode };

const BRANDS: Brand[] = [
  {
    node: (
      <span className="text-[15px] md:text-[17px] font-bold tracking-tight" style={{ fontFamily: "'Georgia', serif", color: "#7B4F1D" }}>
        Karaköy <span className="italic">Güllüoğlu</span>
      </span>
    ),
  },
  {
    node: (
      <span className="text-[15px] md:text-[17px] font-extrabold tracking-tight" style={{ color: "#B91C1C" }}>
        Malatya<span className="text-slate-800">Pazarı</span>
      </span>
    ),
  },
  {
    node: (
      <span className="text-[15px] md:text-[17px] font-bold uppercase tracking-[0.2em]" style={{ color: "#1F2937" }}>
        HAKİ <span className="text-emerald-700">MODA</span>
      </span>
    ),
  },
  {
    gap: true,
    node: (
      <>
        <svg className="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
        </svg>
        <span className="text-[15px] md:text-[17px] font-semibold tracking-tight italic" style={{ fontFamily: "'Georgia', serif", color: "#065F46" }}>
          Botanivo
        </span>
      </>
    ),
  },
  {
    node: (
      <span className="text-[17px] md:text-[19px] tracking-tight" style={{ fontFamily: "'Brush Script MT','Lucida Handwriting',cursive", color: "#111827" }}>
        Monapieta
      </span>
    ),
  },
  {
    gap: true,
    node: (
      <>
        <svg className="w-4 h-4 text-cyan-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2l2.39 7.36H22l-6.18 4.5L18.18 22 12 17.5 5.82 22l2.36-8.14L2 9.36h7.61L12 2z" />
        </svg>
        <span className="text-[15px] md:text-[17px] font-bold uppercase tracking-wider" style={{ color: "#0E7490" }}>
          Twinkle
        </span>
      </>
    ),
  },
  {
    node: (
      <span className="text-[15px] md:text-[17px] font-black tracking-[-0.02em] uppercase" style={{ color: "#111827" }}>
        DEKO<span className="text-rose-600">.</span>
        <span className="text-slate-500 font-medium">TURKEY</span>
      </span>
    ),
  },
  {
    node: (
      <span className="text-[15px] md:text-[17px] font-semibold tracking-[0.18em] uppercase" style={{ fontFamily: "'Times New Roman',serif", color: "#581C87" }}>
        ART<span className="font-normal">sanatsal</span>
      </span>
    ),
  },
  {
    node: (
      <span className="text-[15px] md:text-[17px] font-black italic tracking-tight" style={{ color: "#EA580C" }}>
        Explo<span className="text-slate-900">ison</span>
      </span>
    ),
  },
  {
    node: (
      <span className="text-[15px] md:text-[17px] font-bold italic" style={{ fontFamily: "'Georgia', serif", color: "#7C2D12" }}>
        Bayburt<span className="text-amber-600">ova</span>
      </span>
    ),
  },
  {
    node: (
      <span className="text-[15px] md:text-[17px] font-light tracking-[0.3em] uppercase" style={{ color: "#0F172A" }}>
        ARCON<span className="font-bold mx-1">·</span>
        <span className="text-pink-600 font-medium">KOZMETİK</span>
      </span>
    ),
  },
];

function BrandCard({ brand, dup }: { brand: Brand; dup?: boolean }) {
  return (
    <div
      className={`flex items-center ${brand.gap ? "gap-2 " : ""}justify-center h-16 md:h-20 px-5 md:px-7 bg-white border border-slate-200/80 rounded-xl shadow-sm whitespace-nowrap brand-card`}
      {...(dup ? { "aria-hidden": true } : {})}
    >
      {brand.node}
    </div>
  );
}

const PARTNERS = [
  { src: "/assets/tnt.png", alt: "TNT" },
  { src: "/assets/fedex.png", alt: "FedEx" },
  { src: "/assets/dhl.png", alt: "DHL" },
  { src: "/assets/gls.png", alt: "GLS" },
  { src: "/assets/ups.png", alt: "UPS" },
];

const GLOBAL_PARTNERS = [
  { src: "/assets/shopify-official.svg", alt: "Shopify", cls: "h-7 md:h-8" },
  { src: "/assets/amazon-official.svg", alt: "Amazon", cls: "h-5 md:h-6" },
  { src: "/assets/etsy-official.svg", alt: "Etsy", cls: "h-5 md:h-6" },
  { src: "/assets/ebay-official.svg", alt: "eBay", cls: "h-5 md:h-6" },
  { src: "/assets/aliexpress-official.svg", alt: "AliExpress", cls: "h-4 md:h-5" },
  { src: "/assets/wish-color.svg", alt: "Wish", cls: "h-5 md:h-6" },
  { src: "/assets/woo-color.svg", alt: "Woo", cls: "h-5 md:h-6" },
  { src: "/assets/ikas-color.svg", alt: "ikas", cls: "h-5 md:h-6" },
];

function FallbackMarquee() {
  return (
    <div className="relative overflow-hidden ref-marquee">
      <div className="flex animate-scroll gap-4 md:gap-5 w-max items-center">
        {BRANDS.map((b, i) => (
          <BrandCard key={`b-${i}`} brand={b} />
        ))}
        {/* DUPLICATE for seamless loop */}
        {BRANDS.map((b, i) => (
          <BrandCard key={`d-${i}`} brand={b} dup />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-slate-50 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-slate-50 to-transparent z-10" />
    </div>
  );
}

export async function Referanslar() {
  const refs = await getReferences();

  return (
    <section className="py-12 md:py-16 bg-slate-50/60 border-y border-slate-200/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-7 md:mb-9">
          Yüzlerce markanın tercihi
        </p>

        {/* Marquee — admin'de referans varsa dinamik, yoksa stilize fallback */}
        {refs.length > 0 ? <DynamicMarquee refs={refs} /> : <FallbackMarquee />}

        {/* Anlaşmalı Partnerler */}
        <div className="mt-10 md:mt-14 pt-8 md:pt-10 border-t border-slate-200/60">
          <p className="text-center text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-6 md:mb-7">
            Anlaşmalı Partnerler
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-9 gap-y-5 md:gap-x-16">
            {PARTNERS.map((p) => (
              <img
                key={p.alt}
                src={p.src}
                alt={p.alt}
                className="h-5 md:h-7 w-auto object-contain opacity-60 hover:opacity-100 transition"
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>

        {/* Global İş Ortaklarımız */}
        <div className="mt-10 md:mt-14 pt-8 md:pt-10 border-t border-slate-200/60">
          <p className="text-center text-[11px] md:text-[12px] font-semibold uppercase tracking-[0.16em] text-slate-500 mb-6 md:mb-7">
            Global İş Ortaklarımız
          </p>
          <div className="flex items-center justify-center gap-x-6 gap-y-4 md:gap-x-10 flex-wrap md:flex-nowrap">
            {GLOBAL_PARTNERS.map((p) => (
              <img
                key={p.alt}
                src={p.src}
                alt={p.alt}
                className={`${p.cls} w-auto object-contain shrink-0`}
                loading="lazy"
                decoding="async"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
