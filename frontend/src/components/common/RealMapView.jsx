import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const createLabPinIcon = (nombre) => {
  return L.divIcon({
    className: 'custom-leaflet-view-marker',
    html: `
      <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
        <div style="background-color: #19324d; color: white; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.8); margin-bottom: 3px;">
          ${nombre || 'Laboratorio'}
        </div>
        <div style="width: 36px; height: 36px; background-color: #dc2626; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220,38,38,0.6); border: 2.5px solid white;">
          <svg style="width: 20px; height: 20px; fill: white; color: white;" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export default function RealMapView({ latitud, longitud, nombre, direccion, height = "380px" }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  const lat = typeof latitud === 'number' && !isNaN(latitud) ? latitud : parseFloat(latitud) || -17.3895;
  const lng = typeof longitud === 'number' && !isNaN(longitud) ? longitud : parseFloat(longitud) || -66.1568;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        if (mapContainerRef.current._leaflet_id) {
          mapContainerRef.current._leaflet_id = null;
        }

        const boliviaBounds = [
          [-24.0, -71.5],
          [-8.5, -56.0]
        ];

        const map = L.map(mapContainerRef.current, {
          center: [lat, lng],
          zoom: 16,
          minZoom: 7,
          maxZoom: 19,
          maxBounds: boliviaBounds,
          maxBoundsViscosity: 0.9,
          zoomControl: true,
          scrollWheelZoom: true
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores',
          minZoom: 7,
          maxZoom: 19,
          noWrap: true,
          bounds: boliviaBounds
        }).addTo(map);

        const marker = L.marker([lat, lng], {
          icon: createLabPinIcon(nombre)
        }).addTo(map);

        if (direccion) {
          marker.bindPopup(`<strong>${nombre || 'Laboratorio'}</strong><br/>${direccion}`).openPopup();
        }

        mapInstanceRef.current = map;

        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        }, 250);
      } else {
        mapInstanceRef.current.setView([lat, lng], 16);
      }
    } catch (err) {
      console.warn('Leaflet map init warning:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng, nombre, direccion]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
      <div 
        ref={mapContainerRef} 
        style={{ height: height, width: '100%', zIndex: 10 }}
      />
    </div>
  );
}
