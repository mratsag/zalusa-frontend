// Ülke sayfası "curated" bölümleri (data.php zalusa_section_example_library portu).
// PHP'de sadece Belçika (BE) dolu; diğer ülkelerde bölümler gizli.
// ISO2 → bölüm verisi. Verisi olmayan ülkede ilgili bölüm render EDİLMEZ.

export type AddressLine = string | { highlight: string; after?: string };
export type AddressFormatData = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  description?: string;
  postal_ranges?: { range: string; note: string }[];
  example_address?: { lines: AddressLine[] };
  rules?: string[]; // "head · tail"
  common_mistake?: { title: string; body: string };
};

export type DeliveryRow = {
  service: string;
  tagline?: string;
  badge?: string;
  badge_color?: string;
  icon?: string;
  cells: string[];
  price_diff?: string;
  price_color?: string;
};
export type DeliveryTimesData = {
  eyebrow?: string;
  title_lhs?: string;
  title_rhs?: string;
  title_suffix?: string;
  title_italic?: string;
  subtitle?: string;
  columns: string[];
  rows: DeliveryRow[];
  notes?: { icon?: string; title: string; body: string }[];
};

export type RestrictionColumn = {
  kind: "forbidden" | "restricted" | "allowed";
  icon?: string;
  title: string;
  kicker?: string;
  items: { emoji?: string; label: string }[];
};
export type RestrictionsData = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  columns: RestrictionColumn[];
  cta_box?: { body: string; button_label: string; button_url: string };
};

export type TopCategoryCard = {
  percent: number;
  name: string;
  emoji?: string;
  desc?: string;
  hs?: string;
  vat?: string;
  badges?: string[];
};
export type TopCategoriesData = {
  eyebrow?: string;
  title_lhs?: string;
  title_rhs?: string;
  title_main?: string;
  title_italic?: string;
  subtitle?: string;
  cards: TopCategoryCard[];
};

export type RelatedCountriesData = {
  eyebrow?: string;
  title_lhs?: string;
  title_italic?: string;
  iso2_list: string[];
};

export type CountrySections = {
  address_format?: AddressFormatData;
  delivery_times?: DeliveryTimesData;
  restrictions?: RestrictionsData;
  top_categories?: TopCategoriesData;
  related_countries?: RelatedCountriesData;
};

// ISO2 → curated bölümler. (Belçika verisi ayrı dosyada; buradan import edilir.)
import { BE_SECTIONS } from "./country-sections-data";

const LIBRARY: Record<string, CountrySections> = {
  BE: BE_SECTIONS,
};

export function getCountrySections(iso2: string): CountrySections | null {
  const key = (iso2 || "").toUpperCase();
  return LIBRARY[key] ?? null;
}
