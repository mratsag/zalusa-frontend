// ─── Telefon Numarası Yardımcıları ───────────────────────────────────────────
// Ülke koduna (prefix) göre telefon numarasını formatlar, uzunluğunu sınırlar
// ve doğrular. Değer her zaman HAM olarak saklanır: "+" + rakamlar (boşluksuz).
// Ekranda gruplanmış gösterim için formatPhoneDisplay() kullanılır.

export type PhoneFormat = { len: number; groups: number[] };

// len = ülke kodundan SONRAKI ulusal hane sayısı (maksimum)
export const PHONE_FORMATS: Record<string, PhoneFormat> = {
  "+90": { len: 10, groups: [3, 3, 2, 2] },   // TR: +90 532 123 45 67
  "+1": { len: 10, groups: [3, 3, 4] },        // US/CA: +1 212 555 1234
  "+44": { len: 10, groups: [4, 6] },          // GB: +44 7911 123456
  "+49": { len: 10, groups: [3, 7] },          // DE: +49 151 1234567
  "+33": { len: 9, groups: [1, 2, 2, 2, 2] },  // FR: +33 6 12 34 56 78
  "+39": { len: 10, groups: [3, 3, 4] },       // IT
  "+34": { len: 9, groups: [3, 3, 3] },        // ES
  "+31": { len: 9, groups: [1, 4, 4] },        // NL
  "+32": { len: 8, groups: [3, 2, 2, 2] },     // BE
  "+43": { len: 10, groups: [3, 7] },          // AT
  "+41": { len: 9, groups: [2, 3, 2, 2] },     // CH
  "+48": { len: 9, groups: [3, 3, 3] },        // PL
  "+46": { len: 9, groups: [2, 3, 2, 2] },     // SE
  "+45": { len: 8, groups: [2, 2, 2, 2] },     // DK
  "+47": { len: 8, groups: [3, 2, 3] },        // NO
  "+351": { len: 9, groups: [3, 3, 3] },       // PT
  "+353": { len: 9, groups: [2, 3, 4] },       // IE
  "+81": { len: 10, groups: [2, 4, 4] },       // JP
  "+86": { len: 11, groups: [3, 4, 4] },       // CN
  "+82": { len: 10, groups: [2, 4, 4] },       // KR
  "+61": { len: 9, groups: [3, 3, 3] },        // AU
  "+55": { len: 11, groups: [2, 5, 4] },       // BR
  "+966": { len: 9, groups: [2, 3, 4] },       // SA
  "+971": { len: 9, groups: [2, 3, 4] },       // AE
};

// Bilinmeyen ülke kodu için varsayılan gruplama
export const DEFAULT_FORMAT: PhoneFormat = { len: 10, groups: [3, 3, 4] };

// E.164: ülke kodu dahil en fazla 15 hane → ulusal kısım için güvenli üst sınır
const MAX_NATIONAL_DIGITS = 15;

/** Numaranın başındaki ülke kodunu ("+90" gibi) tespit eder. */
export function detectPhonePrefix(phone: string): string {
  if (phone.startsWith("+")) {
    for (const len of [4, 3, 2]) {
      const prefix = phone.slice(0, len + 1); // +XXX
      if (PHONE_FORMATS[prefix]) return prefix;
    }
    const m = phone.match(/^(\+\d{1,4})/);
    return m ? m[1] : "";
  }
  return "";
}

/** Ülkenin izin verdiği ulusal hane sayısı. */
export function maxNationalDigits(prefix: string): number {
  if (!prefix) return MAX_NATIONAL_DIGITS;
  return (PHONE_FORMATS[prefix] || DEFAULT_FORMAT).len;
}

/**
 * Girişi ham, saklanabilir biçime indirger: sadece baştaki "+" ve rakamlar,
 * ulusal kısım ülke uzunluğuna KIRPILIR (sınırsız girişi engeller).
 */
export function normalizePhone(input: string): string {
  if (!input) return "";
  const hasPlus = input.trimStart().startsWith("+");
  const digitsOnly = input.replace(/\D/g, "");
  let s = (hasPlus ? "+" : "") + digitsOnly;

  const prefix = detectPhonePrefix(s);
  if (!prefix) {
    return (hasPlus ? "+" : "") + digitsOnly.slice(0, MAX_NATIONAL_DIGITS);
  }
  const national = s.slice(prefix.length).slice(0, maxNationalDigits(prefix));
  return prefix + national;
}

/** Ham değeri ekranda ülke formatına göre gruplayarak gösterir. */
export function formatPhoneDisplay(raw: string): string {
  if (!raw || raw.length <= 1) return raw;
  const prefix = detectPhonePrefix(raw);
  if (!prefix) return raw;

  const fmt = PHONE_FORMATS[prefix] || DEFAULT_FORMAT;
  const digits = raw.slice(prefix.length).replace(/\D/g, "").slice(0, fmt.len);
  if (!digits) return prefix;

  const parts: string[] = [];
  let pos = 0;
  for (const g of fmt.groups) {
    if (pos >= digits.length) break;
    parts.push(digits.slice(pos, pos + g));
    pos += g;
  }
  if (pos < digits.length) parts.push(digits.slice(pos));
  return prefix + " " + parts.join(" ");
}

/** Numara ülke uzunluğuna göre tam/geçerli mi? */
export function isPhoneComplete(raw: string): boolean {
  if (!raw) return false;
  const prefix = detectPhonePrefix(raw);
  const national = (prefix ? raw.slice(prefix.length) : raw).replace(/\D/g, "");
  if (!prefix) return national.length >= 7 && national.length <= MAX_NATIONAL_DIGITS;
  return national.length === (PHONE_FORMATS[prefix] || DEFAULT_FORMAT).len;
}

/**
 * Ham değeri ülke kodu (kilitli prefix) ve ulusal kısma ayırır.
 * Değer boşsa veya kod yoksa fallbackDial kullanılır.
 */
export function splitPhone(
  value: string,
  fallbackDial = "+90",
): { dialCode: string; national: string } {
  const v = (value || "").replace(/\s/g, "");
  if (!v) return { dialCode: fallbackDial, national: "" };
  const detected = detectPhonePrefix(v);
  if (detected) {
    return { dialCode: detected, national: v.slice(detected.length).replace(/\D/g, "") };
  }
  // "+" yok → tümünü ulusal say, varsayılan kodu uygula
  return { dialCode: fallbackDial, national: v.replace(/\D/g, "") };
}

/** Sadece ulusal kısmı ülke formatına göre gruplar (ör. "532 123 45 67"). */
export function formatNational(digits: string, dialCode: string): string {
  const fmt = PHONE_FORMATS[dialCode] || DEFAULT_FORMAT;
  const d = (digits || "").replace(/\D/g, "").slice(0, fmt.len);
  if (!d) return "";
  const parts: string[] = [];
  let pos = 0;
  for (const g of fmt.groups) {
    if (pos >= d.length) break;
    parts.push(d.slice(pos, pos + g));
    pos += g;
  }
  if (pos < d.length) parts.push(d.slice(pos));
  return parts.join(" ");
}
