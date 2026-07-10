"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { Images, Plus, Pencil, Trash2, Eye, EyeOff, CheckCircle2, AlertCircle, GripVertical, Upload } from "lucide-react";

import {
  listReferences,
  createReference,
  updateReference,
  toggleReference,
  deleteReference,
  uploadReferenceLogo,
  type Reference,
} from "@/lib/services/referencesService";

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

export default function ReferanslarPage() {
  const [items, setItems] = useState<Reference[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [editId, setEditId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [sort, setSort] = useState(0);
  const [existingLogo, setExistingLogo] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await listReferences());
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Yüklenemedi", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setEditId(null);
    setName("");
    setLink("");
    setSort(0);
    setExistingLogo("");
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const startEdit = (r: Reference) => {
    setEditId(r.id);
    setName(r.name);
    setLink(r.link_url || "");
    setSort(r.sort_order);
    setExistingLogo(r.logo_path);
    setFile(null);
    if (fileRef.current) fileRef.current.value = "";
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const submit = async () => {
    if (!name.trim()) {
      setToast({ message: "Marka adı boş olamaz", type: "error" });
      return;
    }
    if (editId == null && !file) {
      setToast({ message: "Lütfen bir logo görseli seçin", type: "error" });
      return;
    }
    setBusy(true);
    try {
      let logoPath = "";
      if (file) logoPath = await uploadReferenceLogo(file);
      if (editId == null) {
        await createReference({ name: name.trim(), logo_path: logoPath, link_url: link.trim(), sort_order: 0 });
        setToast({ message: "Referans eklendi", type: "success" });
      } else {
        await updateReference(editId, { name: name.trim(), logo_path: logoPath, link_url: link.trim(), sort_order: sort });
        setToast({ message: "Referans güncellendi", type: "success" });
      }
      resetForm();
      await load();
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Kaydedilemedi", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const onToggle = async (r: Reference) => {
    try {
      await toggleReference(r.id);
      setItems((prev) => prev.map((x) => (x.id === r.id ? { ...x, is_active: !x.is_active } : x)));
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Güncellenemedi", type: "error" });
    }
  };

  const onDelete = async (r: Reference) => {
    if (!confirm("Bu referansı silmek istediğinize emin misiniz?")) return;
    try {
      await deleteReference(r.id);
      setItems((prev) => prev.filter((x) => x.id !== r.id));
      if (editId === r.id) resetForm();
      setToast({ message: "Referans silindi", type: "success" });
    } catch (e) {
      setToast({ message: e instanceof Error ? e.message : "Silinemedi", type: "error" });
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <Images className="h-6 w-6 text-brand-600" /> Referanslar
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ana sayfada kayan logolu referans alanını yönetin. Logo yükleyin, sıralayın, gizleyin.{" "}
          <strong>Önerilen:</strong> şeffaf zeminli (PNG/SVG) yatay logolar.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Liste */}
        <div className="space-y-3 lg:col-span-2">
          {loading && <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">Yükleniyor…</div>}
          {!loading && items.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-400">
              <Images className="mx-auto mb-2 h-8 w-8" />
              Henüz referans yok. Sağdaki formdan logo ekleyin.
            </div>
          )}
          {items.map((r) => (
            <div key={r.id} className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${!r.is_active ? "opacity-50" : ""}`}>
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="flex min-w-0 items-center gap-4">
                  <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
                  <div className="flex h-12 w-28 shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-1.5">
                    <img src={r.logo_path} alt={r.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-slate-800">{r.name}</p>
                    <p className="truncate text-xs text-slate-400">{r.link_url || "(link yok)"}</p>
                    <p className="text-[11px] text-slate-300">Sıra: {r.sort_order}</p>
                  </div>
                  {!r.is_active && <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">Gizli</span>}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => startEdit(r)} title="Düzenle" className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-brand-600">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => onToggle(r)} title={r.is_active ? "Gizle" : "Göster"} className="rounded-lg p-2 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600">
                    {r.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => onDelete(r)} title="Sil" className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ekle / Düzenle */}
        <div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-800">
              {editId == null ? <Plus className="h-5 w-5 text-brand-600" /> : <Pencil className="h-5 w-5 text-brand-600" />}
              {editId == null ? "Yeni Referans Ekle" : "Referansı Düzenle"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Marka adı</label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn: Karaköy Güllüoğlu" className={INPUT} />
              </div>

              {editId != null && existingLogo && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Mevcut logo</label>
                  <div className="flex h-14 w-32 items-center justify-center rounded-lg border border-slate-100 bg-slate-50 p-1.5">
                    <img src={existingLogo} alt="" className="max-h-full max-w-full object-contain" />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">
                  {editId == null ? "Logo görseli" : "Logoyu değiştir "}
                  {editId != null && <span className="font-normal text-slate-400">(opsiyonel)</span>}
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:font-medium file:text-brand-600 hover:file:bg-blue-100"
                />
                <p className="mt-1 text-xs text-slate-400">PNG, JPG, WEBP, GIF veya SVG · maks. 3MB. Şeffaf zemin önerilir.</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Link <span className="font-normal text-slate-400">(opsiyonel)</span></label>
                <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" className={INPUT} />
              </div>

              {editId != null && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Sıra</label>
                  <input type="number" value={sort} onChange={(e) => setSort(Number(e.target.value))} className={`${INPUT} w-24`} />
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                <button onClick={submit} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:opacity-60">
                  {busy ? <Upload className="h-4 w-4 animate-pulse" /> : <Plus className="h-4 w-4" />}
                  {busy ? "Yükleniyor…" : editId == null ? "Ekle" : "Güncelle"}
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
