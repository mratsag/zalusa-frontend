// Header menü (menu_items) — admin.
const API = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_TOKEN_KEY = "zalusa.admin.token";

export type MenuItem = {
  id: number;
  parent_id: number | null;
  label: string;
  url: string;
  sort_order: number;
  is_active: boolean;
};

export type MenuInput = {
  label: string;
  url: string;
  parent_id: number | null;
  sort_order: number;
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

export const listMenu = () => request<MenuItem[]>("GET", "/api/admin/menu");
export const createMenuItem = (input: MenuInput) => request("POST", "/api/admin/menu", input);
export const updateMenuItem = (id: number, input: MenuInput) => request("PUT", `/api/admin/menu/${id}`, input);
export const toggleMenuItem = (id: number) => request("PUT", `/api/admin/menu/${id}/toggle`);
export const deleteMenuItem = (id: number) => request("DELETE", `/api/admin/menu/${id}`);
