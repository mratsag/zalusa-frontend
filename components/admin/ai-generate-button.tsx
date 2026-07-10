"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, ChevronDown, Loader2 } from "lucide-react";

import { aiGenerate, type AiTargetType, type AiMode } from "@/lib/services/aiService";

const MODE_LABEL: Record<AiMode, string> = { content: "İçerik üret", seo: "SEO üret", faqs: "SSS üret (8 soru)" };
const MODE_WARN: Record<AiMode, string> = {
  content: "Mevcut içerik üzerine yazılacak.",
  seo: "Mevcut SEO alanları üzerine yazılacak.",
  faqs: "Mevcut SSS silinip yenileri üretilecek.",
};

// "AI ile üret" dropdown — hedef (type,id) için içerik/SEO/SSS üretir, sonra onDone ile yeniler.
export function AiGenerateButton({
  type,
  id,
  modes,
  onDone,
  onError,
}: {
  type: AiTargetType;
  id: number;
  modes: AiMode[];
  onDone: (mode: AiMode) => void;
  onError?: (msg: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<AiMode | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const run = async (mode: AiMode) => {
    if (!confirm(`AI ile üretilsin mi? ${MODE_WARN[mode]}`)) return;
    setOpen(false);
    setBusy(mode);
    try {
      await aiGenerate(type, id, mode);
      onDone(mode);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : "AI üretimi başarısız");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy !== null}
        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-brand-600" />}
        {busy ? "Üretiliyor…" : "AI ile üret"}
        {!busy && <ChevronDown className="h-3.5 w-3.5 text-slate-400" />}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {modes.map((m) => (
            <button key={m} onClick={() => run(m)} className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50">
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
