import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  Printer,
  Building2,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  RefreshCw,
  X,
  Upload,
  Trash2,
  Image as ImageIcon,
  FileCheck2,
  BellRing,
  Share2,
  ExternalLink
} from 'lucide-react';

export default function CitacionesEmitidasView({ usuario, mostrarToast }) {
  // Estado de vista: lista vs formulario de registro
  const [modoCrearCitacion, setModoCrearCitacion] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [datosCitaciones, setDatosCitaciones] = useState(null);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [busquedaInput, setBusquedaInput] = useState('');
  const [filtroResultado, setFiltroResultado] = useState('Todos');
  const [filtroMes, setFiltroMes] = useState('Todos');
  const [paginaActual, setPaginaActual] = useState(1);

  // Modal Ver Detalle de Citación
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [citacionSeleccionada, setCitacionSeleccionada] = useState(null);

  // Modal Exportar Reporte
  const [modalExportarOpen, setModalExportarOpen] = useState(false);

  // Formulario Registrar Citación
  const [establecimientosDb, setEstablecimientosDb] = useState([]);
  const [cargandoEstablecimientos, setCargandoEstablecimientos] = useState(false);

  const [formEstablecimientoId, setFormEstablecimientoId] = useState('');
  const [formEstablecimientoNombre, setFormEstablecimientoNombre] = useState('');
  const [formDireccion, setFormDireccion] = useState('');
  const [formMunicipio, setFormMunicipio] = useState('');
  const [formNumeroCitacion, setFormNumeroCitacion] = useState('');
  const [formFechaEmision, setFormFechaEmision] = useState(() => {
    const hoy = new Date();
    return hoy.toISOString().split('T')[0];
  });
  const [formMotivoCitacion, setFormMotivoCitacion] = useState('');
  const [formTipoInspeccion, setFormTipoInspeccion] = useState('Inspección Urgente');
  
  // Adjunto de Evidencia
  const [archivoEvidencia, setArchivoEvidencia] = useState(null);
  const [archivoEvidenciaUrl, setArchivoEvidenciaUrl] = useState('');
  const [archivoEvidenciaBlobUrl, setArchivoEvidenciaBlobUrl] = useState('');
  const [archivoEvidenciaNombre, setArchivoEvidenciaNombre] = useState('');
  const [archivoEvidenciaEsPdf, setArchivoEvidenciaEsPdf] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);
  const fileInputRef = useRef(null);

  // Alertas automáticas (Toggles)
  const [alerta5Dias, setAlerta5Dias] = useState(true);
  const [alerta10Dias, setAlerta10Dias] = useState(false);
  const [alerta15Dias, setAlerta15Dias] = useState(false);

  const [guardandoCitacion, setGuardandoCitacion] = useState(false);

  // Helper para ID de supervisor
  const getSupervisorId = () => {
    return usuario?.id || usuario?.email || (usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos}` : 'supervisor');
  };

  // Cargar lista de citaciones desde el backend
  const cargarCitaciones = useCallback(async (page = 1) => {
    const supId = getSupervisorId();
    setCargando(true);
    try {
      let url = `http://localhost:8000/api/supervisor/${encodeURIComponent(supId)}/citaciones?page=${page}&limit=6`;

      if (busqueda.trim()) {
        url += `&search=${encodeURIComponent(busqueda.trim())}`;
      }
      if (filtroResultado !== 'Todos') {
        url += `&resultado=${encodeURIComponent(filtroResultado)}`;
      }
      if (filtroMes !== 'Todos') {
        url += `&mes_año=${encodeURIComponent(filtroMes)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setDatosCitaciones(data);
        setPaginaActual(data.paginacion?.pagina_actual || 1);
      } else {
        mostrarToast?.('Error al cargar el historial de citaciones.', 'warning');
      }
    } catch (err) {
      console.warn('Error al obtener citaciones:', err);
      mostrarToast?.('Error de conexión con el backend de citaciones.', 'warning');
    } finally {
      setCargando(false);
    }
  }, [usuario, busqueda, filtroResultado, filtroMes, mostrarToast]);

  useEffect(() => {
    cargarCitaciones(1);
  }, [cargarCitaciones, filtroResultado, filtroMes]);

  // Cargar lista de establecimientos reales para el selector de emisión
  const cargarEstablecimientosParaCitacion = async () => {
    const supId = getSupervisorId();
    setCargandoEstablecimientos(true);
    try {
      const res = await fetch(`http://localhost:8000/api/supervisor/${encodeURIComponent(supId)}/establecimientos-citacion`);
      if (res.ok) {
        const data = await res.json();
        setEstablecimientosDb(data || []);
        if (data && data.length > 0) {
          const primero = data[0];
          setFormEstablecimientoId(primero.id);
          setFormEstablecimientoNombre(primero.nombre_comercial || primero.nombre);
          setFormDireccion(primero.direccion || '');
          setFormMunicipio(primero.municipio || 'CERCADO');
        }
      }
    } catch (err) {
      console.warn('Error al cargar establecimientos para citación:', err);
    } finally {
      setCargandoEstablecimientos(false);
    }
  };

  // Abrir formulario de registro
  const handleAbrirRegistrarCitacion = () => {
    cargarEstablecimientosParaCitacion();
    
    // Generar sugerencia de correlativo
    const anio = new Date().getFullYear();
    const correlativo = (datosCitaciones?.total_emitidas || 0) + 1;
    const padCorrelativo = String(correlativo).padStart(3, '0');
    setFormNumeroCitacion(`CT-${anio}-${padCorrelativo}`);
    
    setFormFechaEmision(new Date().toISOString().split('T')[0]);
    setFormMotivoCitacion('');
    setFormTipoInspeccion('Inspección Urgente');
    setArchivoEvidencia(null);
    setArchivoEvidenciaUrl('');
    setAlerta5Dias(true);
    setAlerta10Dias(false);
    setAlerta15Dias(false);
    setModoCrearCitacion(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Selección de establecimiento en el formulario
  const handleSeleccionarEstablecimiento = (e) => {
    const selectedId = e.target.value;
    setFormEstablecimientoId(selectedId);
    const est = establecimientosDb.find(item => item.id === selectedId);
    if (est) {
      setFormEstablecimientoNombre(est.nombre_comercial || est.nombre || '');
      setFormDireccion(est.direccion || '');
      setFormMunicipio(est.municipio || '');
    }
  };

  // Subir archivo de evidencia fotográfica o documento
  const handleSubirArchivoEvidencia = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de tipo de archivo (imagen o PDF)
    const esPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const esImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(file.name);

    if (!esPdf && !esImg) {
      mostrarToast?.('Por favor seleccione una imagen (JPG, PNG, WebP) o un archivo PDF.', 'warning');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setArchivoEvidencia(file);
    setArchivoEvidenciaNombre(file.name);
    setArchivoEvidenciaEsPdf(esPdf);
    setArchivoEvidenciaBlobUrl(objectUrl);
    setArchivoEvidenciaUrl(objectUrl);

    setSubiendoArchivo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:8000/api/supervisor/subir-evidencia-citacion', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setArchivoEvidenciaUrl(data.url);
        mostrarToast?.(`Documento "${file.name}" adjuntado exitosamente.`, 'success');
      } else {
        mostrarToast?.(`Documento "${file.name}" cargado para vista previa.`, 'info');
      }
    } catch (err) {
      console.warn('Error al subir evidencia:', err);
      mostrarToast?.(`Documento "${file.name}" cargado para vista previa.`, 'info');
    } finally {
      setSubiendoArchivo(false);
    }
  };

  // Quitar archivo adjunto
  const handleQuitarArchivo = () => {
    setArchivoEvidencia(null);
    setArchivoEvidenciaUrl('');
    setArchivoEvidenciaBlobUrl('');
    setArchivoEvidenciaNombre('');
    setArchivoEvidenciaEsPdf(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    mostrarToast?.('Documento quitado.', 'info');
  };

  // Ver PDF / Documento en pestaña nueva
  const handleVerPdf = () => {
    const targetUrl = archivoEvidenciaBlobUrl || archivoEvidenciaUrl;
    if (!targetUrl) {
      mostrarToast?.('No hay ningún documento cargado para visualizar.', 'warning');
      return;
    }
    window.open(targetUrl, '_blank');
  };

  // Guardar citación en backend
  const handleGuardarCitacion = async (e) => {
    e.preventDefault();

    if (!formMotivoCitacion.trim()) {
      mostrarToast?.('Por favor ingrese el motivo de la citación.', 'warning');
      return;
    }

    if (!formEstablecimientoNombre.trim()) {
      mostrarToast?.('Por favor seleccione un establecimiento.', 'warning');
      return;
    }

    setGuardandoCitacion(true);
    const supId = getSupervisorId();

    try {
      const payload = {
        establecimiento_id: formEstablecimientoId || null,
        establecimiento_nombre: formEstablecimientoNombre,
        direccion: formDireccion,
        municipio: formMunicipio,
        supervisor_id: supId,
        numero_citacion: formNumeroCitacion.trim() || undefined,
        fecha_emision: formFechaEmision,
        motivo_citacion: formMotivoCitacion.trim(),
        tipo_inspeccion: formTipoInspeccion,
        evidencia_foto_url: archivoEvidenciaUrl || null,
        alerta_5_dias: alerta5Dias,
        alerta_10_dias: alerta10Dias,
        alerta_15_dias: alerta15Dias
      };

      const res = await fetch('http://localhost:8000/api/supervisor/registrar-citacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        mostrarToast?.(data.mensaje || '¡Citación registrada exitosamente!', 'success');
        setModoCrearCitacion(false);
        cargarCitaciones(1);
      } else {
        const err = await res.json();
        mostrarToast?.(err.detail || 'Error al registrar la citación.', 'warning');
      }
    } catch (err) {
      console.warn('Error al registrar citación:', err);
      mostrarToast?.('Error de conexión al registrar citación.', 'warning');
    } finally {
      setGuardandoCitacion(false);
    }
  };

  // Ver detalle de citación
  const handleVerDetalle = (citacion) => {
    setCitacionSeleccionada(citacion);
    setModalDetalleOpen(true);
  };

  // Exportar reporte CSV
  const handleExportarReporteCSV = () => {
    const list = datosCitaciones?.citaciones || [];
    if (list.length === 0) {
      mostrarToast?.('No hay citaciones para exportar.', 'warning');
      return;
    }

    const headers = ['N° Citación', 'Fecha', 'Establecimiento', 'Municipio', 'Dirección', 'Tipo Inspección', 'Resultado', 'Motivo Infracción', 'Supervisor'];
    const rows = list.map(c => [
      `"${c.numero_citacion || c.codigo_citacion}"`,
      `"${c.fecha_formateada || c.fecha_iso}"`,
      `"${c.establecimiento}"`,
      `"${c.municipio}"`,
      `"${c.direccion}"`,
      `"${c.tipo_inspeccion}"`,
      `"${c.resultado}"`,
      `"${(c.motivo_citacion || '').replace(/"/g, '""')}"`,
      `"${c.supervisor}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Citaciones_Emitidas_SEDES_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    mostrarToast?.('Reporte exportado exitosamente en formato CSV.', 'success');
    setModalExportarOpen(false);
  };

  // ============================================================================
  // VISTA B: FORMULARIO "REGISTRAR CITACIÓN" (FIGMA IMAGEN 2)
  // ============================================================================
  if (modoCrearCitacion) {
    return (
      <div className="space-y-6 animate-fadeIn pb-12">
        {/* Cabecera del formulario con Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Registrar Citación
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Genera una nueva citación, adjunta evidencia y configura alertas automáticas para el supervisor.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setModoCrearCitacion(false)}
            className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition cursor-pointer flex items-center space-x-1.5 shadow-2xs"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver al Historial</span>
          </button>
        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleGuardarCitacion} className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs p-6 sm:p-10 space-y-8 max-w-5xl">
          
          {/* ------------------------------------------------------------- */}
          {/* SECCIÓN 1: ESTABLECIMIENTO                                    */}
          {/* ------------------------------------------------------------- */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Establecimiento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Dropdown Establecimiento */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Establecimiento <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formEstablecimientoId}
                    onChange={handleSeleccionarEstablecimiento}
                    disabled={cargandoEstablecimientos}
                    className="w-full bg-slate-50/80 hover:bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6] cursor-pointer appearance-none pr-10"
                    required
                  >
                    <option value="">Seleccione un establecimiento</option>
                    {establecimientosDb.map(est => (
                      <option key={est.id} value={est.id}>
                        {est.nombre_comercial || est.nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Nombre del establecimiento */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Nombre del establecimiento <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Hospital Sur"
                  value={formEstablecimientoNombre}
                  onChange={(e) => setFormEstablecimientoNombre(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                />
              </div>

              {/* Dirección */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Dirección <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Av. Arce #123, Zona Sur"
                  value={formDireccion}
                  onChange={(e) => setFormDireccion(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                />
              </div>

              {/* Municipio */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Municipio <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Tiquipaya"
                  value={formMunicipio}
                  onChange={(e) => setFormMunicipio(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                />
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECCIÓN 2: CITACIÓN                                           */}
          {/* ------------------------------------------------------------- */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Citación
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* N° de citación */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  N° de citación <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="CT-2026-031"
                  value={formNumeroCitacion}
                  onChange={(e) => setFormNumeroCitacion(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                />
              </div>

              {/* Fecha de emisión */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Fecha de emisión <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formFechaEmision}
                  onChange={(e) => setFormFechaEmision(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                />
              </div>

              {/* Motivo de la citación (ocupa las dos columnas) */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Motivo de la citación <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Inspección urgente por incumplimiento de protocolos de bioseguridad."
                  value={formMotivoCitacion}
                  onChange={(e) => setFormMotivoCitacion(e.target.value)}
                  className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6] resize-none"
                />
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECCIÓN 3: ADJUNTOS                                           */}
          {/* ------------------------------------------------------------- */}
          {/* ------------------------------------------------------------- */}
          {/* SECCIÓN 3: ADJUNTOS / VISOR DE DOCUMENTO                       */}
          {/* ------------------------------------------------------------- */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Adjuntos
              </h3>
              {(archivoEvidenciaBlobUrl || archivoEvidenciaUrl) && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 self-start sm:self-auto">
                  ✓ Documento adjuntado
                </span>
              )}
            </div>

            {/* Botones de Archivo al estilo Actas */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleSubirArchivoEvidencia}
                className="hidden"
                id="upload-citacion-evidencia"
              />

              {/* Subir archivo */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={subiendoArchivo}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs flex items-center space-x-2 disabled:opacity-50"
              >
                {subiendoArchivo ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-[#0060a8]" />
                ) : (
                  <Upload className="w-4 h-4 text-slate-700" />
                )}
                <span>{subiendoArchivo ? 'Subiendo...' : 'Subir archivo'}</span>
              </button>

              {/* Ver PDF / Documento */}
              <button
                type="button"
                onClick={handleVerPdf}
                disabled={!archivoEvidenciaBlobUrl && !archivoEvidenciaUrl}
                className="px-4 py-2 bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-900 font-black text-xs rounded-xl transition cursor-pointer shadow-2xs flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                <span>Ver {archivoEvidenciaEsPdf ? 'PDF' : 'Documento'}</span>
              </button>

              {/* Quitar documento */}
              <button
                type="button"
                onClick={handleQuitarArchivo}
                disabled={!archivoEvidenciaBlobUrl && !archivoEvidenciaUrl}
                className="px-4 py-2 bg-[#e53e3e] hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" />
                <span>Quitar documento</span>
              </button>

              {archivoEvidenciaNombre && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  ✓ {archivoEvidenciaNombre}
                </span>
              )}
            </div>

            {/* Visor / Vista Previa del Documento */}
            <div className="bg-[#eef2f6] border border-slate-200/80 rounded-2xl p-4 sm:p-6 min-h-[480px] flex items-center justify-center overflow-hidden">
              {(archivoEvidenciaBlobUrl || archivoEvidenciaUrl) ? (
                archivoEvidenciaEsPdf ? (
                  <iframe
                    src={archivoEvidenciaBlobUrl || (archivoEvidenciaUrl.startsWith('http') ? archivoEvidenciaUrl : `http://localhost:8000${archivoEvidenciaUrl}`)}
                    title="Vista previa del documento oficial de citación"
                    className="w-full h-[650px] rounded-xl border border-slate-300 bg-white shadow-md"
                  />
                ) : (
                  <div className="max-h-[650px] overflow-auto flex items-center justify-center w-full">
                    <img
                      src={archivoEvidenciaBlobUrl || (archivoEvidenciaUrl.startsWith('http') ? archivoEvidenciaUrl : `http://localhost:8000${archivoEvidenciaUrl}`)}
                      alt="Evidencia adjunta"
                      className="max-h-[620px] w-auto max-w-full object-contain rounded-lg shadow-md bg-white"
                    />
                  </div>
                )
              ) : (
                <div className="text-center p-8 space-y-3 max-w-md">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs text-slate-400">
                    <FileText className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-black text-slate-700">
                    Ningún documento o evidencia cargada todavía
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    Adjunte la fotografía de la infracción en campo o el documento escaneado de la citación oficial en formato PDF o imagen.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center space-x-1.5 shadow-2xs mt-2"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Seleccionar archivo para subir</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* SECCIÓN 4: ALERTAS AUTOMÁTICAS                                */}
          {/* ------------------------------------------------------------- */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Alertas automáticas
            </h3>

            <div className="space-y-3 bg-slate-50/60 p-4 sm:p-6 rounded-2xl border border-slate-100">
              {/* Alerta 5 días */}
              <div className="flex items-center justify-between py-2 border-b border-slate-200/50">
                <div className="space-y-0.5 pr-4">
                  <p className="text-xs font-bold text-slate-900">
                    Alerta 5 días antes
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Notificación automática al supervisor y al establecimiento.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAlerta5Dias(prev => !prev)}
                  className={`
                    w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer shrink-0
                    ${alerta5Dias ? 'bg-[#1b2533]' : 'bg-slate-300'}
                  `}
                >
                  <div
                    className={`
                      bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out
                      ${alerta5Dias ? 'translate-x-6' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              {/* Alerta 10 días */}
              <div className="flex items-center justify-between py-2 border-b border-slate-200/50">
                <div className="space-y-0.5 pr-4">
                  <p className="text-xs font-bold text-slate-900">
                    Alerta 10 días antes
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Recordatorio de subsanación y seguimiento de acciones.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAlerta10Dias(prev => !prev)}
                  className={`
                    w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer shrink-0
                    ${alerta10Dias ? 'bg-[#1b2533]' : 'bg-slate-300'}
                  `}
                >
                  <div
                    className={`
                      bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out
                      ${alerta10Dias ? 'translate-x-6' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>

              {/* Alerta 15 días */}
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5 pr-4">
                  <p className="text-xs font-bold text-slate-900">
                    Alerta 15 días antes
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Preparación de multas o sanciones administrativas.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAlerta15Dias(prev => !prev)}
                  className={`
                    w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out cursor-pointer shrink-0
                    ${alerta15Dias ? 'bg-[#1b2533]' : 'bg-slate-300'}
                  `}
                >
                  <div
                    className={`
                      bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out
                      ${alerta15Dias ? 'translate-x-6' : 'translate-x-0'}
                    `}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* FOOTER DEL FORMULARIO                                         */}
          {/* ------------------------------------------------------------- */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-slate-100 gap-4">
            <p className="text-[11px] text-slate-400 font-medium order-2 sm:order-1">
              Todos los campos marcados son obligatorios.
            </p>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end order-1 sm:order-2">
              <button
                type="button"
                onClick={() => setModoCrearCitacion(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs text-center"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={guardandoCitacion}
                className="w-full sm:w-auto px-7 py-2.5 bg-[#1b2533] hover:bg-[#111827] text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {guardandoCitacion ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar citación</span>
                )}
              </button>
            </div>
          </div>

        </form>
      </div>
    );
  }

  // ============================================================================
  // VISTA A: LISTADO "CITACIONES EMITIDAS" (FIGMA IMAGEN 1)
  // ============================================================================
  const citacionesList = datosCitaciones?.citaciones || [];
  const paginacion = datosCitaciones?.paginacion || {
    total_registros: 0,
    pagina_actual: 1,
    total_paginas: 1,
    limite_por_pagina: 6,
    mostrando_desde: 0,
    mostrando_hasta: 0
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* 1. Encabezado de Página + Botones de Acción */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Citaciones Emitidas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Registro de todas las actas de inspección realizadas en campo.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          {/* Botón Exportar Reporte */}
          <button
            type="button"
            onClick={() => setModalExportarOpen(true)}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar Reporte</span>
          </button>

          {/* Botón Registrar Acta / Citación */}
          <button
            type="button"
            onClick={handleAbrirRegistrarCitacion}
            className="px-5 py-2.5 bg-[#1b2533] hover:bg-[#111827] text-white rounded-xl text-xs font-bold transition shadow-md flex items-center space-x-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Registrar Acta</span>
          </button>
        </div>
      </div>

      {/* 2. Barra de Filtros (Búsqueda, Resultado, Mes, Botón Filtrar) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        
        {/* Input de Búsqueda */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por código o establecimiento..."
            value={busquedaInput}
            onChange={(e) => setBusquedaInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setBusqueda(busquedaInput);
              }
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6] transition"
          />
        </div>

        {/* Dropdown Resultado */}
        <div className="relative min-w-[170px]">
          <select
            value={filtroResultado}
            onChange={(e) => setFiltroResultado(e.target.value)}
            className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6] cursor-pointer appearance-none pr-8"
          >
            <option value="Todos">Resultado: Todos</option>
            <option value="Rechazado">Resultado: Rechazado</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Dropdown Mes */}
        <div className="relative min-w-[180px]">
          <div className="flex items-center">
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl pl-9 pr-8 py-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6] cursor-pointer appearance-none"
            >
              <option value="Todos">Mes: Todos los meses</option>
              {datosCitaciones?.meses_disponibles?.map(m => (
                <option key={m.key} value={m.key}>
                  Mes: {m.label}
                </option>
              ))}
            </select>
            <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Botón Filtrar */}
        <button
          type="button"
          onClick={() => {
            setBusqueda(busquedaInput);
            cargarCitaciones(1);
          }}
          className="px-6 py-2.5 bg-[#1b2533] hover:bg-[#111827] text-white rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer flex items-center justify-center space-x-1.5"
        >
          <span>Filtrar</span>
        </button>
      </div>

      {/* 3. Tarjeta de Tabla: Historial de Citaciones */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
        
        {/* Cabecera de la Tarjeta con Título y Badge */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center space-x-3">
          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            Historial de Citaciones
          </h3>
          <span className="px-3 py-1 bg-blue-50 text-[#005596] rounded-full text-xs font-extrabold">
            {datosCitaciones?.total_emitidas || citacionesList.length} actas emitidas
          </span>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">N° CITACIÓN</th>
                <th className="py-3.5 px-6">FECHA</th>
                <th className="py-3.5 px-6">ESTABLECIMIENTO</th>
                <th className="py-3.5 px-6">TIPO INSPECCIÓN</th>
                <th className="py-3.5 px-6 text-center">RESULTADO</th>
                <th className="py-3.5 px-6 text-center">ACCIÓN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    <RefreshCw className="w-6 h-6 animate-spin text-[#0060a8] mx-auto mb-2" />
                    <span>Cargando citaciones de la base de datos...</span>
                  </td>
                </tr>
              ) : citacionesList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium space-y-2">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-1" />
                    <p className="text-slate-600 font-bold">No se encontraron citaciones registradas</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Las citaciones generadas por infracciones o inspecciones rechazadas aparecerán listadas aquí.
                    </p>
                    <button
                      type="button"
                      onClick={handleAbrirRegistrarCitacion}
                      className="mt-3 px-4 py-2 bg-[#1b2533] hover:bg-[#111827] text-white text-xs font-bold rounded-xl transition inline-flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Emitir Primera Citación</span>
                    </button>
                  </td>
                </tr>
              ) : (
                citacionesList.map((cit) => (
                  <tr 
                    key={cit.id}
                    className="hover:bg-slate-50/70 transition"
                  >
                    {/* N° Citación */}
                    <td className="py-4 px-6 font-bold text-slate-800 whitespace-nowrap">
                      {cit.numero_citacion || cit.codigo_citacion}
                    </td>

                    {/* Fecha */}
                    <td className="py-4 px-6 text-slate-600 whitespace-nowrap font-medium">
                      {cit.fecha_formateada || cit.fecha_iso}
                    </td>

                    {/* Establecimiento */}
                    <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                      {cit.establecimiento}
                    </td>

                    {/* Tipo Inspección */}
                    <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                      {cit.tipo_inspeccion}
                    </td>

                    {/* Resultado (Badge Rojo Rechazado) */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
                        {cit.resultado || 'Rechazado'}
                      </span>
                    </td>

                    {/* Acción (Botón Ver) */}
                    <td className="py-4 px-6 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleVerDetalle(cit)}
                        className="px-4 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Pie de Tabla / Paginación */}
        {paginacion.total_registros > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            
            {/* Texto "Mostrando 1-6 de 24 citacion" */}
            <span className="text-slate-500 font-medium">
              Mostrando {paginacion.mostrando_desde}-{paginacion.mostrando_hasta} de {paginacion.total_registros} citacion{paginacion.total_registros === 1 ? '' : 'es'}
            </span>

            {/* Botones de Paginación (< 1 2 3 4 >) */}
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => cargarCitaciones(paginacion.pagina_actual - 1)}
                disabled={paginacion.pagina_actual <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: paginacion.total_paginas }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => cargarCitaciones(pageNum)}
                  className={`
                    w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center
                    ${pageNum === paginacion.pagina_actual
                      ? 'bg-[#1b2533] text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }
                  `}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => cargarCitaciones(paginacion.pagina_actual + 1)}
                disabled={paginacion.pagina_actual >= paginacion.total_paginas}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>

      {/* ===================================================================== */}
      {/* 5. MODAL: DETALLE DE LA CITACIÓN (VISTA COMPLETA)                      */}
      {/* ===================================================================== */}
      {modalDetalleOpen && citacionSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            
            {/* Cabecera */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                    Citación Sanitaria #{citacionSeleccionada.numero_citacion || citacionSeleccionada.codigo_citacion}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    {citacionSeleccionada.resultado}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {citacionSeleccionada.establecimiento}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalDetalleOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Datos Técnicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-slate-400 font-medium block">Fecha de Emisión:</span>
                <span className="font-bold text-slate-800">{citacionSeleccionada.fecha_formateada || citacionSeleccionada.fecha_iso}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Tipo de Inspección:</span>
                <span className="font-bold text-slate-800">{citacionSeleccionada.tipo_inspeccion}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Municipio:</span>
                <span className="font-bold text-slate-800">{citacionSeleccionada.municipio}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Dirección:</span>
                <span className="font-bold text-slate-800">{citacionSeleccionada.direccion}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Responsable / Propietario:</span>
                <span className="font-bold text-slate-800">{citacionSeleccionada.propietario}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Supervisor Emisor:</span>
                <span className="font-bold text-[#005596]">{citacionSeleccionada.supervisor}</span>
              </div>
            </div>

            {/* Motivo de la Citación */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Motivo e Infracciones Observadas
              </label>
              <div className="p-4 bg-rose-50/70 border border-rose-200/80 rounded-2xl text-xs text-rose-950 font-medium leading-relaxed">
                {citacionSeleccionada.motivo_citacion}
              </div>
            </div>

            {/* Evidencia Adjunta */}
            {citacionSeleccionada.evidencia_foto_url && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Evidencia Fotográfica / Documental
                  </label>
                  <a
                    href={citacionSeleccionada.evidencia_foto_url.startsWith('http') ? citacionSeleccionada.evidencia_foto_url : `http://localhost:8000${citacionSeleccionada.evidencia_foto_url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#0060a8] hover:underline flex items-center space-x-1"
                  >
                    <span>Abrir en ventana completa</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <div className="bg-[#eef2f6] border border-slate-200/80 rounded-2xl p-3 flex items-center justify-center overflow-hidden">
                  {citacionSeleccionada.evidencia_foto_url.toLowerCase().includes('.pdf') ? (
                    <iframe
                      src={citacionSeleccionada.evidencia_foto_url.startsWith('http') ? citacionSeleccionada.evidencia_foto_url : `http://localhost:8000${citacionSeleccionada.evidencia_foto_url}`}
                      title="Documento de evidencia"
                      className="w-full h-[450px] rounded-xl border border-slate-300 bg-white shadow-sm"
                    />
                  ) : (
                    <img
                      src={citacionSeleccionada.evidencia_foto_url.startsWith('http') ? citacionSeleccionada.evidencia_foto_url : `http://localhost:8000${citacionSeleccionada.evidencia_foto_url}`}
                      alt="Evidencia"
                      className="max-h-80 object-contain rounded-xl shadow-sm bg-white"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Estado de Alertas */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Configuración de Alertas
              </label>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className={`p-2.5 rounded-xl border font-bold ${citacionSeleccionada.alerta_5_dias ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  5 días antes: {citacionSeleccionada.alerta_5_dias ? '✓ Activa' : 'Inactiva'}
                </div>
                <div className={`p-2.5 rounded-xl border font-bold ${citacionSeleccionada.alerta_10_dias ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  10 días antes: {citacionSeleccionada.alerta_10_dias ? '✓ Activa' : 'Inactiva'}
                </div>
                <div className={`p-2.5 rounded-xl border font-bold ${citacionSeleccionada.alerta_15_dias ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  15 días antes: {citacionSeleccionada.alerta_15_dias ? '✓ Activa' : 'Inactiva'}
                </div>
              </div>
            </div>

            {/* Botón Cerrar */}
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalDetalleOpen(false)}
                className="px-6 py-2.5 bg-[#1b2533] hover:bg-[#111827] text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. MODAL: EXPORTAR REPORTE                                             */}
      {/* ===================================================================== */}
      {modalExportarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-[#005596]" />
                <h3 className="text-base font-bold text-slate-900">
                  Exportar Historial de Citaciones
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalExportarOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Descargue el registro completo de las citaciones emitidas por infracción sanitaria en formato compatible con hojas de cálculo (CSV/Excel).
            </p>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalExportarOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleExportarReporteCSV}
                className="px-5 py-2 bg-[#005596] hover:bg-[#003e6d] text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center space-x-2 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
