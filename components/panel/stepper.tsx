"use client";

import React from "react";
import { Check, FileText, Ruler, LayoutGrid, MapPin, FileSpreadsheet, CheckCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export const STEP_IMAGES = [
  "/stepper/kargobilgilericon.png",
  "/stepper/paketölçüleri.png",
  "/stepper/fiyatlandırma.png",
  "/stepper/adressecimi.png",
  "/stepper/gümrüksecimi.png",
  "/stepper/tamamlandı.png",
];

// Short labels for mobile
const MOBILE_LABELS: Record<string, string> = {
  "Kargo Bilgileri": "Kargo",
  "Paket Ölçüleri": "Paket",
  "Fiyatlandırma": "Fiyat",
  "Adres Seçimi": "Adres",
  "Gümrük Bilgileri": "Gümrük",
  "Onay & Gönder": "Onay",
};

export function Stepper({
  steps,
  current,
  onStepClick,
  images,
}: {
  steps: string[];
  current: number; // 0-based
  onStepClick?: (index: number) => void;
  /** Adım ikonları (steps ile aynı sırada). Verilmezse varsayılan pozisyonel ikonlar kullanılır. */
  images?: string[];
}) {
  const imgs = images ?? STEP_IMAGES;
  return (
    <>
      {/* ── Mobile: icons on top, labels below ── */}
      <div className="flex sm:hidden items-start justify-between w-full pb-1">
        {steps.map((label, idx) => {
          const done = idx < current;
          const active = idx === current;
          const clickable = done && !!onStepClick;
          const stepImage = imgs[idx] || STEP_IMAGES[0];
          const mobileLabel = MOBILE_LABELS[label] || label.split(" ")[0];

          return (
            <button
              key={label}
              type="button"
              onClick={clickable ? () => onStepClick(idx) : undefined}
              disabled={!clickable && !active}
              className={cn(
                "flex flex-col items-center gap-1 transition-all duration-200",
                clickable && "cursor-pointer"
              )}
            >
              <div className={cn(
                "flex h-8 w-8 items-center justify-center shrink-0 rounded-xl transition-all",
                active && "bg-[#18181B] shadow-md",
                done && "bg-[#EFFBF2] ring-1 ring-emerald-200",
                !active && !done && "bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.04),0px_1px_3px_0px_rgba(0,0,0,0.06)]"
              )}>
                {done ? (
                  <img src="/stepper/verified.png" alt="completed" className="h-4 w-4 object-contain" />
                ) : (
                  <img
                    src={stepImage}
                    alt={label}
                    className={cn(
                      "h-4 w-4 object-contain",
                      active && "brightness-0 invert",
                      !active && "opacity-50 grayscale"
                    )}
                  />
                )}
              </div>
              <span className={cn(
                "text-[9px] font-semibold leading-tight",
                active && "text-[#18181B]",
                done && "text-emerald-600",
                !active && !done && "text-[#94A3B8]"
              )}>
                {mobileLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Desktop: original horizontal layout ── */}
      <div className="hidden sm:flex items-center w-full overflow-x-auto pb-1 scrollbar-none">
        {steps.map((label, idx) => {
          const done = idx < current;
          const active = idx === current;
          const clickable = done && !!onStepClick;
          const stepImage = imgs[idx] || STEP_IMAGES[0];

          return (
            <React.Fragment key={label}>
              <button
                type="button"
                onClick={clickable ? () => onStepClick(idx) : undefined}
                disabled={!clickable && !active}
                className={cn(
                  "flex items-center shrink-0 gap-2 rounded-[12px] p-[2px] pr-[8px] text-[13px] font-semibold whitespace-nowrap transition-all duration-200 h-10",
                  active && "bg-[#18181B] text-white",
                  done && "bg-[#EFFBF2] text-[#166534]",
                  !active && !done && "bg-transparent text-[#94A3B8]",
                  clickable && "cursor-pointer"
                )}
              >
                <div className="flex h-[36px] w-[36px] items-center justify-center shrink-0 rounded-[10px] bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.02),0px_1px_3px_0px_rgba(0,0,0,0.08)]">
                  {done ? (
                    <img src="/stepper/verified.png" alt="completed" className="h-[20px] w-[20px] object-contain" />
                  ) : (
                    <img
                      src={stepImage}
                      alt={label}
                      className={cn("h-[20px] w-[20px] object-contain", !active && "opacity-60 grayscale")}
                    />
                  )}
                </div>
                <span>{label}</span>
              </button>
              {idx < steps.length - 1 && (
                <div className="h-[2px] flex-1 min-w-[16px] bg-[#E2E8F0] shrink-0 rounded-full mx-2" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </>
  );
}
