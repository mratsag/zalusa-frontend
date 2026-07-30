// Public site ayarları (settings tablosu, backend whitelist'i ile sınırlı).
// Server-only: (marketing) layout'ta çağrılır. Hata/boş durumda güvenli varsayılan döner
// (fail-safe: ayar okunamazsa popup GÖSTERİLMEZ, siteyi bozmaz).

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "";

export type PromoPopup = {
  title: string;
  text: string;
  badge: string;
  code: string;
  ctaText: string;
  ctaUrl: string;
};

// Admin "toggle" alanı "1"/"0" kaydeder ("true" de kabul edilir).
function isOn(v: string | undefined): boolean {
  return v === "1" || v === "true";
}

export async function getPublicSettings(): Promise<Record<string, string>> {
  if (!API) return {};
  try {
    const res = await fetch(`${API}/api/settings`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return {};
    const data = await res.json();
    return data && typeof data === "object" ? (data as Record<string, string>) : {};
  } catch {
    return {};
  }
}

// Admin'de "Promosyon Popup" grubundan yönetilir. Kapalıysa veya başlık/metin boşsa null.
export async function getPromoPopup(): Promise<PromoPopup | null> {
  const s = await getPublicSettings();
  if (!isOn(s.promo_popup_show)) return null;

  const title = (s.promo_popup_title || "").trim();
  const text = (s.promo_popup_text || "").trim();
  if (!title && !text) return null; // içeriksiz popup gösterme

  return {
    title,
    text,
    badge: (s.promo_popup_badge || "").trim(),
    code: (s.promo_popup_code || "").trim(),
    ctaText: (s.promo_popup_cta_text || "").trim(),
    ctaUrl: (s.promo_popup_cta_url || "").trim(),
  };
}
