"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import type { NavItem, NavChild } from "@/lib/marketing/menu";
import { LanguageSwitcher } from "./language-switcher";
import { useOfferModal } from "./offer-modal";

// PHP includes/header.php birebir portu.
// - Üst iletişim bandı (#top-contactbar)
// - Sticky nav (#site-header): logo + desktop mega-menü (CSS group-hover) + CTA
// - Mobil menü: hamburger toggle + <details> accordion (native)
// Menü admin'den (menu_items) gelir; layout server-side çeker, prop geçer.
// "Kurumsal" etiketli üst öğe → link yerine modal (openKurumsal).
export function SiteHeader({ menu }: { menu: NavItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openKurumsal } = useOfferModal();
  const t = useTranslations("topbar");
  const tNav = useTranslations("nav");

  return (
    <>
      {/* Üst iletişim bandı — açık zemin: solda iletişim, sağda hızlı erişim + dil seçici.
          z-[60]: sticky nav z-50 olduğu için, dil menüsü nav'ın ALTINDA kalmasın diye üstte. */}
      <div
        id="top-contactbar"
        dir="ltr"
        className="bg-slate-50 border-b border-slate-200/80 text-slate-600 text-[11px] md:text-xs relative z-[60]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 h-9">
          {/* Sol: iletişim */}
          <div className="flex items-center gap-4 md:gap-6 min-w-0">
            <a
              href="tel:08502551840"
              className="inline-flex items-center gap-1.5 font-semibold hover:text-[#0000BE] transition whitespace-nowrap"
            >
              <i className="ph-bold ph-phone text-[13px] text-[#0000BE]" aria-hidden="true" />
              0850 255 18 40
            </a>
            <a
              href="mailto:destek@zalusa.com"
              className="hidden sm:inline-flex items-center gap-1.5 font-medium hover:text-[#0000BE] transition whitespace-nowrap"
            >
              <i className="ph-bold ph-envelope-simple text-[13px] text-[#0000BE]" aria-hidden="true" />
              destek@zalusa.com
            </a>
          </div>

          {/* Sağ: hızlı erişim */}
          <div className="flex items-center gap-4 md:gap-6">
            <a
              href="/kargo-takip"
              className="inline-flex items-center gap-1.5 font-medium hover:text-[#0000BE] transition whitespace-nowrap"
            >
              <i className="ph-bold ph-package text-[13px] text-[#0000BE]" aria-hidden="true" />
              <span className="sm:hidden">{t("trackingShort")}</span>
              <span className="hidden sm:inline">{t("trackingLong")}</span>
            </a>
            <span className="hidden sm:block w-px h-3.5 bg-slate-300" aria-hidden="true" />
            <a
              href="/yurtdisi-kargo-fiyat-hesaplama"
              className="hidden sm:inline-flex items-center gap-1.5 font-medium hover:text-[#0000BE] transition whitespace-nowrap"
            >
              <i className="ph-bold ph-calculator text-[13px] text-[#0000BE]" aria-hidden="true" />
              {t("calculator")}
            </a>
            <span className="w-px h-3.5 bg-slate-300" aria-hidden="true" />
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <nav
        id="site-header"
        dir="ltr"
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm transition-all duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-2">
              <a
                href="/"
                className="site-logo-link flex items-center gap-2 text-[#0000BE] hover:opacity-90 transition"
                title={tNav("homeTitle")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logo-ikon.png"
                  alt="Zalusa Logo İkonu"
                  title="Zalusa Logo İkonu"
                  className="site-logo-icon flex-shrink-0 w-8 h-8 rounded-lg object-contain"
                  width={48}
                  height={48}
                />
                <span className="text-2xl font-bold tracking-tighter font-montserrat">
                  Zalusa
                </span>
              </a>
            </div>

            {/* Desktop menü */}
            <div className="hidden md:flex flex-1 items-center justify-center space-x-8">
              {menu.map((item, i) => (
                <DesktopItem key={i} item={item} onKurumsal={openKurumsal} />
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-5">
              <a
                href="/giris"
                className="text-slate-700 hover:text-slate-900 font-medium text-[14px] transition whitespace-nowrap"
              >
                {tNav("login")}
              </a>
              <a
                href="/giris"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#BFFF00] hover:bg-[#aee600] text-slate-900 text-sm font-semibold rounded-lg shadow-sm cursor-pointer transition-all whitespace-nowrap"
              >
                {tNav("cta")}
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Mobil hamburger */}
            <div className="flex md:hidden items-center ml-4">
              <button
                type="button"
                id="mobile-menu-btn"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
                aria-label={tNav("toggleMenu")}
                onClick={() => setMobileOpen((v) => !v)}
                className="text-slate-900 p-2 -mr-2 rounded-xl hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0000BE]/40 transition-colors"
              >
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  width="28"
                  height="28"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobil menü */}
          <div
            id="mobile-menu"
            className={`zalusa-mobile-nav ${mobileOpen ? "" : "hidden"} md:hidden absolute z-40 -mx-4 sm:-mx-6 lg:-mx-8 left-0 right-0 top-full border-t border-slate-200/90 bg-white shadow-[0_14px_40px_-12px_rgba(15,23,42,0.14)] rounded-b-2xl overflow-hidden text-left`}
          >
            <nav className="w-full pb-0 text-left" aria-label="Mobil menü">
              <div className="border-t border-slate-100/90 divide-y divide-slate-100/90 text-left pl-8 pr-6 sm:pl-10 sm:pr-8">
                {menu.map((item, i) => (
                  <MobileItem key={i} item={item} onKurumsal={openKurumsal} />
                ))}
              </div>
            </nav>
            <div className="shrink-0 border-t border-slate-200/80 bg-slate-50/95 px-5 sm:px-7 py-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] space-y-2.5">
              <a
                href="/giris"
                className="inline-flex w-full min-h-[44px] items-center justify-center gap-2 px-2 py-2 bg-[#BFFF00] hover:bg-[#aee600] text-slate-900 text-sm font-bold rounded-lg shadow-sm cursor-pointer transition-all text-center leading-snug"
              >
                {tNav("cta")}
                <ArrowRight className="w-4 h-4 shrink-0" />
              </a>
              <div className="flex items-center justify-between gap-3 pt-1">
                <a
                  href="/giris"
                  className="inline-flex items-center text-[13.5px] font-semibold text-slate-700 hover:text-[#0000BE] transition"
                >
                  {tNav("login")}
                </a>
                <a
                  href="tel:08502551840"
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-slate-700 hover:text-[#0000BE] transition"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth="2.2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  0850 255 18 40
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function isExternal(href: string) {
  return href.startsWith("http");
}

// Desktop üst öğe — PHP header.php desktop foreach birebir.
function DesktopItem({ item, onKurumsal }: { item: NavItem; onKurumsal: () => void }) {
  const ext = isExternal(item.href);
  const hasDropdown = item.children.length > 0;

  if (item.kurumsal && !hasDropdown) {
    return (
      <button
        type="button"
        onClick={onKurumsal}
        className="text-slate-700 hover:text-slate-900 font-medium text-[14px] cursor-pointer transition"
      >
        {item.label}
      </button>
    );
  }

  if (hasDropdown) {
    return (
      <div className="relative group">
        {item.href !== "#" ? (
          <a
            href={item.href}
            {...(ext ? { target: "_blank", rel: "noopener" } : {})}
            className="flex items-center space-x-1 text-slate-700 hover:text-slate-900 font-medium text-[14px] transition py-2"
          >
            <span>{item.label}</span>
            <Chevron className="w-4 h-4 transition-transform group-hover:rotate-180" />
          </a>
        ) : (
          <button
            type="button"
            className="flex items-center space-x-1 text-slate-700 hover:text-slate-900 font-medium text-[14px] cursor-pointer transition py-2"
          >
            <span>{item.label}</span>
            <Chevron className="w-4 h-4 transition-transform group-hover:rotate-180" />
          </button>
        )}
        <div className="absolute top-full left-0 w-48 bg-white shadow-xl rounded-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
          {item.children.map((c: NavChild, idx: number) => (
            <a
              key={idx}
              href={c.href}
              className={`block px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium ${idx === 0 ? "rounded-t-xl" : ""}`}
            >
              {c.label}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <a
      href={item.href}
      {...(ext ? { target: "_blank", rel: "noopener" } : {})}
      className="text-slate-700 hover:text-slate-900 font-medium text-[14px] transition"
    >
      {item.label}
    </a>
  );
}

// Mobil üst öğe — PHP header.php mobile foreach birebir.
function MobileItem({ item, onKurumsal }: { item: NavItem; onKurumsal: () => void }) {
  const ext = isExternal(item.href);
  const hasDropdown = item.children.length > 0;

  if (item.kurumsal && !hasDropdown) {
    return (
      <button
        type="button"
        onClick={onKurumsal}
        className="zalusa-mobile-nav-row w-full min-h-[44px] flex items-center justify-between gap-2 py-1 text-left text-base font-medium leading-snug text-[#0000BE] hover:bg-slate-50 active:bg-slate-100/80 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0000BE]/25 rounded-lg"
      >
        <span className="min-w-0 flex-1 text-left">{item.label}</span>
        <svg className="w-5 h-5 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    );
  }

  if (hasDropdown) {
    return <MobileAcc label={item.label} items={item.children} />;
  }

  return (
    <a
      href={item.href}
      {...(ext ? { target: "_blank", rel: "noopener" } : {})}
      className="zalusa-mobile-nav-row flex w-full min-h-[44px] items-center py-1 text-left text-base font-medium leading-snug text-[#0000BE] hover:bg-slate-50 active:bg-slate-100/80 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0000BE]/25 rounded-lg"
    >
      {item.label}
    </a>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      width="16"
      height="16"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth="2.5"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}

function MobileAcc({
  label,
  items,
}: {
  label: string;
  items: { href: string; label: string }[];
}) {
  return (
    <details className="zalusa-nav-acc group">
      <summary className="zalusa-mobile-nav-row zalusa-mobile-nav-summary flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-2 py-1 text-left text-base font-medium leading-snug text-[#0000BE] hover:bg-slate-50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0000BE]/25 rounded-lg [&::-webkit-details-marker]:hidden">
        <span className="min-w-0 flex-1 text-left">{label}</span>
        <svg
          className="zalusa-nav-acc-chevron w-5 h-5 shrink-0 text-[#0000BE]/40 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </summary>
      <div className="pb-2 pt-0.5 pl-3 ml-2 border-l-2 border-slate-200/80 space-y-0.5 text-left">
        {items.map((it) => (
          <a
            key={it.href}
            href={it.href}
            className="flex min-h-[40px] items-center text-left text-[15px] font-medium leading-snug text-slate-700 hover:text-[#0000BE]"
          >
            {it.label}
          </a>
        ))}
      </div>
    </details>
  );
}
