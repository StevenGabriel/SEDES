import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configurar icono de marcador personalizado de alta fidelidad
const pinIcon = L.divIcon({
  className: 'custom-leaflet-marker',
  html: `
    <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center;">
      <div style="background-color: #19324d; color: white; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; white-space: nowrap; box-shadow: 0 4px 6px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.7); margin-bottom: 2px;">
        Ubicación
      </div>
      <div style="width: 32px; height: 32px; background-color: #dc2626; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(220,38,38,0.5); border: 2px solid white;">
        <svg style="width: 18px; height: 18px; fill: white; color: white;" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0]
});

export default function RealMapPicker({ latitud, longitud, onChange, onChangeCoordenadas, height = "240px" }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const initialLat = latitud || -17.3895;
  const initialLng = longitud || -66.1568;

  const emitChange = (latVal, lngVal) => {
    const latNum = parseFloat(latVal.toFixed(6));
    const lngNum = parseFloat(lngVal.toFixed(6));
    if (onChange) {
      onChange({ lat: latNum, lng: lngNum });
    }
    if (onChangeCoordenadas) {
      onChangeCoordenadas(latNum, lngNum);
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inicializar mapa si no existe
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Añadir capa de azulejos OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> colaboradores',
        maxZoom: 19
      }).addTo(map);

      // Añadir marcador arrastrable
      const marker = L.marker([initialLat, initialLng], {
        icon: pinIcon,
        draggable: true
      }).addTo(map);

      // Evento: Al arrastrar marcador
      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        emitChange(pos.lat, pos.lng);
      });

      // Evento: Al hacer clic en cualquier lugar del mapa
      map.on('click', (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        emitChange(lat, lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;

      // Corregir tamaño del mapa cuando se renderiza dentro de un modal
      setTimeout(() => {
        map.invalidateSize();
      }, 200);
    } else {
      // Actualizar posición del marcador si cambian las coordenadas externas
      if (markerRef.current) {
        markerRef.current.setLatLng([initialLat, initialLng]);
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([initialLat, initialLng], mapInstanceRef.current.getZoom());
      }
    }

    return () => {
      // Cleanup al desmontar
    };
  }, [latitud, longitud]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-300 shadow-inner group">
      <div 
        ref={mapContainerRef} 
        style={{ height: height, width: '100%', zIndex: 10 }}
        className="cursor-crosshair"
      />
      <div className="absolute top-2 right-2 z-20 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-xl text-[10px] font-bold text-slate-700 shadow-sm border border-slate-200 pointer-events-none">
        OpenStreetMap • Clic o arrastre para ubicar
      </div>
    </div>
  );
}
