import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Navigation, 
  FileText, 
  Mail, 
  Bell, 
  LogOut, 
  Menu, 
  X, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Eye, 
  Check, 
  SlidersHorizontal,
  Compass,
  FileCheck2,
  CalendarCheck,
  FlaskConical,
  RefreshCw,
  Phone,
  CalendarPlus,
  AlertTriangle,
  Layers,
  ChevronDown,
  CalendarDays,
  Sparkles,
  ArrowRight
} from 'lucide-react';

import logoL1 from '../assets/L1.png';
import logoL2 from '../assets/L2.png';
import RutasInspeccionView from '../components/supervisor/RutasInspeccionView';
import ActasEmitidasView from '../components/supervisor/ActasEmitidasView';
import CitacionesEmitidasView from '../components/supervisor/CitacionesEmitidasView';

const MESES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

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

export default function SupervisorPage() {
  const navigate = useNavigate();
  const { seccion } = useParams();

  const SECCIONES_VALIDAS = ['mi-agenda', 'rutas-inspeccion', 'actas-emitidas', 'citaciones-emitidas'];
  const seccionActiva = SECCIONES_VALIDAS.includes(seccion) ? seccion : 'mi-agenda';

  const [usuario, setUsuario] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semanaActualOffset, setSemanaActualOffset] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [toast, setToast] = useState(null);

  // Datos reales de la Agenda
  const [inspeccionesPendientes, setInspeccionesPendientes] = useState([]);
  const [eventosSemana, setEventosSemana] = useState([]);
  const [semanaInfo, setSemanaInfo] = useState({
    rango_texto: 'Cargando semana...',
    dias: [
      { key: 'Lun', nombre: 'Lun', numero: 11, fecha_iso: '' },
      { key: 'Mar', nombre: 'Mar', numero: 12, fecha_iso: '' },
      { key: 'Mié', nombre: 'Mié', numero: 13, fecha_iso: '' },
      { key: 'Jue', nombre: 'Jue', numero: 14, fecha_iso: '' },
      { key: 'Vie', nombre: 'Vie', numero: 15, fecha_iso: '' }
    ]
  });

  // Modal de detalle de inspección
  const [modalInspeccionOpen, setModalInspeccionOpen] = useState(false);
  const [inspeccionSeleccionada, setInspeccionSeleccionada] = useState(null);
  const [modoReprogramar, setModoReprogramar] = useState(false);
  const [reprogramarFecha, setReprogramarFecha] = useState('');
  const [reprogramarHora, setReprogramarHora] = useState('10:00');
  const [reprogramarMotivo, setReprogramarMotivo] = useState('');

  // Modal de agendar inspección (para pendientes o nuevo registro)
  const [modalAgendarOpen, setModalAgendarOpen] = useState(false);
  const [tramiteSeleccionado, setTramiteSeleccionado] = useState(null);
  const [formFecha, setFormFecha] = useState('');
  const [formHora, setFormHora] = useState('09:00');
  const [formHoraFin, setFormHoraFin] = useState('11:00');
  const [formObservaciones, setFormObservaciones] = useState('');
  const [guardandoAgendamiento, setGuardandoAgendamiento] = useState(false);

  // Control del Popover y Selector Avanzado de Fechas
  const [selectorFechaOpen, setSelectorFechaOpen] = useState(false);
  const [fechaBuscarInput, setFechaBuscarInput] = useState('');
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const popoverFechaRef = useRef(null);

  // Cerrar popover al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverFechaRef.current && !popoverFechaRef.current.contains(event.target)) {
        setSelectorFechaOpen(false);
      }
    }
    if (selectorFechaOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectorFechaOpen]);

  // Sincronizar mes y año seleccionados con la semana cargada
  useEffect(() => {
    if (semanaInfo?.anio) setAnioSeleccionado(semanaInfo.anio);
    if (semanaInfo?.mes_numero) setMesSeleccionado(semanaInfo.mes_numero);
  }, [semanaInfo]);

  // Función para saltar a una fecha específica usando el backend
  const saltarAFecha = async (fechaIso) => {
    if (!fechaIso) return;
    const supervisorId = usuario?.id || usuario?.email || (usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos}` : '');
    if (!supervisorId) return;
    setCargando(true);
    setSelectorFechaOpen(false);
    try {
      const url = `http://localhost:8000/api/supervisor/${encodeURIComponent(supervisorId)}/agenda?fecha=${encodeURIComponent(fechaIso)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setInspeccionesPendientes(data.pendientes || []);
        setEventosSemana(data.eventos || []);
        if (data.semana) {
          setSemanaInfo(data.semana);
          setSemanaActualOffset(data.semana.offset ?? 0);
          if (data.semana.dias && data.semana.dias.length > 0) {
            setFormFecha(data.semana.dias[0].fecha_iso);
            setReprogramarFecha(data.semana.dias[0].fecha_iso);
          }
        }
      }
    } catch (err) {
      console.warn('Error al saltar a fecha:', err);
    } finally {
      setCargando(false);
    }
  };

  const saltarAMesAnio = (mes, anio) => {
    const mesStr = String(mes).padStart(2, '0');
    const fecha = `${anio}-${mesStr}-01`;
    saltarAFecha(fecha);
  };

  // Mostrar mensaje emergente Toast
  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Cargar usuario logueado
  useEffect(() => {
    const sessionUser = localStorage.getItem('usuario');
    if (sessionUser) {
      try {
        setUsuario(JSON.parse(sessionUser));
      } catch (e) {
        console.error('Error al parsear usuario:', e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  // 2. Cargar datos de la Agenda desde el Backend FastAPI
  const cargarAgendaBackend = useCallback(async () => {
    const supervisorId = usuario?.id || usuario?.email || (usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos}` : '');
    if (!supervisorId) return;
    setCargando(true);
    try {
      const url = `http://localhost:8000/api/supervisor/${encodeURIComponent(supervisorId)}/agenda?offset_semanas=${semanaActualOffset}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setInspeccionesPendientes(data.pendientes || []);
        setEventosSemana(data.eventos || []);
        if (data.semana) {
          setSemanaInfo(data.semana);
          // Si no hay fecha seleccionada en formulario, seleccionar el lunes por defecto
          if (data.semana.dias && data.semana.dias.length > 0) {
            setFormFecha(data.semana.dias[0].fecha_iso);
            setReprogramarFecha(data.semana.dias[0].fecha_iso);
          }
        }
      } else {
        console.warn('No se pudo cargar la agenda desde el servidor.');
      }
    } catch (err) {
      console.warn('Error de red al cargar agenda:', err);
    } finally {
      setCargando(false);
    }
  }, [usuario, semanaActualOffset]);

  useEffect(() => {
    cargarAgendaBackend();
  }, [cargarAgendaBackend]);

  // Horas del calendario (08:00 a 17:00)
  const horasGrid = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  // Menú lateral estructurado
  const menuItems = [
    {
      id: 'mi-agenda',
      label: 'Mi Agenda',
      icon: CalendarIcon,
      titulo: 'Programación y Asignación Semanal',
      subtitulo: 'Gestione las inspecciones asignadas y planifique su recorrido semanal.'
    },
    {
      id: 'rutas-inspeccion',
      label: 'Rutas de Inspección',
      icon: Navigation,
      titulo: 'Rutas de Inspección y Recorridos GPS',
      subtitulo: 'Visualice en el mapa la ruta óptima para visitar los establecimientos asignados.'
    },
    {
      id: 'actas-emitidas',
      label: 'Actas Emitidas',
      icon: FileText,
      titulo: 'Actas de Inspección y Verificación',
      subtitulo: 'Historial de actas técnicas generadas en campo con firmas y observaciones.'
    },
    {
      id: 'citaciones-emitidas',
      label: 'Citaciones Emitidas',
      icon: Mail,
      titulo: 'Citaciones y Notificaciones Sanitarias',
      subtitulo: 'Registro de citaciones formales emitidas a establecimientos con observaciones.'
    }
  ];

  const itemActivo = menuItems.find(item => item.id === seccionActiva) || menuItems[0];

  const nombreSupervisor = usuario 
    ? `${usuario.nombres} ${usuario.apellidos}` 
    : 'Supervisor Técnico';

  // Helper para obtener fecha local de hoy en formato YYYY-MM-DD
  const hoyLocalIso = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper robusto para parsear cualquier formato de fecha y hora
  const parseFechaHoraJs = (fechaStr, horaStr = '00:00') => {
    if (!fechaStr) return null;
    const fechaLimpia = String(fechaStr).trim().split('T')[0].split(' ')[0];
    const horaLimpia = String(horaStr || '00:00').trim().split('T').pop().split(' ').pop();

    let year = 2026, month = 1, day = 1;
    if (fechaLimpia.includes('-')) {
      const parts = fechaLimpia.split('-').map(Number);
      if (parts.length >= 3) {
        if (parts[0] > 1000) {
          [year, month, day] = parts;
        } else {
          [day, month, year] = parts;
        }
      }
    } else if (fechaLimpia.includes('/')) {
      const parts = fechaLimpia.split('/').map(Number);
      if (parts.length >= 3) {
        if (parts[0] > 1000) {
          [year, month, day] = parts;
        } else {
          [day, month, year] = parts;
        }
      }
    } else {
      return null;
    }

    const [hour, minute] = horaLimpia.split(':').map(Number);
    return new Date(year, month - 1, day, hour || 0, minute || 0, 0, 0);
  };

  // Normalizar cualquier fecha a estándar YYYY-MM-DD
  const normalizarAFechaIso = (fechaStr) => {
    const d = parseFechaHoraJs(fechaStr);
    if (!d || isNaN(d.getTime())) return fechaStr;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Helper para verificar si una combinación de fecha y hora está en el pasado (con 2 min de tolerancia)
  const esFechaHoraPasada = (fechaStr, horaStr) => {
    const d = parseFechaHoraJs(fechaStr, horaStr);
    if (!d || isNaN(d.getTime())) return false;
    const ahora = new Date();
    ahora.setMinutes(ahora.getMinutes() - 2);
    return d < ahora;
  };

  // Abrir modal para programar una inspección pendiente
  const handleAbrirProgramar = (item, diaSugerido = null, horaSugerida = null) => {
    setTramiteSeleccionado(item);
    const fechaHoy = hoyLocalIso();
    
    if (diaSugerido && diaSugerido >= fechaHoy) {
      setFormFecha(diaSugerido);
    } else if (semanaInfo.dias && semanaInfo.dias.length > 0) {
      const primerDiaFuturo = semanaInfo.dias.find(d => d.fecha_iso >= fechaHoy);
      setFormFecha(primerDiaFuturo ? primerDiaFuturo.fecha_iso : fechaHoy);
    } else {
      setFormFecha(fechaHoy);
    }

    const hInicio = horaSugerida || '09:00';
    setFormHora(hInicio);

    // Calcular hora de fin por defecto (1 hora y media después)
    try {
      const [hh, mm] = hInicio.split(':').map(Number);
      const totalMin = hh * 60 + mm + 90;
      const endH = String(Math.floor(totalMin / 60)).padStart(2, '0');
      const endM = String(totalMin % 60).padStart(2, '0');
      setFormHoraFin(`${endH}:${endM}`);
    } catch {
      setFormHoraFin('11:00');
    }

    setFormObservaciones('');
    setModalAgendarOpen(true);
  };

  // Guardar agendamiento en base de datos
  const handleGuardarAgendamiento = async (e) => {
    e.preventDefault();
    if (!tramiteSeleccionado) {
      mostrarToast('Por favor seleccione un establecimiento asignado de la lista.', 'warning');
      return;
    }
    if (!formFecha) {
      mostrarToast('Seleccione la fecha de inspección.', 'warning');
      return;
    }

    // Validación estricta contra fechas u horas pasadas
    if (esFechaHoraPasada(formFecha, formHora)) {
      mostrarToast('No es posible programar una inspección en una fecha u hora pasada.', 'warning');
      return;
    }

    // Validación de horario de finalización
    if (formHoraFin && formHoraFin <= formHora) {
      mostrarToast('La hora de finalización debe ser posterior a la hora de inicio.', 'warning');
      return;
    }

    // Calcular duración en minutos a partir de inicio y fin
    let duracionMin = 90;
    try {
      const [h1, m1] = formHora.split(':').map(Number);
      const [h2, m2] = (formHoraFin || '11:00').split(':').map(Number);
      const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
      if (diff > 0) duracionMin = diff;
    } catch {
      duracionMin = 90;
    }

    setGuardandoAgendamiento(true);
    try {
      const fechaIsoFinal = normalizarAFechaIso(formFecha);
      const response = await fetch('http://localhost:8000/api/supervisor/agendar-inspeccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tramite_id: tramiteSeleccionado.tramite_id || tramiteSeleccionado.id,
          supervisor_id: usuario?.id || usuario?.email || `${usuario?.nombres || ''} ${usuario?.apellidos || ''}`.trim(),
          fecha: fechaIsoFinal,
          hora_inicio: formHora,
          hora_fin: formHoraFin,
          duracion_minutos: duracionMin,
          observaciones: formObservaciones
        })
      });

      if (response.ok) {
        const data = await response.json();
        mostrarToast(data.mensaje || '¡Inspección registrada con éxito!', 'success');
        setModalAgendarOpen(false);
        setTramiteSeleccionado(null);
        cargarAgendaBackend();
      } else {
        const err = await response.json();
        mostrarToast(err.detail || 'Error al registrar la inspección.', 'warning');
      }
    } catch (err) {
      console.warn('Error al agendar inspección:', err);
      mostrarToast('Error de conexión con el servidor al registrar.', 'warning');
    } finally {
      setGuardandoAgendamiento(false);
    }
  };

  // Abrir detalle de evento en calendario
  const handleVerDetalleEvento = (evento) => {
    setInspeccionSeleccionada(evento);
    setModoReprogramar(false);
    setReprogramarFecha(evento.fecha || '');
    setReprogramarHora(evento.horaInicio || '10:00');
    setReprogramarMotivo('');
    setModalInspeccionOpen(true);
  };

  // Reprogramar inspección
  const handleGuardarReprogramacion = async (e) => {
    e.preventDefault();
    if (!inspeccionSeleccionada) return;

    // Validación estricta contra fechas u horas pasadas al reprogramar
    if (esFechaHoraPasada(reprogramarFecha, reprogramarHora)) {
      mostrarToast('No es posible reprogramar una inspección en una fecha u hora pasada.', 'warning');
      return;
    }

    try {
      const fechaIsoFinal = normalizarAFechaIso(reprogramarFecha);
      const response = await fetch('http://localhost:8000/api/supervisor/reprogramar-inspeccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspeccion_id: inspeccionSeleccionada.inspeccion_id || inspeccionSeleccionada.id,
          fecha: fechaIsoFinal,
          hora_inicio: reprogramarHora,
          motivo: reprogramarMotivo
        })
      });

      if (response.ok) {
        const data = await response.json();
        mostrarToast(data.mensaje || '¡Inspección reprogramada exitosamente!', 'success');
        setModalInspeccionOpen(false);
        cargarAgendaBackend();
      } else {
        const err = await response.json();
        mostrarToast(err.detail || 'Error al reprogramar inspección.', 'warning');
      }
    } catch (err) {
      console.warn('Error al reprogramar:', err);
      mostrarToast('Error de conexión al reprogramar.', 'warning');
    }
  };

  // Desagendar inspección y devolver a pendientes
  const handleDesagendar = async () => {
    if (!inspeccionSeleccionada) return;
    try {
      const response = await fetch('http://localhost:8000/api/supervisor/desagendar-inspeccion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspeccion_id: inspeccionSeleccionada.inspeccion_id || inspeccionSeleccionada.id
        })
      });

      if (response.ok) {
        mostrarToast('Inspección devuelta a la lista de pendientes.', 'success');
        setModalInspeccionOpen(false);
        cargarAgendaBackend();
      } else {
        mostrarToast('Error al desagendar inspección.', 'warning');
      }
    } catch (err) {
      console.warn('Error al desagendar:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex font-sans antialiased text-slate-800">
      
      {/* Backdrop para móviles */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-2xs lg:hidden"
        />
      )}

      {/* ===================================================================== */}
      {/* 1. SIDEBAR LATERAL INSTITUCIONAL (AZUL SEDES)                         */}
      {/* ===================================================================== */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-[#0060a8] text-white flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out
        shadow-xl lg:shadow-none shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 space-y-8">
          
          {/* Logo SI_Lab */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 select-none">
              <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/30 shadow-inner">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tight text-white flex items-center">
                SI<span className="text-cyan-200">_Lab</span>
              </span>
            </div>

            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Menú de Navegación */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = seccionActiva === item.id;

              return (
                <Link
                  key={item.id}
                  to={`/supervisor/${item.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer
                    ${isActive 
                      ? 'bg-[#004b85] text-white shadow-inner font-extrabold border-l-4 border-white' 
                      : 'text-blue-100/90 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-blue-200'}`} />
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

      {/* ===================================================================== */}
      {/* 2. ÁREA PRINCIPAL Y MENÚ SUPERIOR STICKY                              */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Barra Superior (Top Header Sticky) */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
          <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">
            
            {/* Breadcrumb / Ruta Actual */}
            <div className="flex items-center space-x-3 truncate">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 mr-1 cursor-pointer"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="text-xs sm:text-sm font-medium text-slate-500 truncate flex items-center space-x-1.5">
                <span>Panel del Supervisor</span>
                <span className="text-slate-300">/</span>
                <span className="font-bold text-slate-800">{itemActivo.label}</span>
              </div>
            </div>

            {/* Perfil del Usuario & Acciones */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              
              {/* Botón Refrescar */}
              <button
                type="button"
                onClick={cargarAgendaBackend}
                disabled={cargando}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
                title="Actualizar agenda"
              >
                <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-[#0060a8]' : ''}`} />
              </button>

              {/* Campana de Notificaciones con Badge */}
              <button 
                type="button" 
                className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
                title="Notificaciones de inspección"
              >
                <Bell className="w-5 h-5" />
                {inspeccionesPendientes.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
                    {inspeccionesPendientes.length}
                  </span>
                )}
              </button>

              {/* Perfil del Supervisor */}
              <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    {nombreSupervisor}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Supervisor Técnico
                  </p>
                </div>

                {/* Avatar de Iniciales */}
                <div className={`w-9 h-9 rounded-full ${getAvatarColor(nombreSupervisor)} text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-slate-100 select-none tracking-tight`}>
                  <span>{getInitials(usuario || { nombreCompleto: nombreSupervisor })}</span>
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
          </div>
        </header>

        {/* ===================================================================== */}
        {/* 3. CONTENIDO PRINCIPAL                                                */}
        {/* ===================================================================== */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* VISTA 1: MI AGENDA (PROGRAMACIÓN Y ASIGNACIÓN SEMANAL) */}
          {seccionActiva === 'mi-agenda' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Título de Sección + Navegador de Semanas */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Programación y Asignación Semanal
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Gestione las inspecciones asignadas y planifique su recorrido semanal.
                  </p>
                </div>

                {/* Navegador Semanal Dinámico con Popover de Fecha y Atajos Rápidos */}
                <div className="relative" ref={popoverFechaRef}>
                  <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs space-x-1 text-xs font-bold text-slate-700 self-start md:self-auto">
                    
                    {/* Botón Semana Anterior */}
                    <button
                      type="button"
                      onClick={() => setSemanaActualOffset(prev => prev - 1)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      title="Semana anterior"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Botón Central Interactivo para abrir Popover */}
                    <button
                      type="button"
                      onClick={() => setSelectorFechaOpen(prev => !prev)}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl transition cursor-pointer border ${
                        selectorFechaOpen 
                          ? 'bg-blue-50 border-blue-200 text-[#005596]' 
                          : 'bg-slate-50/70 hover:bg-slate-100 border-transparent text-slate-800'
                      }`}
                      title="Haz clic para seleccionar fecha o mes directamente"
                    >
                      <CalendarIcon className={`w-4 h-4 ${selectorFechaOpen ? 'text-[#005596]' : 'text-slate-500'}`} />
                      <span className="font-extrabold tracking-tight">
                        {semanaInfo.rango_texto}
                      </span>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${selectorFechaOpen ? 'rotate-180 text-[#005596]' : ''}`} />
                    </button>

                    {/* Botón Semana Siguiente */}
                    <button
                      type="button"
                      onClick={() => setSemanaActualOffset(prev => prev + 1)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                      title="Semana siguiente"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Botón Hoy Rápido */}
                    {semanaActualOffset !== 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSemanaActualOffset(0);
                          setSelectorFechaOpen(false);
                        }}
                        className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-[#005596] rounded-xl text-[11px] font-extrabold transition cursor-pointer flex items-center space-x-1 border border-blue-100"
                        title="Volver a la semana actual"
                      >
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>Hoy</span>
                      </button>
                    )}
                  </div>

                  {/* Popover Desplegable Elegante de Selección de Fecha */}
                  {selectorFechaOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl border border-slate-200 shadow-2xl z-50 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                      
                      {/* Cabecera del Popover */}
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#005596] flex items-center justify-center">
                            <CalendarDays className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800">Navegador de Agenda</h4>
                            <p className="text-[10px] text-slate-400 font-medium">Salta directamente a cualquier fecha o mes</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectorFechaOpen(false)}
                          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* 1. Atajos Rápidos */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Atajos Rápidos
                        </label>
                        <div className="grid grid-cols-3 gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSemanaActualOffset(0);
                              setSelectorFechaOpen(false);
                            }}
                            className={`px-2 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1 border cursor-pointer ${
                              semanaActualOffset === 0
                                ? 'bg-[#005596] text-white border-[#005596] shadow-xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
                            }`}
                          >
                            <span>🌟 Hoy</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSemanaActualOffset(prev => prev - 4)}
                            className="px-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
                            title="Retroceder 4 semanas"
                          >
                            <span>-1 Mes</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSemanaActualOffset(prev => prev + 4)}
                            className="px-2 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
                            title="Avanzar 4 semanas"
                          >
                            <span>+1 Mes</span>
                          </button>
                        </div>
                      </div>

                      {/* 2. Saltar a Mes y Año Específico */}
                      <div className="space-y-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                          Saltar por Mes y Año
                        </label>
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-7">
                            <select
                              value={mesSeleccionado}
                              onChange={(e) => setMesSeleccionado(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-[#005596] cursor-pointer"
                            >
                              {MESES_NOMBRES.map((mes, idx) => (
                                <option key={idx + 1} value={idx + 1}>
                                  {mes}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-span-5">
                            <select
                              value={anioSeleccionado}
                              onChange={(e) => setAnioSeleccionado(Number(e.target.value))}
                              className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-[#005596] cursor-pointer"
                            >
                              {[2024, 2025, 2026, 2027, 2028, 2029].map(anio => (
                                <option key={anio} value={anio}>
                                  {anio}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => saltarAMesAnio(mesSeleccionado, anioSeleccionado)}
                          className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 rounded-xl transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-xs"
                        >
                          <span>Ir al Mes Seleccionado</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* 3. Selector de Día Exacto (Date Picker) */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                          Seleccionar Día Específico
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="date"
                            value={fechaBuscarInput}
                            onChange={(e) => {
                              setFechaBuscarInput(e.target.value);
                              if (e.target.value) {
                                saltarAFecha(e.target.value);
                              }
                            }}
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#005596] cursor-pointer"
                          />
                          {fechaBuscarInput && (
                            <button
                              type="button"
                              onClick={() => saltarAFecha(fechaBuscarInput)}
                              className="bg-[#005596] hover:bg-[#003e6d] text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                            >
                              Ir
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              </div>

              {/* Grid Principal: Inspecciones Pendientes (Izquierda) + Calendario Semanal (Derecha) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ------------------------------------------------------------- */}
                {/* COLUMNA IZQUIERDA: INSPECCIONES PENDIENTES                     */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
                      <span>Inspecciones Pendientes</span>
                    </h3>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      inspeccionesPendientes.length > 0 
                        ? 'text-amber-800 bg-amber-100/90 border-amber-200' 
                        : 'text-slate-600 bg-slate-100 border-slate-200'
                    }`}>
                      {inspeccionesPendientes.length} pendientes
                    </span>
                  </div>

                  {/* Lista de Tarjetas de Inspecciones Pendientes */}
                  <div className="space-y-3 min-h-[140px]">
                    {inspeccionesPendientes.length === 0 ? (
                      <div className="text-center py-8 px-4 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 space-y-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                        <p className="text-xs font-bold text-slate-700">¡Al día!</p>
                        <p className="text-[11px] text-slate-400">
                          No tienes inspecciones pendientes de programar por el momento.
                        </p>
                      </div>
                    ) : (
                      inspeccionesPendientes.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleAbrirProgramar(item)}
                          className={`
                            p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition cursor-pointer space-y-2 relative overflow-hidden group
                            ${item.tagColor === 'orange' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-blue-600'}
                          `}
                          title="Clic para programar horario de inspección"
                        >
                          <div className="flex items-start justify-between">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug group-hover:text-[#0060a8] transition">
                              {item.nombre}
                            </h4>
                            <span className="opacity-0 group-hover:opacity-100 transition text-[#0060a8] text-[10px] font-bold flex items-center space-x-0.5 bg-blue-50 px-1.5 py-0.5 rounded-md">
                              <CalendarPlus className="w-3 h-3" />
                              <span>Agendar</span>
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className={`
                              text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider
                              ${item.tagColor === 'orange' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}
                            `}>
                              {item.tipoTag}
                            </span>

                            <span className="text-[10px] text-slate-400 font-medium">
                              {item.municipio}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* ------------------------------------------------------------- */}
                {/* COLUMNA DERECHA: CALENDARIO SEMANAL INTERACTIVO                */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-8 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
                  
                  {/* Contenedor del Calendario */}
                  <div className="overflow-x-auto">
                    <div className="min-w-[620px]">
                      
                      {/* Cabecera de Días */}
                      <div className="grid grid-cols-6 border-b border-slate-200 pb-3 text-center">
                        <div className="text-xs font-bold text-slate-400">Hora</div>
                        {semanaInfo.dias.map((dia) => (
                          <div key={dia.key} className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-700 block">{dia.nombre}</span>
                            <span className="text-xs text-slate-400 font-medium">{dia.numero}</span>
                          </div>
                        ))}
                      </div>

                      {/* Cuadrícula de Horarios (08:00 a 17:00) */}
                      <div className="relative divide-y divide-slate-100 text-xs text-slate-400">
                        {horasGrid.map((hora) => (
                          <div key={hora} className="grid grid-cols-6 h-12 items-center">
                            <div className="font-mono text-[11px] text-slate-400 pr-2">
                              {hora}
                            </div>
                            {semanaInfo.dias.map((dia) => (
                              <div 
                                key={dia.key} 
                                onClick={() => {
                                  if (dia.fecha_iso && esFechaHoraPasada(dia.fecha_iso, hora)) {
                                    mostrarToast('No es posible seleccionar un horario que ya ha transcurrido.', 'warning');
                                    return;
                                  }
                                  if (inspeccionesPendientes.length > 0) {
                                    handleAbrirProgramar(inspeccionesPendientes[0], dia.fecha_iso, hora);
                                  } else {
                                    handleAbrirProgramar(null, dia.fecha_iso, hora);
                                  }
                                }}
                                className="border-l border-slate-100 h-full hover:bg-blue-50/30 transition cursor-pointer" 
                                title={`Programar inspección para el ${dia.nombre} ${dia.numero} a las ${hora}`}
                              />
                            ))}
                          </div>
                        ))}

                        {/* Bloques Dinámicos de Eventos Programados */}
                        {eventosSemana.map((evt) => {
                          const startM = evt.startMinutes || (9 * 60);
                          const durM = evt.durationMinutes || 90;
                          
                          // Cálculo preciso de posición top y altura (08:00 es el minuto 480)
                          const topPx = Math.max(0, ((startM - 8 * 60) / 60) * 48);
                          const heightPx = Math.max(36, (durM / 60) * 48);
                          const leftPct = (evt.diaIndex + 1) * 16.666;

                          const isCompletada = evt.estado_inspeccion === 'Completada';
                          const isBlue = evt.color === 'blue';

                          return (
                            <div 
                              key={evt.id}
                              onClick={() => handleVerDetalleEvento(evt)}
                              style={{
                                position: 'absolute',
                                left: `calc(${leftPct}% + 4px)`,
                                width: 'calc(16.666% - 8px)',
                                top: `${topPx}px`,
                                height: `${heightPx}px`
                              }}
                              className={`
                                rounded-xl p-2 cursor-pointer hover:shadow-md transition shadow-2xs flex flex-col justify-between text-left overflow-hidden z-10
                                ${isCompletada
                                  ? 'bg-emerald-100/95 border-l-4 border-l-emerald-600 border border-emerald-300'
                                  : isBlue 
                                    ? 'bg-blue-100/90 border-l-4 border-l-blue-600 border border-blue-200' 
                                    : 'bg-amber-100/90 border-l-4 border-l-amber-500 border border-amber-200'
                                }
                              `}
                              title={`${evt.establecimiento} (${isCompletada ? 'Completada con Acta Emitida' : evt.subtitulo})`}
                            >
                              <div className="flex items-center space-x-1">
                                {isCompletada && <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />}
                                <span className={`font-bold text-[11px] truncate ${isCompletada ? 'text-emerald-950' : 'text-slate-900'}`}>
                                  {evt.titulo || evt.establecimiento}
                                </span>
                              </div>
                              <span className={`text-[10px] font-bold ${
                                isCompletada ? 'text-emerald-800' : isBlue ? 'text-blue-900' : 'text-amber-900'
                              }`}>
                                {isCompletada ? `✓ Completada (${evt.horaInicio})` : (evt.subtitulo || `${evt.horaInicio} - ${evt.horaFin}`)}
                              </span>
                            </div>
                          );
                        })}

                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Botón Flotante Inferior: "+ Nuevo Registro de Inspección" */}
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => handleAbrirProgramar(inspeccionesPendientes[0] || null)}
                  className="bg-[#1b2533] hover:bg-[#111827] text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transition flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Nuevo Registro de Inspección</span>
                </button>
              </div>

            </div>
          )}

          {/* VISTA 2: RUTAS DE INSPECCIÓN */}
          {seccionActiva === 'rutas-inspeccion' && (
            <RutasInspeccionView
              usuario={usuario}
              onCambiarSeccion={(sec) => navigate(`/supervisor/${sec}`)}
              mostrarToast={mostrarToast}
            />
          )}

          {/* VISTA 3: ACTAS EMITIDAS */}
          {seccionActiva === 'actas-emitidas' && (
            <ActasEmitidasView
              usuario={usuario}
              mostrarToast={mostrarToast}
            />
          )}

          {/* VISTA 4: CITACIONES EMITIDAS */}
          {seccionActiva === 'citaciones-emitidas' && (
            <CitacionesEmitidasView
              usuario={usuario}
              mostrarToast={mostrarToast}
            />
          )}

          {/* OTRAS VISTAS DEL MENÚ LATERAL (Fallback) */}
          {seccionActiva !== 'mi-agenda' && seccionActiva !== 'rutas-inspeccion' && seccionActiva !== 'actas-emitidas' && seccionActiva !== 'citaciones-emitidas' && (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xs min-h-[420px] flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#005596] flex items-center justify-center">
                <itemActivo.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Sección: {itemActivo.label}
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                Contenido de la sección seleccionada.
              </p>
            </div>
          )}

        </main>

      </div>

      {/* ===================================================================== */}
      {/* 4. MODAL: DETALLE / REPROGRAMACIÓN DE INSPECCIÓN                       */}
      {/* ===================================================================== */}
      {modalInspeccionOpen && inspeccionSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    inspeccionSeleccionada.estado_inspeccion === 'Completada'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-[#005596] border-blue-200'
                  }`}>
                    {inspeccionSeleccionada.estado_inspeccion === 'Completada'
                      ? '✓ Inspección Realizada'
                      : 'Detalle de Inspección Técnica'
                    }
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                  {inspeccionSeleccionada.establecimiento || inspeccionSeleccionada.titulo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalInspeccionOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!modoReprogramar ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Tipo de Trámite:</span>
                    <span className="font-bold text-slate-800">{inspeccionSeleccionada.tipo || 'Inspección de Apertura'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Horario Programado:</span>
                    <span className="font-bold text-[#005596]">{inspeccionSeleccionada.subtitulo || `${inspeccionSeleccionada.horaInicio} - ${inspeccionSeleccionada.horaFin}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Fecha:</span>
                    <span className="font-bold text-slate-800">{inspeccionSeleccionada.fecha || 'Semana Actual'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Municipio:</span>
                    <span className="font-bold text-slate-800">{inspeccionSeleccionada.municipio || 'CERCADO'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Dirección:</span>
                    <span className="font-bold text-slate-800 text-right max-w-[200px]">{inspeccionSeleccionada.direccion || 'Cochabamba'}</span>
                  </div>
                  {inspeccionSeleccionada.telefono && (
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Contacto:</span>
                      <span className="font-bold text-slate-800">{inspeccionSeleccionada.telefono}</span>
                    </div>
                  )}
                  {inspeccionSeleccionada.estado_inspeccion === 'Completada' && inspeccionSeleccionada.veredicto_final && (
                    <div className="flex justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-slate-400 font-medium">Veredicto Emitido:</span>
                      <span className="font-extrabold text-emerald-700">{inspeccionSeleccionada.veredicto_final}</span>
                    </div>
                  )}
                </div>

                {inspeccionSeleccionada.estado_inspeccion === 'Completada' ? (
                  <div className="flex items-center space-x-2 p-3 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-emerald-900 text-[11px] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Esta inspección ya fue realizada y cuenta con acta oficial emitida. No puede ser modificada ni reprogramada.</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Estado: <strong className="text-blue-700">{inspeccionSeleccionada.estado_inspeccion || 'Programada'}</strong></span>
                    <button
                      type="button"
                      onClick={() => setModoReprogramar(true)}
                      className="text-[#0060a8] hover:underline font-bold cursor-pointer"
                    >
                      Reprogramar fecha/hora
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  {inspeccionSeleccionada.estado_inspeccion === 'Completada' ? (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Acta Registrada</span>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDesagendar}
                      className="text-rose-600 hover:text-rose-800 text-xs font-bold hover:underline cursor-pointer"
                    >
                      Mover a Pendientes
                    </button>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setModalInspeccionOpen(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                    >
                      Cerrar
                    </button>
                    {inspeccionSeleccionada.estado_inspeccion === 'Completada' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setModalInspeccionOpen(false);
                          navigate('/supervisor/actas-emitidas');
                        }}
                        className="bg-[#1b2533] hover:bg-[#111827] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center space-x-1.5"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Ver en Actas Emitidas</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setModalInspeccionOpen(false);
                          navigate('/supervisor/actas-emitidas');
                        }}
                        className="bg-[#005596] hover:bg-[#003e6d] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center space-x-1.5"
                      >
                        <FileCheck2 className="w-4 h-4" />
                        <span>Iniciar Acta</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGuardarReprogramacion} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Nueva Fecha</label>
                    <input
                      type="date"
                      required
                      min={hoyLocalIso()}
                      value={reprogramarFecha}
                      onChange={(e) => setReprogramarFecha(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Nueva Hora</label>
                    <input
                      type="time"
                      required
                      value={reprogramarHora}
                      onChange={(e) => setReprogramarHora(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Motivo del Cambio</label>
                  <input
                    type="text"
                    placeholder="Ej: Solicitud de reprogramación por el laboratorio"
                    value={reprogramarMotivo}
                    onChange={(e) => setReprogramarMotivo(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModoReprogramar(false)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    className="bg-[#005596] hover:bg-[#003e6d] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer"
                  >
                    Confirmar Cambio
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. MODAL: NUEVO REGISTRO DE INSPECCIÓN (ESTRUCTURA FIGMA INSTITUCIONAL) */}
      {/* ===================================================================== */}
      {modalAgendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            
            {/* Cabecera del Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Nuevo Registro de Inspección
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalAgendarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarAgendamiento} className="space-y-6 text-xs">
              
              {/* ------------------------------------------------------------- */}
              {/* SECCIÓN 1: DATOS DEL ESTABLECIMIENTO                          */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-3.5">
                <h4 className="text-[11px] font-black text-slate-800 tracking-wider uppercase">
                  1. DATOS DEL ESTABLECIMIENTO
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Establecimiento */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Establecimiento</label>
                    <select
                      value={tramiteSeleccionado?.tramite_id || tramiteSeleccionado?.id || ''}
                      onChange={(e) => {
                        const sel = inspeccionesPendientes.find(p => (p.tramite_id === e.target.value || p.id === e.target.value));
                        setTramiteSeleccionado(sel || null);
                      }}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6] cursor-pointer"
                    >
                      <option value="">Seleccione un establecimiento</option>
                      {inspeccionesPendientes.map((p) => (
                        <option key={p.id} value={p.tramite_id || p.id}>
                          {p.establecimiento || p.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Código del Establecimiento */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Código del Establecimiento</label>
                    <input
                      type="text"
                      disabled
                      value={tramiteSeleccionado ? (tramiteSeleccionado.codigo_establecimiento || tramiteSeleccionado.codigo || '') : ''}
                      placeholder="Se completará automáticamente"
                      className="w-full bg-slate-100/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-slate-500 text-xs font-medium cursor-not-allowed select-none"
                    />
                  </div>

                  {/* Dirección */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Dirección</label>
                    <input
                      type="text"
                      disabled
                      value={tramiteSeleccionado ? (tramiteSeleccionado.direccion || '') : ''}
                      placeholder="Se completará automáticamente"
                      className="w-full bg-slate-100/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-slate-500 text-xs font-medium cursor-not-allowed select-none"
                    />
                  </div>

                  {/* Propietario / Responsable */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Propietario / Responsable</label>
                    <input
                      type="text"
                      disabled
                      value={tramiteSeleccionado ? (tramiteSeleccionado.propietario || '') : ''}
                      placeholder="Se completará automáticamente"
                      className="w-full bg-slate-100/80 border border-slate-200/80 rounded-xl px-3.5 py-2.5 text-slate-500 text-xs font-medium cursor-not-allowed select-none"
                    />
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------- */}
              {/* SECCIÓN 2: DATOS DE LA INSPECCIÓN                             */}
              {/* ------------------------------------------------------------- */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-[11px] font-black text-slate-800 tracking-wider uppercase">
                  2. DATOS DE LA INSPECCIÓN
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fecha de Inspección */}
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="font-bold text-slate-700">Fecha de Inspección</label>
                    <input
                      type="date"
                      required
                      min={hoyLocalIso()}
                      value={formFecha}
                      onChange={(e) => setFormFecha(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                    />
                  </div>

                  {/* Hora de Inicio */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Hora de Inicio</label>
                    <input
                      type="time"
                      required
                      value={formHora}
                      onChange={(e) => {
                        const hIni = e.target.value;
                        setFormHora(hIni);
                        try {
                          const [hh, mm] = hIni.split(':').map(Number);
                          const totalMin = hh * 60 + mm + 90;
                          const endH = String(Math.floor(totalMin / 60)).padStart(2, '0');
                          const endM = String(totalMin % 60).padStart(2, '0');
                          setFormHoraFin(`${endH}:${endM}`);
                        } catch {
                          // keep default
                        }
                      }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                    />
                  </div>

                  {/* Hora de Finalización */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700">Hora de Finalización</label>
                    <input
                      type="time"
                      required
                      value={formHoraFin}
                      onChange={(e) => setFormHoraFin(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de Acción (Estilo Figma) */}
              <div className="flex items-center justify-end space-x-3 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAgendarOpen(false)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-6 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoAgendamiento || !tramiteSeleccionado}
                  className="bg-[#1b2533] hover:bg-[#111827] text-white text-xs font-bold px-7 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center space-x-2 disabled:opacity-50"
                >
                  {guardandoAgendamiento ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Registrando...</span>
                    </>
                  ) : (
                    <span>Registrar</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. TOAST NOTIFICATION FLOTANTE (CAPA SUPERIOR Z-[9999])               */}
      {/* ===================================================================== */}
      {toast && (
        <div 
          style={{ zIndex: 9999 }}
          className={`
            fixed bottom-6 right-6 flex items-center space-x-3 px-5 py-4 rounded-2xl shadow-2xl border text-xs font-bold animate-slideUp max-w-md
            ${toast.tipo === 'success' 
              ? 'bg-slate-900 text-emerald-400 border-slate-700 shadow-emerald-950/20' 
              : toast.tipo === 'warning'
              ? 'bg-amber-950 text-amber-300 border-amber-800 shadow-amber-950/40'
              : 'bg-rose-950 text-rose-300 border-rose-800 shadow-rose-950/40'
            }
          `}
        >
          {toast.tipo === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {toast.tipo === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
          {toast.tipo === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
          <div className="leading-snug">
            {toast.mensaje}
          </div>
        </div>
      )}

    </div>
  );
}
