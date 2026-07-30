"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { getPathname, usePathname } from "@/i18n/navigation";
import { routing, type AppLocale } from "@/i18n/routing";

// Üst banttaki dil seçici. Aynı sayfanın diğer dildeki karşılığına gider
// (usePathname dil önekini içermez; router.replace locale ile doğru URL'i üretir).
const LABELS: Record<AppLocale, string> = { tr: "TR", en: "EN" };

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("language");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const switchTo = (next: AppLocale) => {
    setOpen(false);
    if (next === locale) return;
    // Tam sayfa yükleme (istemci geçişi değil): kök layout'taki <html lang> sunucuda
    // üretildiği için ancak tam yüklemede yeni dile göre güncellenir.
    // Sorgu parametreleri korunur (ör. /kargo-takip?kod=...).
    const search = typeof window !== "undefined" ? window.location.search : "";
    const target = getPathname({ href: pathname, locale: next });
    window.location.assign(`${target}${search}`);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("switchLabel")}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 font-medium hover:text-[#0000BE] transition cursor-pointer whitespace-nowrap"
      >
        <i className="ph-bold ph-globe text-[13px] text-[#0000BE]" aria-hidden="true" />
        {LABELS[locale]}
        <i className="ph-bold ph-caret-down text-[10px] text-slate-400" aria-hidden="true" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 top-full mt-1.5 min-w-[132px] bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden py-1 z-50"
        >
          {routing.locales.map((l) => (
            <li key={l} role="option" aria-selected={l === locale}>
              <button
                type="button"
                onClick={() => switchTo(l)}
                className={`w-full text-left px-3.5 py-2 text-[12px] cursor-pointer transition flex items-center justify-between gap-2 ${
                  l === locale
                    ? "bg-blue-50 text-[#0000BE] font-semibold"
                    : "text-slate-700 hover:bg-slate-50 font-medium"
                }`}
              >
                {t(l)}
                <span className="text-[10px] font-bold text-slate-400">{LABELS[l]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
