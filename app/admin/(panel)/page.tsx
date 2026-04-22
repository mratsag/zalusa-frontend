"use client";

import React from "react";
import {
  Truck,
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { adminService } from "@/lib/services/adminService";

interface StatCard {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState("overview");
  const [stats, setStats] = React.useState<any>(null);
  const [carriers, setCarriers] = React.useState<any[]>([]);
  const [rates, setRates] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const [s, c, r] = await Promise.all([
          adminService.getCourierStats().catch(() => null),
          adminService.listCarriers().catch(() => []),
          adminService.listExchangeRates().catch(() => []),
        ]);
        setStats(s);
        setCarriers(Array.isArray(c) ? c : []);
        setRates(Array.isArray(r) ? r : []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards: StatCard[] = [
    {
      label: "Toplam Kurye Talebi",
      value: stats?.total ?? "—",
      icon: Truck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      label: "Bekleyen Talepler",
      value: stats?.pending ?? "—",
      icon: Clock,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
    },
    {
      label: "Tamamlanan Talepler",
      value: stats?.completed ?? "—",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      label: "Aktif Kargo Şirketleri",
      value: carriers.filter((c) => c.isActive).length,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard & Raporlar</h1>
          <p className="mt-1 text-sm text-slate-500">Sistem istatistikleri, finansal veriler ve log kayıtları</p>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          {[
            { id: "overview", label: "Genel Bakış" },
            { id: "financials", label: "Finansal Raporlar" },
            { id: "logs", label: "Sistem Logları" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
                activeTab === tab.id 
                  ? "bg-white text-indigo-600 shadow-sm" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl bg-white p-5 ring-1 ring-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.bgColor}`}>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{card.value}</div>
                <div className="text-xs font-medium text-slate-500">{card.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Carriers preview */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Kargo Şirketleri</h2>
            <span className="text-xs font-medium text-slate-400">{carriers.length} şirket</span>
          </div>
          <div className="space-y-3">
            {carriers.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ backgroundColor: c.logoColor || "#6366f1" }}
                  >
                    {c.logoLetter}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{c.carrierName}</div>
                    <div className="text-xs text-slate-500">{c.serviceName}</div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    c.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                  }`}
                >
                  {c.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>
            ))}
            {carriers.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-400">Henüz kargo şirketi yok</div>
            )}
          </div>
        </div>

        {/* Exchange Rates */}
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-900">Döviz Kurları</h2>
            <span className="text-xs font-medium text-slate-400">{rates.length} kur</span>
          </div>
          <div className="space-y-3">
            {rates.slice(0, 5).map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                    <DollarSign className="h-4 w-4" />
                  </div>
                  <div className="text-sm font-semibold text-slate-800">
                    {r.fromCurrency} → {r.toCurrency}
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-900">{r.rate}</span>
              </div>
            ))}
            {rates.length === 0 && (
              <div className="py-6 text-center text-sm text-slate-400">Henüz döviz kuru yok</div>
            )}
          </div>
        </div>
      </div>
      </div>
      )}

      {activeTab === "financials" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <AdminFinancialsTab />
        </div>
      )}

      {activeTab === "logs" && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <AdminSystemLogsTab />
        </div>
      )}
    </div>
  );
}

