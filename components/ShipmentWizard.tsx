"use client";

import React, { useState, useEffect } from "react";
import {
  Package, FileText, BoxSelect, ArrowLeft, ArrowRight, Check,
  Loader2, MapPin, Ruler, Truck, Receipt, CheckCircle2, Globe,
  User, Phone, Building, MapPinned, Shield, AlertTriangle,
  Clock, Star, Zap, BadgeDollarSign, Search, Plus, BookOpen,
} from "lucide-react";
import {
  shipmentService, addressService,
  type ApiCarrierQuote, type ApiAddress, type ApiPackage,
} from "@/lib/services/shipmentService";
import { CitySelect } from "@/components/ui/city-select";
import { useToast } from "@/components/ui/toast";

// ─── Config ────────────────────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const WIZARD_STEPS = [
  { label: "Kargo Bilgileri", icon: Package },
  { label: "Paket Ölçüleri", icon: Ruler },
  { label: "Fiyatlandırma", icon: Truck },
  { label: "Adresler", icon: MapPin },
  { label: "Proforma", icon: Receipt },
  { label: "Onay", icon: CheckCircle2 },
];

const SHIPMENT_TYPES = [
  { value: "Paket", label: "📦 Paket", desc: "Ürün, aksesuar, numune" },
  { value: "Belge", label: "📄 Belge", desc: "Dosya, sözleşme, fatura" },
  { value: "Koli", label: "📦 Koli", desc: "Büyük paketler" },
];

interface ShipmentWizardProps {
  onClose: () => void;
  onComplete: (trackingCode: string, totalCost: number) => void;
}

