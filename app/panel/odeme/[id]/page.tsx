"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CreditCard,
  Loader2,
  Package,
  ArrowLeft,
  Shield,
  CheckCircle,
  Building2,
  Copy,
  AlertTriangle,
  Clock,
  Send,
} from "lucide-react";

interface ShipmentInfo {
  id: number;
  trackingCode: string;
  carrierName: string;
  carrierPriceTry: number;
  receiverCountry: string;
  shipmentType: string;
  hasInsurance: boolean;
  insuranceCost: number;
  totalPackageCount: number;
  chargeableWeight: number;
}

interface TransferStatus {
  exists: boolean;
  status: string;
  description: string;
  createdAt: string;
}

const BANK_INFO = {
  bankName: "Garanti BBVA",
  accountName: "MAYANCUR Teknoloji ve Danışmanlık Hizmetleri Sanayi Ticaret Limited Şirketi",
  iban: "TR39 0006 2000 0910 0006 2868 13",
};

export default function OdemePage() {
  const params = useParams();
  const router = useRouter();
  const shipmentId = params?.id as string;

  const [shipment, setShipment] = useState<ShipmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  // Havale state
  const [description, setDescription] = useState("");
  const [submittingTransfer, setSubmittingTransfer] = useState(false);
  const [transferStatus, setTransferStatus] = useState<TransferStatus | null>(null);
  const [transferSuccess, setTransferSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("zalusa.token");

        // Shipment bilgilerini çek
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/shipments/${shipmentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Gönderi bulunamadı");
        const data = await res.json();
        setShipment(data.shipment || data);

        // Havale durumunu çek
        const btRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/payment/bank-transfer/status/${shipmentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (btRes.ok) {
          const btData = await btRes.json();
          setTransferStatus(btData);
        }
      } catch {
        setError("Gönderi bilgileri yüklenemedi.");
      } finally {
        setLoading(false);
      }
    };

    if (shipmentId) fetchData();
  }, [shipmentId]);

  const handleIyzicoPayment = async () => {
    setPaying(true);
    setError("");

    try {
      const token = localStorage.getItem("zalusa.token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ shipmentId: Number(shipmentId) }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ödeme başlatılamadı.");
        setPaying(false);
        return;
      }

      if (data.paymentPageUrl) {
        window.location.href = data.paymentPageUrl;
      } else {
        setError("Ödeme sayfası URL'si alınamadı.");
        setPaying(false);
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      setPaying(false);
    }
  };

  const handleBankTransfer = async () => {
    setSubmittingTransfer(true);
    setError("");

    try {
      const token = localStorage.getItem("zalusa.token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/bank-transfer`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            shipmentId: Number(shipmentId),
            description: description.trim(),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Havale bildirimi gönderilemedi.");
        setSubmittingTransfer(false);
        return;
      }

      setTransferSuccess(true);
      setTransferStatus({ exists: true, status: "pending", description: description.trim(), createdAt: new Date().toISOString() });
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmittingTransfer(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text.replace(/\s+/g, ""));
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (error && !shipment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-danger-600 font-medium">{error}</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri Dön
        </button>
      </div>
    );
  }

  const totalPrice = shipment
    ? shipment.carrierPriceTry + (shipment.hasInsurance ? shipment.insuranceCost : 0)
    : 0;

  // Havale bildirimi zaten yapılmış mı?
  const hasExistingTransfer = transferStatus?.exists && transferStatus.status === "pending";

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Geri
        </button>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-brand-500" />
          Ödeme
        </h1>
        <p className="text-muted mt-1">
          Gönderiniz için ödeme işlemini tamamlayın.
        </p>
      </div>

      {/* Shipment Summary Card */}
      {shipment && (
        <div className="bg-surface border border-border rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-4">
            Gönderi Özeti
          </h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Takip Kodu</span>
              <span className="text-sm font-mono font-semibold text-foreground">
                {shipment.trackingCode}
              </span>
            </div>

            {shipment.carrierName && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Kargo Firması</span>
                <span className="text-sm font-medium text-foreground">
                  {shipment.carrierName}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Hedef Ülke</span>
              <span className="text-sm font-medium text-foreground">
                {shipment.receiverCountry}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Paket Sayısı</span>
              <span className="text-sm font-medium text-foreground">
                {shipment.totalPackageCount} paket
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Ücretlendirilebilir Ağırlık</span>
              <span className="text-sm font-medium text-foreground">
                {shipment.chargeableWeight} kg
              </span>
            </div>

            <div className="border-t border-border my-3" />

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted">Kargo Ücreti</span>
              <span className="text-sm font-semibold text-foreground">
                ₺{shipment.carrierPriceTry?.toFixed(2)}
              </span>
            </div>

            {shipment.hasInsurance && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  Sigorta
                </span>
                <span className="text-sm font-semibold text-foreground">
                  ₺{shipment.insuranceCost?.toFixed(2)}
                </span>
              </div>
            )}

            <div className="border-t border-border my-3" />

            <div className="flex justify-between items-center">
              <span className="text-base font-bold text-foreground">Toplam</span>
              <span className="text-xl font-bold text-brand-600">
                ₺{totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* HAVALE BİLDİRİMİ YAPILMIŞ — Onay bekleniyor */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {(hasExistingTransfer || transferSuccess) ? (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-4">
              <Clock className="w-7 h-7 text-amber-600" />
            </div>
            <h3 className="text-lg font-bold text-amber-800 mb-2">
              Havale Bildiriminiz Alındı
            </h3>
            <p className="text-sm text-amber-700 leading-relaxed">
              Havale/EFT bildiriminiz başarıyla kayıt altına alınmıştır.
              Ödemeniz onaylandığında gönderiniz otomatik olarak işleme alınacaktır.
            </p>
            {transferStatus?.description && (
              <div className="mt-4 bg-white/60 rounded-lg p-3">
                <p className="text-xs text-amber-600 font-medium mb-1">Açıklamanız:</p>
                <p className="text-sm text-amber-800">{transferStatus.description}</p>
              </div>
            )}
          </div>

          <button
            onClick={() => router.push("/panel/gonderilerim")}
            className="w-full px-6 py-3.5 rounded-xl font-semibold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Package className="w-4 h-4" />
            Gönderilerime Dön
          </button>
        </div>
      ) : (
        <>
          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* HAVALE/EFT ÖDEMESİ — Ana Seçenek */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-surface border-2 border-brand-200 rounded-xl p-6 mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Havale / EFT ile Ödeme</h3>
                <p className="text-xs text-muted">Aşağıdaki hesaba havale/EFT yapın</p>
              </div>
              <span className="ml-auto text-xs font-bold text-white bg-green-500 px-2.5 py-1 rounded-full">
                AKTİF
              </span>
            </div>

            {/* Banka Bilgileri */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3 mb-4">
              <div>
                <p className="text-xs text-muted font-medium mb-1">Banka</p>
                <p className="text-sm font-semibold text-foreground">{BANK_INFO.bankName}</p>
              </div>
              <div>
                <p className="text-xs text-muted font-medium mb-1">Hesap Sahibi</p>
                <p className="text-sm font-semibold text-foreground leading-snug">{BANK_INFO.accountName}</p>
              </div>
              <div>
                <p className="text-xs text-muted font-medium mb-1">IBAN</p>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-mono font-bold text-brand-600 tracking-wide">{BANK_INFO.iban}</p>
                  <button
                    onClick={() => copyToClipboard(BANK_INFO.iban, "iban")}
                    className="p-1.5 rounded-lg hover:bg-brand-100 transition-colors shrink-0"
                    title="IBAN'ı Kopyala"
                  >
                    <Copy className="w-4 h-4 text-brand-500" />
                  </button>
                </div>
                {copied === "iban" && <span className="text-xs text-green-600 font-medium">Kopyalandı!</span>}
              </div>
              <div>
                <p className="text-xs text-muted font-medium mb-1">Gönderilecek Tutar</p>
                <p className="text-lg font-bold text-brand-600">₺{totalPrice.toFixed(2)}</p>
              </div>
            </div>

            {/* Açıklama Alanı */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Havale Açıklaması
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={`Örn: ${shipment?.trackingCode || "ZLS-SHP-XXXX"} - İsim Soyisim`}
                className="w-full px-4 py-3 border border-border rounded-xl text-sm bg-surface text-foreground placeholder:text-muted resize-none focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-400 transition-all"
                rows={2}
              />
              <p className="text-xs text-muted mt-1.5">
                💡 Lütfen havale yaparken bankacılık uygulamanızda açıklama kısmına takip kodunuzu ve adınızı yazın.
              </p>
            </div>

            {/* Ödedim Butonu */}
            <button
              onClick={handleBankTransfer}
              disabled={submittingTransfer}
              className="
                group relative inline-flex items-center justify-center gap-2.5
                w-full px-8 py-4 rounded-xl font-semibold text-base
                text-white cursor-pointer
                bg-gradient-to-r from-green-600 via-green-500 to-emerald-500
                hover:from-green-700 hover:via-green-600 hover:to-emerald-600
                disabled:opacity-60 disabled:cursor-not-allowed
                shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30
                transition-all duration-300 ease-out
                active:scale-[0.98]
              "
            >
              {submittingTransfer ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Gönderiliyor...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>Ödedim — Bildirim Gönder</span>
                </>
              )}
            </button>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* İYZİCO — Pasif */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="bg-surface border border-border rounded-xl p-6 mb-6 opacity-75">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-gray-400" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Kredi / Banka Kartı ile Ödeme</h3>
                <p className="text-xs text-muted">iyzico güvenli ödeme altyapısı</p>
              </div>
              <span className="ml-auto text-xs font-bold text-white bg-gray-400 px-2.5 py-1 rounded-full">
                PASİF
              </span>
            </div>

            <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 leading-relaxed">
                <strong>iyzico ödeme şu an pasif durumdadır.</strong> Havale/EFT ile ödeme yapmanız gerekmektedir. 
                Kredi kartı ile ödeme seçeneği en kısa sürede aktif hale getirilecektir.
              </p>
            </div>

            <button
              onClick={handleIyzicoPayment}
              disabled={true}
              className="
                mt-4 inline-flex items-center justify-center gap-2.5
                w-full px-8 py-4 rounded-xl font-semibold text-base
                text-white cursor-not-allowed
                bg-gray-300
                opacity-50
              "
            >
              <CreditCard className="w-5 h-5" />
              <span>Kredi Kartı ile Öde — ₺{totalPrice.toFixed(2)}</span>
            </button>
          </div>

          {/* Security Note */}
          <div className="flex items-start gap-3 bg-brand-50 border border-brand-100 rounded-xl p-4 mb-6">
            <CheckCircle className="w-5 h-5 text-brand-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-brand-800">Güvenli Ödeme</p>
              <p className="text-xs text-brand-600 mt-0.5">
                Havale bildiriminiz admin tarafından kontrol edildikten sonra gönderiniz otomatik olarak işleme alınacaktır.
              </p>
            </div>
          </div>
        </>
      )}

      {error && (
        <p className="mt-4 text-sm text-danger-600 text-center font-medium">
          {error}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <Package className="w-4 h-4 text-muted-2" />
        <p className="text-xs text-muted-2">
          Ödeme onayı sonrası gönderiniz otomatik olarak işleme alınacaktır.
        </p>
      </div>
    </div>
  );
}
