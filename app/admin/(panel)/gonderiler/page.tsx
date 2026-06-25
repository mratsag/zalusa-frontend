"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  FileText,
  Send,
  Users,
  Map,
  X,
} from "lucide-react";
import { CargoTrackingView, TrackingEvent } from "@/components/CargoTrackingView";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const TOKEN_KEY = "zalusa.admin.token";
function adminHeaders(): Record<string, string> {
  const token = globalThis.localStorage?.getItem(TOKEN_KEY) ?? "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

interface Shipment {
  id: number;
  trackingCode: string;
  status: string;
  statusLabel: string;
  currentStep: number;
  receiverCountry: string;
  receiverName: string;
  carrierName: string;
  priceTry: number;
  userName: string;
  userEmail: string;
  userPhone: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

const statusColors: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  pending_payment: "bg-amber-100 text-amber-700",
  awaiting_transfer_approval: "bg-orange-100 text-orange-700",
  paid: "bg-blue-100 text-blue-700",
  label_created: "bg-indigo-100 text-indigo-700",
  shipped: "bg-violet-100 text-violet-700",
  in_transit: "bg-purple-100 text-purple-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-600",
  returned: "bg-pink-100 text-pink-600",
};

const statusIcons: Record<string, React.ReactNode> = {
  draft: <FileText className="h-3.5 w-3.5" />,
  pending_payment: <CreditCard className="h-3.5 w-3.5" />,
  awaiting_transfer_approval: <Clock className="h-3.5 w-3.5" />,
  paid: <CheckCircle2 className="h-3.5 w-3.5" />,
  label_created: <FileText className="h-3.5 w-3.5" />,
  shipped: <Send className="h-3.5 w-3.5" />,
  in_transit: <Truck className="h-3.5 w-3.5" />,
  delivered: <CheckCircle2 className="h-3.5 w-3.5" />,
  cancelled: <XCircle className="h-3.5 w-3.5" />,
  returned: <AlertCircle className="h-3.5 w-3.5" />,
};

export default function TumGonderilerPage() {
  const router = useRouter();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(30);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [stats, setStats] = useState<Record<string, number>>({});

  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  const handleOpenTracking = async (e: React.MouseEvent, trackingCode: string) => {
    e.stopPropagation();
    if (!trackingCode) return;
    setTrackingModalOpen(true);
    setTrackingLoading(true);
    setTrackingData(null);
    try {
      const res = await fetch(`${API}/api/shipments/track/${trackingCode}`);
      const data = await res.json();
      setTrackingData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setTrackingLoading(false);
    }
  };

  const fetchShipments = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API}/api/admin/all-shipments?page=${page}&limit=${limit}`;
      if (status) url += `&status=${status}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await fetch(url, { headers: adminHeaders() });
      const data = await res.json();
      setShipments(data.shipments || []);
      setTotal(data.total || 0);
      setStats(data.stats || {});
    } catch {
      setShipments([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search]);

  useEffect(() => { fetchShipments(); }, [fetchShipments]);

  const totalPages = Math.ceil(total / limit);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const tabs = [
    { key: "", label: "Tümü", count: stats["all"] },
    { key: "draft", label: "Taslak", count: stats["draft"] },
    { key: "pending_payment", label: "Ödeme Bekliyor", count: stats["pending_payment"] },
    { key: "awaiting_transfer_approval", label: "Havale Onayı", count: stats["awaiting_transfer_approval"] },
    { key: "paid", label: "Ödendi", count: stats["paid"] },
    { key: "label_created", label: "Etiket", count: stats["label_created"] },
    { key: "shipped", label: "Kargoda", count: stats["shipped"] },
    { key: "in_transit", label: "Yolda", count: stats["in_transit"] },
    { key: "delivered", label: "Teslim", count: stats["delivered"] },
    { key: "cancelled", label: "İptal", count: stats["cancelled"] },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-indigo-600">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Tüm Gönderiler</h1>
            <p className="text-sm text-slate-500">{total} gönderi bulundu</p>
          </div>
        </div>
        {/* Search */}
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="w-64 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              placeholder="Takip kodu, isim, e-posta..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors">Ara</button>
        </form>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setStatus(t.key); setPage(1); }}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              status === t.key ? "bg-indigo-600 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t.label}
            {t.count != null && <span className="ml-1 opacity-70">({t.count || 0})</span>}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
        </div>
      ) : shipments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Package className="h-12 w-12 mb-3" />
          <p className="text-sm font-medium">Gönderi bulunamadı</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[60px_1fr_1fr_140px_100px_120px_140px] gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <span>ID</span>
            <span>Kullanıcı</span>
            <span>Alıcı / Ülke</span>
            <span>Kargo Firması</span>
            <span>Durum</span>
            <span>Fiyat</span>
            <span>İşlemler / Tarih</span>
          </div>
          <div className="divide-y divide-slate-100">
            {shipments.map((s) => (
              <div
                key={s.id}
                onClick={() => router.push(`/admin/gonderiler/${s.id}`)}
                className="grid grid-cols-[60px_1fr_1fr_140px_100px_120px_80px] gap-2 px-5 py-3 items-center hover:bg-indigo-50/40 transition-colors text-sm cursor-pointer"
              >
                {/* ID */}
                <span className="text-xs font-mono text-slate-400">#{s.id}</span>

                {/* User */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{s.userName}</p>
                  <p className="text-[11px] text-slate-400 truncate">{s.userEmail}</p>
                </div>

                {/* Receiver */}
                <div className="min-w-0">
                  <p className="text-sm text-slate-700 truncate">{s.receiverName || "—"}</p>
                  <p className="text-[11px] text-slate-400">{s.receiverCountry} {s.trackingCode ? `· ${s.trackingCode}` : ""}</p>
                </div>

                {/* Carrier */}
                <span className="text-xs text-slate-600 truncate">{s.carrierName || "—"}</span>

                {/* Status */}
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold w-fit ${statusColors[s.status] || "bg-slate-100 text-slate-600"}`}>
                  {statusIcons[s.status]}
                  {s.statusLabel}
                </span>

                {/* Price */}
                <span className="text-sm font-semibold text-slate-800">{s.priceTry > 0 ? `${s.priceTry.toFixed(2)}₺` : "—"}</span>

                {/* Actions & Date */}
                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[11px] text-slate-400">{new Date(s.createdAt).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}</span>
                  {s.trackingCode && (
                    <button
                      onClick={(e) => handleOpenTracking(e, s.trackingCode)}
                      className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100 transition-colors"
                    >
                      <Map className="h-3 w-3" /> Hareketler
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            Sayfa {page} / {totalPages} — Toplam {total} gönderi
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Önceki
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
            >
              Sonraki <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
      {/* Tracking Modal */}
      {trackingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Map className="h-5 w-5 text-indigo-600" />
                Kargo Hareketleri
              </h2>
              <button
                onClick={() => setTrackingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {trackingLoading ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
                </div>
              ) : trackingData ? (
                <CargoTrackingView
                  trackingCode={trackingData.tracking_code || trackingData.TrackingCode}
                  mainStatus={trackingData.main_status || trackingData.MainStatus}
                  carrier={trackingData.carrier || trackingData.Carrier}
                  targetCountry={trackingData.target_country || trackingData.TargetCountry}
                  domesticEvents={trackingData.domestic_events || trackingData.DomesticEvents || []}
                  internationalEvents={trackingData.international_events || trackingData.InternationalEvents || []}
                />
              ) : (
                <div className="text-center py-12 text-slate-500">
                  Kargo hareketleri yüklenemedi.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
