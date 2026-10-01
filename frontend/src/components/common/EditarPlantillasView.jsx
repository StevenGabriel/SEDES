import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Undo2,
  RefreshCw,
  Eye,
  Save,
  Info,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Layers,
  FileCheck,
  Building2,
  Calendar,
  UserCheck,
  Award,
  ShieldCheck,
  FileSignature,
  FileSpreadsheet
} from 'lucide-react';

import logoChakana from '../../assets/Logo Chakana.svg';
import logoCochabamba2 from '../../assets/Logo cochabamba 2.png';
import logoCochabamba3 from '../../assets/logo cochabamba 3.png';
import { generarComunicacionInternaPDF } from '../coordinador/ComunicacionInternaPDF';

export const PLANTILLA_DEFAULT_CODELAB = {
  titulo_documento: 'COMUNICACIÓN INTERNA',
  destinatario_nombre: 'Dra. Mery D. Loroño V.',
  destinatario_cargo: 'ASESOR LEGAL (UNIDAD DE CALIDAD Y SERVICIOS)',
  via_nombre: 'Dra. Karina Soliz Villarroel',
  via_cargo: 'JEFE DE LA UNIDAD DE CALIDAD Y SERVICIOS a.i.',
  remitente_nombre: 'Dra. Claudia Morales Valenzuela',
  remitente_cargo: 'RESPONSABLE DEPARTAMENTAL CODELAB',
  parrafo1: `Mediante la presente y en cumplimiento a las funciones específicas de mi cargo dentro los alcances de los Art. 28 y Art. 38 de la Ley 1178, adjunto al presente informe para su conocimiento requisitos en general para la {TIPO_TRAMITE} del establecimiento "{ESTABLECIMIENTO}" ubicado en {DIRECCION}, {MUNICIPIO}, siendo propiedad de {PROPIETARIO} con C.I. Nro. {CI_PROPIETARIO}, y regentado actualmente por el/la profesional {REGENTE} con C.I. Nro. {CI_REGENTE}{RESPONSABLES_AREAS}. En el marco de la normativa actual vigente aprobada por R.M. 0202 de fecha 22 de marzo del 2010 donde están descritos los requisitos técnicos, administrativos, legales y técnicos, en la evaluación realizada se verificó los requisitos mínimos que deben cumplir los establecimientos de salud en cuanto a documentación, gestión de calidad, bioseguridad, competencia técnica, etc., pero principalmente se hace una trazabilidad de sus procesos y procedimientos técnicos para validar la calidad de los resultados que emiten. El proceso de habilitación es análogo al de acreditación (ISO 9001 y la 15189) y la norma señala que es de responsabilidad de los SEDES para garantizar la calidad de los resultados de diagnóstico laboratorial en beneficio de la población.`,
  parrafo2: `La Evaluación técnica IN SITU para la {TIPO_TRAMITE_MIN} fue realizada en fecha {FECHA_INSPECCION} por el evaluador de campo {SUPERVISOR}, bajo la supervisión y conducción de {REMITENTE} - {REMITENTE_CARGO} y personal técnico de esa repartición del Ministerio de Salud y Deportes de Bolivia.`,
  parrafo3: `Según Resolución Ministerial N° 847 de fecha 30 de noviembre donde indica que el ente regulador y coordinador de la Red Departamental de Laboratorios será la Coordinación Departamental de Laboratorios (CODELAB) dependientes de los Servicios Departamentales de Salud; de esta red dependerán los laboratorios de servicio público, de los seguros de salud a corto plazo y privados con y sin fines de lucro, así mismo en aplicación a la Resolución Ministerial N° 0936 de fecha 16 de diciembre del 2005 que en el Artículo Quinto designa en el nivel departamental como responsable de coordinar la Red Departamental de Laboratorios de Salud en el departamento de Cochabamba al Laboratorio de SEDES Cochabamba.`,
  parrafo_requisitos_tecnicos: `- EN APLICACIÓN DEL REGLAMENTO DE HABILITACIÓN DE LABORATORIOS Y ESTABLECIMIENTOS DE SALUD (La Habilitación y/o Renovación de habilitación es extendida a los establecimientos solicitantes que cumplen con estos requisitos mínimos), por lo que la Evaluación del establecimiento IN SITU FUE REALIZADA POR LOS EVALUADORES, LIDERIZADA Y CONDUCIDA POR CODELAB SEDES y donde el establecimiento cuenta con una gestión de calidad en cuanto a bioseguridad en el proceso de evaluación en la presente gestión. Se adjunta Lista de verificación de requisitos técnicos con el que fue evaluado y el acta de evaluación in situ para la habilitación del establecimiento.`,
  parrafo_financiero: `En los mismos se concluye autorizando la habilitación respectiva habiendo cumplido con el depósito de aranceles de Ley, toda vez que la principal función del SEDES no es recaudar fondos sino velar porque todos los Establecimientos de Salud estén debidamente normados y reglamentados velando la calidad y calidez de atención a la población usuaria.`,
  parrafo_conclusion: `Que siendo la habilitación según la R.M. N° 0202 de fecha 22/03/2010, en actual vigencia, la Sub Unidad de CODELAB, solicita la emisión de la resolución administrativa que realiza Asesoría Legal, de tal forma se determina, concluye y autoriza al establecimiento la {TIPO_TRAMITE} - "{ESTABLECIMIENTO}", en aplicación a la normativa ministerial vigente.`,
  parrafo5_pagina3: `TRANSMITIDAS POR VECTORES (ETVs) Y OTRAS ENFERMEDADES EMERGENTES Y REEMERGENTES, ubicado en {DIRECCION}, {MUNICIPIO}, siendo propiedad de {PROPIETARIO}, regentado actualmente por el/la profesional {REGENTE} con C.I. Nro. {CI_REGENTE}{RESPONSABLES_AREAS}, según normativa vigente establecida en el Código de Salud R.M. 0847/06 y R.M. 0202/10, habiéndose sometido a la evaluación documental y técnica INSITU, trazabilidad de sus procesos y procedimientos para la validación de localidad de sus resultados, realizada por los evaluadores conducida y liderada por CODELAB- SEDES, de acuerdo a las listas de verificación para la aplicación del reglamento de habilitación, por lo que corresponde la extensión de la R.A. en la que se declara PROCEDENTE LA {TIPO_TRAMITE} al {ESTABLECIMIENTO} ante el Ministerio de Salud y el Servicio Departamental de Salud.`,
  leyenda_adjunto: `Se adjunta toda la documentación que cursa en la Sub Unidad de CODELAB Para la revisión y firma correspondiente.`,
  iniciales_archivo: `I.F.R./J.P.I.S./K.S.V.`
};

