"use client";

import React from "react";
import { MessageSquare, ChevronDown, User, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ChatWidget } from "@/components/ChatWidget";
import { NotificationBell } from "@/components/panel/notification-bell";

export function PanelHeaderActions() {
  const router = useRouter();
  const [name, setName] = React.useState<string | null>(null);
  const [chatOpen, setChatOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const u = getCurrentUser();
    setName(u?.fullName ?? null);
  }, []);

  // Click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [profileOpen]);

  function handleLogout() {
    localStorage.removeItem("zalusa.token");
    localStorage.removeItem("zalusa.customerId");
    router.push("/");
  }

  return (
    <div className="flex items-center gap-2.5">
      {/* Message Button */}
      <button
        onClick={() => setChatOpen(true)}
        className="h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-[#F8FAFC] text-[#2563EB] hover:bg-slate-100 transition-colors"
      >
        <MessageSquare className="h-[18px] w-[18px] fill-[#2563EB]" />
      </button>

      {/* Notification Bell */}
      <NotificationBell />

      {/* Chat Widget */}
      <ChatWidget open={chatOpen} onOpenChange={setChatOpen} />

      {/* Wallet/Balance Button - şimdilik devre dışı
      <button className="h-10 px-3 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 transition-colors text-slate-700">
        <div className="flex items-center gap-1.5">
          <div className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-[#2563EB] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          </div>
          <span className="text-[14px] font-semibold text-slate-700">₺0,00</span>
        </div>
        <ChevronDown className="h-4 w-4 text-slate-400 ml-1" />
      </button>
      */}

      {/* Profile Button with Dropdown */}
      <div className="relative ml-1" ref={dropdownRef}>
        <button
          onClick={() => setProfileOpen(v => !v)}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-[#F8FAFC] border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 transition-colors"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
            <button
              onClick={() => { setProfileOpen(false); router.push("/panel/profilim"); }}
              className="flex w-full items-center gap-3 px-4 py-3 text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <User className="h-4 w-4 text-slate-400" />
              Profil Sayfası
            </button>
            <div className="mx-3 h-px bg-slate-100" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-3 text-[13px] font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4 text-red-400" />
              Çıkış Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
}