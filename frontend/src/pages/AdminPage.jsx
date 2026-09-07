import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Users,
  Shield,
  FileCheck2,
  Search,
  Filter,
  Plus,
  Key,
  Edit2,
  Lock,
  Unlock,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Menu,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Mail,
  Phone,
  Building2,
  FlaskConical,
  Sparkles,
  Loader2,
  RefreshCw
} from 'lucide-react';

import logoL1 from '../assets/L1.png';
import logoL2 from '../assets/L2.png';

// Obtener iniciales de 2 a 3 letras a partir de nombres y apellidos (ej: Steven Claros Tapia -> SCT)
const getInitials = (u) => {
  if (!u) return 'U';
  let text = '';
  if (u.nombres && u.apellidos) {
    text = `${u.nombres} ${u.apellidos}`;
  } else if (u.nombreCompleto) {
    text = u.nombreCompleto;
  } else if (u.email) {
    return u.email.slice(0, 2).toUpperCase();
  }

  // Quitar prefijos de títulos comunes (Dr., Dra., Ing., Lic., etc.)
  const clean = text.replace(/^(Dr\.|Dra\.|Ing\.|Lic\.|MSc\.|Ph\.D\.|Abg\.)\s+/i, '').trim();
  const words = clean.split(/\s+/).filter(Boolean);
  
  if (words.length === 0) return 'U';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  if (words.length === 2) return (words[0][0] + words[1][0]).toUpperCase();
  // 3 o más palabras (ej: Steven Claros Tapia -> SCT, Claudia Silvia Alvarez Lopez -> CSAL)
  return words.slice(0, 4).map(w => w[0]).join('').toUpperCase();
};

// Generar paleta de colores vibrantes y elegantes para el avatar
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

// Datos oficiales de usuarios del personal institucional SEDES (excluyendo propietarios)
const INITIAL_USERS = [
  {
    id: 'usr-1',
    nombres: 'Dr. Fernando',
    apellidos: 'Castillo',
    nombreCompleto: 'Dr. Fernando Castillo',
    email: 'f.castillo@sedes.gob.bo',
    rol: 'Director',
    rolBadgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    ultimaConexion: 'Hace 10 min',
    estado: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80',
    ci: '3489102 CB',
    telefono: '72210045'
  },
  {
    id: 'usr-2',
    nombres: 'Dra. Claudia',
    apellidos: 'Morales Valenzuela',
    nombreCompleto: 'Dra. Claudia Morales Valenzuela',
    email: 'coordinador@sedes.gob.bo',
    rol: 'Coordinador',
    rolBadgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    ultimaConexion: 'Hace 5 min',
    estado: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
    ci: '4589201 CB',
    telefono: '71789012'
  },
  {
    id: 'usr-3',
    nombres: 'Ing. Carlos',
    apellidos: 'Quispe',
    nombreCompleto: 'Ing. Carlos Quispe',
    email: 'admin@sedes.gob.bo',
    rol: 'Administrador',
    rolBadgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    ultimaConexion: 'Ahora (En línea)',
    estado: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    ci: '1000001 CB',
    telefono: '70000001'
  },
  {
    id: 'usr-4',
    nombres: 'Ing. Marco Antonio',
    apellidos: 'Vargas Rojas',
    nombreCompleto: 'Ing. Marco Antonio Vargas Rojas',
    email: 'supervisor@sedes.gob.bo',
    rol: 'Supervisor',
    rolBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    ultimaConexion: 'Hace 2 horas',
    estado: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    ci: '6549871 CB',
    telefono: '71239845'
  },
  {
    id: 'usr-5',
    nombres: 'Ing. Carlos',
    apellidos: 'Ruiz Mendoza',
    nombreCompleto: 'Ing. Carlos Ruiz Mendoza',
    email: 'carlos.ruiz@sedes.gob.bo',
    rol: 'Supervisor',
    rolBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    ultimaConexion: 'Hace 1 hora',
    estado: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    ci: '5921840 CB',
    telefono: '71239846'
  },
  {
    id: 'usr-6',
    nombres: 'Dra. Patricia',
    apellidos: 'Valenzuela',
    nombreCompleto: 'Dra. Patricia Valenzuela',
    email: 'patricia.valenzuela@sedes.gob.bo',
    rol: 'Supervisor',
    rolBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    ultimaConexion: 'Hace 4 horas',
    estado: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    ci: '4892103 CB',
    telefono: '71239847'
  },
  {
    id: 'usr-7',
    nombres: 'Lic. Andrea',
    apellidos: 'Torrico',
    nombreCompleto: 'Lic. Andrea Torrico',
    email: 'andrea.torrico@sedes.gob.bo',
    rol: 'Supervisor',
    rolBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    ultimaConexion: 'Hace 1 día',
    estado: 'Activo',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&auto=format&fit=crop&q=80',
    ci: '5291048 CB',
    telefono: '71239848'
  },
  {
    id: 'usr-8',
    nombres: 'Lic. Roberto',
    apellidos: 'Quiroga',
    nombreCompleto: 'Lic. Roberto Quiroga',
    email: 'r.quiroga@sedes.gob.bo',
    rol: 'Supervisor',
    rolBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    ultimaConexion: 'Hace 5 días',
    estado: 'Inactivo',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80',
    ci: '5192834 CB',
    telefono: '71239849'
  }
];

