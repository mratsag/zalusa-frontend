"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Package,
  Clock,
  CreditCard,
  Box,
  Search,
  ExternalLink,
  CalendarDays,
  MoreHorizontal,
  CheckCircle2,
  Truck,
  Plane,
  ArrowUpDown,
  Filter,
  Loader2,
  Copy,
  Crown,
  Trash2,
  XCircle,
  AlertTriangle,
  Download,
  FileText,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShipmentListItem, shipmentService } from "@/lib/services/shipmentService";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
function getLogoSrc(url: string): string {
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${API_BASE}${url}`;
}

// â”€â”€â”€ Ãœlke Kodu â†’ TÃ¼rkÃ§e Ad â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const COUNTRY_NAMES: Record<string, string> = {
  DE: "Almanya", NL: "Hollanda", FR: "Fransa", GB: "İngiltere", US: "ABD",
  IT: "İtalya", ES: "İspanya", AT: "Avusturya", BE: "Belçika", CH: "İsviçre",
  SE: "İsveç", DK: "Danimarka", NO: "Norveç", PL: "Polonya", CZ: "Çekya",
  PT: "Portekiz", IE: "İrlanda", FI: "Finlandiya", GR: "Yunanistan",
  RO: "Romanya", BG: "Bulgaristan", HR: "Hırvatistan", HU: "Macaristan",
  JP: "Japonya", CN: "Çin", KR: "Güney Kore", AU: "Avustralya", CA: "Kanada",
  BR: "Brezilya", SA: "Suudi Arabistan", AE: "BAE", TR: "Türkiye",
};

function getCountryName(code: string): string {
  return COUNTRY_NAMES[code?.toUpperCase()] ?? code;
}

// â”€â”€â”€ Status Mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STATUS_MAP: Record<string, { label: string; className: string; dotClass: string }> = {
  draft: {
    label: "TASLAK",
    className: "bg-slate-100 text-slate-600",
    dotClass: "bg-slate-400",
  },
  pending_payment: {
    label: "ÖDEME BEKLİYOR",
    className: "bg-orange-50 text-orange-600",
    dotClass: "bg-orange-500",
  },
  paid: {
    label: "ÖDENDİ",
    className: "bg-blue-50 text-blue-600",
    dotClass: "bg-blue-500",
  },
  label_created: {
    label: "ETİKET HAZIR",
    className: "bg-teal-50 text-teal-600",
    dotClass: "bg-teal-500",
  },
  processing: {
    label: "İŞLENİYOR",
    className: "bg-amber-50 text-amber-600",
    dotClass: "bg-amber-500",
  },
  shipped: {
    label: "YOLDA",
    className: "bg-sky-50 text-sky-600",
    dotClass: "bg-sky-500",
  },
  delivered: {
    label: "TESLİM EDİLDİ",
    className: "bg-[#ECFDF5] text-[#10B981]",
    dotClass: "bg-[#10B981]",
  },
  cancelled: {
    label: "İPTAL EDİLDİ",
    className: "bg-red-50 text-red-600",
    dotClass: "bg-red-500",
  },
};

function getCountryEmoji(countryCode: string) {
  if (!countryCode) return "🏳️";
  const code = countryCode.toUpperCase();
  // If it's longer than 2 characters, maybe it's not a standard ISO code. 
  // We'll just try to convert the first 2 letters.
  const codePoints = code
    .slice(0, 2)
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

function getStatus(status: string) {
  return STATUS_MAP[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
}

// â”€â”€â”€ Tab â†’ Backend status mapping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const TABS = ["Tümü", "Taslak", "Ödeme Bekliyor", "Yolda", "Teslim Edildi"] as const;

const TAB_TO_STATUS: Record<string, string | undefined> = {
  "Tümü": undefined,
  "Taslak": "draft",
  "Ödeme Bekliyor": "pending_payment",
  "Yolda": "shipped",
  "Teslim Edildi": "delivered",
};

// â”€â”€â”€ Custom Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function WeightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v2" />
      <path d="M8 8a2 2 0 0 1 8 0v8a4 4 0 0 1-8 0V8z" />
      <path d="M8 8h8" />
    </svg>
  );
}

function MoneyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

// â”€â”€â”€ StatusBadge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StatusBadge({ status }: { status: string }) {
  const st = getStatus(status);
  return (
    <span className={`${st.className} px-3 py-1 rounded-[8px] text-[11px] font-bold tracking-wide flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${st.dotClass || "bg-slate-400"}`}></span>
      {st.label}
    </span>
  );
}

// â”€â”€â”€ Tarih Formatlama â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// â”€â”€â”€ Dropdown Menü â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ShipmentDropdown({ shipmentId, onCancel }: { shipmentId: number; onCancel: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="h-[40px] w-[40px] flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-[44px] z-50 w-[180px] bg-white rounded-[12px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.12)] border border-slate-100 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <button
            onClick={() => { setOpen(false); onCancel(); }}
            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Gönderiyi İptal Et
          </button>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ İptal Onay Modalı â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function CancelConfirmModal({
  shipmentId,
  trackingCode,
  onConfirm,
  onClose,
  loading,
}: {
  shipmentId: number;
  trackingCode: string;
  onConfirm: () => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[20px] shadow-[0_20px_60px_-12px_rgba(0,0,0,0.25)] w-full max-w-[420px] p-6 animate-in zoom-in-95 fade-in duration-200">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
        </div>

        <h3 className="text-[17px] font-bold text-slate-900 text-center">
          Gönderiyi İptal Et
        </h3>
        <p className="text-[13px] text-slate-500 text-center mt-2 leading-relaxed">
          <span className="font-bold text-slate-700">{trackingCode || `ZLS-SHP-${shipmentId}`}</span> kodlu gönderiyi iptal etmek istediğinize emin misiniz? Bu işlem geri alınamaz.
        </p>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-[44px] rounded-[12px] bg-slate-100 hover:bg-slate-200 text-slate-700 text-[13px] font-bold transition-all disabled:opacity-50"
          >
            Vazgeç
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-[44px] rounded-[12px] bg-red-500 hover:bg-red-600 text-white text-[13px] font-bold transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            {loading ? "İptal Ediliyor..." : "İptal Et"}
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Toast Bildirimi â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] flex items-center gap-3 px-5 py-3.5 rounded-[14px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.2)] text-[13px] font-bold animate-in slide-in-from-bottom-4 fade-in duration-300 ${
      type === "success" ? "bg-[#10B981] text-white" : "bg-red-500 text-white"
    }`}>
      {type === "success" ? (
        <CheckCircle2 className="h-4.5 w-4.5" />
      ) : (
        <XCircle className="h-4.5 w-4.5" />
      )}
      {message}
    </div>
  );
}

