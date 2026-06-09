import React from 'react';

// Bu bir "Server Component" (Sunucu Bileşeni) olduğu için tarayıcı üzerinde değil, 
// Next.js'in Node.js sunucusunda çalışır. Böylece Asset'in koyduğu CORS (Cross-Origin) engeline takılmaz!
export default async function CustomInfoPage() {
  let data = null;
  let errorMessage = '';

  try {
    const response = await fetch('https://customerapi.assetoptimus.com/api/WorldWideService/GetCustomInfoTypes', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Username': 'mayantekno',
        'Password': '975ADFCD6F1642F0AC5FE2D6AAC8DD64',
        'ApiKey': 'DE6AF20F-41F1-403F-977A-EC0CF03956E4'
      },
      // Sayfa her yenilendiğinde güncel veriyi çekmesi için cache kapattık
      cache: 'no-store' 
    });
    
    // Gelen cevabı JSON'a çeviriyoruz
    data = await response.json();
    
    if (!response.ok) {
      errorMessage = `Asset API Hata Kodu Döndü: ${response.status}`;
    }
  } catch (err: any) {
    errorMessage = err.message || "İstek atılırken bilinmeyen bir hata oluştu";
  }

  return (
    <div className="p-8 max-w-4xl mx-auto mt-10 bg-white shadow-md rounded-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">Asset API - GetCustomInfoTypes Testi</h1>
      
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          <strong>Hata:</strong> {errorMessage}
        </div>
      )}

      <div className="mb-2 text-sm font-semibold text-gray-600">Ham Asset API Yanıtı:</div>
      <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto text-sm font-mono shadow-inner h-[600px] overflow-y-auto">
        {data ? JSON.stringify(data, null, 2) : "Veri getirilemedi..."}
      </pre>
    </div>
  );
}
