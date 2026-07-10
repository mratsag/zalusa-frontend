/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";

// includes/kargo-hesapla-v2.php "Kargo Hesapla" formu — paylaşılan bileşen.
// StickyCalculator (ana sayfa floating) + ülke sayfası hero'su kullanır.
// preselectIso2: ülke sayfasında hedef ülkeyi ISO2 ile önseçer.
// "Hesapla" → girdileri /yurtdisi-kargo-fiyat-hesaplama'ya redirect (hesaplama orada).

const API = process.env.NEXT_PUBLIC_API_URL;

type Opt = { code: string; name: string; flag: string };
type Pkg = { weight: string; quantity: string; width: string; length: string; height: string };

const FALLBACK: Opt[] = [
  { code: "TR", name: "Türkiye", flag: "🇹🇷" },
  { code: "DE", name: "Almanya", flag: "🇩🇪" },
  { code: "NL", name: "Hollanda", flag: "🇳🇱" },
  { code: "FR", name: "Fransa", flag: "🇫🇷" },
  { code: "GB", name: "İngiltere", flag: "🇬🇧" },
  { code: "ES", name: "İspanya", flag: "🇪🇸" },
  { code: "IT", name: "İtalya", flag: "🇮🇹" },
  { code: "AT", name: "Avusturya", flag: "🇦🇹" },
  { code: "US", name: "Amerika Birleşik Devletleri", flag: "https://flagcdn.com/w40/us.png" },
  { code: "AE", name: "Birleşik Arap Emirlikleri", flag: "🇦🇪" },
  { code: "SA", name: "Suudi Arabistan", flag: "🇸🇦" },
];
const DEFAULT_SELECTED: Opt = { code: "ES", name: "İspanya", flag: "🇪🇸" };
const emptyPkg = (): Pkg => ({ weight: "", quantity: "1", width: "", length: "", height: "" });

