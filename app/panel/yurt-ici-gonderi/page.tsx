"use client";

import React from "react";
import {
  Package, Ruler, MapPin, Check, Info, Plus, Trash2, User, Phone,
  MapPinned, Building, ArrowRight, Loader2, Truck, Scale,
  CheckCircle, AlertTriangle, ArrowLeft, Box, ChevronDown
} from "lucide-react";
import { Stepper } from "@/components/panel/stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/cn";
import { useAppState } from "@/hooks/useAppState";

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

// ── Stepper ──────────────────────────────────────────────────────────────────
const STEPS = ["Rota Bilgisi", "Paket Bilgileri", "Kargo Firması", "Adres Bilgileri", "Özet & Ödeme"] as const;

// ── Types ────────────────────────────────────────────────────────────────────
type PackageItem = {
  id: string;
  width: string;
  height: string;
  depth: string;
  weight: string;
  packageCount: string;
};

type CarrierOption = {
  handlerCode: string;
  name: string;
  logoUrl: string;
  basePrice: number;
  price: number;
  currency: string;
  estimatedDays: string;
  desiKg: number;
};

type City = { id: number; name: string };
type Town = { id: number; name: string };

// ── Helpers ──────────────────────────────────────────────────────────────────
function toNumber(v: string) { const n = Number(String(v).replace(",", ".")); return Number.isFinite(n) ? n : 0; }
const EMPTY_PKG: PackageItem = { id: "", width: "", height: "", depth: "", weight: "", packageCount: "1" };

// ── Carrier logos ────────────────────────────────────────────────────────────
const CARRIER_LOGOS: Record<string, { bg: string; letter: string }> = {
  MNG:     { bg: "bg-[#E30613]", letter: "M" },
  YURTICI: { bg: "bg-[#00843D]", letter: "Y" },
  ARAS:    { bg: "bg-[#003B7A]", letter: "A" },
  SURAT:   { bg: "bg-[#FF6600]", letter: "S" },
  PTT:     { bg: "bg-[#FFD100]", letter: "P" },
};

// ── Field component ──────────────────────────────────────────────────────────
function Field({ label, icon: Icon, children, error }: { label: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode; error?: string }) {
  return (
    <label className="block group">
      <div className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-slate-700">
        {Icon ? <Icon className={cn("h-3.5 w-3.5", error ? "text-red-500" : "text-slate-400")} /> : null}
        <span className={error ? "text-red-500" : ""}>{label}</span>
      </div>
      <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 transition-all focus-within:bg-white focus-within:ring-2", error ? "border-red-500 bg-red-50/30 ring-2 ring-red-100 focus-within:border-red-500 focus-within:ring-red-200" : "border-slate-300 bg-slate-50/50 hover:border-slate-400 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
        {React.Children.map(children, child => {
          if (React.isValidElement<{ className?: string }>(child)) {
            return React.cloneElement(child, { className: cn(child.props.className, "flex-1 border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent p-0 text-[14px] font-medium text-slate-700 placeholder:text-slate-400") } as any);
          }
          return child;
        })}
      </div>
      {error && <div className="mt-1.5 text-[11px] font-semibold text-red-500 ml-1">{error}</div>}
    </label>
  );
}

