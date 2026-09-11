import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Inbox,
  UserCheck,
  History,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Eye,
  Calendar,
  X,
  Menu,
  ChevronRight,
  Search,
  Filter,
  Check,
  XCircle,
  FileCheck,
  ShieldCheck,
  Send,
  Download,
  Building2,
  MapPin,
  Phone,
  Mail,
  User,
  LogOut,
  AlertCircle,
  RefreshCw,
  Award,
  Layers,
  Sparkles,
  ExternalLink,
  FlaskConical,
  Bell,
  CheckCircle,
  FolderOpen
} from 'lucide-react';

import logoL1 from '../assets/L1.png';
import logoL2 from '../assets/L2.png';

// Obtener iniciales de 2 a 4 letras a partir de nombres y apellidos
const getInitials = (u) => {
  if (!u) return 'U';
  let text = '';
  if (u.nombres && u.apellidos) {
    text = `${u.nombres} ${u.apellidos}`;
  } else if (u.nombreCompleto) {
    text = u.nombreCompleto;
  } else if (u.nombres) {
    text = u.nombres;
  } else if (u.nombre) {
    text = u.nombre;
  } else if (u.email) {
    return u.email.slice(0, 2).toUpperCase();
  }

  const clean = text.replace(/^(Dr\.|Dra\.|Ing\.|Lic\.|MSc\.|Ph\.D\.|Abg\.)\s+/i, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);

  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
  return words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
};

