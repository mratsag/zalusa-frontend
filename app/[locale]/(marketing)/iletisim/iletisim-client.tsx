"use client";

import { useEffect, useRef } from "react";

import { HTML } from "./content";

const API = process.env.NEXT_PUBLIC_API_URL;

// iletisim.php portu: ham HTML + JS davranışları React'e alındı:
// - topic-chip tek-seçim, FAQ tek-açılır <details>, in-page smooth-scroll
// - #contact-form native POST yerine /api/contact'a AJAX (success/error UI)
export function IletisimContent() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cleanups: (() => void)[] = [];

    // Topic chip toggle (single-select)
    const chips = Array.from(root.querySelectorAll<HTMLElement>("#topic-chips .topic-chip"));
    const topicInput = root.querySelector<HTMLInputElement>("#topic-input");
    chips.forEach((c) => {
      const h = () => {
        chips.forEach((x) => {
          x.classList.remove("bg-slate-900", "text-white", "border-slate-900", "zal-shadow-cta");
          x.classList.add("bg-white", "text-slate-700", "border-slate-200");
          x.setAttribute("aria-pressed", "false");
        });
        c.classList.remove("bg-white", "text-slate-700", "border-slate-200");
        c.classList.add("bg-slate-900", "text-white", "border-slate-900", "zal-shadow-cta");
        c.setAttribute("aria-pressed", "true");
        if (topicInput) topicInput.value = c.getAttribute("data-value") || "";
      };
      c.addEventListener("click", h);
      cleanups.push(() => c.removeEventListener("click", h));
    });

    // FAQ: tek açılır
    const items = Array.from(root.querySelectorAll<HTMLDetailsElement>(".zal-faq-item"));
    items.forEach((d) => {
      const h = () => {
        if (d.open) items.forEach((o) => { if (o !== d) o.open = false; });
      };
      d.addEventListener("toggle", h);
      cleanups.push(() => d.removeEventListener("toggle", h));
    });

    // In-page smooth-scroll
    Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')).forEach((a) => {
      const h = (e: Event) => {
        const id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        const t = root.querySelector(id) || document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      a.addEventListener("click", h);
      cleanups.push(() => a.removeEventListener("click", h));
    });

    // Contact form → /api/contact
    const form = root.querySelector<HTMLFormElement>("#contact-form");
    if (form) {
      const submitBtn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const defaultLabel = submitBtn?.innerHTML || "";
      const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const fd = new FormData(form);
        const payload = {
          name: String(fd.get("name") || ""),
          surname: String(fd.get("surname") || ""),
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          trackingCode: String(fd.get("tracking_code") || ""),
          category: String(fd.get("category") || ""),
          message: String(fd.get("message") || ""),
        };
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Gönderiliyor…";
        }
        try {
          const res = await fetch(`${API}/api/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const json = await res.json().catch(() => ({}));
          if (res.ok && json?.success) {
            form.innerHTML =
              '<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">' +
              '<div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">' +
              '<svg class="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg></div>' +
              '<h3 class="text-lg font-semibold text-slate-900">Mesajınız alındı!</h3>' +
              '<p class="mt-1 text-sm text-slate-500">En kısa sürede sizinle iletişime geçeceğiz.</p></div>';
          } else {
            throw new Error(json?.error || "Hata");
          }
        } catch {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = defaultLabel;
          }
          let err = form.querySelector<HTMLElement>("[data-contact-error]");
          if (!err) {
            err = document.createElement("div");
            err.setAttribute("data-contact-error", "");
            err.className = "mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700";
            form.prepend(err);
          }
          err.textContent = "Mesaj gönderilemedi. Lütfen tekrar deneyin.";
        }
      };
      form.addEventListener("submit", onSubmit);
      cleanups.push(() => form.removeEventListener("submit", onSubmit));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: HTML }} />;
}
