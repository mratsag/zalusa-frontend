"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mail,
  Phone,
  Hash,
  Calendar,
  User,
  Building2,
  CheckCircle2,
  XCircle,
  Package,
  Clock,
  CreditCard,
  FileText,
  Truck,
  PackageCheck,
  Ban,
  ShoppingCart,
  ExternalLink,
  ChevronRight,
  Globe,
  Weight,
  DollarSign,
  RotateCcw,
  PlusCircle,
} from "lucide-react";
import { adminService } from "@/lib/services/adminService";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    timeZone: "Europe/Istanbul",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: "Taslak", color: "bg-amber-50 text-amber-600 ring-amber-200", icon: FileText },
  pending_payment: { label: "Ödeme Bekliyor", color: "bg-orange-50 text-orange-600 ring-orange-200", icon: CreditCard },
  paid: { label: "Ödendi", color: "bg-emerald-50 text-emerald-600 ring-emerald-200", icon: CheckCircle2 },
  label_created: { label: "Etiket Oluşturuldu", color: "bg-teal-50 text-teal-600 ring-teal-200", icon: FileText },
  shipped: { label: "Kargoda", color: "bg-blue-50 text-blue-600 ring-blue-200", icon: Truck },
  in_transit: { label: "Yolda", color: "bg-indigo-50 text-indigo-600 ring-indigo-200", icon: Truck },
  delivered: { label: "Teslim Edildi", color: "bg-green-50 text-green-700 ring-green-200", icon: PackageCheck },
  cancelled: { label: "İptal", color: "bg-red-50 text-red-500 ring-red-200", icon: Ban },
  returned: { label: "İade", color: "bg-slate-50 text-slate-600 ring-slate-200", icon: RotateCcw },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] || { label: status, color: "bg-slate-50 text-slate-600 ring-slate-200", icon: Package };
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${cfg.color}`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </span>
  );
}

interface UserInfo {
  id: number;
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  kind: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
}

interface Shipment {
  id: number;
  trackingCode: string;
  status: string;
  statusLabel: string;
  currentStep: number;
  shipmentType: string;
  senderCountry: string;
  receiverCountry: string;
  carrierId: string;
  carrierName: string;
  serviceName: string;
  carrierPriceTry: number;
  chargeableWeight: number;
  packageCount: number;
  createdAt: string;
  [key: string]: any;
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const [user, setUser] = React.useState<UserInfo | null>(null);
  const [shipments, setShipments] = React.useState<Shipment[]>([]);
  const [draftCount, setDraftCount] = React.useState(0);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [paidCount, setPaidCount] = React.useState(0);
  const [shippedCount, setShippedCount] = React.useState(0);
  const [totalRevenue, setTotalRevenue] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState("all");

  React.useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await adminService.getUserShipments(userId);
        setUser(data.user as any);
        setShipments((data.shipments ?? []) as any);
        setDraftCount((data as any).draftCount ?? 0);
        setPendingCount((data as any).pendingCount ?? 0);
        setPaidCount((data as any).paidCount ?? 0);
        setShippedCount((data as any).shippedCount ?? 0);
        setTotalRevenue((data as any).totalRevenue ?? 0);
      } catch (err: any) {
        setError(err.message || "Kullanıcı bilgileri yüklenemedi");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const filteredShipments = React.useMemo(() => {
    if (activeTab === "all") return shipments;
    if (activeTab === "pending") return shipments.filter(s => s.status === "draft" || s.status === "pending_payment");
    if (activeTab === "paid") return shipments.filter(s => ["paid", "label_created"].includes(s.status));
    if (activeTab === "active") return shipments.filter(s => ["shipped", "in_transit"].includes(s.status));
    if (activeTab === "done") return shipments.filter(s => ["delivered", "cancelled", "returned"].includes(s.status));
    return shipments;
  }, [shipments, activeTab]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-48 animate-pulse rounded-2xl bg-white ring-1 ring-slate-100" />
        <div className="h-64 animate-pulse rounded-2xl bg-white ring-1 ring-slate-100" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <button onClick={() => router.push("/admin/kullanicilar")} className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kullanıcılara Dön
        </button>
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-100">
          <XCircle className="inline-block h-10 w-10 text-red-300" />
          <p className="mt-3 text-sm text-slate-500">{error || "Kullanıcı bulunamadı"}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "all", label: "Tümü", count: shipments.length },
    { key: "pending", label: "Bekleyen", count: draftCount + pendingCount },
    { key: "paid", label: "Ödendi", count: paidCount },
    { key: "active", label: "Kargoda", count: shippedCount },
    { key: "done", label: "Tamamlanan", count: shipments.filter(s => ["delivered", "cancelled", "returned"].includes(s.status)).length },
  ];

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button onClick={() => router.push("/admin/kullanicilar")} className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kullanıcılara Dön
      </button>

      {/* User Info Card */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 text-lg font-bold text-white shadow-lg shadow-indigo-200">
              {(user.firstName?.[0] ?? "").toUpperCase()}
              {(user.lastName?.[0] ?? "").toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{user.firstName} {user.lastName}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {user.email}</span>
                {user.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {user.phone}</span>}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => router.push(`/admin/kullanicilar/${userId}/gonderi-olustur`)}
              className="inline-flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-all hover:shadow-md"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Kargo Oluştur
            </button>
            {user.isActive ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-emerald-200"><CheckCircle2 className="h-3 w-3" /> Aktif</span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-500 ring-1 ring-red-200"><XCircle className="h-3 w-3" /> Pasif</span>
            )}
            {user.isVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 ring-1 ring-blue-200"><CheckCircle2 className="h-3 w-3" /> Doğrulanmış</span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600 ring-1 ring-amber-200"><Clock className="h-3 w-3" /> Doğrulanmamış</span>
            )}
          </div>
        </div>

        {/* Detail grid */}
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Hash className="h-3 w-3" /> Müşteri No</div>
            <div className="mt-1 font-mono text-sm font-semibold text-slate-800">{user.customerId}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              {user.kind === "corporate" ? <Building2 className="h-3 w-3" /> : <User className="h-3 w-3" />} Hesap Tipi
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-800">{user.kind === "corporate" ? "Kurumsal" : "Bireysel"}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Calendar className="h-3 w-3" /> Kayıt Tarihi</div>
            <div className="mt-1 text-sm font-semibold text-slate-800">{formatShortDate(user.createdAt)}</div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500"><Package className="h-3 w-3" /> Gönderiler</div>
            <div className="mt-1 text-sm font-semibold text-slate-800">{shipments.length} adet</div>
          </div>
          <div className="rounded-xl bg-emerald-50 p-3">
            <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600"><DollarSign className="h-3 w-3" /> Toplam Ciro</div>
            <div className="mt-1 text-sm font-bold text-emerald-700">₺{totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-5 py-4 ring-1 ring-amber-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100"><ShoppingCart className="h-5 w-5 text-amber-600" /></div>
          <div><div className="text-2xl font-bold text-amber-700">{draftCount}</div><div className="text-xs font-medium text-amber-600">Taslak</div></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-orange-50 px-5 py-4 ring-1 ring-orange-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100"><CreditCard className="h-5 w-5 text-orange-600" /></div>
          <div><div className="text-2xl font-bold text-orange-700">{pendingCount}</div><div className="text-xs font-medium text-orange-600">Ödeme Bekleyen</div></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-5 py-4 ring-1 ring-emerald-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div>
          <div><div className="text-2xl font-bold text-emerald-700">{paidCount}</div><div className="text-xs font-medium text-emerald-600">Ödendi</div></div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-blue-50 px-5 py-4 ring-1 ring-blue-200">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100"><Truck className="h-5 w-5 text-blue-600" /></div>
          <div><div className="text-2xl font-bold text-blue-700">{shippedCount}</div><div className="text-xs font-medium text-blue-600">Kargoda</div></div>
        </div>
      </div>

      {/* Shipments Section */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-900">Gönderiler</h3>

        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-xl bg-slate-100 p-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                activeTab === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-200 px-1 text-[10px] font-bold text-slate-600">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {filteredShipments.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-100">
            <Package className="inline-block h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-500">Bu kategoride gönderi bulunamadı</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredShipments.map((s) => (
              <div
                key={s.id}
                onClick={() => router.push(`/admin/gonderiler/${s.id}`)}
                className="flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-slate-100 shadow-sm hover:shadow-md hover:ring-indigo-200 transition-all cursor-pointer group"
              >
                {/* Icon */}
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-100 group-hover:bg-indigo-50 group-hover:ring-indigo-200 transition-colors">
                  <Package className="h-5 w-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                      {s.trackingCode || "—"}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Globe className="h-3 w-3" />{s.senderCountry} → {s.receiverCountry}</span>
                    <span>{s.shipmentType}</span>
                    <span className="flex items-center gap-1"><Truck className="h-3 w-3" />{s.carrierName || "—"}</span>
                    <span className="flex items-center gap-1"><Weight className="h-3 w-3" />{s.chargeableWeight?.toFixed(1)} kg</span>
                    <span>📦 {s.packageCount} koli</span>
                  </div>
                </div>

                {/* Price + Date */}
                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-slate-800">
                    {s.carrierPriceTry ? `₺${s.carrierPriceTry.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}` : "—"}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{formatDate(s.createdAt)}</div>
                </div>

                {/* Arrow */}
                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-500 shrink-0 transition-colors" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
