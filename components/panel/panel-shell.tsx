"use client";

import React from "react";

import { Menu } from "lucide-react";

import { cn } from "@/lib/cn";
import { Sidebar } from "./sidebar";
import { HelpSidebar } from "./help-sidebar";

export function PanelShell({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="flex">
        <Sidebar open={open} onClose={() => setOpen(false)} />

        <div className="flex min-w-0 flex-1 flex-col md:ml-[260px]">
          {/* Header (Desktop) */}
          <header className="hidden md:flex h-20 shrink-0 items-center justify-between px-8 sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-white shadow-[0_1px_2px_rgba(0,0,0,0.02),0_4px_16px_rgba(0,0,0,0.02)] transition-all">
            <div className="flex-1"></div> {/* Left spacer if needed */}
            <div className="flex items-center gap-4">
              {right}
            </div>
          </header>

          {/* Fixed Label Reminder Ticker */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden py-2 border-b border-slate-700/30">
            <div className="flex whitespace-nowrap" style={{
              animation: "panelTicker 35s linear infinite",
            }}>
              {[0, 1].map((i) => (
                <div key={i} className="flex items-center shrink-0">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <React.Fragment key={j}>
                      <span className="mx-6 text-[11px] font-bold text-teal-400 tracking-wider">
                        ✦ Zalusa&apos;y&#305; tercih etti&#287;iniz i&#231;in te&#351;ekk&#252;r ederiz
                      </span>
                      <span className="mx-6 text-[11px] font-bold text-slate-400 tracking-wider">
                        &#128230; Kargolar&#305;n&#305;z&#305; &#8220;G&#246;nderilerim&#8221; sayfas&#305;ndan etiketini &#231;&#305;kart&#305;p kolinin &#252;zerine yap&#305;&#351;t&#305;r&#305;n&#305;z
                      </span>
                      <span className="mx-6 text-[11px] font-bold text-emerald-400 tracking-wider">
                        &#128640; G&#246;nderileriniz en k&#305;sa s&#252;rede yola &#231;&#305;kacakt&#305;r
                      </span>
                    </React.Fragment>
                  ))}
                </div>
              ))}
            </div>
            <style>{`
              @keyframes panelTicker {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
              }
            `}</style>
          </div>

          {/* Content */}
          <main className="mx-auto w-full max-w-[1400px] flex-1 px-3 py-6 sm:px-4 md:px-10 md:py-10 overflow-x-hidden">
            {/* Minimal mobile controls (no full header) */}
            <div className="mb-4 sm:mb-6 flex items-center justify-between gap-2 md:hidden">
              <button
                className={cn(
                  "grid h-[42px] w-[42px] place-items-center rounded-xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all shrink-0",
                )}
                onClick={() => setOpen(true)}
                aria-label="Menüyü aç"
              >
                <Menu className="h-5 w-5 text-slate-700" />
              </button>
              
              <div className="flex items-center gap-2 sm:gap-3">
                {right ? <div className="shrink-0">{right}</div> : null}
              </div>
            </div>
            
            <div className="w-full min-w-0">
              {children}
            </div>
          </main>
        </div>
      </div>
      
      {/* Help Sidebar component */}
      <HelpSidebar />
    </div>
  );
}

