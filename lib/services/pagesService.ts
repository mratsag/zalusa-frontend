// Sayfa içerikleri & SEO (pages) — admin.
const API = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_TOKEN_KEY = "zalusa.admin.token";

export type Page = {
  id: number;
  slug: string;
  name: string;
  seo_title: string;
  seo_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  seo_content: string;
  undeletable: boolean;
  faq_count?: number;
};

export type PageUpdate = {
  name: string;
  slug: string;
  seo_title: string;
  seo_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  seo_content: string;
};

async function request<T = unknown>(method: string, path: string, body?: object): Promise<T> {
  const token = globalThis.localStorage?.getItem(ADMIN_TOKEN_KEY) ?? null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
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

export const listPages = () => request<Page[]>("GET", "/api/admin/pages");
export const getPage = (id: number) => request<Page>("GET", `/api/admin/pages/${id}`);
export const createPage = (name: string) => request<{ id: number; slug: string }>("POST", "/api/admin/pages", { name });
export const updatePage = (id: number, input: PageUpdate) => request("PUT", `/api/admin/pages/${id}`, input);
export const deletePage = (id: number) => request("DELETE", `/api/admin/pages/${id}`);
