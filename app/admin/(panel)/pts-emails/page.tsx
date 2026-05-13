"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, Mail, Loader2, Pencil } from "lucide-react";
import { adminService } from "@/lib/services/adminService";

interface PTSEmail {
  id: number;
  email: string;
}

export default function PTSEmailsPage() {
  const [emails, setEmails] = useState<PTSEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [newEmail, setNewEmail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState("");

  const [error, setError] = useState("");

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const data = await adminService.listPTSEmails();
      setEmails(data);
    } catch (err: any) {
      console.error(err);
      setError("Veriler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    try {
      setSaving(true);
      setError("");
      await adminService.createPTSEmail({ email: newEmail });
      setNewEmail("");
      fetchEmails();
    } catch (err: any) {
      setError(err.message || "Eklenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editEmail.trim()) return;
    try {
      setSaving(true);
      setError("");
      await adminService.updatePTSEmail(id, { email: editEmail });
      setEditingId(null);
      fetchEmails();
    } catch (err: any) {
      setError(err.message || "Güncellenirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bu e-postayı silmek istediğinize emin misiniz?")) return;
    try {
      setSaving(true);
      setError("");
      await adminService.deletePTSEmail(id);
      fetchEmails();
    } catch (err: any) {
      setError(err.message || "Silinirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Mail className="h-6 w-6 text-indigo-600" />
          PTS MSDS Mail Gönderimi
        </h1>
        <p className="text-slate-500 mt-2">
          Kargo oluşturulduğunda MSDS belgesinin kopyasının gönderileceği e-posta adreslerini yönetin.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* Ekleme Formu */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Yeni E-posta Ekle</h2>
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="ornek@pts.net"
            required
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="submit"
            disabled={saving || !newEmail.trim()}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Ekle
          </button>
        </form>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            Yükleniyor...
          </div>
        ) : emails.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Kayıtlı e-posta adresi bulunmuyor. Eklenmediğinde varsayılan olarak "nilay.yavas@pts.net" adresi kullanılır.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {emails.map((item) => (
              <li key={item.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                {editingId === item.id ? (
                  <div className="flex-1 flex gap-3 mr-4">
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 outline-none focus:border-indigo-500 text-sm"
                    />
                    <button
                      onClick={() => handleUpdate(item.id)}
                      disabled={saving}
                      className="rounded-lg bg-green-500 px-4 py-1.5 text-xs font-semibold text-white hover:bg-green-600"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg bg-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                    >
                      İptal
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-800 font-medium">{item.email}</span>
                )}

                {editingId !== item.id && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingId(item.id);
                        setEditEmail(item.email);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={saving}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
