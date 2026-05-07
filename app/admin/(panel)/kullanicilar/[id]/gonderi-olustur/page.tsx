"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Package, Loader2 } from "lucide-react";
import { adminService } from "@/lib/services/adminService";
import { ShipmentWizardCore } from "@/app/panel/gonderi-olustur/page";

export default function AdminGonderiOlusturPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const [userName, setUserName] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const data = await adminService.getUserShipments(userId);
        if (data.user) {
          setUserName(`${data.user.firstName} ${data.user.lastName}`);
        }
      } catch (err: any) {
        setError(err.message || "Kullanıcı bilgileri yüklenemedi");
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500">Kullanıcı bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Geri Dön
        </button>
        <div className="rounded-2xl bg-white p-12 text-center ring-1 ring-red-100">
          <Package className="inline-block h-10 w-10 text-red-300" />
          <p className="mt-3 text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={() => router.push(`/admin/kullanicilar/${userId}`)} className="flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
          <ArrowLeft className="h-4 w-4" /> {userName} &mdash; Kullanıcıya Dön
        </button>
      </div>

      {/* Admin Info Banner */}
      <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 px-5 py-3 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100">
          <Package className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-indigo-900">
            Admin Kargo Oluşturma
          </p>
          <p className="text-xs text-indigo-600">
            <span className="font-medium">{userName}</span> adına kargo oluşturuyorsunuz &middot; Ödeme otomatik olarak &quot;Admin Onaylı&quot; olarak işlenecektir
          </p>
        </div>
      </div>

      {/* Wizard — aynı bileşen, admin modunda */}
      <ShipmentWizardCore
        adminMode={true}
        adminUserId={userId}
        adminUserName={userName}
      />
    </div>
  );
}
