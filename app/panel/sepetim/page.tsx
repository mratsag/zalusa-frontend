"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Package,
  CreditCard,
  Box,
  Search,
  CalendarDays,
  Loader2,
  Copy,
  Plane,
  ShoppingCart,
  Trash2,
  Crown,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShipmentListItem, shipmentService } from "@/lib/services/shipmentService";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
function getLogoSrc(url: string): string {
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  return `${API_BASE}${url}`;
}

// ─── Ülke Kodu → Türkçe Ad ───────────────────────────────────────────────────

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

function getCountryEmoji(countryCode: string) {
  if (!countryCode) return "🏳️";
  const code = countryCode.toUpperCase();
  const codePoints = code
    .slice(0, 2)
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// ─── Custom Icons ─────────────────────────────────────────────────────────────

function WeightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v2" />
      <path d="M8 8a2 2 0 0 1 8 0v8a4 4 0 0 1-8 0V8z" />
      <path d="M8 8h8" />
    </svg>
  );
}

// ─── Tarih Formatlama ─────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const date = new Date(iso);
  const trMonth = date.toLocaleString('tr-TR', { month: 'short' }).replace('.', '').toUpperCase();
  return `${date.getDate().toString().padStart(2, '0')} ${trMonth} ${date.getFullYear()}`;
}

// ─── Sepetim Sayfası ─────────────────────────────────────────────────────────

