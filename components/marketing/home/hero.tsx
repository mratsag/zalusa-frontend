/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";

// homepage-v2.php hero portu (satır 38-140 + 1240-1290 JS).
// - Dönen başlık: ['En Akıllı','En Pratik','En Hızlı','En Kolay'], 2200ms.
// - Video: poster→iframe swap. NOT: canlıda video ID henüz 'VIDEO_ID_HERE'
//   placeholder'ı ve /assets/video-poster.jpg asset'i eksik (birebir korundu).
const ROTATOR_WORDS = ["En Akıllı", "En Pratik", "En Hızlı", "En Kolay"];

export function Hero() {
  const wrapRef = useRef<HTMLSpanElement>(null);
  const elRef = useRef<HTMLSpanElement>(null);
  const [playing, setPlaying] = useState(false);

  // hero-rotator: vanilla JS mantığı birebir
  useEffect(() => {
    const wrap = wrapRef.current;
    const el = elRef.current;
    if (!wrap || !el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const id = window.setInterval(() => {
      wrap.style.opacity = "0";
      wrap.style.transform = "translateY(-8px)";
      window.setTimeout(() => {
        i = (i + 1) % ROTATOR_WORDS.length;
        el.textContent = ROTATOR_WORDS[i];
        wrap.style.transform = "translateY(8px)";
        requestAnimationFrame(() => {
          wrap.style.opacity = "1";
          wrap.style.transform = "translateY(0)";
        });
      }, 300);
    }, 2200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <main className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative py-6 md:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-14 items-center">
          {/* Sol kolon */}
          <div className="space-y-4 md:space-y-6 flex flex-col items-center md:items-start text-center md:text-left mt-6 md:mt-0">
            <a
              href="/yapay-zeka"
              className="group mt-1 md:mt-2 inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-[12px] md:text-[13px] text-slate-700 transition-all"
            >
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10.5px] md:text-[11px] font-bold uppercase tracking-wider text-[#0000BE]">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0000BE] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#0000BE]" />
                </span>
                Yeni
              </span>
              <span className="font-medium">Zalusa AI ile uçtan uca otomasyon</span>
              <svg
                className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <h1 className="!mt-1 md:!mt-2 font-black tracking-[-0.02em] leading-[1.0] text-slate-900">
              <span className="block text-[42px] sm:text-[54px] md:text-[62px] lg:text-[68px]">
                <span
                  ref={wrapRef}
                  id="hero-rotator-wrap"
                  className="relative inline-block will-change-transform transition-all duration-300"
                >
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-1 md:bottom-2 h-3 sm:h-4 md:h-5 bg-[#BFFF00] -z-0 -rotate-1 rounded-sm"
                  />
                  <span ref={elRef} id="hero-rotator" className="relative z-10">
                    En Akıllı
                  </span>
                </span>
              </span>
              <span className="block text-[42px] sm:text-[54px] md:text-[62px] lg:text-[68px] text-[#0000BE]">
                Kargo Gönderimi.
              </span>
              <span className="block mt-4 text-[22px] sm:text-[26px] md:text-[30px] lg:text-[34px] font-medium text-slate-600 leading-[1.25]">
                <span className="font-semibold text-slate-900">2 dakikada</span> gönderini oluştur.
              </span>
            </h1>

            <p className="text-[15px] sm:text-base md:text-[17px] text-slate-600 max-w-[40rem] leading-relaxed">
              Şeffaf fiyat, anlık takip, tam kontrol. Zalusa AI lojistik sürecini baştan tasarladı —
              siz sadece gönderin, gerisini biz hallederiz.
            </p>

            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <a
                href="/giris"
                className="inline-flex items-center justify-center gap-2 px-6 h-11 md:h-12 bg-[#BFFF00] hover:bg-[#aee600] text-slate-900 text-sm font-semibold rounded-lg shadow-sm cursor-pointer transition-all whitespace-nowrap"
              >
                Ücretsiz Teklif Al
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a
                href="/yurtdisi-kargo-fiyat-hesaplama"
                className="inline-flex items-center justify-center px-6 h-11 md:h-12 bg-white hover:bg-gray-50 text-slate-700 border border-gray-200 text-sm font-semibold rounded-lg cursor-pointer transition-all whitespace-nowrap"
              >
                Fiyat Hesapla
              </a>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-3 pt-1">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  <img loading="lazy" decoding="async" className="w-9 h-9 rounded-full ring-2 ring-white object-cover" src="/assets/avatars/av1.jpg" alt="Müşteri" />
                  <img loading="lazy" decoding="async" className="w-9 h-9 rounded-full ring-2 ring-white object-cover" src="/assets/avatars/av2.jpg" alt="Müşteri" />
                  <img loading="lazy" decoding="async" className="w-9 h-9 rounded-full ring-2 ring-white object-cover" src="/assets/avatars/av3.jpg" alt="Müşteri" />
                  <div className="w-9 h-9 rounded-full ring-2 ring-white bg-emerald-500 text-white flex items-center justify-center text-[11px] font-semibold">
                    +7
                  </div>
                </div>
                <div className="flex items-center gap-2 text-slate-600 text-[13px]">
                  <span className="inline-flex items-center gap-1 text-amber-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.78L10 14.77l-5.2 2.73.99-5.78L1.58 7.62l5.82-.85L10 1.5z" />
                    </svg>
                    <span className="font-semibold text-slate-900">4.9</span>
                  </span>
                  <span className="text-slate-400">·</span>
                  <span>1.200+ değerlendirme</span>
                </div>
              </div>
              <div className="hidden sm:block h-5 w-px bg-slate-200" />
              <div className="flex items-center gap-2 text-slate-600 text-[13px]">
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span>
                  <span className="font-semibold text-slate-900">7/24</span> canlı destek
                </span>
              </div>
            </div>
          </div>

          {/* Sağ kolon: video */}
          <div className="relative w-full lg:justify-self-end mt-2 lg:mt-0 lg:max-w-xl">
            <div className="relative rounded-2xl overflow-hidden shadow-[0_24px_60px_-22px_rgba(0,0,190,0.25)] border border-slate-200/80 ring-1 ring-slate-900/[0.02] bg-slate-900 aspect-video">
              <div id="hero-video-container" className="w-full h-full">
                {!playing ? (
                  <div
                    id="hero-video-poster"
                    className="relative w-full h-full cursor-pointer group"
                    onClick={() => setPlaying(true)}
                  >
                    <img
                      src="/assets/video-poster.jpg"
                      alt="Zalusa kullanım videosu"
                      className="w-full h-full object-cover"
                      width={1280}
                      height={720}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/20 group-hover:from-slate-900/70 transition-all" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/95 shadow-[0_8px_30px_rgba(0,0,190,0.35)] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-7 h-7 md:w-8 md:h-8 text-[#0000BE] ml-1" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="text-white text-[13px] font-semibold">
                        Zalusa nasıl çalışır? 2 dakikada izle
                      </span>
                      <span className="text-white/70 text-[12px]">2:14</span>
                    </div>
                  </div>
                ) : (
                  <iframe
                    id="hero-video-iframe"
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/VIDEO_ID_HERE?autoplay=1&rel=0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
