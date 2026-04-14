"use client";

import { CheckCircle, Package, ArrowLeft, Truck, Globe, Copy, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";

interface ShipmentInfo {
  trackingCode: string;
  ptsAwb: string;
  domesticBarcode: string;
  domesticCarrier: string;
  carrierName: string;
  status: string;
  requiresDomestic: boolean;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const shipmentId = searchParams.get("shipmentId");
  const [shipment, setShipment] = useState<ShipmentInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    if (!shipmentId) {
      setLoading(false);
      return;
    }

    const fetchShipment = async () => {
      try {
        const token = localStorage.getItem("zalusa.token") || "";
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/shipments/${shipmentId}/post-payment`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setShipment(data);
        }
      } catch (err) {
        console.error("Shipment bilgileri alınamadı:", err);
      } finally {
        setLoading(false);
      }
    };

    // API çağrıları async olduğu için birkaç saniye bekle ve tekrar dene
    const timer = setTimeout(fetchShipment, 2000);
    const retryTimer = setTimeout(fetchShipment, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(retryTimer);
    };
  }, [shipmentId]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-blue-50 p-4">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-200/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-lg w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-green-100/50 border border-green-100 p-8 sm:p-10 text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center mb-5 shadow-lg shadow-green-300/40">
            <CheckCircle className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Ödeme Başarılı!
          </h1>
          <p className="text-gray-500 mb-6 leading-relaxed text-sm">
            Ödemeniz başarıyla tamamlandı. Kargo bilgileriniz aşağıda yer almaktadır.
          </p>

          {/* Shipment Info */}
          {loading ? (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
              <p className="text-sm text-gray-400">Kargo bilgileri hazırlanıyor...</p>
            </div>
          ) : shipment ? (
            <div className="text-left space-y-3 mb-6">
              {/* Zalusa Tracking */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">Zalusa Takip No</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 text-lg">{shipment.trackingCode}</span>
                  <button
                    onClick={() => copyToClipboard(shipment.trackingCode, "zalusa")}
                    className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Kopyala"
                  >
                    <Copy className="w-4 h-4 text-blue-500" />
                  </button>
                </div>
                {copied === "zalusa" && <span className="text-xs text-green-600">Kopyalandı!</span>}
              </div>

              {/* International Tracking (PTS AWB) */}
              {shipment.ptsAwb && (
                <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">Uluslararası Takip No</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-lg">{shipment.ptsAwb}</span>
                    <button
                      onClick={() => copyToClipboard(shipment.ptsAwb, "awb")}
                      className="p-1.5 rounded-lg hover:bg-purple-100 transition-colors"
                      title="Kopyala"
                    >
                      <Copy className="w-4 h-4 text-purple-500" />
                    </button>
                  </div>
                  {copied === "awb" && <span className="text-xs text-green-600">Kopyalandı!</span>}
                </div>
              )}

              {/* Domestic Transfer Info */}
              {shipment.requiresDomestic && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-medium text-amber-600 uppercase tracking-wide">Yurtiçi Teslimat</span>
                  </div>
                  {shipment.domesticBarcode ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{shipment.domesticBarcode}</span>
                        <button
                          onClick={() => copyToClipboard(shipment.domesticBarcode, "domestic")}
                          className="p-1.5 rounded-lg hover:bg-amber-100 transition-colors"
                          title="Kopyala"
                        >
                          <Copy className="w-4 h-4 text-amber-500" />
                        </button>
                      </div>
                      {copied === "domestic" && <span className="text-xs text-green-600">Kopyalandı!</span>}
                      <p className="text-xs text-gray-500 mt-2">
                        📦 Kurye paketinizi adresinizden alacaktır. Paketinizi hazır bulundurun.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-amber-700">
                      Yurtiçi transfer hazırlanıyor...
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-6">
              Gönderiniz en kısa sürede işleme alınacaktır.
            </p>
          )}

          {/* Divider */}
          <div className="w-16 h-0.5 bg-gradient-to-r from-green-300 to-emerald-300 mx-auto mb-6 rounded-full" />

          {/* Actions */}
          <div className="space-y-3">
            <Link
              href="/panel/gonderilerim"
              className="
                inline-flex items-center justify-center gap-2 w-full
                px-6 py-3.5 rounded-xl font-semibold text-sm
                text-white
                bg-gradient-to-r from-green-500 to-emerald-500
                hover:from-green-600 hover:to-emerald-600
                shadow-md shadow-green-200/50 hover:shadow-lg
                transition-all duration-300
              "
            >
              <Package className="w-4 h-4" />
              Gönderilerimi Görüntüle
            </Link>

            <Link
              href="/panel"
              className="
                inline-flex items-center justify-center gap-2 w-full
                px-6 py-3.5 rounded-xl font-semibold text-sm
                text-gray-600 bg-gray-50 hover:bg-gray-100
                border border-gray-200
                transition-all duration-300
              "
            >
              <ArrowLeft className="w-4 h-4" />
              Panele Dön
            </Link>
          </div>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-gray-400 mt-6">
          İşleminiz güvenli ödeme altyapısı ile gerçekleştirilmiştir.
        </p>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
