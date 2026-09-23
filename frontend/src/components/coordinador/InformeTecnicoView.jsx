import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  UserCheck,
  Send,
  Printer,
  Download,
  Award,
  ChevronDown,
  Check,
  Clock,
  ShieldCheck,
  Settings,
  Sparkles,
  ExternalLink,
  Eye,
  RefreshCw,
  X,
  Inbox,
  Lock
} from 'lucide-react';
import { generarComunicacionInternaPDF } from './ComunicacionInternaPDF';

export default function InformeTecnicoView({
  tramites = [],
  tramiteSeleccionadoId,
  onSeleccionarTramite,
  onRecargarDatos,
  nombreCoordinador = 'Dra. Claudia Morales Valenzuela',
  mostrarToast = () => {},
  onAprobarFinal = () => {}
}) {
  const navigate = useNavigate();

  // Filtrar ÚNICAMENTE los trámites reales de la Base de Datos que han sido pasados a Informe Técnico o etapas legales
  const tramitesEnInforme = useMemo(() => {
    return tramites.filter(t => {
      const est = (t.estado || '').toLowerCase();
      const esEstadoValido = (
        est.includes('informe') ||
        est.includes('legal') ||
        est.includes('derivado') ||
        est.includes('resolución') ||
        est.includes('resolucion') ||
        est.includes('firma') ||
        est.includes('aprobado') ||
        t.resolucion_lista_para_firma ||
        est === 'en informe técnico'
      );
      const esSeleccionado = tramiteSeleccionadoId && (t.id === tramiteSeleccionadoId || t.tramite_uuid === tramiteSeleccionadoId);
      return esEstadoValido || esSeleccionado;
    });
  }, [tramites, tramiteSeleccionadoId]);

  // Mapear los trámites reales de la Base de Datos al formato estructurado
  const listaEstablecimientos = useMemo(() => {
    return tramitesEnInforme.map(t => {
      const docs = t.documentos || [];
      const docsAprobadosNombres = docs
        .filter(d => (d.estado || '').toLowerCase() === 'aprobado')
        .map(d => d.nombre);

      const veredicto = t.veredicto_supervisor_raw || t.veredictoSupervisor || 'Favorable (Cumple con estándares vigentes de bioseguridad)';
      const obsSupervisor = (t.observacionesSupervisor && t.observacionesSupervisor.length > 0)
        ? t.observacionesSupervisor.join(' ')
        : 'Infraestructura adecuada, manejo de residuos patógenos correcto y señalización de seguridad implementada.';

      return {
        id: t.id,
        tramite_uuid: t.tramite_uuid || t.id,
        codigo: t.id,
        establecimiento: t.establecimiento || 'Laboratorio Clínico',
        tipo: t.tipo || 'Apertura',
        fecha: t.fecha || 'Reciente',
        estado: t.estado || 'En Informe Técnico',
        resolucion_lista_para_firma: t.resolucion_lista_para_firma,
        resolucion_numero: t.resolucion_numero,
        resolucion_estado: t.resolucion_estado,
        propietario: t.propietario || 'Propietario no registrado',
        ci_nit: t.propietario_ci || t.ci_nit || '3799203 CB.',
        direccion: t.direccion || 'Cochabamba, Bolivia',
        tipoDetallado: t.categoria || t.tipo || 'Laboratorio de Diagnóstico Clínico',
        fechaInspeccion: t.fechaInspeccion && t.fechaInspeccion !== 'Pendiente' ? t.fechaInspeccion : 'Inspección realizada',
        supervisorAsignado: (t.supervisorAsignado && t.supervisorAsignado !== 'Sin Asignar') ? t.supervisorAsignado : 'Supervisor de Área SEDES',
        resultadoGeneral: veredicto.includes('FAVORABLE') || veredicto.includes('favorable') || veredicto.includes('Aprobado')
          ? 'Favorable (Cumple con estándares vigentes de bioseguridad)'
          : veredicto,
        observacionesCampo: obsSupervisor,
        regente: t.regente || t.director_tecnico || 'DRA. NORMA VILLAVICENCIO SILES',
        documentosAprobados: docsAprobadosNombres.length > 0 ? docsAprobadosNombres : [
          'Licencia Municipal (Vigente)',
          'Certificado Sanitario Previo',
          'Plano Arquitectónico Aprobado',
          'Registro Vigente SENASAG'
        ]
      };
    });
  }, [tramitesEnInforme]);

  // Trámite seleccionado actualmente
  const [tramiteActivoId, setTramiteActivoId] = useState(
    tramiteSeleccionadoId || (listaEstablecimientos.length > 0 ? listaEstablecimientos[0].id : null)
  );

  useEffect(() => {
    if (tramiteSeleccionadoId && tramiteSeleccionadoId !== tramiteActivoId) {
      setTramiteActivoId(tramiteSeleccionadoId);
    } else if (listaEstablecimientos.length > 0 && !tramiteActivoId) {
      setTramiteActivoId(listaEstablecimientos[0].id);
    }
  }, [tramiteSeleccionadoId, listaEstablecimientos.length]);

  const tramiteActivo = useMemo(() => {
    return listaEstablecimientos.find(t => t.id === tramiteActivoId || t.tramite_uuid === tramiteActivoId) || (listaEstablecimientos.length > 0 ? listaEstablecimientos[0] : null);
  }, [listaEstablecimientos, tramiteActivoId]);

  // Estado del formulario de Informe Técnico
  const [observacionesCoordinador, setObservacionesCoordinador] = useState(
    'Habiéndose verificado tanto el cumplimiento estricto de la carpeta legal como la conformidad en el informe de campo emitido por el supervisor de área, se concluye que el establecimiento cuenta con las garantías técnicas requeridas para su normal funcionamiento.'
  );
  const [dictamenFinal, setDictamenFinal] = useState('Favorabilidad Concedida (Favorable)');
  
  // Parámetros de CITE y Membrete Oficial (Comunicación Interna)
  const [citeNumero, setCiteNumero] = useState(`CODELAB/SEDES/71/${new Date().getFullYear()}`);
  const [destinatarioLegal, setDestinatarioLegal] = useState('Dra. Mery D. Loroño V.');
  const [destinatarioCargo, setDestinatarioCargo] = useState('ASESOR LEGAL - UNIDAD DE CALIDAD Y SERVICIOS');
  const [viaJefe, setViaJefe] = useState('Dra. Karina Soliz Villarroel');
  const [viaCargo, setViaCargo] = useState('JEFE DE LA UNIDAD DE CALIDAD Y SERVICIOS a.i.');
  const [mostrarConfigMemo, setMostrarConfigMemo] = useState(false);

  // Estados de carga y acciones
  const [generandoPdf, setGenerandoPdf] = useState(false);
  const [enviandoLegal, setEnviandoLegal] = useState(false);

  // Estados del Visualizador de PDF interactivo
  const [vistaModo, setVistaModo] = useState('visor'); // 'visor' (por defecto) | 'formulario'
  const [pdfBlobUrl, setPdfBlobUrl] = useState(null);
  const [generandoVistaPrevia, setGenerandoVistaPrevia] = useState(false);
  const urlAnteriorRef = useRef(null);

  // Actualizar en tiempo real la vista previa del PDF oficial de 3 páginas
  const actualizarVistaPreviaPDF = useCallback(async () => {
    if (!tramiteActivo) return;
    setGenerandoVistaPrevia(true);
    try {
      const doc = await generarComunicacionInternaPDF(tramiteActivo, {
        cite: citeNumero,
        destinatario: destinatarioLegal,
        destinatarioCargo: destinatarioCargo,
        via: viaJefe,
        viaCargo: viaCargo,
        remitente: nombreCoordinador,
        remitenteCargo: 'RESPONSABLE DEPARTAMENTAL DE LABORATORIOS CODELAB - SEDES',
        regente: tramiteActivo.regente,
        observaciones: observacionesCoordinador
      });
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      if (urlAnteriorRef.current) {
        URL.revokeObjectURL(urlAnteriorRef.current);
      }
      urlAnteriorRef.current = url;
      setPdfBlobUrl(url);
    } catch (err) {
      console.warn('Error al generar vista previa del PDF:', err);
    } finally {
      setGenerandoVistaPrevia(false);
    }
  }, [
    tramiteActivo?.id,
    tramiteActivo?.establecimiento,
    tramiteActivo?.regente,
    citeNumero,
    destinatarioLegal,
    destinatarioCargo,
    viaJefe,
    viaCargo,
    nombreCoordinador,
    observacionesCoordinador
  ]);

  // Generar la vista previa al cambiar de trámite o parámetros clave
  useEffect(() => {
    actualizarVistaPreviaPDF();
    return () => {
      if (urlAnteriorRef.current) {
        URL.revokeObjectURL(urlAnteriorRef.current);
      }
    };
  }, [
    tramiteActivo?.id,
    citeNumero,
    destinatarioLegal,
    destinatarioCargo,
    viaJefe,
    viaCargo,
    observacionesCoordinador
  ]);

  // Manejar cambio de trámite seleccionado
  const handleSeleccionar = (item) => {
    setTramiteActivoId(item.id);
    if (onSeleccionarTramite) {
      onSeleccionarTramite(item.id);
    }
  };

  // Generar e Imprimir / Descargar el PDF oficial de 3 páginas
  const handleImprimirInforme = async () => {
    if (!tramiteActivo) return;
    setGenerandoPdf(true);
    try {
      const doc = await generarComunicacionInternaPDF(tramiteActivo, {
        cite: citeNumero,
        destinatario: destinatarioLegal,
        destinatarioCargo: destinatarioCargo,
        via: viaJefe,
        viaCargo: viaCargo,
        remitente: nombreCoordinador,
        remitenteCargo: 'RESPONSABLE DEPARTAMENTAL DE LABORATORIOS CODELAB - SEDES',
        regente: tramiteActivo.regente,
        observaciones: observacionesCoordinador
      });

      // Abrir en ventana de impresión nativa y descargar
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      doc.save(`Informe_Tecnico_${tramiteActivo.codigo || 'SEDES'}.pdf`);

      mostrarToast('Informe Técnico (Comunicación Interna) generado e impreso con éxito.', 'success');
    } catch (err) {
      console.error('Error generando PDF de Comunicación Interna:', err);
      mostrarToast('Error al generar el PDF de Comunicación Interna.', 'warning');
    } finally {
      setGenerandoPdf(false);
    }
  };

  // Enviar a Área Legal (Backend API + Auditoría + Notificaciones)
  const handleEnviarAreaLegal = async () => {
    if (!tramiteActivo) return;
    setEnviandoLegal(true);
    try {
      const targetId = tramiteActivo.tramite_uuid || tramiteActivo.id;
      const response = await fetch(`http://localhost:8000/api/coordinador/tramites/${targetId}/derivar-legal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_cite: citeNumero,
          destinatario: `${destinatarioLegal} - ${destinatarioCargo}`,
          dictamen: dictamenFinal,
          observaciones: observacionesCoordinador,
          responsable: nombreCoordinador
        })
      });

      if (response.ok) {
        mostrarToast(`¡Informe Técnico derivado exitosamente a Asesoría Legal para '${tramiteActivo.establecimiento}'!`, 'success');
        if (onRecargarDatos) onRecargarDatos();
      } else {
        const err = await response.json();
        mostrarToast(err.detail || 'Error al derivar a Asesoría Legal.', 'warning');
      }
    } catch (err) {
      console.warn('Error derivando a área legal:', err);
      mostrarToast('Error de conexión con el servidor.', 'warning');
    } finally {
      setEnviandoLegal(false);
    }
  };

  // Estados calculados para aprobación final del trámite
  const esAprobadoFinal = (tramiteActivo?.estado || '').toLowerCase() === 'aprobado';
  const esListoParaAprobarFinal = Boolean(
    tramiteActivo?.resolucion_lista_para_firma ||
    (tramiteActivo?.estado || '').toLowerCase().includes('resolución') ||
    (tramiteActivo?.estado || '').toLowerCase().includes('resolucion') ||
    (tramiteActivo?.estado || '').toLowerCase().includes('firma') ||
    (tramiteActivo?.estado || '').toLowerCase().includes('aprobado por legal') ||
    (tramiteActivo?.resolucion_estado || '').toLowerCase().includes('coordinador')
  );

  // Documentos aprobados del trámite actual
  const docsList = (tramiteActivo?.documentosAprobados && tramiteActivo.documentosAprobados.length > 0)
    ? tramiteActivo.documentosAprobados
    : [
        'Licencia Municipal (Vigente)',
        'Certificado Sanitario Previo',
        'Plano Arquitectónico Aprobado',
        'Registro Vigente SENASAG'
      ];

  // =========================================================================
  // VISTA CUANDO NO HAY TRÁMITES PASADOS A INFORME TÉCNICO AÚN
  // =========================================================================
  if (listaEstablecimientos.length === 0) {
    return (
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-3 sm:p-5 gap-4 bg-[#f3f6f9]">
        
        {/* Columna Izquierda Vacía */}
        <div className="w-full md:w-80 lg:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col shrink-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-black text-slate-800 text-base tracking-tight">Establecimientos Aprobados</h2>
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              0 listos
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-700">Sin laboratorios en informe</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Los laboratorios registrados en la base de datos aparecerán aquí una vez que apruebe sus requisitos y el acta técnica, y pulse el botón <strong>"Aprobar Trámite y Emitir Resolución"</strong>.
            </p>
          </div>
        </div>

        {/* Panel Derecho Vacío con Guía */}
        <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col items-center justify-center p-8 text-center overflow-hidden">
          <div className="max-w-md space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-sky-100 text-[#0077c8] flex items-center justify-center mx-auto shadow-inner">
              <FileText className="w-8 h-8" />
            </div>
            
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Módulo de Informe Técnico
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Actualmente no hay laboratorios derivados a Informe Técnico. Para que un establecimiento aparezca en esta sección, diríjase a la <strong>Bandeja de Entrada</strong>, verifique que los documentos y la inspección del supervisor estén aprobados, y haga clic en <strong>"Aprobar Trámite y Emitir Resolución"</strong>.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/coordinador/bandeja')}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#0077c8] hover:bg-[#0064a7] text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95 cursor-pointer"
              >
                <Inbox className="w-4 h-4" />
                <span>Ir a Bandeja de Trámites</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-3 sm:p-5 gap-4 bg-[#f3f6f9]">

      {/* ===================================================================== */}
      {/* 1. COLUMNA IZQUIERDA: Establecimientos Aprobados (Lista de Cards BDD)  */}
      {/* ===================================================================== */}
      <div className="w-full md:w-80 lg:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col shrink-0 overflow-hidden">
        
        {/* Cabecera de la columna */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-black text-slate-800 text-base tracking-tight">Establecimientos Aprobados</h2>
          <span className="bg-[#dcfce7] text-[#166534] text-xs font-bold px-2.5 py-0.5 rounded-full border border-[#bbf7d0]">
            {listaEstablecimientos.length} {listaEstablecimientos.length === 1 ? 'listo' : 'listos'}
          </span>
        </div>

        {/* Lista de tarjetas scrollable */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {listaEstablecimientos.map((item) => {
            const isSelected = item.id === tramiteActivo?.id;

            return (
              <div
                key={item.id}
                onClick={() => handleSeleccionar(item)}
                className={`
                  p-4 rounded-xl border transition-all duration-150 cursor-pointer text-left relative
                  ${isSelected
                    ? 'border-[#0077c8] bg-sky-50/40 shadow-xs ring-2 ring-[#0077c8]/20'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }
                `}
              >
                {/* Fila superior: Código, Tipo badge, Fecha */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-xs text-slate-900">
                      {item.codigo || item.id}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 border border-sky-200">
                      {item.tipo}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {item.fecha}
                  </span>
                </div>

                {/* Nombre del Establecimiento */}
                <h3 className="font-extrabold text-sm text-slate-900 leading-snug mb-2.5">
                  {item.establecimiento}
                </h3>

                {/* Badge de Estado */}
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                    item.estado === 'Derivado a Asesoría Legal'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      : item.estado === 'Aprobado'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {item.estado === 'Derivado a Asesoría Legal' ? 'Derivado a Legal' : item.estado === 'Aprobado' ? 'Aprobado' : 'En Informe Técnico'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. COLUMNA DERECHA: Detalle del Informe Técnico                       */}
      {/* ===================================================================== */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col min-w-0 overflow-hidden">
        
        {/* Cabecera del Panel con Tabs de Modo de Visualización */}
        <div className="p-4 sm:px-6 sm:py-3.5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-white">
          
          <div className="flex items-center space-x-3 min-w-0">
            <h1 className="font-black text-slate-900 text-base sm:text-lg tracking-tight truncate">
              {tramiteActivo ? `${tramiteActivo.codigo || tramiteActivo.id} — Informe Técnico` : 'Informe Técnico'}
            </h1>

            {/* Selector de Modo: Visor PDF / Formulario */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setVistaModo('visor')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  vistaModo === 'visor'
                    ? 'bg-white text-[#0077c8] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-[#0077c8]" />
                <span>Visualizador PDF</span>
              </button>
              <button
                type="button"
                onClick={() => setVistaModo('formulario')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  vistaModo === 'formulario'
                    ? 'bg-white text-[#0077c8] shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-slate-600" />
                <span>Datos y Formulario</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => setMostrarConfigMemo(!mostrarConfigMemo)}
            className={`p-2 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer self-end sm:self-auto ${
              mostrarConfigMemo
                ? 'bg-[#0077c8] text-white border-[#0077c8]'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
            title="Configurar CITE y Membrete de Comunicación Interna"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Membrete CITE</span>
          </button>
        </div>

        {/* Formulario o Visualizador de PDF */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 flex flex-col">

          {/* Banner de Resolución Aprobada por Legal (Listo para Aprobación Final) */}
          {esListoParaAprobarFinal && !esAprobadoFinal && (
            <div className="bg-emerald-50/90 border border-emerald-300 p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs shrink-0 animate-in fade-in duration-200">
              <div className="flex items-start sm:items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-inner">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-emerald-900 flex items-center space-x-2">
                    <span>¡Resolución Administrativa Aprobada por Asesoría Legal!</span>
                    <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full">
                      Listo para Firma
                    </span>
                  </h4>
                  <p className="text-[11px] sm:text-xs text-emerald-800 font-medium mt-0.5 leading-relaxed">
                    El Asesor Legal ha revisado el expediente técnico y remitido la Resolución Administrativa oficial. Puede presionar <strong>"Aprobar Trámite Final"</strong> para concluir el trámite y habilitar el establecimiento.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAprobarFinal(tramiteActivo)}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 shrink-0 cursor-pointer"
              >
                <Award className="w-4 h-4 text-white" />
                <span>Aprobar Ahora</span>
              </button>
            </div>
          )}

          {/* Panel Opcional de Configuración del Membrete Oficial CITE */}
          {mostrarConfigMemo && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-150 shrink-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wide flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-[#0077c8]" />
                  <span>Configuración del Membrete (Comunicación Interna SEDES)</span>
                </h4>
                <button onClick={() => setMostrarConfigMemo(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Nº CITE:</label>
                  <input
                    type="text"
                    value={citeNumero}
                    onChange={(e) => setCiteNumero(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">A (Asesor Legal):</label>
                  <input
                    type="text"
                    value={destinatarioLegal}
                    onChange={(e) => setDestinatarioLegal(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">VIA (Jefa Unidad Calidad):</label>
                  <input
                    type="text"
                    value={viaJefe}
                    onChange={(e) => setViaJefe(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* MODO 1: VISUALIZADOR DE PDF OFICIAL (IGUAL A BANDEJA DE ENTRADA)   */}
          {/* ================================================================= */}
          {vistaModo === 'visor' ? (
            <div className="bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden flex flex-col flex-1 min-h-[560px]">
              {/* Barra superior de herramientas del visor */}
              <div className="bg-slate-800 text-white px-4 py-2.5 text-xs flex items-center justify-between font-mono shrink-0">
                <div className="flex items-center space-x-2 truncate">
                  <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">Visualizador de Documento PDF - Comunicación Interna ({tramiteActivo?.establecimiento})</span>
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <span className="text-cyan-300 text-[11px] font-bold hidden sm:inline">3 Páginas Oficiales</span>
                  <button
                    type="button"
                    onClick={actualizarVistaPreviaPDF}
                    disabled={generandoVistaPrevia}
                    className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center space-x-1"
                    title="Actualizar / Regenerar vista previa del PDF"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${generandoVistaPrevia ? 'animate-spin text-cyan-400' : ''}`} />
                    <span className="text-[10px] hidden md:inline">Actualizar</span>
                  </button>
                  {pdfBlobUrl && (
                    <a
                      href={pdfBlobUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 rounded hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer flex items-center space-x-1"
                      title="Abrir PDF en pestaña independiente"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
                      <span className="text-[10px] hidden md:inline">Ver Completo</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Área del iframe incrustado */}
              {generandoVistaPrevia && !pdfBlobUrl ? (
                <div className="flex-1 min-h-[520px] flex flex-col items-center justify-center bg-slate-50 text-slate-400 space-y-2.5 p-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#0077c8]" />
                  <p className="text-xs font-bold text-slate-800">Generando documento oficial de Comunicación Interna...</p>
                  <p className="text-[11px] text-slate-400">Compilando 3 páginas con sellos, membrete institucional y checklist</p>
                </div>
              ) : pdfBlobUrl ? (
                <iframe
                  src={`${pdfBlobUrl}#toolbar=1&navpanes=0`}
                  className="w-full flex-1 min-h-[560px] sm:min-h-[620px] border-0 bg-slate-100"
                  title="Comunicación Interna SEDES"
                />
              ) : (
                <div className="flex-1 min-h-[520px] flex items-center justify-center bg-slate-50 text-slate-400 text-xs">
                  No se pudo cargar la vista previa del PDF.
                </div>
              )}
            </div>
          ) : (
            /* ================================================================= */
            /* MODO 2: FORMULARIO Y RESUMEN TÉCNICO                             */
            /* ================================================================= */
            <div className="space-y-6">
              {/* Sección 1: Datos del Establecimiento */}
              <div className="space-y-3">
                <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2">
                  Datos del Establecimiento
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="text-slate-500 font-semibold w-44 shrink-0">Establecimiento:</span>
                    <span className="font-bold text-slate-900">{tramiteActivo?.establecimiento}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="text-slate-500 font-semibold w-44 shrink-0">Razón Social / Propietario:</span>
                    <span className="font-bold text-slate-900">{tramiteActivo?.propietario}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:col-span-2">
                    <span className="text-slate-500 font-semibold w-44 shrink-0">Dirección:</span>
                    <span className="text-slate-800 font-medium">{tramiteActivo?.direccion}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:col-span-2">
                    <span className="text-slate-500 font-semibold w-44 shrink-0">Tipo de Establecimiento:</span>
                    <span className="text-slate-800 font-medium">{tramiteActivo?.tipoDetallado || tramiteActivo?.tipo}</span>
                  </div>
                </div>
              </div>

              {/* Sección 2: Resumen de Documentación Legal */}
              <div className="space-y-3">
                <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2">
                  Resumen de Documentación Legal
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {docsList.map((docItem, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs sm:text-sm text-slate-800">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span className="font-medium text-slate-700">{docItem}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sección 3: Resumen de Inspección de Campo */}
              <div className="space-y-3">
                <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2">
                  Resumen de Inspección de Campo
                </h3>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="text-slate-500 font-semibold w-44 shrink-0">Fecha de Inspección:</span>
                    <span className="text-slate-800 font-medium">{tramiteActivo?.fechaInspeccion}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="text-slate-500 font-semibold w-44 shrink-0">Supervisor Asignado:</span>
                    <span className="font-bold text-slate-900">{tramiteActivo?.supervisorAsignado}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="text-slate-500 font-semibold w-44 shrink-0">Resultado General:</span>
                    <span className="text-emerald-700 font-bold">{tramiteActivo?.resultadoGeneral}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline">
                    <span className="text-slate-500 font-semibold w-44 shrink-0">Observaciones de Campo:</span>
                    <span className="text-slate-700 font-normal leading-relaxed">{tramiteActivo?.observacionesCampo}</span>
                  </div>
                </div>
              </div>

              {/* Sección 4: Observaciones del Coordinador (Edición) */}
              <div className="space-y-2.5">
                <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2">
                  Observaciones del Coordinador (Edición)
                </h3>

                <div className="relative">
                  <textarea
                    rows={3}
                    value={observacionesCoordinador}
                    onChange={(e) => setObservacionesCoordinador(e.target.value)}
                    placeholder="Escriba aquí las observaciones técnicas complementarias del informe técnico..."
                    className="w-full p-3 text-xs sm:text-sm text-slate-700 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077c8] focus:border-transparent leading-relaxed transition resize-none shadow-xs"
                  />
                </div>
              </div>

              {/* Sección 5: Conclusión y Dictamen Técnico */}
              <div className="space-y-3 pb-2">
                <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-2">
                  Conclusión y Dictamen Técnico
                </h3>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className="text-slate-500 font-semibold text-xs sm:text-sm w-44 shrink-0">Dictamen Final:</span>
                  
                  <div className="relative inline-block w-full sm:w-auto">
                    <div className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs sm:text-sm font-bold shadow-xs">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>{dictamenFinal}</span>
                      <ChevronDown className="w-4 h-4 text-emerald-700 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ===================================================================== */}
        {/* 3. BARRA INFERIOR DE ACCIONES (Botones de acción)                     */}
        {/* ===================================================================== */}
        <div className="p-4 sm:px-6 sm:py-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 shrink-0">
          
          {/* Botón 1: Imprimir Informe (Genera PDF 3 páginas) */}
          <button
            type="button"
            onClick={handleImprimirInforme}
            disabled={generandoPdf}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs sm:text-sm border border-slate-300 rounded-xl shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>{generandoPdf ? 'Generando PDF...' : 'Imprimir Informe'}</span>
          </button>

          {/* Botón 2: Enviar a Área Legal */}
          <button
            type="button"
            onClick={handleEnviarAreaLegal}
            disabled={enviandoLegal}
            className={`px-5 py-2.5 font-extrabold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center space-x-2 cursor-pointer active:scale-98 disabled:opacity-50 ${
              tramiteActivo?.estado === 'Derivado a Asesoría Legal'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-300 hover:bg-indigo-100'
                : 'bg-[#0077c8] hover:bg-[#0064a7] text-white shadow-md'
            }`}
            title={
              tramiteActivo?.estado === 'Derivado a Asesoría Legal'
                ? 'Este informe técnico ya fue derivado a Asesoría Legal. Puede volver a enviar si realizó modificaciones.'
                : 'Enviar informe técnico y antecedentes a la Unidad de Asesoría Legal'
            }
          >
            {tramiteActivo?.estado === 'Derivado a Asesoría Legal' ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                <span>{enviandoLegal ? 'Re-derivando a Legal...' : 'Derivado a Área Legal (Reenviar)'}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4 text-white" />
                <span>{enviandoLegal ? 'Derivando a Legal...' : 'Enviar a Área Legal'}</span>
              </>
            )}
          </button>

          {/* Botón 3: Aprobar Trámite Final (Dinámico según estado de Asesoría Legal) */}
          {esAprobadoFinal ? (
            <div className="px-5 py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold text-xs sm:text-sm rounded-xl shadow-xs flex items-center justify-center space-x-2 select-none">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Trámite Aprobado y Habilitado</span>
            </div>
          ) : esListoParaAprobarFinal ? (
            <button
              type="button"
              onClick={() => onAprobarFinal(tramiteActivo)}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center space-x-2 cursor-pointer ring-2 ring-emerald-400/60 animate-pulse"
              title="El Asesor Legal ha aprobado la Resolución Administrativa. Haga clic para emitir la aprobación final y habilitar el establecimiento."
            >
              <Award className="w-4 h-4 text-white" />
              <span>Aprobar Trámite Final</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={true}
              title="La aprobación final del trámite se habilitará automáticamente una vez que Asesoría Legal elabore y apruebe la Resolución Administrativa."
              className="px-5 py-2.5 bg-slate-100 text-slate-400 font-extrabold text-xs sm:text-sm rounded-xl border border-slate-200 flex items-center justify-center space-x-2 cursor-not-allowed opacity-75 select-none"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Aprobar Trámite Final</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
