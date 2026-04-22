"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Package, Truck, User, Mail, Phone, MapPin, Globe, Weight,
  CreditCard, CheckCircle2, Clock, FileText, Box, Hash, Building2,
  Banknote, Shield, Tag, Calendar, ChevronRight,
} from "lucide-react";
import { adminService } from "@/lib/services/adminService";

function fmt(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function InfoRow({ icon: Icon, label, value, mono }: { icon: any; label: string; value: any; mono?: boolean }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
      <div>
        <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">{label}</div>
        <div className={`text-sm font-medium text-slate-800 mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50"><Icon className="h-4 w-4 text-slate-500" /></div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: "Taslak", color: "bg-amber-50 text-amber-600 ring-amber-200" },
  pending_payment: { label: "Ödeme Bekliyor", color: "bg-orange-50 text-orange-600 ring-orange-200" },
  paid: { label: "Ödendi", color: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
  label_created: { label: "Etiket Oluşturuldu", color: "bg-teal-50 text-teal-600 ring-teal-200" },
  shipped: { label: "Kargoda", color: "bg-blue-50 text-blue-600 ring-blue-200" },
  in_transit: { label: "Yolda", color: "bg-indigo-50 text-indigo-600 ring-indigo-200" },
  delivered: { label: "Teslim Edildi", color: "bg-green-50 text-green-700 ring-green-200" },
  cancelled: { label: "İptal", color: "bg-red-50 text-red-500 ring-red-200" },
  returned: { label: "İade", color: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = Number(params.id);

  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!shipmentId) return;
    (async () => {
      try {
        const res = await adminService.getShipmentDetail(shipmentId);
        setData(res);
      } catch (err: any) {
        setError(err.message || "Gönderi yüklenemedi");
      } finally {
        setLoading(false);
      }
    })();
  }, [shipmentId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-56 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-48 animate-pulse rounded-2xl bg-white" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
          <div className="h-64 animate-pulse rounded-2xl bg-white" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-medium text-indigo-600"><ArrowLeft className="h-4 w-4" /> Geri Dön</button>
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-100">
          <Package className="inline-block h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">{error || "Gönderi bulunamadı"}</p>
        </div>
      </div>
    );
  }

  const sc = statusConfig[data.status] || { label: data.status, color: "bg-slate-50 text-slate-600 ring-slate-200" };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Geri Dön
        </button>
      </div>

      {/* Top Card — Özet */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100">
              <Package className="h-7 w-7 text-indigo-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{data.trackingCode || `SHP-${data.id}`}</h1>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${sc.color}`}>
                  {sc.label}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><User className="h-3 w-3" /> {data.userName}</span>
                <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {data.userEmail}</span>
                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {fmt(data.createdAt)}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">
              ₺{(data.carrierPriceTry || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {data.carrierName} • {data.serviceName}
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-[10px] font-medium text-slate-400 uppercase">Tip</div>
            <div className="mt-1 text-sm font-semibold text-slate-800">{data.shipmentType}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-[10px] font-medium text-slate-400 uppercase">Rota</div>
            <div className="mt-1 text-sm font-semibold text-slate-800">{data.senderCountry} → {data.receiverCountry}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-[10px] font-medium text-slate-400 uppercase">Ağırlık</div>
            <div className="mt-1 text-sm font-semibold text-slate-800">{data.chargeableWeight?.toFixed(1)} kg</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-[10px] font-medium text-slate-400 uppercase">Koli</div>
            <div className="mt-1 text-sm font-semibold text-slate-800">{data.packageCount} adet</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-center">
            <div className="text-[10px] font-medium text-slate-400 uppercase">Ödeme</div>
            <div className="mt-1 text-sm font-semibold text-slate-800">{data.paymentId || "—"}</div>
          </div>
        </div>
      </div>

      {/* Main content — 2 column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* ═══ Gönderici → Alıcı (Görsel Kart) ═══ */}
        <div className="lg:col-span-2 rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm overflow-hidden">
          {/* Üst Bant — Gönderici → Alıcı rota özet */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100">
                <User className="h-4 w-4 text-indigo-500" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Adres Bilgileri</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono font-semibold text-slate-600">{data.senderCountry}</span>
              <ChevronRight className="h-4 w-4 text-indigo-400" />
              <span className="font-mono font-semibold text-slate-600">{data.receiverCountry}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* ── Gönderici Kartı ── */}
            <div className="p-6">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="inline-flex h-5 items-center rounded-full bg-indigo-50 px-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider ring-1 ring-indigo-100">Gönderici</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-bold shadow-md">
                  {(data.senderName || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate">{data.senderName || "—"}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                    <span className="truncate">{data.senderAddress || "—"}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Globe className="h-3 w-3 shrink-0 text-slate-400" />
                    <span>{[data.senderCity, data.senderCountry].filter(Boolean).join(", ") || "—"}</span>
                  </div>
                  {data.senderPhone && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="font-mono">{data.senderPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Alıcı Kartı ── */}
            <div className="p-6">
              <div className="flex items-center gap-1.5 mb-4">
                <span className="inline-flex h-5 items-center rounded-full bg-emerald-50 px-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider ring-1 ring-emerald-100">Alıcı</span>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-md">
                  {(data.receiverName || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 truncate">{data.receiverName || "—"}</span>
                    {data.receiverCompany && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                        <Building2 className="h-2.5 w-2.5" /> {data.receiverCompany}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="h-3 w-3 shrink-0 text-slate-400" />
                    <span className="truncate">{data.receiverAddress || "—"}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <Globe className="h-3 w-3 shrink-0 text-slate-400" />
                    <span>{[data.receiverCity, data.receiverState, data.receiverCountry].filter(Boolean).join(", ") || "—"}</span>
                  </div>
                  {data.receiverPostal && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Hash className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="font-mono font-medium">{data.receiverPostal}</span>
                    </div>
                  )}
                  {data.receiverPhone && (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                      <Phone className="h-3 w-3 shrink-0 text-slate-400" />
                      <span className="font-mono">{data.receiverPhone}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Alt Bant — Rota Görseli */}
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500" />
                <span className="text-[11px] font-semibold text-slate-600">{data.senderCity || data.senderCountry}</span>
              </div>
              <div className="flex-1 flex items-center gap-1">
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-300 to-emerald-300" />
                <Truck className="h-3.5 w-3.5 text-indigo-400" />
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-300 to-emerald-300" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600">{data.receiverCity || data.receiverCountry}</span>
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
            </div>
          </div>
        </div>

        {/* ═══ Paket Detayları ═══ */}
        <Section title="Paket Detayları" icon={Box}>
          {data.packages && data.packages.length > 0 ? (
            <div className="overflow-hidden rounded-xl ring-1 ring-slate-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">#</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Boyut (cm)</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Ağırlık</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Desi</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Adet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.packages.map((p: any, i: number) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                      <td className="px-3 py-2 font-medium text-slate-700">{p.widthCm} × {p.lengthCm} × {p.heightCm}</td>
                      <td className="px-3 py-2 text-slate-700">{p.weightKg?.toFixed(1)} kg</td>
                      <td className="px-3 py-2 text-slate-700">{p.volWeight?.toFixed(1)} kg</td>
                      <td className="px-3 py-2 text-slate-700">{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Paket bilgisi yok</p>
          )}

          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-slate-50 p-2 text-center">
              <div className="text-[10px] text-slate-400">Gerçek</div>
              <div className="text-xs font-bold text-slate-700">{data.actualWeight?.toFixed(1)} kg</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2 text-center">
              <div className="text-[10px] text-slate-400">Hacimsel</div>
              <div className="text-xs font-bold text-slate-700">{data.volumetricWeight?.toFixed(1)} kg</div>
            </div>
            <div className="rounded-lg bg-indigo-50 p-2 text-center">
              <div className="text-[10px] text-indigo-400">Ücretlendirme</div>
              <div className="text-xs font-bold text-indigo-700">{data.chargeableWeight?.toFixed(1)} kg</div>
            </div>
          </div>
        </Section>

        {/* ═══ Fiyatlandırma ═══ */}
        <Section title="Fiyatlandırma" icon={CreditCard}>
          <div className="space-y-2">
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-xs text-slate-500">Kargo Firması Fiyatı</span>
              <span className="text-xs font-semibold text-slate-700">
                {data.carrierPrice?.toFixed(2)} {data.carrierCurrency}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-50">
              <span className="text-xs text-slate-500">TL Karşılığı</span>
              <span className="text-xs font-semibold text-slate-700">₺{data.carrierPriceTry?.toFixed(2)}</span>
            </div>
            {data.originalPriceTry > 0 && (
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-xs text-slate-500">Orijinal Fiyat</span>
                <span className="text-xs font-semibold text-slate-700">₺{data.originalPriceTry?.toFixed(2)}</span>
              </div>
            )}
            {data.discountAmountTry > 0 && (
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-xs text-emerald-600">İndirim</span>
                <span className="text-xs font-semibold text-emerald-600">-₺{data.discountAmountTry?.toFixed(2)}</span>
              </div>
            )}
            {data.hasInsurance && (
              <div className="flex justify-between py-1.5 border-b border-slate-50">
                <span className="text-xs text-slate-500 flex items-center gap-1"><Shield className="h-3 w-3" /> Sigorta</span>
                <span className="text-xs font-semibold text-slate-700">₺{data.insuranceCost?.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between py-2 bg-indigo-50 rounded-lg px-3 mt-2">
              <span className="text-sm font-bold text-indigo-700">Toplam</span>
              <span className="text-sm font-bold text-indigo-700">₺{data.carrierPriceTry?.toFixed(2)}</span>
            </div>
            {data.paidAt && (
              <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1">
                <CheckCircle2 className="h-3 w-3" /> Ödendi: {fmt(data.paidAt)}
              </div>
            )}
          </div>
        </Section>

        {/* ═══ Kargo Bilgisi ═══ */}
        <Section title="Kargo Firması" icon={Truck}>
          <div className="space-y-1">
            <InfoRow icon={Truck} label="Firma" value={data.carrierName} />
            <InfoRow icon={Tag} label="Servis" value={data.serviceName} />
            <InfoRow icon={Hash} label="Carrier ID" value={data.carrierId} mono />
            {data.contentDescription && <InfoRow icon={FileText} label="İçerik Açıklaması" value={data.contentDescription} />}
            {data.note && <InfoRow icon={FileText} label="Not" value={data.note} />}
          </div>
        </Section>

        {/* ═══ Proforma ═══ */}
        {data.proformaItems && data.proformaItems.length > 0 && (
          <Section title="Proforma Fatura" icon={FileText}>
            <div className="overflow-hidden rounded-xl ring-1 ring-slate-100">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Ürün</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">HS Kodu</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Adet</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Birim Fiyat</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Toplam</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.proformaItems.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-slate-700">{item.description}</td>
                      <td className="px-3 py-2 font-mono text-slate-500">{item.hsCode || "—"}</td>
                      <td className="px-3 py-2 text-slate-700">{item.quantity}</td>
                      <td className="px-3 py-2 text-slate-700">{item.unitPrice?.toFixed(2)} {data.proformaCurrency}</td>
                      <td className="px-3 py-2 font-semibold text-slate-800">{item.lineTotal?.toFixed(2)} {data.proformaCurrency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 flex justify-between bg-slate-50 rounded-lg px-3 py-2">
              <span className="text-xs font-bold text-slate-600">Proforma Toplam</span>
              <span className="text-xs font-bold text-slate-800">{data.proformaTotal?.toFixed(2)} {data.proformaCurrency}</span>
            </div>
            {data.proformaIOSS && (
              <div className="mt-1 text-[11px] text-slate-400">IOSS: {data.proformaIOSS}</div>
            )}
          </Section>
        )}

        {/* ═══ Havale Bilgisi ═══ */}
        {data.bankTransfer && (
          <Section title="Havale/EFT Bilgisi" icon={Banknote}>
            <div className="space-y-1">
              <InfoRow icon={Hash} label="Transfer ID" value={`#${data.bankTransfer.id}`} mono />
              <InfoRow icon={CreditCard} label="Tutar" value={`₺${data.bankTransfer.amount?.toFixed(2)}`} />
              <InfoRow icon={FileText} label="Açıklama" value={data.bankTransfer.description} />
              <InfoRow icon={Clock} label="Bildirim Tarihi" value={fmt(data.bankTransfer.createdAt)} />
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                  data.bankTransfer.status === "approved" ? "bg-emerald-50 text-emerald-600 ring-emerald-200" :
                  data.bankTransfer.status === "rejected" ? "bg-red-50 text-red-500 ring-red-200" :
                  "bg-amber-50 text-amber-600 ring-amber-200"
                }`}>
                  {data.bankTransfer.status === "approved" ? "Onaylandı" : data.bankTransfer.status === "rejected" ? "Reddedildi" : "Bekliyor"}
                </span>
              </div>
              {data.bankTransfer.adminNote && (
                <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  📝 {data.bankTransfer.adminNote}
                </div>
              )}
            </div>
          </Section>
        )}

        {/* ═══ Yurt İçi Kargo ═══ */}
        {data.domestic && (
          <Section title="Yurt İçi Kargo Detayı" icon={Truck}>
            <div className="space-y-1">
              <InfoRow icon={Truck} label="Kargo Firması" value={data.domestic.carrier} />
              <InfoRow icon={Hash} label="Takip No" value={data.domestic.trackingCode} mono />
              <InfoRow icon={Hash} label="Sipariş ID" value={data.domestic.orderId} mono />
              <InfoRow icon={CreditCard} label="API Maliyet" value={`₺${data.domestic.costApi?.toFixed(2)}`} />
              <InfoRow icon={CreditCard} label="Satış Fiyatı" value={`₺${data.domestic.costMarkup?.toFixed(2)}`} />
              <div className="mt-2 flex justify-between bg-emerald-50 rounded-lg px-3 py-2">
                <span className="text-xs font-bold text-emerald-600">Kâr</span>
                <span className="text-xs font-bold text-emerald-700">₺{data.domestic.profit?.toFixed(2)}</span>
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