// Generar paleta de colores para el avatar
const getAvatarColor = (nombre) => {
  const colors = [
    'bg-gradient-to-tr from-[#0060a8] to-[#008fe6] text-white',
    'bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white',
    'bg-gradient-to-tr from-sky-600 to-cyan-700 text-white',
    'bg-gradient-to-tr from-teal-600 to-emerald-700 text-white',
    'bg-gradient-to-tr from-slate-700 to-slate-900 text-white',
    'bg-gradient-to-tr from-blue-700 to-indigo-900 text-white',
    'bg-gradient-to-tr from-emerald-600 to-teal-800 text-white'
  ];
  if (!nombre) return colors[0];
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function CoordinadorPage() {
  const navigate = useNavigate();
  const { seccion } = useParams();

  // Normalizar la sección activa según la URL
  const rawSeccion = seccion || 'bandeja';
  const seccionActiva = (rawSeccion === 'supervisores' || rawSeccion === 'asignar-supervisores')
    ? 'asignar-supervisores'
    : (rawSeccion === 'historial' || rawSeccion === 'historial-trazabilidad')
      ? 'historial-trazabilidad'
      : 'bandeja';

  const [usuario, setUsuario] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Lista de trámites y trámite activo seleccionado
  const [tramites, setTramites] = useState([]);
  const [tramiteSeleccionadoId, setTramiteSeleccionadoId] = useState(null);

  // Pestaña activa en el panel de detalle: 'legal' | 'campo'
  const [tabActiva, setTabActiva] = useState('legal');

  // Documento legal seleccionado para visualizar en el visor interactivo
  const [docSeleccionadoId, setDocSeleccionadoId] = useState(null);
  const [seccionFiltroDoc, setSeccionFiltroDoc] = useState('Todas');
  const [busquedaDoc, setBusquedaDoc] = useState('');

  // Filtros y búsqueda de trámites
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  // Estado para el módulo de Asignación de Supervisores
  const [supervisoresDisponibles, setSupervisoresDisponibles] = useState([]);
  const [tramitesAsignacion, setTramitesAsignacion] = useState([]);

  // Estado para el módulo de Historial y Trazabilidad
  const [filtroHistorialTexto, setFiltroHistorialTexto] = useState('');
  const [filtroHistorialEstado, setFiltroHistorialEstado] = useState('Todos');
  const [filtroHistorialSupervisor, setFiltroHistorialSupervisor] = useState('Todos');
  const [filtroHistorialDesde, setFiltroHistorialDesde] = useState('2026-09-01');
  const [filtroHistorialHasta, setFiltroHistorialHasta] = useState('2026-09-15');
  const [paginaHistorial, setPaginaHistorial] = useState(1);
  const [historialActividades, setHistorialActividades] = useState([]);

  // Modales
  const [modalReinspeccionOpen, setModalReinspeccionOpen] = useState(false);
  const [modalAprobacionOpen, setModalAprobacionOpen] = useState(false);
  const [modalObservarDocOpen, setModalObservarDocOpen] = useState(false);
  const [motivoObservacionDoc, setMotivoObservacionDoc] = useState('');
  const [modalVerDocFull, setModalVerDocFull] = useState(false);
  const [notificacionToast, setNotificacionToast] = useState(null);

  // Formularios de modales
  const [reinspeccionData, setReinspeccionData] = useState({
    supervisor: '',
    fecha: '2026-09-15',
    hora: '09:30',
    motivo: 'Verificación técnica y subsanación de observaciones in situ.',
    prioridad: 'Alta'
  });

  const [aprobacionData, setAprobacionData] = useState({
    codigoResolucion: `RES-ADM-SEDES-2026/${Math.floor(1000 + Math.random() * 9000)}`,
    vigenciaAnios: '3 años',
    observacionFinal: 'Establecimiento cumple satisfactoriamente con todos los requisitos normativos del SEDES Cochabamba.'
  });

  // Mostrar mensaje toast temporal
  const mostrarToast = (mensaje, tipo = 'success') => {
    setNotificacionToast({ mensaje, tipo });
    setTimeout(() => {
      setNotificacionToast(null);
    }, 4000);
  };

  // Estado de Notificaciones en Tiempo Real
  const [notificaciones, setNotificaciones] = useState([]);
  const [notifNoLeidas, setNotifNoLeidas] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Cargar notificaciones desde Backend
  const cargarNotificaciones = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/notificaciones/rol/Coordinador');
      if (res.ok) {
        const data = await res.json();
        setNotificaciones(data.notificaciones || []);
        setNotifNoLeidas(data.no_leidas || 0);
      }
    } catch (e) {
      console.warn('Error al cargar notificaciones:', e);
    }
  };

  // Marcar notificación individual como leída
  const handleMarcarNotifLeida = async (notifId) => {
    try {
      await fetch(`http://localhost:8000/api/notificaciones/${notifId}/leer`, { method: 'PATCH' });
      setNotificaciones(prev => prev.map(n => n.id === notifId ? { ...n, leido: true } : n));
      setNotifNoLeidas(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.warn('Error al marcar notificación leída:', e);
    }
  };

  // Marcar todas como leídas
  const handleMarcarTodasNotifsLeidas = async () => {
    if (usuario?.id) {
      try {
        await fetch(`http://localhost:8000/api/notificaciones/usuario/${usuario.id}/leer-todas`, { method: 'PATCH' });
      } catch (e) {
        console.warn('Error al marcar todas leídas:', e);
      }
    }
    setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
    setNotifNoLeidas(0);
  };

  // Cargar datos reales desde el Backend FastAPI
  const cargarDatosBackend = async () => {
    setCargando(true);
    try {
      const [resTramites, resSupervisores, resAsignacion, resHistorial] = await Promise.allSettled([
        fetch('http://localhost:8000/api/coordinador/tramites').then(r => r.ok ? r.json() : null),
        fetch('http://localhost:8000/api/coordinador/supervisores').then(r => r.ok ? r.json() : null),
        fetch('http://localhost:8000/api/coordinador/tramites-asignacion').then(r => r.ok ? r.json() : null),
        fetch('http://localhost:8000/api/coordinador/historial').then(r => r.ok ? r.json() : null),
      ]);

      if (resTramites.status === 'fulfilled' && resTramites.value?.tramites) {
        const trms = resTramites.value.tramites;
        setTramites(trms);
        if (trms.length > 0) {
          setTramiteSeleccionadoId(prev => {
            const exists = trms.find(t => t.id === prev);
            return exists ? prev : trms[0].id;
          });
          if (trms[0].documentos?.length > 0) {
            setDocSeleccionadoId(trms[0].documentos[0].id);
          }
        }
      }

      if (resSupervisores.status === 'fulfilled' && resSupervisores.value?.supervisores) {
        const sups = resSupervisores.value.supervisores;
        setSupervisoresDisponibles(sups);
        if (sups.length > 0 && !reinspeccionData.supervisor) {
          setReinspeccionData(prev => ({ ...prev, supervisor: sups[0].nombre }));
        }
      }

      if (resAsignacion.status === 'fulfilled' && resAsignacion.value?.tramites) {
        setTramitesAsignacion(resAsignacion.value.tramites);
      }

      if (resHistorial.status === 'fulfilled' && resHistorial.value?.actividades) {
        setHistorialActividades(resHistorial.value.actividades);
      }

      cargarNotificaciones();
    } catch (err) {
      console.warn('Error al cargar datos desde backend:', err);
    } finally {
      setCargando(false);
    }
  };

  // Cargar sesión de usuario y datos al montar componente
  useEffect(() => {
    const sessionUser = localStorage.getItem('usuario');
    if (sessionUser) {
      try {
        setUsuario(JSON.parse(sessionUser));
      } catch (e) {
        console.error('Error al leer sesión:', e);
      }
    }

    cargarDatosBackend();
  }, []);

  // Función para recargar historial desde backend
  const recargarHistorial = async (filtros = {}) => {
    try {
      const params = new URLSearchParams();
      if (filtros.buscar || filtroHistorialTexto) params.append('buscar', filtros.buscar || filtroHistorialTexto);
      if ((filtros.estado || filtroHistorialEstado) !== 'Todos') params.append('estado', filtros.estado || filtroHistorialEstado);
      if ((filtros.supervisor || filtroHistorialSupervisor) !== 'Todos') params.append('supervisor', filtros.supervisor || filtroHistorialSupervisor);
      if (filtros.pagina || paginaHistorial) params.append('pagina', filtros.pagina || paginaHistorial);

      const res = await fetch(`http://localhost:8000/api/coordinador/historial?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.actividades) {
          setHistorialActividades(data.actividades);
        }
      }
    } catch (e) {
      console.warn('Error al recargar historial:', e);
    }
  };

  // Menú lateral estructurado con URLs reales
  const menuItems = [
    {
      id: 'bandeja',
      path: '/coordinador/bandeja',
      label: 'Bandeja de Entrada',
      icon: Inbox,
      tituloBreadcrumb: 'Bandeja de Trámites Pendientes'
    },
    {
      id: 'asignar-supervisores',
      path: '/coordinador/asignar-supervisores',
      label: 'Asignar Supervisores',
      icon: UserCheck,
      tituloBreadcrumb: 'Asignar Supervisores'
    },
    {
      id: 'historial-trazabilidad',
      path: '/coordinador/historial-trazabilidad',
      label: 'Historial y Trazabilidad',
      icon: History,
      tituloBreadcrumb: 'Historial y Trazabilidad'
    }
  ];

  const itemActivo = menuItems.find(item => item.id === seccionActiva) || menuItems[0];

  const nombreCoordinador = usuario
    ? `${usuario.nombres} ${usuario.apellidos}`
    : 'Dra. Claudia Morales Valenzuela';

  // Trámite seleccionado actualmente
  const tramiteActual = tramites.find(t => t.id === tramiteSeleccionadoId) || (tramites.length > 0 ? tramites[0] : null);

  // Documento legal seleccionado actualmente
  const docsDisponibles = tramiteActual?.documentos || [];
  const docActual = docsDisponibles.find(d => d.id === docSeleccionadoId) || (docsDisponibles.length > 0 ? docsDisponibles[0] : null);

  // Trámites filtrados
  const tramitesFiltrados = tramites.filter(t => {
    const matchTexto = (t.id || '').toLowerCase().includes(filtroTexto.toLowerCase()) ||
      (t.establecimiento || '').toLowerCase().includes(filtroTexto.toLowerCase()) ||
      (t.propietario || '').toLowerCase().includes(filtroTexto.toLowerCase()) ||
      (t.tipo || '').toLowerCase().includes(filtroTexto.toLowerCase());
    const matchEstado = filtroEstado === 'Todos' || t.estado === filtroEstado;
    return matchTexto && matchEstado;
  });

  // Documentos filtrados por sección y búsqueda
  const docsFiltrados = docsDisponibles.filter(d => {
    const matchSec = seccionFiltroDoc === 'Todas' || (d.seccion || '').startsWith(seccionFiltroDoc);
    const matchTxt = (d.nombre || '').toLowerCase().includes(busquedaDoc.toLowerCase()) ||
      (d.seccion || '').toLowerCase().includes(busquedaDoc.toLowerCase());
    return matchSec && matchTxt;
  });

  // Manejar cambio de supervisor seleccionado en tabla
  const handleSelectSupervisorChange = (codigoTramite, nombreSupervisor) => {
    setTramitesAsignacion(prev => prev.map(t => {
      if (t.codigo === codigoTramite) {
        return { ...t, supervisorAsignado: nombreSupervisor };
      }
      return t;
    }));
  };

  // Asignar supervisor a trámite (Backend conectado a PostgreSQL)
  const handleAsignarSupervisor = async (codigoTramite) => {
    const tramite = tramitesAsignacion.find(t => t.codigo === codigoTramite);
    if (!tramite || !tramite.supervisorAsignado) {
      mostrarToast('Por favor seleccione un supervisor de la lista antes de asignar.', 'warning');
      return;
    }

    const supervisor = supervisoresDisponibles.find(s => s.nombre === tramite.supervisorAsignado);
    if (supervisor && supervisor.asignados >= supervisor.maxCapacidad) {
      mostrarToast(`El supervisor ${supervisor.nombre} ha alcanzado su capacidad máxima (5/5). Seleccione otro supervisor disponible.`, 'warning');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/coordinador/asignar-supervisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_tramite: tramite.tramite_uuid || codigoTramite,
          supervisor_nombre: tramite.supervisorAsignado,
          responsable: nombreCoordinador
        })
      });

      if (response.ok) {
        mostrarToast(`¡Trámite ${codigoTramite} (${tramite.establecimiento}) asignado con éxito a ${tramite.supervisorAsignado}!`, 'success');
        cargarDatosBackend();
        recargarHistorial();
      } else {
        const err = await response.json();
        mostrarToast(err.detail || 'Error al asignar supervisor.', 'warning');
      }
    } catch (e) {
      console.warn('Error al asignar supervisor:', e);
      mostrarToast('Error de conexión con el servidor al asignar supervisor.', 'warning');
    }
  };

  // Filtrado de actividades de auditoría
  const actividadesFiltradas = historialActividades.filter(act => {
    const matchTexto = (act.codigo || '').toLowerCase().includes(filtroHistorialTexto.toLowerCase()) ||
                       (act.establecimiento || '').toLowerCase().includes(filtroHistorialTexto.toLowerCase()) ||
                       (act.accion || '').toLowerCase().includes(filtroHistorialTexto.toLowerCase());
    const matchEstado = filtroHistorialEstado === 'Todos' || act.estado === filtroHistorialEstado;
    const matchSupervisor = filtroHistorialSupervisor === 'Todos' || (act.responsable || '').includes(filtroHistorialSupervisor.replace('Ing.', '').replace('Dra.', '').replace('Lic.', '').trim());
    return matchTexto && matchEstado && matchSupervisor;
  });

  // Manejar cambio de estado de un documento legal (Aprobado / Rechazado / Observado)
  const handleCambiarEstadoDoc = async (nuevoEstado, observacionTexto = null) => {
    if (!docActual) return;

    try {
      const response = await fetch(`http://localhost:8000/api/coordinador/documentos/${docActual.id}/validar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: nuevoEstado,
          observacion: observacionTexto,
          responsable: nombreCoordinador
        })
      });

      if (response.ok) {
        const respData = await response.json();
        const obsFinal = respData.observaciones !== undefined ? respData.observaciones : (nuevoEstado === 'Aprobado' || nuevoEstado === 'En Revisión' ? null : observacionTexto);

        setTramites(prev => prev.map(t => {
          if (t.id === tramiteActual.id) {
            const nuevosDocs = t.documentos.map(d => {
              if (d.id === docActual.id) {
                return { ...d, estado: nuevoEstado, observaciones_supervisor: obsFinal };
              }
              return d;
            });
            return { ...t, documentos: nuevosDocs };
          }
          return t;
        }));

        mostrarToast(`Documento marcado como: ${nuevoEstado}`, nuevoEstado === 'Aprobado' ? 'success' : 'warning');
        setModalObservarDocOpen(false);
        setMotivoObservacionDoc('');
        recargarHistorial();
      } else {
        const err = await response.json();
        mostrarToast(err.detail || 'Error al actualizar documento', 'warning');
      }
    } catch (e) {
      console.warn('Error al actualizar documento en backend:', e);
      mostrarToast('Error al conectar con el servidor', 'warning');
    }
  };

  // Guardar re-inspección programada
  const handleGuardarReinspeccion = async (e) => {
    e.preventDefault();
    if (!tramiteActual) return;

    try {
      const response = await fetch(`http://localhost:8000/api/coordinador/tramites/${tramiteActual.tramite_uuid || tramiteActual.id}/reinspeccion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supervisor: reinspeccionData.supervisor,
          fecha: reinspeccionData.fecha,
          hora: reinspeccionData.hora,
          prioridad: reinspeccionData.prioridad,
          motivo: reinspeccionData.motivo,
          responsable: nombreCoordinador
        })
      });

      if (response.ok) {
        mostrarToast(`Re-inspección agendada para el ${reinspeccionData.fecha} con ${reinspeccionData.supervisor}.`, 'success');
        setModalReinspeccionOpen(false);
        cargarDatosBackend();
      } else {
        const err = await response.json();
        mostrarToast(err.detail || 'Error al agendar re-inspección', 'warning');
      }
    } catch (err) {
      console.warn('Error al agendar re-inspección:', err);
      mostrarToast('Error de conexión con el backend', 'warning');
    }
  };

  // Confirmar aprobación final del trámite
  const handleConfirmarAprobacion = async (e) => {
    e.preventDefault();
    if (!tramiteActual) return;

    try {
      const response = await fetch(`http://localhost:8000/api/coordinador/tramites/${tramiteActual.tramite_uuid || tramiteActual.id}/aprobar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo_resolucion: aprobacionData.codigoResolucion,
          vigencia_anios: aprobacionData.vigenciaAnios,
          observacion_final: aprobacionData.observacionFinal,
          responsable: nombreCoordinador
        })
      });

      if (response.ok) {
        mostrarToast(`¡Trámite ${tramiteActual.id} (${tramiteActual.establecimiento}) APROBADO exitosamente! Resolución: ${aprobacionData.codigoResolucion}.`, 'success');
        setModalAprobacionOpen(false);
        cargarDatosBackend();
      } else {
        const err = await response.json();
        mostrarToast(err.detail || 'Error al aprobar trámite', 'warning');
      }
    } catch (err) {
      console.warn('Error al aprobar trámite:', err);
      mostrarToast('Error de conexión con el servidor', 'warning');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f3f6f9] flex font-sans text-slate-800 antialiased overflow-hidden">

      {/* ========================================================================= */}
      {/* 1. SIDEBAR LATERAL (Estilo institucional SEDES SI_Lab)                   */}
      {/* ========================================================================= */}

      {/* Backdrop móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-72 bg-[#0060a8] text-white
        flex flex-col justify-between shadow-2xl lg:shadow-none
        transition-transform duration-300 ease-in-out shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Contenido superior de Sidebar */}
        <div className="p-6 space-y-8">

          {/* Logo SI_Lab */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer" title="Ir a la página principal">
              <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/30 group-hover:bg-white/30 transition shadow-inner">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tight text-white flex items-center">
                SI<span className="text-cyan-200 font-extrabold">_Lab</span>
              </span>
            </Link>

            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menú de Navegación Lateral */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = seccionActiva === item.id;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 cursor-pointer text-left
                    ${isActive
                      ? 'bg-[#004b85] text-white shadow-inner font-extrabold border-l-4 border-white'
                      : 'text-blue-100/90 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-200'}`} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer del Sidebar con Escudos Institucionales */}
        <div className="p-6 space-y-4 border-t border-white/10 bg-[#00518f] mt-auto">
          <div className="flex items-center justify-center space-x-4 opacity-90">
            <img src={logoL1} alt="Escudo de Bolivia" className="h-9 object-contain" />
            <div className="h-6 w-px bg-white/20" />
            <img src={logoL2} alt="Gobernación de Cochabamba" className="h-9 object-contain" />
          </div>

          <div className="text-center text-[10px] text-blue-200/80 leading-snug">
            <p className="font-bold text-white tracking-wider">ESTADO PLURINACIONAL</p>
            <p>Ministerio de Salud y Deportes - Bolivia</p>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. CONTENEDOR PRINCIPAL Y HEADER                                          */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">

        {/* Header Superior Blanco Sticky */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-8 shrink-0 shadow-xs z-30">

          {/* Breadcrumb y botón menú móvil */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="text-xs sm:text-sm text-slate-500 font-medium flex items-center space-x-1.5 truncate">
              <span className="hover:text-slate-700 cursor-pointer">Consola del Coordinador</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-800">
                {itemActivo.tituloBreadcrumb}
              </span>
            </div>
          </div>

          {/* Perfil del Coordinador & Notificaciones */}
          <div className="flex items-center space-x-3 sm:space-x-5">

            {/* Botón Refrescar Datos */}
            <button
              onClick={cargarDatosBackend}
              className="p-2 text-slate-400 hover:text-[#0077c8] hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Refrescar solicitudes desde la Base de Datos"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-[#0077c8]' : ''}`} />
            </button>

            {/* Campana de Notificaciones Interactiva con Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className={`relative p-2 rounded-full transition cursor-pointer ${
                  notifDropdownOpen
                    ? 'bg-sky-100 text-[#0077c8]'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
                title="Notificaciones del sistema"
              >
                <Bell className="w-5 h-5" />
                {notifNoLeidas > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white animate-pulse">
                    {notifNoLeidas}
                  </span>
                )}
              </button>

              {/* Dropdown de Notificaciones */}
              {notifDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Bell className="w-4 h-4 text-sky-400" />
                        <span className="font-bold text-xs tracking-wide uppercase">Notificaciones</span>
                        {notifNoLeidas > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {notifNoLeidas} nuevas
                          </span>
                        )}
                      </div>
                      {notificaciones.length > 0 && (
                        <button
                          onClick={handleMarcarTodasNotifsLeidas}
                          className="text-[11px] text-sky-300 hover:text-white transition font-medium cursor-pointer"
                        >
                          Marcar leídas
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notificaciones.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                          No tienes notificaciones pendientes
                        </div>
                      ) : (
                        notificaciones.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleMarcarNotifLeida(notif.id)}
                            className={`p-3.5 text-xs transition cursor-pointer flex items-start space-x-3 ${
                              notif.leido ? 'bg-white opacity-70 hover:opacity-100 hover:bg-slate-50' : 'bg-sky-50/60 hover:bg-sky-50 font-medium'
                            }`}
                          >
                            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${notif.leido ? 'bg-slate-300' : 'bg-[#0077c8] ring-2 ring-sky-200'}`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-slate-800 ${notif.leido ? 'font-medium' : 'font-bold'}`}>
                                {notif.titulo}
                              </p>
                              <p className="text-slate-600 mt-0.5 leading-relaxed break-words text-[11px]">
                                {notif.mensaje}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(notif.fecha_creacion).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Perfil del Coordinador */}
            <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {nombreCoordinador}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  Coordinación SEDES Cochabamba
                </p>
              </div>

              {/* Avatar de Iniciales */}
              <div className={`w-9 h-9 rounded-full ${getAvatarColor(nombreCoordinador)} text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-slate-100 select-none tracking-tight`}>
                <span>{getInitials(usuario || { nombreCompleto: nombreCoordinador })}</span>
              </div>

              {/* Botón Salir */}
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-1 cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>

        {/* Notificación Toast */}
        {notificacionToast && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 text-xs sm:text-sm animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{notificacionToast.mensaje}</span>
            <button onClick={() => setNotificacionToast(null)} className="ml-2 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. VISTA 1: BANDEJA DE ENTRADA CON DATOS REALES DE BASE DE DATOS          */}
        {/* ========================================================================= */}
        {seccionActiva === 'bandeja' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-3 sm:p-5 gap-4">

            {/* --------------------------------------------------------------------- */}
            {/* COLUMNA IZQUIERDA: Lista de Trámites Reales                           */}
            {/* --------------------------------------------------------------------- */}
            <div className="w-full md:w-80 lg:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col shrink-0 overflow-hidden">

              {/* Header de la lista con contador real */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-black text-slate-800 text-base tracking-tight">Solicitudes y Trámites</h2>
                <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-1 rounded-full border border-sky-200">
                  {tramites.length} en sistema
                </span>
              </div>

              {/* Búsqueda rápida */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por código, establecimiento, dueño..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077c8] text-slate-700"
                  />
                </div>
              </div>

              {/* Lista scrollable de tarjetas de trámite */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {tramitesFiltrados.map((item) => {
                  const estaSeleccionado = item.id === (tramiteActual?.id);

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setTramiteSeleccionadoId(item.id);
                        if (item.documentos?.length > 0) {
                          setDocSeleccionadoId(item.documentos[0].id);
                        }
                      }}
                      className={`
                        p-3.5 rounded-xl border transition-all duration-200 cursor-pointer
                        ${estaSeleccionado
                          ? 'border-[#0077c8] bg-sky-50/40 shadow-xs ring-1 ring-[#0077c8]/30'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                        }
                      `}
                    >
                      {/* Fila superior: Código, Tipo Badge y Fecha */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-extrabold text-xs text-slate-800 tracking-tight">
                          {item.id}
                        </span>

                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${item.tipoBadgeColor}`}>
                            {item.tipo}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {item.fecha}
                          </span>
                        </div>
                      </div>

                      {/* Título del Establecimiento */}
                      <h3 className="font-bold text-sm text-slate-900 mb-1 truncate">
                        {item.establecimiento}
                      </h3>

                      {/* Propietario */}
                      <p className="text-[11px] text-slate-500 font-medium mb-2 truncate">
                        Solicitante: <span className="font-semibold text-slate-700">{item.propietario}</span>
                      </p>

                      {/* Estado Tag & Documentos conteo */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${item.estadoColor}`}>
                          {item.estado}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center">
                          <FileText className="w-3 h-3 mr-1 text-slate-400" />
                          {item.documentos?.length || 0} docs
                        </span>
                      </div>
                    </div>
                  );
                })}

                {tramitesFiltrados.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    {cargando ? 'Cargando solicitudes...' : 'No se encontraron trámites con el criterio de búsqueda.'}
                  </div>
                )}
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* COLUMNA DERECHA: Detalle del Trámite y Expediente Digital             */}
            {/* --------------------------------------------------------------------- */}
            {tramiteActual ? (
              <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">

                {/* Encabezado del Detalle */}
                <div className="p-4 sm:p-5 border-b border-slate-200 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-black text-sm text-[#0077c8] bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          {tramiteActual.id}
                        </span>
                        <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                          {tramiteActual.tipo} de {tramiteActual.establecimiento}
                        </h1>
                      </div>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Propietario: <span className="font-bold text-slate-800">{tramiteActual.propietario}</span> &bull; {tramiteActual.categoria} &bull; <span className="text-slate-600">{tramiteActual.municipio}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Dirección: {tramiteActual.direccion} | Tel: {tramiteActual.telefono || 'Sin teléfono'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-center">
                      <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${tramiteActual.estadoColor}`}>
                        {tramiteActual.estado}
                      </span>
                    </div>
                  </div>

                  {/* Pestañas de Navegación: Bitácora Legal vs Inspección de Campo */}
                  <div className="flex items-center space-x-6 mt-4 border-b border-slate-200 -mb-5">
                    <button
                      onClick={() => setTabActiva('legal')}
                      className={`
                        pb-3 font-bold text-xs sm:text-sm transition-all border-b-2 cursor-pointer flex items-center space-x-2
                        ${tabActiva === 'legal'
                          ? 'border-slate-900 text-slate-900 font-extrabold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                        }
                      `}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Documentación y Requisitos ({tramiteActual.documentos?.length || 0})</span>
                    </button>

                    <button
                      onClick={() => setTabActiva('campo')}
                      className={`
                        pb-3 font-bold text-xs sm:text-sm transition-all border-b-2 cursor-pointer flex items-center space-x-2
                        ${tabActiva === 'campo'
                          ? 'border-slate-900 text-slate-900 font-extrabold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                        }
                      `}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Fiscalización e Inspección</span>
                    </button>
                  </div>
                </div>

                {/* Contenido Scrolleable según la pestaña activa */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fafbfc]">

                  {/* =================================================================== */}
                  {/* TAB 1: DOCUMENTACIÓN Y REQUISITOS (Bitácora Documental Real)        */}
                  {/* =================================================================== */}
                  {tabActiva === 'legal' && (
                    <div className="space-y-6 max-w-5xl mx-auto">

                      {/* Filtros de Secciones Normativas y Búsqueda de Requisitos */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                        {/* Selector de Sección */}
                        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                          {['Todas', '2.1', '2.2', '2.3', '2.4', '2.5'].map((sec) => (
                            <button
                              key={sec}
                              onClick={() => setSeccionFiltroDoc(sec)}
                              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                seccionFiltroDoc === sec
                                  ? 'bg-[#19324d] text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {sec === 'Todas' ? 'Todas las Secciones' : `Sección ${sec}`}
                            </button>
                          ))}
                        </div>

                        {/* Buscador de documento */}
                        <div className="relative w-full sm:w-64">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            placeholder="Filtrar requisito..."
                            value={busquedaDoc}
                            onChange={(e) => setBusquedaDoc(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                          />
                        </div>
                      </div>

                      {/* Lista de Documentos Requeridos */}
                      <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs divide-y divide-slate-100 max-h-80 overflow-y-auto">
                        {docsFiltrados.map((doc) => {
                          const isDocActivo = doc.id === docActual?.id;

                          return (
                            <div
                              key={doc.id}
                              onClick={() => setDocSeleccionadoId(doc.id)}
                              className={`
                                p-3 sm:p-4 flex items-center justify-between gap-3 transition-colors cursor-pointer
                                ${isDocActivo ? 'bg-sky-50/60 border-l-4 border-[#0077c8]' : 'hover:bg-slate-50/60'}
                              `}
                            >
                              {/* Nombre del documento e ícono */}
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <div className={`p-2 rounded-lg ${doc.archivo_url ? 'bg-blue-100 text-[#0077c8]' : 'bg-slate-100 text-slate-400'}`}>
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                                      {doc.seccion}
                                    </span>
                                    <span className="font-bold text-xs sm:text-sm text-slate-800 truncate block">
                                      {doc.nombre}
                                    </span>
                                  </div>
                                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                                    <span>{doc.numRegistro}</span>
                                    <span>&bull;</span>
                                    <span>{doc.es_obligatorio ? 'Obligatorio' : 'Opcional'}</span>
                                    {doc.observaciones_supervisor && (doc.estado === 'Observado' || doc.estado === 'Rechazado') && (
                                      <>
                                        <span>&bull;</span>
                                        <span className="text-rose-600 font-medium truncate">Obs: {doc.observaciones_supervisor}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Badge de estado y Botón Ver PDF */}
                              <div className="flex items-center space-x-2 shrink-0">
                                <span className={`
                                  text-[11px] font-bold px-2 py-0.5 rounded-md
                                  ${doc.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : ''}
                                  ${doc.estado === 'Observado' || doc.estado === 'Rechazado' ? 'bg-rose-100 text-rose-700 border border-rose-200' : ''}
                                  ${doc.estado === 'En Revisión' || doc.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800 border border-amber-200' : ''}
                                `}>
                                  {doc.estado}
                                </span>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDocSeleccionadoId(doc.id);
                                  }}
                                  className={`
                                    flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer
                                    ${isDocActivo
                                      ? 'bg-[#0077c8] text-white border-[#0077c8] shadow-xs'
                                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                    }
                                  `}
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>{isDocActivo ? 'Viendo' : 'Ver'}</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {docsFiltrados.length === 0 && (
                          <div className="p-6 text-center text-slate-400 text-xs">
                            No se encontraron requisitos para esta sección.
                          </div>
                        )}
                      </div>

                      {/* =============================================================== */}
                      {/* VISOR INTERACTIVO DEL DOCUMENTO SELECCIONADO (PDF REAL O FICHA) */}
                      {/* =============================================================== */}
                      {docActual && (
                        <div className="bg-slate-100/90 p-4 sm:p-6 rounded-2xl border border-slate-200 space-y-4">

                          {/* Encabezado del Visor de Documento */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="bg-[#0077c8] text-white text-[10px] font-bold px-2 py-0.5 rounded font-mono">
                                  Sección {docActual.seccion}
                                </span>
                                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                                  {docActual.nombre}
                                </h3>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                Registro: <span className="font-mono font-semibold">{docActual.numRegistro}</span> &bull; Estado: <strong className="text-slate-800">{docActual.estado}</strong>
                              </p>
                            </div>

                            {/* Enlaces de apertura externa y descarga si tiene archivo PDF real */}
                            {docActual.archivo_url && (
                              <div className="flex items-center space-x-2">
                                <a
                                  href={`http://localhost:8000${docActual.archivo_url}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
                                  title="Abrir PDF en pestaña independiente"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-[#0077c8]" />
                                  <span>Abrir PDF</span>
                                </a>
                                <a
                                  href={`http://localhost:8000${docActual.archivo_url}`}
                                  download
                                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#19324d] text-white hover:bg-[#102235] transition shadow-2xs cursor-pointer"
                                  title="Descargar documento PDF original"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Descargar</span>
                                </a>
                              </div>
                            )}
                          </div>

                          {/* Contenedor del Visor */}
                          {docActual.archivo_url ? (
                            <div className="bg-white rounded-xl shadow-md border border-slate-300 overflow-hidden">
                              <div className="bg-slate-800 text-white px-4 py-2 text-xs flex items-center justify-between font-mono">
                                <span className="truncate">Visualizador de Documento PDF - {docActual.nombre}</span>
                                <span className="text-cyan-300 text-[11px]">PDF Oficial Cargado</span>
                              </div>
                              <iframe
                                src={`http://localhost:8000${docActual.archivo_url}#toolbar=1&navpanes=0`}
                                className="w-full h-[540px] border-0 bg-slate-100"
                                title={docActual.nombre}
                              />
                            </div>
                          ) : (
                            /* Ficha estructurada en caso de que no tenga URL directa */
                            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 sm:p-8 max-w-2xl mx-auto relative overflow-hidden">
                              <div className="text-center border-b border-slate-200 pb-4 mb-6">
                                <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 tracking-wider uppercase">
                                  SERVICIO DEPARTAMENTAL DE SALUD COCHABAMBA
                                </h3>
                                <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
                                  UNIDAD DE HABILITACIÓN Y ACREDITACIÓN DE LABORATORIOS
                                </p>
                                <div className="my-3 inline-block">
                                  <h2 className="font-black text-base sm:text-lg text-slate-900 tracking-tight uppercase">
                                    {docActual.nombre.toUpperCase()}
                                  </h2>
                                  <p className="text-[11px] font-bold text-[#0077c8] font-mono">
                                    Nº REGISTRO: {docActual.numRegistro}
                                  </p>
                                </div>
                              </div>

                              <div className="space-y-3 text-xs text-slate-700">
                                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                                  <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">ESTABLECIMIENTO:</span>
                                  <span className="col-span-2 font-bold text-slate-900 uppercase">{tramiteActual.establecimiento}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                                  <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">SOLICITANTE:</span>
                                  <span className="col-span-2 font-semibold text-slate-800 uppercase">{tramiteActual.propietario} ({tramiteActual.propietario_ci || 'CI'})</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                                  <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">DIRECCIÓN:</span>
                                  <span className="col-span-2 text-slate-700">{tramiteActual.direccion}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                                  <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">TIPO / NIVEL:</span>
                                  <span className="col-span-2 text-slate-700">{tramiteActual.categoria}</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Alerta de observación si existe */}
                          {docActual.observaciones_supervisor && (docActual.estado === 'Observado' || docActual.estado === 'Rechazado') && (
                            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start space-x-2">
                              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-bold">Observación Técnica Registrada:</strong>
                                <p className="mt-0.5">{docActual.observaciones_supervisor}</p>
                              </div>
                            </div>
                          )}

                          {/* Botones de Dictamen para este Documento (Aprobado / Observado / Rechazado) */}
                          <div className="flex items-center justify-center space-x-3 max-w-md mx-auto pt-2">
                            <button
                              onClick={() => handleCambiarEstadoDoc('Aprobado')}
                              className={`
                                flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer
                                ${docActual.estado === 'Aprobado'
                                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                }
                              `}
                            >
                              <Check className="w-4 h-4" />
                              <span>Aprobar Documento</span>
                            </button>

                            <button
                              onClick={() => {
                                setMotivoObservacionDoc(docActual.observaciones_supervisor || '');
                                setModalObservarDocOpen(true);
                              }}
                              className={`
                                flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer
                                ${docActual.estado === 'Observado' || docActual.estado === 'Rechazado'
                                  ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                                  : 'bg-rose-100 hover:bg-rose-200 text-rose-700'
                                }
                              `}
                            >
                              <X className="w-4 h-4" />
                              <span>Observar / Rechazar</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Botones Globales de Acción del Trámite */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <button
                          onClick={() => setModalReinspeccionOpen(true)}
                          className="w-full sm:flex-1 py-3 px-5 rounded-xl font-extrabold text-sm text-white bg-[#0077c8] hover:bg-[#0064a7] shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Agendar Inspección de Campo</span>
                        </button>

                        <button
                          onClick={() => setModalAprobacionOpen(true)}
                          className="w-full sm:flex-1 py-3 px-5 rounded-xl font-extrabold text-sm text-emerald-900 bg-[#c7f9cc] hover:bg-[#a7f3d0] border border-emerald-300 shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-emerald-700" />
                          <span>Aprobar Trámite y Emitir Resolución</span>
                        </button>
                      </div>

                    </div>
                  )}

                  {/* =================================================================== */}
                  {/* TAB 2: INSPECCIÓN Y FISCALIZACIÓN TÉCNICA (Bitácora 2)              */}
                  {/* =================================================================== */}
                  {tabActiva === 'campo' && (
                    <div className="space-y-6 max-w-4xl mx-auto">

                      {/* Banner de Veredicto del Supervisor */}
                      <div className="bg-sky-50 border-l-4 border-[#0077c8] p-4 rounded-r-xl shadow-xs">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                              <ShieldCheck className="w-5 h-5 text-[#0077c8]" />
                              <span>Veredicto Técnico: {tramiteActual.veredictoSupervisor}</span>
                            </h3>
                            <p className="text-xs text-slate-600 mt-1 font-medium">
                              Supervisor Asignado: <span className="font-bold text-slate-800">{tramiteActual.supervisorAsignado}</span> &bull; Inspección: <span className="font-bold">{tramiteActual.fechaInspeccion}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Datos del Establecimiento a Fiscalizar */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                          Ficha Técnica de Fiscalización
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Establecimiento</span>
                            <span className="font-bold text-slate-800 text-sm">{tramiteActual.establecimiento}</span>
                            <span className="text-slate-500 block mt-0.5">{tramiteActual.categoria}</span>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Ubicación y Jurisdicción</span>
                            <span className="font-bold text-slate-800">{tramiteActual.municipio}</span>
                            <span className="text-slate-500 block mt-0.5">{tramiteActual.direccion}</span>
                          </div>
                        </div>
                      </div>

                      {/* Bitácora y Notas del Supervisor */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                        <h3 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-sky-600" />
                          <span>Notas de Auditoría Técnica</span>
                        </h3>

                        <ul className="space-y-2 text-xs text-slate-700">
                          {tramiteActual.observacionesSupervisor?.map((obs, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-[#0077c8] font-bold">&bull;</span>
                              <span className="leading-relaxed">{obs}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Botones de acción desde la bitácora de campo */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                        <button
                          onClick={() => setModalReinspeccionOpen(true)}
                          className="w-full sm:flex-1 py-3 px-5 rounded-xl font-extrabold text-sm text-white bg-[#0077c8] hover:bg-[#0064a7] shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Agendar Inspección de Campo</span>
                        </button>

                        <button
                          onClick={() => setModalAprobacionOpen(true)}
                          className="w-full sm:flex-1 py-3 px-5 rounded-xl font-extrabold text-sm text-emerald-900 bg-[#c7f9cc] hover:bg-[#a7f3d0] border border-emerald-300 shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <Award className="w-4 h-4 text-emerald-700" />
                          <span>Aprobar Trámite</span>
                        </button>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            ) : (
              /* Estado vacío cuando no hay trámites */
              <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#0077c8] mb-4">
                  <Inbox className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-base text-slate-900">No hay trámites registrados</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Actualmente no existen solicitudes pendientes en la base de datos de PostgreSQL. Las nuevas solicitudes enviadas por los propietarios aparecerán aquí automáticamente.
                </p>
                <button
                  onClick={cargarDatosBackend}
                  className="mt-4 px-4 py-2 bg-[#0077c8] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#0062a8] transition"
                >
                  Refrescar Bandeja
                </button>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. VISTA 2: ASIGNAR SUPERVISORES (SUPERVISORES Y TRÁMITES REALES)          */}
        {/* ========================================================================= */}
        {(seccionActiva === 'asignar-supervisores' || seccionActiva === 'supervisores') && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f3f6f9]">
            <div className="max-w-6xl mx-auto space-y-6">

              {/* Encabezado Principal */}
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Asignar Supervisores
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Asigne trámites y solicitudes a los supervisores oficiales del SEDES Cochabamba.
                </p>
              </div>

              {/* Sección 1: Supervisores Disponibles Reales */}
              <div className="space-y-3">
                <h2 className="text-sm font-extrabold text-slate-800 tracking-tight">
                  Supervisores Institucionales ({supervisoresDisponibles.length})
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {supervisoresDisponibles.map((sup) => {
                    const isFull = sup.asignados >= sup.maxCapacidad;
                    const porcentaje = Math.min(100, Math.round((sup.asignados / sup.maxCapacidad) * 100));

                    return (
                      <div
                        key={sup.id}
                        className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        {/* Fila superior: Badge de Iniciales y Badge de Estado */}
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center ${
                            isFull 
                              ? 'bg-rose-50 text-rose-600 border border-rose-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {sup.iniciales}
                          </div>

                          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                            isFull
                              ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          }`}>
                            {isFull ? 'Capacidad Llena' : 'Disponible'}
                          </span>
                        </div>

                        {/* Nombre y Especialidad */}
                        <div className="mb-4">
                          <h3 className="font-extrabold text-sm text-slate-800 tracking-tight leading-tight">
                            {sup.nombre}
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                            {sup.email}
                          </p>
                        </div>

                        {/* Carga de Trabajo y Barra de Progreso */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-slate-400 text-[11px] font-medium">Carga Operativa</span>
                            <span className={`text-[11px] font-bold ${isFull ? 'text-rose-600' : 'text-slate-700'}`}>
                              {sup.asignados}/{sup.maxCapacidad} trámites
                            </span>
                          </div>

                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                isFull ? 'bg-rose-500' : 'bg-[#0077c8]'
                              }`}
                              style={{ width: `${porcentaje}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sección 2: Trámites para Asignación */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">

                {/* Cabecera de la tabla */}
                <div className="flex items-center justify-between">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight">
                    Trámites y Solicitudes en Sistema
                  </h2>
                  <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold px-3 py-1 rounded-full">
                    {tramitesAsignacion.length} registrados
                  </span>
                </div>

                {/* Tabla de Trámites */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 font-extrabold">CÓDIGO</th>
                        <th className="pb-3 font-extrabold">ESTABLECIMIENTO</th>
                        <th className="pb-3 font-extrabold">TIPO</th>
                        <th className="pb-3 font-extrabold">FECHA INGRESO</th>
                        <th className="pb-3 font-extrabold min-w-[220px]">SUPERVISOR ASIGNADO</th>
                        <th className="pb-3 font-extrabold text-center">ACCIÓN</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {tramitesAsignacion.map((item) => (
                        <tr key={item.codigo} className="hover:bg-slate-50/60 transition-colors">

                          {/* Código */}
                          <td className="py-4 font-extrabold text-[#0077c8] tracking-tight">
                            {item.codigo}
                          </td>

                          {/* Establecimiento */}
                          <td className="py-4 font-bold text-slate-800">
                            <div>{item.establecimiento}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{item.municipio}</span>
                          </td>

                          {/* Tipo de Trámite */}
                          <td className="py-4">
                            <span className="inline-block bg-sky-100 text-sky-700 font-semibold px-2.5 py-0.5 rounded-md text-[11px]">
                              {item.tipo}
                            </span>
                          </td>

                          {/* Fecha Ingreso */}
                          <td className="py-4 text-slate-500 font-medium">
                            {item.fechaIngreso}
                          </td>

                          {/* Supervisor Asignado (Selector) */}
                          <td className="py-4 pr-3">
                            <div className="relative">
                              <select
                                value={item.supervisorAsignado}
                                onChange={(e) => handleSelectSupervisorChange(item.codigo, e.target.value)}
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8] cursor-pointer appearance-none pr-8"
                              >
                                <option value="">Seleccionar supervisor...</option>
                                {supervisoresDisponibles.map((s) => (
                                  <option
                                    key={s.id}
                                    value={s.nombre}
                                    disabled={s.asignados >= s.maxCapacidad && item.supervisorAsignado !== s.nombre}
                                  >
                                    {s.nombre} ({s.asignados}/{s.maxCapacidad}{s.asignados >= s.maxCapacidad ? ' - Lleno' : ''})
                                  </option>
                                ))}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                                <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                              </div>
                            </div>
                          </td>

                          {/* Botón Acción */}
                          <td className="py-4 text-center">
                            <button
                              onClick={() => handleAsignarSupervisor(item.codigo)}
                              className="bg-[#19324d] hover:bg-[#102235] text-white font-bold text-xs px-5 py-1.5 rounded-lg transition-all shadow-xs cursor-pointer active:scale-95"
                            >
                              Asignar
                            </button>
                          </td>

                        </tr>
                      ))}

                      {tramitesAsignacion.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                            No hay trámites pendientes de asignación.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. VISTA 3: HISTORIAL Y TRAZABILIDAD (AUDITORÍA REAL EN POSTGRESQL)       */}
        {/* ========================================================================= */}
        {(seccionActiva === 'historial-trazabilidad' || seccionActiva === 'historial') && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#f3f6f9]">
            <div className="max-w-6xl mx-auto space-y-6">

              {/* Encabezado Principal */}
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  Historial y Trazabilidad
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                  Bitácora de auditoría y movimientos normativos en tiempo real.
                </p>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">

                  {/* Buscar */}
                  <div className="col-span-1 sm:col-span-2 lg:col-span-4">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      BUSCAR
                    </label>
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Buscar por código, establecimiento, acción..."
                        value={filtroHistorialTexto}
                        onChange={(e) => setFiltroHistorialTexto(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077c8] text-slate-700 placeholder-slate-400"
                      />
                    </div>
                  </div>

                  {/* Estado */}
                  <div className="col-span-1 sm:col-span-1 lg:col-span-2">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      ESTADO
                    </label>
                    <div className="relative">
                      <select
                        value={filtroHistorialEstado}
                        onChange={(e) => setFiltroHistorialEstado(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077c8] text-slate-700 cursor-pointer appearance-none pr-8 font-medium"
                      >
                        <option value="Todos">Todos los Estados</option>
                        <option value="Aprobado">Aprobado</option>
                        <option value="Asignado">Asignado</option>
                        <option value="Observado">Observado</option>
                        <option value="Rechazado">Rechazado</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                        <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* Supervisor */}
                  <div className="col-span-1 sm:col-span-1 lg:col-span-3">
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                      RESPONSABLE / SUPERVISOR
                    </label>
                    <div className="relative">
                      <select
                        value={filtroHistorialSupervisor}
                        onChange={(e) => setFiltroHistorialSupervisor(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077c8] text-slate-700 cursor-pointer appearance-none pr-8 font-medium"
                      >
                        <option value="Todos">Todos los Funcionarios</option>
                        {supervisoresDisponibles.map((s) => (
                          <option key={s.id} value={s.nombre}>{s.nombre}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                        <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                      </div>
                    </div>
                  </div>

                  {/* Botón Filtrar */}
                  <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                    <button
                      type="button"
                      onClick={() => {
                        recargarHistorial();
                        mostrarToast('Filtros de auditoría aplicados correctamente.', 'info');
                      }}
                      className="w-full py-2 px-4 bg-[#19324d] hover:bg-[#102235] text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer text-center active:scale-95 flex items-center justify-center h-[38px]"
                    >
                      Aplicar Filtros
                    </button>
                  </div>

                </div>
              </div>

              {/* Registro de Actividad (Tabla) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">

                {/* Cabecera */}
                <h2 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight">
                  Registro de Actividades y Auditoría ({actividadesFiltradas.length})
                </h2>

                {/* Tabla de Actividades */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="pb-3 font-extrabold">FECHA / HORA</th>
                        <th className="pb-3 font-extrabold">CÓDIGO</th>
                        <th className="pb-3 font-extrabold">ESTABLECIMIENTO</th>
                        <th className="pb-3 font-extrabold">ACCIÓN REALIZADA</th>
                        <th className="pb-3 font-extrabold">RESPONSABLE</th>
                        <th className="pb-3 font-extrabold text-center">ESTADO</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {actividadesFiltradas.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">

                          {/* Fecha / Hora */}
                          <td className="py-4 text-slate-500 font-medium whitespace-nowrap">
                            {item.fechaHora}
                          </td>

                          {/* Código */}
                          <td className="py-4 font-extrabold text-[#0077c8] tracking-tight whitespace-nowrap">
                            {item.codigo}
                          </td>

                          {/* Establecimiento */}
                          <td className="py-4 font-bold text-slate-800 whitespace-nowrap">
                            {item.establecimiento}
                          </td>

                          {/* Acción Realizada */}
                          <td className="py-4 text-slate-600 font-medium max-w-xs truncate" title={item.accion}>
                            {item.accion}
                          </td>

                          {/* Responsable */}
                          <td className="py-4 text-slate-700 font-medium whitespace-nowrap">
                            {item.responsable}
                          </td>

                          {/* Estado */}
                          <td className="py-4 text-center whitespace-nowrap">
                            <span className={`inline-block text-[11px] font-bold px-3 py-0.5 rounded-full border ${item.estadoBadge}`}>
                              {item.estado}
                            </span>
                          </td>

                        </tr>
                      ))}

                      {actividadesFiltradas.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                            No se encontraron registros de auditoría en la base de datos.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 6. MODALES Y DIÁLOGOS DE ACCIÓN                                          */}
      {/* ========================================================================= */}

      {/* MODAL: Observar Documento con Motivo */}
      {modalObservarDocOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-rose-600 to-red-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-200" />
                <h3 className="font-extrabold text-base">Observar / Rechazar Documento</h3>
              </div>
              <button onClick={() => setModalObservarDocOpen(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Documento Seleccionado</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-800">
                  {docActual?.nombre} ({docActual?.numRegistro})
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo de la Observación o Rechazo</label>
                <textarea
                  rows={4}
                  value={motivoObservacionDoc}
                  onChange={(e) => setMotivoObservacionDoc(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  placeholder="Especifique con claridad el motivo por el cual se observa o rechaza este documento..."
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalObservarDocOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleCambiarEstadoDoc('Observado', motivoObservacionDoc)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-extrabold shadow-md transition flex items-center space-x-2 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Guardar Observación</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Agendar Re-Inspección */}
      {modalReinspeccionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-[#0077c8] to-[#0094e6] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-5 h-5 text-cyan-200" />
                <h3 className="font-extrabold text-base">Agendar Inspección de Campo</h3>
              </div>
              <button onClick={() => setModalReinspeccionOpen(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarReinspeccion} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Establecimiento y Trámite</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-800">
                  {tramiteActual?.id} - {tramiteActual?.establecimiento} ({tramiteActual?.propietario})
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Supervisor Inspector</label>
                  <select
                    value={reinspeccionData.supervisor}
                    onChange={(e) => setReinspeccionData({ ...reinspeccionData, supervisor: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-[#0077c8]"
                  >
                    {supervisoresDisponibles.map((s) => (
                      <option key={s.id} value={s.nombre}>
                        {s.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prioridad</label>
                  <select
                    value={reinspeccionData.prioridad}
                    onChange={(e) => setReinspeccionData({ ...reinspeccionData, priority: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-[#0077c8]"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Normal">Normal</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha Programada</label>
                  <input
                    type="date"
                    value={reinspeccionData.fecha}
                    onChange={(e) => setReinspeccionData({ ...reinspeccionData, fecha: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#0077c8]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Hora Estimada</label>
                  <input
                    type="time"
                    value={reinspeccionData.hora}
                    onChange={(e) => setReinspeccionData({ ...reinspeccionData, hora: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#0077c8]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Instrucciones / Motivo de Inspección</label>
                <textarea
                  rows={3}
                  value={reinspeccionData.motivo}
                  onChange={(e) => setReinspeccionData({ ...reinspeccionData, motivo: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#0077c8]"
                  placeholder="Especifique los puntos a verificar durante la inspección técnica..."
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalReinspeccionOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0077c8] hover:bg-[#0062a8] text-white rounded-xl font-extrabold shadow-md transition flex items-center space-x-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Confirmar y Notificar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Aprobar Trámite Final */}
      {modalAprobacionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Award className="w-5 h-5 text-emerald-200" />
                <h3 className="font-extrabold text-base">Aprobación y Emisión de Resolución</h3>
              </div>
              <button onClick={() => setModalAprobacionOpen(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmarAprobacion} className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900">
                <p className="font-bold text-xs mb-1">¡Dictamen Favorable de Coordinación!</p>
                <p className="text-[11px] text-emerald-800">
                  Al confirmar, se emitirá la Resolución Administrativa y se habilitará oficialmente el establecimiento <strong>{tramiteActual?.establecimiento}</strong> en la red de salud de Cochabamba.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Código de Resolución Administrativa</label>
                <input
                  type="text"
                  value={aprobacionData.codigoResolucion}
                  onChange={(e) => setAprobacionData({ ...aprobacionData, codigoResolucion: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl font-mono font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Periodo de Vigencia</label>
                  <select
                    value={aprobacionData.vigenciaAnios}
                    onChange={(e) => setAprobacionData({ ...aprobacionData, vigenciaAnios: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="3 años">3 años (Laboratorios Nivel 1 y 2)</option>
                    <option value="5 años">5 años (Clínicas y Policlínicos)</option>
                    <option value="1 año">1 año (Apertura Provisoria)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Firma Digital Coordinadora</label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 truncate">
                    {nombreCoordinador}
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dictamen Técnico y Observaciones Finales</label>
                <textarea
                  rows={3}
                  value={aprobacionData.observacionFinal}
                  onChange={(e) => setAprobacionData({ ...aprobacionData, observacionFinal: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAprobacionOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold shadow-md transition flex items-center space-x-2 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Emitir Aprobación Oficial</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