export default function SepetimPage() {
  const [shipments, setShipments] = useState<ShipmentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // ── Ödeme bekleyen gönderileri çek ──
  const fetchPendingShipments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await shipmentService.list({
        status: "pending_payment",
        page: 1,
        limit: 100,
      });
      setShipments(res.shipments);
    } catch (err: any) {
      setError(err.message ?? "Gönderiler yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingShipments();
  }, [fetchPendingShipments]);

  // ── Arama filtresi ──
  const filtered = shipments.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const country = getCountryName(s.receiverCountry).toLowerCase();
    const tracking = (s.trackingCode ?? "").toLowerCase();
    const carrier = (s.carrierName ?? "").toLowerCase();
    return country.includes(q) || tracking.includes(q) || carrier.includes(q);
  });

  // ── Seçim toggle ──
  function toggleSelect(id: number) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(s => s.id)));
    }
  }

  // ── Kopyalama ──
  function copyTrackingCode(id: number, code: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  // ── Toplam tutar ──
  const selectedShipments = filtered.filter(s => selectedIds.has(s.id));
  const totalTry = selectedShipments.reduce((sum, s) => sum + (s.carrierPriceTry ?? 0), 0);

  // ── Loading State ──
  if (loading && shipments.length === 0) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-64" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </div>
    );
  }

  // ── Error State ──
  if (error && shipments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-sm text-red-500">{error}</p>
        <Button variant="secondary" onClick={fetchPendingShipments}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-bold tracking-tight text-slate-900">
            Sepetim
          </h1>
          <p className="text-[13px] text-slate-500">
            Ödemesi tamamlanmamış gönderileriniz burada listelenir. Tek tek veya toplu ödeme yapabilirsiniz.
          </p>
        </div>
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 text-[13px] text-slate-500">
            <ShoppingCart className="h-4 w-4" />
            <span className="font-semibold text-slate-700">{filtered.length}</span> gönderi bekliyor
          </div>
        )}
      </div>

      {/* ── Search ── */}
      {shipments.length > 0 && (
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 stroke-[2.5px]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Takip kodu, ülke veya kargo firması ara..."
            className="w-full pl-11 pr-4 rounded-[12px] h-[44px] border border-slate-200 bg-white text-[14px] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-700 placeholder:text-slate-400 font-medium"
          />
        </div>
      )}

      {/* ── Select All Bar ── */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-[14px] border border-slate-200 px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className={`flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all ${
                selectedIds.size === filtered.length && filtered.length > 0
                  ? "bg-[#3959F2] border-[#3959F2] text-white"
                  : "border-slate-300 bg-white hover:border-slate-400"
              }`}
            >
              {selectedIds.size === filtered.length && filtered.length > 0 && (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
            </button>
            <span className="text-[13px] font-semibold text-slate-600">
              {selectedIds.size > 0
                ? `${selectedIds.size} gönderi seçildi`
                : "Tümünü seç"}
            </span>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-[11px] text-slate-400 font-medium">Toplam Tutar</div>
                <div className="text-[16px] font-bold text-slate-900">{totalTry.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</div>
              </div>
              <button
                className="px-6 py-2.5 rounded-[12px] bg-[#10B981] hover:bg-[#059669] text-white text-[13px] font-bold transition-all shadow-sm"
                onClick={() => {
                  if (selectedIds.size === 1) {
                    const id = Array.from(selectedIds)[0];
                    window.location.href = `/panel/odeme/${id}`;
                  } else {
                    // Toplu ödeme - şimdilik ilk seçileni açalım
                    const id = Array.from(selectedIds)[0];
                    window.location.href = `/panel/odeme/${id}`;
                  }
                }}
              >
                <CreditCard className="h-4 w-4 inline mr-1.5 -mt-0.5" />
                Ödeme Yap
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Loading overlay ── */}
      {loading && shipments.length > 0 && (
        <div className="flex justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && filtered.length === 0 ? (
        <Card className="border-dashed rounded-[24px]">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-800">
              Sepetiniz Boş
            </h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm">
              {search
                ? "Arama kriterlerinize uygun ödeme bekleyen gönderi bulunamadı."
                : "Tüm ödemeleriniz tamamlanmış görünüyor. Yeni gönderi oluşturabilirsiniz."}
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
        /* ── Shipment Cards ── */
        <div className="grid gap-4">
          {filtered.map((s) => {
            const cardDate = formatDate(s.createdAt || new Date().toISOString());
            const isSelected = selectedIds.has(s.id);

            return (
              <div
                key={s.id}
                className={`bg-white rounded-[16px] border p-5 transition-all hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-4 relative ${
                  isSelected
                    ? "border-[#3959F2] ring-1 ring-[#3959F2]/20 shadow-sm"
                    : "border-slate-200"
                }`}
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  {/* Checkbox + Route */}
                  <div className="flex items-center gap-4 flex-1 w-full sm:w-auto">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(s.id)}
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                        isSelected
                          ? "bg-[#3959F2] border-[#3959F2] text-white"
                          : "border-slate-300 bg-white hover:border-slate-400"
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </button>

                    {/* Route */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[20px] sm:text-[24px] leading-none select-none">{getCountryEmoji(s.senderCountry)}</span>
                        <span className="text-[17px] sm:text-[18px] font-bold text-slate-900 tracking-tight">{s.senderCountry}</span>
                      </div>

                      <div className="flex-1 flex items-center justify-center relative px-2 sm:px-4 min-w-[60px] max-w-[300px]">
                        <div className="w-full border-t-[2px] border-dashed border-orange-200"></div>
                        <div className="absolute w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-orange-50">
                          <Plane className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-400" style={{ transform: "rotate(45deg)" }} />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[17px] sm:text-[18px] font-bold text-slate-900 tracking-tight">{s.receiverCountry}</span>
                        <span className="text-[20px] sm:text-[24px] leading-none select-none">{getCountryEmoji(s.receiverCountry)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Price + Actions */}
                  <div className="flex items-center justify-between w-full sm:w-auto gap-4 mt-2 sm:mt-0 pl-9 sm:pl-4">
                    <div className="flex flex-col items-start xl:items-end">
                      <span className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase">Toplam Ücret</span>
                      <span className="text-[18px] font-bold text-slate-900 tracking-tight mt-0.5">
                        {s.carrierPriceTry
                          ? `${s.carrierPriceTry.toLocaleString("tr-TR")} ₺`
                          : s.carrierPrice
                          ? `${s.carrierCurrency === "EUR" ? "€" : s.carrierCurrency === "GBP" ? "£" : "$"}${s.carrierPrice.toFixed(2)}`
                          : "—"}
                      </span>
                      {s.discountAmountTry && s.discountAmountTry > 0 ? (
                        <div className="mt-1 flex items-center justify-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                          <Crown className="h-3 w-3" />
                          <span>{s.discountAmountTry.toLocaleString("tr-TR")} ₺ İndirim</span>
                        </div>
                      ) : null}
                    </div>

                    <button
                      className="px-6 py-[10px] rounded-full bg-[#10B981] hover:bg-[#059669] text-white text-[13px] font-bold transition-all shadow-sm"
                      onClick={() => window.location.href = `/panel/odeme/${s.id}`}
                    >
                      Ödeme Yap
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px w-full bg-slate-100/70"></div>

                {/* Bottom Row */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    {/* Tracking Code */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-slate-50 border border-slate-100 text-[12px] font-bold text-slate-600 tracking-wide">
                      {s.trackingCode || `ZLS-SHP-${s.id}`}
                      <button
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                        onClick={() => copyTrackingCode(s.id, s.trackingCode || `ZLS-SHP-${s.id}`)}
                      >
                        {copiedId === s.id ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    {/* Status Badge */}
                    <span className="bg-orange-50 text-orange-600 px-3 py-1 rounded-[8px] text-[11px] font-bold tracking-wide flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                      ÖDEME BEKLİYOR
                    </span>
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
    </div>
  );
}
