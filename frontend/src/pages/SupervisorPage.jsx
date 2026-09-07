import React, { useState, useEffect } from 'react';
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
  FlaskConical
} from 'lucide-react';

import logoL1 from '../assets/L1.png';
import logoL2 from '../assets/L2.png';

export default function SupervisorPage() {
  const navigate = useNavigate();
  const { seccion } = useParams();

  const SECCIONES_VALIDAS = ['mi-agenda', 'rutas-inspeccion', 'actas-emitidas', 'citaciones-emitidas'];
  const seccionActiva = SECCIONES_VALIDAS.includes(seccion) ? seccion : 'mi-agenda';

  const [usuario, setUsuario] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [semanaActualOffset, setSemanaActualOffset] = useState(0);

  // Modal de detalle de inspección
  const [modalInspeccionOpen, setModalInspeccionOpen] = useState(false);
  const [inspeccionSeleccionada, setInspeccionSeleccionada] = useState(null);

  // Modal de nueva inspección
  const [modalNuevaInspeccionOpen, setModalNuevaInspeccionOpen] = useState(false);

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
    : 'Ing. Marco Vargas';

  // Inspecciones pendientes por programar (Columna Izquierda)
  const [inspeccionesPendientes, setInspeccionesPendientes] = useState([
    {
      id: 'pend_1',
      tipo: 'Apertura',
      tipoTag: 'Renovación',
      tagColor: 'orange',
      nombre: 'Apertura - Farmacia Vida',
      establecimiento: 'Farmacia Vida Central',
      direccion: 'Av. Blanco Galindo Km 4, Quillacollo',
      municipio: 'QUILLACOLLO',
      fechaSolicitud: '10/08/2026',
      nivel: 'Nivel 1'
    },
    {
      id: 'pend_2',
      tipo: 'Renovación',
      tipoTag: 'Apertura',
      tagColor: 'blue',
      nombre: 'Renovación - Clínica Esperanza',
      establecimiento: 'Clínica de Especialidades Esperanza',
      direccion: 'Calle Sucre #240, Cercado',
      municipio: 'CERCADO',
      fechaSolicitud: '10/08/2026',
      nivel: 'Nivel 2'
    },
    {
      id: 'pend_3',
      tipo: 'Apertura',
      tipoTag: 'Renovación',
      tagColor: 'orange',
      nombre: 'Apertura - Lab. Génesis',
      establecimiento: 'Laboratorio de Diagnóstico Génesis',
      direccion: 'Av. América #580, Cercado',
      municipio: 'CERCADO',
      fechaSolicitud: '11/08/2026',
      nivel: 'Nivel 1'
    },
    {
      id: 'pend_4',
      tipo: 'Renovación',
      tipoTag: 'Apertura',
      tagColor: 'blue',
      nombre: 'Renovación - Centro Dental Smile',
      establecimiento: 'Centro Odontológico Smile',
      direccion: 'Calle Jordán #120, Cercado',
      municipio: 'CERCADO',
      fechaSolicitud: '12/08/2026',
      nivel: 'Nivel 1'
    },
    {
      id: 'pend_5',
      tipo: 'Apertura',
      tipoTag: 'Apertura',
      tagColor: 'blue',
      nombre: 'Apertura - Lab. San Simón',
      establecimiento: 'Laboratorio Bioquímico San Simón',
      direccion: 'Av. Petrolera Km 2, Cercado',
      municipio: 'CERCADO',
      fechaSolicitud: '12/08/2026',
      nivel: 'Nivel 2'
    }
  ]);

  // Eventos programados en el calendario semanal (Columna Derecha)
  const eventosSemana = [
    {
      id: 'evt_1',
      dia: 'Lun', // Lunes 11
      diaIndex: 0,
      horaInicio: '10:00',
      horaFin: '11:30',
      startMinutes: 10 * 60,
      durationMinutes: 90,
      titulo: 'Inspección Técnica...',
      subtitulo: '10:00 - 11:30',
      establecimiento: 'Farmacia Vida Central',
      direccion: 'Av. Blanco Galindo Km 4, Quillacollo',
      tipo: 'Inspección Técnica',
      color: 'amber' // Fondo ambar / borde naranja
    },
    {
      id: 'evt_2',
      dia: 'Mar', // Martes 12
      diaIndex: 1,
      horaInicio: '09:00',
      horaFin: '10:30',
      startMinutes: 9 * 60,
      durationMinutes: 90,
      titulo: 'Apertura - Lab...',
      subtitulo: '09:00 - 10:30',
      establecimiento: 'Laboratorio Central BioTest',
      direccion: 'Av. Heroínas #789, Cercado',
      tipo: 'Apertura',
      color: 'blue' // Fondo azul claro / borde azul
    },
    {
      id: 'evt_3',
      dia: 'Mié', // Miércoles 13
      diaIndex: 2,
      horaInicio: '11:00',
      horaFin: '12:30',
      startMinutes: 11 * 60,
      durationMinutes: 90,
      titulo: 'Inspección Ho...',
      subtitulo: '11:00 - 12:30',
      establecimiento: 'Hospital San Juan de Dios',
      direccion: 'Calle Esteban Arze #450, Punata',
      tipo: 'Inspección Hospitalaria',
      color: 'amber'
    },
    {
      id: 'evt_4',
      dia: 'Jue', // Jueves 14
      diaIndex: 3,
      horaInicio: '10:00',
      horaFin: '11:00',
      startMinutes: 10 * 60,
      durationMinutes: 60,
      titulo: 'Renovación - ...',
      subtitulo: '10:00 - 11:00',
      establecimiento: 'Laboratorio Clínico América',
      direccion: 'Av. América #320, Cercado',
      tipo: 'Renovación',
      color: 'blue'
    }
  ];

  // Días de la semana laboral
  const diasSemana = [
    { key: 'Lun', nombre: 'Lun', numero: 11 },
    { key: 'Mar', nombre: 'Mar', numero: 12 },
    { key: 'Mié', nombre: 'Mié', numero: 13 },
    { key: 'Jue', nombre: 'Jue', numero: 14 },
    { key: 'Vie', nombre: 'Vie', numero: 15 }
  ];

  // Horas del calendario (08:00 a 17:00)
  const horasGrid = [
    '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00'
  ];

  const handleVerDetalleInspeccion = (evento) => {
    setInspeccionSeleccionada(evento);
    setModalInspeccionOpen(true);
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
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer" title="Ir a la página principal">
              <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/30 group-hover:bg-white/30 transition shadow-inner">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tight text-white flex items-center">
                SI<span className="text-cyan-200">_Lab</span>
              </span>
            </Link>

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
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

            {/* Perfil del Usuario & Notificaciones */}
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

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#005596] to-[#0080d0] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-slate-100 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="Supervisor Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <span>{usuario ? usuario.nombres?.charAt(0).toUpperCase() : 'M'}</span>
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

                {/* Navegador Semanal */}
                <div className="flex items-center bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs space-x-2 text-xs font-bold text-slate-700 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => setSemanaActualOffset(prev => prev - 1)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Semana anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-1 text-slate-800">
                    Semana del 11 - 15 Agosto 2026
                  </span>
                  <button
                    type="button"
                    onClick={() => setSemanaActualOffset(prev => prev + 1)}
                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                    title="Semana siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid Principal: Inspecciones Pendientes (Izquierda) + Calendario Semanal (Derecha) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* ------------------------------------------------------------- */}
                {/* COLUMNA IZQUIERDA: INSPECCIONES PENDIENTES                     */}
                {/* ------------------------------------------------------------- */}
                <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                      Inspecciones Pendientes
                    </h3>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-200">
                      {inspeccionesPendientes.length} pendientes
                    </span>
                  </div>

                  {/* Lista de Tarjetas de Inspecciones Pendientes */}
                  <div className="space-y-3">
                    {inspeccionesPendientes.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleVerDetalleInspeccion({
                          titulo: item.nombre,
                          establecimiento: item.establecimiento,
                          direccion: item.direccion,
                          tipo: item.tipo,
                          municipio: item.municipio,
                          fechaSolicitud: item.fechaSolicitud,
                          nivel: item.nivel
                        })}
                        className={`
                          p-3.5 rounded-2xl bg-white border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition cursor-pointer space-y-2 relative overflow-hidden
                          ${item.tagColor === 'orange' ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-blue-600'}
                        `}
                      >
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                          {item.nombre}
                        </h4>

                        <div className="flex items-center justify-between pt-1">
                          <span className={`
                            text-[10px] font-extrabold px-2 py-0.5 rounded-md
                            ${item.tagColor === 'orange' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}
                          `}>
                            {item.tipoTag}
                          </span>

                          <span className="text-[10px] text-slate-400 font-medium">
                            {item.municipio}
                          </span>
                        </div>
                      </div>
                    ))}
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
                        {diasSemana.map((dia) => (
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
                            <div className="border-l border-slate-100 h-full" />
                            <div className="border-l border-slate-100 h-full" />
                            <div className="border-l border-slate-100 h-full" />
                            <div className="border-l border-slate-100 h-full" />
                            <div className="border-l border-slate-100 h-full" />
                          </div>
                        ))}

                        {/* Bloques de Eventos Programados sobre la cuadrícula */}
                        
                        {/* Evento 1: Lunes 10:00 - 11:30 (Inspección Técnica) */}
                        <div 
                          onClick={() => handleVerDetalleInspeccion(eventosSemana[0])}
                          style={{
                            position: 'absolute',
                            left: 'calc(16.66% * 1 + 4px)',
                            width: 'calc(16.66% - 8px)',
                            top: '96px', // 2 horas después de 08:00 (48px * 2)
                            height: '72px' // 1.5 horas (48px * 1.5)
                          }}
                          className="bg-amber-100/90 border-l-4 border-l-amber-500 border border-amber-200 rounded-xl p-2 cursor-pointer hover:shadow-md transition shadow-2xs flex flex-col justify-between text-left overflow-hidden z-10"
                        >
                          <span className="font-bold text-slate-900 text-[11px] truncate">
                            Inspección Téc...
                          </span>
                          <span className="text-[10px] text-amber-900 font-medium">
                            10:00 - 11:30
                          </span>
                        </div>

                        {/* Evento 2: Martes 09:00 - 10:30 (Apertura) */}
                        <div 
                          onClick={() => handleVerDetalleInspeccion(eventosSemana[1])}
                          style={{
                            position: 'absolute',
                            left: 'calc(16.66% * 2 + 4px)',
                            width: 'calc(16.66% - 8px)',
                            top: '48px', // 1 hora después de 08:00
                            height: '72px'
                          }}
                          className="bg-blue-100/90 border-l-4 border-l-blue-600 border border-blue-200 rounded-xl p-2 cursor-pointer hover:shadow-md transition shadow-2xs flex flex-col justify-between text-left overflow-hidden z-10"
                        >
                          <span className="font-bold text-slate-900 text-[11px] truncate">
                            Apertura - Lab...
                          </span>
                          <span className="text-[10px] text-blue-900 font-medium">
                            09:00 - 10:30
                          </span>
                        </div>

                        {/* Evento 3: Miércoles 11:00 - 12:30 (Inspección Hospitalaria) */}
                        <div 
                          onClick={() => handleVerDetalleInspeccion(eventosSemana[2])}
                          style={{
                            position: 'absolute',
                            left: 'calc(16.66% * 3 + 4px)',
                            width: 'calc(16.66% - 8px)',
                            top: '144px', // 3 horas después de 08:00
                            height: '72px'
                          }}
                          className="bg-amber-100/90 border-l-4 border-l-amber-500 border border-amber-200 rounded-xl p-2 cursor-pointer hover:shadow-md transition shadow-2xs flex flex-col justify-between text-left overflow-hidden z-10"
                        >
                          <span className="font-bold text-slate-900 text-[11px] truncate">
                            Inspección Ho...
                          </span>
                          <span className="text-[10px] text-amber-900 font-medium">
                            11:00 - 12:30
                          </span>
                        </div>

                        {/* Evento 4: Jueves 10:00 - 11:00 (Renovación) */}
                        <div 
                          onClick={() => handleVerDetalleInspeccion(eventosSemana[3])}
                          style={{
                            position: 'absolute',
                            left: 'calc(16.66% * 4 + 4px)',
                            width: 'calc(16.66% - 8px)',
                            top: '96px', // 2 horas después de 08:00
                            height: '48px' // 1 hora
                          }}
                          className="bg-blue-100/90 border-l-4 border-l-blue-600 border border-blue-200 rounded-xl p-2 cursor-pointer hover:shadow-md transition shadow-2xs flex flex-col justify-between text-left overflow-hidden z-10"
                        >
                          <span className="font-bold text-slate-900 text-[11px] truncate">
                            Renovación - ...
                          </span>
                          <span className="text-[10px] text-blue-900 font-medium">
                            10:00 - 11:00
                          </span>
                        </div>

                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Botón Flotante Inferior: "+ Nuevo Registro de Inspección" */}
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setModalNuevaInspeccionOpen(true)}
                  className="bg-[#1b2533] hover:bg-[#111827] text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transition flex items-center space-x-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-white" />
                  <span>Nuevo Registro de Inspección</span>
                </button>
              </div>

            </div>
          )}

          {/* OTRAS VISTAS DEL MENÚ LATERAL */}
          {seccionActiva !== 'mi-agenda' && (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-2xs min-h-[420px] flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#005596] flex items-center justify-center">
                <itemActivo.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Sección: {itemActivo.label}
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                Estructura y enrutamiento del supervisor listos para implementar los mapas de ruta y actas de inspección en campo.
              </p>
            </div>
          )}

        </main>

      </div>

      {/* ===================================================================== */}
      {/* 4. MODAL: DETALLE DE INSPECCIÓN PROGRAMADA                            */}
      {/* ===================================================================== */}
      {modalInspeccionOpen && inspeccionSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#005596] uppercase tracking-wider">
                  Detalle de Inspección Técnica
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
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

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Tipo de Trámite:</span>
                  <span className="font-bold text-slate-800">{inspeccionSeleccionada.tipo || 'Inspección de Apertura'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Horario Asignado:</span>
                  <span className="font-bold text-[#005596]">{inspeccionSeleccionada.subtitulo || '10:00 - 11:30'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Dirección:</span>
                  <span className="font-bold text-slate-800 text-right max-w-[200px]">{inspeccionSeleccionada.direccion || 'Cochabamba'}</span>
                </div>
              </div>

              <p className="text-slate-500 text-xs">
                Esta inspección fue asignada por la Dirección del SEDES para verificación técnica de ambientes y bioseguridad.
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalInspeccionOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  alert('Iniciando acta de inspección en campo para este establecimiento.');
                  setModalInspeccionOpen(false);
                }}
                className="bg-[#005596] hover:bg-[#003e6d] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Iniciar Acta en Campo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. MODAL: NUEVO REGISTRO DE INSPECCIÓN                                */}
      {/* ===================================================================== */}
      {modalNuevaInspeccionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#005596] uppercase tracking-wider">
                  Programación de Inspección
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  Registrar Nueva Inspección
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevaInspeccionOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              alert('Inspección programada con éxito.');
              setModalNuevaInspeccionOpen(false);
            }} className="space-y-4 text-xs">
              
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Establecimiento de Salud</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laboratorio Clínico Central"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Día de Inspección</label>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6] cursor-pointer">
                    <option value="Lun">Lunes 11</option>
                    <option value="Mar">Martes 12</option>
                    <option value="Mié">Miércoles 13</option>
                    <option value="Jue">Jueves 14</option>
                    <option value="Vie">Viernes 15</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700">Horario</label>
                  <input
                    type="time"
                    defaultValue="10:00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNuevaInspeccionOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#1b2533] hover:bg-[#111827] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer"
                >
                  Guardar en Agenda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
