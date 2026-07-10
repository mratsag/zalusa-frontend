// PHP iletisim.php içeriği — hero + iletişim kanalları + form + FAQ (ham HTML).
export const HTML = `<section class="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-white pt-10 pb-14 md:pt-16 md:pb-20">
    <!-- Grid pattern background -->
    <div class="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div class="absolute inset-0 opacity-[0.6]"
             style="background-image:
                linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px);
                background-size: 56px 56px;
                mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 40%, transparent 80%);
                -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 40%, transparent 80%);"></div>
        <div class="absolute -left-20 top-24 w-72 h-72 rounded-full bg-[#4D4DF2]/8 blur-3xl"></div>
        <div class="absolute right-0 -top-12 w-96 h-96 rounded-full bg-[#0000BE]/6 blur-3xl"></div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <nav class="mb-5 md:mb-6" aria-label="Breadcrumb">
    <ol class="flex items-center gap-2 md:gap-2.5 text-[13px] md:text-sm flex-nowrap" itemscope itemtype="https://schema.org/BreadcrumbList">
                
        <li class="flex items-center shrink-0"
            itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <meta itemprop="position" content="1">

                            <a href="/"
                   class="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#0000BE] transition"
                   itemprop="item">
                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                    </svg>
                    <span class="hidden md:inline" itemprop="name">Anasayfa</span>
                </a>
                    </li>
                        <li class="flex items-center text-slate-300 shrink-0" aria-hidden="true">/</li>
        
        <li class="flex items-center min-w-0"
            itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <meta itemprop="position" content="2">

                            <span class="text-slate-600 font-semibold truncate" itemprop="name">İletişim</span>
                <meta itemprop="item" content="/iletisim">
                    </li>
            </ol>
</nav>

        <div class="text-center max-w-3xl mx-auto pt-6 md:pt-10 zal-rise">
            <span class="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-white px-3 py-1.5 text-[12px] font-semibold text-emerald-700 zal-shadow-xs">
                <span class="relative flex w-2 h-2">
                    <span class="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60"></span>
                    <span class="relative inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                </span>
                7/24 destek · Ortalama 2 dakikada yanıt
            </span>

            <h1 class="mt-6 text-[40px] sm:text-[52px] md:text-[64px] leading-[1.02] tracking-tight text-slate-900">
                Operasyonunuz için
                <span class="block zal-italic-accent text-[#0000BE]">buradayız.</span>
            </h1>

            <p class="mt-5 text-[15px] md:text-[17px] text-slate-500 leading-relaxed max-w-xl mx-auto">
                Yurt dışı kargo ve e-ihracat süreçlerinizde sorularınız için <strong class="text-slate-700 font-semibold">WhatsApp, telefon, e-posta</strong> veya ofis ziyareti — hangisi size uygunsa.
            </p>

            <!-- Stat chips -->
            <div class="mt-8 flex flex-wrap items-center justify-center gap-2 md:gap-2.5">
                <span class="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3.5 py-2 text-[12.5px] zal-shadow-xs">
                    <i class="ph-fill ph-lightning text-amber-500 text-[14px]"></i>
                    <strong class="text-slate-900 font-semibold">2 dk</strong>
                    <span class="text-slate-500">WhatsApp</span>
                </span>
                <span class="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3.5 py-2 text-[12.5px] zal-shadow-xs">
                    <i class="ph-bold ph-phone text-slate-500 text-[14px]"></i>
                    <span class="text-slate-500">Hafta içi</span>
                    <strong class="text-slate-900 font-semibold">09:00–19:00</strong>
                </span>
                <span class="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3.5 py-2 text-[12.5px] zal-shadow-xs">
                    <i class="ph-bold ph-envelope text-slate-500 text-[14px]"></i>
                    <span class="text-slate-500">E-posta</span>
                    <strong class="text-slate-900 font-semibold">2 saat</strong>
                    <span class="text-slate-400">SLA</span>
                </span>
                <span class="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3.5 py-2 text-[12.5px] zal-shadow-xs">
                    <span class="text-[14px]">🇹🇷</span>
                    <span class="text-slate-700">Türkçe destek</span>
                </span>
            </div>
        </div>

        <!-- =====================================================
             2. SCENARIO CARDS  ·  3 entry routes
             ===================================================== -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-14 md:mt-20">
                        <article class="group relative rounded-2xl bg-white border border-slate-200/80 zal-shadow-soft zal-hover-card p-6 md:p-7 flex flex-col gap-3 zal-rise-d1">
                <div class="flex items-start justify-between">
                    <span class="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-[#0000BE] group-hover:text-white group-hover:border-[#0000BE] group-hover:-rotate-6 group-hover:scale-105 transition-all duration-300">
                        <i class="ph-bold ph-chat-circle-dots text-[20px]"></i>
                    </span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border bg-emerald-50 text-emerald-700 border-emerald-200">EN HIZLI</span>
                </div>
                <h3 class="text-[17px] md:text-[18px] font-semibold text-slate-900 leading-snug">Mevcut müşteriyim,<br>hızlı yardım lazım</h3>
                <p class="text-[13.5px] text-slate-500 leading-relaxed flex-1">Aktif gönderiniz, fatura veya teknik bir konu varsa WhatsApp ile saniyeler içinde bağlanın.</p>
                <a href="https://wa.me/908502551840" target="_blank" rel="noopener noreferrer"                    class="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#0000BE] hover:underline mt-1">
                    WhatsApp ile yaz                    <i class="ph-bold ph-arrow-right text-[13px] transition-transform group-hover:translate-x-0.5"></i>
                </a>
            </article>
                        <article class="group relative rounded-2xl bg-white border border-slate-200/80 zal-shadow-soft zal-hover-card p-6 md:p-7 flex flex-col gap-3 zal-rise-d2">
                <div class="flex items-start justify-between">
                    <span class="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-[#0000BE] group-hover:text-white group-hover:border-[#0000BE] group-hover:-rotate-6 group-hover:scale-105 transition-all duration-300">
                        <i class="ph-bold ph-rocket-launch text-[20px]"></i>
                    </span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border bg-indigo-50 text-[#4D4DF2] border-indigo-200">ÖNERİLEN</span>
                </div>
                <h3 class="text-[17px] md:text-[18px] font-semibold text-slate-900 leading-snug">Zalusa'yı keşfediyorum,<br>sorularım var</h3>
                <p class="text-[13.5px] text-slate-500 leading-relaxed flex-1">Süreç, fiyatlandırma, entegrasyon — formu doldurun, uzmanımız size dönsün.</p>
                <a href="#mesaj-gonder"                    class="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#0000BE] hover:underline mt-1">
                    Forma git                    <i class="ph-bold ph-arrow-right text-[13px] transition-transform group-hover:translate-x-0.5"></i>
                </a>
            </article>
                        <article class="group relative rounded-2xl bg-white border border-slate-200/80 zal-shadow-soft zal-hover-card p-6 md:p-7 flex flex-col gap-3 zal-rise-d3">
                <div class="flex items-start justify-between">
                    <span class="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-[#0000BE] group-hover:text-white group-hover:border-[#0000BE] group-hover:-rotate-6 group-hover:scale-105 transition-all duration-300">
                        <i class="ph-bold ph-buildings text-[20px]"></i>
                    </span>
                    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-[0.1em] border bg-slate-100 text-slate-700 border-slate-200">KURUMSAL</span>
                </div>
                <h3 class="text-[17px] md:text-[18px] font-semibold text-slate-900 leading-snug">Yüksek hacim,<br>özel teklif istiyorum</h3>
                <p class="text-[13.5px] text-slate-500 leading-relaxed flex-1">Aylık 500+ gönderi yapıyorsanız anlaşmalı fiyat ve atanmış uzman avantajları.</p>
                <a href="mailto:kurumsal@zalusa.com" class="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[#0000BE] hover:underline mt-1">
                    Kurumsal teklif                    <i class="ph-bold ph-arrow-right text-[13px] transition-transform group-hover:translate-x-0.5"></i>
                </a>
            </article>
                    </div>
    </div>
</section>

<!-- =========================================================
     3. CHANNELS + FORM  ·  Split layout
     ========================================================= -->
<section class="py-16 md:py-24 bg-white" id="mesaj-gonder">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            <!-- ===== Left: Contact channels ===== -->
            <div class="lg:col-span-5 space-y-3.5">
                <header class="mb-2">
                    <h2 class="text-[26px] md:text-[30px] font-semibold tracking-tight text-slate-900">İletişim kanalları</h2>
                    <p class="text-[14px] text-slate-500 mt-1">Size en uygun olanı seçin — hepsi aynı ekibe ulaşır.</p>
                </header>

                <!-- WhatsApp hero card -->
                <a href="https://wa.me/908502551840" target="_blank" rel="noopener noreferrer"
                    class="group relative block rounded-2xl bg-gradient-to-br from-[#22c55e] via-[#16a34a] to-[#15803d] text-white p-6 overflow-hidden zal-shadow-soft hover:-translate-y-0.5 transition-all duration-300">
                    <div class="absolute -right-12 -top-12 w-44 h-44 rounded-full bg-white/15 blur-2xl pointer-events-none"></div>
                    <div class="absolute right-8 bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none"></div>

                    <div class="relative flex items-center justify-between mb-4">
                        <span class="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/90">
                            <i class="ph-fill ph-play text-[10px]"></i>
                            WhatsApp · Önerilen
                        </span>
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 text-[11px] font-semibold backdrop-blur-sm">
                            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            ~2 dk yanıt
                        </span>
                    </div>

                    <span class="relative inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white/15 backdrop-blur mb-4">
                        <i class="ph-fill ph-chat-circle-dots text-[22px]"></i>
                    </span>

                    <h3 class="relative text-[22px] md:text-[24px] font-semibold leading-tight mb-2">Hemen yaz, anında bağlan</h3>
                    <p class="relative text-[14px] text-white/85 leading-relaxed mb-5 max-w-md">Mevcut sorununuz, tracking takibi veya hızlı bir soru için en hızlı kanal.</p>

                    <span class="relative inline-flex items-center gap-2 px-5 h-11 rounded-full bg-white text-emerald-700 text-[13.5px] font-semibold group-hover:bg-emerald-50 transition">
                        WhatsApp'tan yaz
                        <i class="ph-bold ph-arrow-right text-[14px] transition-transform group-hover:translate-x-0.5"></i>
                    </span>
                </a>

                <!-- Channel rows -->
                
                <a href="tel:08502551840" class="group flex items-center gap-4 rounded-2xl bg-white border border-slate-200/80 px-4 py-3.5 zal-shadow-xs hover:border-slate-300 hover:zal-shadow-soft hover:-translate-y-0.5 transition-all duration-200">
                    <span class="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-[#0000BE] group-hover:text-white group-hover:border-[#0000BE] transition-colors duration-200"><i class="ph-bold ph-phone text-[18px]"></i></span>
                    <div class="flex-1 min-w-0">
                        <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Telefon</span>
                        <span class="block text-[15px] font-semibold text-slate-900 group-hover:text-[#0000BE] transition-colors">0850 255 18 40</span>
                        <span class="block text-[12px] text-slate-400 mt-0.5">Hafta içi 09:00–19:00</span>
                    </div>
                    <i class="ph-bold ph-arrow-right text-slate-300 group-hover:text-[#0000BE] group-hover:translate-x-0.5 transition-all"></i>
                </a>

                <a href="mailto:info@zalusa.com" class="group flex items-center gap-4 rounded-2xl bg-white border border-slate-200/80 px-4 py-3.5 zal-shadow-xs hover:border-slate-300 hover:zal-shadow-soft hover:-translate-y-0.5 transition-all duration-200">
                    <span class="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-[#0000BE] group-hover:text-white group-hover:border-[#0000BE] transition-colors duration-200"><i class="ph-bold ph-envelope text-[18px]"></i></span>
                    <div class="flex-1 min-w-0">
                        <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">E-posta</span>
                        <span class="block text-[15px] font-semibold text-slate-900 group-hover:text-[#0000BE] transition-colors break-all">info@zalusa.com</span>
                        <span class="block text-[12px] text-slate-400 mt-0.5">2 saat içinde dönüş</span>
                    </div>
                    <i class="ph-bold ph-arrow-right text-slate-300 group-hover:text-[#0000BE] group-hover:translate-x-0.5 transition-all"></i>
                </a>

                <a href="mailto:kurumsal@zalusa.com" class="group flex items-center gap-4 rounded-2xl bg-white border border-slate-200/80 px-4 py-3.5 zal-shadow-xs hover:border-slate-300 hover:zal-shadow-soft hover:-translate-y-0.5 transition-all duration-200">
                    <span class="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-[#0000BE] group-hover:text-white group-hover:border-[#0000BE] transition-colors duration-200"><i class="ph-bold ph-buildings text-[18px]"></i></span>
                    <div class="flex-1 min-w-0">
                        <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Kurumsal satış</span>
                        <span class="block text-[15px] font-semibold text-slate-900 group-hover:text-[#0000BE] transition-colors break-all">kurumsal@zalusa.com</span>
                        <span class="block text-[12px] text-slate-400 mt-0.5">aylık 500+ gönderi için</span>
                    </div>
                    <i class="ph-bold ph-arrow-right text-slate-300 group-hover:text-[#0000BE] group-hover:translate-x-0.5 transition-all"></i>
                </a>

                <a href="https://www.google.com/maps/search/?api=1&amp;query=Burak%20Bora%20Plaza%2C%20Orta%2C%20Marifet%20Sk.%20No%3A6%20Ofis%3A26%2034880%20Kartal%2F%C4%B0stanbul" target="_blank" rel="noopener noreferrer" class="group flex items-center gap-4 rounded-2xl bg-white border border-slate-200/80 px-4 py-3.5 zal-shadow-xs hover:border-slate-300 hover:zal-shadow-soft hover:-translate-y-0.5 transition-all duration-200">
                    <span class="inline-flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 group-hover:bg-[#0000BE] group-hover:text-white group-hover:border-[#0000BE] transition-colors duration-200"><i class="ph-bold ph-map-pin text-[18px]"></i></span>
                    <div class="flex-1 min-w-0">
                        <span class="block text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Ofis adresi</span>
                        <span class="block text-[15px] font-semibold text-slate-900 group-hover:text-[#0000BE] transition-colors">Burak Bora Plaza · Kartal/İstanbul</span>
                        <span class="block text-[12px] text-slate-400 mt-0.5">randevu ile ziyaret</span>
                    </div>
                    <i class="ph-bold ph-arrow-right text-slate-300 group-hover:text-[#0000BE] group-hover:translate-x-0.5 transition-all"></i>
                </a>

                <!-- Çalışma saatleri -->
                <div class="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-5 mt-2">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span class="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Çalışma saatleri</span>
                    </div>
                    <ul class="space-y-2.5 text-[13.5px]">
                        <li class="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                            <span class="inline-flex items-center gap-2 text-slate-700"><span class="w-1 h-1 rounded-full bg-emerald-500"></span> WhatsApp &amp; canlı destek</span>
                            <span class="font-semibold text-slate-900">7/24</span>
                        </li>
                        <li class="flex items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
                            <span class="inline-flex items-center gap-2 text-slate-700"><span class="w-1 h-1 rounded-full bg-emerald-500"></span> Telefon hattı</span>
                            <span class="font-semibold text-slate-900">Hafta içi 09:00–19:00</span>
                        </li>
                        <li class="flex items-center justify-between gap-2">
                            <span class="inline-flex items-center gap-2 text-slate-700"><span class="w-1 h-1 rounded-full bg-emerald-500"></span> E-posta</span>
                            <span class="font-semibold text-slate-900">SLA: 2 saat (mesai içi)</span>
                        </li>
                    </ul>
                </div>
            </div>

            <!-- ===== Right: Form card ===== -->
            <div class="lg:col-span-7">
                <div class="rounded-3xl bg-white border border-slate-200/80 zal-shadow-soft p-6 sm:p-8 md:p-10">
                    <header class="mb-6">
                        <h2 class="text-[26px] md:text-[30px] font-semibold tracking-tight text-slate-900">Mesaj gönder</h2>
                        <p class="text-[14px] text-slate-500 mt-1">Formu doldurun, ekibimiz <strong class="text-slate-700 font-semibold">en geç 2 saat</strong> içinde geri döner.</p>
                    </header>

                    
                    
                                        <form method="POST" class="space-y-5" id="contact-form">
                        <!-- Topic chips -->
                        <div>
                            <span class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-2.5">Konu <span class="text-red-500">*</span></span>
                            <div class="flex flex-wrap gap-2" id="topic-chips">
                                                                <button type="button"
                                    class="topic-chip inline-flex items-center gap-1.5 px-3 h-9 rounded-full border text-[12.5px] font-semibold transition-all bg-slate-900 text-white border-slate-900 zal-shadow-cta"
                                    data-value="genel"
                                    aria-pressed="true">
                                    <i class="ph-bold ph-chat-circle-dots text-[13px]"></i>
                                    Genel soru                                </button>
                                                                <button type="button"
                                    class="topic-chip inline-flex items-center gap-1.5 px-3 h-9 rounded-full border text-[12.5px] font-semibold transition-all bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                                    data-value="fiyat"
                                    aria-pressed="false">
                                    <i class="ph-bold ph-chart-line-up text-[13px]"></i>
                                    Fiyat teklifi                                </button>
                                                                <button type="button"
                                    class="topic-chip inline-flex items-center gap-1.5 px-3 h-9 rounded-full border text-[12.5px] font-semibold transition-all bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                                    data-value="kurumsal"
                                    aria-pressed="false">
                                    <i class="ph-bold ph-buildings text-[13px]"></i>
                                    Kurumsal                                </button>
                                                                <button type="button"
                                    class="topic-chip inline-flex items-center gap-1.5 px-3 h-9 rounded-full border text-[12.5px] font-semibold transition-all bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                                    data-value="entegrasyon"
                                    aria-pressed="false">
                                    <i class="ph-bold ph-plugs-connected text-[13px]"></i>
                                    Entegrasyon                                </button>
                                                                <button type="button"
                                    class="topic-chip inline-flex items-center gap-1.5 px-3 h-9 rounded-full border text-[12.5px] font-semibold transition-all bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                                    data-value="sikayet"
                                    aria-pressed="false">
                                    <i class="ph-bold ph-warning text-[13px]"></i>
                                    Şikayet                                </button>
                                                                <button type="button"
                                    class="topic-chip inline-flex items-center gap-1.5 px-3 h-9 rounded-full border text-[12.5px] font-semibold transition-all bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                                    data-value="basin"
                                    aria-pressed="false">
                                    <i class="ph-bold ph-newspaper text-[13px]"></i>
                                    Basın &amp; medya                                </button>
                                                            </div>
                            <input type="hidden" name="category" id="topic-input" value="genel">
                        </div>

                        <!-- Name + Company -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">Ad Soyad <span class="text-red-500">*</span></label>
                                <input type="text" name="name" required placeholder="Adınızı yazın"
                                    class="zal-input">
                            </div>
                            <div>
                                <label class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">Şirket <span class="text-slate-400 font-medium normal-case tracking-normal">opsiyonel</span></label>
                                <input type="text" name="tracking_code" placeholder="Şirket adı" class="zal-input">
                            </div>
                        </div>

                        <!-- Email + Phone -->
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">E-posta <span class="text-red-500">*</span></label>
                                <input type="email" name="email" required placeholder="ornek@firma.com" class="zal-input">
                            </div>
                            <div>
                                <label class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">Telefon <span class="text-slate-400 font-medium normal-case tracking-normal">opsiyonel</span></label>
                                <div class="zal-input-group">
                                    <span class="zal-input-prefix">🇹🇷 <span class="text-slate-600 font-semibold ml-1">+90</span></span>
                                    <input type="tel" name="phone" placeholder="555 555 55 55" class="zal-input zal-input-with-prefix">
                                </div>
                            </div>
                        </div>

                        <!-- Message -->
                        <div>
                            <label class="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 mb-1.5">Mesajınız <span class="text-red-500">*</span></label>
                            <textarea name="message" rows="5" required
                                placeholder="Sorununuzu veya talebinizi mümkün olduğunca detaylı yazın. Tracking numarası varsa eklemeniz dönüş süremizi hızlandırır."
                                class="zal-input zal-textarea"></textarea>
                            <p class="mt-2 text-[12px] text-slate-500 flex items-start gap-1.5">
                                <span class="text-[14px] leading-none">💡</span>
                                <span><strong class="text-slate-700 font-semibold">İpucu:</strong> Aktif gönderi sorunu için tracking numarasını ekleyin, doğrudan ilgili uzmana yönlendirilirsiniz.</span>
                            </p>
                        </div>

                        <!-- KVKK -->
                        <div class="rounded-xl border border-slate-200/80 bg-slate-50/60 px-4 py-3.5 flex items-start gap-2.5">
                            <input type="checkbox" id="kvkk" required
                                class="mt-0.5 w-4 h-4 shrink-0 rounded border-slate-300 text-[#0000BE] focus:ring-[#0000BE]">
                            <label for="kvkk" class="text-[12.5px] text-slate-600 leading-relaxed">
                                <a href="/kvkk-aydinlatma-metni" class="text-[#0000BE] font-semibold hover:underline">KVKK Aydınlatma Metni</a>
                                ile <a href="/gizlilik-politikasi" class="text-[#0000BE] font-semibold hover:underline">Gizlilik Politikası</a>'nı
                                okudum; kişisel verilerimin bu kapsamda işlenmesine ve formun gönderilmesine onay veriyorum.
                            </label>
                        </div>

                        <!-- Submit -->
                        <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-1">
                            <p class="text-[12.5px] text-slate-500 inline-flex items-center gap-1.5">
                                <i class="ph-bold ph-clock text-[14px] text-slate-400"></i>
                                Ortalama yanıt süresi: <strong class="text-slate-700 font-semibold">2 saat</strong>
                            </p>
                            <button type="submit"
                                class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 h-12 rounded-xl text-[14px] font-semibold bg-gradient-to-br from-[#4D4DF2] to-[#0000BE] hover:from-[#5959FF] hover:to-[#00009c] hover:-translate-y-0.5 text-white zal-shadow-cta transition-all">
                                Gönder
                                <i class="ph-bold ph-arrow-right text-[14px]"></i>
                            </button>
                        </div>
                    </form>
                                    </div>
            </div>
        </div>
    </div>
</section>

<!-- =========================================================
     4. FAQ — HIZLI CEVAP  ·  6 curated questions
     ========================================================= -->
<section class="py-16 md:py-24 bg-gradient-to-b from-white to-slate-50/60">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-10 md:mb-14">
            <span class="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.18em] text-amber-600 mb-3">
                <i class="ph-fill ph-lightning text-[14px]"></i>
                Hızlı Cevap
            </span>
            <h2 class="text-[32px] md:text-[42px] tracking-tight text-slate-900 leading-[1.05]">
                Yazmadan önce —
                <span class="zal-italic-accent text-[#0000BE]">belki cevap burada.</span>
            </h2>
            <p class="mt-3 text-[15px] md:text-[16px] text-slate-500">En çok sorulan 6 soru. Yanıtı burada bulamazsan formu doldur.</p>
        </div>

        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <details class="zal-faq-item group rounded-2xl bg-white border border-slate-200/80 zal-shadow-xs hover:zal-shadow-soft transition-all open" open>
                <summary class="cursor-pointer list-none px-5 py-4 md:px-6 md:py-5 flex items-start justify-between gap-4 select-none">
                    <span class="text-[14.5px] md:text-[15px] font-semibold text-slate-900 leading-snug">Aktif gönderim nerede? Nasıl takip ederim?</span>
                    <span class="zal-faq-toggle shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-500 transition-all">
                        <i class="ph-bold ph-plus text-[12px] zal-faq-plus"></i>
                        <i class="ph-bold ph-x text-[12px] zal-faq-x text-white"></i>
                    </span>
                </summary>
                <div class="px-5 pb-5 md:px-6 md:pb-6 -mt-1">
                    <p class="text-[13.5px] md:text-[14px] text-slate-600 leading-relaxed">Panelinize giriş yaparak <strong>Gönderiler</strong> sekmesinden tüm aktif gönderilerinizi anlık takip edebilirsiniz. Müşterinize iletilen tracking numarası ile de takip mümkün. Tracking durmuş görünüyorsa WhatsApp üzerinden bizimle iletişime geçin.</p>
                </div>
            </details>
                        <details class="zal-faq-item group rounded-2xl bg-white border border-slate-200/80 zal-shadow-xs hover:zal-shadow-soft transition-all ">
                <summary class="cursor-pointer list-none px-5 py-4 md:px-6 md:py-5 flex items-start justify-between gap-4 select-none">
                    <span class="text-[14.5px] md:text-[15px] font-semibold text-slate-900 leading-snug">Fiyat teklifi nasıl alırım?</span>
                    <span class="zal-faq-toggle shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-500 transition-all">
                        <i class="ph-bold ph-plus text-[12px] zal-faq-plus"></i>
                        <i class="ph-bold ph-x text-[12px] zal-faq-x text-white"></i>
                    </span>
                </summary>
                <div class="px-5 pb-5 md:px-6 md:pb-6 -mt-1">
                    <p class="text-[13.5px] md:text-[14px] text-slate-600 leading-relaxed">Fiyat hesaplama sayfasından paket bilgilerinizi girerek tüm taşıyıcılardan anında teklif alın. Aylık 500+ gönderi için kurumsal teklif almak istiyorsanız <a href="mailto:kurumsal@zalusa.com" class="text-[#0000BE] font-semibold hover:underline">kurumsal@zalusa.com</a> adresine yazın.</p>
                </div>
            </details>
                        <details class="zal-faq-item group rounded-2xl bg-white border border-slate-200/80 zal-shadow-xs hover:zal-shadow-soft transition-all ">
                <summary class="cursor-pointer list-none px-5 py-4 md:px-6 md:py-5 flex items-start justify-between gap-4 select-none">
                    <span class="text-[14.5px] md:text-[15px] font-semibold text-slate-900 leading-snug">Etsy / Shopify / Amazon entegrasyonu nasıl yapılır?</span>
                    <span class="zal-faq-toggle shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-500 transition-all">
                        <i class="ph-bold ph-plus text-[12px] zal-faq-plus"></i>
                        <i class="ph-bold ph-x text-[12px] zal-faq-x text-white"></i>
                    </span>
                </summary>
                <div class="px-5 pb-5 md:px-6 md:pb-6 -mt-1">
                    <p class="text-[13.5px] md:text-[14px] text-slate-600 leading-relaxed">Panelinizde <strong>Entegrasyonlar</strong> menüsünden mağaza hesabınızı bağlayın; siparişleriniz otomatik aktarılır, etiket basımı tek tıkla yapılır. Adım adım rehber için <a href="/entegrasyonlar" class="text-[#0000BE] font-semibold hover:underline">/entegrasyonlar</a> sayfasını inceleyin.</p>
                </div>
            </details>
                        <details class="zal-faq-item group rounded-2xl bg-white border border-slate-200/80 zal-shadow-xs hover:zal-shadow-soft transition-all ">
                <summary class="cursor-pointer list-none px-5 py-4 md:px-6 md:py-5 flex items-start justify-between gap-4 select-none">
                    <span class="text-[14.5px] md:text-[15px] font-semibold text-slate-900 leading-snug">ETGB beyanı nasıl oluşturulur?</span>
                    <span class="zal-faq-toggle shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-500 transition-all">
                        <i class="ph-bold ph-plus text-[12px] zal-faq-plus"></i>
                        <i class="ph-bold ph-x text-[12px] zal-faq-x text-white"></i>
                    </span>
                </summary>
                <div class="px-5 pb-5 md:px-6 md:pb-6 -mt-1">
                    <p class="text-[13.5px] md:text-[14px] text-slate-600 leading-relaxed">Mikro ihracat ETGB beyanları gönderi oluşturulurken otomatik üretilir; gümrük müşaviri ile süreç bizim tarafımızdan yönetilir. Manuel müdahale gerekmez, fatura ve ürün bilgilerini doğru girmeniz yeterli.</p>
                </div>
            </details>
                        <details class="zal-faq-item group rounded-2xl bg-white border border-slate-200/80 zal-shadow-xs hover:zal-shadow-soft transition-all ">
                <summary class="cursor-pointer list-none px-5 py-4 md:px-6 md:py-5 flex items-start justify-between gap-4 select-none">
                    <span class="text-[14.5px] md:text-[15px] font-semibold text-slate-900 leading-snug">Gönderim iptal ve iade nasıl yapılır?</span>
                    <span class="zal-faq-toggle shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-500 transition-all">
                        <i class="ph-bold ph-plus text-[12px] zal-faq-plus"></i>
                        <i class="ph-bold ph-x text-[12px] zal-faq-x text-white"></i>
                    </span>
                </summary>
                <div class="px-5 pb-5 md:px-6 md:pb-6 -mt-1">
                    <p class="text-[13.5px] md:text-[14px] text-slate-600 leading-relaxed">Henüz taşıyıcıya teslim edilmemiş gönderiler panel üzerinden tek tıkla iptal edilir. İade için karşı taraftan ürünü kabul ettirip yeni bir gönderi oluşturmanız gerekir; ekibimiz süreçte destek sağlar.</p>
                </div>
            </details>
                        <details class="zal-faq-item group rounded-2xl bg-white border border-slate-200/80 zal-shadow-xs hover:zal-shadow-soft transition-all ">
                <summary class="cursor-pointer list-none px-5 py-4 md:px-6 md:py-5 flex items-start justify-between gap-4 select-none">
                    <span class="text-[14.5px] md:text-[15px] font-semibold text-slate-900 leading-snug">Şikayet veya gecikme bildirimi nereye?</span>
                    <span class="zal-faq-toggle shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-50 border border-slate-200 text-slate-500 transition-all">
                        <i class="ph-bold ph-plus text-[12px] zal-faq-plus"></i>
                        <i class="ph-bold ph-x text-[12px] zal-faq-x text-white"></i>
                    </span>
                </summary>
                <div class="px-5 pb-5 md:px-6 md:pb-6 -mt-1">
                    <p class="text-[13.5px] md:text-[14px] text-slate-600 leading-relaxed">Acil konular için WhatsApp, dokümante etmek istediğiniz şikayetler için <a href="mailto:info@zalusa.com" class="text-[#0000BE] font-semibold hover:underline">info@zalusa.com</a>. Tüm şikayetler 2 iş günü içinde müşteri deneyimi ekibimiz tarafından yanıtlanır.</p>
                </div>
            </details>
                    </div>

        <div class="text-center mt-10">
            <a href="/sss" class="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 text-slate-900 text-[14px] font-semibold zal-shadow-xs transition-all">
                Tüm SSS'leri görüntüle
                <i class="ph-bold ph-arrow-right text-[13px]"></i>
            </a>
        </div>
    </div>
</section>

<!-- =========================================================
     5. LOCATION + MAP  ·  Office + transport guide
     ========================================================= -->
<section class="py-16 md:py-24 bg-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 md:mb-10">
            <div class="max-w-2xl">
                <span class="inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.18em] text-rose-600 mb-3">
                    <i class="ph-fill ph-map-pin text-[14px]"></i>
                    Konum
                </span>
                <h2 class="text-[32px] md:text-[42px] tracking-tight text-slate-900 leading-[1.05]">
                    Ofisimize <span class="zal-italic-accent text-[#0000BE]">gelin.</span>
                </h2>
                <p class="mt-3 text-[15px] md:text-[16px] text-slate-500 leading-relaxed">
                    Randevu ile ziyaret edebilirsiniz. Burak Bora Plaza, Kartal'ın merkezinde — metro ve marmaray ile kolay ulaşım.
                </p>
            </div>
            <a href="https://www.google.com/maps/search/?api=1&amp;query=Burak%20Bora%20Plaza%2C%20Orta%2C%20Marifet%20Sk.%20No%3A6%20Ofis%3A26%2034880%20Kartal%2F%C4%B0stanbul" target="_blank" rel="noopener noreferrer"
                class="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 h-11 rounded-full bg-white border border-slate-200 hover:border-slate-300 hover:-translate-y-0.5 text-slate-900 text-[13.5px] font-semibold zal-shadow-xs transition-all">
                <i class="ph-bold ph-map-trifold text-[15px]"></i>
                Google Haritalar'da aç
                <i class="ph-bold ph-arrow-up-right text-[12px]"></i>
            </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 md:gap-6 items-stretch">
            <!-- Map -->
            <div class="lg:col-span-7 relative rounded-3xl overflow-hidden border border-slate-200/80 zal-shadow-soft bg-slate-100 min-h-[380px]">
                <iframe title="Zalusa ofis konumu" src="https://www.google.com/maps?q=Burak%20Bora%20Plaza%2C%20Orta%2C%20Marifet%20Sk.%20No%3A6%20Ofis%3A26%2034880%20Kartal%2F%C4%B0stanbul&amp;hl=tr&amp;z=16&amp;output=embed"
                    width="100%" height="100%" class="absolute inset-0 w-full h-full border-0 grayscale-[0.1]" allowfullscreen=""
                    loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>

                <!-- Status chip -->
                <div class="absolute top-4 left-4 z-10 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur border border-slate-200 zal-shadow-xs text-[12px] font-semibold text-slate-700">
                    <span class="relative flex w-2 h-2">
                        <span class="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-60"></span>
                        <span class="relative inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                    </span>
                    Şu an açık
                </div>

                <!-- Address card overlay -->
                <div class="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs z-10 rounded-2xl bg-white/95 backdrop-blur border border-slate-200 zal-shadow-soft p-4">
                    <div class="flex items-start gap-3">
                        <span class="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#0000BE] text-white shrink-0">
                            <i class="ph-fill ph-map-pin text-[16px]"></i>
                        </span>
                        <div class="min-w-0">
                            <p class="text-[13.5px] font-semibold text-slate-900 leading-snug">Zalusa Lojistik</p>
                            <p class="text-[12px] text-slate-500 leading-relaxed mt-0.5">Burak Bora Plaza · Orta Mh.<br>Marifet Sk. No:6 Ofis:26<br>34880 Kartal/İstanbul</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Transport guide -->
            <aside class="lg:col-span-5 rounded-3xl border border-slate-200/80 bg-white zal-shadow-soft p-6 md:p-7">
                <header class="mb-5">
                    <h3 class="text-[20px] md:text-[22px] font-semibold tracking-tight text-slate-900">Nasıl gelirsiniz?</h3>
                    <p class="text-[13.5px] text-slate-500 mt-0.5">Kartal merkezinde — ulaşım kolay.</p>
                </header>
                <ul class="space-y-4">
                                        <li class="flex items-start gap-3.5">
                        <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white shrink-0">
                            <i class="ph-fill ph-train text-[17px]"></i>
                        </span>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-500">METRO</span>
                                                                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-[#0000BE]/8 text-[#0000BE] text-[10.5px] font-semibold">5 dk yürüyüş</span>
                                                            </div>
                            <p class="text-[14px] font-semibold text-slate-900 leading-snug mt-0.5">M4 Kartal istasyonu</p>
                            <p class="text-[12.5px] text-slate-500 leading-relaxed mt-1">Kadıköy'den 30 dk; M4 Tavşantepe yönü.</p>
                        </div>
                    </li>
                                        <li class="flex items-start gap-3.5">
                        <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-600 text-white shrink-0">
                            <i class="ph-fill ph-train-simple text-[17px]"></i>
                        </span>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-500">MARMARAY</span>
                                                                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-[#0000BE]/8 text-[#0000BE] text-[10.5px] font-semibold">8 dk yürüyüş</span>
                                                            </div>
                            <p class="text-[14px] font-semibold text-slate-900 leading-snug mt-0.5">Kartal istasyonu</p>
                            <p class="text-[12.5px] text-slate-500 leading-relaxed mt-1">Halkalı / Gebze hattı; Avrupa yakasından direkt erişim.</p>
                        </div>
                    </li>
                                        <li class="flex items-start gap-3.5">
                        <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-rose-600 text-white shrink-0">
                            <i class="ph-fill ph-car-profile text-[17px]"></i>
                        </span>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-500">ARAÇ</span>
                                                                <span class="inline-flex items-center px-2 py-0.5 rounded-md bg-[#0000BE]/8 text-[#0000BE] text-[10.5px] font-semibold">Kartal sapağı</span>
                                                            </div>
                            <p class="text-[14px] font-semibold text-slate-900 leading-snug mt-0.5">D-100 / E-5 üzerinden</p>
                            <p class="text-[12.5px] text-slate-500 leading-relaxed mt-1">Bina otoparkı ücretsiz · 30 araç kapasiteli.</p>
                        </div>
                    </li>
                                        <li class="flex items-start gap-3.5">
                        <span class="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500 text-white shrink-0">
                            <i class="ph-fill ph-calendar-check text-[17px]"></i>
                        </span>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <span class="text-[10.5px] font-bold uppercase tracking-[0.14em] text-slate-500">RANDEVU</span>
                                                            </div>
                            <p class="text-[14px] font-semibold text-slate-900 leading-snug mt-0.5">Ziyaret öncesi randevu</p>
                            <p class="text-[12.5px] text-slate-500 leading-relaxed mt-1">Yoğun saatlerde bekleme olmaması için lütfen <a href="https://wa.me/908502551840" class="text-[#0000BE] font-semibold hover:underline" target="_blank" rel="noopener">randevu alın</a>.</p>
                        </div>
                    </li>
                                    </ul>
            </aside>
        </div>
    </div>
</section>

<!-- =========================================================
     6. SOCIAL CTA  ·  Dark strip
     ========================================================= -->
<section class="py-12 md:py-16 bg-slate-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl bg-slate-900 px-6 py-6 md:px-10 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-5 zal-shadow-soft">
            <div class="text-center md:text-left">
                <h3 class="text-[20px] md:text-[24px] font-semibold tracking-tight text-white leading-tight">Sosyal medyada da takip edin.</h3>
                <p class="text-[13.5px] text-slate-400 mt-1">Sektör güncellemeleri, yeni ülke duyuruları, dropshipping ipuçları ve daha fazlası.</p>
            </div>
            <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 md:gap-3">
                <a href="https://www.instagram.com/zalusacom" target="_blank" rel="noopener noreferrer"
                    class="inline-flex items-center justify-center gap-2 px-4 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-[13px] font-semibold transition-all hover:-translate-y-0.5">
                    <i class="ph-fill ph-instagram-logo text-[15px]"></i> Instagram
                </a>
                <a href="https://www.linkedin.com/company/zalusa/" target="_blank" rel="noopener noreferrer"
                    class="inline-flex items-center justify-center gap-2 px-4 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-[13px] font-semibold transition-all hover:-translate-y-0.5">
                    <i class="ph-fill ph-linkedin-logo text-[15px]"></i> LinkedIn
                </a>
                <a href="https://x.com/zalusacom" target="_blank" rel="noopener noreferrer"
                    class="inline-flex items-center justify-center gap-2 px-4 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-[13px] font-semibold transition-all hover:-translate-y-0.5">
                    <i class="ph-fill ph-x-logo text-[15px]"></i> X / Twitter
                </a>
                <a href="https://www.youtube.com/@zalusa" target="_blank" rel="noopener noreferrer"
                    class="inline-flex items-center justify-center gap-2 px-4 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-[13px] font-semibold transition-all hover:-translate-y-0.5">
                    <i class="ph-fill ph-youtube-logo text-[15px]"></i> YouTube
                </a>
            </div>
        </div>
    </div>
</section>

<!-- =========================================================
     Page-scoped CSS for form inputs + FAQ toggle
     ========================================================= -->
<style>
    .zal-input {
        width: 100%;
        height: 3rem;
        border-radius: 0.75rem;
        border: 1px solid #E2E8F0;
        background-color: #F8FAFC;
        padding: 0 1rem;
        font-size: 14px;
        color: #0F172A;
        transition: border-color .2s, box-shadow .2s, background-color .2s;
        outline: none;
    }
    .zal-input::placeholder { color: #94A3B8; }
    .zal-input:focus {
        border-color: #0000BE;
        background-color: #fff;
        box-shadow: 0 0 0 4px rgba(0, 0, 190, 0.10);
    }
    .zal-textarea { height: auto; padding: 0.9rem 1rem; resize: vertical; min-height: 130px; line-height: 1.5; }

    .zal-input-group { position: relative; display: flex; align-items: stretch; }
    .zal-input-prefix {
        display: inline-flex; align-items: center; gap: .25rem;
        padding-left: 1rem; padding-right: .5rem;
        font-size: 14px;
        background-color: #F8FAFC;
        border: 1px solid #E2E8F0;
        border-right: 0;
        border-radius: 0.75rem 0 0 0.75rem;
        white-space: nowrap;
    }
    .zal-input-with-prefix { border-top-left-radius: 0; border-bottom-left-radius: 0; border-left: 0; }
    .zal-input-group:focus-within .zal-input-prefix { border-color: #0000BE; background-color: #fff; }

    /* FAQ toggle states */
    .zal-faq-item .zal-faq-x { display: none; }
    .zal-faq-item[open] .zal-faq-plus { display: none; }
    .zal-faq-item[open] .zal-faq-x { display: inline-block; }
    .zal-faq-item[open] .zal-faq-toggle { background-color: #0000BE; border-color: #0000BE; color: #fff; }
    .zal-faq-item[open] { border-color: rgba(0,0,190,0.35); }
    .zal-faq-item summary::-webkit-details-marker { display: none; }
</style>

`;