// ── 3D Package Visual ────────────────────────────────────────────────────────
function PackageVisual({ w, h, d }: { w: number; h: number; d: number }) {
  const maxDim = Math.max(w, h, d, 1);
  const scale = 80 / maxDim;
  const sw = Math.max(w * scale, 15);
  const sh = Math.max(h * scale, 15);
  const sd = Math.max(d * scale * 0.5, 8);

  return (
    <div className="flex items-center justify-center" style={{ width: 120, height: 120 }}>
      <div style={{ position: "relative", width: sw + sd, height: sh + sd }}>
        {/* Front */}
        <div className="absolute rounded-lg" style={{ bottom: 0, left: 0, width: sw, height: sh, background: "linear-gradient(135deg, #818cf8, #6366f1)", opacity: 0.9 }} />
        {/* Top */}
        <div className="absolute rounded-t-lg" style={{ bottom: sh, left: sd * 0.6, width: sw, height: sd, background: "linear-gradient(135deg, #a5b4fc, #818cf8)", transform: "skewX(-40deg)", transformOrigin: "bottom left", opacity: 0.8 }} />
        {/* Right */}
        <div className="absolute rounded-r-lg" style={{ bottom: 0, left: sw, width: sd, height: sh, background: "linear-gradient(135deg, #6366f1, #4f46e5)", transform: "skewY(-40deg)", transformOrigin: "bottom left", opacity: 0.85 }} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Ana Sayfa Componenti
// ═════════════════════════════════════════════════════════════════════════════

export default function YurtIciGonderiPage() {
  const { hydrated } = useAppState();
  const [step, setStep] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  // ── Paket State ──
  const [packages, setPackages] = React.useState<PackageItem[]>([
    { ...EMPTY_PKG, id: crypto.randomUUID() }
  ]);

  // ── Kargo Firmaları ──
  const [carriers, setCarriers] = React.useState<CarrierOption[]>([]);
  const [selectedCarrier, setSelectedCarrier] = React.useState("");
  const [carrierLoading, setCarrierLoading] = React.useState(false);

  // ── Adres State ──
  const [senderName, setSenderName] = React.useState("");
  const [senderPhone, setSenderPhone] = React.useState("+90");
  const [senderCity, setSenderCity] = React.useState("");
  const [senderTown, setSenderTown] = React.useState("");
  const [senderAddress, setSenderAddress] = React.useState("");

  const [receiverName, setReceiverName] = React.useState("");
  const [receiverPhone, setReceiverPhone] = React.useState("+90");
  const [receiverCity, setReceiverCity] = React.useState("");
  const [receiverTown, setReceiverTown] = React.useState("");
  const [receiverAddress, setReceiverAddress] = React.useState("");

  // ── Şehir/İlçe ──
  const [cities, setCities] = React.useState<City[]>([]);
  const [senderTowns, setSenderTowns] = React.useState<Town[]>([]);
  const [receiverTowns, setReceiverTowns] = React.useState<Town[]>([]);
  const [citiesLoading, setCitiesLoading] = React.useState(false);

  // ── Sonuç ──
  const [resultData, setResultData] = React.useState<any>(null);

  // ── İl listesini çek ──
  React.useEffect(() => {
    if (!hydrated) return;
    setCitiesLoading(true);
    apiFetch<{ cities: City[] }>("/api/domestic/cities")
      .then(r => setCities(r.cities || []))
      .catch(() => {
        // Fallback: kendi DB'mizden Türkiye illerini çek
        fetch(`${API_BASE}/api/states?country=TR`)
          .then(r => r.json())
          .then((data: { states: { id: number; stateName: string }[] }) => {
            if (data.states) {
              setCities(data.states.map(s => ({ id: s.id, name: s.stateName })));
            }
          })
          .catch(() => {});
      })
      .finally(() => setCitiesLoading(false));
  }, [hydrated]);

  // ── İlçe yükle ──
  function loadTowns(cityId: number, target: "sender" | "receiver") {
    apiFetch<Town[]>(`/api/domestic/towns/${cityId}`)
      .then(data => {
        const towns = Array.isArray(data) ? data : [];
        if (target === "sender") setSenderTowns(towns);
        else setReceiverTowns(towns);
      })
      .catch(() => {});
  }

  // ── Paket yardımcıları ──
  function updatePkg(id: string, field: keyof PackageItem, val: string) {
    setPackages(p => p.map(i => i.id === id ? { ...i, [field]: val } : i));
  }
  function addPkg() {
    setPackages(p => [...p, { ...EMPTY_PKG, id: crypto.randomUUID() }]);
  }
  function removePkg(id: string) {
    setPackages(p => p.filter(i => i.id !== id));
  }

  // ── Hesaplamalar ──
  const totalWeight = packages.reduce((s, p) => s + toNumber(p.weight) * Math.max(1, toNumber(p.packageCount)), 0);
  const totalVolWeight = packages.reduce((s, p) => {
    const v = (toNumber(p.width) * toNumber(p.height) * toNumber(p.depth)) / 5000;
    return s + v * Math.max(1, toNumber(p.packageCount));
  }, 0);
  const chargeableWeight = packages.reduce((s, p) => {
    const w = toNumber(p.weight);
    const v = (toNumber(p.width) * toNumber(p.height) * toNumber(p.depth)) / 5000;
    return s + Math.max(w, v) * Math.max(1, toNumber(p.packageCount));
  }, 0);
  const totalPkgCount = packages.reduce((s, p) => s + Math.max(1, Math.round(toNumber(p.packageCount))), 0);

  const selectedCarrierData = carriers.find(c => c.handlerCode === selectedCarrier);

  // ═════════════════════════════════════════════════════════════════════════════
  // Adım geçiş fonksiyonları
  // ═════════════════════════════════════════════════════════════════════════════

  // ADIM 0: Rota seçimi validasyonu
  function handleRouteNext() {
    const errors: Record<string, string> = {};
    if (!senderCity) errors.senderCity = "Gönderim ili seçin";
    if (!receiverCity) errors.receiverCity = "Varış ili seçin";
    if (senderCity && receiverCity && senderCity === receiverCity) {
      errors.receiverCity = "Aynı il seçilemez";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setApiError(null);
    setStep(1);
  }

  // ADIM 1: Paket bilgileri + fiyat sorgula
  async function handlePackageNext() {
    const errors: Record<string, string> = {};
    for (const pkg of packages) {
      if (!toNumber(pkg.width)) errors[`pkg_${pkg.id}_width`] = "Zorunlu";
      if (!toNumber(pkg.height)) errors[`pkg_${pkg.id}_height`] = "Zorunlu";
      if (!toNumber(pkg.depth)) errors[`pkg_${pkg.id}_depth`] = "Zorunlu";
      if (!toNumber(pkg.weight)) errors[`pkg_${pkg.id}_weight`] = "Zorunlu";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setCarrierLoading(true);
    setApiError(null);
    try {
      const payload = {
        packages: packages.map(p => ({
          width: toNumber(p.width),
          height: toNumber(p.height),
          depth: toNumber(p.depth),
          weight: toNumber(p.weight),
        })),
      };
      const res = await apiFetch<{ carriers: CarrierOption[] }>("/api/domestic/prices", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setCarriers(res.carriers || []);
      if (!res.carriers?.length) {
        setApiError("Bu paket boyutları için uygun kargo firması bulunamadı.");
      } else {
        setStep(2);
      }
    } catch (err: any) {
      setApiError(err.message || "Fiyat bilgileri alınamadı");
    } finally {
      setCarrierLoading(false);
    }
  }

  function handleCarrierNext() {
    if (!selectedCarrier) {
      setApiError("Lütfen bir kargo firması seçin.");
      return;
    }
    setApiError(null);
    setStep(3);
  }

  function handleAddressNext() {
    const errors: Record<string, string> = {};
    if (!senderName.trim()) errors.senderName = "Zorunlu";
    if (!senderPhone.trim() || senderPhone.length < 5) errors.senderPhone = "Zorunlu";
    if (!senderAddress.trim()) errors.senderAddress = "Zorunlu";
    if (!receiverName.trim()) errors.receiverName = "Zorunlu";
    if (!receiverPhone.trim() || receiverPhone.length < 5) errors.receiverPhone = "Zorunlu";
    if (!receiverAddress.trim()) errors.receiverAddress = "Zorunlu";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;
    setStep(4);
  }

  async function handleFinalize() {
    setLoading(true);
    setApiError(null);
    try {
      const payload = {
        packages: packages.map(p => ({
          width: toNumber(p.width),
          height: toNumber(p.height),
          depth: toNumber(p.depth),
          weight: toNumber(p.weight),
          packageCount: Math.max(1, Math.round(toNumber(p.packageCount))),
        })),
        handlerCode: selectedCarrier,
        senderName,
        senderPhone,
        senderCity,
        senderTown: senderTown || senderCity,
        senderAddress,
        receiverName,
        receiverPhone,
        receiverCity,
        receiverTown: receiverTown || receiverCity,
        receiverAddress,
      };
      const res = await apiFetch<any>("/api/domestic/shipments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setResultData(res);

      // Ödeme sayfasına yönlendir (Havale/EFT + iyzico)
      if (res.shipmentId) {
        window.location.href = `/panel/odeme/${res.shipmentId}`;
        return;
      }

      setStep(5); // Tamamlandı (shipmentId yoksa)
    } catch (err: any) {
      setApiError(err.message || "Gönderi oluşturulamadı");
    } finally {
      setLoading(false);
    }
  }

  // ═════════════════════════════════════════════════════════════════════════════
  // Render
  // ═════════════════════════════════════════════════════════════════════════════

  if (!hydrated) return (
    <div className="flex h-96 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      {/* Başlık */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-md">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Yurt İçi Gönderi</h1>
            <p className="text-sm text-muted">Türkiye içi kargo gönderimi oluşturun</p>
          </div>
        </div>
      </div>

      {/* Stepper */}
      {step < 5 && (
        <div className="mb-8">
          <Stepper
            steps={[...STEPS]}
            current={step}
            onStepClick={(i) => { if (i < step) setStep(i); }}
          />
        </div>
      )}

      {/* Hata mesajı */}
      {apiError && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/60 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-red-700">Hata</div>
            <div className="text-sm text-red-600 mt-0.5">{apiError}</div>
          </div>
          <button onClick={() => setApiError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <span className="text-lg">&times;</span>
          </button>
        </div>
      )}

      {/* ═══════════════════════ ADIM 0: Rota Bilgisi ═══════════════════════ */}
      {step === 0 && (
        <Card className="border-0 shadow-lg rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-brand-500" />
              Nereden Nereye?
            </CardTitle>
            <p className="text-sm text-muted mt-1">Gönderim ve varış illerini seçin</p>
          </CardHeader>
          <CardContent className="p-6 sm:p-8 space-y-6">
            {/* Rota Seçim Alanı */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4 sm:gap-6">
              {/* Gönderim İli */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-sm">
                    <MapPinned className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Çıkış</div>
                    <div className="text-sm font-bold text-slate-700">Gönderim İli</div>
                  </div>
                </div>
                <SearchableSelect
                  options={cities.map(c => ({ label: c.name, value: c.name, searchableText: c.name }))}
                  value={senderCity}
                  onChange={(v) => {
                    setSenderCity(v);
                    setSenderTown("");
                    const city = cities.find(c => c.name === v);
                    if (city) loadTowns(city.id, "sender");
                  }}
                  placeholder="İl seçin..."
                  searchPlaceholder="İl arayın..."
                />
              </div>

              {/* Ok */}
              <div className="hidden sm:flex items-center justify-center pb-6">
                <div className="flex items-center gap-2">
                  <div className="h-px w-8 bg-slate-300" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white shadow-md">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <div className="h-px w-8 bg-slate-300" />
                </div>
              </div>
              <div className="flex sm:hidden items-center justify-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white shadow-md rotate-90">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </div>

              {/* Varış İli */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-sm">
                    <MapPinned className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Varış</div>
                    <div className="text-sm font-bold text-slate-700">Varış İli</div>
                  </div>
                </div>
                <SearchableSelect
                  options={cities.map(c => ({ label: c.name, value: c.name, searchableText: c.name }))}
                  value={receiverCity}
                  onChange={(v) => {
                    setReceiverCity(v);
                    setReceiverTown("");
                    const city = cities.find(c => c.name === v);
                    if (city) loadTowns(city.id, "receiver");
                  }}
                  placeholder="İl seçin..."
                  searchPlaceholder="İl arayın..."
                />
              </div>
            </div>

            {/* Seçili rota gösterimi */}
            {senderCity && receiverCity && senderCity !== receiverCity && (
              <div className="flex items-center justify-between rounded-2xl p-4 text-white" style={{ backgroundColor: "#3959F2" }}>
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                    <MapPinned className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-white/50">Çıkış</div>
                    <div className="text-sm font-bold">{senderCity}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-px w-6 sm:w-16 bg-white/20" />
                  <Truck className="h-5 w-5 text-white/60" />
                  <div className="h-px w-6 sm:w-16 bg-white/20" />
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wider text-white/50">Varış</div>
                  <div className="text-sm font-bold">{receiverCity}</div>
                </div>
              </div>
            )}

            {/* Devam butonu */}
            <div className="flex justify-end pt-2">
              <Button onClick={handleRouteNext} disabled={!senderCity || !receiverCity} className="h-12 px-8 rounded-2xl text-sm font-semibold gap-2">
                <ArrowRight className="h-4 w-4" /> Devam Et
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════ ADIM 1: Paket Bilgileri ═══════════════════════ */}
      {step === 1 && (
        <Card>
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Paket Ölçüleri</CardTitle>
              <p className="mt-1 text-sm text-muted">Ölçüleri manuel girebilirsiniz.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setStep(0)} className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-bold text-[#0F172A] transition-colors shadow-sm">
                <span>←</span> Geri
              </button>
              <button type="button" onClick={handlePackageNext} disabled={carrierLoading} className="flex items-center gap-2 rounded-xl bg-[#3959F2] hover:bg-[#4338CA] px-4 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-bold text-white transition-colors disabled:opacity-50">
                {carrierLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {carrierLoading ? "Sorgulanıyor..." : "Devam"} <span>→</span>
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6 pb-24">
              {/* Rota özeti */}
              <div className="flex items-center justify-between rounded-2xl p-3 text-white text-sm" style={{ backgroundColor: "#3959F2" }}>
                <div className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-white/60" /><span className="font-bold">{senderCity}</span></div>
                <div className="flex items-center gap-1"><div className="h-px w-6 bg-white/20" /><Truck className="h-4 w-4 text-white/50" /><div className="h-px w-6 bg-white/20" /></div>
                <div className="flex items-center gap-2"><span className="font-bold">{receiverCity}</span><MapPinned className="h-4 w-4 text-white/60" /></div>
              </div>

              <div className="space-y-5">
                {packages.map((pkg, idx) => {
                  const pw = Math.max(toNumber(pkg.width), 0);
                  const pl = Math.max(toNumber(pkg.depth), 0);
                  const ph = Math.max(toNumber(pkg.height), 0);
                  const pkgVol = (pw * pl * ph) / 5000;
                  const pkgActual = Math.max(toNumber(pkg.weight), 0);
                  const pkgCount = Math.max(1, Math.round(toNumber(pkg.packageCount)));
                  const pkgChargeable = Math.max(pkgVol, pkgActual) * pkgCount;
                  const isVolHigher = pkgVol > pkgActual;

                  return (
                    <div key={pkg.id} className="rounded-2xl bg-white ring-1 ring-[#E2E8F0] overflow-hidden">
                      {/* Card header */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 border-b border-[#F1F5F9] gap-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1F5F9] text-[12px] font-bold text-[#475569]">{idx + 1}</span>
                          <span className="text-[14px] font-bold text-[#0F172A]">Paket/Koli {idx + 1}</span>
                          {pkgChargeable > 0 && (
                            <span className="text-[12px] text-[#94A3B8]">{pkgChargeable.toFixed(1)} kg</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          {packages.length > 1 && (
                            <button type="button" onClick={() => removePkg(pkg.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-4 sm:p-6">
                        <div className="flex gap-10">
                          {/* 3D Box illustration */}
                          <div className="hidden lg:flex items-center justify-center shrink-0" style={{ width: 280, minHeight: 220 }}>
                            {(() => {
                              const rawW = Math.max(toNumber(pkg.width), 1);
                              const rawL = Math.max(toNumber(pkg.depth), 1);
                              const rawH = Math.max(toNumber(pkg.height), 1);
                              const maxDim = Math.max(rawW, rawL, rawH, 1);
                              const minVis = 30, maxVis = 120;
                              const scaleFn = (v: number) => minVis + ((v / maxDim) * (maxVis - minVis));
                              const vW = scaleFn(rawW);
                              const vL = scaleFn(rawL);
                              const vH = scaleFn(rawH);
                              const dxRatio = 0.45;
                              const dyRatio = 0.25;
                              const depthX = vL * dxRatio;
                              const depthY = vL * dyRatio;
                              const totalBoxW = vW + depthX;
                              const totalBoxH = vH + depthY;
                              const padLeft = 55, padRight = 40, padTop = 20, padBottom = 60;
                              const svgW = padLeft + totalBoxW + padRight;
                              const svgH = padTop + totalBoxH + padBottom;
                              const ax = padLeft;
                              const ay = padTop + totalBoxH;
                              const fbl = { x: ax, y: ay };
                              const fbr = { x: ax + vW, y: ay };
                              const ftl = { x: ax, y: ay - vH };
                              const ftr = { x: ax + vW, y: ay - vH };
                              const btl = { x: ax + depthX, y: ay - vH - depthY };
                              const btr = { x: ax + vW + depthX, y: ay - vH - depthY };
                              const bbr = { x: ax + vW + depthX, y: ay - depthY };
                              const pts = (arr: {x:number,y:number}[]) => arr.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
                              const hMidY = ay - vH / 2;
                              const wMidX = ax + vW / 2;
                              const lMidX = ax + vW + depthX / 2;
                              const lMidY = ay - depthY / 2 - vH / 2;
                              const fmtVal = (v: string) => { const s = v || "0"; return s.length > 6 ? s.slice(0, 5) + "…" : s; };
                              const hLabel = `${fmtVal(pkg.height)} cm`;
                              const wLabel = `${fmtVal(pkg.width)} cm`;
                              const lLabel = `${fmtVal(pkg.depth)} cm`;
                              const lblW = (text: string) => Math.max(56, text.length * 7 + 16);
                              const hLblW = lblW(hLabel);
                              const wLblW = lblW(wLabel);
                              const lLblW = lblW(lLabel);

                              return (
                                <svg viewBox={`0 0 ${svgW} ${svgH}`} width="260" style={{ maxHeight: 220 }} className="drop-shadow-sm">
                                  <polygon points={pts([fbl, fbr, ftr, ftl])} fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
                                  <polygon points={pts([ftl, ftr, btr, btl])} fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1.5" />
                                  <polygon points={pts([fbr, bbr, btr, ftr])} fill="#93C5FD" stroke="#60A5FA" strokeWidth="1.5" />
                                  {/* Height */}
                                  <line x1={ax - 20} y1={ftl.y + 2} x2={ax - 20} y2={fbl.y - 2} stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 2" />
                                  <line x1={ax - 25} y1={ftl.y + 2} x2={ax - 15} y2={ftl.y + 2} stroke="#3B82F6" strokeWidth="1" />
                                  <line x1={ax - 25} y1={fbl.y - 2} x2={ax - 15} y2={fbl.y - 2} stroke="#3B82F6" strokeWidth="1" />
                                  <rect x={ax - 20 - hLblW / 2} y={hMidY - 12} width={hLblW} height="24" rx="6" fill="white" stroke="#3B82F6" strokeWidth="1" />
                                  <text x={ax - 20} y={hMidY + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#3B82F6">{hLabel}</text>
                                  <text x={ax - 20} y={fbl.y + 16} textAnchor="middle" fontSize="10" fill="#94A3B8">yükseklik</text>
                                  {/* Width */}
                                  <line x1={fbl.x + 2} y1={fbl.y + 15} x2={fbr.x - 2} y2={fbr.y + 15} stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 2" />
                                  <line x1={fbl.x + 2} y1={fbl.y + 10} x2={fbl.x + 2} y2={fbl.y + 20} stroke="#3B82F6" strokeWidth="1" />
                                  <line x1={fbr.x - 2} y1={fbr.y + 10} x2={fbr.x - 2} y2={fbr.y + 20} stroke="#3B82F6" strokeWidth="1" />
                                  <rect x={wMidX - wLblW / 2} y={fbl.y + 22} width={wLblW} height="24" rx="6" fill="white" stroke="#3B82F6" strokeWidth="1" />
                                  <text x={wMidX} y={fbl.y + 39} textAnchor="middle" fontSize="11" fontWeight="600" fill="#3B82F6">{wLabel}</text>
                                  <text x={wMidX} y={fbl.y + 56} textAnchor="middle" fontSize="10" fill="#94A3B8">genişlik</text>
                                  {/* Length/Depth */}
                                  <rect x={lMidX - lLblW / 2} y={lMidY + 5} width={lLblW} height="24" rx="6" fill="white" stroke="#10B981" strokeWidth="1" />
                                  <text x={lMidX} y={lMidY + 22} textAnchor="middle" fontSize="11" fontWeight="600" fill="#10B981">{lLabel}</text>
                                  <text x={lMidX} y={lMidY + 40} textAnchor="middle" fontSize="10" fill="#94A3B8">uzunluk</text>
                                </svg>
                              );
                            })()}
                          </div>

                          {/* Input fields */}
                          <div className="flex-1 min-w-0">
                            {/* Row 1: Genişlik, Uzunluk, Yükseklik */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                              <div>
                                <div className="mb-1.5 text-[11px] font-semibold text-[#64748B]">Genişlik</div>
                                <div className="flex items-center rounded-lg ring-1 ring-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:ring-[#3B82F6] transition-colors">
                                  <span className="pl-2.5 text-[#94A3B8]"><Ruler className="h-3.5 w-3.5" /></span>
                                  <Input inputMode="decimal" maxLength={7} value={pkg.width} onChange={e => { const v = e.target.value.replace(",", "."); if (/^\d*\.?\d*$/.test(v)) updatePkg(pkg.id, "width", v); }} placeholder="0" className="h-10 text-[14px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent px-2" />
                                  <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">cm</span>
                                </div>
                              </div>
                              <div>
                                <div className="mb-1.5 text-[11px] font-semibold text-[#64748B]">Uzunluk</div>
                                <div className="flex items-center rounded-lg ring-1 ring-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:ring-[#3B82F6] transition-colors">
                                  <span className="pl-2.5 text-[#94A3B8]"><Ruler className="h-3.5 w-3.5 rotate-90" /></span>
                                  <Input inputMode="decimal" maxLength={7} value={pkg.depth} onChange={e => { const v = e.target.value.replace(",", "."); if (/^\d*\.?\d*$/.test(v)) updatePkg(pkg.id, "depth", v); }} placeholder="0" className="h-10 text-[14px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent px-2" />
                                  <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">cm</span>
                                </div>
                              </div>
                              <div>
                                <div className="mb-1.5 text-[11px] font-semibold text-[#64748B]">Yükseklik</div>
                                <div className="flex items-center rounded-lg ring-1 ring-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:ring-[#3B82F6] transition-colors">
                                  <span className="pl-2.5 text-[#94A3B8]"><Ruler className="h-3.5 w-3.5" /></span>
                                  <Input inputMode="decimal" maxLength={7} value={pkg.height} onChange={e => { const v = e.target.value.replace(",", "."); if (/^\d*\.?\d*$/.test(v)) updatePkg(pkg.id, "height", v); }} placeholder="0" className="h-10 text-[14px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent px-2" />
                                  <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">cm</span>
                                </div>
                              </div>
                            </div>
                            {/* Row 2: Ağırlık, Adet */}
                            <div className="grid grid-cols-2 gap-3 mb-5">
                              <div>
                                <div className="mb-1.5 text-[11px] font-semibold text-[#64748B]">Ağırlık</div>
                                <div className="flex items-center rounded-lg ring-1 ring-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:ring-[#3B82F6] transition-colors">
                                  <span className="pl-2.5 text-[#94A3B8]"><Package className="h-3.5 w-3.5" /></span>
                                  <Input inputMode="decimal" maxLength={7} value={pkg.weight} onChange={e => { const v = e.target.value.replace(",", "."); if (/^\d*\.?\d*$/.test(v)) updatePkg(pkg.id, "weight", v); }} placeholder="0" className="h-10 text-[14px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent px-2" />
                                  <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">kg</span>
                                </div>
                              </div>
                              <div>
                                <div className="mb-1.5 text-[11px] font-semibold text-[#64748B]">Adet</div>
                                <div className="flex items-center rounded-lg ring-1 ring-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:ring-[#3B82F6] transition-colors">
                                  <span className="pl-2.5 text-[#94A3B8]"><Package className="h-3.5 w-3.5" /></span>
                                  <Input inputMode="numeric" value={pkg.packageCount} onChange={e => { const v = e.target.value; if (/^\d*$/.test(v)) updatePkg(pkg.id, "packageCount", v); }} placeholder="1" className="h-10 text-[14px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent px-2" />
                                  <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">adet</span>
                                </div>
                              </div>
                            </div>

                            {/* Weight comparison info */}
                            {(pw > 0 || pl > 0 || ph > 0 || pkgActual > 0) && (
                              <div className="rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-4">
                                <div className="flex items-center gap-2 mb-3 text-[13px] font-semibold text-[#475569]">
                                  <Package className="h-4 w-4 text-[#94A3B8]" />
                                  Kargo firmaları yüksek olan ağırlığı baz alır
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className={cn("rounded-xl p-3 ring-1", !isVolHigher ? "bg-white ring-[#10B981]/30" : "bg-white ring-[#E2E8F0]")}>
                                    <div className="text-[11px] text-[#94A3B8] mb-1 flex items-center gap-1.5">
                                      <Package className="h-3 w-3" /> Tartı Ağırlığı
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[18px] font-bold text-[#0F172A]">{(pkgActual * pkgCount).toFixed(1)} kg</span>
                                      {!isVolHigher && <CheckCircle className="h-5 w-5 text-[#10B981]" />}
                                    </div>
                                  </div>
                                  <div className={cn("rounded-xl p-3 ring-1", isVolHigher ? "bg-white ring-[#10B981]/30" : "bg-white ring-[#E2E8F0]")}>
                                    <div className="text-[11px] text-[#94A3B8] mb-1 flex items-center gap-1.5">
                                      <Ruler className="h-3 w-3" /> Hacimsel Ağırlık
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[18px] font-bold text-[#0F172A]">{(pkgVol * pkgCount).toFixed(1)} kg</span>
                                      {isVolHigher && <CheckCircle className="h-5 w-5 text-[#10B981]" />}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <button type="button" onClick={addPkg} className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[#3959F2] hover:bg-[#4338CA] transition-colors">
                  <Plus className="h-4 w-4" /> Farklı Ölçüde Koli Ekle
                </button>
              </div>

              {/* Sticky bottom bar */}
              <div className="sticky bottom-4 z-40 pointer-events-none mt-auto">
                <div className="pointer-events-auto bg-[#0F172A] text-white shadow-2xl rounded-2xl">
                  <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                    <div className="flex items-center justify-between sm:block">
                      <div className="text-[13px] sm:text-[14px] font-bold">Genel Toplam</div>
                      <div className="text-[11px] sm:text-[12px] text-[#94A3B8]">
                        {totalPkgCount} koli • {chargeableWeight.toFixed(1)} kg
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:gap-6">
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] sm:text-[11px] text-[#94A3B8]">Ücretlendirme</div>
                        <div className="text-[18px] sm:text-[24px] font-bold leading-tight">{chargeableWeight.toFixed(1)}kg</div>
                      </div>
                      <button type="button" onClick={handlePackageNext} disabled={carrierLoading} className="flex items-center gap-2 rounded-xl bg-[#3959F2] hover:bg-[#4338CA] px-4 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-bold text-white transition-colors disabled:opacity-50">
                        {carrierLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {carrierLoading ? "Sorgulanıyor..." : "Sonraki Adım"} <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════ ADIM 2: Kargo Firması ═══════════════════════ */}
      {step === 2 && (
        <Card className="border-0 shadow-lg rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <Truck className="h-5 w-5 text-brand-500" />
              Kargo Firması Seçimi
            </CardTitle>
            <p className="text-sm text-muted mt-1">Gönderiyi hangi kargo firmasıyla yapmak istediğinizi seçin</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* Rota bilgisi */}
            <div className="flex items-center justify-between rounded-2xl p-4 text-white" style={{ backgroundColor: "#3959F2" }}>
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-full bg-white/20 flex items-center justify-center">
                  <MapPinned className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/50">Çıkış</div>
                  <div className="text-sm font-bold">{senderCity}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-px w-8 bg-white/20" />
                <div className="text-center">
                  <Truck className="h-4 w-4 text-white/50 mx-auto" />
                  <div className="text-[9px] text-white/40 mt-0.5">{totalPkgCount} koli · {chargeableWeight.toFixed(1)} kg</div>
                </div>
                <div className="h-px w-8 bg-white/20" />
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-wider text-white/50">Varış</div>
                <div className="text-sm font-bold">{receiverCity}</div>
              </div>
            </div>

            {/* Firma kartları */}
            <div className="space-y-3">
              {carriers.map((c, idx) => {
                const isSelected = selectedCarrier === c.handlerCode;
                const logo = CARRIER_LOGOS[c.handlerCode];
                const isCheapest = idx === 0 || c.price === Math.min(...carriers.map(x => x.price));

                return (
                  <button key={c.handlerCode} type="button" onClick={() => { setSelectedCarrier(c.handlerCode); setApiError(null); }}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-2xl p-4 text-left ring-1 transition-all",
                      isSelected ? "bg-brand-50/60 ring-2 ring-brand-500 shadow-sm" : "bg-surface ring-border hover:ring-brand-200 hover:shadow-sm"
                    )}>
                    <div className="flex items-center gap-4">
                      {/* Logo */}
                      {c.logoUrl ? (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden">
                          <img src={c.logoUrl} alt={c.name} className="h-8 w-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-sm font-bold text-slate-600">${c.handlerCode[0]}</span>`; }} />
                        </div>
                      ) : (
                        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm text-sm", logo?.bg || "bg-slate-600")}>
                          {logo?.letter || c.handlerCode[0]}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{c.name}</span>
                          {isCheapest && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                              En Uygun
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted mt-0.5">{c.estimatedDays}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-lg font-bold tracking-tight">{c.price.toFixed(2)} ₺</div>
                        <div className="text-[10px] text-muted">Desi: {c.desiKg} kg</div>
                      </div>
                      <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-1", isSelected ? "bg-brand-600 ring-brand-600 text-white" : "bg-surface ring-border group-hover:ring-brand-300")}>
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {carriers.length === 0 && !carrierLoading && (
              <div className="text-center py-8 text-muted">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Kargo firması bulunamadı</p>
              </div>
            )}

            {/* Butonlar */}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="h-12 px-6 rounded-2xl gap-2">
                <ArrowLeft className="h-4 w-4" /> Geri
              </Button>
              <Button onClick={handleCarrierNext} disabled={!selectedCarrier} className="h-12 px-8 rounded-2xl text-sm font-semibold gap-2">
                <ArrowRight className="h-4 w-4" /> Devam Et
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════ ADIM 3: Adres Bilgileri ═══════════════════════ */}
      {step === 3 && (
        <Card className="border-0 shadow-lg rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-5 w-5 text-brand-500" />
              Adres Bilgileri
            </CardTitle>
            <p className="text-sm text-muted mt-1">Gönderici ve alıcı bilgilerini girin</p>
          </CardHeader>
          <CardContent className="p-6 space-y-8">
            {/* ── Gönderici ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <MapPinned className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Gönderici Bilgileri</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Ad Soyad" icon={User} error={fieldErrors.senderName}>
                  <Input placeholder="Gönderici adı" value={senderName} onChange={e => setSenderName(e.target.value)} />
                </Field>
                <Field label="Telefon" icon={Phone} error={fieldErrors.senderPhone}>
                  <Input placeholder="+90 5XX XXX XXXX" value={senderPhone} onChange={e => setSenderPhone(e.target.value)} />
                </Field>
                <Field label="İl" icon={Building}>
                  <div className="flex-1 text-[14px] font-semibold text-brand-600">{senderCity}</div>
                </Field>
                <Field label="İlçe" icon={Building}>
                  {senderTowns.length > 0 ? (
                    <SearchableSelect
                      options={senderTowns.map(t => ({ label: t.name, value: t.name, searchableText: t.name }))}
                      value={senderTown}
                      onChange={(v) => setSenderTown(v)}
                      placeholder="İlçe seçin"
                      searchPlaceholder="İlçe arayın..."
                      className="h-10 border-0 ring-0 focus:ring-0 bg-transparent text-sm"
                    />
                  ) : (
                    <Input placeholder="İlçe" value={senderTown} onChange={e => setSenderTown(e.target.value)} />
                  )}
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Adres" icon={MapPin} error={fieldErrors.senderAddress}>
                    <Input placeholder="Açık adres" value={senderAddress} onChange={e => setSenderAddress(e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-200" />

            {/* ── Alıcı ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                  <MapPinned className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-700">Alıcı Bilgileri</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Ad Soyad" icon={User} error={fieldErrors.receiverName}>
                  <Input placeholder="Alıcı adı" value={receiverName} onChange={e => setReceiverName(e.target.value)} />
                </Field>
                <Field label="Telefon" icon={Phone} error={fieldErrors.receiverPhone}>
                  <Input placeholder="+90 5XX XXX XXXX" value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)} />
                </Field>
                <Field label="İl" icon={Building}>
                  <div className="flex-1 text-[14px] font-semibold text-brand-600">{receiverCity}</div>
                </Field>
                <Field label="İlçe" icon={Building}>
                  {receiverTowns.length > 0 ? (
                    <SearchableSelect
                      options={receiverTowns.map(t => ({ label: t.name, value: t.name, searchableText: t.name }))}
                      value={receiverTown}
                      onChange={(v) => setReceiverTown(v)}
                      placeholder="İlçe seçin"
                      searchPlaceholder="İlçe arayın..."
                      className="h-10 border-0 ring-0 focus:ring-0 bg-transparent text-sm"
                    />
                  ) : (
                    <Input placeholder="İlçe" value={receiverTown} onChange={e => setReceiverTown(e.target.value)} />
                  )}
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Adres" icon={MapPin} error={fieldErrors.receiverAddress}>
                    <Input placeholder="Açık adres" value={receiverAddress} onChange={e => setReceiverAddress(e.target.value)} />
                  </Field>
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(2)} className="h-12 px-6 rounded-2xl gap-2">
                <ArrowLeft className="h-4 w-4" /> Geri
              </Button>
              <Button onClick={handleAddressNext} className="h-12 px-8 rounded-2xl text-sm font-semibold gap-2">
                <ArrowRight className="h-4 w-4" /> Devam Et
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════ ADIM 4: Özet & Ödeme ═══════════════════════ */}
      {step === 4 && selectedCarrierData && (
        <Card className="border-0 shadow-lg rounded-3xl">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle className="h-5 w-5 text-brand-500" />
              Gönderi Özeti
            </CardTitle>
            <p className="text-sm text-muted mt-1">Bilgilerinizi kontrol edin ve ödemeye geçin</p>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Kargo firması */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Kargo Firması</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-full font-bold text-white text-sm", CARRIER_LOGOS[selectedCarrier]?.bg || "bg-slate-600")}>
                    {CARRIER_LOGOS[selectedCarrier]?.letter || selectedCarrier[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{selectedCarrierData.name}</div>
                    <div className="text-xs text-muted">{selectedCarrierData.estimatedDays}</div>
                  </div>
                </div>
                <div className="text-xl font-bold text-brand-600">{selectedCarrierData.price.toFixed(2)} ₺</div>
              </div>
            </div>

            {/* Paket bilgileri */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-3">Paket Detayları</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-slate-700">{totalPkgCount}</div>
                  <div className="text-xs text-muted">Koli</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-700">{totalWeight.toFixed(1)}</div>
                  <div className="text-xs text-muted">kg (Gerçek)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-brand-600">{chargeableWeight.toFixed(1)}</div>
                  <div className="text-xs text-muted">kg (Desi)</div>
                </div>
              </div>
            </div>

            {/* Adresler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                    <MapPinned className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Gönderici</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="font-semibold">{senderName}</div>
                  <div className="text-muted text-xs">{senderPhone}</div>
                  <div className="text-muted text-xs">{senderAddress}</div>
                  <div className="text-muted text-xs">{senderTown ? `${senderTown} / ` : ""}{senderCity}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <MapPinned className="h-3 w-3" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Alıcı</span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="font-semibold">{receiverName}</div>
                  <div className="text-muted text-xs">{receiverPhone}</div>
                  <div className="text-muted text-xs">{receiverAddress}</div>
                  <div className="text-muted text-xs">{receiverTown ? `${receiverTown} / ` : ""}{receiverCity}</div>
                </div>
              </div>
            </div>

            {/* Toplam */}
            <div className="rounded-2xl bg-gradient-to-r from-brand-500 to-brand-600 p-5 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-white/70">Toplam Tutar</div>
                  <div className="text-3xl font-bold">{selectedCarrierData.price.toFixed(2)} ₺</div>
                </div>
                <div className="text-right text-xs text-white/60">
                  <div>KDV Dahil</div>
                  <div className="mt-1">Kargo ücreti</div>
                </div>
              </div>
            </div>

            {/* Bilgi */}
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50/60 border border-amber-200 p-4">
              <Info className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
              <div className="text-sm text-amber-700">
                Ödeme tamamlandıktan sonra <strong>kargo barkodu</strong> oluşturulacaktır. 
                Paketi barkodla birlikte <strong>en yakın {selectedCarrierData.name} şubesine</strong> teslim etmeniz gerekmektedir.
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex justify-between pt-2">
              <Button variant="outline" onClick={() => setStep(3)} className="h-12 px-6 rounded-2xl gap-2">
                <ArrowLeft className="h-4 w-4" /> Geri
              </Button>
              <Button onClick={handleFinalize} disabled={loading} className="h-14 px-10 rounded-2xl text-base font-bold gap-2 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 shadow-lg">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle className="h-5 w-5" />}
                {loading ? "Ödeme Hazırlanıyor..." : "Ödemeye Geç"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══════════════════════ ADIM 5: Tamamlandı ═══════════════════════ */}
      {step === 5 && resultData && (
        <Card className="border-0 shadow-lg rounded-3xl">
          <CardContent className="p-8 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Gönderi Oluşturuldu!</h2>
            <p className="text-muted mb-6">Gönderiniz başarıyla oluşturuldu. Ödeme bekleniyor.</p>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 mb-6 text-left max-w-sm mx-auto">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted">Takip Kodu:</span><span className="font-bold">{resultData.trackingCode}</span></div>
                <div className="flex justify-between"><span className="text-muted">Tutar:</span><span className="font-bold text-brand-600">{resultData.price?.toFixed(2)} ₺</span></div>
                <div className="flex justify-between"><span className="text-muted">Durum:</span><span className="font-semibold text-amber-600">Ödeme Bekleniyor</span></div>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => window.location.href = "/panel/gonderilerim"} className="h-12 px-6 rounded-2xl">
                Gönderilerime Git
              </Button>
              <Button onClick={() => { setStep(0); setPackages([{ ...EMPTY_PKG, id: crypto.randomUUID() }]); setSelectedCarrier(""); setResultData(null); }} className="h-12 px-6 rounded-2xl">
                Yeni Gönderi
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
