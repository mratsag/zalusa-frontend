import React from "react";

import { Info, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

export interface InfoTipProps {
  /** Balonda gösterilecek açıklama (metin veya JSX). */
  text: React.ReactNode;
  className?: string;
  /** Balon genişliği (Tailwind sınıfı). Varsayılan w-64. */
  width?: string;
  /** Balon konumu: üstte mi altta mı. Varsayılan "top". Üst kenara yakın etiketlerde "bottom" kullanın. */
  placement?: "top" | "bottom";
  /** İkon (lucide). Varsayılan Info (ⓘ); soru işareti için HelpCircle geçilebilir. */
  icon?: LucideIcon;
}

/**
 * Etiketlerin yanına konan küçük (ⓘ) bilgi ikonu. Üzerine gelince (veya odaklanınca)
 * açıklama balonu gösterir. GTİP, IOSS gibi teknik terimleri açıklamak için kullanılır.
 */
export function InfoTip({ text, className, width = "w-64", placement = "top", icon: Icon = Info }: InfoTipProps) {
  return (
    <span className={cn("group relative inline-flex items-center align-middle", className)}>
      <Icon
        tabIndex={0}
        aria-label="Bilgi"
        className="h-3.5 w-3.5 cursor-help text-[#94A3B8] outline-none transition-colors hover:text-[#475569] focus-visible:text-[#475569]"
      />
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-30 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-left text-[11px] font-normal normal-case leading-relaxed tracking-normal text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
          placement === "bottom" ? "top-full mt-2" : "bottom-full mb-2",
          width,
        )}
      >
        {text}
      </span>
    </span>
  );
}
