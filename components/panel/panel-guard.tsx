"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ToastProvider } from "@/components/ui/toast";

export function PanelGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = localStorage.getItem("zalusa.token");
    if (!token) {
      router.replace("/giris");
    }
  }, [router, pathname]);

  return <ToastProvider>{children}</ToastProvider>;
}
