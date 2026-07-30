// Müşteri yorumları (testimonials) — admin CRUD servisi.
const API = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_TOKEN_KEY = "zalusa.admin.token";

export type Testimonial = {
  id: number;
  author: string;
  authorMeta: string;
  rating: number;
  sourceType: string;
  sourceLabel: string;
  sourceUrl: string;
  quote: string;
  quoteEn?: string;
  publishedAt: string;
  isVerified: boolean;
  isPublished: boolean;
  sortOrder: number;
};

export type TestimonialInput = Omit<Testimonial, "id">;

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

export const getTestimonials = () =>
  request<{ testimonials: Testimonial[] }>("GET", "/api/admin/testimonials");
export const createTestimonial = (v: TestimonialInput) =>
  request<{ id: number }>("POST", "/api/admin/testimonials", v);
export const updateTestimonial = (id: number, v: TestimonialInput) =>
  request("PUT", `/api/admin/testimonials/${id}`, v);
export const deleteTestimonial = (id: number) =>
  request("DELETE", `/api/admin/testimonials/${id}`);
