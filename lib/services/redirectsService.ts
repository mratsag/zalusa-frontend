// 301/302 yönlendirmeler — admin.
const API = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_TOKEN_KEY = "zalusa.admin.token";

export type Redirect = {
  id: number;
  source_url: string;
  target_url: string;
  status_code: number;
  is_active: boolean;
  created_at: string;
};

export type RedirectInput = {
  source_url: string;
  target_url: string;
  status_code: number;
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

export const listRedirects = () => request<Redirect[]>("GET", "/api/admin/redirects");
export const createRedirect = (input: RedirectInput) => request("POST", "/api/admin/redirects", input);
export const updateRedirect = (id: number, input: RedirectInput) => request("PUT", `/api/admin/redirects/${id}`, input);
export const toggleRedirect = (id: number) => request("PUT", `/api/admin/redirects/${id}/toggle`);
export const deleteRedirect = (id: number) => request("DELETE", `/api/admin/redirects/${id}`);
