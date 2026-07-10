"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Mail, MailOpen, Trash2, Check, RefreshCw, Phone, Building2, CheckCircle2, AlertCircle } from "lucide-react";

import {
  listContactMessages,
  markContactRead,
  deleteContactMessage,
  type ContactMessage,
} from "@/lib/services/contactMessagesService";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[60] max-w-sm">
      <div
        className={`flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg ring-1 ${
          type === "success" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"
        }`}
      >
        {type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Istanbul",
    });
  } catch {
    return iso;
  }
}

export default function MesajlarPage() {
  const [items, setItems] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listContactMessages());
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Mesajlar yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unreadCount = useMemo(() => items.filter((m) => !m.isRead).length, [items]);
  const filtered = useMemo(() => (onlyUnread ? items.filter((m) => !m.isRead) : items), [items, onlyUnread]);

  const onMarkRead = async (id: number) => {
    try {
      await markContactRead(id);
      setItems((prev) => prev.map((m) => (m.id === id ? { ...m, isRead: true } : m)));
    } catch {
      setToast({ message: "İşaretlenemedi", type: "error" });
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteContactMessage(id);
      setItems((prev) => prev.filter((m) => m.id !== id));
      setToast({ message: "Mesaj silindi", type: "success" });
    } catch {
      setToast({ message: "Silinemedi", type: "error" });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-6">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <Mail className="h-6 w-6 text-brand-600" />
            Mesajlar
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Landing iletişim / teklif / geri bildirim formlarından gelen mesajlar.
            {unreadCount > 0 && <span className="ml-1 font-semibold text-brand-700">{unreadCount} okunmamış</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOnlyUnread((v) => !v)}
            className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
              onlyUnread ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {onlyUnread ? "Tümü" : "Sadece okunmamış"}
          </button>
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">Yükleniyor…</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center text-slate-400">
          {onlyUnread ? "Okunmamış mesaj yok." : "Henüz mesaj yok."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((m) => (
            <div
              key={m.id}
              className={`rounded-2xl border p-4 md:p-5 transition ${
                m.isRead ? "border-slate-200 bg-white" : "border-brand-200 bg-brand-50/40 ring-1 ring-brand-100"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    {!m.isRead && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                    <span className="font-semibold text-slate-900">
                      {m.name} {m.surname}
                    </span>
                    {m.category && (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        {m.category}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-slate-500">
                    <a href={`mailto:${m.email}`} className="inline-flex items-center gap-1 hover:text-brand-700">
                      <Mail className="h-3.5 w-3.5" /> {m.email}
                    </a>
                    {m.phone && (
                      <a href={`tel:${m.phone}`} className="inline-flex items-center gap-1 hover:text-brand-700">
                        <Phone className="h-3.5 w-3.5" /> {m.phone}
                      </a>
                    )}
                    {m.trackingCode && (
                      <span className="inline-flex items-center gap-1">
                        <Building2 className="h-3.5 w-3.5" /> {m.trackingCode}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="whitespace-nowrap text-xs text-slate-400">{fmtDate(m.createdAt)}</span>
                  {!m.isRead && (
                    <button
                      onClick={() => onMarkRead(m.id)}
                      title="Okundu işaretle"
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(m.id)}
                    title="Sil"
                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap border-t border-slate-100 pt-3 text-[14px] leading-relaxed text-slate-700">
                {m.message}
              </p>
              {m.isRead && (
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-slate-400">
                  <MailOpen className="h-3 w-3" /> Okundu
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
