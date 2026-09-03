import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Zap, 
  ArrowLeft, 
  Navigation, 
  CheckCircle2, 
  TestTube2, 
  Microscope, 
  Droplet, 
  Activity, 
  FileText, 
  Building2, 
  UserCheck, 
  ExternalLink,
  Stethoscope,
  Dna,
  Scale
} from 'lucide-react';

import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import heroBg from '../assets/hero_bg.jpg';
import RealMapView from '../components/common/RealMapView';

// Catálogo completo de las 8 Especialidades Oficiales del SEDES
const CATALOGO_ESPECIALIDADES = {
  'Clínico General': {
    titulo: 'Clínico General',
    desc: 'Exámenes de rutina básicos y preventivos para diagnóstico general de salud.',
    icon: TestTube2,
    color: 'bg-teal-50 text-teal-700 border-teal-100'
  },
  'Clínico Microbiológico': {
    titulo: 'Clínico Microbiológico',
    desc: 'Cultivos de bacterias, hongos y virus para detección y antibiogramas de infecciones.',
    icon: Microscope,
    color: 'bg-indigo-50 text-indigo-700 border-indigo-100'
  },
  'Anatomía Patológica y Citología': {
    titulo: 'Anatomía Patológica y Citología',
    desc: 'Estudio histopatológico de biopsias, citología exfoliativa y Papanicolaou.',
    icon: Stethoscope,
    color: 'bg-purple-50 text-purple-700 border-purple-100'
  },
  'Hematología': {
    titulo: 'Hematología',
    desc: 'Estudio completo de la morfología, coagulación y componentes celulares de la sangre.',
    icon: Droplet,
    color: 'bg-rose-50 text-rose-700 border-rose-100'
  },
  'Inmunología': {
    titulo: 'Inmunología',
    desc: 'Evaluación del sistema inmunológico, pruebas serológicas, alergias y anticuerpos.',
    icon: Activity,
    color: 'bg-sky-50 text-sky-700 border-sky-100'
  },
  'Endocrinología': {
    titulo: 'Endocrinología',
    desc: 'Pruebas hormonales, tiroideas, química sanguínea avanzada y perfiles metabólicos.',
    icon: Zap,
    color: 'bg-lime-50 text-lime-700 border-lime-100'
  },
  'Genética': {
    titulo: 'Genética',
    desc: 'Pruebas de biología molecular, secuenciación de ADN y marcadores genéticos.',
    icon: Dna,
    color: 'bg-slate-50 text-slate-700 border-slate-200'
  },
  'Toxicología': {
    titulo: 'Toxicología',
    desc: 'Detección de fármacos, sustancias tóxicas, metales pesados y drogas de abuso.',
    icon: Scale,
    color: 'bg-amber-50 text-amber-700 border-amber-100'
  }
};

const normalizarEspecialidad = (str) => {
  const s = (str || '').toLowerCase().trim();
  if (s.includes('clínic') && !s.includes('microbio')) return 'Clínico General';
  if (s.includes('microbio')) return 'Clínico Microbiológico';
  if (s.includes('patol') || s.includes('citol')) return 'Anatomía Patológica y Citología';
  if (s.includes('hemat')) return 'Hematología';
  if (s.includes('inmuno')) return 'Inmunología';
  if (s.includes('endo') || s.includes('bioquim') || s.includes('bioquím')) return 'Endocrinología';
  if (s.includes('genét') || s.includes('genet')) return 'Genética';
  if (s.includes('toxi')) return 'Toxicología';
  return str.trim();
};

