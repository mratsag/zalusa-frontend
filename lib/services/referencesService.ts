// Referanslar (site_references) — admin.
const API = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_TOKEN_KEY = "zalusa.admin.token";

export type Reference = {
  id: number;
  name: string;
  logo_path: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
};

export type ReferenceInput = {
  name: string;
  logo_path: string;
  link_url: string;
  sort_order: number;
};

function token() {
  return globalThis.localStorage?.getItem(ADMIN_TOKEN_KEY) ?? null;
}

async function handle<T>(res: Response): Promise<T> {
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

async function request<T = unknown>(method: string, path: string, body?: object): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const t = token();
  if (t) headers["Authorization"] = `Bearer ${t}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body ? JSON.stringify(body) : undefined,
  });
  return handle<T>(res);
}

export const listReferences = () => request<Reference[]>("GET", "/api/admin/references");
export const createReference = (input: ReferenceInput) => request("POST", "/api/admin/references", input);
export const updateReference = (id: number, input: ReferenceInput) => request("PUT", `/api/admin/references/${id}`, input);
export const toggleReference = (id: number) => request("PUT", `/api/admin/references/${id}/toggle`);
export const deleteReference = (id: number) => request("DELETE", `/api/admin/references/${id}`);

// Logo dosyasını yükler, CDN URL döner.
export async function uploadReferenceLogo(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const headers: Record<string, string> = {};
  const t = token();
  if (t) headers["Authorization"] = `Bearer ${t}`;
  const res = await fetch(`${API}/api/admin/references/upload-logo`, {
    method: "POST",
    headers,
    credentials: "include",
    body: form,
  });
  const data = await handle<{ url: string }>(res);
  return data.url;
}
