'use client';

import React, { useState } from 'react';
import DebugAssetLabel from '../debug-asset';

export default function DebugAssetPage() {
  const [shipmentId, setShipmentId] = useState('');
  const [activeId, setActiveId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveId(shipmentId);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Asset API Debugger</h1>
      <div className="mb-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <div className="flex-1">
            <label htmlFor="shipmentId" className="block text-sm font-medium text-gray-700 mb-2">
              Test edilecek Shipment ID
            </label>
            <input 
              id="shipmentId"
              type="text" 
              value={shipmentId}
              onChange={(e) => setShipmentId(e.target.value)}
              placeholder="Örn: 664f3..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-slate-500 outline-none transition-all"
            />
          </div>
          <button 
            type="submit"
            className="px-6 py-3 bg-slate-800 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors h-[50px]"
          >
            Sorgula
          </button>
        </form>
      </div>
      
      {activeId ? (
        <DebugAssetLabel shipmentId={activeId} />
      ) : (
        <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300 mt-8">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-lg">Etiketlerini görüntülemek için bir Shipment ID girin ve Sorgula'ya basın.</p>
        </div>
      )}
    </div>
  );
}