// â”€â”€â”€ Sayfa Bileşeni â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function GonderilerimPage() {
  const [shipments, setShipments] = useState<ShipmentListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Tümü");

  // Cancel state
  const [cancelTarget, setCancelTarget] = useState<{ id: number; trackingCode: string } | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Sort & Filter state
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "price_high" | "price_low">("newest");
  const [filterCarrier, setFilterCarrier] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("");
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // â”€â”€ Veri Çek â”€â”€
  const fetchShipments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusParam = TAB_TO_STATUS[activeTab];
      const res = await shipmentService.list({
        status: statusParam,
        page,
        limit,
      });
      setShipments(res.shipments);
      setTotal(res.total);
    } catch (err: any) {
      setError(err.message ?? "Gönderiler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, limit]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  // Tab değişince sayfa 1'e dön
  function handleTabChange(tab: (typeof TABS)[number]) {
    setActiveTab(tab);
    setPage(1);
  }

  // â”€â”€ İptal İşlemi â”€â”€
  async function handleCancelConfirm() {
    if (!cancelTarget) return;
    setCancelLoading(true);
    try {
      await shipmentService.cancel(cancelTarget.id);
      setToast({ message: "Gönderi başarıyla iptal edildi", type: "success" });
      setCancelTarget(null);
      fetchShipments();
    } catch (err: any) {
      setToast({ message: err.message || "İptal işlemi başarısız", type: "error" });
    } finally {
      setCancelLoading(false);
    }
  }

  // ── Etiket İndirme ──
  const [labelLoading, setLabelLoading] = useState<Record<number, boolean>>({});
  const [labelModal, setLabelModal] = useState<{
    pdfUrl: string;
    trackingCode: string;
    carrierName: string;
    receiverCountry: string;
  } | null>(null);

  async function handleDownloadLabel(shipment: ShipmentListItem) {
    setLabelLoading(prev => ({ ...prev, [shipment.id]: true }));
    try {
      const token = localStorage.getItem("zalusa.token");
      const res = await fetch(`${API_BASE}/api/shipments/${shipment.id}/label`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        setToast({ message: data.error || "Etiket alınamadı", type: "error" });
        return;
      }

      if (data.integrationType === "pts" && data.pdfUrl) {
        setLabelModal({
          pdfUrl: data.pdfUrl,
          trackingCode: shipment.trackingCode || `ZLS-SHP-${shipment.id}`,
          carrierName: shipment.carrierName || "Kargo",
          receiverCountry: shipment.receiverCountry || "",
        });
      } else if (data.integrationType === "asset" && data.reference) {
        setToast({ message: "Asset etiketi hazırlanıyor, lütfen destek ile iletişime geçin.", type: "error" });
      } else if (!data.hasLabel) {
        setToast({ message: data.message || "Etiket henüz hazır değil. Birkaç dakika bekleyip tekrar deneyin.", type: "error" });
      }
    } catch {
      setToast({ message: "Etiket indirme hatası", type: "error" });
    } finally {
      setLabelLoading(prev => ({ ...prev, [shipment.id]: false }));
    }
  }

  const hasLabel = (status: string) => ["paid", "label_created", "shipped", "in_transit", "delivered"].includes(status);

  // â”€â”€ Client-side arama filtresi â”€â”€
  const filtered = shipments
    .filter((s) => {
      if (search) {
        const q = search.toLowerCase();
        const country = getCountryName(s.receiverCountry).toLowerCase();
        const code = s.receiverCountry.toLowerCase();
        const tracking = (s.trackingCode ?? "").toLowerCase();
        const carrier = (s.carrierName ?? "").toLowerCase();
        if (!country.includes(q) && !code.includes(q) && !tracking.includes(q) && !carrier.includes(q)) return false;
      }
      if (filterCarrier && (s.carrierName ?? "") !== filterCarrier) return false;
      if (filterType && (s.shipmentType ?? "") !== filterType) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "price_high") return (b.carrierPriceTry ?? 0) - (a.carrierPriceTry ?? 0);
      if (sortBy === "price_low") return (a.carrierPriceTry ?? 0) - (b.carrierPriceTry ?? 0);
      return 0;
    });

  const uniqueCarriers = Array.from(new Set(shipments.map(s => s.carrierName).filter(Boolean)));
  const uniqueTypes = Array.from(new Set(shipments.map(s => s.shipmentType).filter(Boolean)));
  const activeFilterCount = (filterCarrier ? 1 : 0) + (filterType ? 1 : 0);

  const tabCounts: Record<string, number> = {
    "Tümü": total,
    "Taslak": shipments.filter(s => s.status === "draft").length,
    "Ödeme Bekliyor": shipments.filter(s => s.status === "pending_payment").length,
    "Yolda": shipments.filter(s => s.status === "shipped").length,
    "Teslim Edildi": shipments.filter(s => s.status === "delivered").length,
  };

  // â”€â”€ Loading State â”€â”€
  if (loading && shipments.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  // â”€â”€ Error State â”€â”€
  if (error && shipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm text-red-500">{error}</p>
        <Button variant="secondary" onClick={fetchShipments}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  const totalPages = Math.ceil(total / limit);

  // İptal edilebilir statusler
  const canCancel = (status: string) => status === "draft" || status === "pending_payment";

  return (
    <div className="space-y-6 pb-10">
      {/* â”€â”€ Header â”€â”€ */}
      <div className="flex flex-col gap-1">
        <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
          Gönderilerim
        </h1>
        <p className="text-[13px] text-slate-500">
          Tüm gönderilerinizi ve taslaklarınızı buradan yönetebilirsiniz.
        </p>
      </div>

      {/* ── MSDS + PTS Uyarı Banner'ı ── */}
      {shipments.some(s => hasLabel(s.status)) && (
        <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 px-5 py-3.5 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center shrink-0 shadow-md shadow-amber-200">
            <FileText className="w-4.5 h-4.5 text-white" />
          </div>
          <p className="text-[13px] text-amber-800 leading-relaxed font-medium">
            <strong className="text-amber-900">⚠️ Önemli:</strong> Lütfen <strong>MSDS belgesini</strong> ve <strong>PTS etiketinizi</strong> çıktı olarak çıkarıp kolinin üzerine yapıştırınız.
          </p>
        </div>
      )}

      {/* â”€â”€ Search & Filter Row â”€â”€ */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 stroke-[2.5px]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Takip kodu, şehir veya kargo firması ara..."
            className="w-full pl-11 pr-4 rounded-[12px] h-[44px] border border-slate-200 bg-white text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Sırala Dropdown */}
          <div className="relative" ref={sortRef}>
            <button
              onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }}
              className={`flex items-center gap-2 px-4 h-[44px] text-[13px] font-semibold rounded-[12px] border transition-all shadow-sm ${sortBy !== "newest" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
            >
              <ArrowUpDown className="h-4 w-4" />
              Sırala
            </button>
            {sortOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-[48px] z-50 w-[220px] bg-white rounded-[14px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] border border-slate-100 py-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
                {[
                  { key: "newest" as const, label: "En Yeni" },
                  { key: "oldest" as const, label: "En Eski" },
                  { key: "price_high" as const, label: "Fiyat: Yüksekten Düşüğe" },
                  { key: "price_low" as const, label: "Fiyat: Düşükten Yükseğe" },
                ].map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => { setSortBy(opt.key); setSortOpen(false); }}
                    className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-semibold transition-colors ${sortBy === opt.key ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    {sortBy === opt.key && <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />}
                    <span className={sortBy === opt.key ? "" : "ml-[22px]"}>{opt.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Filtrele Dropdown */}
          <div className="relative" ref={filterRef}>
            <button
              onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }}
              className={`flex items-center gap-2 px-4 h-[44px] text-[13px] font-semibold rounded-[12px] border transition-all shadow-sm ${activeFilterCount > 0 ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"}`}
            >
              <Filter className="h-4 w-4" />
              Filtrele
              {activeFilterCount > 0 && (
                <span className="flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-blue-600 text-white text-[10px] font-bold">{activeFilterCount}</span>
              )}
            </button>
            {filterOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 top-[48px] z-50 w-[240px] bg-white rounded-[14px] shadow-[0_8px_30px_-4px_rgba(0,0,0,0.15)] border border-slate-100 py-2 px-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kargo Firması</div>
                <select
                  value={filterCarrier}
                  onChange={e => setFilterCarrier(e.target.value)}
                  className="w-full h-[36px] rounded-[8px] border border-slate-200 bg-white text-[13px] font-medium text-slate-700 px-2.5 mb-3 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="">Tümü</option>
                  {uniqueCarriers.map(c => <option key={c} value={c!}>{c}</option>)}
                </select>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Gönderi Tipi</div>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="w-full h-[36px] rounded-[8px] border border-slate-200 bg-white text-[13px] font-medium text-slate-700 px-2.5 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
                >
                  <option value="">Tümü</option>
                  {uniqueTypes.map(t => <option key={t} value={t!}>{t}</option>)}
                </select>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => { setFilterCarrier(""); setFilterType(""); }}
                    className="w-full mt-1 py-2 text-[12px] font-bold text-red-500 hover:bg-red-50 rounded-[8px] transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* â”€â”€ Tabs â”€â”€ */}
      <div className="border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab;
          
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold rounded-[10px] border transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-white border-slate-200 text-slate-900 shadow-sm"
                  : "bg-transparent border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span className={`flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-bold rounded-[5px] ${
                isActive ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
              }`}>
                {tabCounts[tab] ?? 0}
              </span>
              {tab}
            </button>
          );
        })}
        </div>
      </div>

      {/* â”€â”€ Loading overlay for tab/page changes â”€â”€ */}
      {loading && shipments.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {/* â”€â”€ Empty State â”€â”€ */}
      {!loading && filtered.length === 0 ? (
        <Card className="border-dashed rounded-[24px]">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Box className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Gönderi Bulunamadı</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">
              {search
                ? "Arama kriterlerinize uygun bir gönderi bulunamadı."
                : "Henüz hiç gönderi oluşturmadınız."}
            </p>
            <Button
              className="mt-6 rounded-full"
              onClick={() => (window.location.href = "/panel/gonderi-olustur")}
            >
              Yeni Gönderi Oluştur
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* â”€â”€ Shipment Cards â”€â”€ */
        <div className="grid gap-4">
          {filtered.map((s) => {
            const rawDate = new Date(s.createdAt || Date.now());
            const trMonth = rawDate.toLocaleString('tr-TR', { month: 'short' }).replace('.', '').toUpperCase();
            const cardDate = `${rawDate.getDate().toString().padStart(2, '0')} ${trMonth} ${rawDate.getFullYear()}`;

            const isDelivered = s.status === "delivered";
            const showMenu = canCancel(s.status);

            return (
              <div
                key={s.id}
                className="bg-white rounded-[16px] border border-slate-200 p-5 transition-all hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-5 relative"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Origin -> Destination pipeline */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 w-full sm:w-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-[20px] sm:text-[24px] leading-none select-none">{getCountryEmoji(s.senderCountry)}</span>
                      <span className="text-[17px] sm:text-[18px] font-bold text-slate-900 tracking-tight">{s.senderCountry}</span>
                    </div>
                    
                    <div className="flex-1 flex items-center justify-center relative px-2 sm:px-4 min-w-[60px] max-w-[400px]">
                      <div className={`w-full border-t-[2px] border-dashed ${isDelivered ? "border-[#10B981]/40" : "border-slate-200"}`}></div>
                      <div className={`absolute w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                        isDelivered ? "bg-[#10B981] shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" : "bg-slate-50"
                      }`}>
                        <Plane className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isDelivered ? "text-white" : "text-slate-400"}`} style={{ transform: "rotate(45deg)" }} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[17px] sm:text-[18px] font-bold text-slate-900 tracking-tight">{s.receiverCountry}</span>
                      <span className="text-[20px] sm:text-[24px] leading-none select-none">{getCountryEmoji(s.receiverCountry)}</span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 xl:gap-6 mt-2 sm:mt-0 pl-0 sm:pl-4">
                    <div className="flex flex-col items-start xl:items-end">
                      <span className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">Toplam Ücret</span>
                      <span className="text-[18px] font-bold text-slate-900 tracking-tight mt-0.5">
                        {s.carrierCurrency === "TRY"
                          ? `${(s.carrierPriceTry ?? 0).toLocaleString("tr-TR")} ₺`
                          : `$${(s.carrierPrice ?? 0).toFixed(2)}`}
                      </span>
                      {s.discountAmountTry && s.discountAmountTry > 0 ? (
                        <div className="mt-1 flex items-center justify-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <Crown className="h-3 w-3" />
                          <span>{s.discountAmountTry.toLocaleString("tr-TR")} ₺ Bayi İndirimi Kazanıldı</span>
                        </div>
                      ) : null}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Etiket İndir — ödeme sonrası statülerde */}
                      {hasLabel(s.status) && (
                        <button
                          className="px-4 py-[10px] rounded-full bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                          onClick={() => handleDownloadLabel(s)}
                          disabled={labelLoading[s.id]}
                        >
                          {labelLoading[s.id] ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <FileText className="h-3.5 w-3.5" />
                          )}
                          Etiket İndir
                        </button>
                      )}

                      {s.status === "draft" ? (
                        <button
                          className="px-6 py-[10px] rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-bold transition-all shadow-sm"
                          onClick={() => window.location.href = `/panel/gonderi-olustur?draft=${s.id}`}
                        >
                          Devam Et
                        </button>
                      ) : s.status === "pending_payment" ? (
                        <button
                          className="px-6 py-[10px] rounded-full bg-[#10B981] hover:bg-[#10B981] text-white text-[13px] font-bold transition-all shadow-sm"
                          onClick={() => window.location.href = `/panel/odeme/${s.id}`}
                        >
                          Ödeme Yap
                        </button>
                      ) : s.status === "shipped" ? (
                        <button
                          className="px-6 py-[10px] rounded-full bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 text-[13px] font-bold transition-all shadow-sm"
                          onClick={() => window.location.href = `/panel/takip/${s.trackingCode}`}
                        >
                          Kargo Takip
                        </button>
                      ) : (
                        <button
                          className="px-6 py-[10px] rounded-full bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 text-[13px] font-bold transition-all shadow-sm"
                          onClick={() => window.location.href = `/panel/gonderiler/${s.id}`}
                        >
                          Detaylar
                        </button>
                      )}

                      {/* 3 Nokta Menü â€” Sadece draft ve pending_payment için */}
                      {showMenu && (
                        <ShipmentDropdown
                          shipmentId={s.id}
                          onCancel={() => setCancelTarget({ id: s.id, trackingCode: s.trackingCode })}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="h-px w-full bg-slate-100/70"></div>

                {/* Bottom Row */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    {/* Tracking Code */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-slate-50 border border-slate-100 text-[12px] font-bold text-slate-600 tracking-wide">
                      {s.trackingCode || `ZLS-SHP-${s.id}`}
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {/* Status */}
                    <StatusBadge status={s.status} />
                    {/* Type */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white border border-slate-200 text-slate-600 text-[12px] font-semibold tracking-wide">
                      <Box className="h-3.5 w-3.5 text-slate-400" />
                      {s.shipmentType || "Paket"}
                    </div>
                    {/* Carrier */}
                    {s.carrierName && (
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-white border border-slate-200 text-slate-700 text-[12px] font-bold tracking-wide">
                        {s.carrierLogoUrl ? (
                          <div className="w-[18px] h-[18px] rounded-[4px] overflow-hidden bg-slate-50 flex items-center justify-center shrink-0">
                            <img src={getLogoSrc(s.carrierLogoUrl)} alt={s.carrierName} className="w-full h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-[18px] h-[18px] bg-[#3B2902] rounded-[4px] flex items-center justify-center shrink-0">
                            <Package className="h-2.5 w-2.5 text-amber-500" />
                          </div>
                        )}
                        {s.carrierName}{s.serviceName ? ` ${s.serviceName}` : ""}
                      </div>
                    )}
                    {/* Attachments */}
                    {(s as any).attachments && (s as any).attachments.length > 0 && (
                      <div className="flex items-center gap-2 ml-1">
                        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>
                        {(s as any).attachments.map((att: any, i: number) => (
                          <a key={i} href={getLogoSrc(att.url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-sky-50 border border-sky-100 text-sky-700 text-[12px] font-bold tracking-wide hover:bg-sky-100 transition-colors">
                            <ExternalLink className="h-3 w-3" /> {att.fileType || "Belge"}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-5 text-[12px] text-slate-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>Tarih: <span className="font-bold text-slate-700">{cardDate}</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <WeightIcon className="h-3.5 w-3.5" />
                      <span>Ağırlık: <span className="font-bold text-slate-700">{s.chargeableWeight ? s.chargeableWeight.toFixed(1) : "0.0"} kg</span></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Box className="h-3.5 w-3.5" />
                      <span>Koli: <span className="font-bold text-slate-700">{s.totalPackageCount || 1} adet</span></span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* â”€â”€ Pagination â”€â”€ */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Önceki
          </Button>
          <span className="text-sm text-slate-500 px-3">
            {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sonraki
          </Button>
        </div>
      )}

      {/* â”€â”€ İptal Onay Modalı â”€â”€ */}
      {cancelTarget && (
        <CancelConfirmModal
          shipmentId={cancelTarget.id}
          trackingCode={cancelTarget.trackingCode}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
          loading={cancelLoading}
        />
      )}

      {/* â”€â”€ Toast Bildirimi â”€â”€ */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* ── Etiket Modal ── */}
      {labelModal && (
        <LabelModal
          pdfUrl={labelModal.pdfUrl}
          trackingCode={labelModal.trackingCode}
          carrierName={labelModal.carrierName}
          receiverCountry={labelModal.receiverCountry}
          onClose={() => setLabelModal(null)}
        />
      )}
    </div>
  );
}

// ─── Kargo Etiketi Modalı ─────────────────────────────────────────────────────

function LabelModal({
  pdfUrl,
  trackingCode,
  carrierName,
  receiverCountry,
  onClose,
}: {
  pdfUrl: string;
  trackingCode: string;
  carrierName: string;
  receiverCountry: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-[24px] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.3)] w-full max-w-[720px] max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-lg shadow-teal-200">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-[18px] font-bold text-slate-900">Kargo Etiketiniz Hazır!</h2>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  <span className="font-bold text-slate-700">{trackingCode}</span>
                  <span className="mx-1.5">&middot;</span>
                  {carrierName}
                  {receiverCountry && (
                    <>
                      <span className="mx-1.5">&rarr;</span>
                      <span>{receiverCountry}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Steps / Instructions */}
        <div className="px-6 py-4 bg-gradient-to-r from-teal-50/80 to-emerald-50/60 border-b border-teal-100/50">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2.5 text-[12px] font-bold text-teal-700">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500 text-white text-[11px] font-black shadow-sm shrink-0">1</span>
              PTS etiketi ve MSDS belgesini indirin
            </div>
            <div className="w-4 h-px bg-teal-300/50 hidden sm:block" />
            <div className="flex items-center gap-2.5 text-[12px] font-bold text-teal-700">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500 text-white text-[11px] font-black shadow-sm shrink-0">2</span>
              Çıktı alın
            </div>
            <div className="w-4 h-px bg-teal-300/50 hidden sm:block" />
            <div className="flex items-center gap-2.5 text-[12px] font-bold text-teal-700">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-teal-500 text-white text-[11px] font-black shadow-sm shrink-0">3</span>
              Kolinin üzerine yapıştırın
            </div>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden px-4 py-3" style={{ minHeight: "400px" }}>
          <iframe
            src={pdfUrl}
            className="w-full h-full rounded-xl border border-slate-200"
            style={{ minHeight: "380px" }}
            title="Kargo Etiketi"
          />
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3">
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 h-[48px] rounded-2xl bg-teal-500 hover:bg-teal-600 text-white text-[14px] font-bold transition-all shadow-lg shadow-teal-200/50"
          >
            <Download className="h-4 w-4" />
            {"Etiketi \u0130ndir / Yazd\u0131r"}
          </a>
          <button
            onClick={onClose}
            className="h-[48px] px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[14px] font-bold transition-all"
          >
            Kapat
          </button>
        </div>

        {/* Scrolling Marquee Ticker */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 overflow-hidden py-2.5">
          <div className="flex whitespace-nowrap" style={{
            animation: "labelMarquee 30s linear infinite",
          }}>
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center shrink-0">
                {Array.from({ length: 4 }).map((_, j) => (
                  <React.Fragment key={j}>
                    <span className="mx-6 text-[12px] font-bold text-teal-400 tracking-wider">
                      ✦ Zalusa&apos;yı tercih ettiğiniz için teşekkür ederiz
                    </span>
                    <span className="mx-6 text-[12px] font-bold text-amber-400 tracking-wider">
                      ⚠️ Lütfen MSDS belgesini ve etiketinizi çıktı olarak çıkarınız
                    </span>
                    <span className="mx-6 text-[12px] font-bold text-slate-400 tracking-wider">
                      📦 Çıktıları kolinin üzerine yapıştırınız
                    </span>
                    <span className="mx-6 text-[12px] font-bold text-emerald-400 tracking-wider">
                      🚀 Gönderiniz en kısa sürede yola çıkacaktır
                    </span>
                  </React.Fragment>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes labelMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
