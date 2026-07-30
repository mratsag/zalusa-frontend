import { getTranslations } from "next-intl/server";

// homepage-v2.php İSTATİSTİK BANDI (live 829-864) portu.
// Phosphor ikonlar <i class="ph-bold ph-*"> — layout'ta import edilen web fontu.
// Etiket VE değer çeviri kataloğunda: TR "%30" / "7/24" ↔ EN "30%" / "24/7".
const STATS = [
  { key: "onTime", icon: "ph-check-circle", iconWrap: "bg-emerald-50 text-emerald-600 border-emerald-200/70" },
  { key: "support", icon: "ph-headset", iconWrap: "bg-indigo-50 text-indigo-600 border-indigo-200/70" },
  { key: "countries", icon: "ph-globe-hemisphere-west", iconWrap: "bg-cyan-50 text-cyan-600 border-cyan-200/70" },
  { key: "savings", icon: "ph-trend-down", iconWrap: "bg-purple-50 text-purple-600 border-purple-200/70" },
];

export async function Istatistik() {
  const t = await getTranslations("stats");

  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200/80 ring-1 ring-slate-900/[0.02] bg-white p-7 md:p-10 shadow-[0_2px_4px_rgba(15,23,42,0.04),0_18px_50px_-26px_rgba(15,23,42,0.18)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-9 md:gap-y-0 md:divide-x divide-slate-200/70">
            {STATS.map((s) => (
              <div key={s.key} className="flex flex-col items-center text-center px-2 md:px-6">
                <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl border mb-2.5 ${s.iconWrap}`}>
                  <i className={`ph-bold ${s.icon} text-[20px]`} />
                </span>
                <p className="text-[12px] md:text-[13px] font-medium text-slate-400 uppercase tracking-wide mb-1">
                  {t(`${s.key}.label`)}
                </p>
                <p className="text-[36px] md:text-[44px] font-bold tracking-tight text-slate-900 leading-none">
                  {t(`${s.key}.value`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
