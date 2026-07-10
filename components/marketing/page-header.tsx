// Landing sayfa başlığı (breadcrumb + h1 + intro) — tüm iç sayfalar kullanır.
// PHP: her sayfanın <header class="py-8 md:py-10 bg-slate-50"> bloğu.
const DOTS = {
  backgroundImage: "radial-gradient(#E1E8F1 1px, transparent 1px)",
  backgroundSize: "24px 24px",
};

export function PageHeader({
  title,
  subtitle,
  current,
}: {
  title: string;
  subtitle?: string;
  current: string;
}) {
  return (
    <header className="py-8 md:py-10 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={DOTS} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-left">
        <nav className="mb-5 md:mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 md:gap-2.5 text-[13px] md:text-sm flex-nowrap">
            <li className="flex items-center shrink-0">
              <a href="/" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#0000BE] transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span className="hidden md:inline">Anasayfa</span>
              </a>
            </li>
            <li className="flex items-center text-slate-300 shrink-0">/</li>
            <li className="flex items-center min-w-0">
              <span className="text-slate-600 font-semibold truncate">{current}</span>
            </li>
          </ol>
        </nav>
        <h1 className="text-5xl md:text-6xl font-semibold text-slate-900 mb-4">{title}</h1>
        {subtitle && <p className="text-xl text-slate-500 leading-relaxed">{subtitle}</p>}
      </div>
    </header>
  );
}
