"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Package, Truck, User, Mail, Phone, MapPin, Globe, Weight,
  CreditCard, CheckCircle2, Clock, FileText, Box, Hash, Building2,
  Banknote, Shield, Tag, Calendar, ChevronRight, Loader2, AlertTriangle, Rocket, ChevronDown, ChevronUp, Barcode, Plus, Trash2, ArrowRight, ArrowLeftIcon, Plane, Info, Check, FileUp, UploadCloud, CheckCircle, Copy, FileCheck, ShieldAlert, Receipt, File as FileIcon
} from "lucide-react";
import { adminService } from "@/lib/services/adminService";
import { domesticService } from "@/lib/services/shipmentService";
import { CitySelect } from "@/components/ui/city-select";
import { StateSelect } from "@/components/ui/state-select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { NumericInput } from "@/components/ui/numeric-input";
import { DecimalInput } from "@/components/ui/decimal-input";
import { MeasurementInput } from "@/components/ui/measurement-input";
import { HSCodeCombobox } from "@/components/HSCodeCombobox";
import { cn } from "@/lib/cn";
import { Stepper } from "@/components/panel/stepper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const WIZARD_STEPS = ["Kargo Bilgileri", "Paket Ölçüleri", "Fiyatlandırma", "Adres Seçimi", "Proforma Beyanı", "Onay"] as const;

