// Blog yönetimi (blogs) — admin.
const API = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_TOKEN_KEY = "zalusa.admin.token";

export type BlogListItem = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  featuredImage: string;
  isFeatured: boolean;
  createdAt: string;
  status?: string;
};

export type Blog = BlogListItem & {
  content: string;
  author: string;
  status: string;
  seoTitle: string;
  seoDescription: string;
};

export type BlogInput = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  featuredImage: string;
  isFeatured: boolean;
  status: string;
  seoTitle: string;
  seoDescription: string;
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

export const listBlogs = () => request<BlogListItem[]>("GET", "/api/admin/blogs");
export const getBlog = (id: number) => request<Blog>("GET", `/api/admin/blogs/${id}`);
export const createBlog = (input: BlogInput) => request<{ id: number }>("POST", "/api/admin/blogs", input);
export const updateBlog = (id: number, input: BlogInput) => request("PUT", `/api/admin/blogs/${id}`, input);
export const deleteBlog = (id: number) => request("DELETE", `/api/admin/blogs/${id}`);

export function slugify(s: string): string {
  const map: Record<string, string> = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return s
    .toLowerCase()
    .replace(/[çğıöşüİ]/g, (m) => map[m] || m)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}
