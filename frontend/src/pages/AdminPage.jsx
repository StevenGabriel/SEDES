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
  RefreshCw,
  Folder,
  Settings,
  History,
  Clock,
  Globe,
  User,
  Check,
  Eye,
  FileText,
  Download,
  PlusCircle
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

// Matriz oficial de especificación de permisos por módulo
const INITIAL_MATRIZ_PERMISOS = [
  {
    id: 'tramites',
    nombre: 'Trámites',
    descripcion: 'Gestión, creación y emisión de resoluciones de apertura',
    permisos: {
      director: 'Total',
      coordinador: 'Total',
      supervisor: 'Lectura',
      propietario: 'Propios',
      publico: 'Público'
    }
  },
  {
    id: 'inspecciones',
    nombre: 'Inspecciones',
    descripcion: 'Programación de agenda, actas en campo y citaciones sanitarias',
    permisos: {
      director: 'Total',
      coordinador: 'Total',
      supervisor: 'Total',
      propietario: 'Denegado',
      publico: 'Denegado'
    }
  },
  {
    id: 'documentos',
    nombre: 'Documentos',
    descripcion: 'Subida y verificación de requisitos legales y técnicos en PDF',
    permisos: {
      director: 'Total',
      coordinador: 'Total',
      supervisor: 'Lectura',
      propietario: 'Propios',
      publico: 'Denegado'
    }
  },
  {
    id: 'usuarios',
    nombre: 'Usuarios',
    descripcion: 'Administración de cuentas institucionales y credenciales',
    permisos: {
      director: 'Total',
      coordinador: 'Lectura',
      supervisor: 'Denegado',
      propietario: 'Denegado',
      publico: 'Denegado'
    }
  },
  {
    id: 'reportes',
    nombre: 'Reportes',
    descripcion: 'Estadísticas e informes gerenciales de habilitación',
    permisos: {
      director: 'Total',
      coordinador: 'Total',
      supervisor: 'Denegado',
      propietario: 'Denegado',
      publico: 'Denegado'
    }
  },
  {
    id: 'catalogos',
    nombre: 'Catálogos',
    descripcion: 'Parámetros del sistema, aranceles y normativas técnicas',
    permisos: {
      director: 'Total',
      coordinador: 'Denegado',
      supervisor: 'Denegado',
      propietario: 'Denegado',
      publico: 'Denegado'
    }
  },
  {
    id: 'auditoria',
    nombre: 'Auditoría',
    descripcion: 'Trazabilidad de acciones y registro de eventos de seguridad',
    permisos: {
      director: 'Total',
      coordinador: 'Denegado',
      supervisor: 'Denegado',
      propietario: 'Denegado',
      publico: 'Denegado'
    }
  }
];

// Registro de historial de cambios recientes en directivas de acceso
const INITIAL_HISTORIAL_CAMBIOS = [
  {
    id: 'hist-1',
    fechaHora: '24/10/2026, 14:32',
    rol: 'Supervisor',
    descripcion: 'Habilitar permiso de lectura en módulo Trámites',
    realizadoPor: 'Ing. Carlos Quispe'
  },
  {
    id: 'hist-2',
    fechaHora: '18/10/2026, 09:15',
    rol: 'Propietario',
    descripcion: 'Restringir acceso completo a Catálogos de Establecimientos',
    realizadoPor: 'Ing. Carlos Quispe'
  },
  {
    id: 'hist-3',
    fechaHora: '05/10/2026, 11:04',
    rol: 'Coordinador',
    descripcion: 'Asignar permiso de edición en módulo Inspecciones',
    realizadoPor: 'Ing. Carlos Quispe'
  }
];

