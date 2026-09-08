import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import { Download, ChevronRight, FileCheck2, CheckCircle2, Clock, Sparkles } from 'lucide-react';

const FALLBACK_SECCIONES = [
  {
    "id": "sec-2.1",
    "codigo": "2.1",
    "titulo": "SOLICITUD DE HABILITACIÓN",
    "subtitulo": "Formulario oficial FORM. USD-DOSS/CONALAB-001 debidamente llenado.",
    "requisitos": [
      {
        "id": "req-2.1-1",
        "texto": "El tipo y el nivel de complejidad del laboratorio.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.1-2",
        "texto": "Datos del profesional responsable.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.1-3",
        "texto": "Horario de atención del establecimiento",
        "es_obligatorio": true
      },
      {
        "id": "req-2.1-4",
        "texto": "Inventario de mobiliario, equipos y reactivos.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.1-5",
        "texto": "Inventario de manuales y bibliografía referencial.",
        "es_obligatorio": true
      }
    ]
  },
  {
    "id": "sec-2.2",
    "codigo": "2.2",
    "titulo": "REQUISITOS LEGALES",
    "subtitulo": "Documentación habilitante y acreditación legal del personal técnico.",
    "requisitos": [
      {
        "id": "req-2.2-1",
        "texto": "Solicitud mediante memorial dirigida al director departamental de salud para habilitación, apertura y funcionamiento de laboratorio.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.2-2",
        "texto": "Copia legalizada del título en provisión nacional de bioquímico o bioquímico farmacéutico.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.2-3",
        "texto": "Copia legalizada del diploma académico de bioquímico o bioquímico - farmacéutico.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.2-4",
        "texto": "Fotocopia legalizada de matrícula profesional.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.2-5",
        "texto": "Fotocopia legalizada del carnet de colegio de bioquímica y farmacia.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.2-6",
        "texto": "Certificado de compatibilidad horaria otorgado por el SEDES.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.2-7",
        "texto": "Fotocopia de célula de identidad.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.2-8",
        "texto": "Fotografía tamaño carnet.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.2-9",
        "texto": "Contrato de trabajo del director técnico (regente bioquímico responsable) del laboratorio visado por la dirección departamental de trabajo (si corresponde)",
        "es_obligatorio": true
      },
      {
        "id": "req-2.2-10",
        "texto": "Contrato de trabajo de los profesionales bioquímicos, bioquímico farmacéuticos de las áreas diferentes de apoyo.",
        "es_obligatorio": false
      },
      {
        "id": "req-2.2-11",
        "texto": "Contrato de trabajo de bioquímicos especialistas si corresponde.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.2-12",
        "texto": "Fotocopia legalizada de título de especialidad si corresponde.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.2-13",
        "texto": "Contrato de trabajo de técnicos de laboratorio si corresponde.",
        "es_obligatorio": true
      }
    ]
  },
  {
    "id": "sec-2.3",
    "codigo": "2.3",
    "titulo": "REQUISITOS ADMINISTRATIVOS",
    "subtitulo": "Infraestructura, registros sanitarios y normativa de higiene.",
    "requisitos": [
      {
        "id": "req-2.3-1",
        "texto": "Número de Identificación Tributaria (NIT).",
        "es_obligatorio": true
      },
      {
        "id": "req-2.3-2",
        "texto": "Plano de las instalaciones del establecimiento de acuerdo a lo establecido en el reglamento.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.3-3",
        "texto": "Instalación higiénico sanitaria y teléfono (en zonas centrales y urbano-periféricas con cobertura).",
        "es_obligatorio": true
      },
      {
        "id": "req-2.3-4",
        "texto": "Convenio con el municipio para recojo de residuos infecciosos.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.3-5",
        "texto": "Verificación en lugar visible de la Resolución y FORM. MSD-DGSS/CONALAB-001 de habilitación coincidente con la dirección.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.3-6",
        "texto": "Verificación de nómina visible con nombres de los profesionales bioquímicos responsables.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.3-7",
        "texto": "Verificación de fotocopia visible del título en Provisión Nacional de los responsables.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.3-8",
        "texto": "Instalaciones acondicionadas bajo normas de higiene y salud acordes al nivel de complejidad.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.3-9",
        "texto": "Uso obligatorio de distintivo con nombre, foto y matrícula profesional del personal bioquímico.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.3-10",
        "texto": "Horario de atención al público claramente señalizado en el establecimiento.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.3-11",
        "texto": "Verificación de fotocopia visible del título en Provisión Nacional de los responsables.",
        "es_obligatorio": true
      }
    ]
  },
  {
    "id": "sec-2.4",
    "codigo": "2.4",
    "titulo": "REQUISITOS TÉCNICOS",
    "subtitulo": "Cartera de servicios, control de calidad y manuales operativos obligatorios.",
    "requisitos": [
      {
        "id": "req-2.4-1",
        "texto": "Lista de exámenes habilitados y autorizados para su nivel de complejidad.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-2",
        "texto": "Inventario de mobiliario.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-3",
        "texto": "Inventario de equipos.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-4",
        "texto": "Inventario de material de vidrio y otros materiales.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-5",
        "texto": "Inventario de reactivos y diagnosticadores.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-6",
        "texto": "Manual de procedimientos.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-7",
        "texto": "Manual de organización y funciones.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-8",
        "texto": "Manual de calidad.",
        "es_obligatorio": false
      },
      {
        "id": "req-2.4-9",
        "texto": "Manual de bioseguridad.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-10",
        "texto": "Manual de toma y transporte de muestras.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-11",
        "texto": "Convenio escrito con laboratorio de mayor complejidad para derivación de muestras.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-12",
        "texto": "Libro de registro de pacientes.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-13",
        "texto": "Libro de reportes de resultados.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-14",
        "texto": "Libro de entrega de resultados.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-15",
        "texto": "Formulario 303 de Producción y Vigilancia Epidemiológica.",
        "es_obligatorio": true
      },
      {
        "id": "req-2.4-16",
        "texto": "Bibliografía de referencia obligatoria según su capacidad resolutiva.",
        "es_obligatorio": true
      }
    ]
  },
  {
    "id": "sec-2.5",
    "codigo": "2.5",
    "titulo": "REQUISITOS FINANCIEROS",
    "subtitulo": "Tasas departamentales reguladas.",
    "requisitos": [
      {
        "id": "req-2.5-1",
        "texto": "Cancelación de valores por derecho de Habilitación, Apertura y Funcionamiento según tasas del nivel de complejidad.",
        "es_obligatorio": true
      }
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
