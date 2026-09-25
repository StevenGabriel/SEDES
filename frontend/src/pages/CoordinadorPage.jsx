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
  ChevronLeft,
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
  FolderOpen,
  CreditCard,
  Clock3,
  Globe,
  Building,
  Store,
  BadgeCheck,
  UploadCloud,
  CheckSquare
} from 'lucide-react';

import logoL1 from '../assets/L1.png';
import logoL2 from '../assets/L2.png';
import heroBg from '../assets/hero_bg.jpg';
import RealMapPicker from '../components/common/RealMapPicker';
import InformeTecnicoView from '../components/coordinador/InformeTecnicoView';

// 8 Especialidades Oficiales del SEDES (según normativa y formulario de apertura)
const ESPECIALIDADES_OFICIALES = [
  'Clínico General',
  'Clínico Microbiológico',
  'Anatomía Patológica y Citología',
  'Hematología',
  'Inmunología',
  'Endocrinología',
  'Genética',
  'Toxicología'
];

const ESPECIALIDAD_INFO = {
  'Clínico General': {
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
    iconColor: 'text-teal-600',
    descripcion: 'Área de análisis clínicos básicos, química sanguínea y orina'
  },
  'Clínico Microbiológico': {
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    iconColor: 'text-indigo-600',
    descripcion: 'Cultivos, antibiogramas, bacteriología y micología'
  },
  'Anatomía Patológica y Citología': {
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    iconColor: 'text-purple-600',
    descripcion: 'Biopsias, citología cervicovaginal (Papanicolaou) e histopatología'
  },
  'Hematología': {
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
    iconColor: 'text-rose-600',
    descripcion: 'Hemogramas completos, coagulación, frotis sanguíneo y médula ósea'
  },
  'Inmunología': {
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    dot: 'bg-sky-500',
    iconColor: 'text-sky-600',
    descripcion: 'Serología, pruebas infecciosas, ELISA, autoanticuerpos y alergias'
  },
  'Endocrinología': {
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    iconColor: 'text-amber-600',
    descripcion: 'Hormonas tiroideas, fertilidad, marcadores tumorales y metabolismo'
  },
  'Genética': {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    iconColor: 'text-emerald-600',
    descripcion: 'Genética molecular, cariotipos, PCR y estudios cromosómicos'
  },
  'Toxicología': {
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    iconColor: 'text-orange-600',
    descripcion: 'Detección de fármacos, drogas de abuso, metales pesados y metabolitos'
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

const parseServiciosList = (serviciosRaw) => {
  if (!serviciosRaw) return ['Clínico General'];
  if (Array.isArray(serviciosRaw)) return serviciosRaw;
  try {
    const parsed = JSON.parse(serviciosRaw);
    if (Array.isArray(parsed)) return parsed;
  } catch (e) {}
  return String(serviciosRaw).split(',').map(s => normalizarEspecialidad(s.trim())).filter(Boolean);
};

const parseEncargadosAreas = (responsablesRaw, fallbackRegente, fallbackCI) => {
  if (!responsablesRaw) {
    return {
      'Clínico General': { nombre: fallbackRegente || 'Dra. María Elena Vargas Rojas', ci: fallbackCI || '5489632 CBBA' }
    };
  }
  if (typeof responsablesRaw === 'object' && !Array.isArray(responsablesRaw)) {
    return responsablesRaw;
  }
  try {
    const parsed = JSON.parse(responsablesRaw);
    if (typeof parsed === 'object' && parsed !== null) return parsed;
  } catch (e) {}
  return {
    'Clínico General': { nombre: fallbackRegente || 'Dra. María Elena Vargas Rojas', ci: fallbackCI || '5489632 CBBA' }
  };
};

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
      : (rawSeccion === 'informe-tecnico' || rawSeccion === 'informe')
        ? 'informe-tecnico'
        : 'bandeja';

  const [usuario, setUsuario] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Lista de trámites y trámite activo seleccionado
  const [tramites, setTramites] = useState([]);
  const [tramiteSeleccionadoId, setTramiteSeleccionadoId] = useState(null);

  // Pestaña activa en el panel de detalle: 'datos' | 'legal' | 'campo'
  const [tabActiva, setTabActiva] = useState('datos');

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
  const [modalObservarDatosOpen, setModalObservarDatosOpen] = useState(false);
  const [motivoObservacionDatos, setMotivoObservacionDatos] = useState('');
  const [procesandoValidacionDatos, setProcesandoValidacionDatos] = useState(false);
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

  // Cargar datos reales desde el Backend FastAPI (con soporte para refresco silencioso)
  const cargarDatosBackend = async (silencioso = false) => {
    if (!silencioso) setCargando(true);
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
          setDocSeleccionadoId(prevDoc => {
            if (prevDoc) {
              const currentTramite = trms.find(t => t.id === tramiteSeleccionadoId) || trms[0];
              const exists = currentTramite?.documentos?.some(d => d.id === prevDoc);
              if (exists) return prevDoc;
            }
            return trms[0]?.documentos?.[0]?.id || null;
          });
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
      if (!silencioso) setCargando(false);
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

  // Polling silencioso en segundo plano y al recuperar foco de ventana
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        cargarDatosBackend(true);
      }
    }, 20000);

    const onFocus = () => {
      cargarDatosBackend(true);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
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
    },
    {
      id: 'informe-tecnico',
      path: '/coordinador/informe-tecnico',
      label: 'Informe Técnico',
      icon: FileText,
      tituloBreadcrumb: 'Informe Técnico'
    }
  ];

  const itemActivo = menuItems.find(item => item.id === seccionActiva) || menuItems[0];

  const nombreCoordinador = usuario
    ? `${usuario.nombres} ${usuario.apellidos}`
    : 'Dra. Claudia Morales Valenzuela';

  // Trámite seleccionado actualmente
  const tramiteActual = tramites.find(t => t.id === tramiteSeleccionadoId) || (tramites.length > 0 ? tramites[0] : null);

  // Lógica y reglas de habilitación para Aprobación del Trámite
  const docsList = tramiteActual?.documentos || [];
  const totalDocs = docsList.length;
  const docsAprobadosCount = docsList.filter(d => (d.estado || '').toLowerCase() === 'aprobado').length;
  const todosDocsAprobados = totalDocs > 0 && docsAprobadosCount === totalDocs;

  const tieneSupervisorAsignado = Boolean(
    tramiteActual?.supervisor_id ||
    (tramiteActual?.supervisorAsignado &&
     tramiteActual.supervisorAsignado !== 'Sin Asignar' &&
     tramiteActual.supervisorAsignado !== 'PENDIENTE DE ASIGNACIÓN')
  );

  const veredictoNorm = (tramiteActual?.veredicto_supervisor_raw || tramiteActual?.veredictoSupervisor || '').toLowerCase();
  const esActaFavorable = veredictoNorm.includes('favorable') || veredictoNorm.includes('aprobado');
  const esActaRechazada = veredictoNorm.includes('desfavorable') || veredictoNorm.includes('rechazado');
  const esActaConObservaciones = veredictoNorm.includes('observaci');
  const esActaCompletada = Boolean(
    (tramiteActual?.estadoInspeccion === 'Completada' || tramiteActual?.acta_pdf_url) &&
    (esActaFavorable || esActaRechazada || esActaConObservaciones)
  );

  const estadoTramiteNorm = (tramiteActual?.estado || '').toLowerCase();
  const yaEnInformeTecnico = estadoTramiteNorm.includes('informe');
  const yaDerivadoLegal = estadoTramiteNorm.includes('legal') || estadoTramiteNorm.includes('derivado');
  const yaAprobadoFinal = estadoTramiteNorm === 'aprobado';
  const estaEnEtapaPosterior = yaEnInformeTecnico || yaDerivadoLegal || yaAprobadoFinal;

  const datosEstablecimientoAprobados = Boolean(
    tramiteActual?.datos_establecimiento_aprobado !== undefined
      ? tramiteActual.datos_establecimiento_aprobado
      : (tramiteActual?.datos_establecimiento_estado === 'Aprobado' || estaEnEtapaPosterior)
  );

  const puedeAprobarTramite = Boolean(
    !estaEnEtapaPosterior && (
      tramiteActual?.puede_aprobar !== undefined
        ? tramiteActual.puede_aprobar
        : (datosEstablecimientoAprobados && todosDocsAprobados && tieneSupervisorAsignado && esActaFavorable)
    )
  );

  // Motivo descriptivo del bloqueo si no se puede aprobar
  let motivoBloqueoAprobacion = '';
  if (yaAprobadoFinal) {
    motivoBloqueoAprobacion = 'Trámite APROBADO: Cuenta con Resolución Administrativa emitida.';
  } else if (yaDerivadoLegal) {
    motivoBloqueoAprobacion = 'Trámite derivado a Asesoría Legal para la emisión de Resolución.';
  } else if (yaEnInformeTecnico) {
    motivoBloqueoAprobacion = 'Trámite en etapa de Informe Técnico. Ingrese a "Informe Técnico" en el menú lateral para redactar o imprimir el informe.';
  } else if (!datosEstablecimientoAprobados) {
    motivoBloqueoAprobacion = 'Falta validar los Datos del Establecimiento. Ingrese a la primera pestaña para verificar y aprobarlos.';
  } else if (!todosDocsAprobados) {
    motivoBloqueoAprobacion = `Faltan validar documentos (${docsAprobadosCount}/${totalDocs} aprobados). Debe aprobar todos los requisitos previamente.`;
  } else if (!tieneSupervisorAsignado) {
    motivoBloqueoAprobacion = 'Debe asignar un supervisor para la fiscalización técnica en campo.';
  } else if (esActaRechazada) {
    motivoBloqueoAprobacion = 'Inspección técnica rechazada (Desfavorable). El trámite no puede aprobarse.';
  } else if (esActaConObservaciones) {
    motivoBloqueoAprobacion = 'Inspección con observaciones. Requiere subsanación o re-inspección.';
  } else if (!esActaFavorable) {
    motivoBloqueoAprobacion = 'Pendiente: El supervisor aún no ha emitido el acta oficial con veredicto Favorable.';
  }

  // Manejar validación (Aprobación u Observación) de los Datos del Establecimiento
  const handleValidarDatosEstablecimiento = async (nuevoEstado, motivo = null) => {
    if (!tramiteActual) return;
    setProcesandoValidacionDatos(true);
    try {
      const response = await fetch(`http://localhost:8000/api/coordinador/tramites/${tramiteActual.tramite_uuid || tramiteActual.id}/validar-datos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estado: nuevoEstado,
          observacion: motivo,
          responsable: nombreCoordinador
        })
      });

      if (response.ok) {
        mostrarToast(
          nuevoEstado === 'Aprobado'
            ? '¡Datos del establecimiento validados y aprobados exitosamente!'
            : 'Datos del establecimiento observados correctamente.',
          nuevoEstado === 'Aprobado' ? 'success' : 'warning'
        );

        // Actualizar reactivamente en el estado local
        setTramites(prev => prev.map(t => {
          if (t.id === tramiteActual.id || t.tramite_uuid === tramiteActual.tramite_uuid) {
            return {
              ...t,
              datos_establecimiento_estado: nuevoEstado,
              datos_establecimiento_aprobado: nuevoEstado === 'Aprobado',
              datos_establecimiento_observacion: nuevoEstado === 'Observado' ? motivo : null,
              datos_establecimiento_validador: nuevoEstado === 'Aprobado' ? `APROBADO por ${nombreCoordinador}` : null
            };
          }
          return t;
        }));

        setModalObservarDatosOpen(false);
        setMotivoObservacionDatos('');
        recargarHistorial();

        // Si se aprueba, pasar automáticamente a la pestaña de requisitos documentales
        if (nuevoEstado === 'Aprobado') {
          setTimeout(() => {
            setTabActiva('legal');
          }, 500);
        }
      } else {
        const err = await response.json();
        mostrarToast(err.detail || 'Error al validar datos del establecimiento', 'warning');
      }
    } catch (e) {
      console.warn('Error al validar datos:', e);
      mostrarToast('Error de conexión al validar datos.', 'warning');
    } finally {
      setProcesandoValidacionDatos(false);
    }
  };

  // Notificar al propietario para reingreso de requisitos en caso de inspección rechazada
  const [notificandoReingreso, setNotificandoReingreso] = useState(false);
  const handleNotificarReingreso = async () => {
    if (!tramiteActual) return;
    setNotificandoReingreso(true);
    try {
      const response = await fetch(`http://localhost:8000/api/coordinador/tramites/${tramiteActual.tramite_uuid || tramiteActual.id}/notificar-reingreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          motivo: `La inspección técnica in-situ emitió veredicto Desfavorable/Rechazado. Observaciones: ${tramiteActual.observacionesSupervisor?.[0] || 'Incumplimiento de requisitos técnicos y normativos.'}`,
          responsable: nombreCoordinador
        })
      });
      if (response.ok) {
        mostrarToast('Notificación enviada al propietario. El trámite ha sido reiniciado para la recarga de requisitos.', 'success');
        cargarDatosBackend();
        recargarHistorial();
      } else {
        const err = await response.json();
        mostrarToast(err.detail || 'Error al notificar reingreso.', 'warning');
      }
    } catch (e) {
      console.warn('Error al enviar notificación:', e);
      mostrarToast('Error de conexión al notificar reingreso.', 'warning');
    } finally {
      setNotificandoReingreso(false);
    }
  };

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

  // Índice del documento actual para navegación secuencial (Anterior / Siguiente)
  const currentDocIndex = docsFiltrados.findIndex(d => d.id === docActual?.id);
  const tieneDocAnterior = currentDocIndex > 0;
  const tieneDocSiguiente = currentDocIndex !== -1 && currentDocIndex < docsFiltrados.length - 1;

  const handleDocAnterior = () => {
    if (tieneDocAnterior) {
      setDocSeleccionadoId(docsFiltrados[currentDocIndex - 1].id);
    }
  };

  const handleDocSiguiente = () => {
    if (tieneDocSiguiente) {
      setDocSeleccionadoId(docsFiltrados[currentDocIndex + 1].id);
    }
  };

  // Manejar cambio de supervisor seleccionado en tabla
  const handleSelectSupervisorChange = (codigoTramite, nombreSupervisor) => {
    setTramitesAsignacion(prev => prev.map(t => {
      if (t.codigo === codigoTramite) {
        return { ...t, supervisorAsignado: nombreSupervisor };
      }
      return t;
    }));
  };

  // Asignar supervisor a trámite (Backend conectado a PostgreSQL con actualización reactiva inmediata)
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

        // 1. Actualización reactiva inmediata en la tabla de asignación
        setTramitesAsignacion(prev => prev.map(t => {
          if (t.codigo === codigoTramite || t.tramite_uuid === tramite.tramite_uuid) {
            return {
              ...t,
              yaAsignado: true,
              supervisorAsignado: tramite.supervisorAsignado
            };
          }
          return t;
        }));

        // 2. Actualización reactiva inmediata en la lista general de trámites
        setTramites(prev => prev.map(t => {
          if (t.id === (tramite.tramite_uuid || codigoTramite) || t.tramite_uuid === (tramite.tramite_uuid || codigoTramite) || t.codigo === codigoTramite) {
            return {
              ...t,
              supervisorAsignado: tramite.supervisorAsignado,
              supervisor_id: supervisor?.id || 'asignado'
            };
          }
          return t;
        }));

        // 3. Incrementar de inmediato el contador de carga del supervisor
        if (supervisor) {
          setSupervisoresDisponibles(prev => prev.map(s => {
            if (s.id === supervisor.id || s.nombre === supervisor.nombre) {
              return { ...s, asignados: Math.min(s.maxCapacidad, s.asignados + 1) };
            }
            return s;
          }));
        }

        // 4. Sincronizar en segundo plano con la base de datos
        await cargarDatosBackend(true);
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

  // Filtrado de actividades de auditoría (excluyendo aprobaciones individuales de documentos)
  const actividadesFiltradas = historialActividades.filter(act => {
    const accionLower = (act.accion || '').toLowerCase();
    // Excluir aprobaciones individuales de documentos como "Documento aprobado: ..."
    if (accionLower.includes('documento aprobado') || accionLower.startsWith('documento aprobado')) {
      return false;
    }
    const matchTexto = (act.codigo || '').toLowerCase().includes(filtroHistorialTexto.toLowerCase()) ||
                       (act.establecimiento || '').toLowerCase().includes(filtroHistorialTexto.toLowerCase()) ||
                       accionLower.includes(filtroHistorialTexto.toLowerCase());
    const matchEstado = filtroHistorialEstado === 'Todos' || act.estado === filtroHistorialEstado;
    const matchSupervisor = filtroHistorialSupervisor === 'Todos' || (act.responsable || '').includes(filtroHistorialSupervisor.replace('Ing.', '').replace('Dra.', '').replace('Lic.', '').trim());
    return matchTexto && matchEstado && matchSupervisor;
  });

  // Paginación para Historial y Trazabilidad (10 por defecto, configurable a 25 y 50)
  const [itemsPorPaginaHistorial, setItemsPorPaginaHistorial] = useState(10);
  const totalRegistrosHistorial = actividadesFiltradas.length;
  const totalPaginasHistorial = Math.max(1, Math.ceil(totalRegistrosHistorial / itemsPorPaginaHistorial));
  const inicioHistorial = (paginaHistorial - 1) * itemsPorPaginaHistorial;
  const finHistorial = inicioHistorial + itemsPorPaginaHistorial;
  const actividadesPaginadas = actividadesFiltradas.slice(inicioHistorial, finHistorial);

  // Reiniciar a la primera página al cambiar filtros o tamaño de página
  useEffect(() => {
    setPaginaHistorial(1);
  }, [filtroHistorialTexto, filtroHistorialEstado, filtroHistorialSupervisor, itemsPorPaginaHistorial]);

  const getNumeroPaginasHistorial = () => {
    const paginas = [];
    if (totalPaginasHistorial <= 7) {
      for (let i = 1; i <= totalPaginasHistorial; i++) {
        paginas.push(i);
      }
    } else {
      if (paginaHistorial <= 4) {
        for (let i = 1; i <= 5; i++) paginas.push(i);
        paginas.push('...');
        paginas.push(totalPaginasHistorial);
      } else if (paginaHistorial >= totalPaginasHistorial - 3) {
        paginas.push(1);
        paginas.push('...');
        for (let i = totalPaginasHistorial - 4; i <= totalPaginasHistorial; i++) {
          paginas.push(i);
        }
      } else {
        paginas.push(1);
        paginas.push('...');
        paginas.push(paginaHistorial - 1);
        paginas.push(paginaHistorial);
        paginas.push(paginaHistorial + 1);
        paginas.push('...');
        paginas.push(totalPaginasHistorial);
      }
    }
    return paginas;
  };

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

        // Avance automático al siguiente documento al aprobar
        if (nuevoEstado === 'Aprobado') {
          const indexActual = docsFiltrados.findIndex(d => d.id === docActual.id);
          if (indexActual !== -1 && indexActual < docsFiltrados.length - 1) {
            const siguienteDoc = docsFiltrados[indexActual + 1];
            setDocSeleccionadoId(siguienteDoc.id);
          } else {
            // Si era el último de la lista filtrada, buscar si hay algún otro documento pendiente en el expediente
            const otrosPendientes = docsDisponibles.filter(d => d.id !== docActual.id && d.estado !== 'Aprobado');
            if (otrosPendientes.length > 0) {
              setDocSeleccionadoId(otrosPendientes[0].id);
            } else {
              mostrarToast('🎉 ¡Excelente! Ha revisado y aprobado todos los documentos del expediente.', 'success');
            }
          }
        }
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

  // Derivar trámite a Informe Técnico tras validación completa
  const [pasandoAInforme, setPasandoAInforme] = useState(false);
  const handlePasarAInformeTecnico = async (tramite) => {
    if (!tramite) return;
    setPasandoAInforme(true);
    try {
      const targetId = tramite.tramite_uuid || tramite.id;
      const response = await fetch(`http://localhost:8000/api/coordinador/tramites/${targetId}/pasar-a-informe-tecnico`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responsable: nombreCoordinador })
      });

      if (response.ok) {
        mostrarToast(`¡Trámite de '${tramite.establecimiento}' derivado a Informe Técnico!`, 'success');
        await cargarDatosBackend();
      } else {
        const err = await response.json();
        console.warn('Respuesta backend pasar-a-informe-tecnico:', err);
      }
    } catch (err) {
      console.warn('Error al pasar a informe técnico:', err);
    } finally {
      setPasandoAInforme(false);
      setTramiteSeleccionadoId(tramite.id);
      navigate('/coordinador/informe-tecnico');
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
            <div className="flex items-center space-x-3 select-none">
              <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/30 shadow-inner">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tight text-white flex items-center">
                SI<span className="text-cyan-200 font-extrabold">_Lab</span>
              </span>
            </div>

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
                  <div className="absolute right-0 mt-2 w-96 sm:w-[460px] md:w-[500px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/5">
                    {/* Cabecera */}
                    <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700/60 shadow-xs">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                          <Bell className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-extrabold text-xs tracking-wider uppercase">Notificaciones</span>
                            {notifNoLeidas > 0 && (
                              <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                                {notifNoLeidas} {notifNoLeidas === 1 ? 'nueva' : 'nuevas'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 font-normal">Avisos y actualizaciones técnicas en tiempo real</p>
                        </div>
                      </div>
                      {notificaciones.length > 0 && (
                        <button
                          onClick={handleMarcarTodasNotifsLeidas}
                          className="text-[11px] text-sky-300 hover:text-white hover:bg-white/10 px-2.5 py-1.5 rounded-lg transition font-semibold flex items-center space-x-1 cursor-pointer"
                          title="Marcar todas como leídas"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Marcar leídas</span>
                        </button>
                      )}
                    </div>

                    {/* Lista de Notificaciones */}
                    <div className="max-h-[390px] sm:max-h-[440px] overflow-y-auto divide-y divide-slate-100">
                      {notificaciones.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                            <CheckCircle className="w-6 h-6 text-slate-400" />
                          </div>
                          <p className="font-bold text-sm text-slate-700">Sin notificaciones pendientes</p>
                          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">No hay nuevos eventos que requieran su atención en este momento.</p>
                        </div>
                      ) : (
                        notificaciones.map((notif) => {
                          const esObs = notif.titulo?.toLowerCase().includes('observad') || notif.titulo?.toLowerCase().includes('rechaz');
                          const esAprob = notif.titulo?.toLowerCase().includes('aprobad');
                          const esSubsan = notif.titulo?.toLowerCase().includes('subsanad') || notif.titulo?.toLowerCase().includes('subir') || notif.titulo?.toLowerCase().includes('documento');
                          const esAsign = notif.titulo?.toLowerCase().includes('asignad') || notif.titulo?.toLowerCase().includes('inspecci');

                          const fechaMostrar = notif.tiempoRelativo || notif.fecha || (notif.fecha_creacion ? new Date(notif.fecha_creacion).toLocaleDateString('es-BO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Reciente');
                          const fechaTooltip = notif.fecha || (notif.fecha_creacion ? new Date(notif.fecha_creacion).toLocaleString('es-BO') : '');

                          return (
                            <div
                              key={notif.id}
                              onClick={() => handleMarcarNotifLeida(notif.id)}
                              className={`p-4 transition cursor-pointer flex items-start gap-3.5 ${
                                notif.leido 
                                  ? 'bg-white hover:bg-slate-50 opacity-80 hover:opacity-100' 
                                  : 'bg-sky-50/70 hover:bg-sky-50/90 border-l-4 border-l-[#0077c8]'
                              }`}
                            >
                              {/* Icono contextual */}
                              <div className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center ${
                                esObs 
                                  ? 'bg-rose-100 text-rose-600 border border-rose-200'
                                  : esAprob
                                    ? 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                                    : esSubsan
                                      ? 'bg-blue-100 text-blue-600 border border-blue-200'
                                      : esAsign
                                        ? 'bg-indigo-100 text-indigo-600 border border-indigo-200'
                                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}>
                                {esObs && <AlertTriangle className="w-4 h-4" />}
                                {esAprob && <CheckCircle2 className="w-4 h-4" />}
                                {esSubsan && <FileText className="w-4 h-4" />}
                                {esAsign && <Calendar className="w-4 h-4" />}
                                {!esObs && !esAprob && !esSubsan && !esAsign && <Bell className="w-4 h-4" />}
                              </div>

                              {/* Contenido Completo */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <p className={`text-xs sm:text-sm text-slate-900 leading-snug break-words ${notif.leido ? 'font-semibold' : 'font-extrabold'}`}>
                                    {notif.titulo}
                                  </p>
                                  {!notif.leido && (
                                    <span className="w-2 h-2 rounded-full bg-[#0077c8] ring-2 ring-sky-200 shrink-0 mt-1" />
                                  )}
                                </div>

                                <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words font-normal">
                                  {notif.mensaje}
                                </p>

                                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100/80">
                                  <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-400" title={fechaTooltip}>
                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                    <span>{fechaMostrar}</span>
                                  </div>

                                  {!notif.leido && (
                                    <span className="text-[10px] font-bold text-[#0077c8] hover:underline">
                                      Marcar como leída
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Pie del Dropdown */}
                    <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500 font-medium flex items-center justify-between">
                      <span>Total: <strong>{notificaciones.length}</strong> {notificaciones.length === 1 ? 'notificación' : 'notificaciones'}</span>
                      <button
                        onClick={cargarNotificaciones}
                        className="text-[#0077c8] hover:underline font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Actualizar</span>
                      </button>
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

                  {/* Pestañas de Navegación: Datos del Establecimiento vs Documentación Legal vs Inspección de Campo */}
                  <div className="flex items-center space-x-4 sm:space-x-6 mt-4 border-b border-slate-200 -mb-5 overflow-x-auto">
                    <button
                      onClick={() => setTabActiva('datos')}
                      className={`
                        pb-3 font-bold text-xs sm:text-sm transition-all border-b-2 cursor-pointer flex items-center space-x-2 shrink-0
                        ${tabActiva === 'datos'
                          ? 'border-slate-900 text-slate-900 font-extrabold'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                        }
                      `}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Datos del Establecimiento</span>
                    </button>

                    <button
                      onClick={() => setTabActiva('legal')}
                      className={`
                        pb-3 font-bold text-xs sm:text-sm transition-all border-b-2 cursor-pointer flex items-center space-x-2 shrink-0
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
                        pb-3 font-bold text-xs sm:text-sm transition-all border-b-2 cursor-pointer flex items-center space-x-2 shrink-0
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
                  {/* TAB 0: DATOS DEL ESTABLECIMIENTO Y PROPIETARIO (Formulario Inicial) */}
                  {/* =================================================================== */}
                  {tabActiva === 'datos' && (() => {
                    const serviciosActivos = parseServiciosList(tramiteActual.servicios);
                    const encargadosMap = parseEncargadosAreas(
                      tramiteActual.responsables_areas,
                      tramiteActual.responsable_laboratorio || tramiteActual.regente,
                      tramiteActual.ci_responsable || tramiteActual.regente_ci
                    );

                    return (
                      <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200">

                        {/* ------------------------------------------------------------- */}
                        {/* 0. TARJETA: DATOS DEL SOLICITANTE / PROPIETARIO               */}
                        {/* ------------------------------------------------------------- */}
                        <div className="bg-gradient-to-r from-slate-900 via-[#122438] to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md border border-slate-700/60">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start sm:items-center space-x-3.5">
                              <div className={`w-12 h-12 rounded-2xl ${getAvatarColor(tramiteActual.propietario)} text-white flex items-center justify-center font-black text-sm shadow-inner ring-2 ring-white/20 shrink-0`}>
                                {getInitials({ nombreCompleto: tramiteActual.propietario })}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-[10px] font-extrabold tracking-wider uppercase bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-400/30">
                                    Propietario / Solicitante Legal
                                  </span>
                                  <span className="text-slate-400 text-xs">&bull;</span>
                                  <span className="text-xs text-slate-300 font-mono font-semibold">
                                    {tramiteActual.id}
                                  </span>
                                </div>
                                <h2 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
                                  {tramiteActual.propietario}
                                </h2>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 self-start sm:self-auto">
                              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-xl flex items-center space-x-1.5">
                                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Titular Registrado</span>
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 mt-4 border-t border-white/10 text-xs">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Cédula de Identidad / NIT</span>
                              <span className="font-extrabold text-white text-sm block mt-0.5 font-mono">
                                {tramiteActual.propietario_ci || 'No especificado'}
                              </span>
                            </div>

                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Correo Electrónico</span>
                              <span className="font-semibold text-slate-200 text-xs block mt-0.5 truncate" title={tramiteActual.propietario_email || tramiteActual.email}>
                                {tramiteActual.propietario_email || tramiteActual.email || 'contacto@sedescbba.gob.bo'}
                              </span>
                            </div>

                            <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Teléfono / Celular de Contacto</span>
                              <span className="font-semibold text-slate-200 text-xs block mt-0.5">
                                {tramiteActual.propietario_telefono || tramiteActual.telefono || 'Sin teléfono'}
                              </span>
                            </div>
                          </div>
                        </div>



                        {/* ------------------------------------------------------------- */}
                        {/* 1. CARD: DATOS DEL ESTABLECIMIENTO (Como Imagen 1)            */}
                        {/* ------------------------------------------------------------- */}
                        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6">
                          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
                                <Building2 className="w-5 h-5 text-[#0077c8]" />
                                <span>Datos del Establecimiento</span>
                              </h3>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Información institucional y comercial registrada ante el SEDES.
                              </p>
                            </div>
                            <span className="text-[11px] font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full self-start sm:self-auto border border-slate-200">
                              Código CUE: <strong className="text-slate-900">{tramiteActual.codigo_cue || 'Nuevo'}</strong>
                            </span>
                          </div>

                          {/* Grid de Campos Principales (Estilo formulario verificado) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                            
                            {/* Municipio */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1">
                                <span>MUNICIPIO</span>
                                <span className="text-rose-500">*</span>
                              </label>
                              <div className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 font-bold flex items-center justify-between shadow-2xs">
                                <span>{tramiteActual.municipio || 'Cochabamba (Cercado)'}</span>
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                              </div>
                            </div>

                            {/* Tipo de Laboratorio */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1">
                                <span>TIPO DE LABORATORIO</span>
                                <span className="text-rose-500">*</span>
                              </label>
                              <div className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 font-bold flex items-center justify-between shadow-2xs">
                                <span>{tramiteActual.tipo_establecimiento || tramiteActual.tipo || 'Privado'}</span>
                                <Store className="w-4 h-4 text-slate-400 shrink-0" />
                              </div>
                            </div>

                            {/* Nombre Comercial */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1">
                                <span>NOMBRE COMERCIAL</span>
                                <span className="text-rose-500">*</span>
                              </label>
                              <div className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 font-black uppercase tracking-tight shadow-2xs truncate">
                                {tramiteActual.nombre_comercial || tramiteActual.establecimiento}
                              </div>
                            </div>

                            {/* Nivel de Complejidad */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1">
                                <span>NIVEL DE COMPLEJIDAD</span>
                                <span className="text-rose-500">*</span>
                              </label>
                              <div className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 font-bold flex items-center justify-between shadow-2xs">
                                <span>
                                  {tramiteActual.nivel?.includes('Nivel') ? tramiteActual.nivel : `Nivel ${tramiteActual.nivel || '1'}`}
                                </span>
                                <span className="text-[11px] font-extrabold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md">
                                  {tramiteActual.categoria}
                                </span>
                              </div>
                            </div>

                            {/* Dirección del Establecimiento */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1">
                                <span>DIRECCIÓN DEL ESTABLECIMIENTO</span>
                                <span className="text-rose-500">*</span>
                              </label>
                              <div className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 font-medium shadow-2xs">
                                {tramiteActual.direccion || 'Av. Heroínas #456, entre San Martín y 25 de Mayo'}
                              </div>
                            </div>

                            {/* Teléfono / Celular de Contacto */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1">
                                <span>TELÉFONO / CELULAR DE CONTACTO</span>
                                <span className="text-rose-500">*</span>
                              </label>
                              <div className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 font-medium flex items-center justify-between shadow-2xs">
                                <span>{tramiteActual.telefono || '+591 4 4258900 / 71458920'}</span>
                                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                              </div>
                            </div>

                            {/* Responsable Técnico / Bioquímico Regente */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1">
                                <span>RESPONSABLE TÉCNICO / BIOQUÍMICO REGENTE</span>
                                <span className="text-rose-500">*</span>
                              </label>
                              <div className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 font-bold uppercase shadow-2xs flex items-center space-x-2">
                                <User className="w-4 h-4 text-slate-400 shrink-0" />
                                <span>{tramiteActual.responsable_laboratorio || tramiteActual.regente || 'DRA. MARIA ELENA VARGAS ROJAS'}</span>
                              </div>
                            </div>

                            {/* C.I. del Responsable Técnico / Regente */}
                            <div className="space-y-1.5">
                              <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1">
                                <span>C.I. DEL RESPONSABLE TÉCNICO / REGENTE</span>
                                <span className="text-rose-500">*</span>
                              </label>
                              <div className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 font-bold font-mono shadow-2xs flex items-center space-x-2">
                                <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                                <span>{tramiteActual.ci_responsable || tramiteActual.regente_ci || '5489632 CBBA'}</span>
                              </div>
                            </div>

                          </div>
                        </div>

                        {/* ------------------------------------------------------------- */}
                        {/* 2. CARD: HORARIO, CONTACTO, DESCRIPCIÓN Y FOTO (Como Imagen 2) */}
                        {/* ------------------------------------------------------------- */}
                        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-6">
                          
                          {/* Horario de Atención al Público */}
                          <div className="space-y-2.5">
                            <label className="text-xs font-bold text-slate-700 uppercase block">
                              HORARIO DE ATENCIÓN AL PÚBLICO
                            </label>

                            {/* Píldoras de modalidad de horario */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                              {[
                                { id: 'estandar', titulo: 'Estándar SEDES', detalle: 'Lun-Vie 7-19h, Sáb 8-13h' },
                                { id: '247', titulo: '24 Horas (24/7)', detalle: 'Atención Continua' },
                                { id: 'corrido', titulo: 'Lun-Sáb Corrido', detalle: '07:00 a 19:00' },
                                { id: 'personalizado', titulo: 'Personalizado', detalle: 'Configurar por días' }
                              ].map((hOpt) => {
                                const horarioStr = (tramiteActual.horario || '').toLowerCase();
                                const isSelected = (hOpt.id === '247' && horarioStr.includes('24')) ||
                                                   (hOpt.id === 'corrido' && horarioStr.includes('corrido')) ||
                                                   (hOpt.id === 'personalizado' && (horarioStr.includes('person') || horarioStr.includes('domingo'))) ||
                                                   (hOpt.id === 'estandar' && !horarioStr.includes('24') && !horarioStr.includes('corrido') && !horarioStr.includes('person'));

                                return (
                                  <div
                                    key={hOpt.id}
                                    className={`p-3 rounded-xl border text-left transition-all ${
                                      isSelected
                                        ? 'bg-sky-50/70 border-[#0077c8] text-slate-900 ring-1 ring-[#0077c8]/40 shadow-xs'
                                        : 'bg-slate-50 border-slate-200 text-slate-500'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <span className="text-xs font-bold text-slate-800">{hOpt.titulo}</span>
                                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#0077c8]" />}
                                    </div>
                                    <span className="text-[10px] text-slate-500 block mt-0.5">{hOpt.detalle}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Horario Oficial Generado */}
                            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                              <div className="flex items-center space-x-2 text-slate-700">
                                <Clock className="w-4 h-4 text-[#0077c8] shrink-0" />
                                <span>Horario Oficial Registrado: <strong className="text-slate-900 font-bold">{tramiteActual.horario || 'Lun-Vie 7:00 - 19:00, Sáb 8:00 - 13:00'}</strong></span>
                              </div>
                              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2.5 py-0.5 rounded-md self-start sm:self-auto flex items-center space-x-1">
                                <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                                <span>Formato Válido</span>
                              </span>
                            </div>
                          </div>

                          {/* Correo Electrónico Institucional */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">
                              CORREO ELECTRÓNICO INSTITUCIONAL
                            </label>
                            <div className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 font-medium flex items-center space-x-2 shadow-2xs">
                              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>{tramiteActual.email_contacto || tramiteActual.email || 'contacto@laboratoriobiomedical.com'}</span>
                            </div>
                          </div>

                          {/* Descripción / Presentación del Laboratorio (Ficha Pública) */}
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-700 uppercase">
                              DESCRIPCIÓN / PRESENTACIÓN DEL LABORATORIO (FICHA PÚBLICA)
                            </label>
                            <div className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm rounded-xl p-3.5 font-normal leading-relaxed shadow-2xs whitespace-pre-wrap">
                              {tramiteActual.descripcion || 'Establecimiento especializado en análisis clínicos de rutina y alta complejidad, equipado con tecnología automatizada de última generación, garantizando resultados confiables, oportunos y con estricto apego a normas de bioseguridad del SEDES Cochabamba.'}
                            </div>
                          </div>

                          {/* Fotografía del Establecimiento */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 uppercase flex items-center justify-between">
                              <span>FOTOGRAFÍA DEL ESTABLECIMIENTO (IMAGEN DE LA FICHA PÚBLICA)</span>
                              <span className="text-[11px] font-normal text-slate-400">JPG, PNG o WEBP</span>
                            </label>

                            <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                              <div className="w-36 h-24 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative shadow-xs">
                                <img
                                  src={tramiteActual.imagen_url || heroBg}
                                  alt="Fotografía del Establecimiento"
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              <div className="flex-1 space-y-1 text-center sm:text-left">
                                <p className="text-xs text-slate-700 font-medium">
                                  Esta imagen se muestra en la cabecera de la ficha pública de su laboratorio para los pacientes, usuarios y verificación del SEDES.
                                </p>
                                <div className="pt-1 flex items-center justify-center sm:justify-start space-x-2">
                                  <span className="text-[11px] font-bold text-sky-800 bg-sky-100 px-2.5 py-1 rounded-lg border border-sky-200">
                                    ✓ Fotografía Oficial Cargada
                                  </span>
                                  {tramiteActual.imagen_url && (
                                    <a
                                      href={tramiteActual.imagen_url.startsWith('http') ? tramiteActual.imagen_url : `http://localhost:8000${tramiteActual.imagen_url}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-[11px] font-bold text-[#0077c8] hover:underline flex items-center space-x-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      <span>Ver Imagen Completa</span>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* ------------------------------------------------------------- */}
                        {/* 3. CARD: SERVICIOS, ESPECIALIDADES Y ENCARGADOS (Imagen 3)   */}
                        {/* ------------------------------------------------------------- */}
                        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                            <div>
                              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                Servicios y Especialidades Autorizados
                              </h3>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Especialidades habilitadas para este laboratorio con sus respectivos profesionales a cargo.
                              </p>
                            </div>
                            <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0077c8] bg-sky-50 px-3 py-1 rounded-full border border-sky-200 shrink-0 self-start sm:self-auto">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#0077c8]" />
                              <span>{serviciosActivos.length} seleccionada(s)</span>
                            </span>
                          </div>

                          {/* Píldoras de las 8 Especialidades */}
                          <div className="flex flex-wrap gap-2 pt-1">
                            {ESPECIALIDADES_OFICIALES.map((esp) => {
                              const isSelected = serviciosActivos.includes(esp);

                              return (
                                <div
                                  key={esp}
                                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 select-none ${
                                    isSelected
                                      ? 'bg-[#005596] text-white shadow-xs ring-2 ring-[#005596]/30'
                                      : 'bg-slate-100/70 text-slate-400 border border-slate-200 opacity-60'
                                  }`}
                                >
                                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-300'}`} />
                                  <span>{esp}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                                </div>
                              );
                            })}
                          </div>

                          {/* Bloque: Encargados Técnicos por Área Seleccionada */}
                          <div className="space-y-3 pt-3 border-t border-slate-100">
                            <div className="flex items-center justify-between pb-1.5">
                              <div className="flex items-center space-x-2">
                                <UserCheck className="w-4 h-4 text-[#0077c8]" />
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                                  ENCARGADOS TÉCNICOS POR ÁREA SELECCIONADA (OBLIGATORIO)
                                </h4>
                              </div>
                              <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                                * Campos obligatorios para habilitación
                              </span>
                            </div>

                            <div className="space-y-3">
                              {serviciosActivos.map((esp) => {
                                const estilo = ESPECIALIDAD_INFO[esp] || {
                                  badge: 'bg-blue-50 text-blue-700 border-blue-200',
                                  dot: 'bg-blue-500',
                                  iconColor: 'text-blue-600',
                                  descripcion: 'Área de análisis clínicos autorizada'
                                };
                                const enc = encargadosMap[esp] || {
                                  nombre: tramiteActual.responsable_laboratorio || tramiteActual.regente || 'DRA. MARIA ELENA VARGAS ROJAS',
                                  ci: tramiteActual.ci_responsable || tramiteActual.regente_ci || '5489632 CBBA'
                                };

                                return (
                                  <div
                                    key={esp}
                                    className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3"
                                  >
                                    {/* Cabecera del Área */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                      <div className="flex items-center space-x-2.5">
                                        <span className={`w-2.5 h-2.5 rounded-full ${estilo.dot}`} />
                                        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg border ${estilo.badge}`}>
                                          ÁREA: {esp.toUpperCase()}
                                        </span>
                                      </div>
                                      <span className="text-[11px] text-slate-500 font-medium">
                                        {estilo.descripcion}
                                      </span>
                                    </div>

                                    {/* Grid con Nombre y CI del Encargado */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                                      
                                      <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center space-x-1">
                                          <span>NOMBRE COMPLETO DEL RESPONSABLE</span>
                                          <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 flex items-center space-x-2 shadow-2xs truncate">
                                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                          <span className="truncate">{enc.nombre}</span>
                                        </div>
                                      </div>

                                      <div className="space-y-1">
                                        <label className="text-[11px] font-bold text-slate-600 uppercase flex items-center space-x-1">
                                          <span>CÉDULA DE IDENTIDAD (C.I.)</span>
                                          <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold font-mono text-slate-800 flex items-center space-x-2 shadow-2xs">
                                          <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                          <span>{enc.ci}</span>
                                        </div>
                                      </div>

                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>

                        {/* ------------------------------------------------------------- */}
                        {/* 4. CARD: UBICACIÓN DEL ESTABLECIMIENTO (MAPA GPS - Imagen 4)  */}
                        {/* ------------------------------------------------------------- */}
                        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4">
                          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center space-x-2">
                                <MapPin className="w-5 h-5 text-rose-600" />
                                <span>Ubicación del Establecimiento</span>
                              </h3>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Coordenadas georreferenciadas y ubicación exacta del laboratorio en el mapa departamental.
                              </p>
                            </div>
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
                              Cochabamba - {tramiteActual.municipio || 'Cercado'}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="rounded-xl overflow-hidden border border-slate-300 shadow-sm">
                              <RealMapPicker
                                latitud={tramiteActual.latitud || -17.389500}
                                longitud={tramiteActual.longitud || -66.156800}
                                height="380px"
                                readOnly={true}
                              />
                            </div>

                            {/* Barra de Coordenadas Latitud y Longitud */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-500">Latitud:</span>
                                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                  {typeof tramiteActual.latitud === 'number' ? tramiteActual.latitud.toFixed(6) : (tramiteActual.latitud || '-17.389500')}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-slate-500">Longitud:</span>
                                <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                                  {typeof tramiteActual.longitud === 'number' ? tramiteActual.longitud.toFixed(6) : (tramiteActual.longitud || '-66.156800')}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ------------------------------------------------------------- */}
                        {/* 5. EVALUACIÓN Y DICTAMEN DE DATOS (UBICADO AL FINAL DE TODO)   */}
                        {/* ------------------------------------------------------------- */}
                        <div className="bg-white rounded-2xl p-6 sm:p-7 border-2 border-slate-200/90 shadow-md space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200">
                                  Paso 1 de 3
                                </span>
                                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                  Dictamen de Datos del Establecimiento
                                </h3>
                              </div>
                              <p className="text-xs text-slate-500 font-medium">
                                Si todos los datos registrados son correctos, apruebe para continuar. Si existen inconsistencias, presione Rechazar / Observar e indique el motivo.
                              </p>
                            </div>

                            {/* Badge de Estado Actual */}
                            <div>
                              {tramiteActual.datos_establecimiento_estado === 'Aprobado' ? (
                                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                                  Estado: Aprobado
                                </span>
                              ) : tramiteActual.datos_establecimiento_estado === 'Observado' ? (
                                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                                  <AlertTriangle className="w-4 h-4 mr-1.5 text-rose-600" />
                                  Estado: Rechazado / Observado
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
                                  <Clock className="w-4 h-4 mr-1.5 text-amber-600" />
                                  Estado: Pendiente de Revisión
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Detalle si está Observado */}
                          {tramiteActual.datos_establecimiento_estado === 'Observado' && (
                            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1.5">
                              <span className="text-xs font-black text-rose-900 uppercase flex items-center space-x-1.5">
                                <XCircle className="w-4 h-4 text-rose-600" />
                                <span>Observación / Motivo de Rechazo Registrado:</span>
                              </span>
                              <p className="text-xs text-rose-800 font-medium bg-white p-3 rounded-lg border border-rose-200">
                                {tramiteActual.datos_establecimiento_observacion || 'Datos de registro observados para corrección por el solicitante.'}
                              </p>
                            </div>
                          )}

                          {/* Detalle si está Aprobado */}
                          {tramiteActual.datos_establecimiento_estado === 'Aprobado' && (
                            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                              <div className="flex items-center space-x-2.5 text-xs text-emerald-900">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <div>
                                  <span className="font-bold block">✓ Datos Verificados y Aprobados Correctamente</span>
                                  <span className="text-emerald-700 text-[11px]">
                                    {tramiteActual.datos_establecimiento_validador || `Validado por ${nombreCoordinador}`}.
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Botones de Acción Abajo de Todo */}
                          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <div className="text-xs text-slate-500 font-medium">
                              {tramiteActual.datos_establecimiento_estado === 'Aprobado'
                                ? 'Paso 1 completado. Continúe con la revisión de requisitos.'
                                : 'Debe emitir su dictamen (Aprobar o Rechazar/Observar) para continuar.'}
                            </div>

                            <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
                              {/* Botón Rechazar / Observar */}
                              <button
                                type="button"
                                onClick={() => {
                                  setMotivoObservacionDatos(tramiteActual.datos_establecimiento_observacion || '');
                                  setModalObservarDatosOpen(true);
                                }}
                                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center space-x-1.5 cursor-pointer shadow-xs active:scale-98 ${
                                  tramiteActual.datos_establecimiento_estado === 'Observado'
                                    ? 'bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300'
                                    : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-300'
                                }`}
                              >
                                <XCircle className="w-4 h-4 text-rose-600" />
                                <span>{tramiteActual.datos_establecimiento_estado === 'Observado' ? 'Modificar Observación' : 'Rechazar / Observar'}</span>
                              </button>

                              {/* Botón Aprobar Datos */}
                              {tramiteActual.datos_establecimiento_estado !== 'Aprobado' ? (
                                <button
                                  type="button"
                                  disabled={procesandoValidacionDatos}
                                  onClick={() => handleValidarDatosEstablecimiento('Aprobado')}
                                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-md transition flex items-center space-x-2 cursor-pointer active:scale-98 disabled:opacity-50"
                                >
                                  <Check className="w-4 h-4 stroke-[3]" />
                                  <span>{procesandoValidacionDatos ? 'Aprobando...' : 'Aprobar Datos'}</span>
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setTabActiva('legal')}
                                  className="px-5 py-2.5 bg-[#0077c8] hover:bg-[#0064a7] text-white rounded-xl text-xs font-black shadow-md transition flex items-center space-x-2 cursor-pointer active:scale-98"
                                >
                                  <span>Pasar a Documentación y Requisitos ({tramiteActual.documentos?.length || 0})</span>
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })()}

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

                            {/* Controles de Navegación y Enlaces de Apertura/Descarga */}
                            <div className="flex items-center flex-wrap gap-2">
                              {/* Botones Anterior / Siguiente con contador */}
                              {docsFiltrados.length > 1 && (
                                <div className="flex items-center bg-white border border-slate-300 rounded-xl p-1 shadow-2xs space-x-1">
                                  <button
                                    type="button"
                                    onClick={handleDocAnterior}
                                    disabled={!tieneDocAnterior}
                                    className="p-1.5 rounded-lg text-slate-600 hover:text-[#0077c8] hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                                    title="Documento anterior"
                                  >
                                    <ChevronLeft className="w-4 h-4" />
                                  </button>
                                  
                                  <span className="text-[11px] font-bold text-slate-700 px-2 select-none font-mono">
                                    {currentDocIndex + 1} / {docsFiltrados.length}
                                  </span>

                                  <button
                                    type="button"
                                    onClick={handleDocSiguiente}
                                    disabled={!tieneDocSiguiente}
                                    className="p-1.5 rounded-lg text-slate-600 hover:text-[#0077c8] hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer"
                                    title="Documento siguiente"
                                  >
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                </div>
                              )}

                              {/* Enlaces de apertura externa y descarga si tiene archivo PDF real */}
                              {docActual.archivo_url && (
                                <>
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
                                </>
                              )}
                            </div>
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

                          {/* Botones de Dictamen para este Documento (Aprobado / Observado / Rechazado y Navegación) */}
                          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                            {/* Botón Anterior */}
                            <button
                              type="button"
                              onClick={handleDocAnterior}
                              disabled={!tieneDocAnterior}
                              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Anterior</span>
                            </button>

                            {/* Acciones de Validación */}
                            <div className="flex items-center justify-center space-x-3 flex-1 w-full max-w-md">
                              <button
                                onClick={() => handleCambiarEstadoDoc('Aprobado')}
                                className={`
                                  flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer
                                  ${docActual.estado === 'Aprobado'
                                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                                    : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                  }
                                `}
                                title="Aprobar y pasar automáticamente al siguiente documento"
                              >
                                <Check className="w-4 h-4" />
                                <span>{docActual.estado === 'Aprobado' ? '✓ Aprobado (Avanzar)' : 'Aprobar y Siguiente'}</span>
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

                            {/* Botón Siguiente */}
                            <button
                              type="button"
                              onClick={handleDocSiguiente}
                              disabled={!tieneDocSiguiente}
                              className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
                            >
                              <span>Siguiente</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Botones Globales de Acción del Trámite */}
                      <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-2">
                        {estaEnEtapaPosterior ? (
                          <button
                            disabled
                            className="w-full sm:flex-1 py-3 px-5 rounded-xl font-extrabold text-sm text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed transition-all flex items-center justify-center space-x-2 opacity-80"
                            title="La fiscalización técnica e inspección ya concluyeron favorablemente para este trámite."
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Inspección Concluida</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate('/coordinador/asignar-supervisores')}
                            className="w-full sm:flex-1 py-3 px-5 rounded-xl font-extrabold text-sm text-white bg-[#0077c8] hover:bg-[#0064a7] shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <Calendar className="w-4 h-4" />
                            <span>{tieneSupervisorAsignado ? 'Gestionar Inspección' : 'Agendar / Asignar Supervisor'}</span>
                          </button>
                        )}

                        {puedeAprobarTramite ? (
                          <button
                            onClick={() => handlePasarAInformeTecnico(tramiteActual)}
                            disabled={pasandoAInforme}
                            className="w-full sm:flex-1 py-3 px-5 rounded-xl font-extrabold text-sm text-emerald-950 bg-[#c7f9cc] hover:bg-[#a7f3d0] border border-emerald-400 shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer active:scale-98 disabled:opacity-50"
                            title="Todos los requisitos y el acta técnica están aprobados. Haga clic para pasar a Informe Técnico y redactar la resolución."
                          >
                            <Award className="w-4 h-4 text-emerald-700" />
                            <span>{pasandoAInforme ? 'Procesando...' : 'Aprobar Trámite y Emitir Resolución'}</span>
                          </button>
                        ) : (
                          <div className="w-full sm:flex-1 flex flex-col justify-center">
                            <button
                              disabled
                              className="w-full py-3 px-5 rounded-xl font-extrabold text-sm text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed transition-all flex items-center justify-center space-x-2 opacity-80"
                            >
                              <Award className="w-4 h-4 text-slate-400" />
                              <span>Aprobar Trámite y Emitir Resolución</span>
                            </button>
                            <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg mt-1.5 flex flex-col space-y-1 font-medium">
                              <div className="flex items-center space-x-1.5">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                <span>{motivoBloqueoAprobacion}</span>
                              </div>
                              {yaEnInformeTecnico && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTramiteSeleccionadoId(tramiteActual.id);
                                    navigate('/coordinador/informe-tecnico');
                                  }}
                                  className="self-start text-[11px] font-bold text-[#0077c8] hover:underline flex items-center space-x-1 cursor-pointer pt-0.5"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Ir al Módulo de Informe Técnico →</span>
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                  {/* =================================================================== */}
                  {/* TAB 2: INSPECCIÓN Y FISCALIZACIÓN TÉCNICA (Bitácora 2)              */}
                  {/* =================================================================== */}
                  {tabActiva === 'campo' && (
                    <div className="space-y-6 max-w-4xl mx-auto">

                      {/* Banner de Veredicto del Supervisor Condicional */}
                      {esActaRechazada ? (
                        /* ESTADO RECHAZADO / DESFAVORABLE */
                        <div className="bg-rose-50 border-l-4 border-rose-600 p-5 rounded-r-2xl shadow-xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <h3 className="font-black text-sm sm:text-base text-rose-950 uppercase tracking-tight flex items-center space-x-2">
                                <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                                <span>Veredicto Técnico: RECHAZADO (DESFAVORABLE)</span>
                              </h3>
                              <p className="text-xs text-rose-700 mt-1 font-medium">
                                Supervisor Asignado: <span className="font-bold text-rose-950">{tramiteActual.supervisorAsignado}</span> &bull; Inspección: <span className="font-bold text-rose-950">{tramiteActual.fechaInspeccion}</span>
                              </p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-rose-200 text-rose-900 border border-rose-300 self-start sm:self-auto">
                              Inspección No Favorable
                            </span>
                          </div>

                          <p className="text-xs text-rose-900 leading-relaxed font-medium bg-rose-100/70 p-3 rounded-xl border border-rose-200">
                            La fiscalización técnica in-situ determinó que el establecimiento no cumple con los estándares sanitarios, equipamiento o infraestructura requeridos. Conforme al reglamento, el propietario debe volver a subir todos sus requisitos para reiniciar el proceso de habilitación.
                          </p>

                          <div className="pt-1 flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={handleNotificarReingreso}
                              disabled={notificandoReingreso}
                              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{notificandoReingreso ? 'Enviando Notificación...' : 'Notificar al Propietario para Reingreso de Requisitos'}</span>
                            </button>

                            {tramiteActual.acta_pdf_url && (
                              <a
                                href={tramiteActual.acta_pdf_url.startsWith('http') ? tramiteActual.acta_pdf_url : `http://localhost:8000/${tramiteActual.acta_pdf_url.replace(/^\/+/, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2.5 bg-white hover:bg-rose-50 text-rose-800 border border-rose-300 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer shadow-xs"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Ver Acta PDF Emitida</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ) : esActaFavorable ? (
                        /* ESTADO APROBADO / FAVORABLE */
                        <div className="bg-emerald-50 border-l-4 border-emerald-600 p-5 rounded-r-2xl shadow-xs space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <h3 className="font-black text-sm sm:text-base text-emerald-950 uppercase tracking-tight flex items-center space-x-2">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                                <span>Veredicto Técnico: APROBADO (FAVORABLE)</span>
                              </h3>
                              <p className="text-xs text-emerald-800 mt-1 font-medium">
                                Supervisor Asignado: <span className="font-bold text-emerald-950">{tramiteActual.supervisorAsignado}</span> &bull; Inspección: <span className="font-bold text-emerald-950">{tramiteActual.fechaInspeccion}</span>
                              </p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-200 text-emerald-950 border border-emerald-300 self-start sm:self-auto">
                              Acta Oficial Aprobada
                            </span>
                          </div>

                          <p className="text-xs text-emerald-900 leading-relaxed font-medium bg-emerald-100/70 p-3 rounded-xl border border-emerald-200">
                            La fiscalización técnica in situ ha concluido satisfactoriamente certificando el cumplimiento pleno de infraestructura, bioseguridad, equipamiento y personal profesional.
                          </p>

                          {tramiteActual.acta_pdf_url && (
                            <div className="pt-1">
                              <a
                                href={tramiteActual.acta_pdf_url.startsWith('http') ? tramiteActual.acta_pdf_url : `http://localhost:8000/${tramiteActual.acta_pdf_url.replace(/^\/+/, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                              >
                                <FileCheck className="w-4 h-4" />
                                <span>Ver / Descargar Acta Firmada Oficial (PDF)</span>
                              </a>
                            </div>
                          )}
                        </div>
                      ) : esActaConObservaciones ? (
                        /* ESTADO CON OBSERVACIONES */
                        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-2xl shadow-xs space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <h3 className="font-black text-sm sm:text-base text-amber-950 uppercase tracking-tight flex items-center space-x-2">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                <span>Veredicto Técnico: CON OBSERVACIONES</span>
                              </h3>
                              <p className="text-xs text-amber-800 mt-1 font-medium">
                                Supervisor Asignado: <span className="font-bold text-amber-950">{tramiteActual.supervisorAsignado}</span> &bull; Inspección: <span className="font-bold text-amber-950">{tramiteActual.fechaInspeccion}</span>
                              </p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-amber-200 text-amber-950 border border-amber-300 self-start sm:self-auto">
                              Requiere Subsanación
                            </span>
                          </div>
                          <p className="text-xs text-amber-900 leading-relaxed font-medium">
                            El establecimiento presenta observaciones técnicas que deben ser subsanadas antes de poder emitir la resolución final.
                          </p>
                        </div>
                      ) : (
                        /* ESTADO PENDIENTE DE ASIGNACIÓN O INSPECCIÓN */
                        <div className="bg-sky-50 border-l-4 border-[#0077c8] p-5 rounded-r-2xl shadow-xs space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <h3 className="font-black text-sm sm:text-base text-slate-900 uppercase tracking-tight flex items-center space-x-2">
                                <ShieldCheck className="w-5 h-5 text-[#0077c8] shrink-0" />
                                <span>Veredicto Técnico: {tramiteActual.veredictoSupervisor}</span>
                              </h3>
                              <p className="text-xs text-slate-600 mt-1 font-medium">
                                Supervisor Asignado: <span className="font-bold text-slate-800">{tramiteActual.supervisorAsignado}</span> &bull; Inspección: <span className="font-bold">{tramiteActual.fechaInspeccion}</span>
                              </p>
                            </div>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-sky-100 text-[#0077c8] border border-sky-300 self-start sm:self-auto">
                              {tieneSupervisorAsignado ? 'Pendiente de Inspección' : 'Pendiente de Asignación'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {tieneSupervisorAsignado
                              ? 'El supervisor asignado debe realizar la inspección técnica in-situ y registrar el acta con el veredicto correspondiente.'
                              : 'Para iniciar la fiscalización en campo, debe asignar un supervisor técnico en la sección correspondiente.'
                            }
                          </p>
                        </div>
                      )}

                      {/* Datos del Establecimiento a Fiscalizar */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                          Ficha Técnica de Fiscalización
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Establecimiento</span>
                            <span className="font-bold text-slate-800 text-sm block mt-0.5">{tramiteActual.establecimiento}</span>
                            <span className="text-slate-500 block mt-0.5">{tramiteActual.categoria}</span>
                          </div>

                          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-400 font-bold uppercase block">Ubicación y Jurisdicción</span>
                            <span className="font-bold text-slate-800 block mt-0.5">{tramiteActual.municipio}</span>
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

                          {/* Supervisor Asignado (Selector o Badge Fijo) */}
                          <td className="py-4 pr-3">
                            {item.yaAsignado ? (
                              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200/90 rounded-lg px-3 py-1.5 text-xs text-emerald-800 font-bold">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                                <span className="truncate">{item.supervisorAsignado || 'Supervisor Asignado'}</span>
                              </div>
                            ) : (
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
                            )}
                          </td>

                          {/* Botón Acción */}
                          <td className="py-4 text-center">
                            {item.yaAsignado ? (
                              <span className="inline-flex items-center space-x-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 font-extrabold text-[11px] px-3.5 py-1.5 rounded-lg shadow-2xs">
                                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                <span>Asignado</span>
                              </span>
                            ) : (
                              <button
                                onClick={() => handleAsignarSupervisor(item.codigo)}
                                disabled={!item.supervisorAsignado}
                                className={`font-bold text-xs px-5 py-1.5 rounded-lg transition-all shadow-xs active:scale-95 ${
                                  item.supervisorAsignado
                                    ? 'bg-[#19324d] hover:bg-[#102235] text-white cursor-pointer'
                                    : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                }`}
                              >
                                Asignar
                              </button>
                            )}
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

              {/* Registro de Actividad (Tabla con Paginación) */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">

                {/* Cabecera */}
                <h2 className="text-base font-black text-slate-900 tracking-tight">
                  Registro de Actividad
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
                      {actividadesPaginadas.map((item) => (
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

                      {actividadesPaginadas.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400 text-xs font-medium">
                            No se encontraron registros de trámites en el historial.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pie de Tabla: Paginación, selector de cantidad y contador de registros */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                  {/* Conteo de registros + Selector de tamaño de página (Combobox) */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-slate-500 font-medium">
                      Mostrando {totalRegistrosHistorial === 0 ? 0 : inicioHistorial + 1}-{Math.min(finHistorial, totalRegistrosHistorial)} de {totalRegistrosHistorial} registros
                    </span>

                    <div className="flex items-center space-x-1.5 pl-2 sm:border-l sm:border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-400">Mostrar:</span>
                      <select
                        value={itemsPorPaginaHistorial}
                        onChange={(e) => {
                          setItemsPorPaginaHistorial(Number(e.target.value));
                          setPaginaHistorial(1);
                        }}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077c8]/20 focus:border-[#0077c8] cursor-pointer shadow-2xs transition"
                      >
                        <option value={10}>10 por vista</option>
                        <option value={25}>25 por vista</option>
                        <option value={50}>50 por vista</option>
                      </select>
                    </div>
                  </div>

                  {/* Controles de Paginación */}
                  {totalPaginasHistorial > 1 && (
                    <div className="flex items-center space-x-1.5">
                      {/* Botón Anterior < */}
                      <button
                        type="button"
                        onClick={() => setPaginaHistorial(prev => Math.max(1, prev - 1))}
                        disabled={paginaHistorial === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer transition shadow-2xs"
                        title="Página anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Botones de número de página */}
                      {getNumeroPaginasHistorial().map((p, idx) => (
                        p === '...' ? (
                          <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-bold select-none">
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${p}`}
                            type="button"
                            onClick={() => setPaginaHistorial(p)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              paginaHistorial === p
                                ? 'bg-[#0f2438] text-white border border-[#0f2438] shadow-xs'
                                : 'border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      ))}

                      {/* Botón Siguiente > */}
                      <button
                        type="button"
                        onClick={() => setPaginaHistorial(prev => Math.min(totalPaginasHistorial, prev + 1))}
                        disabled={paginaHistorial === totalPaginasHistorial}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer transition shadow-2xs"
                        title="Página siguiente"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. VISTA 4: INFORME TÉCNICO (COMUNICACIÓN INTERNA SEDES)                 */}
        {/* ========================================================================= */}
        {seccionActiva === 'informe-tecnico' && (
          <InformeTecnicoView
            tramites={tramites}
            tramiteSeleccionadoId={tramiteSeleccionadoId}
            onSeleccionarTramite={(id) => setTramiteSeleccionadoId(id)}
            onRecargarDatos={cargarDatosBackend}
            nombreCoordinador={nombreCoordinador}
            mostrarToast={mostrarToast}
            onAprobarFinal={(tramiteParaAprobar) => {
              if (tramiteParaAprobar) {
                setTramiteSeleccionadoId(tramiteParaAprobar.id);
                if (tramiteParaAprobar.resolucion_numero) {
                  setAprobacionData(prev => ({
                    ...prev,
                    codigoResolucion: tramiteParaAprobar.resolucion_numero
                  }));
                }
              }
              setModalAprobacionOpen(true);
            }}
          />
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



      {/* MODAL 1.5: Observar Datos del Establecimiento */}
      {modalObservarDatosOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-rose-600 to-rose-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-200" />
                <h3 className="font-extrabold text-base">Observar Datos del Establecimiento</h3>
              </div>
              <button
                onClick={() => setModalObservarDatosOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-950">
                <p className="font-bold text-xs mb-0.5">Establecimiento: {tramiteActual?.establecimiento || tramiteActual?.nombre_comercial}</p>
                <p className="text-[11px] text-rose-800">
                  Solicitante: <strong>{tramiteActual?.propietario || tramiteActual?.solicitante}</strong> • Municipio: <strong>{tramiteActual?.municipio || 'Cochabamba'}</strong>
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Motivo de la Observación <span className="text-rose-600">*</span>
                </label>
                <textarea
                  rows={4}
                  value={motivoObservacionDatos}
                  onChange={(e) => setMotivoObservacionDatos(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none placeholder:text-slate-400"
                  placeholder="Detalle los errores u omisiones en los datos del establecimiento (ej. inconsistencia en especialidades declaradas, horario sin cobertura de regente, dirección errónea, etc.)..."
                />
              </div>

              {/* Sugerencias Rápidas de Observación */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sugerencias frecuentes:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Inconsistencia en especialidades declaradas',
                    'Ubicación o dirección georreferenciada no coincide',
                    'Horario de atención incompleto o sin responsable',
                    'Falta cédula de identidad del regente técnico'
                  ].map((sug, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setMotivoObservacionDatos(prev => prev ? `${prev}. ${sug}` : sug)}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md border border-slate-200 transition cursor-pointer"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalObservarDatosOpen(false)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-bold transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!motivoObservacionDatos.trim() || procesandoValidacionDatos}
                  onClick={() => handleValidarDatosEstablecimiento('Observado', motivoObservacionDatos)}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-extrabold shadow-md transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{procesandoValidacionDatos ? 'Guardando...' : 'Registrar Observación'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
