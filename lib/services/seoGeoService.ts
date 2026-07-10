// Programmatik SEO — şehirler, mahalleler, bölgeler, TR il/ilçe (admin).
const API = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_TOKEN_KEY = "zalusa.admin.token";

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

// ---- Cities ----
export type CityListItem = { id: number; country_id: number; name: string; slug: string; is_active: boolean; country_name: string };
export type SeoCity = {
  id: number; country_id: number; name: string; slug: string; content: string;
  seo_title: string; seo_description: string; meta_keywords: string; canonical_url: string;
  og_title: string; og_description: string; h1_override: string;
  price_min: number | null; price_max: number | null; price_currency: string; is_active: boolean;
};
export type CityDistrict = { id: number; name: string; is_active: boolean };

export const listCities = (countryId?: number) => request<CityListItem[]>("GET", `/api/admin/seo/cities${countryId ? `?country_id=${countryId}` : ""}`);
export const getCity = (id: number) => request<SeoCity>("GET", `/api/admin/seo/cities/${id}`);
export const createCity = (input: { country_id: number; name: string; slug?: string }) => request<{ id: number }>("POST", "/api/admin/seo/cities", input);
export const updateCity = (id: number, input: SeoCity) => request("PUT", `/api/admin/seo/cities/${id}`, input);
export const toggleCity = (id: number) => request("PUT", `/api/admin/seo/cities/${id}/toggle`);
export const deleteCity = (id: number) => request("DELETE", `/api/admin/seo/cities/${id}`);
export const listCityDistricts = (cityId: number) => request<CityDistrict[]>("GET", `/api/admin/seo/cities/${cityId}/districts`);
export const createCityDistrict = (cityId: number, name: string) => request("POST", `/api/admin/seo/cities/${cityId}/districts`, { name });
export const deleteCityDistrict = (id: number) => request("DELETE", `/api/admin/seo/city-districts/${id}`);

// ---- Regions ----
export type Region = { id: number; name: string; code: string; is_active: boolean };
export const listRegions = (countryId: number) => request<Region[]>("GET", `/api/admin/seo/regions?country_id=${countryId}`);
export const createRegion = (input: { country_id: number; name: string; code?: string }) => request("POST", "/api/admin/seo/regions", input);
export const toggleRegion = (id: number) => request("PUT", `/api/admin/seo/regions/${id}/toggle`);
export const deleteRegion = (id: number) => request("DELETE", `/api/admin/seo/regions/${id}`);

// ---- TR provinces / districts ----
export type TrProvinceListItem = { id: number; name: string; slug: string; plate_code: string; is_active: boolean; district_count: number };
export type SeoTr = {
  id: number; province_id?: number; name: string; slug: string; plate_code?: string; content: string;
  seo_title: string; seo_description: string; h1_override: string;
  price_min: number | null; price_max: number | null; price_currency: string; is_active: boolean;
};
export type TrDistrictListItem = { id: number; name: string; slug: string; is_active: boolean };

export const listTrProvinces = () => request<TrProvinceListItem[]>("GET", "/api/admin/seo/tr-provinces");
export const getTrProvince = (id: number) => request<SeoTr>("GET", `/api/admin/seo/tr-provinces/${id}`);
export const createTrProvince = (input: { name: string; slug?: string; plate_code?: string }) => request<{ id: number }>("POST", "/api/admin/seo/tr-provinces", input);
export const updateTrProvince = (id: number, input: SeoTr) => request("PUT", `/api/admin/seo/tr-provinces/${id}`, input);
export const toggleTrProvince = (id: number) => request("PUT", `/api/admin/seo/tr-provinces/${id}/toggle`);
export const deleteTrProvince = (id: number) => request("DELETE", `/api/admin/seo/tr-provinces/${id}`);
export const listTrDistricts = (provinceId: number) => request<TrDistrictListItem[]>("GET", `/api/admin/seo/tr-provinces/${provinceId}/districts`);
export const createTrDistrict = (provinceId: number, input: { name: string; slug?: string }) => request("POST", `/api/admin/seo/tr-provinces/${provinceId}/districts`, input);
export const getTrDistrict = (did: number) => request<SeoTr>("GET", `/api/admin/seo/tr-districts/${did}`);
export const updateTrDistrict = (did: number, input: SeoTr) => request("PUT", `/api/admin/seo/tr-districts/${did}`, input);
export const toggleTrDistrict = (did: number) => request("PUT", `/api/admin/seo/tr-districts/${did}/toggle`);
export const deleteTrDistrict = (did: number) => request("DELETE", `/api/admin/seo/tr-districts/${did}`);