// Catálogo oficial de requisitos clasificados por sección normativa
const INITIAL_SECCIONES_REQUISITOS = [
  {
    id: 'sec-2.1',
    codigo: '2.1',
    titulo: 'SOLICITUD DE HABILITACIÓN',
    subtitulo: 'Formulario oficial FORM.USD-DOSS/CONALAB-001 debidamente llenado.',
    requisitos: [
      { id: 'req-2.1-1', texto: 'Señalar claramente el Tipo y Nivel de complejidad solicitados.' },
      { id: 'req-2.1-2', texto: 'Datos completos del profesional Bioquímico responsable.' },
      { id: 'req-2.1-3', texto: 'Declaración del horario de atención propuesto para el establecimiento.' },
      { id: 'req-2.1-4', texto: 'Inventario detallado de mobiliario, equipos médicos y reactivos químicos.' },
      { id: 'req-2.1-5', texto: 'Inventario de manuales operativos y técnicos disponibles.' }
    ]
  },
  {
    id: 'sec-2.2',
    codigo: '2.2',
    titulo: 'REQUISITOS LEGALES',
    subtitulo: 'Documentación habilitante y acreditación legal del personal técnico.',
    requisitos: [
      { id: 'req-2.2-1', texto: 'Memorial dirigido al Director Departamental de Salud (SEDES).' },
      { id: 'req-2.2-2', texto: 'Título en Provisión Nacional del Bioquímico (fotocopia legalizada).' },
      { id: 'req-2.2-3', texto: 'Diploma Académico correspondiente.' },
      { id: 'req-2.2-4', texto: 'Matrícula Profesional emitida por el Ministerio de Salud.' },
      { id: 'req-2.2-5', texto: 'Carnet del Colegio Departamental de Bioquímica y Farmacia.' },
      { id: 'req-2.2-6', texto: 'Certificado de compatibilidad horaria otorgado por el SEDES.' },
      { id: 'req-2.2-7', texto: 'Cédula de Identidad vigente y fotografía tamaño carnet de fondo azul.' },
      { id: 'req-2.2-8', texto: 'Contrato del Director Técnico o Regente del Laboratorio.' },
      { id: 'req-2.2-9', texto: 'Contratos de los profesionales bioquímicos y especialistas adjuntos.' },
      { id: 'req-2.2-10', texto: 'Título de Especialidad médica (para laboratorios de alta complejidad).' },
      { id: 'req-2.2-11', texto: 'Contratos del personal técnico y auxiliares de laboratorio.' }
    ]
  },
  {
    id: 'sec-2.3',
    codigo: '2.3',
    titulo: 'REQUISITOS ADMINISTRATIVOS',
    subtitulo: 'Infraestructura, registros sanitarios y normativa de higiene.',
    requisitos: [
      { id: 'req-2.3-1', texto: 'Número de Identificación Tributaria (NIT) del establecimiento.' },
      { id: 'req-2.3-2', texto: 'Plano detallado de distribución de instalaciones a escala.' },
      { id: 'req-2.3-3', texto: 'Certificado de instalación sanitaria adecuada (desagües químicos).' },
      { id: 'req-2.3-4', texto: 'Convenio vigente para la recolección y tratamiento de residuos infecciosos.' },
      { id: 'req-2.3-5', texto: 'Letrero exterior visible que identifique el nombre del laboratorio.' },
      { id: 'req-2.3-6', texto: 'Copia de la Resolución Administrativa de apertura en lugar visible.' },
      { id: 'req-2.3-7', texto: 'Nombres y títulos de los profesionales bioquímicos expuestos públicamente.' },
      { id: 'req-2.3-8', texto: 'Instalaciones que cumplan estrictamente con las normas vigentes de higiene.' },
      { id: 'req-2.3-9', texto: 'Distintivo de identificación obligatorio para todo el personal de turno.' },
      { id: 'req-2.3-10', texto: 'Señalamiento explícito y público de los horarios de atención al paciente.' }
    ]
  },
  {
    id: 'sec-2.4',
    codigo: '2.4',
    titulo: 'REQUISITOS TÉCNICOS',
    subtitulo: 'Cartera de servicios, control de calidad y manuales operativos obligatorios.',
    requisitos: [
      { id: 'req-2.4-1', texto: 'Lista oficial de exámenes y pruebas bioquímicas habilitadas por nivel.' },
      { id: 'req-2.4-2', texto: 'Inventario certificado de mobiliario técnico, equipos de análisis, material de vidrio y reactivos.' },
      { id: 'req-2.4-3', texto: 'Manual de Procedimientos Técnicos por área de análisis.' },
      { id: 'req-2.4-4', texto: 'Manual de Organización y Funciones del personal administrativo y técnico.' },
      { id: 'req-2.4-5', texto: 'Manual de Control de Calidad interno y externo.' },
      { id: 'req-2.4-6', texto: 'Manual de Bioseguridad y gestión de riesgos sanitarios.' },
      { id: 'req-2.4-7', texto: 'Manual para la toma y transporte seguro de muestras biológicas.' },
      { id: 'req-2.4-8', texto: 'Convenio formal de derivación de muestras con laboratorios acreditados de mayor nivel.' },
      { id: 'req-2.4-9', texto: 'Libros de control foliados (registro de pacientes, reportes y entrega de resultados).' },
      { id: 'req-2.4-10', texto: 'Formulario oficial 302 de notificación obligatoria del Ministerio de Salud.' },
      { id: 'req-2.4-11', texto: 'Bibliografía científica de referencia técnica actualizada en físico o digital.' }
    ]
  },
  {
    id: 'sec-2.5',
    codigo: '2.5',
    titulo: 'REQUISITOS FINANCIEROS',
    subtitulo: 'Tasas departamentales reguladas.',
    requisitos: [
      { id: 'req-2.5-1', texto: 'Cancelación de valores por derecho de Inspección y Habilitación según tasas arancelarias del SEDES dependientes del nivel de complejidad (Baja, Mediana, Alta Complejidad).' }
    ]
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
  const [modalEditarUsuarioOpen, setModalEditarUsuarioOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [toastMensaje, setToastMensaje] = useState(null);

  // Estado para la Matriz de Permisos e Historial de Cambios
  const [matrizPermisos, setMatrizPermisos] = useState(INITIAL_MATRIZ_PERMISOS);
  const [historialCambiosPermisos, setHistorialCambiosPermisos] = useState(INITIAL_HISTORIAL_CAMBIOS);
  const [modalEditarPermisoOpen, setModalEditarPermisoOpen] = useState(false);
  const [moduloEditandoPermisos, setModuloEditandoPermisos] = useState(null);
  const [formPermisosModulo, setFormPermisosModulo] = useState({
    director: 'Total',
    coordinador: 'Total',
    supervisor: 'Lectura',
    propietario: 'Propios',
    publico: 'Denegado'
  });

  // Abrir modal de edición de permisos para un módulo
  const handleAbrirEditarPermisos = (modulo) => {
    setModuloEditandoPermisos(modulo);
    setFormPermisosModulo({ ...modulo.permisos });
    setModalEditarPermisoOpen(true);
  };

  // Guardar cambios en la matriz de permisos y registrar en historial
  const handleGuardarPermisos = (e) => {
    e.preventDefault();
    if (!moduloEditandoPermisos) return;

    setMatrizPermisos(prev => prev.map(m => {
      if (m.id === moduloEditandoPermisos.id) {
        return {
          ...m,
          permisos: { ...formPermisosModulo }
        };
      }
      return m;
    }));

    const ahora = new Date();
    const fechaHoraFormateada = `${ahora.getDate().toString().padStart(2, '0')}/${(ahora.getMonth() + 1).toString().padStart(2, '0')}/${ahora.getFullYear()}, ${ahora.getHours().toString().padStart(2, '0')}:${ahora.getMinutes().toString().padStart(2, '0')}`;

    const nuevoCambio = {
      id: `hist-${Date.now()}`,
      fechaHora: fechaHoraFormateada,
      rol: 'Configuración de Módulo',
      descripcion: `Actualización de directivas de acceso en módulo ${moduloEditandoPermisos.nombre}`,
      realizadoPor: nombreAdmin
    };

    setHistorialCambiosPermisos(prev => [nuevoCambio, ...prev]);
    setModalEditarPermisoOpen(false);
    setModuloEditandoPermisos(null);
    mostrarToast(`Permisos del módulo "${moduloEditandoPermisos.nombre}" actualizados exitosamente.`, 'success');
  };

  // Renderizar Badge de Permiso
  const renderPermisoBadge = (permiso, onClick) => {
    let style = 'bg-slate-50 text-slate-600 border-slate-200';
    let Icon = X;
    let text = permiso || 'Denegado';

    if (permiso === 'Total') {
      style = 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/80';
      Icon = Check;
    } else if (permiso === 'Lectura') {
      style = 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80';
      Icon = Eye;
    } else if (permiso === 'Propios') {
      style = 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100/80';
      Icon = User;
    } else if (permiso === 'Público') {
      style = 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100/80';
      Icon = Globe;
    } else if (permiso === 'Denegado') {
      style = 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100/80';
      Icon = X;
    }

    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer select-none tracking-tight shadow-2xs ${style}`}
        title={`Nivel: ${text}. Clic para editar permisos del módulo.`}
      >
        <Icon className="w-3.5 h-3.5 shrink-0" />
        <span>{text}</span>
      </button>
    );
  };

  // Estado para el Catálogo de Requisitos
  const [seccionesRequisitos, setSeccionesRequisitos] = useState(INITIAL_SECCIONES_REQUISITOS);
  const [modalNuevoRequisitoOpen, setModalNuevoRequisitoOpen] = useState(false);
  const [seccionDestinoId, setSeccionDestinoId] = useState(null);
  const [textoNuevoRequisito, setTextoNuevoRequisito] = useState('');
  const [esObligatorioNuevo, setEsObligatorioNuevo] = useState(true);
  const [modalEditarRequisitoOpen, setModalEditarRequisitoOpen] = useState(false);
  const [requisitoEnEdicion, setRequisitoEnEdicion] = useState(null);
  const [modalNuevaSeccionOpen, setModalNuevaSeccionOpen] = useState(false);
  const [formNuevaSeccion, setFormNuevaSeccion] = useState({ codigo: '2.6', titulo: '', subtitulo: '' });

  // Cargar requisitos desde el backend
  const cargarRequisitosDesdeBD = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/admin/requisitos');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSeccionesRequisitos(data);
        }
      }
    } catch (err) {
      console.warn('Backend offline, usando catálogo local de requisitos:', err);
    }
  };

  // Abrir modal de nuevo requisito
  const handleAbrirAgregarRequisito = (seccionId) => {
    setSeccionDestinoId(seccionId);
    setTextoNuevoRequisito('');
    setEsObligatorioNuevo(true);
    setModalNuevoRequisitoOpen(true);
  };

  // Guardar nuevo requisito en la sección correspondiente
  const handleGuardarNuevoRequisito = async (e) => {
    e.preventDefault();
    if (!seccionDestinoId || !textoNuevoRequisito.trim()) return;

    const sec = seccionesRequisitos.find(s => s.id === seccionDestinoId);
    const codigoSec = sec ? sec.codigo : '2.1';

    try {
      const res = await fetch('http://localhost:8000/api/admin/requisitos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seccion_codigo: codigoSec,
          seccion_titulo: sec?.titulo,
          seccion_subtitulo: sec?.subtitulo,
          texto: textoNuevoRequisito.trim(),
          es_obligatorio: esObligatorioNuevo
        })
      });

      if (res.ok) {
        await cargarRequisitosDesdeBD();
        setModalNuevoRequisitoOpen(false);
        setTextoNuevoRequisito('');
        mostrarToast('Requisito guardado exitosamente en la base de datos.', 'success');
        return;
      } else {
        const errData = await res.json().catch(() => ({}));
        mostrarToast(errData.detail || 'Error al guardar el requisito.', 'error');
        return;
      }
    } catch (err) {
      console.error('Error de conexión al guardar requisito en BD:', err);
      mostrarToast('Error de conexión con el servidor.', 'error');
    }
  };

  // Abrir modal de editar requisito
  const handleAbrirEditarRequisito = (seccionId, req) => {
    setRequisitoEnEdicion({
      seccionId,
      reqId: req.id,
      texto: req.texto,
      es_obligatorio: req.es_obligatorio !== undefined ? req.es_obligatorio : true
    });
    setModalEditarRequisitoOpen(true);
  };

  // Guardar edición de un requisito
  const handleGuardarEdicionRequisito = async (e) => {
    e.preventDefault();
    if (!requisitoEnEdicion || !requisitoEnEdicion.texto.trim()) return;

    const reqId = requisitoEnEdicion.reqId;
    const isNumericId = !isNaN(Number(reqId));

    if (isNumericId) {
      try {
        const res = await fetch(`http://localhost:8000/api/admin/requisitos/${reqId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texto: requisitoEnEdicion.texto.trim(),
            es_obligatorio: requisitoEnEdicion.es_obligatorio
          })
        });

        if (res.ok) {
          await cargarRequisitosDesdeBD();
          setModalEditarRequisitoOpen(false);
          setRequisitoEnEdicion(null);
          mostrarToast('Requisito modificado correctamente en la base de datos.', 'success');
          return;
        } else {
          const errData = await res.json().catch(() => ({}));
          mostrarToast(errData.detail || 'Error al actualizar el requisito.', 'error');
          return;
        }
      } catch (err) {
        console.error('Error al modificar requisito en BD:', err);
        mostrarToast('Error de conexión con el servidor.', 'error');
        return;
      }
    }
  };

  // Eliminar requisito
  const handleEliminarRequisito = async (seccionId, reqId) => {
    if (!confirm('¿Está seguro de eliminar este requisito normativo?')) return;

    const isNumericId = !isNaN(Number(reqId));
    if (isNumericId) {
      try {
        const res = await fetch(`http://localhost:8000/api/admin/requisitos/${reqId}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          await cargarRequisitosDesdeBD();
          mostrarToast('Requisito eliminado del catálogo oficial.', 'warning');
          return;
        }
      } catch (err) {
        console.error('Error al eliminar requisito de BD:', err);
      }
    }

    setSeccionesRequisitos(prev => prev.map(sec => {
      if (sec.id === seccionId) {
        return {
          ...sec,
          requisitos: sec.requisitos.filter(r => r.id !== reqId)
        };
      }
      return sec;
    }));

    mostrarToast('Requisito eliminado.', 'warning');
  };

  // Guardar nueva sección normativa
  const handleGuardarNuevaSeccion = async (e) => {
    e.preventDefault();
    if (!formNuevaSeccion.titulo.trim()) return;

    const codigo = formNuevaSeccion.codigo.trim() || `2.${seccionesRequisitos.length + 1}`;
    const titulo = formNuevaSeccion.titulo.trim().toUpperCase();
    const subtitulo = formNuevaSeccion.subtitulo.trim() || 'Documentación complementaria requerida.';

    try {
      const res = await fetch('http://localhost:8000/api/admin/requisitos/secciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codigo,
          titulo,
          subtitulo
        })
      });
      if (res.ok) {
        await cargarRequisitosDesdeBD();
        setModalNuevaSeccionOpen(false);
        setFormNuevaSeccion({ codigo: `2.${seccionesRequisitos.length + 2}`, titulo: '', subtitulo: '' });
        mostrarToast(`Nueva sección "${titulo}" creada con éxito.`, 'success');
        return;
      }
    } catch (err) {
      console.error('Error al crear sección en BD:', err);
    }

    const nuevaSec = {
      id: `sec-${Date.now()}`,
      codigo,
      titulo,
      subtitulo,
      requisitos: []
    };

    setSeccionesRequisitos(prev => [...prev, nuevaSec]);
    setModalNuevaSeccionOpen(false);
    setFormNuevaSeccion({ codigo: `2.${seccionesRequisitos.length + 2}`, titulo: '', subtitulo: '' });
    mostrarToast(`Nueva sección "${nuevaSec.titulo}" creada con éxito.`, 'success');
  };

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
    cargarRequisitosDesdeBD();
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
                                  : 'bg-red-50 text-red-600 border-red-200'
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
                                      ? 'text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50' 
                                      : 'text-amber-600 hover:text-amber-800 hover:bg-amber-50'
                                    }
                                  `}
                                  title={u.estado === 'Activo' ? 'Desactivar usuario' : 'Activar usuario'}
                                >
                                  {u.estado === 'Activo' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
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
            <div className="space-y-6 animate-fadeIn">
              
              {/* Encabezado de la Sección */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Roles y Permisos
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Configure los roles del sistema y sus permisos de acceso correspondientes.
                  </p>
                </div>
              </div>

              {/* 1. Tarjetas Superiores de Roles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {[
                  { rol: 'Director', nivel: 'Nivel 5', usuarios: '2 usuarios', border: 'border-t-[#1e293b]', iconColor: 'text-slate-700' },
                  { rol: 'Coordinador', nivel: 'Nivel 4', usuarios: '3 usuarios', border: 'border-t-[#0284c7]', iconColor: 'text-sky-600' },
                  { rol: 'Supervisor', nivel: 'Nivel 3', usuarios: '5 usuarios', border: 'border-t-[#0ea5e9]', iconColor: 'text-cyan-500' },
                  { rol: 'Propietario', nivel: 'Nivel 2', usuarios: '35 usuarios', border: 'border-t-[#10b981]', iconColor: 'text-emerald-600' },
                  { rol: 'Público', nivel: 'Nivel 1', usuarios: 'Sin cuenta', border: 'border-t-[#64748b]', iconColor: 'text-slate-500' },
                ].map((item, idx) => (
                  <div key={idx} className={`bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs border-t-4 ${item.border} space-y-2`}>
                    <div className="flex items-center justify-between">
                      <Shield className={`w-4 h-4 ${item.iconColor}`} />
                      <span className="text-[10px] font-extrabold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-100">
                        {item.nivel}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 truncate">
                        {item.rol}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {item.usuarios}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* 2. Matriz de Especificación de Permisos */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Matriz de Especificación de Permisos
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Estado: {matrizPermisos.length} módulos configurados globalmente
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-5">Módulo / Área del Sistema</th>
                        <th className="py-3.5 px-4 text-center">Director Gral.</th>
                        <th className="py-3.5 px-4 text-center">Coordinador</th>
                        <th className="py-3.5 px-4 text-center">Supervisor</th>
                        <th className="py-3.5 px-4 text-center">Propietario</th>
                        <th className="py-3.5 px-4 text-center">Público</th>
                        <th className="py-3.5 px-4 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {matrizPermisos.map((modulo) => (
                        <tr key={modulo.id} className="hover:bg-slate-50/70 transition">
                          
                          {/* Nombre del Módulo con Icono Carpeta */}
                          <td className="py-4 px-5">
                            <div className="flex items-center space-x-2.5">
                              <Folder className="w-4 h-4 text-slate-400 shrink-0" />
                              <span className="font-bold text-slate-900 text-xs sm:text-sm">
                                {modulo.nombre}
                              </span>
                            </div>
                          </td>

                          {/* Director */}
                          <td className="py-4 px-4 text-center">
                            {renderPermisoBadge(modulo.permisos.director, () => handleAbrirEditarPermisos(modulo))}
                          </td>

                          {/* Coordinador */}
                          <td className="py-4 px-4 text-center">
                            {renderPermisoBadge(modulo.permisos.coordinador, () => handleAbrirEditarPermisos(modulo))}
                          </td>

                          {/* Supervisor */}
                          <td className="py-4 px-4 text-center">
                            {renderPermisoBadge(modulo.permisos.supervisor, () => handleAbrirEditarPermisos(modulo))}
                          </td>

                          {/* Propietario */}
                          <td className="py-4 px-4 text-center">
                            {renderPermisoBadge(modulo.permisos.propietario, () => handleAbrirEditarPermisos(modulo))}
                          </td>

                          {/* Público */}
                          <td className="py-4 px-4 text-center">
                            {renderPermisoBadge(modulo.permisos.publico, () => handleAbrirEditarPermisos(modulo))}
                          </td>

                          {/* Acción / Configuración */}
                          <td className="py-4 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleAbrirEditarPermisos(modulo)}
                              className="p-2 text-slate-400 hover:text-[#0077c8] hover:bg-sky-50 rounded-xl transition cursor-pointer"
                              title={`Configurar permisos de ${modulo.nombre}`}
                            >
                              <Settings className="w-4 h-4" />
                            </button>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. Registro de Cambios Recientes en Permisos */}
              <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <History className="w-4 h-4 text-slate-500" />
                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Registro de Cambios Recientes en Permisos
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">
                    Últimos 30 días
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-5">Fecha y Hora</th>
                        <th className="py-3.5 px-5">Rol Modificado</th>
                        <th className="py-3.5 px-5">Descripción del Cambio</th>
                        <th className="py-3.5 px-5">Realizado por</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {historialCambiosPermisos.map((hist) => (
                        <tr key={hist.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3.5 px-5 text-slate-500 font-medium">
                            {hist.fechaHora}
                          </td>
                          <td className="py-3.5 px-5 font-bold text-slate-900">
                            {hist.rol}
                          </td>
                          <td className="py-3.5 px-5 text-slate-700 font-medium">
                            {hist.descripcion}
                          </td>
                          <td className="py-3.5 px-5 text-slate-600 font-medium">
                            {hist.realizadoPor}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* =================================================================== */}
          {/* SECCIÓN 3: REQUISITOS DE LABORATORIOS                               */}
          {/* =================================================================== */}
          {seccionActiva === 'requisitos' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Encabezado Superior con Botón "+ Añadir Nueva Sección" */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Requisitos de Laboratorios
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    Gestione los requisitos para habilitación, apertura y funcionamiento de laboratorios clínicos.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setModalNuevaSeccionOpen(true)}
                  className="bg-[#1b2533] hover:bg-[#111827] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl transition shadow-md flex items-center space-x-2 cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Nueva Sección</span>
                </button>
              </div>

              {/* Lista de Tarjetas de Requisitos por Sección (2.1 a 2.5+) */}
              <div className="space-y-5">
                {seccionesRequisitos.map((sec) => (
                  <section 
                    key={sec.id}
                    className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-2xs space-y-4"
                  >
                    
                    {/* Encabezado de la Sección con Badge Numérico */}
                    <div className="flex items-start space-x-3 pb-3 border-b border-slate-100">
                      <span className="bg-[#1b2533] text-white text-xs font-black px-2.5 py-1 rounded-lg shrink-0 mt-0.5 select-none">
                        {sec.codigo}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900 uppercase tracking-tight">
                          {sec.titulo}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {sec.subtitulo}
                        </p>
                      </div>
                    </div>

                    {/* Lista de Requisitos */}
                    <div className="space-y-2.5">
                      {sec.requisitos.map((req) => {
                        if (req.esSubtitulo) {
                          return (
                            <div key={req.id} className="pt-2 pb-1">
                              <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                                <FileText className="w-3.5 h-3.5 text-[#0077c8]" />
                                <span>{req.texto}</span>
                              </h4>
                            </div>
                          );
                        }

                        return (
                          <div 
                            key={req.id}
                            className="flex items-center justify-between group p-2.5 sm:p-3 rounded-xl hover:bg-slate-50/90 transition border border-transparent hover:border-slate-200/60"
                          >
                            <div className="flex items-start space-x-2.5 flex-1 pr-3">
                              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${req.es_obligatorio === false ? 'text-amber-500' : 'text-cyan-500'}`} />
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <span className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                                    {req.texto}
                                  </span>
                                  {req.es_obligatorio === false ? (
                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 select-none">
                                      <Clock className="w-3 h-3" />
                                      <span>Opcional</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-[#0077c8] border border-sky-100 select-none">
                                      <span>Obligatorio</span>
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Acciones por Requisito: Eliminar y Editar */}
                            <div className="flex items-center space-x-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleEliminarRequisito(sec.id, req.id)}
                                className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                title="Eliminar requisito"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleAbrirEditarRequisito(sec.id, req)}
                                className="p-1.5 text-sky-500 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition cursor-pointer"
                                title="Editar requisito"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Botón "+ Agregar requisito" al pie de cada sección */}
                    <div className="pt-2 border-t border-slate-100/70">
                      <button
                        type="button"
                        onClick={() => handleAbrirAgregarRequisito(sec.id)}
                        className="text-[#0077c8] hover:text-[#005596] font-bold text-xs flex items-center space-x-1.5 cursor-pointer transition hover:underline"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar requisito</span>
                      </button>
                    </div>

                  </section>
                ))}
              </div>

              {/* Botón Inferior: Guía de archivo */}
              <div className="pt-2 pb-6 flex justify-start">
                <Link
                  to="/requisitos"
                  target="_blank"
                  className="bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-50 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition flex items-center space-x-2 cursor-pointer"
                  title="Ver portal público de requisitos"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Guía de archivo</span>
                </Link>
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
      {/* 5. MODAL: CONFIGURAR PERMISOS DE MÓDULO                               */}
      {/* ===================================================================== */}
      {modalEditarPermisoOpen && moduloEditandoPermisos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            
            {/* Cabecera del Modal */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#0077c8] uppercase tracking-wider">
                  Matriz de Autorizaciones
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5 flex items-center space-x-2">
                  <Folder className="w-5 h-5 text-[#0077c8]" />
                  <span>Permisos: {moduloEditandoPermisos.nombre}</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  {moduloEditandoPermisos.descripcion}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalEditarPermisoOpen(false);
                  setModuloEditandoPermisos(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Formulario de Selección de Permisos por Rol */}
            <form onSubmit={handleGuardarPermisos} className="space-y-3.5 text-xs">
              
              <div className="space-y-2.5">
                
                {/* Director Gral. */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-900 text-xs block">Director General</span>
                    <span className="text-[11px] text-slate-400">Nivel 5 - Jerarquía Superior</span>
                  </div>
                  <select
                    value={formPermisosModulo.director}
                    onChange={(e) => setFormPermisosModulo({ ...formPermisosModulo, director: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077c8] cursor-pointer"
                  >
                    <option value="Total">Total (✓)</option>
                    <option value="Lectura">Lectura (👁)</option>
                    <option value="Denegado">Denegado (✕)</option>
                  </select>
                </div>

                {/* Coordinador */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-900 text-xs block">Coordinador SEDES</span>
                    <span className="text-[11px] text-slate-400">Nivel 4 - Gestión y Asignación</span>
                  </div>
                  <select
                    value={formPermisosModulo.coordinador}
                    onChange={(e) => setFormPermisosModulo({ ...formPermisosModulo, coordinador: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077c8] cursor-pointer"
                  >
                    <option value="Total">Total (✓)</option>
                    <option value="Lectura">Lectura (👁)</option>
                    <option value="Denegado">Denegado (✕)</option>
                  </select>
                </div>

                {/* Supervisor */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-900 text-xs block">Supervisor Técnico</span>
                    <span className="text-[11px] text-slate-400">Nivel 3 - Inspecciones y Campo</span>
                  </div>
                  <select
                    value={formPermisosModulo.supervisor}
                    onChange={(e) => setFormPermisosModulo({ ...formPermisosModulo, supervisor: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077c8] cursor-pointer"
                  >
                    <option value="Total">Total (✓)</option>
                    <option value="Lectura">Lectura (👁)</option>
                    <option value="Propios">Propios (👤)</option>
                    <option value="Denegado">Denegado (✕)</option>
                  </select>
                </div>

                {/* Propietario */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-900 text-xs block">Propietario / Solicitante</span>
                    <span className="text-[11px] text-slate-400">Nivel 2 - Portal de Trámites</span>
                  </div>
                  <select
                    value={formPermisosModulo.propietario}
                    onChange={(e) => setFormPermisosModulo({ ...formPermisosModulo, propietario: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077c8] cursor-pointer"
                  >
                    <option value="Total">Total (✓)</option>
                    <option value="Lectura">Lectura (👁)</option>
                    <option value="Propios">Propios (👤)</option>
                    <option value="Denegado">Denegado (✕)</option>
                  </select>
                </div>

                {/* Público */}
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-black text-slate-900 text-xs block">Público / Ciudadanía</span>
                    <span className="text-[11px] text-slate-400">Nivel 1 - Consulta Web Sin Registro</span>
                  </div>
                  <select
                    value={formPermisosModulo.publico}
                    onChange={(e) => setFormPermisosModulo({ ...formPermisosModulo, publico: e.target.value })}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0077c8] cursor-pointer"
                  >
                    <option value="Público">Público (🌐)</option>
                    <option value="Lectura">Lectura (👁)</option>
                    <option value="Denegado">Denegado (✕)</option>
                  </select>
                </div>

              </div>

              {/* Botones de Acción */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalEditarPermisoOpen(false);
                    setModuloEditandoPermisos(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0077c8] hover:bg-[#0060a8] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Guardar y Aplicar</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 6. MODAL: AGREGAR REQUISITO A UNA SECCIÓN                             */}
      {/* ===================================================================== */}
      {modalNuevoRequisitoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#0077c8] uppercase tracking-wider">
                  Catálogo Normativo SEDES
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  Agregar Nuevo Requisito
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Sección: {seccionesRequisitos.find(s => s.id === seccionDestinoId)?.titulo || 'General'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevoRequisitoOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarNuevoRequisito} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Descripción o Enunciado del Requisito *</label>
                <textarea
                  required
                  rows={4}
                  value={textoNuevoRequisito}
                  onChange={(e) => setTextoNuevoRequisito(e.target.value)}
                  placeholder="Ej: Certificado de compatibilidad horaria emitido y firmado por la jefatura del SEDES."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                />
              </div>

              {/* Selector Obligatorio u Opcional */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Tipo de Cumplimiento</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setEsObligatorioNuevo(true)}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer select-none ${
                      esObligatorioNuevo
                        ? 'bg-sky-50 border-[#0077c8] text-[#0077c8] shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>🔵 Obligatorio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEsObligatorioNuevo(false)}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer select-none ${
                      !esObligatorioNuevo
                        ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>🟡 Opcional</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNuevoRequisitoOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0077c8] hover:bg-[#0060a8] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Guardar Requisito</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 7. MODAL: EDITAR REQUISITO EXISTENTE                                  */}
      {/* ===================================================================== */}
      {modalEditarRequisitoOpen && requisitoEnEdicion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#0077c8] uppercase tracking-wider">
                  Modificación de Requisito
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  Editar Requisito Normativo
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setModalEditarRequisitoOpen(false);
                  setRequisitoEnEdicion(null);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarEdicionRequisito} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Texto del Requisito *</label>
                <textarea
                  required
                  rows={4}
                  value={requisitoEnEdicion.texto}
                  onChange={(e) => setRequisitoEnEdicion({ ...requisitoEnEdicion, texto: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                />
              </div>

              {/* Selector Obligatorio u Opcional en Edición */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Tipo de Cumplimiento</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRequisitoEnEdicion({ ...requisitoEnEdicion, es_obligatorio: true })}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer select-none ${
                      requisitoEnEdicion.es_obligatorio !== false
                        ? 'bg-sky-50 border-[#0077c8] text-[#0077c8] shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>🔵 Obligatorio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequisitoEnEdicion({ ...requisitoEnEdicion, es_obligatorio: false })}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center space-x-2 transition cursor-pointer select-none ${
                      requisitoEnEdicion.es_obligatorio === false
                        ? 'bg-amber-50 border-amber-400 text-amber-800 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-4 h-4" />
                    <span>🟡 Opcional</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setModalEditarRequisitoOpen(false);
                    setRequisitoEnEdicion(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#0077c8] hover:bg-[#0060a8] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* 8. MODAL: AÑADIR NUEVA SECCIÓN                                        */}
      {/* ===================================================================== */}
      {modalNuevaSeccionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#0077c8] uppercase tracking-wider">
                  Estructuración Normativa
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  Añadir Nueva Sección
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Cree una nueva categoría de requisitos para habilitación y apertura.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalNuevaSeccionOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGuardarNuevaSeccion} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="font-bold text-slate-700">Código *</label>
                  <input
                    type="text"
                    required
                    value={formNuevaSeccion.codigo}
                    onChange={(e) => setFormNuevaSeccion({ ...formNuevaSeccion, codigo: e.target.value })}
                    placeholder="Ej: 2.6"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="font-bold text-slate-700">Título de la Sección *</label>
                  <input
                    type="text"
                    required
                    value={formNuevaSeccion.titulo}
                    onChange={(e) => setFormNuevaSeccion({ ...formNuevaSeccion, titulo: e.target.value })}
                    placeholder="Ej: REQUISITOS DE BIOSEGURIDAD"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Descripción / Subtítulo</label>
                <input
                  type="text"
                  value={formNuevaSeccion.subtitulo}
                  onChange={(e) => setFormNuevaSeccion({ ...formNuevaSeccion, subtitulo: e.target.value })}
                  placeholder="Ej: Documentación de manejo de residuos y esterilización."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0077c8]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalNuevaSeccionOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-[#1b2533] hover:bg-[#111827] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md cursor-pointer flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Sección</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
