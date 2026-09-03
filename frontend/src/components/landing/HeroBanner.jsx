import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, ChevronLeft, ChevronRight, FileText, Sparkles, Building2 } from 'lucide-react';
import heroBg from '../../assets/hero_bg.jpg';

export default function HeroBanner() {
  const [laboratorios, setLaboratorios] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Cargar laboratorios registrados desde el Backend
  useEffect(() => {
    const fetchLaboratorios = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/establecimientos');
        if (response.ok) {
          const data = await response.json();
          // Filtrar laboratorios habilitados y con datos completos
          if (data && data.length > 0) {
            setLaboratorios(data);
          }
        }
      } catch (err) {
        console.error('Error al cargar laboratorios para el carrusel:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLaboratorios();
  }, []);

  // 2. Autoplay: Cambio automático de diapositiva cada 6 segundos
  useEffect(() => {
    if (isPaused || laboratorios.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % laboratorios.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused, laboratorios.length]);

  // Controles de navegación manual
  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? laboratorios.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % laboratorios.length);
  };

  // Laboratorio por defecto si aún está cargando o no hay datos
  const labDefault = {
    id: '3L0267',
    codigo_cue: '3L0267',
    nombre_comercial: 'Laboratorio Central BioTest',
    municipio: 'CERCADO',
    nivel: 'Nivel 2',
    descripcion: 'Especialistas en microbiología y análisis clínicos de alta complejidad. Resultados en línea en 24 horas.',
    imagen_url: null
  };

  const labActual = laboratorios.length > 0 ? laboratorios[currentIndex] : labDefault;
  const totalSlides = laboratorios.length > 0 ? laboratorios.length : 1;

  // URL del detalle público del laboratorio actual
  const detalleUrl = `/laboratorio/${encodeURIComponent(labActual.codigo_cue && labActual.codigo_cue !== 'Nuevo' ? labActual.codigo_cue : labActual.id)}`;

  return (
    <section 
      className="relative w-full h-[460px] sm:h-[500px] bg-slate-900 overflow-hidden text-white group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Fondo Dinámico con Imagen y Gradiente Institucional */}
      <div 
        key={labActual.id || currentIndex}
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out transform scale-105 animate-fadeIn"
        style={{ 
          backgroundImage: `url(${labActual.imagen_url || heroBg})` 
        }}
      >
        {/* Gradiente oscuro de contraste para legibilidad perfecta */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-900/40" />
      </div>

      {/* 2. Contenido Central */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-between py-10 sm:py-12 z-10">
        
        {/* Información del Laboratorio Destacado */}
        <div className="max-w-2xl mt-4 sm:mt-6 space-y-4">
          
          {/* Badges Oficiales */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0073c6]/30 text-cyan-200 border border-cyan-400/30 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Establecimiento Acreditado SEDES</span>
            </span>

            {labActual.municipio && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-white/90 backdrop-blur-md border border-white/20">
                {labActual.municipio} • {labActual.nivel || 'Nivel 1'}
              </span>
            )}

            {labActual.codigo_cue && labActual.codigo_cue !== 'Nuevo' && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-cyan-300 backdrop-blur-md border border-white/20 font-mono">
                CUE: {labActual.codigo_cue}
              </span>
            )}
          </div>

          {/* Nombre Comercial */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-md leading-tight">
            {labActual.nombre_comercial}
          </h1>

          {/* Descripción / Servicios */}
          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal max-w-xl line-clamp-3">
            {labActual.descripcion || 'Establecimiento de salud acreditado para la toma de muestras, diagnóstico clínico y análisis microbiológicos bajo normativa sanitaria vigente del Departamento de Cochabamba.'}
          </p>

          {/* Botones de Acción */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link 
              to={detalleUrl}
              className="bg-white hover:bg-slate-100 text-[#005596] font-bold text-xs sm:text-sm tracking-wide px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl flex items-center space-x-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
            >
              <Eye className="w-4 h-4 text-[#005596]" />
              <span>VER DETALLES</span>
            </Link>

            <Link 
              to="/requisitos"
              className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm tracking-wide px-5 py-2.5 rounded-xl border border-white/30 backdrop-blur-md transition-all cursor-pointer flex items-center space-x-2"
            >
              <FileText className="w-4 h-4 text-white/90" />
              <span>REQUISITOS DE LABORATORIOS</span>
            </Link>
          </div>

        </div>

        {/* 3. Controles del Carrusel (Flechas e Indicadores) */}
        <div className="flex items-center justify-between sm:justify-end sm:space-x-6 pb-2 pt-4 border-t border-white/10 sm:border-t-0">
          
          {/* Contador de diapositiva (ej: 1 / 10) */}
          <span className="text-xs font-semibold text-white/70 tracking-wider">
            {currentIndex + 1} / {totalSlides}
          </span>

          <div className="flex items-center space-x-4">
            {/* Flechas de Navegación */}
            <div className="flex items-center space-x-2">
              <button 
                type="button"
                onClick={handlePrev}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/35 active:bg-white/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm"
                aria-label="Laboratorio anterior"
                title="Laboratorio anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button 
                type="button"
                onClick={handleNext}
                className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/35 active:bg-white/40 backdrop-blur-md border border-white/30 flex items-center justify-center text-white transition-all cursor-pointer shadow-sm"
                aria-label="Siguiente laboratorio"
                title="Siguiente laboratorio"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Puntos Indicadores (Dots) */}
            <div className="hidden sm:flex items-center space-x-1.5 pl-2">
              {laboratorios.slice(0, 10).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    idx === currentIndex 
                      ? 'w-6 h-2 bg-cyan-300 shadow-md' 
                      : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Ir al laboratorio ${idx + 1}`}
                />
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
