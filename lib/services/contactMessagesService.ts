// Landing iletişim/geri bildirim mesajları (contact_messages) — admin.
const API = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_TOKEN_KEY = "zalusa.admin.token";

export type ContactMessage = {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  trackingCode: string;
  category: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

async function request<T = unknown>(method: string, path: string): Promise<T> {
  const token = globalThis.localStorage?.getItem(ADMIN_TOKEN_KEY) ?? null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { method, headers, credentials: "include" });
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

export const listContactMessages = () => request<ContactMessage[]>("GET", "/api/admin/contact-messages");
export const markContactRead = (id: number) => request("PUT", `/api/admin/contact-messages/${id}/read`);
export const deleteContactMessage = (id: number) => request("DELETE", `/api/admin/contact-messages/${id}`);
