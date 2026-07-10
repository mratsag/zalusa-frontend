"use client";

import { useEffect } from "react";

// yorumlar.php JS'i React'e alındı. HTML string import ETMEZ (1.3MB server-side kalır);
// yalnızca render sonrası DOM'a handler bağlar: filtre (all/general/country) + geri bildirim formu → /api/contact.
const API = process.env.NEXT_PUBLIC_API_URL;

export function YorumlarInteractive() {
  useEffect(() => {
    const cleanups: (() => void)[] = [];

    // --- Filtre ---
    const wrap = document.getElementById("yorum-filtre");
    if (wrap) {
      const buttons = Array.from(wrap.querySelectorAll<HTMLElement>(".js-review-filter"));
      const cards = Array.from(document.querySelectorAll<HTMLElement>(".js-review-card"));
      const activeCls = ["bg-white", "text-[#0000BE]", "shadow-sm", "ring-1", "ring-slate-200/80"];
      const idleCls = ["bg-transparent", "text-slate-600", "hover:bg-white/70", "hover:text-slate-900"];
      const setActive = (filter: string) => {
        buttons.forEach((btn) => {
          const on = btn.getAttribute("data-filter") === filter;
          btn.setAttribute("aria-pressed", on ? "true" : "false");
          (on ? idleCls : activeCls).forEach((c) => btn.classList.remove(c));
          (on ? activeCls : idleCls).forEach((c) => btn.classList.add(c));
        });
        cards.forEach((card) => {
          const t = card.getAttribute("data-source-type") || "general";
          card.style.display = filter === "all" || t === filter ? "" : "none";
        });
      };
      buttons.forEach((btn) => {
        const h = () => setActive(btn.getAttribute("data-filter") || "all");
        btn.addEventListener("click", h);
        cleanups.push(() => btn.removeEventListener("click", h));
      });
    }

    // --- Geri bildirim formu → /api/contact ---
    const form = document.querySelector<HTMLInputElement>('input[name="zalusa_feedback"]')?.closest("form") as HTMLFormElement | null;
    if (form) {
      const btn = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      const label = btn?.innerHTML || "";
      const onSubmit = async (e: SubmitEvent) => {
        e.preventDefault();
        const fd = new FormData(form);
        const kind = String(fd.get("feedback_kind") || "yorum");
        const payload = {
          name: String(fd.get("name") || ""),
          surname: "",
          email: String(fd.get("email") || ""),
          phone: String(fd.get("phone") || ""),
          trackingCode: "",
          category: "Geri bildirim: " + kind,
          message: String(fd.get("message") || ""),
        };
        if (btn) { btn.disabled = true; btn.textContent = "Gönderiliyor…"; }
        try {
          const res = await fetch(`${API}/api/contact`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const json = await res.json().catch(() => ({}));
          if (res.ok && json?.success) {
            form.innerHTML =
              '<div class="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center"><h3 class="text-lg font-semibold text-slate-900">Teşekkürler!</h3><p class="mt-1 text-sm text-slate-500">Geri bildiriminiz alındı.</p></div>';
          } else {
            throw new Error();
          }
        } catch {
          if (btn) { btn.disabled = false; btn.innerHTML = label; }
          let err = form.querySelector<HTMLElement>("[data-fb-error]");
          if (!err) {
            err = document.createElement("div");
            err.setAttribute("data-fb-error", "");
            err.className = "mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700";
            form.prepend(err);
          }
          err.textContent = "Gönderilemedi. Lütfen tekrar deneyin.";
        }
      };
      form.addEventListener("submit", onSubmit);
      cleanups.push(() => form.removeEventListener("submit", onSubmit));
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
