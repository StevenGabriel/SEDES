import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Navigation,
  MapPin,
  Clock,
  Calendar as CalendarIcon,
  ChevronDown,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Compass,
  Building2,
  Phone,
  Layers,
  ArrowRight,
  Info,
  Crosshair,
  Radio,
  LocateFixed,
  Car
} from 'lucide-react';

// Coordenadas fijas de la oficina central de SEDES Cochabamba
const SEDES_ORIGEN = {
  nombre: 'Inicio (Oficina SEDES)',
  direccion: 'Av. Aniceto Arce #2875, Cochabamba',
  lat: -17.39352,
  lng: -66.15705
};

export default function RutasInspeccionView({ usuario, onCambiarSeccion, mostrarToast }) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  const [datosRuta, setDatosRuta] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [dropdownFechaOpen, setDropdownFechaOpen] = useState(false);
  const [paradaEnfocada, setParadaEnfocada] = useState(null);

  // Estado de Geolocalización GPS del Usuario
  const [ubicacionGps, setUbicacionGps] = useState(null);
  const [usarGpsComoOrigen, setUsarGpsComoOrigen] = useState(false);
  const [obteniendoGps, setObteniendoGps] = useState(false);
  const [errorGps, setErrorGps] = useState(null);

  // Métricas reales calculadas por calle (OSRM)
  const [metricasViales, setMetricasViales] = useState(null);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const userGpsMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click afuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownFechaOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. Obtener ubicación GPS en tiempo real del navegador
  const activarUbicacionGps = useCallback(() => {
    if (!navigator.geolocation) {
      mostrarToast?.('Tu navegador no soporta geolocalización GPS.', 'warning');
      return;
    }

    setObteniendoGps(true);
    setErrorGps(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const coords = { lat: latitude, lng: longitude, accuracy };
        setUbicacionGps(coords);
        setUsarGpsComoOrigen(true);
        setObteniendoGps(false);
        mostrarToast?.('📍 Ubicación GPS obtenida con éxito.', 'success');
      },
      (err) => {
        console.warn('Error al obtener GPS:', err);
        setObteniendoGps(false);
        setErrorGps('No se pudo acceder a la ubicación. Verifique los permisos del navegador.');
        mostrarToast?.('No se pudo obtener el GPS. Asegúrate de dar permisos de ubicación.', 'warning');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  }, [mostrarToast]);

  // Cargar datos de la ruta desde el backend
  const cargarRuta = useCallback(async (fechaTarget, gpsCoords = null, usarGps = false) => {
    setCargando(true);
    try {
      const supId = usuario?.id || usuario?.email || 'Lic. Andrea Torrico';
      let url = `http://localhost:8000/api/supervisor/${encodeURIComponent(supId)}/rutas?fecha=${fechaTarget}`;
      
      if (usarGps && gpsCoords) {
        url += `&origen_lat=${gpsCoords.lat}&origen_lng=${gpsCoords.lng}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDatosRuta(data);
      } else {
        mostrarToast?.('No se pudieron obtener los recorridos para la fecha seleccionada.', 'warning');
      }
    } catch (err) {
      console.warn('Error al cargar rutas:', err);
      mostrarToast?.('Error al conectar con el servidor para obtener rutas.', 'warning');
    } finally {
      setCargando(false);
    }
  }, [usuario, mostrarToast]);

  // Efecto cuando cambia fecha o preferencia de GPS
  useEffect(() => {
    cargarRuta(fechaSeleccionada, ubicacionGps, usarGpsComoOrigen);
  }, [fechaSeleccionada, ubicacionGps, usarGpsComoOrigen, cargarRuta]);

  // 2. Inicializar o actualizar el mapa con Leaflet y trazado vial real (OSRM)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Crear instancia del mapa si aún no existe
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [SEDES_ORIGEN.lat, SEDES_ORIGEN.lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: false
      });

      // Capa oficial de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
      markersGroupRef.current = L.featureGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;

    // Limpiar capas previas
    if (markersGroup) markersGroup.clearLayers();
    if (polylineRef.current) {
      map.removeLayer(polylineRef.current);
      polylineRef.current = null;
    }

    const paradas = datosRuta?.paradas || [];
    const origenActual = (usarGpsComoOrigen && ubicacionGps)
      ? {
          nombre: 'Mi Ubicación Actual (GPS)',
          direccion: 'Ubicación en tiempo real del supervisor',
          lat: ubicacionGps.lat,
          lng: ubicacionGps.lng,
          esGps: true
        }
      : (datosRuta?.origen || SEDES_ORIGEN);

    const puntosRuta = [[origenActual.lat, origenActual.lng]];

    // Marcador de Origen (GPS o SEDES)
    if (origenActual.esGps || (usarGpsComoOrigen && ubicacionGps)) {
      // Marcador animado estilo GPS Radar Azul
      const gpsIconHtml = `
        <div style="position:relative;display:flex;align-items:center;cursor:pointer;">
          <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
            <span style="position:absolute;width:100%;height:100%;border-radius:50%;background:#38bdf8;opacity:0.6;animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>
            <div style="position:relative;width:24px;height:24px;border-radius:50%;background:#0284c7;color:#ffffff;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(2,132,199,0.5);border:2.5px solid #ffffff;">
              <svg style="width:13px;height:13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
          <div style="margin-left:6px;background:#f0f9ff;color:#0369a1;border:1px solid #7dd3fc;font-weight:800;font-size:11px;padding:3px 8px;border-radius:9999px;box-shadow:0 2px 5px rgba(0,0,0,0.1);white-space:nowrap;">
            📍 Mi Ubicación GPS
          </div>
        </div>
      `;

      const gpsIcon = L.divIcon({
        className: 'custom-gps-icon',
        html: gpsIconHtml,
        iconSize: [180, 36],
        iconAnchor: [16, 18]
      });

      const gpsMarker = L.marker([origenActual.lat, origenActual.lng], { icon: gpsIcon });
      gpsMarker.bindPopup(`
        <div style="padding:4px;font-family:inherit;color:#0f172a;">
          <div style="font-weight:800;font-size:12px;color:#0369a1;margin-bottom:2px;">
            📍 Tu Posición Actual (GPS)
          </div>
          <p style="font-size:11px;color:#64748b;margin:0;">
            Lat: ${origenActual.lat.toFixed(6)}, Lng: ${origenActual.lng.toFixed(6)}
          </p>
          <div style="font-size:10px;color:#0284c7;font-weight:700;margin-top:4px;">
            Ruta calculada a partir de tu ubicación en vivo.
          </div>
        </div>
      `);
      markersGroup.addLayer(gpsMarker);
    } else {
      // Marcador SEDES Central
      const origenIconHtml = `
        <div style="display:flex;align-items:center;cursor:pointer;">
          <div style="width:28px;height:28px;border-radius:50%;background:#059669;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:12px;box-shadow:0 4px 10px rgba(0,0,0,0.25);border:2px solid #ffffff;">
            ●
          </div>
          <div style="margin-left:6px;background:#ecfdf5;color:#065f46;border:1px solid #6ee7b7;font-weight:800;font-size:11px;padding:3px 8px;border-radius:9999px;box-shadow:0 2px 5px rgba(0,0,0,0.1);white-space:nowrap;">
            ${origenActual.nombre}
          </div>
        </div>
      `;

      const origenIcon = L.divIcon({
        className: 'custom-div-icon-origin',
        html: origenIconHtml,
        iconSize: [180, 32],
        iconAnchor: [14, 16]
      });

      const origenMarker = L.marker([origenActual.lat, origenActual.lng], { icon: origenIcon });
      origenMarker.bindPopup(`
        <div style="padding:4px;font-family:inherit;color:#1e293b;">
          <div style="font-weight:800;font-size:12px;color:#065f46;margin-bottom:2px;">
            🏛 ${origenActual.nombre}
          </div>
          <p style="font-size:11px;color:#64748b;margin:0;">${origenActual.direccion}</p>
          <div style="font-size:10px;color:#059669;font-weight:700;margin-top:4px;">Punto de salida oficial SEDES Cochabamba</div>
        </div>
      `);
      markersGroup.addLayer(origenMarker);
    }

    // Marcadores de Paradas (1, 2, 3...)
    paradas.forEach((p) => {
      puntosRuta.push([p.lat, p.lng]);

      const stopIconHtml = `
        <div style="display:flex;align-items:center;cursor:pointer;">
          <div style="width:30px;height:30px;border-radius:50%;background:#1b2533;color:#ffffff;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;box-shadow:0 4px 12px rgba(0,0,0,0.35);border:2.5px solid #ffffff;">
            ${p.numero}
          </div>
          <div style="margin-left:6px;background:#ffffff;color:#0f172a;border:1px solid #cbd5e1;font-weight:800;font-size:11px;padding:3px 8px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.12);white-space:nowrap;display:flex;align-items:center;gap:4px;">
            <span>${p.nombre}</span>
            <span style="font-size:9px;color:#94a3b8;font-weight:600;">(${p.hora_inicio})</span>
          </div>
        </div>
      `;

      const stopIcon = L.divIcon({
        className: 'custom-div-icon-stop',
        html: stopIconHtml,
        iconSize: [200, 32],
        iconAnchor: [15, 16]
      });

      const stopMarker = L.marker([p.lat, p.lng], { icon: stopIcon });
      
      const navUrl = `https://www.google.com/maps/dir/?api=1&origin=${origenActual.lat},${origenActual.lng}&destination=${p.lat},${p.lng}&travelmode=driving`;

      stopMarker.bindPopup(`
        <div style="padding:6px;max-width:260px;font-family:inherit;color:#1e293b;">
          <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #e2e8f0;padding-bottom:4px;margin-bottom:6px;">
            <span style="font-weight:800;font-size:12px;color:#005596;">Parada #${p.numero}</span>
            <span style="font-size:10px;font-weight:800;padding:2px 6px;border-radius:4px;background:${p.tagColor === 'orange' ? '#fef3c7;color:#92400e;' : '#dbeafe;color:#1e40af;'}">
              ${p.tipo}
            </span>
          </div>
          <h4 style="font-weight:800;font-size:13px;margin:0 0 4px 0;color:#0f172a;">${p.nombre}</h4>
          <div style="font-size:11px;color:#475569;line-height:1.4;">
            <p style="margin:2px 0;"><strong>🕒 Horario:</strong> ${p.horario}</p>
            <p style="margin:2px 0;"><strong>📍 Dirección:</strong> ${p.direccion}</p>
            <p style="margin:2px 0;"><strong>🌐 Coordenadas:</strong> ${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}</p>
            <p style="margin:2px 0;"><strong>👤 Titular:</strong> ${p.propietario}</p>
          </div>
          <div style="margin-top:8px;">
            <a 
              href="${navUrl}" 
              target="_blank" 
              rel="noopener noreferrer"
              style="display:flex;align-items:center;justify-content:center;gap:4px;width:100%;background:#1b2533;color:#ffffff;font-size:11px;font-weight:700;padding:6px 10px;border-radius:8px;text-decoration:none;"
            >
              <span>Navegar con Google Maps</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      `);

      markersGroup.addLayer(stopMarker);
    });

    // 3. Trazado de Ruta Vial Real por Calles mediante OSRM (Open Source Routing Machine)
    if (puntosRuta.length > 1) {
      // Construir URL de waypoints OSRM: lng,lat;lng,lat...
      const waypoints = puntosRuta.map(pt => `${pt[1]},${pt[0]}`).join(';');
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`;

      fetch(osrmUrl)
        .then(res => res.json())
        .then(data => {
          if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
            const ruta = data.routes[0];
            const coordinates = ruta.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Invertir [lng, lat] a [lat, lng]

            // Dibujar ruta exacta por calles con estilo vial
            polylineRef.current = L.polyline(coordinates, {
              color: '#0284c7',
              weight: 4.5,
              opacity: 0.9,
              dashArray: '8, 8',
              lineCap: 'round',
              lineJoin: 'round'
            }).addTo(map);

            // Actualizar métricas reales viales
            setMetricasViales({
              distancia_km: (ruta.distance / 1000).toFixed(1),
              tiempo_min: Math.max(5, Math.round(ruta.duration / 60))
            });

            // Ajustar vista
            map.fitBounds(polylineRef.current.getBounds(), {
              padding: [50, 50],
              maxZoom: 15
            });
          } else {
            throw new Error('OSRM fallback');
          }
        })
        .catch(() => {
          // Fallback en caso de que OSRM no responda: Línea directa
          polylineRef.current = L.polyline(puntosRuta, {
            color: '#1b2533',
            weight: 3.5,
            opacity: 0.85,
            dashArray: '6, 8',
            lineCap: 'round',
            lineJoin: 'round'
          }).addTo(map);

          map.fitBounds(polylineRef.current.getBounds(), {
            padding: [50, 50],
            maxZoom: 15
          });
        });
    } else {
      map.setView([origenActual.lat, origenActual.lng], 14);
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => clearTimeout(timer);

  }, [datosRuta, ubicacionGps, usarGpsComoOrigen]);

  // Centrar mapa en una parada específica
  const handleCentrarEnParada = (parada) => {
    setParadaEnfocada(parada.numero);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([parada.lat, parada.lng], 16, {
        animate: true,
        duration: 1.2
      });
    }
  };

  // Restablecer vista de toda la ruta
  const handleResetearVista = () => {
    setParadaEnfocada(null);
    if (mapInstanceRef.current && polylineRef.current) {
      mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), {
        padding: [50, 50]
      });
    } else if (mapInstanceRef.current) {
      const orig = (usarGpsComoOrigen && ubicacionGps) ? ubicacionGps : SEDES_ORIGEN;
      mapInstanceRef.current.setView([orig.lat, orig.lng], 13);
    }
  };

  const paradas = datosRuta?.paradas || [];
  const resumenBackend = datosRuta?.resumen || { distancia_total_km: 0, tiempo_estimado_min: 0, total_paradas: 0 };
  
  // Si OSRM calculó distancia por calles, la usamos; si no, la del backend
  const distanciaTotalMostrar = metricasViales?.distancia_km || resumenBackend.distancia_total_km;
  const tiempoTotalMostrar = metricasViales?.tiempo_min || resumenBackend.tiempo_estimado_min;

  const fechaInfo = datosRuta?.fecha || { formato: 'Fecha seleccionada', badge: 'Día' };
  const fechasDisponibles = datosRuta?.fechas_disponibles || [];
  const origenActivo = (usarGpsComoOrigen && ubicacionGps) ? ubicacionGps : (datosRuta?.origen || SEDES_ORIGEN);

  return (
    <div className="space-y-6">
      
      {/* ===================================================================== */}
      {/* 1. CABECERA CON TÍTULO, CONTROL GPS Y SELECTOR DE DÍA                 */}
      {/* ===================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Rutas de Inspección
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Planifique y optimice sus recorridos diarios con GPS en tiempo real y geolocalización de laboratorios.
          </p>
        </div>

        {/* Controles de Cabecera: Toggle GPS y Selector de Día */}
        <div className="flex items-center flex-wrap gap-2.5">
          
          {/* Botón de Geolocalización GPS en Vivo */}
          <button
            type="button"
            onClick={() => {
              if (ubicacionGps) {
                setUsarGpsComoOrigen(prev => !prev);
              } else {
                activarUbicacionGps();
              }
            }}
            disabled={obteniendoGps}
            className={`
              flex items-center space-x-2 px-3.5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition shadow-2xs cursor-pointer border
              ${usarGpsComoOrigen && ubicacionGps
                ? 'bg-sky-50 text-sky-700 border-sky-300 ring-2 ring-sky-200'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
              }
            `}
            title="Usar mi ubicación GPS actual como punto de partida"
          >
            <Crosshair className={`w-4 h-4 ${obteniendoGps ? 'animate-spin text-sky-600' : (usarGpsComoOrigen ? 'text-sky-600' : 'text-slate-500')}`} />
            <span>
              {obteniendoGps 
                ? 'Obteniendo GPS...' 
                : (usarGpsComoOrigen && ubicacionGps ? '📍 GPS Activo' : 'Usar mi GPS')
              }
            </span>
          </button>

          {/* Dropdown Selector de Día */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownFechaOpen(prev => !prev)}
              className="flex items-center space-x-2.5 bg-white border border-slate-200 hover:border-slate-300 px-4 py-2.5 rounded-2xl shadow-2xs font-bold text-xs sm:text-sm text-slate-800 transition cursor-pointer"
            >
              <CalendarIcon className="w-4 h-4 text-[#0060a8]" />
              <span>{fechaInfo.badge || `Día: ${fechaSeleccionada}`}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownFechaOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menú Desplegable con Fechas Programadas y Selector */}
            {dropdownFechaOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 space-y-3 animate-fadeIn">
                <div className="text-[10px] font-extrabold uppercase text-slate-400 px-2 tracking-wider">
                  Fechas con Inspecciones Programadas
                </div>

                {/* Lista de Fechas */}
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {fechasDisponibles.map((f) => {
                    const isSelected = f.fecha_iso === fechaSeleccionada;
                    return (
                      <button
                        key={f.fecha_iso}
                        type="button"
                        onClick={() => {
                          setFechaSeleccionada(f.fecha_iso);
                          setDropdownFechaOpen(false);
                        }}
                        className={`
                          w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between cursor-pointer
                          ${isSelected 
                            ? 'bg-[#004b85] text-white' 
                            : 'text-slate-700 hover:bg-slate-100'
                          }
                        `}
                      >
                        <span>{f.label}</span>
                        {isSelected && <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">Activo</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Selector de Fecha Manual */}
                <div className="border-t border-slate-100 pt-2.5 px-1 space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 block">
                    Seleccionar otra fecha:
                  </label>
                  <input
                    type="date"
                    value={fechaSeleccionada}
                    onChange={(e) => {
                      if (e.target.value) {
                        setFechaSeleccionada(e.target.value);
                        setDropdownFechaOpen(false);
                      }
                    }}
                    className="w-full text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0060a8] focus:bg-white outline-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Banner Informativo de Punto de Partida */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2.5 text-slate-700 font-bold">
          <span className="text-base">{usarGpsComoOrigen ? '📍' : '🏛'}</span>
          <span>Punto de partida:</span>
          <span className="text-slate-900 font-extrabold bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            {usarGpsComoOrigen && ubicacionGps ? 'Mi Ubicación Actual (GPS en Vivo)' : 'Oficina SEDES Central (Av. Aniceto Arce #2875)'}
          </span>
        </div>

        <div className="flex items-center space-x-2 text-[11px]">
          <span className="text-slate-400">Ruta por calles:</span>
          <span className="font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
            Tráfico y calles de Cochabamba (OSRM)
          </span>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. GRID PRINCIPAL: MAPA (IZQUIERDA) + PARADAS DEL DÍA (DERECHA)       */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ------------------------------------------------------------------- */}
        {/* COLUMNA IZQUIERDA: MAPA INTERACTIVO Y BARRA INFERIOR DE RESUMEN     */}
        {/* ------------------------------------------------------------------- */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Contenedor del Mapa */}
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            
            {/* Contenedor Leaflet */}
            <div 
              ref={mapContainerRef} 
              className="w-full h-[460px] sm:h-[500px] z-0"
              style={{ minHeight: '460px' }}
            />

            {/* Controles Flotantes Superiores en el Mapa */}
            <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
              <button
                type="button"
                onClick={handleResetearVista}
                className="bg-white/95 hover:bg-white text-slate-700 p-2 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition cursor-pointer flex items-center space-x-1.5 text-xs font-bold px-3"
                title="Restablecer vista general de la ruta"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#0060a8]" />
                <span>Centrar Ruta</span>
              </button>

              <button
                type="button"
                onClick={activarUbicacionGps}
                className="bg-white/95 hover:bg-white text-slate-700 p-2 rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition cursor-pointer flex items-center space-x-1.5 text-xs font-bold px-3"
                title="Actualizar mi posición GPS"
              >
                <LocateFixed className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mi GPS</span>
              </button>
            </div>

            {/* Overlay de Cargando */}
            {cargando && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-2xs flex items-center justify-center z-20">
                <div className="bg-white px-4 py-3 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3 text-xs font-bold text-slate-700">
                  <div className="w-4 h-4 border-2 border-[#0060a8] border-t-transparent rounded-full animate-spin" />
                  <span>Calculando ruta y geolocalización...</span>
                </div>
              </div>
            )}
          </div>

          {/* Barra Inferior de Métricas de Ruta (Figma Style) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs px-5 py-3.5 flex flex-wrap items-center justify-around gap-4 text-xs font-bold text-slate-700">
            
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">🛣</span>
              <span className="text-slate-500 font-medium">Distancia total:</span>
              <span className="text-slate-900 font-extrabold">{distanciaTotalMostrar} km</span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">⏱</span>
              <span className="text-slate-500 font-medium">Tiempo estimado:</span>
              <span className="text-slate-900 font-extrabold">{tiempoTotalMostrar} min</span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center space-x-2">
              <span className="text-slate-400">📍</span>
              <span className="text-slate-500 font-medium">Establecimientos:</span>
              <span className="text-slate-900 font-extrabold">{resumenBackend.total_paradas} paradas</span>
            </div>

          </div>

        </div>

        {/* ------------------------------------------------------------------- */}
        {/* COLUMNA DERECHA: PARADAS DEL DÍA (LISTA ORDENADA)                   */}
        {/* ------------------------------------------------------------------- */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
          
          {/* Cabecera de la Sección */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Paradas del Día
            </h3>
            <span className="text-xs font-bold text-slate-500">
              {fechaInfo.formato}
            </span>
          </div>

          {/* Lista de Tarjetas de Paradas */}
          <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
            {paradas.length === 0 ? (
              
              /* Estado Vacío */
              <div className="text-center py-10 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0060a8] flex items-center justify-center mx-auto">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    No tienes paradas programadas
                  </p>
                  <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                    No se encontraron inspecciones para el {fechaInfo.formato}. Puedes cambiar de fecha o agendar desde Mi Agenda.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onCambiarSeccion?.('mi-agenda')}
                  className="bg-[#1b2533] hover:bg-[#111827] text-white text-xs font-bold px-4 py-2 rounded-xl transition inline-flex items-center space-x-1.5 cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Ir a Mi Agenda</span>
                </button>
              </div>

            ) : (

              /* Tarjetas de Paradas con Datos GPS Reales del Laboratorio */
              paradas.map((parada) => {
                const isSelected = paradaEnfocada === parada.numero;
                
                // URL de Navegación Google Maps con Origen y Destino exacto
                const origLat = origenActivo?.lat || SEDES_ORIGEN.lat;
                const origLng = origenActivo?.lng || SEDES_ORIGEN.lng;
                const navUrl = `https://www.google.com/maps/dir/?api=1&origin=${origLat},${origLng}&destination=${parada.lat},${parada.lng}&travelmode=driving`;

                return (
                  <div
                    key={parada.inspeccion_id || parada.numero}
                    className={`
                      p-4 rounded-2xl bg-white border transition-all space-y-3 relative group
                      ${isSelected 
                        ? 'border-[#0060a8] ring-2 ring-blue-100 shadow-md' 
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }
                    `}
                  >
                    {/* Fila Superior: Número, Nombre y Tag */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start space-x-3">
                        
                        {/* Número de Parada */}
                        <div className="w-7 h-7 rounded-full bg-[#1b2533] text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-sm">
                          {parada.numero}
                        </div>

                        {/* Nombre y Horario */}
                        <div>
                          <h4 
                            onClick={() => handleCentrarEnParada(parada)}
                            className="text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#0060a8] transition cursor-pointer leading-snug"
                          >
                            {parada.nombre}
                          </h4>
                          <div className="flex items-center space-x-1 text-slate-400 text-[11px] font-medium mt-0.5">
                            <Clock className="w-3 h-3" />
                            <span>{parada.horario}</span>
                          </div>
                        </div>

                      </div>

                      {/* Tag de Trámite */}
                      <span className={`
                        text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider shrink-0
                        ${parada.tagColor === 'orange' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }
                      `}>
                        {parada.tipoTag}
                      </span>
                    </div>

                    {/* Dirección y Coordenadas GPS del Laboratorio */}
                    <div className="space-y-1 text-xs text-slate-600 pl-10">
                      <div className="flex items-start space-x-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="font-semibold text-slate-800">{parada.direccion}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-mono pl-5">
                        <span>GPS: {parada.lat.toFixed(5)}, {parada.lng.toFixed(5)}</span>
                      </div>
                    </div>

                    {/* Botón Iniciar Navegación Turn-by-Turn */}
                    <div className="pl-10 pt-1">
                      <a
                        href={navUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-800 hover:text-slate-900 text-xs font-bold transition shadow-2xs group/btn cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-slate-700 group-hover/btn:text-[#0060a8] transition" />
                        <span>Iniciar Navegación GPS</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>

                  </div>
                );
              })

            )}
          </div>

        </div>

      </div>

    </div>
  );
}
