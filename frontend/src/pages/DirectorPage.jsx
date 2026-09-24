import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  FlaskConical,
  X,
  Menu,
  Bell,
  LogOut,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  CheckCircle,
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  Activity,
  Award,
  ChevronRight,
  Clock,
  Sparkles,
  SlidersHorizontal,
  ArrowUpRight,
  PieChart,
  Target,
  Filter,
  Download,
  RotateCcw,
  FileSpreadsheet,
  Layers,
  MapPin,
  UserCheck,
  Stethoscope,
  ChevronDown,
  Check,
  Search
} from 'lucide-react';

import logoL1 from '../assets/L1.png';
import logoL2 from '../assets/L2.png';

// Obtener iniciales de 2 a 4 letras a partir de nombres y apellidos
const getInitials = (u) => {
  if (!u) return 'D';
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

  if (words.length === 0) return 'D';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
  return words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
};

// Paleta de colores para el avatar
const getAvatarColor = (nombre) => {
  const colors = [
    'bg-gradient-to-tr from-indigo-700 to-blue-900 text-white',
    'bg-gradient-to-tr from-[#0060a8] to-[#008fe6] text-white',
    'bg-gradient-to-tr from-slate-700 to-slate-900 text-white',
    'bg-gradient-to-tr from-teal-600 to-emerald-700 text-white'
  ];
  if (!nombre) return colors[0];
  let hash = 0;
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export default function DirectorPage() {
  const navigate = useNavigate();
  const { seccion } = useParams();

  const SECCIONES_VALIDAS = ['consola-administracion', 'metricas-indicadores'];
  const seccionActiva = SECCIONES_VALIDAS.includes(seccion) ? seccion : 'consola-administracion';

  const [usuario, setUsuario] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [toast, setToast] = useState(null);

  // Datos reales de la consola del Director
  const [datosConsola, setDatosConsola] = useState({
    kpis: {
      tramites_en_curso: { valor: 0, subtexto: '+0 esta semana' },
      tiempo_promedio: { valor: '0 días', subtexto: 'Sin trámites concluidos aún' },
      alertas_criticas: { valor: 0, subtexto: '0 observados / 0 docs obs.' }
    },
    rendimiento_supervisores: [],
    distribucion_tramites: {
      total: 0,
      aperturas_conteo: 0,
      aperturas_porcentaje: 0,
      renovaciones_conteo: 0,
      renovaciones_porcentaje: 0
    },
    trazabilidad_reciente: []
  });

  // Estados para la sección de Métricas e Indicadores
  const [filtros, setFiltros] = useState({
    periodo_anio: 2026,
    periodo_mes: '',
    municipio: '',
    tipo_laboratorio: '',
    estado: '',
    nombre_laboratorio: '',
    nivel: '',
    propietario: '',
    responsable_laboratorio: '',
    responsables_areas: '',
    direccion: ''
  });

  const [opcionesFiltros, setOpcionesFiltros] = useState({
    municipios: [],
    tipos: [],
    estados: [],
    nombres: [],
    niveles: [],
    propietarios: [],
    responsables_laboratorio: [],
    responsables_areas: [],
    direcciones: []
  });

  const [datosMetricas, setDatosMetricas] = useState(null);
  const [cargandoMetricas, setCargandoMetricas] = useState(false);
  const [hoveredMes, setHoveredMes] = useState(null);
  const [hoveredMunBar, setHoveredMunBar] = useState(null);

  // Notificaciones
  const [notificaciones, setNotificaciones] = useState([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Mostrar mensaje emergente Toast
  const mostrarToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Cargar opciones de filtros desde backend
  const cargarOpcionesFiltros = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:8000/api/director/filtros-opciones');
      if (res.ok) {
        const data = await res.json();
        setOpcionesFiltros(data);
      }
    } catch (err) {
      console.warn('Error al cargar opciones de filtros:', err);
    }
  }, []);

  useEffect(() => {
    cargarOpcionesFiltros();
  }, [cargarOpcionesFiltros]);

  // 2. Cargar métricas e indicadores con filtros dinámicos (con soporte para refresco silencioso)
  const cargarMetricasIndicadores = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargandoMetricas(true);
    try {
      const params = new URLSearchParams();
      if (filtros.periodo_anio) params.append('periodo_anio', filtros.periodo_anio);
      if (filtros.periodo_mes) params.append('periodo_mes', filtros.periodo_mes);
      if (filtros.municipio) params.append('municipio', filtros.municipio);
      if (filtros.tipo_laboratorio) params.append('tipo_laboratorio', filtros.tipo_laboratorio);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.nombre_laboratorio) params.append('nombre_laboratorio', filtros.nombre_laboratorio);
      if (filtros.nivel) params.append('nivel', filtros.nivel);
      if (filtros.propietario) params.append('propietario', filtros.propietario);
      if (filtros.responsable_laboratorio) params.append('responsable_laboratorio', filtros.responsable_laboratorio);
      if (filtros.responsables_areas) params.append('responsables_areas', filtros.responsables_areas);
      if (filtros.direccion) params.append('direccion', filtros.direccion);

      const res = await fetch(`http://localhost:8000/api/director/metricas-indicadores?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setDatosMetricas(data);
      }
    } catch (err) {
      console.warn('Error al cargar métricas e indicadores:', err);
    } finally {
      if (!silencioso) setCargandoMetricas(false);
    }
  }, [filtros]);

  useEffect(() => {
    cargarMetricasIndicadores();
  }, [cargarMetricasIndicadores]);

  // Polling silencioso en segundo plano y al recuperar foco de ventana
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        cargarMetricasIndicadores(true);
      }
    }, 5000);

    const onFocus = () => {
      cargarMetricasIndicadores(true);
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [cargarMetricasIndicadores]);

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleLimpiarFiltros = () => {
    setFiltros({
      periodo_anio: 2026,
      periodo_mes: '',
      municipio: '',
      tipo_laboratorio: '',
      estado: '',
      nombre_laboratorio: '',
      nivel: '',
      propietario: '',
      responsable_laboratorio: '',
      responsables_areas: '',
      direccion: ''
    });
    mostrarToast('Filtros reestablecidos a valores globales.');
  };

  const handleDescargarInforme = () => {
    window.print();
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

  // 2. Cargar datos de la Consola desde Backend FastAPI
  const cargarDatosConsolaBackend = useCallback(async () => {
    setCargando(true);
    try {
      const res = await fetch('http://localhost:8000/api/director/consola');
      if (res.ok) {
        const data = await res.json();
        setDatosConsola(data);
      }
    } catch (err) {
      console.warn('Error al cargar datos de consola del director:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarDatosConsolaBackend();
  }, [cargarDatosConsolaBackend]);

  // 3. Cargar notificaciones desde el backend
  const cargarNotificaciones = useCallback(async () => {
    try {
      const email = usuario?.email || 'director@sedes.gob.bo';
      const res = await fetch(`http://localhost:8000/api/notificaciones?usuario_email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setNotificaciones(data.notificaciones || []);
      }
    } catch (err) {
      console.warn('No se pudieron cargar notificaciones:', err);
    }
  }, [usuario]);

  useEffect(() => {
    cargarNotificaciones();
  }, [cargarNotificaciones]);

  const handleMarcarNotifLeida = async (id) => {
    try {
      await fetch(`http://localhost:8000/api/notificaciones/${id}/leer`, { method: 'PATCH' });
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
    } catch (err) {
      console.warn('Error al marcar notificación:', err);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      const email = usuario?.email || 'director@sedes.gob.bo';
      await fetch(`http://localhost:8000/api/notificaciones/marcar-todas?usuario_email=${encodeURIComponent(email)}`, { method: 'PATCH' });
      setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
    } catch (err) {
      console.warn('Error al marcar todas las notificaciones:', err);
    }
  };

  const notifNoLeidas = notificaciones.filter(n => !n.leido).length;

  // Menú lateral estructurado
  const menuItems = [
    {
      id: 'consola-administracion',
      path: '/director/consola-administracion',
      label: 'Consola de Administración',
      icon: LayoutDashboard,
      tituloBreadcrumb: 'Consola de Administración y Dirección General',
      descripcion: 'Supervisión centralizada del sistema departamental de salud y control gerencial.'
    },
    {
      id: 'metricas-indicadores',
      path: '/director/metricas-indicadores',
      label: 'Métricas e Indicadores',
      icon: BarChart3,
      tituloBreadcrumb: 'Métricas, Estadísticas e Indicadores Clave',
      descripcion: 'Visualización de datos analíticos, tiempos de atención, resoluciones e inspecciones.'
    }
  ];

  const [vistaSupervisores, setVistaSupervisores] = useState('top5');

  const itemActivo = menuItems.find(item => item.id === seccionActiva) || menuItems[0];

  const nombreDirector = usuario 
    ? (usuario.nombres && usuario.apellidos ? `${usuario.nombres} ${usuario.apellidos}` : (usuario.nombre || usuario.nombreCompleto || 'Fernando Castillo').replace(/^Dr\.\s*/i, '')) 
    : 'Fernando Castillo';

  // Cálculos para Gráficos
  const listaSupervisores = datosConsola.rendimiento_supervisores || [];
  const supervisoresMostrados = vistaSupervisores === 'top5' ? listaSupervisores.slice(0, 5) : listaSupervisores;
  const maxActas = Math.max(...listaSupervisores.map(s => s.actas_emitidas || 0), 1);
  const totalActasGlobal = listaSupervisores.reduce((acc, curr) => acc + (curr.actas_emitidas || 0), 0);

  const donutRadius = 45;
  const donutCircumference = 2 * Math.PI * donutRadius; // ~282.74
  const totalTramites = datosConsola.distribucion_tramites?.total ?? 0;
  const aperturasPct = datosConsola.distribucion_tramites?.aperturas_porcentaje ?? 0;
  const renovacionesPct = datosConsola.distribucion_tramites?.renovaciones_porcentaje ?? 0;
  const aperturasStroke = (aperturasPct / 100) * donutCircumference;
  const renovacionesStroke = (renovacionesPct / 100) * donutCircumference;

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
                    w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 cursor-pointer text-left
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
      {/* 2. CONTENEDOR PRINCIPAL Y HEADER SUPERIOR                                 */}
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
              <span className="hover:text-slate-700 cursor-pointer">Dirección SEDES</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-800">
                {itemActivo.tituloBreadcrumb}
              </span>
            </div>
          </div>

          {/* Perfil del Director & Notificaciones */}
          <div className="flex items-center space-x-3 sm:space-x-5">

            {/* Botón Refrescar Datos */}
            <button
              onClick={() => {
                cargarDatosConsolaBackend();
                cargarNotificaciones();
                mostrarToast('Métricas y datos sincronizados con la Base de Datos.');
              }}
              className="p-2 text-slate-400 hover:text-[#0077c8] hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="Refrescar datos desde la Base de Datos"
            >
              <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin text-[#0077c8]' : ''}`} />
            </button>

            {/* Campana de Notificaciones */}
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
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Dropdown de Notificaciones */}
              {notifDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotifDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-xs font-black text-slate-800">Notificaciones</h4>
                        {notifNoLeidas > 0 && (
                          <span className="bg-[#0077c8] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                            {notifNoLeidas} nuevas
                          </span>
                        )}
                      </div>
                      {notifNoLeidas > 0 && (
                        <button
                          onClick={handleMarcarTodasLeidas}
                          className="text-[11px] text-[#0077c8] hover:underline font-bold"
                        >
                          Marcar leídas
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notificaciones.length === 0 ? (
                        <div className="p-6 text-center text-slate-400">
                          <CheckCircle className="w-6 h-6 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-700">Sin notificaciones pendientes</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">No hay eventos que requieran su atención inmediata.</p>
                        </div>
                      ) : (
                        notificaciones.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => handleMarcarNotifLeida(notif.id)}
                            className={`p-3.5 transition cursor-pointer flex items-start gap-3 ${
                              notif.leido ? 'bg-white hover:bg-slate-50 opacity-80' : 'bg-sky-50/60 hover:bg-sky-50/90 border-l-4 border-l-[#0077c8]'
                            }`}
                          >
                            <div className="p-2 rounded-xl bg-blue-100 text-blue-700 shrink-0">
                              <Bell className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs text-slate-900 leading-snug ${notif.leido ? 'font-medium' : 'font-bold'}`}>
                                {notif.titulo}
                              </p>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                {notif.mensaje}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Perfil del Director */}
            <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {nombreDirector}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  Director General SEDES
                </p>
              </div>

              {/* Avatar de Iniciales */}
              <div className={`w-9 h-9 rounded-full ${getAvatarColor(nombreDirector)} text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-slate-100 select-none tracking-tight`}>
                <span>{getInitials(usuario || { nombreCompleto: nombreDirector })}</span>
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
        {toast && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 text-xs sm:text-sm animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{toast.mensaje}</span>
            <button onClick={() => setToast(null)} className="ml-2 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. CONTENIDO PRINCIPAL: DASHBOARD CONSOLA DE ADMINISTRACIÓN               */}
        {/* ========================================================================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-7 lg:p-9 space-y-6 max-w-7xl mx-auto w-full">

          {/* VISTA 1: CONSOLA DE ADMINISTRACIÓN (MOCKUP EXACTO) */}
          {seccionActiva === 'consola-administracion' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* ----------------------------------------------------------------- */}
              {/* FILA 1: 3 TARJETAS KPI SUPERIORES CON BORDES DE ACENTO            */}
              {/* ----------------------------------------------------------------- */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* KPI 1: Trámites en Curso */}
                <div className="bg-white rounded-2xl p-6 border-l-4 border-l-[#2563eb] border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 tracking-wide">
                      Trámites en Curso
                    </p>
                    <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {datosConsola.kpis?.tramites_en_curso?.valor ?? 0}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      {datosConsola.kpis?.tramites_en_curso?.subtexto ?? '+0 esta semana'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                    <TrendingUp className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>

                {/* KPI 2: Tiempo Promedio de Cierre */}
                <div className="bg-white rounded-2xl p-6 border-l-4 border-l-[#10b981] border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 tracking-wide">
                      Tiempo Promedio de Cierre
                    </p>
                    <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {datosConsola.kpis?.tiempo_promedio?.valor ?? '0 días'}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      {datosConsola.kpis?.tiempo_promedio?.subtexto ?? 'Sin trámites concluidos aún'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                    <TrendingUp className="w-6 h-6 stroke-[2.5] rotate-90" />
                  </div>
                </div>

                {/* KPI 3: Alertas Críticas */}
                <div className="bg-white rounded-2xl p-6 border-l-4 border-l-[#ef4444] border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-500 tracking-wide">
                      Alertas Críticas
                    </p>
                    <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                      {datosConsola.kpis?.alertas_criticas?.valor ?? 0}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      {datosConsola.kpis?.alertas_criticas?.subtexto ?? '0 observados'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                    <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                  </div>
                </div>

              </div>

              {/* ----------------------------------------------------------------- */}
              {/* FILA 2: RENDIMIENTO POR SUPERVISOR + ESTADO DE TRÁMITES (DONUT)   */}
              {/* ----------------------------------------------------------------- */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* COLUMNA IZQUIERDA: Rendimiento por Supervisor (Ranking Horizontal Escalable) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
                  
                  {/* Cabecera de la Tarjeta con Filtro Top 5 / Todos */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3.5">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        Rendimiento por Supervisor
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        Medido por actas oficiales de inspección emitidas en campo
                      </p>
                    </div>

                    {/* Selector Top 5 / Todos */}
                    {listaSupervisores.length > 5 && (
                      <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-bold self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setVistaSupervisores('top5')}
                          className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                            vistaSupervisores === 'top5'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Top 5
                        </button>
                        <button
                          type="button"
                          onClick={() => setVistaSupervisores('todos')}
                          className={`px-3 py-1 rounded-lg transition cursor-pointer ${
                            vistaSupervisores === 'todos'
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          Todos ({listaSupervisores.length})
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Lista de Barras Horizontales (Leaderboard Escalable) */}
                  <div className={`space-y-4 ${vistaSupervisores === 'todos' ? 'max-h-80 overflow-y-auto pr-1.5' : ''}`}>
                    {supervisoresMostrados.length === 0 ? (
                      <div className="py-10 text-center text-slate-400">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-600">No hay supervisores con actas registradas</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Las inspecciones completadas aparecerán aquí automáticamente.</p>
                      </div>
                    ) : (
                      supervisoresMostrados.map((sup, index) => {
                        const val = sup.actas_emitidas ?? 0;
                        const widthPercent = maxActas > 0 ? Math.min(100, Math.max(val > 0 ? 8 : 2, (val / maxActas) * 100)) : 0;

                        return (
                          <div key={sup.id || index} className="space-y-1.5 group">
                            {/* Fila Superior: Posición + Avatar + Nombre + Conteo de Actas */}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2.5 min-w-0">
                                {/* Medalla o Número de Puesto */}
                                <span className={`w-5 text-center font-black text-[11px] ${
                                  index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-400'
                                }`}>
                                  #{index + 1}
                                </span>

                                {/* Avatar con Iniciales */}
                                <div className={`w-6 h-6 rounded-full ${getAvatarColor(sup.nombre_completo || sup.nombre_corto)} text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs`}>
                                  <span>{getInitials({ nombreCompleto: sup.nombre_completo || sup.nombre_corto })}</span>
                                </div>

                                {/* Nombre Completo del Supervisor */}
                                <span className="font-bold text-slate-800 truncate" title={sup.nombre_completo}>
                                  {sup.nombre_completo || sup.nombre_corto}
                                </span>
                              </div>

                              {/* Badge con el Total de Actas */}
                              <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                                <span className="font-extrabold text-slate-900 text-xs">
                                  {val}
                                </span>
                                <span className="text-[11px] text-slate-400 font-medium">
                                  actas
                                </span>
                              </div>
                            </div>

                            {/* Barra Horizontal de Progreso */}
                            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${widthPercent}%` }}
                                className="h-full bg-gradient-to-r from-[#1e2d42] to-[#005596] rounded-full transition-all duration-500 group-hover:brightness-110"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Resumen al Pie */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>Fiscalización técnica activa</span>
                    <span className="font-bold text-slate-700">
                      Total: {totalActasGlobal} actas emitidas
                    </span>
                  </div>

                </div>

                {/* COLUMNA DERECHA: Estado de Trámites (Donut Chart) */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Estado de Trámites
                  </h3>

                  {/* Gráfico Donut SVG con Centro Dinámico */}
                  <div className="flex flex-col items-center justify-center my-auto py-2">
                    <div className="relative w-48 h-48 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                        {totalTramites === 0 ? (
                          <circle
                            cx="60"
                            cy="60"
                            r={donutRadius}
                            fill="transparent"
                            stroke="#e2e8f0"
                            strokeWidth="18"
                          />
                        ) : (
                          <>
                            {/* Segmento Fondo / Renovaciones (Cyan) */}
                            <circle
                              cx="60"
                              cy="60"
                              r={donutRadius}
                              fill="transparent"
                              stroke="#22b8cf"
                              strokeWidth="18"
                              strokeDasharray={donutCircumference}
                              strokeDashoffset="0"
                            />
                            {/* Segmento Aperturas (Dark Navy) */}
                            <circle
                              cx="60"
                              cy="60"
                              r={donutRadius}
                              fill="transparent"
                              stroke="#1e2d42"
                              strokeWidth="18"
                              strokeDasharray={`${aperturasStroke} ${donutCircumference}`}
                              strokeDashoffset="0"
                              strokeLinecap="butt"
                            />
                          </>
                        )}
                      </svg>

                      {/* Texto Central */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                          {totalTramites}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          Total
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Leyenda Inferior */}
                  <div className="flex items-center justify-center space-x-6 text-xs font-bold pt-2 border-t border-slate-100">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-[#1e2d42] shrink-0" />
                      <span className="text-slate-800">
                        Aperturas ({aperturasPct}%)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full bg-[#22b8cf] shrink-0" />
                      <span className="text-slate-800">
                        Renovaciones ({renovacionesPct}%)
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* ----------------------------------------------------------------- */}
              {/* FILA 3: BITÁCORA DE TRAZABILIDAD RECIENTE (TABLA)                 */}
              {/* ----------------------------------------------------------------- */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">
                    Bitácora de Trazabilidad Reciente
                  </h3>
                </div>

                {/* Tabla de Registros */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-6">FUNCIONARIO</th>
                        <th className="py-3.5 px-6">ACCIÓN</th>
                        <th className="py-3.5 px-6">FECHA</th>
                        <th className="py-3.5 px-6 text-right">EXPEDIENTE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {(!datosConsola.trazabilidad_reciente || datosConsola.trazabilidad_reciente.length === 0) ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-400">
                            <FileText className="w-7 h-7 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-600">Sin registros de trazabilidad recientes</p>
                            <p className="text-[11px] text-slate-400 mt-0.5">Las acciones del sistema quedarán auditadas aquí en tiempo real.</p>
                          </td>
                        </tr>
                      ) : (
                        datosConsola.trazabilidad_reciente.map((row, idx) => {
                          const esSistema = row.es_sistema || row.funcionario?.toLowerCase() === 'sistema';
                          return (
                            <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                              {/* Funcionario con Dot de Estado */}
                              <td className="py-4 px-6 font-bold text-slate-900">
                                <div className="flex items-center space-x-2.5">
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${esSistema ? 'bg-rose-500' : 'bg-blue-600'}`} />
                                  <span className="truncate">{row.funcionario}</span>
                                </div>
                              </td>

                              {/* Acción */}
                              <td className="py-4 px-6 text-slate-600 font-medium">
                                {row.accion}
                              </td>

                              {/* Fecha */}
                              <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                                {row.fecha}
                              </td>

                              {/* Expediente Badge */}
                              <td className="py-4 px-6 text-right whitespace-nowrap">
                                <span className={`inline-flex items-center px-3 py-1 rounded-md text-[11px] font-extrabold tracking-wide border ${
                                  esSistema
                                    ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                                    : 'bg-blue-50 text-blue-700 border-blue-200/80'
                                }`}>
                                  {row.expediente}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>
          )}

          {/* VISTA 2: MÉTRICAS E INDICADORES (COMPLETA Y REACTIVA) */}
          {seccionActiva === 'metricas-indicadores' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* ============================================================= */}
              {/* CABECERA: TÍTULO + SELECTOR PERIODO + DESCARGAR INFORME       */}
              {/* ============================================================= */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Métricas e Indicadores
                    {cargandoMetricas && (
                      <RefreshCw className="w-4 h-4 text-[#0077c8] animate-spin" />
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Análisis detallado del rendimiento departamental y fiscalización en salud.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Selector Periodo */}
                  <div className="relative">
                    <select
                      value={filtros.periodo_mes || ''}
                      onChange={(e) => handleFiltroChange('periodo_mes', e.target.value)}
                      className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-3.5 py-2.5 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[#0077c8] cursor-pointer shadow-2xs"
                    >
                      <option value="">Periodo: Todo 2026</option>
                      <option value="1">Periodo: Enero 2026</option>
                      <option value="2">Periodo: Febrero 2026</option>
                      <option value="3">Periodo: Marzo 2026</option>
                      <option value="4">Periodo: Abril 2026</option>
                      <option value="5">Periodo: Mayo 2026</option>
                      <option value="6">Periodo: Junio 2026</option>
                      <option value="7">Periodo: Julio 2026</option>
                      <option value="8">Periodo: Agosto 2026</option>
                      <option value="9">Periodo: Septiembre 2026</option>
                      <option value="10">Periodo: Octubre 2026</option>
                      <option value="11">Periodo: Noviembre 2026</option>
                      <option value="12">Periodo: Diciembre 2026</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* Botón Descargar Informe */}
                  <button
                    type="button"
                    onClick={handleDescargarInforme}
                    className="inline-flex items-center space-x-2 bg-[#1e2d42] hover:bg-[#2b3d56] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
                    title="Imprimir o exportar informe"
                  >
                    <Download className="w-4 h-4 text-cyan-300" />
                    <span>Descargar Informe</span>
                  </button>
                </div>
              </div>

              {/* ============================================================= */}
              {/* BARRA DE 9 FILTROS MULTIDIMENSIONALES REACTIVOS               */}
              {/* ============================================================= */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2 text-slate-800">
                    <Filter className="w-4 h-4 text-[#0077c8]" />
                    <span className="text-xs font-black tracking-wide uppercase">Filtros Avanzados</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleLimpiarFiltros}
                    className="text-[11px] font-bold text-slate-500 hover:text-rose-600 transition flex items-center space-x-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Limpiar filtros</span>
                  </button>
                </div>

                {/* Grid de 9 Selectores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                  
                  {/* 1. Municipio */}
                  <div className="relative">
                    <select
                      value={filtros.municipio}
                      onChange={(e) => handleFiltroChange('municipio', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.municipio ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Municipio ▾</option>
                      {opcionesFiltros.municipios?.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 2. Tipo de Laboratorio */}
                  <div className="relative">
                    <select
                      value={filtros.tipo_laboratorio}
                      onChange={(e) => handleFiltroChange('tipo_laboratorio', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.tipo_laboratorio ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Tipo de Laboratorio ▾</option>
                      {opcionesFiltros.tipos?.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 3. Estado */}
                  <div className="relative">
                    <select
                      value={filtros.estado}
                      onChange={(e) => handleFiltroChange('estado', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.estado ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Estado ▾</option>
                      {opcionesFiltros.estados?.map((est) => (
                        <option key={est} value={est}>{est}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 4. Nombre del Laboratorio */}
                  <div className="relative">
                    <select
                      value={filtros.nombre_laboratorio}
                      onChange={(e) => handleFiltroChange('nombre_laboratorio', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.nombre_laboratorio ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Nombre del Laboratorio ▾</option>
                      {opcionesFiltros.nombres?.map((nom) => (
                        <option key={nom} value={nom}>{nom}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 5. Nivel */}
                  <div className="relative">
                    <select
                      value={filtros.nivel}
                      onChange={(e) => handleFiltroChange('nivel', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.nivel ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Nivel ▾</option>
                      {opcionesFiltros.niveles?.map((nv) => (
                        <option key={nv} value={nv}>{nv}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 6. Propietario */}
                  <div className="relative">
                    <select
                      value={filtros.propietario}
                      onChange={(e) => handleFiltroChange('propietario', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.propietario ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Propietario ▾</option>
                      {opcionesFiltros.propietarios?.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 7. Responsable del Laboratorio */}
                  <div className="relative">
                    <select
                      value={filtros.responsable_laboratorio}
                      onChange={(e) => handleFiltroChange('responsable_laboratorio', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.responsable_laboratorio ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Responsable del Lab ▾</option>
                      {opcionesFiltros.responsables_laboratorio?.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 8. Responsables de Áreas */}
                  <div className="relative">
                    <select
                      value={filtros.responsables_areas}
                      onChange={(e) => handleFiltroChange('responsables_areas', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.responsables_areas ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Resp. de Áreas ▾</option>
                      {opcionesFiltros.responsables_areas?.map((ra) => (
                        <option key={ra} value={ra}>{ra}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 9. Dirección */}
                  <div className="relative sm:col-span-2 lg:col-span-2">
                    <select
                      value={filtros.direccion}
                      onChange={(e) => handleFiltroChange('direccion', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.direccion ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Dirección / Ubicación ▾</option>
                      {opcionesFiltros.direcciones?.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                </div>
              </div>

              {/* ============================================================= */}
              {/* FILA 1: 3 TARJETAS KPI SUPERIORES                             */}
              {/* ============================================================= */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* KPI 1: Total Trámites */}
                <div className="bg-white rounded-2xl p-6 border-l-4 border-l-[#10b981] border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
                  <p className="text-xs font-semibold text-slate-500 tracking-wide">
                    Total Trámites {filtros.periodo_anio}
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {datosMetricas?.kpis?.total_tramites?.valor ?? 0}
                  </p>
                  <p className="text-xs font-bold text-emerald-600">
                    {datosMetricas?.kpis?.total_tramites?.subtexto ?? '+0 último mes'}
                  </p>
                </div>

                {/* KPI 2: Tasa de Aprobación */}
                <div className="bg-white rounded-2xl p-6 border-l-4 border-l-[#06b6d4] border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
                  <p className="text-xs font-semibold text-slate-500 tracking-wide">
                    Tasa de Aprobación
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {datosMetricas?.kpis?.tasa_aprobacion?.valor ?? '0%'}
                  </p>
                  <p className="text-xs font-bold text-cyan-600">
                    {datosMetricas?.kpis?.tasa_aprobacion?.subtexto ?? '0 trámites aprobados'}
                  </p>
                </div>

                {/* KPI 3: Tiempo Promedio Resolución */}
                <div className="bg-white rounded-2xl p-6 border-l-4 border-l-[#14b8a6] border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-2">
                  <p className="text-xs font-semibold text-slate-500 tracking-wide">
                    Tiempo Promedio Resolución
                  </p>
                  <p className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    {datosMetricas?.kpis?.tiempo_promedio?.valor ?? '0 días'}
                  </p>
                  <p className="text-xs font-bold text-teal-600">
                    {datosMetricas?.kpis?.tiempo_promedio?.subtexto ?? 'Promedio de resolución'}
                  </p>
                </div>

              </div>

              {/* ============================================================= */}
              {/* FILA 2: GRÁFICA TRÁMITES POR MES + DISTRIBUCIÓN POR TIPO      */}
              {/* ============================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* GRÁFICA DE LÍNEAS SVG: Trámites por Mes - 2026 */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Trámites por Mes - {filtros.periodo_anio}
                    </h3>
                    <div className="flex items-center space-x-4 text-xs font-bold">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1e2d42]" />
                        <span className="text-slate-700">Aperturas</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#22b8cf]" />
                        <span className="text-slate-700">Renovaciones</span>
                      </div>
                    </div>
                  </div>

                  {/* Renderizado de Curvas SVG Interactivas */}
                  {(() => {
                    const mesesData = datosMetricas?.tramites_por_mes || [];
                    const maxVal = Math.max(...mesesData.map(m => Math.max(m.aperturas || 0, m.renovaciones || 0)), 10);
                    const width = 500;
                    const height = 180;
                    const paddingX = 35;
                    const paddingY = 25;
                    const chartW = width - paddingX * 2;
                    const chartH = height - paddingY * 2;

                    const getX = (idx) => paddingX + (idx / Math.max(mesesData.length - 1, 1)) * chartW;
                    const getY = (val) => height - paddingY - (val / maxVal) * chartH;

                    const ptsAperturas = mesesData.map((d, i) => `${getX(i)},${getY(d.aperturas || 0)}`).join(' ');
                    const ptsRenovaciones = mesesData.map((d, i) => `${getX(i)},${getY(d.renovaciones || 0)}`).join(' ');

                    return (
                      <div className="relative w-full py-2">
                        <svg className="w-full h-48 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
                          {/* Líneas Guía Horizontales */}
                          {[0, 0.25, 0.5, 0.75, 1].map((p, i) => {
                            const y = height - paddingY - p * chartH;
                            const valLabel = Math.round(p * maxVal);
                            return (
                              <g key={i}>
                                <line x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                                <text x={paddingX - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#94a3b8" fontWeight="bold">
                                  {valLabel}
                                </text>
                              </g>
                            );
                          })}

                          {/* Línea Aperturas (Dark Navy) */}
                          <polyline
                            fill="none"
                            stroke="#1e2d42"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={ptsAperturas}
                          />

                          {/* Línea Renovaciones (Cyan) */}
                          <polyline
                            fill="none"
                            stroke="#22b8cf"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            points={ptsRenovaciones}
                          />

                          {/* Puntos y Nombres de Meses */}
                          {mesesData.map((d, i) => {
                            const x = getX(i);
                            const yAp = getY(d.aperturas || 0);
                            const yRen = getY(d.renovaciones || 0);

                            return (
                              <g key={i}>
                                {/* Punto Apertura */}
                                <circle
                                  cx={x}
                                  cy={yAp}
                                  r="3.5"
                                  fill="#1e2d42"
                                  className="cursor-pointer hover:r-5 transition-all"
                                  onMouseEnter={() => setHoveredMes({ mes: d.mes, aperturas: d.aperturas, renovaciones: d.renovaciones })}
                                  onMouseLeave={() => setHoveredMes(null)}
                                />
                                {/* Punto Renovación */}
                                <circle
                                  cx={x}
                                  cy={yRen}
                                  r="3.5"
                                  fill="#22b8cf"
                                  className="cursor-pointer hover:r-5 transition-all"
                                  onMouseEnter={() => setHoveredMes({ mes: d.mes, aperturas: d.aperturas, renovaciones: d.renovaciones })}
                                  onMouseLeave={() => setHoveredMes(null)}
                                />
                                {/* Label Mes */}
                                <text x={x} y={height - 5} textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">
                                  {d.mes}
                                </text>
                              </g>
                            );
                          })}
                        </svg>

                        {/* Tooltip Hover Dinámico */}
                        {hoveredMes && (
                          <div className="absolute top-2 right-4 bg-slate-900/90 text-white text-[11px] p-2.5 rounded-xl shadow-lg backdrop-blur-xs flex items-center space-x-3 pointer-events-none">
                            <span className="font-extrabold text-cyan-300">{hoveredMes.mes}:</span>
                            <span>Aperturas: <b>{hoveredMes.aperturas}</b></span>
                            <span>Renovaciones: <b>{hoveredMes.renovaciones}</b></span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* DISTRIBUCIÓN POR TIPO DE ESTABLECIMIENTO */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-3">
                    Distribución por Tipo de Establecimiento
                  </h3>

                  <div className="space-y-3.5 my-auto">
                    {(!datosMetricas?.distribucion_tipos || datosMetricas.distribucion_tipos.length === 0) ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No hay registros con los filtros seleccionados.</p>
                    ) : (
                      datosMetricas.distribucion_tipos.map((item, idx) => {
                        const colors = ['bg-[#1e2d42]', 'bg-[#22b8cf]', 'bg-[#0077c8]', 'bg-indigo-500', 'bg-slate-500'];
                        const colorBar = colors[idx % colors.length];

                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800 truncate" title={item.tipo}>
                                {item.tipo}
                              </span>
                              <span className="font-extrabold text-slate-900 shrink-0">
                                {item.cantidad} <span className="font-normal text-slate-400">({item.porcentaje}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.max(item.porcentaje, 4)}%` }}
                                className={`h-full ${colorBar} rounded-full transition-all duration-500`}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* ============================================================= */}
              {/* FILA 3: CUELLOS DE BOTELLA + RANKING DE SUPERVISORES           */}
              {/* ============================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* CUELLOS DE BOTELLA IDENTIFICADOS */}
                <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-3 flex items-center justify-between">
                    <span>Cuellos de Botella Identificados</span>
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                  </h3>

                  <div className="space-y-3">
                    {(!datosMetricas?.cuellos_botella || datosMetricas.cuellos_botella.length === 0) ? (
                      <p className="text-xs text-slate-400 py-6 text-center">Sin cuellos de botella detectados.</p>
                    ) : (
                      datosMetricas.cuellos_botella.map((cb) => {
                        const dotColor = cb.color === 'rose' ? 'bg-rose-500 ring-rose-200' : cb.color === 'amber' ? 'bg-amber-500 ring-amber-200' : 'bg-emerald-500 ring-emerald-200';
                        return (
                          <div key={cb.id} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                            <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ring-4 ${dotColor}`} />
                            <p className="text-xs font-medium text-slate-700 leading-snug">
                              {cb.mensaje}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* RANKING DE SUPERVISORES */}
                <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-3 flex items-center justify-between">
                    <span>Ranking de Supervisores</span>
                    <Award className="w-4 h-4 text-amber-500" />
                  </h3>

                  <div className="divide-y divide-slate-100 text-xs">
                    {(!datosMetricas?.ranking_supervisores || datosMetricas.ranking_supervisores.length === 0) ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No hay supervisores registrados con actas.</p>
                    ) : (
                      datosMetricas.ranking_supervisores.slice(0, 5).map((sup, idx) => (
                        <div key={sup.id} className="py-2.5 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className={`font-black text-[11px] w-5 text-center ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : 'text-slate-400'}`}>
                              #{idx + 1}
                            </span>
                            <span className="font-bold text-slate-800 truncate" title={sup.nombre}>
                              {sup.nombre}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 shrink-0">
                            <span className="font-extrabold text-slate-900">
                              {sup.actas} <span className="text-slate-400 font-normal">actas</span>
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${sup.badge_color}`}>
                              {sup.calificacion}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* ============================================================= */}
              {/* FILA 4: CANTIDAD POR MUNICIPIO + POR NIVEL DE LABORATORIO     */}
              {/* ============================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* CANTIDAD POR MUNICIPIO (BARRAS AGRUPADAS CON TOOLTIPS INTERACTIVOS) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        Cantidad por Municipio
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">
                        Pasa el cursor sobre cualquier barra para ver la cantidad exacta
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 text-xs font-bold">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#f97316]" />
                        <span className="text-slate-700">Privados</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2.5 h-2.5 rounded-xs bg-[#1e2d42]" />
                        <span className="text-slate-700">Públicos</span>
                      </div>
                    </div>
                  </div>

                  {/* Indicador flotante en cabecera si hay hover */}
                  <div className="h-6 flex items-center justify-end">
                    {hoveredMunBar ? (
                      <div className="bg-slate-900 text-white text-[11px] px-3 py-1 rounded-lg shadow-sm flex items-center space-x-2 animate-fadeIn">
                        <span className="font-extrabold text-amber-300">{hoveredMunBar.municipio}:</span>
                        <span>{hoveredMunBar.tipo}: <b>{hoveredMunBar.cantidad}</b></span>
                        <span className="text-slate-400 text-[10px]">(Total mun: {hoveredMunBar.total})</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Desglose departamental</span>
                    )}
                  </div>

                  {/* Gráfico de Barras Verticales Agrupadas con Tooltip Individual */}
                  <div className="h-48 flex items-end justify-around gap-2 pt-2 px-2 pb-1 border-b border-slate-100/80">
                    {(!datosMetricas?.cantidad_municipios || datosMetricas.cantidad_municipios.length === 0) ? (
                      <p className="text-xs text-slate-400 py-12 text-center w-full">Sin datos municipales disponibles.</p>
                    ) : (
                      (() => {
                        const maxMun = Math.max(...datosMetricas.cantidad_municipios.map(m => Math.max(m.privados, m.publicos)), 1);
                        return datosMetricas.cantidad_municipios.map((m, idx) => {
                          const hPriv = Math.max(10, (m.privados / maxMun) * 120);
                          const hPub = Math.max(10, (m.publicos / maxMun) * 120);

                          return (
                            <div key={idx} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                              <div className="flex items-end gap-1.5 w-full justify-center">
                                
                                {/* Barra Privados con Tooltip */}
                                <div className="relative flex flex-col items-center group/priv">
                                  {/* Tooltip flotante individual al pasar el cursor */}
                                  <div className="opacity-0 group-hover/priv:opacity-100 pointer-events-none transition-all duration-200 absolute -top-9 left-1/2 -translate-x-1/2 bg-[#f97316] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap z-30 flex items-center space-x-1">
                                    <span>Privados:</span>
                                    <span className="bg-white text-[#f97316] rounded-xs px-1 font-black">{m.privados}</span>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#f97316]" />
                                  </div>

                                  <div
                                    style={{ height: `${hPriv}px` }}
                                    onMouseEnter={() => setHoveredMunBar({ municipio: m.municipio, tipo: 'Privados', cantidad: m.privados, total: m.total })}
                                    onMouseLeave={() => setHoveredMunBar(null)}
                                    className="w-4 bg-[#f97316] rounded-t-sm transition-all duration-300 group-hover/priv:brightness-125 group-hover/priv:scale-y-105 origin-bottom cursor-pointer shadow-2xs"
                                  />
                                </div>

                                {/* Barra Públicos con Tooltip */}
                                <div className="relative flex flex-col items-center group/pub">
                                  {/* Tooltip flotante individual al pasar el cursor */}
                                  <div className="opacity-0 group-hover/pub:opacity-100 pointer-events-none transition-all duration-200 absolute -top-9 left-1/2 -translate-x-1/2 bg-[#1e2d42] text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg whitespace-nowrap z-30 flex items-center space-x-1">
                                    <span>Públicos:</span>
                                    <span className="bg-cyan-400 text-slate-900 rounded-xs px-1 font-black">{m.publicos}</span>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1e2d42]" />
                                  </div>

                                  <div
                                    style={{ height: `${hPub}px` }}
                                    onMouseEnter={() => setHoveredMunBar({ municipio: m.municipio, tipo: 'Públicos', cantidad: m.publicos, total: m.total })}
                                    onMouseLeave={() => setHoveredMunBar(null)}
                                    className="w-4 bg-[#1e2d42] rounded-t-sm transition-all duration-300 group-hover/pub:brightness-125 group-hover/pub:scale-y-105 origin-bottom cursor-pointer shadow-2xs"
                                  />
                                </div>

                              </div>

                              {/* Nombre del Municipio */}
                              <span
                                className={`text-[10px] truncate w-full text-center transition-colors cursor-pointer ${
                                  hoveredMunBar?.municipio === m.municipio ? 'font-black text-[#0077c8]' : 'font-bold text-slate-500'
                                }`}
                                title={`${m.municipio} (Total: ${m.total})`}
                              >
                                {m.municipio}
                              </span>
                            </div>
                          );
                        });
                      })()
                    )}
                  </div>
                </div>

                {/* POR NIVEL DE LABORATORIO */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-3">
                    Por nivel de Laboratorio
                  </h3>

                  <div className="space-y-3.5 my-auto">
                    {(!datosMetricas?.por_nivel || datosMetricas.por_nivel.length === 0) ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No hay registros con los filtros seleccionados.</p>
                    ) : (
                      datosMetricas.por_nivel.map((item, idx) => {
                        const colors = ['bg-[#0077c8]', 'bg-[#1e2d42]', 'bg-[#f97316]', 'bg-[#22b8cf]'];
                        const barColor = colors[idx % colors.length];

                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800">
                                {item.nivel}
                              </span>
                              <span className="font-extrabold text-slate-900">
                                {item.cantidad} <span className="font-normal text-slate-400">({item.porcentaje}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.max(item.porcentaje, 4)}%` }}
                                className={`h-full ${barColor} rounded-full transition-all duration-500`}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

              </div>

              {/* ============================================================= */}
              {/* FILA 5: POR TIPO DE LABORATORIO + ESTADO / SITUACIÓN (DONUT)  */}
              {/* ============================================================= */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* POR TIPO DE LABORATORIO (SECTOR) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-3">
                    Por tipo de Laboratorio
                  </h3>

                  <div className="space-y-3 my-auto">
                    {(!datosMetricas?.por_tipo_laboratorio || datosMetricas.por_tipo_laboratorio.length === 0) ? (
                      <p className="text-xs text-slate-400 py-6 text-center">Sin datos de tipología disponibles.</p>
                    ) : (
                      datosMetricas.por_tipo_laboratorio.map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">
                              {item.sector}
                            </span>
                            <span className="font-extrabold text-slate-900">
                              {item.cantidad} <span className="font-normal text-slate-400">({item.porcentaje}%)</span>
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.max(item.porcentaje, 2)}%` }}
                              className="h-full bg-[#f97316] rounded-full transition-all duration-500"
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* ESTADO / SITUACIÓN DEL LABORATORIO (DONUT MULTI-SEGMENTO) */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <h3 className="text-base font-bold text-slate-900 tracking-tight border-b border-slate-100 pb-3">
                    Estado / Situación del Laboratorio
                  </h3>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-auto py-2">
                    {/* SVG Donut */}
                    {(() => {
                      const situacionData = datosMetricas?.estado_situacion?.items || [];
                      const totalSit = datosMetricas?.estado_situacion?.total || 0;
                      const rad = 42;
                      const circum = 2 * Math.PI * rad; // ~263.89

                      let accumulatedPct = 0;

                      return (
                        <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
                            {totalSit === 0 ? (
                              <circle cx="55" cy="55" r={rad} fill="transparent" stroke="#e2e8f0" strokeWidth="16" />
                            ) : (
                              situacionData.map((seg, idx) => {
                                const strokeVal = (seg.porcentaje / 100) * circum;
                                const offsetVal = -((accumulatedPct / 100) * circum);
                                accumulatedPct += seg.porcentaje;

                                return (
                                  <circle
                                    key={idx}
                                    cx="55"
                                    cy="55"
                                    r={rad}
                                    fill="transparent"
                                    stroke={seg.color}
                                    strokeWidth="16"
                                    strokeDasharray={`${strokeVal} ${circum}`}
                                    strokeDashoffset={offsetVal}
                                    strokeLinecap="butt"
                                  />
                                );
                              })
                            )}
                          </svg>

                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-2xl font-black text-slate-900 tracking-tight">
                              {totalSit}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Total
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Leyenda Detallada */}
                    <div className="space-y-1.5 text-xs">
                      {datosMetricas?.estado_situacion?.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span style={{ backgroundColor: item.color }} className="w-2.5 h-2.5 rounded-full shrink-0" />
                            <span className="font-bold text-slate-700 truncate">{item.label}</span>
                          </div>
                          <span className="font-extrabold text-slate-900">
                            {item.cantidad} <span className="font-normal text-slate-400">({item.porcentaje}%)</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

        </main>

      </div>

    </div>
  );
}