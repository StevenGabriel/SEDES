import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Diccionario oficial de las 8 Especialidades del SEDES con sus colores e iconos SVG
export const ESPECIALIDADES_MAPA = {
  GENERAL: {
    id: 1,
    nombre: 'LABORATORIO CLÍNICO GENERAL',
    shortName: 'Clínico General',
    colorHex: '#0f766e', // teal-700
    badgeBg: '#134e4a',
    svgIcon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:17px;height:17px;color:white;">
        <path d="M6 18h8"/><path d="M3 22h18"/><path d="M14 22a7 7 0 1 0 0-14h-1"/><path d="M9 14h2"/><path d="M9 12a2 2 0 0 1-2-2V6h6v4a2 2 0 0 1-2 2Z"/><path d="M12 6V3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3"/>
      </svg>
    `
  },
  MICROBIOLOGIA: {
    id: 2,
    nombre: 'LABORATORIO CLÍNICO MICROBIOLÓGICO',
    shortName: 'Clínico Microbiológico',
    colorHex: '#312e81', // indigo-900
    badgeBg: '#1e1b4b',
    svgIcon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:17px;height:17px;color:white;">
        <circle cx="12" cy="11.9" r="2"/><path d="M6.7 3.4a9.7 9.7 0 0 1 10.6 0"/><path d="M19.3 10.3a9.7 9.7 0 0 1-5.3 9.2"/><path d="M10 19.5a9.7 9.7 0 0 1-5.3-9.2"/><circle cx="12" cy="7" r="3"/><circle cx="7.7" cy="14.5" r="3"/><circle cx="16.3" cy="14.5" r="3"/>
      </svg>
    `
  },
  ANATOMIA: {
    id: 3,
    nombre: 'LABORATORIO DE ANATOMÍA PATOLÓGICA Y CITOLOGÍA',
    shortName: 'Anatomía Patológica y Citología',
    colorHex: '#7e22ce', // purple-700
    badgeBg: '#581c87',
    svgIcon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:17px;height:17px;color:white;">
        <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
      </svg>
    `
  },
  HEMATOLOGIA: {
    id: 4,
    nombre: 'LABORATORIO DE HEMATOLOGÍA',
    shortName: 'Hematología',
    colorHex: '#b91c1c', // red-700
    badgeBg: '#7f1d1d',
    svgIcon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:17px;height:17px;color:white;">
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
      </svg>
    `
  },
  INMUNOLOGIA: {
    id: 5,
    nombre: 'LABORATORIO DE INMUNOLOGÍA',
    shortName: 'Inmunología',
    colorHex: '#0284c7', // sky-600
    badgeBg: '#0369a1',
    svgIcon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:17px;height:17px;color:white;">
        <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.48 12H2"/>
      </svg>
    `
  },
  ENDOCRINOLOGIA: {
    id: 6,
    nombre: 'LABORATORIO DE ENDOCRINOLOGÍA',
    shortName: 'Endocrinología',
    colorHex: '#65a30d', // lime-600
    badgeBg: '#3f6212',
    svgIcon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:17px;height:17px;color:white;">
        <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
      </svg>
    `
  },
  GENETICA: {
    id: 7,
    nombre: 'LABORATORIO DE GENÉTICA',
    shortName: 'Genética',
    colorHex: '#1e293b', // slate-800
    badgeBg: '#0f172a',
    svgIcon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:17px;height:17px;color:white;">
        <path d="m10 16 1.5 1.5"/><path d="m14 8-1.5-1.5"/><path d="M15 2c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="m17 6-2.5-2.5"/><path d="m2 15 2 2"/><path d="m2 9 2 2"/><path d="M20 9c-1.798 1.998-2.518 3.995-2.807 5.993"/><path d="m20 15-2-2"/><path d="m22 17-2.5-2.5"/><path d="m4.5 13.5 2 2"/><path d="m4.5 7.5 2 2"/><path d="M9 22c1.798-1.998 2.518-3.995 2.807-5.993"/><path d="m9 5 1.5-1.5"/><path d="m9 9 6 6"/>
      </svg>
    `
  },
  TOXICOLOGIA: {
    id: 8,
    nombre: 'LABORATORIO DE TOXICOLOGÍA',
    shortName: 'Toxicología',
    colorHex: '#d97706', // amber-600
    badgeBg: '#92400e',
    svgIcon: `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="width:17px;height:17px;color:white;">
        <path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5s-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M14.5 16h-5"/>
      </svg>
    `
  }
};

// Función auxiliar para normalizar nombres y eliminar acentos
export const normalizeMunKey = (name) => {
  return (name || '')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
};

// Generador de polígono geométrico suavizado para municipios con centro y radio
const createBoundingPolygon = (centerLat, centerLng, radiusLat = 0.045, radiusLng = 0.055) => {
  const points = [];
  const numPoints = 12;
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    // Añadir leve variación para dar aspecto orgánico de límite jurisdiccional
    const factor = 0.88 + 0.24 * Math.abs(Math.sin(i * 1.5));
    const lat = centerLat + Math.sin(angle) * radiusLat * factor;
    const lng = centerLng + Math.cos(angle) * radiusLng * factor;
    points.push([Number(lat.toFixed(5)), Number(lng.toFixed(5))]);
  }
  // Cerrar el polígono
  points.push(points[0]);
  return points;
};

// Polígonos de delimitación territorial (GIS) para Cochabamba y sus 47 municipios
export const LIMITES_TERRITORIALES = {
  TODOS: {
    nombre: 'Departamento de Cochabamba (Límites Oficiales)',
    centro: [-17.3895, -66.1568],
    zoom: 8,
    color: '#0073c6',
    coordenadas: [
      [-15.78, -65.45], // TIPNIS Norte (Límite con Beni)
      [-15.88, -65.25],
      [-16.02, -65.12],
      [-16.18, -64.98],
      [-16.32, -64.85],
      [-16.55, -64.65], // Río Ichilo (Límite con Santa Cruz)
      [-16.75, -64.48],
      [-16.98, -64.38], // Puerto Villarroel
      [-17.20, -64.35],
      [-17.42, -64.45], // Parque Carrasco
      [-17.68, -64.62],
      [-17.92, -64.55],
      [-18.15, -64.42], // Pasorapa
      [-18.42, -64.48],
      [-18.62, -64.65], // Extremo Sureste (Río Grande)
      [-18.68, -64.88], // Límite con Chuquisaca
      [-18.65, -65.15], // Omereque / Aiquile
      [-18.52, -65.38],
      [-18.40, -65.65], // Mizque
      [-18.25, -65.92],
      [-18.10, -66.18], // Límite con Potosí (Arque / Capinota)
      [-17.95, -66.42], // Bolívar
      [-17.78, -66.68], // Límite con Oruro
      [-17.58, -66.88], // Tapacarí
      [-17.38, -66.95],
      [-17.15, -66.98], // Ayopaya (Límite con La Paz)
      [-16.85, -66.85], // Cordillera de Cocapata
      [-16.55, -66.62],
      [-16.28, -66.38],
      [-16.05, -66.08], // Serranía de Mosetenes
      [-15.88, -65.78],
      [-15.78, -65.45]  // Cierre en TIPNIS
    ]
  },
  
  // --- REGIÓN METROPOLITANA ---
  CERCADO: {
    nombre: 'Municipio de Cercado (Cochabamba)',
    centro: [-17.3895, -66.1568],
    zoom: 13,
    color: '#005596',
    coordenadas: [
      [-17.320, -66.180],
      [-17.335, -66.120],
      [-17.370, -66.105],
      [-17.430, -66.120],
      [-17.470, -66.160],
      [-17.460, -66.210],
      [-17.400, -66.215],
      [-17.340, -66.195],
      [-17.320, -66.180]
    ]
  },
  SACABA: {
    nombre: 'Municipio de Sacaba',
    centro: [-17.4042, -66.0406],
    zoom: 13,
    color: '#005596',
    coordenadas: [
      [-17.350, -66.070],
      [-17.365, -66.010],
      [-17.410, -65.980],
      [-17.450, -66.020],
      [-17.440, -66.080],
      [-17.390, -66.090],
      [-17.350, -66.070]
    ]
  },
  QUILLACOLLO: {
    nombre: 'Municipio de Quillacollo',
    centro: [-17.3980, -66.2800],
    zoom: 13,
    color: '#005596',
    coordenadas: [
      [-17.340, -66.310],
      [-17.350, -66.240],
      [-17.410, -66.230],
      [-17.460, -66.270],
      [-17.450, -66.350],
      [-17.380, -66.355],
      [-17.340, -66.310]
    ]
  },
  COLCAPIRHUA: {
    nombre: 'Municipio de Colcapirhua',
    centro: [-17.3886, -66.2361],
    zoom: 14,
    color: '#005596',
    coordenadas: [
      [-17.365, -66.250],
      [-17.370, -66.220],
      [-17.410, -66.218],
      [-17.420, -66.255],
      [-17.390, -66.260],
      [-17.365, -66.250]
    ]
  },
  TIQUIPAYA: {
    nombre: 'Municipio de Tiquipaya',
    centro: [-17.3381, -66.2178],
    zoom: 13,
    color: '#005596',
    coordenadas: [
      [-17.280, -66.240],
      [-17.290, -66.190],
      [-17.355, -66.195],
      [-17.365, -66.235],
      [-17.330, -66.250],
      [-17.280, -66.240]
    ]
  },
  VINTO: {
    nombre: 'Municipio de Vinto',
    centro: [-17.4103, -66.3156],
    zoom: 13,
    color: '#005596',
    coordenadas: [
      [-17.365, -66.335],
      [-17.375, -66.295],
      [-17.445, -66.290],
      [-17.455, -66.340],
      [-17.410, -66.350],
      [-17.365, -66.335]
    ]
  },
  'SIPE SIPE': {
    nombre: 'Municipio de Sipe Sipe',
    centro: [-17.4528, -66.3589],
    zoom: 13,
    color: '#005596',
    coordenadas: [
      [-17.400, -66.390],
      [-17.410, -66.330],
      [-17.490, -66.320],
      [-17.510, -66.380],
      [-17.460, -66.410],
      [-17.400, -66.390]
    ]
  },

  // --- REGIÓN VALLE ALTO ---
  PUNATA: {
    nombre: 'Municipio de Punata (Valle Alto)',
    centro: [-17.5480, -65.8350],
    zoom: 13,
    color: '#005596',
    coordenadas: [
      [-17.500, -65.860],
      [-17.510, -65.800],
      [-17.560, -65.790],
      [-17.600, -65.830],
      [-17.590, -65.890],
      [-17.530, -65.895],
      [-17.500, -65.860]
    ]
  },
  CLIZA: {
    nombre: 'Municipio de Cliza',
    centro: [-17.5939, -65.9328],
    zoom: 13,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.5939, -65.9328, 0.04, 0.05)
  },
  TARATA: {
    nombre: 'Municipio de Tarata',
    centro: [-17.6089, -66.0214],
    zoom: 13,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.6089, -66.0214, 0.05, 0.06)
  },
  ARANI: {
    nombre: 'Municipio de Arani',
    centro: [-17.5681, -65.7700],
    zoom: 13,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.5681, -65.7700, 0.045, 0.05)
  },
  ARBIETO: {
    nombre: 'Municipio de Arbieto',
    centro: [-17.5192, -66.0594],
    zoom: 13,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.5192, -66.0594, 0.05, 0.055)
  },
  TOLATA: {
    nombre: 'Municipio de Tolata',
    centro: [-17.5317, -65.9864],
    zoom: 13,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.5317, -65.9864, 0.035, 0.04)
  },
  'SAN BENITO': {
    nombre: 'Municipio de San Benito',
    centro: [-17.5256, -65.8942],
    zoom: 13,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.5256, -65.8942, 0.04, 0.045)
  },
  TOCO: {
    nombre: 'Municipio de Toco',
    centro: [-17.6167, -65.8833],
    zoom: 13,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.6167, -65.8833, 0.035, 0.04)
  },
  'VILLA RIVERO': {
    nombre: 'Municipio de Villa Rivero',
    centro: [-17.6050, -65.7489],
    zoom: 13,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.6050, -65.7489, 0.04, 0.045)
  },
  TACACHI: {
    nombre: 'Municipio de Tacachi',
    centro: [-17.6400, -65.7900],
    zoom: 13,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.6400, -65.7900, 0.03, 0.035)
  },
  CUCHUMUELA: {
    nombre: 'Municipio de Cuchumuela (V. G. Villarroel)',
    centro: [-17.6989, -65.6989],
    zoom: 13,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.6989, -65.6989, 0.045, 0.05)
  },
  ANZALDO: {
    nombre: 'Municipio de Anzaldo',
    centro: [-17.7811, -65.9317],
    zoom: 12,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.7811, -65.9317, 0.06, 0.07)
  },
  'SANTIVÁÑEZ': {
    nombre: 'Municipio de Santiváñez',
    centro: [-17.5439, -66.1367],
    zoom: 13,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.5439, -66.1367, 0.05, 0.055)
  },

  // --- REGIÓN TRÓPICO ---
  'VILLA TUNARI': {
    nombre: 'Municipio de Villa Tunari (Trópico)',
    centro: [-16.9736, -65.4208],
    zoom: 11,
    color: '#005596',
    coordenadas: [
      [-16.700, -65.550],
      [-16.720, -65.380],
      [-16.890, -65.370],
      [-17.050, -65.480],
      [-17.010, -65.600],
      [-16.780, -65.610],
      [-16.700, -65.550]
    ]
  },
  SHINAHOTA: {
    nombre: 'Municipio de Shinahota (Trópico)',
    centro: [-16.9950, -65.2500],
    zoom: 12,
    color: '#005596',
    coordenadas: [
      [-16.930, -65.290],
      [-16.940, -65.200],
      [-17.030, -65.190],
      [-17.070, -65.260],
      [-17.040, -65.320],
      [-16.960, -65.315],
      [-16.930, -65.290]
    ]
  },
  'CHIMORÉ': {
    nombre: 'Municipio de Chimoré (Trópico)',
    centro: [-16.9953, -65.1336],
    zoom: 12,
    color: '#005596',
    coordenadas: createBoundingPolygon(-16.9953, -65.1336, 0.06, 0.07)
  },
  'PUERTO VILLARROEL': {
    nombre: 'Municipio de Puerto Villarroel (Trópico)',
    centro: [-16.8428, -64.7936],
    zoom: 11,
    color: '#005596',
    coordenadas: createBoundingPolygon(-16.8428, -64.7936, 0.08, 0.09)
  },
  'ENTRE RÍOS': {
    nombre: 'Municipio de Entre Ríos (Trópico)',
    centro: [-17.1983, -64.5292],
    zoom: 11,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.1983, -64.5292, 0.08, 0.09)
  },

  // --- REGIÓN CONO SUR ---
  AIQUILE: {
    nombre: 'Municipio de Aiquile',
    centro: [-18.2042, -65.1806],
    zoom: 12,
    color: '#005596',
    coordenadas: createBoundingPolygon(-18.2042, -65.1806, 0.07, 0.08)
  },
  MIZQUE: {
    nombre: 'Municipio de Mizque',
    centro: [-17.9417, -65.3400],
    zoom: 12,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.9417, -65.3400, 0.07, 0.08)
  },
  TOTORA: {
    nombre: 'Municipio de Totora',
    centro: [-17.7333, -65.1833],
    zoom: 12,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.7333, -65.1833, 0.07, 0.08)
  },
  PASORAPA: {
    nombre: 'Municipio de Pasorapa',
    centro: [-18.3222, -64.6736],
    zoom: 11,
    color: '#005596',
    coordenadas: createBoundingPolygon(-18.3222, -64.6736, 0.09, 0.10)
  },
  OMEREQUE: {
    nombre: 'Municipio de Omereque',
    centro: [-18.1139, -64.9083],
    zoom: 12,
    color: '#005596',
    coordenadas: createBoundingPolygon(-18.1139, -64.9083, 0.07, 0.08)
  },
  POCONA: {
    nombre: 'Municipio de Pocona',
    centro: [-17.6472, -65.3889],
    zoom: 12,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.6472, -65.3889, 0.06, 0.07)
  },
  POJO: {
    nombre: 'Municipio de Pojo',
    centro: [-17.7500, -64.8167],
    zoom: 11,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.7500, -64.8167, 0.08, 0.09)
  },
  VACAS: {
    nombre: 'Municipio de Vacas',
    centro: [-17.5667, -65.5833],
    zoom: 12,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.5667, -65.5833, 0.05, 0.06)
  },
  ALALAY: {
    nombre: 'Municipio de Alalay',
    centro: [-17.8000, -65.5000],
    zoom: 12,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.8000, -65.5000, 0.05, 0.06)
  },
  'VILA VILA': {
    nombre: 'Municipio de Vila Vila',
    centro: [-17.9833, -65.6000],
    zoom: 12,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.9833, -65.6000, 0.05, 0.06)
  },

  // --- REGIÓN ANDINA / VALLES ---
  CAPINOTA: {
    nombre: 'Municipio de Capinota',
    centro: [-17.7125, -66.2606],
    zoom: 12,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.7125, -66.2606, 0.06, 0.07)
  },
  ARQUE: {
    nombre: 'Municipio de Arque',
    centro: [-17.7917, -66.3889],
    zoom: 12,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.7917, -66.3889, 0.07, 0.08)
  },
  'TAPACARÍ': {
    nombre: 'Municipio de Tapacarí',
    centro: [-17.5278, -66.6083],
    zoom: 11,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.5278, -66.6083, 0.08, 0.09)
  },
  'BOLÍVAR': {
    nombre: 'Municipio de Bolívar',
    centro: [-17.9667, -66.5333],
    zoom: 11,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.9667, -66.5333, 0.08, 0.09)
  },
  INDEPENDENCIA: {
    nombre: 'Municipio de Independencia (Ayopaya)',
    centro: [-17.0811, -66.8181],
    zoom: 11,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.0811, -66.8181, 0.09, 0.10)
  },
  MOROCHATA: {
    nombre: 'Municipio de Morochata',
    centro: [-17.2750, -66.4917],
    zoom: 11,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.2750, -66.4917, 0.08, 0.09)
  },
  COCAPATA: {
    nombre: 'Municipio de Cocapata',
    centro: [-16.9833, -66.6833],
    zoom: 10,
    color: '#005596',
    coordenadas: createBoundingPolygon(-16.9833, -66.6833, 0.12, 0.14)
  },
  SICAYA: {
    nombre: 'Municipio de Sicaya',
    centro: [-17.8000, -66.3000],
    zoom: 13,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.8000, -66.3000, 0.04, 0.045)
  },
  TACOPAYA: {
    nombre: 'Municipio de Tacopaya',
    centro: [-17.7500, -66.7167],
    zoom: 12,
    color: '#005596',
    coordenadas: createBoundingPolygon(-17.7500, -66.7167, 0.06, 0.07)
  }
};

// Función robusta para resolver los límites territoriales de cualquier municipio
export const getMunicipioLimite = (munName) => {
  if (!munName || munName === 'Todos' || munName === 'TODOS') {
    return LIMITES_TERRITORIALES.TODOS;
  }

  const targetNorm = normalizeMunKey(munName);

  // 1. Coincidencia directa por clave
  if (LIMITES_TERRITORIALES[targetNorm]) {
    return LIMITES_TERRITORIALES[targetNorm];
  }

  // 2. Búsqueda por normalización en el objeto
  for (const [key, val] of Object.entries(LIMITES_TERRITORIALES)) {
    if (normalizeMunKey(key) === targetNorm || normalizeMunKey(val.nombre).includes(targetNorm)) {
      return val;
    }
  }

  // 3. Fallback por defecto al departamento completo
  return LIMITES_TERRITORIALES.TODOS;
};

// Función para determinar si el laboratorio está ABIERTO o CERRADO en tiempo real
export const checkEstaAbierto = (horarioStr) => {
  const horario = horarioStr || "Lun-Vie 7:00 - 19:00, Sáb 8:00 - 13:00";
  const str = horario.toLowerCase();

  // 1. Si atiende 24 horas
  if (str.includes('24 horas') || str.includes('24h') || str.includes('24/7') || str.includes('continuo')) {
    return { abierto: true, texto: 'Abierto 24 Horas', detalle: 'Atención continua' };
  }

  const now = new Date();
  const day = now.getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // 2. Domingo
  if (day === 0) {
    if (str.includes('dom') && (str.includes('domingo') || str.includes('dom-'))) {
      const openTime = 8 * 60;
      const closeTime = 13 * 60;
      if (currentMinutes >= openTime && currentMinutes < closeTime) {
        return { abierto: true, texto: 'Abierto Ahora', detalle: 'Cierra a las 13:00' };
      }
    }
    return { abierto: false, texto: 'Cerrado', detalle: 'Abre el Lunes 07:00' };
  }

  // 3. Sábado
  if (day === 6) {
    if (str.includes('sáb') || str.includes('sab') || str.includes('sabado')) {
      const openTime = 8 * 60;
      const closeTime = 13 * 60;
      if (currentMinutes >= openTime && currentMinutes < closeTime) {
        return { abierto: true, texto: 'Abierto Ahora', detalle: 'Cierra a las 13:00' };
      }
    }
    return { abierto: false, texto: 'Cerrado', detalle: 'Abre el Lunes 07:00' };
  }

  // 4. Lunes a Viernes
  let openTime = 7 * 60;
  let closeTime = 19 * 60;

  const matches = str.match(/(\d{1,2}):?(\d{2})?\s*-\s*(\d{1,2}):?(\d{2})?/);
  if (matches) {
    const h1 = parseInt(matches[1], 10);
    const m1 = matches[2] ? parseInt(matches[2], 10) : 0;
    const h2 = parseInt(matches[3], 10);
    const m2 = matches[4] ? parseInt(matches[4], 10) : 0;
    if (!isNaN(h1) && !isNaN(h2)) {
      openTime = h1 * 60 + m1;
      closeTime = (h2 < 12 && h2 < h1 ? h2 + 12 : h2) * 60 + m2;
    }
  }

  if (currentMinutes >= openTime && currentMinutes < closeTime) {
    const closeHour = Math.floor(closeTime / 60).toString().padStart(2, '0');
    const closeMin = (closeTime % 60).toString().padStart(2, '0');
    return { abierto: true, texto: 'Abierto Ahora', detalle: `Cierra a las ${closeHour}:${closeMin}` };
  } else {
    const openHour = Math.floor(openTime / 60).toString().padStart(2, '0');
    const openMin = (openTime % 60).toString().padStart(2, '0');
    return { abierto: false, texto: 'Cerrado', detalle: `Abre a las ${openHour}:${openMin}` };
  }
};

// Función para extraer y normalizar TODAS las especialidades de un laboratorio
export const getLabSpecialties = (lab) => {
  if (!lab) return [ESPECIALIDADES_MAPA.GENERAL];

  let rawServicios = [];
  if (Array.isArray(lab.servicios)) {
    rawServicios = lab.servicios;
  } else if (typeof lab.servicios === 'string') {
    const trimmed = lab.servicios.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        rawServicios = JSON.parse(trimmed);
      } catch {
        rawServicios = trimmed.split(',');
      }
    } else {
      rawServicios = trimmed.split(',');
    }
  }

  const fullText = `${lab.servicios || ''} ${lab.responsables_areas || ''} ${lab.nombre_comercial || ''} ${lab.tipo || ''}`.toLowerCase();
  
  const foundSpecialties = [];
  const addedIds = new Set();

  const addSpecialty = (esp) => {
    if (esp && !addedIds.has(esp.id)) {
      addedIds.add(esp.id);
      foundSpecialties.push(esp);
    }
  };

  // 1. Revisar cada elemento individual en rawServicios
  rawServicios.forEach(s => {
    const item = (typeof s === 'string' ? s : '').toLowerCase().trim();
    if (!item) return;

    if (item.includes('microbio')) {
      addSpecialty(ESPECIALIDADES_MAPA.MICROBIOLOGIA);
    } else if (item.includes('patol') || item.includes('citol')) {
      addSpecialty(ESPECIALIDADES_MAPA.ANATOMIA);
    } else if (item.includes('hemat')) {
      addSpecialty(ESPECIALIDADES_MAPA.HEMATOLOGIA);
    } else if (item.includes('inmuno')) {
      addSpecialty(ESPECIALIDADES_MAPA.INMUNOLOGIA);
    } else if (item.includes('endo') || item.includes('hormon') || item.includes('bioquim') || item.includes('bioquím')) {
      addSpecialty(ESPECIALIDADES_MAPA.ENDOCRINOLOGIA);
    } else if (item.includes('genét') || item.includes('genet') || item.includes('adn') || item.includes('molecular')) {
      addSpecialty(ESPECIALIDADES_MAPA.GENETICA);
    } else if (item.includes('toxi')) {
      addSpecialty(ESPECIALIDADES_MAPA.TOXICOLOGIA);
    } else if (item.includes('clínic') || item.includes('clinico') || item.includes('general') || item.includes('rutina')) {
      addSpecialty(ESPECIALIDADES_MAPA.GENERAL);
    }
  });

  // 2. Verificar en el texto completo para cada una de las 8 especialidades
  if (fullText.includes('microbio') || fullText.includes('bacterio') || fullText.includes('cultivo')) {
    addSpecialty(ESPECIALIDADES_MAPA.MICROBIOLOGIA);
  }
  if (fullText.includes('patol') || fullText.includes('citol') || fullText.includes('papanicolaou') || fullText.includes('biopsia')) {
    addSpecialty(ESPECIALIDADES_MAPA.ANATOMIA);
  }
  if (fullText.includes('hemat') || fullText.includes('coagulaci')) {
    addSpecialty(ESPECIALIDADES_MAPA.HEMATOLOGIA);
  }
  if (fullText.includes('inmuno') || fullText.includes('serolog') || fullText.includes('anticuerpo') || fullText.includes('alergia')) {
    addSpecialty(ESPECIALIDADES_MAPA.INMUNOLOGIA);
  }
  if (fullText.includes('endo') || fullText.includes('hormon') || fullText.includes('tiroides') || fullText.includes('bioquim') || fullText.includes('bioquím')) {
    addSpecialty(ESPECIALIDADES_MAPA.ENDOCRINOLOGIA);
  }
  if (fullText.includes('genét') || fullText.includes('genet') || fullText.includes('adn') || fullText.includes('molecular')) {
    addSpecialty(ESPECIALIDADES_MAPA.GENETICA);
  }
  if (fullText.includes('toxi') || fullText.includes('drogas')) {
    addSpecialty(ESPECIALIDADES_MAPA.TOXICOLOGIA);
  }

  // 3. Si sigue vacía o incluye explícitamente clínico general
  if (foundSpecialties.length === 0 || fullText.includes('clínic') || fullText.includes('clinico') || fullText.includes('general')) {
    addSpecialty(ESPECIALIDADES_MAPA.GENERAL);
  }

  return foundSpecialties.length > 0 ? foundSpecialties : [ESPECIALIDADES_MAPA.GENERAL];
};

// Función para obtener la especialidad primaria o coincidente con el filtro activo
export const getLabSpecialty = (lab, selectedEspecialidad = null) => {
  const specialties = getLabSpecialties(lab);
  if (selectedEspecialidad) {
    const match = specialties.find(e => e.id === selectedEspecialidad.id || e.key === selectedEspecialidad.key);
    if (match) return match;
  }
  return specialties[0] || ESPECIALIDADES_MAPA.GENERAL;
};

// Generador de iconos personalizados para marcadores de laboratorio
const createMarkerIcon = (lab, isSelected = false, selectedEspecialidad = null) => {
  const estadoHorario = checkEstaAbierto(lab.horario);
  const especialidad = getLabSpecialty(lab, selectedEspecialidad);
  const allSpecialties = getLabSpecialties(lab);
  const isMulti = allSpecialties.length > 1;
  const pinBg = especialidad.colorHex;
  const badgeBg = especialidad.badgeBg;

  return L.divIcon({
    className: 'custom-multi-lab-marker',
    html: `
      <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: pointer;">
        <div style="background-color: ${badgeBg}; color: white; padding: 2.5px 8px; border-radius: 9999px; font-size: 10px; font-weight: 800; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.35); border: 1.5px solid rgba(255,255,255,0.9); margin-bottom: 2px; display: flex; align-items: center; gap: 4px;">
          <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: ${estadoHorario.abierto ? '#10b981' : '#ef4444'};"></span>
          <span>${lab.nombre_comercial}</span>
          ${isMulti ? `<span style="background-color: rgba(255,255,255,0.25); border-radius: 4px; padding: 0 4px; font-size: 9px; font-weight: 800;" title="${allSpecialties.length} especialidades">+${allSpecialties.length - 1}</span>` : ''}
        </div>

        <div style="width: ${isSelected ? '38px' : '33px'}; height: ${isSelected ? '38px' : '33px'}; background-color: ${pinBg}; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(0,0,0,0.45); border: 2.5px solid white; transition: all 0.2s; transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};">
          ${especialidad.svgIcon}
        </div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

export default function RealMultiMapView({ 
  laboratorios = [], 
  selectedLab = null, 
  onSelectLab = () => {},
  selectedMunicipio = 'Todos',
  selectedEspecialidad = null,
  height = "480px" 
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const boundaryLayerRef = useRef(null);
  const markersMapRef = useRef(new Map());

  // 1. Inicializar mapa Leaflet una sola vez
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const boliviaBounds = [
        [-24.0, -71.5], // Suroeste
        [-8.5, -56.0]   // Noreste
      ];

      const map = L.map(mapContainerRef.current, {
        center: [-17.3895, -66.1568],
        zoom: 12,
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

      const boundaryLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      boundaryLayerRef.current = boundaryLayer;
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      setTimeout(() => {
        map.invalidateSize();
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // 2. Delimitar límites territoriales y jurisdicción según el municipio seleccionado
  useEffect(() => {
    const map = mapInstanceRef.current;
    const boundaryLayer = boundaryLayerRef.current;
    if (!map || !boundaryLayer) return;

    boundaryLayer.clearLayers();

    const isGlobal = !selectedMunicipio || selectedMunicipio === 'Todos' || normalizeMunKey(selectedMunicipio) === 'TODOS';
    const limiteData = getMunicipioLimite(selectedMunicipio);

    // Crear polígono territorial no interactivo (evita recuadros de foco y permite clics directos al mapa)
    const polygon = L.polygon(limiteData.coordenadas, {
      color: isGlobal ? '#0284c7' : '#005596',
      weight: isGlobal ? 2 : 2.5,
      dashArray: isGlobal ? '6, 6' : '7, 7',
      fillColor: isGlobal ? '#38bdf8' : '#0073c6',
      fillOpacity: isGlobal ? 0.05 : 0.14,
      interactive: false // Desactiva captura de eventos para eliminar el recuadro negro al hacer clic
    });

    polygon.addTo(boundaryLayer);

    // Ajustar zoom y encuadre
    if (!selectedLab) {
      if (isGlobal) {
        map.fitBounds(polygon.getBounds().pad(0.04), { animate: true, duration: 0.8 });
      } else {
        map.fitBounds(polygon.getBounds().pad(0.08), { animate: true, duration: 0.8 });
      }
    }
  }, [selectedMunicipio]);

  // 3. Renderizar y actualizar marcadores según la lista de laboratorios y filtro de especialidad
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    markersMapRef.current.clear();

    laboratorios.forEach((lab) => {
      const lat = parseFloat(lab.latitud);
      const lng = parseFloat(lab.longitud);

      if (isNaN(lat) || isNaN(lng)) return;

      const isSelected = selectedLab && selectedLab.id === lab.id;
      const estadoHorario = checkEstaAbierto(lab.horario);
      const allSpecialties = getLabSpecialties(lab);

      const marker = L.marker([lat, lng], {
        icon: createMarkerIcon(lab, isSelected, selectedEspecialidad),
        zIndexOffset: isSelected ? 1000 : 0
      });

      const cueText = lab.codigo_cue && lab.codigo_cue !== 'Nuevo' ? lab.codigo_cue : lab.id;
      
      const badgesHtml = allSpecialties.map(esp => `
        <span style="display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 6px; background-color: ${esp.colorHex}15; color: ${esp.colorHex}; font-size: 10px; font-weight: 800; border: 1px solid ${esp.colorHex}30;">
          <span style="width: 5px; height: 5px; border-radius: 50%; background-color: ${esp.colorHex};"></span>
          <span>${esp.shortName}</span>
        </span>
      `).join('');

      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 220px; max-width: 280px; padding: 2px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #005596;">
              ${lab.municipio || 'Cochabamba'} • ${lab.nivel || 'Nivel 1'}
            </span>
            <span style="font-size: 9px; font-weight: 800; padding: 2px 7px; border-radius: 9999px; background-color: ${estadoHorario.abierto ? '#ecfdf5' : '#fef2f2'}; color: ${estadoHorario.abierto ? '#065f46' : '#991b1b'}; border: 1px solid ${estadoHorario.abierto ? '#a7f3d0' : '#fecaca'};">
              ● ${estadoHorario.texto}
            </span>
          </div>

          <h4 style="font-size: 14px; font-weight: 900; color: #0f172a; margin: 0 0 5px 0; line-height: 1.2;">
            ${lab.nombre_comercial}
          </h4>

          <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 6px;">
            ${badgesHtml}
          </div>

          <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0; line-height: 1.3;">
            ${lab.direccion || 'Cochabamba, Bolivia'}
          </p>

          <p style="font-size: 10px; color: #005596; font-weight: 600; margin: 0 0 8px 0;">
            🕒 ${lab.horario || 'Lun-Vie 07:00 - 19:00, Sáb 08:00 - 13:00'}
          </p>

          <a href="/laboratorio/${encodeURIComponent(cueText)}" style="display: inline-flex; align-items: center; justify-content: center; width: 100%; padding: 6px 12px; background-color: #005596; color: white; border-radius: 8px; font-size: 11px; font-weight: 700; text-decoration: none; box-shadow: 0 2px 6px rgba(0,85,150,0.3); text-align: center;">
            Ver Ficha Técnica Oficial →
          </a>
        </div>
      `;

      marker.bindPopup(popupHtml, { offset: [0, -35] });

      marker.on('click', () => {
        onSelectLab(lab);
      });

      marker.addTo(markersLayer);
      markersMapRef.current.set(lab.id, marker);
    });
  }, [laboratorios, selectedEspecialidad]);

  // 4. Enfocar el mapa si se selecciona un laboratorio específico desde la lista
  useEffect(() => {
    if (!selectedLab || !mapInstanceRef.current) return;

    const lat = parseFloat(selectedLab.latitud);
    const lng = parseFloat(selectedLab.longitud);

    if (!isNaN(lat) && !isNaN(lng)) {
      mapInstanceRef.current.setView([lat, lng], 16, { animate: true, duration: 0.8 });
      const marker = markersMapRef.current.get(selectedLab.id);
      if (marker) {
        marker.openPopup();
      }
    }
  }, [selectedLab]);

  const nombreZonaActiva = (selectedMunicipio && selectedMunicipio !== 'Todos') 
    ? `Jurisdicción: ${selectedMunicipio}` 
    : 'Departamento de Cochabamba';

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
      <div 
        ref={mapContainerRef} 
        style={{ height: height, width: '100%', zIndex: 10 }}
      />
      {/* Badge oficial PostGIS y Jurisdicción */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none flex flex-wrap gap-2">
        <div className="bg-white/95 backdrop-blur-md text-[11px] font-bold text-slate-800 px-3 py-1.5 rounded-xl shadow-md border border-slate-200 flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>📍 {nombreZonaActiva}</span>
        </div>
      </div>
    </div>
  );
}
