"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plug, Key, Copy, Check, Trash2, Plus, ShoppingBag, PackagePlus,
  ExternalLink, RefreshCw, Loader2, AlertTriangle,
} from "lucide-react";
import { formatTrDate } from "@/lib/date";

const API = process.env.NEXT_PUBLIC_API_URL;

interface ApiKey {
  id: number;
  prefix: string;
  label: string;
  createdAt: string;
  revoked: boolean;
  lastUsedAt?: string;
}
interface IntegrationOrder {
  id: number;
  platform: string;
  externalOrderId: string;
  orderNumber: string;
  currency: string;
  buyerName: string;
  shipCountry: string;
  shipCity: string;
  grandTotal: number;
  status: string;
  shipmentId?: number;
  createdAt: string;
}

function authHeaders(): HeadersInit {
  const token = typeof window !== "undefined" ? localStorage.getItem("zalusa.token") : "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  received: { text: "Alındı", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  draft_created: { text: "Taslak Oluşturuldu", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  cancelled: { text: "İptal", cls: "bg-slate-100 text-slate-500 ring-slate-200" },
};

export default function EntegrasyonPage() {
  const router = useRouter();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [orders, setOrders] = useState<IntegrationOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busyOrder, setBusyOrder] = useState<number | null>(null);
  const [error, setError] = useState("");

  const loadKeys = useCallback(async () => {
    const res = await fetch(`${API}/api/integration/keys`, { headers: authHeaders() });
    if (res.ok) setKeys((await res.json()).keys ?? []);
  }, []);
  const loadOrders = useCallback(async () => {
    const res = await fetch(`${API}/api/integration/orders`, { headers: authHeaders() });
    if (res.ok) setOrders((await res.json()).orders ?? []);
  }, []);

  useEffect(() => {
    Promise.all([loadKeys(), loadOrders()]).finally(() => setLoading(false));
  }, [loadKeys, loadOrders]);

  async function generateKey() {
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/integration/keys`, {
        method: "POST", headers: authHeaders(), body: JSON.stringify({ label: label || "Anahtar" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Anahtar oluşturulamadı");
      setNewKey(data.apiKey);
      setLabel("");
      await loadKeys();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Hata");
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: number) {
    if (!confirm("Bu anahtar iptal edilsin mi? Bu anahtarı kullanan eklentiler bağlanamaz.")) return;
    await fetch(`${API}/api/integration/keys/${id}`, { method: "DELETE", headers: authHeaders() });
    await loadKeys();
  }

  async function createShipment(orderId: number) {
    setBusyOrder(orderId);
    setError("");
    try {
      const res = await fetch(`${API}/api/integration/orders/${orderId}/create-shipment`, {
        method: "POST", headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gönderi oluşturulamadı");
      router.push(`/panel/gonderi-olustur?draft=${data.shipmentId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Hata");
      setBusyOrder(null);
    }
  }

  function copyKey() {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Başlık */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3959F2]/10 text-[#3959F2]">
          <Plug className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Entegrasyon</h1>
          <p className="text-sm text-slate-500">Shopify, WooCommerce gibi mağazalarındaki siparişleri Zalusa&apos;ya otomatik aktar.</p>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {/* API Anahtarları */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <Key className="h-4 w-4 text-slate-400" />
          <h2 className="text-base font-bold text-slate-800">API Anahtarları</h2>
        </div>
        <p className="text-[13px] text-slate-500 mb-4">Eklentini bağlamak için bir anahtar üret. Anahtar yalnızca oluşturulduğu anda gösterilir.</p>

        {newKey && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-[13px] font-semibold text-emerald-800 mb-2">✅ Anahtarın oluşturuldu — şimdi kopyala, bir daha gösterilmeyecek:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg bg-white border border-emerald-200 px-3 py-2 text-[13px] font-mono text-slate-700">{newKey}</code>
              <button onClick={copyKey} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[13px] font-semibold text-white hover:bg-emerald-700">
                {copied ? <><Check className="h-4 w-4" /> Kopyalandı</> : <><Copy className="h-4 w-4" /> Kopyala</>}
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Anahtar adı (örn. Shopify Mağazam)"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[#3959F2] focus:outline-none"
          />
          <button onClick={generateKey} disabled={creating}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#3959F2] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2f49d4] disabled:opacity-60">
            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Yeni Anahtar
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {keys.length === 0 && !loading && <p className="text-[13px] text-slate-400 py-3">Henüz anahtar yok.</p>}
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <code className="text-[13px] font-mono text-slate-700">{k.prefix}…</code>
                  {k.revoked && <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 ring-1 ring-slate-200">İptal edildi</span>}
                </div>
                <p className="text-[12px] text-slate-400 mt-0.5">
                  {k.label || "—"} · {formatTrDate(k.createdAt)}{k.lastUsedAt ? ` · son kullanım ${formatTrDate(k.lastUsedAt)}` : " · hiç kullanılmadı"}
                </p>
              </div>
              {!k.revoked && (
                <button onClick={() => revokeKey(k.id)} className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-red-600 hover:bg-red-50">
                  <Trash2 className="h-3.5 w-3.5" /> İptal
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bağlantı Bilgisi (eklenti geliştiricisi için) */}
      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
        <h2 className="text-base font-bold text-slate-800 mb-3">Eklenti Bağlantı Bilgileri</h2>
        <div className="space-y-2 text-[13px] text-slate-600">
          <div className="flex flex-wrap gap-x-2"><span className="font-semibold text-slate-500 w-32 shrink-0">Uç nokta (sipariş):</span> <code className="font-mono text-slate-700">POST {API}/api/integration/orders</code></div>
          <div className="flex flex-wrap gap-x-2"><span className="font-semibold text-slate-500 w-32 shrink-0">Bağlantı testi:</span> <code className="font-mono text-slate-700">GET {API}/api/integration/ping</code></div>
          <div className="flex flex-wrap gap-x-2"><span className="font-semibold text-slate-500 w-32 shrink-0">Kimlik doğrulama:</span> <code className="font-mono text-slate-700">Header: X-Zalusa-Api-Key: &lt;anahtar&gt;</code></div>
        </div>
      </section>

      {/* Senkron Siparişler */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-slate-400" />
            <h2 className="text-base font-bold text-slate-800">Gelen Siparişler</h2>
          </div>
          <button onClick={() => loadOrders()} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium text-slate-500 hover:bg-slate-50">
            <RefreshCw className="h-3.5 w-3.5" /> Yenile
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
        ) : orders.length === 0 ? (
          <p className="text-[13px] text-slate-400 py-3">Eklentiden henüz sipariş gelmedi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-slate-400 border-b border-slate-100">
                  <th className="py-2 pr-3 font-semibold">Platform</th>
                  <th className="py-2 pr-3 font-semibold">Sipariş</th>
                  <th className="py-2 pr-3 font-semibold">Alıcı</th>
                  <th className="py-2 pr-3 font-semibold">Hedef</th>
                  <th className="py-2 pr-3 font-semibold">Tutar</th>
                  <th className="py-2 pr-3 font-semibold">Durum</th>
                  <th className="py-2 font-semibold text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((o) => {
                  const st = STATUS_LABEL[o.status] ?? { text: o.status, cls: "bg-slate-100 text-slate-500 ring-slate-200" };
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 pr-3 capitalize text-slate-700">{o.platform}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{o.orderNumber || o.externalOrderId}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{o.buyerName || "—"}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{o.shipCountry}{o.shipCity ? ` / ${o.shipCity}` : ""}</td>
                      <td className="py-2.5 pr-3 text-slate-600">{o.grandTotal} {o.currency}</td>
                      <td className="py-2.5 pr-3"><span className={`rounded-md px-2 py-0.5 text-[11px] font-medium ring-1 ${st.cls}`}>{st.text}</span></td>
                      <td className="py-2.5 text-right">
                        {o.shipmentId ? (
                          <a href={`/panel/gonderi-olustur?draft=${o.shipmentId}`} className="inline-flex items-center gap-1 text-[12px] font-semibold text-[#3959F2] hover:underline">
                            Taslağa Git <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <button onClick={() => createShipment(o.id)} disabled={busyOrder === o.id}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#3959F2] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#2f49d4] disabled:opacity-60">
                            {busyOrder === o.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <PackagePlus className="h-3.5 w-3.5" />} Gönderi Oluştur
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
