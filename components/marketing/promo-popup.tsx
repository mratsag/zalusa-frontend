"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PromoPopup as PromoData } from "@/lib/marketing/settings";

// Promosyon popup'ı — admin > Ayarlar > "Promosyon Popup" grubundan yönetilir.
// Görünürlük: promo_popup_show toggle'ı. İçerik boşsa layout zaten render etmez.
// Davranış: sayfa açıldıktan ~4 sn sonra belirir; kullanıcı kapatırsa aynı kampanya
// bir daha gösterilmez (localStorage). Admin kampanyayı değiştirince (başlık/kod)
// anahtar değiştiği için yeniden gösterilir.

const DELAY_MS = 4000;

function campaignKey(promo: PromoData): string {
  // Basit ve kararlı imza — kampanya değişince kapatma hafızası sıfırlanır.
  const raw = `${promo.title}|${promo.code}|${promo.badge}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) | 0;
  return `zalusa.promo.dismissed.${h}`;
}

export function PromoPopup({ promo }: { promo: PromoData }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const storageKey = campaignKey(promo);

  const close = useCallback(() => {
    setOpen(false);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* localStorage kapalıysa sorun değil */
    }
  }, [storageKey]);

  // Daha önce kapatılmadıysa gecikmeli aç
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(storageKey) === "1";
    } catch {
      /* noop */
    }
    if (dismissed) return;
    const id = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(id);
  }, [storageKey]);

  // Esc ile kapat + açıkken kapatma butonuna odaklan
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* pano erişimi yoksa sessizce geç */
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-popup-title"
    >
      {/* Arka plan */}
      <button
        type="button"
        aria-label="Kapat"
        onClick={close}
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] cursor-default"
      />

      {/* Kart */}
      <div className="relative w-full max-w-md rounded-3xl bg-white shadow-[0_32px_80px_-20px_rgba(15,23,42,0.45)] ring-1 ring-slate-900/[0.06] overflow-hidden animate-[fadeIn_.2s_ease-out]">
        {/* Üst şerit */}
        <div className="relative bg-gradient-to-br from-[#4D4DF2] to-[#0000BE] px-6 pt-7 pb-8 text-white text-center">
          <span className="absolute top-0 inset-x-0 h-1 bg-[#BFFF00]" />
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            aria-label="Kapat"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
          >
            <i className="ph-bold ph-x text-[14px]" aria-hidden="true" />
          </button>

          {promo.badge && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#BFFF00] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-900">
              <i className="ph-fill ph-sparkle text-[12px]" aria-hidden="true" />
              {promo.badge}
            </span>
          )}

          <h2 id="promo-popup-title" className="mt-3 text-[26px] font-semibold tracking-tight leading-[1.15]">
            {promo.title}
          </h2>
        </div>

        {/* Gövde */}
        <div className="px-6 pt-5 pb-6 text-center">
          {promo.text && (
            <p className="text-[15px] text-slate-600 leading-relaxed whitespace-pre-line">{promo.text}</p>
          )}

          {promo.code && (
            <div className="mt-5">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Kupon Kodu
              </span>
              <button
                type="button"
                onClick={copyCode}
                className="group inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-[#0000BE]/30 bg-[#0000BE]/[0.04] px-5 py-2.5 font-mono text-[17px] font-bold tracking-wider text-[#0000BE] hover:bg-[#0000BE]/[0.08] transition cursor-pointer"
                title="Kodu kopyala"
              >
                {promo.code}
                <i
                  className={`ph-bold ${copied ? "ph-check text-emerald-600" : "ph-copy text-slate-400 group-hover:text-[#0000BE]"} text-[15px]`}
                  aria-hidden="true"
                />
              </button>
              {copied && <p className="mt-1.5 text-[12px] font-medium text-emerald-600">Kopyalandı</p>}
            </div>
          )}

          {promo.ctaText && promo.ctaUrl && (
            <a
              href={promo.ctaUrl}
              onClick={close}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#BFFF00] hover:bg-[#aee600] px-6 h-12 text-sm font-semibold text-slate-900 shadow-sm transition-all"
            >
              {promo.ctaText}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          )}

          <button
            type="button"
            onClick={close}
            className="mt-3 block w-full text-[13px] font-medium text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            Şimdi değil
          </button>
        </div>
      </div>
    </div>
  );
}
