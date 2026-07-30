"use client";

import { useTranslations } from "next-intl";

import { createContext, useCallback, useContext, useState } from "react";

// PHP includes/header.php'deki zalusa-offer-modal portu — shared.
// window.openTeklifModal / openKurumsalModal yerine React context.
// Form POST → {NEXT_PUBLIC_API_URL}/api/contact (PHP /iletisim'i yansıtır),
// contact_messages tablosuna yazar, {success:true|false, error?} döner.

const API = process.env.NEXT_PUBLIC_API_URL;

type Mode = "quick" | "kurumsal";
type Ctx = { openTeklif: () => void; openKurumsal: () => void };

const OfferModalContext = createContext<Ctx | null>(null);

export function useOfferModal(): Ctx {
  const ctx = useContext(OfferModalContext);
  if (!ctx) throw new Error("useOfferModal must be used within OfferModalProvider");
  return ctx;
}

const FIELD = "w-full bg-slate-50 border border-gray-200 rounded-xl py-3 px-4 text-slate-900 text-sm focus:ring-2 focus:ring-[#0000BE] focus:border-transparent outline-none transition";
const LABEL = "block text-xs font-bold text-slate-700 mb-1.5";
const SUBMIT = "w-full inline-flex items-center justify-center gap-2 px-6 h-11 bg-gradient-to-br from-[#4D4DF2] to-[#0000BE] hover:from-[#5959FF] hover:to-[#00009c] hover:-translate-y-0.5 text-white text-sm font-semibold rounded-lg shadow-sm cursor-pointer transition-all disabled:opacity-70";

