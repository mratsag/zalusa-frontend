"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PayTRTestContent() {
  const searchParams = useSearchParams();
  const result = searchParams.get("result");

  const [email, setEmail] = useState("test@zalusa.com");
  const [name, setName] = useState("Test Kullanıcı");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    token: string;
    paymentPageUrl: string;
    amountTRY: number;
    amountUSD: number;
    usdTryRate: number;
    merchantOid: string;
  } | null>(null);
  const [showIframe, setShowIframe] = useState(false);
  const [step, setStep] = useState<"form" | "confirm" | "paying" | "result">(
    result ? "result" : "form"
  );

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/payment/test-paytr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.reason || data.error || "Bilinmeyen hata");
        return;
      }
      setPaymentData(data);
      setStep("confirm");
    } catch (e) {
      setError("Bağlantı hatası — backend çalışıyor mu?");
    } finally {
      setLoading(false);
    }
  };

  const handlePay = () => {
    setStep("paying");
    setShowIframe(true);
  };

  useEffect(() => {
    if (result) setStep("result");
  }, [result]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
        padding: "24px",
      }}
    >
      {/* PayTR iFrame Modal */}
      {showIframe && paymentData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              background: "#1a1a2e",
              borderRadius: "20px",
              padding: "0",
              width: "min(500px, 95vw)",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "rgba(255,255,255,0.04)",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span style={{ color: "#a78bfa", fontWeight: 700, fontSize: "14px", letterSpacing: "0.5px" }}>
                🔒 PayTR Güvenli Ödeme
              </span>
              <button
                onClick={() => { setShowIframe(false); setStep("confirm"); }}
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: "8px",
                  color: "#9ca3af",
                  cursor: "pointer",
                  padding: "4px 10px",
                  fontSize: "18px",
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
            <iframe
              src={`https://www.paytr.com/odeme/guvenli/${paymentData.token}`}
              style={{
                width: "100%",
                height: "560px",
                border: "none",
                display: "block",
              }}
              allow="payment"
            />
          </div>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "480px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              background: "rgba(167,139,250,0.1)",
              border: "1px solid rgba(167,139,250,0.2)",
              borderRadius: "100px",
              padding: "6px 16px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "12px", color: "#a78bfa", fontWeight: 600, letterSpacing: "1px" }}>
              🧪 CANLI ORTAM TEST
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#f3f4f6", lineHeight: 1.2 }}>
            PayTR Entegrasyon Testi
          </h1>
          <p style={{ margin: "8px 0 0", color: "#6b7280", fontSize: "14px" }}>
            Gerçek canlı ortamda $1 USD test ödemesi
          </p>
        </div>

        {/* Card */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "28px",
            backdropFilter: "blur(16px)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}
        >
          {/* STEP: FORM */}
          {step === "form" && (
            <>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", color: "#d1d5db", fontSize: "13px", fontWeight: 600, marginBottom: "8px", letterSpacing: "0.3px" }}>
                  E-posta
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    color: "#f3f4f6",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(167,139,250,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", color: "#d1d5db", fontSize: "13px", fontWeight: 600, marginBottom: "8px", letterSpacing: "0.3px" }}>
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    color: "#f3f4f6",
                    fontSize: "14px",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "rgba(167,139,250,0.5)")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                />
              </div>

              {/* Amount Preview */}
              <div
                style={{
                  background: "rgba(167,139,250,0.08)",
                  border: "1px solid rgba(167,139,250,0.15)",
                  borderRadius: "12px",
                  padding: "16px",
                  marginBottom: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "2px" }}>Test Tutarı</div>
                  <div style={{ color: "#f3f4f6", fontSize: "22px", fontWeight: 800 }}>$1.00 USD</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: "#9ca3af", fontSize: "12px", marginBottom: "2px" }}>Güncel kur ile TL</div>
                  <div style={{ color: "#a78bfa", fontSize: "14px", fontWeight: 600 }}>≈ Canlı kurdan hesaplanır</div>
                </div>
              </div>

              {error && (
                <div
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: "10px",
                    padding: "12px 14px",
                    color: "#fca5a5",
                    fontSize: "13px",
                    marginBottom: "16px",
                  }}
                >
                  ❌ {error}
                </div>
              )}

              <button
                onClick={handleStart}
                disabled={loading || !email}
                style={{
                  width: "100%",
                  background: loading
                    ? "rgba(167,139,250,0.3)"
                    : "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  letterSpacing: "0.3px",
                }}
              >
                {loading ? "⏳ Token alınıyor..." : "🚀 Ödeme Başlat"}
              </button>
            </>
          )}

          {/* STEP: CONFIRM */}
          {step === "confirm" && paymentData && (
            <>
              <div style={{ textAlign: "center", marginBottom: "24px" }}>
                <div style={{ fontSize: "48px", marginBottom: "8px" }}>✅</div>
                <h2 style={{ margin: 0, color: "#f3f4f6", fontSize: "20px", fontWeight: 700 }}>
                  Token Alındı!
                </h2>
                <p style={{ margin: "6px 0 0", color: "#9ca3af", fontSize: "14px" }}>
                  PayTR ile bağlantı başarılı
                </p>
              </div>

              {/* Tutar Kutusu */}
              <div
                style={{
                  background: "rgba(16,185,129,0.08)",
                  border: "1px solid rgba(16,185,129,0.2)",
                  borderRadius: "16px",
                  padding: "20px",
                  marginBottom: "16px",
                  textAlign: "center",
                }}
              >
                <div style={{ color: "#6ee7b7", fontSize: "12px", fontWeight: 600, marginBottom: "4px", letterSpacing: "1px" }}>
                  ÖDENECEK TUTAR
                </div>
                <div style={{ color: "#f3f4f6", fontSize: "36px", fontWeight: 900, lineHeight: 1 }}>
                  {paymentData.amountTRY.toFixed(2)}
                  <span style={{ fontSize: "18px", color: "#9ca3af", marginLeft: "6px" }}>₺</span>
                </div>
                <div style={{ color: "#9ca3af", fontSize: "13px", marginTop: "8px" }}>
                  $1.00 × {paymentData.usdTryRate.toFixed(2)} USD/TRY kuru
                </div>
              </div>

              {/* OID */}
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: "10px",
                  padding: "10px 14px",
                  marginBottom: "20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#6b7280", fontSize: "12px" }}>Merchant OID</span>
                <span style={{ color: "#e5e7eb", fontSize: "12px", fontFamily: "monospace" }}>
                  {paymentData.merchantOid}
                </span>
              </div>

              <button
                onClick={handlePay}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #059669, #10b981)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginBottom: "10px",
                  transition: "all 0.2s",
                }}
              >
                💳 PayTR Ödeme Formunu Aç
              </button>

              <button
                onClick={() => { setStep("form"); setPaymentData(null); setError(null); }}
                style={{
                  width: "100%",
                  background: "transparent",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "12px",
                  color: "#9ca3af",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                ← Geri Dön
              </button>

              {/* Direct Link */}
              <div style={{ textAlign: "center", marginTop: "14px" }}>
                <a
                  href={paymentData.paymentPageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#a78bfa", fontSize: "12px", textDecoration: "none" }}
                >
                  Yeni sekmede aç →
                </a>
              </div>
            </>
          )}

          {/* STEP: RESULT */}
          {step === "result" && (
            <>
              {result === "success" ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "64px", marginBottom: "12px" }}>🎉</div>
                  <h2 style={{ margin: 0, color: "#6ee7b7", fontSize: "22px", fontWeight: 800 }}>
                    Ödeme Başarılı!
                  </h2>
                  <p style={{ margin: "8px 0 0", color: "#9ca3af", fontSize: "14px" }}>
                    PayTR canlı ortam entegrasyonu çalışıyor ✓
                  </p>
                  <div
                    style={{
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.2)",
                      borderRadius: "12px",
                      padding: "16px",
                      marginTop: "20px",
                      marginBottom: "20px",
                      color: "#6ee7b7",
                      fontSize: "13px",
                      lineHeight: 1.8,
                    }}
                  >
                    ✅ Token alımı — OK<br />
                    ✅ PayTR iframe — OK<br />
                    ✅ Ödeme tamamlandı — OK<br />
                    ✅ Canlıya geçiş hazır
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "64px", marginBottom: "12px" }}>❌</div>
                  <h2 style={{ margin: 0, color: "#fca5a5", fontSize: "22px", fontWeight: 800 }}>
                    Ödeme Başarısız
                  </h2>
                  <p style={{ margin: "8px 0 0", color: "#9ca3af", fontSize: "14px" }}>
                    Kart bilgileri hatalı veya işlem iptal edildi
                  </p>
                </div>
              )}

              <button
                onClick={() => { setStep("form"); setPaymentData(null); setError(null); window.history.replaceState({}, "", "/panel/paytr-test"); }}
                style={{
                  width: "100%",
                  background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: 700,
                  cursor: "pointer",
                  marginTop: "20px",
                }}
              >
                🔄 Tekrar Test Et
              </button>
            </>
          )}
        </div>

        {/* Info Footer */}
        <div
          style={{
            marginTop: "16px",
            background: "rgba(251,191,36,0.06)",
            border: "1px solid rgba(251,191,36,0.12)",
            borderRadius: "12px",
            padding: "12px 16px",
            color: "#fcd34d",
            fontSize: "12px",
            lineHeight: 1.7,
          }}
        >
          <strong>⚠️ Dikkat:</strong> Bu sayfa gerçek canlı PayTR ortamına istek atar.
          Gerçek kart bilgileri kullanmayın — test kart numaralarını kullanın.
          <br />
          Callback: <code style={{ background: "rgba(255,255,255,0.06)", padding: "1px 5px", borderRadius: "4px" }}>/api/paytr/callback</code>
        </div>
      </div>
    </div>
  );
}

export default function PayTRTestPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0f0f1a", color: "#9ca3af" }}>
        Yükleniyor...
      </div>
    }>
      <PayTRTestContent />
    </Suspense>
  );
}