// ─── Finansal Raporlar Sekmesi ───
function AdminFinancialsTab() {
  const [data, setData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    adminService.getFinancialReports()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const exportExcel = () => {
    if (!data || !data.records) return;
    
    // CSV Header, BOM for UTF-8 Excel support
    let csvContent = "\uFEFFKod,Tarih,Hedef,Tasiyici,Durum,Ciro(TL),Yurt Disi Maliyeti(TL),Yurt Ici Maliyeti(TL),Net Kar(TL)\n";
    
    data.records.forEach((row: any) => {
      csvContent += `${row.tracking_code},${row.date},${row.target_country},${row.carrier},${row.status},${row.revenue},${row.intl_cost},${row.domestic_cost},${row.net_profit}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Zalusa_Finansal_Rapor_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Yükleniyor...</div>;
  if (!data) return <div className="py-12 text-center text-red-500">Veri alınamadı.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Kâr - Zarar ve Çıkan Kargolar</h2>
        <button onClick={exportExcel} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-sm">
          Excel (CSV) İndir
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-1">Toplam Ciro (Müşteri)</div>
          <div className="text-2xl font-extrabold text-slate-900">{(data.total_revenue || 0).toLocaleString("tr-TR", {maximumFractionDigits:2})} ₺</div>
        </div>
        <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-1">Yurt Dışı Maliyeti</div>
          <div className="text-2xl font-extrabold text-red-500">- {(data.total_intl || 0).toLocaleString("tr-TR", {maximumFractionDigits:2})} ₺</div>
        </div>
        <div className="bg-white p-5 rounded-2xl ring-1 ring-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-1">Yurt İçi Maliyeti</div>
          <div className="text-2xl font-extrabold text-red-500">- {(data.total_domestic || 0).toLocaleString("tr-TR", {maximumFractionDigits:2})} ₺</div>
        </div>
        <div className="bg-indigo-600 p-5 rounded-2xl ring-1 ring-indigo-500 shadow-lg shadow-indigo-200">
          <div className="text-sm font-semibold text-indigo-200 mb-1">Tahmini Net Kâr</div>
          <div className="text-2xl font-extrabold text-white">{(data.net_profit || 0).toLocaleString("tr-TR", {maximumFractionDigits:2})} ₺</div>
        </div>
      </div>

      <div className="bg-white ring-1 ring-slate-200 rounded-2xl overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Takip Kodu</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Tarih</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Hedef</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Taşıyıcı</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">Ciro</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">Dış Maliyet</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">İç Maliyet</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-right">Net Kâr</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data.records || []).map((row: any) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-800">{row.tracking_code}</td>
                  <td className="px-4 py-3 text-slate-500">{row.date}</td>
                  <td className="px-4 py-3 font-bold text-slate-700">{row.target_country}</td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">{row.carrier}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">{row.revenue.toFixed(2)} ₺</td>
                  <td className="px-4 py-3 text-right font-medium text-red-500">{row.intl_cost.toFixed(2)} ₺</td>
                  <td className="px-4 py-3 text-right font-medium text-red-500">{row.domestic_cost.toFixed(2)} ₺</td>
                  <td className="px-4 py-3 text-right font-extrabold text-emerald-600">{row.net_profit.toFixed(2)} ₺</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Sistem Logları Sekmesi ───
function AdminSystemLogsTab() {
  const [logs, setLogs] = React.useState<any[]>([]);
  const [filter, setFilter] = React.useState("Tümü");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    adminService.getSystemLogs()
      .then(res => setLogs(res.logs || []))
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = logs.filter(l => filter === "Tümü" || l.carrier === filter);

  if (loading) return <div className="py-12 text-center text-slate-500">Yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Entegrasyon & Sistem Logları</h2>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {["Tümü", "Asset", "PTS", "Basit Kargo"].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-bold rounded shadow-sm transition-all ${filter === f ? 'bg-white text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-white ring-1 ring-slate-200 rounded-2xl overflow-hidden text-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Tarih</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Firma</th>
                <th className="px-4 py-3 font-semibold text-slate-700">Aksiyon</th>
                <th className="px-4 py-3 font-semibold text-slate-700 w-full">Detay (JSON/Text)</th>
                <th className="px-4 py-3 font-semibold text-slate-700 text-center">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log: any, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500 text-xs">{log.date}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      log.carrier === 'PTS' ? 'bg-blue-50 text-blue-700' :
                      log.carrier === 'Basit Kargo' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {log.carrier}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-700">{log.action}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs truncate max-w-md">
                    {log.message}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {log.status === 'success' 
                      ? <span className="inline-block w-2.5 h-2.5 bg-emerald-500 rounded-full" title="Başarılı"></span>
                      : <span className="inline-block w-2.5 h-2.5 bg-red-500 rounded-full" title="Hatalı"></span>
                    }
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">Bu firmaya ait log bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
