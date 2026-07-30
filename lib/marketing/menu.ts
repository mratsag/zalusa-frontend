// Header menü — public API'den çekilir, PHP normalize mantığı birebir uygulanır.
// Server-only: (marketing) layout'ta çağrılır, SiteHeader'a prop olarak geçer.
// Hata/boş durumunda DEFAULT_NAV (mevcut port edilmiş header ile birebir) döner.

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "";

export type NavChild = { label: string; href: string };
export type NavItem = { label: string; href: string; kurumsal: boolean; children: NavChild[] };

type ApiChild = { id: number; label: string; url: string };
type ApiNode = { id: number; label: string; url: string; children: ApiChild[] };

const LEGACY = new Set([
  "/fiyat-hesaplama",
  "/fiyat_hesaplama",
  "/fiyat_hesaplama.php",
  "fiyat-hesaplama",
  "fiyat_hesaplama",
  "fiyat_hesaplama.php",
]);
const FIYAT = "/yurtdisi-kargo-fiyat-hesaplama";

// PHP $normalize_legacy_url + /nasil-calisir özel kancası.
function normalize(raw: string): string {
  const url = (raw || "").trim();
  if (url === "" || url === "#") return url;
  if (LEGACY.has(url)) return FIYAT;
  let out: string;
  if (url.startsWith("http")) {
    out = url;
  } else {
    out = "/" + url.replace(/^\/+/, "");
    if (LEGACY.has(out)) out = FIYAT;
  }
  if (out.replace(/\/+$/, "") === "/nasil-calisir") out = "/nasil-calisir#nasil-calisir-bolumu";
  return out;
}

// PHP: href boş/'#' ise '#', http/'/' başlıyorsa aynen, değilse '/' eklenir.
function toHref(raw: string): string {
  const url = (raw || "").trim();
  if (url === "" || url === "#") return "#";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return "/" + url.replace(/^\/+/, "");
}

export const DEFAULT_NAV: NavItem[] = [
  {
    label: "Nasıl Çalışır",
    href: "/nasil-calisir#nasil-calisir-bolumu",
    kurumsal: false,
    children: [
      { label: "İşleyiş", href: "/nasil-calisir#nasil-calisir-bolumu" },
      { label: "Teknoloji", href: "/nasil-calisir#akilli-fiyat-motoru" },
    ],
  },
  {
    label: "Entegrasyonlar",
    href: "/entegrasyonlar",
    kurumsal: false,
    children: [
      { label: "Pazaryerleri", href: "/entegrasyonlar#pazaryerleri" },
      { label: "E-Ticaret", href: "/entegrasyonlar#e-ticaret" },
      { label: "Muhasebe", href: "/entegrasyonlar#muhasebe" },
    ],
  },
  { label: "Fiyatlandırma", href: FIYAT, kurumsal: false, children: [] },
  { label: "Blog", href: "/blog", kurumsal: false, children: [] },
  { label: "SSS", href: "/sss", kurumsal: false, children: [] },
  { label: "İletişim", href: "/iletisim", kurumsal: false, children: [] },
];

function mapNodes(nodes: ApiNode[]): NavItem[] {
  return nodes
    .filter((n) => (n.label || "").trim() !== "")
    .map((n) => {
      const label = n.label.trim();
      const kurumsal = label.toLocaleLowerCase("tr").includes("kurumsal");
      // Üst menü href: normalize edilmiş; dropdown-only ise '#'.
      const norm = normalize(n.url);
      const href = norm === "" || norm === "#" ? "#" : toHref(norm);
      const children: NavChild[] = (n.children || [])
        .filter((c) => (c.label || "").trim() !== "")
        .map((c) => {
          const cn = normalize(c.url);
          return { label: c.label.trim(), href: cn === "" || cn === "#" ? "#" : toHref(cn) };
        });
      return { label, href, kurumsal, children };
    });
}

export async function getSiteMenu(locale?: string): Promise<NavItem[]> {
  if (!API) return DEFAULT_NAV;
  try {
    const qs = locale && locale !== "tr" ? `?lang=${encodeURIComponent(locale)}` : "";
    const res = await fetch(`${API}/api/menu${qs}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return DEFAULT_NAV;
    const data = (await res.json()) as ApiNode[];
    if (!Array.isArray(data) || data.length === 0) return DEFAULT_NAV;
    const mapped = mapNodes(data);
    return mapped.length > 0 ? mapped : DEFAULT_NAV;
  } catch {
    return DEFAULT_NAV;
  }
}
