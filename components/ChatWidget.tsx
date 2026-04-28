"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Loader2,
  Headphones,
  Package,
  MapPin,
  RotateCcw,
  Search,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CreditCard,
  Tag,
  Maximize2,
  Minimize2,
  ArrowLeft,
  User,
  History,
  FileText,
  ChevronRight,
} from "lucide-react";
import ShipmentWizard from "@/components/ShipmentWizard";

// ─── Config ────────────────────────────────────────────────────────────────────
const ASSISTANT_NAME = "Destek Asistanı";
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const WS_BASE = API_BASE.replace(/^http/, "ws");

// ─── Quick Action Buttons ──────────────────────────────────────────────────────
const quickActions = [
  { id: "cargo_create", label: "Kargo Oluştur", icon: Package },
  { id: "cargo_track", label: "Kargo Takip", icon: MapPin },
  { id: "live_support", label: "Canlı Destek", icon: Headphones },
];

// ─── Types ─────────────────────────────────────────────────────────────────────
type ChatMode = "ai" | "live" | "shipment" | "tracking" | "history";

interface ChatWidgetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ChatWidget({ open, onOpenChange }: ChatWidgetProps = {}) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;
  const setIsOpen = (val: boolean) => {
    if (isControlled) {
      onOpenChange?.(val);
    } else {
      setInternalOpen(val);
    }
  };

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      type: "text",
      content: `Merhaba! 👋\nBen **${ASSISTANT_NAME}**.\n\nSize nasıl yardımcı olabilirim?`,
      timestamp: new Date(),
    },
    {
      id: "quick",
      role: "assistant",
      type: "quick_actions",
      content: "",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("ai");
  const [pulseButton, setPulseButton] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  // Tracking state
  const [trackingInput, setTrackingInput] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [recentShipments, setRecentShipments] = useState<any[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  // History state
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Focus input when opened (only on desktop to prevent mobile keyboard auto-open)
  useEffect(() => {
    if (isOpen) {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      if (!isMobile) {
        setTimeout(() => inputRef.current?.focus(), 300);
      }
      setPulseButton(false);
    }
  }, [isOpen]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  // ─── WebSocket Connection ──────────────────────────────────────────────
  const connectLiveSupport = useCallback(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("zalusa.token")
        : null;

    if (!token) {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          role: "assistant",
          type: "text",
          content:
            "⚠️ Canlı destek için giriş yapmanız gerekiyor. Lütfen önce hesabınıza giriş yapın.",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    setChatMode("live");
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-waiting-${Date.now()}`,
        role: "assistant",
        type: "text",
        content:
          "✅ Canlı destek hattına bağlandınız. Mesajınızı yazabilirsiniz.",
        timestamp: new Date(),
      },
    ]);

    const ws = new WebSocket(
      `${WS_BASE}/api/live-support/ws?token=${token}`
    );
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("[LiveSupport] WebSocket bağlantısı kuruldu");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "agent_joined":
            setMessages((prev) => [
              ...prev,
              {
                id: `sys-joined-${Date.now()}`,
                role: "assistant",
                type: "text",
                content: `✅ ${data.content || "Müşteri temsilcisi bağlandı. Mesajınızı yazabilirsiniz."}`,
                timestamp: new Date(),
              },
            ]);
            break;

          case "message":
            if (data.sender === "admin") {
              setMessages((prev) => [
                ...prev,
                {
                  id: `live-admin-${Date.now()}-${Math.random()}`,
                  role: "assistant",
                  type: "text",
                  content: data.content,
                  timestamp: new Date(),
                },
              ]);
            }
            break;

          case "agent_left":
            setMessages((prev) => [
              ...prev,
              {
                id: `sys-left-${Date.now()}`,
                role: "assistant",
                type: "text",
                content: "⚠️ Temsilci bağlantısı kesildi.",
                timestamp: new Date(),
              },
            ]);
            break;

          case "chat_closed":
            setChatMode("ai");
            setMessages((prev) => [
              ...prev,
              {
                id: `sys-closed-${Date.now()}`,
                role: "assistant",
                type: "text",
                content:
                  "✅ Canlı destek sohbeti sonlandırıldı. AI asistana geri dönüldü.",
                timestamp: new Date(),
              },
            ]);
            if (wsRef.current) {
              wsRef.current.close();
              wsRef.current = null;
            }
            break;

          case "system":
            setMessages((prev) => [
              ...prev,
              {
                id: `sys-${Date.now()}-${Math.random()}`,
                role: "assistant",
                type: "text",
                content: data.content,
                timestamp: new Date(),
              },
            ]);
            break;
        }
      } catch (e) {
        console.error("[LiveSupport] Mesaj parse hatası:", e);
      }
    };

    ws.onclose = () => {
      console.log("[LiveSupport] WebSocket bağlantısı kapandı");
      if (chatMode === "live") {
        setChatMode("ai");
      }
      wsRef.current = null;
    };

    ws.onerror = (err) => {
      console.error("[LiveSupport] WebSocket hatası:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          type: "text",
          content:
            "❌ Canlı destek bağlantısı kurulamadı. Lütfen tekrar deneyin.",
          timestamp: new Date(),
        },
      ]);
      setChatMode("ai");
      wsRef.current = null;
    };
  }, [chatMode]);

  // ─── Send Live Message via WebSocket ───────────────────────────────────
  const sendLiveMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !wsRef.current) return;

      const userMsg = {
        id: `user-live-${Date.now()}`,
        role: "user",
        type: "text",
        content: text.trim(),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");

      wsRef.current.send(
        JSON.stringify({ type: "message", content: text.trim() })
      );
    },
    []
  );

  // ─── Back to AI mode ──────────────────────────────────────────────────
  const backToAI = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setChatMode("ai");
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-back-${Date.now()}`,
        role: "assistant",
        type: "text",
        content: "🤖 AI Asistana geri dönüldü. Size nasıl yardımcı olabilirim?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  // ─── Send AI Message ───────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      // Live modda WebSocket üzerinden gönder
      if (chatMode === "live") {
        sendLiveMessage(text);
        return;
      }


      const userMsg = {
        id: `user-${Date.now()}`,
        role: "user",
        type: "text",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("zalusa.token")
            : null;
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            message: text.trim(),
            history: messages
              .filter((m) => m.type === "text")
              .map((m) => ({
                role: m.role,
                content: m.content,
              })),
          }),
        });

        if (!res.ok) throw new Error("API Error");

        const data = await res.json();

        const botMsg = {
          id: `bot-${Date.now()}`,
          role: "assistant",
          type: "text",
          content:
            data.reply || "Üzgünüm, bir hata oluştu. Tekrar dener misiniz?",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMsg]);

        // Backend action'larını işle
        if (data.action === "cargo_created" && data.trackingNumber) {
          setMessages((prev) => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              role: "assistant",
              type: "text",
              content: `✅ Kargonuz başarıyla oluşturuldu!\n\n📦 Takip No: **${data.trackingNumber}**`,
              timestamp: new Date(),
            },
          ]);
        }

        // Canlı desteğe yönlendirme (AI önerirse)
        if (data.action === "open_live_support") {
          setTimeout(() => connectLiveSupport(), 500);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: "assistant",
            type: "text",
            content:
              "Üzgünüm, şu anda bağlantı kurulamıyor. Lütfen tekrar deneyin.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    },
    [messages, chatMode, sendLiveMessage, connectLiveSupport]
  );

  // ─── Quick Action Handler ──────────────────────────────────────────────
  // ─── Track Shipment (Rule-Based) ────────────────────────────────────────
  const handleTrackShipment = useCallback(async (code: string) => {
    if (!code.trim()) return;
    setTrackingLoading(true);
    setTrackingError(null);
    setTrackingResult(null);
    try {
      const res = await fetch(`${API_BASE}/api/shipments/track/${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (!res.ok || data.found === false) {
        setTrackingError(data.error || "Kargo bulunamadı.");
      } else {
        // Backend snake_case → Frontend camelCase mapping
        setTrackingResult({
          trackingCode: data.tracking_code || data.trackingCode || code,
          status: data.raw_status || data.status || "unknown",
          statusLabel: data.main_status || data.statusLabel || "Bilinmiyor",
          carrierName: data.carrier || data.carrierName || "",
          serviceName: data.service_name || data.serviceName || "",
          receiverCountry: data.target_country || data.receiverCountry || "",
          senderCountry: data.sender_country || data.senderCountry || "TR",
          shipmentType: data.shipment_type || data.shipmentType || "Paket",
          createdAt: data.created_at || data.createdAt || "",
          priceTRY: data.price_try || data.priceTRY || null,
          events: data.events || [],
        });
      }
    } catch {
      setTrackingError("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setTrackingLoading(false);
    }
  }, []);

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case "cargo_create":
        setChatMode("shipment");
        break;
      case "cargo_track": {
        setChatMode("tracking");
        setTrackingInput("");
        setTrackingResult(null);
        setTrackingError(null);
        // Fetch recent shipments if logged in
        const token = typeof window !== "undefined" ? localStorage.getItem("zalusa.token") : null;
        if (token) {
          setRecentLoading(true);
          fetch(`${API_BASE}/api/shipments/recent`, {
            headers: { Authorization: `Bearer ${token}` },
          })
            .then((r) => r.json())
            .then((data) => setRecentShipments(data.shipments ?? []))
            .catch(() => setRecentShipments([]))
            .finally(() => setRecentLoading(false));
        }
        break;
      }
      case "live_support":
        connectLiveSupport();
        break;
    }
  };

  // ─── Shipment Wizard Callbacks ─────────────────────────────────────────
  const handleShipmentClose = () => {
    setChatMode("ai");
  };

  const handleShipmentComplete = (trackingCode: string, totalCost: number) => {
    setChatMode("ai");
    setMessages((prev) => [
      ...prev,
      {
        id: `sys-shipment-${Date.now()}`,
        role: "assistant",
        type: "text",
        content: `🎉 Kargonuz başarıyla oluşturuldu!\n\n📦 **Takip Kodu:** ${trackingCode}\n💰 **Toplam:** ${totalCost.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺\n\nÖdeme yapmak için paneldeki **Gönderilerim** sayfasını ziyaret edebilirsiniz.`,
        timestamp: new Date(),
      },
    ]);
  };

  // ─── Reset Chat ────────────────────────────────────────────────────────
  const resetChat = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setChatMode("ai");
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        type: "text",
        content: `Merhaba! 👋\nBen **${ASSISTANT_NAME}**.\n\nSize nasıl yardımcı olabilirim?`,
        timestamp: new Date(),
      },
      {
        id: "quick",
        role: "assistant",
        type: "quick_actions",
        content: "",
        timestamp: new Date(),
      },
    ]);
  };

  // ─── Render Markdown (basic bold) ──────────────────────────────────────
  const renderContent = (text: string) => {
    return text.split("\n").map((line: string, i: number) => (
      <span key={i}>
        {line.split(/(\*\*.*?\*\*)/).map((part: string, j: number) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={j} className="font-semibold">
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          )
        )}
        {i < text.split("\n").length - 1 && <br />}
      </span>
    ));
  };

  // ─── Header gradient based on mode ─────────────────────────────────────
  const headerGradient =
    chatMode === "live"
      ? "linear-gradient(135deg, #10b981 0%, #059669 60%, #047857 100%)"
      : chatMode === "tracking"
        ? "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 60%, #4c1d95 100%)"
        : chatMode === "shipment"
          ? "linear-gradient(135deg, #3d6bff 0%, #2247e6 60%, #152b8a 100%)"
          : chatMode === "history"
            ? "linear-gradient(135deg, #f59e0b 0%, #d97706 60%, #92400e 100%)"
            : "linear-gradient(135deg, #3d6bff 0%, #2247e6 60%, #152b8a 100%)";

  const headerTitle =
    chatMode === "live"
      ? "Canlı Destek"
      : chatMode === "tracking"
        ? "Kargo Takip"
        : chatMode === "shipment"
          ? "Kargo Oluştur"
          : chatMode === "history"
            ? "Geçmiş İşlemlerim"
            : ASSISTANT_NAME;

  const headerStatusText =
    chatMode === "live"
      ? "Temsilci bağlı"
      : chatMode === "tracking"
        ? "Takip kodunuzla kargonuzu sorgulayın"
        : chatMode === "shipment"
          ? "Form doldurarak kargo oluşturun"
          : chatMode === "history"
            ? "Tüm kargo ve destek geçmişiniz"
            : "Çevrimiçi";

  const HeaderIcon = chatMode === "tracking" ? Search : chatMode === "shipment" ? Package : chatMode === "history" ? History : chatMode === "ai" ? Bot : Headphones;

  // ─── Render ────────────────────────────────────────────────────────────
  if (typeof document === "undefined") return null;

  return createPortal(
    <>
      {/* ── Floating Button (only shown in standalone mode) ── */}
      {!isControlled && !isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[9999] group"
          aria-label="Destek Asistanı'nı aç"
        >
          <div
            className={`relative h-14 w-14 rounded-full flex items-center justify-center shadow-[0_4px_24px_rgba(45,91,255,0.4)] transition-all duration-300 hover:shadow-[0_6px_32px_rgba(45,91,255,0.55)] hover:scale-105 ${
              pulseButton ? "animate-pulse" : ""
            }`}
            style={{
              background: "linear-gradient(135deg, #3d6bff 0%, #2247e6 100%)",
            }}
          >
            <MessageCircle className="h-6 w-6 text-white" />
            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-emerald-400 border-[2.5px] border-white" />
          </div>
        </button>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-[9999] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-3rem)] rounded-2xl overflow-hidden flex flex-col shadow-[0_8px_60px_rgba(0,0,0,0.15),0_2px_12px_rgba(45,91,255,0.12)] transition-all duration-300 ease-in-out`}
          style={{
            width: isExpanded ? 600 : 420,
            height: isExpanded ? 780 : 620,
            animation: "chatSlideUp 0.35s cubic-bezier(.32,.72,0,1)",
          }}
        >
          {/* ── Header ── */}
          <div
            className="relative px-5 py-4 flex items-center gap-3 shrink-0 transition-all duration-500"
            style={{ background: headerGradient }}
          >
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/[0.06]" />
            <div className="pointer-events-none absolute right-20 -bottom-6 h-20 w-20 rounded-full bg-white/[0.04]" />

            <div className="relative flex items-center gap-3 flex-1">
              {/* Back to AI button (only in live/waiting mode) */}
              {chatMode !== "ai" && (
                <button
                  onClick={backToAI}
                  className="h-8 w-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
                  title="AI Asistana Dön"
                >
                  <ArrowLeft className="h-4 w-4 text-white" />
                </button>
              )}
              <div className="h-10 w-10 rounded-full bg-white/15 flex items-center justify-center backdrop-blur-sm ring-2 ring-white/20">
                <HeaderIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-white leading-tight">
                  {headerTitle}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"
                  />
                  <span className="text-[11px] text-white/80 font-medium">
                    {headerStatusText}
                  </span>
                </div>
              </div>
            </div>

            <div className="relative flex items-center gap-1">
              <button
                onClick={resetChat}
                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Sohbeti sıfırla"
              >
                <RotateCcw className="h-3.5 w-3.5 text-white" />
              </button>
              <button
                onClick={() => {
                  setChatMode("history");
                  setIsExpanded(true);
                  // Fetch history
                  const token = typeof window !== "undefined" ? localStorage.getItem("zalusa.token") : null;
                  if (token) {
                    setHistoryLoading(true);
                    fetch(`${API_BASE}/api/shipments/recent`, {
                      headers: { Authorization: `Bearer ${token}` },
                    })
                      .then((r) => r.json())
                      .then((data) => setHistoryItems(data.shipments ?? []))
                      .catch(() => setHistoryItems([]))
                      .finally(() => setHistoryLoading(false));
                  }
                }}
                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Geçmiş İşlemler"
              >
                <History className="h-3.5 w-3.5 text-white" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title={isExpanded ? "Küçült" : "Büyüt"}
              >
                {isExpanded ? (
                  <Minimize2 className="h-3.5 w-3.5 text-white" />
                ) : (
                  <Maximize2 className="h-3.5 w-3.5 text-white" />
                )}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                title="Kapat"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>

          {/* ── Shipment Wizard (full takeover) ── */}
          {chatMode === "shipment" ? (
            <ShipmentWizard
              onClose={handleShipmentClose}
              onComplete={handleShipmentComplete}
            />
          ) : chatMode === "tracking" ? (
            /* ── Tracking UI (rule-based) ── */
            <div className="flex-1 overflow-y-auto px-4 py-6" style={{ background: "#f0f4ff" }}>
              <div className="space-y-4">
                {/* Tracking input */}
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
                      <Search className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-[13px] text-slate-700 font-medium">
                      Lütfen kargo takip kodunuzu girin
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && trackingInput.trim()) {
                          handleTrackShipment(trackingInput);
                        }
                      }}
                      placeholder="Örn: ZLS-SHP-498101"
                      className="flex-1 h-10 px-4 rounded-xl bg-slate-50 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none border border-slate-200 focus:border-violet-300 focus:ring-2 focus:ring-violet-100 transition-all"
                      autoFocus
                    />
                    <button
                      onClick={() => handleTrackShipment(trackingInput)}
                      disabled={!trackingInput.trim() || trackingLoading}
                      className="h-10 px-4 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-40 flex items-center gap-1.5"
                      style={{ background: trackingInput.trim() ? "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)" : "#e2e8f0" }}
                    >
                      {trackingLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <><Search className="h-3.5 w-3.5" /> Sorgula</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Recent shipments */}
                {!trackingResult && !trackingError && (
                  <div>
                    {recentLoading ? (
                      <div className="flex justify-center py-4">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 border border-violet-100">
                          <Loader2 className="h-3.5 w-3.5 text-violet-500 animate-spin" />
                          <span className="text-[11px] text-violet-600 font-medium">Gönderileriniz yükleniyor...</span>
                        </div>
                      </div>
                    ) : recentShipments.length > 0 ? (
                      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-4 py-2.5 bg-slate-50/80 border-b border-slate-100">
                          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Son Gönderileriniz</p>
                        </div>
                        <div className="divide-y divide-slate-50">
                          {recentShipments.map((s: any) => {
                            const statusColors: Record<string, string> = {
                              pending_payment: "bg-amber-100 text-amber-700",
                              paid: "bg-emerald-100 text-emerald-700",
                              label_created: "bg-blue-100 text-blue-700",
                              shipped: "bg-blue-100 text-blue-700",
                              in_transit: "bg-indigo-100 text-indigo-700",
                              delivered: "bg-emerald-100 text-emerald-700",
                              cancelled: "bg-red-100 text-red-700",
                              returned: "bg-orange-100 text-orange-700",
                            };
                            const badgeCls = statusColors[s.status] || "bg-slate-100 text-slate-600";
                            return (
                              <button
                                key={s.trackingCode}
                                onClick={() => {
                                  setTrackingInput(s.trackingCode);
                                  handleTrackShipment(s.trackingCode);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-violet-50/40 transition-colors group"
                              >
                                <div className="h-9 w-9 shrink-0 rounded-xl bg-violet-50 flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                                  <Package className="h-4 w-4 text-violet-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-[12px] font-bold text-slate-800 font-mono truncate">{s.trackingCode}</p>
                                    <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badgeCls}`}>
                                      {s.statusLabel}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 mt-0.5">
                                    {s.receiverCountry} • {s.createdAt}
                                  </p>
                                </div>
                                <Search className="h-3.5 w-3.5 text-slate-300 group-hover:text-violet-500 transition-colors shrink-0" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}

                {/* Loading */}
                {trackingLoading && (
                  <div className="flex justify-center py-6">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-50 border border-violet-200">
                      <Loader2 className="h-4 w-4 text-violet-600 animate-spin" />
                      <span className="text-[12px] font-medium text-violet-700">Kargo sorgulanıyor...</span>
                    </div>
                  </div>
                )}

                {/* Error */}
                {trackingError && (
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-red-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-red-50 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-red-600">Kargo Bulunamadı</p>
                        <p className="text-[12px] text-red-500 mt-0.5">{trackingError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Result card */}
                {trackingResult && (
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    {/* Takip kodu header (kompakt) */}
                    <div className="px-5 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100 flex items-center gap-2">
                      <Package className="h-4 w-4 text-indigo-500" />
                      <p className="text-[13px] font-bold text-indigo-700">{trackingResult.trackingCode}</p>
                    </div>

                    {/* ── Events Timeline (ana bilgilendirme) ── */}
                    {trackingResult.events?.length > 0 ? (
                      <div className="px-5 pt-4 pb-2">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="h-6 w-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Clock className="h-3 w-3 text-white" />
                          </div>
                          <p className="text-[12px] font-bold text-slate-700">Kargo Hareketleri</p>
                        </div>
                        <div className="relative">
                          {trackingResult.events.map((event: any, idx: number) => {
                            const isFirst = idx === 0;
                            const isLast = idx === trackingResult.events.length - 1;
                            return (
                              <div key={idx} className="flex gap-3 relative">
                                {!isLast && (
                                  <div
                                    className="absolute left-[11px] top-[22px] w-[2px] bg-gradient-to-b from-indigo-200 to-slate-100"
                                    style={{ height: "calc(100% - 6px)" }}
                                  />
                                )}
                                <div className="relative z-10 shrink-0 mt-1">
                                  <div
                                    className={`h-[22px] w-[22px] rounded-full flex items-center justify-center border-2 ${
                                      isFirst
                                        ? "bg-indigo-500 border-indigo-300"
                                        : "bg-white border-slate-200"
                                    }`}
                                  >
                                    <div
                                      className={`h-2 w-2 rounded-full ${
                                        isFirst ? "bg-white" : "bg-slate-300"
                                      }`}
                                    />
                                  </div>
                                </div>
                                <div className={`flex-1 ${isLast ? "pb-1" : "pb-4"}`}>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span
                                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                        isFirst
                                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                                          : "bg-slate-50 text-slate-600 border border-slate-200"
                                      }`}
                                    >
                                      {event.status}
                                    </span>
                                    {event.date && (
                                      <span className="text-[10px] text-slate-400 font-medium">
                                        {event.date}
                                      </span>
                                    )}
                                  </div>
                                  {event.description && (
                                    <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">
                                      {event.description}
                                    </p>
                                  )}
                                  {event.location && (
                                    <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                      <MapPin className="h-2.5 w-2.5" />
                                      {event.location}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="px-5 py-4 text-center text-[12px] text-slate-400">
                        Henüz kargo hareketi bulunmamaktadır.
                      </div>
                    )}

                    {/* ── Compact details ── */}
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px]">
                        <span className="text-slate-500">
                          <Tag className="h-3 w-3 inline-block mr-1 text-slate-400" />
                          {trackingResult.shipmentType}
                        </span>
                        <span className="text-slate-500">
                          <MapPin className="h-3 w-3 inline-block mr-1 text-slate-400" />
                          {trackingResult.senderCountry} → {trackingResult.receiverCountry}
                        </span>
                        {trackingResult.carrierName && (
                          <span className="text-slate-500">
                            <Truck className="h-3 w-3 inline-block mr-1 text-slate-400" />
                            {trackingResult.carrierName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Back to chat button */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={backToAI}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-white border border-slate-200 text-slate-600 hover:border-violet-300 hover:text-violet-600 hover:shadow-sm transition-all active:scale-95"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Sohbete Dön
                  </button>
                </div>
              </div>
            </div>
          ) : chatMode === "history" ? (
            /* ── History Panel ── */
            <div className="flex-1 overflow-y-auto px-4 py-6" style={{ background: "#fffbeb" }}>
              <div className="space-y-3">
                {historyLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200">
                      <Loader2 className="h-4 w-4 text-amber-600 animate-spin" />
                      <span className="text-[12px] font-medium text-amber-700">Geçmiş yükleniyor...</span>
                    </div>
                  </div>
                ) : historyItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                      <History className="h-7 w-7 text-amber-500" />
                    </div>
                    <p className="text-[14px] font-semibold text-slate-700">Henüz işlem geçmişiniz yok</p>
                    <p className="text-[12px] text-slate-400 mt-1">Kargo oluşturduğunuzda burada görünecektir.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider px-1">Son Gönderileriniz ({historyItems.length})</p>
                    {historyItems.map((item: any) => {
                      const statusColors: Record<string, string> = {
                        pending_payment: "bg-amber-100 text-amber-700 border-amber-200",
                        paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
                        label_created: "bg-blue-100 text-blue-700 border-blue-200",
                        shipped: "bg-blue-100 text-blue-700 border-blue-200",
                        in_transit: "bg-indigo-100 text-indigo-700 border-indigo-200",
                        delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
                        cancelled: "bg-red-100 text-red-700 border-red-200",
                        draft: "bg-slate-100 text-slate-600 border-slate-200",
                      };
                      const badgeCls = statusColors[item.status] || "bg-slate-100 text-slate-600 border-slate-200";
                      return (
                        <button
                          key={item.trackingCode || item.id}
                          onClick={() => {
                            setChatMode("tracking");
                            setTrackingInput(item.trackingCode);
                            handleTrackShipment(item.trackingCode);
                          }}
                          className="w-full bg-white rounded-xl p-4 border border-slate-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all text-left group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                                <Package className="h-4.5 w-4.5 text-amber-600" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[13px] font-bold text-slate-800 font-mono truncate">{item.trackingCode}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeCls}`}>
                                    {item.statusLabel || item.status}
                                  </span>
                                  {item.receiverCountry && (
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                      <MapPin className="h-2.5 w-2.5" />
                                      {item.receiverCountry}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {item.createdAt && (
                                <span className="text-[10px] text-slate-400">{item.createdAt}</span>
                              )}
                              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-amber-500 transition-colors" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </>
                )}

                {/* Back to chat */}
                <div className="flex justify-center pt-3">
                  <button
                    onClick={backToAI}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-white border border-slate-200 text-slate-600 hover:border-amber-300 hover:text-amber-600 hover:shadow-sm transition-all active:scale-95"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Sohbete Dön
                  </button>
                </div>
              </div>
            </div>
          ) : (
          <>
          {/* ── Messages Area ── */}
          <div
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            style={{ background: "#f0f4ff" }}
          >
            {messages.map((msg) => {
              // ── Quick Actions ──
              if (msg.type === "quick_actions") {
                return (
                  <div key={msg.id} className="flex flex-wrap gap-2 pl-12">
                    {quickActions.map((action) => {
                      const Icon = action.icon;
                      return (
                        <button
                          key={action.id}
                          onClick={() => handleQuickAction(action.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600 hover:shadow-sm active:scale-95"
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {action.label}
                        </button>
                      );
                    })}
                  </div>
                );
              }

              // ── Bot / Admin Message ──
              if (msg.role === "assistant") {
                const isLiveAdmin =
                  chatMode === "live" &&
                  msg.id.startsWith("live-admin-");
                return (
                  <div key={msg.id} className="flex gap-2.5 items-end">
                    <div
                      className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center shadow-sm ${
                        isLiveAdmin
                          ? "bg-gradient-to-br from-emerald-500 to-emerald-700"
                          : "bg-gradient-to-br from-blue-500 to-blue-700"
                      }`}
                    >
                      {isLiveAdmin ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="max-w-[75%]">
                      <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-100">
                        <p className="text-[13px] text-slate-700 leading-relaxed">
                          {renderContent(msg.content)}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-1 ml-1 block">
                        {msg.timestamp.toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              }

              // ── User Message ──
              return (
                <div
                  key={msg.id}
                  className="flex gap-2.5 items-end justify-end"
                >
                  <div className="max-w-[75%]">
                    <div
                      className="rounded-2xl rounded-br-md px-4 py-3 shadow-sm"
                      style={{
                        background:
                          chatMode === "live"
                            ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                            : "linear-gradient(135deg, #3d6bff 0%, #2247e6 100%)",
                      }}
                    >
                      <p className="text-[13px] text-white leading-relaxed">
                        {msg.content}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 mr-1 block text-right">
                      {msg.timestamp.toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* ── Typing indicator ── */}
            {isTyping && (
              <div className="flex gap-2.5 items-end">
                <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-slate-100">
                  <div className="flex items-center gap-1">
                    <span
                      className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-2 w-2 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}



            <div ref={messagesEndRef} />
          </div>

          {/* ── Live support connect bar (when in AI mode) ── */}
          {chatMode === "ai" &&
            messages.filter(
              (m) => m.role === "assistant" && m.type === "text"
            ).length > 2 && (
              <div className="px-4 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
                <button
                  onClick={() => connectLiveSupport()}
                  className="text-[11px] text-slate-400 hover:text-emerald-600 transition-colors font-medium"
                >
                  Cevaplardan memnun değil misiniz? Canlı desteğe bağlanın →
                </button>
              </div>
            )}

          {/* ── Input Area ── */}
          <div className="px-4 py-3 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder={
                  chatMode === "live"
                    ? "Mesajınızı yazın..."
                    : "Mesajınızı yazın..."
                }
                className="flex-1 h-10 px-4 rounded-xl bg-slate-50 text-[13px] text-slate-700 placeholder:text-slate-400 outline-none border border-slate-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isTyping}
                className="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:scale-95 hover:shadow-md active:scale-95"
                style={{
                  background: input.trim()
                    ? chatMode === "live"
                      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                      : "linear-gradient(135deg, #3d6bff 0%, #2247e6 100%)"
                    : "#e2e8f0",
                }}
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 text-white animate-spin" />
                ) : (
                  <Send
                    className={`h-4 w-4 ${
                      input.trim() ? "text-white" : "text-slate-400"
                    }`}
                  />
                )}
              </button>
            </div>
            {chatMode === "live" && (
              <p className="text-[10px] text-slate-400 text-center mt-2 font-medium">
                🟢 Canlı destek hattındasınız
              </p>
            )}
          </div>
          </> /* end of non-shipment content */
          )}
        </div>
      )}

      {/* ── Animation Keyframes ── */}
      <style jsx global>{`
        @keyframes chatSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>,
    document.body
  );
}

export default ChatWidget;