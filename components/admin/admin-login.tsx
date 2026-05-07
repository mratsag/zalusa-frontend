"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { KeyRound, Mail, Eye, EyeOff, User, Phone } from "lucide-react";
import { adminService } from "@/lib/services/adminService";

export function AdminLogin() {
  const router = useRouter();
  // Login
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);

  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem("zalusa.admin.token");
    if (token) router.replace("/admin");
  }, [router]);

  async function onLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setBusy(true);
    try {
      const data = await adminService.login({ email, password });
      localStorage.setItem("zalusa.admin.token", data.token);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message || "Giriş başarısız.");
    } finally {
      setBusy(false);
    }
  }

  const inputCls =
    "w-full rounded-xl bg-white/[0.06] border border-white/10 py-3 pl-10 pr-4 text-sm text-white placeholder-white/25 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30 transition-all";

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] overflow-auto">
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <div className="overflow-hidden rounded-3xl bg-white/[0.06] backdrop-blur-xl ring-1 ring-white/10 shadow-2xl">
          <div className="p-8 sm:p-10">
            {/* Logo */}
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                <Image src="/logo-ikon.png" alt="Zalusa" width={36} height={36} />
              </div>
              <div>
                <div className="text-center text-xl font-bold text-white">
                  Admin Girişi
                </div>
                <div className="text-center text-sm text-white/50 mt-1">
                  Zalusa Yönetim Paneli
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-300">
                {success}
              </div>
            )}

            <form onSubmit={onLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">E-posta</label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@zalusa.com"
                    required
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/50 mb-2">Şifre</label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Giriş yapılıyor..." : "Giriş Yap"}
              </button>
            </form>

            {/* Info */}
            <div className="mt-6 rounded-xl bg-white/[0.04] border border-white/5 px-4 py-3 text-center">
              <div className="text-xs text-white/40">
                Şifrenizi unuttuysanız, sistem yöneticinize başvurun.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/30">
          © 2026 Zalusa. Tüm hakları saklıdır.
        </div>
      </div>
    </div>
  );
}
