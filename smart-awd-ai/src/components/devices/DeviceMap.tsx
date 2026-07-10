"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { SensorData } from '@/hooks/useFirebaseData';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export default function DeviceMap({ 
  devices, 
  latestData 
}: { 
  devices: any[], 
  latestData: Record<string, SensorData> 
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Calculate bounds to fit all markers
  const validDevices = devices.filter(d => d.lat && d.lng);
  
  const getMarkerIcon = (status: string) => {
    let color = '#9ca3af'; // Offline/Unknown (Gray)
    if (status.includes('AMAN')) color = '#22c55e'; // Green
    else if (status.includes('KEKERINGAN')) color = '#f59e0b'; // Amber
    else if (status.includes('KELEBIHAN')) color = '#ef4444'; // Red

    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: ${color}; 
        width: 24px; 
        height: 24px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        ${status.includes('KELEBIHAN') ? '<div style="width: 8px; height: 8px; background: white; border-radius: 50%; animation: pulse 1.5s infinite;"></div>' : ''}
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12]
    });
  };

  // Center on Indonesia if no valid devices
  const center: [number, number] = validDevices.length > 0 
    ? [validDevices[0].lat, validDevices[0].lng] 
    : [-2.5489, 118.0149];
    
  const zoom = validDevices.length > 0 ? 11 : 5;

  return (
    <div className="h-[600px] w-full rounded-2xl overflow-hidden border border-[var(--bg-glass-border)] z-0 relative bg-[var(--bg-card)] shadow-lg">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {validDevices.map((device) => {
          const data = latestData[device.id];
          const hasData = !!data;
          const level = hasData ? parseFloat(data.water_level_cm.toString()) : 0;
          
          let isStale = true;
          let timeAgo = "Belum ada data";
          
          if (hasData && data.created_at) {
            const dataTime = typeof data.created_at === 'number' ? data.created_at : new Date(data.created_at).getTime();
            const ageMs = Date.now() - dataTime;
            isStale = ageMs > 6 * 60 * 60 * 1000;
            timeAgo = formatDistanceToNow(dataTime, { addSuffix: true, locale: idLocale });
          }

          const status = isStale && !hasData ? 'OFFLINE' : (hasData ? data.status : 'OFFLINE');
          const levelStr = hasData ? (level >= 0 ? `+${level.toFixed(1)}` : level.toFixed(1)) : '--.-';

          return (
            <Marker 
              key={device.id} 
              position={[device.lat, device.lng]}
              icon={getMarkerIcon(status)}
            >
              <Popup className="custom-popup">
                <div className="p-1 min-w-[150px]">
                  <h3 className="font-bold text-gray-900 text-base">{device.name}</h3>
                  <p className="text-xs text-gray-500 font-mono mb-3">{device.id}</p>
                  
                  <div className="flex items-end gap-1 mb-1">
                    <span className={`text-2xl font-black font-mono tracking-tighter ${
                      status.includes('AMAN') ? 'text-green-600' : 
                      status.includes('KELEBIHAN') ? 'text-red-600' : 
                      status.includes('KEKERINGAN') ? 'text-amber-600' : 'text-gray-500'
                    }`}>
                      {levelStr}
                    </span>
                    <span className="text-xs text-gray-500 pb-1">cm</span>
                  </div>
                  
                  <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 inline-block rounded-full mb-3 ${
                      status.includes('AMAN') ? 'bg-green-100 text-green-700' : 
                      status.includes('KELEBIHAN') ? 'bg-red-100 text-red-700' : 
                      status.includes('KEKERINGAN') ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {status}
                  </div>
                  
                  <div className="text-[10px] text-gray-500 italic mb-4">
                    Update: {timeAgo}
                  </div>
                  
                  <Link 
                    href={`/devices/${device.id}`}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg transition-colors"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Global Style for Leaflet Popup */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .leaflet-popup-content {
          margin: 12px;
        }
      `}} />
    </div>
  );
}
