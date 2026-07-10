import { Fragment } from "react";
import type { Metadata } from "next";

import { PageHeader } from "@/components/marketing/page-header";

// PHP hakkimizda.php portu.
export const metadata: Metadata = {
  title: "Hakkımızda - Zalusa",
  description:
    "Zalusa, yurt içi ve yurt dışı gönderileri tek bir panelden yönetmenizi sağlayan şeffaf, hızlı ve ölçeklenebilir bir lojistik platformudur.",
};

const DOTS28 = {
  backgroundImage: "radial-gradient(#E1E8F1 1px, transparent 1px)",
  backgroundSize: "28px 28px",
};
const DOTS24 = {
  backgroundImage: "radial-gradient(#E1E8F1 1px, transparent 1px)",
  backgroundSize: "24px 24px",
};

const FEATURES = [
  { title: "Tek Panelden Yönetim", desc: "Tüm gönderi, teklif ve ödeme süreçlerinizi tek bir ekrandan yönetin.", icon: "M4 6h16M4 12h16M4 18h16" },
  { title: "Anlık Fiyat Karşılaştırma", desc: "Farklı taşıyıcı seçeneklerini saniyeler içinde karşılaştırın.", icon: "M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" },
  { title: "Gerçek Zamanlı Takip", desc: "Gönderilerinizin durumunu anlık olarak izleyin.", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" },
  { title: "Güvenli Ödeme Altyapısı", desc: "Ödemelerinizi hızlı ve güvenli bir şekilde tamamlayın.", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
  { title: "Operasyon Kontrolü", desc: "Süreçlerinizi daha planlı ve ölçülebilir hale getirin.", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" },
];

const STATS = [
  { value: "220+", label: "Ülkeye Teslimat" },
  { value: "2.4M+", label: "Başarılı Gönderi" },
  { value: "65K+", label: "Aktif İşletme" },
];

export default function HakkimizdaPage() {
  return (
    <>
      <PageHeader
        current="Hakkımızda"
        title="Hakkımızda"
        subtitle="Zalusa, yurt içi ve yurt dışı gönderileri tek bir panelden yönetmenizi sağlayan, şeffaf, hızlı ve ölçeklenebilir bir lojistik platformudur."
      />

      {/* Biz Kimiz */}
      <section className="py-8 md:py-14 bg-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={DOTS28} />
        <div className="absolute -right-32 top-0 w-[480px] h-[480px] rounded-full bg-[#0000BE]/5 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-8 lg:gap-20 items-start">
            <div>
              <h2 className="font-semibold text-slate-900 leading-tight tracking-[-0.02em] mb-3 lg:mb-5">
                <span className="headline-shimmer inline-block md:whitespace-nowrap text-[clamp(1.35rem,4.6vw,3.6rem)] text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-[#0000BE] to-slate-900">
                  Lojistiği daha akıllı, daha şeffaf yapıyoruz.
                </span>
              </h2>
              <p className="text-slate-500 text-[13px] sm:text-sm lg:text-base leading-relaxed mb-5 lg:mb-7">
                Zalusa; gönderimden teslimata kadar her adımı öngörülebilir, şeffaf ve ölçülebilir kılan
                teknoloji odaklı lojistik platformudur.
              </p>
              <a
                href="/iletisim"
                className="inline-flex items-center gap-2 px-5 py-2.5 lg:px-6 lg:h-10 md:h-12 bg-gradient-to-br from-[#4D4DF2] to-[#0000BE] hover:from-[#5959FF] hover:to-[#00009c] hover:-translate-y-0.5 text-white text-sm font-semibold rounded-lg cursor-pointer transition shadow-lg shadow-blue-900/20"
              >
                Bizimle Tanışın
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Temel Değerler — Bento */}
      <section className="py-10 md:py-16 bg-slate-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none" style={DOTS24} />
        <div className="absolute -left-32 bottom-0 w-[400px] h-[400px] rounded-full bg-[#0000BE]/5 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 md:gap-5">
            {/* Şeffaflık */}
            <div className="lg:col-span-5 zalusa-card p-5 sm:p-7 md:p-9 relative group overflow-hidden border-l-4 border-l-[#0000BE]">
              <div className="relative z-10">
                <div className="zalusa-icon-container !w-10 !h-10 sm:!w-12 sm:!h-12 !rounded-xl mb-4 sm:mb-5 group-hover:bg-[#0000BE] group-hover:text-white transition">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900 mb-2 sm:mb-3">Şeffaflık</h3>
                <p className="text-slate-500 text-[13px] sm:text-sm md:text-base leading-relaxed mb-4 sm:mb-5">
                  Her adımı görebilir, her kararı anlık takip edebilirsiniz. Sürpriz yok, karmaşa yok — sadece tam görünürlük.
                </p>
                <div className="flex items-center gap-2.5 sm:gap-3 pt-3 sm:pt-4 border-t border-slate-100">
                  <div className="flex -space-x-2">
                    {[0, 1].map((i) => (
                      <div key={i} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#EDF2FF] border-2 border-white flex items-center justify-center">
                        <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#5147EF]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] sm:text-xs text-slate-400">Anlık durum &amp; maliyet takibi</span>
                </div>
              </div>
            </div>

            {/* Sağ: Hız + Ölçeklenebilirlik + stats */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-3 sm:gap-4 md:gap-5">
              <div className="zalusa-card p-5 sm:p-6 md:p-7 relative group overflow-hidden border-l-4 border-l-[#0000BE]">
                <div className="relative z-10">
                  <div className="zalusa-icon-container !w-9 !h-9 sm:!w-10 sm:!h-10 !rounded-xl mb-3 sm:mb-4 group-hover:bg-[#0000BE] group-hover:text-white transition">
                    <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5 sm:mb-2">Hız</h3>
                  <p className="text-slate-500 text-[13px] sm:text-sm leading-relaxed">Fiyat hesaplama, gönderi oluşturma ve anlık takip — tüm süreçler saniyeler içinde tamamlanır.</p>
                </div>
              </div>
              <div className="zalusa-card p-5 sm:p-6 md:p-7 relative group overflow-hidden border-l-4 border-l-[#0000BE]">
                <div className="relative z-10">
                  <div className="zalusa-icon-container !w-9 !h-9 sm:!w-10 sm:!h-10 !rounded-xl mb-3 sm:mb-4 group-hover:bg-[#0000BE] group-hover:text-white transition">
                    <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
                    </svg>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 mb-1.5 sm:mb-2">Ölçeklenebilirlik</h3>
                  <p className="text-slate-500 text-[13px] sm:text-sm leading-relaxed">Küçük işletmeden global oyuncuya, büyüyen her operasyona kolayca uyum sağlar.</p>
                </div>
              </div>

              <div className="col-span-2 bg-gradient-to-r from-[#0000BE] to-[#4D4DF2] rounded-2xl p-5 sm:p-6 md:p-7 overflow-hidden relative">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full bg-white/5 blur-2xl pointer-events-none" />
                <div className="grid grid-cols-3 gap-3 sm:flex sm:flex-row sm:items-center sm:justify-between relative z-10">
                  {STATS.map((s, i) => (
                    <Fragment key={s.label}>
                      {i > 0 && <div className="hidden sm:block w-px h-8 bg-white/20 shrink-0" />}
                      <div className="text-center sm:text-left sm:flex sm:items-center sm:gap-2.5">
                        <span className="block text-2xl sm:text-3xl lg:text-4xl font-black text-white/90 leading-none">{s.value}</span>
                        <span className="block text-white/50 text-[10px] sm:text-xs lg:text-sm leading-snug mt-1 sm:mt-0" dangerouslySetInnerHTML={{ __html: s.label.replace(" ", "<br/> ") }} />
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Özelliklerimiz */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-2">Özelliklerimiz</h2>
            <p className="text-slate-500 text-sm md:text-base">Lojistik süreçlerinizi kolaylaştıran temel çözümlerimiz.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="zalusa-card p-5 group hover:-translate-y-0.5">
                <div className="zalusa-icon-container !w-11 !h-11 mb-4 md:ml-auto group-hover:bg-[#0000BE] group-hover:text-white transition">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {f.icon.split(" M").map((d, i) => (
                      <path key={i} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={i === 0 ? d : "M" + d} />
                    ))}
                  </svg>
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-2">{f.title}</h4>
                <p className="zalusa-subtext text-sm leading-snug">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-semibold text-slate-900 mb-6">Lojistikte Yeni Bir Döneme Hazır mısın?</h2>
          <p className="text-slate-500 mb-10 text-lg">Zalusa ile e-ihracatta sınırları kaldırın, işinizi büyütmeye odaklanın.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="https://app.zalusa.com" className="px-10 py-4 bg-[#0000BE] text-white font-bold rounded-xl shadow-xl hover:bg-[#00009c] transition">
              Hemen Üye Ol
            </a>
            <a href="/iletisim" className="px-10 py-4 border border-gray-200 text-slate-700 font-bold rounded-xl hover:bg-gray-50 transition">
              Bize Ulaşın
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
