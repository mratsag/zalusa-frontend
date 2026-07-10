// Programmatik SEO — ülkeler + hikayeler + ülke SSS (admin).
const API = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_TOKEN_KEY = "zalusa.admin.token";

export type SeoCountryListItem = {
  id: number;
  name: string;
  slug: string;
  iso2: string;
  is_active: boolean;
  city_count: number;
  story_count: number;
  faq_count: number;
};

export type SeoCountry = {
  id: number;
  name: string;
  slug: string;
  iso2: string;
  content: string;
  seo_title: string;
  seo_description: string;
  seo_text: string;
  meta_keywords: string;
  canonical_url: string;
  og_title: string;
  og_description: string;
  h1_override: string;
  price_min: number | null;
  price_max: number | null;
  price_currency: string;
  is_active: boolean;
};

export type SeoStory = {
  id: number;
  country_id: number | null;
  city_id: number | null;
  author_name: string;
  author_role: string;
  rating: number;
  content: string;
  date_label: string;
  is_verified: boolean;
};

export type CountryFaq = { id: number; question: string; answer: string; display_order: number };

async function request<T = unknown>(method: string, path: string, body?: object): Promise<T> {
  const token = globalThis.localStorage?.getItem(ADMIN_TOKEN_KEY) ?? null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { method, headers, credentials: "include", body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      try {
        localStorage.removeItem(ADMIN_TOKEN_KEY);
        if (typeof window !== "undefined") window.location.href = "/admin/login";
      } catch {}
      throw new Error("Oturumunuz sona erdi, lütfen tekrar giriş yapın.");
    }
    throw new Error((data as { error?: string })?.error || `İstek başarısız (${res.status})`);
  }
  return data as T;
}

// Countries
export const listSeoCountries = () => request<SeoCountryListItem[]>("GET", "/api/admin/seo/countries");
export const getSeoCountry = (id: number) => request<SeoCountry>("GET", `/api/admin/seo/countries/${id}`);
export const createSeoCountry = (input: { name: string; slug: string; iso2: string }) => request<{ id: number; slug: string }>("POST", "/api/admin/seo/countries", input);
export const updateSeoCountry = (id: number, input: SeoCountry) => request("PUT", `/api/admin/seo/countries/${id}`, input);
export const toggleSeoCountry = (id: number) => request("PUT", `/api/admin/seo/countries/${id}/toggle`);
export const deleteSeoCountry = (id: number) => request("DELETE", `/api/admin/seo/countries/${id}`);

// Stories
export const listSeoStories = (countryId: number) => request<SeoStory[]>("GET", `/api/admin/seo/stories?country_id=${countryId}`);
export const createSeoStory = (input: Partial<SeoStory>) => request("POST", "/api/admin/seo/stories", input);
export const updateSeoStory = (id: number, input: Partial<SeoStory>) => request("PUT", `/api/admin/seo/stories/${id}`, input);
export const deleteSeoStory = (id: number) => request("DELETE", `/api/admin/seo/stories/${id}`);

// Country FAQs
export const listCountryFaqs = (countryId: number) => request<CountryFaq[]>("GET", `/api/admin/seo/countries/${countryId}/faqs`);
export const createCountryFaq = (countryId: number, input: Partial<CountryFaq>) => request("POST", `/api/admin/seo/countries/${countryId}/faqs`, input);
export const updateCountryFaq = (id: number, input: Partial<CountryFaq>) => request("PUT", `/api/admin/seo/faqs/${id}`, input);
export const deleteCountryFaq = (id: number) => request("DELETE", `/api/admin/seo/faqs/${id}`);
