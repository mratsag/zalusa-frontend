// Sayfa gövdesi (ham HTML) dil seçimi.
//
// Her content.ts dosyası Türkçe gövdeyi `HTML` olarak dışa verir. İngilizce çeviri
// hazır oldukça AYNI dosyaya `HTML_EN` eklenir — başka kod değişikliği gerekmez.
// HTML_EN yoksa veya boşsa Türkçe gövdeye düşülür (yarım çeviri yayına çıkmaz).
//
// Kullanım (sayfa server component'inde):
//   import * as content from "./content";
//   const html = pickHTML(content, locale);

export function pickHTML(mod: Record<string, unknown>, locale: string): string {
  if (locale === "en") {
    const en = mod.HTML_EN;
    if (typeof en === "string" && en.trim() !== "") return en;
  }
  return typeof mod.HTML === "string" ? mod.HTML : "";
}
