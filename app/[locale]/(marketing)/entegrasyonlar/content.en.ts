// İngilizce sürüm — ceviri.py ile üretildi: markup birebir aynı, yalnızca metin düğümleri çevrildi.
export const HTML_EN = `<main class="relative bg-white overflow-hidden integration-page-home">
    <section class="integration-hero pt-8 md:pt-12 pb-10 md:pb-14 overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav class="mb-5 md:mb-6" aria-label="Breadcrumb">
    <ol class="flex items-center gap-2 md:gap-2.5 text-[13px] md:text-sm flex-nowrap" itemscope itemtype="https://schema.org/BreadcrumbList">
                
        <li class="flex items-center shrink-0"
            itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <meta itemprop="position" content="1">

                            <a href="/en"
                   class="inline-flex items-center gap-1.5 text-slate-400 hover:text-[#0000BE] transition"
                   itemprop="item">
                    <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
                    </svg>
                    <span class="hidden md:inline" itemprop="name">Home</span>
                </a>
                    </li>
                        <li class="flex items-center text-slate-300 shrink-0" aria-hidden="true">/</li>
        
        <li class="flex items-center min-w-0"
            itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
            <meta itemprop="position" content="2">

                            <span class="text-slate-600 font-semibold truncate" itemprop="name">Integrations</span>
                <meta itemprop="item" content="/entegrasyonlar">
                    </li>
            </ol>
</nav>

            <div class="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-7 md:gap-9 items-start">
                <div class="space-y-5">
                    <span class="inline-flex items-center gap-2 rounded-full border border-[#0000BE]/20 bg-[#0000BE]/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#0000BE]">
                        Operations Orchestration Layer
                    </span>
                    <h1 class="text-4xl md:text-6xl font-semibold leading-[1.04] tracking-tight text-slate-900">
                        Manage your integrations
                        <span class="inline-block bg-clip-text text-transparent bg-gradient-to-r from-[#0000BE] to-[#22c55e]">in a single workflow</span>
                         
                    </h1>
                    <p class="text-base md:text-lg text-slate-600 max-w-3xl leading-relaxed">
                        Pazaryerleri, e-ticaret altyapıları ve muhasebe bağlantıları için ayrı çalışma alanları oluştur.
                        Ekiplerin kategori bazlı ilerlesin, akış tek panelde birleşsin.
                    </p>
                    <div class="flex flex-wrap gap-3">
                        <a href="#pazaryerleri" class="inline-flex items-center justify-center px-6 h-10 md:h-12 rounded-lg bg-[#0000BE] text-white font-semibold text-sm hover:bg-[#00009c] cursor-pointer transition shadow-lg shadow-blue-900/20">
                            Jump to Sections
                        </a>
                        <a href="/en/iletisim" class="inline-flex items-center justify-center px-6 h-10 md:h-12 rounded-lg border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 cursor-pointer transition">
                            Book a Technical Call
                        </a>
                    </div>
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div class="hero-kpi-card"><span>Group</span><strong>3</strong></div>
                        <div class="hero-kpi-card"><span>Connection</span><strong>10+</strong></div>
                        <div class="hero-kpi-card"><span>Setup</span><strong>2 min</strong></div>
                        <div class="hero-kpi-card"><span>Support</span><strong>7/24</strong></div>
                    </div>
                    <div class="integration-logo-band">
                        <img loading="lazy" decoding="async" src="/assets/etsy.png" alt="Etsy logosu" class="h-7 w-auto object-contain">
                        <img loading="lazy" decoding="async" src="/assets/shopify.png" alt="Shopify logosu" class="h-7 w-auto object-contain">
                        <img loading="lazy" decoding="async" src="/assets/woocommerce.png" alt="WooCommerce logosu" class="h-7 w-auto object-contain">
                        <img loading="lazy" decoding="async" src="/assets/amazon.png" alt="Amazon logosu" class="h-6 w-auto object-contain">
                        <img loading="lazy" decoding="async" src="/assets/aliexp.png" alt="AliExpress logosu" class="h-6 w-auto object-contain">
                        <img loading="lazy" decoding="async" src="/assets/wish.png" alt="Wish logosu" class="h-6 w-auto object-contain">
                    </div>
                </div>

                <aside class="command-board">
                    <h2 class="text-xl font-semibold text-slate-900">Live Integration Board</h2>
                    <p class="mt-1 text-sm text-slate-500">Operations view grouped by category</p>

                    <a href="#pazaryerleri" class="command-row">
                        <span class="command-row-icon bg-amber-100 text-amber-700">P</span>
                        <span class="command-row-content">
                            <strong>Marketplaces</strong>
                            <small>Amazon, Etsy, AliExpress, Wish</small>
                        </span>
                        <span class="command-row-meta">4 ID</span>
                    </a>
                    <a href="#e-ticaret" class="command-row">
                        <span class="command-row-icon bg-indigo-100 text-indigo-700">E</span>
                        <span class="command-row-content">
                            <strong>E-Commerce</strong>
                            <small>Shopify, WooCommerce, Özel API</small>
                        </span>
                        <span class="command-row-meta">3 ID</span>
                    </a>
                    <a href="#muhasebe" class="command-row">
                        <span class="command-row-icon bg-emerald-100 text-emerald-700">M</span>
                        <span class="command-row-content">
                            <strong>Accounting</strong>
                            <small>Paraşüt, Logo, Mikro</small>
                        </span>
                        <span class="command-row-meta">3 ID</span>
                    </a>

                    <div class="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                        <p class="text-xs font-semibold uppercase tracking-wide text-slate-400">Recommended Order</p>
                        <p class="mt-1 text-sm text-slate-700">Marketplaces → E-Commerce → Accounting</p>
                    </div>
                </aside>
            </div>
        </div>
    </section>

    <section class="py-10 md:py-16 bg-slate-50 relative overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <nav data-integration-nav class="integration-nav-shell integration-nav-sticky integration-anchor-nav z-40 mb-7 md:mb-9" aria-label="Entegrasyon Bölümleri">
                <div class="integration-nav-track">
                    <a href="#pazaryerleri" class="integration-nav-link is-active">Marketplaces</a>
                    <a href="#e-ticaret" class="integration-nav-link">E-Commerce</a>
                    <a href="#muhasebe" class="integration-nav-link">Accounting</a>
                </div>
            </nav>

                            <section id="pazaryerleri" class="integration-bucket scroll-mt-44 md:scroll-mt-40 mb-8 md:mb-10">
                    <header class="integration-bucket-head">
                        <span class="integration-badge">Marketplaces</span>
                        <h2 class="integration-bucket-title">Marketplace Integrations</h2>
                        <p class="integration-bucket-desc">Amazon, Etsy, AliExpress ve Wish mağazalarını tek panelde yönetin. Sipariş, stok ve gönderi verisini anlık senkronize edin.</p>
                        <p class="integration-bucket-id">Group ID: marketplaces</p>
                    </header>

                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                                                    <article id="pazaryeri-amazon" class="integration-tile">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="integration-logo-wrap">
                                                                                    <img src="/assets/amazon.png" alt="Amazon entegrasyon logosu" class="h-8 w-auto object-contain" loading="lazy">
                                                                            </div>
                                    <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Active                                    </span>
                                </div>

                                <h3 class="mt-3 text-lg font-semibold text-slate-900">Amazon</h3>
                                <p class="text-xs text-slate-500 mt-0.5">Workspace ID: marketplace-amazon</p>
                                <p class="mt-3 text-sm text-slate-600 leading-relaxed">Automatically matches Amazon orders, shipping labels and tracking numbers.</p>

                                                                    <div class="mt-4 flex flex-wrap gap-2">
                                                                                    <span class="integration-tag">Orders</span>
                                                                                    <span class="integration-tag">FBA/FBM</span>
                                                                                    <span class="integration-tag">Tracking</span>
                                                                            </div>
                                
                                                                    <ul class="mt-4 space-y-2">
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Automatic shipping work orders based on order status</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Manage multiple marketplace stores from one panel</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Tracking and customer notification flow during returns</span>
                                            </li>
                                                                            </ul>
                                                            </article>
                                                    <article id="pazaryeri-etsy" class="integration-tile">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="integration-logo-wrap">
                                                                                    <img src="/assets/etsy.png" alt="Etsy entegrasyon logosu" class="h-8 w-auto object-contain" loading="lazy">
                                                                            </div>
                                    <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Active                                    </span>
                                </div>

                                <h3 class="mt-3 text-lg font-semibold text-slate-900">Etsy</h3>
                                <p class="text-xs text-slate-500 mt-0.5">Workspace ID: marketplace-etsy</p>
                                <p class="mt-3 text-sm text-slate-600 leading-relaxed">Collects orders from Etsy stores and speeds up labelling and dispatch planning.</p>

                                                                    <div class="mt-4 flex flex-wrap gap-2">
                                                                                    <span class="integration-tag">Orders</span>
                                                                                    <span class="integration-tag">Labels</span>
                                                                                    <span class="integration-tag">Automation</span>
                                                                            </div>
                                
                                                                    <ul class="mt-4 space-y-2">
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Store-level order filtering and label grouping</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Automatic selection by destination country and carrier service</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Shipment history and performance tracking inside the panel</span>
                                            </li>
                                                                            </ul>
                                                            </article>
                                                    <article id="pazaryeri-aliexpress" class="integration-tile">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="integration-logo-wrap">
                                                                                    <img src="/assets/aliexp.png" alt="AliExpress entegrasyon logosu" class="h-8 w-auto object-contain" loading="lazy">
                                                                            </div>
                                    <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Active                                    </span>
                                </div>

                                <h3 class="mt-3 text-lg font-semibold text-slate-900">AliExpress</h3>
                                <p class="text-xs text-slate-500 mt-0.5">Workspace ID: marketplace-aliexpress</p>
                                <p class="mt-3 text-sm text-slate-600 leading-relaxed">Unifies the AliExpress order flow and makes bulk processing easy for operations teams.</p>

                                                                    <div class="mt-4 flex flex-wrap gap-2">
                                                                                    <span class="integration-tag">Bulk Actions</span>
                                                                                    <span class="integration-tag">Tracking</span>
                                                                                    <span class="integration-tag">Reporting</span>
                                                                            </div>
                                
                                                                    <ul class="mt-4 space-y-2">
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Bulk order intake and fast dispatch list generation</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Country-level delivery time and cost visibility</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Operational efficiency analysis with regular reports</span>
                                            </li>
                                                                            </ul>
                                                            </article>
                                                    <article id="pazaryeri-wish" class="integration-tile">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="integration-logo-wrap">
                                                                                    <img src="/assets/wish.png" alt="Wish entegrasyon logosu" class="h-8 w-auto object-contain" loading="lazy">
                                                                            </div>
                                    <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Active                                    </span>
                                </div>

                                <h3 class="mt-3 text-lg font-semibold text-slate-900">Wish</h3>
                                <p class="text-xs text-slate-500 mt-0.5">Workspace ID: marketplace-wish</p>
                                <p class="mt-3 text-sm text-slate-600 leading-relaxed">Processes Wish orders against dispatch rules to reduce the error rate.</p>

                                                                    <div class="mt-4 flex flex-wrap gap-2">
                                                                                    <span class="integration-tag">Rules</span>
                                                                                    <span class="integration-tag">Error Reduction</span>
                                                                                    <span class="integration-tag">Data Flow</span>
                                                                            </div>
                                
                                                                    <ul class="mt-4 space-y-2">
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Automatic shipment ordering by order priority</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Missing-data checks that prevent operational errors</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Shipping and delivery data on a single screen</span>
                                            </li>
                                                                            </ul>
                                                            </article>
                                            </div>
                </section>
                            <section id="e-ticaret" class="integration-bucket scroll-mt-44 md:scroll-mt-40 mb-8 md:mb-10">
                    <header class="integration-bucket-head">
                        <span class="integration-badge">E-Commerce</span>
                        <h2 class="integration-bucket-title">E-Commerce Platform Integrations</h2>
                        <p class="integration-bucket-desc">Shopify ve WooCommerce mağazalarınızı bağlayın. Sipariş, stok ve gönderi verilerini operasyon ekibi için merkezi hale getirin.</p>
                        <p class="integration-bucket-id">Group ID: e-commerce</p>
                    </header>

                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                                                    <article id="eticaret-shopify" class="integration-tile">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="integration-logo-wrap">
                                                                                    <img src="/assets/shopify.png" alt="Shopify entegrasyon logosu" class="h-8 w-auto object-contain" loading="lazy">
                                                                            </div>
                                    <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Active                                    </span>
                                </div>

                                <h3 class="mt-3 text-lg font-semibold text-slate-900">Shopify</h3>
                                <p class="text-xs text-slate-500 mt-0.5">Workspace ID: ecommerce-shopify</p>
                                <p class="mt-3 text-sm text-slate-600 leading-relaxed">Moves Shopify order data in real time so you can manage shipping from one panel.</p>

                                                                    <div class="mt-4 flex flex-wrap gap-2">
                                                                                    <span class="integration-tag">Checkout</span>
                                                                                    <span class="integration-tag">Inventory</span>
                                                                                    <span class="integration-tag">Shipping</span>
                                                                            </div>
                                
                                                                    <ul class="mt-4 space-y-2">
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>End-to-end automation from order to shipment</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Mapping inventory and dispatch data to your operation</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Central reporting across multiple stores</span>
                                            </li>
                                                                            </ul>
                                                            </article>
                                                    <article id="eticaret-woocommerce" class="integration-tile">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="integration-logo-wrap">
                                                                                    <img src="/assets/woocommerce.png" alt="WooCommerce entegrasyon logosu" class="h-8 w-auto object-contain" loading="lazy">
                                                                            </div>
                                    <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Active                                    </span>
                                </div>

                                <h3 class="mt-3 text-lg font-semibold text-slate-900">WooCommerce</h3>
                                <p class="text-xs text-slate-500 mt-0.5">Workspace ID: ecommerce-woocommerce</p>
                                <p class="mt-3 text-sm text-slate-600 leading-relaxed">Works in sync with your WooCommerce setup and simplifies order-to-delivery.</p>

                                                                    <div class="mt-4 flex flex-wrap gap-2">
                                                                                    <span class="integration-tag">WordPress</span>
                                                                                    <span class="integration-tag">Orders</span>
                                                                                    <span class="integration-tag">Tracking</span>
                                                                            </div>
                                
                                                                    <ul class="mt-4 space-y-2">
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Linking WooCommerce order statuses to carrier actions</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Generating tracking data for customer notification messages</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Shortening technical setup time with fast onboarding</span>
                                            </li>
                                                                            </ul>
                                                            </article>
                                                    <article id="eticaret-ozel-api" class="integration-tile">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="integration-logo-wrap">
                                                                                    <span class="integration-text-logo border bg-indigo-100 text-indigo-700 border-indigo-200">
                                                API                                            </span>
                                                                            </div>
                                    <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap bg-blue-50 text-blue-700 border-blue-200">
                                        Supported                                    </span>
                                </div>

                                <h3 class="mt-3 text-lg font-semibold text-slate-900">Custom E-Commerce API</h3>
                                <p class="text-xs text-slate-500 mt-0.5">Workspace ID: ecommerce-custom-api</p>
                                <p class="mt-3 text-sm text-slate-600 leading-relaxed">Connect your own stack through webhook and API layers for full control.</p>

                                                                    <div class="mt-4 flex flex-wrap gap-2">
                                                                                    <span class="integration-tag">Webhook</span>
                                                                                    <span class="integration-tag">Custom</span>
                                                                                    <span class="integration-tag">Flexible</span>
                                                                            </div>
                                
                                                                    <ul class="mt-4 space-y-2">
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Real-time monitoring and triggering of order events</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Custom field mapping support based on business rules</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>A documentation-first integration plan for developer teams</span>
                                            </li>
                                                                            </ul>
                                                            </article>
                                            </div>
                </section>
                            <section id="muhasebe" class="integration-bucket scroll-mt-44 md:scroll-mt-40 mb-8 md:mb-10">
                    <header class="integration-bucket-head">
                        <span class="integration-badge">Accounting</span>
                        <h2 class="integration-bucket-title">Accounting Integrations</h2>
                        <p class="integration-bucket-desc">Sipariş ve kargo maliyetlerinizi muhasebe süreçlerine bağlayın. E-fatura ve finansal raporlama için düzenli veri akışı oluşturun.</p>
                        <p class="integration-bucket-id">Group ID: accounting</p>
                    </header>

                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
                                                    <article id="muhasebe-parasut" class="integration-tile">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="integration-logo-wrap">
                                                                                    <span class="integration-text-logo border bg-emerald-100 text-emerald-700 border-emerald-200">
                                                P                                            </span>
                                                                            </div>
                                    <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap bg-amber-50 text-amber-700 border-amber-200">
                                        Pilot                                    </span>
                                </div>

                                <h3 class="mt-3 text-lg font-semibold text-slate-900">Paraşüt</h3>
                                <p class="text-xs text-slate-500 mt-0.5">Workspace ID: accounting-parasut</p>
                                <p class="mt-3 text-sm text-slate-600 leading-relaxed">Links order and shipping costs to financial records for operational visibility.</p>

                                                                    <div class="mt-4 flex flex-wrap gap-2">
                                                                                    <span class="integration-tag">E-Invoice</span>
                                                                                    <span class="integration-tag">Cost</span>
                                                                                    <span class="integration-tag">Reconciliation</span>
                                                                            </div>
                                
                                                                    <ul class="mt-4 space-y-2">
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Linking shipping costs to accounting records per order</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Improving logistics visibility in periodic expense reports</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Producing consistent data output for reconciliation</span>
                                            </li>
                                                                            </ul>
                                                            </article>
                                                    <article id="muhasebe-logo" class="integration-tile">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="integration-logo-wrap">
                                                                                    <span class="integration-text-logo border bg-cyan-100 text-cyan-700 border-cyan-200">
                                                L                                            </span>
                                                                            </div>
                                    <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap bg-amber-50 text-amber-700 border-amber-200">
                                        Pilot                                    </span>
                                </div>

                                <h3 class="mt-3 text-lg font-semibold text-slate-900">Logo Yazılım</h3>
                                <p class="text-xs text-slate-500 mt-0.5">Workspace ID: accounting-logo</p>
                                <p class="mt-3 text-sm text-slate-600 leading-relaxed">Builds an order-to-finance bridge for teams on Logo ERP, cutting manual work.</p>

                                                                    <div class="mt-4 flex flex-wrap gap-2">
                                                                                    <span class="integration-tag">ERP</span>
                                                                                    <span class="integration-tag">Reporting</span>
                                                                                    <span class="integration-tag">Process</span>
                                                                            </div>
                                
                                                                    <ul class="mt-4 space-y-2">
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Regular transfer of order and shipment data to the ERP</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Operational cost breakdown for account reconciliation</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Faster period-close support for finance teams</span>
                                            </li>
                                                                            </ul>
                                                            </article>
                                                    <article id="muhasebe-mikro" class="integration-tile">
                                <div class="flex items-center justify-between gap-3">
                                    <div class="integration-logo-wrap">
                                                                                    <span class="integration-text-logo border bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200">
                                                M                                            </span>
                                                                            </div>
                                    <span class="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold whitespace-nowrap bg-amber-50 text-amber-700 border-amber-200">
                                        Pilot                                    </span>
                                </div>

                                <h3 class="mt-3 text-lg font-semibold text-slate-900">Mikro Software</h3>
                                <p class="text-xs text-slate-500 mt-0.5">Workspace ID: accounting-mikro</p>
                                <p class="mt-3 text-sm text-slate-600 leading-relaxed">Aligns order and logistics costs with financial records for teams using Mikro.</p>

                                                                    <div class="mt-4 flex flex-wrap gap-2">
                                                                                    <span class="integration-tag">ERP</span>
                                                                                    <span class="integration-tag">Accounting</span>
                                                                                    <span class="integration-tag">Transfer</span>
                                                                            </div>
                                
                                                                    <ul class="mt-4 space-y-2">
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Standardising cost fields per transaction</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>Reports in a format suited to the accounting team</span>
                                            </li>
                                                                                    <li class="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                                                <span class="integration-dot mt-1.5" aria-hidden="true"></span>
                                                <span>An automation approach that reduces repetitive manual entry</span>
                                            </li>
                                                                            </ul>
                                                            </article>
                                            </div>
                </section>
                    </div>
    </section>

    <section class="py-10 md:py-14 bg-white overflow-hidden">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div class="space-y-6">
                    <h2 class="text-[32px] md:text-[42px] font-semibold tracking-tight text-slate-900">Integration Rollout Plan</h2>
                    <p class="text-base md:text-lg text-slate-500 leading-relaxed max-w-xl">
                        Önce sipariş kanallarını merkezileştir, ardından e-ticaret akışını standardize et ve son adımda muhasebe tarafını devreye al.
                    </p>
                    <div class="space-y-4">
                        <div class="flow-step">
                            <span class="flow-step-no">1</span>
                            <div>
                                <h3 class="flow-step-title">Connect Marketplaces</h3>
                                <p class="flow-step-text">Bring Amazon, Etsy, AliExpress and Wish orders into one panel.</p>
                            </div>
                        </div>
                        <div class="flow-step">
                            <span class="flow-step-no">2</span>
                            <div>
                                <h3 class="flow-step-title">Sync Your E-Commerce Channel</h3>
                                <p class="flow-step-text">Automate Shopify and WooCommerce orders against your operational rules.</p>
                            </div>
                        </div>
                        <div class="flow-step">
                            <span class="flow-step-no">3</span>
                            <div>
                                <h3 class="flow-step-title">Enable the Accounting Flow</h3>
                                <p class="flow-step-text">Move income and expense fields into your accounting system and cut reconciliation time.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="relative">
                    <div class="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-5 md:p-7">
                        <h3 class="text-2xl font-semibold text-[#0000BE] mb-5 text-center">Operations Control Card</h3>
                        <div class="space-y-4">
                            <div class="control-row">
                                <span class="control-label">Active Integrations</span>
                                <strong class="control-value">10+</strong>
                            </div>
                            <div class="control-row">
                                <span class="control-label">Daily Order Flow</span>
                                <strong class="control-value">Real time</strong>
                            </div>
                            <div class="control-row">
                                <span class="control-label">Accounting Data Transfer</span>
                                <strong class="control-value">Scheduled</strong>
                            </div>
                            <div class="control-row">
                                <span class="control-label">Error Rate</span>
                                <strong class="control-value text-emerald-600">Low</strong>
                            </div>
                        </div>
                        <a href="/en/iletisim" class="mt-6 w-full inline-flex items-center justify-center px-6 h-10 md:h-12 bg-gradient-to-br from-[#4D4DF2] to-[#0000BE] hover:from-[#5959FF] hover:to-[#00009c] hover:-translate-y-0.5 text-white font-semibold rounded-lg cursor-pointer transition-all shadow-lg shadow-blue-900/20">
                            Start Planning
                        </a>
                    </div>
                    <div class="absolute -z-10 top-6 left-6 right-6 bottom-0 bg-[#0000BE]/10 blur-2xl rounded-full"></div>
                </div>
            </div>
        </div>
    </section>

    <section class="py-8 md:py-12 bg-slate-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="rounded-3xl border border-slate-200 bg-gradient-to-r from-[#0000BE] to-[#2a2acc] p-6 md:p-8 text-white shadow-lg shadow-[#0000BE]/25">
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div class="max-w-2xl">
                        <h2 class="text-2xl md:text-3xl font-semibold leading-tight">Let's plan your integration rollout together</h2>
                        <p class="mt-2 text-blue-50 text-sm md:text-base">We'll build an integration order and technical setup plan tailored to your channels and stack.</p>
                    </div>
                    <div class="flex flex-wrap gap-3">
                        <a href="/en/iletisim" class="inline-flex items-center justify-center rounded-lg bg-white px-5 h-10 md:h-12 text-sm font-semibold text-[#0000BE] hover:bg-blue-50 transition">Request a Demo</a>
                        <a href="/en/yurtdisi-kargo-fiyat-hesaplama" class="inline-flex items-center justify-center rounded-lg border border-white/40 px-5 h-10 md:h-12 text-sm font-semibold text-white hover:bg-white/10 cursor-pointer transition">Calculate Price</a>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="pt-4 md:pt-6 pb-6 md:pb-10 bg-[#F8FAFC]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-6 md:mb-8">
                <h2 class="text-3xl md:text-4xl font-semibold text-[#0000BE] mb-2 md:mb-3">Frequently Asked Questions</h2>
                <p class="text-base md:text-lg text-slate-500 font-medium">Short answers to the most common questions about shipping, ETGB and operations.</p>
            </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">
                <div class="flex flex-col gap-3">
                                        <details class="group rounded-xl border border-slate-200 bg-white transition-all duration-200 [&[open]]:bg-blue-50/50 [&[open]]:border-blue-200 h-fit">
                        <summary class="flex justify-between items-center p-4 md:p-5 font-semibold text-sm md:text-base cursor-pointer list-none text-slate-900">
                            <span>How long does integration setup take?</span>
                            <span class="transition-transform duration-300 group-open:rotate-180 text-[#0000BE] shrink-0 ml-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </span>
                        </summary>
                        <div class="px-4 md:px-5 pb-4 md:pb-5 text-slate-600 font-medium leading-relaxed text-sm">
                            <p>Hazır bağlantılarda kurulum birkaç dakika içinde tamamlanır. Özel API bağlantılarında ihtiyaç analizi sonrası kurulum planı çıkarılır.</p>
                        </div>
                    </details>
                                        <details class="group rounded-xl border border-slate-200 bg-white transition-all duration-200 [&[open]]:bg-blue-50/50 [&[open]]:border-blue-200 h-fit">
                        <summary class="flex justify-between items-center p-4 md:p-5 font-semibold text-sm md:text-base cursor-pointer list-none text-slate-900">
                            <span>Can marketplace and e-commerce orders be managed on one screen?</span>
                            <span class="transition-transform duration-300 group-open:rotate-180 text-[#0000BE] shrink-0 ml-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </span>
                        </summary>
                        <div class="px-4 md:px-5 pb-4 md:pb-5 text-slate-600 font-medium leading-relaxed text-sm">
                            <p>Evet. Siparişler, stok ve kargo akışları tek panelde birleştirilir ve operasyon ekipleri kategori bazında filtreleme yapabilir.</p>
                        </div>
                    </details>
                                    </div>
                <div class="flex flex-col gap-3">
                                        <details class="group rounded-xl border border-slate-200 bg-white transition-all duration-200 [&[open]]:bg-blue-50/50 [&[open]]:border-blue-200 h-fit">
                        <summary class="flex justify-between items-center p-4 md:p-5 font-semibold text-sm md:text-base cursor-pointer list-none text-slate-900">
                            <span>What data is transferred in accounting integrations?</span>
                            <span class="transition-transform duration-300 group-open:rotate-180 text-[#0000BE] shrink-0 ml-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </span>
                        </summary>
                        <div class="px-4 md:px-5 pb-4 md:pb-5 text-slate-600 font-medium leading-relaxed text-sm">
                            <p>Order amounts, commission items, shipping costs and the core fields needed for e-invoicing are synchronised.</p>
                        </div>
                    </details>
                                    </div>
            </div>
            <div class="mt-8 text-center">
                <a href="/en/iletisim"
                    class="inline-flex items-center px-8 h-10 md:h-12 bg-[#0000BE] text-white font-semibold rounded-lg hover:bg-[#00009c] cursor-pointer transition shadow-lg shadow-blue-900/40 text-sm">
                    Send Us Your Questions
                    <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                </a>
            </div>
        </div>
    </section>
</main>

<style>
    .integration-page-home {
        background-image: radial-gradient(circle at 10% 6%, rgba(0, 0, 190, 0.07) 0, rgba(0, 0, 190, 0) 38%);
    }
    .integration-hero {
        background:
            linear-gradient(145deg, rgba(246, 250, 255, 0.92) 0%, rgba(255, 255, 255, 0.98) 52%, rgba(238, 248, 255, 0.85) 100%),
            radial-gradient(circle at 88% 16%, rgba(34, 197, 94, 0.12) 0, rgba(34, 197, 94, 0) 30%);
    }
    .hero-kpi-card {
        border: 1px solid #dbe3ef;
        background: #fff;
        border-radius: 0.85rem;
        padding: 0.6rem 0.7rem;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 0.2rem;
    }
    .hero-kpi-card span {
        font-size: 0.7rem;
        color: #64748b;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.02em;
    }
    .hero-kpi-card strong {
        font-size: 1rem;
        color: #0f172a;
        font-weight: 800;
        line-height: 1.1;
    }
    .integration-logo-band {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 1.15rem;
        border: 1px dashed #dbe3ef;
        border-radius: 0.95rem;
        background: #ffffff;
        padding: 0.85rem 1rem;
    }
    .command-board {
        border: 1px solid #dbe3ef;
        background: #ffffff;
        border-radius: 1.1rem;
        padding: 1rem;
        box-shadow: 0 14px 30px -22px rgba(15, 23, 42, 0.55);
    }
    .command-row {
        margin-top: 0.65rem;
        border: 1px solid #e2e8f0;
        border-radius: 0.9rem;
        background: #f8fafc;
        padding: 0.65rem 0.72rem;
        display: flex;
        align-items: center;
        gap: 0.7rem;
        text-decoration: none;
        transition: border-color 0.2s ease, background-color 0.2s ease;
    }
    .command-row:hover {
        border-color: #cbd5e1;
        background: #f1f5f9;
    }
    .command-row-icon {
        width: 1.85rem;
        height: 1.85rem;
        border-radius: 0.55rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 0.78rem;
        font-weight: 800;
        flex-shrink: 0;
    }
    .command-row-content {
        display: flex;
        flex-direction: column;
        min-width: 0;
    }
    .command-row-content strong {
        color: #0f172a;
        font-size: 0.9rem;
        line-height: 1.2;
    }
    .command-row-content small {
        color: #64748b;
        font-size: 0.72rem;
        line-height: 1.2;
        margin-top: 0.15rem;
    }
    .command-row-meta {
        margin-left: auto;
        color: #475569;
        font-size: 0.71rem;
        font-weight: 800;
    }
    .integration-nav-sticky {
        position: sticky;
        top: 5.5rem;
    }
    .integration-nav-shell {
        border: 1px solid #dbe3ef;
        border-radius: 0.95rem;
        padding: 0.4rem;
        background: rgba(255, 255, 255, 0.96);
        backdrop-filter: blur(8px);
        box-shadow: 0 12px 24px -18px rgba(15, 23, 42, 0.45);
        overflow: hidden;
    }
    .integration-anchor-nav {
        scrollbar-width: none;
    }
    .integration-anchor-nav::-webkit-scrollbar {
        display: none;
    }
    .integration-nav-track {
        display: flex;
        align-items: center;
        gap: 0.35rem;
        min-width: 100%;
    }
    .integration-nav-link {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid transparent;
        border-radius: 0.7rem;
        min-height: 2.4rem;
        width: 100%;
        padding: 0.5rem 0.7rem;
        font-size: 0.84rem;
        font-weight: 700;
        color: #475569;
        transition: all 0.2s ease;
        white-space: nowrap;
        line-height: 1.2;
    }
    .integration-nav-link:hover {
        background: #f1f5f9;
        color: #0f172a;
    }
    .integration-nav-link.is-active {
        background: #0000be;
        color: #fff;
        border-color: #0000be;
        box-shadow: 0 8px 20px -15px rgba(0, 0, 190, 0.85);
    }
    .integration-bucket {
        border: 1px solid #dbe3ef;
        border-radius: 1.1rem;
        background: #fff;
        padding: 1.15rem;
        box-shadow: 0 8px 18px -20px rgba(15, 23, 42, 0.45);
    }
    .integration-bucket:first-of-type {
        margin-top: 0.3rem;
    }
    .integration-bucket-head {
        margin-bottom: 1rem;
        border-bottom: 1px solid #edf2f7;
        padding-bottom: 0.95rem;
    }
    .integration-badge {
        display: inline-flex;
        align-items: center;
        border-radius: 999px;
        border: 1px solid #dbe3ef;
        background: #f8fafc;
        color: #334155;
        padding: 0.2rem 0.68rem;
        font-size: 0.72rem;
        font-weight: 700;
    }
    .integration-bucket-title {
        margin-top: 0.5rem;
        color: #0f172a;
        font-size: clamp(1.55rem, 1.18rem + 1.05vw, 2.15rem);
        font-weight: 800;
        line-height: 1.18;
    }
    .integration-bucket-desc {
        margin-top: 0.4rem;
        color: #64748b;
        font-size: 0.95rem;
        line-height: 1.55;
        max-width: 64rem;
    }
    .integration-bucket-id {
        margin-top: 0.5rem;
        font-size: 0.74rem;
        color: #475569;
        font-weight: 700;
        letter-spacing: 0.02em;
    }
    .integration-tile {
        border: 1px solid #e2e8f0;
        border-radius: 1rem;
        background: #fff;
        padding: 1rem;
        transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
    }
    .integration-tile:hover {
        transform: translateY(-2px);
        border-color: #cbd5e1;
        box-shadow: 0 16px 26px -24px rgba(15, 23, 42, 0.6);
    }
    .integration-logo-wrap {
        width: 3rem;
        height: 3rem;
        border-radius: 0.85rem;
        border: 1px solid #e2e8f0;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0.35rem;
        flex-shrink: 0;
    }
    .integration-text-logo {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2rem;
        height: 2rem;
        border-radius: 0.6rem;
        font-size: 0.95rem;
        font-weight: 800;
    }
    .integration-tag {
        display: inline-flex;
        align-items: center;
        border: 1px solid #dbe3ef;
        background: #f8fafc;
        border-radius: 999px;
        font-size: 0.72rem;
        color: #334155;
        font-weight: 700;
        padding: 0.25rem 0.62rem;
    }
    .integration-dot {
        width: 0.45rem;
        height: 0.45rem;
        border-radius: 999px;
        background: linear-gradient(135deg, #0000be 0%, #4d4df2 100%);
        flex-shrink: 0;
    }
    .flow-step {
        display: flex;
        align-items: flex-start;
        gap: 0.8rem;
    }
    .flow-step-no {
        width: 2.15rem;
        height: 2.15rem;
        border-radius: 999px;
        background: #0000be;
        color: #fff;
        font-size: 0.96rem;
        font-weight: 800;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 8px 20px -14px rgba(0, 0, 190, 0.8);
    }
    .flow-step-title {
        color: #0f172a;
        font-size: 1.02rem;
        font-weight: 800;
        line-height: 1.35;
    }
    .flow-step-text {
        margin-top: 0.2rem;
        color: #64748b;
        font-size: 0.9rem;
        line-height: 1.5;
    }
    .control-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1px solid #e2e8f0;
        border-radius: 0.8rem;
        background: #f8fafc;
        padding: 0.75rem 0.8rem;
    }
    .control-label {
        color: #64748b;
        font-size: 0.88rem;
        font-weight: 600;
    }
    .control-value {
        color: #0f172a;
        font-size: 0.92rem;
        font-weight: 800;
    }

    @media (max-width: 767px) {
        .integration-nav-shell {
            padding: 0.32rem;
        }
        .integration-nav-track {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 0.28rem;
        }
        .integration-nav-link {
            padding: 0.46rem 0.42rem;
            font-size: 0.79rem;
            min-height: 2.25rem;
        }
        .hero-kpi-card {
            padding: 0.5rem 0.58rem;
        }
        .hero-kpi-card strong {
            font-size: 0.88rem;
        }
        .command-row {
            padding: 0.58rem 0.62rem;
        }
        .integration-bucket {
            padding: 0.88rem;
        }
    }
    @media (min-width: 768px) {
        .integration-nav-sticky {
            position: static;
            top: auto;
        }
    }
</style>
`;
