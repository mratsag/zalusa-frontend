// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardCountryStat {
  countryCode: string;
  count: number;
}

export interface DashboardRecentOrder {
  id: number;
  trackingCode: string;
  countryCode: string;
  status: string;
  /** Ödeme aşaması (backend türetir): pending_payment + bekleyen havale -> awaiting_transfer_approval. Yoksa status. */
  paymentStage?: string;
  priceTry: number;
  createdAt: string; // ISO date string
}

export interface DashboardStats {
  totalShipments: number;
  totalSpentTry: number;
  averageShipmentCostTry: number;
  deliveredShipments: number;
  uniqueCountriesCount: number;
  topCountries: DashboardCountryStat[];
  recentOrders: DashboardRecentOrder[];
}

// ─── Dashboard Service ────────────────────────────────────────────────────────

export const dashboardService = {
  getStats(period?: string) {
    const query = period && period !== "all" ? `?period=${period}` : "";
    return apiGet<DashboardStats>(`/api/dashboard/stats${query}`);
  },
};

async function apiGet<T = any>(path: string): Promise<T> {
  const token = localStorage.getItem("zalusa.token");
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    if (res.status === 401) {
      try { localStorage.removeItem("zalusa.token"); if (typeof window !== "undefined") window.location.href = "/giris"; } catch {}
      throw new Error("Oturumunuz sona erdi, lütfen tekrar giriş yapın.");
    }
    throw new Error(err.message || `API error: ${res.status}`);
  }

  return res.json();
}