export default function DetalleLaboratorioPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [laboratorio, setLaboratorio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetalle = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Consultar API del backend
        const searchParam = id || '3L0267';
        const response = await fetch(`http://localhost:8000/api/establecimientos/${encodeURIComponent(searchParam)}`);
        
        if (!response.ok) {
          throw new Error('No se encontró la información del laboratorio.');
        }

        const data = await response.json();
        setLaboratorio(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error al cargar los datos.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetalle();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-12 h-12 border-4 border-[#0073c6] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-semibold text-sm">Cargando información oficial del laboratorio...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !laboratorio) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800">Laboratorio No Encontrado</h2>
          <p className="text-sm text-slate-500">No pudimos obtener los datos solicitados. Puede volver a la página principal o explorar otros laboratorios.</p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-[#005596] hover:bg-[#003e6d] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a la Lista de Laboratorios</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const gpsUrl = `https://www.google.com/maps/dir/?api=1&destination=${laboratorio.latitud},${laboratorio.longitud}`;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans text-slate-800 antialiased">
      {/* 1. Header Oficial SEDES */}
      <Navbar />

      {/* 2. Breadcrumbs / Navegación */}
      <div className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center space-x-2 text-slate-500 truncate">
            <button 
              onClick={() => navigate(-1)} 
              className="inline-flex items-center font-semibold text-slate-700 hover:text-[#005596] transition cursor-pointer pr-2 border-r border-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Volver
            </button>
            <Link to="/" className="hover:text-slate-900 transition">Inicio</Link>
            <span>/</span>
            <span className="text-slate-400">Laboratorios</span>
            <span>/</span>
            <span className="font-bold text-slate-800 truncate">{laboratorio.nombre_comercial}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Verificado SEDES
            </span>
          </div>
        </div>
      </div>

      {/* 3. Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full flex-1">
        
        {/* ===================================================================== */}
        {/* HERO CARD: Título, Código CUE, Badges e Imagen                         */}
        {/* ===================================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_10px_30px_rgba(0,35,70,0.04)] border border-slate-200/80">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Información Principal */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Badges de Estado y Código Único CUE */}
              <div className="flex flex-wrap items-center gap-2.5">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  laboratorio.estado_operativo === 'Habilitado' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                }`}>
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${
                    laboratorio.estado_operativo === 'Habilitado' ? 'bg-emerald-600' : 'bg-amber-600'
                  }`} />
                  {laboratorio.estado_operativo}
                </span>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  Código Único CUE: <span className="text-[#005596] ml-1 font-extrabold">{laboratorio.codigo_cue}</span>
                </span>
              </div>

              {/* Nombre Comercial */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                {laboratorio.nombre_comercial}
              </h1>

              {/* Subtítulo Institucional */}
              <p className="text-base sm:text-lg font-semibold text-[#005596]">
                {laboratorio.tipo} • {laboratorio.nivel} — SEDES {laboratorio.municipio}
              </p>

              {/* Descripción */}
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
                {laboratorio.descripcion || 'Establecimiento de salud acreditado para la toma de muestras, diagnóstico clínico y análisis microbiológicos bajo normativa sanitaria vigente del Departamento de Cochabamba.'}
              </p>

              {/* Sellos de Calidad */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="inline-flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-[#0073c6]" />
                  <span>Acreditado por SEDES</span>
                </div>

                <div className="inline-flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>Resultados Rápidos</span>
                </div>
              </div>

            </div>

            {/* Imagen del Establecimiento */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 group aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
                <img 
                  src={laboratorio.imagen_url || heroBg} 
                  alt={laboratorio.nombre_comercial} 
                  onError={(e) => { e.currentTarget.src = heroBg; }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4">
                  <span className="text-xs font-semibold text-white/95 backdrop-blur-xs px-3 py-1 rounded-lg bg-black/40">
                    Instalaciones autorizadas • Cochabamba
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ===================================================================== */}
        {/* 4 CARDS DE DATOS RÁPIDOS: Dirección, Horario, Teléfono, Email         */}
        {/* ===================================================================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card: Dirección */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#0073c6] shrink-0 mt-0.5">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">DIRECCIÓN</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 leading-snug">
                {laboratorio.direccion}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{laboratorio.municipio}, Bolivia</p>
            </div>
          </div>

          {/* Card: Horario */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">HORARIO DE ATENCIÓN</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 leading-snug">
                {laboratorio.horario}
              </p>
            </div>
          </div>

          {/* Card: Teléfono */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 shrink-0 mt-0.5">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TELÉFONO / CONTACTO</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 leading-snug">
                {laboratorio.telefono}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Línea de información</p>
            </div>
          </div>

          {/* Card: Email */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-start space-x-3.5">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 shrink-0 mt-0.5">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">CORREO ELECTRÓNICO</p>
              <p className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 leading-snug break-all">
                {laboratorio.email_contacto}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Consultas y resultados</p>
            </div>
          </div>

        </div>

        {/* ===================================================================== */}
        {/* SECCIÓN: SERVICIOS Y ESPECIALIDADES AUTORIZADOS (DINÁMICO)            */}
        {/* ===================================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_10px_30px_rgba(0,35,70,0.04)] border border-slate-200/80 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Servicios y Especialidades Autorizados
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-normal">
              Todas las áreas listadas a continuación cuentan con certificación oficial vigente de SEDES Cochabamba.
            </p>
          </div>

          {(() => {
            // Extraer y normalizar los servicios del laboratorio
            let rawList = [];
            if (Array.isArray(laboratorio.servicios)) {
              rawList = laboratorio.servicios;
            } else if (typeof laboratorio.servicios === 'string' && laboratorio.servicios.trim()) {
              rawList = laboratorio.servicios.split(',').map(s => s.trim());
            }

            const normalizados = [...new Set(rawList.map(normalizarEspecialidad))];
            const tarjetas = normalizados
              .map(nombre => CATALOGO_ESPECIALIDADES[nombre])
              .filter(Boolean);

            if (tarjetas.length === 0) {
              tarjetas.push(CATALOGO_ESPECIALIDADES['Clínico General']);
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {tarjetas.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div 
                      key={idx}
                      className="bg-slate-50/70 hover:bg-white border border-slate-200/70 hover:border-slate-300 rounded-2xl p-5 transition-all duration-200 shadow-2xs hover:shadow-md flex items-start space-x-4"
                    >
                      <div className={`p-3 rounded-xl border ${item.color} shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {item.titulo}
                        </h3>
                        <p className="text-xs text-slate-500 leading-relaxed font-normal">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* ===================================================================== */}
        {/* SECCIÓN: UBICACIÓN GEORREFERENCIADA (PostGIS + Leaflet OpenStreetMap) */}
        {/* ===================================================================== */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-[0_10px_30px_rgba(0,35,70,0.04)] border border-slate-200/80 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ubicación Georreferenciada
            </h2>
            <p className="text-sm text-slate-500 mt-1 font-normal">
              Encuentre la ruta más directa hacia el laboratorio. Espacio con accesibilidad y estacionamiento disponible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Mapa Real Georreferenciado (Leaflet + OpenStreetMap) */}
            <div className="lg:col-span-8 min-h-[380px] h-[380px] rounded-2xl overflow-hidden shadow-xs border border-slate-200">
              <RealMapView
                latitud={laboratorio.latitud}
                longitud={laboratorio.longitud}
                nombre={laboratorio.nombre_comercial}
                direccion={`${laboratorio.direccion}, ${laboratorio.municipio}`}
                height="100%"
              />
            </div>

            {/* Sidebar: Referencias de Acceso */}
            <div className="lg:col-span-4 bg-slate-50/80 rounded-2xl p-6 border border-slate-200 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#005596]" />
                  Referencias y Registro Oficial
                </h3>

                <ul className="space-y-3 text-xs text-slate-600 font-medium">
                  <li className="flex items-start gap-2">
                    <UserCheck className="w-4 h-4 text-[#0073c6] shrink-0 mt-0.5" />
                    <span><strong>Responsable Técnico:</strong> {laboratorio.responsable_laboratorio || 'Registrado en SEDES'}</span>
                  </li>

                  {laboratorio.responsables_areas && (
                    <li className="flex items-start gap-2">
                      <TestTube2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                      <span><strong>Especialidad:</strong> {laboratorio.responsables_areas}</span>
                    </li>
                  )}

                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Propietario Legal:</strong> {laboratorio.propietario_nombre}</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span><strong>Líneas de acceso:</strong> Transporte público y avenidas principales de {laboratorio.municipio}.</span>
                  </li>

                  <li className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Ingreso accesible para sillas de ruedas y camillas.</span>
                  </li>
                </ul>
              </div>

              {/* Botón GPS */}
              <a
                href={gpsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#19324d] hover:bg-[#122438] active:bg-[#0c1827] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 text-center"
              >
                <Navigation className="w-4 h-4" />
                <span>Obtener Indicaciones GPS</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-75" />
              </a>
            </div>

          </div>
        </div>

      </main>

      {/* 4. Footer Oficial */}
      <Footer />
    </div>
  );
}
