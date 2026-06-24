"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Globe2,
  PackageCheck,
  PackageOpen,
  PackagePlus,
  Calculator,
  Bike,
  ShoppingCart,
  ReceiptText,
  Scale,
  Clock,
  Ban,
  Loader2,
} from "lucide-react";

import { KpiCard } from "@/components/panel/kpi-card";
import { PanelDataSection } from "./dashboard-client-section";
import {
  dashboardService,
  DashboardStats,
} from "@/lib/services/dashboardService";

// ─── Ülke Kodu → Türkçe Ad ───────────────────────────────────────────────────

const COUNTRY_NAMES: Record<string, string> = {
  DE: "Almanya",
  NL: "Hollanda",
  FR: "Fransa",
  GB: "İngiltere",
  US: "ABD",
  IT: "İtalya",
  ES: "İspanya",
  AT: "Avusturya",
  BE: "Belçika",
  CH: "İsviçre",
  SE: "İsveç",
  DK: "Danimarka",
  NO: "Norveç",
  PL: "Polonya",
  CZ: "Çekya",
  PT: "Portekiz",
  IE: "İrlanda",
  FI: "Finlandiya",
  GR: "Yunanistan",
  RO: "Romanya",
  BG: "Bulgaristan",
  HR: "Hırvatistan",
  HU: "Macaristan",
  SK: "Slovakya",
  SI: "Slovenya",
  LT: "Litvanya",
  LV: "Letonya",
  EE: "Estonya",
  JP: "Japonya",
  CN: "Çin",
  KR: "Güney Kore",
  AU: "Avustralya",
  CA: "Kanada",
  BR: "Brezilya",
  SA: "Suudi Arabistan",
  AE: "BAE",
  TR: "Türkiye",
};

function getCountryName(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] ?? code;
}

// ─── Status Mapping ───────────────────────────────────────────────────────────

const STATUS_MAP: Record<
  string,
  { label: string; className: string; dotClass: string }