export default function AdminPage() {
  const navigate = useNavigate();
  const { seccion } = useParams();

  const SECCIONES_VALIDAS = ['usuarios', 'roles-permisos', 'requisitos'];
  const rawSeccion = seccion || 'usuarios';
  const seccionActiva = SECCIONES_VALIDAS.includes(rawSeccion) ? rawSeccion : 'usuarios';

  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Lista de usuarios y filtros
  const [usuarios, setUsuarios] = useState(INITIAL_USERS);
  const [cargando, setCargando] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('Todos los Roles');
  const [filtroEstado, setFiltroEstado] = useState('Todos los Estados');
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 8;

  // Modales
  const [modalNuevoUsuarioOpen, setModalNuevoUsuarioOpen] = useState(false);
  const [modalPermisosOpen, setModalPermisosOpen] = useState(false);
  const [modalEditarUsuarioOpen, setModalEditarUsuarioOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [toastMensaje, setToastMensaje] = useState(null);

  // Formulario nuevo usuario
  const [formNuevo, setFormNuevo] = useState({
    nombres: '',
    apellidos: '',
    ci: '',
    email: '',
    telefono: '',
    rol: 'Supervisor',
    password: ''
  });

  // Cargar usuarios desde la Base de Datos
  const cargarUsuariosDesdeBD = async () => {
    setCargando(true);
    try {
      const res = await fetch('http://localhost:8000/api/admin/usuarios?solo_institucionales=true');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setUsuarios(data);
        }
      }
    } catch (err) {
      console.warn('Backend offline, usando datos iniciales:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const sessionUser = localStorage.getItem('usuario');
    if (sessionUser) {
      try {
        setUsuarioLogueado(JSON.parse(sessionUser));
      } catch (e) {
        console.error('Error al cargar sesión:', e);
      }
    }
    cargarUsuariosDesdeBD();
  }, []);

  // Resetear página al buscar o cambiar filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroRol, filtroEstado]);

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const mostrarToast = (mensaje, tipo = 'success') => {
    setToastMensaje({ mensaje, tipo });
    setTimeout(() => {
      setToastMensaje(null);
    }, 3500);
  };

  // Menú lateral estructurado
  const menuItems = [
    {
      id: 'usuarios',
      path: '/admin/usuarios',
      label: 'Gestión de Usuarios',
      icon: Users,
      breadcrumb: 'Gestión de Usuarios'
    },
    {
      id: 'roles-permisos',
      path: '/admin/roles-permisos',
      label: 'Roles y Permisos',
      icon: Shield,
      breadcrumb: 'Roles y Permisos del Sistema'
    },
    {
      id: 'requisitos',
      path: '/admin/requisitos',
      label: 'Requisitos',
      icon: FileCheck2,
      breadcrumb: 'Catálogo de Requisitos Normativos'
    }
  ];

  const itemActivo = menuItems.find(item => item.id === seccionActiva) || menuItems[0];

  const nombreAdmin = usuarioLogueado 
    ? `${usuarioLogueado.nombres} ${usuarioLogueado.apellidos}` 
    : 'Ing. Carlos Quispe';

  // Filtrado de usuarios
  const usuariosFiltrados = usuarios.filter((u) => {
    const texto = `${u.nombreCompleto || ''} ${u.email || ''} ${u.ci || ''}`.toLowerCase();
    const coincideTexto = texto.includes(busqueda.toLowerCase());
    const coincideRol = filtroRol === 'Todos los Roles' || u.rol.toLowerCase().includes(filtroRol.toLowerCase());
    const coincideEstado = filtroEstado === 'Todos los Estados' || u.estado.toLowerCase() === filtroEstado.toLowerCase();
    return coincideTexto && coincideRol && coincideEstado;
  });

  // Métricas dinámicas
  const totalUsuarios = usuarios.length;
  const activos = usuarios.filter(u => u.estado === 'Activo').length;
  const inactivos = usuarios.filter(u => u.estado === 'Inactivo').length;
  const conectadosAhora = usuarios.filter(u => u.estado === 'Activo').length > 0 ? Math.min(3, usuarios.filter(u => u.estado === 'Activo').length) : 0;

  // Paginación real
  const totalPaginas = Math.ceil(usuariosFiltrados.length / elementosPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const usuariosPaginados = usuariosFiltrados.slice(indiceInicio, indiceInicio + elementosPorPagina);

  // Toggle Estado Activo / Inactivo
  const handleToggleEstado = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/admin/usuarios/${id}/toggle-estado`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(prev => prev.map(u => u.id === id ? data : u));
        mostrarToast(`Usuario ${data.nombreCompleto} cambiado a: ${data.estado}`, data.estado === 'Activo' ? 'success' : 'warning');
        return;
      }
    } catch (err) {
      console.warn('Backend toggle error, aplicando cambio local:', err);
    }
    setUsuarios(prev => prev.map(u => {
      if (u.id === id) {
        const nuevoEstado = u.estado === 'Activo' ? 'Inactivo' : 'Activo';
        mostrarToast(`Usuario ${u.nombreCompleto} cambiado a: ${nuevoEstado}`, nuevoEstado === 'Activo' ? 'success' : 'warning');
        return { ...u, estado: nuevoEstado };
      }
      return u;
    }));
  };

  // Crear nuevo usuario en BD
  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/admin/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: formNuevo.nombres,
          apellidos: formNuevo.apellidos,
          ci_nit: formNuevo.ci,
          email: formNuevo.email,
          telefono: formNuevo.telefono,
          rol: formNuevo.rol,
          password: formNuevo.password || 'Sedes2026!'
        })
      });
      if (res.ok) {
        const nuevo = await res.json();
        setUsuarios(prev => [nuevo, ...prev]);
        setModalNuevoUsuarioOpen(false);
        setFormNuevo({
          nombres: '',
          apellidos: '',
          ci: '',
          email: '',
          telefono: '',
          rol: 'Supervisor',
          password: ''
        });
        mostrarToast(`Usuario ${nuevo.nombreCompleto} registrado. Correo de activación enviado a ${nuevo.email}.`, 'success');
        return;
      } else {
        const errData = await res.json();
        mostrarToast(errData.detail || 'Error al registrar usuario', 'error');
        return;
      }
    } catch (err) {
      console.warn('Backend offline, creando localmente:', err);
      const nuevo = {
        id: `usr-${Date.now()}`,
        nombres: formNuevo.nombres,
        apellidos: formNuevo.apellidos,
        nombreCompleto: `${formNuevo.nombres} ${formNuevo.apellidos}`,
        email: formNuevo.email,
        rol: formNuevo.rol,
        rolBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        ultimaConexion: 'Recién creado',
        estado: 'Activo',
        ci: formNuevo.ci,
        telefono: formNuevo.telefono,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
      };
      setUsuarios(prev => [nuevo, ...prev]);
      setModalNuevoUsuarioOpen(false);
      mostrarToast(`Usuario ${nuevo.nombreCompleto} registrado localmente.`, 'success');
    }
  };

  // Guardar edición de usuario
  const handleGuardarEdicion = async (e) => {
    e.preventDefault();
    if (!usuarioEditando) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/usuarios/${usuarioEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: usuarioEditando.nombres,
          apellidos: usuarioEditando.apellidos,
          ci_nit: usuarioEditando.ci,
          email: usuarioEditando.email,
          telefono: usuarioEditando.telefono,
          rol: usuarioEditando.rol,
          estado: usuarioEditando.estado === 'Activo'
        })
      });
      if (res.ok) {
        const editado = await res.json();
        setUsuarios(prev => prev.map(u => u.id === editado.id ? editado : u));
        setModalEditarUsuarioOpen(false);
        setUsuarioEditando(null);
        mostrarToast(`Usuario ${editado.nombreCompleto} actualizado con éxito.`, 'success');
        return;
      } else {
        const errData = await res.json();
        mostrarToast(errData.detail || 'Error al actualizar usuario', 'error');
        return;
      }
    } catch (err) {
      console.warn('Backend offline, actualizando localmente:', err);
      setUsuarios(prev => prev.map(u => u.id === usuarioEditando.id ? {
        ...usuarioEditando,
        nombreCompleto: `${usuarioEditando.nombres} ${usuarioEditando.apellidos}`
      } : u));
      setModalEditarUsuarioOpen(false);
      setUsuarioEditando(null);
      mostrarToast(`Usuario actualizado localmente.`, 'success');
    }
  };

  // Eliminar usuario
  const handleEliminarUsuario = async (u) => {
    if (!confirm(`¿Está seguro de eliminar permanentemente a ${u.nombreCompleto}?`)) return;
    try {
      const res = await fetch(`http://localhost:8000/api/admin/usuarios/${u.id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUsuarios(prev => prev.filter(item => item.id !== u.id));
        mostrarToast(`Usuario ${u.nombreCompleto} eliminado de la base de datos.`, 'warning');
        return;
      }
    } catch (err) {
      console.warn('Backend offline, eliminando localmente:', err);
    }
    setUsuarios(prev => prev.filter(item => item.id !== u.id));
    mostrarToast(`Usuario ${u.nombreCompleto} eliminado.`, 'warning');
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
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-left cursor-pointer
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
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
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
                <span>Administración</span>
                <span className="text-slate-300">/</span>
                <span className="font-bold text-slate-800">{itemActivo.breadcrumb}</span>
              </div>
            </div>

            {/* Perfil del Usuario & Notificaciones */}
            <div className="flex items-center space-x-3 sm:space-x-5">
              
              {/* Campana de Notificaciones con Badge */}
              <button 
                type="button" 
                className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition cursor-pointer"
                title="Notificaciones"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white">
                  2
                </span>
              </button>

              {/* Perfil del Administrador */}
              <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    {nombreAdmin}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Administrador de Sistemas
                  </p>
                </div>

                {/* Avatar de Iniciales */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#005596] to-[#0080d0] text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-slate-100 select-none tracking-tight">
                  <span>{getInitials(usuarioLogueado || { nombreCompleto: nombreAdmin })}</span>
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

        {/* Notificación Toast */}
        {toastMensaje && (
          <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center space-x-3 text-xs sm:text-sm animate-bounce">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMensaje.mensaje}</span>
            <button onClick={() => setToastMensaje(null)} className="ml-2 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ===================================================================== */}
        {/* 3. CONTENIDO PRINCIPAL                                                */}
        {/* ===================================================================== */}
        <main className="flex-1 p-4 sm:p-8 lg:p-10 space-y-6 max-w-7xl mx-auto w-full">
          
          {/* =================================================================== */}
          {/* SECCIÓN 1: GESTIÓN DE USUARIOS (MOCKUP FIGMA)                      */}
          {/* =================================================================== */}
          {seccionActiva === 'usuarios' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Encabezado + Botones de Acción */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Gestión de Usuarios
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Administre las cuentas de usuario del sistema.
                  </p>
                </div>

                <div className="flex items-center space-x-3 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setModalPermisosOpen(true)}
                    className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-2xs transition flex items-center space-x-2 cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-slate-600" />
                    <span>Editar Permisos</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalNuevoUsuarioOpen(true)}
                    className="bg-[#1b2533] hover:bg-[#111827] text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition flex items-center space-x-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-white" />
                    <span>Crear Nuevo Usuario</span>
                  </button>
                </div>
              </div>

              {/* Fila de Tarjetas de Estadísticas (KPIs) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                
                {/* KPI 1: Usuarios Totales */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1 border-l-4 border-l-slate-800">
                  <span className="text-xs font-semibold text-slate-500 block">Usuarios Totales</span>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{totalUsuarios}</div>
                  <span className="text-[11px] text-slate-400 block pt-1 font-medium">Registrados en el sistema</span>
                </div>

                {/* KPI 2: Activos */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1 border-l-4 border-l-emerald-500">
                  <span className="text-xs font-semibold text-slate-500 block">Activos</span>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{activos}</div>
                  <span className="text-[11px] text-emerald-600 block pt-1 font-bold">+4 nuevos este mes</span>
                </div>

                {/* KPI 3: Inactivos */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1 border-l-4 border-l-slate-400">
                  <span className="text-xs font-semibold text-slate-500 block">Inactivos</span>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{inactivos}</div>
                  <span className="text-[11px] text-slate-400 block pt-1 font-medium">Requieren revisión</span>
                </div>

                {/* KPI 4: Conectados Ahora */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1 border-l-4 border-l-blue-500">
                  <span className="text-xs font-semibold text-slate-500 block">Conectados Ahora</span>
                  <div className="text-3xl font-black text-slate-900 tracking-tight">{conectadosAhora}</div>
                  <span className="text-[11px] text-blue-600 block pt-1 font-bold">Sesiones activas</span>
                </div>

              </div>

              {/* Barra de Búsqueda y Filtros */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row items-center gap-3">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar usuario por nombre o correo..."
                    className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50/80 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0077c8] text-slate-800"
                  />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <select
                    value={filtroRol}
                    onChange={(e) => setFiltroRol(e.target.value)}
                    className="flex-1 md:flex-none px-3.5 py-2 text-xs sm:text-sm font-medium bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0077c8] cursor-pointer"
                  >
                    <option value="Todos los Roles">Todos los Roles</option>
                    <option value="Director">Director</option>
                    <option value="Coordinador">Coordinador</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Administrador">Administrador</option>
                  </select>

                  <select
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value)}
                    className="flex-1 md:flex-none px-3.5 py-2 text-xs sm:text-sm font-medium bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0077c8] cursor-pointer"
                  >
                    <option value="Todos los Estados">Todos los Estados</option>
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => mostrarToast('Filtros actualizados', 'info')}
                    className="px-4 py-2 text-xs sm:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shrink-0"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filtrar</span>
                  </button>
                </div>
              </div>

              {/* Tabla de Usuarios Registrados */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    Usuarios Registrados
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    Mostrando {usuariosFiltrados.length} de {totalUsuarios} usuarios
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-200/80 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="py-3.5 px-5">Nombre / Correo</th>
                        <th className="py-3.5 px-5">Correo Electrónico</th>
                        <th className="py-3.5 px-5">Rol Asignado</th>
                        <th className="py-3.5 px-5">Última Conexión</th>
                        <th className="py-3.5 px-5">Estado</th>
                        <th className="py-3.5 px-5 text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cargando ? (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center space-y-2">
                              <Loader2 className="w-6 h-6 animate-spin text-[#0077c8]" />
                              <span className="text-xs font-semibold">Cargando usuarios desde la base de datos...</span>
                            </div>
                          </td>
                        </tr>
                      ) : usuariosPaginados.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-12 text-center text-slate-400">
                            <div className="flex flex-col items-center justify-center space-y-1">
                              <Users className="w-8 h-8 text-slate-300" />
                              <span className="text-xs font-bold text-slate-600">No se encontraron usuarios</span>
                              <span className="text-[11px] text-slate-400">Intente modificando los filtros de búsqueda</span>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        usuariosPaginados.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/70 transition">
                            
                            {/* Nombre / Avatar de Iniciales */}
                            <td className="py-4 px-5">
                              <div className="flex items-center space-x-3">
                                <div className={`w-9 h-9 rounded-full ${getAvatarColor(u.nombreCompleto || u.nombres)} flex items-center justify-center font-black text-xs shadow-2xs border border-white/40 shrink-0 tracking-tight select-none`}>
                                  {getInitials(u)}
                                </div>
                                <div>
                                  <h4 className="font-bold text-slate-900 leading-tight">
                                    {u.nombreCompleto}
                                  </h4>
                                  <span className="text-[11px] text-slate-400 block">
                                    {u.email}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Correo */}
                            <td className="py-4 px-5 text-slate-600 font-medium">
                              {u.email}
                            </td>

                            {/* Rol Asignado */}
                            <td className="py-4 px-5 font-bold text-slate-900">
                              {u.rol}
                            </td>

                            {/* Última Conexión */}
                            <td className="py-4 px-5 text-slate-500 font-medium">
                              {u.ultimaConexion}
                            </td>

                            {/* Estado */}
                            <td className="py-4 px-5">
                              <span className={`
                                inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border
                                ${u.estado === 'Activo' 
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                  : 'bg-slate-100 text-slate-600 border-slate-200'
                                }
                              `}>
                                {u.estado}
                              </span>
                            </td>

                            {/* Acciones */}
                            <td className="py-4 px-5 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                
                                {/* Editar */}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUsuarioEditando({ ...u });
                                    setModalEditarUsuarioOpen(true);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                  title="Editar usuario"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                {/* Bloquear / Activar */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleEstado(u.id)}
                                  className={`
                                    p-1.5 rounded-lg transition cursor-pointer
                                    ${u.estado === 'Activo' 
                                      ? 'text-amber-600 hover:text-amber-800 hover:bg-amber-50' 
                                      : 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50'
                                    }
                                  `}
                                  title={u.estado === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
                                >
                                  {u.estado === 'Activo' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                </button>

                                {/* Eliminar */}
                                <button
                                  type="button"
                                  onClick={() => handleEliminarUsuario(u)}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>

                              </div>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Paginación Inferior */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                  <button
                    type="button"
                    disabled={paginaActual === 1}
                    onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                    className={`px-3 py-1.5 border border-slate-200 rounded-xl transition flex items-center space-x-1 ${
                      paginaActual === 1 ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </button>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((num) => (
                      <button
                        key={num}
                        onClick={() => setPaginaActual(num)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${
                          paginaActual === num 
                            ? 'bg-[#1b2533] text-white font-bold' 
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    disabled={paginaActual === totalPaginas}
                    onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                    className={`px-3 py-1.5 border border-slate-200 rounded-xl transition flex items-center space-x-1 ${
                      paginaActual === totalPaginas ? 'opacity-40 cursor-not-allowed bg-slate-50' : 'hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* =================================================================== */}
          {/* SECCIÓN 2: ROLES Y PERMISOS                                         */}
          {/* =================================================================== */}
          {seccionActiva === 'roles-permisos' && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Matriz de Roles y Permisos</h3>
                <p className="text-xs text-slate-500 mt-1">Configuración de niveles de autorización según la normativa sanitaria del SEDES.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { rol: 'Director', desc: 'Acceso total y firma final de resoluciones de apertura.', usuarios: 1, color: 'border-l-indigo-600' },
                  { rol: 'Coordinador', desc: 'Gestión de bandeja, revisión documental y asignación de supervisores.', usuarios: 1, color: 'border-l-sky-600' },
                  { rol: 'Supervisor', desc: 'Realización de actas en campo, geolocalización e inspección física.', usuarios: 5, color: 'border-l-amber-500' },
                  { rol: 'Administrador', desc: 'Control de usuarios, bitácoras de auditoría y configuración IT.', usuarios: 1, color: 'border-l-slate-800' },
                  { rol: 'Propietario', desc: 'Creación de trámites, pago de aranceles y consulta pública.', usuarios: 10, color: 'border-l-emerald-600' },
                ].map((item, idx) => (
                  <div key={idx} className={`p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs border-l-4 ${item.color} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-sm text-slate-900">{item.rol}</h4>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        {item.usuarios} cuentas
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =================================================================== */}
          {/* SECCIÓN 3: REQUISITOS                                               */}
          {/* =================================================================== */}
          {seccionActiva === 'requisitos' && (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-2xs space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Catálogo de Requisitos Normativos</h3>
                <p className="text-xs text-slate-500 mt-1">Requisitos legales, administrativos y técnicos requeridos para apertura y renovación.</p>
              </div>

              <div className="p-4 bg-sky-50 rounded-2xl border border-sky-200 text-sky-900 text-xs flex items-start space-x-3">
                <FileCheck2 className="w-5 h-5 text-[#0077c8] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Módulo de Requisitos Normativos Sincronizado</p>
                  <p className="text-sky-800">Los 10 requisitos normativos están precargados y sincronizados con los formularios de trámite y actas de supervisores.</p>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* ===================================================================== */}
      {/* 4. MODAL: CREAR NUEVO USUARIO                                         */}
      {/* ===================================================================== */}
      {modalNuevoUsuarioOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#005596] uppercase tracking-wider">
                  Administración de Cuentas
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  Crear Nuevo Usuario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevoUsuarioOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCrearUsuario} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={formNuevo.nombres}
                    onChange={(e) => setFormNuevo({ ...formNuevo, nombres: e.target.value })}
                    placeholder="Ej: Marcelo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={formNuevo.apellidos}
                    onChange={(e) => setFormNuevo({ ...formNuevo, apellidos: e.target.value })}
                    placeholder="Ej: Ríos Camacho"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">CI / NIT *</label>
                  <input
                    type="text"
                    required
                    value={formNuevo.ci}
                    onChange={(e) => setFormNuevo({ ...formNuevo, ci: e.target.value })}
                    placeholder="Ej: 5928102 CB"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Teléfono *</label>
                  <input
                    type="text"
                    required
                    value={formNuevo.telefono}
                    onChange={(e) => setFormNuevo({ ...formNuevo, telefono: e.target.value })}
                    placeholder="Ej: 71239845"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Correo Electrónico Institucional *</label>
                <input
                  type="email"
                  required
                  value={formNuevo.email}
                  onChange={(e) => setFormNuevo({ ...formNuevo, email: e.target.value })}
                  placeholder="Ej: m.rios@sedes.gob.bo"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Rol Asignado *</label>
                <select
                  value={formNuevo.rol}
                  onChange={(e) => setFormNuevo({ ...formNuevo, rol: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8] cursor-pointer"
                >
                  <option value="Supervisor">Supervisor</option>
                  <option value="Coordinador">Coordinador</option>
                  <option value="Director">Director</option>
                  <option value="Administrador">Administrador</option>
                </select>
              </div>

              {/* Aviso de activación por correo */}
              <div className="p-3 bg-sky-50 border border-sky-200/80 rounded-xl flex items-start space-x-2.5 text-sky-900">
                <Mail className="w-4 h-4 text-[#0077c8] shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Invitación por Correo:</strong> Se enviará un correo automático a la cuenta del funcionario con un enlace para que active su cuenta y configure su contraseña privada de forma segura.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNuevoUsuarioOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#1b2533] hover:bg-[#111827] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer"
                >
                  Guardar y Activar Usuario
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 4.5. MODAL: EDITAR USUARIO                                            */}
      {/* ===================================================================== */}
      {modalEditarUsuarioOpen && usuarioEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#0077c8] uppercase tracking-wider">
                  Administración SEDES
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  Editar Usuario Institucional
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalEditarUsuarioOpen(false);
                  setUsuarioEditando(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nombres *</label>
                  <input
                    type="text"
                    required
                    value={usuarioEditando.nombres || ''}
                    onChange={(e) => setUsuarioEditando({ ...usuarioEditando, nombres: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={usuarioEditando.apellidos || ''}
                    onChange={(e) => setUsuarioEditando({ ...usuarioEditando, apellidos: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">C.I. / Documento *</label>
                  <input
                    type="text"
                    required
                    value={usuarioEditando.ci || ''}
                    onChange={(e) => setUsuarioEditando({ ...usuarioEditando, ci: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Teléfono *</label>
                  <input
                    type="text"
                    required
                    value={usuarioEditando.telefono || ''}
                    onChange={(e) => setUsuarioEditando({ ...usuarioEditando, telefono: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Correo Electrónico Institucional *</label>
                <input
                  type="email"
                  required
                  value={usuarioEditando.email || ''}
                  onChange={(e) => setUsuarioEditando({ ...usuarioEditando, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Rol Asignado *</label>
                  <select
                    value={usuarioEditando.rol || 'Supervisor'}
                    onChange={(e) => setUsuarioEditando({ ...usuarioEditando, rol: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8] cursor-pointer"
                  >
                    <option value="Supervisor">Supervisor</option>
                    <option value="Coordinador">Coordinador</option>
                    <option value="Director">Director</option>
                    <option value="Administrador">Administrador</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Estado de Cuenta *</label>
                  <select
                    value={usuarioEditando.estado || 'Activo'}
                    onChange={(e) => setUsuarioEditando({ ...usuarioEditando, estado: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8] cursor-pointer"
                  >
                    <option value="Activo">Activo (Habilitado)</option>
                    <option value="Inactivo">Inactivo (Bloqueado)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalEditarUsuarioOpen(false);
                    setUsuarioEditando(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0077c8] hover:bg-[#0060a8] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 5. MODAL: EDITAR PERMISOS                                             */}
      {/* ===================================================================== */}
      {modalPermisosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#005596] uppercase tracking-wider">
                  Configuración de Seguridad
                </span>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mt-0.5">
                  Permisos de Acceso
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setModalPermisosOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Los permisos por rol están regidos por el protocolo institucional SEDES Cochabamba. Puede modificar privilegios de lectura, dictamen y asignación.
            </p>

            <div className="space-y-2 text-xs">
              {[
                { perm: 'Aprobación y emisión de resoluciones', activo: true },
                { perm: 'Asignación de zonas e inspectores', activo: true },
                { perm: 'Edición del catálogo de requisitos', activo: true },
                { perm: 'Acceso a registros de auditoría', activo: true }
              ].map((p, idx) => (
                <label key={idx} className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
                  <input type="checkbox" defaultChecked={p.activo} className="rounded text-[#0077c8] focus:ring-[#0077c8]" />
                  <span className="font-semibold text-slate-700">{p.perm}</span>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalPermisosOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalPermisosOpen(false);
                  mostrarToast('Permisos de seguridad actualizados con éxito.', 'success');
                }}
                className="bg-[#0077c8] hover:bg-[#0060a8] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