const TYPES: { label: string; icon: string }[] = [
  { label: "Koli", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" },
  { label: "Paket", icon: "M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" },
  { label: "Belge", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
];

function flagFor(code: string): string {
  const lc = code.toLowerCase();
  return `https://flagcdn.com/w40/${lc}.png`;
}

function Flag({ flag, cls = "" }: { flag: string; cls?: string }) {
  if (flag.startsWith("http")) {
    return <img src={flag} alt="" className={`w-6 h-4 object-cover rounded-sm ring-1 ring-gray-200 ${cls}`} />;
  }
  return <span>{flag}</span>;
}

const INPUT = "w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-slate-900 font-medium text-sm focus:ring-2 focus:ring-[#4D4DF2] focus:border-transparent outline-none";
const NUMINPUT = "w-full bg-white border border-gray-200 rounded-lg py-2 pl-3 pr-8 text-slate-900 font-medium text-sm focus:ring-2 focus:ring-[#4D4DF2] outline-none";
const UNIT = "absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400";

export function QuickCalculatorForm({ preselectIso2, className = "" }: { preselectIso2?: string; className?: string }) {
  const [countries, setCountries] = useState<Opt[]>(FALLBACK);
  const [selected, setSelected] = useState<Opt>(DEFAULT_SELECTED);
  const [touched, setTouched] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [postal, setPostal] = useState("");
  const [pkgType, setPkgType] = useState<string | null>(null);
  const [packages, setPackages] = useState<Pkg[]>([emptyPkg()]);
  const [error, setError] = useState("");

  const pickerRef = useRef<HTMLDivElement>(null);
  const preIso = (preselectIso2 || "").toUpperCase();

  // Ülkeleri API'den yükle
  useEffect(() => {
    if (!API) return;
    let trNames: Intl.DisplayNames | null = null;
    try {
      trNames = new Intl.DisplayNames(["tr"], { type: "region" });
    } catch {
      trNames = null;
    }
    fetch(`${API}/api/countries`)
      .then((r) => r.json())
      .then((data: { isoCode: string; countryName: string }[]) => {
        if (!Array.isArray(data) || data.length === 0) return;
        const list: Opt[] = data.map((c) => {
          const code = c.isoCode.toUpperCase();
          let name = c.countryName;
          try {
            if (trNames) name = trNames.of(code) || c.countryName;
          } catch {
            /* noop */
          }
          return { code, name, flag: flagFor(code) };
        });
        setCountries(list);
      })
      .catch(() => {
        /* fallback */
      });
  }, []);

  // Hedef ülke önseçimi (ülke sayfası). Kullanıcı henüz dokunmadıysa uygula.
  useEffect(() => {
    if (!preIso || touched) return;
    const match = countries.find((c) => c.code === preIso);
    if (match) setSelected(match);
    else setSelected({ code: preIso, name: preIso, flag: flagFor(preIso) });
  }, [preIso, countries, touched]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setPickerOpen(false);
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const pick = (c: Opt) => {
    setSelected(c);
    setTouched(true);
    setPickerOpen(false);
    setSearch("");
  };

  const filtered = search.trim()
    ? countries.filter((c) => c.name.toLowerCase().includes(search.toLowerCase().trim()))
    : countries;

  const isBelge = pkgType === "Belge";
  const typeLabel = pkgType || "Paket";

  const addPackage = () => setPackages((p) => (p.length >= 10 ? p : [...p, emptyPkg()]));
  const removePackage = (i: number) => setPackages((p) => (p.length > 1 ? p.filter((_, idx) => idx !== i) : p));
  const updatePackage = (i: number, key: keyof Pkg, val: string) =>
    setPackages((p) => p.map((pkg, idx) => (idx === i ? { ...pkg, [key]: val } : pkg)));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!selected.code) {
      setError("Lütfen bir ülke seçin.");
      return;
    }
    const shipmentType = pkgType || "Koli";
    const pkgs =
      shipmentType === "Belge"
        ? [{ weightKg: 0.5, quantity: 1, widthCm: 0, lengthCm: 0, heightCm: 0 }]
        : packages.map((p) => ({
            weightKg: parseFloat(p.weight) || 0,
            quantity: parseInt(p.quantity) || 1,
            widthCm: parseFloat(p.width) || 0,
            lengthCm: parseFloat(p.length) || 0,
            heightCm: parseFloat(p.height) || 0,
          }));
    const params = new URLSearchParams();
    params.set("country", selected.code);
    if (postal.trim()) params.set("postalCode", postal.trim());
    params.set("shipmentType", shipmentType);
    params.set("packages", JSON.stringify(pkgs));
    window.location.href = "/yurtdisi-kargo-fiyat-hesaplama?" + params.toString();
  };

  return (
    <div id="calculator-form" className={`bg-white/95 backdrop-blur p-6 md:p-7 rounded-2xl border border-slate-200/80 ring-1 ring-slate-900/[0.03] shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] relative scroll-mt-24 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[17px] font-semibold text-slate-900 tracking-tight">Kargo Hesapla</h3>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/70 rounded-full px-2.5 py-1">
          <span className="relative flex w-1.5 h-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Canlı fiyat
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl text-sm font-medium text-center bg-red-50 text-red-700 border border-red-200">{error}</div>
      )}

      <form className="space-y-6" noValidate onSubmit={submit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Nereye?
            </label>
            <div ref={pickerRef} className="relative">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={pickerOpen}
                onClick={() => setPickerOpen((o) => !o)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 px-4 text-slate-900 font-medium text-sm focus:ring-2 focus:ring-[#4D4DF2] focus:border-transparent outline-none cursor-pointer touch-manipulation text-left flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Flag flag={selected.flag} />
                  <span>{selected.name || "Ülke seçin"}</span>
                </span>
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {pickerOpen && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                  <div className="p-2 bg-slate-50 border-b border-slate-200">
                    <div className="flex items-center justify-between gap-2 py-1.5 px-3 rounded-lg bg-white border border-slate-200 mb-2">
                      <span className="flex items-center gap-2 text-slate-900 font-medium text-sm">
                        <Flag flag={selected.flag} />
                        <span>{selected.name}</span>
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelected({ code: "", name: "Ülke seçin", flag: "" });
                          setTouched(true);
                          setPickerOpen(false);
                        }}
                        className="p-0.5 rounded hover:bg-slate-100 text-slate-500 touch-manipulation cursor-pointer"
                        aria-label="Seçimi temizle"
                      >
                        <svg className="w-3.5 h-3.5 cursor-pointer" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Arayarak seçin"
                      autoComplete="off"
                      className="w-full py-2 px-3 border border-gray-200 rounded-lg text-slate-900 font-medium text-sm placeholder:text-slate-400 outline-none focus:border-[#0000BE] focus:ring-1 focus:ring-[#0000BE]"
                    />
                  </div>
                  <ul role="listbox" className="max-h-48 overflow-y-auto py-1">
                    {filtered.map((c) => (
                      <li
                        key={c.code}
                        role="option"
                        aria-selected={c.code === selected.code}
                        onClick={() => pick(c)}
                        className={`flex items-center gap-3 py-2 px-4 cursor-pointer hover:bg-blue-50 text-slate-900 font-medium text-sm ${c.code === selected.code ? "bg-blue-100/80" : ""}`}
                      >
                        <Flag flag={c.flag} />
                        {c.name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-1.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Posta Kodu / Şehir
            </label>
            <input type="text" value={postal} onChange={(e) => setPostal(e.target.value)} placeholder="Posta kodu veya şehir girin" className={INPUT} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-900 mb-2">Paket Türü</label>
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((t) => {
              const active = pkgType === t.label;
              return (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => setPkgType(t.label)}
                  className={`flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm transition-all ${active ? "border-2 border-[#7C7CE3]/30 bg-[#7C7CE3]/10 text-[#0000BE] font-bold shadow-sm" : "border border-gray-200 bg-white text-slate-600 font-medium hover:border-gray-300 hover:bg-gray-50"}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={t.icon} />
                  </svg>
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
          {isBelge && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2">
              <span className="text-lg">📄</span>
              <span className="text-sm font-semibold text-[#0000BE]">Belge gönderimi — Sabit 0.5 desi</span>
            </div>
          )}
        </div>

        {!isBelge && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-bold text-slate-900">Boyutlar (cm / kg)</label>
              <button type="button" onClick={addPackage} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#0000BE] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 cursor-pointer transition">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Yeni Paket Ekle
              </button>
            </div>
            <div>
              {packages.map((pkg, i) => (
                <div key={i} className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700">{typeLabel} {i + 1}</span>
                    {packages.length > 1 && (
                      <button type="button" onClick={() => removePackage(i)} className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition" title="Paketi sil">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-slate-500 mb-1 block">Ağırlık</span>
                      <div className="relative">
                        <input type="number" step="0.1" min="0" placeholder="0.0" value={pkg.weight} onChange={(e) => updatePackage(i, "weight", e.target.value)} className={NUMINPUT} />
                        <span className={UNIT}>kg</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 mb-1 block">Koli Adedi</span>
                      <div className="relative">
                        <input type="number" min="1" placeholder="1" value={pkg.quantity} onChange={(e) => updatePackage(i, "quantity", e.target.value)} className={NUMINPUT} />
                        <span className={UNIT}>ad.</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-3">
                    <div>
                      <span className="text-xs text-slate-500 mb-1 block">Genişlik</span>
                      <div className="relative">
                        <input type="number" min="0" placeholder="0" value={pkg.width} onChange={(e) => updatePackage(i, "width", e.target.value)} className={NUMINPUT} />
                        <span className={UNIT}>cm</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 mb-1 block">Uzunluk</span>
                      <div className="relative">
                        <input type="number" min="0" placeholder="0" value={pkg.length} onChange={(e) => updatePackage(i, "length", e.target.value)} className={NUMINPUT} />
                        <span className={UNIT}>cm</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 mb-1 block">Yükseklik</span>
                      <div className="relative">
                        <input type="number" min="0" placeholder="0" value={pkg.height} onChange={(e) => updatePackage(i, "height", e.target.value)} className={NUMINPUT} />
                        <span className={UNIT}>cm</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="w-full py-3.5 bg-gradient-to-br from-[#4D4DF2] to-[#0000BE] hover:from-[#5959FF] hover:to-[#00009c] hover:-translate-y-0.5 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow flex items-center justify-center space-x-2">
          <span>Hesapla</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-3">
          {["Sonuçlar anında gösterilir", "Kredi kartı gerekmez", "Ücretsiz"].map((t) => (
            <li key={t} className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
              </svg>
              {t}
            </li>
          ))}
        </ul>
      </form>
    </div>
  );
}
