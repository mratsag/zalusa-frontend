"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Menu as MenuIcon, Plus, Pencil, Trash2, Eye, EyeOff, GripVertical, CornerDownRight, CheckCircle2, AlertCircle } from "lucide-react";

import {
  listMenu,
  createMenuItem,
  updateMenuItem,
  toggleMenuItem,
  deleteMenuItem,
  type MenuItem,
} from "@/lib/services/menuService";

function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-6 right-6 z-[70] max-w-sm">
      <div className={`flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-lg ring-1 ${type === "success" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-700 ring-red-200"}`}>
        {type === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
}

const INPUT = "w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40";

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [editId, setEditId] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [parentId, setParentId] = useState<number | "">("");
  const [sort, setSort] = useState(0);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listMenu());
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const tops = useMemo(() => items.filter((i) => i.parent_id == null), [items]);
  const childrenOf = useCallback((pid: number) => items.filter((i) => i.parent_id === pid), [items]);

  const resetForm = () => {
    setEditId(null);
    setLabel("");
    setUrl("");
    setParentId("");
    setSort(0);
  };

  const startEdit = (m: MenuItem) => {
    setEditId(m.id);
    setLabel(m.label);
    setUrl(m.url || "");
    setParentId(m.parent_id ?? "");
    setSort(m.sort_order);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!label.trim()) {
      setToast({ message: "Menü adı boş olamaz", type: "error" });
      return;
    }
    setBusy(true);
    const payload = {
      label: label.trim(),
      url: url.trim(),
      parent_id: parentId === "" ? null : Number(parentId),
      sort_order: sort,
    };
    try {
      if (editId == null) {
        await createMenuItem(payload);
        setToast({ message: "Menü öğesi eklendi", type: "success" });
      } else {
        await updateMenuItem(editId, payload);
        setToast({ message: "Menü öğesi güncellendi", type: "success" });
      }
      resetForm();
      await load();
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Kaydedilemedi", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const onToggle = async (m: MenuItem) => {
    try {
      await toggleMenuItem(m.id);
      setItems((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_active: !x.is_active } : x)));
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Güncellenemedi", type: "error" });
    }
  };

  const onDelete = async (m: MenuItem, isTop: boolean) => {
    const msg = isTop ? "Bu öğeyi ve tüm alt menülerini silmek istediğinize emin misiniz?" : "Bu alt menüyü silmek istediğinize emin misiniz?";
    if (!confirm(msg)) return;
    try {
      await deleteMenuItem(m.id);
      if (editId === m.id) resetForm();
      await load();
      setToast({ message: "Menü öğesi silindi", type: "success" });
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Silinemedi", type: "error" });
    }
  };

  const RowActions = ({ m, isTop }: { m: MenuItem; isTop: boolean }) => (
    <div className="flex shrink-0 items-center gap-1">
      <button onClick={() => startEdit(m)} title="Düzenle" className={`rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-brand-600 ${isTop ? "p-2" : "p-1.5"}`}>
        <Pencil className={isTop ? "h-4 w-4" : "h-3 w-3"} />
      </button>
      <button onClick={() => onToggle(m)} title={m.is_active ? "Gizle" : "Göster"} className={`rounded-lg text-slate-400 transition hover:bg-amber-50 hover:text-amber-600 ${isTop ? "p-2" : "p-1.5"}`}>
        {m.is_active ? <EyeOff className={isTop ? "h-4 w-4" : "h-3 w-3"} /> : <Eye className={isTop ? "h-4 w-4" : "h-3 w-3"} />}
      </button>
      <button onClick={() => onDelete(m, isTop)} title="Sil" className={`rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 ${isTop ? "p-2" : "p-1.5"}`}>
        <Trash2 className={isTop ? "h-4 w-4" : "h-3 w-3"} />
      </button>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <MenuIcon className="h-6 w-6 text-brand-600" /> Header Menü
        </h1>
        <p className="mt-1 text-sm text-slate-500">Site üst menüsündeki öğeleri ekleyin, düzenleyin ve sıralayın. Alt menü eklemek için üst öğe seçin.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Liste */}
        <div className="space-y-3 lg:col-span-2">
          {loading && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">Yükleniyor…</div>}
          {!loading && tops.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">
              <MenuIcon className="mx-auto mb-2 h-8 w-8" />
              Henüz menü öğesi yok. Sağdaki formdan ekleyin.
            </div>
          )}
          {tops.map((ti) => {
            const kids = childrenOf(ti.id);
            return (
              <div key={ti.id} className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${!ti.is_active ? "opacity-50" : ""}`}>
                <div className="flex items-center justify-between gap-4 px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-slate-300" />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-800">{ti.label}</p>
                      <p className="truncate text-xs text-slate-400">{ti.url || "(sadece dropdown)"}</p>
                    </div>
                    {!ti.is_active && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">Gizli</span>}
                    {kids.length > 0 && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-brand-600">{kids.length} alt</span>}
                  </div>
                  <RowActions m={ti} isTop />
                </div>
                {kids.length > 0 && (
                  <div className="border-t border-slate-100 bg-slate-50/50">
                    {kids.map((kid) => (
                      <div key={kid.id} className={`flex items-center justify-between gap-4 py-3 pl-12 pr-5 ${!kid.is_active ? "opacity-50" : ""}`}>
                        <div className="flex min-w-0 items-center gap-2">
                          <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                          <p className="truncate text-sm font-medium text-slate-700">{kid.label}</p>
                          <span className="hidden truncate text-xs text-slate-400 sm:inline">{kid.url || "#"}</span>
                        </div>
                        <RowActions m={kid} isTop={false} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Ekle / Düzenle */}
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              {editId == null ? <Plus className="h-5 w-5 text-brand-600" /> : <Pencil className="h-5 w-5 text-brand-600" />}
              {editId == null ? "Yeni Öğe Ekle" : "Öğe Düzenle"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Menü adı</label>
                <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Örn: Hakkımızda" className={INPUT} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">URL</label>
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/sayfa veya https://…" className={INPUT} />
                <p className="mt-0.5 text-xs text-slate-400">Boş bırakılırsa sadece açılır menü (dropdown) olur.</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Üst menü</label>
                <select value={parentId} onChange={(e) => setParentId(e.target.value === "" ? "" : Number(e.target.value))} className={INPUT}>
                  <option value="">— Ana menü (üst seviye) —</option>
                  {tops.filter((t) => t.id !== editId).map((t) => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
                <p className="mt-0.5 text-xs text-slate-400">Bir üst öğe seçerseniz bu öğe alt menü olur.</p>
              </div>
              {editId != null && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Sıra</label>
                  <input type="number" value={sort} onChange={(e) => setSort(Number(e.target.value))} className={`${INPUT} w-24`} />
                </div>
              )}
              <div className="flex items-center gap-3 pt-1">
                <button onClick={submit} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
                  <Plus className="h-4 w-4" /> {busy ? "Kaydediliyor…" : editId == null ? "Ekle" : "Güncelle"}
                </button>
                {editId != null && (
                  <button onClick={resetForm} className="text-sm font-medium text-slate-500 hover:text-slate-700">İptal</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
