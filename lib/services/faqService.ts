// SSS / FAQ yönetimi (faqs, country_id NULL = genel) — admin.
const API = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_TOKEN_KEY = "zalusa.admin.token";

export type FAQ = {
  id: number;
  pageSlug: string;
  question: string;
  answer: string;
  displayOrder: number;
};

export type FAQInput = {
  pageSlug: string;
  question: string;
  answer: string;
  displayOrder: number;
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

export const listFAQs = () => request<FAQ[]>("GET", "/api/admin/faqs");
export const createFAQ = (input: FAQInput) => request("POST", "/api/admin/faqs", input);
export const updateFAQ = (id: number, input: FAQInput) => request("PUT", `/api/admin/faqs/${id}`, input);
export const deleteFAQ = (id: number) => request("DELETE", `/api/admin/faqs/${id}`);
