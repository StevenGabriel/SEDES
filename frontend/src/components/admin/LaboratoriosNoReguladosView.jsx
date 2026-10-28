import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Edit2, 
  Trash2, 
  X, 
  Check, 
  Loader2, 
  AlertCircle, 
  Building2, 
  Navigation,
  Globe,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import RealMapPicker from '../common/RealMapPicker';
import { CATALOGO_MUNICIPIOS } from '../landing/MapSection';

export default function LaboratoriosNoReguladosView({ mostrarToast = () => {} }) {
  const [laboratorios, setLaboratorios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroMunicipio, setFiltroMunicipio] = useState('Todos');

  // Estados de Modales
  const [modalFormOpen, setModalFormOpen] = useState(false);
  const [labEditando, setLabEditando] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorForm, setErrorForm] = useState(null);

  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [labAEliminar, setLabAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Formulario de Laboratorio No Regulado
  const [form, setForm] = useState({
    nombre_comercial: '',
    municipio: 'CERCADO',
    direccion: '',
    latitud: -17.3895,
    longitud: -66.1568,
    observaciones: ''
  });

  // Lista de municipios para el selector (sin 'Todos')
  const listaMunicipiosForm = (CATALOGO_MUNICIPIOS || []).filter(m => m !== 'Todos');

  // Cargar laboratorios no regulados desde el Backend
  const cargarLaboratorios = async () => {
    setCargando(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch('http://localhost:8000/api/establecimientos/no-regulados', { headers });
      if (res.ok) {
        const data = await res.json();
        setLaboratorios(Array.isArray(data) ? data : []);
      } else {
        mostrarToast('No se pudo cargar la lista de laboratorios no regulados.', 'warning');
      }
    } catch (err) {
      console.error('Error al cargar laboratorios no regulados:', err);
      mostrarToast('Error de conexión al cargar laboratorios no regulados.', 'error');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarLaboratorios();
  }, []);

  // Abrir modal para crear
  const handleAbrirNuevo = () => {
    setLabEditando(null);
    setErrorForm(null);
    setForm({
      nombre_comercial: '',
      municipio: 'CERCADO',
      direccion: '',
      latitud: -17.3895,
      longitud: -66.1568,
      observaciones: 'Sin licencia de funcionamiento ni registro ante SEDES'
    });
    setModalFormOpen(true);
  };

  // Abrir modal para editar
  const handleAbrirEditar = (lab) => {
    setLabEditando(lab);
    setErrorForm(null);
    setForm({
      nombre_comercial: lab.nombre_comercial || '',
      municipio: lab.municipio || 'CERCADO',
      direccion: lab.direccion || '',
      latitud: lab.latitud || -17.3895,
      longitud: lab.longitud || -66.1568,
      observaciones: lab.observaciones || ''
    });
    setModalFormOpen(true);
  };

  // Capturar geolocalización actual del navegador
  const handleCapturarGPS = () => {
    if (!navigator.geolocation) {
      mostrarToast('Su navegador no soporta geolocalización GPS.', 'warning');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setForm(prev => ({ ...prev, latitud: lat, longitud: lng }));
        mostrarToast(`Ubicación GPS capturada: ${lat}, ${lng}`, 'info');
      },
      (err) => {
        console.warn('Error GPS:', err);
        mostrarToast('No se pudo obtener la señal GPS. Puede marcar el mapa manualmente.', 'warning');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Guardar (Crear o Actualizar)
  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorForm(null);

    const nombreLimpio = form.nombre_comercial.trim();
    if (!nombreLimpio || nombreLimpio.length < 2) {
      setErrorForm('Por favor ingrese el nombre del laboratorio (al menos 2 caracteres).');
      return;
    }

    setGuardando(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      };

      const payload = {
        nombre_comercial: nombreLimpio,
        municipio: form.municipio,
        direccion: form.direccion.trim() || 'Ubicación georreferenciada en mapa',
        latitud: form.latitud,
        longitud: form.longitud,
        observaciones: form.observaciones.trim() || 'Establecimiento externo no regulado'
      };

      let url = 'http://localhost:8000/api/establecimientos/no-regulados';
      let method = 'POST';

      if (labEditando) {
        url = `http://localhost:8000/api/establecimientos/no-regulados/${labEditando.id}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Ocurrió un error al guardar el laboratorio.');
      }

      mostrarToast(
        labEditando 
          ? `Laboratorio "${nombreLimpio}" actualizado exitosamente.` 
          : `Laboratorio no regulado "${nombreLimpio}" registrado con éxito.`,
        'success'
      );
      setModalFormOpen(false);
      cargarLaboratorios();
    } catch (err) {
      setErrorForm(err.message || 'Error de comunicación con el servidor.');
    } finally {
      setGuardando(false);
    }
  };

  // Confirmar eliminación
  const handleEliminar = async () => {
    if (!labAEliminar) return;
    setEliminando(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const res = await fetch(`http://localhost:8000/api/establecimientos/no-regulados/${labAEliminar.id}`, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        mostrarToast(`Laboratorio "${labAEliminar.nombre_comercial}" eliminado de los registros.`, 'success');
        setModalEliminarOpen(false);
        setLabAEliminar(null);
        cargarLaboratorios();
      } else {
        const data = await res.json();
        mostrarToast(data.detail || 'Error al eliminar el laboratorio.', 'error');
      }
    } catch (err) {
      mostrarToast('Error de conexión al eliminar el laboratorio.', 'error');
    } finally {
      setEliminando(false);
    }
  };

  // Filtrado en vivo por texto y municipio
  const labsFiltrados = laboratorios.filter((lab) => {
    const texto = `${lab.nombre_comercial || ''} ${lab.direccion || ''} ${lab.municipio || ''} ${lab.observaciones || ''}`.toLowerCase();
    const coincideTexto = texto.includes(busqueda.toLowerCase());
    const coincideMun = filtroMunicipio === 'Todos' || (lab.municipio || '').toUpperCase() === filtroMunicipio.toUpperCase();
    return coincideTexto && coincideMun;
  });

  // Métricas
  const totalNoRegulados = laboratorios.length;
  const municipiosUnicos = new Set(laboratorios.map(l => (l.municipio || '').toUpperCase())).size;
  const georreferenciados = laboratorios.filter(l => l.latitud && l.longitud).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* 1. Encabezado + Botón de Registro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Vigilancia y Fiscalización Sanitaria</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Laboratorios no regulados
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
            Mapeo y georreferenciación de establecimientos que funcionan al margen de los controles, acreditación y supervisión técnica del SEDES Cochabamba.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAbrirNuevo}
          className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition flex items-center space-x-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="w-4 h-4 text-white stroke-[2.5]" />
          <span>Registrar Laboratorio No Regulado</span>
        </button>
      </div>

      {/* 2. Tarjetas de Indicadores (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1 border-l-4 border-l-amber-500">
          <span className="text-xs font-semibold text-slate-500 block">Total No Regulados</span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{totalNoRegulados}</div>
          <span className="text-[11px] text-amber-700 block pt-1 font-semibold">Identificados en campo</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1 border-l-4 border-l-orange-500">
          <span className="text-xs font-semibold text-slate-500 block">Georreferenciados</span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{georreferenciados}</div>
          <span className="text-[11px] text-orange-600 block pt-1 font-semibold">Con coordenadas GPS</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1 border-l-4 border-l-sky-500">
          <span className="text-xs font-semibold text-slate-500 block">Municipios Afectados</span>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{municipiosUnicos}</div>
          <span className="text-[11px] text-slate-400 block pt-1 font-medium">Jurisdicciones con presencia</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1 border-l-4 border-l-rose-500">
          <span className="text-xs font-semibold text-slate-500 block">Visibilidad en Mapa</span>
          <div className="text-lg font-black text-rose-600 tracking-tight flex items-center space-x-1 pt-1">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>Distintivo ⚠️ Activo</span>
          </div>
          <span className="text-[11px] text-slate-400 block pt-1 font-medium">Identificación pública clara</span>
        </div>

      </div>

      {/* 3. Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre comercial, municipio o dirección..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative shrink-0">
            <select
              value={filtroMunicipio}
              onChange={(e) => setFiltroMunicipio(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 cursor-pointer"
            >
              <option value="Todos">Todos los Municipios</option>
              {listaMunicipiosForm.map(mun => (
                <option key={mun} value={mun}>{mun}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Tabla de Laboratorios No Regulados */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {cargando ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
            <p className="text-xs font-semibold">Cargando registros de laboratorios no regulados...</p>
          </div>
        ) : labsFiltrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-700">No se encontraron laboratorios no regulados</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {busqueda || filtroMunicipio !== 'Todos'
                  ? 'Intente cambiando los términos de búsqueda o el filtro de municipio.'
                  : 'Aún no se han registrado laboratorios no regulados en la base de datos.'}
              </p>
            </div>
            {!(busqueda || filtroMunicipio !== 'Todos') && (
              <button
                type="button"
                onClick={handleAbrirNuevo}
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar el primero</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Establecimiento</th>
                  <th className="py-3 px-4">Municipio</th>
                  <th className="py-3 px-4">Dirección / Referencia</th>
                  <th className="py-3 px-4">Coordenadas GPS</th>
                  <th className="py-3 px-4">Observación de Alerta</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {labsFiltrados.map((lab) => (
                  <tr key={lab.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Nombre y Badge */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="font-extrabold text-slate-900 leading-tight">
                          {lab.nombre_comercial}
                        </div>
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>No Regulado</span>
                        </span>
                      </div>
                    </td>

                    {/* Municipio */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-700 uppercase text-xs">
                        {lab.municipio || 'CERCADO'}
                      </span>
                    </td>

                    {/* Dirección */}
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={lab.direccion}>
                      {lab.direccion || 'Ubicación en mapa'}
                    </td>

                    {/* Coordenadas */}
                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-1 rounded-lg inline-block border border-slate-200">
                        {lab.latitud?.toFixed(5)}, {lab.longitud?.toFixed(5)}
                      </div>
                    </td>

                    {/* Observación */}
                    <td className="py-3.5 px-4 text-slate-500 text-xs max-w-xs truncate" title={lab.observaciones}>
                      {lab.observaciones || 'Sin observaciones registradas.'}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleAbrirEditar(lab)}
                          className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                          title="Editar información"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setLabAEliminar(lab);
                            setModalEliminarOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Eliminar de la lista"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* 5. MODAL: REGISTRAR / EDITAR LABORATORIO NO REGULADO                    */}
      {/* ======================================================================= */}
      {modalFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 space-y-5 my-6 max-h-[92vh] overflow-y-auto">
            
            {/* Header del Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider flex items-center space-x-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Vigilancia Sanitaria Externa</span>
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {labEditando ? 'Editar Laboratorio No Regulado' : 'Registrar Laboratorio No Regulado'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalFormOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Feedback */}
            {errorForm && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorForm}</span>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleGuardar} className="space-y-4">
              
              {/* Campo 1: Nombre del Laboratorio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Establecimiento / Laboratorio <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.nombre_comercial}
                  onChange={(e) => setForm(prev => ({ ...prev, nombre_comercial: e.target.value }))}
                  placeholder="Ej: Laboratorio Clínico Central (Sin Registro)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                />
              </div>

              {/* Grid: Municipio y Dirección */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Municipio <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.municipio}
                    onChange={(e) => setForm(prev => ({ ...prev, municipio: e.target.value }))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition cursor-pointer"
                  >
                    {listaMunicipiosForm.map(mun => (
                      <option key={mun} value={mun}>{mun}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Dirección o Referencia
                  </label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) => setForm(prev => ({ ...prev, direccion: e.target.value }))}
                    placeholder="Ej: Av. Blanco Galindo km 4, acera sur"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                  />
                </div>
              </div>

              {/* Campo: Ubicación en el Mapa Interactivo (Latitud / Longitud) */}
              <div className="space-y-2 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>Ubicación en el Mapa Interactivo (Haga clic o mueva el marcador)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleCapturarGPS}
                    className="inline-flex items-center space-x-1 text-[11px] font-bold text-sky-700 hover:text-sky-800 self-start sm:self-auto cursor-pointer"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>Capturar mi GPS actual</span>
                  </button>
                </div>

                {/* Mapa Interactivo Leaflet con RealMapPicker */}
                <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
                  <RealMapPicker
                    latitud={form.latitud}
                    longitud={form.longitud}
                    onChangeCoordenadas={(lat, lng) => {
                      setForm(prev => ({ ...prev, latitud: lat, longitud: lng }));
                    }}
                    height="260px"
                  />
                </div>

                {/* Coordenadas numéricas visibles */}
                <div className="flex items-center space-x-3 text-xs bg-slate-50 p-2 rounded-xl border border-slate-200 text-slate-600">
                  <span className="font-semibold text-slate-500">Coordenadas fijadas:</span>
                  <span className="font-mono text-slate-800 font-bold">Lat: {form.latitud}</span>
                  <span className="font-mono text-slate-800 font-bold">Lng: {form.longitud}</span>
                </div>
              </div>

              {/* Campo: Observación / Motivo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observaciones / Estado del Establecimiento
                </label>
                <textarea
                  rows={2}
                  value={form.observaciones}
                  onChange={(e) => setForm(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Ej: Notificado en inspección de oficio. No cuenta con regente bioquímico registrado ante el SEDES."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition resize-none"
                />
              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={guardando}
                  onClick={() => setModalFormOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardando}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs shadow-md transition flex items-center space-x-2 cursor-pointer disabled:opacity-60"
                >
                  {guardando ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{labEditando ? 'Actualizar Laboratorio' : 'Guardar y Mostrar en Mapa'}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ======================================================================= */}
      {/* 6. MODAL: CONFIRMAR ELIMINACIÓN                                         */}
      {/* ======================================================================= */}
      {modalEliminarOpen && labAEliminar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-slate-900">
                ¿Eliminar laboratorio no regulado?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                El establecimiento <strong className="text-slate-800">"{labAEliminar.nombre_comercial}"</strong> será removido del registro y ya no se mostrará con distintivo en el mapa público.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                disabled={eliminando}
                onClick={() => {
                  setModalEliminarOpen(false);
                  setLabAEliminar(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={eliminando}
                onClick={handleEliminar}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-60"
              >
                {eliminando ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <span>Sí, Eliminar</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
