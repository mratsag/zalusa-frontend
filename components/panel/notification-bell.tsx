"use client";

import React from "react";
import { Bell, CheckCircle2, XCircle, Info, Package, X, Check } from "lucide-react";
import { cn } from "@/lib/cn";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

function getToken(): string {
  try { return localStorage.getItem("zalusa.token") ?? ""; }
  catch { return ""; }
}

async function apiFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) ?? {}),
    },
    credentials: "include",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `İstek başarısız (${res.status})`);
  return data as T;
}

type Notification = {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    shipmentId?: string;
    trackingCode?: string;
    reason?: string;
  };
};

const typeConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; bg: string }> = {
  payment_approved: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
  payment_rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-50" },
  shipment_created: { icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
  info: { icon: Info, color: "text-slate-500", bg: "bg-slate-50" },
};

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = Math.max(0, now - d);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Az önce";
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return new Date(dateStr).toLocaleDateString("tr-TR", { day: "2-digit", month: "short" });
}

export function NotificationBell() {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Fetch unread count on mount + poll every 30 seconds
  React.useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Click outside to close
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  async function fetchUnreadCount() {
    try {
      const token = getToken();
      if (!token) return; // Token yoksa gereksiz istek atma
      const data = await apiFetch<{ count: number }>("/api/notifications/unread-count");
      setUnreadCount(data.count);
    } catch {
      // silent
    }
  }

  async function fetchNotifications() {
    setLoading(true);
    try {
      const data = await apiFetch<{ notifications: Notification[]; unreadCount: number }>("/api/notifications");
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: number) {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "PUT" });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  }

  async function markAllRead() {
    try {
      await apiFetch("/api/notifications/read-all", { method: "PUT" });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  }

  function handleToggle() {
    if (!open) {
      fetchNotifications();
    }
    setOpen(v => !v);
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleToggle}
        className="relative h-10 w-10 flex items-center justify-center rounded-lg border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 transition-colors"
        aria-label="Bildirimler"
      >
        <Bell className="h-[18px] w-[18px] text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm animate-in zoom-in duration-200">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 sm:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-x-3 top-16 z-50 sm:absolute sm:inset-auto sm:right-0 sm:top-12 w-auto sm:w-[380px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Bildirimler</h3>
              {unreadCount > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Check className="h-3 w-3" />
                  Tümünü Okundu Yap
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center">
                <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-slate-200 border-t-blue-500" />
                <p className="mt-2 text-xs text-slate-400">Yükleniyor...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="h-8 w-8 text-slate-200 mx-auto" />
                <p className="mt-2 text-sm text-slate-400">Henüz bildirim yok</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {notifications.map((n) => {
                  const config = typeConfig[n.type] || typeConfig.info;
                  const Icon = config.icon;

                  return (
                    <div
                      key={n.id}
                      className={cn(
                        "flex gap-3 px-4 py-3 transition-colors cursor-pointer hover:bg-slate-50",
                        !n.isRead && "bg-blue-50/30"
                      )}
                      onClick={() => {
                        if (!n.isRead) markAsRead(n.id);
                      }}
                    >
                      <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", config.bg)}>
                        <Icon className={cn("h-4 w-4", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className={cn("text-[13px] font-semibold truncate", n.isRead ? "text-slate-600" : "text-slate-900")}>
                            {n.title}
                          </span>
                          {!n.isRead && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="mt-0.5 text-[12px] text-slate-500 line-clamp-2 leading-relaxed">
                          {n.message}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">{timeAgo(n.createdAt)}</span>
                          {n.metadata?.trackingCode && (
                            <span className="text-[10px] font-medium text-blue-500">
                              {n.metadata.trackingCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        </>
      )}
    </div>
  );
}
