"use client";

import React from "react";
import {
  Banknote,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Mail,
  Package,
  Globe,
  Loader2,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";
import { adminService, type BankTransfer } from "@/lib/services/adminService";

const statusConfig: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "Onay Bekliyor", color: "bg-amber-50 text-amber-700 ring-amber-200", icon: Clock },
  approved: { label: "Onaylandı", color: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: CheckCircle2 },
  rejected: { label: "Reddedildi", color: "bg-red-50 text-red-600 ring-red-200", icon: XCircle },
};

export default function HavaleOnaylariPage() {
  const [transfers, setTransfers] = React.useState<BankTransfer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("pending");
  const [processing, setProcessing] = React.useState<number | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  // Reject modal state
  const [rejectModal, setRejectModal] = React.useState<{ id: number; trackingCode: string } | null>(null);
  const [rejectNote, setRejectNote] = React.useState("");

  // Approve note modal state
  const [approveModal, setApproveModal] = React.useState<{ id: number; trackingCode: string; amount: number } | null>(null);
  const [approveNote, setApproveNote] = React.useState("");

  async function load(status: string) {
    setLoading(true);
    try {
      const data = await adminService.listBankTransfers(status);
      setTransfers(data.transfers || []);
    } catch {
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load(activeTab);
  }, [activeTab]);

  async function handleApprove() {
    if (!approveModal) return;
    setProcessing(approveModal.id);
    setError(null);
    try {
      await adminService.approveBankTransfer(approveModal.id, approveNote);
      setSuccess(`Havale #${approveModal.id} onaylandı. Kargo entegrasyonları başlatıldı.`);
      setApproveModal(null);
      setApproveNote("");
      load(activeTab);
    } catch (err: any) {
      setError(err.message || "Onaylama hatası");
    } finally {
      setProcessing(null);
    }
  }

  async function handleReject() {
    if (!rejectModal || !rejectNote.trim()) return;
    setProcessing(rejectModal.id);
    setError(null);
    try {
      await adminService.rejectBankTransfer(rejectModal.id, rejectNote.trim());
      setSuccess(`Havale #${rejectModal.id} reddedildi.`);
      setRejectModal(null);
      setRejectNote("");
      load(activeTab);
    } catch (err: any) {
      setError(err.message || "Red hatası");
    } finally {
      setProcessing(null);
    }
  }

  const tabs = [
    { key: "pending", label: "Bekleyenler", count: activeTab === "pending" ? transfers.length : null },
    { key: "approved", label: "Onaylananlar", count: null },
    { key: "rejected", label: "Reddedilenler", count: null },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
            <Banknote className="h-5 w-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Havale Onayları</h1>
            <p className="text-sm text-slate-500">
              Kullanıcıların havale/EFT bildirimlerini onaylayın veya reddedin
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto shrink-0 hover:opacity-70">✕</button>
        </div>
      )}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto shrink-0 hover:opacity-70">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-white ring-1 ring-slate-100" />
          ))}
        </div>
      ) : transfers.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-100">
          <Banknote className="inline-block h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            {activeTab === "pending"
              ? "Bekleyen havale bildirimi yok"
              : activeTab === "approved"
              ? "Onaylanmış havale bildirimi yok"
              : "Reddedilmiş havale bildirimi yok"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transfers.map((t) => {
            const statusInfo = statusConfig[t.status] || statusConfig.pending;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={t.id}
                className="rounded-2xl bg-white p-5 ring-1 ring-slate-100 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Top Row */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-100">
                      <Banknote className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-800">
                        Havale #{t.id}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(t.createdAt).toLocaleDateString("tr-TR", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Amount */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-slate-900">
                        ₺{t.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${statusInfo.color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium">{t.userName || "—"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium truncate">{t.userEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Package className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium">{t.trackingCode || `SHP-${t.shipmentId}`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Globe className="h-3.5 w-3.5 text-slate-400" />
                    <span className="font-medium">{t.receiverCountry || "—"} • {t.shipmentType || "—"}</span>
                  </div>
                </div>

                {/* Description */}
                {t.description && (
                  <div className="mt-3 flex items-start gap-2 rounded-xl bg-blue-50/60 px-4 py-2.5 ring-1 ring-blue-100">
                    <MessageSquare className="h-3.5 w-3.5 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider mb-0.5">Müşteri Açıklaması</div>
                      <div className="text-xs text-blue-800">{t.description}</div>
                    </div>
                  </div>
                )}

                {/* Admin Note (for approved/rejected) */}
                {t.adminNote && (
                  <div className="mt-2 rounded-xl bg-slate-100 px-4 py-2 text-xs text-slate-600">
                    📝 Admin Notu: {t.adminNote}
                  </div>
                )}

                {/* Actions (only for pending) */}
                {t.status === "pending" && (
                  <div className="mt-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => setRejectModal({ id: t.id, trackingCode: t.trackingCode })}
                      disabled={processing === t.id}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Reddet
                    </button>
                    <button
                      onClick={() => setApproveModal({ id: t.id, trackingCode: t.trackingCode, amount: t.amount })}
                      disabled={processing === t.id}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-sm transition-colors disabled:opacity-50"
                    >
                      {processing === t.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      Onayla & Kargoyu Başlat
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════ Approve Modal ═══════ */}
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Havaleyi Onayla</h3>
                <p className="text-xs text-slate-500">
                  ₺{approveModal.amount.toFixed(2)} — {approveModal.trackingCode}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700">
              ⚠️ Onay verdiğinizde kargo entegrasyonları (PTS/Asset/Basit Kargo) otomatik olarak başlatılacaktır.
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Admin Notu (Opsiyonel)
              </label>
              <input
                type="text"
                value={approveNote}
                onChange={(e) => setApproveNote(e.target.value)}
                placeholder="Ödeme kontrol edildi..."
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setApproveModal(null); setApproveNote(""); }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                İptal
              </button>
              <button
                onClick={handleApprove}
                disabled={processing !== null}
                className="flex-1 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Onayla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ Reject Modal ═══════ */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Havaleyi Reddet</h3>
                <p className="text-xs text-slate-500">{rejectModal.trackingCode}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Red Sebebi <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Havale tutarı eşleşmiyor, IBAN doğrulanamadı vb."
                rows={3}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setRejectModal(null); setRejectNote(""); }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                İptal
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectNote.trim() || processing !== null}
                className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing !== null ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Reddet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
