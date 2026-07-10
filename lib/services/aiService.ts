// AI içerik üretimi (OpenAI) — admin.
const API = process.env.NEXT_PUBLIC_API_URL;
const ADMIN_TOKEN_KEY = "zalusa.admin.token";

export type AiTargetType = "country" | "city" | "tr_province" | "tr_district" | "page";
export type AiMode = "content" | "seo" | "faqs";

export async function aiGenerate(type: AiTargetType, id: number, mode: AiMode): Promise<Record<string, unknown>> {
  const token = globalThis.localStorage?.getItem(ADMIN_TOKEN_KEY) ?? null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}/api/admin/ai/generate`, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ type, id, mode }),
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
  return data as Record<string, unknown>;
}
