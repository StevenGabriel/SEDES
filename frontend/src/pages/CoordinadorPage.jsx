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
  Bell
} from 'lucide-react';

import logoL1 from '../assets/L1.png';
import logoL2 from '../assets/L2.png';

// Datos iniciales de trámites en bandeja
const INITIAL_TRAMITES = [
  {
    id: 'REQ-0041',
    tipo: 'Apertura',
    tipoBadgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    fecha: '11 Ago 2026',
    fechaISO: '2026-08-11',
    establecimiento: 'Apertura Farmacia Nova',
    categoria: 'Farmacia / Botica Privada',
    propietario: 'Lic. Mariana Dávila Pardo',
    direccion: 'Av. América Este #842, Zona Cala Cala, Cochabamba',
    estado: 'Esperando Revisión',
    estadoColor: 'bg-amber-100 text-amber-800 border-amber-300',
    supervisorAsignado: 'Dra. Patricia Valenzuela',
    fechaInspeccion: '10/08/2026',
    veredictoSupervisor: 'FAVORABLE',
    documentos: [
      { id: 'lic_mun', nombre: 'Licencia Municipal', estado: 'Aprobado', numRegistro: 'MUN-CBA-2026-7731', fechaEmision: '02 de Agosto de 2026' },
      { id: 'plan_arq', nombre: 'Plano Arquitectónico', estado: 'Aprobado', numRegistro: 'COL-ARQ-8821', fechaEmision: '28 de Julio de 2026' },
      { id: 'cert_san', nombre: 'Certificado Sanitario', estado: 'Aprobado', numRegistro: 'CS-SEDES-2026-302', fechaEmision: '05 de Agosto de 2026' },
      { id: 'cont_alq', nombre: 'Contrato de Alquiler', estado: 'Aprobado', numRegistro: 'NOT-12-P-902', fechaEmision: '15 de Julio de 2026' },
      { id: 'senasag', nombre: 'Registro de SENASAG', estado: 'Aprobado', numRegistro: 'SENASAG-CBA-1109', fechaEmision: '01 de Agosto de 2026' }
    ],
    observacionesSupervisor: [
      'Área de dispensación cumple con estándares de ventilación e iluminación.',
      'Almacén de medicamentos cuenta con termohidrómetros calibrados.',
      'Documentación del regente farmacéutico al día.'
    ]
  },
  {
    id: 'REQ-0042',
    tipo: 'Renovación',
    tipoBadgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    fecha: '12 Ago 2026',
    fechaISO: '2026-08-12',
    establecimiento: 'Clínica Sur',
    categoria: 'Establecimiento de Salud de 2do Nivel',
    propietario: 'Dr. Roberto Salvatierra Flores',
    direccion: 'Av. Rector #105, Zona Queru Queru, Cochabamba',
    estado: 'Esperando Revisión',
    estadoColor: 'bg-amber-100 text-amber-800 border-amber-300',
    supervisorAsignado: 'Ing. Carlos Ruiz',
    fechaInspeccion: '11/08/2026',
    veredictoSupervisor: 'CON OBSERVACIONES',
    documentos: [
      { id: 'lic_mun', nombre: 'Licencia de Funcionamiento', estado: 'Aprobado', numRegistro: 'MUN-CBA-2026-9912', fechaEmision: '10 de Enero de 2026' },
      { id: 'plan_arq', nombre: 'Plano de Infraestructura', estado: 'Aprobado', numRegistro: 'COL-ARQ-3310', fechaEmision: '12 de Enero de 2026' },
      { id: 'cert_san', nombre: 'Certificado de Bioseguridad', estado: 'Pendiente', numRegistro: 'CS-SEDES-2026-550', fechaEmision: '01 de Agosto de 2026' },
      { id: 'cont_alq', nombre: 'Contrato Notariado de Regencia', estado: 'Aprobado', numRegistro: 'NOT-04-REG-102', fechaEmision: '05 de Enero de 2026' },
      { id: 'senasag', nombre: 'Certificación Ambiental', estado: 'Rechazado', numRegistro: 'AMB-CBA-4401', fechaEmision: '15 de Mayo de 2026' }
    ],
    observacionesSupervisor: [
      'Cadena de frío en sala de reactivos presentó fluctuaciones de temperatura.',
      'Manejo de residuos biológicos requiere actualizar contrato de recolección.',
      'Personal técnico cuenta con vacunas y credenciales al día.'
    ]
  },
  {
    id: 'REQ-0043',
    tipo: 'Apertura',
    tipoBadgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    fecha: '08 Ago 2026',
    fechaISO: '2026-08-08',
    establecimiento: 'Clínica Esperanza',
    categoria: 'Policlínico de Atención Integral',
    propietario: 'Dra. Beatriz Guzmán Rios',
    direccion: 'Av. Heroínas #720 esquina 16 de Julio',
    estado: 'Esperando Revisión',
    estadoColor: 'bg-amber-100 text-amber-800 border-amber-300',
    supervisorAsignado: 'Dra. Patricia Valenzuela',
    fechaInspeccion: '07/08/2026',
    veredictoSupervisor: 'FAVORABLE',
    documentos: [
      { id: 'lic_mun', nombre: 'Licencia Municipal', estado: 'Aprobado', numRegistro: 'MUN-CBA-2026-4401', fechaEmision: '05 de Febrero de 2026' },
      { id: 'plan_arq', nombre: 'Plano Arquitectónico', estado: 'Aprobado', numRegistro: 'COL-ARQ-1102', fechaEmision: '08 de Febrero de 2026' },
      { id: 'cert_san', nombre: 'Certificado Sanitario', estado: 'Aprobado', numRegistro: 'CS-SEDES-2026-788', fechaEmision: '10 de Febrero de 2026' },
      { id: 'cont_alq', nombre: 'Contrato de Alquiler', estado: 'Aprobado', numRegistro: 'NOT-15-CLIN-401', fechaEmision: '02 de Febrero de 2026' },
      { id: 'senasag', nombre: 'Registro de SENASAG', estado: 'Aprobado', numRegistro: 'SENASAG-CBA-9002', fechaEmision: '12 de Febrero de 2026' }
    ],
    observacionesSupervisor: [
      'Instalaciones en perfecto estado de conservación y limpieza.',
      'Planes de manejo de residuos biológicos debidamente implementados.'
    ]
  }
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

  // Cargar sesión de usuario
  useEffect(() => {
    const sessionUser = localStorage.getItem('usuario');
    if (sessionUser) {
      try {
        setUsuario(JSON.parse(sessionUser));
      } catch (e) {
        console.error('Error al leer sesión:', e);
      }
    }
  }, []);

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
      tituloBreadcrumb: 'Asignación y Gestión de Supervisores'
    },
    {
      id: 'historial-trazabilidad',
      path: '/coordinador/historial-trazabilidad',
      label: 'Historial y Trazabilidad',
      icon: History,
      tituloBreadcrumb: 'Historial y Trazabilidad de Trámites'
    }
  ];

  const itemActivo = menuItems.find(item => item.id === seccionActiva) || menuItems[0];

  const nombreCoordinador = usuario
    ? `${usuario.nombres} ${usuario.apellidos}`
    : 'Dra. Claudia Morales V.';

  // Lista de trámites y trámite activo seleccionado
  const [tramites, setTramites] = useState(INITIAL_TRAMITES);
  const [tramiteSeleccionadoId, setTramiteSeleccionadoId] = useState('REQ-0042');

  // Pestaña activa en el panel de detalle: 'legal' | 'campo'
  const [tabActiva, setTabActiva] = useState('legal');

  // Documento legal seleccionado para visualizar en el visor interactivo
  const [docSeleccionadoId, setDocSeleccionadoId] = useState('lic_mun');

  // Filtros y búsqueda
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  // Modales
  const [modalReinspeccionOpen, setModalReinspeccionOpen] = useState(false);
  const [modalAprobacionOpen, setModalAprobacionOpen] = useState(false);
  const [modalVerDocFull, setModalVerDocFull] = useState(false);
  const [notificacionToast, setNotificacionToast] = useState(null);

  // Formularios de modales
  const [reinspeccionData, setReinspeccionData] = useState({
    supervisor: 'Ing. Carlos Ruiz',
    fecha: '2026-08-20',
    hora: '09:30',
    motivo: 'Verificación de subsanación de cadena de frío y residuos biológicos.',
    prioridad: 'Alta'
  });

  const [aprobacionData, setAprobacionData] = useState({
    codigoResolucion: 'RES-ADM-SEDES-2026/8942',
    vigenciaAnios: '3 años',
    observacionFinal: 'Establecimiento cumple satisfactoriamente con todos los requisitos normativos del SEDES Cochabamba.'
  });

  // Trámite seleccionado actualmente
  const tramiteActual = tramites.find(t => t.id === tramiteSeleccionadoId) || tramites[0];

  // Documento legal seleccionado actualmente
  const docActual = tramiteActual.documentos.find(d => d.id === docSeleccionadoId) || tramiteActual.documentos[0];

  // Trámites filtrados
  const tramitesFiltrados = tramites.filter(t => {
    const matchTexto = t.id.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      t.establecimiento.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      t.tipo.toLowerCase().includes(filtroTexto.toLowerCase());
    const matchEstado = filtroEstado === 'Todos' || t.estado === filtroEstado;
    return matchTexto && matchEstado;
  });

  // Mostrar mensaje toast temporal
  const mostrarToast = (mensaje, tipo = 'success') => {
    setNotificacionToast({ mensaje, tipo });
    setTimeout(() => {
      setNotificacionToast(null);
    }, 4000);
  };

  // Manejar cambio de estado de un documento legal (Aprobado / Rechazado)
  const handleCambiarEstadoDoc = (nuevoEstado) => {
    setTramites(prev => prev.map(t => {
      if (t.id === tramiteActual.id) {
        const nuevosDocs = t.documentos.map(d => {
          if (d.id === docActual.id) {
            return { ...d, estado: nuevoEstado };
          }
          return d;
        });
        return { ...t, documentos: nuevosDocs };
      }
      return t;
    }));
    mostrarToast(`Documento "${docActual.nombre}" marcado como: ${nuevoEstado}`, nuevoEstado === 'Aprobado' ? 'success' : 'warning');
  };

  // Guardar re-inspección programada
  const handleGuardarReinspeccion = (e) => {
    e.preventDefault();
    setTramites(prev => prev.map(t => {
      if (t.id === tramiteActual.id) {
        return {
          ...t,
          estado: 'Re-Inspección Programada',
          estadoColor: 'bg-purple-100 text-purple-800 border-purple-300',
          supervisorAsignado: reinspeccionData.supervisor,
          fechaInspeccion: reinspeccionData.fecha
        };
      }
      return t;
    }));
    setModalReinspeccionOpen(false);
    mostrarToast(`Re-inspección asignada a ${reinspeccionData.supervisor} para el ${reinspeccionData.fecha}.`, 'success');
  };

  // Confirmar aprobación final del trámite
  const handleConfirmarAprobacion = (e) => {
    e.preventDefault();
    setTramites(prev => prev.map(t => {
      if (t.id === tramiteActual.id) {
        return {
          ...t,
          estado: 'Aprobado',
          estadoColor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
        };
      }
      return t;
    }));
    setModalAprobacionOpen(false);
    mostrarToast(`¡Trámite ${tramiteActual.id} (${tramiteActual.establecimiento}) APROBADO exitosamente! Se emitió la resolución ${aprobacionData.codigoResolucion}.`, 'success');
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

            {/* Campana de Notificaciones con Badge */}
            <button
              type="button"
              className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
              title="3 Notificaciones pendientes"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
                3
              </span>
            </button>

            {/* Perfil del Coordinador */}
            <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {nombreCoordinador}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">
                  Coordinadora SEDES
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
        {/* 3. VISTA 1: BANDEJA DE ENTRADA (MOCKUP EXACTO CON AMBAS BITÁCORAS)       */}
        {/* ========================================================================= */}
        {seccionActiva === 'bandeja' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-3 sm:p-5 gap-4">

            {/* --------------------------------------------------------------------- */}
            {/* COLUMNA IZQUIERDA: Lista de Trámites en Proceso                       */}
            {/* --------------------------------------------------------------------- */}
            <div className="w-full md:w-80 lg:w-96 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col shrink-0 overflow-hidden">

              {/* Header de la lista con contador */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-black text-slate-800 text-base tracking-tight">Trámites en Proceso</h2>
                <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2.5 py-1 rounded-full border border-sky-200">
                  {tramites.length} pendientes
                </span>
              </div>

              {/* Búsqueda rápida */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Buscar por código, nombre..."
                    value={filtroTexto}
                    onChange={(e) => setFiltroTexto(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077c8] text-slate-700"
                  />
                </div>
              </div>

              {/* Lista scrollable de tarjetas de trámite */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                {tramitesFiltrados.map((item) => {
                  const estaSeleccionado = item.id === tramiteSeleccionadoId;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setTramiteSeleccionadoId(item.id);
                        setDocSeleccionadoId('lic_mun');
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
                      <h3 className="font-bold text-sm text-slate-900 mb-2 truncate">
                        {item.establecimiento}
                      </h3>

                      {/* Estado Tag */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${item.estadoColor}`}>
                          {item.estado}
                        </span>
                        {estaSeleccionado && (
                          <span className="text-[11px] text-[#0077c8] font-bold flex items-center">
                            Revisando <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {tramitesFiltrados.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No se encontraron trámites con el criterio de búsqueda.
                  </div>
                )}
              </div>
            </div>

            {/* --------------------------------------------------------------------- */}
            {/* COLUMNA DERECHA: Detalle del Trámite y Bitácoras (Tabs)               */}
            {/* --------------------------------------------------------------------- */}
            <div className="flex-1 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col overflow-hidden">

              {/* Encabezado del Detalle */}
              <div className="p-4 sm:p-5 border-b border-slate-200 bg-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      {tramiteActual.id} - {tramiteActual.tipo} {tramiteActual.establecimiento}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Propietario: <span className="font-semibold text-slate-700">{tramiteActual.propietario}</span> &bull; {tramiteActual.categoria}
                    </p>
                  </div>

                  <span className={`self-start sm:self-center text-xs font-bold px-3 py-1 rounded-lg border ${tramiteActual.estadoColor}`}>
                    {tramiteActual.estado}
                  </span>
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
                    <span>Documentación Legal</span>
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
                    <span>Inspección de Campo</span>
                  </button>
                </div>
              </div>

              {/* Contenido Scrolleable según la pestaña activa */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#fafbfc]">

                {/* =================================================================== */}
                {/* TAB 1: DOCUMENTACIÓN LEGAL (Bitácora 1)                              */}
                {/* =================================================================== */}
                {tabActiva === 'legal' && (
                  <div className="space-y-6 max-w-4xl mx-auto">

                    {/* Lista de 5 Documentos Requeridos */}
                    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs divide-y divide-slate-100">
                      {tramiteActual.documentos.map((doc) => {
                        const isDocActivo = doc.id === docActual.id;

                        return (
                          <div
                            key={doc.id}
                            className={`
                              p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors
                              ${isDocActivo ? 'bg-sky-50/40' : 'hover:bg-slate-50/60'}
                            `}
                          >
                            {/* Nombre del documento e ícono */}
                            <div className="flex items-center space-x-3.5 min-w-0">
                              <div className="p-2 rounded-lg bg-slate-100 text-slate-600">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-bold text-xs sm:text-sm text-slate-800 block truncate">
                                  {doc.nombre}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono">
                                  Reg: {doc.numRegistro}
                                </span>
                              </div>
                            </div>

                            {/* Badge de estado y Botón Ver PDF */}
                            <div className="flex items-center space-x-3 shrink-0">
                              <span className={`
                                text-xs font-bold px-2.5 py-0.5 rounded-md
                                ${doc.estado === 'Aprobado' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : ''}
                                ${doc.estado === 'Observado' ? 'bg-rose-100 text-rose-700 border border-rose-200' : ''}
                                ${doc.estado === 'Pendiente' ? 'bg-amber-100 text-amber-800 border border-amber-200' : ''}
                              `}>
                                {doc.estado}
                              </span>

                              <button
                                onClick={() => setDocSeleccionadoId(doc.id)}
                                className={`
                                  flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer
                                  ${isDocActivo
                                    ? 'bg-[#0077c8] text-white border-[#0077c8] shadow-xs'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                                  }
                                `}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Ver PDF</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* =============================================================== */}
                    {/* VISOR INTERACTIVO DEL DOCUMENTO SELECCIONADO (Licencia / Plano) */}
                    {/* =============================================================== */}
                    <div className="bg-slate-100/90 p-4 sm:p-6 rounded-2xl border border-slate-200">

                      {/* Document Sheet Container */}
                      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 sm:p-8 max-w-2xl mx-auto relative overflow-hidden">

                        {/* Marca de agua / Sello de fondo */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                          <Building2 className="w-96 h-96 text-slate-900" />
                        </div>

                        {/* Cabecera del Documento Oficial */}
                        <div className="text-center border-b border-slate-200 pb-4 mb-6">
                          <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 tracking-wider uppercase">
                            GOBIERNO AUTÓNOMO MUNICIPAL DE COCHABAMBA
                          </h3>
                          <p className="text-[10px] text-slate-500 font-semibold tracking-wide uppercase mt-0.5">
                            DEPARTAMENTO DE PATENTES Y LICENCIAS DE FUNCIONAMIENTO
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

                        {/* Datos Detallados del Documento */}
                        <div className="space-y-3 text-xs sm:text-xs text-slate-700">
                          <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                            <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">RAZÓN SOCIAL:</span>
                            <span className="col-span-2 font-bold text-slate-900 uppercase">{tramiteActual.establecimiento} - ESTABLECIMIENTO DE SALUD</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                            <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">PROPIETARIO:</span>
                            <span className="col-span-2 font-semibold text-slate-800 uppercase">{tramiteActual.propietario}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                            <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">DIRECCIÓN:</span>
                            <span className="col-span-2 text-slate-700">{tramiteActual.direccion}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                            <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">ACTIVIDAD:</span>
                            <span className="col-span-2 text-slate-700">{tramiteActual.categoria}</span>
                          </div>

                          <div className="grid grid-cols-3 gap-2 py-1 border-b border-slate-100">
                            <span className="font-bold text-slate-500 uppercase tracking-wide text-[10px]">FECHA EMISIÓN:</span>
                            <span className="col-span-2 text-slate-700">{docActual.fechaEmision}</span>
                          </div>
                        </div>

                        {/* Texto Legal de Certificación */}
                        <p className="text-[10px] text-slate-500 mt-5 text-justify leading-relaxed italic">
                          Se autoriza el funcionamiento del establecimiento mencionado bajo estricto cumplimiento de las normas de salubridad, seguridad y reglamentación ambiental vigentes en el Estado Plurinacional de Bolivia.
                        </p>

                        {/* Sello y Firma */}
                        <div className="mt-8 flex items-center justify-between pt-4 border-t border-dashed border-slate-200">

                          {/* Sello circular ALCALDÍA */}
                          <div className="w-24 h-24 rounded-full border-2 border-dashed border-sky-500 flex flex-col items-center justify-center text-center p-1 rotate-[-8deg] bg-sky-50/50">
                            <span className="text-[8px] font-bold text-sky-800 uppercase tracking-tighter">ALCALDÍA</span>
                            <span className="text-[9px] font-black text-sky-700">COCHABAMBA</span>
                            <span className="text-[7px] font-bold text-sky-600 uppercase">VERIFICADO</span>
                          </div>

                          {/* Firma Autorizada */}
                          <div className="text-center">
                            <div className="h-10 flex items-end justify-center mb-1">
                              <span className="font-serif italic text-lg text-slate-600 font-bold">M. Arze R.</span>
                            </div>
                            <div className="w-40 border-t border-slate-400 mx-auto" />
                            <p className="text-[9px] font-bold text-slate-800 mt-1 uppercase">ING. MARCELO ARZE R.</p>
                            <p className="text-[8px] text-slate-500 uppercase">JEFE DE PATENTES MUNICIPALES</p>
                          </div>
                        </div>
                      </div>

                      {/* Botones de Dictamen para este Documento (Aprobado / Rechazado) */}
                      <div className="mt-4 flex items-center justify-center space-x-3 max-w-md mx-auto">
                        <button
                          onClick={() => handleCambiarEstadoDoc('Aprobado')}
                          className={`
                            flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer
                            ${docActual.estado === 'Aprobado'
                              ? 'bg-emerald-200 text-emerald-900 ring-2 ring-emerald-400'
                              : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                            }
                          `}
                        >
                          <Check className="w-4 h-4" />
                          <span>Aprobado</span>
                        </button>

                        <button
                          onClick={() => handleCambiarEstadoDoc('Observado')}
                          className={`
                            flex-1 py-2.5 px-4 rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer
                            ${docActual.estado === 'Observado'
                              ? 'bg-rose-200 text-rose-900 ring-2 ring-rose-400'
                              : 'bg-rose-100 hover:bg-rose-200 text-rose-700'
                            }
                          `}
                        >
                          <X className="w-4 h-4" />
                          <span>Rechazado</span>
                        </button>
                      </div>
                    </div>

                    {/* Botones Globales de Acción del Trámite */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                      <button
                        onClick={() => setModalReinspeccionOpen(true)}
                        className="w-full sm:flex-1 py-3 px-5 rounded-xl font-extrabold text-sm text-white bg-[#0077c8] hover:bg-[#0064a7] shadow-md transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Agendar Re-Inspección</span>
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

                {/* =================================================================== */}
                {/* TAB 2: INSPECCIÓN DE CAMPO (Bitácora 2)                              */}
                {/* =================================================================== */}
                {tabActiva === 'campo' && (
                  <div className="space-y-6 max-w-4xl mx-auto">

                    {/* Banner de Veredicto del Supervisor */}
                    <div className="bg-amber-100/90 border-l-4 border-amber-500 p-4 rounded-r-xl shadow-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-extrabold text-sm sm:text-base text-amber-900 uppercase tracking-tight flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-amber-600" />
                            <span>Veredicto del Supervisor: {tramiteActual.veredictoSupervisor}</span>
                          </h3>
                          <p className="text-xs text-amber-800/90 mt-0.5 font-medium">
                            Realizado por: <span className="font-bold">{tramiteActual.supervisorAsignado}</span> &bull; {tramiteActual.fechaInspeccion}
                          </p>
                        </div>

                        {tramiteActual.plazoSubsanacion && (
                          <span className="text-[11px] font-bold bg-amber-200/80 text-amber-900 px-3 py-1 rounded-full border border-amber-300">
                            Plazo: {tramiteActual.plazoSubsanacion}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sección Documentación Requerida */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                      <div>
                        <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                          Documentación Requerida
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Cargue y verifique la vigencia de los requisitos sanitarios y legales correspondientes.
                        </p>
                      </div>

                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 rounded-lg bg-sky-100 text-[#0077c8]">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-bold text-xs sm:text-sm text-slate-800 block">
                              Inspección de Campo
                            </span>
                            <span className="text-[11px] text-slate-400">
                              Acta de Verificación Sanitaria in situ (PDF firmado)
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => setModalVerDocFull(true)}
                          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 transition shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Ver PDF</span>
                        </button>
                      </div>

                      {tramiteActual.plazoSubsanacion && (
                        <p className="text-xs text-slate-600 font-semibold">
                          Plazo de subsanación: <span className="font-bold text-slate-900">{tramiteActual.plazoSubsanacion}</span>
                        </p>
                      )}
                    </div>

                    {/* Previsualización del Escaneado del Acta de Inspección */}
                    <div className="bg-slate-100/90 p-4 sm:p-6 rounded-2xl border border-slate-200">
                      <div className="bg-white rounded-xl shadow-md border border-slate-300 p-4 sm:p-6 max-w-2xl mx-auto overflow-hidden">

                        <div className="flex items-center justify-between pb-3 border-b border-slate-200 text-slate-500 text-xs">
                          <span className="font-mono text-[11px] font-bold text-slate-700">ACTA_INSPECCION_CAMPO_#8942.PDF</span>
                          <button
                            onClick={() => setModalVerDocFull(true)}
                            className="text-[#0077c8] hover:underline font-bold text-[11px] flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" /> Ampliar Acta
                          </button>
                        </div>

                        {/* Hoja de Inspección simulada con checklist y sellos */}
                        <div className="mt-3 bg-amber-50/30 border border-slate-300 rounded-lg p-4 font-mono text-[11px] text-slate-800 space-y-3">
                          <div className="text-center pb-2 border-b border-slate-300">
                            <p className="font-bold text-xs uppercase">SEDES COCHABAMBA - DIVISIÓN DE FISCALIZACIÓN</p>
                            <p className="text-[10px] text-slate-500">PLANILLA DE EVALUACIÓN TÉCNICA IN SITU</p>
                          </div>

                          <div className="space-y-1 text-[10px]">
                            <p><strong>Establecimiento:</strong> {tramiteActual.establecimiento}</p>
                            <p><strong>Dirección:</strong> {tramiteActual.direccion}</p>
                            <p><strong>Inspector Asignado:</strong> {tramiteActual.supervisorAsignado}</p>
                            <p><strong>Fecha Inspección:</strong> {tramiteActual.fechaInspeccion}</p>
                          </div>

                          {/* Tabla de checklist simulada */}
                          <div className="border border-slate-300 rounded overflow-hidden mt-2 text-[9px]">
                            <div className="bg-slate-200 font-bold grid grid-cols-4 p-1.5 border-b border-slate-300">
                              <span className="col-span-2">ÍTEM EVALUADO</span>
                              <span>ESTADO</span>
                              <span>OBSERVACIÓN</span>
                            </div>
                            <div className="grid grid-cols-4 p-1.5 border-b border-slate-200">
                              <span className="col-span-2">1. Cadena de frío y refrigeración</span>
                              <span className="font-bold text-rose-600">NO CUMPLE (12°C)</span>
                              <span className="text-slate-600">Alarma inactiva</span>
                            </div>
                            <div className="grid grid-cols-4 p-1.5 border-b border-slate-200">
                              <span className="col-span-2">2. Residuos infecciosos (Bioseguridad)</span>
                              <span className="font-bold text-rose-600">OBSERVADO</span>
                              <span className="text-slate-600">Falta tacho rojo c/3</span>
                            </div>
                            <div className="grid grid-cols-4 p-1.5 border-b border-slate-200">
                              <span className="col-span-2">3. Extintores y seguridad industrial</span>
                              <span className="font-bold text-rose-600">VENCIDO</span>
                              <span className="text-slate-600">Vigencia 2025</span>
                            </div>
                            <div className="grid grid-cols-4 p-1.5 bg-emerald-50/50">
                              <span className="col-span-2">4. Titulación y acreditación de personal</span>
                              <span className="font-bold text-emerald-700">CUMPLE</span>
                              <span className="text-slate-600">Al día</span>
                            </div>
                          </div>

                          {/* Firmas y Sellos manuscritos al pie */}
                          <div className="pt-4 flex items-end justify-between">
                            <div className="text-center">
                              <div className="font-serif italic text-sm text-blue-900 mb-0.5">Carlos Ruiz M.</div>
                              <div className="w-28 border-t border-slate-400" />
                              <span className="text-[8px] text-slate-500 uppercase block">Inspector SEDES</span>
                            </div>

                            <div className="w-20 h-20 rounded-full border-2 border-dashed border-blue-600 p-1 flex flex-col items-center justify-center text-center rotate-6 bg-blue-50/40">
                              <span className="text-[7px] font-bold text-blue-900">INSPECCIÓN</span>
                              <span className="text-[8px] font-black text-blue-800">OBSERVADA</span>
                              <span className="text-[6px] text-blue-700">SEDES CBA</span>
                            </div>

                            <div className="text-center">
                              <div className="font-serif italic text-sm text-slate-700 mb-0.5">R. Salvatierra</div>
                              <div className="w-28 border-t border-slate-400" />
                              <span className="text-[8px] text-slate-500 uppercase block">Recepción Propietario</span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Notas del Supervisor */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                      <h3 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Notas del Supervisor</span>
                      </h3>

                      <ul className="space-y-2 text-xs text-slate-700">
                        {tramiteActual.observacionesSupervisor.map((obs, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-slate-400 font-bold">&bull;</span>
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
                        <span>Agendar Re-Inspección</span>
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

          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. VISTA 2: ASIGNAR SUPERVISORES                                         */}
        {/* ========================================================================= */}
        {(seccionActiva === 'asignar-supervisores' || seccionActiva === 'supervisores') && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8fafc]">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h2 className="text-lg font-black text-slate-900">Panel de Supervisores de Campo</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Gestione el equipo de auditores sanitarios y la asignación de zonas departamentales.</p>
                </div>
                <button
                  onClick={() => mostrarToast('Se abrió el formulario para registrar un nuevo inspector técnico.', 'info')}
                  className="px-4 py-2 bg-[#0077c8] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#0062a8] transition flex items-center space-x-2 cursor-pointer"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Registrar Supervisor</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { nombre: 'Ing. Carlos Ruiz', cargo: 'Auditor Sanitario / Bioseguridad', asignados: 4, completados: 28, zona: 'Cercado Norte & Queru Queru', estado: 'Activo' },
                  { nombre: 'Dra. Patricia Valenzuela', cargo: 'Especialista en Regencia Farmacéutica', asignados: 3, completados: 34, zona: 'Cala Cala & Sarco', estado: 'Activo' },
                  { nombre: 'Lic. Andrea Torrico', cargo: 'Inspectora de Calidad Bioquímica', asignados: 5, completados: 19, zona: 'Quillacollo & Colcapirhua', estado: 'Activo' },
                ].map((sup, i) => (
                  <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-sky-100 text-[#0077c8] font-bold flex items-center justify-center text-sm">
                        {sup.nombre.split(' ')[1]?.[0] || 'S'}
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {sup.estado}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{sup.nombre}</h4>
                      <p className="text-xs text-slate-500">{sup.cargo}</p>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Zona asignada:</span>
                        <span className="font-semibold text-slate-700">{sup.zona}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Trámites activos:</span>
                        <span className="font-bold text-[#0077c8]">{sup.asignados} en curso</span>
                      </div>
                    </div>

                    <button
                      onClick={() => mostrarToast(`Reasignando inspecciones a ${sup.nombre}`, 'info')}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Asignar Nuevos Trámites
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. VISTA 3: HISTORIAL Y TRAZABILIDAD                                     */}
        {/* ========================================================================= */}
        {(seccionActiva === 'historial-trazabilidad' || seccionActiva === 'historial') && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#f8fafc]">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <h2 className="text-lg font-black text-slate-900">Registro de Trazabilidad y Auditoría</h2>
                <p className="text-xs text-slate-500 mt-0.5">Historial cronológico inmutable de resoluciones, firmas digitales e inspecciones.</p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
                {[
                  { fecha: '14/08/2026 - 15:30', titulo: 'Inspección de campo finalizada con observaciones', autor: 'Ing. Carlos Ruiz', tramite: 'REQ-0042 - Clínica Sur', tag: 'Inspección', tagColor: 'bg-amber-100 text-amber-800' },
                  { fecha: '12/08/2026 - 10:15', titulo: 'Documentos legales aprobados por Coordinación', autor: 'Dra. Claudia Morales', tramite: 'REQ-0042 - Clínica Sur', tag: 'Legal', tagColor: 'bg-sky-100 text-sky-800' },
                  { fecha: '11/08/2026 - 16:45', titulo: 'Nueva solicitud de Apertura recibida en ventanilla digital', autor: 'Lic. Mariana Dávila', tramite: 'REQ-0041 - Farmacia Nova', tag: 'Ingreso', tagColor: 'bg-emerald-100 text-emerald-800' },
                  { fecha: '10/08/2026 - 09:00', titulo: 'Emisión de Resolución Administrativa RES-2026/8812', autor: 'Dra. Claudia Morales', tramite: 'REQ-0035 - Laboratorio San Martín', tag: 'Aprobado', tagColor: 'bg-emerald-100 text-emerald-800' },
                ].map((ev, idx) => (
                  <div key={idx} className="flex items-start space-x-4 border-l-2 border-sky-300 pl-4 relative">
                    <div className="w-3 h-3 rounded-full bg-[#0077c8] absolute -left-[7px] top-1 ring-4 ring-sky-100" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{ev.titulo}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ev.tagColor}`}>{ev.tag}</span>
                      </div>
                      <p className="text-xs text-slate-500">{ev.tramite}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>Responsable: <strong>{ev.autor}</strong></span>
                        <span>{ev.fecha}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 6. MODALES Y DIÁLOGOS DE ACCIÓN                                          */}
      {/* ========================================================================= */}

      {/* MODAL 1: Agendar Re-Inspección */}
      {modalReinspeccionOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-gradient-to-r from-[#0077c8] to-[#0094e6] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Calendar className="w-5 h-5 text-cyan-200" />
                <h3 className="font-extrabold text-base">Agendar Re-Inspección Técnica</h3>
              </div>
              <button onClick={() => setModalReinspeccionOpen(false)} className="text-white/80 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarReinspeccion} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Establecimiento y Trámite</label>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 font-semibold text-slate-800">
                  {tramiteActual.id} - {tramiteActual.establecimiento} ({tramiteActual.propietario})
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
                    <option value="Ing. Carlos Ruiz">Ing. Carlos Ruiz (Área Bioseguridad)</option>
                    <option value="Dra. Patricia Valenzuela">Dra. Patricia Valenzuela (Regencia)</option>
                    <option value="Lic. Andrea Torrico">Lic. Andrea Torrico (Control Calidad)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prioridad</label>
                  <select
                    value={reinspeccionData.prioridad}
                    onChange={(e) => setReinspeccionData({ ...reinspeccionData, prioridad: e.target.value })}
                    className="w-full p-2.5 border border-slate-300 rounded-xl bg-white font-medium text-slate-800 focus:ring-2 focus:ring-[#0077c8]"
                  >
                    <option value="Alta">Alta (Subsanación de cadena de frío)</option>
                    <option value="Normal">Normal</option>
                    <option value="Urgente">Urgente (Notificación previa)</option>
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
                <label className="font-bold text-slate-700 block mb-1">Instrucciones / Motivo de Visita</label>
                <textarea
                  rows={3}
                  value={reinspeccionData.motivo}
                  onChange={(e) => setReinspeccionData({ ...reinspeccionData, motivo: e.target.value })}
                  className="w-full p-3 border border-slate-300 rounded-xl font-medium text-slate-800 focus:ring-2 focus:ring-[#0077c8]"
                  placeholder="Especifique los puntos a verificar durante la re-inspección..."
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
                  Al confirmar, se emitirá la Resolución Administrativa y se habilitará la credencial digital para <strong>{tramiteActual.establecimiento}</strong>.
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
                    <option value="3 años">3 años (Laboratorios Nivel 2)</option>
                    <option value="5 años">5 años (Clínicas y Policlínicos)</option>
                    <option value="1 año">1 año (Apertura Provisoria)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Firma Digital Coordinadora</label>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 truncate">
                    Dra. Claudia Morales V. (SEDES)
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

      {/* MODAL 3: Visor Completo de Documentos / Actas */}
      {modalVerDocFull && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-300" />
                <span className="font-bold text-sm">Visor de Expediente Técnico - {tramiteActual.id}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => mostrarToast('Descargando archivo digital...', 'info')}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
                <button onClick={() => setModalVerDocFull(false)} className="text-white/80 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-100 flex items-center justify-center">
              <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-300 max-w-xl w-full text-slate-800 space-y-4">
                <div className="text-center border-b border-slate-200 pb-4">
                  <h3 className="font-black text-sm uppercase">ESTADO PLURINACIONAL DE BOLIVIA</h3>
                  <h4 className="font-bold text-xs text-sky-800 uppercase">SERVICIO DEPARTAMENTAL DE SALUD COCHABAMBA</h4>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">EXPEDIENTE N° {tramiteActual.id}-2026</p>
                </div>

                <div className="text-xs space-y-2">
                  <p><strong>Establecimiento:</strong> {tramiteActual.establecimiento}</p>
                  <p><strong>Propietario / Regente:</strong> {tramiteActual.propietario}</p>
                  <p><strong>Ubicación:</strong> {tramiteActual.direccion}</p>
                  <p><strong>Tipo de trámite:</strong> {tramiteActual.tipo} de habilitación sanitaria</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <p className="font-bold text-slate-700">Estado de Documentación:</p>
                  {tramiteActual.documentos.map(d => (
                    <div key={d.id} className="flex justify-between text-[11px]">
                      <span>&bull; {d.nombre}</span>
                      <span className="font-bold text-emerald-700">{d.estado}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 text-center border-t border-dashed border-slate-300">
                  <p className="text-[10px] text-slate-400 font-mono">Documento digital firmado electrónicamente conforme a la Ley N° 164.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
