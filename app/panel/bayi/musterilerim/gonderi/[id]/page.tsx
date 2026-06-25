"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Calendar,
  FileText,
  Hash,
  Shield,
  Loader2,
  User,
  Phone,
  Building2,
  Globe,
  Tag,
  Copy,
  CheckCircle,
  Clock,
  DollarSign,
  Weight,
  Ruler,
  Box,
} from "lucide-react";
import {
  resellerService,
  type ShipmentDetail,
} from "@/lib/services/resellerService";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  pending: "from-amber-400 to-amber-500",
  processing: "from-blue-400 to-blue-500",
  shipped: "from-indigo-400 to-indigo-500",
  delivered: "from-emerald-400 to-emerald-500",
  cancelled: "from-red-400 to-red-500",
  paid: "from-green-400 to-green-500",
  label_created: "from-purple-400 to-purple-500",
  draft: "from-slate-400 to-slate-500",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor", processing: "İşleniyor", shipped: "Yolda",
  delivered: "Teslim Edildi", cancelled: "İptal", paid: "Ödendi",
  label_created: "Etiket Oluşturuldu", draft: "Taslak",
};

function fmtCur(val: number) {
  return val.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul", day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul", day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

// ═════════════════════════════════════════════════════════════════════════════
export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = Number(params.id);

  const [data, setData] = React.useState<ShipmentDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!shipmentId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await resellerService.shipmentDetail(shipmentId);
        setData(res);
      } catch {
        setError("Gönderi detayı yüklenemedi");
      } finally {
        setLoading(false);
      }
    })();
  }, [shipmentId]);

  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // ── Loading ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 relative" />
        </div>
        <span className="text-sm text-slate-400 font-medium">Gönderi detayı yükleniyor...</span>
      </div>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition">
          <ArrowLeft className="h-4 w-4" /> Geri Dön
        </button>
        <div className="rounded-2xl bg-red-50 p-8 text-center ring-1 ring-red-100">
          <p className="text-sm font-semibold text-red-600">{error || "Gönderi bulunamadı"}</p>
        </div>
      </div>
    );
  }

  const d = data;

  return (
    <div className="space-y-6">
      {/* ══════════ HERO HEADER ══════════ */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 p-6 text-white shadow-xl overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 rounded-xl bg-white/10 hover:bg-white/20 transition flex items-center justify-center backdrop-blur-sm"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Package className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-lg font-bold">Gönderi Detayı</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm text-slate-300">{d.customer.firstName} {d.customer.lastName}</span>
                {d.trackingCode && (
                  <>
                    <span className="text-slate-600">·</span>
                    <button
                      onClick={() => copyText(d.trackingCode, "tracking")}
                      className="inline-flex items-center gap-1 font-mono text-sm text-blue-300 hover:text-blue-200 transition"
                    >
                      {d.trackingCode}
                      {copiedField === "tracking" ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5 opacity-50" />}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">{fmtDate(d.createdAt)}</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${STATUS_COLORS[d.status] || "from-slate-400 to-slate-500"} px-4 py-1.5 text-xs font-bold shadow-md`}>
              <span className="h-1.5 w-1.5 rounded-full bg-white/80 animate-pulse" />
              {STATUS_LABELS[d.status] || d.status}
            </span>
          </div>
        </div>

        {/* Route bar */}
        <div className="relative mt-5 flex items-center gap-3 rounded-xl bg-white/5 backdrop-blur-sm px-5 py-3 ring-1 ring-white/10">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Globe className="h-4 w-4 text-blue-300" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Çıkış</div>
              <div className="text-sm font-bold">{d.senderCountry}</div>
            </div>
          </div>

          <div className="flex-1 flex items-center px-3">
            <div className="h-px flex-1 bg-gradient-to-r from-blue-500/50 to-transparent" />
            <Truck className="h-5 w-5 mx-3 text-blue-400" />
            <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/50 to-transparent" />
          </div>

          <div className="flex items-center gap-2">
            <div>
              <div className="text-xs text-slate-400 text-right">Varış</div>
              <div className="text-sm font-bold text-right">{d.receiverCountry}</div>
            </div>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-emerald-300" />
            </div>
          </div>

          {d.receiverPostalCode && (
            <div className="ml-3 pl-3 border-l border-white/10">
              <div className="text-xs text-slate-400">Posta Kodu</div>
              <div className="text-sm font-bold font-mono">{d.receiverPostalCode}</div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════ INFO CARDS ROW ══════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={<Truck className="h-5 w-5" />} label="Kargo Firması" value={d.carrierName || "—"} sub={d.serviceName || undefined} color="blue" />
        <StatCard icon={<DollarSign className="h-5 w-5" />} label="Kargo Ücreti" value={`${fmtCur(d.carrierPriceTry)} ₺`} color="emerald" />
        <StatCard icon={<Weight className="h-5 w-5" />} label="Ücretlendirme Ağırlığı" value={`${d.totalChargeableWeightKg} kg`} sub={`Gerçek: ${d.totalActualWeightKg} kg`} color="purple" />
        <StatCard icon={<Box className="h-5 w-5" />} label="Paket Sayısı" value={`${d.totalPackageCount}`} color="amber" />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Gönderi Tipi" value={d.shipmentType === "international" ? "Uluslararası" : "Yurt İçi"} sub={d.contentDescription || undefined} color="slate" />
      </div>

      {/* ══════════ MAIN CONTENT — 2 COLUMN LAYOUT ══════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: 2/3 width ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Ücretlendirme Detayı */}
          <Card title="Ücretlendirme Detayı" icon={<DollarSign className="h-4 w-4" />}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <PriceBox label="Kargo Ücreti" value={`${fmtCur(d.carrierPriceTry)} ₺`} primary />
              {d.originalPriceTry > 0 && <PriceBox label="Orijinal Fiyat" value={`${fmtCur(d.originalPriceTry)} ₺`} />}
              {d.discountAmountTry > 0 && <PriceBox label="İndirim" value={`-${fmtCur(d.discountAmountTry)} ₺`} green />}
              {d.hasInsurance && <PriceBox label="Sigorta" value={`${fmtCur(d.insuranceCost)} ₺`} />}
              {d.carrierPrice > 0 && d.carrierCurrency && d.carrierCurrency !== "TRY" && (
                <PriceBox label={`Döviz (${d.carrierCurrency})`} value={`${fmtCur(d.carrierPrice)} ${d.carrierCurrency}`} />
              )}
            </div>
            {d.hasInsurance && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 ring-1 ring-emerald-100">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-700">Kargo Sigortası Aktif</span>
              </div>
            )}
          </Card>

          {/* Paketler */}
          {d.packages && d.packages.length > 0 && (
            <Card title={`Paketler (${d.totalPackageCount} Adet)`} icon={<Box className="h-4 w-4" />}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["En", "Boy", "Yükseklik", "Ağırlık", "Adet"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.packages.map((p, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/30 transition">
                        <td className="px-4 py-3 text-slate-600">{p.widthCm} cm</td>
                        <td className="px-4 py-3 text-slate-600">{p.lengthCm} cm</td>
                        <td className="px-4 py-3 text-slate-600">{p.heightCm} cm</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{p.weightKg} kg</td>
                        <td className="px-4 py-3 text-slate-600">{p.packageCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-6 px-4 py-3 bg-slate-50/50 text-xs text-slate-500 border-t border-slate-100">
                <span>Gerçek: <strong className="text-slate-700">{d.totalActualWeightKg} kg</strong></span>
                <span>Desi: <strong className="text-slate-700">{d.totalVolumetricWeightKg} kg</strong></span>
                <span>Ücretlendirme: <strong className="text-blue-700">{d.totalChargeableWeightKg} kg</strong></span>
              </div>
            </Card>
          )}

          {/* Proforma Fatura */}
          {d.proformaItems && d.proformaItems.length > 0 && (
            <Card title="Proforma Fatura" icon={<FileText className="h-4 w-4" />}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Ürün", "HS Kodu", "Adet", "Birim Fiyat", "Menşei", "Toplam"].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.proformaItems.map((p, i) => (
                      <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/30 transition">
                        <td className="px-4 py-3 text-slate-700 font-medium">{p.productDescription}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.hsCode}</td>
                        <td className="px-4 py-3 text-slate-600">{p.quantity}</td>
                        <td className="px-4 py-3 text-slate-600">{p.unitPrice} {d.proformaCurrency}</td>
                        <td className="px-4 py-3 text-slate-600">{p.originCountry}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{p.lineTotal} {d.proformaCurrency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400">{d.proformaItems.length} kalem</span>
                <span className="text-sm font-bold text-slate-700">Toplam: {d.proformaTotal} {d.proformaCurrency}</span>
              </div>
            </Card>
          )}
        </div>

        {/* ── RIGHT: 1/3 width (sidebar) ─────────────────────── */}
        <div className="space-y-6">

          {/* Alıcı Bilgileri */}
          {d.receiverName && (
            <Card title="Alıcı Bilgileri" icon={<User className="h-4 w-4" />}>
              <div className="space-y-4">
                <InfoRow icon={<User className="h-4 w-4 text-blue-500" />} label="Ad Soyad" value={d.receiverName} />
                {d.receiverCompany && <InfoRow icon={<Building2 className="h-4 w-4 text-indigo-500" />} label="Firma" value={d.receiverCompany} />}
                {d.receiverPhone && <InfoRow icon={<Phone className="h-4 w-4 text-emerald-500" />} label="Telefon" value={d.receiverPhone} />}
                {d.receiverCity && <InfoRow icon={<MapPin className="h-4 w-4 text-amber-500" />} label="Şehir" value={d.receiverCity} />}
                {d.receiverAddress && <InfoRow icon={<MapPin className="h-4 w-4 text-rose-500" />} label="Adres" value={d.receiverAddress} />}
              </div>
            </Card>
          )}

          {/* Referans & Bilgiler */}
          <Card title="Gönderi Bilgileri" icon={<Hash className="h-4 w-4" />}>
            <div className="space-y-3">
              {d.trackingCode && (
                <div className="rounded-lg bg-blue-50 p-3 ring-1 ring-blue-100">
                  <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Takip Kodu</div>
                  <div className="text-sm font-bold font-mono text-blue-700 mt-0.5">{d.trackingCode}</div>
                </div>
              )}
              {d.assetReference && (
                <div className="rounded-lg bg-purple-50 p-3 ring-1 ring-purple-100">
                  <div className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">AWB / Referans</div>
                  <div className="text-sm font-bold font-mono text-purple-700 mt-0.5">{d.assetReference}</div>
                </div>
              )}
              <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Oluşturma Tarihi</div>
                <div className="text-sm font-semibold text-slate-700 mt-0.5">{fmtDateTime(d.createdAt)}</div>
              </div>
              {d.note && (
                <div className="rounded-lg bg-amber-50 p-3 ring-1 ring-amber-100">
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Not</div>
                  <div className="text-sm text-amber-800 mt-0.5">{d.note}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Müşteri */}
          <Card title="Müşteri" icon={<User className="h-4 w-4" />}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                {d.customer.firstName?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <div className="text-sm font-bold text-slate-700">{d.customer.firstName} {d.customer.lastName}</div>
                <div className="text-xs text-slate-400">{d.customer.email}</div>
              </div>
            </div>
          </Card>

          {/* Takip Geçmişi */}
          {d.trackingEvents && d.trackingEvents.length > 0 && (
            <Card title="Takip Geçmişi" icon={<Clock className="h-4 w-4" />}>
              <div className="space-y-0">
                {d.trackingEvents.map((ev, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="flex flex-col items-center">
                      <div className={`h-3 w-3 rounded-full shrink-0 mt-1 ${i === 0 ? "bg-blue-500 ring-4 ring-blue-100" : "bg-slate-300"}`} />
                      {i < d.trackingEvents!.length - 1 && <div className="w-px h-full min-h-[28px] bg-slate-200" />}
                    </div>
                    <div className="pb-4 -mt-0.5 min-w-0">
                      <div className="text-sm font-semibold text-slate-700 leading-tight">{ev.description || ev.type}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        {ev.location && (
                          <span className="flex items-center gap-0.5">
                            <MapPin className="h-3 w-3" />
                            {ev.location}
                          </span>
                        )}
                        <span>{fmtDateTime(ev.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Reusable Components ──────────────────────────────────────────────────────

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100">
        <span className="text-slate-400">{icon}</span>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }: {
  icon: React.ReactNode; label: string; value: string; sub?: string;
  color: "blue" | "emerald" | "purple" | "amber" | "slate";
}) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600 ring-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    purple: "bg-purple-50 text-purple-600 ring-purple-100",
    amber: "bg-amber-50 text-amber-600 ring-amber-100",
    slate: "bg-slate-50 text-slate-600 ring-slate-100",
  };
  const iconBg = {
    blue: "bg-blue-100 text-blue-600",
    emerald: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
    slate: "bg-slate-100 text-slate-600",
  };
  return (
    <div className={`rounded-2xl p-4 ring-1 shadow-sm ${colorMap[color]}`}>
      <div className={`h-8 w-8 rounded-lg ${iconBg[color]} flex items-center justify-center mb-2.5`}>
        {icon}
      </div>
      <div className="text-[10px] font-bold uppercase tracking-wider opacity-60">{label}</div>
      <div className="text-lg font-bold mt-0.5 truncate">{value}</div>
      {sub && <div className="text-[11px] opacity-60 mt-0.5 truncate">{sub}</div>}
    </div>
  );
}

function PriceBox({ label, value, primary, green }: { label: string; value: string; primary?: boolean; green?: boolean }) {
  return (
    <div className={`rounded-xl p-3.5 text-center ring-1 ${
      primary ? "bg-blue-50 ring-blue-100" : green ? "bg-emerald-50 ring-emerald-100" : "bg-slate-50 ring-slate-100"
    }`}>
      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{label}</div>
      <div className={`text-base font-bold mt-1 ${
        primary ? "text-blue-700" : green ? "text-emerald-600" : "text-slate-700"
      }`}>{value}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-slate-50/50 p-2.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{label}</div>
        <div className="text-sm font-semibold text-slate-700 break-words">{value}</div>
      </div>
    </div>
  );
}