function fmt(iso: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getCurrencySymbol(c: string) { return c === "EUR" ? "€" : c === "USD" ? "$" : "£"; }
function toNumber(val: string | number) {
  const n = typeof val === "string" ? parseFloat(val.replace(/,/g, ".")) : val;
  return isNaN(n) ? 0 : n;
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
  pending_payment: { label: "Odeme Bekliyor", color: "bg-orange-50 text-orange-600 ring-orange-200" },
  awaiting_transfer_approval: { label: "Havale Onay Bekliyor", color: "bg-yellow-50 text-yellow-600 ring-yellow-200" },
  paid: { label: "Odendi", color: "bg-emerald-50 text-emerald-600 ring-emerald-200" },
  label_created: { label: "Etiket Olusturuldu", color: "bg-teal-50 text-teal-600 ring-teal-200" },
  shipped: { label: "Kargoda", color: "bg-blue-50 text-blue-600 ring-blue-200" },
  in_transit: { label: "Yolda", color: "bg-indigo-50 text-indigo-600 ring-indigo-200" },
  delivered: { label: "Teslim Edildi", color: "bg-green-50 text-green-700 ring-green-200" },
  cancelled: { label: "Iptal", color: "bg-red-50 text-red-500 ring-red-200" },
  returned: { label: "Iade", color: "bg-slate-100 text-slate-600 ring-slate-200" },
};

export default function ShipmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = Number(params.id);
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [forceLoading, setForceLoading] = React.useState(false);
  const [forceError, setForceError] = React.useState<string | null>(null);
  const [forceSuccess, setForceSuccess] = React.useState(false);
  const [showForceConfirm, setShowForceConfirm] = React.useState(false);
  const [wizardStep, setWizardStep] = React.useState(0);
  const [shipmentType, setShipmentType] = React.useState("Paket");
  const [carriersLoading, setCarriersLoading] = React.useState(false);
  const [carrierOptions, setCarrierOptions] = React.useState<any>(null);
  const [selectedCarrier, setSelectedCarrier] = React.useState<any>(null);
  const [senderForm, setSenderForm] = React.useState({ name: "", phone: "", address: "", city: "", town: "", postal: "", country: "TR" });
  const [saveSenderAddress, setSaveSenderAddress] = React.useState(false);
  const [receiverForm, setReceiverForm] = React.useState({ name: "", phone: "", address: "", city: "", town: "", postal: "", country: "" });
  const [saveReceiverAddress, setSaveReceiverAddress] = React.useState(false);
  // Ülke listeleri
  const [apiCountries, setApiCountries] = React.useState<any[]>([]);
  const [receiverHasStates, setReceiverHasStates] = React.useState(true);
  // Paket düzenleme
  type PkgItem = { id: string; widthCm: string; lengthCm: string; heightCm: string; weightKg: string; packageCount: string };
  const [packageItems, setPackageItems] = React.useState<PkgItem[]>([]);
  const [packagesLoading, setPackagesLoading] = React.useState(false);
  // Proforma
  type ProformaRow = { id: string; desc: string; hsCode: string; qty: string; unitPrice: string; origin: string; sku?: string };
  const [proformaItems, setProformaItems] = React.useState<ProformaRow[]>([{ id: "1", desc: "", hsCode: "", qty: "1", unitPrice: "", origin: "TR", sku: "" }]);
  const [proformaCurrency, setProformaCurrency] = React.useState("EUR");
  const [proformaDescription, setProformaDescription] = React.useState("");
  const [proformaIOSS, setProformaIOSS] = React.useState("");
  const [customsType, setCustomsType] = React.useState<"H" | "D">("H"); // H=DAP (varsayılan), D=DDP

  const [descriptionTypes, setDescriptionTypes] = React.useState<{ id: number; label: string }[]>([]);
  
  // Document Upload
  const [docUploadedFiles, setDocUploadedFiles] = React.useState<any[]>([]);
  const [docFileType, setDocFileType] = React.useState("INVOICE");
  const [docDragOver, setDocDragOver] = React.useState(false);
  const [docUploading, setDocUploading] = React.useState(false);
  const [docError, setDocError] = React.useState<string | null>(null);
  const [docSuccess, setDocSuccess] = React.useState<string | null>(null);
  const docInputRef = React.useRef<HTMLInputElement>(null);

  const updateProformaItem = (itemId: string, field: keyof ProformaRow, value: string) => {
    setProformaItems(prev => prev.map(p => p.id === itemId ? { ...p, [field]: value } : p));
  };
  const addProformaItem = () => {
    setProformaItems(prev => [...prev, { id: crypto.randomUUID(), desc: "", hsCode: "", qty: "1", unitPrice: "", origin: "TR", sku: "" }]);
  };
  const removeProformaItem = (itemId: string) => {
    setProformaItems(prev => prev.filter(p => p.id !== itemId));
  };
  // Postal lookup
  const [postalLookupLoading, setPostalLookupLoading] = React.useState(false);
  const [postalLookupResult, setPostalLookupResult] = React.useState<{city:string}|null>(null);

  // Domestic Transfer State
  const [domesticCarriers, setDomesticCarriers] = React.useState<any[]>([]);
  const [selectedDomesticHandler, setSelectedDomesticHandler] = React.useState<string>("");
  const [domesticLoading, setDomesticLoading] = React.useState(false);
  const [showDomesticSelection, setShowDomesticSelection] = React.useState(false);
  const [domesticValidationError, setDomesticValidationError] = React.useState("");

  const postalLookupTimer = React.useRef<NodeJS.Timeout|null>(null);
  React.useEffect(() => {
    const code = receiverForm.postal?.trim();
    const country = receiverForm.country;
    setPostalLookupResult(null);
    if (!code || code.length < 3) return;
    if (postalLookupTimer.current) clearTimeout(postalLookupTimer.current);
    postalLookupTimer.current = setTimeout(async () => {
      setPostalLookupLoading(true);
      try {
        const params = new URLSearchParams({ code });
        if (country) params.set("country", country);
        const res = await fetch(`${API_BASE}/api/postal-lookup?${params}`);
        const data = await res.json();
        if (data.results?.length > 0) {
          const match = data.results[0];
          setPostalLookupResult({ city: match.city });
          setReceiverForm(p => ({ ...p, city: match.city }));
        }
      } catch {} finally { setPostalLookupLoading(false); }
    }, 800);
    return () => { if (postalLookupTimer.current) clearTimeout(postalLookupTimer.current); };
  }, [receiverForm.postal, receiverForm.country]);

  // Ülkeleri yükle (gonderi-olustur ile aynı format)
  React.useEffect(() => {
    const trNames = new Intl.DisplayNames(["tr"], { type: "region" });
    fetch(`${API_BASE}/api/countries`)
      .then(r => r.json())
      .then((data: any[]) => {
        if (!Array.isArray(data)) return;
        setApiCountries(data.map(c => {
          const code = c.isoCode?.toUpperCase() || "";
          let name = c.countryName;
          try { name = trNames.of(code) || c.countryName; } catch {}
          return { value: code, label: name, name, phoneCode: c.phoneCode || "", flag: `https://flagcdn.com/w40/${code.toLowerCase()}.png` };
        }));
      }).catch(() => {});

    fetch(`${API_BASE}/api/shipment-description-types`)
      .then(r => r.json())
      .then((res: any) => setDescriptionTypes(res.types || []))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!shipmentId) return;
    (async () => {
      try {
        const res = await adminService.getShipmentDetail(shipmentId);
        setData(res);
        const sa = res?.addresses?.find((a: any) => a.type === "sender");
        const ra = res?.addresses?.find((a: any) => a.type === "receiver");
        setSenderForm({
          name: sa?.name || res.senderName || "",
          phone: sa?.phone || res.senderPhone || "",
          address: sa?.address || res.senderAddress || "",
          city: sa?.city || res.senderCity || "",
          town: sa?.town || "",
          postal: sa?.postalCode || "",
          country: sa?.countryCode || res.senderCountry || "TR",
        });
        setReceiverForm({
          name: ra?.name || res.receiverName || "",
          phone: ra?.phone || res.receiverPhone || "",
          address: ra?.address || res.receiverAddress || "",
          city: ra?.city || res.receiverCity || "",
          town: ra?.town || res.receiverStateProvince || res.receiverState || "",
          postal: ra?.postalCode || res.receiverPostal || "",
          country: ra?.countryCode || res.receiverCountry || "",
        });
        if (res.shipmentType) setShipmentType(res.shipmentType);
        // Paketleri doldur
        if (res.packages?.length > 0) {
          setPackageItems(res.packages.map((p: any, i: number) => ({
            id: String(i),
            widthCm: String(p.widthCm || ""),
            lengthCm: String(p.lengthCm || ""),
            heightCm: String(p.heightCm || ""),
            weightKg: String(p.weightKg || ""),
            packageCount: String(p.count || 1),
          })));
        } else {
          setPackageItems([{ id: "0", widthCm: "", lengthCm: "", heightCm: "", weightKg: "", packageCount: "1" }]);
        }
        
        // Proforma detayları
        if (res.proformaDescription) setProformaDescription(res.proformaDescription);
        if (res.proformaIOSS) setProformaIOSS(res.proformaIOSS);
        if (res.customsType) setCustomsType(res.customsType === "D" ? "D" : "H");
        if (res.proformaCurrency) setProformaCurrency(res.proformaCurrency);
        if (res.proformaItems?.length > 0) {
          setProformaItems(res.proformaItems.map((p: any, i: number) => ({
            id: String(i),
            desc: p.productDescription || "",
            hsCode: p.hsCode || "",
            qty: String(p.quantity || "1"),
            unitPrice: String(p.unitPrice || ""),
            origin: p.origin || "TR"
          })));
        }
      } catch (err: any) { setError(err.message || "Gonderi yuklenemedi"); }
      finally { setLoading(false); }
    })();
  }, [shipmentId]);

  async function handleFetchCarriers() {
    setCarriersLoading(true);
    setForceError(null);
    try {
      const res = await adminService.getCarrierOptions(shipmentId, {
        senderCountry: senderForm.country || data?.senderCountry || "TR",
        receiverCountry: receiverForm.country || data?.receiverCountry || "",
        receiverPostalCode: receiverForm.postal || data?.receiverPostal || "",
        shipmentType: shipmentType || data?.shipmentType || "Paket",
        senderCity: senderForm.city,
        receiverCity: receiverForm.city,
        receiverTown: receiverForm.town,
      });
      setCarrierOptions(res);
    } catch (err: any) {
      setForceError(err.message || "Kargo seçenekleri getirilemedi");
    } finally {
      setCarriersLoading(false);
    }
  }

  async function handleForceCreate() {
    if (!selectedCarrier) { setForceError("Lütfen bir kargo firması seçin"); return; }
    setForceLoading(true);
    setForceError(null);
    try {
      await adminService.forceCreateShipment(shipmentId, {
        senderName: senderForm.name, senderPhone: senderForm.phone,
        senderAddress: senderForm.address, senderCity: senderForm.city, senderTown: senderForm.town,
        senderCountry: senderForm.country || data?.senderCountry || "TR",
        senderPostalCode: senderForm.postal,
        receiverName: receiverForm.name, receiverPhone: receiverForm.phone,
        receiverAddress: receiverForm.address, receiverCity: receiverForm.city,
        receiverTown: receiverForm.town, receiverPostalCode: receiverForm.postal,
        receiverCountry: receiverForm.country || data?.receiverCountry || "",
        carrierId: selectedCarrier.carrierId, carrierType: selectedCarrier.type,
        carrierName: selectedCarrier.carrierName, serviceName: selectedCarrier.serviceName,
        priceTry: selectedCarrier.priceTry,
        domesticHandlerCode: selectedDomesticHandler,
      });
      setForceSuccess(true);
      setShowForceConfirm(false);
      const res = await adminService.getShipmentDetail(shipmentId);
      setData(res);
    } catch (err: any) {
      setForceError(err.message || "Kargo oluşturulamadı");
    } finally {
      setForceLoading(false);
    }
  }

  const [assetLabelLoading, setAssetLabelLoading] = React.useState(false);
  const handleDownloadAssetLabel = async (reference: string) => {
    if (!reference) return;
    setAssetLabelLoading(true);
    try {
      const token = globalThis.localStorage?.getItem("zalusa.admin.token") ?? "";
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      const res = await fetch(`${API_BASE}/api/admin/asset-label?reference=${encodeURIComponent(reference)}`, { headers });
      const resData = await res.json();
      
      if (resData.type === "base64" && resData.labelBase64) {
        const cleanUrl = `data:application/pdf;base64,${resData.labelBase64}#toolbar=0&navpanes=0&view=Fit`;
        const win = window.open("", "_blank");
        if (win) {
          win.document.write(`<!DOCTYPE html><html><head><title>Asset Etiket - ${reference}</title></head><body style="margin:0;padding:0;overflow:hidden;height:100vh;width:100vw;"><iframe src="${cleanUrl}" width="100%" height="100%" style="border:none;height:100vh;width:100vw;"></iframe></body></html>`);
          win.document.close();
        }
      } else if (resData.type === "html" && resData.content) {
        const win = window.open("", "_blank");
        if (win) {
          win.document.write(resData.content);
          win.document.close();
        }
      } else {
        alert(resData.message || "Etiket alınamadı.");
      }
    } catch (err: any) {
      alert("Hata oluştu: " + err.message);
    } finally {
      setAssetLabelLoading(false);
    }
  }

  if (loading) return (
    <div className="space-y-4">
      <div className="h-8 w-56 animate-pulse rounded-xl bg-slate-200" />
      <div className="h-48 animate-pulse rounded-2xl bg-white" />
      <div className="grid grid-cols-2 gap-4"><div className="h-64 animate-pulse rounded-2xl bg-white" /><div className="h-64 animate-pulse rounded-2xl bg-white" /></div>
    </div>
  );

  if (error || !data) return (
    <div className="space-y-4">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-medium text-indigo-600"><ArrowLeft className="h-4 w-4" /> Geri Don</button>
      <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-100">
        <Package className="inline-block h-10 w-10 text-slate-300" />
        <p className="mt-3 text-sm text-slate-500">{error || "Gonderi bulunamadi"}</p>
      </div>
    </div>
  );

  const sc = statusConfig[data.status] || { label: data.status, color: "bg-slate-50 text-slate-600 ring-slate-200" };
  const canForceCreate = data.status === "draft" || data.status === "pending_payment" || data.status === "awaiting_transfer_approval";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Geri Don
        </button>
      </div>

      {/* Ozet Kart */}
      <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 ring-1 ring-indigo-100"><Package className="h-7 w-7 text-indigo-600" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">{data.trackingCode || `SHP-${data.id}`}</h1>
                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${sc.color}`}>{sc.label}</span>
              </div>
              <div className="mt-1 flex flex-col gap-1.5 text-xs text-slate-500">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1"><User className="h-3 w-3" /> {data.userName}</span>
                  <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {data.userEmail}</span>
                  <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {fmt(data.createdAt)}</span>
                </div>
                {(data.trackingCode || data.domestic?.trackingCode) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 border-t border-slate-100 pt-2">
                    {data.domestic?.trackingCode && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-600 flex items-center gap-1"><Truck className="w-3.5 h-3.5"/> Yurt İçi Kargo:</span>
                        <span className="text-sky-600 font-mono font-medium bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">{data.domestic.trackingCode}</span>
                        <span className="text-[10px] text-slate-400">({data.domestic.carrier})</span>
                      </div>
                    )}
                    {data.trackingCode && (
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-600 flex items-center gap-1"><Plane className="w-3.5 h-3.5"/> Yurt Dışı Kargo:</span>
                        <span className="text-emerald-600 font-mono font-medium bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">{data.trackingCode}</span>
                        <span className="text-[10px] text-slate-400">({data.carrierName})</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">{(data.carrierPriceTry || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</div>
            <div className="text-xs text-slate-400 mt-0.5">{data.carrierName} - {data.serviceName}</div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-xl bg-slate-50 p-3 text-center"><div className="text-[10px] font-medium text-slate-400 uppercase">Tip</div><div className="mt-1 text-sm font-semibold text-slate-800">{data.shipmentType}</div></div>
          <div className="rounded-xl bg-slate-50 p-3 text-center"><div className="text-[10px] font-medium text-slate-400 uppercase">Rota</div><div className="mt-1 text-sm font-semibold text-slate-800">{data.senderCountry} - {data.receiverCountry}</div></div>
          <div className="rounded-xl bg-slate-50 p-3 text-center"><div className="text-[10px] font-medium text-slate-400 uppercase">Agirlik</div><div className="mt-1 text-sm font-semibold text-slate-800">{data.chargeableWeight?.toFixed(1)} kg</div></div>
          <div className="rounded-xl bg-slate-50 p-3 text-center"><div className="text-[10px] font-medium text-slate-400 uppercase">Koli</div><div className="mt-1 text-sm font-semibold text-slate-800">{data.packageCount} adet</div></div>
          <div className="rounded-xl bg-slate-50 p-3 text-center"><div className="text-[10px] font-medium text-slate-400 uppercase">Odeme</div><div className="mt-1 text-sm font-semibold text-slate-800">{data.paymentId?.startsWith('ADMIN-FORCE') ? 'Admin Onaylı' : (data.paymentId || "-")}</div></div>
        </div>
      </div>

      {/* Admin Force Create Wizard */}
      {canForceCreate && !forceSuccess && (
        <div className="rounded-2xl bg-white p-6 ring-1 ring-amber-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                <Rocket className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Kargo Oluştur</h3>
                <p className="text-[11px] text-slate-500">Durum: <strong className="text-amber-600">{sc.label}</strong> — Bilgileri doldurup kargo oluşturun</p>
              </div>
            </div>
            {!showForceConfirm && (
              <button onClick={() => setShowForceConfirm(true)} className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all hover:scale-105 shrink-0">
                <Rocket className="h-4 w-4" /> Başla
              </button>
            )}
          </div>

          {showForceConfirm && (
            <div className="space-y-6 mt-4">
              {/* Progress Steps — Stepper */}
              <Stepper steps={[...WIZARD_STEPS]} current={wizardStep} onStepClick={(i) => { if (i < wizardStep) setWizardStep(i); }} />

              {/* Global Error Display */}
              {forceError && (
                <div className="rounded-lg bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-200 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" /> {forceError}
                </div>
              )}

              {/* STEP 0: Kargo Bilgileri */}
              {wizardStep === 0 && (
                <Card className="animate-in fade-in slide-in-from-right-4">
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle className="text-lg sm:text-xl font-bold">Kargo Bilgileri</CardTitle>
                      <p className="mt-1 text-sm text-muted font-medium">Gönderi tipi ve alıcı bilgilerini belirleyin.</p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-border bg-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-[#334155]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#64748B]"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/></svg>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>Taslak</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-5 sm:gap-8">
                      <div>
                        <div className="mb-4 text-[14px] font-bold text-[#0F172A]">Gönderi Tipi</div>
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                          {(["Belge","Paket","Koli"] as const).map(t=>{const active=shipmentType===t;const d:any={Belge:"Evrak / sözleşme / fatura",Paket:"Tekli veya küçük hacimli gönderiler",Koli:"Çoklu veya büyük hacimli gönderiler"};return(
                            <button key={t} type="button" onClick={()=>setShipmentType(t)} className={cn("relative flex items-center justify-between rounded-2xl px-3 py-3 sm:px-5 sm:py-4 text-left transition-all duration-200",active?"bg-[#3959F2] text-white shadow-lg shadow-[#4F46E5]/25":"bg-[#F8FAFC] text-[#0F172A] ring-1 ring-[#E2E8F0] hover:ring-[#CBD5E1] hover:shadow-sm")}>
                              <div className="min-w-0 flex-1">
                                <div className="text-[13px] sm:text-[15px] font-bold">{t}</div>
                                <div className={cn("mt-0.5 text-[12px] font-medium hidden sm:block",active?"text-white/75":"text-[#94A3B8]")}>{d[t]}</div>
                              </div>
                            </button>);})}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="mb-2 text-xs font-bold uppercase tracking-widest">Gönderici Ülke <span className="text-red-500">*</span></div>
                          <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 ring-1 ring-border h-12">
                            <div className="flex items-center gap-3"><div className="shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-border h-6 w-9 relative"><img src="https://flagcdn.com/w40/tr.png" alt="Türkiye" className="w-full h-full object-cover"/></div><div className="text-sm font-bold text-foreground">Türkiye</div></div>
                            <span className="text-xs font-medium text-muted">Değiştirilemez</span>
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 text-xs font-bold uppercase tracking-widest">Alıcı Ülke <span className="text-red-500">*</span></div>
                          <div className="rounded-2xl ring-1 ring-border bg-white"><SearchableSelect options={apiCountries} value={receiverForm.country} onChange={(v:string)=>setReceiverForm(p=>({...p,country:v,city:""}))} placeholder="Alıcı Ülke Seçiniz" className="h-12 border-0 ring-0 focus:ring-0 bg-transparent text-sm px-4"/></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="mb-2 text-xs font-bold uppercase tracking-widest">Alıcı Posta Kodu <span className="text-red-500">*</span></div>
                          <div className={cn("relative rounded-2xl ring-1 bg-white overflow-hidden transition-all", postalLookupResult ? "ring-2 ring-emerald-400" : "ring-border")}>
                            <input value={receiverForm.postal} onChange={e=>setReceiverForm(p=>({...p,postal:e.target.value}))} placeholder={!receiverForm.country?"Önce alıcı ülke seçin":"Posta Kodu"} disabled={!receiverForm.country} className="w-full h-12 border-0 ring-0 focus:ring-0 shadow-none bg-transparent text-sm px-4 pr-10 outline-none disabled:cursor-not-allowed"/>
                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                              {postalLookupLoading ? <Loader2 className="h-5 w-5 text-blue-500 animate-spin"/> : postalLookupResult ? <CheckCircle2 className="h-5 w-5 text-emerald-500"/> : <MapPin className="h-5 w-5 text-muted"/>}
                            </div>
                          </div>
                          {postalLookupResult && <div className="mt-1.5 text-xs font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> {postalLookupResult.city} olarak belirlendi</div>}
                        </div>
                        <div>
                          <div className="mb-2 text-xs font-bold uppercase tracking-widest">Şehir</div>
                          <div className="rounded-2xl ring-1 ring-border bg-white overflow-hidden">
                            <input value={receiverForm.city} readOnly={!!postalLookupResult} onChange={e=>setReceiverForm(p=>({...p,city:e.target.value}))} placeholder={postalLookupLoading?"Aranıyor...":"Otomatik doldurulur"} className="w-full h-12 border-0 ring-0 focus:ring-0 shadow-none bg-transparent text-sm px-4 outline-none disabled:opacity-100"/>
                          </div>
                          <div className="mt-1.5 text-xs text-muted">Otomatik doldurulur.</div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-1.5 text-sm text-muted">
                          <Info className="h-4 w-4 shrink-0" />
                          <span>Zorunlu alanlar <span className="text-red-500 font-semibold">*</span> ile işaretlidir.</span>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button onClick={()=>setShowForceConfirm(false)} className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-bold text-[#0F172A] transition-colors shadow-sm">İptal</button>
                          <button onClick={()=>{if(!receiverForm.country){setForceError("Lütfen alıcı ülke seçin.");return;}if(!receiverForm.postal){setForceError("Posta kodu girin.");return;}setForceError(null);setWizardStep(1);}} className="flex items-center gap-2 rounded-xl bg-[#3959F2] hover:bg-[#4338CA] px-4 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-bold text-white transition-colors">Devam →</button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* STEP 3: Adres Bilgileri */}
              {wizardStep === 3 && (
                <Card className="animate-in fade-in slide-in-from-right-4">
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>Adres Seçimi</CardTitle>
                      <p className="mt-1 text-sm text-muted">Gönderici ve alıcı adres bilgilerini girin.</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                      <button type="button" onClick={() => setWizardStep(2)} className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 sm:px-6 py-2 sm:py-3 text-[12px] sm:text-[14px] font-bold text-[#0F172A] transition-colors shadow-sm">
                        <span>←</span> Geri
                      </button>
                      <button 
                        type="button" 
                        onClick={async () => {
                          if (!senderForm.name || !senderForm.country || !senderForm.city || !senderForm.address) { setForceError("Lütfen gönderici zorunlu alanlarını doldurun."); return; }
                          if (!receiverForm.name || !receiverForm.country || !receiverForm.city || !receiverForm.address || !receiverForm.postal) { setForceError("Lütfen alıcı zorunlu alanlarını doldurun."); return; }
                          setForceError(null);
                          
                          const sCity = senderForm.city?.toLowerCase().trim();
                          const isIstanbul = sCity.includes("istanbul") || sCity === "34";
                          
                          if (senderForm.country === "TR" && !isIstanbul && !selectedDomesticHandler) {
                             setShowDomesticSelection(true);
                             setDomesticLoading(true);
                             try {
                               const pkgs = packageItems.length > 0 ? packageItems : [{ widthCm: 10, heightCm: 10, lengthCm: 10, weightKg: 1 }];
                               const res = await adminService.getDomesticPrices({
                                 packages: pkgs.map(p => ({ 
                                   width: Number(p.widthCm) || 10, 
                                   height: Number(p.heightCm) || 10, 
                                   depth: Number(p.lengthCm) || 10, 
                                   weight: Number(p.weightKg) || 1 
                                 })),
                                 shipmentId: Number(params.id)
                               });
                               setDomesticCarriers(res.carriers || []);
                             } catch (err: any) {
                               setForceError("Yurt içi kargo fiyatları alınamadı: " + (err?.message || ""));
                               setShowDomesticSelection(false);
                             } finally {
                               setDomesticLoading(false);
                             }
                             return;
                          }
                          
                          try {
                            setForceLoading(true);
                            await adminService.updateDraft(shipmentId, {
                               step: 3,
                               senderName: senderForm.name,
                               senderPhone: senderForm.phone,
                               senderAddress: senderForm.address,
                               senderCity: senderForm.city,
                               senderTown: senderForm.town,
                               saveSenderAddress,
                               receiverName: receiverForm.name,
                               receiverPhone: receiverForm.phone,
                               receiverAddress: receiverForm.address,
                               receiverCity: receiverForm.city,
                               receiverStateProvince: receiverForm.town,
                               receiverAddressPostalCode: receiverForm.postal,
                               receiverAddressCountry: receiverForm.country,
                               saveReceiverAddress,
                               domesticHandlerCode: selectedDomesticHandler || ""
                            });
                          } catch (e: any) {
                            setForceError(e.message || "Adres kaydedilemedi");
                            setForceLoading(false);
                            return;
                          }
                          setForceLoading(false);
                          
                          setWizardStep(4); // Go to Proforma
                        }}
                        disabled={forceLoading}
                        className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#3959F2] hover:bg-[#4338CA] px-3 sm:px-6 py-2 sm:py-3 text-[12px] sm:text-[14px] font-bold text-white transition-colors disabled:opacity-50"
                      >
                        Devam <span>→</span>
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                  <div className="space-y-6">
                    <div className="rounded-xl border border-indigo-200 bg-indigo-50/30 p-5 space-y-4">
                      <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-wider flex items-center gap-2"><MapPin className="h-4 w-4" /> Gönderici Bilgileri</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div><label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Ad Soyad <span className="text-red-500">*</span></label><input value={senderForm.name} onChange={e => setSenderForm(p => ({...p, name: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 px-4 text-[13px] font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" placeholder="Gönderici adı" /></div>
                        <div><label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Telefon <span className="text-red-500">*</span></label><PhoneInput defaultDialCode="+90" value={senderForm.phone} onChange={v => setSenderForm(p => ({...p, phone: v}))} placeholder="5XX XXX XX XX" /></div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Ülke <span className="text-red-500">*</span></label>
                          <SearchableSelect value={senderForm.country} onChange={val => { setSenderForm(p => ({...p, country: val, city: ""})); }} options={apiCountries} placeholder="Ülke seçin..." className="h-11" />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Şehir <span className="text-red-500">*</span></label>
                          <CitySelect countryCode={senderForm.country} value={senderForm.city} onChange={val => setSenderForm(p => ({...p, city: val}))} placeholder="Şehir Seçin..." className="h-11" />
                        </div>
                        <div><label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">İlçe / Eyalet</label><input value={senderForm.town} onChange={e => setSenderForm(p => ({...p, town: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 px-4 text-[13px] font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" placeholder="İlçe" /></div>
                        <div><label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Posta Kodu</label><input value={senderForm.postal} onChange={e => setSenderForm(p => ({...p, postal: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 px-4 text-[13px] font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" placeholder="34000" /></div>
                        <div className="sm:col-span-3"><label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Adres <span className="text-red-500">*</span></label><input value={senderForm.address} onChange={e => setSenderForm(p => ({...p, address: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 px-4 text-[13px] font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" placeholder="Açık adres" /></div>
                        <div className="sm:col-span-3">
                          <label className="flex items-center gap-2 cursor-pointer w-fit">
                            <input type="checkbox" checked={saveSenderAddress} onChange={e => setSaveSenderAddress(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                            <span className="text-sm font-medium text-slate-700">Bu gönderici adresini müşterinin adres defterine kaydet</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-5 space-y-4">
                      <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-2"><MapPin className="h-4 w-4" /> Alıcı Bilgileri</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div><label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Ad Soyad <span className="text-red-500">*</span></label><input value={receiverForm.name} onChange={e => setReceiverForm(p => ({...p, name: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 px-4 text-[13px] font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" placeholder="Alıcı adı" /></div>
                        <div><label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Telefon <span className="text-red-500">*</span></label><PhoneInput defaultDialCode="+90" value={receiverForm.phone} onChange={v => setReceiverForm(p => ({...p, phone: v}))} placeholder="5XX XXX XX XX" /></div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Ülke <span className="text-red-500">*</span></label>
                          <SearchableSelect value={receiverForm.country} onChange={val => { setReceiverForm(p => ({...p, country: val, city: "", town: ""})); setReceiverHasStates(true); }} options={apiCountries} placeholder="Ülke seçin..." className="h-11" />
                        </div>
                        {receiverHasStates && (
                           <div>
                              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Eyalet</label>
                              <StateSelect countryCode={receiverForm.country} value={receiverForm.town} onChange={val => setReceiverForm(p => ({...p, town: val}))} placeholder="Eyalet Seçin..." className="h-11" />
                           </div>
                        )}
                        <div>
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Şehir <span className="text-red-500">*</span></label>
                          <CitySelect countryCode={receiverForm.country} value={receiverForm.city} onChange={val => setReceiverForm(p => ({...p, city: val}))} placeholder="Şehir Seçin..." className="h-11" />
                        </div>
                        {!receiverHasStates && <div><label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">İlçe / Eyalet</label><input value={receiverForm.town} onChange={e => setReceiverForm(p => ({...p, town: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 px-4 text-[13px] font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" placeholder="İlçe/Eyalet" /></div>}
                        <div><label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Posta Kodu <span className="text-red-500">*</span></label><input value={receiverForm.postal} onChange={e => setReceiverForm(p => ({...p, postal: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 px-4 text-[13px] font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" placeholder="Örn: 51149" /></div>
                        <div className="sm:col-span-3"><label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Adres <span className="text-red-500">*</span></label><input value={receiverForm.address} onChange={e => setReceiverForm(p => ({...p, address: e.target.value}))} className="w-full h-11 rounded-xl border border-slate-200 px-4 text-[13px] font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-shadow" placeholder="Açık adres" /></div>
                        <div className="sm:col-span-3">
                          <label className="flex items-center gap-2 cursor-pointer w-fit">
                            <input type="checkbox" checked={saveReceiverAddress} onChange={e => setSaveReceiverAddress(e.target.checked)} className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                            <span className="text-sm font-medium text-slate-700">Bu alıcı adresini müşterinin adres defterine kaydet</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>
              )}

              {/* STEP 1: Paketler */}
              {wizardStep === 1 && (() => {
                const totalPkgCount = packageItems.reduce((s, p) => s + Math.max(1, Number(p.packageCount) || 1), 0);
                const totalActual = packageItems.reduce((s, p) => s + (Number(p.weightKg) || 0) * Math.max(1, Number(p.packageCount) || 1), 0);
                const totalVol = packageItems.reduce((s, p) => { const w=Number(p.widthCm)||0, l=Number(p.lengthCm)||0, h=Number(p.heightCm)||0; return s + ((w*l*h)/5000) * Math.max(1, Number(p.packageCount)||1); }, 0);
                const chargeableW = Math.max(totalActual, totalVol);
                return (
                <Card className="animate-in fade-in slide-in-from-right-4">
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>Paket Ölçüleri</CardTitle>
                      <p className="mt-1 text-sm text-muted">Kayıtlı ölçülerden seçebilir veya ölçüleri manuel girebilirsiniz.</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                      <button type="button" onClick={() => setWizardStep(0)} className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 sm:px-6 py-2 sm:py-3 text-[12px] sm:text-[14px] font-bold text-[#0F172A] transition-colors shadow-sm">
                        <span>←</span> Geri
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-24">
                  <div className="space-y-4">
                    {packageItems.map((pkg, idx) => {
                      const pw = Math.max(Number(pkg.widthCm) || 0, 0);
                      const pl = Math.max(Number(pkg.lengthCm) || 0, 0);
                      const ph = Math.max(Number(pkg.heightCm) || 0, 0);
                      const pkgVol = (pw * pl * ph) / 5000;
                      const pkgActual = Math.max(Number(pkg.weightKg) || 0, 0);
                      const pkgCount = Math.max(1, Number(pkg.packageCount) || 1);
                      const pkgChargeable = Math.max(pkgVol, pkgActual) * pkgCount;
                      const isVolHigher = pkgVol > pkgActual;

                      const rawW = Math.max(pw, 1), rawL = Math.max(pl, 1), rawH = Math.max(ph, 1);
                      const maxDim = Math.max(rawW, rawL, rawH, 1);
                      const scaleV = (v: number) => 30 + ((v / maxDim) * 90);
                      const vW = scaleV(rawW), vL = scaleV(rawL), vH = scaleV(rawH);
                      const depthX = vL * 0.45, depthY = vL * 0.25;
                      const totalBoxW = vW + depthX, totalBoxH = vH + depthY;
                      const padLeft = 55, padRight = 40, padTop = 20, padBottom = 60;
                      const svgW = padLeft + totalBoxW + padRight, svgH = padTop + totalBoxH + padBottom;
                      const ax = padLeft, ay = padTop + totalBoxH;
                      const fbl = { x: ax, y: ay }, fbr = { x: ax + vW, y: ay };
                      const ftl = { x: ax, y: ay - vH }, ftr = { x: ax + vW, y: ay - vH };
                      const btl = { x: ax + depthX, y: ay - vH - depthY }, btr = { x: ax + vW + depthX, y: ay - vH - depthY };
                      const bbr = { x: ax + vW + depthX, y: ay - depthY };
                      const pts = (arr: {x:number,y:number}[]) => arr.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
                      const hMidY = ay - vH / 2, wMidX = ax + vW / 2;
                      const hLabel = `${pkg.heightCm || "0"} cm`, wLabel = `${pkg.widthCm || "0"} cm`, lLabel = `${pkg.lengthCm || "0"} cm`;
                      const lMidX = ax + vW + depthX / 2, lMidY = ay - depthY / 2 - vH / 2;
                      const lblW = (t: string) => Math.max(56, t.length * 7 + 16);

                      return (
                        <div key={pkg.id} className="rounded-2xl bg-white ring-1 ring-[#E2E8F0] overflow-hidden">
                          <div className="flex items-center justify-between px-5 py-3 border-b border-[#F1F5F9]">
                            <div className="flex items-center gap-3">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F1F5F9] text-[12px] font-bold text-[#475569]">{idx + 1}</span>
                              <span className="text-[13px] font-bold text-[#0F172A]">Paket/Koli {idx + 1}</span>
                              {pkgChargeable > 0 && <span className="text-[11px] text-[#94A3B8]">{pkgChargeable.toFixed(1)} kg</span>}
                            </div>
                            <div className="flex items-center gap-2">
                              {packageItems.length > 1 && (
                                <button type="button" onClick={() => setPackageItems(prev => prev.filter(p => p.id !== pkg.id))} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-colors">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="p-5">
                            <div className="flex gap-8">
                              <div className="hidden lg:flex items-center justify-center shrink-0" style={{ width: 240, minHeight: 180 }}>
                                <svg viewBox={`0 0 ${svgW} ${svgH}`} width="220" style={{ maxHeight: 180 }} className="drop-shadow-sm">
                                  <polygon points={pts([fbl, fbr, ftr, ftl])} fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
                                  <polygon points={pts([ftl, ftr, btr, btl])} fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1.5" />
                                  <polygon points={pts([fbr, bbr, btr, ftr])} fill="#93C5FD" stroke="#60A5FA" strokeWidth="1.5" />
                                  <line x1={ax - 20} y1={ftl.y + 2} x2={ax - 20} y2={fbl.y - 2} stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 2" />
                                  <line x1={ax - 25} y1={ftl.y + 2} x2={ax - 15} y2={ftl.y + 2} stroke="#3B82F6" strokeWidth="1" />
                                  <line x1={ax - 25} y1={fbl.y - 2} x2={ax - 15} y2={fbl.y - 2} stroke="#3B82F6" strokeWidth="1" />
                                  <rect x={ax - 20 - lblW(hLabel) / 2} y={hMidY - 12} width={lblW(hLabel)} height="24" rx="6" fill="white" stroke="#3B82F6" strokeWidth="1" />
                                  <text x={ax - 20} y={hMidY + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#3B82F6">{hLabel}</text>
                                  <text x={ax - 20} y={fbl.y + 16} textAnchor="middle" fontSize="10" fill="#94A3B8">yükseklik</text>
                                  <line x1={fbl.x + 2} y1={fbl.y + 15} x2={fbr.x - 2} y2={fbr.y + 15} stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 2" />
                                  <line x1={fbl.x + 2} y1={fbl.y + 10} x2={fbl.x + 2} y2={fbl.y + 20} stroke="#3B82F6" strokeWidth="1" />
                                  <line x1={fbr.x - 2} y1={fbr.y + 10} x2={fbr.x - 2} y2={fbr.y + 20} stroke="#3B82F6" strokeWidth="1" />
                                  <rect x={wMidX - lblW(wLabel) / 2} y={fbl.y + 22} width={lblW(wLabel)} height="24" rx="6" fill="white" stroke="#3B82F6" strokeWidth="1" />
                                  <text x={wMidX} y={fbl.y + 39} textAnchor="middle" fontSize="11" fontWeight="600" fill="#3B82F6">{wLabel}</text>
                                  <text x={wMidX} y={fbl.y + 56} textAnchor="middle" fontSize="10" fill="#94A3B8">genişlik</text>
                                  <rect x={lMidX - lblW(lLabel) / 2} y={lMidY + 5} width={lblW(lLabel)} height="24" rx="6" fill="white" stroke="#10B981" strokeWidth="1" />
                                  <text x={lMidX} y={lMidY + 22} textAnchor="middle" fontSize="11" fontWeight="600" fill="#10B981">{lLabel}</text>
                                  <text x={lMidX} y={lMidY + 40} textAnchor="middle" fontSize="10" fill="#94A3B8">uzunluk</text>
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                                  <div>
                                    <div className="mb-1.5 text-[11px] font-semibold text-[#64748B]">Genişlik</div>
                                    <div className="flex items-center rounded-lg ring-1 ring-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:ring-[#3B82F6] transition-colors">
                                      <span className="pl-2.5 text-[#94A3B8]"><Box className="h-3.5 w-3.5" /></span>
                                      <MeasurementInput value={pkg.widthCm} onChange={v => setPackageItems(prev => prev.map(p => p.id === pkg.id ? {...p, widthCm: v} : p))} placeholder="0" className="flex-1 h-10 text-[13px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 bg-transparent px-2 outline-none placeholder:text-[#CBD5E1]" />
                                      <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">cm</span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="mb-1.5 text-[11px] font-semibold text-[#64748B]">Uzunluk</div>
                                    <div className="flex items-center rounded-lg ring-1 ring-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:ring-[#3B82F6] transition-colors">
                                      <span className="pl-2.5 text-[#94A3B8]"><Box className="h-3.5 w-3.5 rotate-90" /></span>
                                      <MeasurementInput value={pkg.lengthCm} onChange={v => setPackageItems(prev => prev.map(p => p.id === pkg.id ? {...p, lengthCm: v} : p))} placeholder="0" className="flex-1 h-10 text-[13px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 bg-transparent px-2 outline-none placeholder:text-[#CBD5E1]" />
                                      <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">cm</span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="mb-1.5 text-[11px] font-semibold text-[#64748B]">Yükseklik</div>
                                    <div className="flex items-center rounded-lg ring-1 ring-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:ring-[#3B82F6] transition-colors">
                                      <span className="pl-2.5 text-[#94A3B8]"><Box className="h-3.5 w-3.5" /></span>
                                      <MeasurementInput value={pkg.heightCm} onChange={v => setPackageItems(prev => prev.map(p => p.id === pkg.id ? {...p, heightCm: v} : p))} placeholder="0" className="flex-1 h-10 text-[13px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 bg-transparent px-2 outline-none placeholder:text-[#CBD5E1]" />
                                      <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">cm</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                  <div>
                                    <div className="mb-1.5 text-[11px] font-semibold text-[#64748B]">Ağırlık</div>
                                    <div className="flex items-center rounded-lg ring-1 ring-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:ring-[#3B82F6] transition-colors">
                                      <span className="pl-2.5 text-[#94A3B8]"><Package className="h-3.5 w-3.5" /></span>
                                      <MeasurementInput value={pkg.weightKg} onChange={v => setPackageItems(prev => prev.map(p => p.id === pkg.id ? {...p, weightKg: v} : p))} placeholder="0" className="flex-1 h-10 text-[13px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 bg-transparent px-2 outline-none placeholder:text-[#CBD5E1]" />
                                      <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">kg</span>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="mb-1.5 text-[11px] font-semibold text-[#64748B]">Adet</div>
                                    <div className="flex items-center rounded-lg ring-1 ring-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:ring-[#3B82F6] transition-colors">
                                      <span className="pl-2.5 text-[#94A3B8]"><Package className="h-3.5 w-3.5" /></span>
                                      <NumericInput value={pkg.packageCount} onChange={v => setPackageItems(prev => prev.map(p => p.id === pkg.id ? {...p, packageCount: v} : p))} placeholder="1" className="flex-1 h-10 text-[13px] font-semibold border-0 ring-0 bg-transparent px-2 outline-none placeholder:text-[#CBD5E1]" />
                                      <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">adet</span>
                                    </div>
                                  </div>
                                </div>
                                {(pw > 0 || pl > 0 || ph > 0 || pkgActual > 0) && (
                                  <div className="rounded-xl bg-[#F8FAFC] ring-1 ring-[#E2E8F0] p-3">
                                    <div className="grid grid-cols-2 gap-3">
                                      <div className={cn("rounded-xl p-3 ring-1", !isVolHigher ? "bg-white ring-[#10B981]/30" : "bg-white ring-[#E2E8F0]")}>
                                        <div className="text-[10px] text-[#94A3B8] mb-1 flex items-center gap-1">
                                          <Package className="h-3 w-3" /> Tartı Ağırlığı
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[16px] font-bold text-[#0F172A]">{(pkgActual * pkgCount).toFixed(1)} kg</span>
                                          {!isVolHigher && <CheckCircle2 className="h-4 w-4 text-[#10B981]" />}
                                        </div>
                                      </div>
                                      <div className={cn("rounded-xl p-3 ring-1", isVolHigher ? "bg-white ring-[#10B981]/30" : "bg-white ring-[#E2E8F0]")}>
                                        <div className="text-[10px] text-[#94A3B8] mb-1 flex items-center gap-1">
                                          <Box className="h-3 w-3" /> Hacimsel Ağırlık
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-[16px] font-bold text-[#0F172A]">{(pkgVol * pkgCount).toFixed(1)} kg</span>
                                          {isVolHigher && <CheckCircle2 className="h-4 w-4 text-[#10B981]" />}
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
                  <div className="flex justify-center mt-4">
                    <button type="button" onClick={() => setPackageItems(prev => [...prev, { id: String(Date.now()), widthCm: "", lengthCm: "", heightCm: "", weightKg: "", packageCount: "1" }])} className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[#3959F2] hover:bg-[#4338CA] transition-colors">
                      <Plus className="h-4 w-4" /> Farklı Ölçüde Koli Ekle
                    </button>
                  </div>
                  
                  <div className="sticky bottom-4 z-40 mt-10">
                    <div className="bg-[#0F172A] text-white shadow-2xl rounded-2xl">
                      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                        <div className="flex items-center justify-between sm:block">
                          <div className="text-[13px] font-bold">Genel Toplam</div>
                          <div className="text-[11px] text-[#94A3B8]">{totalPkgCount} koli • {totalActual.toFixed(1)} kg</div>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:gap-6">
                          <div className="text-left sm:text-right">
                            <div className="text-[10px] text-[#94A3B8]">Ücretlendirme</div>
                            <div className="text-[20px] font-bold leading-tight">{chargeableW.toFixed(1)}kg</div>
                          </div>
                          <button 
                            onClick={async () => {
                               const pkgs = packageItems.map(p => ({ widthCm: Number(p.widthCm) || 0, lengthCm: Number(p.lengthCm) || 0, heightCm: Number(p.heightCm) || 0, weightKg: Number(p.weightKg) || 0, packageCount: Math.max(1, Number(p.packageCount) || 1) }));
                               if (pkgs.some(p => p.widthCm <= 0 || p.lengthCm <= 0 || p.heightCm <= 0 || p.weightKg <= 0)) { setForceError("Lütfen tüm paket boyutlarını ve ağırlıklarını eksiksiz girin."); return; }
                               setForceError(null);
                               setPackagesLoading(true);
                               try {
                                 await adminService.updatePackages(shipmentId, pkgs);
                                 setWizardStep(2);
                                 handleFetchCarriers(); // Step 2 is Fiyatlandırma now, need to fetch carriers here!
                               } catch (err: any) {
                                 setForceError(err.message || "Paketler kaydedilemedi.");
                               } finally {
                                 setPackagesLoading(false);
                               }
                            }}
                            disabled={packagesLoading}
                            className="flex items-center gap-2 rounded-xl bg-[#3959F2] hover:bg-[#4338CA] px-5 py-2.5 text-[13px] font-bold text-white transition-colors disabled:opacity-50"
                          >
                            {packagesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Devam →"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  </CardContent>
                </Card>
                );
              })()}

              {/* STEP 4: Gümrük (Proforma) Beyanı */}
              {wizardStep === 4 && (
                <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                  <div>
                    <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">Gümrük (Proforma) Beyanı</h2>
                    <p className="mt-1 text-sm text-slate-500">Gönderinizin içerik bilgilerini gümrük için İngilizce olarak girin.</p>
                  </div>

                  <div className="flex items-start gap-3 rounded-2xl bg-[#F8FAFC] p-4 text-sm text-slate-600">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-amber-500 text-amber-500 bg-white">
                      <AlertTriangle className="h-3 w-3" strokeWidth={2.5} />
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900">HS Kodu (GTİP) zorunludur</span><br />
                      <span className="text-[13px] text-slate-500">Eksik veya hatalı bilgiler gümrükte gecikmeye neden olabilir.</span>
                    </div>
                  </div>

                  {/* Genel Bilgiler */}
                  <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="text-[17px] font-bold text-slate-900 mb-6">Genel Bilgiler</div>
                    <div className="grid gap-x-4 gap-y-5 grid-cols-1 sm:grid-cols-[2fr_1fr_1.5fr]">
                      {/* Gönderi İçeriği */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-slate-700 mt-1">Gönderi İçeriği <span className="text-red-500 text-sm ml-0.5">*</span></label>
                        <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all", !proformaDescription && forceError?.includes("proforma") ? "border-red-500 bg-red-50/30 ring-2 ring-red-100" : "border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                          <Box className="mr-3 h-4 w-4 text-slate-400 shrink-0" />
                          <SearchableSelect
                            options={descriptionTypes.map(dt => ({ label: dt.label, value: dt.label }))}
                            value={proformaDescription}
                            onChange={v => setProformaDescription(v as string)}
                            placeholder="Örn: Tekstil ürünleri, elektronik, aksesuar..."
                            className="flex-1 border-0 ring-0 shadow-none bg-transparent p-0 text-[14px] font-medium text-slate-700 focus:ring-0 placeholder:text-slate-400"
                            hideSearchAndSort
                          />
                        </div>
                      </div>

                      {/* Para Birimi */}
                      <div className="flex flex-col gap-2">
                         <label className="text-[12px] font-bold text-slate-700 mt-1">Para Birimi <span className="text-red-500 text-sm ml-0.5">*</span></label>
                         <div className={cn("flex h-[52px] items-center p-1.5 gap-1 rounded-2xl border-[1.5px] overflow-hidden border-slate-300 bg-slate-50/50")}>
                          {(["EUR", "USD", "GBP"] as const).map((curr) => (
                            <button key={curr} type="button" onClick={() => setProformaCurrency(curr)}
                              className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-[12px] h-full transition-all text-[13px] font-bold", proformaCurrency === curr ? "bg-[#0B1527] text-white shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600")}>
                              <span className={cn("flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] border", proformaCurrency === curr ? "border-white/20" : "border-slate-200 bg-white")}>
                                {curr === "EUR" ? "€" : curr === "USD" ? "$" : "£"}
                              </span>
                              {curr}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* IOSS/VAT */}
                      <div className="flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-slate-700 mt-1">IOSS / VAT Numarası</label>
                        <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                          <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full border border-slate-200 bg-[#F8FAFC] text-[11px] font-medium text-slate-500 shrink-0 mr-3">#</span>
                          <Input value={proformaIOSS} onChange={e => setProformaIOSS(e.target.value)} placeholder="Örn: IM0000000123 veya EU372000000" className="flex-1 border-0 ring-0 shadow-none bg-transparent p-0 text-[14px] font-medium text-slate-700 focus:ring-0 placeholder:text-slate-400" />
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                          <span className="font-semibold text-slate-500">IOSS</span>: Yalnızca <span className="font-semibold">AB ülkelerine</span> yapılan ve değeri <span className="font-semibold">150€&apos;yu geçmeyen</span> gönderilerde kullanılır.
                        </p>
                      </div>

                      {/* Teslim Şekli (Incoterm) */}
                      <div className="sm:col-span-full flex flex-col gap-2 mt-2">
                        <label className="text-[12px] font-bold text-slate-700 mt-1">Teslim Şekli (Incoterm) <span className="text-red-500 text-sm ml-0.5">*</span></label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {([
                            { value: "H" as const, label: "DAP", title: "Delivered At Place", desc: "Gümrük vergi ve masrafları alıcı tarafından ödenir. (Kapıda veya online ödeme)" },
                            { value: "D" as const, label: "DDP", title: "Delivered Duty Paid", desc: "Gümrük vergi ve masrafları gönderici tarafından ödenir. (Fiyata dahildir)" },
                          ]).map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setCustomsType(opt.value)}
                              className={cn(
                                "relative flex flex-col rounded-2xl border-[1.5px] p-4 text-left transition-all",
                                customsType === opt.value
                                  ? "border-[#3959F2] bg-blue-50/60 ring-2 ring-[#3959F2]/20 shadow-sm"
                                  : "border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:shadow-sm"
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                  <div className={cn(
                                    "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                                    customsType === opt.value ? "border-[#3959F2] bg-[#3959F2]" : "border-slate-300 bg-white"
                                  )}>
                                    {customsType === opt.value && <Check className="h-3 w-3 text-white" />}
                                  </div>
                                  <span className="text-[15px] font-bold text-slate-900">{opt.label}</span>
                                  <span className="text-[11px] font-medium text-slate-400">({opt.title})</span>
                                </div>
                              </div>
                              <p className="mt-2 ml-[30px] text-[12px] leading-relaxed text-slate-500">{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ürün Kalemleri Listesi */}
                  <div className="space-y-4">
                    {proformaItems.map((item, idx) => (
                      <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-slate-100 text-[14px] font-bold text-slate-600">{idx + 1}</div>
                            <div className="text-[17px] font-bold text-slate-900 flex items-center gap-3">
                              Ürün Detayı 
                              <span className="text-[11px] font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">HS: {item.hsCode || "—"}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-[18px] font-bold text-slate-900 mr-2">
                              {getCurrencySymbol(proformaCurrency)}{(toNumber(item.qty) * toNumber(item.unitPrice)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                            {proformaItems.length > 1 && (
                              <button type="button" onClick={() => removeProformaItem(item.id)} className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full">
                                <Trash2 className="h-[18px] w-[18px]" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-x-4 gap-y-5 sm:grid-cols-12">
                          <div className="sm:col-span-12 lg:col-span-3 flex flex-col gap-2">
                            <label className="text-[12px] font-bold text-slate-700 mt-1">Menşei <span className="text-red-500 text-sm ml-0.5">*</span></label>
                            <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                              <Globe className="mr-3 h-4 w-4 text-slate-400 shrink-0" />
                              <SearchableSelect options={[{ label: "Türkiye", value: "TR" }]} value={item.origin} onChange={v => updateProformaItem(item.id, "origin", v as string)} hideSearchAndSort className="flex-1 border-0 ring-0 shadow-none bg-transparent p-0 text-[14px] font-medium text-slate-700 focus:ring-0" />
                            </div>
                          </div>

                          <div className="sm:col-span-12 lg:col-span-7 flex flex-col gap-2">
                            <label className="text-[12px] font-bold text-slate-700 mt-1">Ürün Detayı <span className="text-red-500 text-sm ml-0.5">*</span></label>
                            <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                              <Tag className="mr-3 h-4 w-4 text-slate-400 shrink-0" />
                              <Input value={item.desc} onChange={e => updateProformaItem(item.id, "desc", e.target.value)} placeholder="Lütfen detaylı olarak ürünün adını yazınız" className="flex-1 border-0 ring-0 shadow-none bg-transparent p-0 text-[14px] font-medium text-slate-700 focus:ring-0 placeholder:text-slate-400" />
                            </div>
                          </div>

                          <div className="sm:col-span-12 lg:col-span-2 flex flex-col gap-2">
                             <label className="text-[12px] font-bold text-slate-700 mt-1">Miktar <span className="text-red-500 text-sm ml-0.5">*</span></label>
                             <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all justify-between border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                              <NumericInput value={item.qty} onChange={v => updateProformaItem(item.id, "qty", v)} placeholder="4" className="w-[40px] border-0 ring-0 shadow-none bg-transparent p-0 text-[15px] font-semibold text-slate-700 focus:ring-0" />
                              <div className="flex flex-col gap-[2px] border-l border-slate-100 pl-2">
                                <button type="button" onClick={() => updateProformaItem(item.id, "qty", String(toNumber(item.qty) + 1))} className="flex h-[18px] w-[24px] items-center justify-center rounded-[6px] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-500 transition-colors"><ChevronUp className="h-3 w-3" /></button>
                                <button type="button" onClick={() => updateProformaItem(item.id, "qty", String(Math.max(1, toNumber(item.qty) - 1)))} className="flex h-[18px] w-[24px] items-center justify-center rounded-[6px] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-500 transition-colors"><ChevronDown className="h-3 w-3" /></button>
                              </div>
                            </div>
                          </div>

                          <div className="sm:col-span-12 lg:col-span-5 flex flex-col gap-2">
                            <label className="text-[12px] font-bold text-slate-700 mt-1">HS Kodu (GTİP) <span className="text-red-500 text-sm ml-0.5">*</span></label>
                            <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                              <span className="mr-3 font-medium text-slate-400 shrink-0">#</span>
                              <div className="flex-1 -ml-3">
                                <HSCodeCombobox value={item.hsCode} onChange={v => updateProformaItem(item.id, "hsCode", v)} productHint={item.desc} />
                              </div>
                            </div>
                          </div>

                           <div className="sm:col-span-12 lg:col-span-5 flex flex-col gap-2">
                            <label className="text-[12px] font-bold text-slate-700 mt-1">SKU</label>
                            <div className="flex items-center h-[52px] rounded-2xl border border-slate-200 px-4 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-shadow bg-white">
                              <Barcode className="mr-3 h-4 w-4 text-slate-400 shrink-0" />
                              <Input value={item.sku} onChange={e => updateProformaItem(item.id, "sku", e.target.value)} placeholder="Örn: Stok Kodu vb. (Opsiyonel)" className="flex-1 border-0 ring-0 shadow-none bg-transparent p-0 text-[14px] font-medium text-slate-700 focus:ring-0 placeholder:text-slate-400" />
                            </div>
                          </div>

                          <div className="sm:col-span-12 lg:col-span-2 flex flex-col gap-2">
                             <label className="text-[12px] font-bold text-slate-700 mt-1">Birim Fiyat ({getCurrencySymbol(proformaCurrency)}) <span className="text-red-500 text-sm ml-0.5">*</span></label>
                             <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all justify-between border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                              <DecimalInput value={item.unitPrice} onChange={v => updateProformaItem(item.id, "unitPrice", v)} placeholder="0.00" className="w-[60px] border-0 ring-0 shadow-none bg-transparent p-0 text-[15px] font-semibold text-slate-700 focus:ring-0" />
                              <div className="flex flex-col gap-[2px] border-l border-slate-100 pl-2">
                                <button type="button" onClick={() => updateProformaItem(item.id, "unitPrice", String(toNumber(item.unitPrice) + 1))} className="flex h-[18px] w-[24px] items-center justify-center rounded-[6px] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-500 transition-colors"><ChevronUp className="h-3 w-3" /></button>
                                <button type="button" onClick={() => updateProformaItem(item.id, "unitPrice", String(Math.max(0, toNumber(item.unitPrice) - 1)))} className="flex h-[18px] w-[24px] items-center justify-center rounded-[6px] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-500 transition-colors"><ChevronDown className="h-3 w-3" /></button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ═══════════ GÜMRÜK BELGELERİ YÜKLEME ALANI ═══════════ */}
                  <div className="mt-8 mb-6" id="customs-documents-section">
                    <div className={cn("flex items-center gap-2 mb-4 p-3 rounded-xl transition-all", docError ? "bg-red-50 ring-2 ring-red-300" : "")}>
                      <FileUp className={cn("h-5 w-5", docError ? "text-red-500" : "text-slate-500")} />
                      <h3 className={cn("text-[15px] font-semibold", docError ? "text-red-600" : "text-slate-800")}>Gümrük Belgeleri</h3>
                      {docUploadedFiles.length > 0 && <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold ml-1">{docUploadedFiles.length} belge yüklendi</span>}
                    </div>

                    <div className="mb-3">
                      <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">Belge Türü</label>
                      <div className="flex gap-2 flex-wrap">
                        {[{ value: "ETGB", label: "ETGB Belgesi", icon: FileCheck }, { value: "MSDS", label: "MSDS Belgesi", icon: ShieldAlert }, { value: "INVOICE", label: "Fatura", icon: Receipt }, { value: "OTHER", label: "Diğer", icon: FileIcon }].map(t => {
                          const Icon = t.icon;
                          return (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => setDocFileType(t.value)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all",
                              docFileType === t.value
                                ? "bg-[#3959F2] text-white border-[#3959F2] shadow-sm shadow-[#3959F2]/20"
                                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {t.label}
                          </button>
                          );
                        })}
                      </div>
                    </div>

                    <div
                      onDragOver={e => { e.preventDefault(); setDocDragOver(true); }}
                      onDragLeave={() => setDocDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDocDragOver(false); const file = e.dataTransfer.files?.[0]; if (file) { setDocError(null); setDocSuccess(null); if (file.size > 25*1024*1024) { setDocError("Dosya boyutu 25MB'dan büyük olamaz."); return; } setDocUploadedFiles(prev => [...prev, { id: crypto.randomUUID(), name: file.name, type: docFileType, url: URL.createObjectURL(file), size: file.size, file: file }]); setDocSuccess(`"${file.name}" eklendi, gönderi tamamlanınca yüklenecek.`); setTimeout(() => setDocSuccess(null), 4000); } }}
                      onClick={() => !docUploading && docInputRef.current?.click()}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-8 cursor-pointer transition-all",
                        docDragOver
                          ? "border-[#3959F2] bg-[#3959F2]/5"
                          : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50",
                        docUploading && "pointer-events-none opacity-60"
                      )}
                    >
                      <input ref={docInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.webp" onChange={e => { const file = e.target.files?.[0]; if (file) { setDocError(null); setDocSuccess(null); if (file.size > 25*1024*1024) { setDocError("Dosya boyutu 25MB'dan büyük olamaz."); return; } setDocUploadedFiles(prev => [...prev, { id: crypto.randomUUID(), name: file.name, type: docFileType, url: URL.createObjectURL(file), size: file.size, file: file }]); setDocSuccess(`"${file.name}" eklendi, gönderi tamamlanınca yüklenecek.`); setTimeout(() => setDocSuccess(null), 4000); } e.target.value = ""; }} />
                      {docUploading ? (
                        <>
                          <Loader2 className="h-8 w-8 animate-spin text-[#3959F2]" />
                          <p className="text-[13px] font-medium text-slate-600">Belge yükleniyor...</p>
                        </>
                      ) : (
                        <>
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                            <UploadCloud className="h-6 w-6 text-slate-400" />
                          </div>
                          <div className="text-center">
                            <p className="text-[13px] font-medium text-slate-700">Dosyayı sürükleyip bırakın veya <span className="text-[#3959F2] font-semibold">seçin</span></p>
                            <p className="text-[11px] text-slate-400 mt-1">PDF, DOC, XLS, JPG — maks. 25 MB</p>
                          </div>
                        </>
                      )}
                    </div>

                    {docError && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-[12px] text-red-700 ring-1 ring-red-100">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {docError}
                      </div>
                    )}
                    {docSuccess && (
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-[12px] text-emerald-700 ring-1 ring-emerald-100">
                        <CheckCircle className="h-4 w-4 shrink-0" />
                        {docSuccess}
                      </div>
                    )}

                    {docUploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Yüklenen Belgeler ({docUploadedFiles.length})</p>
                        {docUploadedFiles.map((f) => (
                          <div key={f.id} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-100 shadow-sm relative group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
                              <FileUp className="h-4 w-4 text-sky-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-medium text-slate-700 truncate">{f.name}</p>
                              <p className="text-[11px] text-slate-400">{f.type} • {f.size < 1024 ? f.size + " B" : f.size < 1024*1024 ? (f.size/1024).toFixed(1) + " KB" : (f.size/(1024*1024)).toFixed(1) + " MB"}</p>
                            </div>
                            <button onClick={() => setDocUploadedFiles(p => p.filter(x => x.id !== f.id))} className="text-slate-400 hover:text-red-500 bg-white shadow-sm ring-1 ring-slate-200 hover:bg-red-50 p-2 rounded-lg transition-colors absolute right-4 opacity-0 group-hover:opacity-100">
                               <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                    <button type="button" onClick={() => setWizardStep(3)} className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-[14px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                      <ArrowLeftIcon className="h-4 w-4" /> Geri Dön
                    </button>
                    
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                      <button type="button" onClick={addProformaItem} className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                        <Plus className="h-4 w-4" /> Yeni Ürün Ekle
                      </button>
                      <button 
                        type="button" 
                        onClick={async () => {
                           if (!proformaDescription) {
                             setForceError("Lütfen proforma açıklamasını girin."); return;
                           }
                           if (proformaItems.some(i => !i.desc || !i.qty || !i.unitPrice || !i.hsCode || !i.origin)) {
                               setForceError("Lütfen tüm proforma kalemlerinin içerik, miktar, HS kodu ve birim fiyatlarını girin."); return;
                           }
                           setForceError(null);
                           
                           try {
                             setForceLoading(true);
                             await adminService.updateDraft(shipmentId, {
                                step: 4,
                                proformaDescription,
                                proformaCurrency,
                                proformaIOSS,
                                customsType,
                                proformaItems: proformaItems.map(item => ({
                                  productDescription: item.desc,
                                  hsCode: item.hsCode,
                                  sku: item.sku,
                                  quantity: toNumber(item.qty),
                                  unitPrice: toNumber(item.unitPrice),
                                  originCountry: item.origin
                                }))
                             });

                             // Yüklenen belgeleri de API'ye gönder (Eğer varsa)
                             if (docUploadedFiles.length > 0) {
                                await Promise.all(
                                  docUploadedFiles.map(f => adminService.uploadDocument(f.file, shipmentId, f.type))
                                );
                             }

                           } catch (e: any) {
                             setForceError(e.message || "Proforma veya belgeler kaydedilemedi");
                             setForceLoading(false);
                             return;
                           }
                           setForceLoading(false);
                           setWizardStep(5); // Go to Onay
                        }} 
                        disabled={forceLoading}
                        className="flex flex-1 sm:flex-none items-center justify-center gap-2 rounded-xl bg-[#3959F2] hover:bg-[#4338CA] px-8 py-3 text-[14px] font-bold text-white transition-colors shadow-sm shadow-[#4F46E5]/20 disabled:opacity-50"
                      >
                        {forceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Devam <ArrowRight className="h-4 w-4" /></>}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Fiyatlandırma (Kargo Seçenekleri) */}
              {wizardStep === 2 && (
                <Card className="animate-in fade-in slide-in-from-right-4">
                  <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <CardTitle>Fiyatlandırma</CardTitle>
                      <p className="mt-1 text-sm text-muted">Aşağıdaki firmalardan birini seçerek gönderinizi oluşturabilirsiniz.</p>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                      <button type="button" onClick={() => setWizardStep(1)} className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 sm:px-6 py-2 sm:py-3 text-[12px] sm:text-[14px] font-bold text-[#0F172A] transition-colors shadow-sm">
                        <span>←</span> Geri
                      </button>
                      <button 
                        type="button" 
                        onClick={async () => {
                           if (!selectedCarrier) { setForceError("Lütfen bir kargo firması seçin."); return; }
                           setForceError(null);
                           
                           try {
                             setForceLoading(true);
                             await adminService.updateDraft(shipmentId, { step: 2, selectedCarrierId: selectedCarrier.carrierId, hasInsurance: false });
                           } catch(e: any) {
                             setForceError(e.message || "Fiyatlandırma kaydedilemedi");
                             setForceLoading(false);
                             return;
                           }
                           setForceLoading(false);
                           setWizardStep(3); // Go to Adres
                        }} 
                        disabled={!selectedCarrier || carriersLoading || forceLoading} 
                        className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#3959F2] hover:bg-[#4338CA] px-3 sm:px-6 py-2 sm:py-3 text-[12px] sm:text-[14px] font-bold text-white transition-colors disabled:opacity-50"
                      >
                        {forceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Devam <span>→</span></>}
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                  {carriersLoading ? (
                     <div className="flex flex-col items-center justify-center p-10 bg-slate-50 rounded-xl">
                        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin mb-3" />
                        <p className="text-sm font-medium text-slate-600">Kargo seçenekleri hesaplanıyor...</p>
                        <p className="text-xs text-slate-400 mt-1">Lütfen bekleyin</p>
                     </div>
                  ) : carrierOptions ? (
                     <div className="space-y-4">
                       <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kargo Firmasını Seçin</h4>
                       
                       {carrierOptions.domestic?.length > 0 && (
                         <div className="space-y-2">
                           <div className="text-[10px] font-bold text-amber-600 uppercase">Yurt İçi Kargo Seçenekleri</div>
                           {carrierOptions.domestic.map((c: any, i: number) => (
                             <div key={`d-${i}`} onClick={() => setSelectedCarrier(c)} className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${selectedCarrier?.carrierId === c.carrierId && selectedCarrier?.type === "domestic" ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                               <div className="flex items-center gap-3">
                                 <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-700 text-xs font-bold">{c.carrierName?.slice(0, 2)?.toUpperCase()}</div>
                                 <div>
                                   <div className="text-xs font-bold text-slate-800">{c.carrierName}</div>
                                   <div className="text-[10px] text-slate-400">{c.deliveryLabel} • Desi: {c.desiKg}</div>
                                 </div>
                               </div>
                               <div className="text-right">
                                 <div className="text-sm font-bold text-slate-900">{c.priceTry?.toFixed(2)} ₺</div>
                               </div>
                             </div>
                           ))}
                         </div>
                       )}

                       {carrierOptions.international?.length > 0 && (
                         <div className="space-y-2">
                           <div className="text-[10px] font-bold text-blue-600 uppercase">Yurt Dışı Kargo Seçenekleri</div>
                           {carrierOptions.international.map((c: any, i: number) => (
                             <div key={`i-${i}`} onClick={() => setSelectedCarrier(c)} className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${selectedCarrier?.carrierId === c.carrierId && selectedCarrier?.type === "international" ? "border-emerald-400 bg-emerald-50 ring-2 ring-emerald-200" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}>
                               <div className="flex items-center gap-3">
                                 {c.logoUrl ? (
                                   <img src={`${process.env.NEXT_PUBLIC_API_URL}/api/carriers/${c.carrierId}/logo`} alt="" className="h-9 w-9 rounded-lg object-contain bg-white" />
                                 ) : (
                                   <div className="flex h-9 w-9 items-center justify-center rounded-lg text-white text-xs font-bold" style={{ backgroundColor: c.logoColor || "#6366f1" }}>{c.logoLetter || c.carrierName?.slice(0, 2)?.toUpperCase()}</div>
                                 )}
                                 <div>
                                   <div className="text-xs font-bold text-slate-800">{c.carrierName} — {c.serviceName}</div>
                                   <div className="text-[10px] text-slate-400">{c.deliveryLabel}</div>
                                 </div>
                               </div>
                               <div className="text-right">
                                 <div className="text-sm font-bold text-slate-900">{c.priceTry?.toFixed(2)} ₺</div>
                                 {c.currency !== "TRY" && <div className="text-[10px] text-slate-400">{c.price?.toFixed(2)} {c.currency}</div>}
                               </div>
                             </div>
                           ))}
                         </div>
                       )}

                       {(carrierOptions.international?.length === 0 && carrierOptions.domestic?.length === 0) && (
                         <div className="rounded-xl bg-slate-50 p-6 text-center">
                           <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                           <p className="text-sm font-bold text-slate-700">Kargo seçeneği bulunamadı</p>
                           <p className="text-xs text-slate-500 mt-1">Bu rota veya paket ölçüleri için uygun kargo firması yok.</p>
                         </div>
                       )}
                     </div>
                  ) : null}
                  </CardContent>
                </Card>
              )}

              {/* STEP 5: Onay ve Oluşturma */}
              {wizardStep === 5 && (() => {
                 const totalPkgCount = packageItems.reduce((s, p) => s + Math.max(1, Number(p.packageCount) || 1), 0);
                 const totalActualWeight = packageItems.reduce((s, p) => s + (Number(p.weightKg) || 0) * Math.max(1, Number(p.packageCount) || 1), 0);
                 const totalVolumetricWeight = packageItems.reduce((s, p) => { const w=Number(p.widthCm)||0, l=Number(p.lengthCm)||0, h=Number(p.heightCm)||0; return s + ((w*l*h)/5000) * Math.max(1, Number(p.packageCount)||1); }, 0);
                 
                 const senderCountryName = apiCountries.find(x => x.value === senderForm.country)?.name || senderForm.country || "Türkiye";
                 const receiverCountryName = apiCountries.find(x => x.value === receiverForm.country)?.name || receiverForm.country || "Bilinmiyor";
                 
                 return (
                 <div className="flex flex-col items-center py-8">
                   <div className="w-full max-w-[800px] animate-in fade-in duration-500 pb-16">
                     {/* Top Info */}
                     <div className="mb-6 flex flex-col gap-1">
                       <button type="button" onClick={() => setWizardStep(4)} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-400 hover:text-slate-600 w-fit mb-2 transition-colors">
                         <ArrowLeft className="h-3.5 w-3.5" /> Geri Dön
                       </button>
                       <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Gönderi Onayı</h2>
                       <p className="text-[14px] text-slate-500 font-medium">Bilgilerinizi gözden geçirin ve gönderiyi onaylayın.</p>
                     </div>

                     {/* Route Banner */}
                     <div className="w-full bg-[#1F2937] rounded-[16px] px-4 sm:px-6 py-4 mb-8 shadow-sm relative overflow-hidden">
                       <div className="flex sm:hidden items-center justify-between gap-3">
                         <div className="flex items-center gap-2.5 min-w-0 flex-1">
                           <img src={`https://flagcdn.com/w80/${(senderForm.country || "TR").toLowerCase()}.png`} alt="TR" className="w-[32px] h-[22px] rounded-[4px] object-cover ring-2 ring-white/10 shrink-0" />
                           <div className="flex flex-col min-w-0">
                             <span className="text-[9px] font-medium text-white/50 uppercase tracking-wider">Çıkış</span>
                             <span className="text-[13px] font-bold text-white truncate">{senderCountryName}</span>
                           </div>
                         </div>
                         <div className="flex flex-col items-center shrink-0 px-1">
                           <Plane className="w-4 h-4 text-white/40 mb-0.5" />
                           <span className="text-[9px] text-white/40 font-medium">{totalActualWeight.toFixed(1)} kg</span>
                         </div>
                         <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end">
                           <div className="flex flex-col items-end min-w-0">
                             <span className="text-[9px] font-medium text-white/50 uppercase tracking-wider">Varış</span>
                             <span className="text-[13px] font-bold text-white truncate">{receiverCountryName}</span>
                           </div>
                           <img src={`https://flagcdn.com/w80/${(receiverForm.country || "ES").toLowerCase()}.png`} alt="ES" className="w-[32px] h-[22px] rounded-[4px] object-cover ring-2 ring-white/10 shrink-0" />
                         </div>
                       </div>
                       <div className="hidden sm:flex items-center justify-between">
                         <div className="flex items-center gap-4 relative z-10 w-1/3">
                           <img src={`https://flagcdn.com/w80/${(senderForm.country || "TR").toLowerCase()}.png`} alt="TR" className="w-[42px] h-[30px] rounded-[6px] object-cover ring-2 ring-white/10" />
                           <div className="flex flex-col">
                             <span className="text-[12px] font-medium text-white/50 relative -bottom-0.5">Çıkış</span>
                             <span className="text-[16px] font-bold text-white tracking-wide">{senderCountryName}</span>
                           </div>
                         </div>
                         <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                           <Plane className="w-5 h-5 text-white/50 mb-1" />
                           <span className="text-[11px] font-medium text-white/40">Kargo Ağırlığı <strong className="text-white/80 font-bold ml-1">{totalActualWeight.toFixed(2)} kg</strong></span>
                         </div>
                         <div className="flex items-center gap-4 justify-end relative z-10 w-1/3">
                           <div className="flex flex-col items-end">
                             <span className="text-[12px] font-medium text-white/50 relative -bottom-0.5">Varış</span>
                             <span className="text-[16px] font-bold text-white tracking-wide">{receiverCountryName}</span>
                           </div>
                           <img src={`https://flagcdn.com/w80/${(receiverForm.country || "ES").toLowerCase()}.png`} alt="ES" className="w-[42px] h-[30px] rounded-[6px] object-cover ring-2 ring-white/10" />
                         </div>
                       </div>
                     </div>

                     {/* Details Section */}
                     <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] p-6 sm:p-8 relative">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-1">
                         <h3 className="text-[16px] sm:text-[18px] font-bold text-slate-800">Gönderi Detayları</h3>
                         <span className="text-[11px] sm:text-[13px] font-medium text-slate-400 tracking-wide">Aşağıdaki bilgilerin doğruluğunu kontrol edin</span>
                       </div>

                       <div className="relative pb-16">
                           <div className="absolute left-[23px] top-[24px] bottom-[24px] w-[1px] bg-slate-100 z-0"></div>

                           <div className="flex flex-col gap-10">
                             {/* Tür */}
                             <div className="flex items-start gap-5 relative z-10">
                               <div className="w-[48px] h-[48px] rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm relative z-10">
                                 <Package className="w-5 h-5 text-[#D97706]" strokeWidth={1.5} />
                               </div>
                               <div className="flex flex-col pt-1">
                                 <span className="text-[12px] font-medium text-slate-400 mb-0.5">Gönderi Türü</span>
                                 <span className="text-[15px] font-bold text-slate-800">{shipmentType === 'Belge' ? 'Evrak / Belge' : 'Paket'}</span>
                               </div>
                             </div>

                             {/* Fiyatlandırma */}
                             <div className="flex items-start justify-between relative z-10">
                               <div className="flex items-start gap-5">
                                 <div className="w-[48px] h-[48px] rounded-full bg-[#EFF6FF] border border-[#DBEAFE] flex items-center justify-center shrink-0 shadow-sm relative z-10">
                                   <Box className="w-5 h-5 text-[#3B82F6]" strokeWidth={1.5} />
                                 </div>
                                 <div className="flex flex-col pt-1">
                                   <span className="text-[12px] font-medium text-slate-400 mb-0.5">Ölçüler ve Fiyatlandırma</span>
                                   <span className="text-[15px] font-bold text-slate-800">{totalVolumetricWeight > totalActualWeight ? totalVolumetricWeight.toFixed(1) : totalActualWeight.toFixed(1)} kg üzerinden ücretlendirme</span>
                                 </div>
                               </div>
                               <div className="h-8 rounded-full border border-slate-200 bg-white px-3 flex items-center gap-1.5 shadow-sm mt-1">
                                 <Box className="w-3.5 h-3.5 text-slate-400" />
                                 <span className="text-[12px] font-bold text-slate-600">{totalPkgCount} {shipmentType.toLowerCase()}</span>
                               </div>
                             </div>

                             {/* Kargo */}
                             <div className="flex items-start justify-between relative z-10">
                               <div className="flex items-start gap-5">
                                 <div className="w-[48px] h-[48px] rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm relative z-10 overflow-hidden p-[2px]">
                                   {selectedCarrier?.logoUrl ? <img src={`${process.env.NEXT_PUBLIC_API_URL}/api/carriers/${selectedCarrier.carrierId}/logo`} className="w-[32px] h-[32px] object-contain rounded" /> : <span className="font-bold text-slate-700">{selectedCarrier?.carrierName?.slice(0, 2)?.toUpperCase()}</span>}
                                 </div>
                                 <div className="flex flex-col pt-1">
                                   <span className="text-[12px] font-medium text-slate-400 mb-0.5">Kargo Firması</span>
                                   <span className="text-[15px] font-bold text-slate-800">{selectedCarrier?.carrierName || "Kargo"} — {selectedCarrier?.serviceName || "Standart"}</span>
                                 </div>
                               </div>
                               <div className="h-8 rounded-full border border-slate-200 bg-white px-3 flex items-center gap-1.5 shadow-sm mt-1">
                                 <Plane className="w-3.5 h-3.5 text-slate-400" />
                                 <span className="text-[12px] font-bold text-slate-600">{selectedCarrier?.deliveryLabel || "1-2 iş günü"}</span>
                               </div>
                             </div>

                             {/* Yurt İçi Kargo (if applicable) */}
                             {selectedDomesticHandler && (
                               <div className="flex items-start justify-between relative z-10">
                                 <div className="flex items-start gap-5">
                                   <div className="w-[48px] h-[48px] rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 shadow-sm relative z-10">
                                     <Truck className="w-5 h-5 text-orange-500" strokeWidth={1.5} />
                                   </div>
                                   <div className="flex flex-col pt-1">
                                     <span className="text-[12px] font-medium text-slate-400 mb-0.5">Yurt İçi Transfer Firması</span>
                                     <span className="text-[15px] font-bold text-slate-800">{selectedDomesticHandler}</span>
                                   </div>
                                 </div>
                               </div>
                             )}

                             {/* Gönderici -> Alıcı */}
                             <div className="flex items-start gap-5 relative z-10">
                               <div className="w-[48px] h-[48px] rounded-full bg-black flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.1)] relative z-10">
                                 <ArrowRight className="w-5 h-5 text-white -rotate-45" strokeWidth={2.5} />
                               </div>
                               <div className="flex flex-col pt-1">
                                 <span className="text-[12px] font-medium text-slate-400 mb-0.5 flex items-center">Gönderici <ArrowRight className="w-3 h-3 mx-1 opacity-50" /> Alıcı</span>
                                 <span className="text-[15px] font-bold text-slate-800 flex items-center">
                                   {senderForm.name || "Gönderici"}
                                   <ArrowRight className="w-4 h-4 text-slate-400 mx-2" />
                                   {receiverForm.name || "Alıcı"}
                                 </span>
                               </div>
                             </div>
                           </div>
                       </div>
                     </div>
                     
                     {/* Action Bar Float */}
                     <div className="bg-[#3B5FE5] w-full rounded-[16px] px-6 py-5 shadow-[0_12px_40px_-12px_rgba(59,95,229,0.7)] flex flex-col sm:flex-row items-center justify-between mt-[-56px] relative z-30">
                       <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                         <div className="w-[42px] h-[42px] bg-white/10 rounded-xl border border-white/20 flex items-center justify-center backdrop-blur-sm p-1 shrink-0">
                           {selectedCarrier?.logoUrl ? <img src={`${process.env.NEXT_PUBLIC_API_URL}/api/carriers/${selectedCarrier.carrierId}/logo`} className="w-7 h-7 object-contain rounded" /> : <Package className="text-white w-5 h-5" />}
                         </div>
                         <div className="flex flex-col">
                           <span className="text-white font-bold text-[15px] tracking-wide">{selectedCarrier?.carrierName || "Kargo"} - {selectedCarrier?.serviceName || "Standart"}</span>
                           <div className="flex items-center gap-1.5 text-white/80 text-[12px] font-medium mt-0.5">
                             <Package className="w-3.5 h-3.5" /> Teslimat: <span className="font-bold text-white">{selectedCarrier?.deliveryLabel || "1-2 iş günü"}</span>
                           </div>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-5 shrink-0 relative">
                         {forceError && <div className="absolute top-[-40px] right-0 text-red-500 font-bold text-sm bg-white px-3 py-1 rounded shadow-sm">{forceError}</div>}
                         <div className="text-[26px] font-black tracking-tighter text-white mb-0.5 leading-none">
                           {selectedCarrier?.priceTry?.toFixed(2)} ₺
                         </div>
                         <button 
                           type="button" 
                           onClick={handleForceCreate}
                           disabled={forceLoading}
                           className="h-[44px] px-5 sm:px-6 bg-[#A3E635] hover:bg-[#84cc16] text-[#14532D] rounded-[12px] flex items-center gap-2 font-bold text-[14px] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(163,230,53,0.3)]"
                         >
                           {forceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Gönderiyi Oluştur <ArrowRight className="w-4 h-4 stroke-[2.5]" /></>}
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
                 );
              })()}
            </div>
          )}
        </div>
      )}

      {forceSuccess && (
        <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 p-5 ring-1 ring-emerald-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-800">Kargo Başarıyla Oluşturuldu ✅</h3>
              <p className="text-xs text-emerald-600 mt-0.5">Gönderi ödendi olarak işaretlendi ve kargo entegrasyonları başlatıldı.</p>
            </div>
          </div>
        </div>
      )}

      {(data.trackingCode || data.domestic?.trackingCode) && (
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm space-y-4">
           <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Barcode className="h-4 w-4 text-indigo-500" /> Kargo Takip Numaraları ve Entegrasyon Detayları</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {data.domestic?.trackingCode && (
               <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 mb-1 uppercase tracking-wider"><Truck className="h-3.5 w-3.5" /> Yurt İçi Kargo</div>
                  <div className="text-[13px] font-medium text-slate-600 mb-3">Kargo Firması: <span className="font-bold text-slate-900">{data.domestic.carrier}</span></div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-sky-100 shadow-sm">
                    <span className="font-mono text-[15px] font-bold text-slate-800">{data.domestic.trackingCode}</span>
                    <button onClick={() => navigator.clipboard.writeText(data.domestic.trackingCode)} title="Kopyala" className="text-sky-500 hover:text-sky-700 transition-colors p-1.5 bg-sky-50 rounded-md hover:bg-sky-100"><Copy className="h-4 w-4"/></button>
                  </div>
               </div>
             )}
             {data.trackingCode && (
               <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 uppercase tracking-wider"><Plane className="h-3.5 w-3.5" /> Yurt Dışı Kargo</div>
                    <div className="flex items-center gap-2">
                      {data.ptsLogs?.[0]?.pdfUrl && (
                        <a href={data.ptsLogs[0].pdfUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1.5 rounded-md border border-indigo-100 transition-colors flex items-center gap-1.5 shadow-sm">
                          <FileText className="w-3.5 h-3.5" /> PTS Etiketi
                        </a>
                      )}
                      {(data.assetLogs?.[0]?.assetReference || data.carrierId?.includes('asset') || data.carrierName?.toLowerCase()?.includes('asset')) && data.trackingCode && (
                        <button onClick={() => handleDownloadAssetLabel(data.assetLogs?.[0]?.assetReference || data.trackingCode)} disabled={assetLabelLoading} className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1.5 rounded-md border border-indigo-100 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50">
                          {assetLabelLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                          Asset Etiketi
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-[13px] font-medium text-slate-600 mb-4 space-y-1.5 flex-1">
                    <div>Entegrasyon Servisi: <span className="font-bold text-slate-900">{data.carrierName} {data.serviceName ? `- ${data.serviceName}` : ''} <span className="text-emerald-600 bg-emerald-100/50 px-1.5 py-0.5 rounded text-[11px]">{(data.carrierId?.includes('pts') || data.ptsLogs?.length > 0) ? 'PTS' : (data.carrierId?.includes('asset') || data.assetLogs?.length > 0) ? 'ASSET' : 'DİĞER'}</span></span></div>
                    
                    {data.ptsLogs && data.ptsLogs.length > 0 ? (
                      <div>PTS AWB: <span className="font-semibold text-slate-800">{data.ptsLogs[0].awb || "Belirtilmedi"}</span></div>
                    ) : (data.carrierId?.includes('pts') ? (
                      <div>PTS AWB: <span className="font-semibold text-amber-600">Bekleniyor / İşleniyor...</span></div>
                    ) : null)}

                    {data.assetLogs && data.assetLogs.length > 0 ? (
                      <>
                        <div>Asset Ref: <span className="font-semibold text-slate-800">{data.assetLogs[0].assetReference || "Belirtilmedi"}</span></div>
                        <div>Supplier Ref: <span className="font-semibold text-slate-800">{data.assetLogs[0].supplierReference || "Henüz atanmamış"}</span></div>
                      </>
                    ) : (data.carrierId?.includes('asset') ? (
                      <>
                        <div>Asset Ref: <span className="font-semibold text-amber-600">Bekleniyor / İşleniyor...</span></div>
                        <div>Supplier Ref: <span className="font-semibold text-amber-600">Bekleniyor...</span></div>
                      </>
                    ) : null)}
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-emerald-100 shadow-sm mt-auto">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-emerald-600/70 font-semibold uppercase tracking-wider mb-0.5">Zalusa (AWB)</span>
                      <span className="font-mono text-[15px] font-bold text-slate-800">{data.trackingCode}</span>
                    </div>
                    <button onClick={() => navigator.clipboard.writeText(data.trackingCode)} title="Kopyala" className="text-emerald-500 hover:text-emerald-700 transition-colors p-1.5 bg-emerald-50 rounded-md hover:bg-emerald-100"><Copy className="h-4 w-4"/></button>
                  </div>
               </div>
             )}
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">        {/* Adres Bilgileri */}
        <div className="lg:col-span-2 rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 ring-1 ring-indigo-100"><User className="h-4 w-4 text-indigo-500" /></div>
              <h3 className="text-sm font-bold text-slate-900">Adres Bilgileri</h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-mono font-semibold text-slate-600">{senderForm.country || data.senderCountry}</span>
              <ChevronRight className="h-4 w-4 text-indigo-400" />
              <span className="font-mono font-semibold text-slate-600">{receiverForm.country || data.receiverCountry}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="p-6">
              <span className="inline-flex h-5 items-center rounded-full bg-indigo-50 px-2 text-[10px] font-bold text-indigo-600 uppercase tracking-wider ring-1 ring-indigo-100 mb-4">Gonderici</span>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-bold shadow-md">
                  {(senderForm.name || data.senderName || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate">{senderForm.name || data.senderName || "-"}</div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Phone className="h-3 w-3 shrink-0 text-slate-400" /><span className="font-mono">{senderForm.phone || data.senderPhone || "-"}</span></div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3 w-3 shrink-0 text-slate-400" /><span className="truncate">{senderForm.address || data.senderAddress || "-"}</span></div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Globe className="h-3 w-3 shrink-0 text-slate-400" /><span>{[senderForm.city || data.senderCity, senderForm.town, senderForm.country || data.senderCountry].filter(Boolean).join(", ") || "-"}</span></div>
                  {(senderForm.postal) && <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Hash className="h-3 w-3 shrink-0 text-slate-400" /><span className="font-mono font-medium">{senderForm.postal}</span></div>}
                </div>
              </div>
            </div>
            <div className="p-6">
              <span className="inline-flex h-5 items-center rounded-full bg-emerald-50 px-2 text-[10px] font-bold text-emerald-600 uppercase tracking-wider ring-1 ring-emerald-100 mb-4">Alici</span>
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-md">
                  {(receiverForm.name || data.receiverName || "?").split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 truncate">{receiverForm.name || data.receiverName || "-"}</span>
                    {data.receiverCompany && <span className="inline-flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500"><Building2 className="h-2.5 w-2.5" /> {data.receiverCompany}</span>}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Phone className="h-3 w-3 shrink-0 text-slate-400" /><span className="font-mono">{receiverForm.phone || data.receiverPhone || "-"}</span></div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><MapPin className="h-3 w-3 shrink-0 text-slate-400" /><span className="truncate">{receiverForm.address || data.receiverAddress || "-"}</span></div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Globe className="h-3 w-3 shrink-0 text-slate-400" /><span>{[receiverForm.city || data.receiverCity, receiverForm.town || data.receiverState, receiverForm.country || data.receiverCountry].filter(Boolean).join(", ") || "-"}</span></div>
                  {(receiverForm.postal || data.receiverPostal) && <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Hash className="h-3 w-3 shrink-0 text-slate-400" /><span className="font-mono font-medium">{receiverForm.postal || data.receiverPostal}</span></div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Paket Detaylari */}
        <Section title="Paket Detaylari" icon={Box}>
          {data.packages && data.packages.length > 0 ? (
            <div className="overflow-hidden rounded-xl ring-1 ring-slate-100">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">#</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Boyut (cm)</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Agirlik</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Desi</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Adet</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {data.packages.map((pkg: any, i: number) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-slate-500">{i + 1}</td>
                      <td className="px-3 py-2 font-mono text-slate-700">{pkg.widthCm} x {pkg.lengthCm} x {pkg.heightCm}</td>
                      <td className="px-3 py-2 text-slate-700">{pkg.weightKg} kg</td>
                      <td className="px-3 py-2 text-slate-700">{pkg.volWeight?.toFixed(1)} kg</td>
                      <td className="px-3 py-2 text-slate-700">{pkg.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (<p className="text-xs text-slate-400">Paket bilgisi yok</p>)}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-slate-50 p-2 text-center"><div className="text-[10px] text-slate-400">Gercek</div><div className="text-xs font-bold text-slate-700">{data.actualWeight?.toFixed(1)} kg</div></div>
            <div className="rounded-lg bg-slate-50 p-2 text-center"><div className="text-[10px] text-slate-400">Hacimsel</div><div className="text-xs font-bold text-slate-700">{data.volumetricWeight?.toFixed(1)} kg</div></div>
            <div className="rounded-lg bg-indigo-50 p-2 text-center"><div className="text-[10px] text-indigo-400">Ucretlendirme</div><div className="text-xs font-bold text-indigo-700">{data.chargeableWeight?.toFixed(1)} kg</div></div>
          </div>
        </Section>

        {/* Fiyatlandirma */}
        <Section title="Fiyatlandirma" icon={CreditCard}>
          <div className="space-y-2">
            <div className="flex justify-between py-1.5 border-b border-slate-50"><span className="text-xs text-slate-500">Kargo Firmasi Fiyati</span><span className="text-xs font-semibold text-slate-700">{data.carrierPrice?.toFixed(2)} {data.carrierCurrency}</span></div>
            <div className="flex justify-between py-1.5 border-b border-slate-50"><span className="text-xs text-slate-500">TL Karsiligi</span><span className="text-xs font-semibold text-slate-700">{data.carrierPriceTry?.toFixed(2)} TL</span></div>
            {data.originalPriceTry > 0 && <div className="flex justify-between py-1.5 border-b border-slate-50"><span className="text-xs text-slate-500">Orijinal Fiyat</span><span className="text-xs font-semibold text-slate-700">{data.originalPriceTry?.toFixed(2)} TL</span></div>}
            {data.discountAmountTry > 0 && <div className="flex justify-between py-1.5 border-b border-slate-50"><span className="text-xs text-emerald-600">Indirim</span><span className="text-xs font-semibold text-emerald-600">-{data.discountAmountTry?.toFixed(2)} TL</span></div>}
            {data.hasInsurance && <div className="flex justify-between py-1.5 border-b border-slate-50"><span className="text-xs text-slate-500 flex items-center gap-1"><Shield className="h-3 w-3" /> Sigorta</span><span className="text-xs font-semibold text-slate-700">{data.insuranceCost?.toFixed(2)} TL</span></div>}
            <div className="flex justify-between py-2 bg-indigo-50 rounded-lg px-3 mt-2"><span className="text-sm font-bold text-indigo-700">Toplam</span><span className="text-sm font-bold text-indigo-700">{data.carrierPriceTry?.toFixed(2)} TL</span></div>
            {data.paidAt && <div className="text-[11px] text-emerald-600 flex items-center gap-1 mt-1"><CheckCircle2 className="h-3 w-3" /> Odendi: {fmt(data.paidAt)}</div>}
          </div>
        </Section>

        {/* Kargo Firmasi */}
        <Section title="Kargo Firmasi" icon={Truck}>
          <div className="space-y-1">
            <InfoRow icon={Truck} label="Firma" value={data.carrierName} />
            <InfoRow icon={Tag} label="Servis" value={data.serviceName} />
            <InfoRow icon={Hash} label="Carrier ID" value={data.carrierId} mono />
            {data.contentDescription && <InfoRow icon={FileText} label="Icerik Aciklamasi" value={data.contentDescription} />}
            {data.note && <InfoRow icon={FileText} label="Not" value={data.note} />}
          </div>
        </Section>

        {/* Proforma */}
        {data.proformaItems && data.proformaItems.length > 0 && (
          <Section title="Proforma Fatura" icon={FileText}>
            <div className="overflow-hidden rounded-xl ring-1 ring-slate-100">
              <table className="w-full text-xs">
                <thead><tr className="border-b border-slate-100 bg-slate-50">
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Urun</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">HS Kodu</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Adet</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Birim Fiyat</th>
                  <th className="px-3 py-2 text-left font-semibold text-slate-600">Toplam</th>
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {data.proformaItems.map((item: any, i: number) => (
                    <tr key={i}>
                      <td className="px-3 py-2 text-slate-700">{item.description}</td>
                      <td className="px-3 py-2 font-mono text-slate-500">{item.hsCode || "-"}</td>
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
            {data.proformaIOSS && <div className="mt-1 text-[11px] text-slate-400">IOSS: {data.proformaIOSS}</div>}
          </Section>
        )}

        {/* Havale */}
        {data.bankTransfer && (
          <Section title="Havale/EFT Bilgisi" icon={Banknote}>
            <div className="space-y-1">
              <InfoRow icon={Hash} label="Transfer ID" value={`#${data.bankTransfer.id}`} mono />
              <InfoRow icon={CreditCard} label="Tutar" value={`${data.bankTransfer.amount?.toFixed(2)} TL`} />
              <InfoRow icon={FileText} label="Aciklama" value={data.bankTransfer.description} />
              <InfoRow icon={Clock} label="Bildirim Tarihi" value={fmt(data.bankTransfer.createdAt)} />
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
                  data.bankTransfer.status === "approved" ? "bg-emerald-50 text-emerald-600 ring-emerald-200" :
                  data.bankTransfer.status === "rejected" ? "bg-red-50 text-red-500 ring-red-200" :
                  "bg-amber-50 text-amber-600 ring-amber-200"
                }`}>
                  {data.bankTransfer.status === "approved" ? "Onaylandi" : data.bankTransfer.status === "rejected" ? "Reddedildi" : "Bekliyor"}
                </span>
              </div>
              {data.bankTransfer.adminNote && <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{data.bankTransfer.adminNote}</div>}
            </div>
          </Section>
        )}

        {/* Yurt Ici Kargo */}
        {data.domestic && (
          <Section title="Yurt Ici Kargo Detayi" icon={Truck}>
            <div className="space-y-1">
              <InfoRow icon={Truck} label="Kargo Firmasi" value={data.domestic.carrier} />
              <InfoRow icon={Hash} label="Takip No" value={data.domestic.trackingCode} mono />
              <InfoRow icon={Hash} label="Siparis ID" value={data.domestic.orderId} mono />
              <InfoRow icon={CreditCard} label="API Maliyet" value={`${data.domestic.costApi?.toFixed(2)} TL`} />
              <InfoRow icon={CreditCard} label="Satis Fiyati" value={`${data.domestic.costMarkup?.toFixed(2)} TL`} />
              <div className="mt-2 flex justify-between bg-emerald-50 rounded-lg px-3 py-2">
                <span className="text-xs font-bold text-emerald-600">Kar</span>
                <span className="text-xs font-bold text-emerald-700">{data.domestic.profit?.toFixed(2)} TL</span>
              </div>
            </div>
          </Section>
        )}
        {/* Taslak Durumu */}
        {data.draftInfo && (
          <div className="lg:col-span-2">
            <Section title="Taslak Durumu" icon={Clock}>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-700">Mevcut Adim: <span className="text-indigo-600">{data.draftInfo.currentStepName}</span></span>
                    <span className="text-xs font-bold text-indigo-600">%{data.draftInfo.progressPercent} Tamamlandi</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-3 rounded-full transition-all duration-500" style={{ width: `${data.draftInfo.progressPercent}%` }}></div>
                  </div>
                  <div className="flex justify-between mt-1 text-[11px] text-slate-400">
                    <span>{data.draftInfo.filledFieldCount || 0} / {data.draftInfo.totalFieldCount || 0} alan dolduruldu</span>
                    <span>Adim {data.draftInfo.completedSteps} / {data.draftInfo.totalSteps}</span>
                  </div>
                </div>
                {data.draftInfo.steps && data.draftInfo.steps.map((step: any, idx: number) => (
                  <div key={idx} className={`rounded-xl border p-4 ${idx === data.draftInfo.completedSteps ? 'border-indigo-300 bg-indigo-50/50 ring-1 ring-indigo-200' : step.completed ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-slate-50/30 opacity-60'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${idx === data.draftInfo.completedSteps ? 'bg-indigo-600 text-white' : step.completed ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-white'}`}>
                        {step.completed ? '\u2713' : idx + 1}
                      </div>
                      <span className={`text-sm font-bold ${idx === data.draftInfo.completedSteps ? 'text-indigo-700' : step.completed ? 'text-emerald-700' : 'text-slate-500'}`}>
                        {step.name}
                        {idx === data.draftInfo.completedSteps && <span className="ml-2 inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">Su anda burada</span>}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                      {step.fields.map((field: any, fi: number) => (
                        <div key={fi} className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${field.filled ? 'bg-white ring-1 ring-emerald-200' : 'bg-white ring-1 ring-red-200'}`}>
                          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${field.filled ? 'bg-emerald-500 text-white' : 'bg-red-400 text-white'}`}>
                            {field.filled ? '\u2713' : '\u2717'}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="text-[10px] text-slate-400 uppercase tracking-wider">{field.label}</div>
                            <div className={`truncate font-medium ${field.filled ? 'text-slate-700' : 'text-red-400 italic'}`}>{field.filled ? (field.value || 'Girildi') : 'Bos'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* Kullanici Detaylari */}
        {data.userPhone && (
          <Section title="Kullanici Detaylari" icon={User}>
            <div className="space-y-1">
              <InfoRow icon={User} label="Ad Soyad" value={data.userName} />
              <InfoRow icon={Mail} label="E-posta" value={data.userEmail} />
              <InfoRow icon={Phone} label="Telefon" value={data.userPhone} />
              {data.userKind && <InfoRow icon={Tag} label="Hesap Tipi" value={data.userKind === 'individual' ? 'Bireysel' : 'Kurumsal'} />}
              {data.userCustomerId && <InfoRow icon={Hash} label="Musteri No" value={data.userCustomerId} mono />}
              <div className="mt-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${data.userIsActive ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' : 'bg-red-50 text-red-500 ring-red-200'}`}>
                  {data.userIsActive ? 'Aktif Hesap' : 'Pasif Hesap'}
                </span>
              </div>
            </div>
          </Section>
        )}

        {/* PTS Loglari */}
        {data.ptsLogs && data.ptsLogs.length > 0 && (
          <div className="lg:col-span-2">
            <Section title="PTS Entegrasyon Loglari" icon={Truck}>
              <div className="overflow-hidden rounded-xl ring-1 ring-slate-100">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">AWB</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Servis</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">HTTP</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Durum</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Tarih</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.ptsLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td className="px-3 py-2 font-mono text-slate-700">{log.awb || '-'}</td>
                        <td className="px-3 py-2 text-slate-600">{log.serviceCode}</td>
                        <td className="px-3 py-2 font-mono text-slate-500">{log.httpStatus}</td>
                        <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${log.success ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{log.success ? 'Basarili' : 'Hata'}</span></td>
                        <td className="px-3 py-2 text-slate-400">{fmt(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        )}

        {/* Asset Loglari */}
        {data.assetLogs && data.assetLogs.length > 0 && (
          <div className="lg:col-span-2">
            <Section title="Asset Entegrasyon Loglari" icon={Truck}>
              <div className="overflow-hidden rounded-xl ring-1 ring-slate-100">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-slate-100 bg-slate-50">
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Takip No</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Asset Ref</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">BOL ID</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Durum</th>
                    <th className="px-3 py-2 text-left font-semibold text-slate-600">Tarih</th>
                  </tr></thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.assetLogs.map((log: any) => (
                      <tr key={log.id}>
                        <td className="px-3 py-2 font-mono text-slate-700">{log.trackingCode || '-'}</td>
                        <td className="px-3 py-2 font-mono text-slate-600">{log.assetReference || '-'}</td>
                        <td className="px-3 py-2 text-slate-500">{log.billOfLadingId || '-'}</td>
                        <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${log.status === 'success' || log.status === 'created' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>{log.status || '-'}</span></td>
                        <td className="px-3 py-2 text-slate-400">{fmt(log.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        )}

        {/* Belgeler */}
        {data.attachments && data.attachments.length > 0 && (
          <Section title="Ekli Belgeler" icon={FileText}>
            <div className="space-y-2">
              {data.attachments.map((att: any) => (
                <div key={att.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500"><FileText className="h-4 w-4" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{att.fileName}</p>
                      <p className="text-[11px] text-slate-400">{att.fileType?.toUpperCase()} - {(att.fileSize / 1024).toFixed(0)} KB - {fmt(att.createdAt)}</p>
                    </div>
                  </div>
                  {att.fileUrl && <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors shrink-0">Indir</a>}
                </div>
              ))}
            </div>
          </Section>
        )}

      </div>

      {/* ── Yurt İçi Kargo Seçim Modalı ──────────────────────────────────────────── */}
      {showDomesticSelection && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-violet-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-[17px] font-bold text-[#0F172A]">Yurt İçi Kargo Firması Seçin</h3>
                  <p className="text-[12px] text-[#64748B] mt-0.5">
                    Paketiniz önce İstanbul merkezimize transfer edilecektir. Size en uygun kargo firmasını seçin.
                  </p>
                </div>
              </div>
            </div>

            {/* Validation Error (Top of the modal) */}
            {domesticValidationError && (
              <div className="px-6 py-3 bg-red-50 border-b border-red-100 flex items-start gap-2.5 shrink-0 animate-in slide-in-from-top-2">
                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-500 text-[11px] font-bold">!</span>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-red-700">Kargo Firması Uygun Değil</p>
                  <p className="text-[12px] text-red-600 mt-0.5 leading-relaxed">{domesticValidationError}</p>
                </div>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {domesticLoading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                  <p className="text-sm text-slate-500">Kargo firmaları yükleniyor...</p>
                </div>
              ) : domesticCarriers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <AlertTriangle className="h-8 w-8 text-amber-500" />
                  <p className="text-sm text-slate-600 text-center">
                    Uygun kargo firması bulunamadı. Lütfen daha sonra tekrar deneyin.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {domesticCarriers.map((carrier) => (
                    <button
                      key={carrier.handlerCode}
                      type="button"
                      onClick={() => { setSelectedDomesticHandler(carrier.handlerCode); setDomesticValidationError(""); }}
                      className={cn(
                        "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150 text-left",
                        selectedDomesticHandler === carrier.handlerCode
                          ? "border-indigo-500 bg-indigo-50/50 shadow-sm"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      {/* Radio dot */}
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                        selectedDomesticHandler === carrier.handlerCode
                          ? "border-indigo-500 bg-indigo-500"
                          : "border-slate-300"
                      )}>
                        {selectedDomesticHandler === carrier.handlerCode && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>

                      {/* Logo */}
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {carrier.logoUrl ? (
                          <img src={carrier.logoUrl} alt={carrier.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="text-[14px] font-bold text-slate-500">
                            {carrier.handlerCode.slice(0, 2)}
                          </span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold text-[#0F172A] truncate">{carrier.name}</p>
                        <p className="text-[11px] text-[#94A3B8] mt-0.5">
                          {carrier.estimatedDays}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDomesticSelection(false);
                  setSelectedDomesticHandler("");
                }}
                className="rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-5 py-2.5 text-[13px] font-bold text-[#0F172A] transition-colors"
              >
                Geri Dön
              </button>
              <button
                type="button"
                disabled={!selectedDomesticHandler || domesticLoading}
                onClick={async () => {
                  if (!selectedDomesticHandler || !params.id) return;
                  try {
                    setDomesticLoading(true);
                    setDomesticValidationError("");
                    
                    const valResult = await adminService.validateDomesticCarrier({
                      shipmentId: String(params.id),
                      handlerCode: selectedDomesticHandler,
                      senderName: senderForm.name,
                      senderPhone: senderForm.phone,
                      senderCity: senderForm.city,
                      senderTown: senderForm.town || senderForm.postal,
                      senderAddress: senderForm.address,
                      receiverName: receiverForm.name,
                      receiverPhone: receiverForm.phone,
                      receiverCity: receiverForm.city,
                      receiverTown: receiverForm.town || receiverForm.postal,
                      receiverAddress: receiverForm.address,
                      isTransfer: senderForm.country === "TR" && !(senderForm.city?.toLowerCase().includes("istanbul") || senderForm.city === "34")
                    });
                    if (!valResult.valid) {
                      setDomesticValidationError(valResult.error || "Bu kargo firması güzergahınızı desteklemiyor. Lütfen başka bir firma seçin.");
                      setDomesticLoading(false);
                      return;
                    }
                    
                    setShowDomesticSelection(false);
                    setDomesticValidationError("");
                    setWizardStep(4);
                  } catch (err: any) {
                    setDomesticValidationError("Kargo firması doğrulanamadı: " + (err?.message || ""));
                  } finally {
                    setDomesticLoading(false);
                  }
                }}
                className={cn(
                  "rounded-xl px-6 py-2.5 text-[13px] font-bold text-white transition-all flex items-center gap-2",
                  selectedDomesticHandler
                    ? "bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                    : "bg-slate-300 cursor-not-allowed"
                )}
              >
                {domesticLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Devam Et
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}