> = {
  draft: {
    label: "TASLAK",
    className: "bg-slate-100 text-slate-600",
    dotClass: "bg-slate-400",
  },
  pending_payment: {
    label: "ÖDEME BEKLEYEN",
    className: "bg-orange-50 text-orange-600",
    dotClass: "bg-orange-500",
  },
  paid: {
    label: "ÖDENDİ",
    className: "bg-blue-50 text-blue-600",
    dotClass: "bg-blue-500",
  },
  processing: {
    label: "İŞLENİYOR",
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
  awaiting_transfer_approval: {
    label: "HAVALE ONAYI BEKLENİYOR",
    className: "bg-violet-50 text-violet-600",
    dotClass: "bg-violet-500",
  },
  label_created: {
    label: "ETİKET OLUŞTURULDU",
    className: "bg-cyan-50 text-cyan-600",
    dotClass: "bg-cyan-500",
  },
  in_transit: {
    label: "YOLDA",
    className: "bg-sky-50 text-sky-600",
    dotClass: "bg-sky-500",
  },
  returned: {
    label: "İADE EDİLDİ",
    className: "bg-rose-50 text-rose-600",
    dotClass: "bg-rose-500",
  },
};

function getStatus(status: string) {
  return (
    STATUS_MAP[status] ?? {
      label: status,
      className: "bg-slate-100 text-slate-600",
      dotClass: "bg-slate-400",
    }
  );
}

function StatusBadge({ status }: { status: string }) {
  const st = getStatus(status);
  return (
    <span
      className={`${st.className} px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide inline-flex items-center gap-1.5 whitespace-nowrap`}
    >
      <span
        className={`w-[6px] h-[6px] rounded-full ${st.dotClass || "bg-slate-400"}`}
      />
      {st.label}
    </span>
  );
}

// ─── Tarih Formatlama ─────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Sayfa Bileşeni ──────────────────────────────────────────────────────────


// Bayrak URL helper - IK ve US gibi özel kodlar için yerel dosya kullan
function getFlagImageUrl(code: string, size: number = 40): string {
  const upper = code.toUpperCase();
  if (upper === "US" || upper === "ABD") return "/us-flag.png";
  if (upper === "IK") return "/ik-flag.png";
  return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`;
}
export default function PanelHomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<string>("all");

  useEffect(() => {
    // İlk yüklemede loading göster, filtre değişimlerinde gösterme (titreme önlenir)
    if (!stats) setLoading(true);
    dashboardService
      .getStats(period)
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [period]);

  // ── İlk yükleme ──
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-[#94A3B8]" />
      </div>
    );
  }

  // ── Error ──
  if (error && !stats) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-red-500">
          {error ?? "Veriler yüklenemedi."}
        </p>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-7 pb-10">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-[20px] sm:text-[24px] font-extrabold tracking-tight text-[#1E293B]">
            Dashboard
          </h1>
          <p className="text-[12px] sm:text-[14px] text-[#64748B] font-medium leading-relaxed">
            Panelinize hoş geldiniz. Hesap özetinizi ve istatistiklerinizi
            buradan inceleyebilirsiniz.
          </p>
        </div>
        <div className="flex items-center gap-1 bg-[#F8FAFC] rounded-xl p-1 ring-1 ring-[#E2E8F0] shrink-0 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {[
            { key: "week", label: "Bu Hafta" },
            { key: "month", label: "Bu Ay" },
            { key: "year", label: "Bu Yıl" },
            { key: "all", label: "Tüm Zamanlar" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setPeriod(item.key)}
              className={`px-2.5 sm:px-3.5 py-2 text-[12px] sm:text-[13px] font-bold rounded-lg transition-all duration-200 whitespace-nowrap shrink-0 ${
                period === item.key
                  ? "bg-[#1E293B] text-white shadow-sm"
                  : "text-[#94A3B8] hover:text-[#64748B]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI Kartları ── */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          title="Toplam Gönderi"
          value={stats.totalShipments}
          icon={PackageOpen}
          helper="Tüm zamanlar"
        />
        <KpiCard
          title="Toplam Harcama"
          value={`${stats.totalSpentTry.toLocaleString("tr-TR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })} ₺`}
          icon={ReceiptText}
          helper="Tüm zamanlar"
        />
        <KpiCard
          title="Ortalama Maliyet"
          value={`${stats.averageShipmentCostTry.toLocaleString("tr-TR", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })} ₺`}
          icon={Scale}
          helper="Tahmini ortalama"
        />
        <KpiCard
          title="Teslim Edilenler"
          value={stats.deliveredShipments}
          icon={PackageCheck}
          helper="Tüm zamanlar"
        />
        <KpiCard
          title="Ülke Sayısı"
          value={stats.uniqueCountriesCount}
          icon={Globe2}
          helper="Gönderim yapılan"
        />
      </div>


      {/* ── Ülkeler (Yan Yana) ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Gönderdiğim Ülkeler ── */}
        <div className="bg-white rounded-[20px] border border-[#E8EDF2] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-[16px] font-bold tracking-tight text-[#1E293B]">
              Gönderdiğim Ülkeler
            </h2>
          </div>
          <div className="px-6 pb-6">
            {stats.topCountries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Globe2 className="h-10 w-10 text-[#CBD5E1] mb-3" />
                <p className="text-[14px] font-bold text-[#64748B]">Ülke bulunamadı</p>
                <p className="text-[13px] text-[#94A3B8] mt-1">Henüz hiç gönderi yapmadınız.</p>
              </div>
            ) : (() => {
              const maxCount = Math.max(...stats.topCountries.map(c => c.count), 1);
              return (
                <div className="space-y-4">
                  {stats.topCountries.map((c) => {
                    const pct = Math.round((c.count / maxCount) * 100);
                    return (
                      <div key={c.countryCode} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 overflow-hidden items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-[#E2E8F0]">
                              <img src={getFlagImageUrl(c.countryCode, 40)} alt={getCountryName(c.countryCode)} className="h-full w-full object-cover" />
                            </div>
                            <span className="text-[14px] font-bold text-[#1E293B]">{getCountryName(c.countryCode)}</span>
                          </div>
                          <span className="text-[14px] font-extrabold text-[#6366F1]">{c.count}</span>
                        </div>
                        <div className="h-[6px] w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#6366F1] to-[#818CF8] transition-all duration-500 ease-out group-hover:from-[#4F46E5] group-hover:to-[#6366F1]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>

        {/* ── En Çok Gönderim Yapılan Ülkeler ── */}
        <div className="bg-white rounded-[20px] border border-[#E8EDF2] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-[16px] font-bold tracking-tight text-[#1E293B]">
              En Çok Gönderim Yapılan
            </h2>
          </div>
          <div className="px-6 pb-6">
            {stats.topCountries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Globe2 className="h-10 w-10 text-[#CBD5E1] mb-3" />
                <p className="text-[14px] font-bold text-[#64748B]">Ülke bulunamadı</p>
                <p className="text-[13px] text-[#94A3B8] mt-1">Henüz hiç gönderi yapmadınız.</p>
              </div>
            ) : (() => {
              const sorted = [...stats.topCountries].sort((a, b) => b.count - a.count);
              const maxCount = Math.max(...sorted.map(c => c.count), 1);
              return (
                <div className="space-y-4">
                  {sorted.map((c, idx) => {
                    const pct = Math.round((c.count / maxCount) * 100);
                    return (
                      <div key={c.countryCode} className="group">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F59E0B] text-[11px] font-extrabold text-white shrink-0">
                              {idx + 1}
                            </span>
                            <div className="flex h-7 w-7 shrink-0 overflow-hidden items-center justify-center rounded-md bg-white shadow-sm ring-1 ring-[#E2E8F0]">
                              <img src={getFlagImageUrl(c.countryCode, 40)} alt={getCountryName(c.countryCode)} className="h-full w-full object-cover" />
                            </div>
                            <span className="text-[14px] font-bold text-[#1E293B]">{getCountryName(c.countryCode)}</span>
                          </div>
                          <span className="text-[14px] font-extrabold text-[#F59E0B]">{c.count}</span>
                        </div>
                        <div className="h-[6px] w-full rounded-full bg-[#F1F5F9] overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] transition-all duration-500 ease-out group-hover:from-[#D97706] group-hover:to-[#F59E0B]" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ── Son Gönderiler + Son İşlemler (yan yana) ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Son Gönderiler (Tablo) ── */}
        <div className="bg-white rounded-[20px] border border-[#E8EDF2] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-[16px] font-bold tracking-tight text-[#1E293B]">
              Son Gönderiler
            </h2>
            <span className="text-[13px] font-semibold text-[#6366F1] cursor-pointer hover:text-[#4F46E5] transition-colors">
              Tümünü Gör →
            </span>
          </div>
          <div className="px-6 pb-6">
            {stats.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <PackageOpen className="h-10 w-10 text-[#CBD5E1] mb-3" />
                <p className="text-[14px] font-bold text-[#64748B]">Gönderi bulunamadı</p>
                <p className="text-[13px] text-[#94A3B8] mt-1">Son gönderileriniz burada listelenecek.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[#F1F5F9]">
                      <th className="pb-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Kod</th>
                      <th className="pb-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">Hedef</th>
                      <th className="pb-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider hidden sm:table-cell">Durum</th>
                      <th className="pb-3 text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider text-right">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentOrders.map((order) => {
                      const st = getStatus(order.paymentStage || order.status);
                      return (
                        <tr key={order.id} className="border-b border-[#F8FAFC] last:border-0 hover:bg-[#FAFBFF] transition-colors">
                          <td className="py-3">
                            <span className="text-[13px] font-bold text-[#1E293B] font-mono">
                              {order.trackingCode || `ZLS-SHP-${order.id}`}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-5 w-5 shrink-0 overflow-hidden items-center justify-center rounded-sm ring-1 ring-[#E2E8F0]">
                                <img
                                  src={getFlagImageUrl(order.countryCode, 40)}
                                  alt={getCountryName(order.countryCode)}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <span className="text-[13px] font-semibold text-[#475569]">
                                {getCountryName(order.countryCode)}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 hidden sm:table-cell">
                            <span className={`${st.className} px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide inline-flex items-center gap-1 whitespace-nowrap`}>
                              <span className={`w-[5px] h-[5px] rounded-full ${st.dotClass}`} />
                              {st.label}
                            </span>
                          </td>
                          <td className="py-3 text-right">
                            <span className="text-[12px] font-semibold text-[#94A3B8]">
                              {formatDate(order.createdAt)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Son İşlemler (Kargo Kodu + Ücret) ── */}
        <div className="bg-white rounded-[20px] border border-[#E8EDF2] shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <h2 className="text-[16px] font-bold tracking-tight text-[#1E293B]">
              Son İşlemler
            </h2>
            <span className="text-[13px] font-semibold text-[#6366F1] cursor-pointer hover:text-[#4F46E5] transition-colors">
              Tümünü Gör →
            </span>
          </div>
          <div className="px-6 pb-6">
            {stats.recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <PackageOpen className="h-10 w-10 text-[#CBD5E1] mb-3" />
                <p className="text-[14px] font-bold text-[#64748B]">İşlem bulunamadı</p>
                <p className="text-[13px] text-[#94A3B8] mt-1">Son işlemleriniz burada listelenecek.</p>
              </div>
            ) : (
              <div className="divide-y divide-[#F1F5F9]">
                {stats.recentOrders.map((order) => {
                  const eff = order.paymentStage || order.status;
                  const paid = ["paid", "label_created", "shipped", "in_transit", "delivered", "processing"].includes(eff);
                  const awaiting = eff === "awaiting_transfer_approval";
                  const voided = eff === "cancelled" || eff === "returned";
                  const pay = paid
                    ? { label: "Ödeme Tamamlandı", badge: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500", Icon: PackageCheck, iconWrap: "bg-emerald-50 text-emerald-600", amountCls: "text-[#EF4444]", sign: "-", note: null }
                    : awaiting
                      ? { label: "Havale Onayı Bekleniyor", badge: "bg-violet-50 text-violet-600", dot: "bg-violet-500", Icon: Clock, iconWrap: "bg-violet-50 text-violet-600", amountCls: "text-violet-600", sign: "", note: "Onay bekleniyor" }
                      : voided
                        ? { label: eff === "returned" ? "İade Edildi" : "İptal Edildi", badge: "bg-slate-100 text-slate-500", dot: "bg-slate-400", Icon: Ban, iconWrap: "bg-slate-100 text-slate-400", amountCls: "text-[#CBD5E1] line-through", sign: "", note: null }
                        : { label: "Ödeme Bekleniyor", badge: "bg-orange-50 text-orange-600", dot: "bg-orange-500", Icon: Clock, iconWrap: "bg-orange-50 text-orange-500", amountCls: "text-[#F59E0B]", sign: "", note: "Henüz tahsil edilmedi" };
                  const PayIcon = pay.Icon;
                  return (
                    <div
                      key={order.id}
                      className="flex items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${pay.iconWrap}`}>
                          <PayIcon className="h-[18px] w-[18px]" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-bold text-[#1E293B] leading-snug">
                            {getCountryName(order.countryCode)} Gönderi Ücreti
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className={`${pay.badge} px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 whitespace-nowrap`}>
                              <span className={`w-[5px] h-[5px] rounded-full ${pay.dot}`} />
                              {pay.label}
                            </span>
                            <span className="text-[11px] font-medium text-[#94A3B8]">{formatDate(order.createdAt)}</span>
                            <span className="text-[11px] font-medium text-[#94A3B8]">·</span>
                            <span className="text-[11px] font-medium text-[#94A3B8] font-mono">{order.trackingCode || `ZLS-SHP-${order.id}`}</span>
                          </div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className={`block text-[14px] font-extrabold ${pay.amountCls}`}>
                          {pay.sign}{order.priceTry.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ₺
                        </span>
                        {pay.note && (
                          <span className="block text-[10px] font-semibold text-[#F59E0B] mt-0.5">{pay.note}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-2">
        <PanelDataSection />
      </div>

      {/* ── Hızlı Erişim ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: PackagePlus, label: "Gönderi Oluştur", desc: "Yeni kargo başlat", href: "/panel/gonderi-olustur", bg: "bg-[#EEF2FF]", iconColor: "text-[#6366F1]" },
          { icon: Calculator, label: "Fiyat Hesapla", desc: "Kargo ücreti karşılaştır", href: "/panel/fiyat-hesaplama", bg: "bg-[#FFF7ED]", iconColor: "text-[#F59E0B]" },
          { icon: Bike, label: "Kurye Çağır", desc: "Adresinden teslim al", href: "/panel/kurye-cagir", bg: "bg-[#ECFDF5]", iconColor: "text-[#10B981]" },
          { icon: ShoppingCart, label: "Sepete Git", desc: "Ödeme bekleyen", href: "/panel/sepetim", bg: "bg-[#FFF1F2]", iconColor: "text-[#F43F5E]" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className="group flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-3 rounded-2xl bg-white border border-[#E8EDF2] p-3 sm:p-4 text-left shadow-sm hover:shadow-md hover:border-[#CBD5E1] transition-all"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.iconColor} group-hover:scale-105 transition-transform`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[12px] sm:text-[13px] font-bold text-[#1E293B] leading-snug">{item.label}</div>
                <div className="text-[10px] sm:text-[11px] text-[#94A3B8] leading-snug">{item.desc}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}