export default function EditarPlantillasView({
  usuario = null,
  mostrarToast = () => {}
}) {
  const [plantillaDoc, setPlantillaDoc] = useState(PLANTILLA_DEFAULT_CODELAB);
  const [plantillaMetadata, setPlantillaMetadata] = useState({
    nombre: 'Comunicación Interna / Informe Técnico CODELAB',
    actualizado_por: 'Sistema (Predeterminado)',
    fecha_modificacion: null,
    es_personalizada: false
  });

  const [cargandoPlantilla, setCargandoPlantilla] = useState(false);
  const [guardandoPlantilla, setGuardandoPlantilla] = useState(false);
  const [generandoPdfPreview, setGenerandoPdfPreview] = useState(false);
  const [cambiosPendientes, setCambiosPendientes] = useState(false);
  const [modalRestablecerOpen, setModalRestablecerOpen] = useState(false);
  const [tagCopiada, setTagCopiada] = useState(null);

  // Modo de visualización: página individual ('1' | '2' | '3') o 'todas'
  const [paginaActiva, setPaginaActiva] = useState('1');

  // Cargar plantilla desde Backend
  const cargarPlantillaDesdeBD = async () => {
    setCargandoPlantilla(true);
    try {
      const res = await fetch('http://localhost:8000/api/plantillas-documentos/COMUNICACION_INTERNA_CODELAB');
      if (res.ok) {
        const data = await res.json();
        if (data?.contenido) {
          setPlantillaDoc({ ...PLANTILLA_DEFAULT_CODELAB, ...data.contenido });
          setPlantillaMetadata({
            nombre: data.nombre || 'Comunicación Interna / Informe Técnico CODELAB',
            actualizado_por: data.actualizado_por || 'Sistema',
            fecha_modificacion: data.fecha_modificacion,
            es_personalizada: !!data.es_personalizada
          });
          setCambiosPendientes(false);
          localStorage.setItem('sedes_plantilla_comunicacion', JSON.stringify(data.contenido));
        }
      }
    } catch (err) {
      console.warn('Error al cargar plantilla desde BD, usando respaldo local:', err);
    } finally {
      setCargandoPlantilla(false);
    }
  };

  useEffect(() => {
    cargarPlantillaDesdeBD();
  }, []);

  const updatePlantillaCampo = (campo, valor) => {
    setPlantillaDoc(prev => ({ ...prev, [campo]: valor }));
    setCambiosPendientes(true);
  };

  const handleGuardarPlantilla = async () => {
    setGuardandoPlantilla(true);
    try {
      const nombreAutor = usuario
        ? `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() || usuario.nombre || 'Administración SEDES'
        : 'Administración SEDES';

      const res = await fetch('http://localhost:8000/api/plantillas-documentos/COMUNICACION_INTERNA_CODELAB', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenido: plantillaDoc,
          actualizado_por: nombreAutor
        })
      });

      if (res.ok) {
        localStorage.setItem('sedes_plantilla_comunicacion', JSON.stringify(plantillaDoc));
        setCambiosPendientes(false);
        setPlantillaMetadata(prev => ({
          ...prev,
          actualizado_por: nombreAutor,
          fecha_modificacion: new Date().toISOString(),
          es_personalizada: true
        }));
        mostrarToast('Plantilla oficial guardada exitosamente en el sistema.', 'success');
      } else {
        mostrarToast('No se pudo guardar la plantilla en el servidor.', 'warning');
      }
    } catch (err) {
      console.error('Error al guardar plantilla:', err);
      mostrarToast('Error de conexión al guardar la plantilla.', 'warning');
    } finally {
      setGuardandoPlantilla(false);
    }
  };

  const handleRestablecerPlantilla = async () => {
    setCargandoPlantilla(true);
    try {
      const res = await fetch('http://localhost:8000/api/plantillas-documentos/COMUNICACION_INTERNA_CODELAB/restablecer', {
        method: 'POST'
      });
      if (res.ok) {
        setPlantillaDoc(PLANTILLA_DEFAULT_CODELAB);
        localStorage.setItem('sedes_plantilla_comunicacion', JSON.stringify(PLANTILLA_DEFAULT_CODELAB));
        setCambiosPendientes(false);
        setPlantillaMetadata(prev => ({
          ...prev,
          actualizado_por: 'Sistema (Restablecido)',
          fecha_modificacion: new Date().toISOString(),
          es_personalizada: false
        }));
        mostrarToast('Plantilla restablecida a la redacción oficial original.', 'info');
      }
    } catch (err) {
      setPlantillaDoc(PLANTILLA_DEFAULT_CODELAB);
      localStorage.setItem('sedes_plantilla_comunicacion', JSON.stringify(PLANTILLA_DEFAULT_CODELAB));
      mostrarToast('Plantilla restablecida localmente.', 'info');
    } finally {
      setCargandoPlantilla(false);
      setModalRestablecerOpen(false);
    }
  };

  const handleProbarVistaPreviaPDF = async () => {
    setGenerandoPdfPreview(true);
    try {
      const tramitePrueba = {
        id: 'demo-preview',
        codigo: 'TR-DEMO-2026',
        establecimiento: 'LABORATORIO CLÍNICO SAN GABRIEL',
        propietario: 'Dr. Roberto Salvatierra Flores',
        ci_nit: '3799203 CB',
        tipo: 'APERTURA Y HABILITACIÓN',
        direccion: 'Av. Libertador Bolívar Nº 1420, Zona Cala Cala',
        municipio: 'Cochabamba',
        supervisor_nombre: 'Dra. Fabiola Montesinos',
        fechaInspeccion: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        regente: 'DRA. NORMA VILLAVICENCIO SILES',
        ci_regente: '4589102 CB',
        responsables_areas: 'Inmunología: Dra. Patricia Claros (CI 5678901), Hematología: Dr. Andrés Gómez (CI 6789012)'
      };

      const doc = await generarComunicacionInternaPDF(tramitePrueba, {
        plantilla: plantillaDoc,
        cite: `CODELAB/SEDES/01/${new Date().getFullYear()}`,
        destinatario: plantillaDoc.destinatario_nombre,
        destinatarioCargo: plantillaDoc.destinatario_cargo,
        via: plantillaDoc.via_nombre,
        viaCargo: plantillaDoc.via_cargo,
        remitente: plantillaDoc.remitente_nombre,
        remitenteCargo: plantillaDoc.remitente_cargo,
        regente: 'DRA. NORMA VILLAVICENCIO SILES',
        ciRegente: '4589102 CB',
        responsables_areas: tramitePrueba.responsables_areas,
        observaciones: 'El establecimiento ha cumplido satisfactoriamente con todos los estándares técnicos y normativos exigidos por el SEDES.'
      });

      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      mostrarToast('Vista previa del PDF generada y abierta.', 'success');
    } catch (err) {
      console.error('Error generando vista previa:', err);
      mostrarToast('Error al generar la vista previa del PDF.', 'warning');
    } finally {
      setGenerandoPdfPreview(false);
    }
  };

  const copiarTag = (tag) => {
    navigator.clipboard.writeText(tag);
    setTagCopiada(tag);
    mostrarToast(`Etiqueta ${tag} copiada al portapapeles.`, 'info');
    setTimeout(() => setTagCopiada(null), 2500);
  };

  const tagsDisponibles = [
    { tag: '{ESTABLECIMIENTO}', desc: 'Nombre del laboratorio' },
    { tag: '{PROPIETARIO}', desc: 'Nombre del titular / propietario' },
    { tag: '{CI_PROPIETARIO}', desc: 'C.I. del propietario' },
    { tag: '{REGENTE}', desc: 'Bioquímico / Director Técnico' },
    { tag: '{CI_REGENTE}', desc: 'C.I. del Regente' },
    { tag: '{RESPONSABLES_AREAS}', desc: 'Responsables de Áreas (Inmunología, etc.)' },
    { tag: '{DIRECCION}', desc: 'Dirección registrada' },
    { tag: '{MUNICIPIO}', desc: 'Municipio (Cochabamba, etc.)' },
    { tag: '{SUPERVISOR}', desc: 'Evaluador de campo asignado' },
    { tag: '{FECHA_INSPECCION}', desc: 'Fecha de inspección in situ' },
    { tag: '{TIPO_TRAMITE}', desc: 'Tipo (APERTURA / RENOVACIÓN)' },
    { tag: '{TIPO_TRAMITE_MIN}', desc: 'Tipo en minúsculas' },
    { tag: '{DESTINATARIO}', desc: 'Nombre Asesor Legal (A:)' },
    { tag: '{DESTINATARIO_CARGO}', desc: 'Cargo Asesor Legal' },
    { tag: '{VIA}', desc: 'Nombre Jefatura UCS (VIA:)' },
    { tag: '{VIA_CARGO}', desc: 'Cargo Jefatura UCS' },
    { tag: '{REMITENTE}', desc: 'Nombre Responsable CODELAB (DE:)' },
    { tag: '{REMITENTE_CARGO}', desc: 'Cargo Responsable CODELAB' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* ===================================================================== */}
      {/* 1. ENCABEZADO SUPERIOR Y ACCIONES PRINCIPALES                        */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-slate-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-blue-50 text-[#0060a8] border border-blue-100 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Configuración Normativa Oficial</span>
            </span>
            {cambiosPendientes ? (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center space-x-1 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Cambios pendientes sin guardar</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Plantilla sincronizada y activa</span>
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Editor de Documento por Páginas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Personalice y estructure el documento oficial de Comunicación Interna (3 Páginas) que CODELAB remite a Asesoría Legal.
          </p>
        </div>

        {/* Botonera Superior */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <button
            type="button"
            onClick={() => setModalRestablecerOpen(true)}
            disabled={cargandoPlantilla || guardandoPlantilla}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs hover:border-slate-300 disabled:opacity-50 cursor-pointer"
            title="Restablecer redacción de fábrica"
          >
            <Undo2 className="w-4 h-4 text-slate-500" />
            <span>Restablecer</span>
          </button>

          <button
            type="button"
            onClick={handleProbarVistaPreviaPDF}
            disabled={generandoPdfPreview || cargandoPlantilla}
            className="px-4 py-2.5 rounded-xl border border-[#0060a8]/30 bg-blue-50/70 hover:bg-blue-100/70 text-[#0060a8] text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Generar y abrir PDF de prueba con los textos actuales"
          >
            {generandoPdfPreview ? (
              <RefreshCw className="w-4 h-4 animate-spin text-[#0060a8]" />
            ) : (
              <Eye className="w-4 h-4 text-[#0060a8]" />
            )}
            <span>{generandoPdfPreview ? 'Generando...' : 'Vista Previa PDF'}</span>
          </button>

          <button
            type="button"
            onClick={handleGuardarPlantilla}
            disabled={guardandoPlantilla || cargandoPlantilla}
            className="px-5 py-2.5 rounded-xl bg-[#0060a8] hover:bg-[#004e8a] text-white text-xs font-extrabold transition shadow-md hover:shadow-lg flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {guardandoPlantilla ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{guardandoPlantilla ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. SELECTOR DE DOCUMENTO Y ESTADO DE TRAZABILIDAD                     */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-slate-100 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
            <FileText className="w-4 h-4 text-[#0060a8]" />
            <span>Documento Oficial Configurado</span>
          </label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-2xl px-4 py-3 flex items-center justify-between">
              <span className="truncate">Comunicación Interna / Informe Técnico CODELAB</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full shrink-0 ml-2">
                3 Páginas
              </span>
            </div>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-3.5 py-2.5 rounded-xl whitespace-nowrap self-start sm:self-auto">
              Cód: CODELAB-IT-01
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Estructurado en 3 páginas completas: <strong>Página 1</strong> (Marco legal, inspección y normativas), <strong>Página 2</strong> (Titulares, requisitos y conclusiones), y <strong>Página 3</strong> (Declaratoria de procedencia, anexos y firmas).
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-[#1b2533] text-white rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-300">
              Trazabilidad y Versión
            </span>
            <h4 className="text-base font-bold text-white mt-1">
              {plantillaMetadata.es_personalizada ? 'Plantilla Personalizada' : 'Plantilla Base de Fábrica'}
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              Última modificación:{' '}
              <span className="text-white font-semibold">
                {plantillaMetadata.fecha_modificacion 
                  ? new Date(plantillaMetadata.fecha_modificacion).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })
                  : 'Original del Sistema'}
              </span>
            </p>
            <p className="text-xs text-slate-300">
              Autor: <span className="text-cyan-200 font-semibold">{plantillaMetadata.actualizado_por || 'Administración SEDES'}</span>
            </p>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>SEDES Cochabamba</span>
            <span className="text-cyan-300 font-mono text-[11px]">v2026.2</span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 3. VARIABLES DINÁMICAS (CHIPS COPIABLES)                              */}
      {/* ===================================================================== */}
      <div className="bg-blue-50/70 border border-blue-100 rounded-3xl p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#0060a8]">
            <Info className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-sm text-slate-900">
              Variables Dinámicas (Haga clic en una etiqueta para insertarla en el texto)
            </h3>
          </div>
          <span className="text-[11px] text-[#0060a8] font-bold hidden sm:inline-block">
            Se reemplazan automáticamente con los datos de cada laboratorio
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {tagsDisponibles.map((item) => (
            <button
              key={item.tag}
              type="button"
              onClick={() => copiarTag(item.tag)}
              className={`
                group px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-2xs border
                ${tagCopiada === item.tag 
                  ? 'bg-emerald-600 text-white border-emerald-600 scale-95' 
                  : 'bg-white hover:bg-blue-50 text-slate-800 border-blue-200/80 hover:border-[#0060a8]'
                }
              `}
              title={`${item.desc} (Clic para copiar)`}
            >
              {tagCopiada === item.tag ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400 group-hover:text-[#0060a8]" />
              )}
              <span>{item.tag}</span>
              <span className="text-[10px] text-slate-400 font-sans hidden md:inline ml-1 font-normal">
                ({item.desc})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 4. BARRA DE NAVEGACIÓN DE PÁGINAS (PÁGINA 1 | PÁGINA 2 | PÁGINA 3)    */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl p-2.5 shadow-xs border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setPaginaActiva('1')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 cursor-pointer ${
              paginaActiva === '1'
                ? 'bg-[#0060a8] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-mono">1</span>
            <span>Página 1: Marco Legal y Antecedentes</span>
          </button>

          <button
            type="button"
            onClick={() => setPaginaActiva('2')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 cursor-pointer ${
              paginaActiva === '2'
                ? 'bg-[#0060a8] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-mono">2</span>
            <span>Página 2: Requisitos y Conclusiones</span>
          </button>

          <button
            type="button"
            onClick={() => setPaginaActiva('3')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-2 cursor-pointer ${
              paginaActiva === '3'
                ? 'bg-[#0060a8] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-mono">3</span>
            <span>Página 3: Procedencia y Firmas</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPaginaActiva(paginaActiva === 'todas' ? '1' : 'todas')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border cursor-pointer ${
            paginaActiva === 'todas'
              ? 'bg-slate-900 text-white border-slate-900'
              : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{paginaActiva === 'todas' ? 'Modo Pestañas' : 'Ver las 3 Páginas'}</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* 5. CONTENIDO EDITABLE POR PÁGINA COMPLETA                             */}
      {/* ===================================================================== */}
      <div className="space-y-8">

        {/* ------------------------------------------------------------------- */}
        {/* HOJA 1: PÁGINA 1 COMPLETA                                          */}
        {/* ------------------------------------------------------------------- */}
        {(paginaActiva === '1' || paginaActiva === 'todas') && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border-2 border-slate-200/90 relative overflow-hidden space-y-6">
            
            {/* Cabecera visual simulada de Página 1 */}
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-5">
              <div className="flex items-center space-x-4">
                <img src={logoChakana} alt="Chakana" className="h-10 w-auto opacity-80" />
                <img src={logoCochabamba2} alt="Cochabamba" className="h-10 w-auto opacity-80" />
                <img src={logoCochabamba3} alt="Lema" className="h-10 w-auto opacity-80" />
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-lg bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-wider">
                  Hoja 1 de 3
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">CITE: CODELAB/SEDES/1/{new Date().getFullYear()}</p>
              </div>
            </div>

            <div className="text-center py-2">
              <h3 className="text-base font-black text-slate-900 tracking-wider uppercase border-b border-slate-200 pb-2 inline-block px-6">
                COMUNICACIÓN INTERNA
              </h3>
            </div>

            {/* Membrete Oficial Editable A / VIA / DE */}
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-5 rounded-2xl border border-blue-100/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-[#0060a8]" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Autoridades y Destinatarios Oficiales (Membrete A / VIA / DE)
                  </h4>
                </div>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-100/80 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                  Editables para renovación anual o cambio de gestión
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Destinatario (A:) */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      A: (Destinatario)
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Asesoría Legal</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre y Título</label>
                      <input
                        type="text"
                        value={plantillaDoc.destinatario_nombre || ''}
                        onChange={(e) => updatePlantillaCampo('destinatario_nombre', e.target.value)}
                        placeholder="Ej: Dra. Mery D. Loroño V."
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Cargo Institucional</label>
                      <input
                        type="text"
                        value={plantillaDoc.destinatario_cargo || ''}
                        onChange={(e) => updatePlantillaCampo('destinatario_cargo', e.target.value)}
                        placeholder="Ej: ASESOR LEGAL (UNIDAD DE CALIDAD Y SERVICIOS)"
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Vía (VIA:) */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-cyan-900 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-100">
                      VIA: (Conducto Regular)
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Jefatura UCS</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre y Título</label>
                      <input
                        type="text"
                        value={plantillaDoc.via_nombre || ''}
                        onChange={(e) => updatePlantillaCampo('via_nombre', e.target.value)}
                        placeholder="Ej: Dra. Karina Soliz Villarroel"
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Cargo Institucional</label>
                      <input
                        type="text"
                        value={plantillaDoc.via_cargo || ''}
                        onChange={(e) => updatePlantillaCampo('via_cargo', e.target.value)}
                        placeholder="Ej: JEFE DE LA UNIDAD DE CALIDAD Y SERVICIOS a.i."
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Remitente (DE:) */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      DE: (Remitente)
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">CODELAB</span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre y Título</label>
                      <input
                        type="text"
                        value={plantillaDoc.remitente_nombre || ''}
                        onChange={(e) => updatePlantillaCampo('remitente_nombre', e.target.value)}
                        placeholder="Ej: Dra. Claudia Morales Valenzuela"
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase">Cargo Institucional</label>
                      <input
                        type="text"
                        value={plantillaDoc.remitente_cargo || ''}
                        onChange={(e) => updatePlantillaCampo('remitente_cargo', e.target.value)}
                        placeholder="Ej: RESPONSABLE DEPARTAMENTAL CODELAB"
                        className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vista previa compacta de la cabecera formateada */}
              <div className="bg-white/90 p-3.5 rounded-xl border border-slate-200/80 text-xs space-y-1.5 font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 w-16 shrink-0">A:</span>
                  <span className="text-slate-800 font-semibold truncate">
                    {plantillaDoc.destinatario_nombre || 'Dra. Mery D. Loroño V.'} <span className="font-normal text-slate-500">— {plantillaDoc.destinatario_cargo || 'ASESOR LEGAL (UNIDAD DE CALIDAD Y SERVICIOS)'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 w-16 shrink-0">VIA:</span>
                  <span className="text-slate-800 font-semibold truncate">
                    {plantillaDoc.via_nombre || 'Dra. Karina Soliz Villarroel'} <span className="font-normal text-slate-500">— {plantillaDoc.via_cargo || 'JEFE DE LA UNIDAD DE CALIDAD Y SERVICIOS a.i.'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 w-16 shrink-0">DE:</span>
                  <span className="text-slate-800 font-semibold truncate">
                    {plantillaDoc.remitente_nombre || 'Dra. Claudia Morales Valenzuela'} <span className="font-normal text-slate-500">— {plantillaDoc.remitente_cargo || 'RESPONSABLE DEPARTAMENTAL CODELAB'}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 w-16 shrink-0">MOTIVO:</span>
                  <span className="text-slate-600 font-mono text-[11px] truncate">
                    {'{TIPO_TRAMITE}'} "{'{ESTABLECIMIENTO}'}"
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs font-bold text-slate-800 pt-1">
              De nuestra consideración:
            </div>

            {/* Párrafo 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#0060a8] flex items-center space-x-1.5">
                  <span>Párrafo 1: Marco Legal Ley 1178, R.M. 0202 y Trazabilidad Técnica</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {(plantillaDoc.parrafo1 || '').length} caracteres
                </span>
              </div>
              <textarea
                rows={6}
                value={plantillaDoc.parrafo1 || ''}
                onChange={(e) => updatePlantillaCampo('parrafo1', e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                placeholder="Escriba el contenido del primer párrafo..."
              />
            </div>

            {/* Párrafo 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#0060a8] flex items-center space-x-1.5">
                  <span>Párrafo 2: Evaluación Técnica In Situ y Supervisión</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {(plantillaDoc.parrafo2 || '').length} caracteres
                </span>
              </div>
              <textarea
                rows={3}
                value={plantillaDoc.parrafo2 || ''}
                onChange={(e) => updatePlantillaCampo('parrafo2', e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                placeholder="Escriba el párrafo sobre la inspección técnica..."
              />
            </div>

            {/* Párrafo 3 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#0060a8] flex items-center space-x-1.5">
                  <span>Párrafo 3: Normativa Ministerial de Laboratorios (R.M. 847 / R.M. 0936)</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {(plantillaDoc.parrafo3 || '').length} caracteres
                </span>
              </div>
              <textarea
                rows={4}
                value={plantillaDoc.parrafo3 || ''}
                onChange={(e) => updatePlantillaCampo('parrafo3', e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                placeholder="Escriba el párrafo sobre las resoluciones ministeriales..."
              />
            </div>

            {/* Pie de página simulado */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>SERVICIO DEPARTAMENTAL DE SALUD - SEDES COCHABAMBA</span>
              <span>Página 1</span>
            </div>

            {/* Botón Navegación Página 2 */}
            {paginaActiva === '1' && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setPaginaActiva('2')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center space-x-2 cursor-pointer shadow-xs"
                >
                  <span>Continuar a Página 2</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* HOJA 2: PÁGINA 2 COMPLETA                                          */}
        {/* ------------------------------------------------------------------- */}
        {(paginaActiva === '2' || paginaActiva === 'todas') && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border-2 border-slate-200/90 relative overflow-hidden space-y-6">
            
            {/* Cabecera visual simulada de Página 2 */}
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-5">
              <div className="flex items-center space-x-4">
                <img src={logoChakana} alt="Chakana" className="h-10 w-auto opacity-80" />
                <img src={logoCochabamba2} alt="Cochabamba" className="h-10 w-auto opacity-80" />
                <img src={logoCochabamba3} alt="Lema" className="h-10 w-auto opacity-80" />
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-lg bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-wider">
                  Hoja 2 de 3
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Requisitos & Conclusiones</p>
              </div>
            </div>

            {/* Identificación de Titulares (Bloque superior Página 2) */}
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 text-xs space-y-1 font-medium text-slate-700">
              <p><strong>REPRESENTANTE LEGAL:</strong> {'{PROPIETARIO}'}</p>
              <p><strong>REGENTE:</strong> {'{REGENTE}'} con C.I. Nro. {'{CI_REGENTE}'}</p>
              <p><strong>UBICACIÓN ACTUAL:</strong> {'{DIRECCION}'}, {'{MUNICIPIO}'}</p>
            </div>

            {/* Lista fija de requisitos legales y administrativos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">1. REQUISITOS LEGALES (Fijos)</span>
                <p className="text-[11px] text-slate-500">• Carta dirigida a Dirección SEDES</p>
                <p className="text-[11px] text-slate-500">• CI y Matrícula Profesional legalizadas</p>
                <p className="text-[11px] text-slate-500">• Registro en Colegio Profesional y Poder</p>
              </div>
              <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 block">2. REQUISITOS ADMINISTRATIVOS (Fijos)</span>
                <p className="text-[11px] text-slate-500">• Certificado de Registro SEDES / COSBES</p>
                <p className="text-[11px] text-slate-500">• Contrato de recojo de residuos (EMSA)</p>
                <p className="text-[11px] text-slate-500">• Licencia Municipal y Plano Aprobado</p>
              </div>
            </div>

            {/* Sección 3: Requisitos Técnicos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#0060a8] flex items-center space-x-1.5">
                  <span>3. REQUISITOS TÉCNICOS Y GESTIÓN DE BIOSEGURIDAD</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {(plantillaDoc.parrafo_requisitos_tecnicos || '').length} caracteres
                </span>
              </div>
              <textarea
                rows={4}
                value={plantillaDoc.parrafo_requisitos_tecnicos || ''}
                onChange={(e) => updatePlantillaCampo('parrafo_requisitos_tecnicos', e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                placeholder="Texto de requisitos técnicos..."
              />
            </div>

            {/* Sección 4: Requisitos Financieros */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#0060a8] flex items-center space-x-1.5">
                  <span>4. REQUISITOS FINANCIEROS Y CUMPLIMIENTO ARANCELARIO</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {(plantillaDoc.parrafo_financiero || '').length} caracteres
                </span>
              </div>
              <textarea
                rows={3}
                value={plantillaDoc.parrafo_financiero || ''}
                onChange={(e) => updatePlantillaCampo('parrafo_financiero', e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                placeholder="Texto de requisitos financieros..."
              />
            </div>

            {/* Conclusiones */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#0060a8] flex items-center space-x-1.5">
                  <span>CONCLUSIONES Y SOLICITUD DE RESOLUCIÓN ADMINISTRATIVA</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {(plantillaDoc.parrafo_conclusion || '').length} caracteres
                </span>
              </div>
              <textarea
                rows={3}
                value={plantillaDoc.parrafo_conclusion || ''}
                onChange={(e) => updatePlantillaCampo('parrafo_conclusion', e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                placeholder="Texto de conclusiones..."
              />
            </div>

            {/* Pie de página simulado */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>SERVICIO DEPARTAMENTAL DE SALUD - SEDES COCHABAMBA</span>
              <span>Página 2</span>
            </div>

            {/* Botones Navegación */}
            {paginaActiva === '2' && (
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setPaginaActiva('1')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Volver a Página 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaginaActiva('3')}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center space-x-2 cursor-pointer shadow-xs"
                >
                  <span>Continuar a Página 3</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* HOJA 3: PÁGINA 3 COMPLETA                                          */}
        {/* ------------------------------------------------------------------- */}
        {(paginaActiva === '3' || paginaActiva === 'todas') && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-md border-2 border-slate-200/90 relative overflow-hidden space-y-6">
            
            {/* Cabecera visual simulada de Página 3 */}
            <div className="flex items-center justify-between border-b-2 border-slate-100 pb-5">
              <div className="flex items-center space-x-4">
                <img src={logoChakana} alt="Chakana" className="h-10 w-auto opacity-80" />
                <img src={logoCochabamba2} alt="Cochabamba" className="h-10 w-auto opacity-80" />
                <img src={logoCochabamba3} alt="Lema" className="h-10 w-auto opacity-80" />
              </div>
              <div className="text-right">
                <span className="px-3 py-1 rounded-lg bg-sky-100 text-sky-800 text-xs font-black uppercase tracking-wider">
                  Hoja 3 de 3
                </span>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Procedencia & Firmas</p>
              </div>
            </div>

            {/* Párrafo 5: Declaratoria de Procedencia */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#0060a8] flex items-center space-x-1.5">
                  <span>Párrafo Superior: Declaratoria Formal de Procedencia</span>
                </label>
                <span className="text-[11px] font-mono text-slate-400">
                  {(plantillaDoc.parrafo5_pagina3 || '').length} caracteres
                </span>
              </div>
              <textarea
                rows={5}
                value={plantillaDoc.parrafo5_pagina3 || ''}
                onChange={(e) => updatePlantillaCampo('parrafo5_pagina3', e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                placeholder="Texto superior de declaratoria de procedencia..."
              />
            </div>

            {/* Leyenda y Iniciales de Archivo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Leyenda de Documentación Adjunta
                </label>
                <input
                  type="text"
                  value={plantillaDoc.leyenda_adjunto || ''}
                  onChange={(e) => updatePlantillaCampo('leyenda_adjunto', e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                  placeholder="Se adjunta toda la documentación..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Iniciales de Archivo (CC/Arch)
                </label>
                <input
                  type="text"
                  value={plantillaDoc.iniciales_archivo || ''}
                  onChange={(e) => updatePlantillaCampo('iniciales_archivo', e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 font-mono font-bold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0060a8]/20 focus:border-[#0060a8] transition"
                  placeholder="I.F.R./J.P.I.S./K.S.V."
                />
              </div>
            </div>

            {/* Sección de Firmas Institucionales */}
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 space-y-4">
              <span className="text-xs font-bold text-slate-800 block">Espacio Reservado para Firmas Oficiales:</span>
              <div className="grid grid-cols-2 gap-8 pt-6 pb-2 text-center text-xs text-slate-400">
                <div className="border-t border-slate-300 pt-2 font-mono">
                  1. Firma Evaluador / Responsable CODELAB
                </div>
                <div className="border-t border-slate-300 pt-2 font-mono">
                  2. VoBo Jefatura Unidad de Calidad y Servicios
                </div>
              </div>
            </div>

            {/* Pie de página simulado */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>SERVICIO DEPARTAMENTAL DE SALUD - SEDES COCHABAMBA</span>
              <span>Página 3 (Final)</span>
            </div>

            {/* Botón Navegación Página 2 */}
            {paginaActiva === '3' && (
              <div className="flex justify-start pt-2">
                <button
                  type="button"
                  onClick={() => setPaginaActiva('2')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Volver a Página 2</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ===================================================================== */}
      {/* 6. BARRA FLOTANTE DE GUARDADO RÁPIDO                                  */}
      {/* ===================================================================== */}
      <div className="sticky bottom-6 z-20 bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-xl border border-slate-200 flex items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-2xl bg-[#0060a8]/10 flex items-center justify-center text-[#0060a8]">
            <FileCheck className="w-5 h-5" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-900">
              {cambiosPendientes ? 'Hay cambios sin guardar' : 'Todos los cambios están guardados'}
            </p>
            <p className="text-[11px] text-slate-500">
              Los cambios aplicarán a todos los nuevos informes técnicos generados por Coordinación.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={handleProbarVistaPreviaPDF}
            disabled={generandoPdfPreview}
            className="px-4 py-2.5 rounded-xl border border-[#0060a8]/30 bg-blue-50/70 hover:bg-blue-100/70 text-[#0060a8] text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Vista Previa PDF</span>
          </button>

          <button
            type="button"
            onClick={handleGuardarPlantilla}
            disabled={guardandoPlantilla}
            className="px-6 py-2.5 rounded-xl bg-[#0060a8] hover:bg-[#004e8a] text-white text-xs font-extrabold transition shadow-md hover:shadow-lg flex items-center space-x-2 cursor-pointer"
          >
            {guardandoPlantilla ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{guardandoPlantilla ? 'Guardando...' : 'Guardar Documento'}</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 7. MODAL DE RESTABLECER PLANTILLA                                     */}
      {/* ===================================================================== */}
      {modalRestablecerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  ¿Restablecer plantilla original?
                </h3>
                <p className="text-xs text-slate-500">
                  Esta acción restaurará la redacción oficial original de las 3 páginas.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 leading-relaxed">
              Todos los párrafos, fundamentos legales y leyendas volverán al texto predeterminado por el sistema SEDES Cochabamba.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setModalRestablecerOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRestablecerPlantilla}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <Undo2 className="w-4 h-4" />
                <span>Restablecer Ahora</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
