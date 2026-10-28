import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  MapPin, 
  Building2, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  Microscope,
  ArrowRight
} from 'lucide-react';
import heroBg from '../../assets/hero_bg.jpg';
import escudoCochabamba from '../../assets/Escudo_del_Cochabamba.svg.webp';
import escudoBolivia from '../../assets/Escudo_de_Bolivia.svg.webp';

export default function HeroBanner() {
  const scrollToMap = (e) => {
    e.preventDefault();
    const mapEl = document.getElementById('mapa-laboratorios');
    if (mapEl) {
      mapEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative w-full bg-slate-950 overflow-hidden text-white py-10 sm:py-14 lg:py-16">
      {/* 1. Fondo Institucional con Imagen y Gradiente */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out transform scale-100"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-[#072444]/90 to-[#021124]/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,180,216,0.15),transparent_60%)]" />
      </div>

      {/* Orbes decorativos sutiles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* 2. Contenedor Principal */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Columna Izquierda: Información Institucional y Acciones (7 cols en desktop) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Badges Institucionales */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-cyan-200 border border-cyan-400/30 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>GOBIERNO AUTÓNOMO DEPARTAMENTAL DE COCHABAMBA</span>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#0073c6]/40 text-white border border-[#0099e6]/40 backdrop-blur-md">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                <span>SEDES COCHABAMBA</span>
              </div>
            </div>

            {/* Título Principal */}
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md leading-[1.15]">
                Regulación y Vigilancia de <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-200 to-blue-300">Laboratorios Clínicos</span>
              </h1>
              <p className="text-sm sm:text-base font-semibold text-cyan-200/90 tracking-wide uppercase">
                Sistema Oficial de Acreditación, Licencias y Consulta Departamental (SI_Lab)
              </p>
            </div>

            {/* Texto Informativo del SEDES */}
            <p className="text-sm sm:text-base text-slate-200/90 leading-relaxed font-normal max-w-2xl">
              El Servicio Departamental de Salud (<strong className="text-white font-semibold">SEDES Cochabamba</strong>), a través del Área de Control y Regulación de Laboratorios, tiene la misión de normar, fiscalizar, evaluar y autorizar el funcionamiento técnico y legal de todos los establecimientos de diagnóstico clínico públicos, de la seguridad social y privados en las 5 regiones del departamento, garantizando a la ciudadanía análisis confiables, bioseguros y bajo estricta normativa sanitaria vigente.
            </p>

            {/* 3 Pilares Informativos Clave */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-2">
                  <Award className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Habilitación y Licencia
                </h3>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Autorización de apertura, traslado y rehabilitación para funcionamiento legal.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-2">
                  <Microscope className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Control y Calidad
                </h3>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Supervisión in-situ de bioseguridad, equipamiento y regencia profesional.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center mb-2">
                  <MapPin className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
                  Transparencia Pública
                </h3>
                <p className="text-[11px] text-slate-300 leading-tight">
                  Padrón georreferenciado para verificar establecimientos autorizados.
                </p>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button 
                type="button"
                onClick={scrollToMap}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm tracking-wide px-5 py-3 rounded-xl shadow-lg shadow-cyan-900/30 hover:shadow-cyan-900/50 flex items-center space-x-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                <MapPin className="w-4 h-4" />
                <span>VER MAPA DE LABORATORIOS</span>
              </button>

              <Link 
                to="/requisitos"
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm tracking-wide px-5 py-3 rounded-xl border border-white/25 backdrop-blur-md transition-all cursor-pointer flex items-center space-x-2"
              >
                <FileText className="w-4 h-4 text-cyan-300" />
                <span>CONSULTAR REQUISITOS</span>
              </Link>

              <Link 
                to="/login"
                className="bg-white/5 hover:bg-white/15 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm tracking-wide px-4 py-3 rounded-xl border border-white/15 backdrop-blur-md transition-all cursor-pointer flex items-center space-x-1.5"
              >
                <Building2 className="w-4 h-4 text-slate-300" />
                <span>Portal de Trámites</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>

          </div>

          {/* Columna Derecha: Tarjeta Institucional de Respaldo y Cobertura (5 cols en desktop) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-gradient-to-b from-white/15 via-white/10 to-white/5 border border-white/20 rounded-2xl p-6 sm:p-7 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              
              {/* Resplandor interno */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

              {/* Encabezado de la Tarjeta */}
              <div className="flex items-center space-x-4 border-b border-white/15 pb-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-white/20 via-white/10 to-white/5 border border-white/25 rounded-2xl p-2.5 shadow-xl backdrop-blur-md shrink-0 flex items-center justify-center">
                  <img 
                    src={escudoCochabamba} 
                    alt="Escudo Oficial de Cochabamba" 
                    className="w-full h-full object-contain drop-shadow-md" 
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-cyan-300 block">
                    Autoridad Sanitaria Departamental
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white leading-snug">
                    SEDES Cochabamba
                  </h2>
                  <p className="text-xs text-slate-300">
                    Unidad de Redes de Servicios y Calidad
                  </p>
                </div>
              </div>

              {/* Indicadores Institucionales */}
              <div className="grid grid-cols-2 gap-3 py-5 border-b border-white/15">
                <div className="bg-black/20 rounded-xl p-3 border border-white/10 text-center">
                  <span className="text-2xl sm:text-3xl font-black text-cyan-300 block leading-none">
                    47
                  </span>
                  <span className="text-[11px] font-medium text-slate-300 mt-1 block">
                    Municipios Regulados
                  </span>
                </div>
                <div className="bg-black/20 rounded-xl p-3 border border-white/10 text-center">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-300 block leading-none">
                    5
                  </span>
                  <span className="text-[11px] font-medium text-slate-300 mt-1 block">
                    Regiones Sanitarias
                  </span>
                </div>
              </div>

              {/* Garantías y Respaldo Institucional */}
              <div className="space-y-2.5 pt-4 text-xs text-slate-200">
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Laboratorios con Código Único de Establecimiento (CUE).</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Inspecciones técnicas de infraestructura y bioseguridad.</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Verificación de regencia profesional y bioética.</span>
                </div>
              </div>

              {/* Pie de la Tarjeta con Escudo del Estado Plurinacional */}
              <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
                <div className="flex items-center space-x-2">
                  <img 
                    src={escudoBolivia} 
                    alt="Escudo de Bolivia" 
                    className="w-5 h-5 object-contain" 
                  />
                  <span>Estado Plurinacional • SEDES</span>
                </div>
                <span className="font-semibold text-cyan-300">Normativa Vigente</span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
