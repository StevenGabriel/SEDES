import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { Download, ChevronRight, FileCheck2, CheckCircle2 } from 'lucide-react';

export default function RequisitosPage() {
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

      {/* 3. Contenido Principal de Requisitos (Tarjetas 2.1 a 2.5) */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 w-full">
        {/* Sección 2.1: SOLICITUD DE HABILITACIÓN */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-start space-x-3 pb-3 border-b border-slate-100">
            <span className="bg-[#005596] text-white text-xs font-bold px-2.5 py-1 rounded-md mt-0.5">
              2.1
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase">
                SOLICITUD DE HABILITACIÓN
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Formulario oficial FORM. USD-DOSS/CONALAB-001 debidamente llenado.
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            {[
              'Señalar claramente el Tipo y Nivel de complejidad solicitados.',
              'Datos completos del profesional bioquímico responsable.',
              'Declaración del horario de atención propuesto para el establecimiento.',
              'Inventario detallado de mobiliario, equipos médicos y reactivos químicos.',
              'Inventario de manuales operativos y técnicos disponibles.'
            ].map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Sección 2.2: REQUISITOS LEGALES */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-start space-x-3 pb-3 border-b border-slate-100">
            <span className="bg-[#005596] text-white text-xs font-bold px-2.5 py-1 rounded-md mt-0.5">
              2.2
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase">
                REQUISITOS LEGALES
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Documentación acreditante y acreditación legal del personal técnico.
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            {[
              'Memorial dirigido al Director Departamental de Salud (SEDES).',
              'Título en Provisión Nacional del Bioquímico (fotocopia legalizada).',
              'Diploma Académico correspondiente.',
              'Matrícula Profesional emitida por el Ministerio de Salud.',
              'Carnet del Colegio Departamental de Bioquímica y Farmacia.',
              'Certificado de compatibilidad horaria otorgado por el SEDES.',
              'Cédula de Identidad vigente y fotografía tamaño carnet de fondo azul.',
              'Contrato del Director Técnico o Regente del Laboratorio.',
              'Contratos de los profesionales bioquímicos y especialistas adjuntos.',
              'Título de Especialidad médica (para laboratorios de alta complejidad).',
              'Contratos del personal técnico y auxiliares de laboratorio.'
            ].map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Sección 2.3: REQUISITOS ADMINISTRATIVOS */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-start space-x-3 pb-3 border-b border-slate-100">
            <span className="bg-[#005596] text-white text-xs font-bold px-2.5 py-1 rounded-md mt-0.5">
              2.3
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase">
                REQUISITOS ADMINISTRATIVOS
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Infraestructura, registros sanitarios y normativa de higiene.
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            {[
              'Número de Identificación Tributaria (NIT) del establecimiento.',
              'Plano detallado de distribución de instalaciones a escala.',
              'Certificado de instalación sanitaria adecuada (desagües químicos).',
              'Convenio vigente para la recolección y tratamiento de residuos infecciosos.',
              'Letrero exterior visible que identifique el nombre del laboratorio.',
              'Copia de la Resolución Administrativa de apertura en lugar visible.',
              'Nombres y títulos de los profesionales bioquímicos expuestos públicamente.',
              'Instalaciones que cumplan estrictamente con las normas vigentes de higiene.',
              'Distintivo de identificación obligatorio para todo el personal de turno.',
              'Señalamiento explícito y público de los horarios de atención al paciente.'
            ].map((item, idx) => (
              <li key={idx} className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Sección 2.4: REQUISITOS TÉCNICOS */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-start space-x-3 pb-3 border-b border-slate-100">
            <span className="bg-[#005596] text-white text-xs font-bold px-2.5 py-1 rounded-md mt-0.5">
              2.4
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase">
                REQUISITOS TÉCNICOS
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Cartera de servicios, control de calidad y manuales operativos obligatorios.
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700">
            <ul className="space-y-2.5">
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>Lista oficial de exámenes y pruebas bioquímicas habilitadas por nivel.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <span>Inventario certificado de mobiliario técnico, equipos de análisis, material de vidrio y reactivos.</span>
              </li>
            </ul>

            {/* Subsección de Manuales Obligatorios */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2 ml-6">
              <h3 className="font-bold text-xs uppercase tracking-wide text-slate-800 flex items-center space-x-1.5">
                <FileCheck2 className="w-4 h-4 text-[#005596]" />
                <span>Manuales Documentados Obligatorios:</span>
              </h3>
              <ul className="space-y-2 text-xs text-slate-600 pl-5 list-disc">
                <li>Manual de Procedimientos Técnicos por área de análisis.</li>
                <li>Manual de Organización y Funciones del personal administrativo y técnico.</li>
                <li>Manual de Control de Calidad interno y externo.</li>
                <li>Manual de Bioseguridad y gestión de riesgos sanitarios.</li>
                <li>Manual para la toma y transporte seguro de muestras biológicas.</li>
              </ul>
            </div>

            <ul className="space-y-2.5">
              {[
                'Convenio formal de derivación de muestras con laboratorios acreditados de mayor nivel.',
                'Libros de control foliados (registro de pacientes, reportes y entrega de resultados).',
                'Formulario oficial 303 de notificación obligatoria del Ministerio de Salud.',
                'Bibliografía científica de referencia técnica actualizada en físico o digital.'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Sección 2.5: REQUISITOS FINANCIEROS */}
        <section className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-start space-x-3 pb-3 border-b border-slate-100">
            <span className="bg-[#005596] text-white text-xs font-bold px-2.5 py-1 rounded-md mt-0.5">
              2.5
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase">
                REQUISITOS FINANCIEROS
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Tasas departamentales reguladas.
              </p>
            </div>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            <li className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <span>
                Cancelación de valores por derecho de inspección y Habilitación según tasas arancelarias del SEDES dependientes del nivel de complejidad (Baja, Mediana, Alta Complejidad I).
              </span>
            </li>
          </ul>
        </section>

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
