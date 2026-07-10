/* eslint-disable @next/next/no-img-element */
// homepage-v2.php "NEDEN ZALUSA?" karşılaştırma tablosu (live 1900-2050) portu.
const FEATURES = [
  "Şeffaf fiyat — kurulum ve gizli maliyet yok",
  "Gönderi başına optimize maliyet (ort. %27 tasarruf)",
  "Tüm taşıyıcılar tek panelde fiyat karşılaştırma",
  "7/24 operasyon ve canlı destek",
  "Kabulden teslimata uçtan uca canlı takip",
  "Tek tıkla otomatik etiket ve gönderi oluşturma",
  "Etsy, Shopify, Amazon entegrasyonları hazır",
];

function CheckIcon() {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500 text-white shadow-[0_4px_10px_-2px_rgba(16,185,129,0.5)]">
      <svg className="w-4 h-4 sm:w-[18px] sm:h-[18px]" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

function CrossIcon() {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-rose-500 text-white shadow-[0_4px_10px_-2px_rgba(244,63,94,0.45)]">
      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 01-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

export function NedenZalusa() {
  return (
    <section className="relative py-16 md:py-28 bg-white overflow-hidden cv-auto">
      {/* Ambient decorations */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute top-10 left-6 md:left-10 w-32 h-32 opacity-60" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.15) 1px, transparent 0)", backgroundSize: "14px 14px" }} />
        <div className="absolute bottom-10 right-6 md:right-10 w-32 h-32 opacity-50" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(15,23,42,0.15) 1px, transparent 0)", backgroundSize: "14px 14px" }} />
        <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-gradient-to-br from-emerald-200/40 via-teal-100/30 to-transparent blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-indigo-200/40 via-blue-100/30 to-transparent blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-1 h-1 rounded-full bg-[#4D4DF2]/60" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#4D4DF2]">Karşılaştırma</span>
            <span className="w-1 h-1 rounded-full bg-[#4D4DF2]/60" />
          </div>
          <h2 className="text-[32px] md:text-[44px] font-semibold tracking-tight text-slate-900 leading-[1.1]">
            <span className="text-[#0000BE]">NEDEN</span> ZALUSA?
          </h2>
          <p className="mt-4 text-base md:text-[17px] text-slate-500 leading-relaxed">
            Diğer yöntemlerle Zalusa&apos;yı yan yana koyduk. Fark, tek panelde net görülüyor.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="rounded-3xl border border-slate-200/80 ring-1 ring-slate-900/[0.02] bg-white shadow-[0_2px_4px_rgba(15,23,42,0.04),0_24px_60px_-26px_rgba(0,0,190,0.22)] overflow-hidden">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr_84px_84px] sm:grid-cols-[1fr_150px_150px]">
              <div className="p-4 sm:p-6 flex items-end">
                <span className="text-[11px] sm:text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-400">Özellik</span>
              </div>
              <div className="relative p-3 sm:p-5 bg-gradient-to-b from-[#0000BE] to-[#1a1aff] text-white flex flex-col items-center justify-center gap-2 text-center">
                <span className="absolute top-0 inset-x-0 h-1 bg-[#BFFF00]" />
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white shadow-sm overflow-hidden">
                  <img src="/assets/logo-ikon.png" alt="Zalusa" className="w-6 h-6 sm:w-8 sm:h-8 object-contain" />
                </span>
                <span className="text-[12px] sm:text-[15px] font-bold tracking-tight">Zalusa</span>
              </div>
              <div className="p-3 sm:p-5 bg-slate-50 text-slate-500 flex flex-col items-center justify-center gap-2 text-center border-l border-slate-100">
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border border-slate-200 text-slate-400">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M4 12h16M4 17h10" />
                  </svg>
                </span>
                <span className="text-[11px] sm:text-[13px] font-semibold leading-tight">Diğerleri</span>
              </div>
            </div>

            {/* Feature rows */}
            {FEATURES.map((f) => (
              <div key={f} className="grid grid-cols-[1fr_84px_84px] sm:grid-cols-[1fr_150px_150px] border-t border-slate-100">
                <div className="p-4 sm:px-6 sm:py-4 flex items-center text-[13px] sm:text-[15px] font-medium text-slate-700">{f}</div>
                <div className="flex items-center justify-center bg-[#0000BE]/[0.035] py-3.5">
                  <CheckIcon />
                </div>
                <div className="flex items-center justify-center border-l border-slate-100 py-3.5">
                  <CrossIcon />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-8 md:mt-10">
            <a
              href="https://app.zalusa.com"
              className="inline-flex items-center justify-center gap-2 px-6 h-11 md:h-12 bg-[#BFFF00] hover:bg-[#aee600] text-slate-900 text-sm font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap"
            >
              Ücretsiz Teklif Al
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="/yurtdisi-kargo-fiyat-hesaplama"
              className="inline-flex items-center justify-center px-6 h-11 md:h-12 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold rounded-lg transition-all whitespace-nowrap"
            >
              Fiyat Hesapla
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
