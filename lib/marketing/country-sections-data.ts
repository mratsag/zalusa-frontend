import type { CountrySections } from "./country-sections";

// Belçika (BE) curated bölüm verisi — data.php zalusa_section_example_library()['BE'] birebir.
// PHP htmlspecialchars uyguluyordu; React zaten kaçırdığı için düz "&" kullanıyoruz.

export const BE_SECTIONS: CountrySections = {
  address_format: {
    eyebrow: "Adres Rehberi",
    title: "Belçika adres formatı.",
    subtitle: "Doğru yazılan adres, gecikmesiz teslim.",
    description:
      "Belçika 4 haneli posta kodu kullanır (1000–9999). Adres formatı Fransızca veya Flamanca olabilir; her ikisi de geçerlidir. Yanlış yazılan posta kodu, gönderinin yanlış lojistik merkeze yönlenmesine ve 2-4 gün gecikmeye neden olur.",
    postal_ranges: [
      { range: "1xxx–1999", note: "Brüksel & çevresi" },
      { range: "2xxx–3999", note: "Anvers, Limburg, Flaman Brabant" },
      { range: "4xxx–6999", note: "Liège, Namur, Lüksemburg, Hainaut doğu" },
      { range: "7xxx–7999", note: "Hainaut batı (Mons, Tournai)" },
      { range: "8xxx–9999", note: "Batı & Doğu Flandre (Brugge, Gent)" },
    ],
    example_address: {
      lines: ["Jan Janssens", "Naamsestraat 42", { highlight: "3000", after: " Leuven" }, "België / Belgique"],
    },
    rules: [
      "İsim Soyisim · sokak/cadde adı + numara aynı satır",
      "Posta kodu önce, sonra şehir adı — Türkçeden farklı",
      "Ülke en sonda · iki dilli yazım kabul edilir",
    ],
    common_mistake: {
      title: "Sık yapılan hata:",
      body: "Türkiye'deki gibi şehri posta kodundan önce yazmak. Belçika'da daima `1000 Brussels`, asla `Brussels 1000`.",
    },
  },

  delivery_times: {
    eyebrow: "Teslim Süreleri",
    title_lhs: "İstanbul",
    title_rhs: "Belçika",
    title_suffix: "arası",
    title_italic: "net süreler.",
    subtitle:
      "Günlük 3 uçuş kalkışı: 11:00, 14:00 ve 17:00 (İstanbul). Cut-off saatine yetişen gönderiler aynı gün havalimanına gider.",
    columns: ["Brüksel", "Anvers / Gent", "Liège / Charleroi", "Diğer Şehirler"],
    rows: [
      { service: "Ekspres", tagline: "uçak kargo · öncelikli", badge_color: "amber", icon: "ph-fill ph-lightning", cells: ["1 gün", "1-2 gün", "2 gün", "2-3 gün"], price_diff: "+40%", price_color: "amber" },
      { service: "Standart", tagline: "uçak kargo · genel", badge: "ÖNERİLEN", badge_color: "lime", icon: "ph-fill ph-airplane-tilt", cells: ["2-3 gün", "2-3 gün", "3 gün", "3-4 gün"], price_diff: "baz fiyat", price_color: "slate" },
      { service: "Ekonomik", tagline: "kara + deniz · konsolide", badge_color: "amber", icon: "ph-fill ph-truck", cells: ["5-7 gün", "5-7 gün", "6-8 gün", "7-9 gün"], price_diff: "-25%", price_color: "emerald" },
    ],
    notes: [
      { icon: "ph-fill ph-calendar-x", title: "Pazar / resmi tatil", body: "Belçika'da pazar günleri ve resmi tatillerde teslimat yapılmaz. Cuma akşamı gönderilen koliler pazartesi teslim edilir." },
      { icon: "ph-fill ph-shield-check", title: "Gümrük süresi", body: "Belçika EU üyesi olduğu için ortalama 4-12 saatte gümrük tamamlanır. Doğru evrak ile aynı gün serbestçilik mümkün." },
      { icon: "ph-fill ph-map-pin", title: "Adres uzaklığı", body: "Şehir merkezine 30km+ uzaklıkta köy/kasaba adreslerinde +1 gün eklenebilir. Hesaplayıcı bunu otomatik gösterir." },
    ],
  },

  restrictions: {
    eyebrow: "Kısıtlı & Yasaklı",
    title: "Belçika'ya gönderilmeyen ürünler.",
    subtitle: "Yanlış beyan, gönderinin geri dönmesine ve cezaya yol açar. Aşağıdaki kalemler için önceden danışın.",
    columns: [
      {
        kind: "forbidden", icon: "ph-fill ph-prohibit", title: "Yasaklı", kicker: "hiçbir şartta gönderilemez",
        items: [
          { emoji: "🚬", label: "Tütün ürünleri (sigara, puro)" },
          { emoji: "💊", label: "Reçeteli ilaçlar" },
          { emoji: "🍷", label: "Alkollü içecekler (bireysel)" },
          { emoji: "🔪", label: "Silah, ateşli mermi, bıçak" },
          { emoji: "🐾", label: "Canlı hayvan" },
          { emoji: "💵", label: "Nakit para, çek" },
          { emoji: "🔥", label: "Yanıcı / patlayıcı maddeler" },
          { emoji: "🚫", label: "Sahte / replika ürün" },
        ],
      },
      {
        kind: "restricted", icon: "ph-fill ph-warning", title: "Kısıtlı", kicker: "özel izin / sertifika ile",
        items: [
          { emoji: "🍯", label: "Bal, baharat (gıda sertifikası)" },
          { emoji: "💄", label: "Kozmetik (CPNP bildirimi)" },
          { emoji: "🔋", label: "Lityum pil (UN3480, ayrı paket)" },
          { emoji: "🌱", label: "Bitki, tohum (fitosaniter)" },
          { emoji: "💍", label: "Kıymetli takı (sigorta zorunlu)" },
          { emoji: "🏺", label: "Antika (CITES için)" },
          { emoji: "🔌", label: "Elektronik (CE işareti)" },
          { emoji: "🧲", label: "Mağnetler, jellikli içerik" },
        ],
      },
      {
        kind: "allowed", icon: "ph-fill ph-check-circle", title: "Serbest", kicker: "standart süreçle gönderilir",
        items: [
          { emoji: "👕", label: "Tekstil, hazır giyim" },
          { emoji: "📚", label: "Kitap, dergi, basılı yayın" },
          { emoji: "🎨", label: "El sanatları (modern)" },
          { emoji: "🌾", label: "Kuru gıda (kapalı ambalaj)" },
          { emoji: "🪑", label: "Mobilya, ev dekor" },
          { emoji: "🧸", label: "Oyuncak (CE uyumlu)" },
          { emoji: "🎧", label: "Elektronik aksesuar" },
          { emoji: "📦", label: "İş numunesi, prototip" },
        ],
      },
    ],
    cta_box: { body: "Listede yoksa veya kararsızsanız uzman ekibimiz ortalama 47 saniye içinde size dönüş yapar.", button_label: "Uzmana Danış", button_url: "/iletisim" },
  },

  top_categories: {
    eyebrow: "E-ticaret Odaklı",
    title_lhs: "Türkiye",
    title_rhs: "Belçika",
    title_main: "rotasında",
    title_italic: "en çok ne gönderiliyor?",
    subtitle:
      "10.000+ Belçika gönderisinden çıkardığımız kategori dağılımı. Her kategorinin gümrük gereksinimleri ve önerilen ambalaj farklılaşır.",
    cards: [
      { percent: 28, name: "Tekstil & Hazır Giyim", emoji: "👔", desc: "Etsy, Shopify mağazaları için en popüler kategori. HS kodu zorunlu.", hs: "61-62", vat: "21%", badges: [] },
      { percent: 19, name: "Kozmetik & Kişisel Bakım", emoji: "💄", desc: "Belçika için CPNP bildirimi gerekebilir. Sıvı içeriklerde uçak kuralı.", hs: "33", vat: "21%", badges: [] },
      { percent: 14, name: "Türk Gıdaları", emoji: "🍯", desc: "Lokum, baharat, zeytinyağı. AB gıda mevzuatı + sağlık sertifikası.", hs: "17-21", vat: "6%", badges: [] },
      { percent: 11, name: "El Sanatları & Hediyelik", emoji: "🏺", desc: "Çini, halı, takı. Etsy gibi marketplace'ler için popüler.", hs: "69, 71", vat: "21%", badges: [] },
      { percent: 9, name: "Kitap & Yayın", emoji: "📚", desc: "Türkçe yayın, akademik içerik. KDV indirimli oran avantajı.", hs: "49", vat: "6%", badges: [] },
      { percent: 8, name: "Numune & Belge", emoji: "📦", desc: "B2B numuneler, sözleşmeler. €22 altı duty muaf.", hs: "", vat: "", badges: ["düşük değer", "hızlı ekspres"] },
      { percent: 6, name: "Elektronik Aksesuar", emoji: "📱", desc: "Kılıf, kablo, küçük cihazlar. CE işareti zorunlu.", hs: "85", vat: "21%", badges: [] },
      { percent: 5, name: "Diğer", emoji: "🌭", desc: "Spor, oyuncak, dekorasyon. Kategori bazlı kurallar.", hs: "", vat: "", badges: ["karışık", "danışın"] },
    ],
  },

  related_countries: {
    eyebrow: "Yakın Rotalar",
    title_lhs: "Diğer",
    title_italic: "Avrupa rotaları.",
    iso2_list: ["NL", "DE", "FR", "LU", "GB", "IT"],
  },
};
