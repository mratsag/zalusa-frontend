"use client";

import React from "react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { X, ChevronDown, User, LogOut, PackageSearch } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import { panelNavItems, resellerNavItems } from "./nav-items";
import { profileService } from "@/lib/services/profileService";

/* ── Nav items grouped by category (matching Figma) ── */
const MENU_ITEMS = panelNavItems.filter(i =>
  ["/panel", "/panel/gonderi-olustur", "/panel/yurt-ici-gonderi", "/panel/gonderilerim", "/panel/fiyat-hesaplama", "/panel/kurye-cagir"].includes(i.href)
);
const PERSONAL_ITEMS = panelNavItems.filter(i =>
  ["/panel/profilim", "/panel/fatura-odeme", "/panel/entegrasyon"].includes(i.href)
);
const BOTTOM_ITEMS = panelNavItems.filter(i =>
  ["/panel/destek-talebi", "/panel/cikis", "/panel/ayarlar"].includes(i.href)
);
const EXTRA_MENU = panelNavItems.filter(i => !MENU_ITEMS.includes(i) && !PERSONAL_ITEMS.includes(i) && !BOTTOM_ITEMS.includes(i));

function SidebarLink({
  href,
  label,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "group flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 w-full text-[14.5px] font-semibold transition-all duration-200",
        active
          ? "bg-[#F7F7F7] text-[#0F172A]"
          : "text-[#64748B] hover:bg-[#F7F7F7] hover:text-[#0F172A]",
      )}
    >
      <Icon className={cn("h-[20px] w-[20px] shrink-0", active ? "text-[#0F172A]" : "text-[#94A3B8] group-hover:text-[#64748B]")} />
      <span className="truncate pt-0.5">{label}</span>
    </Link>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string | null>(null);
  const [userRole, setUserRole] = React.useState<string>("customer");
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [userMenuOpen]);

  React.useEffect(() => {
    // Quick fallback from localStorage while API loads
    const cached = localStorage.getItem("zalusa.fullName");
    if (cached) setName(cached);

    // Role'ü localStorage'dan hızlı yükle (API yüklenene kadar)
    const cachedRole = localStorage.getItem("zalusa.role");
    if (cachedRole) setUserRole(cachedRole);

    const token = localStorage.getItem("zalusa.token");
    if (!token) return;

    let cancelled = false;
    // /api/auth/me endpoint'ini kullanarak kullanıcının role'ünü al
    const API = process.env.NEXT_PUBLIC_API_URL;
    fetch(`${API}/api/auth/me`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const full = `${data.firstName ?? ""} ${data.lastName ?? ""}`.trim();
        const displayName = full || data.email?.split("@")[0] || "Kullanıcı";
        setName(displayName);
        localStorage.setItem("zalusa.fullName", displayName);
        setEmail(data.email ?? "");
        if (data.role) {
          setUserRole(data.role);
          localStorage.setItem("zalusa.role", data.role);
        }
      })
      .catch(() => {
        // Keep cached/fallback values on error
      });
    return () => { cancelled = true; };
  }, [pathname]);

  const initials = React.useMemo(() => {
    if (!name) return "US";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }, [name]);

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Brand */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/" className="group flex items-center gap-2.5" onClick={onNavigate}>
          <div className="flex h-9 w-9 items-center justify-center">
            <Image src="/logo-ikon.png" alt="Zalusa" width={28} height={28} />
          </div>
          <div className="text-[20px] font-bold text-[#0F172A] tracking-tight pt-0.5">Zalusa</div>
        </Link>
      </div>

      {/* Menu section */}
      <div className="px-2.5">
        <div className="mb-2 px-3 text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">Menü</div>
        <nav className="space-y-0.5">
          {MENU_ITEMS.map((item) => (
            <SidebarLink key={item.href} {...item} onNavigate={onNavigate} />
          ))}
          {EXTRA_MENU.map((item) => (
            <SidebarLink key={item.href} {...item} onNavigate={onNavigate} />
          ))}
        </nav>
      </div>

      {/* Bayi (Reseller) section — sadece role='reseller' ise göster */}
      {userRole === "reseller" && (
        <div className="mt-4 px-2.5">
          <div className="mb-2 px-3 text-[12px] font-bold uppercase tracking-widest text-[#7C3AED]">Bayi</div>
          <nav className="space-y-0.5">
            {resellerNavItems.map((item) => (
              <SidebarLink key={item.href} {...item} onNavigate={onNavigate} />
            ))}
          </nav>
        </div>
      )}

      {/* Telegram & WhatsApp Kargo Bot */}
      <div className="mt-4 px-2.5">
        <div className="mb-2 px-3 text-[12px] font-bold uppercase tracking-widest text-[#0EA5E9]">Hızlı Kargo</div>
        
        <Link
          href="/panel/kargom-nerede"
          onClick={onNavigate}
          className="group flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 w-full text-[14.5px] font-semibold transition-all duration-200 text-[#64748B] hover:bg-[#F3E8FF] hover:text-[#9333EA] mb-1"
        >
          <PackageSearch className="h-[20px] w-[20px] shrink-0 text-[#A855F7] group-hover:text-[#9333EA] transition-colors" />
          <span className="truncate pt-0.5">Kargom Nerede?</span>
        </Link>
        <a
          href="https://t.me/ZalusaAkilliKargoBot?start=true"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 w-full text-[14.5px] font-semibold transition-all duration-200 text-[#64748B] hover:bg-[#E0F2FE] hover:text-[#0284C7]"
        >
          <svg className="h-[20px] w-[20px] shrink-0 text-[#0EA5E9] group-hover:text-[#0284C7] transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
          <span className="truncate pt-0.5">Telegram ile Kargo</span>
          <svg className="h-3.5 w-3.5 shrink-0 ml-auto text-[#94A3B8] group-hover:text-[#0284C7] transition-colors" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Zm7.25-.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V6.31l-5.47 5.47a.75.75 0 1 1-1.06-1.06l5.47-5.47H12.25a.75.75 0 0 1-.75-.75Z" clipRule="evenodd"/>
          </svg>
        </a>
        <a
          href="https://wa.me/905426338134?text=merhaba"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 rounded-[12px] px-3 py-2.5 w-full text-[14.5px] font-semibold transition-all duration-200 text-[#64748B] hover:bg-[#DCFCE7] hover:text-[#16A34A]"
        >
          <svg className="h-[20px] w-[20px] shrink-0 text-[#25D366] group-hover:text-[#16A34A] transition-colors" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
          <span className="truncate pt-0.5">WhatsApp ile Kargo</span>
          <svg className="h-3.5 w-3.5 shrink-0 ml-auto text-[#94A3B8] group-hover:text-[#16A34A] transition-colors" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Zm7.25-.75a.75.75 0 0 1 .75-.75h3.5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V6.31l-5.47 5.47a.75.75 0 1 1-1.06-1.06l5.47-5.47H12.25a.75.75 0 0 1-.75-.75Z" clipRule="evenodd"/>
          </svg>
        </a>
      </div>

      {/* Kişisel section */}
      <div className="mt-4 px-2.5">
        <div className="mb-2 px-3 text-[12px] font-bold uppercase tracking-widest text-[#94A3B8]">Kişisel</div>
        <nav className="space-y-0.5">
          {PERSONAL_ITEMS.map((item) => (
            <SidebarLink key={item.href} {...item} onNavigate={onNavigate} />
          ))}
        </nav>
      </div>

      {/* Bottom items */}
      <div className="px-2.5 mt-10 pt-2">
        <nav className="space-y-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <SidebarLink key={item.href} {...item} onNavigate={onNavigate} />
          ))}
        </nav>
      </div>

      {/* User profile at bottom */}
      <div className="px-2.5 pb-3 mt-3 relative" ref={userMenuRef}>
        {/* Dropdown menu */}
        {userMenuOpen && (
          <div className="absolute bottom-full left-2.5 right-2.5 mb-1.5 bg-white rounded-[12px] ring-1 ring-[#E2E8F0] shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <button
              type="button"
              onClick={() => { setUserMenuOpen(false); router.push("/panel/profilim"); onNavigate?.(); }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-[#475569] hover:bg-[#F8FAFC] hover:text-[#0F172A] transition-colors"
            >
              <User className="h-4 w-4 text-[#94A3B8]" />
              Profilim
            </button>
            <div className="h-px bg-[#F1F5F9]" />
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen(false);
                localStorage.removeItem("zalusa.token");
                localStorage.removeItem("zalusa.fullName");
                localStorage.removeItem("zalusa.role");
                router.push("/");
              }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Çıkış Yap
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex w-full items-center justify-between rounded-[12px] ring-1 ring-[#E2E8F0] p-3 text-left hover:bg-[#F7F7F7] cursor-pointer transition-colors bg-white"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-white text-[12px] font-bold text-[#0F172A] ring-1 ring-[#E2E8F0] shadow-sm">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-bold text-[#0F172A]">{name ?? "Yükleniyor..."}</div>
              <div className="truncate text-[12px] font-medium text-[#94A3B8]">{email}</div>
            </div>
          </div>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-[#94A3B8] transition-transform duration-200", userMenuOpen && "rotate-180")} />
        </button>
      </div>
    </div>
  );
}

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden w-[260px] shrink-0 bg-white border-r border-[#E2E8F0] md:flex flex-col fixed top-0 left-0 bottom-0 z-30 overflow-y-auto">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-50 md:hidden", open ? "" : "pointer-events-none")}>
        <div
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity",
            open ? "opacity-100" : "opacity-0",
          )}
          onClick={onClose}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 h-[100dvh] w-[82vw] max-w-[260px] bg-white shadow-2xl transition-transform overflow-y-auto",
            open ? "translate-x-0" : "-translate-x-full",
          )}
          aria-hidden={!open}
        >
          <div className="absolute right-3 top-4 z-10">
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full text-[#94A3B8] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-colors"
              aria-label="Menüyü kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <SidebarContent onNavigate={onClose} />
        </aside>
      </div>
    </>
  );
}