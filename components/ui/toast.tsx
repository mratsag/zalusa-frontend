"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import { X, CheckCircle2, AlertTriangle, Info, XCircle } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toast: (opts: { type?: ToastType; title?: string; message: string; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

// ─── Icon & Style Map ────────────────────────────────────────────────────────

const toastConfig: Record<ToastType, { icon: React.ElementType; bg: string; border: string; iconColor: string; progress: string }> = {
  success: {
    icon: CheckCircle2,
    bg: "bg-white",
    border: "border-emerald-200",
    iconColor: "text-emerald-500",
    progress: "bg-emerald-500",
  },
  error: {
    icon: XCircle,
    bg: "bg-white",
    border: "border-red-200",
    iconColor: "text-red-500",
    progress: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-white",
    border: "border-amber-200",
    iconColor: "text-amber-500",
    progress: "bg-amber-500",
  },
  info: {
    icon: Info,
    bg: "bg-white",
    border: "border-blue-200",
    iconColor: "text-blue-500",
    progress: "bg-blue-500",
  },
};

// ─── Single Toast Component ──────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = React.useState(false);
  const config = toastConfig[toast.type];
  const Icon = config.icon;
  const duration = toast.duration ?? 5000;

  const dismiss = useCallback(() => {
    setExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  }, [onDismiss, toast.id]);

  React.useEffect(() => {
    const timer = setTimeout(dismiss, duration);
    return () => clearTimeout(timer);
  }, [dismiss, duration]);

  return (
    <div
      className={`
        relative flex items-start gap-3 w-[380px] max-w-[90vw] p-4 rounded-[14px] border shadow-lg
        ${config.bg} ${config.border}
        ${exiting ? "animate-toast-out" : "animate-toast-in"}
      `}
      role="alert"
    >
      <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${config.iconColor}`} />
      <div className="flex-1 min-w-0">
        {toast.title && (
          <div className="text-[13px] font-bold text-slate-900 mb-0.5">{toast.title}</div>
        )}
        <div className="text-[13px] text-slate-600 leading-snug break-words">{toast.message}</div>
      </div>
      <button
        onClick={dismiss}
        className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-3 right-3 h-[3px] rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${config.progress}`}
          style={{ animation: `toast-progress ${duration}ms linear forwards` }}
        />
      </div>
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counterRef = useRef(0);

  const addToast = useCallback(
    (opts: { type?: ToastType; title?: string; message: string; duration?: number }) => {
      counterRef.current += 1;
      const id = `toast-${Date.now()}-${counterRef.current}`;
      const newToast: Toast = {
        id,
        type: opts.type ?? "info",
        title: opts.title,
        message: opts.message,
        duration: opts.duration,
      };
      setToasts((prev) => [...prev.slice(-4), newToast]); // max 5
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: ToastContextValue = React.useMemo(
    () => ({
      toast: addToast,
      success: (message, title) => addToast({ type: "success", message, title }),
      error: (message, title) => addToast({ type: "error", message, title: title ?? "Hata" }),
      warning: (message, title) => addToast({ type: "warning", message, title }),
      info: (message, title) => addToast({ type: "info", message, title }),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container — sağ üst */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismissToast} />
          </div>
        ))}
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        @keyframes toast-out {
          from {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
          to {
            opacity: 0;
            transform: translateX(100%) scale(0.95);
          }
        }
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-toast-in {
          animation: toast-in 0.35s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
        }
        .animate-toast-out {
          animation: toast-out 0.3s ease-in forwards;
        }
      `}</style>
    </ToastContext.Provider>
  );
}
