"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  HelpCircle,
  Plus,
  Pencil,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Link as LinkIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { adminService, type HelpItem } from "@/lib/services/adminService";

/* ── Toast ──────────────────────────────────────────────────────────── */
function Toast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error";
  onClose: () => void;
}) {
  useEffect(() => {
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

/* ── Modal ──────────────────────────────────────────────────────────── */
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl mx-4">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── ConfirmModal ───────────────────────────────────────────────────── */
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  label,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  label: string;
  busy: boolean;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl mx-4">
        <h3 className="text-lg font-semibold text-slate-800 mb-2">Silme Onayı</h3>
        <p className="text-sm text-slate-500 mb-6">
          <strong className="text-slate-700">&ldquo;{label}&rdquo;</strong> öğesini silmek istediğinize emin misiniz?
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            İptal
          </button>
          <button onClick={onConfirm} disabled={busy} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
            {busy ? "Siliniyor..." : "Evet, Sil"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Icon seçenekleri ───────────────────────────────────────────────── */
const iconOptions = [
  "HelpCircle", "MessageCircle", "Phone", "Mail", "BookOpen",
  "FileText", "Video", "Headphones", "Shield", "Globe",
  "Zap", "Star", "Info", "AlertTriangle", "Search",
];

const inputCls =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all";

/* ══════════════════════════════════════════════════════════════════════ */
export default function YardimOgeleriPage() {
  const [items, setItems] = useState<HelpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createForm, setCreateForm] = useState({
    title: "", description: "", icon: "HelpCircle", badge: "",
    external: false, link: "", sortOrder: "0",
  });

  // Edit
  const [editItem, setEditItem] = useState<HelpItem | null>(null);
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");
  const [editForm, setEditForm] = useState({
    title: "", description: "", icon: "", badge: "",
    external: false, link: "", sortOrder: "0", isActive: true,
  });

  // Delete
  const [deleteItem, setDeleteItem] = useState<HelpItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  /* ── Fetch ─────────────────────────────────────────────────────── */
  const fetchItems = useCallback(async () => {
    try {
      const data = await adminService.listHelpItems();
      setItems(data);
    } catch {
      setToast({ type: "error", text: "Yardım öğeleri yüklenemedi" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  /* ── Create ────────────────────────────────────────────────────── */
  const onCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateBusy(true);
    setCreateError("");
    try {
      await adminService.createHelpItem({
        title: createForm.title,
        description: createForm.description,
        icon: createForm.icon,
        badge: createForm.badge || undefined,
        external: createForm.external,
        link: createForm.link || undefined,
        sortOrder: parseInt(createForm.sortOrder) || 0,
      });
      setToast({ type: "success", text: "Yardım öğesi oluşturuldu" });
      setShowCreate(false);
      setCreateForm({ title: "", description: "", icon: "HelpCircle", badge: "", external: false, link: "", sortOrder: "0" });
      fetchItems();
    } catch (err: any) {
      setCreateError(err?.message || "Hata oluştu");
    } finally {
      setCreateBusy(false);
    }
  };

  /* ── Edit ──────────────────────────────────────────────────────── */
  const openEdit = (item: HelpItem) => {
    setEditItem(item);
    setEditError("");
    setEditForm({
      title: item.title, description: item.description, icon: item.icon,
      badge: item.badge || "", external: item.external, link: item.link || "",
      sortOrder: String(item.sortOrder), isActive: item.isActive,
    });
  };

  const onEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;
    setEditBusy(true);
    setEditError("");
    try {
      await adminService.updateHelpItem(editItem.id, {
        title: editForm.title,
        description: editForm.description,
        icon: editForm.icon,
        badge: editForm.badge || undefined,
        external: editForm.external,
        link: editForm.link || undefined,
        sortOrder: parseInt(editForm.sortOrder) || 0,
        isActive: editForm.isActive,
      });
      setToast({ type: "success", text: "Yardım öğesi güncellendi" });
      setEditItem(null);
      fetchItems();
    } catch (err: any) {
      setEditError(err?.message || "Hata oluştu");
    } finally {
      setEditBusy(false);
    }
  };

  /* ── Delete ────────────────────────────────────────────────────── */
  const onDeleteConfirm = async () => {
    if (!deleteItem) return;
    setDeleteBusy(true);
    try {
      await adminService.deleteHelpItem(deleteItem.id);
      setToast({ type: "success", text: "Yardım öğesi silindi" });
      setDeleteItem(null);
      fetchItems();
    } catch {
      setToast({ type: "error", text: "Silme başarısız" });
    } finally {
      setDeleteBusy(false);
    }
  };

  /* ── Toggle Status ─────────────────────────────────────────────── */
  const toggleStatus = async (item: HelpItem) => {
    try {
      await adminService.updateHelpItemStatus(item.id, { isActive: !item.isActive });
      setToast({ type: "success", text: item.isActive ? "Pasif yapıldı" : "Aktif yapıldı" });
      fetchItems();
    } catch {
      setToast({ type: "error", text: "Durum güncellenemedi" });
    }
  };

  /* ── UI ─────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-indigo-600">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Yardım Öğeleri</h1>
            <p className="text-sm text-slate-500">Kullanıcılara gösterilen yardım kartlarını yönetin</p>
          </div>
        </div>
        <button
          onClick={() => { setShowCreate(true); setCreateError(""); }}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-all hover:shadow-lg"
        >
          <Plus className="h-4 w-4" />
          Yeni Öğe
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-indigo-200 border-t-indigo-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <HelpCircle className="h-12 w-12 mb-3" />
          <p className="text-sm font-medium">Henüz yardım öğesi eklenmemiş</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50/50 transition-colors">
                {/* Icon */}
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-500">
                  <HelpCircle className="h-5 w-5" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.title}</p>
                    {item.badge && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        {item.badge}
                      </span>
                    )}
                    {item.external && <ExternalLink className="h-3.5 w-3.5 text-slate-400" />}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{item.description}</p>
                  {item.link && (
                    <p className="text-[10px] text-indigo-400 truncate mt-0.5 flex items-center gap-1">
                      <LinkIcon className="h-3 w-3" /> {item.link}
                    </p>
                  )}
                </div>

                {/* Sort order */}
                <span className="flex items-center gap-1.5 text-xs text-slate-400 tabular-nums shrink-0">
                  Sıra: <span className="font-semibold text-slate-600">{item.sortOrder}</span>
                </span>

                {/* Status badge */}
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold cursor-pointer transition-colors ${
                    item.isActive
                      ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      : "bg-red-50 text-red-500 hover:bg-red-100"
                  }`}
                  onClick={() => toggleStatus(item)}
                  title="Durumu değiştirmek için tıklayın"
                >
                  {item.isActive ? "Aktif" : "Pasif"}
                </span>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(item)}
                    className="grid h-8 w-8 place-items-center rounded-lg hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 transition-colors"
                    title="Düzenle"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteItem(item)}
                    className="grid h-8 w-8 place-items-center rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Create Modal ────────────────────────────────────────── */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Yeni Yardım Öğesi">
        <form onSubmit={onCreateSubmit} className="space-y-4">
          {createError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" /> {createError}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Başlık <span className="text-red-400">*</span></label>
            <input className={inputCls} placeholder="Örn. SSS" value={createForm.title} onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Açıklama <span className="text-red-400">*</span></label>
            <textarea className={inputCls + " min-h-[80px]"} placeholder="Yardım öğesinin açıklaması" value={createForm.description} onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">İkon <span className="text-red-400">*</span></label>
              <select className={inputCls} value={createForm.icon} onChange={(e) => setCreateForm((p) => ({ ...p, icon: e.target.value }))}>
                {iconOptions.map((ic) => (<option key={ic} value={ic}>{ic}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Rozet</label>
              <input className={inputCls} placeholder="Yeni, Popüler..." value={createForm.badge} onChange={(e) => setCreateForm((p) => ({ ...p, badge: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Link</label>
              <input className={inputCls} placeholder="https://..." value={createForm.link} onChange={(e) => setCreateForm((p) => ({ ...p, link: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Sıra</label>
              <input className={inputCls} type="number" min="0" value={createForm.sortOrder} onChange={(e) => setCreateForm((p) => ({ ...p, sortOrder: e.target.value }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={createForm.external} onChange={(e) => setCreateForm((p) => ({ ...p, external: e.target.checked }))} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm text-slate-600">Harici link (yeni sekmede açılır)</span>
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">İptal</button>
            <button type="submit" disabled={createBusy} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">{createBusy ? "Oluşturuluyor..." : "Oluştur"}</button>
          </div>
        </form>
      </Modal>

      {/* ── Edit Modal ──────────────────────────────────────────── */}
      <Modal open={!!editItem} onClose={() => setEditItem(null)} title={`Düzenle — ${editItem?.title ?? ""}`}>
        <form onSubmit={onEditSubmit} className="space-y-4">
          {editError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 shrink-0" /> {editError}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Başlık <span className="text-red-400">*</span></label>
            <input className={inputCls} value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Açıklama <span className="text-red-400">*</span></label>
            <textarea className={inputCls + " min-h-[80px]"} value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">İkon</label>
              <select className={inputCls} value={editForm.icon} onChange={(e) => setEditForm((p) => ({ ...p, icon: e.target.value }))}>
                {iconOptions.map((ic) => (<option key={ic} value={ic}>{ic}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Rozet</label>
              <input className={inputCls} value={editForm.badge} onChange={(e) => setEditForm((p) => ({ ...p, badge: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Link</label>
              <input className={inputCls} value={editForm.link} onChange={(e) => setEditForm((p) => ({ ...p, link: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Sıra</label>
              <input className={inputCls} type="number" min="0" value={editForm.sortOrder} onChange={(e) => setEditForm((p) => ({ ...p, sortOrder: e.target.value }))} />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={editForm.external} onChange={(e) => setEditForm((p) => ({ ...p, external: e.target.checked }))} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-sm text-slate-600">Harici link</span>
          </label>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-2">Durum</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setEditForm((p) => ({ ...p, isActive: true }))} className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition-colors ${editForm.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>✅ Aktif</button>
              <button type="button" onClick={() => setEditForm((p) => ({ ...p, isActive: false }))} className={`flex-1 rounded-lg border py-2 text-sm font-semibold transition-colors ${!editForm.isActive ? "border-red-200 bg-red-50 text-red-600" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}>🚫 Pasif</button>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setEditItem(null)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">İptal</button>
            <button type="submit" disabled={editBusy} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">{editBusy ? "Kaydediliyor..." : "Kaydet"}</button>
          </div>
        </form>
      </Modal>

      {/* ── Delete Confirm ──────────────────────────────────────── */}
      <ConfirmModal open={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={onDeleteConfirm} label={deleteItem?.title ?? ""} busy={deleteBusy} />

      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.text} onClose={() => setToast(null)} />}
    </div>
  );
}
