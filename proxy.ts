import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 301/302 yönlendirmeler — admin'de tanımlı aktif kuralları uygular.
// Backend'den aktif kurallar 60 sn önbelleğe alınır; hata durumunda fail-open (site çalışmaya devam eder).
// Next 16: "middleware" yerine "proxy" konvansiyonu.

const API = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "";

type Rule = { target: string; code: number };

let cache: Map<string, Rule> | null = null;
let cacheAt = 0;
const TTL = 60_000;

async function getRules(): Promise<Map<string, Rule>> {
  const now = Date.now();
  if (cache && now - cacheAt < TTL) return cache;
  const map = new Map<string, Rule>();
  if (!API) {
    cache = map;
    cacheAt = now;
    return map;
  }
  try {
    const res = await fetch(`${API}/api/redirects`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const list = (await res.json()) as { source_url: string; target_url: string; status_code: number }[];
      for (const r of list) {
        map.set(r.source_url, { target: r.target_url, code: r.status_code === 302 ? 302 : 301 });
      }
    }
    cache = map;
    cacheAt = now;
    return map;
  } catch {
    // fail-open: eski önbelleği koru, yoksa boş harita
    if (cache) return cache;
    cache = map;
    cacheAt = now;
    return map;
  }
}

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const rules = await getRules();
  if (rules.size === 0) return NextResponse.next();

  const rule = rules.get(pathname) || rules.get(pathname.replace(/\/$/, "")) || null;
  if (!rule) return NextResponse.next();

  const target = /^https?:\/\//i.test(rule.target)
    ? rule.target
    : new URL(rule.target, req.url).toString();
  return NextResponse.redirect(target, rule.code);
}

export const config = {
  // Statik dosyalar, _next, api ve admin panelini hariç tut.
  matcher: ["/((?!_next/|api/|admin|assets/|favicon|.*\\.[\\w]+$).*)"],
};
