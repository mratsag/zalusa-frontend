"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

// Yorum/geri bildirim formu → POST /api/contact (eski statik HTML'deki formun React karşılığı).
const API = process.env.NEXT_PUBLIC_API_URL;

const INPUT =
  "w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none focus:border-transparent focus:ring-2 focus:ring-[#4D4DF2]";

export function FeedbackForm() {
  const t = useTranslations("reviews");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSending(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") || ""),
          surname: "",
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          trackingCode: "",
          category: "Geri bildirim: yorum",
          message: String(fd.get("message") || ""),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json?.success) throw new Error();
      setDone(true);
    } catch {
      setError(t("fbError"));
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <h3 className="text-lg font-semibold text-slate-900">{t("fbThanks")}</h3>
        <p className="mt-1 text-sm text-slate-500">{t("fbReceived")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-slate-200/80 bg-white p-6 md:p-7">
      <h3 className="text-[17px] font-semibold text-slate-900">{t("fbTitle")}</h3>
      <p className="mt-1 text-sm text-slate-500">{t("fbSubtitle")}</p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input name="name" required placeholder={t("fbName")} className={INPUT} />
        <input name="email" type="email" required placeholder={t("fbEmail")} className={INPUT} />
        <input name="phone" placeholder={t("fbPhone")} className={INPUT} />
      </div>
      <textarea name="message" required rows={4} placeholder={t("fbMessage")} className={`${INPUT} mt-3 resize-y`} />

      {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-gradient-to-br from-[#4D4DF2] to-[#0000BE] px-6 text-sm font-semibold text-white transition-all hover:from-[#5959FF] hover:to-[#00009c] disabled:opacity-60 cursor-pointer"
      >
        {sending ? t("fbSending") : t("fbSubmit")}
      </button>
    </form>
  );
}