export default function ShipmentWizard({ onClose, onComplete }: ShipmentWizardProps) {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capacityModal, setCapacityModal] = useState<string | null>(null);

  // Step 0: Temel bilgiler
  const [shipmentType, setShipmentType] = useState("Paket");
  const [receiverCountry, setReceiverCountry] = useState("");
  const [receiverPostalCode, setReceiverPostalCode] = useState("");
  const [countries, setCountries] = useState<{ isoCode: string; countryName: string }[]>([]);
  const [countrySearch, setCountrySearch] = useState("");

  // Step 1: Paket ölçüleri
  const [widthCm, setWidthCm] = useState("");
  const [lengthCm, setLengthCm] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [packageCount, setPackageCount] = useState("1");

  // Step 2: Fiyatlandırma
  const [quotes, setQuotes] = useState<ApiCarrierQuote[]>([]);
  const [selectedCarrierId, setSelectedCarrierId] = useState("");
  const [hasInsurance, setHasInsurance] = useState(false);

  // Step 3: Adresler
  const [senderAddresses, setSenderAddresses] = useState<ApiAddress[]>([]);
  const [receiverAddresses, setReceiverAddresses] = useState<ApiAddress[]>([]);
  const [selectedSenderAddressId, setSelectedSenderAddressId] = useState<number | null>(null);
  const [selectedReceiverAddressId, setSelectedReceiverAddressId] = useState<number | null>(null);
  const [showNewReceiver, setShowNewReceiver] = useState(false);
  const [receiverName, setReceiverName] = useState("");
  const [receiverCompany, setReceiverCompany] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [receiverAddress, setReceiverAddress] = useState("");
  const [receiverCity, setReceiverCity] = useState("");
  const [addressTab, setAddressTab] = useState<"sender" | "receiver">("sender");
  const [addressSearch, setAddressSearch] = useState("");

  // Step 4: Proforma
  const [proformaDescription, setProformaDescription] = useState("");
  const [proformaCurrency, setProformaCurrency] = useState("EUR");
  const [productDescription, setProductDescription] = useState("");
  const [productQuantity, setProductQuantity] = useState("1");
  const [productUnitPrice, setProductUnitPrice] = useState("");
  const [productHsCode, setProductHsCode] = useState("");

  const [descriptionTypes, setDescriptionTypes] = useState<{ id: number; label: string }[]>([]);

  // ── Ülkeleri yükle ──
  useEffect(() => {
    fetch(`${API_BASE}/api/countries`)
      .then(r => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) setCountries(data);
      })
      .catch(() => {});
  }, []);

  // ── Adresleri yükle ──
  useEffect(() => {
    addressService.list().then(r => {
      setSenderAddresses(r.addresses.filter(a => a.type === "sender"));
      setReceiverAddresses(r.addresses.filter(a => a.type === "receiver"));
      // İlk gönderici adresini seç
      const firstSender = r.addresses.find(a => a.type === "sender");
      if (firstSender) setSelectedSenderAddressId(firstSender.id);
    }).catch(() => {});
  }, []);

  // ── Gönderi açıklama tiplerini yükle ──
  useEffect(() => {
    fetch(`${API_BASE}/api/shipment-description-types`)
      .then(r => r.json())
      .then((data: any) => {
        if (data?.types) setDescriptionTypes(data.types);
      })
      .catch(() => {});
  }, []);

  // ── Hesaplamalar ──
  const w = Math.max(parseFloat(widthCm) || 0, 0);
  const l = Math.max(parseFloat(lengthCm) || 0, 0);
  const h = Math.max(parseFloat(heightCm) || 0, 0);
  const kg = Math.max(parseFloat(weightKg) || 0, 0);
  const cnt = Math.max(parseInt(packageCount) || 1, 1);
  const volumetricWeight = (w * l * h) / 5000;
  const chargeableWeight = Math.max(kg, volumetricWeight) * cnt;

  const selectedQuote = quotes.find(q => q.carrierId === selectedCarrierId);
  const totalCost = (selectedQuote?.priceTry ?? 0) + (hasInsurance ? 52.20 : 0);

  const filteredCountries = countries.filter(c => {
    const q = countrySearch.toLowerCase();
    return !q || c.countryName.toLowerCase().includes(q) || c.isoCode.toLowerCase().includes(q);
  });

  const selectedCountryName = countries.find(c => c.isoCode === receiverCountry)?.countryName || receiverCountry;

  // ── Adım geçişi ──
  async function goNext() {
    setError(null);
    setLoading(true);

    try {
      if (step === 0) {
        if (!receiverCountry) { setError("Hedef ülke seçiniz."); setLoading(false); return; }
        if (!receiverPostalCode) { setError("Posta kodu giriniz."); setLoading(false); return; }
      }

      if (step === 1) {
        if (!widthCm || !lengthCm || !heightCm || !weightKg) {
          setError("Tüm paket ölçülerini giriniz."); setLoading(false); return;
        }
        // Belge tipinde sabit ölçüler
        const packages: ApiPackage[] = shipmentType === "Belge"
          ? [{ widthCm: 1, lengthCm: 1, heightCm: 1, weightKg: 0.5, packageCount: 1 }]
          : [{ widthCm: w, lengthCm: l, heightCm: h, weightKg: kg, packageCount: cnt }];

        // Fiyat sorgula
        const res = await shipmentService.getQuotes({
          senderCountry: "TR",
          receiverCountry,
          receiverPostalCode,
          packages,
        });
        setQuotes(res.quotes || []);
        if (!res.quotes?.length) {
          if (res.capacity_exceeded) {
            setCapacityModal(res.message || "Girdiğiniz ölçüler mevcut kargo kapasitelerini aşmaktadır. Lütfen kapasitenize uygun bir ürün giriniz.");
          } else {
            setError("Bu rota için uygun kargo firması bulunamadı.");
          }
          setLoading(false);
          return;
        }
        // Tavsiye edileni seç
        const rec = res.quotes.find(q => q.tags.includes("recommended"));
        setSelectedCarrierId(rec?.carrierId || res.quotes[0]?.carrierId || "");
      }

      if (step === 2) {
        if (!selectedCarrierId) { setError("Kargo firması seçiniz."); setLoading(false); return; }
      }

      if (step === 3) {
        if (!selectedSenderAddressId) { setError("Gönderici adresi seçiniz."); setLoading(false); return; }
        if (!selectedReceiverAddressId && !showNewReceiver) { setError("Alıcı adresi seçiniz veya yeni adres giriniz."); setLoading(false); return; }
        if (showNewReceiver && (!receiverName || !receiverAddress || !receiverCity)) {
          setError("Alıcı bilgilerini eksiksiz giriniz."); setLoading(false); return;
        }
      }

      if (step === 4) {
        if (!proformaDescription) { setError("Gönderi açıklaması seçiniz."); setLoading(false); return; }
        if (!productDescription) { setError("Ürün açıklaması giriniz."); setLoading(false); return; }
        if (!productUnitPrice) { setError("Birim fiyat giriniz."); setLoading(false); return; }
      }

      setStep(s => s + 1);
    } catch (err: any) {
      const msg = err?.message || "Bir hata oluştu.";
      setError(msg);
      toast.error(msg, "Adım Hatası");
    } finally {
      setLoading(false);
    }
  }

  // ── Kargo oluştur ──
  async function handleCreate() {
    setError(null);
    setLoading(true);

    try {
      const packages: ApiPackage[] = shipmentType === "Belge"
        ? [{ widthCm: 1, lengthCm: 1, heightCm: 1, weightKg: 0.5, packageCount: 1 }]
        : [{ widthCm: w, lengthCm: l, heightCm: h, weightKg: kg, packageCount: cnt }];

      const result = await shipmentService.quickCreate({
        shipmentType: shipmentType as "Belge" | "Paket" | "Koli",
        receiverCountry,
        receiverPostalCode,
        packages,
        selectedCarrierId,
        hasInsurance,
        senderAddressId: selectedSenderAddressId,
        receiverAddressId: showNewReceiver ? null : selectedReceiverAddressId,
        receiverName: showNewReceiver ? receiverName : undefined,
        receiverCompany: showNewReceiver ? receiverCompany : undefined,
        receiverPhone: showNewReceiver ? receiverPhone : undefined,
        receiverAddress: showNewReceiver ? receiverAddress : undefined,
        receiverCity: showNewReceiver ? receiverCity : undefined,
        proformaDescription,
        proformaCurrency,
        proformaItems: [{
          productDescription,
          hsCode: productHsCode,
          quantity: Math.max(1, parseInt(productQuantity) || 1),
          unitPrice: parseFloat(productUnitPrice) || 0,
          originCountry: "TR",
        }],
        autoFinalize: true,
      });

      onComplete(result.trackingCode, result.totalCost);
    } catch (err: any) {
      const msg = err?.message || "Kargo oluşturulamadı.";
      setError(msg);
      toast.error(msg, "Kargo Oluşturma Hatası");
    } finally {
      setLoading(false);
    }
  }

  // ── Belge tipi seçildiğinde otomatik ölçüler ──
  useEffect(() => {
    if (shipmentType === "Belge") {
      setWidthCm("1"); setLengthCm("1"); setHeightCm("1"); setWeightKg("0.5"); setPackageCount("1");
    }
  }, [shipmentType]);

  // ── CSS classes ──
  const inputCls = "w-full h-9 px-3 rounded-lg bg-slate-50 text-[13px] text-slate-700 border border-slate-200 outline-none focus:border-blue-300 focus:ring-1 focus:ring-blue-100 transition-all";
  const labelCls = "block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1";
  const cardCls = "rounded-xl p-3 ring-1 ring-slate-200 bg-white transition-all cursor-pointer hover:ring-blue-200";
  const cardSelectedCls = "rounded-xl p-3 ring-2 ring-blue-500 bg-blue-50/60 transition-all cursor-pointer";

  return (
    <div className="flex flex-col h-full">
      {/* ── Step indicator ── */}
      <div className="px-4 py-2 shrink-0 flex gap-1 bg-[#1e3a8a]">
        {WIZARD_STEPS.map((s, i) => (
          <div key={i} className="flex-1 text-center">
            <div className={`h-1 rounded-full transition-all mb-1 ${i < step ? "bg-emerald-400" : i === step ? "bg-white" : "bg-white/20"}`} />
            <span className={`text-[9px] font-medium hidden sm:block ${i <= step ? "text-white/90" : "text-white/30"}`}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: "#f0f4ff" }}>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-700">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ══════════ STEP 0: Temel Bilgiler ══════════ */}
        {step === 0 && (
          <div className="space-y-4">
            {/* Gönderi tipi */}
            <div>
              <label className={labelCls}>Gönderi Tipi</label>
              <div className="grid grid-cols-3 gap-2">
                {SHIPMENT_TYPES.map(t => (
                  <button key={t.value} onClick={() => setShipmentType(t.value)}
                    className={shipmentType === t.value ? cardSelectedCls : cardCls}>
                    <div className="text-center">
                      <div className="text-lg">{t.label.slice(0, 2)}</div>
                      <div className="text-[11px] font-semibold mt-1">{t.value}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Hedef ülke */}
            <div>
              <label className={labelCls}>Hedef Ülke</label>
              <input
                type="text"
                value={countrySearch}
                onChange={e => { setCountrySearch(e.target.value); if (receiverCountry) setReceiverCountry(""); }}
                placeholder="Ülke ara... (ör: Almanya)"
                className={inputCls}
              />
              {countrySearch && !receiverCountry && (
                <div className="mt-1 max-h-32 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                  {filteredCountries.slice(0, 8).map(c => (
                    <button key={c.isoCode} onClick={() => { setReceiverCountry(c.isoCode); setCountrySearch(c.countryName); }}
                      className="w-full text-left px-3 py-2 text-[12px] hover:bg-blue-50 flex items-center gap-2">
                      <img src={((c.isoCode.toUpperCase() === "US" || c.isoCode.toUpperCase() === "ABD") ? "/us-flag.png" : c.isoCode.toUpperCase() === "IK" ? "/ik-flag.png" : `https://flagcdn.com/w20/${c.isoCode.toLowerCase()}.png`)} alt={c.isoCode} className="h-3.5 w-5 object-cover rounded-sm" />
                      <span>{c.countryName}</span>
                      <span className="text-slate-400 ml-auto">{c.isoCode}</span>
                    </button>
                  ))}
                </div>
              )}
              {receiverCountry && (
                <div className="mt-1 flex items-center gap-2 text-[12px] text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                  <Check className="h-3.5 w-3.5" />
                  <span>{selectedCountryName} ({receiverCountry})</span>
                </div>
              )}
            </div>

            {/* Posta kodu */}
            <div>
              <label className={labelCls}>Alıcı Posta Kodu</label>
              <input type="text" value={receiverPostalCode} onChange={e => setReceiverPostalCode(e.target.value)}
                placeholder="Posta kodu (ör: 10115)" className={inputCls} />
            </div>
          </div>
        )}

        {/* ══════════ STEP 1: Paket Ölçüleri ══════════ */}
        {step === 1 && (
          <div className="space-y-3">
            {shipmentType === "Belge" ? (
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-[13px] font-semibold text-slate-700">Belge gönderimi</p>
                <p className="text-[11px] text-slate-500 mt-1">Sabit ölçüler: 0.5 kg, otomatik hesaplanır</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={labelCls}>En (cm)</label>
                    <input type="number" value={widthCm} onChange={e => setWidthCm(e.target.value)} placeholder="30" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Boy (cm)</label>
                    <input type="number" value={lengthCm} onChange={e => setLengthCm(e.target.value)} placeholder="20" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Yükseklik (cm)</label>
                    <input type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="15" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Ağırlık (kg)</label>
                    <input type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="2.5" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Adet</label>
                  <input type="number" value={packageCount} onChange={e => setPackageCount(e.target.value)} placeholder="1" className={inputCls} />
                </div>

                {/* Desi bilgisi */}
                {w > 0 && l > 0 && h > 0 && kg > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3 space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Desi</span>
                      <span className="font-semibold">{(volumetricWeight * cnt).toFixed(2)} kg</span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-500">Gerçek ağırlık</span>
                      <span className="font-semibold">{(kg * cnt).toFixed(2)} kg</span>
                    </div>
                    <div className="flex justify-between text-[12px] pt-1 border-t border-slate-200">
                      <span className="text-slate-700 font-semibold">Ücretlendirme</span>
                      <span className="font-bold text-blue-600">{chargeableWeight.toFixed(2)} kg</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════ STEP 2: Fiyatlandırma ══════════ */}
        {step === 2 && (
          <div className="space-y-3">
            {quotes.length === 0 ? (
              <div className="text-center py-6 text-[13px] text-slate-500">Uygun kargo firması bulunamadı.</div>
            ) : (
              <>
                <p className="text-[11px] text-slate-500 font-medium">
                  {quotes.length} kargo seçeneği bulundu
                </p>
                {quotes.map(q => {
                  const isSelected = selectedCarrierId === q.carrierId;
                  return (
                    <button key={q.carrierId} onClick={() => setSelectedCarrierId(q.carrierId)}
                      className={`w-full text-left ${isSelected ? cardSelectedCls : cardCls}`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-9 w-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shadow-sm ${q.logoColor || "bg-slate-600"}`}>
                          {q.logoLetter}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[13px] font-semibold">{q.carrierName}</span>
                            {q.tags.includes("recommended") && <Star className="h-3 w-3 text-amber-500" />}
                            {q.tags.includes("fastest") && <Zap className="h-3 w-3 text-sky-500" />}
                            {q.tags.includes("cheapest") && <BadgeDollarSign className="h-3 w-3 text-emerald-500" />}
                          </div>
                          <div className="text-[11px] text-slate-500">{q.serviceName} · {q.deliveryLabel}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[15px] font-bold">{q.priceTry.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</div>
                          <div className="text-[10px] text-slate-400">{q.currency} {q.price.toFixed(2)}</div>
                        </div>
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center ring-1 ${isSelected ? "bg-blue-600 ring-blue-600 text-white" : "ring-slate-300"}`}>
                          {isSelected && <Check className="h-3 w-3" />}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Sigorta */}
                <button onClick={() => setHasInsurance(!hasInsurance)}
                  className={`w-full text-left ${hasInsurance ? cardSelectedCls : cardCls}`}>
                  <div className="flex items-center gap-3">
                    <Shield className={`h-5 w-5 ${hasInsurance ? "text-blue-600" : "text-slate-400"}`} />
                    <div className="flex-1">
                      <div className="text-[12px] font-semibold">Kargo Sigortası</div>
                      <div className="text-[10px] text-slate-500">Kayıp/hasar güvencesi</div>
                    </div>
                    <span className="text-[12px] font-bold text-slate-700">+52,20 ₺</span>
                    <div className={`h-5 w-5 rounded-full flex items-center justify-center ring-1 ${hasInsurance ? "bg-blue-600 ring-blue-600 text-white" : "ring-slate-300"}`}>
                      {hasInsurance && <Check className="h-3 w-3" />}
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>
        )}

        {/* ══════════ STEP 3: Adresler ══════════ */}
        {step === 3 && (
          <div className="space-y-0">
            {/* ── White Card Container ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
              {/* Header */}
              <div className="px-6 pt-6 pb-4">
                <h3 className="text-[18px] font-bold text-slate-900">Adres Bilgileri</h3>
                <p className="text-[13px] text-slate-400 mt-1">Gönderen ve alıcı adreslerini seçin veya yeni ekleyin.</p>
              </div>

              {/* ── Tab Switcher ── */}
              <div className="px-6 pb-5">
                <div className="flex rounded-full p-[3px] bg-slate-100 border border-slate-200/60">
                  <button onClick={() => { setAddressTab("sender"); setAddressSearch(""); }}
                    className={`flex-1 py-3 rounded-full text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      addressTab === "sender"
                        ? "bg-[#1e3a8a] text-white shadow-md"
                        : "text-slate-500 hover:text-slate-700"
                    }`}>
                    {selectedSenderAddressId && <Check className={`h-4 w-4 ${addressTab === "sender" ? "text-emerald-300" : "text-emerald-500"}`} />}
                    Gönderici
                  </button>
                  <button onClick={() => { setAddressTab("receiver"); setAddressSearch(""); }}
                    className={`flex-1 py-3 rounded-full text-[13px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                      addressTab === "receiver"
                        ? "bg-[#1e3a8a] text-white shadow-md"
                        : "text-slate-500 hover:text-slate-700"
                    }`}>
                    {selectedReceiverAddressId && <Check className={`h-4 w-4 ${addressTab === "receiver" ? "text-emerald-300" : "text-emerald-500"}`} />}
                    {receiverAddresses.length > 0 && <span className={`text-[11px] ${addressTab === "receiver" ? "text-white/70" : "text-slate-400"}`}>{receiverAddresses.length}</span>}
                    Alıcı
                  </button>
                </div>
              </div>

              {/* ══════ GÖNDERİCİ TAB ══════ */}
              {addressTab === "sender" && (
                <div className="px-6 pb-6 space-y-5">
                  {/* Son Kullanılan Göndericiler */}
                  {senderAddresses.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.12em] mb-3">Son Kullanılan Göndericiler</p>
                      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                        {senderAddresses.slice(0, 4).map(a => {
                          const initials = a.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                          const isActive = selectedSenderAddressId === a.id;
                          return (
                            <button key={a.id} onClick={() => setSelectedSenderAddressId(a.id)}
                              className={`flex items-center gap-3 pl-2 pr-4 py-2 rounded-full border-2 transition-all whitespace-nowrap shrink-0 ${
                                isActive
                                  ? "border-indigo-500 bg-indigo-50"
                                  : "border-slate-200 bg-white hover:border-indigo-200"
                              }`}>
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-[12px] font-bold shrink-0 ${
                                isActive ? "bg-indigo-600 text-white" : "bg-indigo-100 text-indigo-600"
                              }`}>
                                {initials}
                              </div>
                              <div className="text-left">
                                <div className="text-[12px] font-semibold text-slate-800">{a.name}</div>
                                <div className="text-[10px] text-slate-400">{a.city} · {a.countryCode || "TR"}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Başlık + Ekle */}
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-bold text-slate-800">Kayıtlı Gönderici Adresleriniz</p>
                    <button className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                      <Plus className="h-4 w-4" />
                      Yeni Gönderici Adresi Ekle
                    </button>
                  </div>

                  {/* Arama */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" value={addressSearch} onChange={e => setAddressSearch(e.target.value)}
                      placeholder="İsim veya adres ile arayın..."
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all placeholder:text-slate-400" />
                  </div>

                  {/* Adres Kartları */}
                  {senderAddresses.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      <User className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-[13px] text-slate-500 font-medium">Kayıtlı gönderici adresi yok.</p>
                      <p className="text-[12px] text-slate-400 mt-1">Profil sayfasından ekleyebilirsiniz.</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {senderAddresses.filter(a => {
                        if (!addressSearch) return true;
                        const q = addressSearch.toLowerCase();
                        return a.name.toLowerCase().includes(q) || a.address.toLowerCase().includes(q) || a.city.toLowerCase().includes(q);
                      }).map(a => {
                        const isSelected = selectedSenderAddressId === a.id;
                        return (
                          <button key={a.id} onClick={() => setSelectedSenderAddressId(a.id)}
                            className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-50/40 shadow-sm"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                            }`}>
                            <div className="flex items-center gap-4">
                              <div className={`h-11 w-11 rounded-full flex items-center justify-center shrink-0 ${
                                isSelected ? "bg-indigo-100" : "bg-slate-100"
                              }`}>
                                <User className={`h-5 w-5 ${isSelected ? "text-indigo-500" : "text-slate-400"}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[14px] font-semibold text-slate-800">{a.name}</span>
                                  {a.isDefault && (
                                    <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-amber-100 text-amber-700 uppercase tracking-wide">Favori</span>
                                  )}
                                </div>
                                <p className="text-[12px] text-slate-500 truncate">
                                  {a.city} · {a.address}{a.postalCode ? `, ${a.postalCode}` : ""} {a.city}
                                </p>
                                {a.phone && <p className="text-[11px] text-slate-400 mt-0.5">{a.phone}</p>}
                              </div>
                              <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                                isSelected ? "bg-indigo-600 text-white" : "border-2 border-slate-300"
                              }`}>
                                {isSelected && <Check className="h-3.5 w-3.5" />}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ══════ ALICI TAB ══════ */}
              {addressTab === "receiver" && (
                <div className="px-6 pb-6 space-y-5">
                  {/* Son Gönderilen Alıcılar */}
                  {receiverAddresses.length > 0 && (
                    <div>
                      <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.12em] mb-3">Son Gönderilen Alıcılar</p>
                      <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
                        {receiverAddresses.slice(0, 5).map((a, idx) => {
                          const initials = a.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
                          const chipColors = [
                            { bg: "bg-purple-600", light: "bg-purple-100", text: "text-purple-600" },
                            { bg: "bg-emerald-600", light: "bg-emerald-100", text: "text-emerald-600" },
                            { bg: "bg-amber-500", light: "bg-amber-100", text: "text-amber-600" },
                            { bg: "bg-rose-500", light: "bg-rose-100", text: "text-rose-600" },
                            { bg: "bg-cyan-600", light: "bg-cyan-100", text: "text-cyan-600" },
                          ];
                          const color = chipColors[idx % chipColors.length];
                          const isActive = selectedReceiverAddressId === a.id;
                          return (
                            <button key={a.id} onClick={() => { setSelectedReceiverAddressId(a.id); setShowNewReceiver(false); }}
                              className={`flex items-center gap-3 pl-2 pr-4 py-2 rounded-full border-2 transition-all whitespace-nowrap shrink-0 ${
                                isActive
                                  ? "border-indigo-500 bg-indigo-50"
                                  : "border-slate-200 bg-white hover:border-indigo-200"
                              }`}>
                              <div className={`h-10 w-10 rounded-full ${color.bg} text-white flex items-center justify-center text-[12px] font-bold shrink-0`}>
                                {initials}
                              </div>
                              <div className="text-left">
                                <div className="text-[12px] font-semibold text-slate-800">{a.name}</div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                  {a.city}
                                  {a.countryCode && (
                                    <img src={`https://flagcdn.com/w20/${a.countryCode.toLowerCase()}.png`}
                                      alt={a.countryCode} className="h-2.5 w-3.5 object-cover rounded-sm" />
                                  )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Arama */}
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" value={addressSearch} onChange={e => setAddressSearch(e.target.value)}
                      placeholder="İsim veya adres ile ara..."
                      className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all placeholder:text-slate-400" />
                  </div>

                  {/* Başlık + Ekle */}
                  <div className="flex items-center justify-between">
                    <p className="text-[14px] font-bold text-slate-800">Alıcı Adresi <span className="text-red-500">*</span></p>
                    <button onClick={() => { setShowNewReceiver(true); setSelectedReceiverAddressId(null); }}
                      className="text-[12px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                      <Plus className="h-4 w-4" />
                      Yeni Adres Ekle
                    </button>
                  </div>

                  {/* Adres Kartları Grid */}
                  {!showNewReceiver && receiverAddresses.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {receiverAddresses.filter(a => {
                        if (!addressSearch) return true;
                        const q = addressSearch.toLowerCase();
                        return a.name.toLowerCase().includes(q) || a.address.toLowerCase().includes(q) || a.city.toLowerCase().includes(q);
                      }).map(a => {
                        const isSelected = selectedReceiverAddressId === a.id;
                        return (
                          <button key={a.id} onClick={() => setSelectedReceiverAddressId(a.id)}
                            className={`text-left p-5 rounded-xl border-2 transition-all duration-200 relative ${
                              isSelected
                                ? "border-indigo-500 bg-indigo-50/60 shadow-md"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                            }`}>
                            {/* Checkmark */}
                            {isSelected && (
                              <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            )}
                            <div className="pr-8">
                              <span className="text-[14px] font-bold text-slate-800 block">{a.name}</span>
                              {a.isDefault && (
                                <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[9px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wide">Favori</span>
                              )}
                            </div>
                            <p className="text-[12px] text-slate-500 mt-2.5 leading-relaxed">
                              {a.address}{a.postalCode ? `, ${a.postalCode}` : ""} {a.city}{a.countryCode ? `, ${a.countryCode}` : ""}
                            </p>
                            {a.phone && <p className="text-[12px] text-slate-400 mt-1.5">{a.phone}</p>}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* + Yeni Adres Ekle (Dashed Button) */}
                  {!showNewReceiver && (
                    <button onClick={() => { setShowNewReceiver(true); setSelectedReceiverAddressId(null); }}
                      className="w-full py-4 rounded-xl border-2 border-dashed border-slate-300 text-[13px] font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2">
                      <Plus className="h-4 w-4" />
                      Yeni Adres Ekle
                    </button>
                  )}

                  {/* Yeni Alıcı Formu */}
                  {showNewReceiver && (
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[14px] font-bold text-slate-800">Yeni Alıcı Adresi</p>
                        {receiverAddresses.length > 0 && (
                          <button onClick={() => setShowNewReceiver(false)}
                            className="text-[12px] text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                            Kayıtlı adreslerden seç
                          </button>
                        )}
                      </div>
                      <input type="text" value={receiverName} onChange={e => setReceiverName(e.target.value)}
                        placeholder="Alıcı adı soyadı" className={inputCls} />
                      <input type="text" value={receiverCompany} onChange={e => setReceiverCompany(e.target.value)}
                        placeholder="Firma adı (opsiyonel)" className={inputCls} />
                      <input type="text" value={receiverPhone} onChange={e => setReceiverPhone(e.target.value)}
                        placeholder="Telefon" className={inputCls} />
                      <div>
                        <label className={labelCls}>Şehir</label>
                        <CitySelect
                          countryCode={receiverCountry}
                          value={receiverCity}
                          onChange={(v) => setReceiverCity(v)}
                          placeholder="Şehir seçiniz"
                          className="h-9 text-[13px]"
                        />
                      </div>
                      <input type="text" value={receiverAddress} onChange={e => setReceiverAddress(e.target.value)}
                        placeholder="Açık adres" className={inputCls} />
                    </div>
                  )}

                  {/* İpucu Bandı */}
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100">
                    <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <p className="text-[12px] text-indigo-700 leading-relaxed">
                      <span className="font-semibold">İpucu:</span> Adres defterinde kayıtlı adreslere hızlı erişebilirsin.{" "}
                      <span className="font-bold text-indigo-800 underline cursor-pointer hover:text-indigo-900 transition-colors">Adres Defterim →</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Alt Durum Barı ── */}
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl mt-4" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
              <div className={`flex items-center gap-3 flex-1 ${
                selectedSenderAddressId ? "opacity-100" : "opacity-40"
              }`}>
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-white">
                    {selectedSenderAddressId ? senderAddresses.find(a => a.id === selectedSenderAddressId)?.name || "Seçildi" : "Seçilmedi"}
                  </p>
                  <p className="text-[10px] text-slate-400">Gönderici</p>
                </div>
              </div>
              <div className="flex items-center justify-center shrink-0 px-2">
                <ArrowRight className="h-4 w-4 text-indigo-400" />
              </div>
              <div className={`flex items-center gap-3 flex-1 justify-end ${
                selectedReceiverAddressId || showNewReceiver ? "opacity-100" : "opacity-40"
              }`}>
                <div className="text-right">
                  <p className="text-[12px] font-semibold text-white">
                    {selectedReceiverAddressId ? receiverAddresses.find(a => a.id === selectedReceiverAddressId)?.name || "Seçildi" : showNewReceiver ? "Yeni adres" : "Henüz girilmedi"}
                  </p>
                  <p className="text-[10px] text-slate-400">Alıcı</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════ STEP 4: Proforma ══════════ */}
        {step === 4 && (
          <div className="space-y-3">
            <div>
              <label className={labelCls}>Gönderi Açıklaması</label>
              <select value={proformaDescription} onChange={e => setProformaDescription(e.target.value)}
                className={inputCls}>
                <option value="">Seçiniz...</option>
                {descriptionTypes.map(t => (
                  <option key={t.id} value={t.label}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Para Birimi</label>
              <select value={proformaCurrency} onChange={e => setProformaCurrency(e.target.value)} className={inputCls}>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Ürün Açıklaması (İngilizce)</label>
              <input type="text" value={productDescription} onChange={e => setProductDescription(e.target.value)}
                placeholder="Cotton T-Shirt" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className={labelCls}>Adet</label>
                <input type="number" value={productQuantity} onChange={e => setProductQuantity(e.target.value)}
                  placeholder="1" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Birim Fiyat ({proformaCurrency})</label>
                <input type="number" value={productUnitPrice} onChange={e => setProductUnitPrice(e.target.value)}
                  placeholder="12.50" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>HS Kodu (opsiyonel)</label>
              <input type="text" value={productHsCode} onChange={e => setProductHsCode(e.target.value)}
                placeholder="6109.10" className={inputCls} />
            </div>
          </div>
        )}

        {/* ══════════ STEP 5: Onay ══════════ */}
        {step === 5 && (
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200 space-y-3">
              <h4 className="text-[13px] font-bold text-slate-800 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-500" />
                Sipariş Özeti
              </h4>

              <div className="space-y-2 text-[12px]">
                <div className="flex justify-between"><span className="text-slate-500">Gönderi Tipi</span><span className="font-semibold">{shipmentType}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Hedef</span><span className="font-semibold">{selectedCountryName} ({receiverPostalCode})</span></div>
                {shipmentType !== "Belge" && (
                  <div className="flex justify-between"><span className="text-slate-500">Paket</span><span className="font-semibold">{w}x{l}x{h} cm, {kg} kg × {cnt}</span></div>
                )}
                <div className="flex justify-between"><span className="text-slate-500">Ücret. Ağırlık</span><span className="font-semibold">{chargeableWeight.toFixed(2)} kg</span></div>

                <div className="border-t border-slate-100 pt-2">
                  <div className="flex justify-between"><span className="text-slate-500">Kargo</span><span className="font-semibold">{selectedQuote?.carrierName} {selectedQuote?.serviceName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Kargo Ücreti</span><span className="font-semibold">{selectedQuote?.priceTry.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span></div>
                  {hasInsurance && <div className="flex justify-between"><span className="text-slate-500">Sigorta</span><span className="font-semibold">52,20 ₺</span></div>}
                </div>

                <div className="border-t border-slate-100 pt-2">
                  <div className="flex justify-between"><span className="text-slate-500">Proforma</span><span className="font-semibold">{productDescription}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Toplam Değer</span><span className="font-semibold">{(parseInt(productQuantity || "1") * parseFloat(productUnitPrice || "0")).toFixed(2)} {proformaCurrency}</span></div>
                </div>

                <div className="border-t-2 border-blue-100 pt-2">
                  <div className="flex justify-between text-[14px]">
                    <span className="font-bold text-slate-800">Toplam</span>
                    <span className="font-bold text-blue-600">{totalCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-3 bg-white border-t border-slate-100 shrink-0 flex items-center gap-2">
        {step > 0 && (
          <button onClick={() => { setStep(s => s - 1); setError(null); }}
            className="h-9 px-3 rounded-lg text-[12px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Geri
          </button>
        )}
        <div className="flex-1" />
        {step < 5 ? (
          <button onClick={goNext} disabled={loading}
            className="h-9 px-4 rounded-lg text-[12px] font-semibold text-white flex items-center gap-1.5 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #3d6bff 0%, #2247e6 100%)" }}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <>İleri <ArrowRight className="h-3.5 w-3.5" /></>}
          </button>
        ) : (
          <button onClick={handleCreate} disabled={loading}
            className="h-9 px-4 rounded-lg text-[12px] font-bold text-white flex items-center gap-1.5 transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><CheckCircle2 className="h-3.5 w-3.5" /> Onayla ve Oluştur</>}
          </button>
        )}
      </div>

      {/* ── Capacity Exceeded Modal ── */}
      {capacityModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setCapacityModal(null)}>
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber-100">
                <AlertTriangle className="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <h3 className="text-[17px] font-bold text-slate-900">Kapasite Aşımı</h3>
                <p className="mt-2 text-[13px] text-slate-500 leading-relaxed">{capacityModal}</p>
              </div>
              <div className="w-full mt-1 rounded-xl bg-amber-50 border border-amber-200 p-3">
                <p className="text-[12px] text-amber-700 font-medium">💡 Paket ölçülerinizi (en, boy, yükseklik, ağırlık) küçülterek veya adet sayısını azaltarak tekrar deneyebilirsiniz.</p>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button type="button" onClick={() => { setCapacityModal(null); setStep(1); }} className="rounded-xl bg-amber-500 hover:bg-amber-600 px-5 py-2.5 text-[13px] font-bold text-white transition-colors flex items-center gap-2">
                <Ruler className="h-4 w-4" />
                Paket Ölçülerini Düzenle
              </button>
              <button type="button" onClick={() => setCapacityModal(null)} className="rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-5 py-2.5 text-[13px] font-bold text-slate-900 transition-colors">
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
