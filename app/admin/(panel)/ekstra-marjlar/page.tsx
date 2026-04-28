"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Percent,
  Banknote,
  Truck,
  Weight,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const TOKEN_KEY = "zalusa.admin.token";

function adminHeaders(): Record<string, string> {
  const token = globalThis.localStorage?.getItem(TOKEN_KEY) ?? "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

/* ── Types ────────────────────────────────────────────────────── */
interface ExtraMargin {
  id: number;
  marginCategory: string;
  label: string;
  marginType: string;
  marginValue: number;
  carrierId: string | null;
  minDesi: number | null;
  maxDesi: number | null;
  isActive: boolean;
  carrierName: string;
  createdAt: string;
  updatedAt: string;
}

interface CarrierOption {
  id: string;
  carrierName: string;
  serviceName: string;
}

/* ── Toast ────────────────────────────────────────────────────── */
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-[fadeInUp_0.3s_ease] max-w-sm">
      <div className={`flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg ring-1 ${type === "success" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
        {type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 shrink-0 hover:opacity-70"><X className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

/* ── Modal ────────────────────────────────────────────────────── */
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl mx-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100 text-slate-400"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";

const categoryLabels: Record<string, string> = {
  desi_margin: "Desi Farkı Marjı",
  overhead: "Genel Gider Marjı",
};

/* ══════════════════════════════════════════════════════════════ */
export default function ExtraMarjlarPage() {
  const [items, setItems] = useState<ExtraMargin[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [tab, setTab] = useState<"all" | "desi_margin" | "overhead">("all");

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const emptyForm = { marginCategory: "desi_margin", label: "", marginType: "percentage", marginValue: "", carrierId: "", minDesi: "", maxDesi: "" };
  const [createForm, setCreateForm] = useState(emptyForm);

  // Edit
  const [editItem, setEditItem] = useState<ExtraMargin | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({ ...emptyForm, isActive: true });

  // Carrier list for dropdown
  const [carriers, setCarriers] = useState<CarrierOption[]>([]);

  // Delete
  const [deleteItem, setDeleteItem] = useState<ExtraMargin | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  /* ── Fetch ──────────────────────────────────────────────── */
  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/extra-margins`, { headers: adminHeaders() });
      const data = await res.json();
      setItems(data.margins || []);
    } catch { setToast({ type: "error", text: "Marjlar yüklenemedi" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  // Fetch carriers for dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/admin/carriers`, { headers: adminHeaders() });
        const data = await res.json();
        setCarriers(Array.isArray(data) ? data : []);
      } catch { /* ignore */ }
    })();
  }, []);

  const filtered = tab === "all" ? items : items.filter((i) => i.marginCategory === tab);

  /* ── Create ─────────────────────────────────────────────── */
  const onCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateBusy(true); setCreateError("");
    try {
      const body: any = {
        marginCategory: createForm.marginCategory,
        label: createForm.label,
        marginType: createForm.marginType,
        marginValue: parseFloat(createForm.marginValue) || 0,
      };
      if (createForm.carrierId) body.carrierId = createForm.carrierId;
      if (createForm.minDesi) body.minDesi = parseFloat(createForm.minDesi);
      if (createForm.maxDesi) body.maxDesi = parseFloat(createForm.maxDesi);
      const res = await fetch(`${API}/api/admin/extra-margins`, { method: "POST", headers: adminHeaders(), body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Hata"); }
      setToast({ type: "success", text: "Ekstra marj oluşturuldu" });
      setShowCreate(false); setCreateForm(emptyForm); fetchItems();
    } catch (err: any) { setCreateError(err.message); }
    finally { setCreateBusy(false); }
  };

  /* ── Edit ───────────────────────────────────────────────── */
  const openEdit = (item: ExtraMargin) => {
    setEditItem(item); setEditError("");
    setEditForm({
      marginCategory: item.marginCategory, label: item.label,
      marginType: item.marginType, marginValue: String(item.marginValue),
      carrierId: item.carrierId || "", minDesi: item.minDesi != null ? String(item.minDesi) : "",
      maxDesi: item.maxDesi != null ? String(item.maxDesi) : "", isActive: item.isActive,
    });
  };

  const onEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setEditBusy(true); setEditError("");
    try {
      const body: any = {
        marginCategory: editForm.marginCategory, label: editForm.label,
        marginType: editForm.marginType, marginValue: parseFloat(editForm.marginValue) || 0,
        isActive: editForm.isActive,
      };
      if (editForm.carrierId) body.carrierId = editForm.carrierId;
      if (editForm.minDesi) body.minDesi = parseFloat(editForm.minDesi);
      if (editForm.maxDesi) body.maxDesi = parseFloat(editForm.maxDesi);
      const res = await fetch(`${API}/api/admin/extra-margins/${editItem.id}`, { method: "PUT", headers: adminHeaders(), body: JSON.stringify(body) });
      if (!res.ok) { const d = await res.json(); throw new Error(d.error || "Hata"); }
      setToast({ type: "success", text: "Marj güncellendi" }); setEditItem(null); fetchItems();
    } catch (err: any) { setEditError(err.message); }
    finally { setEditBusy(false); }
  };

  /* ── Delete ─────────────────────────────────────────────── */
  const onDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeleteBusy(true);
    try {
      await fetch(`${API}/api/admin/extra-margins/${deleteItem.id}`, { method: "DELETE", headers: adminHeaders() });
      setToast({ type: "success", text: "Marj silindi" }); setDeleteItem(null); fetchItems();
    } catch { setToast({ type: "error", text: "Silme başarısız" }); }
    finally { setDeleteBusy(false); }
  };

  /* ── Form rendering helper ref ───────────────────────── */
  const renderFormFields = (form: any, setForm: any) => (
    <MarginFormFields form={form} setForm={setForm} carriers={carriers} />
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-100 text-amber-600">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Ekstra Marjlar</h1>
            <p className="text-sm text-slate-500">Desi farkı koruma ve genel gider marjlarını yönetin</p>
          </div>
        </div>
        <button onClick={() => { setShowCreate(true); setCreateError(""); }} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-all hover:shadow-lg">
          <Plus className="h-4 w-4" /> Yeni Marj
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {([["all","Tümü"],["desi_margin","Desi Farkı"],["overhead","Genel Gider"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === key ? "bg-indigo-600 text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            {label} {key !== "all" && <span className="ml-1 text-xs opacity-70">({items.filter(i => i.marginCategory === key).length})</span>}
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm mb-1"><Weight className="h-4 w-4" /> Desi Farkı Marjı</div>
          <p className="text-xs text-amber-600">Kullanıcı yanlış desi girerse oluşacak zararı karşılamak için fiyata eklenen ekstra maliyet.</p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm mb-1"><Banknote className="h-4 w-4" /> Genel Gider Marjı</div>
          <p className="text-xs text-blue-600">MSDS gibi belge masrafları, operasyonel maliyetler için fiyata eklenen ek maliyet.</p>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" /></div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <DollarSign className="h-12 w-12 mb-3" />
          <p className="text-sm font-medium">Henüz ekstra marj tanımlanmamış</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.marginCategory === "desi_margin" ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"}`}>
                  {item.marginCategory === "desi_margin" ? <Weight className="h-5 w-5" /> : <Banknote className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800">{item.label || categoryLabels[item.marginCategory]}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.marginCategory === "desi_margin" ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                      {categoryLabels[item.marginCategory]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1">{item.marginType === "percentage" ? <Percent className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}{item.marginType === "percentage" ? `%${item.marginValue}` : `${item.marginValue}₺`}</span>
                    {item.carrierName && <span className="flex items-center gap-1"><Truck className="h-3 w-3" />{item.carrierName}</span>}
                    {item.minDesi != null && item.maxDesi != null && <span>{item.minDesi}-{item.maxDesi} desi</span>}
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${item.isActive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>{item.isActive ? "Aktif" : "Pasif"}</span>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => openEdit(item)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition-colors" title="Düzenle"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDeleteItem(item)} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors" title="Sil"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Yeni Ekstra Marj">
        <form onSubmit={onCreateSubmit} className="space-y-4">
          {createError && <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4 shrink-0" />{createError}</div>}
          {renderFormFields(createForm, setCreateForm)}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">İptal</button>
            <button type="submit" disabled={createBusy} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">{createBusy ? "Oluşturuluyor..." : "Oluştur"}</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={`Düzenle — ${editItem?.label || "Marj"}`}>
        <form onSubmit={onEditSubmit} className="space-y-4">
          {editError && <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"><AlertCircle className="h-4 w-4 shrink-0" />{editError}</div>}
          {renderFormFields(editForm, setEditForm)}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Durum</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditForm((p: any) => ({ ...p, isActive: true }))} className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition-colors ${editForm.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>Aktif</button>
              <button type="button" onClick={() => setEditForm((p: any) => ({ ...p, isActive: false }))} className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition-colors ${!editForm.isActive ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>Pasif</button>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditItem(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">İptal</button>
            <button type="submit" disabled={editBusy} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">{editBusy ? "Kaydediliyor..." : "Kaydet"}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      {deleteItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl mx-4">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Silme Onayı</h3>
            <p className="text-sm text-slate-500 mb-6"><strong className="text-slate-700">&ldquo;{deleteItem.label || categoryLabels[deleteItem.marginCategory]}&rdquo;</strong> marjını silmek istediğinize emin misiniz?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteItem(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">İptal</button>
              <button onClick={onDeleteConfirm} disabled={deleteBusy} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">{deleteBusy ? "Siliniyor..." : "Evet, Sil"}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast type={toast.type} message={toast.text} onClose={() => setToast(null)} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Stable Form Fields — defined OUTSIDE parent to prevent focus loss
// ═════════════════════════════════════════════════════════════════════════════

function MarginFormFields({ form, setForm, carriers }: {
  form: any;
  setForm: any;
  carriers: CarrierOption[];
}) {
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Kategori <span className="text-red-400">*</span></label>
          <select className={inputCls} value={form.marginCategory} onChange={(e) => setForm((p: any) => ({ ...p, marginCategory: e.target.value }))}>
            <option value="desi_margin">Desi Farkı Marjı</option>
            <option value="overhead">Genel Gider Marjı</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Etiket</label>
          <input className={inputCls} placeholder="Örn. UPS Desi Koruma" value={form.label} onChange={(e) => setForm((p: any) => ({ ...p, label: e.target.value }))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Marj Tipi <span className="text-red-400">*</span></label>
          <select className={inputCls} value={form.marginType} onChange={(e) => setForm((p: any) => ({ ...p, marginType: e.target.value }))}>
            <option value="percentage">Yüzde (%)</option>
            <option value="fixed">Sabit (₺)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">Değer <span className="text-red-400">*</span></label>
          <input className={inputCls} type="number" step="0.01" min="0" placeholder={form.marginType === "percentage" ? "Örn. 7" : "Örn. 80"} value={form.marginValue} onChange={(e) => setForm((p: any) => ({ ...p, marginValue: e.target.value }))} required />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">Kargo Firması (opsiyonel)</label>
        <select className={inputCls} value={form.carrierId} onChange={(e) => setForm((p: any) => ({ ...p, carrierId: e.target.value }))}>
          <option value="">Tümü (boş = tüm firmalar)</option>
          {carriers.map((c) => (
            <option key={c.id} value={c.id}>{c.carrierName} / {c.serviceName} ({c.id})</option>
          ))}
        </select>
      </div>
      {form.marginCategory === "desi_margin" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Min Desi</label>
            <input className={inputCls} type="number" step="0.1" min="0" placeholder="0" value={form.minDesi} onChange={(e) => setForm((p: any) => ({ ...p, minDesi: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Max Desi</label>
            <input className={inputCls} type="number" step="0.1" min="0" placeholder="999" value={form.maxDesi} onChange={(e) => setForm((p: any) => ({ ...p, maxDesi: e.target.value }))} />
          </div>
        </div>
      )}
    </>
  );
}

