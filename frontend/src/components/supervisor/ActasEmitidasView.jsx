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
  FileCheck,
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
  Award,
  RefreshCw,
  X,
  FileSpreadsheet,
  ExternalLink
} from 'lucide-react';

import logoL1 from '../../assets/L1.png';
import logoL2 from '../../assets/L2.png';
import NuevaActaFormView from './NuevaActaFormView';

export default function ActasEmitidasView({ usuario, mostrarToast }) {
  const [modoCrearActa, setModoCrearActa] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [datosActas, setDatosActas] = useState(null);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroResultado, setFiltroResultado] = useState('Todos');
  const [filtroMes, setFiltroMes] = useState('Todos');
  const [paginaActual, setPaginaActual] = useState(1);

  // Modal Ver Detalle de Acta
  const [modalDetalleOpen, setModalDetalleOpen] = useState(false);
  const [actaSeleccionada, setActaSeleccionada] = useState(null);

  // Modal Vista Previa / Imprimir PDF Oficial
  const [modalPdfOpen, setModalPdfOpen] = useState(false);

  // Modal Registrar Nueva Acta
  const [modalRegistrarOpen, setModalRegistrarOpen] = useState(false);
  const [inspeccionesPendientes, setInspeccionesPendientes] = useState([]);
  const [cargandoPendientes, setCargandoPendientes] = useState(false);
  const [formInspeccionId, setFormInspeccionId] = useState('');
  const [formEstablecimientoNombre, setFormEstablecimientoNombre] = useState('');
  const [formTipoInspeccion, setFormTipoInspeccion] = useState('Inspección de Verificación');
  const [formResultado, setFormResultado] = useState('Aprobado');
  const [formObservaciones, setFormObservaciones] = useState('');
  const [formCheckInfraestructura, setFormCheckInfraestructura] = useState(true);
  const [formCheckEquipamiento, setFormCheckEquipamiento] = useState(true);
  const [formCheckPersonal, setFormCheckPersonal] = useState(true);
  const [formCheckBioseguridad, setFormCheckBioseguridad] = useState(true);
  const [guardandoActa, setGuardandoActa] = useState(false);

  // Cargar lista de actas desde el backend
  const cargarActas = useCallback(async (page = 1) => {
    const supId = usuario?.id || usuario?.email || (usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos}` : '');
    if (!supId) return;
    setCargando(true);
    try {
      let url = `http://localhost:8000/api/supervisor/${encodeURIComponent(supId)}/actas?page=${page}&limit=6`;

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
        setDatosActas(data);
        setPaginaActual(data.paginacion?.pagina_actual || 1);
      } else {
        mostrarToast?.('Error al cargar el historial de actas.', 'warning');
      }
    } catch (err) {
      console.warn('Error al obtener actas:', err);
      mostrarToast?.('Error de conexión al obtener actas.', 'warning');
    } finally {
      setCargando(false);
    }
  }, [usuario, busqueda, filtroResultado, filtroMes, mostrarToast]);

  useEffect(() => {
    cargarActas(1);
  }, [filtroResultado, filtroMes]);

  // Cargar inspecciones disponibles para registrar acta
  const cargarInspeccionesParaActa = async () => {
    const supId = usuario?.id || usuario?.email || (usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos}` : '');
    if (!supId) return;
    setCargandoPendientes(true);
    try {
      const res = await fetch(`http://localhost:8000/api/supervisor/${encodeURIComponent(supId)}/agenda`);
      if (res.ok) {
        const data = await res.json();
        const combinadas = [
          ...(data.eventos || []),
          ...(data.pendientes || [])
        ];
        setInspeccionesPendientes(combinadas);
        if (combinadas.length > 0) {
          setFormInspeccionId(combinadas[0].inspeccion_id || combinadas[0].id || '');
          setFormEstablecimientoNombre(combinadas[0].establecimiento || combinadas[0].nombre || '');
          setFormTipoInspeccion(combinadas[0].tipo || 'Apertura');
        }
      }
    } catch (err) {
      console.warn('Error al cargar inspecciones para acta:', err);
    } finally {
      setCargandoPendientes(false);
    }
  };

  const handleAbrirRegistrarModal = () => {
    cargarInspeccionesParaActa();
    setFormResultado('Aprobado');
    setFormObservaciones('');
    setFormCheckInfraestructura(true);
    setFormCheckEquipamiento(true);
    setFormCheckPersonal(true);
    setFormCheckBioseguridad(true);
    setModalRegistrarOpen(true);
  };

  const handleSeleccionarInspeccionForm = (e) => {
    const selectedId = e.target.value;
    setFormInspeccionId(selectedId);
    const item = inspeccionesPendientes.find(i => (i.inspeccion_id === selectedId || i.id === selectedId));
    if (item) {
      setFormEstablecimientoNombre(item.establecimiento || item.nombre || '');
      setFormTipoInspeccion(item.tipo || 'Inspección Técnica');
    }
  };

  // Guardar nueva acta
  const handleGuardarActa = async (e) => {
    e.preventDefault();
    if (!formObservaciones.trim()) {
      mostrarToast?.('Por favor ingrese las observaciones técnicas del acta.', 'warning');
      return;
    }

    setGuardandoActa(true);
    try {
      const supId = usuario?.id || usuario?.email || `${usuario?.nombres || ''} ${usuario?.apellidos || ''}`.trim();
      const response = await fetch('http://localhost:8000/api/supervisor/registrar-acta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspeccion_id: formInspeccionId || null,
          supervisor_id: supId,
          resultado: formResultado,
          tipo_inspeccion: formTipoInspeccion,
          observaciones: formObservaciones,
          cumple_infraestructura: formCheckInfraestructura,
          cumple_equipamiento: formCheckEquipamiento,
          cumple_personal: formCheckPersonal,
          cumple_bioseguridad: formCheckBioseguridad
        })
      });

      if (response.ok) {
        const data = await response.json();
        mostrarToast?.(data.mensaje || '¡Acta registrada exitosamente!', 'success');
        setModalRegistrarOpen(false);
        cargarActas(1);
      } else {
        const err = await response.json();
        mostrarToast?.(err.detail || 'Error al emitir el acta.', 'warning');
      }
    } catch (err) {
      console.warn('Error al registrar acta:', err);
      mostrarToast?.('Error de conexión al emitir acta.', 'warning');
    } finally {
      setGuardandoActa(false);
    }
  };

  // Exportar reporte CSV
  const handleExportarReporte = () => {
    const actas = datosActas?.actas || [];
    if (actas.length === 0) {
      mostrarToast?.('No hay actas registradas para exportar.', 'warning');
      return;
    }

    const headers = ['Nº Acta', 'Fecha', 'Establecimiento', 'Tipo Inspección', 'Resultado', 'Supervisor', 'Dirección', 'Observaciones'];
    const rows = actas.map(a => [
      `"${a.codigo_acta}"`,
      `"${a.fecha_formateada}"`,
      `"${a.establecimiento}"`,
      `"${a.tipo_inspeccion}"`,
      `"${a.resultado}"`,
      `"${a.supervisor}"`,
      `"${a.direccion}"`,
      `"${(a.observaciones || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte_Actas_SEDES_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    mostrarToast?.('📥 Reporte de actas exportado en CSV con éxito.', 'success');
  };

  const handleVerDetalle = (acta) => {
    setActaSeleccionada(acta);
    setModalDetalleOpen(true);
  };

  const handleVerPdf = (acta) => {
    setActaSeleccionada(acta);
    setModalPdfOpen(true);
  };

  const kpis = datosActas?.kpis || {
    aprobados: 0,
    aprobados_mes: 0,
    con_observaciones: 0,
    con_observaciones_mes: 0,
    rechazados: 0,
    rechazados_mes: 0,
    total_emitidas: 0
  };

  const actas = datosActas?.actas || [];
  const paginacion = datosActas?.paginacion || {
    total_registros: 0,
    pagina_actual: 1,
    total_paginas: 1,
    mostrando_desde: 0,
    mostrando_hasta: 0
  };

  if (modoCrearActa) {
    return (
      <NuevaActaFormView
        usuario={usuario}
        onVolver={() => setModoCrearActa(false)}
        onActaGuardada={() => {
          setModoCrearActa(false);
          cargarActas(1);
        }}
        mostrarToast={mostrarToast}
      />
    );
  }

  return (
    <div className="space-y-6">

      {/* ===================================================================== */}
      {/* 1. CABECERA CON ACCIONES DE EXPORTAR Y REGISTRAR                      */}
      {/* ===================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Actas Emitidas
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Registro de todas las actas de inspección realizadas en campo.
          </p>
        </div>

        {/* Botones Superiores de Acción */}
        <div className="flex items-center space-x-3 self-start sm:self-auto">

          {/* Botón Primario Registrar Acta */}
          <button
            type="button"
            onClick={() => setModoCrearActa(true)}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-[#1b2533] hover:bg-[#111827] text-white font-extrabold text-xs sm:text-sm transition shadow-md hover:shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Registrar Acta</span>
          </button>

        </div>
      </div>

      {/* ===================================================================== */}
      {/* 2. TARJETAS DE MÉTRICAS / KPIS (3 TARJETAS FIGMA)                     */}
      {/* ===================================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* KPI 1: Aprobados */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              Aprobados
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {kpis.aprobados}
            </div>
            <div className="text-xs font-bold text-emerald-600 mt-1 flex items-center space-x-1">
              <span>+{kpis.aprobados_mes} este mes</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Con Observaciones */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase">
              Con Observaciones
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {kpis.con_observaciones}
            </div>
            <div className="text-xs font-bold text-amber-600 mt-1 flex items-center space-x-1">
              <span>+{kpis.con_observaciones_mes} este mes</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Rechazados */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              Rechazados
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {kpis.rechazados}
            </div>
            <div className="text-xs font-bold text-slate-400 mt-1 flex items-center space-x-1">
              <span>{kpis.rechazados_mes} este mes</span>
            </div>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* 3. BARRA DE BÚSQUEDA Y FILTROS                                        */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            cargarActas(1);
          }}
          className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3"
        >

          {/* Campo Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código o establecimiento..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0060a8] outline-none transition"
            />
          </div>

          {/* Filtro Resultado */}
          <div className="relative min-w-[170px]">
            <select
              value={filtroResultado}
              onChange={(e) => setFiltroResultado(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#0060a8] outline-none pr-8 cursor-pointer"
            >
              <option value="Todos">Resultado: Todos</option>
              <option value="Aprobado">Aprobado</option>
              <option value="Con Observaciones">Con Observaciones</option>
              <option value="Rechazado">Rechazado</option>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filtro Mes */}
          <div className="relative min-w-[180px]">
            <select
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#0060a8] outline-none pr-8 cursor-pointer"
            >
              <option value="Todos">Mes: Todos los meses</option>
              {datosActas?.meses_disponibles?.map((m) => (
                <option key={m.key} value={m.key}>
                  Mes: {m.label}
                </option>
              ))}
            </select>
            <CalendarIcon className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Botón Filtrar */}
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#1b2533] hover:bg-[#111827] text-white font-bold text-xs rounded-2xl transition shadow-2xs cursor-pointer flex items-center justify-center space-x-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtrar</span>
          </button>

        </form>
      </div>

      {/* ===================================================================== */}
      {/* 4. TABLA: HISTORIAL DE ACTAS                                          */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">

        {/* Cabecera de la Tabla */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
              Historial de Actas
            </h3>
            <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-extrabold px-3 py-0.5 rounded-full">
              {paginacion.total_registros} actas emitidas
            </span>
          </div>

          <button
            type="button"
            onClick={() => cargarActas(paginaActual)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            title="Actualizar tabla"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-[#0060a8]' : ''}`} />
          </button>
        </div>

        {/* Tabla Responsiva */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">

            {/* Encabezado */}
            <thead className="bg-slate-50/75 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Nº ACTA</th>
                <th className="px-6 py-3.5">FECHA</th>
                <th className="px-6 py-3.5">ESTABLECIMIENTO</th>
                <th className="px-6 py-3.5">TIPO INSPECCIÓN</th>
                <th className="px-6 py-3.5">RESULTADO</th>
                <th className="px-6 py-3.5 text-right">ACCIÓN</th>
              </tr>
            </thead>

            {/* Cuerpo de la Tabla */}
            <tbody className="divide-y divide-slate-100 font-medium">
              {cargando ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="w-6 h-6 border-2 border-[#0060a8] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-slate-600">Cargando actas emitidas...</span>
                    </div>
                  </td>
                </tr>
              ) : actas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileCheck className="w-8 h-8 text-slate-300" />
                      <span className="text-xs font-bold text-slate-600">No se encontraron actas con los filtros seleccionados</span>
                    </div>
                  </td>
                </tr>
              ) : (
                actas.map((acta) => {
                  return (
                    <tr
                      key={acta.id || acta.codigo_acta}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      {/* Nº Acta */}
                      <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">
                        {acta.codigo_acta}
                      </td>

                      {/* Fecha */}
                      <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                        {acta.fecha_formateada}
                      </td>

                      {/* Establecimiento */}
                      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                        {acta.establecimiento}
                      </td>

                      {/* Tipo Inspección */}
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {acta.tipo_inspeccion}
                      </td>

                      {/* Resultado Badge */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`
                          text-[10px] font-extrabold px-3 py-1 rounded-md inline-block uppercase tracking-wider
                          ${acta.resultado === 'Aprobado'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : acta.resultado === 'Con Observaciones'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }
                        `}>
                          {acta.resultado}
                        </span>
                      </td>

                      {/* Botones de Acción: Ver & PDF */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end space-x-2">

                          {/* Botón Ver */}
                          <button
                            type="button"
                            onClick={() => handleVerDetalle(acta)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition shadow-2xs cursor-pointer"
                          >
                            Ver
                          </button>

                          {/* Botón PDF */}
                          <button
                            type="button"
                            onClick={() => handleVerPdf(acta)}
                            className="px-3 py-1.5 rounded-lg border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition shadow-2xs inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-red-600" />
                            <span>PDF</span>
                          </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>

        {/* Paginador Inferior */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            Mostrando {paginacion.mostrando_desde}-{paginacion.mostrando_hasta} de {paginacion.total_registros} actas
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              disabled={paginacion.pagina_actual <= 1}
              onClick={() => cargarActas(paginacion.pagina_actual - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: paginacion.total_paginas }, (_, i) => i + 1).map((num) => {
              const isActive = num === paginacion.pagina_actual;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => cargarActas(num)}
                  className={`
                    w-8 h-8 rounded-lg font-bold text-xs transition cursor-pointer
                    ${isActive
                      ? 'bg-[#1b2533] text-white shadow-2xs'
                      : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
                    }
                  `}
                >
                  {num}
                </button>
              );
            })}

            <button
              type="button"
              disabled={paginacion.pagina_actual >= paginacion.total_paginas}
              onClick={() => cargarActas(paginacion.pagina_actual + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* ===================================================================== */}
      {/* 5. MODAL: DETALLE DEL ACTA                                            */}
      {/* ===================================================================== */}
      {modalDetalleOpen && actaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] overflow-y-auto">

            {/* Cabecera Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#005596] uppercase tracking-wider">
                  Acta Oficial de Inspección
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  {actaSeleccionada.codigo_acta}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalDetalleOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Detalle */}
            <div className="space-y-4 text-xs">

              {/* Resultado Banner */}
              <div className={`
                p-4 rounded-2xl border flex items-center justify-between
                ${actaSeleccionada.resultado === 'Aprobado'
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : actaSeleccionada.resultado === 'Con Observaciones'
                    ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                    : 'bg-rose-50/80 border-rose-200 text-rose-900'
                }
              `}>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">Resultado Técnico</p>
                  <p className="text-base font-black mt-0.5">{actaSeleccionada.resultado}</p>
                </div>
                <div className="text-2xl">
                  {actaSeleccionada.resultado === 'Aprobado' ? '✅' : actaSeleccionada.resultado === 'Con Observaciones' ? '⚠️' : '❌'}
                </div>
              </div>

              {/* Datos del Establecimiento */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Establecimiento:</span>
                  <span className="font-bold text-slate-800">{actaSeleccionada.establecimiento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Fecha de Emisión:</span>
                  <span className="font-bold text-slate-800">{actaSeleccionada.fecha_formateada}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Tipo de Inspección:</span>
                  <span className="font-bold text-slate-800">{actaSeleccionada.tipo_inspeccion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Supervisor Responsable:</span>
                  <span className="font-bold text-slate-800">{actaSeleccionada.supervisor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Dirección / Municipio:</span>
                  <span className="font-bold text-slate-800">{actaSeleccionada.direccion} ({actaSeleccionada.municipio})</span>
                </div>
              </div>

              {/* Observaciones y Hallazgos */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-600 block uppercase tracking-wider">
                  Hallazgos y Observaciones de Campo:
                </label>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-700 leading-relaxed font-medium">
                  {actaSeleccionada.observaciones}
                </div>
              </div>

            </div>

            {/* Acciones Inferiores */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalDetalleOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalDetalleOpen(false);
                  setModalPdfOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#1b2533] hover:bg-[#111827] text-white font-bold text-xs transition shadow-md inline-flex items-center space-x-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir / Ver PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. MODAL: VISOR DEL DOCUMENTO PDF FIRMADO                             */}
      {/* ===================================================================== */}
      {modalPdfOpen && actaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 space-y-4 max-h-[95vh] flex flex-col">

            {/* Cabecera del Visor */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-xs shrink-0">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-[#0060a8] border border-blue-200 px-2.5 py-0.5 rounded-full">
                      Documento Oficial Firmado
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {actaSeleccionada.codigo_acta}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight mt-0.5">
                    {actaSeleccionada.establecimiento}
                  </h3>
                </div>
              </div>

              {/* Botones de Cabecera */}
              <div className="flex items-center space-x-2">
                {actaSeleccionada.archivo_pdf_url && (
                  <a
                    href={actaSeleccionada.archivo_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200 flex items-center space-x-1.5 text-xs font-bold"
                    title="Abrir en pestaña completa"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Pestaña nueva</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setModalPdfOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenedor del Archivo Subido */}
            <div className="flex-1 min-h-[480px] max-h-[70vh] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
              {actaSeleccionada.archivo_pdf_url ? (
                actaSeleccionada.archivo_pdf_url.toLowerCase().endsWith('.png') ||
                  actaSeleccionada.archivo_pdf_url.toLowerCase().endsWith('.jpg') ||
                  actaSeleccionada.archivo_pdf_url.toLowerCase().endsWith('.jpeg') ? (
                  <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
                    <img
                      src={actaSeleccionada.archivo_pdf_url}
                      alt="Acta Oficial Escaneada"
                      className="max-h-[66vh] w-auto max-w-full object-contain rounded-xl shadow-md bg-white"
                    />
                  </div>
                ) : (
                  <iframe
                    src={actaSeleccionada.archivo_pdf_url}
                    title={`Acta Oficial ${actaSeleccionada.codigo_acta}`}
                    className="w-full h-[68vh] border-0 rounded-2xl bg-white shadow-inner"
                  />
                )
              ) : (
                <div className="text-center p-8 space-y-3 max-w-md">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-xs">
                    <FileText className="w-7 h-7 text-slate-400" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">
                    No se encontró el archivo digitalizado
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Esta acta fue registrada sin adjuntar un archivo digital.
                  </p>
                </div>
              )}
            </div>

            {/* Pie de Acciones */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="text-slate-500 font-medium">
                Fecha de inspección: <strong className="text-slate-700">{actaSeleccionada.fecha_formateada}</strong>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setModalPdfOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cerrar
                </button>

                {actaSeleccionada.archivo_pdf_url && (
                  <a
                    href={actaSeleccionada.archivo_pdf_url}
                    download={`Acta_${actaSeleccionada.codigo_acta}.pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 rounded-xl bg-[#1b2533] hover:bg-[#111827] text-white font-bold transition shadow-md inline-flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Documento</span>
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. MODAL: REGISTRAR NUEVA ACTA DE INSPECCIÓN                          */}
      {/* ===================================================================== */}
      {modalRegistrarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5 max-h-[92vh] overflow-y-auto">

            {/* Cabecera */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#005596] uppercase tracking-wider">
                  Formulario Oficial de Campo
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  Registrar Nueva Acta de Inspección
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalRegistrarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleGuardarActa} className="space-y-4 text-xs">

              {/* Selección de Inspección / Establecimiento */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">
                  Seleccionar Inspección Asignada:
                </label>
                {cargandoPendientes ? (
                  <div className="p-3 bg-slate-50 rounded-xl text-slate-400 flex items-center space-x-2">
                    <div className="w-3.5 h-3.5 border-2 border-[#0060a8] border-t-transparent rounded-full animate-spin" />
                    <span>Cargando inspecciones...</span>
                  </div>
                ) : inspeccionesPendientes.length > 0 ? (
                  <select
                    value={formInspeccionId}
                    onChange={handleSeleccionarInspeccionForm}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0060a8] outline-none cursor-pointer"
                  >
                    {inspeccionesPendientes.map((item) => (
                      <option key={item.inspeccion_id || item.id} value={item.inspeccion_id || item.id}>
                        {item.nombre || item.establecimiento} — ({item.tipo || 'Inspección'})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Nombre del establecimiento"
                    value={formEstablecimientoNombre}
                    onChange={(e) => setFormEstablecimientoNombre(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0060a8] outline-none"
                    required
                  />
                )}
              </div>

              {/* Resultado / Veredicto */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">
                  Dictamen / Resultado de Inspección:
                </label>
                <div className="grid grid-cols-2 gap-2.5">

                  <button
                    type="button"
                    onClick={() => setFormResultado('Aprobado')}
                    className={`
                      py-2.5 px-3 rounded-xl border text-xs font-black transition flex flex-col items-center justify-center space-y-1 cursor-pointer
                      ${formResultado === 'Aprobado'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }
                    `}
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Aprobado (Favorable)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormResultado('Rechazado')}
                    className={`
                      py-2.5 px-3 rounded-xl border text-xs font-black transition flex flex-col items-center justify-center space-y-1 cursor-pointer
                      ${formResultado === 'Rechazado'
                        ? 'bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-200'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }
                    `}
                  >
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Rechazado (Desfavorable)</span>
                  </button>

                </div>
              </div>

              {/* Checklist de Evaluación */}
              <div className="space-y-2 pt-1">
                <label className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">
                  Verificación de Criterios Sanitarios:
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCheckInfraestructura}
                      onChange={(e) => setFormCheckInfraestructura(e.target.checked)}
                      className="rounded text-[#0060a8] focus:ring-0 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-700">Infraestructura</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCheckEquipamiento}
                      onChange={(e) => setFormCheckEquipamiento(e.target.checked)}
                      className="rounded text-[#0060a8] focus:ring-0 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-700">Equipamiento</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCheckPersonal}
                      onChange={(e) => setFormCheckPersonal(e.target.checked)}
                      className="rounded text-[#0060a8] focus:ring-0 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-700">Personal Habilitado</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formCheckBioseguridad}
                      onChange={(e) => setFormCheckBioseguridad(e.target.checked)}
                      className="rounded text-[#0060a8] focus:ring-0 w-4 h-4"
                    />
                    <span className="font-semibold text-slate-700">Bioseguridad</span>
                  </label>
                </div>
              </div>

              {/* Observaciones y Hallazgos */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">
                  Observaciones Técnicas y Conclusiones:
                </label>
                <textarea
                  rows={3}
                  placeholder="Detalle los hallazgos técnicos, calibración de equipos, deficiencias o conformidad..."
                  value={formObservaciones}
                  onChange={(e) => setFormObservaciones(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#0060a8] outline-none"
                  required
                />
              </div>

              {/* Botones */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalRegistrarOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoActa}
                  className="px-6 py-2.5 rounded-xl bg-[#1b2533] hover:bg-[#111827] text-white font-extrabold text-xs transition shadow-md inline-flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  {guardandoActa ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Emitiendo Acta...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4 text-white" />
                      <span>Emitir y Firmar Acta</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
