import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { Download, ChevronRight, FileCheck2, CheckCircle2, Clock, Sparkles } from 'lucide-react';

const FALLBACK_SECCIONES = [
  {
    id: 'sec-2.1',
    codigo: '2.1',
    titulo: 'SOLICITUD DE HABILITACIÓN',
    subtitulo: 'Formulario oficial FORM. USD-DOSS/CONALAB-001 debidamente llenado.',
    requisitos: [
      { id: 1, texto: 'Señalar claramente el Tipo y Nivel de complejidad solicitados.', es_obligatorio: true, esSubtitulo: false },
      { id: 2, texto: 'Datos completos del profesional bioquímico responsable.', es_obligatorio: true, esSubtitulo: false },
      { id: 3, texto: 'Declaración del horario de atención propuesto para el establecimiento.', es_obligatorio: true, esSubtitulo: false },
      { id: 4, texto: 'Inventario detallado de mobiliario, equipos médicos y reactivos químicos.', es_obligatorio: true, esSubtitulo: false },
      { id: 5, texto: 'Inventario de manuales operativos y técnicos disponibles.', es_obligatorio: true, esSubtitulo: false }
    ]
  },
  {
    id: 'sec-2.2',
    codigo: '2.2',
    titulo: 'REQUISITOS LEGALES',
    subtitulo: 'Documentación acreditante y acreditación legal del personal técnico.',
    requisitos: [
      { id: 6, texto: 'Memorial dirigido al Director Departamental de Salud (SEDES).', es_obligatorio: true, esSubtitulo: false },
      { id: 7, texto: 'Título en Provisión Nacional del Bioquímico (fotocopia legalizada).', es_obligatorio: true, esSubtitulo: false },
      { id: 8, texto: 'Diploma Académico correspondiente.', es_obligatorio: true, esSubtitulo: false },
      { id: 9, texto: 'Matrícula Profesional emitida por el Ministerio de Salud.', es_obligatorio: true, esSubtitulo: false },
      { id: 10, texto: 'Carnet del Colegio Departamental de Bioquímica y Farmacia.', es_obligatorio: true, esSubtitulo: false },
      { id: 11, texto: 'Certificado de compatibilidad horaria otorgado por el SEDES.', es_obligatorio: true, esSubtitulo: false },
      { id: 12, texto: 'Cédula de Identidad vigente y fotografía tamaño carnet de fondo azul.', es_obligatorio: true, esSubtitulo: false },
      { id: 13, texto: 'Contrato del Director Técnico o Regente del Laboratorio.', es_obligatorio: true, esSubtitulo: false },
      { id: 14, texto: 'Contratos de los profesionales bioquímicos y especialistas adjuntos.', es_obligatorio: true, esSubtitulo: false },
      { id: 15, texto: 'Título de Especialidad médica (para laboratorios de alta complejidad).', es_obligatorio: false, esSubtitulo: false },
      { id: 16, texto: 'Contratos del personal técnico y auxiliares de laboratorio.', es_obligatorio: true, esSubtitulo: false }
    ]
  },
  {
    id: 'sec-2.3',
    codigo: '2.3',
    titulo: 'REQUISITOS ADMINISTRATIVOS',
    subtitulo: 'Infraestructura, registros sanitarios y normativa de higiene.',
    requisitos: [
      { id: 17, texto: 'Número de Identificación Tributaria (NIT) del establecimiento.', es_obligatorio: true, esSubtitulo: false },
      { id: 18, texto: 'Plano detallado de distribución de instalaciones a escala.', es_obligatorio: true, esSubtitulo: false },
      { id: 19, texto: 'Certificado de instalación sanitaria adecuada (desagües químicos).', es_obligatorio: true, esSubtitulo: false },
      { id: 20, texto: 'Convenio vigente para la recolección y tratamiento de residuos infecciosos.', es_obligatorio: true, esSubtitulo: false },
      { id: 21, texto: 'Letrero exterior visible que identifique el nombre del laboratorio.', es_obligatorio: true, esSubtitulo: false },
      { id: 22, texto: 'Copia de la Resolución Administrativa de apertura en lugar visible.', es_obligatorio: true, esSubtitulo: false },
      { id: 23, texto: 'Nombres y títulos de los profesionales bioquímicos expuestos públicamente.', es_obligatorio: true, esSubtitulo: false },
      { id: 24, texto: 'Instalaciones que cumplan estrictamente con las normas vigentes de higiene.', es_obligatorio: true, esSubtitulo: false },
      { id: 25, texto: 'Distintivo de identificación obligatorio para todo el personal de turno.', es_obligatorio: true, esSubtitulo: false },
      { id: 26, texto: 'Señalamiento explícito y público de los horarios de atención al paciente.', es_obligatorio: true, esSubtitulo: false }
    ]
  },
  {
    id: 'sec-2.4',
    codigo: '2.4',
    titulo: 'REQUISITOS TÉCNICOS',
    subtitulo: 'Cartera de servicios, control de calidad y manuales operativos obligatorios.',
    requisitos: [
      { id: 27, texto: 'Lista oficial de exámenes y pruebas bioquímicas habilitadas por nivel.', es_obligatorio: true, esSubtitulo: false },
      { id: 28, texto: 'Inventario certificado de mobiliario técnico, equipos de análisis, material de vidrio y reactivos.', es_obligatorio: true, esSubtitulo: false },
      { id: 30, texto: 'Manual de Procedimientos Técnicos por área de análisis.', es_obligatorio: true, esSubtitulo: false },
      { id: 31, texto: 'Manual de Organización y Funciones del personal administrativo y técnico.', es_obligatorio: true, esSubtitulo: false },
      { id: 32, texto: 'Manual de Control de Calidad interno y externo.', es_obligatorio: true, esSubtitulo: false },
      { id: 33, texto: 'Manual de Bioseguridad y gestión de riesgos sanitarios.', es_obligatorio: true, esSubtitulo: false },
      { id: 34, texto: 'Manual para la toma y transporte seguro de muestras biológicas.', es_obligatorio: true, esSubtitulo: false },
      { id: 35, texto: 'Convenio formal de derivación de muestras con laboratorios acreditados de mayor nivel.', es_obligatorio: false, esSubtitulo: false },
      { id: 36, texto: 'Libros de control foliados (registro de pacientes, reportes y entrega de resultados).', es_obligatorio: true, esSubtitulo: false },
      { id: 37, texto: 'Formulario oficial 302 de notificación obligatoria del Ministerio de Salud.', es_obligatorio: true, esSubtitulo: false },
      { id: 38, texto: 'Bibliografía científica de referencia técnica actualizada en físico o digital.', es_obligatorio: true, esSubtitulo: false }
    ]
  },
  {
    id: 'sec-2.5',
    codigo: '2.5',
    titulo: 'REQUISITOS FINANCIEROS',
    subtitulo: 'Tasas departamentales reguladas.',
    requisitos: [
      { id: 39, texto: 'Cancelación de valores por derecho de Inspección y Habilitación según tasas arancelarias del SEDES dependientes del nivel de complejidad (Baja, Mediana, Alta Complejidad).', es_obligatorio: true, esSubtitulo: false }
    ]
  }
];

