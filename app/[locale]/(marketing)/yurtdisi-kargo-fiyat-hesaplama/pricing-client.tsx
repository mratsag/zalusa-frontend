"use client";

import { useEffect, useRef } from "react";

import { HTML } from "./content";

const API = process.env.NEXT_PUBLIC_API_URL;

// fiyat_hesaplama.php portu: içerik ham HTML, calculator (kargo-hesapla-v2) +
// FAQ/scroll JS React'e alındı. Calculator ülkeleri {API}/api/countries'ten yükler,
// "Hesapla" → /yurtdisi-kargo-fiyat-hesaplama'ya param'larla redirect (v2 davranışı).
export function PricingContent() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const cleanups: (() => void)[] = [];

    let trNames: Intl.DisplayNames | null = null;
    try {
      trNames = new Intl.DisplayNames(["tr"], { type: "region" });
    } catch {
      trNames = null;
    }

    function initCountryPicker(prefix: string) {
      const picker = document.getElementById(prefix + "-country-picker");
      if (!picker) return;
      const trigger = document.getElementById(prefix + "-country-trigger");
      const dropdown = document.getElementById(prefix + "-country-dropdown");
      const searchInput = document.getElementById(prefix + "-country-search") as HTMLInputElement | null;
      const list = document.getElementById(prefix + "-country-list");
      const hiddenInput = document.getElementById(prefix + "-dest") as HTMLInputElement | null;
      const displayName = document.getElementById(prefix + "-country-name");
      const displayFlag = document.getElementById(prefix + "-country-flag");
      const chipName = document.getElementById(prefix + "-chip-name");
      const chipFlag = document.getElementById(prefix + "-chip-flag");
      const clearBtn = document.getElementById(prefix + "-country-clear");
      const options = list ? Array.from(list.querySelectorAll<HTMLElement>("." + prefix + "-country-option")) : [];
      if (!dropdown || !trigger) return;

      const setValue = (value: string, name: string, flag: string) => {
        if (hiddenInput) hiddenInput.value = value || "";
        if (displayName) displayName.textContent = name || "Ülke seçin";
        const flagHtml = flag && flag.indexOf("http") === 0
          ? `<img src="${flag}" alt="" class="w-6 h-4 object-cover rounded-sm ring-1 ring-gray-200">`
          : flag || "";
        if (displayFlag) displayFlag.innerHTML = flagHtml;
        if (chipName) chipName.textContent = name || "";
        if (chipFlag) chipFlag.innerHTML = flagHtml;
        options.forEach((el) => el.classList.toggle("bg-blue-100/80", el.getAttribute("data-value") === value));
      };
      const openDropdown = () => {
        dropdown.classList.remove("hidden");
        if (searchInput) { searchInput.value = ""; searchInput.focus(); filterList(""); }
      };
      const closeDropdown = () => dropdown.classList.add("hidden");
      const filterList = (q: string) => {
        q = (q || "").toLowerCase().trim();
        options.forEach((el) => {
          const name = (el.getAttribute("data-name") || el.textContent || "").toLowerCase();
          el.style.display = !q || name.indexOf(q) !== -1 ? "" : "none";
        });
      };

      const onTrigger = (e: Event) => { e.preventDefault(); dropdown.classList.contains("hidden") ? openDropdown() : closeDropdown(); };
      trigger.addEventListener("click", onTrigger);
      const tg = trigger;
      cleanups.push(() => tg.removeEventListener("click", onTrigger));

      if (searchInput) searchInput.addEventListener("input", function () { filterList((this as HTMLInputElement).value); });
      options.forEach((el) => el.addEventListener("click", () => {
        setValue(el.getAttribute("data-value") || "", el.getAttribute("data-name") || "", el.getAttribute("data-flag") || "");
        closeDropdown();
      }));
      if (clearBtn) clearBtn.addEventListener("click", (e) => { e.stopPropagation(); setValue("", "Ülke seçin", ""); closeDropdown(); });
      const onDoc = (e: MouseEvent) => { if (!picker.contains(e.target as Node)) closeDropdown(); };
      document.addEventListener("click", onDoc);
      cleanups.push(() => document.removeEventListener("click", onDoc));
    }

    function loadCountries() {
      if (!API) return;
      fetch(`${API}/api/countries`)
        .then((r) => r.json())
        .then((data: { isoCode: string; countryName: string }[]) => {
          if (!Array.isArray(data) || !data.length) return;
          ["desktop", "mobile"].forEach((prefix) => {
            const list = document.getElementById(prefix + "-country-list");
            if (!list) return;
            list.innerHTML = "";
            data.forEach((c) => {
              const code = c.isoCode.toUpperCase();
              let name = c.countryName;
              try { if (trNames) name = trNames.of(code) || c.countryName; } catch { /* noop */ }
              const flag = `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
              const li = document.createElement("li");
              li.setAttribute("role", "option");
              li.setAttribute("data-value", code);
              li.setAttribute("data-name", name);
              li.setAttribute("data-flag", flag);
              li.className = prefix + "-country-option flex items-center gap-3 py-2 px-4 cursor-pointer hover:bg-blue-50 text-slate-900 font-medium text-sm";
              li.innerHTML = `<img src="${flag}" alt="${code}" class="w-6 h-4 object-cover rounded-sm ring-1 ring-gray-200 shrink-0"> ${name}`;
              list.appendChild(li);
            });
            initCountryPicker(prefix);
          });
        })
        .catch(() => { /* fallback: hardcoded list */ });
    }

    initCountryPicker("mobile");
    initCountryPicker("desktop");
    loadCountries();

    // Paket türü toggle
    const group = root.querySelector("[data-package-group]");
    const dimSection = document.getElementById("qs-dimensions-section");
    if (group) {
      const btns = Array.from(group.querySelectorAll<HTMLElement>("[data-package-option]"));
      const applyTitles = () => {
        const active = btns.find((b) => b.classList.contains("font-bold"));
        const label = active ? (active.querySelector("span")?.textContent || "Paket") : "Paket";
        root.querySelectorAll("#qs-packages-container .qs-pkg-title").forEach((t, i) => { t.textContent = label + " " + (i + 1); });
      };
      btns.forEach((btn) => {
        const h = () => {
          btns.forEach((b) => {
            (b.getAttribute("data-active-classes") || "").split(/\s+/).forEach((c) => c && b.classList.remove(c));
            (b.getAttribute("data-inactive-classes") || "").split(/\s+/).forEach((c) => c && b.classList.add(c));
          });
          (btn.getAttribute("data-inactive-classes") || "").split(/\s+/).forEach((c) => c && btn.classList.remove(c));
          (btn.getAttribute("data-active-classes") || "").split(/\s+/).forEach((c) => c && btn.classList.add(c));
          const type = btn.querySelector("span")?.textContent || "";
          if (dimSection) dimSection.style.display = type === "Belge" ? "none" : "";
          const note = document.getElementById("qs-belge-note");
          if (note) note.classList.toggle("hidden", type !== "Belge");
          applyTitles();
        };
        btn.addEventListener("click", h);
        cleanups.push(() => btn.removeEventListener("click", h));
      });
    }

    // Çoklu paket ekle/sil
    const container = document.getElementById("qs-packages-container");
    const addBtn = document.getElementById("qs-add-package");
    const activeTypeLabel = () => {
      const a = document.querySelector("[data-package-option].font-bold");
      return a ? (a.querySelector("span")?.textContent || "Paket") : "Paket";
    };
    const renumber = () => {
      container?.querySelectorAll(".qs-package-row").forEach((row, i) => {
        const t = row.querySelector(".qs-pkg-title");
        if (t) t.textContent = activeTypeLabel() + " " + (i + 1);
        row.setAttribute("data-pkg-index", String(i));
      });
    };
    if (container && addBtn) {
      const onAdd = () => {
        const rows = container.querySelectorAll(".qs-package-row");
        if (rows.length >= 10) return;
        const idx = rows.length;
        const div = document.createElement("div");
        div.className = "qs-package-row mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl";
        div.innerHTML =
          '<div class="flex items-center justify-between mb-2"><span class="text-xs font-bold text-slate-700 qs-pkg-title">' + activeTypeLabel() + " " + (idx + 1) +
          '</span><button type="button" class="qs-remove-package p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition" title="Paketi sil"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg></button></div>' +
          '<div class="grid grid-cols-2 gap-3"><div><span class="text-xs text-slate-500 mb-1 block">Ağırlık</span><div class="relative"><input type="number" name="pkg-weight" placeholder="0.0" step="0.1" min="0" class="w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-slate-900 font-medium text-sm focus:ring-2 focus:ring-[#4D4DF2] outline-none"><span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">kg</span></div></div><div><span class="text-xs text-slate-500 mb-1 block">Koli Adedi</span><div class="relative"><input type="number" name="pkg-quantity" placeholder="1" min="1" value="1" class="w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-slate-900 font-medium text-sm focus:ring-2 focus:ring-[#4D4DF2] outline-none"><span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">ad.</span></div></div></div>' +
          '<div class="grid grid-cols-3 gap-3 mt-3"><div><span class="text-xs text-slate-500 mb-1 block">Genişlik</span><div class="relative"><input type="number" name="pkg-width" placeholder="0" min="0" class="w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-slate-900 font-medium text-sm focus:ring-2 focus:ring-[#4D4DF2] outline-none"><span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">cm</span></div></div><div><span class="text-xs text-slate-500 mb-1 block">Uzunluk</span><div class="relative"><input type="number" name="pkg-length" placeholder="0" min="0" class="w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-slate-900 font-medium text-sm focus:ring-2 focus:ring-[#4D4DF2] outline-none"><span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">cm</span></div></div><div><span class="text-xs text-slate-500 mb-1 block">Yükseklik</span><div class="relative"><input type="number" name="pkg-height" placeholder="0" min="0" class="w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-slate-900 font-medium text-sm focus:ring-2 focus:ring-[#4D4DF2] outline-none"><span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">cm</span></div></div></div>';
        container.appendChild(div);
        renumber();
      };
      addBtn.addEventListener("click", onAdd);
      cleanups.push(() => addBtn.removeEventListener("click", onAdd));
      const onRemove = (e: Event) => {
        const btn = (e.target as HTMLElement).closest(".qs-remove-package");
        if (!btn) return;
        const row = btn.closest(".qs-package-row");
        if (row && container.querySelectorAll(".qs-package-row").length > 1) { row.remove(); renumber(); }
      };
      container.addEventListener("click", onRemove);
      cleanups.push(() => container.removeEventListener("click", onRemove));
    }

    // Submit → redirect
    const form = document.getElementById("qs-form") as HTMLFormElement | null;
    if (form) {
      const onSubmit = (e: Event) => {
        e.preventDefault();
        const postal = (document.getElementById("qs-postal") as HTMLInputElement | null)?.value.trim() || "";
        const country = (document.getElementById("desktop-dest") as HTMLInputElement | null)?.value || "";
        const active = document.querySelector("[data-package-option].font-bold");
        const shipmentType = active ? (active.querySelector("span")?.textContent || "Koli") : "Koli";
        if (!country) return;
        let packages: unknown[];
        if (shipmentType === "Belge") {
          packages = [{ weightKg: 0.5, quantity: 1, widthCm: 0, lengthCm: 0, heightCm: 0 }];
        } else {
          packages = Array.from(document.querySelectorAll("#qs-packages-container .qs-package-row")).map((row) => ({
            weightKg: parseFloat((row.querySelector('[name="pkg-weight"]') as HTMLInputElement)?.value) || 0,
            quantity: parseInt((row.querySelector('[name="pkg-quantity"]') as HTMLInputElement)?.value) || 1,
            widthCm: parseFloat((row.querySelector('[name="pkg-width"]') as HTMLInputElement)?.value) || 0,
            lengthCm: parseFloat((row.querySelector('[name="pkg-length"]') as HTMLInputElement)?.value) || 0,
            heightCm: parseFloat((row.querySelector('[name="pkg-height"]') as HTMLInputElement)?.value) || 0,
          }));
        }
        const params = new URLSearchParams();
        params.set("country", country);
        if (postal) params.set("postalCode", postal);
        params.set("shipmentType", shipmentType);
        params.set("packages", JSON.stringify(packages));
        window.location.href = "/yurtdisi-kargo-fiyat-hesaplama?" + params.toString();
      };
      form.addEventListener("submit", onSubmit);
      cleanups.push(() => form.removeEventListener("submit", onSubmit));
    }

    // FAQ tek-açılır + smooth-scroll
    const faqItems = Array.from(root.querySelectorAll<HTMLDetailsElement>("details"));
    faqItems.forEach((d) => {
      const h = () => { if (d.open) faqItems.forEach((o) => { if (o !== d) o.open = false; }); };
      d.addEventListener("toggle", h);
      cleanups.push(() => d.removeEventListener("toggle", h));
    });
    Array.from(root.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')).forEach((a) => {
      const h = (e: Event) => {
        const id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        const t = document.querySelector(id);
        if (!t) return;
        e.preventDefault();
        t.scrollIntoView({ behavior: "smooth", block: "start" });
      };
      a.addEventListener("click", h);
      cleanups.push(() => a.removeEventListener("click", h));
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return <div ref={ref} dangerouslySetInnerHTML={{ __html: HTML }} />;
}
