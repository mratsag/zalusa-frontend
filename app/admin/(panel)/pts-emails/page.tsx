"use client";

import React, { useState, useEffect } from "react";
import { Mail, Loader2, Save, FileText, Users, Settings } from "lucide-react";
import { adminService } from "@/lib/services/adminService";

export default function PTSEmailsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [emails, setEmails] = useState("");
  const [metin, setMetin] = useState("");
  const [cc, setCc] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPTSEmailSettings();
      if (data) {
        setEmails(data.emails || "");
        setMetin(data.metin || "");
        setCc(data.cc || "");
      }
    } catch (err: any) {
      console.error(err);
      setError("Ayarlar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emails.trim()) {
      setError("Lütfen en az bir alıcı e-posta adresi girin.");
      return;
    }
    
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      await adminService.savePTSEmailSettings({ emails, metin, cc });
      setSuccess("Ayarlar başarıyla kaydedildi!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Kaydedilirken hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-indigo-600" />
          PTS Kargo Belge Mail Ayarları
        </h1>
        <p className="text-slate-500 mt-2">
          PTS kargo oluşturulduğunda belgeler (MSDS, INVOICE vb.) aşağıdaki ayarlara göre otomatik olarak gönderilir. 
          Sistem sadece bu tek konfigürasyonu okur.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-600 rounded-xl text-sm font-medium border border-green-100 flex items-center gap-2">
          <Save className="h-4 w-4" />
          {success}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-indigo-500" />
            <p>Ayarlar Yükleniyor...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1 text-slate-400" /> Alıcı E-postalar (To) *
                </label>
                <textarea
                  value={emails}
                  onChange={(e) => setEmails(e.target.value)}
                  placeholder="ornek1@pts.net, ornek2@pts.net"
                  rows={3}
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
                />
                <p className="text-xs text-slate-500 mt-2">Mailin asıl gideceği kişiler. Birden fazlaysa virgülle ayırın.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Users className="inline h-4 w-4 mr-1 text-slate-400" /> Bilgi E-postaları (CC)
                </label>
                <textarea
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="ali@firma.com, veli@firma.com"
                  rows={3}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
                />
                <p className="text-xs text-slate-500 mt-2"><strong>yusuf@semengineer.com</strong> her zaman sabittir. Ek olarak eklemek istediklerinizi virgülle ayırın.</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <FileText className="inline h-4 w-4 mr-1 text-slate-400" /> E-posta Metin İçeriği (Gövde)
              </label>
              <textarea
                value={metin}
                onChange={(e) => setMetin(e.target.value)}
                placeholder="Merhaba, Zalusa sistemi üzerinden yeni bir kargo oluşturulmuştur. Ekteki belgeleri incelemenizi rica ederiz."
                rows={5}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-sm resize-y"
              />
              <p className="text-xs text-slate-500 mt-2">
                Mailin içine eklenecek sabit metin. PTS AWB barcode numarası ve takip linki otomatik olarak bu metne eklenir.
              </p>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={saving || !emails.trim()}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-lg disabled:opacity-50 disabled:hover:shadow-none"
              >
                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                Ayarları Kaydet
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mt-6 p-5 bg-amber-50 rounded-xl border border-amber-200">
        <h3 className="text-sm font-bold text-amber-800 mb-3">📌 Nasıl Çalışır?</h3>
        <ul className="text-sm text-amber-700 space-y-2">
          <li>• PTS kargo oluşturulduğu anda, shipment&apos;a ait belge varsa <strong>otomatik</strong> e-posta gönderilir.</li>
          <li>• Gidecek olan e-posta, tamamen buradaki ayarlara göre şekillenir. Başka bir işlem yapmanıza gerek yoktur.</li>
          <li>• Mailde <strong>PTS AWB Barcode numarası</strong> otomatik olarak yer alır.</li>
          <li>• Metin boş bırakılırsa varsayılan &quot;Zalusa üzerinden oluşturulan kargo...&quot; tarzı bir sistem metni gönderilir.</li>
        </ul>
      </div>
    </div>
  );
}
