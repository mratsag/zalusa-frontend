"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import {
  FileText, MapPin, Package, Ruler, BoxSelect, Star, Zap, BadgeDollarSign,
  Clock, Check, Info, Plane, Plus, Trash2, Search, User, Phone,
  MapPinned, Building, CheckCircle2, Tag, Receipt, ArrowRight,
  Save, Printer, Loader2, RotateCcw, X,
  FileSpreadsheet, ArrowLeft, AlertTriangle, Box, Globe, ChevronUp,
  ChevronDown, Barcode, UploadCloud, Calendar, Scale, PlusSquare, ArrowRightSquare, ArrowLeftSquare,
  FileUp, CheckCircle, File as FileIcon, Pencil
} from "lucide-react";
import { HSCodeCombobox } from "@/components/HSCodeCombobox";
import { Stepper } from "@/components/panel/stepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { NameInput } from "@/components/ui/name-input";
import { NumericInput } from "@/components/ui/numeric-input";
import { DecimalInput } from "@/components/ui/decimal-input";
import { MeasurementInput } from "@/components/ui/measurement-input";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { cn } from "@/lib/cn";
import { useAppState } from "@/hooks/useAppState";
import Image from "next/image";
import { ProformaItem, ShipmentDraft, PackageItem } from "@/lib/type";
import {
  shipmentService, addressService, measurementService, documentService, domesticService,
  type ApiCarrierQuote, type ApiAddress, type ApiMeasurement, type DomesticCarrierQuote
} from "@/lib/services/shipmentService";
import { CitySelect } from "@/components/ui/city-select";
import { StateSelect } from "@/components/ui/state-select";
import ProformaExcelUploader, { ParsedProformaRow } from "@/components/Proformaexceluploader";
import PackageExcelUploader, { ParsedPackageRow } from "@/components/Packageexceluploader";
import { adminService } from "@/lib/services/adminService";

// NOT: @/lib/type içindeki ShipmentDraft tipinde "quantity" alanını
// "packageCount" olarak güncellemeyi unutma!

const STEPS = ["Kargo Bilgileri", "Paket Ölçüleri", "Fiyatlandırma", "Adres Seçimi", "Gümrük (Proforma) Beyanı", "Tamamlandı"] as const;

const EMPTY_PROFORMA_ITEM: ProformaItem = { id: "", productDescription: "", hsCode: "", sku: "", quantity: "1", unitPrice: "", origin: "TR" };
const EMPTY_PACKAGE_ITEM: PackageItem = { id: "", widthCm: "", lengthCm: "", heightCm: "", weightKg: "", packageCount: "1", selectedPreset: "", saveMeasurement: false, measurementLabel: "" };

const DEFAULT_DRAFT: ShipmentDraft = {
  shipmentName: "", referenceCode: "", shipmentType: "Paket", contentDescription: "",
  hasInsurance: false, note: "", senderCountry: "TR", receiverCountry: "", receiverPostalCode: "",
  packages: [{ ...EMPTY_PACKAGE_ITEM, id: crypto.randomUUID() }],
  selectedCarrierId: "", carrierQuotes: [],
  selectedSenderAddressId: "sender-1", selectedReceiverAddressId: "",
  senderName: "", senderCompany: "", senderPhone: "+90", senderAddress: "", senderCity: "", senderTown: "", senderStateId: null, saveSenderAddress: false,
  receiverName: "", receiverCompany: "", receiverPhone: "", receiverAddress: "", receiverCity: "", receiverTown: "",
  receiverStateProvince: "", receiverAddressCountry: "", receiverAddressPostalCode: "",
  saveReceiverAddress: false,
  proformaDescription: "", proformaCurrency: "EUR", proformaIOSS: "", customsType: "H",
  proformaItems: [{ ...EMPTY_PROFORMA_ITEM, id: crypto.randomUUID() }],
  invoiceNo: "", invoiceDate: "", earchivePdfUrl: "",
  proformaFileName: "",
};

const RECEIVER_COUNTRIES = [
  { label: "Almanya (DE)", value: "DE" }, { label: "Hollanda (NL)", value: "NL" },
  { label: "Fransa (FR)", value: "FR" }, { label: "İngiltere (GB)", value: "GB" },
  { label: "Amerika Birleşik Devletleri (US)", value: "US" }, { label: "İtalya (IT)", value: "IT" },
  { label: "İspanya (ES)", value: "ES" }, { label: "Avusturya (AT)", value: "AT" },
];
const COUNTRY_NAMES: Record<string, string> = { TR: "Türkiye", DE: "Almanya", NL: "Hollanda", FR: "Fransa", GB: "İngiltere", US: "Amerika", IT: "İtalya", ES: "İspanya", AT: "Avusturya" };

function FlagDE({ className }: { className?: string }) { return <svg viewBox="0 0 5 3" className={className}><rect width="5" height="1" y="0" fill="#000"/><rect width="5" height="1" y="1" fill="#D00"/><rect width="5" height="1" y="2" fill="#FFCE00"/></svg>; }
function FlagFR({ className }: { className?: string }) { return <svg viewBox="0 0 3 2" className={className}><rect width="1" height="2" x="0" fill="#002395"/><rect width="1" height="2" x="1" fill="#FFF"/><rect width="1" height="2" x="2" fill="#ED2939"/></svg>; }
function FlagGB({ className }: { className?: string }) { return <svg viewBox="0 0 60 30" className={className}><rect width="60" height="30" fill="#012169"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/><path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" strokeWidth="4"/><path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/><path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/></svg>; }
function FlagUS({ className }: { className?: string }) { return <svg viewBox="0 0 190 100" className={className}><rect width="190" height="100" fill="#B22234"/>{[0,1,2,3,4,5,6].map(i=><rect key={i} y={i*15.38} width="190" height="7.69" fill="#FFF"/>)}<rect width="76" height="53.85" fill="#3C3B6E"/></svg>; }
function FlagIT({ className }: { className?: string }) { return <svg viewBox="0 0 3 2" className={className}><rect width="1" height="2" x="0" fill="#009246"/><rect width="1" height="2" x="1" fill="#FFF"/><rect width="1" height="2" x="2" fill="#CE2B37"/></svg>; }
function FlagES({ className }: { className?: string }) { return <svg viewBox="0 0 750 500" className={className}><rect width="750" height="500" fill="#AA151B"/><rect width="750" height="250" y="125" fill="#F1BF00"/></svg>; }
function FlagAT({ className }: { className?: string }) { return <svg viewBox="0 0 900 600" className={className}><rect width="900" height="200" y="0" fill="#ED2939"/><rect width="900" height="200" y="200" fill="#FFF"/><rect width="900" height="200" y="400" fill="#ED2939"/></svg>; }

const FLAG_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = { DE: FlagDE, FR: FlagFR, GB: FlagGB, US: FlagUS, IT: FlagIT, ES: FlagES, AT: FlagAT };

function CountryFlag({ code, size = "md" }: { code: string; size?: "sm" | "md" | "lg" }) {
  const F = FLAG_COMPONENTS[code];
  const s = { sm: "h-6 w-6", md: "h-10 w-10", lg: "h-14 w-14" };
  const d = s[size];
  if (code === "TR") return <div className={cn("shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md relative", d)}><Image src="/tr.png" alt="TR Flag" fill className="object-cover" /></div>;
  if (code === "NL") return <div className={cn("shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md relative", d)}><Image src="/netherlands.png" alt="NL Flag" fill className="object-cover" /></div>;
  if (code === "US") return <div className={cn("shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md relative", d)}><Image src="/us-flag.png" alt="US Flag" fill className="object-cover" /></div>;
  return <div className={cn("shrink-0 overflow-hidden rounded-full ring-2 ring-white shadow-md", d)}>{F ? <F className="h-full w-full object-cover scale-[1.6]" /> : <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs font-bold text-gray-500">{code}</div>}</div>;
}

function toNumber(v: string) { const n = Number(String(v).replace(",", ".")); return Number.isFinite(n) ? n : 0; }

// Carrier logo renk haritası (backend logoLetter'dan türetilir)
const CARRIER_LOGO_COLORS: Record<string, string> = {
  F: "bg-[#4D148C]", // FedEx
  U: "bg-[#351C15]", // UPS
  D: "bg-[#D40511]", // DHL
  M: "bg-[#E30613]", // MNG
  A: "bg-[#003B7A]", // Aras
  Y: "bg-[#00843D]", // Yurtiçi
  T: "bg-[#0033A0]", // TNT
};
function getLogoColor(q: ApiCarrierQuote): string {
  return q.logoColor || CARRIER_LOGO_COLORS[q.logoLetter] || "bg-slate-600";
}
function isHexColor(color: string): boolean {
  return color.startsWith("#");
}
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
function getLogoSrc(url: string): string {
  // data URI veya tam URL ise olduğu gibi döndür, relative path ise API_BASE ile prefix'le
  if (url.startsWith("data:") || url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}
function CarrierLogo({ q, size = "h-11 w-11", textSize = "text-sm" }: { q: ApiCarrierQuote; size?: string; textSize?: string }) {
  if (q.logoUrl) {
    // Görsel varsa: Admin paneldeki gibi açık arka plan kullan
    // (Kırmızı arka plan + kırmızı logo = görünmez oluyordu)
    return (
      <div
        className={cn("flex shrink-0 items-center justify-center rounded-full shadow-sm overflow-hidden", size)}
        style={{ backgroundColor: "#f8fafc" }}
      >
        <img src={getLogoSrc(q.logoUrl)} alt={q.carrierName} className="h-[70%] w-[70%] object-contain" />
      </div>
    );
  }
  
  // Görsel yoksa, sadece harf varsa eski mantık devam ediyor
  const color = getLogoColor(q);
  const hex = isHexColor(color);
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm", size, textSize, !hex && color)}
      style={hex ? { backgroundColor: color } : undefined}
    >
      {q.logoLetter}
    </div>
  );
}
function getCurrencySymbol(currency: string): string {
  if (currency === "EUR") return "€";
  if (currency === "GBP") return "£";
  return "$";
}

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

function RouteSummaryBar({ senderCountry, senderName, senderFlag, receiverCountry, receiverName, receiverFlag, chargeableWeight }: { senderCountry: string; senderName?: string; senderFlag?: string; receiverCountry: string; chargeableWeight: number; receiverName?: string; receiverFlag?: string }) {
  const flagImg = (src: string | undefined, code: string) => src
    ? <div className="shrink-0 overflow-hidden h-9 w-9 relative" style={{ borderRadius: 10 }}><img src={src} alt={code} className="w-full h-full object-cover" /></div>
    : <CountryFlag code={code} size="lg" />;
  return (
    <div className="flex items-center justify-between rounded-2xl p-3 sm:p-4 text-white" style={{ backgroundColor: "#3959F2", minHeight: 66, boxShadow: "0 0 0 1px rgba(0,0,0,0.02), 0 1px 3px 0 rgba(0,0,0,0.08)" }}>
      <div className="flex items-center gap-1.5 min-w-0 flex-1">{flagImg(senderFlag, senderCountry)}<div className="min-w-0"><div className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-white/50">Çıkış</div><div className="text-[11px] sm:text-[14px] font-bold leading-tight truncate">{senderName || (COUNTRY_NAMES[senderCountry] ?? senderCountry)}</div></div></div>
      <div className="flex items-center gap-1 sm:gap-2 shrink-0 px-1 sm:px-0"><div className="h-px w-3 sm:w-12 bg-white/20" /><div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[12px] text-white/50"><Plane className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" /><span className="hidden sm:inline">Kargo Ağırlığı </span><span className="font-semibold text-white/80">{chargeableWeight.toFixed(2)} kg</span></div><div className="h-px w-3 sm:w-12 bg-white/20" /></div>
      <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-end"><div className="text-right min-w-0"><div className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wider text-white/50">Varış</div><div className="text-[11px] sm:text-[14px] font-bold leading-tight truncate">{receiverName || COUNTRY_NAMES[receiverCountry] || receiverCountry}</div></div>{flagImg(receiverFlag, receiverCountry)}</div>
    </div>
  );
}

/* ── Shipment type descriptions for Step 0 ── */
const SHIPMENT_TYPE_META: Record<string, { icon: React.ComponentType<{ className?: string }>; description: string; badge?: string; emoji: string }> = {
  Belge: { icon: FileText,  description: "Evrak / sözleşme / fatura", emoji: "📄" },
  Paket: { icon: Package, description: "Küçük ürün gönderileri", badge: "En çok tercih edilen", emoji: "📦" },
  Koli:  { icon: BoxSelect,  description: "Büyük hacimli gönderiler", emoji: "📦" },
};

/* ── Pending draft info type (for the resume banner) ── */
type PendingDraftInfo = {
  shipmentId: number;
  currentStep: number;
  shipmentType?: string;
  receiverCountry?: string;
  receiverPostalCode?: string;
  rawDraft: any; // Full draft response from API
};
export const descriptionTypeService = {
  async list(): Promise<{ types: { id: number; label: string }[] }> {
    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
    const res = await fetch(`${API_BASE}/api/shipment-description-types`);
    if (!res.ok) throw new Error("Gönderi açıklama tipleri alınamadı");
    return res.json();
  },
};




// Bayrak URL helper
function getFlagImageUrl(code: string, size: number = 40): string {
  const upper = code.toUpperCase();
  if (upper === "US" || upper === "ABD") return "/us-flag.png";
  if (upper === "IK") return "/ik-flag.png";
  return `https://flagcdn.com/w${size}/${code.toLowerCase()}.png`;
}

// Admin mode ile paylaşılabilir props
export interface ShipmentWizardProps {
  adminMode?: boolean;
  adminUserId?: number;
  adminUserName?: string;
}

export function ShipmentWizardCore({ adminMode, adminUserId }: ShipmentWizardProps) {
  const { hydrated } = useAppState();
  const searchParams = useSearchParams();
  const urlDraftId = adminMode ? null : searchParams.get("draft");

  // ── API Adapters: adminMode ise admin service, değilse user service kullanır ──
  const api = React.useMemo(() => ({
    createDraft: (payload: { shipmentType: "Belge" | "Paket" | "Koli"; receiverCountry: string; receiverPostalCode: string }) =>
      adminMode && adminUserId
        ? adminService.createDraftForUser(adminUserId, payload)
        : shipmentService.createDraft(payload),
    getDraft: () =>
      adminMode && adminUserId
        ? adminService.getDraftForUser(adminUserId)
        : shipmentService.getDraft(),
    updateDraft: (id: number, step: number, payload: Record<string, unknown>) =>
      adminMode
        ? adminService.updateDraft(id, { step, ...payload })
        : shipmentService.updateDraft(id, step, payload),
    getQuotes: (payload: any) =>
      adminMode
        ? adminService.getQuotesAdmin(payload)
        : shipmentService.getQuotes(payload),
    listAddresses: () =>
      adminMode && adminUserId
        ? adminService.getUserAddresses(adminUserId)
        : addressService.list(),
    createAddress: (payload: any) =>
      adminMode && adminUserId
        ? adminService.createUserAddress(adminUserId, payload)
        : addressService.create(payload),
    updateAddress: (id: number, payload: any) =>
      adminMode && adminUserId
        ? adminService.updateUserAddress(adminUserId, id, payload)
        : addressService.update(id, payload),
    deleteAddress: (id: number) =>
      adminMode && adminUserId
        ? adminService.deleteUserAddress(adminUserId, id)
        : addressService.delete(id),
    listMeasurements: () =>
      adminMode && adminUserId
        ? adminService.getUserMeasurements(adminUserId)
        : measurementService.list(),
    createMeasurement: (payload: any) =>
      adminMode && adminUserId
        ? adminService.createUserMeasurement(adminUserId, payload)
        : measurementService.create(payload),
    uploadDocument: (file: File, shipmentId: number | string, fileType: string) =>
      adminMode && adminUserId
        ? adminService.uploadDocumentForUser(adminUserId, file, shipmentId, fileType)
        : documentService.upload(file, shipmentId, fileType),
    listAttachments: (shipmentId: number | string) =>
      adminMode && adminUserId
        ? adminService.listShipmentAttachmentsForUser(adminUserId, shipmentId)
        : documentService.list(shipmentId),
    getDomesticPrices: (pkgs: any[], shipmentId: number | null) =>
      adminMode
        ? adminService.getDomesticPrices({ packages: pkgs, shipmentId: shipmentId || 0 })
        : domesticService.getPrices(pkgs, shipmentId),
    validateDomesticCarrier: (shipmentId: string, handlerCode: string) =>
      adminMode
        ? adminService.validateDomesticCarrier({ shipmentId, handlerCode })
        : domesticService.validateCarrier(shipmentId, handlerCode),
    forceCreate: (shipmentId: number, payload: any) =>
      adminService.forceCreateShipment(shipmentId, payload),
  }), [adminMode, adminUserId]);

  const [step, setStep] = React.useState(0);
  const [draft, setDraft] = React.useState<ShipmentDraft>(DEFAULT_DRAFT);
  const [shipmentId, setShipmentId] = React.useState<number | null>(null);
  const [done, setDone] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);
  // ── Domestic Transfer State ─────────────────────────────────────────────────
  const [requiresDomesticTransfer, setRequiresDomesticTransfer] = React.useState(false);
  const [domesticTrackingCode, setDomesticTrackingCode] = React.useState<string>("");
  const [domesticCarrierCompany, setDomesticCarrierCompany] = React.useState<string>("");
  const [createdShipmentTrackingCode, setCreatedShipmentTrackingCode] = React.useState<string>("");
  // ── Domestic Carrier Selection (Yurt İçi Kargo Seçimi) ─────────────────────
  const [domesticCarriers, setDomesticCarriers] = React.useState<DomesticCarrierQuote[]>([]);
  const [selectedDomesticHandler, setSelectedDomesticHandler] = React.useState<string>("");
  const [domesticLoading, setDomesticLoading] = React.useState(false);
  const [showDomesticSelection, setShowDomesticSelection] = React.useState(false);
  const [domesticValidationError, setDomesticValidationError] = React.useState("");
  const [domesticSelfShipping, setDomesticSelfShipping] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});
  const [errorModal, setErrorModal] = React.useState<{ title: string; message: string } | null>(null);
  const [showNewSenderForm, setShowNewSenderForm] = React.useState(false);
  const [editingSenderAddr, setEditingSenderAddr] = React.useState<ApiAddress | null>(null);
  const [editSenderBusy, setEditSenderBusy] = React.useState(false);
  const [showNewReceiverForm, setShowNewReceiverForm] = React.useState(false);
  const [editingReceiverAddr, setEditingReceiverAddr] = React.useState<ApiAddress | null>(null);
  const [editReceiverBusy, setEditReceiverBusy] = React.useState(false);
  const [showServicesModal, setShowServicesModal] = React.useState(false);
  const [senderSearch, setSenderSearch] = React.useState("");
  const [receiverSearch, setReceiverSearch] = React.useState("");
  const [receiverHasStates, setReceiverHasStates] = React.useState(true);
  const [apiCountries, setApiCountries] = React.useState<any[]>([]);
  const [apiQuotes, setApiQuotes] = React.useState<ApiCarrierQuote[]>([]);
  const [quotesMessage, setQuotesMessage] = React.useState<string | null>(null);
  const [apiAddresses, setApiAddresses] = React.useState<ApiAddress[]>([]);
  const [apiMeasurements, setApiMeasurements] = React.useState<ApiMeasurement[]>([]);
const [showProformaExcel, setShowProformaExcel] = React.useState(false);
const [descriptionTypes, setDescriptionTypes] = React.useState<{ id: number; label: string }[]>([]);
  // console.log("apiQuotes", apiQuotes)
  // ── Taslak banner state'leri ──────────────────────────────────────────────
  const [pendingDraft, setPendingDraft] = React.useState<PendingDraftInfo | null>(null);
  const [draftBannerDismissed, setDraftBannerDismissed] = React.useState(false);
  const [draftLoading, setDraftLoading] = React.useState(!!urlDraftId);
