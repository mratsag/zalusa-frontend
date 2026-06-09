import React from 'react';

// Bu bir "Server Component" olduğu için Asset'in CORS (Cross-Origin) engeline takılmaz.
export default async function AssetConstantsPage() {
  let shipmentTypesData = null;
  let shipmentMethodsData = null;
  let reasonTypesData = null;
  let invoiceViewData = null;
  let dangerousProductTypesData = null;
  let errorMessage = '';

  const headers = {
    'Content-Type': 'application/json',
    'Username': 'mayantekno',
    'Password': '975ADFCD6F1642F0AC5FE2D6AAC8DD64',
    'ApiKey': 'DE6AF20F-41F1-403F-977A-EC0CF03956E4'
  };

  try {
    // GetShipmentTypes isteği
    const typesResponse = await fetch('https://customerapi.assetoptimus.com/api/WorldWideService/GetShipmentTypes', {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    if (typesResponse.ok) {
      shipmentTypesData = await typesResponse.json();
    } else {
      errorMessage += `GetShipmentTypes Hata: ${typesResponse.status} | `;
    }

    // GetShipmentMethods isteği
    const methodsResponse = await fetch('https://customerapi.assetoptimus.com/api/WorldWideService/GetShipmentMethods', {
      method: 'GET',
      headers,
      cache: 'no-store'
    });
    
    if (methodsResponse.ok) {
      shipmentMethodsData = await methodsResponse.json();
    } else {
      errorMessage += `GetShipmentMethods Hata: ${methodsResponse.status} | `;
    }

    // GetProductShipmentReasonTypes isteği
    const reasonTypesResponse = await fetch('https://customerapi.assetoptimus.com/api/WorldWideService/GetProductShipmentReasonTypes', {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    if (reasonTypesResponse.ok) {
      reasonTypesData = await reasonTypesResponse.json();
    } else {
      errorMessage += `GetProductShipmentReasonTypes Hata: ${reasonTypesResponse.status} | `;
    }

    // GetAssetInvoiceView isteği
    const invoiceViewResponse = await fetch('https://customerapi.assetoptimus.com/api/WorldWideService/GetAssetInvoiceView', {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    if (invoiceViewResponse.ok) {
      invoiceViewData = await invoiceViewResponse.json();
    } else {
      errorMessage += `GetAssetInvoiceView Hata: ${invoiceViewResponse.status} | `;
    }

    // GetDangerousProductTypes isteği
    const dangerousResponse = await fetch('https://customerapi.assetoptimus.com/api/WorldWideService/GetDangerousProductTypes', {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    if (dangerousResponse.ok) {
      dangerousProductTypesData = await dangerousResponse.json();
    } else {
      errorMessage += `GetDangerousProductTypes Hata: ${dangerousResponse.status}`;
    }

  } catch (err: any) {
    errorMessage += err.message || "İstek atılırken bilinmeyen bir hata oluştu";
  }

  return (
    <div className="p-8 max-w-5xl mx-auto mt-10 bg-white shadow-md rounded-lg border border-gray-200">
      <h1 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">Asset API - Sabit Değer Testleri</h1>
      
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
          <strong>Hata:</strong> {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Shipment Types Sütunu */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">GetShipmentTypes</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono shadow-inner h-[400px] overflow-y-auto">
            {shipmentTypesData ? JSON.stringify(shipmentTypesData, null, 2) : "Veri getirilemedi..."}
          </pre>
        </div>

        {/* Shipment Methods Sütunu */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">GetShipmentMethods</h2>
          <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg overflow-x-auto text-sm font-mono shadow-inner h-[400px] overflow-y-auto">
            {shipmentMethodsData ? JSON.stringify(shipmentMethodsData, null, 2) : "Veri getirilemedi..."}
          </pre>
        </div>

        {/* Reason Types Sütunu */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">GetProductShipmentReasonTypes</h2>
          <pre className="bg-gray-900 text-yellow-400 p-4 rounded-lg overflow-x-auto text-sm font-mono shadow-inner h-[400px] overflow-y-auto">
            {reasonTypesData ? JSON.stringify(reasonTypesData, null, 2) : "Veri getirilemedi..."}
          </pre>
        </div>

        {/* Invoice View Sütunu */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">GetAssetInvoiceView</h2>
          <pre className="bg-gray-900 text-pink-400 p-4 rounded-lg overflow-x-auto text-sm font-mono shadow-inner h-[400px] overflow-y-auto">
            {invoiceViewData ? JSON.stringify(invoiceViewData, null, 2) : "Veri getirilemedi..."}
          </pre>
        </div>

        {/* Dangerous Product Types Sütunu */}
        <div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">GetDangerousProductTypes</h2>
          <pre className="bg-gray-900 text-red-400 p-4 rounded-lg overflow-x-auto text-sm font-mono shadow-inner h-[400px] overflow-y-auto">
            {dangerousProductTypesData ? JSON.stringify(dangerousProductTypesData, null, 2) : "Veri getirilemedi..."}
          </pre>
        </div>
      </div>
    </div>
  );
}
