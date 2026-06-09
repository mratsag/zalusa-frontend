'use client';

import { log } from 'console';
import React, { useState, useEffect } from 'react';

// Backend'den dönen veri modeli
interface LabelResponse {
  integrationType: string;
  hasLabel: boolean;
  message?: string;
  reference?: string;
  supplierRef?: string;
  labelType?: 'html' | 'base64' | 'pending';
  labelContent?: string;
  awb?: string;     // PTS tarafı için
  pdfUrl?: string;  // PTS tarafı için
}

interface DebugAssetProps {
  shipmentId: string; // Test edilecek kargo ID'si
}

export default function DebugAssetLabel({ shipmentId }: DebugAssetProps) {
  const [data, setData] = useState<LabelResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchLabel = async () => {
    if (!shipmentId) return;
    
    setLoading(true);
    setError('');
    
    try {
      // CORS hatasından dolayı Asset API'ye doğrudan gidemiyoruz.
      // Bu yüzden Backend'de yazdığımız DebugAssetLabel endpoint'ine gidiyoruz.
      const apiUrl = `https://api.zalusa.com/api/debug/asset-label/${shipmentId}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });

      const result = await response.json();
      console.log("response", result);
      
      // Eğer Asset API 500 dönmüşse ama JSON vermişse, hataya düşmek yerine ekrana basalım
      if (!response.ok && !result.Errors && !result.IsValid) {
        throw new Error(result.error || 'Backend API isteği başarısız oldu');
      }
      
      // Asset API bazen `Value` içinde direkt string (HTML), bazen obje döner.
      // Örneğin GetLastMileLabel metodunda `Value: { Content: "base64...", ... }` döner.
      // Get metodunda ise `Value: { BillOfLading: {...} }` döner.
      let finalLabelContent = '';
      let finalLabelType: 'html' | 'base64' | 'pending' = 'pending';

      if (result.IsValid && result.Value) {
        if (typeof result.Value === 'string') {
          // GetAssetBillOfLadingView HTML string döner
          finalLabelContent = result.Value;
          finalLabelType = 'html';
        } else if (typeof result.Value === 'object') {
          if (result.Value.Content && typeof result.Value.Content === 'string') {
            // GetLastMileLabel base64 string döner
            finalLabelContent = result.Value.Content;
            finalLabelType = 'base64';
          } else {
            // WorldWideService/Get gibi diğer metodlar sadece JSON objesi döner, etiket değildir.
            // Bu durumda iframe render etmemesi için pending bırakıyoruz
            finalLabelType = 'pending';
          }
        }
      }

      const adaptedData: LabelResponse = {
        integrationType: 'asset',
        hasLabel: finalLabelType !== 'pending',
        labelType: finalLabelType,
        labelContent: finalLabelContent,
        message: result.Errors && result.Errors.length > 0 ? result.Errors[0].ErrorMessage : 'Bu istek bir etiket içermiyor, JSON detaylarına bakınız.',
        rawAssetResponse: result 
      } as any;
      
      setData(adaptedData);
    } catch (err: any) {
      setError(err.message || 'Bilinmeyen bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shipmentId) {
      fetchLabel();
    }
  }, [shipmentId]);

  // Gelen HTML veya Base64 verisini ekrana basan yardımcı fonksiyon
  const renderLabelContent = () => {
    if (!data) return null;

    if (!data.hasLabel || data.labelType === 'pending') {
      return (
        <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200">
          <p>{data.message || 'Asset etiketi henüz hazır değil (Pending state).'}</p>
        </div>
      );
    }

    // 1. Durum: Asset Konşimentosu (HTML Formatında)
    if (data.labelType === 'html' && data.labelContent) {
      return (
        <div className="border rounded-md overflow-hidden bg-white shadow-sm mt-4">
          <div className="bg-gray-100 p-3 text-sm font-semibold border-b text-gray-700">
            HTML Konşimento Görünümü (GetAssetBillOfLadingView)
          </div>
          <iframe 
            srcDoc={data.labelContent} 
            className="w-full h-[600px] border-none"
            title="Asset HTML Label"
          />
        </div>
      );
    }

    // 2. Durum: Son Mil Etiketi (Base64 Formatında - Genelde PDF döner)
    if (data.labelType === 'base64' && data.labelContent) {
      // PDF varsayımı yapıyoruz. Eğer ZPL dönerse ekstra parser gerekebilir.
      const src = `data:application/pdf;base64,${data.labelContent}`;
      return (
        <div className="border rounded-md overflow-hidden bg-white shadow-sm mt-4">
          <div className="bg-gray-100 p-3 text-sm font-semibold border-b text-gray-700">
            Base64 Son Mil Etiketi (GetLastMileLabel)
          </div>
          <iframe 
            src={src} 
            className="w-full h-[600px] border-none"
            title="Asset Base64 Label"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-gray-50 rounded-xl border border-gray-200 my-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Asset API - Etiket Debugger</h2>
          <p className="text-sm text-gray-500 mt-1">Shipment ID: <span className="font-mono font-bold">{shipmentId}</span></p>
        </div>
        <button 
          onClick={fetchLabel}
          disabled={loading}
          className="px-5 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Sorgulanıyor...' : 'Yeniden Sorgula'}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3">
          <span className="font-bold shrink-0">Hata:</span> 
          <span>{error}</span>
        </div>
      )}

      {/* Ham JSON Yanıtını İnceleme Alanı */}
      {data && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Ham API Yanıtı (JSON)</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono shadow-inner">
            {JSON.stringify((data as any).rawAssetResponse || data, null, 2)}
          </pre>
        </div>
      )}

      {/* Render Edilmiş Etiket */}
      <div className="mt-2">
        {loading ? (
          <div className="flex flex-col justify-center items-center h-48 text-gray-500 bg-white border border-dashed border-gray-300 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800 mb-3"></div>
            Etiket verisi getiriliyor, lütfen bekleyin...
          </div>
        ) : (
          renderLabelContent()
        )}
      </div>
    </div>
  );
}