const [showPackageExcel, setShowPackageExcel] = React.useState(false);
  const [showMoreCarriers, setShowMoreCarriers] = React.useState(true);
  // ── PTS Etiket State ───────────────────────────────────────────────────
  const [labelLoading, setLabelLoading] = React.useState(false);
  const [labelData, setLabelData] = React.useState<{ integrationType: string; awb?: string; pdfUrl?: string; reference?: string; supplierRef?: string; hasLabel: boolean; message?: string } | null>(null);
  const [labelError, setLabelError] = React.useState<string | null>(null);
  const [addressTab, setAddressTab] = React.useState<"sender" | "receiver">("sender");

  // ── Adım Geçiş Toast ──
  const [stepToast, setStepToast] = React.useState<{ step: number; visible: boolean } | null>(null);
  const stepToastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const STEP_TOAST_MESSAGES: Record<number, { title: string; desc: string }> = {
    0: { title: "1. Adım Tamam!", desc: "Kargo bilgileri girildi, sırada paket ölçüleri." },
    1: { title: "2. Adım Tamam!", desc: "Paket ölçüleri belirlendi, sırada fiyatlandırma." },
    2: { title: "3. Adım Tamam!", desc: "Kargo firması seçildi, sırada adres seçimi." },
    3: { title: "4. Adım Tamam!", desc: "Adresler girildi, sırada gümrük beyanı." },
    4: { title: "5. Adım Tamam!", desc: "Gönderi tamamlandı, harika!" },
  };
  function showStepToast(completedStep: number) {
    if (stepToastTimer.current) clearTimeout(stepToastTimer.current);
    setStepToast({ step: completedStep, visible: true });
    stepToastTimer.current = setTimeout(() => {
      setStepToast(prev => prev ? { ...prev, visible: false } : null);
      setTimeout(() => setStepToast(null), 400);
    }, 3000);
  }

  // ── Posta Kodu Lookup ──
  const [postalLookupLoading, setPostalLookupLoading] = React.useState(false);
  const [postalLookupResult, setPostalLookupResult] = React.useState<{ city: string; countryCode: string; countryName: string } | null>(null);
  const [postalLookupError, setPostalLookupError] = React.useState<string | null>(null);
  const postalLookupTimer = React.useRef<NodeJS.Timeout | null>(null);

  // Posta kodu değiştiğinde 800ms debounce ile lookup yap
  React.useEffect(() => {
    const code = draft.receiverPostalCode?.trim();
    const country = draft.receiverCountry;
    setPostalLookupResult(null);
    setPostalLookupError(null);

    if (!code || code.length < 3) return;

    if (postalLookupTimer.current) clearTimeout(postalLookupTimer.current);
    postalLookupTimer.current = setTimeout(async () => {
      setPostalLookupLoading(true);
      try {
        const params = new URLSearchParams({ code });
        if (country) params.set("country", country);
        const res = await fetch(`${API_BASE}/api/postal-lookup?${params}`);
        const data = await res.json();
        if (data.results && data.results.length > 0) {
          const match = data.results[0];
          setPostalLookupResult({ city: match.city, countryCode: match.countryCode, countryName: match.countryName });
          setPostalLookupError(null);
        } else {
          setPostalLookupResult(null);
          setPostalLookupError("Bu posta kodu için sonuç bulunamadı");
        }
      } catch {
        setPostalLookupError("Posta kodu sorgulanamadı");
      } finally {
        setPostalLookupLoading(false);
      }
    }, 800);

    return () => { if (postalLookupTimer.current) clearTimeout(postalLookupTimer.current); };
  }, [draft.receiverPostalCode, draft.receiverCountry]);

  // ── Gümrük Belgeleri Yükleme State'leri ──
  const [docFileType, setDocFileType] = React.useState("INVOICE");
  const [docUploading] = React.useState(false);
  const [docUploadedFiles, setDocUploadedFiles] = React.useState<any[]>([]);
  const [docDragOver, setDocDragOver] = React.useState(false);
  const [docError, setDocError] = React.useState<string | null>(null);
  const [docSuccess, setDocSuccess] = React.useState<string | null>(null);
  const docInputRef = React.useRef<HTMLInputElement>(null);
  // ── Ülkeler (kendi backend'imizden + Türkçe isimler + flagcdn.com bayrakları) ─
  React.useEffect(() => {
    // Türkçe ülke adı çevirici (tarayıcı yerleşik API)
    const trNames = new Intl.DisplayNames(["tr"], { type: "region" });

    const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
    fetch(`${API_BASE}/api/countries`)
      .then(res => res.json())
      .then((data: { isoCode: string; phoneCode?: string; countryName: string }[]) => {
        if (!Array.isArray(data)) return;
        const mapped = data.map((c) => {
          const code = c.isoCode.toUpperCase();
          // Tarayıcı API'si ile Türkçe ad al; yoksa backend adını kullan
          let trName = c.countryName;
          try { trName = trNames.of(code) || c.countryName; } catch {}
          // ABD bayrağı için yerel dosya kullan (flagcdn "ABD" kodunu tanımıyor)
          const isUS = code === "US" || code === "ABD";
          const isIK = code === "IK";
          const flagUrl = isUS ? "/us-flag.png" : isIK ? "/ik-flag.png" : `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
          return {
            value: code,
            name: trName,
            flag: flagUrl,
            phoneCode: c.phoneCode || "",
            searchableText: `${trName} ${code}`,
            label: (
              <div className="flex items-center gap-2">
                <div className="shrink-0 overflow-hidden ring-1 ring-border shadow-sm h-5 w-7 relative flex items-center justify-center bg-muted/10 rounded-sm">
                  <img src={flagUrl} alt={code} className="w-full h-full object-cover" />
                </div>
                <span>{trName}</span>
              </div>
            ),
          };
        });
        setApiCountries(mapped);
      }).catch(console.error);
  }, []);


  // ── Sayfa yüklenince: adresler + ölçüler + taslak kontrolü (otomatik yükleme YOK) ─
  React.useEffect(() => {
    if (!hydrated) return;
    // Adresler
    api.listAddresses().then(r => { setApiAddresses(r.addresses); setAddressesLoaded(true); }).catch(() => { setAddressesLoaded(true); });
    // Ölçüler
    api.listMeasurements().then(r => setApiMeasurements(r.measurements)).catch(() => {});
    // URL'de draftId varsa banner için tekrar taslak çekme (Race condition önlemi)
    if (urlDraftId) return;
    // Mevcut taslak var mı kontrol et (ama otomatik yükleme)
    api.getDraft().then(r => {
      if (!r.draft) return;
      const d = r.draft;
      // Taslak varsa sadece banner bilgisini sakla
      setPendingDraft({
        shipmentId: d.shipmentId,
        currentStep: d.currentStep,
        shipmentType: d.shipmentType,
        receiverCountry: d.receiverCountry,
        receiverPostalCode: d.receiverPostalCode,
        rawDraft: d,
      });
    }).catch(() => {});
  }, [hydrated, urlDraftId]);

  // ── URL'den gelen ?draft=ID ile otomatik taslak yükleme ────────────────────
  React.useEffect(() => {
    if (!hydrated || !urlDraftId) return;
    const draftId = Number(urlDraftId);
    if (!draftId || Number.isNaN(draftId)) return;
    // Zaten bu taslak yüklüyse tekrar yükleme
    if (shipmentId === draftId) return;

    setDraftLoading(true);
    api.getDraft()
      .then(async r => {
        if (!r.draft) {
          setDraftLoading(false);
          return;
        }
        const d = r.draft;
        setShipmentId(d.shipmentId);

        const isQuick = searchParams.get("quick") === "1";

        const newPackages = (d.packages?.length ?? 0) > 0 ? d.packages.map((p: any, i: number) => ({
          id: String(i), widthCm: String(p.widthCm), lengthCm: String(p.lengthCm),
          heightCm: String(p.heightCm), weightKg: String(p.weightKg), packageCount: String(p.packageCount),
          selectedPreset: "", saveMeasurement: false, measurementLabel: "",
        })) : undefined;

        setDraft(prev => ({
          ...prev,
          shipmentType: (d.shipmentType as any) || prev.shipmentType,
          receiverCountry: d.receiverCountry || prev.receiverCountry,
          receiverPostalCode: d.receiverPostalCode || prev.receiverPostalCode,
          selectedCarrierId: d.selectedCarrierId || prev.selectedCarrierId,
          hasInsurance: d.hasInsurance,
          selectedSenderAddressId: d.senderAddressId ? String(d.senderAddressId) : prev.selectedSenderAddressId,
          selectedReceiverAddressId: d.receiverAddressId ? String(d.receiverAddressId) : prev.selectedReceiverAddressId,
          receiverName: d.receiverName || prev.receiverName,
          receiverCompany: d.receiverCompany || prev.receiverCompany,
          receiverPhone: d.receiverPhone || prev.receiverPhone,
          receiverAddress: d.receiverAddress || prev.receiverAddress,
          receiverCity: d.receiverCity || prev.receiverCity,
          receiverStateProvince: (d as any).receiverStateProvince || prev.receiverStateProvince,
          receiverAddressCountry: (d as any).receiverAddressCountry || prev.receiverAddressCountry,
          receiverAddressPostalCode: (d as any).receiverAddressPostalCode || prev.receiverAddressPostalCode,
          proformaDescription: (d.proformaDescription as any) || prev.proformaDescription,
          proformaCurrency: (d.proformaCurrency as any) || prev.proformaCurrency,
          proformaIOSS: d.proformaIOSS || prev.proformaIOSS,
          customsType: (d as any).customsType || prev.customsType,
          packages: newPackages || prev.packages,
          proformaItems: (d.proformaItems?.length ?? 0) > 0 ? d.proformaItems.map((item: any, i: number) => ({
            id: String(i),
            productDescription: item.productDescription, hsCode: item.hsCode, sku: item.sku,
            quantity: String(item.quantity), unitPrice: String(item.unitPrice), origin: item.originCountry,
          })) : prev.proformaItems,
        }));
        setPendingDraft(null);
        setDraftBannerDismissed(true);

        if (isQuick) {
          // quick=1: Taslaktaki paket bilgilerinden fiyat tekliflerini çek ve doğrudan fiyatlandırma adımına geç
          try {
            const senderCountry = d.senderCountry || "TR";
            const receiverCountry = d.receiverCountry || "";
            const receiverPostalCode = d.receiverPostalCode || "";
            const packages = (newPackages || []).map((p: any) => ({
              widthCm: toNumber(p.widthCm),
              lengthCm: toNumber(p.lengthCm),
              heightCm: toNumber(p.heightCm),
              weightKg: toNumber(p.weightKg),
              packageCount: Math.max(1, Math.round(toNumber(p.packageCount))),
            }));

            const quoteRes = await api.getQuotes({
              senderCountry,
              receiverCountry,
              receiverPostalCode,
              packages,
              shipmentType: d.shipmentType || "Paket",
            });
            const quotes = quoteRes.quotes ?? [];
            setApiQuotes(quotes);
            if (quotes.length === 0 && quoteRes.capacity_exceeded) {
              setErrorModal({ title: "Kapasite Aşımı", message: quoteRes.message || "Girdiğiniz ölçüler mevcut kargo kapasitelerini aşmaktadır. Lütfen kapasitenize uygun bir ürün giriniz." });
              setQuotesMessage(null);
            } else {
              setQuotesMessage(quotes.length === 0 ? (quoteRes.message || "Bu rota için kargo firması bulunamadı.") : null);
            }

            // Tavsiye edilen kargoyu seç
            const rec = quotes.find((q: ApiCarrierQuote) => q.tags.includes("recommended"));
            const defaultId = rec?.carrierId || quotes[0]?.carrierId || "";
            setDraft(prev => ({ ...prev, selectedCarrierId: defaultId }));

            setStep(2); // Fiyatlandırma adımına atla
          } catch (err: any) {
            // Fiyat çekme başarısız olsa bile fiyatlandırma adımına at, hatayı göster
            setQuotesMessage(err?.message || "Fiyat bilgileri alınamadı, lütfen tekrar deneyin.");
            setStep(2);
          }
        } else {
          setStep(Math.min(d.currentStep, STEPS.length - 2));
        }

        setDraftLoading(false);
      })
      .catch(() => {
        setDraftLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, urlDraftId]);

  // ── Description types ────────────────────────────────────────────
  React.useEffect(() => {
    descriptionTypeService.list()
      .then(r => setDescriptionTypes(r.types))
      .catch(console.error);
  }, []);

  // ── Taslaktan devam et fonksiyonu (banner'a tıklanınca) ───────────────────
  function resumeFromDraft() {
    if (!pendingDraft) return;
    setDraftLoading(true);
    const d = pendingDraft.rawDraft;

    setShipmentId(d.shipmentId);
    setStep(Math.min(d.currentStep, STEPS.length - 2));
    setDraft(prev => ({
      ...prev,
      shipmentType: (d.shipmentType as any) || prev.shipmentType,
      receiverCountry: d.receiverCountry || prev.receiverCountry,
      receiverPostalCode: d.receiverPostalCode || prev.receiverPostalCode,
      selectedCarrierId: d.selectedCarrierId || prev.selectedCarrierId,
      hasInsurance: d.hasInsurance,
      selectedSenderAddressId: d.senderAddressId ? String(d.senderAddressId) : prev.selectedSenderAddressId,
      selectedReceiverAddressId: d.receiverAddressId ? String(d.receiverAddressId) : prev.selectedReceiverAddressId,
      receiverName: d.receiverName || prev.receiverName,
      receiverCompany: d.receiverCompany || prev.receiverCompany,
      receiverPhone: d.receiverPhone || prev.receiverPhone,
      receiverAddress: d.receiverAddress || prev.receiverAddress,
      receiverCity: d.receiverCity || prev.receiverCity,
      receiverStateProvince: d.receiverStateProvince || prev.receiverStateProvince,
      receiverAddressCountry: d.receiverAddressCountry || prev.receiverAddressCountry,
      receiverAddressPostalCode: d.receiverAddressPostalCode || prev.receiverAddressPostalCode,
      proformaDescription: (d.proformaDescription as any) || prev.proformaDescription,
      proformaCurrency: (d.proformaCurrency as any) || prev.proformaCurrency,
      proformaIOSS: d.proformaIOSS || prev.proformaIOSS,
      customsType: (d as any).customsType || prev.customsType,
      packages: (d.packages?.length ?? 0) > 0 ? d.packages.map((p: any, i: number) => ({
        id: String(i), widthCm: String(p.widthCm), lengthCm: String(p.lengthCm),
        heightCm: String(p.heightCm), weightKg: String(p.weightKg), packageCount: String(p.packageCount),
        selectedPreset: "", saveMeasurement: false, measurementLabel: "",
      })) : prev.packages,
      proformaItems: (d.proformaItems?.length ?? 0) > 0 ? d.proformaItems.map((item: any, i: number) => ({
        id: String(i),
        productDescription: item.productDescription, hsCode: item.hsCode, sku: item.sku,
        quantity: String(item.quantity), unitPrice: String(item.unitPrice), origin: item.originCountry,
      })) : prev.proformaItems,
    }));

    setPendingDraft(null);
    setDraftBannerDismissed(true);
    setDraftLoading(false);
  }

  function dismissDraftBanner() {
    setDraftBannerDismissed(true);
  }

  // ── Hesaplamalar ──────────────────────────────────────────────────────────
  const totalVolumetricWeight = React.useMemo(() => {
    return draft.packages.reduce((sum, pkg) => {
      const w = Math.max(toNumber(pkg.widthCm), 0), l = Math.max(toNumber(pkg.lengthCm), 0), h = Math.max(toNumber(pkg.heightCm), 0);
      const v = (w * l * h) / 5000;
      return sum + (Number.isFinite(v) ? v : 0) * Math.max(1, toNumber(pkg.packageCount));
    }, 0);
  }, [draft.packages]);

  const totalActualWeight = React.useMemo(() => {
    return draft.packages.reduce((sum, pkg) => sum + Math.max(toNumber(pkg.weightKg), 0) * Math.max(1, toNumber(pkg.packageCount)), 0);
  }, [draft.packages]);

  const selectedQuote = apiQuotes.find(q => q.carrierId === draft.selectedCarrierId);

  const chargeableWeight = draft.packages.reduce((sum, pkg) => {
    const w = Math.max(toNumber(pkg.widthCm), 0), l = Math.max(toNumber(pkg.lengthCm), 0), h = Math.max(toNumber(pkg.heightCm), 0);
    const v = (Number.isFinite((w * l * h) / 5000) ? (w * l * h) / 5000 : 0);
    const weight = Math.max(toNumber(pkg.weightKg), 0);
    return sum + Math.max(weight, v) * Math.max(1, toNumber(pkg.packageCount));
  }, 0);

  const totalPackageCount = draft.packages.reduce((sum, pkg) => sum + Math.max(1, Math.round(toNumber(pkg.packageCount))), 0);

  // Adresler
  const SAVED_SENDER_ADDRESSES = React.useMemo(() => apiAddresses.filter(a => a.type === "sender"), [apiAddresses]);
  const SAVED_RECEIVER_ADDRESSES = React.useMemo(() => apiAddresses.filter(a => a.type === "receiver"), [apiAddresses]);
  
  const filteredSenderAddresses = React.useMemo(() => {
    const q = senderSearch.toLowerCase().trim();
    return SAVED_SENDER_ADDRESSES.filter(a => !q || a.label.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || (a.company || "").toLowerCase().includes(q));
  }, [senderSearch, SAVED_SENDER_ADDRESSES]);

  const filteredReceiverAddresses = React.useMemo(() => {
    const q = receiverSearch.toLowerCase().trim();
    return SAVED_RECEIVER_ADDRESSES.filter(a => !q || a.label.toLowerCase().includes(q) || a.name.toLowerCase().includes(q) || (a.company || "").toLowerCase().includes(q));
  }, [receiverSearch, SAVED_RECEIVER_ADDRESSES]);

  // Kayıtlı adres yoksa yeni adres formunu otomatik aç
  const [addressesLoaded, setAddressesLoaded] = React.useState(false);

  React.useEffect(() => {
    if (!addressesLoaded) return;
    if (SAVED_SENDER_ADDRESSES.length === 0) {
      setShowNewSenderForm(true);
    } else {
      // İlk kayıtlı gönderici adresini otomatik seç ve flat alanları TEK SEFERDE doldur
      const firstSender = SAVED_SENDER_ADDRESSES[0];
      if (firstSender) {
        setDraft(d => {
          // Zaten dolu ise dokunma
          if (d.senderName) return d;
          return {
            ...d,
            selectedSenderAddressId: String(firstSender.id),
            senderName: firstSender.name || "",
            senderPhone: firstSender.phone || "+90",
            senderAddress: firstSender.address || "",
            senderCity: firstSender.city || "",
            senderTown: (firstSender as any).town || "",
            senderCompany: firstSender.company || "",
          };
        });
      }
    }
    if (SAVED_RECEIVER_ADDRESSES.length === 0) {
      setShowNewReceiverForm(true);
    }
  }, [addressesLoaded, SAVED_SENDER_ADDRESSES.length, SAVED_RECEIVER_ADDRESSES.length]);

  const proformaTotal = React.useMemo(() => draft.proformaItems.reduce((sum, item) => sum + toNumber(item.quantity) * toNumber(item.unitPrice), 0), [draft.proformaItems]);
  const currencySymbol = draft.proformaCurrency === "EUR" ? "€" : draft.proformaCurrency === "USD" ? "$" : "£";

  // ── Proforma step'e girilince miktar = toplam koli sayısı ─────────────────
  React.useEffect(() => {
    if (step !== 3) return;
    const totalPkgCount = draft.packages.reduce((sum, p) => sum + (Number(p.packageCount) || 1), 0);
    if (totalPkgCount <= 0) return;
    setDraft(d => ({
      ...d,
      proformaItems: d.proformaItems.map(item =>
        item.quantity === "" || item.quantity === "1"
          ? { ...item, quantity: String(totalPkgCount) }
          : item
      ),
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  // ── Adım 3'e (Adres) girilince alıcı ülkesini otomatik doldur ─────────────
  React.useEffect(() => {
    if (step !== 3) return; // step index 3 = Adres Seçimi
    // receiverCountry step 0'da seçilmişti, receiverAddressCountry boşsa doldur
    if (draft.receiverCountry && !draft.receiverAddressCountry) {
      setDraft(d => ({ ...d, receiverAddressCountry: d.receiverCountry }));
      // Telefon kodunu da otomatik doldur
      const country = apiCountries.find((c: any) => c.value === draft.receiverCountry);
      if (country?.phoneCode && !draft.receiverPhone) {
        setDraft(d => ({ ...d, receiverPhone: (country as any).phoneCode }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);


  // ── Draft mutators ────────────────────────────────────────────────────────
  function update<K extends keyof ShipmentDraft>(key: K, value: ShipmentDraft[K]) { setDraft(d => ({ ...d, [key]: value })); setFieldErrors(prev => { if (prev[key]) { const next = { ...prev }; delete next[key]; return next; } return prev; }); }
  function updateProformaItem(itemId: string, field: keyof ProformaItem, value: string) { setDraft(d => ({ ...d, proformaItems: d.proformaItems.map(i => i.id === itemId ? { ...i, [field]: value } : i) })); }
  function addProformaItem() {
    const totalPkgCount = draft.packages.reduce((sum, p) => sum + (Number(p.packageCount) || 1), 0);
    setDraft(d => ({ ...d, proformaItems: [...d.proformaItems, { ...EMPTY_PROFORMA_ITEM, id: crypto.randomUUID(), quantity: String(totalPkgCount || 1) }] }));
  }
  function removeProformaItem(itemId: string) { setDraft(d => ({ ...d, proformaItems: d.proformaItems.filter(i => i.id !== itemId) })); }

  function updatePackageItem(itemId: string, field: keyof PackageItem, value: any) { setDraft(d => ({ ...d, packages: d.packages.map(i => i.id === itemId ? { ...i, [field]: value, ...(field !== "selectedPreset" && field !== "saveMeasurement" && field !== "measurementLabel" && field !== "packageCount" ? { selectedPreset: "" } : {}) } : i) })); }
  function addPackageItem() { setDraft(d => ({ ...d, packages: [...d.packages, { ...EMPTY_PACKAGE_ITEM, id: crypto.randomUUID() }] })); }
  function removePackageItem(itemId: string) { setDraft(d => ({ ...d, packages: d.packages.filter(i => i.id !== itemId) })); }

  function applyPresetToPackage(itemId: string, presetId: string) {
    if (!presetId) { updatePackageItem(itemId, "selectedPreset", ""); return; }
    const p = apiMeasurements.find(x => String(x.id) === presetId); if (!p) return;
    setDraft(d => ({ ...d, packages: d.packages.map(i => i.id === itemId ? { ...i, selectedPreset: presetId, widthCm: String(p.widthCm), lengthCm: String(p.lengthCm), heightCm: String(p.heightCm), weightKg: String(p.weightKg) } : i) }));
  }
  function importProformaFromExcel(rows: ParsedProformaRow[]) {
  const items = rows.map((r) => ({
    id: crypto.randomUUID(),
    productDescription: r.productDescription,
    hsCode: r.hsCode,
    sku: r.sku,
    quantity: r.quantity,
    unitPrice: r.unitPrice,
    origin: r.origin || "TR",
  }));
  setDraft((d) => ({ ...d, proformaItems: items }));
  setShowProformaExcel(false);
}
function importPackagesFromExcel(rows: ParsedPackageRow[]) {
  const items = rows.map((r) => ({
    id: crypto.randomUUID(),
    widthCm: r.widthCm,
    lengthCm: r.lengthCm,
    heightCm: r.heightCm,
    weightKg: r.weightKg,
    packageCount: r.packageCount,
    selectedPreset: "",
    saveMeasurement: false,
    measurementLabel: "",
  }));
  setDraft((d) => ({ ...d, packages: items }));
  setShowPackageExcel(false);
}
  // ── Adım ilerleme (API çağrılı) ─────────────────────────────────────────────
  
  async function saveProformaDetails() {
    // Proforma specific validation
    const errors: Record<string, string> = {};
    if (!draft.proformaDescription) errors.proformaDescription = "Zorunlu";
    if (!draft.proformaCurrency) errors.proformaCurrency = "Zorunlu";
    
    draft.proformaItems.forEach((item, idx) => {
      if (!item.origin) errors[`item_${idx}_origin`] = "Zorunlu";
      if (!item.productDescription) errors[`item_${idx}_productName`] = "Zorunlu";
      if (!item.hsCode) errors[`item_${idx}_hsCode`] = "Zorunlu";
      if (!item.quantity || toNumber(item.quantity) <= 0) errors[`item_${idx}_quantity`] = "Zorunlu";
      if (!item.unitPrice || toNumber(item.unitPrice) <= 0) errors[`item_${idx}_unitPrice`] = "Zorunlu";
    });

    // Mikro İhracat seçildiyse fatura bilgileri zorunlu
    const isMikroIhracat = draft.proformaDescription.toLowerCase().includes("mikro") || draft.proformaDescription.toLowerCase().includes("micro");

    if (isMikroIhracat) {
      if (!draft.invoiceNo.trim()) errors.invoiceNo = "Mikro İhracat için fatura numarası zorunludur";
      if (!draft.invoiceDate.trim()) errors.invoiceDate = "Mikro İhracat için fatura tarihi zorunludur";
      if (!draft.earchivePdfUrl.trim()) errors.earchivePdfUrl = "Mikro İhracat için e-arşiv fatura PDF linki zorunludur";
    }

    // Belge yükleme zorunluluğu (Sadece Mikro İhracat için)
    if (isMikroIhracat && docUploadedFiles.length === 0) {
      errors.documentUpload = "Zorunlu";
      setDocError("Mikro İhracat gönderilerinde gümrük belgesi yüklemek zorunludur.");
      // Belge bölümüne scroll
      const docSection = document.getElementById("customs-documents-section");
      if (docSection) docSection.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setApiError(docUploadedFiles.length === 0 
        ? "Belge yüklemeden ilerleyemezsiniz. Lütfen en az bir gümrük belgesi yükleyiniz." 
        : "Lütfen zorunlu alanları doldurunuz.");
      return;
    }

    setFieldErrors({});
    setDocError(null);
    await next();
  }

  async function next() {
    setApiError(null);
    setLoading(true);
    try {
      if (step === 0) {
        const step0Errors: Record<string, string> = {};
        if (!draft.receiverCountry) step0Errors.receiverCountry = "Zorunlu";
        if (!draft.receiverPostalCode) {
          step0Errors.receiverPostalCode = "Posta kodu zorunludur";
          step0Errors.receiverCity = "Şehir bilgisi zorunludur";
        } else if (draft.shipmentType !== "Belge") {
          // Belge tipinde posta kodu lookup zorunlu DEĞİL (sabit 0.5 desi kullanılır)
          if (postalLookupLoading) {
            step0Errors.receiverPostalCode = "Posta kodu doğrulanıyor, lütfen bekleyin";
          } else if (postalLookupError || !postalLookupResult) {
            step0Errors.receiverPostalCode = postalLookupError || "Geçerli bir posta kodu girin";
            step0Errors.receiverCity = "Şehir bilgisi bulunamadı";
          }
        }
        if (Object.keys(step0Errors).length > 0) {
          setFieldErrors(step0Errors);
          setApiError("Lütfen zorunlu alanları doldurunuz.");
          setLoading(false);
          return;
        }
        setFieldErrors({});
        // Taslak oluştur veya güncelle (step 0)
        let sid = shipmentId;
        if (!sid) {
          const res = await api.createDraft({
            shipmentType: draft.shipmentType,
            receiverCountry: draft.receiverCountry,
            receiverPostalCode: draft.receiverPostalCode,
          });
          sid = res.shipmentId;
          setShipmentId(sid);
        } else {
          await api.updateDraft(sid, 0, {
            shipmentType: draft.shipmentType,
            receiverCountry: draft.receiverCountry,
            receiverPostalCode: draft.receiverPostalCode,
          });
        }

        // Belge tipi seçildiyse: sabit 0.5 desi, paket adımını atla, direkt fiyatlandırmaya git
        if (draft.shipmentType === "Belge") {
          const belgePackages = [{ widthCm: 1, lengthCm: 1, heightCm: 1, weightKg: 0.5, packageCount: 1 }];
          // Paket bilgisini backend'e kaydet
          await api.updateDraft(sid!, 1, { packages: belgePackages, saveMeasurements: [] });
          // Sabit paketi draft state'ine yaz
          setDraft(d => ({
            ...d,
            packages: [{
              id: crypto.randomUUID(),
              widthCm: "1", lengthCm: "1", heightCm: "1", weightKg: "0.5",
              packageCount: "1", selectedPreset: "", saveMeasurement: false, measurementLabel: "",
            }],
          }));
          // Fiyat tekliflerini çek — hata olsa bile fiyatlandırma adımına git
          try {
            const quoteRes = await api.getQuotes({
              senderCountry: draft.senderCountry,
              receiverCountry: draft.receiverCountry,
              receiverPostalCode: draft.receiverPostalCode,
              packages: belgePackages,
              shipmentType: "Belge",
            });
            const quotes = quoteRes.quotes ?? [];
            setApiQuotes(quotes);
            if (quotes.length === 0 && quoteRes.capacity_exceeded) {
              setErrorModal({ title: "Kapasite Aşımı", message: quoteRes.message || "Kargo kapasitesi aşıldı." });
              setQuotesMessage(null);
            } else {
              setQuotesMessage(quotes.length === 0 ? (quoteRes.message || "Bu rota için kargo firması bulunamadı.") : null);
            }
            const rec = quotes.find((q: ApiCarrierQuote) => q.tags.includes("recommended"));
            const defaultId = rec?.carrierId || quotes[0]?.carrierId || "";
            setDraft(d => ({ ...d, selectedCarrierId: defaultId }));
          } catch (err: any) {
            setQuotesMessage(err?.message || "Fiyat bilgileri alınamadı, lütfen tekrar deneyin.");
          }
          setStep(2); // Her durumda fiyatlandırma adımına atla
          setLoading(false);
          return;
        }
      } else if (step === 1) {
        // Paket ölçüleri validasyonu
        const step1Errors: Record<string, string> = {};
        draft.packages.forEach((p, idx) => {
          if (toNumber(p.widthCm) <= 0) step1Errors[`pkg_${idx}_widthCm`] = "Zorunlu";
          if (toNumber(p.lengthCm) <= 0) step1Errors[`pkg_${idx}_lengthCm`] = "Zorunlu";
          if (toNumber(p.heightCm) <= 0) step1Errors[`pkg_${idx}_heightCm`] = "Zorunlu";
          if (toNumber(p.weightKg) <= 0) step1Errors[`pkg_${idx}_weightKg`] = "Zorunlu";
        });
        if (Object.keys(step1Errors).length > 0) {
          setFieldErrors(step1Errors);
          setApiError("Lütfen tüm paket ölçülerini eksiksiz doldurunuz.");
          setLoading(false);
          return;
        }
        setFieldErrors({});
        // Paketleri kaydet
        if (!shipmentId) { setApiError("Taslak bulunamadı."); setLoading(false); return; }
        const packages = draft.packages.map(p => ({
          widthCm: toNumber(p.widthCm), lengthCm: toNumber(p.lengthCm),
          heightCm: toNumber(p.heightCm), weightKg: toNumber(p.weightKg),
          packageCount: Math.max(1, Math.round(toNumber(p.packageCount))),
        }));
        const saveMeasurements = draft.packages
          .filter(p => p.saveMeasurement && p.measurementLabel)
          .map(p => ({ label: p.measurementLabel!, widthCm: toNumber(p.widthCm), lengthCm: toNumber(p.lengthCm), heightCm: toNumber(p.heightCm), weightKg: toNumber(p.weightKg) }));
        await api.updateDraft(shipmentId, 1, { packages, saveMeasurements });
        // Kargo fiyatlarını çek
        const quoteRes = await api.getQuotes({
          senderCountry: draft.senderCountry,
          receiverCountry: draft.receiverCountry,
          receiverPostalCode: draft.receiverPostalCode,
          packages,
          shipmentType: draft.shipmentType,
        });
        const quotes = quoteRes.quotes ?? [];
        setApiQuotes(quotes);
        if (quotes.length === 0 && quoteRes.capacity_exceeded) {
          setErrorModal({ title: "Kapasite Aşımı", message: quoteRes.message || "Girdiğiniz ölçüler mevcut kargo kapasitelerini aşmaktadır. Lütfen kapasitenize uygun bir ürün giriniz." });
          setQuotesMessage(null);
        } else {
          setQuotesMessage(quotes.length === 0 ? (quoteRes.message || "Bu rota için kargo firması bulunamadı.") : null);
        }
        // Ölçüleri yenile (saveMeasurement varsa yeni kayıtlar gelmiş olabilir)
        if (saveMeasurements.length > 0) {
          api.listMeasurements().then(r => setApiMeasurements(r.measurements)).catch(() => {});
        }
        // Tavsiye edilen kargo
        const rec = quotes.find(q => q.tags.includes("recommended"));
        const defaultId = draft.selectedCarrierId || rec?.carrierId || quotes[0]?.carrierId || "";
        setDraft(d => ({ ...d, selectedCarrierId: defaultId }));
      } else if (step === 2) {
        if (!shipmentId) { setApiError("Taslak bulunamadı."); setLoading(false); return; }
        if (!draft.selectedCarrierId) { setApiError("Lütfen bir kargo firması seçin."); setLoading(false); return; }
        
        // Modal geçici olarak kapatıldı, direkt backend'e yaz ve devam et.
        await api.updateDraft(shipmentId, 2, {
          selectedCarrierId: draft.selectedCarrierId,
          hasInsurance: draft.hasInsurance,
        });
      } else if (step === 3) {
        if (!shipmentId) { setApiError("Taslak bulunamadı."); setLoading(false); return; }
        
        // Yeni Gönderici Adresi Kaydı (artık backend'e paslanacak, o kaydedecek!)
        let finalSenderAddressId = draft.selectedSenderAddressId;
        if (showNewSenderForm) {
          if (!draft.senderName || !draft.senderAddress || !draft.senderCity) {
            setApiError("Lütfen gönderici bilgilerini (Ad, Şehir, Adres) eksiksiz giriniz."); setLoading(false); return;
          }
          finalSenderAddressId = ""; // No existing ID if creating a new form, rely on flat fields
          update("selectedSenderAddressId", "");
        }

        const step3Errors: Record<string, string> = {};
        
        if (showNewReceiverForm) {
          if (!draft.receiverName && !draft.receiverCompany) step3Errors.receiverName = "Alıcı adı veya firma adı zorunludur";
          if (!draft.receiverAddress) step3Errors.receiverAddress = "Adres zorunludur";
          if (!draft.receiverCity) step3Errors.receiverCity = "Şehir zorunludur";
          if (!draft.receiverPhone) step3Errors.receiverPhone = "Telefon zorunludur";
          if (!draft.receiverAddressCountry) {
            step3Errors.receiverAddressCountry = "Ülke zorunludur";
          } else if (draft.receiverAddressCountry.toUpperCase() !== draft.receiverCountry.toUpperCase()) {
            const formCountryName = apiCountries.find(c => c.value.toUpperCase() === draft.receiverAddressCountry.toUpperCase())?.name || draft.receiverAddressCountry;
            const targetCountryName = apiCountries.find(c => c.value.toUpperCase() === draft.receiverCountry.toUpperCase())?.name || draft.receiverCountry;
            setErrorModal({ title: "Ülke Uyuşmazlığı", message: `Yeni girdiğiniz alıcı adresi "${formCountryName}" ülkesine ait. Ancak hedef ülke olarak "${targetCountryName}" seçtiniz. Lütfen hedef ülkeyle eşleşen bir ülke seçin.` });
            setLoading(false);
            return;
          }
        } else {
          if (!draft.selectedReceiverAddressId) {
            step3Errors.selectedReceiverAddressId = "Lütfen bir alıcı seçin veya yeni adres girin";
          } else {
            const selectedAddr = SAVED_RECEIVER_ADDRESSES.find(a => String(a.id) === draft.selectedReceiverAddressId);
            if (selectedAddr && selectedAddr.countryCode && selectedAddr.countryCode.toUpperCase() !== draft.receiverCountry.toUpperCase()) {
              const addrCountryName = apiCountries.find(c => c.value.toUpperCase() === selectedAddr.countryCode.toUpperCase())?.name || selectedAddr.countryCode;
              const targetCountryName = apiCountries.find(c => c.value.toUpperCase() === draft.receiverCountry.toUpperCase())?.name || draft.receiverCountry;
              setErrorModal({ title: "Ülke Uyuşmazlığı", message: `Seçtiğiniz alıcı adresi "${addrCountryName}" ülkesine ait. Ancak hedef ülke olarak "${targetCountryName}" seçtiniz. Lütfen hedef ülkeyle eşleşen bir alıcı adresi seçin veya yeni adres ekleyin.` });
              setLoading(false);
              return;
            }
          }
        }

        if (Object.keys(step3Errors).length > 0) {
          setFieldErrors(step3Errors);
          setApiError("Lütfen alıcı bilgilerindeki eksik alanları doldurunuz.");
          setLoading(false);
          return;
        }

        const senderAddr = SAVED_SENDER_ADDRESSES.find(a => String(a.id) === finalSenderAddressId) || null;
        const receiverAddr = SAVED_RECEIVER_ADDRESSES.find(a => String(a.id) === draft.selectedReceiverAddressId) || null;
        
        // Kayıtlı adres seçilmişse flat alanları doldur (boşsa)
        // Hiçbir kaynak bulunamazsa → ilk kayıtlı gönderici adresini kullan
        const fallbackSender = senderAddr || (SAVED_SENDER_ADDRESSES.length > 0 ? SAVED_SENDER_ADDRESSES[0] : null);
        const finalSenderName = draft.senderName || fallbackSender?.name || "";
        const finalSenderPhone = draft.senderPhone || fallbackSender?.phone || "";
        const finalSenderAddress = draft.senderAddress || fallbackSender?.address || "";
        const finalSenderCity = draft.senderCity || fallbackSender?.city || "";
        const finalSenderTown = draft.senderTown || (fallbackSender as any)?.town || "";
        const finalSenderCompany = draft.senderCompany || fallbackSender?.company || "";
        // senderAddressId: numeric ID gönder
        const numericSenderAddrId = fallbackSender ? fallbackSender.id : (finalSenderAddressId ? parseInt(finalSenderAddressId) || null : null);

        const step3Result = await api.updateDraft(shipmentId, 3, {
          senderAddressId: numericSenderAddrId,
          senderName: finalSenderName,
          senderCompany: finalSenderCompany,
          senderPhone: finalSenderPhone,
          senderAddress: finalSenderAddress,
          senderCity: finalSenderCity,
          senderTown: finalSenderTown,
          senderStateId: draft.senderStateId,
          saveSenderAddress: draft.saveSenderAddress,
          receiverAddressId: receiverAddr ? receiverAddr.id : null,
          // Kayıtlı adres seçildiyse → o adresin bilgilerini gönder (draft'taki stale veri değil)
          receiverName: receiverAddr ? receiverAddr.name : draft.receiverName,
          receiverCompany: receiverAddr ? receiverAddr.company : draft.receiverCompany,
          receiverPhone: receiverAddr ? receiverAddr.phone : draft.receiverPhone,
          receiverAddress: receiverAddr ? receiverAddr.address : draft.receiverAddress,
          receiverCity: receiverAddr ? receiverAddr.city : draft.receiverCity,
          receiverStateProvince: receiverAddr ? (receiverAddr.stateProvince || receiverAddr.city) : draft.receiverStateProvince,
          receiverAddressCountry: receiverAddr ? receiverAddr.countryCode : draft.receiverAddressCountry,
          receiverAddressPostalCode: receiverAddr ? receiverAddr.postalCode : draft.receiverAddressPostalCode,
          saveReceiverAddress: draft.saveReceiverAddress,
          domesticHandlerCode: selectedDomesticHandler || undefined,
          domesticSelfShipping: domesticSelfShipping || false,
        });
        
        // ── Yurt içi kargo seçimi gerekiyor mu? ──
        if (step3Result?.requiresDomesticTransfer && !selectedDomesticHandler) {
          // Domestic carrier seçim modalini göster
          setShowDomesticSelection(true);
          setDomesticLoading(true);
          try {
            const pkgs = draft.packages.map(p => ({
              width: parseFloat(p.widthCm) || 10,
              height: parseFloat(p.heightCm) || 10,
              depth: parseFloat(p.lengthCm) || 10,
              weight: parseFloat(p.weightKg) || 1,
            }));
            const res = await api.getDomesticPrices(pkgs, shipmentId);
            setDomesticCarriers(res.carriers || []);
          } catch (err: any) {
            setApiError("Yurt içi kargo fiyatları alınamadı: " + (err?.message || ""));
          } finally {
            setDomesticLoading(false);
          }
          setLoading(false);
          return; // Step 4'e geçme, kullanıcı seçim yapsın
        }

        // Adres listesini yenile (yeni adres kaydedildiyse)
        if (draft.saveReceiverAddress || (showNewSenderForm && draft.saveSenderAddress)) {
          api.listAddresses().then(r => setApiAddresses(r.addresses)).catch(() => {});
        }
      } else if (step === 4) {
        if (!shipmentId) { setApiError("Taslak bulunamadı."); setLoading(false); return; }

        // Paket satırı sayısı ile proforma ürün satırı sayısı eşleşmeli
        const packageRowCount = draft.packages.length;
        const proformaItemCount = draft.proformaItems.length;
        if (packageRowCount > 1 && proformaItemCount !== packageRowCount) {
          setApiError(
            `${packageRowCount} farklı koli/paket türü girdiniz, lütfen proformada da ${packageRowCount} adet ürün satırı tanımlayın. ` +
            `Şu an ${proformaItemCount} ürün girilmiş. Lütfen bu bölümü doğru doldurun.`
          );
          setLoading(false);
          return;
        }

        const proformaItems = draft.proformaItems.map(item => ({
          productDescription: item.productDescription, hsCode: item.hsCode, sku: item.sku,
          quantity: Math.max(1, Math.round(toNumber(item.quantity))),
          unitPrice: toNumber(item.unitPrice), originCountry: item.origin || "TR",
        }));
        await api.updateDraft(shipmentId, 4, {
          proformaDescription: draft.proformaDescription,
          proformaCurrency: draft.proformaCurrency,
          proformaIOSS: draft.proformaIOSS,
          customsType: draft.customsType,
          proformaItems,
          invoiceNo: draft.invoiceNo,
          invoiceDate: draft.invoiceDate,
          earchivePdfUrl: draft.earchivePdfUrl,
        });
      }
      setStep(s => {
        showStepToast(s);
        return Math.min(s + 1, STEPS.length - 1);
      });
      setDone(false);
    } catch (err: any) {
      const msg = err?.message || "Bir hata oluştu.";
      if (msg.includes("taslak değil") || msg.includes("düzenlenemez")) {
        setErrorModal({ title: "Gönderi Düzenlenemez", message: msg });
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function confirmServicesAndNext() {
    setShowServicesModal(false);
    setApiError(null);
    if (!shipmentId || !draft.selectedCarrierId) return;
    setLoading(true);
    try {
      await api.updateDraft(shipmentId, 2, {
        selectedCarrierId: draft.selectedCarrierId,
        hasInsurance: draft.hasInsurance,
      });
      setStep(s => {
        showStepToast(s);
        return Math.min(s + 1, STEPS.length - 1);
      });
      setDone(false);
    } catch (err: any) {
      const msg = err?.message || "Bir hata oluştu.";
      if (msg.includes("taslak değil") || msg.includes("düzenlenemez")) {
        setErrorModal({ title: "Gönderi Düzenlenemez", message: msg });
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function back() {
    setStep(s => {
      // Belge tipinde fiyatlandırma (step 2) → kargo bilgileri (step 0) atlama
      if (s === 2 && draft.shipmentType === "Belge") return 0;
      return Math.max(s - 1, 0);
    });
    setDone(false);
    setApiError(null);
  }

  async function finalize() {
    if (!shipmentId) return;
    setLoading(true);
    setApiError(null);
    try {
      if (docUploadedFiles.length > 0) {
        await Promise.all(
          docUploadedFiles.map(f => api.uploadDocument(f.file, shipmentId, f.type))
        ).catch((err: any) => {
          throw new Error("Belgeler yüklenirken hata oluştu: " + (err?.message || "Bilinmeyen Hata"));
        });
      }

      if (adminMode) {
        // Admin modunda: forceCreate ile direkt oluştur
        await api.forceCreate(shipmentId, {
          // Gönderici
          senderName: draft.senderName,
          senderPhone: draft.senderPhone,
          senderAddress: draft.senderAddress,
          senderCity: draft.senderCity,
          senderTown: draft.senderTown || "",
          senderCountry: draft.senderCountry || "TR",
          // Alıcı
          receiverName: draft.receiverName,
          receiverPhone: draft.receiverPhone,
          receiverAddress: draft.receiverAddress,
          receiverCity: draft.receiverCity,
          receiverTown: draft.receiverTown || "",
          receiverPostalCode: draft.receiverPostalCode || draft.receiverAddressPostalCode || "",
          receiverCountry: draft.receiverCountry,
          // Kargo
          carrierId: draft.selectedCarrierId,
          carrierType: "international",
          priceTry: apiQuotes.find(q => q.carrierId === draft.selectedCarrierId)?.priceTry || 0,
          carrierName: apiQuotes.find(q => q.carrierId === draft.selectedCarrierId)?.carrierName || "",
          serviceName: apiQuotes.find(q => q.carrierId === draft.selectedCarrierId)?.serviceName || "",
        });
        // ForceCreate sonrasi domestic bilgileri cek
        try {
          const draftDetail = await (adminMode 
            ? adminService.getShipmentDetail(shipmentId)
            : shipmentService.getDraftDetail(String(shipmentId)));
          if (draftDetail?.requiresDomesticTransfer) {
            setRequiresDomesticTransfer(true);
            setDomesticSelfShipping(!!draftDetail?.domesticSelfShipping);
            setDomesticTrackingCode(draftDetail?.domesticShipment?.trackingCode || draftDetail?.domesticTrackingCode || '');
            setDomesticCarrierCompany(draftDetail?.domesticShipment?.carrierCompany || draftDetail?.domesticCarrierCompany || '');
          }
          setCreatedShipmentTrackingCode(draftDetail?.trackingCode || '');
        } catch {}
        setDone(true);
        setStep(STEPS.length - 1);
      } else {
        // Adım 5 → pending_payment'a al
        await api.updateDraft(shipmentId, 5, {});
        // Ödeme seçenekleri sayfasına yönlendir (Havale/EFT + iyzico)
        window.location.href = `/panel/odeme/${shipmentId}`;
      }
    } catch (err: any) {
      const msg = err?.message || "Gönderi tamamlanamadı.";
      if (msg.includes("taslak değil") || msg.includes("düzenlenemez")) {
        setErrorModal({ title: "Gönderi Düzenlenemez", message: msg });
      } else {
        setApiError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  function resetAndNewShipment() {
    setDraft(DEFAULT_DRAFT); setStep(0); setDone(false); setShipmentId(null);
    setShowNewReceiverForm(false); setReceiverSearch(""); setApiQuotes([]); setApiError(null);
    setPendingDraft(null); setDraftBannerDismissed(true);
    setRequiresDomesticTransfer(false); setDomesticTrackingCode(""); setDomesticCarrierCompany(""); setCreatedShipmentTrackingCode(""); setDomesticSelfShipping(false);
  }

  if (!hydrated || draftLoading) return <div className="space-y-5"><Skeleton className="h-[96px] rounded-2xl" /><Skeleton className="h-[420px] rounded-2xl" /></div>;

  const cheapestQ = apiQuotes.find(q => q.tags.includes("cheapest"));
  const fastestQ = apiQuotes.find(q => q.tags.includes("fastest"));
  const recommendedQ = apiQuotes.find(q => q.tags.includes("recommended"));
  const selectedSenderAddr = SAVED_SENDER_ADDRESSES.find(a => String(a.id) === draft.selectedSenderAddressId);


  // Banner gösterilecek mi?
  const showDraftBanner = pendingDraft && !draftBannerDismissed;

  // Taslak için açıklama metni
  const draftStepLabel = pendingDraft ? STEPS[Math.min(pendingDraft.currentStep, STEPS.length - 1)] : "";
  const draftCountryLabel = pendingDraft?.receiverCountry
    ? (COUNTRY_NAMES[pendingDraft.receiverCountry] || pendingDraft.receiverCountry)
    : null;

  return (
    <div className="space-y-5">
      {/* ── ADİM GEÇİŞ TOAST ── */}
      {stepToast && (
        <div className={`fixed z-[100] w-[92%] max-w-md transition-all duration-400
          top-4 left-1/2 -translate-x-1/2
          md:left-auto md:translate-x-0 md:right-6 md:top-6
          ${
          stepToast.visible
            ? "opacity-100 translate-y-0 md:translate-x-0"
            : "opacity-0 -translate-y-4 md:translate-y-0 md:translate-x-[120%]"
        }`}>
          <div className="flex items-center gap-3.5 rounded-2xl bg-white px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-2 ring-[#4F46E5]/20">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4F46E5] shadow-lg shadow-indigo-500/30">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FCD34D" stroke="#FBBF24" strokeWidth="1" />
                <path d="M9 12.5L11 14.5L15 10.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-[15px] font-extrabold text-[#1E293B]">
                {STEP_TOAST_MESSAGES[stepToast.step]?.title}
              </div>
              <div className="text-[13px] text-[#64748B] mt-0.5">
                {STEP_TOAST_MESSAGES[stepToast.step]?.desc}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TASLAK DEVAM BANNER ── */}
      {showDraftBanner && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-3 sm:p-5 ring-1 ring-amber-200 shadow-sm animate-in slide-in-from-top-2 fade-in duration-300">
          {/* Dekoratif arka plan */}
          <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-200/20" />
          <div className="pointer-events-none absolute -left-4 -bottom-4 h-16 w-16 rounded-full bg-orange-200/20" />

          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Sol: Bilgi */}
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
                <RotateCcw className="h-4 w-4 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <div className="text-[13px] sm:text-[15px] font-bold text-slate-900">Yarım kalan bir gönderiniz var</div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {pendingDraft?.shipmentType && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      <Package className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-500" />
                      {pendingDraft.shipmentType}
                    </span>
                  )}
                  {draftCountryLabel && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-500" />
                      {draftCountryLabel}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] sm:text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-amber-500" />
                    Adım: {draftStepLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Sağ: Butonlar */}
            <div className="flex items-center gap-2 sm:shrink-0">
              <Button
                type="button"
                variant="secondary"
                onClick={dismissDraftBanner}
                className="flex-1 sm:flex-none gap-1.5 text-xs sm:text-sm text-slate-600 hover:text-slate-800 h-9 sm:h-10"
              >
                <X className="h-3.5 w-3.5" />
                Kapat
              </Button>
              <Button
                type="button"
                onClick={resumeFromDraft}
                disabled={draftLoading}
                className="flex-1 sm:flex-none gap-1.5 sm:gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-sm text-xs sm:text-sm h-9 sm:h-10"
              >
                {draftLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                Taslaktan Devam Et
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="text-base sm:text-lg font-semibold tracking-tight">Gönderi Oluştur</div><div className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-muted">6 adımda gönderini hazırla. Taslak otomatik kaydedilir.</div></div>
        {selectedQuote ? <Badge className="w-fit">{selectedQuote.carrierName} · {getCurrencySymbol(selectedQuote.currency)}{selectedQuote.price.toFixed(2)} ({selectedQuote.priceTry.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺)</Badge> : <Badge className="w-fit">Kargo seçilmedi</Badge>}
      </div>

      <Stepper
        steps={[...STEPS]}
        current={step}
        onStepClick={(idx) => {
          if (idx < step) {
            // Belge tipinde step 1'e (Paket Ölçüleri) tıklanmasını engelle
            if (idx === 1 && draft.shipmentType === "Belge") return;
            setStep(idx);
            setDone(false);
            setApiError(null);
          }
        }}
      />

      <Card>
        {/* ── Card Header ── */}
        {step === 0 ? (
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
        ) : step === 1 ? (
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Paket Ölçüleri</CardTitle>
              <p className="mt-1 text-sm text-muted">Kayıtlı ölçülerden seçebilir veya ölçüleri manuel girebilirsiniz.</p>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
              <button type="button" onClick={back} className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 sm:px-6 py-2 sm:py-3 text-[12px] sm:text-[14px] font-bold text-[#0F172A] transition-colors shadow-sm">
                <span>←</span> Geri
              </button>
              <button type="button" onClick={next} disabled={loading} className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#3959F2] hover:bg-[#4338CA] px-3 sm:px-6 py-2 sm:py-3 text-[12px] sm:text-[14px] font-bold text-white transition-colors disabled:opacity-50">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Devam <span>→</span>
              </button>
            </div>
          </CardHeader>
        ) : (
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>{STEPS[step]}</CardTitle>
            {step < STEPS.length - 1 && (
              <div className="flex flex-col items-end gap-1">
                {apiError && <p className="text-xs text-red-500 font-medium">{apiError}</p>}
                <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
                  <button type="button" onClick={back} disabled={step === 0 || loading} className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-3 sm:px-6 py-2 sm:py-3 text-[12px] sm:text-[14px] font-bold text-[#0F172A] transition-colors shadow-sm disabled:opacity-40">
                    <span>←</span> Geri
                  </button>
                  {step !== 3 && (
                    <button type="button" onClick={next} disabled={loading} className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-[#3959F2] hover:bg-[#4338CA] px-3 sm:px-6 py-2 sm:py-3 text-[12px] sm:text-[14px] font-bold text-white transition-colors disabled:opacity-50">
                      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                      Devam <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </CardHeader>
        )}

        <CardContent>
          {/* ===== STEP 0 — Kargo Bilgileri ===== */}
          {step === 0 && (
            <div className="flex flex-col gap-5 sm:gap-8">
              {/* ── Gönderi Tipi ── */}
              <div>
                <div className="mb-4 text-[14px] font-bold text-[#0F172A]">Gönderi Tipi</div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {(["Belge", "Paket", "Koli"] as const).map((typeName) => {
                    const meta = SHIPMENT_TYPE_META[typeName];
                    const isActive = draft.shipmentType === typeName;
                    return (
                      <button
                        key={typeName}
                        type="button"
                        onClick={() => update("shipmentType", typeName as any)}
                        className={cn(
                          "relative flex items-center justify-between rounded-2xl px-3 py-3 sm:px-5 sm:py-4 text-left transition-all duration-200",
                          isActive
                            ? "bg-[#3959F2] text-white shadow-lg shadow-[#4F46E5]/25"
                            : "bg-[#F8FAFC] text-[#0F172A] ring-1 ring-[#E2E8F0] hover:ring-[#CBD5E1] hover:shadow-sm"
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-[13px] sm:text-[15px] font-bold">{typeName}</div>
                          <div className={cn("mt-0.5 text-[12px] font-medium hidden sm:block", isActive ? "text-white/75" : "text-[#94A3B8]")}>{meta.description}</div>
                        </div>
                        <div className="ml-3 shrink-0">
                          <img src={`/${typeName.toLowerCase()}.png`} alt={typeName} className="drop-shadow-sm transition-transform group-hover:scale-110 h-8 w-8 sm:h-12 sm:w-12 object-contain" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Gönderici Ülke + Alıcı Ülke (yan yana) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gönderici Ülke */}
                <div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest">
                    Gönderici Ülke <span className="text-red-500">*</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4 ring-1 ring-border h-12">
                    <div className="flex items-center gap-3">
                      {/* Türkiye bayrağı */}
                      <div className="shrink-0 overflow-hidden rounded-md shadow-sm ring-1 ring-border h-6 w-9 relative">
                        <img
                          src="https://flagcdn.com/w40/tr.png"
                          alt="Türkiye"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="text-sm font-bold text-foreground">Türkiye</div>
                    </div>
                    <span className="text-xs font-medium text-muted">Değiştirilemez</span>
                  </div>
                  <div className="mt-1.5 text-xs text-muted">Varsayılan gönderici ülke</div>
                </div>

                {/* Alıcı Ülke */}
                <div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest">
                    Alıcı Ülke <span className="text-red-500">*</span>
                  </div>
                  <div className={cn("rounded-2xl ring-1 bg-white", fieldErrors.receiverCountry ? "ring-2 ring-red-500" : "ring-border")}>
                    <SearchableSelect
                      options={apiCountries.length > 0 ? apiCountries : RECEIVER_COUNTRIES.map((c) => ({ ...c, label: (<div className="flex items-center gap-2"><CountryFlag code={c.value} size="sm" /><span>{c.label}</span></div>) as any, searchableText: c.label }))}
                      value={draft.receiverCountry}
                      onChange={(v) => { update("receiverCountry", v); update("receiverPostalCode", ""); }}
                      placeholder="Alıcı Ülke Seçiniz"
                      className="h-12 border-0 ring-0 focus:ring-0 bg-transparent text-sm px-4"
                    />
                  </div>
                  <div className="mt-1.5 text-xs text-muted">Örn: Almanya</div>
                </div>
              </div>

              {/* ── Alıcı Posta Kodu + Şehir (yan yana) ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Alıcı Posta Kodu */}
                <div>
                  <div className="mb-2 text-xs font-bold uppercase tracking-widest">
                    Alıcı Posta Kodu <span className="text-red-500">*</span>
                  </div>
                  <div
                    className={cn(
                      "relative rounded-2xl ring-1 bg-white overflow-hidden transition-all",
                      !draft.receiverCountry && "opacity-60 cursor-not-allowed",
                      fieldErrors.receiverPostalCode ? "ring-2 ring-red-500" : postalLookupResult ? "ring-2 ring-emerald-400" : "ring-border"
                    )}
                    onClick={() => {
                      if (!draft.receiverCountry) {
                        setFieldErrors(prev => ({ ...prev, receiverCountry: "Önce ülke seçin" }));
                        setTimeout(() => setFieldErrors(prev => { const n = { ...prev }; delete n.receiverCountry; return n; }), 2500);
                      }
                    }}
                  >
                    <Input
                      value={draft.receiverPostalCode}
                      onChange={(e) => update("receiverPostalCode", e.target.value)}
                      placeholder={!draft.receiverCountry ? "Önce alıcı ülke seçin" : "Posta Kodu"}
                      disabled={!draft.receiverCountry}
                      className="h-12 border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent text-sm pr-10 disabled:cursor-not-allowed"
                    />
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      {postalLookupLoading ? (
                        <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                      ) : postalLookupResult ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <MapPin className="h-5 w-5 text-muted" />
                      )}
                    </div>
                  </div>
                  {fieldErrors.receiverCountry && !draft.receiverCountry && (
                    <div className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="h-3 w-3" />
                      Önce yukarıdan alıcı ülke seçmelisiniz
                    </div>
                  )}
                  {postalLookupResult && (
                    <div className="mt-1.5 text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      {postalLookupResult.city} olarak belirlendi
                    </div>
                  )}
                  {postalLookupError && !postalLookupResult && (
                    <div className="mt-1.5 text-xs font-medium text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {postalLookupError}
                    </div>
                  )}
                  {draft.receiverCountry && !postalLookupResult && !postalLookupError && !postalLookupLoading && (
                    <div className="mt-1.5 text-xs text-muted">Örn: 10115 veya 75001</div>
                  )}
                </div>

                {/* Şehir — Otomatik Doldurulan */}
                <div>
                  <div className={cn("mb-2 text-xs font-bold uppercase tracking-widest", fieldErrors.receiverCity ? "text-red-500" : "")}>Şehir {fieldErrors.receiverCity && <span className="text-red-500">*</span>}</div>
                  <div className={cn("relative rounded-2xl ring-1 bg-white overflow-hidden transition-all", fieldErrors.receiverCity ? "ring-2 ring-red-500 bg-red-50/30" : "ring-border")}>
                    <Input
                      value={postalLookupResult?.city || ""}
                      readOnly
                      placeholder={postalLookupLoading ? "Aranıyor..." : "Otomatik doldurulur"}
                      className="h-12 border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent text-sm disabled:opacity-100"
                    />
                  </div>
                  {fieldErrors.receiverCity ? (
                    <div className="mt-1.5 text-xs font-medium text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {fieldErrors.receiverCity}
                    </div>
                  ) : (
                    <div className="mt-1.5 text-xs text-muted">Otomatik doldurulur.</div>
                  )}
                </div>
              </div>

              {/* ── Footer: zorunlu alanlar + buttons ── */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-1.5 text-sm text-muted">
                  <Info className="h-4 w-4 shrink-0" />
                  <span>Zorunlu alanlar <span className="text-red-500 font-semibold">*</span> ile işaretlidir.</span>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button type="button" onClick={back} disabled={step === 0} className="flex items-center gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 px-4 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-bold text-[#0F172A] transition-colors shadow-sm disabled:opacity-40">
                    <span>←</span> Geri
                  </button>
                  <button type="button" onClick={next} className="flex items-center gap-2 rounded-xl bg-[#3959F2] hover:bg-[#4338CA] px-4 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-bold text-white transition-colors">
                    Devam <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 1 — Paket Ölçüleri ===== */}
          {step === 1 && (
            <div className="flex flex-col gap-6 pb-24">
              <div className="space-y-5">
                {draft.packages.map((pkg, idx) => {
                  const pw = Math.max(toNumber(pkg.widthCm), 0);
                  const pl = Math.max(toNumber(pkg.lengthCm), 0);
                  const ph = Math.max(toNumber(pkg.heightCm), 0);
                  const pkgVol = (pw * pl * ph) / 5000;
                  const pkgActual = Math.max(toNumber(pkg.weightKg), 0);
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
                          <div className="rounded-lg ring-1 ring-[#E2E8F0] overflow-hidden flex-1 sm:flex-initial">
                            <SearchableSelect
                              options={apiMeasurements.map(p => ({ label: `${p.label} (${p.widthCm}×${p.lengthCm}×${p.heightCm} cm, ${p.weightKg} kg)`, value: String(p.id) }))}
                              value={pkg.selectedPreset}
                              onChange={v => applyPresetToPackage(pkg.id, v as string)}
                              placeholder="Şablon seç"
                              className="h-9 border-0 ring-0 focus:ring-0 bg-transparent text-[12px] px-3 min-w-[120px]"
                              hideSearchAndSort={true}
                            />
                          </div>
                          {draft.packages.length > 1 && (
                            <button type="button" onClick={() => removePackageItem(pkg.id)} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Card body */}
                      <div className="p-4 sm:p-6">
                        <div className="flex gap-10">
                          {/* 3D Box illustration — dynamic based on dimensions */}
                          <div className="hidden lg:flex items-center justify-center shrink-0" style={{ width: 280, minHeight: 220 }}>
                            {(() => {
                              // Normalize dimensions to visual range
                              const rawW = Math.max(toNumber(pkg.widthCm), 1);
                              const rawL = Math.max(toNumber(pkg.lengthCm), 1);
                              const rawH = Math.max(toNumber(pkg.heightCm), 1);
                              const maxDim = Math.max(rawW, rawL, rawH, 1);
                              // Scale to visual units (min 30, max 120)
                              const minVis = 30, maxVis = 120;
                              const scale = (v: number) => minVis + ((v / maxDim) * (maxVis - minVis));
                              const vW = scale(rawW);   // visual width (front face width)
                              const vL = scale(rawL);   // visual length (depth, goes to upper-right)
                              const vH = scale(rawH);   // visual height

                              // Isometric projection ratios
                              const dxRatio = 0.45;   // depth x-shift per unit
                              const dyRatio = 0.25;   // depth y-shift per unit
                              const depthX = vL * dxRatio;
                              const depthY = vL * dyRatio;

                              // Calculate total dimensions for centering
                              const totalBoxW = vW + depthX;
                              const totalBoxH = vH + depthY;
                              
                              // SVG canvas with padding for labels
                              const padLeft = 55, padRight = 40, padTop = 20, padBottom = 60;
                              const svgW = padLeft + totalBoxW + padRight;
                              const svgH = padTop + totalBoxH + padBottom;

                              // Box anchor point (front-bottom-left corner) — centered in canvas
                              const ax = padLeft;
                              const ay = padTop + totalBoxH;

                              // 8 corners of the box
                              const fbl = { x: ax, y: ay };                                    // front-bottom-left
                              const fbr = { x: ax + vW, y: ay };                               // front-bottom-right
                              const ftl = { x: ax, y: ay - vH };                               // front-top-left
                              const ftr = { x: ax + vW, y: ay - vH };                          // front-top-right
                              const bbl = { x: ax + depthX, y: ay - depthY };                  // back-bottom-left
                              const bbr = { x: ax + vW + depthX, y: ay - depthY };             // back-bottom-right
                              const btl = { x: ax + depthX, y: ay - vH - depthY };             // back-top-left
                              const btr = { x: ax + vW + depthX, y: ay - vH - depthY };        // back-top-right

                              const pts = (arr: {x:number,y:number}[]) => arr.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

                              // Dimension label positions
                              const hMidY = ay - vH / 2;
                              const wMidX = ax + vW / 2;
                              const lMidX = ax + vW + depthX / 2;
                              const lMidY = ay - depthY / 2 - vH / 2;

                              // Truncate display value for labels (max 6 chars)
                              const fmtVal = (v: string) => {
                                const s = v || "0";
                                return s.length > 6 ? s.slice(0, 5) + "…" : s;
                              };
                              const hLabel = `${fmtVal(pkg.heightCm)} cm`;
                              const wLabel = `${fmtVal(pkg.widthCm)} cm`;
                              const lLabel = `${fmtVal(pkg.lengthCm)} cm`;
                              // Dynamic label box width (approx 7px per char + 16px padding)
                              const lblW = (text: string) => Math.max(56, text.length * 7 + 16);
                              const hLblW = lblW(hLabel);
                              const wLblW = lblW(wLabel);
                              const lLblW = lblW(lLabel);

                              return (
                                <svg viewBox={`0 0 ${svgW} ${svgH}`} width="260" style={{ maxHeight: 220 }} className="drop-shadow-sm">
                                  {/* Front face */}
                                  <polygon points={pts([fbl, fbr, ftr, ftl])} fill="#DBEAFE" stroke="#93C5FD" strokeWidth="1.5" />
                                  {/* Top face */}
                                  <polygon points={pts([ftl, ftr, btr, btl])} fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1.5" />
                                  {/* Right face */}
                                  <polygon points={pts([fbr, bbr, btr, ftr])} fill="#93C5FD" stroke="#60A5FA" strokeWidth="1.5" />

                                  {/* ── Height dimension (left side) ── */}
                                  <line x1={ax - 20} y1={ftl.y + 2} x2={ax - 20} y2={fbl.y - 2} stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 2" />
                                  <line x1={ax - 25} y1={ftl.y + 2} x2={ax - 15} y2={ftl.y + 2} stroke="#3B82F6" strokeWidth="1" />
                                  <line x1={ax - 25} y1={fbl.y - 2} x2={ax - 15} y2={fbl.y - 2} stroke="#3B82F6" strokeWidth="1" />
                                  <rect x={ax - 20 - hLblW / 2} y={hMidY - 12} width={hLblW} height="24" rx="6" fill="white" stroke="#3B82F6" strokeWidth="1" />
                                  <text x={ax - 20} y={hMidY + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="#3B82F6">{hLabel}</text>
                                  <text x={ax - 20} y={fbl.y + 16} textAnchor="middle" fontSize="10" fill="#94A3B8">yükseklik</text>

                                  {/* ── Width dimension (bottom) ── */}
                                  <line x1={fbl.x + 2} y1={fbl.y + 15} x2={fbr.x - 2} y2={fbr.y + 15} stroke="#3B82F6" strokeWidth="1" strokeDasharray="4 2" />
                                  <line x1={fbl.x + 2} y1={fbl.y + 10} x2={fbl.x + 2} y2={fbl.y + 20} stroke="#3B82F6" strokeWidth="1" />
                                  <line x1={fbr.x - 2} y1={fbr.y + 10} x2={fbr.x - 2} y2={fbr.y + 20} stroke="#3B82F6" strokeWidth="1" />
                                  <rect x={wMidX - wLblW / 2} y={fbl.y + 22} width={wLblW} height="24" rx="6" fill="white" stroke="#3B82F6" strokeWidth="1" />
                                  <text x={wMidX} y={fbl.y + 39} textAnchor="middle" fontSize="11" fontWeight="600" fill="#3B82F6">{wLabel}</text>
                                  <text x={wMidX} y={fbl.y + 56} textAnchor="middle" fontSize="10" fill="#94A3B8">genişlik</text>

                                  {/* ── Length/Depth dimension (right side, diagonal) ── */}
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
                                <div className={cn("mb-1.5 text-[11px] font-semibold", fieldErrors[`pkg_${idx}_widthCm`] ? "text-red-500" : "text-[#64748B]")}>Genişlik {fieldErrors[`pkg_${idx}_widthCm`] && <span className="text-red-500">*</span>}</div>
                                <div className={cn("flex items-center rounded-lg ring-1 bg-[#F8FAFC] overflow-hidden transition-colors", fieldErrors[`pkg_${idx}_widthCm`] ? "ring-2 ring-red-500 bg-red-50/30" : "ring-[#E2E8F0] focus-within:ring-[#3B82F6]")}>
                                  <span className="pl-2.5 text-[#94A3B8]"><Ruler className="h-3.5 w-3.5" /></span>
                                  <MeasurementInput value={pkg.widthCm} onChange={v => updatePackageItem(pkg.id, "widthCm", v)} placeholder="0" className="h-10 text-[14px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent px-2" />
                                  <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">cm</span>
                                </div>
                              </div>
                              <div>
                                <div className={cn("mb-1.5 text-[11px] font-semibold", fieldErrors[`pkg_${idx}_lengthCm`] ? "text-red-500" : "text-[#64748B]")}>Uzunluk {fieldErrors[`pkg_${idx}_lengthCm`] && <span className="text-red-500">*</span>}</div>
                                <div className={cn("flex items-center rounded-lg ring-1 bg-[#F8FAFC] overflow-hidden transition-colors", fieldErrors[`pkg_${idx}_lengthCm`] ? "ring-2 ring-red-500 bg-red-50/30" : "ring-[#E2E8F0] focus-within:ring-[#3B82F6]")}>
                                  <span className="pl-2.5 text-[#94A3B8]"><Ruler className="h-3.5 w-3.5 rotate-90" /></span>
                                  <MeasurementInput value={pkg.lengthCm} onChange={v => updatePackageItem(pkg.id, "lengthCm", v)} placeholder="0" className="h-10 text-[14px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent px-2" />
                                  <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">cm</span>
                                </div>
                              </div>
                              <div>
                                <div className={cn("mb-1.5 text-[11px] font-semibold", fieldErrors[`pkg_${idx}_heightCm`] ? "text-red-500" : "text-[#64748B]")}>Yükseklik {fieldErrors[`pkg_${idx}_heightCm`] && <span className="text-red-500">*</span>}</div>
                                <div className={cn("flex items-center rounded-lg ring-1 bg-[#F8FAFC] overflow-hidden transition-colors", fieldErrors[`pkg_${idx}_heightCm`] ? "ring-2 ring-red-500 bg-red-50/30" : "ring-[#E2E8F0] focus-within:ring-[#3B82F6]")}>
                                  <span className="pl-2.5 text-[#94A3B8]"><Ruler className="h-3.5 w-3.5" /></span>
                                  <MeasurementInput value={pkg.heightCm} onChange={v => updatePackageItem(pkg.id, "heightCm", v)} placeholder="0" className="h-10 text-[14px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent px-2" />
                                  <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">cm</span>
                                </div>
                              </div>
                            </div>
                            {/* Row 2: Ağırlık, Adet */}
                            <div className="grid grid-cols-2 gap-3 mb-5">
                              <div>
                                <div className={cn("mb-1.5 text-[11px] font-semibold", fieldErrors[`pkg_${idx}_weightKg`] ? "text-red-500" : "text-[#64748B]")}>Ağırlık {fieldErrors[`pkg_${idx}_weightKg`] && <span className="text-red-500">*</span>}</div>
                                <div className={cn("flex items-center rounded-lg ring-1 bg-[#F8FAFC] overflow-hidden transition-colors", fieldErrors[`pkg_${idx}_weightKg`] ? "ring-2 ring-red-500 bg-red-50/30" : "ring-[#E2E8F0] focus-within:ring-[#3B82F6]")}>
                                  <span className="pl-2.5 text-[#94A3B8]"><Package className="h-3.5 w-3.5" /></span>
                                  <MeasurementInput value={pkg.weightKg} onChange={v => updatePackageItem(pkg.id, "weightKg", v)} placeholder="0" className="h-10 text-[14px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent px-2" />
                                  <span className="pr-2.5 text-[11px] text-[#94A3B8] shrink-0">kg</span>
                                </div>
                              </div>
                              <div>
                                <div className="mb-1.5 text-[11px] font-semibold text-[#64748B]">Adet</div>
                                <div className="flex items-center rounded-lg ring-1 ring-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:ring-[#3B82F6] transition-colors">
                                  <span className="pl-2.5 text-[#94A3B8]"><Package className="h-3.5 w-3.5" /></span>
                                  <NumericInput value={pkg.packageCount} onChange={v => updatePackageItem(pkg.id, "packageCount", v)} placeholder="1" className="h-10 text-[14px] font-semibold border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent px-2" />
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
                                  <span tabIndex={0} className="group relative inline-flex shrink-0 outline-none" aria-label="Ücretlendirme nasıl hesaplanır?">
                                    <Info className="h-3.5 w-3.5 cursor-help text-[#94A3B8] transition-colors hover:text-[#475569]" />
                                    <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-[11px] font-normal leading-relaxed text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus:opacity-100">
                                      Ücretlendirme hesaplanırken tartı ağırlığı ve hacimsel (desi) ağırlık karşılaştırılır; taşıyıcı firmalar, iki değerden yüksek olanı ücretlendirmede baz alır.
                                    </span>
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div className={cn("rounded-xl p-3 ring-1", !isVolHigher ? "bg-white ring-[#10B981]/30" : "bg-white ring-[#E2E8F0]")}>
                                    <div className="text-[11px] text-[#94A3B8] mb-1 flex items-center gap-1.5">
                                      <Package className="h-3 w-3" /> Tartı Ağırlığı
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[18px] font-bold text-[#0F172A]">{(pkgActual * pkgCount).toFixed(1)} kg</span>
                                      {!isVolHigher && <CheckCircle2 className="h-5 w-5 text-[#10B981]" />}
                                    </div>
                                  </div>
                                  <div className={cn("rounded-xl p-3 ring-1", isVolHigher ? "bg-white ring-[#10B981]/30" : "bg-white ring-[#E2E8F0]")}>
                                    <div className="text-[11px] text-[#94A3B8] mb-1 flex items-center gap-1.5">
                                      <Ruler className="h-3 w-3" /> Hacimsel Ağırlık
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[18px] font-bold text-[#0F172A]">{(pkgVol * pkgCount).toFixed(1)} kg</span>
                                      {isVolHigher && <CheckCircle2 className="h-5 w-5 text-[#10B981]" />}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Save measurement */}
                        <div className="mt-4 flex items-center gap-2">
                          <button type="button" onClick={() => updatePackageItem(pkg.id, "saveMeasurement", !pkg.saveMeasurement)} className="flex items-center gap-2 group outline-none text-[13px] text-[#64748B] hover:text-[#0F172A] transition-colors">
                            <div className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors", pkg.saveMeasurement ? "bg-[#3959F2] border-[#4F46E5] text-white" : "border-[#CBD5E1] bg-white")}>
                              {pkg.saveMeasurement && <Check className="h-3 w-3" />}
                            </div>
                            Şablon olarak kaydet
                          </button>
                          {pkg.saveMeasurement && (
                            <Input value={pkg.measurementLabel || ""} onChange={(e) => updatePackageItem(pkg.id, "measurementLabel", e.target.value)} placeholder="Örn: Küçük Kutu" className="h-8 max-w-[200px] text-[12px] rounded-lg" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPackageExcel(true)}
                  className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-[#475569] ring-1 ring-[#E2E8F0] bg-white hover:bg-[#F8FAFC] transition-colors"
                >
                  <FileSpreadsheet className="h-4 w-4" /> Excel ile Toplu Yükle
                </button>
                <button
                  type="button"
                  onClick={addPackageItem}
                  className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white bg-[#3959F2] hover:bg-[#4338CA] transition-colors"
                >
                  <Plus className="h-4 w-4" /> Farklı Ölçüde Koli Ekle
                </button>
              </div>

              {/* Sticky bottom bar */}
        {/* Sticky bottom bar */}
              <div className="sticky bottom-4 z-40 pointer-events-none mt-auto">
                <div className="pointer-events-auto bg-[#0F172A] text-white shadow-2xl rounded-2xl">
                  <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                    <div className="flex items-center justify-between sm:block">
                      <div className="text-[13px] sm:text-[14px] font-bold">Genel Toplam</div>
                      <div className="text-[11px] sm:text-[12px] text-[#94A3B8]">
                        {totalPackageCount} koli • {chargeableWeight.toFixed(1)} kg
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:gap-6">
                      <div className="text-left sm:text-right">
                        <div className="text-[10px] sm:text-[11px] text-[#94A3B8]">Ücretlendirme</div>
                        <div className="text-[18px] sm:text-[24px] font-bold leading-tight">{chargeableWeight.toFixed(1)}kg</div>
                      </div>
                      <button type="button" onClick={next} disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#3959F2] hover:bg-[#4338CA] px-4 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-bold text-white transition-colors disabled:opacity-50">
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Sonraki Adım <span>→</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 2 — Fiyatlandırma ===== */}
          {step === 2 && (() => {
            const topCarrierIds = new Set<string>();
            if (recommendedQ) topCarrierIds.add(recommendedQ.carrierId);
            if (fastestQ) topCarrierIds.add(fastestQ.carrierId);
            if (cheapestQ) topCarrierIds.add(cheapestQ.carrierId);
            const otherCarriers = apiQuotes.filter((q, i, arr) => arr.findIndex(x => x.carrierId === q.carrierId) === i && !topCarrierIds.has(q.carrierId));
            const sym = selectedQuote ? getCurrencySymbol(selectedQuote.currency) : "$";
            const uniqueQuotes = apiQuotes.filter((q, i, arr) => arr.findIndex(x => x.carrierId === q.carrierId) === i);

            const renderCarrierRow = (q: ApiCarrierQuote) => {
              const isSelected = draft.selectedCarrierId === q.carrierId;
              const logoColor = getLogoColor(q);
              const qSym = getCurrencySymbol(q.currency);
              return (
                <button key={q.carrierId} type="button" onClick={() => update("selectedCarrierId", q.carrierId)} className={cn("group flex w-full items-center justify-between rounded-2xl px-3 sm:px-5 py-3 sm:py-4 text-left ring-1 transition-all", isSelected ? "bg-white ring-2 ring-[#4F46E5] shadow-sm" : "bg-white ring-[#E2E8F0] hover:ring-[#CBD5E1] hover:shadow-sm")}>
                  <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
<CarrierLogo q={q} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        <span className="text-[13px] sm:text-[14px] font-bold text-[#0F172A]">{q.carrierName}</span>
                        <span className="text-[11px] sm:text-[12px] text-[#94A3B8]">{q.serviceName}</span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-[12px] text-[#94A3B8]">
                        <Clock className="h-3 w-3 shrink-0" />
                        <span className="hidden sm:inline">Teslimat:</span>
                        <span className="font-medium text-[#475569]">{q.deliveryLabel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-[15px] sm:text-[18px] font-bold text-[#0F172A]">{qSym}{q.price.toFixed(2)}</div>
                      <div className="text-[11px] text-[#94A3B8]">≈ ₺{q.priceTry.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
                    </div>
                    <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 transition-colors", isSelected ? "bg-[#3959F2] ring-[#4F46E5] text-white" : "bg-white ring-[#CBD5E1] group-hover:ring-[#94A3B8]")}>
                      {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>
              );
            };

       const renderTaggedCarrier = (q: ApiCarrierQuote, tagLabel: string, tagColor: string, headerBg: string, borderColor: string, cardRing: string, TagIcon: any, showBestLabel?: boolean) => {
  const isSelected = draft.selectedCarrierId === q.carrierId;
  const qSym = getCurrencySymbol(q.currency);
  return (
    <button key={q.carrierId} type="button" onClick={() => update("selectedCarrierId", q.carrierId)} className={cn("group w-full text-left rounded-2xl overflow-hidden transition-all", isSelected ? cn("bg-white shadow-lg", cardRing ? "ring-2 ring-[#4F46E5]" : "shadow-[0_0_0_2px_rgba(79,70,229,0.15)]") : cn("bg-white hover:shadow-sm", cardRing))}>
      {/* Tag header */}
      <div className={cn("flex items-center justify-between border-b px-3 sm:px-5 pt-2.5 sm:pt-3 pb-1.5 sm:pb-2", headerBg, borderColor)}>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold ", tagColor)}>
          <TagIcon className="h-3 w-3" />{tagLabel}
        </span>
        {showBestLabel && <span className="text-[10px] sm:text-[11px] font-medium flex items-center gap-1 text-[#6366F1]"><Star className="h-3 w-3" /><span className="hidden sm:inline">En iyi fiyat / performans</span><span className="sm:hidden">En iyi</span></span>}
      </div>
      {/* Content */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 sm:py-4">
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          
          {/* 🚀 DEĞİŞEN TEK SATIR BURASI: Manuel div yerine CarrierLogo component'ini çağırdık 🚀 */}
          <CarrierLogo q={q} />

          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
              <span className="text-[13px] sm:text-[14px] font-bold text-[#0F172A]">{q.carrierName}</span>
              <span className="text-[11px] sm:text-[12px] text-[#94A3B8]">{q.serviceName}</span>
            </div>
            <div className="mt-0.5 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-[12px] text-[#94A3B8]">
              <Clock className="h-3 w-3 shrink-0" />
              <span className="hidden sm:inline">Teslimat:</span>
              <span className="font-medium text-[#475569]">{q.deliveryLabel}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <div className="text-right">
            <div className="text-[15px] sm:text-[18px] font-bold text-[#0F172A]">{qSym}{q.price.toFixed(2)}</div>
            <div className="text-[10px] sm:text-[11px] text-[#94A3B8]">≈ ₺{q.priceTry.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          </div>
          <div className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 transition-colors", isSelected ? "bg-[#3959F2] ring-[#4F46E5] text-white" : "bg-white ring-[#CBD5E1] group-hover:ring-[#94A3B8]")}>
            {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
        </div>
      </div>
    </button>
  );
};

            return (
              <div className="space-y-5 pb-24">
                <RouteSummaryBar senderCountry={draft.senderCountry} senderName={apiCountries.find(x => x.value === draft.senderCountry)?.name} senderFlag={apiCountries.find(x => x.value === draft.senderCountry)?.flag} receiverCountry={draft.receiverCountry} chargeableWeight={chargeableWeight} receiverName={apiCountries.find(x => x.value === draft.receiverCountry)?.name} receiverFlag={apiCountries.find(x => x.value === draft.receiverCountry)?.flag} />

                {/* Header */}
                <div>
                  <button type="button" onClick={back} className="flex items-center gap-1 text-[12px] text-[#94A3B8] hover:text-[#475569] mb-2 transition-colors">← Geri Dön</button>
                  <div className="flex items-center gap-3">
                    <h2 className="text-[18px] font-bold text-[#0F172A]">Kargo Seçenekleri</h2>
                    {uniqueQuotes.length > 0 && <span className="text-[13px] text-[#94A3B8]">{uniqueQuotes.length} fiyat teklifi</span>}
                  </div>
                </div>

                {/* Empty state */}
                {apiQuotes.length === 0 && quotesMessage && (
                  <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-amber-50 p-8 text-center ring-1 ring-amber-200">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600"><Info className="h-7 w-7" /></div>
                    <div>
                      <div className="text-sm font-semibold text-amber-800">{quotesMessage}</div>
                      <p className="mt-1 text-xs text-amber-600">Farklı bir rota veya paket bilgisi ile tekrar deneyebilirsiniz.</p>
                    </div>
                  </div>
                )}

                {/* Top tagged carriers */}
                {apiQuotes.length > 0 && (
                  <div className="flex flex-col gap-4">
                    {recommendedQ && renderTaggedCarrier(
                      recommendedQ,
                      "Tavsiye Edilen",
                      "bg-white text-[#6366F1] ring-[#6366F1]/30",
                      "bg-[#F5F3FF]",
                      "border-transparent",
                      "ring-1 ring-[#8B5CF6]/20",
                      Star,
                      true
                    )}
                    {fastestQ && fastestQ.carrierId !== recommendedQ?.carrierId && renderTaggedCarrier(
                      fastestQ,
                      "En Hızlı",
                      "bg-white text-[#F59E0B] ring-[#F59E0B]/30",
                      "bg-[#FEFCE8]",
                      "border-[#F59E0B]",
                      "ring-1 ring-[#F59E0B]/30",
                      Zap
                    )}
                    {cheapestQ && cheapestQ.carrierId !== recommendedQ?.carrierId && cheapestQ.carrierId !== fastestQ?.carrierId && renderTaggedCarrier(
                      cheapestQ,
                      "En Uygun",
                      "bg-white text-[#10B981] ring-[#10B981]/30",
                      "bg-[#ECFDF5]",
                      "border-[#10B981]",
                      "ring-1 ring-[#10B981]/30",
                      BadgeDollarSign
                    )}
                  </div>
                )}

                {/* Other carriers - shown by default */}
                {otherCarriers.length > 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-px bg-[#E2E8F0]" />
                      <button type="button" onClick={() => setShowMoreCarriers(!showMoreCarriers)} className="flex items-center gap-2 text-[13px] font-semibold text-[#475569] hover:text-[#0F172A] transition-colors">
                        Diğer Seçenekler ({otherCarriers.length})
                        <svg className={cn("h-4 w-4 transition-transform", showMoreCarriers && "rotate-180")} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>
                      </button>
                      <div className="flex-1 h-px bg-[#E2E8F0]" />
                    </div>
                    {showMoreCarriers && (
                      <div className="flex flex-col gap-3">
                        {otherCarriers.map(q => renderCarrierRow(q))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sticky bottom bar - right side only */}
             {/* Sticky bottom bar - right side only */}
                {selectedQuote && (
                  <div className="sticky bottom-4 z-40 pointer-events-none mt-auto">
                    <div className="pointer-events-auto bg-[#0F172A] text-white shadow-2xl rounded-2xl">
                      <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="min-w-0">
                            <div className="text-[13px] sm:text-[14px] font-bold truncate">{selectedQuote.carrierName} – {selectedQuote.serviceName}</div>
                            <div className="text-[11px] sm:text-[12px] text-[#94A3B8] flex items-center gap-1.5"><Clock className="h-3 w-3" /> {selectedQuote.deliveryLabel}</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 sm:gap-6">
                          <div className="text-left sm:text-right">
                            <div className="text-[18px] sm:text-[22px] font-bold leading-tight">{sym}{selectedQuote.price.toFixed(2)}</div>
                            <div className="text-[10px] sm:text-[11px] text-[#94A3B8]">≈ ₺{selectedQuote.priceTry.toLocaleString("tr-TR", { minimumFractionDigits: 0 })}</div>
                          </div>
                          <button type="button" onClick={next} disabled={loading} className="flex items-center gap-2 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] px-4 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-bold text-white transition-colors disabled:opacity-50 shrink-0">
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            Devam <span>→</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ===== STEP 3 ===== */}
          {/* ===== STEP 3 — Adres Seçimi ===== */}
          {step === 3 && (() => {
            const selectedSender = SAVED_SENDER_ADDRESSES.find(a => String(a.id) === draft.selectedSenderAddressId);
            const selectedReceiver = SAVED_RECEIVER_ADDRESSES.find(a => String(a.id) === draft.selectedReceiverAddressId);
            const hasSender = !!draft.selectedSenderAddressId || !!draft.senderName;
            const hasReceiver = !!draft.selectedReceiverAddressId || !!draft.receiverName;
            const senderLabel = selectedSender?.name || draft.senderName || "";
            const receiverLabel = selectedReceiver?.name || draft.receiverName || "";
            const senderCompanyLabel = selectedSender?.company || draft.senderCompany || "";
            const receiverCompanyLabel = selectedReceiver?.company || draft.receiverCompany || "";
            const senderCityLabel = selectedSender?.city || draft.senderCity || "";
            const receiverCityLabel = selectedReceiver?.city || draft.receiverCity || "";

            return (
              <div className="space-y-5 pb-24">
                {/* Header */}
                <div>
                  <h2 className="text-[18px] font-bold text-[#0F172A]">Adres Bilgileri</h2>
                  <p className="text-[13px] text-[#94A3B8] mt-1">Gönderen ve alıcı adreslerini seçin veya yeni ekleyin.</p>
                </div>

                {/* Tabs */}
                <div className="flex rounded-xl overflow-hidden ring-1 ring-[#E2E8F0]">
                  <button type="button" onClick={() => setAddressTab("sender")} className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-semibold transition-colors", addressTab === "sender" ? "bg-[#0F172A] text-white" : "bg-white text-[#64748B] hover:bg-[#F8FAFC]")}>
                    {hasSender ? <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="h-2.5 w-2.5 text-white" /></div> : <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold">1</span>}
                    Gönderici
                  </button>
                  <button type="button" onClick={() => setAddressTab("receiver")} className={cn("flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-semibold transition-colors", addressTab === "receiver" ? "bg-[#0F172A] text-white" : "bg-white text-[#64748B] hover:bg-[#F8FAFC]")}>
                    {hasReceiver ? <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="h-2.5 w-2.5 text-white" /></div> : <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold">2</span>}
                    Alıcı
                  </button>
                </div>

                {/* ===== Gönderici Tab ===== */}
                {addressTab === "sender" && (
                  <div className="space-y-3">

                    {/* ── Son Kullanılan Göndericiler ── */}
                    {SAVED_SENDER_ADDRESSES.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-50">
                            <Clock className="h-3 w-3 text-indigo-500" />
                          </div>
                          <span className="text-[12px] sm:text-[13px] font-semibold text-slate-600">Son Kullanılan Göndericiler</span>
                        </div>
                        <div className="flex gap-2 sm:gap-2.5 overflow-x-auto pt-1 pb-2 scrollbar-none -mx-1 px-1">
                          {SAVED_SENDER_ADDRESSES.slice(0, 5).map((a) => {
                            const initials = (a.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                            const isSelected = draft.selectedSenderAddressId === String(a.id);
                            return (
                              <button
                                key={String(a.id)}
                                type="button"
                                onClick={() => { setDraft(d => ({ ...d, selectedSenderAddressId: String(a.id), senderName: a.name || "", senderPhone: a.phone || "+90", senderAddress: a.address || "", senderCity: a.city || "", senderTown: (a as any).town || "", senderCompany: a.company || "" })); setShowNewSenderForm(false); }}
                                className={cn(
                                  "group relative flex flex-col items-center gap-1.5 sm:gap-2 rounded-2xl p-3 sm:p-4 min-w-[90px] sm:min-w-[110px] text-center transition-all duration-200 shrink-0",
                                  isSelected
                                    ? "bg-indigo-50 ring-2 ring-indigo-500 shadow-md shadow-indigo-100"
                                    : "bg-white ring-1 ring-slate-200 hover:ring-indigo-200 hover:shadow-md hover:shadow-indigo-50 hover:-translate-y-0.5"
                                )}
                              >
                                {isSelected && (
                                  <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex h-4 w-4 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-indigo-500 text-white">
                                    <Check className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                  </div>
                                )}
                                <div className={cn(
                                  "flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl text-[11px] sm:text-[13px] font-bold text-white shadow-sm transition-transform group-hover:scale-105",
                                  isSelected
                                    ? "bg-gradient-to-br from-indigo-500 to-indigo-700"
                                    : "bg-gradient-to-br from-slate-400 to-slate-600"
                                )}>
                                  {initials}
                                </div>
                                <div className="min-w-0 w-full">
                                  <div className="text-[11px] sm:text-[12px] font-bold text-slate-800 truncate leading-tight">{a.name}</div>
                                  <div className="text-[9px] sm:text-[10px] text-slate-400 truncate leading-tight mt-0.5">{a.city} · {a.countryCode}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-[14px] font-semibold text-[#0F172A]">Kayıtlı Gönderici Adresleriniz</div>
                      <button type="button" onClick={() => { setShowNewSenderForm(!showNewSenderForm); if (!showNewSenderForm) update("selectedSenderAddressId", ""); }} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors">
                        <Plus className="h-3.5 w-3.5" />Yeni Gönderici Adresi Ekle
                      </button>
                    </div>

                    <div className="relative flex items-center rounded-lg ring-1 ring-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:ring-[#3B82F6] transition-colors">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
                      <Input value={senderSearch} onChange={e => setSenderSearch(e.target.value)} placeholder="İsim veya adres ile arayın..." className="pl-9 h-9 border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent text-[12px]" />
                    </div>

                    {!showNewSenderForm && (filteredSenderAddresses.length > 0
                      ? <div className="flex flex-col gap-2">
                          {filteredSenderAddresses.map(a => {
                            const isSelected = draft.selectedSenderAddressId === String(a.id);
                            const isEditing = editingSenderAddr?.id === a.id;

                            if (isEditing) {
                              return (
                                <div key={String(a.id)} className="rounded-xl bg-white p-4 ring-2 ring-[#4F46E5] shadow-sm">
                                  <div className="mb-3 flex items-center justify-between">
                                    <div className="text-[13px] font-semibold text-[#0F172A]">Adresi Düzenle</div>
                                    <button type="button" onClick={() => setEditingSenderAddr(null)} className="text-[12px] font-medium text-[#94A3B8] hover:text-[#475569]">İptal</button>
                                  </div>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Ad Soyad" icon={User}><NameInput value={editingSenderAddr.name} onChange={v => setEditingSenderAddr({ ...editingSenderAddr, name: v })} placeholder="Ad soyad" maxLength={60} /></Field>
                                    <Field label="Firma Adı" icon={Building}><Input value={editingSenderAddr.company || ""} onChange={e => setEditingSenderAddr({ ...editingSenderAddr, company: e.target.value })} placeholder="Firma (opsiyonel)" /></Field>
                                    <Field label="Telefon" icon={Phone}><PhoneInput bare value={editingSenderAddr.phone || ""} onChange={v => setEditingSenderAddr({ ...editingSenderAddr, phone: v })} defaultDialCode="+90" placeholder="5XX XXX XX XX" /></Field>
                                    <Field label="Şehir" icon={MapPin}><Input value={editingSenderAddr.city} onChange={e => setEditingSenderAddr({ ...editingSenderAddr, city: e.target.value })} placeholder="Şehir" /></Field>
                                    <Field label="İlçe" icon={MapPin}><Input value={(editingSenderAddr as any).town || ""} onChange={e => setEditingSenderAddr({ ...editingSenderAddr, town: e.target.value } as any)} placeholder="İlçe" /></Field>
                                    <div className="sm:col-span-2"><Field label="Açık Adres" icon={MapPinned}><Input value={editingSenderAddr.address} onChange={e => setEditingSenderAddr({ ...editingSenderAddr, address: e.target.value })} placeholder="Sokak, cadde, bina no..." /></Field></div>
                                  </div>
                                  <div className="mt-3 flex justify-end gap-2">
                                    <Button type="button" variant="secondary" onClick={() => setEditingSenderAddr(null)} className="gap-1 text-[12px]"><X className="h-3.5 w-3.5" />Vazgeç</Button>
                                    <Button type="button" disabled={editSenderBusy} onClick={async () => {
                                      setEditSenderBusy(true);
                                      try {
                                        await api.updateAddress(editingSenderAddr.id, {
                                          label: editingSenderAddr.label || editingSenderAddr.name,
                                          name: editingSenderAddr.name,
                                          company: editingSenderAddr.company,
                                          phone: editingSenderAddr.phone,
                                          address: editingSenderAddr.address,
                                          postalCode: editingSenderAddr.postalCode,
                                          city: editingSenderAddr.city,
                                          town: (editingSenderAddr as any).town,
                                          stateProvince: editingSenderAddr.stateProvince,
                                          countryCode: editingSenderAddr.countryCode,
                                        });
                                        const res = await api.listAddresses();
                                        setApiAddresses(res.addresses);
                                        if (isSelected) {
                                          setDraft(d => ({ ...d, senderName: editingSenderAddr.name, senderPhone: editingSenderAddr.phone || "+90", senderAddress: editingSenderAddr.address, senderCity: editingSenderAddr.city, senderTown: (editingSenderAddr as any).town || "", senderCompany: editingSenderAddr.company || "" }));
                                        }
                                        setEditingSenderAddr(null);
                                      } catch { }
                                      finally { setEditSenderBusy(false); }
                                    }} className="gap-1 text-[12px] bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                                      {editSenderBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                      Kaydet
                                    </Button>
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div key={String(a.id)} className={cn("group flex w-full items-center justify-between rounded-xl p-3 ring-1 transition-all", isSelected ? "bg-white ring-2 ring-[#4F46E5] shadow-sm" : "bg-white ring-[#E2E8F0] hover:ring-[#CBD5E1] hover:shadow-sm")}>
                                <button type="button" onClick={() => { setDraft(d => ({ ...d, selectedSenderAddressId: String(a.id), senderName: a.name || "", senderPhone: a.phone || "+90", senderAddress: a.address || "", senderCity: a.city || "", senderTown: (a as any).town || "", senderCompany: a.company || "" })); setShowNewSenderForm(false); }} className="flex items-center gap-3 text-left flex-1 min-w-0">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F5F9] text-[#94A3B8]">
                                    <User className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[13px] font-bold text-[#0F172A]">{a.name}</div>
                                    <div className="text-[11px] text-[#94A3B8] truncate">{a.company && <>{a.company} · </>}{a.city} · {a.address}</div>
                                  </div>
                                </button>
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                  <button type="button" onClick={(e) => { e.stopPropagation(); setEditingSenderAddr({ ...a }); }} className="grid h-7 w-7 place-items-center rounded-lg text-[#94A3B8] hover:bg-[#EEF2FF] hover:text-[#4F46E5] transition-colors opacity-0 group-hover:opacity-100" title="Düzenle">
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button type="button" onClick={async (e) => { e.stopPropagation(); if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) return; try { await api.deleteAddress(a.id); const res = await api.listAddresses(); setApiAddresses(res.addresses); if (isSelected) update("selectedSenderAddressId", ""); } catch {} }} className="grid h-7 w-7 place-items-center rounded-lg text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Sil">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                  <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-2 transition-colors ml-1", isSelected ? "bg-[#3959F2] ring-[#4F46E5]" : "bg-white ring-[#CBD5E1] group-hover:ring-[#94A3B8]")}>
                                    {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      : <div className="rounded-xl bg-[#F8FAFC] p-4 text-center text-[12px] text-[#94A3B8] ring-1 ring-[#E2E8F0]">{senderSearch ? "Arama kriterlerinize uygun kayıtlı gönderici adresi bulunamadı." : "Kayıtlı gönderici adresiniz bulunmamaktadır."}</div>
                    )}

                    {showNewSenderForm && (
                      <div className="rounded-xl bg-white p-4 ring-1 ring-[#E2E8F0]">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-[13px] font-semibold text-[#0F172A]">Yeni Gönderici Adresi</div>
                          <button type="button" onClick={() => setShowNewSenderForm(false)} className="text-[12px] font-medium text-[#94A3B8] hover:text-[#475569]">İptal</button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Field label="Ad Soyad" icon={User}><NameInput value={draft.senderName} onChange={v => update("senderName", v)} placeholder="Gönderici adı soyadı" maxLength={60} /></Field>
                          <Field label="Firma Adı" icon={Building}><Input value={draft.senderCompany} onChange={e => update("senderCompany", e.target.value)} placeholder="Firma adı (opsiyonel)" /></Field>
                          <Field label="Telefon" icon={Phone}><PhoneInput bare value={draft.senderPhone} onChange={raw => update("senderPhone", raw)} defaultDialCode="+90" placeholder="5XX XXX XX XX" /></Field>
                          <Field label="Şehir" icon={MapPin}>
                            <CitySelect
                              countryCode={draft.senderCountry || "TR"}
                              value={draft.senderCity}
                              onChange={(v) => update("senderCity", v)}
                              onStateIdChange={(id) => update("senderStateId", id)}
                              placeholder="Şehir seçiniz"
                              className="h-10 border-0 ring-0 focus:ring-0 bg-transparent text-sm px-2"
                            />
                          </Field>
                          <Field label="İlçe" icon={MapPin}><Input value={draft.senderTown} onChange={e => update("senderTown", e.target.value)} placeholder="İlçe giriniz" /></Field>
                          <div className="sm:col-span-2"><Field label="Açık Adres" icon={MapPinned}><Input value={draft.senderAddress} onChange={e => update("senderAddress", e.target.value)} placeholder="Sokak, cadde, bina no, daire no..." /></Field></div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button type="button" variant={draft.saveSenderAddress ? "primary" : "secondary"} onClick={() => update("saveSenderAddress", !draft.saveSenderAddress)}
                            className={cn("gap-2 transition-all", draft.saveSenderAddress && "bg-brand-600 text-white hover:bg-brand-700 border-none ring-0 focus-visible:ring-0")}>
                            {draft.saveSenderAddress ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                            {draft.saveSenderAddress ? "Gönderici Adresini Kaydet Seçildi" : "Gönderici Adresini Kaydet"}
                          </Button>
                        </div>
                      </div>
                    )}


                  </div>
                )}

                {/* ===== Alıcı Tab ===== */}
                {addressTab === "receiver" && (
                  <div className="space-y-3">

                    {/* ── Son Gönderilen Alıcılar ── */}
                    {SAVED_RECEIVER_ADDRESSES.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold uppercase text-[#94A3B8] tracking-widest mb-2">Son Gönderilen Alıcılar</div>
                        <div className="flex flex-wrap gap-2">
                          {SAVED_RECEIVER_ADDRESSES.slice(0, 5).map((a) => {
                            const initials = (a.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                            const isSelected = draft.selectedReceiverAddressId === String(a.id);
                            const colors = ["bg-gradient-to-br from-violet-500 to-indigo-600", "bg-gradient-to-br from-emerald-500 to-teal-600", "bg-gradient-to-br from-amber-500 to-orange-600", "bg-gradient-to-br from-rose-500 to-pink-600", "bg-gradient-to-br from-sky-500 to-blue-600"];
                            const colorIdx = a.id % colors.length;
                            const isCountryMismatch = a.countryCode && a.countryCode.toUpperCase() !== draft.receiverCountry.toUpperCase();
                            const targetCountryName = apiCountries.find(c => c.value.toUpperCase() === draft.receiverCountry.toUpperCase())?.name || draft.receiverCountry;

                            return (
                              <button
                                key={String(a.id)}
                                type="button"
                                onClick={() => { setDraft(d => ({ ...d, selectedReceiverAddressId: String(a.id), receiverName: a.name || "", receiverCompany: a.company || "", receiverPhone: a.phone || "", receiverAddress: a.address || "", receiverCity: a.city || "", receiverStateProvince: a.stateProvince || a.city || "", receiverAddressCountry: a.countryCode || "", receiverAddressPostalCode: a.postalCode || "" })); setShowNewReceiverForm(false); }}
                                className={cn(
                                  "flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3 text-left ring-1 transition-all hover:shadow-md",
                                  isCountryMismatch
                                    ? (isSelected ? "bg-amber-50 ring-2 ring-amber-400 shadow-sm" : "bg-amber-50/50 ring-amber-200 hover:ring-amber-300")
                                    : (isSelected ? "bg-white ring-2 ring-[#4F46E5] shadow-sm" : "bg-white ring-[#E2E8F0] hover:ring-[#CBD5E1]")
                                )}
                              >
                                <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm", isCountryMismatch ? "bg-amber-500" : colors[colorIdx])}>
                                  {isCountryMismatch ? <AlertTriangle className="h-3.5 w-3.5" /> : initials}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[12px] font-bold text-[#0F172A] truncate leading-tight flex items-center gap-1">
                                    {a.name}
                                    {isCountryMismatch && <span className="text-[9px] font-semibold text-amber-600">Uyuşmazlık</span>}
                                  </div>
                                  <div className="text-[10px] text-[#94A3B8] truncate leading-tight">{a.city} · {a.countryCode}</div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-[14px] font-semibold text-[#0F172A]">Kayıtlı Alıcı Adresleri</div>
                      <button type="button" onClick={() => { setShowNewReceiverForm(!showNewReceiverForm); if (!showNewReceiverForm) update("selectedReceiverAddressId", ""); }} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#4F46E5] hover:text-[#4338CA] transition-colors">
                        <Plus className="h-3.5 w-3.5" />Yeni Alıcı Adresi Ekle
                      </button>
                    </div>

                    <div className="relative flex items-center rounded-lg ring-1 ring-[#E2E8F0] bg-[#F8FAFC] overflow-hidden focus-within:ring-[#3B82F6] transition-colors">
                      <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#94A3B8]" />
                      <Input value={receiverSearch} onChange={e => setReceiverSearch(e.target.value)} placeholder="İsim veya adres ile arayın..." className="pl-9 h-9 border-0 ring-0 focus:ring-0 focus-visible:ring-0 shadow-none bg-transparent text-[12px]" />
                    </div>

                    {!showNewReceiverForm && (filteredReceiverAddresses.length > 0
                      ? <div className="flex flex-col gap-2">
                          {filteredReceiverAddresses.map(a => {
                            const isSelected = draft.selectedReceiverAddressId === String(a.id);
                            const isEditing = editingReceiverAddr?.id === a.id;
                            const initials = (a.name || "?").split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
                            const colors = ["bg-gradient-to-br from-violet-500 to-indigo-600", "bg-gradient-to-br from-emerald-500 to-teal-600", "bg-gradient-to-br from-amber-500 to-orange-600", "bg-gradient-to-br from-rose-500 to-pink-600", "bg-gradient-to-br from-sky-500 to-blue-600"];
                            const colorIdx = a.id % colors.length;

                            if (isEditing) {
                              return (
                                <div key={String(a.id)} className="rounded-2xl bg-white p-5 ring-2 ring-[#4F46E5] shadow-lg shadow-indigo-100/50 animate-in fade-in">
                                  <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm", colors[colorIdx])}>{initials}</div>
                                      <div className="text-[13px] font-semibold text-[#0F172A]">Adresi Düzenle</div>
                                    </div>
                                    <button type="button" onClick={() => setEditingReceiverAddr(null)} className="text-[12px] font-medium text-[#94A3B8] hover:text-[#475569] transition-colors">İptal</button>
                                  </div>
                                  <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Ad Soyad" icon={User}><NameInput value={editingReceiverAddr.name} onChange={v => setEditingReceiverAddr({ ...editingReceiverAddr, name: v })} placeholder="Ad soyad" maxLength={60} /></Field>
                                    <Field label="Firma Adı" icon={Building}><Input value={editingReceiverAddr.company || ""} onChange={e => setEditingReceiverAddr({ ...editingReceiverAddr, company: e.target.value })} placeholder="Firma (opsiyonel)" /></Field>
                                    <Field label="Telefon" icon={Phone}><PhoneInput bare value={editingReceiverAddr.phone || ""} onChange={v => setEditingReceiverAddr({ ...editingReceiverAddr, phone: v })} defaultDialCode="+90" placeholder="Telefon numarası" /></Field>
                                    <Field label="Şehir" icon={MapPin}><Input value={editingReceiverAddr.city} onChange={e => setEditingReceiverAddr({ ...editingReceiverAddr, city: e.target.value })} placeholder="Şehir" /></Field>
                                    <Field label="Posta Kodu" icon={MapPin}><Input value={editingReceiverAddr.postalCode || ""} onChange={e => setEditingReceiverAddr({ ...editingReceiverAddr, postalCode: e.target.value })} placeholder="Posta kodu" /></Field>
                                    <Field label="Ülke Kodu" icon={Globe}><Input value={editingReceiverAddr.countryCode || ""} onChange={e => setEditingReceiverAddr({ ...editingReceiverAddr, countryCode: e.target.value.toUpperCase() })} placeholder="DE, US..." maxLength={2} /></Field>
                                    <div className="sm:col-span-2"><Field label="Açık Adres" icon={MapPinned}><Input value={editingReceiverAddr.address} onChange={e => setEditingReceiverAddr({ ...editingReceiverAddr, address: e.target.value })} placeholder="Sokak, cadde, bina no..." /></Field></div>
                                  </div>
                                  <div className="mt-4 flex justify-end gap-2">
                                    <Button type="button" variant="secondary" onClick={() => setEditingReceiverAddr(null)} className="gap-1.5 text-[12px] rounded-xl"><X className="h-3.5 w-3.5" />Vazgeç</Button>
                                    <Button type="button" disabled={editReceiverBusy} onClick={async () => {
                                      setEditReceiverBusy(true);
                                      try {
                                        await api.updateAddress(editingReceiverAddr.id, {
                                          label: editingReceiverAddr.label || editingReceiverAddr.name,
                                          name: editingReceiverAddr.name,
                                          company: editingReceiverAddr.company,
                                          phone: editingReceiverAddr.phone,
                                          address: editingReceiverAddr.address,
                                          postalCode: editingReceiverAddr.postalCode,
                                          city: editingReceiverAddr.city,
                                          town: (editingReceiverAddr as any).town,
                                          stateProvince: editingReceiverAddr.stateProvince,
                                          countryCode: editingReceiverAddr.countryCode,
                                        });
                                        const res = await api.listAddresses();
                                        setApiAddresses(res.addresses);
                                        if (isSelected) {
                                          setDraft(d => ({ ...d, receiverName: editingReceiverAddr.name, receiverPhone: editingReceiverAddr.phone || "", receiverAddress: editingReceiverAddr.address, receiverCity: editingReceiverAddr.city, receiverCompany: editingReceiverAddr.company || "" }));
                                        }
                                        setEditingReceiverAddr(null);
                                      } catch { }
                                      finally { setEditReceiverBusy(false); }
                                    }} className="gap-1.5 text-[12px] bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl shadow-md shadow-indigo-200/50">
                                      {editReceiverBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                      Kaydet
                                    </Button>
                                  </div>
                                </div>
                              );
                            }

                            const isCountryMismatch = a.countryCode && a.countryCode.toUpperCase() !== draft.receiverCountry.toUpperCase();
                            const targetCountryName = apiCountries.find(c => c.value.toUpperCase() === draft.receiverCountry.toUpperCase())?.name || draft.receiverCountry;

                            return (
                              <div key={String(a.id)} className={cn("group flex w-full flex-col justify-between rounded-2xl p-3.5 ring-1 transition-all", isCountryMismatch ? (isSelected ? "bg-amber-50 ring-2 ring-amber-400 shadow-md" : "bg-amber-50/50 ring-amber-200 hover:ring-amber-300 hover:shadow-md") : (isSelected ? "bg-white ring-2 ring-[#4F46E5] shadow-md shadow-indigo-100/50" : "bg-white ring-[#E2E8F0] hover:ring-[#CBD5E1] hover:shadow-md"))}>
                                <div className="flex w-full items-center justify-between">
                                  <button type="button" onClick={() => { setDraft(d => ({ ...d, selectedReceiverAddressId: String(a.id), receiverName: a.name || "", receiverCompany: a.company || "", receiverPhone: a.phone || "", receiverAddress: a.address || "", receiverCity: a.city || "", receiverStateProvince: a.stateProvince || a.city || "", receiverAddressCountry: a.countryCode || "", receiverAddressPostalCode: a.postalCode || "" })); setShowNewReceiverForm(false); }} className="flex items-center gap-3 text-left flex-1 min-w-0">
                                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm", colors[colorIdx])}>
                                      {initials}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-bold text-[#0F172A]">{a.name}</span>
                                        {a.countryCode && <span className={cn("text-[10px] font-semibold text-white rounded px-1.5 py-0.5 leading-none", isCountryMismatch ? "bg-amber-500" : "bg-slate-400")}>{a.countryCode}</span>}
                                      </div>
                                      <div className="text-[11px] text-[#94A3B8] truncate mt-0.5">{a.company && <>{a.company} · </>}{a.city}{a.postalCode && <> · {a.postalCode}</>}</div>
                                      <div className="text-[10px] text-[#CBD5E1] truncate">{a.address}</div>
                                    </div>
                                  </button>
                                  <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setEditingReceiverAddr({ ...a }); }} className="grid h-8 w-8 place-items-center rounded-xl text-[#94A3B8] hover:bg-[#EEF2FF] hover:text-[#4F46E5] transition-all opacity-0 group-hover:opacity-100" title="Düzenle">
                                      <Pencil className="h-3.5 w-3.5" />
                                    </button>
                                    <button type="button" onClick={async (e) => { e.stopPropagation(); if (!confirm("Bu adresi silmek istediğinize emin misiniz?")) return; try { await api.deleteAddress(a.id); const res = await api.listAddresses(); setApiAddresses(res.addresses); if (isSelected) update("selectedReceiverAddressId", ""); } catch {} }} className="grid h-8 w-8 place-items-center rounded-xl text-[#94A3B8] hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100" title="Sil">
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    <div className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-2 transition-colors ml-1", isCountryMismatch && isSelected ? "bg-amber-500 ring-amber-400" : isSelected ? "bg-[#3959F2] ring-[#4F46E5]" : "bg-white ring-[#CBD5E1] group-hover:ring-[#94A3B8]")}>
                                      {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                    </div>
                                  </div>
                                </div>
                                {isCountryMismatch && (
                                  <p className="text-[10px] text-amber-600 font-semibold mt-2 flex items-center gap-1">
                                    <AlertTriangle className="h-3 w-3 shrink-0" />
                                    Hedef ülke ({targetCountryName}) ile uyuşmuyor
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      : <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 text-center ring-1 ring-[#E2E8F0]">
                          <User className="h-8 w-8 text-[#CBD5E1] mx-auto mb-2" />
                          <p className="text-[12px] text-[#94A3B8] font-medium">{receiverSearch ? "Arama kriterlerinize uygun kayıtlı alıcı adresi bulunamadı." : "Bu posta koduna kayıtlı alıcı adresiniz bulunmamaktadır."}</p>
                        </div>
                    )}

                    {showNewReceiverForm && (
                      <div className="rounded-xl bg-white p-4 ring-1 ring-[#E2E8F0]">
                        <div className="mb-3 flex items-center justify-between">
                          <div className="text-[13px] font-semibold text-[#0F172A]">Yeni Alıcı Adresi</div>
                          <button type="button" onClick={() => setShowNewReceiverForm(false)} className="text-[12px] font-medium text-[#94A3B8] hover:text-[#475569]">İptal</button>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <Field label="Ad Soyad" icon={User} error={fieldErrors.receiverName}><NameInput value={draft.receiverName} onChange={v => update("receiverName", v)} placeholder="Alıcı adı soyadı" maxLength={60} /></Field>
                          <Field label="Firma Adı" icon={Building}><Input value={draft.receiverCompany} onChange={e => update("receiverCompany", e.target.value)} placeholder="Firma adı (opsiyonel)" /></Field>
                          <Field label="Telefon" icon={Phone} error={fieldErrors.receiverPhone}>
                            <PhoneInput
                              bare
                              value={draft.receiverPhone}
                              onChange={raw => update("receiverPhone", raw)}
                              defaultDialCode={(() => {
                                const country = apiCountries.find((c: any) => c.value === (draft.receiverAddressCountry || draft.receiverCountry));
                                return country?.phoneCode || "+90";
                              })()}
                              placeholder="Telefon numarası"
                            />
                          </Field>
                          <Field label="Ülke" icon={MapPin} error={fieldErrors.receiverAddressCountry}>
                            <SearchableSelect
                              options={apiCountries.length > 0 ? apiCountries : RECEIVER_COUNTRIES.map((c) => ({ ...c, label: (<div className="flex items-center gap-2"><span>{c.label}</span></div>) as any, searchableText: c.label }))}
                              value={draft.receiverAddressCountry}
                              onChange={(v) => {
                                update("receiverAddressCountry", v as string);
                                update("receiverStateProvince", "");
                                update("receiverAddressPostalCode", "");
                                // Ülke telefon kodunu otomatik doldur
                                const country = apiCountries.find((c: any) => c.value === v);
                                if (country?.phoneCode) {
                                  update("receiverPhone", country.phoneCode);
                                }
                              }}
                              placeholder="Ülke seçiniz"
                              className="h-10 border-0 ring-0 focus:ring-0 bg-transparent text-sm px-2"
                            />
                          </Field>
                          <Field label="Eyalet / Bölge" icon={MapPinned}>
                            <StateSelect
                              countryCode={draft.receiverAddressCountry}
                              value={draft.receiverStateProvince ?? ""}
                              onChange={(v) => update("receiverStateProvince", v)}
                              onHasStates={(has) => setReceiverHasStates(has)}
                              placeholder="Eyalet / Bölge seçiniz"
                              disabled={!draft.receiverAddressCountry}
                            />
                          </Field>
                          <Field label="Şehir" icon={MapPin} error={fieldErrors.receiverCity}>
                            {receiverHasStates ? (
                              <CitySelect
                                countryCode={draft.receiverAddressCountry || draft.receiverCountry}
                                value={draft.receiverCity}
                                onChange={(v) => update("receiverCity", v)}
                                placeholder="Şehir seçiniz"
                                disabled={!draft.receiverAddressCountry && !draft.receiverCountry}
                              />
                            ) : (
                              <Input
                                value={draft.receiverCity}
                                onChange={(e) => update("receiverCity", e.target.value)}
                                placeholder="Şehir adı giriniz"
                                disabled={!draft.receiverAddressCountry && !draft.receiverCountry}
                              />
                            )}
                          </Field>
                          <Field label="Posta Kodu" icon={MapPin}>
                            <Input value={draft.receiverAddressPostalCode ?? ""} onChange={e => update("receiverAddressPostalCode", e.target.value)} placeholder="Posta kodu (opsiyonel)" />
                          </Field>
                          <div className="sm:col-span-2"><Field label="Açık Adres" icon={MapPinned} error={fieldErrors.receiverAddress}><Input value={draft.receiverAddress} onChange={e => update("receiverAddress", e.target.value)} placeholder="Sokak, cadde, bina no, daire no..." /></Field></div>
                        </div>
                        <div className="mt-3 flex justify-end">
                          <Button type="button" variant={draft.saveReceiverAddress ? "primary" : "secondary"} onClick={() => update("saveReceiverAddress", !draft.saveReceiverAddress)}
                            className={cn("gap-2 transition-all", draft.saveReceiverAddress && "bg-brand-600 text-white hover:bg-brand-700 border-none ring-0 focus-visible:ring-0")}>
                            {draft.saveReceiverAddress ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                            {draft.saveReceiverAddress ? "Alıcı Adresini Kaydet Seçildi" : "Alıcı Adresini Kaydet"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Route summary strip */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200 overflow-hidden">
                  {/* Mobile layout */}
                  <div className="flex sm:hidden flex-col relative p-4">
                    {/* Sender */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm z-10">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-slate-800 truncate">{senderLabel || "Seçilmedi"}</span>
                          <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5 shrink-0">Gönderici</span>
                        </div>
                        {senderCompanyLabel && <div className="text-[11px] text-slate-400 truncate mt-0.5">{senderCompanyLabel} · {senderCityLabel}</div>}
                      </div>
                    </div>
                    {/* Connector */}
                    <div className="flex items-center gap-2 pl-5 py-1.5">
                      <div className="w-px h-5 border-l-2 border-dashed border-slate-200" />
                      <ArrowRight className="h-3 w-3 text-slate-300 rotate-90" />
                    </div>
                    {/* Receiver */}
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm z-10">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-bold text-slate-800 truncate">{receiverLabel || "Henüz girilmedi"}</span>
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 shrink-0">Alıcı</span>
                        </div>
                        {receiverCompanyLabel && <div className="text-[11px] text-slate-400 truncate mt-0.5">{receiverCompanyLabel} · {receiverCityLabel}</div>}
                      </div>
                    </div>
                  </div>
                  {/* Desktop layout */}
                  <div className="hidden sm:flex items-center justify-between gap-3 p-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-sm">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[14px] font-bold text-slate-800">{senderLabel || "Seçilmedi"}</span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 rounded-full px-2 py-0.5">Gönderici</span>
                        </div>
                        {senderCompanyLabel && <div className="text-[12px] text-slate-400 mt-0.5">{senderCompanyLabel} · {senderCityLabel}</div>}
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2 px-2">
                      <div className="h-px w-6 bg-slate-200" />
                      <ArrowRight className="h-4 w-4 text-slate-300" />
                      <div className="h-px w-6 bg-slate-200" />
                    </div>
                    <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
                      <div className="min-w-0 text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5">Alıcı</span>
                          <span className="text-[14px] font-bold text-slate-800">{receiverLabel || "Henüz girilmedi"}</span>
                        </div>
                        {receiverCompanyLabel && <div className="text-[12px] text-slate-400 mt-0.5">{receiverCompanyLabel} · {receiverCityLabel}</div>}
                      </div>
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm">
                        <User className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>

         {/* Sticky bottom bar */}
                <div className="sticky bottom-3 z-40 pointer-events-none mt-auto">
                  <div className="pointer-events-auto bg-[#0F172A] text-white shadow-2xl rounded-xl">
                    <div className="flex items-center justify-between p-2.5 sm:p-3">
                      <div className="min-w-0">
                        <div className="text-[12px] sm:text-[13px] font-bold">Adres Seçimi</div>
                        <div className="text-[10px] sm:text-[11px] text-[#94A3B8] truncate">
                          {hasSender && <>Gönderici: <span className="font-semibold text-white">{senderLabel}</span></>}
                          {hasSender && hasReceiver && " • "}
                          {hasReceiver && <>Alıcı: <span className="font-semibold text-white">{receiverLabel}</span></>}
                        </div>
                      </div>
                      <button type="button" onClick={() => { if (addressTab === "sender") { setAddressTab("receiver"); } else { next(); } }} disabled={loading} className="flex items-center justify-center gap-1.5 rounded-lg bg-[#4F46E5] hover:bg-[#4338CA] px-4 py-2 text-[12px] sm:text-[13px] font-bold text-white transition-colors disabled:opacity-50 shrink-0">
                        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                        {addressTab === "sender" ? <>Alıcı Adresi <span>→</span></> : <>Devam <span>→</span></>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ===== STEP 4 ===== */}
          {step === 4 && (
            <div className="space-y-6 pb-24">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setStep(3)} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
                  <ArrowLeft className="h-4 w-4" /> Geri Dön
                </button>
              </div>
              <div>
                <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">Gümrük (Proforma) Beyanı</h2>
                <p className="mt-1 text-sm text-slate-500">Her kolinin boyut ve ağırlık bilgilerini girin.</p>
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
                    <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all", fieldErrors.proformaDescription ? "border-red-500 bg-red-50/30 ring-2 ring-red-100 focus-within:border-red-500 focus-within:ring-red-200" : "border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                      <Box className="mr-3 h-4 w-4 text-slate-400 shrink-0" />
                      <SearchableSelect
                        options={descriptionTypes.map(dt => ({ label: dt.label, value: dt.label }))}
                        value={draft.proformaDescription}
                        onChange={v => update("proformaDescription", v as any)}
                        placeholder="Örn: Tekstil ürünleri, elektronik, aksesuar..."
                        className="flex-1 border-0 ring-0 shadow-none bg-transparent p-0 text-[14px] font-medium text-slate-700 focus:ring-0 placeholder:text-slate-400"
                        hideSearchAndSort
                      />
                    </div>
                  </div>

                  {/* Para Birimi */}
                  <div className="flex flex-col gap-2">
                     <label className="text-[12px] font-bold text-slate-700 mt-1">Para Birimi <span className="text-red-500 text-sm ml-0.5">*</span></label>
                     <div className={cn("flex h-[52px] items-center p-1.5 gap-1 rounded-2xl border-[1.5px] overflow-hidden", fieldErrors.proformaCurrency ? "border-red-500 bg-red-50/30 ring-2 ring-red-100" : "border-slate-300 bg-slate-50/50")}>
                      {(["EUR", "USD", "GBP"] as const).map((curr) => (
                        <button key={curr} type="button" onClick={() => update("proformaCurrency", curr)}
                          className={cn("flex flex-1 items-center justify-center gap-1.5 rounded-[12px] h-full transition-all text-[13px] font-bold", draft.proformaCurrency === curr ? "bg-[#0B1527] text-white shadow-sm" : "text-slate-400 hover:bg-slate-50 hover:text-slate-600")}>
                          <span className={cn("flex h-[22px] w-[22px] items-center justify-center rounded-full text-[11px] border", draft.proformaCurrency === curr ? "border-white/20" : "border-slate-200 bg-white")}>
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
                    <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all", fieldErrors.proformaIOSS ? "border-red-500 bg-red-50/30 ring-2 ring-red-100 focus-within:border-red-500 focus-within:ring-red-200" : "border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                      <span className="flex h-[20px] w-[20px] items-center justify-center rounded-full border border-slate-200 bg-[#F8FAFC] text-[11px] font-medium text-slate-500 shrink-0 mr-3">#</span>
                      <Input value={draft.proformaIOSS} onChange={e => update("proformaIOSS", e.target.value)} placeholder="Örn: IM0000000123 veya EU372000000" className="flex-1 border-0 ring-0 shadow-none bg-transparent p-0 text-[14px] font-medium text-slate-700 focus:ring-0 placeholder:text-slate-400" />
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                      <span className="font-semibold text-slate-500">IOSS</span> (Import One-Stop Shop): Yalnızca <span className="font-semibold">AB ülkelerine</span> yapılan ve toplam değeri <span className="font-semibold">150€&apos;yu geçmeyen</span> gönderilerde kullanılır. AB dışı ülkelere (ABD, İngiltere vb.) yapılan gönderilerde bu alan boş bırakılabilir. VAT numaranız varsa da buraya girebilirsiniz.
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
                          onClick={() => update("customsType", opt.value)}
                          className={cn(
                            "relative flex flex-col rounded-2xl border-[1.5px] p-4 text-left transition-all",
                            draft.customsType === opt.value
                              ? "border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-sm"
                              : "border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:shadow-sm"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                                draft.customsType === opt.value ? "border-brand-500 bg-brand-500" : "border-slate-300 bg-white"
                              )}>
                                {draft.customsType === opt.value && <Check className="h-3 w-3 text-white" />}
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

                {/* ── Fatura Bilgileri (Mikro İhracat seçiliyse zorunlu) ── */}
                {(() => {
                  const isMikroIhracat = draft.proformaDescription.toLowerCase().includes("mikro") || draft.proformaDescription.toLowerCase().includes("micro");

                  if (!isMikroIhracat) return null;
                  return (

                    <div className={cn("mt-6 rounded-2xl border p-5 transition-all border-amber-300 bg-amber-50/40")}>

                      <div className="flex items-center gap-2 mb-4">
                        <Receipt className="h-4 w-4 text-amber-600" />
                        <span className="text-[14px] font-bold text-slate-800">Fatura Bilgileri</span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Mikro İhracat - Zorunlu</span>
                      </div>

                        <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 mb-4">
                          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-amber-800 leading-relaxed">
                            <span className="font-bold">Mikro İhracat (ETGB)</span> beyanı ile yapılan gönderilerde fatura numarası, tarihi ve e-arşiv fatura PDF yüklemesi zorunludur.
                          </p>
                        </div>

                      <div className="grid gap-x-4 gap-y-4 grid-cols-1 sm:grid-cols-2">
                        {/* Fatura No */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[12px] font-bold text-slate-700">Fatura Numarası <span className="text-red-500 text-sm ml-0.5">*</span></label>
                          <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all", fieldErrors.invoiceNo ? "border-red-500 bg-red-50/30 ring-2 ring-red-100" : "border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                            <Receipt className="mr-3 h-4 w-4 text-slate-400 shrink-0" />
                            <Input value={draft.invoiceNo} onChange={e => update("invoiceNo", e.target.value)} placeholder="Örn: FTR-2026-001" className="flex-1 border-0 ring-0 shadow-none bg-transparent p-0 text-[14px] font-medium text-slate-700 focus:ring-0 placeholder:text-slate-400" />
                          </div>
                        </div>
                        {/* Fatura Tarihi */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[12px] font-bold text-slate-700">Fatura Tarihi <span className="text-red-500 text-sm ml-0.5">*</span></label>
                          <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all", fieldErrors.invoiceDate ? "border-red-500 bg-red-50/30 ring-2 ring-red-100" : "border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                            <Calendar className="mr-3 h-4 w-4 text-slate-400 shrink-0" />
                            <Input type="date" value={draft.invoiceDate} onChange={e => update("invoiceDate", e.target.value)} className="flex-1 border-0 ring-0 shadow-none bg-transparent p-0 text-[14px] font-medium text-slate-700 focus:ring-0" />
                          </div>
                        </div>
                      </div>

                      {/* E-Arşiv Fatura PDF Yükleme */}
                      <div className="mt-4">
                        <label className="text-[12px] font-bold text-slate-700 mb-2 block">E-Arşiv Fatura PDF <span className="text-red-500 text-sm ml-0.5">*</span></label>
                        {draft.earchivePdfUrl ? (
                          /* Yüklendi — Dosya gösterimi */
                          <div className={cn("flex items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3 transition-all", "border-emerald-300 bg-emerald-50/40")}>
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                              <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] font-semibold text-emerald-800 truncate">E-Arşiv fatura yüklendi</p>
                              <a href={draft.earchivePdfUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] text-emerald-600 hover:underline truncate block">{draft.earchivePdfUrl.split('/').pop()}</a>
                            </div>
                            <button type="button" onClick={() => update("earchivePdfUrl", "")} className="flex h-8 w-8 items-center justify-center rounded-full text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors shrink-0">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          /* Yüklenmedi — Upload alanı */
                          <div
                            onDragOver={e => { e.preventDefault(); }}
                            onDrop={async e => {
                              e.preventDefault();
                              const file = e.dataTransfer.files?.[0];
                              if (!file) return;
                              if (!file.name.toLowerCase().endsWith('.pdf')) {
                                setFieldErrors(prev => ({ ...prev, earchivePdfUrl: "Sadece PDF dosyası yükleyebilirsiniz" }));
                                return;
                              }
                              if (file.size > 25 * 1024 * 1024) {
                                setFieldErrors(prev => ({ ...prev, earchivePdfUrl: "Dosya boyutu 25MB'dan büyük olamaz" }));
                                return;
                              }
                              setFieldErrors(prev => { const next = { ...prev }; delete next.earchivePdfUrl; return next; });
                              try {
                                const result = await api.uploadDocument(file, shipmentId || 0, "INVOICE");
                                if (result.url) {
                                  update("earchivePdfUrl", result.url);
                                } else {
                                  setFieldErrors(prev => ({ ...prev, earchivePdfUrl: "Yükleme başarısız" }));
                                }
                              } catch (err: any) {
                                setFieldErrors(prev => ({ ...prev, earchivePdfUrl: err?.message || "Yükleme sırasında hata oluştu" }));
                              }
                            }}
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = ".pdf";
                              input.onchange = async () => {
                                const file = input.files?.[0];
                                if (!file) return;
                                if (file.size > 25 * 1024 * 1024) {
                                  setFieldErrors(prev => ({ ...prev, earchivePdfUrl: "Dosya boyutu 25MB'dan büyük olamaz" }));
                                  return;
                                }
                                setFieldErrors(prev => { const next = { ...prev }; delete next.earchivePdfUrl; return next; });
                                try {
                                  const result = await api.uploadDocument(file, shipmentId || 0, "INVOICE");
                                  if (result.url) {
                                    update("earchivePdfUrl", result.url);
                                  } else {
                                    setFieldErrors(prev => ({ ...prev, earchivePdfUrl: "Yükleme başarısız" }));
                                  }
                                } catch (err: any) {
                                  setFieldErrors(prev => ({ ...prev, earchivePdfUrl: err?.message || "Yükleme sırasında hata oluştu" }));
                                }
                              };
                              input.click();
                            }}
                            className={cn(
                              "relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-5 cursor-pointer transition-all",
                              fieldErrors.earchivePdfUrl
                                ? "border-red-400 bg-red-50/30 hover:border-red-500"
                                : "border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50"
                            )}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                              <UploadCloud className="h-5 w-5 text-slate-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-[13px] font-medium text-slate-700">E-Arşiv faturanızı sürükleyip bırakın veya <span className="text-[#3959F2] font-semibold">seçin</span></p>
                              <p className="text-[11px] text-slate-400 mt-0.5">Sadece PDF — maks. 25 MB</p>
                            </div>
                          </div>
                        )}
                        {fieldErrors.earchivePdfUrl && (
                          <div className="mt-2 flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-[11px] text-red-700 ring-1 ring-red-100">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                            {fieldErrors.earchivePdfUrl}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Ürün Kalemleri Listesi */}
              <div className="space-y-4">
                {draft.proformaItems.map((item, idx) => (
                  <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                    {/* Üst Kısım: Sıra, Ürün İsmi, Row Toplamı ve Sil */}
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
                          {getCurrencySymbol(draft.proformaCurrency)}{(toNumber(item.quantity) * toNumber(item.unitPrice)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {draft.proformaItems.length > 1 && (
                          <button type="button" onClick={() => removeProformaItem(item.id)} className="text-red-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full">
                            <Trash2 className="h-[18px] w-[18px]" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-x-4 gap-y-5 sm:grid-cols-12">
                      {/* Row 1: Menşei, Ürün Adı, Miktar */}
                      
                      {/* Menşei */}
                      <div className="sm:col-span-12 lg:col-span-3 flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-slate-700 mt-1">Menşei <span className="text-red-500 text-sm ml-0.5">*</span></label>
                        <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all", fieldErrors[`item_${idx}_origin`] ? "border-red-500 bg-red-50/30 ring-2 ring-red-100 focus-within:border-red-500 focus-within:ring-red-200" : "border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                          <Globe className="mr-3 h-4 w-4 text-slate-400 shrink-0" />
                          <SearchableSelect options={[{ label: "Türkiye", value: "TR" }]} value={item.origin} onChange={v => updateProformaItem(item.id, "origin", v)} hideSearchAndSort className="flex-1 border-0 ring-0 shadow-none bg-transparent p-0 text-[14px] font-medium text-slate-700 focus:ring-0" />
                        </div>
                      </div>

                      {/* Ürün Adı */}
                      <div className="sm:col-span-12 lg:col-span-7 flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-slate-700 mt-1">Ürün Detayı <span className="text-red-500 text-sm ml-0.5">*</span></label>
                        <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all", fieldErrors[`item_${idx}_productName`] ? "border-red-500 bg-red-50/30 ring-2 ring-red-100 focus-within:border-red-500 focus-within:ring-red-200" : "border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                          <Tag className="mr-3 h-4 w-4 text-slate-400 shrink-0" />
                          <Input value={item.productDescription} onChange={e => updateProformaItem(item.id, "productDescription", e.target.value)} placeholder="Lütfen detaylı olarak ürünün adını yazınız" className="flex-1 border-0 ring-0 shadow-none bg-transparent p-0 text-[14px] font-medium text-slate-700 focus:ring-0 placeholder:text-slate-400" />
                        </div>
                      </div>

                      {/* Miktar */}
                      <div className="sm:col-span-12 lg:col-span-2 flex flex-col gap-2">
                         <label className="text-[12px] font-bold text-slate-700 mt-1">Miktar <span className="text-red-500 text-sm ml-0.5">*</span></label>
                         <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all justify-between", fieldErrors[`item_${idx}_quantity`] ? "border-red-500 bg-red-50/30 ring-2 ring-red-100 focus-within:border-red-500 focus-within:ring-red-200" : "border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                          <NumericInput value={item.quantity} onChange={v => updateProformaItem(item.id, "quantity", v)} placeholder="4" className="w-[40px] border-0 ring-0 shadow-none bg-transparent p-0 text-[15px] font-semibold text-slate-700 focus:ring-0" />
                          <div className="flex flex-col gap-[2px] border-l border-slate-100 pl-2">
                            <button type="button" onClick={() => updateProformaItem(item.id, "quantity", String(toNumber(item.quantity) + 1))} className="flex h-[18px] w-[24px] items-center justify-center rounded-[6px] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-500 transition-colors"><ChevronUp className="h-3 w-3" /></button>
                            <button type="button" onClick={() => updateProformaItem(item.id, "quantity", String(Math.max(1, toNumber(item.quantity) - 1)))} className="flex h-[18px] w-[24px] items-center justify-center rounded-[6px] bg-[#F1F5F9] hover:bg-[#E2E8F0] text-slate-500 transition-colors"><ChevronDown className="h-3 w-3" /></button>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: HS Kodu, SKU, Birim Fiyat */}

                      {/* HS Kodu */}
                      <div className="sm:col-span-12 lg:col-span-5 flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-slate-700 mt-1">HS Kodu (GTİP) <span className="text-red-500 text-sm ml-0.5">*</span></label>
                        <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all", (fieldErrors[`item_${idx}_hsCode`] || (item.hsCode.length > 0 && (item.hsCode.length < 3 || item.hsCode.length > 12))) ? "border-red-500 bg-red-50/30 ring-2 ring-red-100 focus-within:border-red-500 focus-within:ring-red-200" : "border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
                          <span className="mr-3 font-medium text-slate-400 shrink-0">#</span>
                          <div className="flex-1 -ml-3">
                            <HSCodeCombobox value={item.hsCode} onChange={v => updateProformaItem(item.id, "hsCode", v)} productHint={item.productDescription} />
                          </div>
                        </div>
                        {item.hsCode.length > 0 && (item.hsCode.length < 3 || item.hsCode.length > 12) && (
                          <div className="flex items-start gap-2 mt-1 px-2 py-2 rounded-xl bg-red-50 border border-red-200">
                            <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-red-600 font-medium leading-relaxed">
                              HS kodu <span className="font-bold">3 ile 12 karakter</span> arasında olmalıdır. Lütfen doğru kodu girdiğinizden emin olun.
                            </p>
                          </div>
                        )}
                      </div>

                       {/* SKU */}
                       <div className="sm:col-span-12 lg:col-span-5 flex flex-col gap-2">
                        <label className="text-[12px] font-bold text-slate-700 mt-1">SKU</label>
                        <div className="flex items-center h-[52px] rounded-2xl border border-slate-200 px-4 focus-within:border-brand-500 focus-within:ring-1 focus-within:ring-brand-500 transition-shadow bg-white">
                          <Barcode className="mr-3 h-4 w-4 text-slate-400 shrink-0" />
                          <Input value={item.sku} onChange={e => updateProformaItem(item.id, "sku", e.target.value)} placeholder="Örn: Stok Kodu vb. (Opsiyonel)" className="flex-1 border-0 ring-0 shadow-none bg-transparent p-0 text-[14px] font-medium text-slate-700 focus:ring-0 placeholder:text-slate-400" />
                        </div>
                      </div>

                      {/* Birim Fiyat */}
                      <div className="sm:col-span-12 lg:col-span-2 flex flex-col gap-2">
                         <label className="text-[12px] font-bold text-slate-700 mt-1">Birim Fiyat ({getCurrencySymbol(draft.proformaCurrency)}) <span className="text-red-500 text-sm ml-0.5">*</span></label>
                         <div className={cn("flex items-center h-[52px] rounded-2xl border-[1.5px] px-4 focus-within:bg-white focus-within:ring-2 transition-all justify-between", fieldErrors[`item_${idx}_unitPrice`] ? "border-red-500 bg-red-50/30 ring-2 ring-red-100 focus-within:border-red-500 focus-within:ring-red-200" : "border-slate-300 bg-slate-50/50 focus-within:border-brand-500 focus-within:ring-brand-500/20")}>
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

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowProformaExcel(true)} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                  <UploadCloud className="h-4 w-4" /> Excel ile Toplu Yükle
                </button>
                <button type="button" onClick={addProformaItem} className="flex items-center justify-center gap-2 rounded-xl bg-[#3959F2] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4338CA] transition-colors shadow-sm shadow-[#4F46E5]/20">
                  <Plus className="h-4 w-4" /> Yeni Ürün Ekle
                </button>
              </div>

              {/* ═══════════ GÜMRÜK BELGELERİ YÜKLEME ALANI ═══════════ */}
              <div className="mt-8" id="customs-documents-section">
                <div className={cn("flex items-center gap-2 mb-4 p-3 rounded-xl transition-all", fieldErrors.documentUpload ? "bg-red-50 ring-2 ring-red-300" : "")}>
                  <FileUp className={cn("h-5 w-5", fieldErrors.documentUpload ? "text-red-500" : "text-slate-500")} />
                  <h3 className={cn("text-[15px] font-semibold", fieldErrors.documentUpload ? "text-red-600" : "text-slate-800")}>Gümrük Belgeleri</h3>
                  {(() => {
                    const isMikro = draft.proformaDescription.toLowerCase().includes("mikro") || draft.proformaDescription.toLowerCase().includes("micro");
                    return isMikro && <span className="text-red-500 text-sm font-bold">*</span>;
                  })()}
                  {docUploadedFiles.length > 0 && <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold ml-1">{docUploadedFiles.length} belge yüklendi</span>}
                </div>

                {/* Belge Türü Seçici */}
                <div className="mb-3">
                  <label className="text-[12px] font-medium text-slate-500 mb-1.5 block">Belge Türü</label>
                  <div className="flex gap-2 flex-wrap">
                    {[{ value: "ETGB", label: "ETGB Belgesi" }, { value: "MSDS", label: "MSDS Belgesi" }, { value: "INVOICE", label: "Fatura" }, { value: "OTHER", label: "Diğer" }].map(t => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => setDocFileType(t.value)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all",
                          docFileType === t.value
                            ? "bg-[#3959F2] text-white border-[#3959F2] shadow-sm shadow-[#3959F2]/20"
                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sürükle-Bırak Yükleme Alanı */}
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

                {/* Hata/Başarı Mesajları */}
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

                {/* Yüklenen Dosyalar Listesi */}
                {docUploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Yüklenen Belgeler ({docUploadedFiles.length})</p>
                    {docUploadedFiles.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-slate-100 shadow-sm">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50">
                          <FileIcon className="h-4 w-4 text-sky-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-medium text-slate-700 truncate">{f.name}</p>
                          <p className="text-[11px] text-slate-400">{f.type === "ETGB" ? "ETGB Belgesi" : f.type === "MSDS" ? "MSDS Belgesi" : f.type === "INVOICE" ? "Fatura" : "Diğer"} • {f.size < 1024 ? f.size + " B" : f.size < 1024*1024 ? (f.size/1024).toFixed(1) + " KB" : (f.size/(1024*1024)).toFixed(1) + " MB"}</p>
                        </div>
                        <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-[11px] font-medium text-sky-600 hover:text-sky-700 shrink-0">Görüntüle</a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

         {/* Float Sticky Bottom Bar matching Figma */}
              <div className="sticky bottom-4 z-40 pointer-events-none mt-auto">
                <div className="pointer-events-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between rounded-2xl bg-[#161616] p-3 sm:p-4 text-white shadow-xl ring-1 ring-white/10 gap-3">
                  <div className="flex items-center justify-between sm:block">
                    <div className="flex items-center gap-2">
                      <div className="text-[13px] sm:text-[14px] font-bold">Gümrük Beyanı</div>
                    </div>
                    <div className="sm:mt-1 flex items-center gap-2 text-xs font-medium text-white/50">
                      <span>{draft.proformaItems.length} ürün</span>
                      <span className="h-1 w-1 rounded-full bg-white/30" />
                      <span>{draft.proformaItems.reduce((acc, val) => acc + (toNumber(val.quantity) || 1), 0)} birim</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:gap-6">
                    <div className="text-left sm:text-right">
                      <div className="text-[10px] sm:text-[11px] font-medium text-white/50">Toplam Değer</div>
                      <div className="text-[18px] sm:text-2xl font-bold leading-none tracking-tight">
                        {getCurrencySymbol(draft.proformaCurrency)}{proformaTotal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    <button type="button" onClick={saveProformaDetails} className="flex h-[38px] sm:h-11 items-center gap-2 rounded-xl bg-[#3959F2] px-4 sm:px-6 text-[13px] sm:text-sm font-bold text-white shadow-lg shadow-[#4F46E5]/20 transition-all hover:bg-[#4338CA] shrink-0">
                      Devam <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== STEP 5 ===== */}
          {step === 5 && (
            <div className="flex flex-col items-center py-8">
              {!done ? (
                <div className="w-full max-w-[800px] animate-in fade-in duration-500 pb-16">
                  {/* Top Info */}
                  <div className="mb-6 flex flex-col gap-1">
                    <button type="button" onClick={() => setStep(4)} className="flex items-center gap-1.5 text-[13px] font-medium text-slate-400 hover:text-slate-600 w-fit mb-2 transition-colors">
                      <ArrowLeft className="h-3.5 w-3.5" /> Geri Dön
                    </button>
                    <h2 className="text-[28px] font-bold text-slate-800 tracking-tight">Gönderi Onayı</h2>
                    <p className="text-[14px] text-slate-500 font-medium">Bilgilerinizi gözden geçirin ve gönderiyi onaylayın.</p>
                  </div>

                  {/* Route Banner */}
                  <div className="w-full bg-[#1F2937] rounded-[16px] px-4 sm:px-6 py-4 mb-8 shadow-sm relative overflow-hidden">
                    {/* Mobile: stacked layout */}
                    <div className="flex sm:hidden items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <img src={getFlagImageUrl(draft.senderCountry || "TR", 80)} alt="TR" className="w-[32px] h-[22px] rounded-[4px] object-cover ring-2 ring-white/10 shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-[9px] font-medium text-white/50 uppercase tracking-wider">Çıkış</span>
                          <span className="text-[13px] font-bold text-white truncate">{apiCountries.find(x => x.value === draft.senderCountry)?.name || COUNTRY_NAMES[draft.senderCountry] || "Türkiye"}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-center shrink-0 px-1">
                        <Plane className="w-4 h-4 text-white/40 mb-0.5" />
                        <span className="text-[9px] text-white/40 font-medium">{totalActualWeight.toFixed(1)} kg</span>
                      </div>
                      <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-end">
                        <div className="flex flex-col items-end min-w-0">
                          <span className="text-[9px] font-medium text-white/50 uppercase tracking-wider">Varış</span>
                          <span className="text-[13px] font-bold text-white truncate">{apiCountries.find(x => x.value === draft.receiverCountry)?.name || COUNTRY_NAMES[draft.receiverCountry] || "İspanya"}</span>
                        </div>
                        <img src={getFlagImageUrl(draft.receiverCountry || "ES", 80)} alt="ES" className="w-[32px] h-[22px] rounded-[4px] object-cover ring-2 ring-white/10 shrink-0" />
                      </div>
                    </div>
                    {/* Desktop: original horizontal layout */}
                    <div className="hidden sm:flex items-center justify-between">
                      <div className="flex items-center gap-4 relative z-10 w-1/3">
                        <img src={getFlagImageUrl(draft.senderCountry || "TR", 80)} alt="TR" className="w-[42px] h-[30px] rounded-[6px] object-cover ring-2 ring-white/10" />
                        <div className="flex flex-col">
                          <span className="text-[12px] font-medium text-white/50 relative -bottom-0.5">Çıkış</span>
                          <span className="text-[16px] font-bold text-white tracking-wide">{apiCountries.find(x => x.value === draft.senderCountry)?.name || COUNTRY_NAMES[draft.senderCountry] || "Türkiye"}</span>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                        <Plane className="w-5 h-5 text-white/50 mb-1" />
                        <span className="text-[11px] font-medium text-white/40">Kargo Ağırlığı <strong className="text-white/80 font-bold ml-1">{totalActualWeight.toFixed(2)} kg</strong></span>
                      </div>
                      <div className="flex items-center gap-4 justify-end relative z-10 w-1/3">
                        <div className="flex flex-col items-end">
                          <span className="text-[12px] font-medium text-white/50 relative -bottom-0.5">Varış</span>
                          <span className="text-[16px] font-bold text-white tracking-wide">{apiCountries.find(x => x.value === draft.receiverCountry)?.name || COUNTRY_NAMES[draft.receiverCountry] || "İspanya"}</span>
                        </div>
                        <img src={getFlagImageUrl(draft.receiverCountry || "ES", 80)} alt="ES" className="w-[42px] h-[30px] rounded-[6px] object-cover ring-2 ring-white/10" />
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
                        {/* Vertical Line */}
                        <div className="absolute left-[23px] top-[24px] bottom-[24px] w-[1px] bg-slate-100 z-0"></div>

                        {/* Timeline Items */}
                        <div className="flex flex-col gap-10">
                          
                          {/* Item 1: Tür */}
                          <div className="flex items-start gap-5 relative z-10">
                            <div className="w-[48px] h-[48px] rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 shadow-sm relative z-10">
                              <Package className="w-5 h-5 text-[#D97706]" strokeWidth={1.5} />
                            </div>
                            <div className="flex flex-col pt-1">
                              <span className="text-[12px] font-medium text-slate-400 mb-0.5">Gönderi Türü</span>
                              <span className="text-[15px] font-bold text-slate-800">{draft.shipmentType === 'Belge' ? 'Evrak / Belge' : 'Paket'}</span>
                            </div>
                          </div>

                          {/* Item 2: Fiyatlandırma */}
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
                              <span className="text-[12px] font-bold text-slate-600">{totalPackageCount} {draft.shipmentType.toLowerCase()}</span>
                            </div>
                          </div>

                          {/* Item 3: Kargo */}
                          <div className="flex items-start justify-between relative z-10">
                            <div className="flex items-start gap-5">
                              <div className="w-[48px] h-[48px] rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm relative z-10 overflow-hidden p-[2px]">
                                {selectedQuote?.logoUrl ? <img src={getLogoSrc(selectedQuote.logoUrl)} className="w-[32px] h-[32px] object-contain rounded" /> : <span className="font-bold text-slate-700">{selectedQuote?.logoLetter}</span>}
                              </div>
                              <div className="flex flex-col pt-1">
                                <span className="text-[12px] font-medium text-slate-400 mb-0.5">Kargo Firması</span>
                                <span className="text-[15px] font-bold text-slate-800">{selectedQuote?.carrierName || "UPS"} — {selectedQuote?.serviceName || "Standard"}</span>
                              </div>
                            </div>
                            <div className="h-8 rounded-full border border-slate-200 bg-white px-3 flex items-center gap-1.5 shadow-sm mt-1">
                              <Plane className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-[12px] font-bold text-slate-600">{selectedQuote?.deliveryLabel || "1-2 iş günü"}</span>
                            </div>
                          </div>

                          {/* Item 4: Gönderici -> Alıcı */}
                          <div className="flex items-start gap-5 relative z-10">
                            <div className="w-[48px] h-[48px] rounded-full bg-black flex items-center justify-center shrink-0 shadow-[0_4px_10px_rgba(0,0,0,0.1)] relative z-10">
                              <ArrowRight className="w-5 h-5 text-white -rotate-45" strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col pt-1">
                              <span className="text-[12px] font-medium text-slate-400 mb-0.5 flex items-center">Gönderici <ArrowRight className="w-3 h-3 mx-1 opacity-50" /> Alıcı</span>
                              <span className="text-[15px] font-bold text-slate-800 flex items-center">
                                {selectedSenderAddr?.label?.split(" ")[0] || draft.senderName?.split(" ")[0] || "Gönderici"} {selectedSenderAddr?.label?.split(" ")[1] || draft.senderName?.split(" ")[1] || ""}
                                <ArrowRight className="w-4 h-4 text-slate-400 mx-2" />
                                {draft.receiverName || "Alıcı"}
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
                        {selectedQuote?.logoUrl ? <img src={getLogoSrc(selectedQuote.logoUrl)} className="w-7 h-7 object-contain rounded" /> : <Package className="text-white w-5 h-5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-bold text-[15px] tracking-wide">{selectedQuote?.carrierName || "UPS"} - {selectedQuote?.serviceName || "Standart"}</span>
                        <div className="flex items-center gap-1.5 text-white/80 text-[12px] font-medium mt-0.5">
                          <Package className="w-3.5 h-3.5" /> Teslimat: <span className="font-bold text-white">{selectedQuote?.deliveryLabel || "1-2 iş günü"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-5 shrink-0 relative">
                      {apiError && <div className="absolute top-[-40px] right-0 text-red-500 font-bold text-sm bg-white px-3 py-1 rounded shadow-sm">{apiError}</div>}
                      <div className="text-[26px] font-black tracking-tighter text-white mb-0.5 leading-none">
                        {selectedQuote ? getCurrencySymbol(selectedQuote.currency) : "$"}{(selectedQuote?.price || 275.15).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <button 
                        type="button" 
                        onClick={finalize}
                        disabled={loading}
                        className="h-[44px] px-5 sm:px-6 bg-[#A3E635] hover:bg-[#84cc16] text-[#14532D] rounded-[12px] flex items-center gap-2 font-bold text-[14px] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(163,230,53,0.3)]"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{adminMode ? "Ödeme Yapıldı — Oluştur" : "Gönderiyi Oluştur"} <ArrowRight className="w-4 h-4 stroke-[2.5]" /></>}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center w-full pb-20 animate-in fade-in zoom-in-95 duration-500">
                  <div className="text-center mb-6 sm:mb-8 px-4">
                    <h2 className="text-[24px] sm:text-[32px] font-bold text-slate-900 tracking-tight leading-tight mb-2">Gönderiniz Oluşturuldu!</h2>
                    <p className="text-[13px] sm:text-[14px] text-slate-500 font-medium max-w-[340px] mx-auto leading-relaxed">
                      Gönderiniz başarıyla oluşturuldu, gönderiniz ile ilgili bilgilere aşağıdan ulaşabilirsiniz.
                    </p>
                  </div>

                  {/* ══════════════════════════════════════════════════════════ */}
                  {/* ÇİFT AŞAMALI KARGO — ADIM KARTLARI                        */}
                  {/* Sadece requiresDomesticTransfer=true ise gösterilir        */}
                  {/* ══════════════════════════════════════════════════════════ */}
                  {requiresDomesticTransfer && (
                    <div className="w-full max-w-[540px] flex flex-col gap-4 mb-8 px-1">

                      {/* ── ADIM 1: Yurt İçi Teslimat ── */}
                      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-[2px] shadow-xl shadow-amber-500/30">
                        <div className="relative rounded-[18px] bg-white overflow-hidden">
                          {/* Header */}
                          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 flex items-center gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white font-black text-sm">1</div>
                            <div>
                              <div className="text-white font-bold text-[15px] leading-tight">Adım 1: Yurt İçi Teslimat</div>
                              <div className="text-white/80 text-[11px] font-medium">Paketi İstanbul Zalusa Merkezine ulaştırın</div>
                            </div>
                            <div className="ml-auto">
                              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                <span className="text-white font-semibold text-[11px]">Bekliyor</span>
                              </div>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-5">
                            {domesticSelfShipping ? (
                              /* "Ben kendim göndereceğim" seçildiğinde Zalusa adresi göster */
                              <div>
                                <div className="text-center mb-4">
                                  <div className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-2">Göndermeniz Gereken Adres</div>
                                  <div className="text-[12px] text-slate-500 mb-3">Lütfen paketinizi aşağıdaki adrese kendiniz gönderin</div>
                                </div>

                                <div className="relative bg-slate-50 border-2 border-dashed border-emerald-300 rounded-2xl p-5">
                                  <button
                                    type="button"
                                    className="absolute top-3 right-3 flex items-center gap-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-colors"
                                    onClick={() => {
                                      navigator.clipboard.writeText("Orta Mah. Marifet Sk. No: 6 İç Kapı No: 26, Kartal / İstanbul, Telefon: 5411341534");
                                      const btn = document.getElementById("copyAddrBtn");
                                      if (btn) { btn.textContent = "✓ Kopyalandı!"; setTimeout(() => { btn.textContent = "📋 Kopyala"; }, 2000); }
                                    }}
                                    id="copyAddrBtn"
                                  >
                                    📋 Kopyala
                                  </button>
                                  <div className="space-y-2 pr-24">
                                    <div className="text-[15px] font-bold text-slate-900 leading-snug">
                                      Orta Mah. Marifet Sk. No: 6<br />İç Kapı No: 26
                                    </div>
                                    <div className="text-[14px] font-semibold text-slate-700">
                                      Kartal / İstanbul
                                    </div>
                                    <div className="flex items-center gap-2 text-[13px] text-slate-600">
                                      <span className="font-semibold">Telefon:</span>
                                      <span className="font-mono font-bold text-slate-800">5411341534</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-[14px] p-4 mt-4">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mt-0.5">
                                    <Info className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-bold text-emerald-800 mb-1">Lütfen bu adresi not alınız</div>
                                    <p className="text-[12px] text-emerald-700 leading-relaxed">
                                      Paketinizi yukarıdaki adrese <strong>kendiniz</strong> göndermeniz gerekmektedir. Paket merkezimize ulaştığında yurtdışı kargo işleminiz otomatik olarak başlatılacaktır.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              /* Normal Basit Kargo akışı */
                              <div>
                                <div className="text-center mb-4">
                                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Yurt İçi Kargo Kodu</div>
                                  <div className="text-[34px] sm:text-[42px] font-black text-slate-900 tracking-widest leading-none font-mono bg-slate-50 border-2 border-dashed border-amber-300 rounded-2xl py-4 px-4 select-all">
                                    {domesticTrackingCode || "—"}
                                  </div>
                                  {domesticCarrierCompany && (
                                    <div className="mt-2.5 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-4 py-1.5">
                                      <span className="text-amber-700 font-bold text-[13px]">{domesticCarrierCompany}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-[14px] p-4">
                                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-600 mt-0.5">
                                    <AlertTriangle className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-bold text-amber-800 mb-1">Paketi şubeye teslim edin</div>
                                    <p className="text-[12px] text-amber-700 leading-relaxed">
                                      Lütfen paketinizi yukarıdaki kod ile en yakın <strong>{domesticCarrierCompany || "kargo"}</strong> şubesine <strong>ücretsiz</strong> olarak teslim ediniz. Yurt içi kargo ücreti sisteminiz tarafından ödenmiştir.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* ── ADIM 2: Yurtdışı Çıkışı ── */}
                      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 p-[2px] shadow-xl shadow-blue-500/20">
                        <div className="relative rounded-[18px] bg-white overflow-hidden">
                          {/* Header */}
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 flex items-center gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white font-black text-sm">2</div>
                            <div>
                              <div className="text-white font-bold text-[15px] leading-tight">Adım 2: Yurtdışı Çıkışı</div>
                              <div className="text-white/80 text-[11px] font-medium">Paket İstanbul merkezinden yurtdışına gönderilecek</div>
                            </div>
                            <div className="ml-auto">
                              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                                <Clock className="h-3 w-3 text-white/80" />
                                <span className="text-white font-semibold text-[11px]">Sırada</span>
                              </div>
                            </div>
                          </div>

                          {/* Body */}
                          <div className="p-5">
                            <div className="text-center mb-4">
                              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Uluslararası Takip Numarası</div>
                              <div className="text-[22px] sm:text-[26px] font-black text-slate-800 tracking-widest leading-none font-mono bg-slate-50 border border-slate-200 rounded-2xl py-4 px-4 select-all">
                                {createdShipmentTrackingCode || "—"}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-[14px] p-4">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                <Globe className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="text-[13px] font-bold text-blue-800 mb-0.5">
                                  {selectedQuote?.carrierName || "Uluslararası kargo"} ile gönderilecek
                                </div>
                                <p className="text-[12px] text-blue-700 leading-relaxed">
                                  Yurt içi paketi Zalusa merkezimize ulaşınca bu numara ile {draft.receiverCountry} adresine gönderim başlatılır.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Kargo Fişi (Ticket) Modeli */}
                  <div className="relative w-full max-w-[480px] flex flex-col mb-8 font-sans">
                    
                    {/* Üst Kısım (Koyu) */}
                    <div className="bg-[#1A1A1A] rounded-t-[16px] px-6 py-4 flex items-center justify-between z-20">
                      <div className="flex items-center gap-3">
                        {selectedQuote?.logoUrl ? (
                          <img src={getLogoSrc(selectedQuote.logoUrl)} alt={selectedQuote.carrierName} className="h-6 object-contain" />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[#333] text-white text-[12px] font-bold">
                            {selectedQuote?.logoLetter || "U"}
                          </div>
                        )}
                        <span className="text-white text-[15px] font-medium tracking-wide">{selectedQuote?.carrierName || "UPS"} - {selectedQuote?.serviceName || "Standart"}</span>
                      </div>
                      <div className="border border-[#14532D] text-[#4ADE80] bg-transparent px-3 py-1 rounded-[6px] text-[12px] font-medium tracking-wide">
                        Onaylandı
                      </div>
                    </div>

                    {/* Alt Gövde (Açık Gri) */}
                    <div className="bg-[#F8F9FA] px-6 py-6 rounded-b-[16px] relative w-full overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-slate-200/50">
                      
                      {/* Tırtıklar (Scallops) */}
                      <div className="absolute left-[0px] top-[140px] bottom-[160px] w-3 flex flex-col justify-between -translate-x-2 z-10 py-1">
                        {[...Array(6)].map((_,i) => <div key={i} className="w-4 h-4 bg-white rounded-full shrink-0" />)}
                      </div>
                      <div className="absolute right-[0px] top-[140px] bottom-[160px] w-3 flex flex-col justify-between translate-x-2 z-10 py-1">
                        {[...Array(6)].map((_,i) => <div key={i} className="w-4 h-4 bg-white rounded-full shrink-0" />)}
                      </div>

                      {/* Rota Kartı */}
                      <div className="bg-white rounded-[16px] py-6 px-6 flex items-center justify-between mb-6 relative z-20 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-3">
                          <img src={getFlagImageUrl(draft.senderCountry || "TR", 40)} alt="TR" className="w-[30px] h-[22px] rounded object-cover shadow-sm ring-1 ring-slate-100" />
                          <span className="text-[32px] font-black text-slate-800 tracking-tighter uppercase leading-none">{draft.senderCountry || "IST"}</span>
                        </div>
                        
                        <div className="flex-1 flex flex-col items-center justify-center relative px-4">
                           <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-[1.5px] border-dashed border-slate-200"></div>
                           <div className="bg-white px-2 relative z-10 flex flex-col items-center gap-1.5">
                             <div className="w-8 h-8 rounded-full bg-[#f3f4f6] flex items-center justify-center text-slate-500 ring-4 ring-white">
                               <Plane className="w-4 h-4 shadow-sm" />
                             </div>
                             <span className="text-[9px] font-bold text-slate-500 bg-white px-1 whitespace-nowrap">{selectedQuote?.deliveryLabel || "1-2 iş günü"}</span>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-[32px] font-black text-slate-800 tracking-tighter uppercase leading-none">{draft.receiverCountry || "ES"}</span>
                          <img src={getFlagImageUrl(draft.receiverCountry || "ES", 40)} alt={draft.receiverCountry || "ES"} className="w-[30px] h-[22px] rounded object-cover shadow-sm ring-1 ring-slate-100" />
                        </div>
                      </div>

                      {/* Horizontal Dashed Line */}
                      <div className="border-t-[1.5px] border-dashed border-slate-200/80 w-full mb-6 relative z-20"></div>

                      {/* Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-6 relative z-20">
                        <div className="bg-white rounded-[12px] p-4 flex flex-col gap-1 border border-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                            <Calendar className="w-4 h-4" strokeWidth={1.5} /> Tarih
                          </div>
                          <div className="text-[14px] font-bold text-slate-800 tracking-wide mt-0.5">{new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</div>
                        </div>
                        <div className="bg-white rounded-[12px] p-4 flex flex-col gap-1 border border-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                            <Clock className="w-4 h-4" strokeWidth={1.5} /> Saat
                          </div>
                          <div className="text-[14px] font-bold text-slate-800 tracking-wide mt-0.5">{new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div className="bg-white rounded-[12px] p-4 flex flex-col gap-1 border border-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                            <Scale className="w-4 h-4" strokeWidth={1.5} /> Ağırlık
                          </div>
                          <div className="text-[14px] font-bold text-slate-800 tracking-wide mt-0.5">{totalActualWeight.toFixed(1)} kg</div>
                        </div>
                        <div className="bg-white rounded-[12px] p-4 flex flex-col gap-1 border border-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                            <Package className="w-4 h-4" strokeWidth={1.5} /> Koli
                          </div>
                          <div className="text-[14px] font-bold text-slate-800 tracking-wide mt-0.5">{totalPackageCount} adet</div>
                        </div>
                        <div className="bg-white rounded-[12px] p-4 flex flex-col gap-1 border border-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                            <ArrowRightSquare className="w-4 h-4" strokeWidth={1.5} /> Gönderici
                          </div>
                          <div className="text-[14px] font-bold text-slate-800 tracking-wide mt-0.5 truncate" title={selectedSenderAddr?.label || draft.senderName || "Gönderici"}>{selectedSenderAddr?.label?.split(" ")[0] || draft.senderName?.split(" ")[0] || "Gönderici"} {selectedSenderAddr?.label?.split(" ")[1] || draft.senderName?.split(" ")[1] || ""}</div>
                        </div>
                        <div className="bg-white rounded-[12px] p-4 flex flex-col gap-1 border border-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                          <div className="flex items-center gap-2 text-[12px] font-medium text-slate-400">
                            <ArrowLeftSquare className="w-4 h-4" strokeWidth={1.5} /> Alıcı
                          </div>
                          <div className="text-[14px] font-bold text-slate-800 tracking-wide mt-0.5 truncate" title={draft.receiverName || "Alıcı"}>{draft.receiverName || "Alıcı"}</div>
                        </div>
                      </div>

                      {/* Horizontal Dashed Line */}
                      <div className="border-t-[1.5px] border-dashed border-slate-200/80 w-full mb-6 relative z-20"></div>

                      {/* Takip & Fiyat */}
                      <div className="flex items-end justify-between px-2 mb-8 relative z-20">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[11px] font-medium text-slate-400">Takip Numarası</span>
                          <span className="text-[18px] font-bold text-slate-800 tracking-wide">ZLSMN64TK8M</span>
                        </div>
                        <div className="flex flex-col gap-1.5 text-right">
                          <span className="text-[11px] font-medium text-slate-400">Toplam Ücret</span>
                          <span className="text-[26px] font-black text-slate-800 leading-none">{selectedQuote ? getCurrencySymbol(selectedQuote.currency) : "$"}{(selectedQuote?.price || 275.15).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      {/* Barcode */}
                      <div className="flex justify-center w-full opacity-80 mix-blend-multiply relative z-20">
                        <div className="h-14 w-full max-w-[200px] flex gap-[2px] bg-transparent items-center justify-center overflow-hidden grayscale">
                           {[...Array(42)].map((_, i) => {
                             const widths = ["w-[1px]", "w-[2.5px]", "w-[1px]", "w-[3.5px]", "w-[1px]", "w-[2px]"];
                             return (
                               <div key={i} className={cn("h-full bg-[#111] rounded-[0.5px]", widths[i % widths.length])} style={{ opacity: Math.sin(i) > 0.5 ? 0.8 : 1 }} />
                             );
                           })}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full max-w-[540px]">
                    <button type="button" onClick={resetAndNewShipment} className="flex-1 flex items-center justify-center gap-2.5 h-[52px] rounded-[12px] border border-slate-200 bg-white text-[14px] font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm px-2">
                      <PlusSquare className="h-4 w-4 shrink-0 text-slate-500 stroke-[2.5]" /> 
                      <span className="whitespace-nowrap">Yeni Gönderi Oluştur</span>
                    </button>
                    <button
                       type="button"
                       disabled={labelLoading}
                       onClick={async () => {
                         if (!shipmentId) return;
                         setLabelLoading(true);
                         setLabelError(null);
                         setLabelData(null);
                         const delayMs = (ms: number) => new Promise(r => setTimeout(r, ms));
                         try {
                           for (let i = 0; i < 4; i++) {
                             const result = adminMode
                               ? await adminService.getShipmentLabel(shipmentId)
                               : await fetch(`${API_BASE}/api/shipments/${shipmentId}/label`, {
                                   headers: { Authorization: `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('zalusa.token') || '' : ''}` },
                                 }).then(r => r.json());
                             if (result.hasLabel) {
                               setLabelData(result);
                               setLabelLoading(false);
                               return;
                             }
                             if (i < 3) await delayMs(3000);
                           }
                           setLabelError("Etiket henüz hazır değil. PTS entegrasyonu tamamlanıyor olabilir, birkaç dakika sonra tekrar deneyin.");
                         } catch (err: any) {
                           setLabelError(err?.message || "Etiket bilgisi alınamadı");
                         } finally {
                           setLabelLoading(false);
                         }
                       }}
                       className="flex-1 flex items-center justify-center gap-2.5 h-[52px] rounded-[12px] bg-[#3B5FE5] hover:bg-[#324FC7] text-white text-[13px] font-bold transition-all shadow-sm px-2 disabled:opacity-60 disabled:cursor-not-allowed"
                     >
                       {labelLoading ? (
                         <><Loader2 className="h-4 w-4 shrink-0 animate-spin" /> <span className="whitespace-nowrap">Etiket Sorgulanıyor...</span></>
                       ) : (
                         <><Tag className="h-4 w-4 shrink-0" /> <span className="whitespace-nowrap">Etiket Oluştur ve Takip No Öğren</span></>
                       )}
                     </button>
                   </div>

                   {/* PTS Etiket Sonucu */}
                   {labelData && labelData.hasLabel && (
                     <div className="w-full max-w-[540px] mt-4 rounded-2xl bg-emerald-50 border border-emerald-200 p-5">
                       <div className="flex items-center gap-2 mb-3">
                         <CheckCircle className="h-5 w-5 text-emerald-600" />
                         <span className="text-sm font-bold text-emerald-800">Kargo Etiketi Hazır</span>
                       </div>
                       {labelData.integrationType === "pts" && (
                         <div className="space-y-2">
                           <div className="flex items-center justify-between">
                             <span className="text-xs font-medium text-emerald-600">PTS AWB Numarası</span>
                             <span className="text-sm font-bold text-emerald-900 font-mono">{labelData.awb}</span>
                           </div>
                           {labelData.pdfUrl && (
                             <a
                               href={labelData.pdfUrl}
                               target="_blank"
                               rel="noopener noreferrer"
                               className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold transition-colors shadow-sm mt-3"
                             >
                               <Printer className="h-4 w-4" />
                               Etiket PDF İndir
                             </a>
                           )}
                         </div>
                       )}
                       {labelData.integrationType === "asset" && (
                         <div className="space-y-2">
                           <div className="flex items-center justify-between">
                             <span className="text-xs font-medium text-emerald-600">Referans No</span>
                             <span className="text-sm font-bold text-emerald-900 font-mono">{labelData.reference}</span>
                           </div>
                           {labelData.supplierRef && (
                             <div className="flex items-center justify-between">
                               <span className="text-xs font-medium text-emerald-600">Taşıyıcı Takip No</span>
                               <span className="text-sm font-bold text-emerald-900 font-mono">{labelData.supplierRef}</span>
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   )}

                   {/* Etiket Hata */}
                   {labelError && !labelData?.hasLabel && (
                     <div className="w-full max-w-[540px] mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                       <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                       <div>
                         <p className="text-sm font-semibold text-amber-800">Etiket Henüz Hazır Değil</p>
                         <p className="text-xs text-amber-700 mt-1">{labelError}</p>
                       </div>
                     </div>
                   )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ===== EXTRA SERVICES MODAL ===== */}
      {/* GEÇİCİ OLARAK İPTAL EDİLDİ */}
      {false && showServicesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[500px] rounded-[24px] bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Size Uygun Ek Hizmetler</h2>
              <button onClick={() => setShowServicesModal(false)} className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 text-slate-400">
                <Plus className="h-5 w-5 rotate-45" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {/* Kargo onayı */}
              <div className="rounded-2xl border-2 border-brand-500 p-5 bg-white relative shadow-[0_4px_16px_rgba(37,99,235,0.15)] ring-4 ring-brand-50">
                <div className="flex items-start gap-4">
                  <div className="flex shrink-0 h-6 w-6 mt-0.5 items-center justify-center rounded-[6px] bg-brand-600 border-brand-600 text-white border-2">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[16px] font-bold text-slate-900">Kargo Firması Seçildi</div>
                    <p className="mt-2 text-[14px] text-slate-500 font-medium leading-relaxed pr-2">
                      Seçtiğiniz kargo firması ile gönderiyi onaylayabilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-center gap-4">
              <div className="flex items-center gap-3">
                <Button onClick={() => { update("hasInsurance", false); confirmServicesAndNext(); }} className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 h-12 rounded-xl">
                  Onayla ve Devam Et
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showProformaExcel && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowProformaExcel(false)} />
    <div className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-auto rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-900">Excel'den Ürün Yükle</h3>
        <button onClick={() => setShowProformaExcel(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-100">
          <X className="h-4 w-4 text-slate-500" />
        </button>
      </div>
      <ProformaExcelUploader
        onImport={importProformaFromExcel}
        onClose={() => setShowProformaExcel(false)}
      />
    </div>
  </div>
)}
{showPackageExcel && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowPackageExcel(false)} />
    <div className="relative z-10 w-full max-w-3xl max-h-[85vh] overflow-auto rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-900">Excel'den Paket Yükle</h3>
        <button onClick={() => setShowPackageExcel(false)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-100">
          <X className="h-4 w-4 text-slate-500" />
        </button>
      </div>
      <PackageExcelUploader
        onImport={importPackagesFromExcel}
        onClose={() => setShowPackageExcel(false)}
      />
    </div>
  </div>
)}

{/* ── Error Modal ── */}
{errorModal && (() => {
  const isCapacity = errorModal.title === "Kapasite Aşımı";
  return (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setErrorModal(null)}>
    <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5 animate-in zoom-in-95 fade-in duration-200" onClick={e => e.stopPropagation()}>
      <div className="flex flex-col items-center text-center gap-3">
        <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-full", isCapacity ? "bg-amber-100" : "bg-red-100")}>
          <AlertTriangle className={cn("h-7 w-7", isCapacity ? "text-amber-600" : "text-red-600")} />
        </div>
        <div>
          <h3 className="text-[17px] font-bold text-[#0F172A]">{errorModal.title}</h3>
          <p className="mt-2 text-[13px] text-[#64748B] leading-relaxed">{errorModal.message}</p>
        </div>
        {isCapacity && (
          <div className="w-full mt-1 rounded-xl bg-amber-50 border border-amber-200 p-3">
            <p className="text-[12px] text-amber-700 font-medium">💡 Paket ölçülerinizi (en, boy, yükseklik, ağırlık) küçülterek veya adet sayısını azaltarak tekrar deneyebilirsiniz.</p>
          </div>
        )}
      </div>
      <div className="mt-5 flex items-center justify-center gap-2">
        {isCapacity ? (
          <button type="button" onClick={() => { setErrorModal(null); setStep(1); }} className="rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-[13px] font-bold text-white transition-colors flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Paket Ölçülerini Düzenle
          </button>
        ) : (
          <button type="button" onClick={() => { setErrorModal(null); window.location.href = '/panel/gonderilerim'; }} className="rounded-xl bg-[#3959F2] hover:bg-[#4338CA] px-5 py-2.5 text-[13px] font-bold text-white transition-colors">
            Gönderilerime Git
          </button>
        )}
        <button type="button" onClick={() => setErrorModal(null)} className="rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-5 py-2.5 text-[13px] font-bold text-[#0F172A] transition-colors">
          Kapat
        </button>
      </div>
    </div>
  </div>
  );
})()}

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
            {/* Ben kendim göndereceğim seçeneği */}
            <button
              type="button"
              onClick={() => { setSelectedDomesticHandler("SELF"); setDomesticSelfShipping(true); setDomesticValidationError(""); }}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-150 text-left",
                selectedDomesticHandler === "SELF"
                  ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                  : "border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
              )}
            >
              <div className={cn(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                selectedDomesticHandler === "SELF"
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-slate-300"
              )}>
                {selectedDomesticHandler === "SELF" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Package className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#0F172A]">Ben Kendim Göndereceğim</p>
                <p className="text-[11px] text-[#94A3B8] mt-0.5">Paketi kendiniz Zalusa merkezine gönderebilirsiniz</p>
              </div>
            </button>

            {/* Ayırıcı */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">veya kargo firması seçin</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {domesticCarriers.map((carrier) => (
              <button
                key={carrier.handlerCode}
                type="button"
                onClick={() => { setSelectedDomesticHandler(carrier.handlerCode); setDomesticSelfShipping(false); setDomesticValidationError(""); }}
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
            if (!selectedDomesticHandler || !shipmentId) return;
            try {
              setLoading(true);
              setDomesticValidationError("");

              if (selectedDomesticHandler === "SELF") {
                // "Ben kendim gonderecegim" - validasyon yok, direkt kaydet
                await api.updateDraft(shipmentId, 3, {
                  domesticHandlerCode: "SELF",
                  domesticSelfShipping: true,
                });
                setShowDomesticSelection(false);
                setDomesticValidationError("");
                setStep(4);
              } else {
                // Basit Kargo ile kargo firmasini dogrula
                const valResult = await api.validateDomesticCarrier(String(shipmentId), selectedDomesticHandler);
                if (!valResult.valid) {
                  setDomesticValidationError(valResult.error || "Bu kargo firmasi guzergahinizi desteklemiyor. Lutfen baska bir firma secin.");
                  setLoading(false);
                  return;
                }
              
                // Dogrulama basarili - secimi backend'e kaydet
                await api.updateDraft(shipmentId, 3, {
                  domesticHandlerCode: selectedDomesticHandler,
                  domesticSelfShipping: false,
                });
                setShowDomesticSelection(false);
                setDomesticValidationError("");
                setStep(4);
              }
            } catch (err: any) {
              setDomesticValidationError("Kargo firması doğrulanamadı: " + (err?.message || ""));
            } finally {
              setLoading(false);
            }
          }}
          className={cn(
            "rounded-xl px-6 py-2.5 text-[13px] font-bold text-white transition-all flex items-center gap-2",
            selectedDomesticHandler
              ? "bg-indigo-600 hover:bg-indigo-700 shadow-sm"
              : "bg-slate-300 cursor-not-allowed"
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          Seç ve Devam Et
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

// Default export — user modunda çalışır
export default function GonderiOlusturPage() {
  return <ShipmentWizardCore />;
}