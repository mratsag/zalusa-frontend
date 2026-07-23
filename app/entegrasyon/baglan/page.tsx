"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plug, ShieldCheck, Loader2, AlertTriangle, Store, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_URL;

function ConnectInner() {
  const router = useRouter();
  const sp = useSearchParams();

  const clientId = sp.get("client_id") || "";
  const state = sp.get("state") || "";
  const redirectUri = sp.get("redirect_uri") || "";
  const shop = sp.get("shop") || "";

  const [clientName, setClientName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("zalusa.token") : "";
    // Giriş yoksa → login, sonra bu sayfaya güvenli dönüş
    if (!token) {
      const back = `/entegrasyon/baglan?${sp.toString()}`;
      router.replace(`/giris?next=${encodeURIComponent(back)}`);
      return;
    }
    if (!clientId || !redirectUri) {
      setError("Geçersiz bağlantı isteği: client_id veya redirect_uri eksik.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const [infoRes, meRes] = await Promise.all([
          fetch(`${API}/api/integration/connect/info?clientId=${encodeURIComponent(clientId)}`),
          fetch(`${API}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        // Token geçersizse tekrar giriş
        if (meRes.status === 401) {
          const back = `/entegrasyon/baglan?${sp.toString()}`;
          router.replace(`/giris?next=${encodeURIComponent(back)}`);
          return;
        }
        if (!infoRes.ok) {
          setError("Bilinmeyen entegrasyon istemcisi. Bağlantı bağlantısı hatalı olabilir.");
          setLoading(false);
          return;
        }
        const info = await infoRes.json();
        setClientName(info.name || "Entegrasyon");
        if (meRes.ok) {
          const me = await meRes.json();
          setEmail(me?.email || me?.user?.email || "");
        }
      } catch {
        setError("Bağlantı bilgileri alınamadı. Lütfen tekrar deneyin.");
      } finally {
        setLoading(false);
      }
    })();
  }, [clientId, redirectUri, sp, router]);

  const approve = useCallback(async () => {
    setApproving(true);
    setError("");
    try {
      const token = localStorage.getItem("zalusa.token");
      const res = await fetch(`${API}/api/integration/connect/authorize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ clientId, redirectUri, shop, state }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Onay başarısız oldu.");
        setApproving(false);
        return;
      }
      // Tek-kullanımlık code ile eklentiye geri dön
      window.location.href = data.redirectUrl;
    } catch {
      setError("Onay sırasında bir hata oluştu.");
      setApproving(false);
    }
  }, [clientId, redirectUri, shop, state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-[28px] border border-border/60 bg-card p-8 shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
            <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
            <span className="text-sm">Bağlantı hazırlanıyor…</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Bağlantı kurulamadı</h1>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : (
          <>
            {/* Bağlantı görseli: eklenti ↔ Zalusa */}
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                <Store className="h-7 w-7" />
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
                <Plug className="h-7 w-7" />
              </div>
            </div>

            <h1 className="text-center text-xl font-semibold text-foreground">
              {clientName} bağlanıyor
            </h1>
            <p className="mt-2 text-center text-sm text-muted-foreground">
              {shop ? <><span className="font-medium text-foreground">{shop}</span> mağazanı </> : "Mağazanı "}
              Zalusa hesabına bağlamak üzeresin.
            </p>

            <div className="mt-6 space-y-3 rounded-2xl bg-muted/40 p-4 text-sm">
              <div className="flex items-start gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                <span className="text-muted-foreground">
                  Bu eklenti hesabına <span className="font-medium text-foreground">sipariş gönderme</span> ve{" "}
                  <span className="font-medium text-foreground">gönderi durumu okuma</span> izni alacak. Ödeme
                  bilgilerine erişemez.
                </span>
              </div>
              {email && (
                <div className="flex items-center gap-3 border-t border-border/50 pt-3">
                  <span className="text-muted-foreground">Zalusa hesabı:</span>
                  <span className="font-medium text-foreground">{email}</span>
                </div>
              )}
            </div>

            <Button onClick={approve} disabled={approving} className="mt-6 w-full" size="lg">
              {approving ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Bağlanıyor…</>
              ) : (
                <>Bağla ve devam et</>
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              Onayladığında {clientName} mağazana geri döner ve bağlantı tamamlanır.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function EntegrasyonBaglanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-7 w-7 animate-spin text-brand-600" />
        </div>
      }
    >
      <ConnectInner />
    </Suspense>
  );
}
