"use client";

import React from "react";
import {
  Package,
  Pencil,
  X,
  CheckCircle2,
  AlertCircle,
  Percent,
  DollarSign,
  Truck,
  Loader2,
  Upload,
  ImageIcon,
} from "lucide-react";
import {
  adminService,
  type DomesticMargin,
} from "@/lib/services/adminService";

// ── Toast ────────────────────────────────────────────────────────────────────

function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  React.useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-[fadeInUp_0.3s_ease] max-w-sm">
      <div
        className={`flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg ring-1 ${
          type === "success"
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : "bg-red-50 text-red-700 ring-red-200"
        }`}
      >
        {type === "success" ? (
          <CheckCircle2 className="h-5 w-5 shrink-0" />
        ) : (
          <AlertCircle className="h-5 w-5 shrink-0" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 shrink-0 hover:opacity-70">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Modal ────────────────────────────────────────────────────────────────────

function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── Form input class ─────────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 transition-all";

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DomesticMarginsPage() {
  const [margins, setMargins] = React.useState<DomesticMargin[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Modal state
  const [showModal, setShowModal] = React.useState(false);
  const [editingMargin, setEditingMargin] =
    React.useState<DomesticMargin | null>(null);
  const [form, setForm] = React.useState({
    handlerName: "",
    marginType: "percentage" as "percentage" | "fixed",
    marginValue: "",
    minMargin: "",
    isActive: true,
    logoUrl: "",
  });
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const logoInputRef = React.useRef<HTMLInputElement>(null);

  // ── Load data ────────────────────────────────────────────────────────────

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminService.listDomesticMargins();
      setMargins(res.margins ?? []);
    } catch {
      setMargins([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  // ── Open edit modal ──────────────────────────────────────────────────────

  function openEdit(m: DomesticMargin) {
    setEditingMargin(m);
    setForm({
      handlerName: m.handlerName,
      marginType: m.marginType,
      marginValue: String(m.marginValue),
      minMargin: String(m.minMargin || 0),
      isActive: m.isActive,
      logoUrl: m.logoUrl || "",
    });
    setFormError(null);
    setShowModal(true);
  }

  // ── Submit form ──────────────────────────────────────────────────────────

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!editingMargin) return;

    const marginValue = parseFloat(form.marginValue);
    if (isNaN(marginValue) || marginValue < 0) {
      setFormError("Marj değeri 0 veya pozitif bir sayı olmalıdır.");
      return;
    }

    const payload = {
      handlerName: form.handlerName,
      marginType: form.marginType,
      marginValue,
      minMargin: parseFloat(form.minMargin) || 0,
      isActive: form.isActive,
      logoUrl: form.logoUrl,
    };

    setSaving(true);
    try {
      await adminService.updateDomesticMargin(
        editingMargin.handlerCode,
        payload,
      );
      setToast({ type: "success", text: "Marj başarıyla güncellendi." });
      setShowModal(false);
      await load();
    } catch (err: any) {
      setFormError(err.message || "İşlem başarısız.");
    } finally {
      setSaving(false);
    }
  }

  // ── Loading state ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Yurt İçi Kargo Marjları
        </h1>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Yurt İçi Kargo Marjları
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Basit Kargo API üzerinden gelen yurt içi kargo firmalarının
          fiyatlarına uygulanacak marjları yönetin
        </p>
      </div>

      {/* Info Card */}
      <div className="flex items-start gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/50 px-5 py-4">
        <Truck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
        <div className="text-sm text-indigo-700">
          <strong>Nasıl çalışır?</strong> &mdash; Basit Kargo API&apos;sinden
          gelen ham fiyata, firma bazında belirlediğiniz marj eklenir. Marj
          tanımlı olmayan firmalar için varsayılan <strong>%20</strong> marj
          uygulanır. İlk kez düzenlediğiniz firma otomatik olarak tabloya
          eklenir.
        </div>
      </div>

      {/* Margins Table */}
      {margins.length === 0 ? (
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-slate-100">
          <Package className="inline-block h-10 w-10 text-slate-300" />
          <p className="mt-3 text-sm text-slate-500">
            Henüz marj tanımı bulunmuyor. İlk yurt içi kargo fiyat sorgulaması yapıldığında firmalar otomatik oluşturulacaktır.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                    Kargo Firması
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                    Firma Kodu
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                    Marj Tipi
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                    Marj Değeri
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                    Min. Marj (₺)
                  </th>
                  <th className="px-5 py-3.5 text-left font-semibold text-slate-600">
                    Durum
                  </th>
                  <th className="px-5 py-3.5 text-right font-semibold text-slate-600">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {margins.map((m) => (
                  <tr
                    key={m.id}
                    className="transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {m.logoUrl ? (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 overflow-hidden">
                            <img
                              src={m.logoUrl}
                              alt={m.handlerName}
                              className="h-6 w-6 object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                            {m.handlerCode[0]}
                          </div>
                        )}
                        <span className="font-medium text-slate-800">
                          {m.handlerName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-semibold text-slate-600">
                        {m.handlerCode}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {m.marginType === "percentage" ? (
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <Percent className="h-3.5 w-3.5 text-amber-500" />{" "}
                          Yüzde
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <DollarSign className="h-3.5 w-3.5 text-emerald-500" />{" "}
                          Sabit
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      {m.marginType === "percentage"
                        ? `%${m.marginValue}`
                        : `${m.marginValue} ₺`}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">
                      {m.minMargin > 0 ? `${m.minMargin} ₺` : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      {m.isActive ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 className="h-3 w-3" /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-500">
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => openEdit(m)}
                          className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100 transition-colors"
                          title="Düzenle"
                        >
                          <Pencil className="h-3.5 w-3.5 text-slate-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {margins.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-white p-4 ring-1 ring-slate-100 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {m.logoUrl ? (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200 overflow-hidden">
                        <img
                          src={m.logoUrl}
                          alt={m.handlerName}
                          className="h-6 w-6 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm">
                        {m.handlerCode[0]}
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">
                        {m.handlerName}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        {m.handlerCode}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {m.isActive ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                        Aktif
                      </span>
                    ) : (
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-500">
                        Pasif
                      </span>
                    )}
                    <button
                      onClick={() => openEdit(m)}
                      className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100"
                    >
                      <Pencil className="h-3.5 w-3.5 text-slate-500" />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400">Marj Tipi:</span>
                    <span className="ml-1 font-medium text-slate-700">
                      {m.marginType === "percentage" ? "Yüzde" : "Sabit"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Marj:</span>
                    <span className="ml-1 font-semibold text-slate-800">
                      {m.marginType === "percentage"
                        ? `%${m.marginValue}`
                        : `${m.marginValue} ₺`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Min:</span>
                    <span className="ml-1 font-medium text-slate-700">
                      {m.minMargin > 0 ? `${m.minMargin} ₺` : "—"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ═══ Edit Modal ═══════════════════════════════════════════════════════ */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={
          editingMargin
            ? `${editingMargin.handlerName} — Marj Düzenle`
            : "Marj Düzenle"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {formError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {formError}
            </div>
          )}

          {/* Firma Kodu (readonly) */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Firma Kodu
            </label>
            <div className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm font-mono font-semibold text-slate-600 ring-1 ring-slate-200">
              {editingMargin?.handlerCode}
            </div>
          </div>

          {/* Firma Adı */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Firma Adı
            </label>
            <input
              className={inputCls}
              type="text"
              value={form.handlerName}
              onChange={(e) =>
                setForm((p) => ({ ...p, handlerName: e.target.value }))
              }
              placeholder="Yurtiçi Kargo"
            />
          </div>

          {/* Logo Upload */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">
              Firma Logosu
            </label>
            <div className="flex items-center gap-4">
              {/* Preview */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-50 ring-1 ring-slate-200 overflow-hidden">
                {form.logoUrl ? (
                  <img src={form.logoUrl} alt="Logo" className="h-10 w-10 object-contain" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-slate-300" />
                )}
              </div>
              {/* Upload Button */}
              <div className="flex-1">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !editingMargin) return;
                    setUploading(true);
                    try {
                      const res = await adminService.uploadDomesticLogo(editingMargin.handlerCode, file);
                      setForm((p) => ({ ...p, logoUrl: res.logoUrl }));
                      setToast({ type: "success", text: "Logo yüklendi." });
                    } catch (err: any) {
                      setFormError(err.message || "Logo yüklenemedi.");
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                >
                  {uploading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Yükleniyor...</>
                  ) : (
                    <><Upload className="h-4 w-4" /> Logo Yükle</>
                  )}
                </button>
                <p className="mt-1 text-[11px] text-slate-400">PNG, JPG, SVG — maks. 5MB, BunnyCDN&apos;e yüklenir</p>
              </div>
            </div>
          </div>

          {/* Margin Type */}
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">
              Marj Tipi
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, marginType: "percentage" }))
                }
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                  form.marginType === "percentage"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <Percent className="h-4 w-4" /> Yüzde (%)
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({ ...p, marginType: "fixed" }))
                }
                className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                  form.marginType === "fixed"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <DollarSign className="h-4 w-4" /> Sabit (₺)
              </button>
            </div>
          </div>

          {/* Margin Value */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Marj Değeri{" "}
              {form.marginType === "percentage"
                ? "(örn: 20 → %20)"
                : "(₺ cinsinden)"}
            </label>
            <input
              className={inputCls}
              type="number"
              step="0.01"
              min="0"
              required
              placeholder={
                form.marginType === "percentage" ? "20" : "15.00"
              }
              value={form.marginValue}
              onChange={(e) =>
                setForm((p) => ({ ...p, marginValue: e.target.value }))
              }
            />
          </div>

          {/* Min Margin */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Minimum Marj (₺){" "}
              <span className="text-slate-400 font-normal">
                — Marj bu tutarın altına düşerse bu tutar uygulanır
              </span>
            </label>
            <input
              className={inputCls}
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              value={form.minMargin}
              onChange={(e) =>
                setForm((p) => ({ ...p, minMargin: e.target.value }))
              }
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setForm((p) => ({ ...p, isActive: !p.isActive }))
              }
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.isActive ? "bg-indigo-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  form.isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
            <span className="text-sm font-medium text-slate-700">
              {form.isActive ? "Aktif" : "Pasif"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? "Kaydediliyor..." : "Güncelle"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.text}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