export default function RequisitosPage() {
  const [secciones, setSecciones] = useState(FALLBACK_SECCIONES);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarRequisitos = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/requisitos/publico');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSecciones(data);
          }
        }
      } catch (err) {
        console.warn('Usando catálogo oficial de requisitos en fallback:', err);
      } finally {
        setCargando(false);
      }
    };

    cargarRequisitos();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col font-sans antialiased text-slate-800">
      {/* 1. Navbar Compartido */}
      <Navbar />

      {/* 2. Banner de Encabezado Superior de la Vista */}
      <header className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-[#004e92] text-white py-10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <span className="text-[11px] font-bold tracking-widest text-cyan-300 uppercase">
            NORMATIVA NACIONAL Y DEPARTAMENTAL
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
            AUTORIZACIONES DE ACUERDO A LA CARACTERIZACIÓN DE LABORATORIOS
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-normal">
            Requisitos para Habilitación, Apertura y Funcionamiento de Laboratorios Clínicos
          </p>

          {/* Breadcrumbs Navigation */}
          <nav className="flex items-center space-x-2 text-xs text-cyan-200/80 pt-2">
            <Link to="/" className="hover:text-white transition">Inicio</Link>
            <ChevronRight className="w-3 h-3 text-cyan-400" />
            <span>Laboratorios</span>
            <ChevronRight className="w-3 h-3 text-cyan-400" />
            <span className="text-white font-semibold">Requisitos</span>
          </nav>
        </div>
      </header>

      {/* 3. Contenido Principal Dinámico de Requisitos */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
        {secciones.map((sec) => (
          <section 
            key={sec.id || sec.codigo}
            className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4 animate-fadeIn"
          >
            {/* Cabecera de la Sección */}
            <div className="flex items-start space-x-3 pb-3 border-b border-slate-100">
              <span className="bg-[#005596] text-white text-xs font-black px-2.5 py-1 rounded-md mt-0.5 select-none">
                {sec.codigo}
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase">
                  {sec.titulo}
                </h2>
                {sec.subtitulo && (
                  <p className="text-xs text-slate-500 font-medium">
                    {sec.subtitulo}
                  </p>
                )}
              </div>
            </div>

            {/* Listado de Requisitos */}
            <div className="space-y-3">
              {sec.requisitos.map((req, idx) => {
                if (req.esSubtitulo) {
                  return (
                    <div key={req.id || idx} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 my-2">
                      <h3 className="font-bold text-xs uppercase tracking-wide text-slate-800 flex items-center space-x-1.5">
                        <FileCheck2 className="w-4 h-4 text-[#005596]" />
                        <span>{req.texto}</span>
                      </h3>
                    </div>
                  );
                }

                return (
                  <div key={req.id || idx} className="flex items-start space-x-2.5 text-xs sm:text-sm text-slate-700">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${req.es_obligatorio === false ? 'text-amber-500' : 'text-cyan-600'}`} />
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="leading-relaxed">{req.texto}</span>
                      {req.es_obligatorio === false && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 select-none">
                          <Clock className="w-3 h-3" />
                          <span>Opcional</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Botón de Acción: Descargar Guía Completa PDF */}
        <div className="pt-2 pb-6 flex justify-start">
          <button 
            type="button"
            className="bg-[#005596] hover:bg-[#004073] text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl shadow-md flex items-center space-x-2.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Guía Completa PDF</span>
          </button>
        </div>
      </main>

      {/* 4. Footer Compartido */}
      <Footer />
    </div>
  );
}
