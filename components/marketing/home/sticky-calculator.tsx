"use client";

import { useEffect, useState } from "react";

import { QuickCalculatorForm } from "@/components/marketing/quick-calculator";

// homepage-v2.php STICKY CALCULATOR (floating widget).
// - Sağ-alt sabit widget; scrollY >= 600'de görünür.
// - Pill (kapalı) ↔ Panel (açık). Panel içinde paylaşılan "Kargo Hesapla" formu.
export function StickyCalculator() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY >= 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div id="sticky-calculator" className={`fixed bottom-5 left-5 md:bottom-6 md:left-6 z-40 ${visible ? "" : "hidden"}`}>
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="group relative inline-flex items-center gap-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-full pl-2 pr-4 py-2 shadow-[0_10px_30px_-8px_rgba(15,23,42,0.18),0_4px_12px_-4px_rgba(15,23,42,0.10)] hover:shadow-[0_14px_36px_-10px_rgba(15,23,42,0.25),0_4px_12px_-4px_rgba(15,23,42,0.10)] hover:-translate-y-0.5 transition-all duration-200"
        >
          <span className="relative inline-flex items-center justify-center w-9 h-9 rounded-full bg-[#0000BE] text-white">
            <i className="ph-bold ph-calculator text-[16px]" />
            <span className="absolute -top-0.5 -right-0.5 flex w-3 h-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BFFF00] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#BFFF00] border-2 border-white" />
            </span>
          </span>
          <span className="flex flex-col items-start leading-tight">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Anında</span>
            <span className="text-[13px] font-bold text-slate-900">Fiyat Hesapla</span>
          </span>
        </button>
      )}

      {expanded && (
        <div className="w-[calc(100vw-2.5rem)] sm:w-[400px] max-h-[78vh] overflow-y-auto bg-white rounded-2xl shadow-[0_24px_60px_-12px_rgba(15,23,42,0.25),0_8px_20px_-6px_rgba(15,23,42,0.12)] border border-slate-200 ring-1 ring-slate-900/[0.02]">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#0000BE] text-white">
                <i className="ph-bold ph-calculator text-[15px]" />
              </span>
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Zalusa</span>
                <span className="text-[14px] font-semibold text-slate-900">Hızlı Fiyat Hesapla</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
            >
              <i className="ph-bold ph-x text-[14px]" />
            </button>
          </div>
          <div className="p-4">
            <QuickCalculatorForm />
          </div>
        </div>
      )}
    </div>
  );
}
