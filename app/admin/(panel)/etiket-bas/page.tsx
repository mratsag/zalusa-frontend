"use client";

import React, { useState, useEffect } from "react";
import { Printer, Calendar, Package, Truck, Search, BarChart3, Download, Loader2, FileText, Eye } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function adminHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("zalusa.admin.token") : null;
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

type LabelItem = {
  shipmentId: number;
  trackingCode: string;
  receiverName: string;
  receiverCountry: string;
  carrierName: string;
  carrierId: string;
  integrationType: "pts" | "asset";
  barcodeValue: string;
  supplierRef: string;
  pdfUrl: string;
  createdAt: string;
  status: string;
};

export default function EtiketBasPage() {
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);
  const [filterType, setFilterType] = useState<"all" | "pts" | "asset">("all");
  const [items, setItems] = useState<LabelItem[]>([]);
  const [stats, setStats] = useState({ total: 0, ptsCount: 0, assetCount: 0 });
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [labelLoading, setLabelLoading] = useState<Record<string, boolean>>({});
  const [printingAll, setPrintingAll] = useState(false);

  const fetchLabels = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/label-list?from=${from}&to=${to}&type=${filterType}`, { headers: adminHeaders() });
      const data = await res.json();
      setItems(data.items || []);
      setStats({ total: data.total, ptsCount: data.ptsCount, assetCount: data.assetCount });
      setSelectedIds(new Set((data.items || []).map((i: LabelItem) => i.shipmentId)));
    } catch { setItems([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLabels(); }, [filterType]);

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === items.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(items.map(i => i.shipmentId)));
  };

  const selectedItems = items.filter(i => selectedIds.has(i.shipmentId));
  const ptsSelected = selectedItems.filter(i => i.integrationType === "pts");
  const assetSelected = selectedItems.filter(i => i.integrationType === "asset");

  // ── Asset etiket modal state ────────────────────────────────────────
  const [labelModal, setLabelModal] = useState<{ open: boolean; title: string; message: string; retryable?: boolean }>({ open: false, title: "", message: "" });

  type AssetLabelResult = { type: "base64"; content: string } | { type: "html"; content: string } | null;

  // ── Asset etiketini çek (Base64 veya HTML fallback) ─────────────────
  const fetchAssetLabel = async (reference: string): Promise<AssetLabelResult> => {
    try {
      const res = await fetch(`${API}/api/admin/asset-label?reference=${encodeURIComponent(reference)}`, { headers: adminHeaders() });
      const data = await res.json();

      // Tip 1: Base64 etiket (UPS/DHL/FedEx son mil etiketi)
      if (data.labelBase64) return { type: "base64", content: data.labelBase64 };

      // Tip 2: HTML konşimento görüntüsü (Asset Ekonomi fallback)
      if (data.labelHtml) return { type: "html", content: data.labelHtml };

      // Hata
      const errMsg = data.error || "Etiket alınamadı";
      setLabelModal({
        open: true,
        title: data.retryable ? "⏳ Etiket Hazırlanıyor" : "Etiket Alınamadı",
        message: data.retryable
          ? "Konşimento oluşturuldu ancak etiket henüz hazır değil. Asset gönderiyi işliyor, lütfen birkaç dakika sonra tekrar deneyin."
          : errMsg,
        retryable: data.retryable,
      });
      return null;
    } catch {
      setLabelModal({ open: true, title: "Bağlantı Hatası", message: "Asset API'ye bağlanılamadı. Lütfen tekrar deneyin." });
      return null;
    }
  };

  // ── Tek bir Asset etiketini indir ─────────────────────────────────
  const handleDownloadLabel = async (item: LabelItem) => {
    const key = `${item.integrationType}-${item.shipmentId}`;
    setLabelLoading(p => ({ ...p, [key]: true }));
    try {
      const result = await fetchAssetLabel(item.barcodeValue);
      if (!result) return;

      if (result.type === "base64") {
        const byteChars = atob(result.content);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
        const blob = new Blob([new Uint8Array(byteNums)], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `etiket-${item.trackingCode}-${item.barcodeValue}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // HTML konşimento — yeni pencerede aç
        const w = window.open("", "_blank");
        if (w) { w.document.write(result.content); w.document.close(); }
      }
    } finally {
      setLabelLoading(p => ({ ...p, [key]: false }));
    }
  };

  // ── Tek bir Asset etiketini önizle ─────────────────────────────────
  const handlePreviewLabel = async (item: LabelItem) => {
    const key = `${item.integrationType}-${item.shipmentId}`;
    setLabelLoading(p => ({ ...p, [key]: true }));
    try {
      const result = await fetchAssetLabel(item.barcodeValue);
      if (!result) return;

      if (result.type === "base64") {
        const byteChars = atob(result.content);
        const byteNums = new Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) byteNums[i] = byteChars.charCodeAt(i);
        const blob = new Blob([new Uint8Array(byteNums)], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
      } else {
        // HTML konşimento — yeni pencerede aç
        const w = window.open("", "_blank");
        if (w) { w.document.write(result.content); w.document.close(); }
      }
    } finally {
      setLabelLoading(p => ({ ...p, [key]: false }));
    }
  };

  // ── Seçili tüm etiketleri toplu bas ────────────────────────────────
  const handlePrint = async () => {
    if (selectedIds.size === 0) return;
    setPrintingAll(true);

    try {
      // Asset etiketlerini paralel çek
      const assetLabels: { item: LabelItem; base64: string }[] = [];
      if (assetSelected.length > 0) {
        const results = await Promise.allSettled(
          assetSelected.map(async (item) => {
            const result = await fetchAssetLabel(item.barcodeValue);
            return { item, result };
          })
        );
        for (const r of results) {
          if (r.status === "fulfilled" && r.value.result && r.value.result.type === "base64") {
            assetLabels.push({ item: r.value.item, base64: r.value.result.content });
          }
        }
      }

      // PTS HTML'ini ayrı oluştur (nested template literal sorunu önlenir)
      let ptsHtml = "";
      const ptsWithPdf = ptsSelected.filter(i => i.pdfUrl);
      const ptsNoPdf = ptsSelected.filter(i => !i.pdfUrl);
      if (ptsWithPdf.length > 0) {
        ptsHtml += '<div class="section-title">PTS Kargo Etiketleri (' + ptsWithPdf.length + ' adet) \u2014 A4 sayfada 4 etiket</div>';
        // 4'erli gruplara böl
        for (let g = 0; g < ptsWithPdf.length; g += 4) {
          const group = ptsWithPdf.slice(g, g + 4);
          if (g > 0) ptsHtml += '<div class="page-break"></div>';
          ptsHtml += '<div class="pts-pdf-grid">';
          group.forEach(i => {
            // PDF URL'ine toolbar=0 ve view=Fit ekle
            const cleanUrl = i.pdfUrl + (i.pdfUrl.includes('?') ? '&' : '#') + 'toolbar=0&navpanes=0&view=Fit';
            ptsHtml += '<div class="pts-pdf-cell">' +
              '<div class="pts-pdf-wrapper">' +
              '<iframe src="' + cleanUrl + '" class="pts-pdf-frame"></iframe>' +
              '</div>' +
              '<div class="pts-pdf-info">' + i.trackingCode + ' \xB7 ' + i.receiverName + ' \xB7 ' + i.barcodeValue + '</div>' +
              '</div>';
          });
          // Boş hücre ekle (4'ten az ise grid düzgün olsun)
          for (let f = group.length; f < 4; f++) {
            ptsHtml += '<div class="pts-pdf-cell pts-pdf-empty"></div>';
          }
          ptsHtml += '</div>';
        }
      }
      if (ptsNoPdf.length > 0) {
        ptsHtml += '<div class="section-title"' + (ptsWithPdf.length > 0 ? ' style="page-break-before:always"' : '') + '>PTS Barkodlar\u0131 (' + ptsNoPdf.length + ' adet)</div>';
        ptsHtml += '<div class="pts-grid">' + ptsNoPdf.map(i =>
          '<div class="label-card">' +
          '<svg class="pts-barcode" data-value="' + i.barcodeValue + '"></svg>' +
          '<div class="receiver">' + i.receiverName + ' \u2014 ' + i.receiverCountry + '</div>' +
          '<div class="meta"><span>' + i.trackingCode + '</span><span>' + i.carrierName + '</span><span>' + i.createdAt + '</span></div>' +
          '</div>'
        ).join("") + '</div>';
      }

      // Asset HTML'ini ayrı oluştur
      let assetHtml = "";
      if (assetLabels.length > 0) {
        assetHtml += '<div class="section-title" style="page-break-before:' + (ptsSelected.length > 0 ? "always" : "auto") + '">Asset Kargo Etiketleri (' + assetLabels.length + ' adet) — A4 sayfada 4 etiket</div>';
        for (let g = 0; g < assetLabels.length; g += 4) {
          const group = assetLabels.slice(g, g + 4);
          if (g > 0) assetHtml += '<div class="page-break"></div>';
          assetHtml += '<div class="pts-pdf-grid">';
          group.forEach(i => {
            const cleanUrl = 'data:application/pdf;base64,' + i.base64 + '#toolbar=0&navpanes=0&view=Fit';
            assetHtml += '<div class="pts-pdf-cell">' +
              '<div class="pts-pdf-wrapper">' +
              '<iframe src="' + cleanUrl + '" class="pts-pdf-frame"></iframe>' +
              '</div>' +
              '<div class="pts-pdf-info">' + i.item.trackingCode + ' \xB7 ' + i.item.receiverName + ' \xB7 ' + i.item.barcodeValue + '</div>' +
              '</div>';
          });
          for (let f = group.length; f < 4; f++) {
            assetHtml += '<div class="pts-pdf-cell pts-pdf-empty"></div>';
          }
          assetHtml += '</div>';
        }
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Etiket Yazd\u0131r</title>
<script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.6/dist/JsBarcode.all.min.js"><\/script>
<style>
  @page { size: A4; margin: 5mm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; }
  .no-print { padding: 16px; text-align: center; background: #f8fafc; border-bottom: 2px solid #e2e8f0; }
  .no-print button { padding: 12px 40px; font-size: 16px; cursor: pointer; background: #4f46e5; color: #fff; border: none; border-radius: 10px; font-weight: 600; }
  .no-print button:hover { background: #4338ca; }
  .section-title { font-size: 15px; font-weight: 700; margin: 16px 0 8px; padding: 8px 12px; background: #f1f5f9; border-left: 4px solid #4f46e5; border-radius: 4px; color: #1e293b; }

  /* PTS PDF 2x2 Grid — 4 etiket/sayfa */
  .pts-pdf-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 2mm;
    width: 100%;
    height: calc(297mm - 10mm);
    page-break-after: always;
  }
  .pts-pdf-grid:last-child { page-break-after: auto; }
  .pts-pdf-cell {
    border: 1px solid #cbd5e1;
    border-radius: 3px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    page-break-inside: avoid;
    position: relative;
  }
  .pts-pdf-cell.pts-pdf-empty {
    border: 1px dashed #e2e8f0;
    background: #fafafa;
  }
  /* Transform scale tekniği: iframe 2x büyük render edilip %50 küçültülür */
  .pts-pdf-wrapper {
    flex: 1;
    position: relative;
    overflow: hidden;
  }
  .pts-pdf-frame {
    position: absolute;
    top: 0;
    left: 0;
    width: 200%;
    height: 200%;
    transform: scale(0.5);
    transform-origin: top left;
    border: none;
  }
  .pts-pdf-info {
    font-size: 7px;
    color: #64748b;
    text-align: center;
    padding: 1mm 2mm;
    background: #f8fafc;
    border-top: 1px solid #e2e8f0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;
  }
  .page-break { page-break-after: always; height: 0; }

  /* PTS Barkod Grid (PDF olmayan) */
  .pts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; padding: 0 4px; }
  .label-card { border: 2px solid #334155; border-radius: 8px; padding: 12px; page-break-inside: avoid; text-align: center; }
  .label-card svg { max-width: 100%; height: auto; }
  .label-card .receiver { font-size: 12px; font-weight: 700; margin-top: 6px; color: #0f172a; text-align: left; }
  .label-card .meta { font-size: 9px; color: #64748b; margin-top: 4px; text-align: left; }
  .label-card .meta span { display: inline-block; margin-right: 10px; }

  /* Asset Etiketleri (tam sayfa) */
  .asset-label { page-break-after: always; page-break-inside: avoid; text-align: center; padding: 0; }
  .asset-label:last-child { page-break-after: auto; }
  .asset-label img { max-width: 100%; max-height: 270mm; object-fit: contain; }
  .asset-label .label-info { font-size: 10px; color: #94a3b8; margin-top: 4px; text-align: center; }
  @media print { .no-print { display: none !important; } .section-title { display: none !important; } }
</style></head><body>
<div class="no-print">
  <button onclick="window.print()">\uD83D\uDDA8\uFE0F Yazd\u0131r</button>
  <span style="margin-left:14px;color:#64748b;font-size:14px">${selectedItems.length} etiket (${ptsSelected.length} PTS + ${assetLabels.length} Asset)</span>
  <div style="margin-top:8px;font-size:12px;color:#94a3b8">PTS etiketleri A4 sayfada 4 adet olarak bas\u0131lacakt\u0131r</div>
</div>
${ptsHtml}
${assetHtml}
<script>
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll(".pts-barcode").forEach(function(el) {
    var val = el.getAttribute("data-value");
    if (val && typeof JsBarcode !== "undefined") {
      JsBarcode(el, val, { format: "CODE128", width: 2, height: 60, displayValue: true, fontSize: 14, font: "monospace", textMargin: 4, margin: 8 });
    }
  });
});
<\/script>
</body></html>`;
      printWindow.document.write(html);
      printWindow.document.close();
    } finally {
      setPrintingAll(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Etiket Bas</h1>
          <p className="text-sm text-slate-500 mt-0.5">Tarih aralığına göre PTS ve Asset barkod etiketlerini yazdır</p>
        </div>
        <button onClick={handlePrint} disabled={selectedIds.size === 0 || printingAll}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md">
          {printingAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
          {printingAll ? "Etiketler Yükleniyor..." : `Seçilenleri Yazdır (${selectedIds.size})`}
        </button>
      </div>

      {/* Filtre */}
      <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-100 shadow-sm">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Başlangıç</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Bitiş</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Tip</label>
            <div className="flex rounded-xl ring-1 ring-slate-200 overflow-hidden">
              {(["all", "pts", "asset"] as const).map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className={`px-4 py-2 text-xs font-semibold transition-colors ${filterType === t ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}>
                  {t === "all" ? "Tümü" : t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <button onClick={fetchLabels}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-colors">
            <Search className="h-4 w-4" /> Ara
          </button>
        </div>
      </div>

      {/* Sayaçlar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100 shadow-sm text-center">
          <div className="flex justify-center"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50"><BarChart3 className="h-5 w-5 text-indigo-600" /></div></div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</div>
          <div className="text-xs text-slate-400">Toplam Etiket</div>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100 shadow-sm text-center">
          <div className="flex justify-center"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50"><Package className="h-5 w-5 text-blue-600" /></div></div>
          <div className="mt-2 text-2xl font-bold text-blue-700">{stats.ptsCount}</div>
          <div className="text-xs text-slate-400">PTS (AWB)</div>
        </div>
        <div className="rounded-2xl bg-white p-4 ring-1 ring-slate-100 shadow-sm text-center">
          <div className="flex justify-center"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50"><Truck className="h-5 w-5 text-emerald-600" /></div></div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{stats.assetCount}</div>
          <div className="text-xs text-slate-400">Asset (Ref)</div>
        </div>
      </div>

      {/* Liste */}
      <div className="rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <input type="checkbox" checked={selectedIds.size === items.length && items.length > 0} onChange={toggleAll}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            <span className="text-xs font-semibold text-slate-500">Tümünü Seç</span>
          </div>
          <span className="text-xs text-slate-400">{selectedIds.size} / {items.length} seçili</span>
        </div>

        {loading ? (
          <div className="p-12 text-center"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" /></div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center">
            <Printer className="inline-block h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-400">Bu tarih aralığında etiket bulunamadı</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {items.map(item => {
              const key = `${item.integrationType}-${item.shipmentId}`;
              const isLoading = labelLoading[key];
              return (
                <div key={key}
                  className={`flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors ${selectedIds.has(item.shipmentId) ? "bg-indigo-50/30" : ""}`}>
                  <input type="checkbox" checked={selectedIds.has(item.shipmentId)} onChange={() => toggleSelect(item.shipmentId)}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 shrink-0" />
                  <div className={`flex h-8 w-14 items-center justify-center rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                    item.integrationType === "pts" ? "bg-blue-50 text-blue-600 ring-1 ring-blue-200" : "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200"
                  }`}>
                    {item.integrationType}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 font-mono tracking-wide">{item.barcodeValue}</span>
                      {item.supplierRef && <span className="text-[10px] text-slate-400 font-mono">Takip: {item.supplierRef}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-400">
                      <span>{item.trackingCode}</span>
                      <span>{item.receiverName}</span>
                      <span>{item.receiverCountry}</span>
                      <span>{item.carrierName}</span>
                    </div>
                  </div>

                  {/* Etiket indirme/önizleme butonları */}
                  {(item.integrationType === "asset" || (item.integrationType === "pts" && item.pdfUrl)) && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          if (item.integrationType === "pts" && item.pdfUrl) {
                            window.open(item.pdfUrl, "_blank");
                          } else {
                            handlePreviewLabel(item);
                          }
                        }}
                        disabled={isLoading}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors disabled:opacity-40"
                        title="Etiketi Önizle"
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {
                          if (item.integrationType === "pts" && item.pdfUrl) {
                            const a = document.createElement("a");
                            a.href = item.pdfUrl;
                            a.download = `etiket-${item.trackingCode}-${item.barcodeValue}.pdf`;
                            a.target = "_blank";
                            a.click();
                          } else {
                            handleDownloadLabel(item);
                          }
                        }}
                        disabled={isLoading}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors disabled:opacity-40"
                        title="Etiketi İndir (PDF)"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="text-right shrink-0">
                    <div className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                      item.status === "delivered" ? "bg-green-50 text-green-600 ring-green-200" :
                      item.status === "shipped" || item.status === "in_transit" ? "bg-blue-50 text-blue-600 ring-blue-200" :
                      item.status === "label_created" ? "bg-teal-50 text-teal-600 ring-teal-200" :
                      item.status === "paid" ? "bg-emerald-50 text-emerald-600 ring-emerald-200" :
                      "bg-slate-50 text-slate-500 ring-slate-200"
                    }`}>{item.status}</div>
                    <div className="text-[10px] text-slate-300 mt-0.5">{item.createdAt}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Admin bilgilendirme */}
      {stats.assetCount > 0 && (
        <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-4 flex gap-3">
          <div className="shrink-0 mt-0.5">
            <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.168 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
          </div>
          <div className="text-xs text-amber-800 leading-relaxed">
            <span className="font-bold">Asset Etiket Durumu:</span> Asset konşimentoları oluşturulduktan sonra, son mil kargo şirketine (UPS/DHL/FedEx) atanması <span className="font-semibold">birkaç dakika ile birkaç saat</span> sürebilir.
            Etiket indirme butonları, gönderi kargo şirketine atandığında çalışır.
            <span className="font-semibold text-amber-900"> Sistem her 5 dakikada otomatik kontrol eder</span> ve kargo takip numarası geldiğinde DB&apos;ye kaydeder.
            Eğer &quot;son mil tedarikçisine iletilmedi&quot; hatası alıyorsanız, lütfen biraz bekleyip tekrar deneyin.
          </div>
        </div>
      )}

      {/* Etiket Durumu Modal */}
      {labelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setLabelModal(m => ({ ...m, open: false }))}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 p-6 animate-in fade-in zoom-in-95"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className={`shrink-0 rounded-full p-2 ${labelModal.retryable ? "bg-amber-100" : "bg-red-100"}`}>
                {labelModal.retryable ? (
                  <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                ) : (
                  <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">{labelModal.title}</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">{labelModal.message}</p>
              </div>
            </div>
            <button
              onClick={() => setLabelModal(m => ({ ...m, open: false }))}
              className="mt-4 w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