export function OfferModalProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("offerModal");
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("quick");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const openTeklif = useCallback(() => {
    setMode("quick");
    setDone(false);
    setError("");
    setOpen(true);
  }, []);
  const openKurumsal = useCallback(() => {
    setMode("kurumsal");
    setDone(false);
    setError("");
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSending(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: String(fd.get("name") || ""),
      surname: String(fd.get("surname") || ""),
      email: String(fd.get("email") || ""),
      phone: String(fd.get("phone") || ""),
      trackingCode: String(fd.get("tracking_code") || ""),
      category: String(fd.get("category") || (mode === "kurumsal" ? "Kurumsal Talep" : "Teklif Talebi")),
      message: String(fd.get("message") || ""),
    };
    try {
      const res = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.success) {
        setDone(true);
      } else {
        setError(json?.error || "Bir hata oluştu. Lütfen tekrar deneyin.");
      }
    } catch {
      setError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setSending(false);
    }
  };

  return (
    <OfferModalContext.Provider value={{ openTeklif, openKurumsal }}>
      {children}

      {/* Modal */}
      <div
        className={`fixed inset-0 z-[999] flex items-end md:items-center justify-center ${open ? "" : "pointer-events-none"}`}
        aria-hidden={!open}
      >
        {/* Backdrop */}
        <div
          onClick={close}
          className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`}
        />
        {/* Panel */}
        <div
          className={`relative z-10 w-full bg-white md:rounded-2xl rounded-t-2xl shadow-2xl transition-all duration-300 ease-out max-h-[92vh] overflow-y-auto ${
            mode === "kurumsal" ? "md:max-w-2xl" : "md:max-w-lg"
          } ${open ? "translate-y-0 md:scale-100 md:opacity-100" : "translate-y-full md:scale-95 md:opacity-0"}`}
        >
          <div className="md:hidden flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>

          {done ? (
            <div className="px-6 pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-[#0000BE]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#0000BE]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Talebiniz Alındı!</h3>
              <p className="text-sm text-slate-500">
                {mode === "kurumsal"
                  ? "Kurumsal çözüm ekibimiz en kısa sürede sizinle iletişime geçecek."
                  : "En kısa sürede sizinle iletişime geçeceğiz."}
              </p>
              <button
                type="button"
                onClick={close}
                className="mt-6 inline-flex items-center justify-center px-6 h-10 bg-gradient-to-br from-[#4D4DF2] to-[#0000BE] hover:from-[#5959FF] hover:to-[#00009c] hover:-translate-y-0.5 text-white text-sm font-semibold rounded-lg shadow-sm cursor-pointer transition-all"
              >
                Kapat
              </button>
            </div>
          ) : mode === "quick" ? (
            <div>
              <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{t("title")}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{t("subtitle")}</p>
                </div>
                <CloseBtn onClick={close} />
              </div>
              <div className="px-6 pt-5 pb-6">
                {error && <ErrorBox msg={error} />}
                <form className="space-y-4" noValidate onSubmit={submit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label={t("name")} required name="name" placeholder={t("name")} />
                    <Field label={t("surname")} name="surname" placeholder={t("surname")} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Telefon" required name="phone" type="tel" placeholder="0500 000 00 00" />
                    <Field label="E-Posta" required name="email" type="email" placeholder="ornek@sirket.com" />
                  </div>
                  <div>
                    <label className={LABEL}>
                      {t("company")} <span className="text-slate-400 font-normal">{t("optional")}</span>
                    </label>
                    <input type="text" name="tracking_code" placeholder="Şirket adınız" className={FIELD} />
                  </div>
                  <div>
                    <label className={LABEL}>
                      {t("message")} <span className="text-red-500">*</span>
                    </label>
                    <textarea name="message" rows={3} required placeholder="Teklif talebinizi veya sorularınızı yazın…" className={`${FIELD} resize-none`} />
                  </div>
                  <input type="hidden" name="category" value="Teklif Talebi" />
                  <button type="submit" disabled={sending} className={SUBMIT}>
                    <SubmitIcon />
                    <span>{sending ? t("sending") : t("submit")}</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between px-6 pt-4 pb-3 border-b border-gray-100">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 bg-[#0000BE]/10 text-[#0000BE] text-xs font-semibold rounded">KURUMSAL</span>
                  </div>
                  <h2 className="text-lg font-semibold text-slate-900">Kurumsal Çözüm Talebi</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Uzman ekibimiz size özel fiyatlandırma ve çözüm sunsun.</p>
                </div>
                <CloseBtn onClick={close} />
              </div>
              <div className="px-6 pt-5 pb-6">
                {error && <ErrorBox msg={error} />}
                <form className="space-y-4" noValidate onSubmit={submit}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Ad Soyad" required name="name" placeholder="Ad Soyad" />
                    <Field label={t("company")} required name="tracking_code" placeholder={t("company")} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Telefon" required name="phone" type="tel" placeholder="0500 000 00 00" />
                    <Field label="E-Posta" required name="email" type="email" placeholder="ornek@sirket.com" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL}>Aylık Gönderi Hacmi</label>
                      <select name="surname" className={`${FIELD} appearance-none`}>
                        <option value="">Seçiniz</option>
                        <option value="1-50 adet/ay">1 – 50 adet/ay</option>
                        <option value="51-200 adet/ay">51 – 200 adet/ay</option>
                        <option value="201-500 adet/ay">201 – 500 adet/ay</option>
                        <option value="501-2000 adet/ay">501 – 2.000 adet/ay</option>
                        <option value="2000+ adet/ay">2.000+ adet/ay</option>
                      </select>
                    </div>
                    <Field label="Hedef Ülkeler / Pazarlar" name="category" placeholder="ABD, Almanya, İngiltere…" />
                  </div>
                  <div>
                    <label className={LABEL}>
                      Bize İletmek İstedikleriniz <span className="text-red-500">*</span>
                    </label>
                    <textarea name="message" rows={3} required placeholder="Mevcut kargo süreciniz, beklentileriniz veya sorularınız…" className={`${FIELD} resize-none`} />
                  </div>
                  <button type="submit" disabled={sending} className={SUBMIT}>
                    <SubmitIcon />
                    <span>{sending ? t("sending") : t("submitCorporate")}</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </OfferModalContext.Provider>
  );
}

function Field({ label, required, name, type = "text", placeholder }: { label: string; required?: boolean; name: string; type?: string; placeholder?: string }) {
  return (
    <div>
      <label className={LABEL}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} name={name} required={required} placeholder={placeholder} className={FIELD} />
    </div>
  );
}

function CloseBtn({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-slate-600 transition" aria-label="Kapat">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  );
}

function ErrorBox({ msg }: { msg: string }) {
  return <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm font-medium">{msg}</div>;
}

function SubmitIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  );
}
