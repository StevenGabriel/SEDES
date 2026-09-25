import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  Building2, 
  FileText, 
  PlusCircle, 
  CreditCard, 
  Bell, 
  LogOut, 
  FlaskConical,
  Menu,
  X,
  CheckCircle2,
  RefreshCw,
  Calendar,
  Eye,
  Edit3,
  MapPin,
  Clock,
  Phone,
  Mail,
  Save,
  Navigation,
  Crosshair,
  AlertCircle,
  AlertTriangle,
  Check,
  Camera,
  Trash2,
  UploadCloud,
  Image as ImageIcon,
  Upload,
  Paperclip,
  FileUp,
  FileCheck2,
  ChevronRight,
  Send,
  Loader2,
  FolderOpen,
  User,
  UserCheck,
  ShieldCheck
} from 'lucide-react';

import logoL1 from '../assets/L1.png';
import logoL2 from '../assets/L2.png';
import heroBg from '../assets/hero_bg.jpg';
import RealMapPicker from '../components/common/RealMapPicker';
import HorarioPicker from '../components/common/HorarioPicker';

// Obtener iniciales de 2 a 4 letras a partir de nombres y apellidos (ej: Steven Claros Tapia -> SCT, Claudia Silvia Alvarez Lopez -> CSAL)
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

// Requisitos Documentales Oficiales para Habilitación y Apertura (Catálogo Base SEDES)
const DEFAULT_SECCIONES_REQUISITOS = [
  {
    id: 'sec-2.1',
    codigo: '2.1',
    titulo: 'SOLICITUD DE HABILITACIÓN',
    subtitulo: 'Formulario oficial FORM. USD-DOSS/CONALAB-001 debidamente llenado.',
    requisitos: [
      { id: 'req-2.1-1', texto: 'El tipo y el nivel de complejidad del laboratorio.', es_obligatorio: true },
      { id: 'req-2.1-2', texto: 'Datos del profesional responsable.', es_obligatorio: true },
      { id: 'req-2.1-3', texto: 'Horario de atención del establecimiento', es_obligatorio: true },
      { id: 'req-2.1-4', texto: 'Inventario de mobiliario, equipos y reactivos.', es_obligatorio: true },
      { id: 'req-2.1-5', texto: 'Inventario de manuales y bibliografía referencial.', es_obligatorio: true }
    ]
  },
  {
    id: 'sec-2.2',
    codigo: '2.2',
    titulo: 'REQUISITOS LEGALES',
    subtitulo: 'Documentación habilitante y acreditación legal del personal técnico.',
    requisitos: [
      { id: 'req-2.2-1', texto: 'Solicitud mediante memorial dirigida al director departamental de salud para habilitación, apertura y funcionamiento de laboratorio.', es_obligatorio: true },
      { id: 'req-2.2-2', texto: 'Copia legalizada del título en provisión nacional de bioquímico o bioquímico farmacéutico.', es_obligatorio: true },
      { id: 'req-2.2-3', texto: 'Copia legalizada del diploma académico de bioquímico o bioquímico - farmacéutico.', es_obligatorio: true },
      { id: 'req-2.2-4', texto: 'Fotocopia legalizada de matrícula profesional.', es_obligatorio: true },
      { id: 'req-2.2-5', texto: 'Fotocopia legalizada del carnet de colegio de bioquímica y farmacia.', es_obligatorio: true },
      { id: 'req-2.2-6', texto: 'Certificado de compatibilidad horaria otorgado por el SEDES.', es_obligatorio: true },
      { id: 'req-2.2-7', texto: 'Fotocopia de célula de identidad.', es_obligatorio: true },
      { id: 'req-2.2-8', texto: 'Fotografía tamaño carnet.', es_obligatorio: true },
      { id: 'req-2.2-9', texto: 'Contrato de trabajo del director técnico (regente bioquímico responsable) del laboratorio visado por la dirección departamental de trabajo (si corresponde)', es_obligatorio: true },
      { id: 'req-2.2-10', texto: 'Contrato de trabajo de los profesionales bioquímicos, bioquímico farmacéuticos de las áreas diferentes de apoyo.', es_obligatorio: false },
      { id: 'req-2.2-11', texto: 'Contrato de trabajo de bioquímicos especialistas si corresponde.', es_obligatorio: true },
      { id: 'req-2.2-12', texto: 'Fotocopia legalizada de título de especialidad si corresponde.', es_obligatorio: true },
      { id: 'req-2.2-13', texto: 'Contrato de trabajo de técnicos de laboratorio si corresponde.', es_obligatorio: true }
    ]
  },
  {
    id: 'sec-2.3',
    codigo: '2.3',
    titulo: 'REQUISITOS ADMINISTRATIVOS',
    subtitulo: 'Infraestructura, registros sanitarios y normativa de higiene.',
    requisitos: [
      { id: 'req-2.3-1', texto: 'Número de Identificación Tributaria (NIT).', es_obligatorio: true },
      { id: 'req-2.3-2', texto: 'Plano de las instalaciones del establecimiento de acuerdo a lo establecido en el reglamento.', es_obligatorio: true },
      { id: 'req-2.3-3', texto: 'Instalación higiénico sanitaria y teléfono (en zonas centrales y urbano-periféricas con cobertura).', es_obligatorio: true },
      { id: 'req-2.3-4', texto: 'Convenio con el municipio para recojo de residuos infecciosos.', es_obligatorio: true },
      { id: 'req-2.3-5', texto: 'Verificación en lugar visible de la Resolución y FORM. MSD-DGSS/CONALAB-001 de habilitación coincidente con la dirección.', es_obligatorio: true },
      { id: 'req-2.3-6', texto: 'Verificación de nómina visible con nombres de los profesionales bioquímicos responsables.', es_obligatorio: true },
      { id: 'req-2.3-7', texto: 'Verificación de fotocopia visible del título en Provisión Nacional de los responsables.', es_obligatorio: true },
      { id: 'req-2.3-8', texto: 'Instalaciones acondicionadas bajo normas de higiene y salud acordes al nivel de complejidad.', es_obligatorio: true },
      { id: 'req-2.3-9', texto: 'Uso obligatorio de distintivo con nombre, foto y matrícula profesional del personal bioquímico.', es_obligatorio: true },
      { id: 'req-2.3-10', texto: 'Horario de atención al público claramente señalizado en el establecimiento.', es_obligatorio: true }
    ]
  },
  {
    id: 'sec-2.4',
    codigo: '2.4',
    titulo: 'REQUISITOS TÉCNICOS',
    subtitulo: 'Cartera de servicios, control de calidad y manuales operativos obligatorios.',
    requisitos: [
      { id: 'req-2.4-1', texto: 'Lista de exámenes habilitados y autorizados para su nivel de complejidad.', es_obligatorio: true },
      { id: 'req-2.4-2', texto: 'Inventario de mobiliario.', es_obligatorio: true },
      { id: 'req-2.4-3', texto: 'Inventario de equipos.', es_obligatorio: true },
      { id: 'req-2.4-4', texto: 'Inventario de material de vidrio y otros materiales.', es_obligatorio: true },
      { id: 'req-2.4-5', texto: 'Inventario de reactivos y diagnosticadores.', es_obligatorio: true },
      { id: 'req-2.4-6', texto: 'Manual de procedimientos.', es_obligatorio: true },
      { id: 'req-2.4-7', texto: 'Manual de organización y funciones.', es_obligatorio: true },
      { id: 'req-2.4-8', texto: 'Manual de calidad.', es_obligatorio: false },
      { id: 'req-2.4-9', texto: 'Manual de bioseguridad.', es_obligatorio: true },
      { id: 'req-2.4-10', texto: 'Manual de toma y transporte de muestras.', es_obligatorio: true },
      { id: 'req-2.4-11', texto: 'Convenio escrito con laboratorio de mayor complejidad para derivación de muestras.', es_obligatorio: true },
      { id: 'req-2.4-12', texto: 'Libro de registro de pacientes.', es_obligatorio: true },
      { id: 'req-2.4-13', texto: 'Libro de reportes de resultados.', es_obligatorio: true },
      { id: 'req-2.4-14', texto: 'Libro de entrega de resultados.', es_obligatorio: true },
      { id: 'req-2.4-15', texto: 'Formulario 303 de Producción y Vigilancia Epidemiológica.', es_obligatorio: true },
      { id: 'req-2.4-16', texto: 'Bibliografía de referencia obligatoria según su capacidad resolutiva.', es_obligatorio: true }
    ]
  },
  {
    id: 'sec-2.5',
    codigo: '2.5',
    titulo: 'REQUISITOS FINANCIEROS',
    subtitulo: 'Tasas departamentales reguladas.',
    requisitos: [
      { id: 'req-2.5-1', texto: 'Cancelación de valores por derecho de Habilitación, Apertura y Funcionamiento según tasas del nivel de complejidad.', es_obligatorio: true }
    ]
  }
];

// 8 Especialidades Oficiales del SEDES (según diseño Figma)
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

// Tasas Arancelarias Oficiales vigentes para trámites de laboratorios (SEDES)
const TASAS_ARANCELARIAS = [
  { descripcion: 'LABORATORIOS IV NIVEL (INSTITUTOS DE REFERENCIA NACIONAL E INVESTIGACIÓN)', monto: 'Bs. 5.000,00' },
  { descripcion: 'LABORATORIOS III NIVEL', monto: 'Bs. 4.000,00' },
  { descripcion: 'LABORATORIOS II NIVEL', monto: 'Bs. 3.000,00' },
  { descripcion: 'LABORATORIOS I NIVEL', monto: 'Bs. 2.000,00' },
  { descripcion: 'LABORATORIOS II NIVEL AREA RURAL', monto: 'Bs. 2.000,00' },
  { descripcion: 'LABORATORIOS I NIVEL AREA RURAL', monto: 'Bs. 1.000,00' },
  { descripcion: 'RENOVACIÓN DE HABILITACIÓN', monto: 'Bs. 500,00' },
  { descripcion: 'CAMBIO DEL NIVEL DE HABILITACIÓN', monto: 'Bs. 1.000,00' },
  { descripcion: 'TRASLADO, CAMBIO DE DOMICILIO', monto: 'Bs. 500,00' },
  { descripcion: 'CAMBIO DE RAZÓN SOCIAL', monto: 'Bs. 500,00' },
  { descripcion: 'CAMBIO DE REGENCIA/DIRECCIÓN TÉCNICA', monto: 'Bs. 500,00' },
  { descripcion: 'TRANSFERENCIA', monto: 'Bs. 500,00' },
  { descripcion: 'FORMULARIO DE SOLICITUD CONALAB-001', monto: 'Bs. 200,00' },
  { descripcion: 'CERTIFICADO DE PARTICIPACIÓN EN PEEC (OFICIAL)', monto: 'Bs. 200,00' },
];

export default function PropietarioPage() {
  const navigate = useNavigate();
  const { seccion } = useParams();

  // Sección activa según la URL del navegador
  const SECCIONES_VALIDAS = ['mis-establecimientos', 'tramites', 'nueva-solicitud', 'tasas-arancelarias'];
  const seccionActiva = SECCIONES_VALIDAS.includes(seccion) ? seccion : 'mis-establecimientos';

  const [usuario, setUsuario] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estado de establecimientos del propietario
  const [misEstablecimientos, setMisEstablecimientos] = useState([]);
  const [isLoadingLabs, setIsLoadingLabs] = useState(true);

  // Estado del Modal de "Editar Página"
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [labEditando, setLabEditando] = useState(null);
  const [formEdit, setFormEdit] = useState({
    horario: '',
    telefono: '',
    email_contacto: '',
    descripcion: '',
    servicios: [],
    direccion: '',
    responsable_laboratorio: '',
    ci_responsable: '',
    responsables_areas: '',
    latitud: -17.38975,
    longitud: -66.15951,
    imagen_url: ''
  });
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [previewImagen, setPreviewImagen] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');

  // =========================================================================
  // Estado para la Vista: "Nueva Solicitud de Apertura"
  // =========================================================================
  const [formNueva, setFormNueva] = useState({
    municipio: 'CERCADO',
    tipo: 'Privado',
    nombre_comercial: '',
    nivel: 'Nivel 1',
    direccion: '',
    telefono: '',
    responsable_laboratorio: '',
    ci_responsable: '',
    horario: 'Lun-Vie 7:00 - 19:00, Sáb 8:00 - 13:00',
    email_contacto: '',
    descripcion: '',
    servicios: ['Clínico General'],
    latitud: -17.3895,
    longitud: -66.1568
  });
  const [encargadosAreas, setEncargadosAreas] = useState({
    'Clínico General': { nombre: '', ci: '' }
  });
  const [nuevaFotoFile, setNuevaFotoFile] = useState(null);
  const [nuevaFotoPreview, setNuevaFotoPreview] = useState(null);
  const [documentosAdjuntos, setDocumentosAdjuntos] = useState({});
  const [isSubmittingNueva, setIsSubmittingNueva] = useState(false);
  const [solicitudEnviadaExito, setSolicitudEnviadaExito] = useState(false);
  const [faltantesModal, setFaltantesModal] = useState([]);

  // =========================================================================
  // Estado para la Vista: "Trámites y Subsanación de Documentos"
  // =========================================================================
  const [tramitesUsuario, setTramitesUsuario] = useState([]);
  const [tramiteSeleccionadoId, setTramiteSeleccionadoId] = useState(null);
  const [cargandoTramites, setCargandoTramites] = useState(false);
  const [subiendoSubsanacion, setSubiendoSubsanacion] = useState(false);
  const [archivosSubsanacion, setArchivosSubsanacion] = useState({}); // { [docKey]: File }
  const [subsanandoDocId, setSubsanandoDocId] = useState(null); // 'ALL' o docKey específico
  const [modalFeedback, setModalFeedback] = useState(null); // { tipo: 'success' | 'error' | 'info', titulo: string, mensaje: string }

  // =========================================================================
  // Estado para Modal de Rehabilitación de Acta (3 requisitos obligatorios)
  // =========================================================================
  const [modalRehabilitacionOpen, setModalRehabilitacionOpen] = useState(false);
  const [labRehabilitando, setLabRehabilitando] = useState(null);
  const [fileEmsa, setFileEmsa] = useState(null);
  const [fileCozbes, setFileCozbes] = useState(null);
  const [fileMemorial, setFileMemorial] = useState(null);
  const [enviandoRehabilitacion, setEnviandoRehabilitacion] = useState(false);

  const handleAbrirRehabilitacion = (lab) => {
    setLabRehabilitando(lab);
    setFileEmsa(null);
    setFileCozbes(null);
    setFileMemorial(null);
    setModalRehabilitacionOpen(true);
  };

  const handleEnviarRehabilitacion = async (e) => {
    e.preventDefault();
    if (!labRehabilitando) return;

    if (!fileEmsa) {
      alert('Por favor adjunte el Contrato de recojo de residuos infecciosos (EMSA) en formato PDF.');
      return;
    }
    if (!fileCozbes) {
      alert('Por favor adjunte el Certificado de bioseguridad (COZBES) en formato PDF.');
      return;
    }
    if (!fileMemorial) {
      alert('Por favor adjunte el Memorial correspondiente en formato PDF.');
      return;
    }

    setEnviandoRehabilitacion(true);
    try {
      const formData = new FormData();
      formData.append('establecimiento_id', labRehabilitando.id);
      if (usuario?.id) {
        formData.append('propietario_id', usuario.id);
      }
      formData.append('file_emsa', fileEmsa);
      formData.append('file_cozbes', fileCozbes);
      formData.append('file_memorial', fileMemorial);

      const res = await fetch('http://localhost:8000/api/tramites/rehabilitacion', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al enviar solicitud de rehabilitación.');
      }

      const data = await res.json();
      setModalRehabilitacionOpen(false);
      setModalFeedback({
        tipo: 'success',
        titulo: '¡Solicitud de Rehabilitación Enviada!',
        mensaje: `Su solicitud para '${labRehabilitando.nombre_comercial}' fue registrada exitosamente con código ${data.codigo_tramite}. Se ha enviado a la bandeja del Coordinador para su verificación y posterior asignación de inspección técnica.`
      });

      // Refrescar datos
      if (usuario?.id) {
        fetchMisEstablecimientos(usuario.id);
        fetchTramitesUsuario(usuario.id);
        fetchNotificaciones(usuario.id);
      }
    } catch (err) {
      console.error('Error al enviar rehabilitación:', err);
      alert(err.message || 'Error al enviar la solicitud de rehabilitación.');
    } finally {
      setEnviandoRehabilitacion(false);
    }
  };

  // Catálogo dinámico de requisitos gestionado por el Administrador
  const [seccionesRequisitos, setSeccionesRequisitos] = useState(DEFAULT_SECCIONES_REQUISITOS);
  const [cargandoRequisitos, setCargandoRequisitos] = useState(false);

  // =========================================================================
  // Notificaciones en Tiempo Real para el Propietario
  // =========================================================================
  const [notificaciones, setNotificaciones] = useState([]);
  const [notifNoLeidas, setNotifNoLeidas] = useState(0);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const fetchNotificaciones = async (propietarioId) => {
    if (!propietarioId) return;
    try {
      const res = await fetch(`http://localhost:8000/api/notificaciones/usuario/${propietarioId}`);
      if (res.ok) {
        const data = await res.json();
        setNotificaciones(data.notificaciones || []);
        setNotifNoLeidas(data.no_leidas || 0);
      }
    } catch (err) {
      console.warn('Error al cargar notificaciones del propietario:', err);
    }
  };

  const handleMarcarNotifLeida = async (notifId) => {
    try {
      await fetch(`http://localhost:8000/api/notificaciones/${notifId}/leer`, { method: 'PATCH' });
      setNotificaciones(prev => prev.map(n => n.id === notifId ? { ...n, leido: true } : n));
      setNotifNoLeidas(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.warn('Error al marcar notificación leída:', e);
    }
  };

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

  const handleLimpiarTodasNotificaciones = async () => {
    if (!usuario?.id) return;
    try {
      await fetch(`http://localhost:8000/api/notificaciones/usuario/${usuario.id}/limpiar`, { method: 'DELETE' });
      setNotificaciones([]);
      setNotifNoLeidas(0);
    } catch (e) {
      console.warn('Error al limpiar todas las notificaciones:', e);
    }
  };

  const handleEliminarNotificacion = async (notifId, e) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`http://localhost:8000/api/notificaciones/${notifId}`, { method: 'DELETE' });
      setNotificaciones(prev => {
        const item = prev.find(n => n.id === notifId);
        if (item && !item.leido) {
          setNotifNoLeidas(c => Math.max(0, c - 1));
        }
        return prev.filter(n => n.id !== notifId);
      });
    } catch (err) {
      console.warn('Error al eliminar notificación:', err);
    }
  };

  // Cargar catálogo de requisitos en vivo desde el Backend
  const cargarRequisitosDesdeAPI = async () => {
    setCargandoRequisitos(true);
    try {
      const res = await fetch('http://localhost:8000/api/requisitos/publico');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSeccionesRequisitos(data);
        }
      }
    } catch (err) {
      console.warn('Usando catálogo local de requisitos para nueva solicitud:', err);
    } finally {
      setCargandoRequisitos(false);
    }
  };

  // 1. Cargar sesión de usuario, establecimientos, trámites y requisitos
  useEffect(() => {
    const sessionUser = localStorage.getItem('usuario');
    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        setUsuario(parsed);
        fetchMisEstablecimientos(parsed.id);
        fetchTramitesUsuario(parsed.id);
        fetchNotificaciones(parsed.id);
      } catch (e) {
        console.error('Error al leer sesión:', e);
        fetchMisEstablecimientos(null);
      }
    } else {
      fetchMisEstablecimientos(null);
    }
    cargarRequisitosDesdeAPI();
  }, [seccionActiva]);

  // Polling silencioso en segundo plano y al recuperar foco de ventana
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && usuario?.id) {
        fetchMisEstablecimientos(usuario.id, true);
        fetchTramitesUsuario(usuario.id, true);
        fetchNotificaciones(usuario.id);
      }
    }, 20000);

    const onFocus = () => {
      if (usuario?.id) {
        fetchMisEstablecimientos(usuario.id, true);
        fetchTramitesUsuario(usuario.id, true);
        fetchNotificaciones(usuario.id);
      }
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [usuario?.id]);

  // 2. Cargar establecimientos del propietario desde el Backend (con soporte para refresco silencioso)
  const fetchMisEstablecimientos = async (propietarioId, silencioso = false) => {
    if (!silencioso) setIsLoadingLabs(true);
    try {
      if (propietarioId) {
        const res = await fetch(`http://localhost:8000/api/establecimientos/propietario/${propietarioId}`);
        if (res.ok) {
          const data = await res.json();
          setMisEstablecimientos(Array.isArray(data) ? data : []);
          if (!silencioso) setIsLoadingLabs(false);
          return;
        }
      }
      setMisEstablecimientos([]);
    } catch (err) {
      console.error('Error cargando establecimientos del propietario:', err);
      setMisEstablecimientos([]);
    } finally {
      if (!silencioso) setIsLoadingLabs(false);
    }
  };

  // 3. Cargar trámites y estado documental del propietario (con soporte para refresco silencioso)
  const fetchTramitesUsuario = async (propietarioId, silencioso = false) => {
    if (!propietarioId) return;
    if (!silencioso) setCargandoTramites(true);
    try {
      const res = await fetch(`http://localhost:8000/api/tramites/propietario/${propietarioId}`);
      if (res.ok) {
        const data = await res.json();
        setTramitesUsuario(data || []);
        if (data && data.length > 0) {
          setTramiteSeleccionadoId(prev => {
            if (prev && data.some(t => t.tramite_id === prev)) return prev;
            return data[0].tramite_id;
          });
        }
      }
    } catch (err) {
      console.error('Error cargando trámites del propietario:', err);
    } finally {
      if (!silencioso) setCargandoTramites(false);
    }
  };

  // 4. Manejo de Selección y Envío de Documentos para Subsanación (con confirmación previa)
  const handleSeleccionarArchivoSubsanacion = (docKey, file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setModalFeedback({
        tipo: 'error',
        titulo: 'Formato no permitido',
        mensaje: 'Solo se admiten documentos en formato PDF (.pdf).'
      });
      return;
    }
    setArchivosSubsanacion(prev => ({
      ...prev,
      [docKey]: file
    }));
  };

  const handleRemoverArchivoSubsanacion = (docKey) => {
    setArchivosSubsanacion(prev => {
      const nuevo = { ...prev };
      delete nuevo[docKey];
      return nuevo;
    });
  };

  const handleEnviarSubsanacionIndividual = async (tramiteId, doc) => {
    const docKey = doc.documento_id || String(doc.requisito_id);
    const file = archivosSubsanacion[docKey];
    if (!file) {
      setModalFeedback({
        tipo: 'error',
        titulo: 'Archivo no seleccionado',
        mensaje: 'Por favor seleccione un archivo PDF antes de presionar el botón de Enviar.'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setSubsanandoDocId(docKey);
    try {
      let res;
      if (doc.documento_id) {
        res = await fetch(`http://localhost:8000/api/tramites/${tramiteId}/documentos/${doc.documento_id}/subsanar`, {
          method: 'POST',
          body: formData
        });
      } else {
        formData.append('requisito_id', String(doc.requisito_id));
        res = await fetch(`http://localhost:8000/api/tramites/${tramiteId}/documentos`, {
          method: 'POST',
          body: formData
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al subsanar documento.');
      }

      handleRemoverArchivoSubsanacion(docKey);

      setModalFeedback({
        tipo: 'success',
        titulo: '¡Documento Subsanado con Éxito!',
        mensaje: `El documento "${doc.requisito_nombre}" ha sido cargado y enviado a revisión técnica.`
      });

      if (usuario?.id) {
        await fetchTramitesUsuario(usuario.id);
      }
    } catch (err) {
      setModalFeedback({
        tipo: 'error',
        titulo: 'Error en la operación',
        mensaje: err.message || 'Error al conectar con el servidor.'
      });
    } finally {
      setSubsanandoDocId(null);
    }
  };

  const handleEnviarTodasLasSubsanaciones = async (tramiteId, docsRechazados) => {
    const docsConArchivo = docsRechazados.filter(d => {
      const k = d.documento_id || String(d.requisito_id);
      return Boolean(archivosSubsanacion[k]);
    });

    if (docsConArchivo.length === 0) {
      setModalFeedback({
        tipo: 'error',
        titulo: 'Ningún archivo seleccionado',
        mensaje: 'Seleccione al menos un archivo PDF corregido antes de enviar.'
      });
      return;
    }

    setSubsanandoDocId('ALL');
    let exitos = 0;
    try {
      for (const doc of docsConArchivo) {
        const docKey = doc.documento_id || String(doc.requisito_id);
        const file = archivosSubsanacion[docKey];
        const formData = new FormData();
        formData.append('file', file);
        
        let res;
        if (doc.documento_id) {
          res = await fetch(`http://localhost:8000/api/tramites/${tramiteId}/documentos/${doc.documento_id}/subsanar`, {
            method: 'POST',
            body: formData
          });
        } else {
          formData.append('requisito_id', String(doc.requisito_id));
          res = await fetch(`http://localhost:8000/api/tramites/${tramiteId}/documentos`, {
            method: 'POST',
            body: formData
          });
        }
        if (res.ok) {
          exitos++;
          handleRemoverArchivoSubsanacion(docKey);
        }
      }

      setModalFeedback({
        tipo: 'success',
        titulo: '¡Subsanaciones Enviadas con Éxito!',
        mensaje: `Se enviaron correctamente ${exitos} documento(s) corregido(s) al equipo técnico del SEDES.`
      });

      if (usuario?.id) {
        await fetchTramitesUsuario(usuario.id);
      }
    } catch (err) {
      setModalFeedback({
        tipo: 'error',
        titulo: 'Error en el envío',
        mensaje: err.message || 'Ocurrió un error al enviar los documentos.'
      });
    } finally {
      setSubsanandoDocId(null);
    }
  };

  // 5. Subir documento pendiente
  const handleSubirNuevoDocumentoTramite = async (tramiteId, requisitoId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setModalFeedback({
        tipo: 'error',
        titulo: 'Formato no permitido',
        mensaje: 'Solo se admiten documentos en formato PDF (.pdf).'
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('requisito_id', String(requisitoId));

    setSubiendoSubsanacion(true);
    try {
      const res = await fetch(`http://localhost:8000/api/tramites/${tramiteId}/documentos`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al subir documento.');
      }

      setModalFeedback({
        tipo: 'success',
        titulo: '¡Documento Cargado con Éxito!',
        mensaje: 'El archivo se ha registrado correctamente y pasa a estado "En Revisión" para validación técnica.'
      });

      if (usuario?.id) {
        await fetchTramitesUsuario(usuario.id);
      }
    } catch (err) {
      setModalFeedback({
        tipo: 'error',
        titulo: 'Error en la operación',
        mensaje: err.message || 'Error al conectar con el servidor.'
      });
    } finally {
      setSubiendoSubsanacion(false);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  // Abrir modal de edición para un establecimiento
  const handleAbrirEditar = (lab) => {
    setLabEditando(lab);

    // Normalizar servicios como lista seleccionada que coincida con las píldoras
    let servList = [];
    if (Array.isArray(lab.servicios)) {
      servList = lab.servicios.map(normalizarEspecialidad);
    } else if (typeof lab.servicios === 'string' && lab.servicios.trim()) {
      servList = lab.servicios.split(',').map(s => normalizarEspecialidad(s.trim()));
    }

    // Filtrar duplicados y verificar que pertenezcan al catálogo
    servList = [...new Set(servList)].filter(s => ESPECIALIDADES_OFICIALES.includes(s));

    if (servList.length === 0) {
      servList = ['Clínico General'];
    }

    setArchivoImagen(null);
    setPreviewImagen(lab.imagen_url || null);

    setFormEdit({
      horario: lab.horario || 'Lun-Vie 7:00 - 19:00, Sáb 8:00 - 13:00',
      telefono: lab.telefono || '+591 4 4251890',
      email_contacto: lab.email_contacto || 'contacto@laboratorio.bo',
      descripcion: lab.descripcion || 'Establecimiento de salud acreditado para la toma de muestras, diagnóstico clínico y análisis microbiológicos bajo normativa sanitaria vigente del Departamento de Cochabamba.',
      servicios: servList,
      direccion: lab.direccion || '',
      responsable_laboratorio: lab.responsable_laboratorio || '',
      ci_responsable: lab.ci_responsable || '',
      responsables_areas: lab.responsables_areas || '',
      latitud: lab.latitud || -17.38975,
      longitud: lab.longitud || -66.15951,
      imagen_url: lab.imagen_url || ''
    });
    setSaveSuccess('');
    setSaveError('');
    setModalEditarOpen(true);
  };

  // Manejar selección de nueva fotografía del laboratorio
  const handleSeleccionarImagen = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setSaveError('Por favor seleccione un archivo de imagen válido (JPG, PNG o WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError('La imagen seleccionada supera el límite máximo de 5 MB.');
      return;
    }

    setArchivoImagen(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewImagen(objectUrl);
    setSaveError('');
  };

  // Alternar selección de especialidades (botones tipo píldora)
  const toggleEspecialidad = (esp) => {
    setFormEdit((prev) => {
      const existe = prev.servicios.some(s => s.toLowerCase() === esp.toLowerCase());
      if (existe) {
        return {
          ...prev,
          servicios: prev.servicios.filter(s => s.toLowerCase() !== esp.toLowerCase())
        };
      } else {
        return {
          ...prev,
          servicios: [...prev.servicios, esp]
        };
      }
    });
  };

  // Usar GPS del navegador
  const handleObtenerUbicacionActual = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormEdit(prev => ({
            ...prev,
            latitud: pos.coords.latitude,
            longitud: pos.coords.longitude
          }));
        },
        (err) => {
          alert('No se pudo acceder al GPS del dispositivo. Por favor seleccione en el mapa.');
        }
      );
    }
  };

  // Selección de coordenadas haciendo clic en el mapa interactivo
  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width; // 0.0 a 1.0
    const clickY = (e.clientY - rect.top) / rect.height;  // 0.0 a 1.0

    // Mapeo proporcional para el área metropolitana de Cochabamba
    // Longitud: [-66.35 a -66.05] | Latitud: [-17.32 a -17.48]
    const minLng = -66.32;
    const maxLng = -66.08;
    const minLat = -17.46;
    const maxLat = -17.34;

    const nuevaLng = minLng + clickX * (maxLng - minLng);
    const nuevaLat = maxLat - clickY * (maxLat - minLat);

    setFormEdit(prev => ({
      ...prev,
      latitud: parseFloat(nuevaLat.toFixed(6)),
      longitud: parseFloat(nuevaLng.toFixed(6))
    }));
  };

  // Guardar cambios del establecimiento
  const handleGuardarCambios = async (e) => {
    e.preventDefault();
    if (!labEditando) return;

    if (formEdit.servicios.length === 0) {
      setSaveError('Debe seleccionar al menos una especialidad o servicio autorizado.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      let finalImageUrl = formEdit.imagen_url;

      // Si el propietario seleccionó un archivo de imagen, subirlo al backend
      if (archivoImagen) {
        const formData = new FormData();
        formData.append('file', archivoImagen);

        const uploadRes = await fetch(`http://localhost:8000/api/establecimientos/${labEditando.id}/imagen`, {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json();
          throw new Error(errData.detail || 'Error al subir la fotografía.');
        }

        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.imagen_url;
      }

      const payload = {
        horario: formEdit.horario,
        telefono: formEdit.telefono,
        email_contacto: formEdit.email_contacto,
        descripcion: formEdit.descripcion,
        servicios: formEdit.servicios.join(', '),
        direccion: formEdit.direccion,
        responsable_laboratorio: formEdit.responsable_laboratorio,
        ci_responsable: formEdit.ci_responsable,
        responsables_areas: formEdit.responsables_areas,
        latitud: formEdit.latitud,
        longitud: formEdit.longitud,
        imagen_url: finalImageUrl
      };

      const response = await fetch(`http://localhost:8000/api/establecimientos/${labEditando.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.detail || 'No se pudieron guardar los cambios.');
      }

      setSaveSuccess('¡Información pública y fotografía actualizadas exitosamente!');
      
      // Actualizar estado local
      setMisEstablecimientos(prev => prev.map(item => 
        item.id === labEditando.id 
          ? { ...item, ...payload, imagen_url: finalImageUrl, latitud: formEdit.latitud, longitud: formEdit.longitud }
          : item
      ));

      setTimeout(() => {
        setModalEditarOpen(false);
      }, 1500);

    } catch (err) {
      setSaveError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  // =========================================================================
  // Manejadores para la Vista: "Nueva Solicitud de Apertura"
  // =========================================================================
  const handleToggleEspecialidadNueva = (esp) => {
    const existe = formNueva.servicios.includes(esp);
    let nuevosServicios;
    
    if (existe) {
      nuevosServicios = formNueva.servicios.filter(s => s !== esp);
      // Evitar que quede con 0 especialidades
      if (nuevosServicios.length === 0) {
        nuevosServicios = [esp];
      }
    } else {
      nuevosServicios = [...formNueva.servicios, esp];
    }

    setFormNueva(prev => ({ ...prev, servicios: nuevosServicios }));

    setEncargadosAreas(prev => {
      if (existe) {
        if (formNueva.servicios.length > 1) {
          const copy = { ...prev };
          delete copy[esp];
          return copy;
        }
        return prev;
      } else {
        return {
          ...prev,
          [esp]: prev[esp] || { nombre: '', ci: '' }
        };
      }
    });
  };

  const handleEncargadoAreaChange = (esp, campo, valor) => {
    setEncargadosAreas(prev => ({
      ...prev,
      [esp]: {
        ...(prev[esp] || { nombre: '', ci: '' }),
        [campo]: valor
      }
    }));
  };

  const handleFotoNuevaChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      alert('Por favor seleccione una imagen válida (JPG, PNG o WEBP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5 MB.');
      return;
    }

    setNuevaFotoFile(file);
    setNuevaFotoPreview(URL.createObjectURL(file));
  };

  const handleAdjuntarPdf = (reqId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Solo se admiten documentos en formato PDF.');
      return;
    }

    setDocumentosAdjuntos(prev => ({
      ...prev,
      [reqId]: {
        nombre: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        file: file
      }
    }));
  };

  const handleQuitarPdf = (reqId) => {
    setDocumentosAdjuntos(prev => {
      const copy = { ...prev };
      delete copy[reqId];
      return copy;
    });
  };

  const handleGuardarBorrador = () => {
    alert('Borrador guardado localmente en su navegador.');
  };

  const handleEnviarNuevaSolicitud = async (e) => {
    e.preventDefault();
    if (!formNueva.nombre_comercial.trim()) {
      alert('Por favor ingrese el Nombre Comercial del establecimiento.');
      return;
    }
    if (!formNueva.direccion.trim()) {
      alert('Por favor ingrese la Dirección del establecimiento.');
      return;
    }
    if (!formNueva.responsable_laboratorio.trim()) {
      alert('Por favor ingrese el Responsable Técnico / Bioquímico Regente general del establecimiento.');
      return;
    }
    if (!formNueva.ci_responsable.trim()) {
      alert('Por favor ingrese el C.I. del Responsable Técnico / Bioquímico Regente.');
      return;
    }

    // 1. Validar que todas las especialidades seleccionadas cuenten con Nombre y CI de sus encargados
    if (formNueva.servicios.length === 0) {
      alert('Debe seleccionar al menos una especialidad autorizada para su establecimiento.');
      return;
    }

    const faltantesEncargados = [];
    for (const esp of formNueva.servicios) {
      const enc = encargadosAreas[esp] || {};
      const nom = (enc.nombre || '').trim();
      const ci = (enc.ci || '').trim();
      if (!nom || !ci) {
        const faltanCampos = [];
        if (!nom) faltanCampos.push('Nombre Completo');
        if (!ci) faltanCampos.push('C.I.');
        faltantesEncargados.push(`• Área ${esp}: Falta ${faltanCampos.join(' y ')}`);
      }
    }

    if (faltantesEncargados.length > 0) {
      alert(`⚠️ Datos obligatorios incompletos en Servicios y Especialidades:\n\nDebe ingresar obligatoriamente el Nombre y C.I. del encargado para cada especialidad seleccionada:\n\n${faltantesEncargados.join('\n')}`);
      return;
    }

    // 2. Validar que todos los documentos marcados como OBLIGATORIOS hayan sido adjuntados
    const faltantes = [];
    seccionesRequisitos.forEach((grupo) => {
      (grupo.requisitos || []).forEach((req, idx) => {
        if (req.esSubtitulo || req.es_subtitulo) return;
        const esObligatorio = req.es_obligatorio !== false;
        if (esObligatorio) {
          const reqKey = req.id || `req-${grupo.codigo}-${idx}`;
          if (!documentosAdjuntos[reqKey]) {
            faltantes.push({
              seccionCodigo: grupo.codigo || '',
              seccionTitulo: grupo.titulo || 'Sección de Requisitos',
              nombre: req.texto || req.nombre || req.nombre_documento || 'Documento requerido'
            });
          }
        }
      });
    });

    if (faltantes.length > 0) {
      setFaltantesModal(faltantes);
      return;
    }

    setIsSubmittingNueva(true);
    try {
      // 3. Construir la cadena estructurada de responsables de área
      const resAreasList = formNueva.servicios.map(esp => {
        const enc = encargadosAreas[esp] || {};
        const nom = (enc.nombre || '').trim();
        const ci = (enc.ci || '').trim();
        return `${esp}: ${nom} (CI: ${ci})`;
      });
      const responsablesAreasStr = resAreasList.join('; ');

      // 4. Crear el establecimiento en PostgreSQL
      const payload = {
        propietario_id: usuario?.id || '987556ee-60cb-4672-887e-d958564db7bd',
        nombre_comercial: formNueva.nombre_comercial.trim(),
        municipio: formNueva.municipio,
        tipo: formNueva.tipo,
        nivel: formNueva.nivel,
        direccion: formNueva.direccion.trim(),
        telefono: formNueva.telefono.trim(),
        email_contacto: formNueva.email_contacto.trim(),
        responsable_laboratorio: formNueva.responsable_laboratorio.trim(),
        ci_responsable: formNueva.ci_responsable.trim(),
        responsables_areas: responsablesAreasStr,
        horario: formNueva.horario.trim(),
        descripcion: formNueva.descripcion.trim(),
        servicios: formNueva.servicios.join(', '),
        latitud: formNueva.latitud,
        longitud: formNueva.longitud
      };

      const res = await fetch('http://localhost:8000/api/establecimientos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Error al registrar el establecimiento.');
      }

      const resData = await res.json();
      const nuevoId = resData.establecimiento?.id;
      const tramiteId = resData.tramite_id;

      // 3. Si subió fotografía, asociarla al nuevo laboratorio
      if (nuevaFotoFile && nuevoId) {
        const formData = new FormData();
        formData.append('file', nuevaFotoFile);
        await fetch(`http://localhost:8000/api/establecimientos/${nuevoId}/imagen`, {
          method: 'POST',
          body: formData
        });
      }

      // 4. Subir físicamente todos los documentos PDF adjuntos al trámite
      if (tramiteId && Object.keys(documentosAdjuntos).length > 0) {
        for (const [reqKey, docInfo] of Object.entries(documentosAdjuntos)) {
          if (docInfo?.file) {
            const docFormData = new FormData();
            docFormData.append('file', docInfo.file);
            docFormData.append('requisito_id', reqKey);
            try {
              await fetch(`http://localhost:8000/api/tramites/${tramiteId}/documentos`, {
                method: 'POST',
                body: docFormData
              });
            } catch (docErr) {
              console.warn(`Error al subir documento para requisito ${reqKey}:`, docErr);
            }
          }
        }
      }

      // 5. Confirmación de éxito
      setSolicitudEnviadaExito(true);

      // 6. Actualizar lista de establecimientos del usuario
      if (usuario?.id) {
        const labsRes = await fetch(`http://localhost:8000/api/establecimientos/propietario/${usuario.id}`);
        if (labsRes.ok) {
          const labsData = await labsRes.json();
          setMisEstablecimientos(labsData);
        }
      }
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
      alert(err.message || 'Ocurrió un error al registrar la solicitud. Verifique los datos e intente nuevamente.');
    } finally {
      setIsSubmittingNueva(false);
    }
  };

  // Menú lateral estructurado
  const menuItems = [
    {
      id: 'mis-establecimientos',
      label: 'Mis Establecimientos',
      icon: Building2,
      titulo: 'Mis Establecimientos',
      subtitulo: 'Gestione sus establecimientos registrados y consulte el estado de sus trámites sanitarios vigentes.'
    },
    {
      id: 'tramites',
      label: 'Trámites',
      icon: FileText,
      titulo: 'Trámites',
      subtitulo: 'Realice el seguimiento técnico y subsane las observaciones identificadas para la habilitación de su establecimiento.'
    },
    {
      id: 'nueva-solicitud',
      label: 'Nueva Solicitud',
      icon: PlusCircle,
      titulo: 'Nueva Solicitud de Apertura',
      subtitulo: 'Complete el formulario y adjunte los documentos requeridos en PDF.'
    },
    {
      id: 'tasas-arancelarias',
      label: 'Tasas Arancelarias',
      icon: CreditCard,
      titulo: 'ARANCELES PARA HABILITACIÓN Y FUNCIONAMIENTO DE LABORATORIOS',
      subtitulo: 'Información de tasas vigentes para trámites de laboratorios'
    }
  ];

  const itemActivo = menuItems.find(item => item.id === seccionActiva) || menuItems[0];

  const nombreCompleto = usuario 
    ? `${usuario.nombres} ${usuario.apellidos}` 
    : 'Carlos Mendoza';

  // Coordenadas relativas del marcador dentro del mapa interactivo
  const pinRelX = Math.min(Math.max(((formEdit.longitud - (-66.32)) / (-66.08 - (-66.32))) * 100, 5), 95);
  const pinRelY = Math.min(Math.max((((-17.34) - formEdit.latitud) / ((-17.34) - (-17.46))) * 100, 5), 95);

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-800 antialiased overflow-x-hidden">
      
      {/* ===================================================================== */}
      {/* 1. MENÚ LATERAL (SIDEBAR)                                             */}
      {/* ===================================================================== */}
      
      {/* Overlay para móviles */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-[#0060a8] text-white flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out
        shadow-xl lg:shadow-none shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 space-y-8">
          
          {/* Logo SI_Lab (Sin enlace para evitar redirección involuntaria al portal público) */}
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

          {/* Opciones de Navegación Lateral */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const estaSeleccionado = seccionActiva === item.id;

              return (
                <Link
                  key={item.id}
                  to={`/propietario/${item.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all text-left cursor-pointer
                    ${estaSeleccionado 
                      ? 'bg-[#004b85] text-white shadow-inner font-extrabold border-l-4 border-white' 
                      : 'text-blue-100/90 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${estaSeleccionado ? 'text-white' : 'text-blue-200'}`} />
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
      {/* 2. ÁREA PRINCIPAL Y MENÚ SUPERIOR                                     */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Barra Superior (Top Header) */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
          <div className="w-full px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
            
            {/* Breadcrumb / Ruta Actual */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 shrink-0"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="text-xs sm:text-sm font-medium text-slate-500 truncate flex items-center space-x-1.5">
                <span className="hidden sm:inline">Portal de Trámites SEDES</span>
                <span className="text-slate-300 hidden sm:inline">/</span>
                <span className="font-bold text-slate-800 truncate">{itemActivo.label}</span>
              </div>
            </div>

            {/* Perfil del Usuario & Notificaciones */}
            <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
              
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
                    <div className="absolute right-[-40px] sm:right-0 mt-2 w-[calc(100vw-32px)] sm:w-[460px] md:w-[500px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-slate-200/90 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 ring-1 ring-black/5">
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
                            <p className="text-[11px] text-slate-400 font-normal">Avisos y estados de sus trámites sanitarios</p>
                          </div>
                        </div>
                        {notificaciones.length > 0 && (
                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={handleMarcarTodasNotifsLeidas}
                              className="text-[11px] text-sky-300 hover:text-white hover:bg-white/10 px-2 py-1 rounded-lg transition font-semibold flex items-center space-x-1 cursor-pointer"
                              title="Marcar todas como leídas"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Marcar leídas</span>
                            </button>

                            <button
                              onClick={handleLimpiarTodasNotificaciones}
                              className="text-[11px] text-rose-300 hover:text-white hover:bg-rose-600/30 px-2 py-1 rounded-lg transition font-semibold flex items-center space-x-1 cursor-pointer border border-rose-500/30"
                              title="Limpiar todas las notificaciones"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Limpiar</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Lista de Notificaciones */}
                      <div className="max-h-[390px] sm:max-h-[440px] overflow-y-auto divide-y divide-slate-100">
                        {notificaciones.length === 0 ? (
                          <div className="p-8 text-center text-slate-400">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                              <CheckCircle2 className="w-6 h-6 text-slate-400" />
                            </div>
                            <p className="font-bold text-sm text-slate-700">Sin notificaciones pendientes</p>
                            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">No tiene avisos nuevos por el momento.</p>
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
                                onClick={() => {
                                  handleMarcarNotifLeida(notif.id);
                                  setNotifDropdownOpen(false);
                                  if (seccionActiva !== 'tramites') {
                                    navigate('/propietario/tramites');
                                  }
                                }}
                                className={`group p-4 transition cursor-pointer flex items-start gap-3.5 relative ${
                                  notif.leido 
                                    ? 'bg-white hover:bg-slate-50 opacity-80 hover:opacity-100' 
                                    : esObs
                                      ? 'bg-rose-50/50 hover:bg-rose-50/80 border-l-4 border-l-rose-500'
                                      : 'bg-sky-50/60 hover:bg-sky-50/80 border-l-4 border-l-[#0077c8]'
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
                                    <div className="flex items-center space-x-1 shrink-0">
                                      {!notif.leido && (
                                        <span className={`w-2 h-2 rounded-full mt-1 ${esObs ? 'bg-rose-500 ring-2 ring-rose-200' : 'bg-[#0077c8] ring-2 ring-sky-200'}`} />
                                      )}
                                      <button
                                        onClick={(e) => handleEliminarNotificacion(notif.id, e)}
                                        className="opacity-0 group-hover:opacity-100 hover:text-rose-600 hover:bg-rose-50 p-1 rounded-md transition text-slate-400 cursor-pointer"
                                        title="Eliminar esta notificación"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>

                                  <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words font-normal">
                                    {notif.mensaje}
                                  </p>

                                  <div className="flex items-center justify-between mt-2.5 pt-1 border-t border-slate-100/80 gap-2">
                                    <div className="flex items-center space-x-1.5 text-[11px] font-medium text-slate-400" title={fechaTooltip}>
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      <span>{fechaMostrar}</span>
                                    </div>

                                    {esObs && (
                                      <span className="text-[11px] font-bold text-rose-700 bg-rose-100/90 hover:bg-rose-200 px-2.5 py-1 rounded-lg transition shadow-2xs">
                                        Ir a Subsanar →
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
                        <div className="flex items-center space-x-3">
                          {notificaciones.length > 0 && (
                            <button
                              onClick={handleLimpiarTodasNotificaciones}
                              className="text-rose-600 hover:text-rose-800 hover:underline font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                              title="Eliminar todas las notificaciones"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Limpiar todo</span>
                            </button>
                          )}
                          <button
                            onClick={() => usuario?.id && fetchNotificaciones(usuario.id)}
                            className="text-[#0077c8] hover:underline font-bold text-[11px] flex items-center space-x-1 cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Actualizar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Perfil del Usuario */}
              <div className="flex items-center space-x-3 pl-2 sm:pl-4 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    {nombreCompleto}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Propietario / Solicitante
                  </p>
                </div>

                {/* Avatar de Iniciales */}
                <div className={`w-9 h-9 rounded-full ${getAvatarColor(nombreCompleto)} text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-slate-100 select-none tracking-tight`}>
                  <span>{getInitials(usuario || { nombreCompleto })}</span>
                </div>

                {/* Botón Salir */}
                <button
                  onClick={handleCerrarSesion}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-1 cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

            </div>

          </div>
        </header>

        {/* =================================================================== */}
        {/* 3. CONTENIDO PRINCIPAL                                              */}
        {/* =================================================================== */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
          
          {/* Encabezado Dinámico */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {itemActivo.titulo}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
              {itemActivo.subtitulo}
            </p>
          </div>

          {/* VISTA 1: MIS ESTABLECIMIENTOS */}
          {seccionActiva === 'mis-establecimientos' && (
            <div className="space-y-6 sm:space-y-8">
              
              {/* Tarjetas de Métricas Superiores (Figma) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5">
                
                {/* Métrica 1: Establecimientos Activos */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3.5 sm:space-x-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                    <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      {misEstablecimientos.filter(lab => lab.estado_operativo === 'Habilitado').length}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Establecimientos Activos
                    </p>
                  </div>
                </div>

                {/* Métrica 2: Trámites en Proceso */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3.5 sm:space-x-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-blue-50 text-[#0073c6] flex items-center justify-center font-bold shrink-0">
                    <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      {misEstablecimientos.filter(lab => lab.estado_operativo !== 'Habilitado').length}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Trámites en Proceso
                    </p>
                  </div>
                </div>

                {/* Métrica 3: Inspecciones Programadas */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-3.5 sm:space-x-4 col-span-1 sm:col-span-2 md:col-span-1">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
                    <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                      0
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Inspecciones Programadas
                    </p>
                  </div>
                </div>

              </div>

              {/* Sección: Establecimientos Registrados */}
              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Establecimientos Registrados
                </h2>

                {isLoadingLabs ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
                    Cargando sus establecimientos...
                  </div>
                ) : misEstablecimientos.length === 0 ? (
                  <div className="bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-4 shadow-2xs">
                    <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 text-sm sm:text-base">No tiene establecimientos registrados a su nombre</p>
                      <p className="text-xs text-slate-500 max-w-md mx-auto">
                        Inicie una nueva solicitud de apertura para registrar su laboratorio clínico ante el SEDES Cochabamba.
                      </p>
                    </div>
                    <div>
                      <Link
                        to="/propietario/nueva-solicitud"
                        className="inline-flex items-center space-x-2 bg-[#005596] hover:bg-[#003e6d] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-sm"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Nueva Solicitud de Apertura</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {misEstablecimientos.map((lab) => (
                      <div 
                        key={lab.id}
                        className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6"
                      >
                        
                        {/* Info Izquierda */}
                        <div className="flex items-start space-x-3.5 sm:space-x-4 min-w-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 text-[#005596] flex items-center justify-center shrink-0 mt-0.5">
                            <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight truncate">
                                {lab.nombre_comercial}
                              </h3>

                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0 ${
                                lab.estado_operativo === 'Habilitado'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {lab.estado_operativo === 'Habilitado' ? 'Activo • Habilitado' : 'En Trámite'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="truncate">{lab.direccion}, {lab.municipio}</span>
                            </p>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400 font-medium pt-0.5">
                              <span>🕒 Última inspección: <strong className="text-slate-700">{lab.fecha_ultima_inspeccion || '15/07/2026'}</strong></span>
                              <span>• Vencimiento Acta: <strong className={lab.proximo_a_vencer || lab.vencido ? 'text-rose-600 font-black' : 'text-slate-700'}>{lab.fecha_vencimiento_acta || '15/07/2027'}</strong></span>
                              <span>• CUE: <strong className="text-slate-700">{lab.codigo_cue}</strong></span>
                            </div>

                            {/* Alerta de vencimiento y botón de rehabilitación */}
                            <div className="pt-2 flex flex-wrap items-center gap-2">
                              {lab.tiene_rehabilitacion_pendiente ? (
                                <span className="inline-flex items-center space-x-1.5 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold px-3 py-1.5 rounded-xl">
                                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Trámite de Rehabilitación en Revisión</span>
                                </span>
                              ) : lab.proximo_a_vencer || lab.vencido || (lab.dias_para_vencer !== undefined && lab.dias_para_vencer <= 15) ? (
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border ${
                                    lab.vencido
                                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                                      : 'bg-amber-50 text-amber-800 border-amber-200'
                                  }`}>
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    <span>{lab.vencido ? 'Acta Vencida' : `Acta por vencer (${lab.dias_para_vencer} días)`}</span>
                                  </span>

                                  <button
                                    type="button"
                                    onClick={() => handleAbrirRehabilitacion(lab)}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer active:scale-95 animate-pulse"
                                  >
                                    <UploadCloud className="w-4 h-4" />
                                    <span>Subir papeles para rehabilitación</span>
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleAbrirRehabilitacion(lab)}
                                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer"
                                  title="Iniciar renovación o rehabilitación de requisitos"
                                >
                                  <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Rehabilitación / Renovación</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Botones de Acción (Figma + Editar Página) */}
                        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end sm:justify-start pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          
                          {/* Botón 1: Documentos */}
                          <button
                            type="button"
                            onClick={() => {
                              const tr = tramitesUsuario.find(t => t.establecimiento_id === lab.id);
                              if (tr) {
                                setTramiteSeleccionadoId(tr.tramite_id);
                              }
                              navigate('/propietario/tramites');
                            }}
                            className="flex-1 sm:flex-none bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                            title="Ver seguimiento de trámites y documentación"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>Documentos</span>
                          </button>

                          {/* Botón 2: Ver Detalle */}
                          <Link
                            to={`/laboratorio/${encodeURIComponent(lab.codigo_cue !== 'Nuevo' ? lab.codigo_cue : lab.id)}`}
                            className="flex-1 sm:flex-none bg-[#19324d] hover:bg-[#122438] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-white" />
                            <span>Ver Detalle</span>
                          </Link>

                          {/* Botón 3: Editar Página (Nuevo) */}
                          <button
                            type="button"
                            onClick={() => handleAbrirEditar(lab)}
                            className="w-full sm:w-auto bg-[#0073c6] hover:bg-[#005da3] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-sm cursor-pointer"
                            title="Editar la información pública mostrada en su página"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-white" />
                            <span>Editar Página</span>
                          </button>

                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA: SEGUIMIENTO DE TRÁMITES Y SUBSANACIÓN DE DOCUMENTOS        */}
          {/* ================================================================= */}
          {seccionActiva === 'tramites' && (
            <div className="space-y-6 animate-fadeIn">
              
              {cargandoTramites ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-500 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#005596]" />
                  <p className="text-sm font-semibold">Cargando trámites y estado de documentación...</p>
                </div>
              ) : tramitesUsuario.length === 0 ? (
                <div className="bg-white p-10 sm:p-14 rounded-3xl border border-slate-200 text-center text-slate-500 space-y-4 shadow-2xs">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-800">No tiene trámites en curso</h3>
                    <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                      Cuando envíe una solicitud de apertura de laboratorio, podrá realizar el seguimiento técnico de sus documentos y subsanar observaciones aquí.
                    </p>
                  </div>
                  <div className="pt-2">
                    <Link
                      to="/propietario/nueva-solicitud"
                      className="inline-flex items-center space-x-2 bg-[#005596] hover:bg-[#003e6d] text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-md"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Iniciar Nueva Solicitud de Apertura</span>
                    </Link>
                  </div>
                </div>
              ) : (
                (() => {
                  const tramiteActual = tramitesUsuario.find(t => t.tramite_id === tramiteSeleccionadoId) || tramitesUsuario[0];

                  return (
                    <div className="space-y-6">
                      
                      {/* Selector de Trámites (si tiene más de 1 establecimiento en trámite) */}
                      {tramitesUsuario.length > 1 && (
                        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
                          <span className="text-xs font-bold text-slate-400 shrink-0 uppercase tracking-wider">
                            Establecimientos en Trámite:
                          </span>
                          {tramitesUsuario.map((tr) => (
                            <button
                              key={tr.tramite_id}
                              type="button"
                              onClick={() => setTramiteSeleccionadoId(tr.tramite_id)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 shrink-0 cursor-pointer ${
                                tr.tramite_id === tramiteActual.tramite_id
                                  ? 'bg-[#005596] text-white shadow-sm'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              <Building2 className="w-3.5 h-3.5" />
                              <span>{tr.establecimiento_nombre}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Encabezado del Trámite (Estilo Figma) */}
                      {/* Encabezado del Trámite (Estilo Figma) */}
                      <div className="space-y-2">
                        <span className="inline-block bg-[#19324d] text-white text-[11px] font-black px-3.5 py-1 rounded-md tracking-wider shadow-xs uppercase">
                          {tramiteActual.codigo_tramite}
                        </span>
                        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                          Solicitud de {tramiteActual.tipo_tramite} - Laboratorio {tramiteActual.establecimiento_nombre}
                        </h2>
                        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
                          Realice el seguimiento técnico y subsane las observaciones identificadas para la habilitación de su establecimiento.
                        </p>
                      </div>

                      {/* ===================================================================== */}
                      {/* PANEL SUPERIOR: DOCUMENTOS OBSERVADOS / RECHAZADOS (SUBSANACIÓN)      */}
                      {/* ===================================================================== */}
                      {(() => {
                        const docsRechazados = (tramiteActual?.documentos || []).filter(
                          d => d.estado_validacion === 'Rechazado' || d.estado_validacion === 'Observado'
                        );

                        if (docsRechazados.length === 0) return null;

                        const cantConArchivo = docsRechazados.filter(
                          d => Boolean(archivosSubsanacion[d.documento_id || String(d.requisito_id)])
                        ).length;

                        return (
                          <div className="bg-rose-50/80 border-2 border-rose-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5 animate-fadeIn">
                            {/* Cabecera del Panel */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-200/60 pb-4">
                              <div className="flex items-start space-x-3.5">
                                <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-inner">
                                  <AlertCircle className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2.5 flex-wrap">
                                    <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                      Documentos Observados que Requieren Subsanación
                                    </h3>
                                    <span className="text-xs font-black bg-rose-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                                      {docsRechazados.length} {docsRechazados.length === 1 ? 'observado' : 'observados'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-rose-950/80 mt-1">
                                    El SEDES ha emitido observaciones sobre los siguientes documentos. Seleccione los nuevos archivos PDF corregidos y presione <strong>"Enviar"</strong> para someterlos a revisión.
                                  </p>
                                </div>
                              </div>

                              {/* Botón Global para enviar todo junto */}
                              {docsRechazados.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleEnviarTodasLasSubsanaciones(tramiteActual.tramite_id, docsRechazados)}
                                  disabled={subsanandoDocId !== null || cantConArchivo === 0}
                                  className="self-start sm:self-auto bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                                >
                                  {subsanandoDocId === 'ALL' ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>Enviando correcciones...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-4 h-4" />
                                      <span>Enviar Todo ({cantConArchivo}/{docsRechazados.length})</span>
                                    </>
                                  )}
                                </button>
                              )}
                            </div>

                            {/* Lista de Items Observados */}
                            <div className="space-y-3">
                              {docsRechazados.map((doc) => {
                                const docKey = doc.documento_id || String(doc.requisito_id);
                                const archivoSeleccionado = archivosSubsanacion[docKey];
                                const isSubmittingThis = subsanandoDocId === docKey || subsanandoDocId === 'ALL';

                                return (
                                  <div 
                                    key={docKey}
                                    className="bg-white rounded-2xl p-4 sm:p-5 border border-rose-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-rose-300"
                                  >
                                    {/* Info del Requisito y Observación */}
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                      <div className="flex items-center space-x-2 flex-wrap">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                                          Secc. {doc.seccion_codigo}
                                        </span>
                                        <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                          {doc.requisito_nombre}
                                        </p>
                                      </div>

                                      {doc.observaciones_supervisor && (
                                        <div className="bg-rose-50 border-l-4 border-rose-500 px-3 py-1.5 rounded-r-lg">
                                          <p className="text-xs font-semibold text-rose-700">
                                            <span className="font-bold">Observación del SEDES:</span> {doc.observaciones_supervisor}
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Selector de Archivo + Botón Enviar */}
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
                                      {/* Archivo Seleccionado con Preview */}
                                      {archivoSeleccionado ? (
                                        <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl text-xs text-blue-900 max-w-xs">
                                          <FileText className="w-4 h-4 text-[#005596] shrink-0" />
                                          <span className="truncate font-semibold text-xs max-w-[130px] sm:max-w-[160px]" title={archivoSeleccionado.name}>
                                            {archivoSeleccionado.name}
                                          </span>
                                          <span className="text-[10px] text-blue-600 shrink-0 font-medium">
                                            ({(archivoSeleccionado.size / 1024).toFixed(0)} KB)
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => handleRemoverArchivoSubsanacion(docKey)}
                                            className="text-rose-500 hover:text-rose-700 p-0.5 rounded transition shrink-0 cursor-pointer"
                                            title="Quitar este archivo"
                                          >
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <label className="inline-flex items-center justify-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-2xs">
                                          <UploadCloud className="w-4 h-4 text-[#2563eb]" />
                                          <span>Seleccionar PDF</span>
                                          <input
                                            type="file"
                                            accept=".pdf"
                                            disabled={isSubmittingThis}
                                            onChange={(e) => {
                                              const f = e.target.files?.[0];
                                              if (f) handleSeleccionarArchivoSubsanacion(docKey, f);
                                              e.target.value = '';
                                            }}
                                            className="hidden"
                                          />
                                        </label>
                                      )}

                                      {/* Botón explícito de Enviar */}
                                      <button
                                        type="button"
                                        onClick={() => handleEnviarSubsanacionIndividual(tramiteActual.tramite_id, doc)}
                                        disabled={!archivoSeleccionado || isSubmittingThis}
                                        className={`inline-flex items-center justify-center space-x-2 text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm cursor-pointer ${
                                          archivoSeleccionado
                                            ? 'bg-[#005596] hover:bg-[#003e6d] text-white'
                                            : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                                        }`}
                                        title={archivoSeleccionado ? "Enviar documento corregido a revisión" : "Seleccione primero un archivo PDF"}
                                      >
                                        {isSubmittingThis ? (
                                          <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            <span>Enviando...</span>
                                          </>
                                        ) : (
                                          <>
                                            <Send className="w-3.5 h-3.5" />
                                            <span>Enviar</span>
                                          </>
                                        )}
                                      </button>
                                    </div>

                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Tarjeta de Documentación Requerida (Figma) */}
                      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
                        
                        {/* Cabecera de la Tarjeta */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                          <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tight">
                              Documentación Requerida
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Cargue y verifique la vigencia de los requisitos sanitarios y legales correspondientes.
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>Plazo de subsanación: <strong className="text-slate-800">5 días hábiles</strong></span>
                          </div>
                        </div>

                        {/* Tabla de Documentos Requeridos */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                                <th scope="col" className="py-3 px-4">DOCUMENTO REQUERIDO</th>
                                <th scope="col" className="py-3 px-4 text-center">ESTADO DE VALIDACIÓN</th>
                                <th scope="col" className="py-3 px-4 text-right">ACCIÓN</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {tramiteActual.documentos.map((doc, idx) => {
                                const docKey = doc.documento_id || String(doc.requisito_id);
                                const estado = doc.estado_validacion || (doc.tiene_archivo ? 'En Revisión' : 'Pendiente');
                                const esRechazado = estado === 'Rechazado' || estado === 'Observado';
                                const esAprobado = estado === 'Aprobado';
                                const esEnRevision = estado === 'En Revisión';
                                const archivoSeleccionado = archivosSubsanacion[docKey];
                                const isSubmittingThis = subsanandoDocId === docKey || subsanandoDocId === 'ALL';

                                return (
                                  <tr key={doc.documento_id || doc.requisito_id || idx} className="hover:bg-slate-50/70 transition-colors">
                                    
                                    {/* Columna 1: Documento Requerido */}
                                    <td className="py-4 px-4 align-top">
                                      <div className="flex items-start space-x-3">
                                        <FileText className={`w-4 h-4 shrink-0 mt-0.5 ${
                                          esAprobado 
                                            ? 'text-emerald-600' 
                                            : esRechazado 
                                              ? 'text-rose-600' 
                                              : esEnRevision 
                                                ? 'text-amber-500' 
                                                : 'text-slate-400'
                                        }`} />
                                        <div className="space-y-1">
                                          <div className="flex items-center space-x-2 flex-wrap">
                                            <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                                              {doc.requisito_nombre}
                                            </p>
                                            {doc.es_obligatorio === false && (
                                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                                Opcional
                                              </span>
                                            )}
                                          </div>
                                          
                                          {/* Observación del Supervisor en Rojo (si fue Rechazado u Observado) */}
                                          {doc.observaciones_supervisor && esRechazado && (
                                            <p className="text-xs font-semibold text-rose-600 pt-0.5">
                                              * {doc.observaciones_supervisor}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </td>

                                    {/* Columna 2: Estado de Validación */}
                                    <td className="py-4 px-4 text-center align-middle whitespace-nowrap">
                                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold select-none ${
                                        esAprobado
                                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                          : esRechazado
                                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                            : esEnRevision
                                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                                      }`}>
                                        {estado}
                                      </span>
                                    </td>

                                    {/* Columna 3: Acción */}
                                    <td className="py-4 px-4 text-right align-middle whitespace-nowrap">
                                      {esAprobado || esEnRevision ? (
                                        doc.archivo_url ? (
                                          <button
                                            type="button"
                                            onClick={() => window.open(`http://localhost:8000${doc.archivo_url}`, '_blank')}
                                            className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-[#19324d] border border-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition shadow-2xs cursor-pointer"
                                            title="Visualizar documento PDF presentado"
                                          >
                                            <Eye className="w-3.5 h-3.5 text-[#19324d]" />
                                            <span>Ver PDF</span>
                                          </button>
                                        ) : (
                                          <span className="text-xs text-slate-400 italic">Sin archivo</span>
                                        )
                                      ) : esRechazado ? (
                                        <div className="inline-flex items-center space-x-2">
                                          {doc.archivo_url && (
                                            <button
                                              type="button"
                                              onClick={() => window.open(`http://localhost:8000${doc.archivo_url}`, '_blank')}
                                              className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-[#19324d] border border-slate-200 text-xs font-bold px-3.5 py-1.5 rounded-xl transition shadow-2xs cursor-pointer"
                                              title="Visualizar documento observado"
                                            >
                                              <Eye className="w-3.5 h-3.5 text-[#19324d]" />
                                              <span>Ver PDF</span>
                                            </button>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                            className="inline-flex items-center space-x-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer shadow-2xs"
                                            title="Subsanar este documento en el panel superior"
                                          >
                                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                                            <span>Subsanar arriba ↑</span>
                                          </button>
                                        </div>
                                      ) : (
                                        /* Pendiente */
                                        <label className="inline-flex items-center space-x-1.5 bg-white hover:bg-blue-50 text-[#005596] border border-slate-200 hover:border-[#005596]/40 text-xs font-bold px-4 py-2 rounded-xl transition shadow-2xs cursor-pointer">
                                          <Upload className="w-3.5 h-3.5 text-[#005596]" />
                                          <span>Subir</span>
                                          <input
                                            type="file"
                                            accept=".pdf"
                                            disabled={subiendoSubsanacion}
                                            onChange={(e) => {
                                              handleSubirNuevoDocumentoTramite(tramiteActual.tramite_id, doc.requisito_id, e);
                                            }}
                                            className="hidden"
                                          />
                                        </label>
                                      )}
                                    </td>

                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                      </div>

                    </div>
                  );
                })()
              )}

            </div>
          )}

          {/* VISTA 2: TASAS ARANCELARIAS */}
          {seccionActiva === 'tasas-arancelarias' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Tarjeta con Tabla de Tasas Arancelarias */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-[#f8fafc] border-b border-slate-200/80">
                        <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                          DESCRIPCIÓN DEL TRÁMITE
                        </th>
                        <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                          MONTO
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {TASAS_ARANCELARIAS.map((tasa, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-6 py-4 text-xs sm:text-sm font-semibold text-slate-700">
                            {tasa.descripcion}
                          </td>
                          <td className="px-6 py-4 text-xs sm:text-sm font-bold text-slate-900 text-right whitespace-nowrap">
                            {tasa.monto}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Banner Informativo Inferior */}
              <div className="bg-[#fffbeb] border border-[#fef08a] rounded-2xl p-4 sm:px-6 flex items-center space-x-3.5 shadow-2xs">
                <div className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] shrink-0" />
                <p className="text-xs sm:text-sm font-medium text-amber-900">
                  Esta información es solo de carácter informativo. Los montos pueden estar sujetos a actualización según normativa vigente.
                </p>
              </div>
            </div>
          )}

          {/* VISTA 3: NUEVA SOLICITUD DE APERTURA */}
          {seccionActiva === 'nueva-solicitud' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Modal / Banner de Éxito al Enviar Solicitud */}
              {solicitudEnviadaExito ? (
                <div className="bg-white rounded-3xl p-8 sm:p-12 border border-emerald-200 shadow-xl text-center space-y-5 max-w-2xl mx-auto animate-fadeIn">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-9 h-9" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      ¡Solicitud de Apertura Enviada Exitosamente!
                    </h3>
                    <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                      Su trámite de apertura para <strong className="text-slate-900">{formNueva.nombre_comercial}</strong> ha sido registrado en el sistema del SEDES Cochabamba en estado <span className="text-amber-700 bg-amber-50 font-bold px-2 py-0.5 rounded-md border border-amber-200">En Trámite</span>.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-left text-xs space-y-2 text-slate-600">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-400">Establecimiento:</span>
                      <span className="font-bold text-slate-800">{formNueva.nombre_comercial}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-400">Municipio:</span>
                      <span className="font-bold text-slate-800">{formNueva.municipio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-400">Documentos Adjuntos:</span>
                      <span className="font-bold text-emerald-700">{Object.keys(documentosAdjuntos).length} archivos PDF</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Link
                      to="/propietario/mis-establecimientos"
                      onClick={() => setSolicitudEnviadaExito(false)}
                      className="w-full sm:w-auto bg-[#005596] hover:bg-[#003e6d] text-white text-xs font-bold px-6 py-3 rounded-xl transition shadow-md cursor-pointer"
                    >
                      Ir a Mis Establecimientos
                    </Link>
                    <Link
                      to="/"
                      className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-6 py-3 rounded-xl transition cursor-pointer"
                    >
                      Ver en Landing Page (Mapa)
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEnviarNuevaSolicitud} className="space-y-6">
                  
                  {/* ================================================================= */}
                  {/* CARD 1: DATOS DEL ESTABLECIMIENTO                                 */}
                  {/* ================================================================= */}
                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Datos del Establecimiento
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Información institucional y comercial que se registrará ante el SEDES.
                      </p>
                    </div>

                    {/* Grid de Campos Principales */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                      
                      {/* Municipio */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          MUNICIPIO <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formNueva.municipio}
                          onChange={(e) => setFormNueva({ ...formNueva, municipio: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-base sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium cursor-pointer"
                        >
                          <option value="CERCADO">Cochabamba (Cercado)</option>
                          <option value="QUILLACOLLO">Quillacollo</option>
                          <option value="SACABA">Sacaba</option>
                          <option value="PUNATA">Punata</option>
                          <option value="SHINAHOTA">Shinahota</option>
                          <option value="VILLA TUNARI">Villa Tunari</option>
                          <option value="COLCAPIRHUA">Colcapirhua</option>
                          <option value="TIQUIPAYA">Tiquipaya</option>
                          <option value="ARANI">Arani</option>
                          <option value="TARATA">Tarata</option>
                          <option value="CLIZA">Cliza</option>
                          <option value="SIPE SIPE">Sipe Sipe</option>
                        </select>
                      </div>

                      {/* Tipo de Laboratorio */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          TIPO DE LABORATORIO <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formNueva.tipo}
                          onChange={(e) => setFormNueva({ ...formNueva, tipo: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-base sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium cursor-pointer"
                        >
                          <option value="Iglesia">Iglesia</option>
                          <option value="ONG">ONG</option>
                          <option value="Privado">Privado</option>
                          <option value="Público">Público</option>
                          <option value="De Seguro Social">De Seguro Social</option>
                        </select>
                      </div>

                      {/* Nombre Comercial */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          NOMBRE COMERCIAL <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formNueva.nombre_comercial}
                          onChange={(e) => setFormNueva({ ...formNueva, nombre_comercial: e.target.value })}
                          placeholder="Ej: LABORATORIO CLÍNICO BIOMEDICAL"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-base sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium"
                        />
                      </div>

                      {/* Nivel */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          NIVEL DE COMPLEJIDAD <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formNueva.nivel}
                          onChange={(e) => setFormNueva({ ...formNueva, nivel: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-base sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium cursor-pointer"
                        >
                          <option value="Nivel 1">Nivel 1 (Baja Complejidad)</option>
                          <option value="Nivel 2">Nivel 2 (Mediana Complejidad)</option>
                          <option value="Nivel 3">Nivel 3 (Alta Complejidad)</option>
                        </select>
                      </div>

                      {/* Dirección del Establecimiento */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          DIRECCIÓN DEL ESTABLECIMIENTO <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formNueva.direccion}
                          onChange={(e) => setFormNueva({ ...formNueva, direccion: e.target.value })}
                          placeholder="Ej: Av. Heroínas #456, entre San Martín y 25 de Mayo"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-base sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium"
                        />
                      </div>

                      {/* Teléfono de Contacto */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          TELÉFONO / CELULAR DE CONTACTO <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formNueva.telefono}
                          onChange={(e) => setFormNueva({ ...formNueva, telefono: e.target.value })}
                          placeholder="Ej: +591 4 4258900 / 71458920"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-base sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium"
                        />
                      </div>

                      {/* Responsable Técnico */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          RESPONSABLE TÉCNICO / BIOQUÍMICO REGENTE <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formNueva.responsable_laboratorio}
                          onChange={(e) => setFormNueva({ ...formNueva, responsable_laboratorio: e.target.value })}
                          placeholder="Ej: DRA. MARIA ELENA VARGAS ROJAS"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-base sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium"
                        />
                      </div>

                      {/* C.I. del Responsable Técnico */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          C.I. DEL RESPONSABLE TÉCNICO / REGENTE <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={formNueva.ci_responsable}
                          onChange={(e) => setFormNueva({ ...formNueva, ci_responsable: e.target.value })}
                          placeholder="Ej: 5489632 CBBA"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-base sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium"
                        />
                      </div>

                      {/* Horario de Atención Asistido */}
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700 uppercase">
                          HORARIO DE ATENCIÓN AL PÚBLICO
                        </label>
                        <HorarioPicker
                          value={formNueva.horario}
                          onChange={(nuevoHorario) => setFormNueva({ ...formNueva, horario: nuevoHorario })}
                        />
                      </div>

                      {/* Correo Electrónico */}
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-slate-700">
                          CORREO ELECTRÓNICO INSTITUCIONAL
                        </label>
                        <input
                          type="email"
                          value={formNueva.email_contacto}
                          onChange={(e) => setFormNueva({ ...formNueva, email_contacto: e.target.value })}
                          placeholder="Ej: contacto@laboratoriobiomedical.com"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-base sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium"
                        />
                      </div>
                    </div>

                    {/* Descripción / Presentación */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">
                        DESCRIPCIÓN / PRESENTACIÓN DEL LABORATORIO (FICHA PÚBLICA)
                      </label>
                      <textarea
                        rows="3"
                        value={formNueva.descripcion}
                        onChange={(e) => setFormNueva({ ...formNueva, descripcion: e.target.value })}
                        placeholder="Describa la infraestructura, áreas especializadas y servicios que ofrece su laboratorio para los pacientes..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-base sm:text-sm rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium resize-y"
                      />
                    </div>

                    {/* Fotografía de Portada */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>FOTOGRAFÍA DEL ESTABLECIMIENTO (IMAGEN DE LA FICHA PÚBLICA)</span>
                        <span className="text-[11px] font-normal text-slate-400">JPG, PNG o WEBP (Máx. 5 MB)</span>
                      </label>
                      
                      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="w-24 h-20 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative">
                          <img
                            src={nuevaFotoPreview || heroBg}
                            alt="Previsualización"
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 space-y-1 text-center sm:text-left">
                          <p className="text-xs text-slate-600 font-medium">
                            Esta imagen se mostrará en la cabecera de la página de su laboratorio para los pacientes y el SEDES.
                          </p>
                          <label className="inline-flex items-center space-x-2 bg-[#005596] hover:bg-[#003e6d] text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer shadow-xs">
                            <UploadCloud className="w-3.5 h-3.5" />
                            <span>{nuevaFotoFile ? 'Cambiar Fotografía' : 'Subir Fotografía'}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={handleFotoNuevaChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Servicios y Especialidades Autorizados (Píldoras y Encargados) */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <label className="text-xs font-bold text-slate-700 uppercase flex items-center space-x-1.5">
                            <span>SERVICIOS Y ESPECIALIDADES AUTORIZADOS</span>
                            <span className="text-rose-500">*</span>
                          </label>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Active las especialidades de su establecimiento. Por cada especialidad elegida se solicitarán los datos del profesional a cargo.
                          </p>
                        </div>
                        <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#005596] bg-blue-50 px-3 py-1 rounded-full border border-blue-200/80 shrink-0 self-start sm:self-auto">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#005596]" />
                          <span>{formNueva.servicios.length} seleccionada(s)</span>
                        </span>
                      </div>

                      {/* Selector de Píldoras */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {ESPECIALIDADES_OFICIALES.map((esp) => {
                          const isSelected = formNueva.servicios.includes(esp);
                          return (
                            <button
                              key={esp}
                              type="button"
                              onClick={() => handleToggleEspecialidadNueva(esp)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#005596] text-white shadow-sm ring-2 ring-[#005596]/30'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-slate-300'}`} />
                              <span>{esp}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Bloque Dinámico: Encargados de Área (Nombre y CI) */}
                      <div className="space-y-3 pt-3">
                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                          <div className="flex items-center space-x-2">
                            <UserCheck className="w-4 h-4 text-[#005596]" />
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                              Encargados Técnicos por Área Seleccionada (Obligatorio)
                            </h4>
                          </div>
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md hidden sm:inline-block">
                            * Campos obligatorios para habilitación
                          </span>
                        </div>

                        <div className="space-y-3">
                          {formNueva.servicios.map((esp) => {
                            const estilo = ESPECIALIDAD_INFO[esp] || {
                              badge: 'bg-blue-50 text-blue-700 border-blue-200',
                              dot: 'bg-blue-500',
                              iconColor: 'text-blue-600',
                              descripcion: 'Área autorizada del establecimiento'
                            };
                            const enc = encargadosAreas[esp] || { nombre: '', ci: '' };

                            return (
                              <div
                                key={esp}
                                className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200 space-y-3 transition hover:border-slate-300"
                              >
                                {/* Cabecera de la especialidad */}
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

                                {/* Inputs en grid responsivo (Nombre y CI) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                  
                                  {/* Nombre Completo del Encargado */}
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                      <span>NOMBRE COMPLETO DEL RESPONSABLE <span className="text-rose-500">*</span></span>
                                    </label>
                                    <div className="relative flex items-center">
                                      <User className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                                      <input
                                        type="text"
                                        required
                                        value={enc.nombre || ''}
                                        onChange={(e) => handleEncargadoAreaChange(esp, 'nombre', e.target.value)}
                                        placeholder="Ej: Dra. María Elena Vargas Rojas"
                                        className="w-full bg-white border border-slate-200 text-slate-800 text-base sm:text-sm rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium placeholder:text-slate-400"
                                      />
                                    </div>
                                  </div>

                                  {/* C.I. del Encargado */}
                                  <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                      <span>CÉDULA DE IDENTIDAD (C.I.) <span className="text-rose-500">*</span></span>
                                    </label>
                                    <div className="relative flex items-center">
                                      <CreditCard className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                                      <input
                                        type="text"
                                        required
                                        value={enc.ci || ''}
                                        onChange={(e) => handleEncargadoAreaChange(esp, 'ci', e.target.value)}
                                        placeholder="Ej: 5489632 CBBA"
                                        className="w-full bg-white border border-slate-200 text-slate-800 text-base sm:text-sm rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium placeholder:text-slate-400"
                                      />
                                    </div>
                                  </div>

                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ================================================================= */}
                  {/* CARD 2: UBICACIÓN DEL ESTABLECIMIENTO (MAPA GPS)                 */}
                  {/* ================================================================= */}
                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-5">
                    <div className="border-b border-slate-100 pb-4">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                        Ubicación del Establecimiento
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Haga clic en el mapa o arrastre el pin para capturar las coordenadas exactas de su laboratorio.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <RealMapPicker
                        latitud={formNueva.latitud}
                        longitud={formNueva.longitud}
                        onChange={({ lat, lng }) => {
                          setFormNueva(prev => ({
                            ...prev,
                            latitud: lat,
                            longitud: lng
                          }));
                        }}
                        height="360px"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <span className="font-bold text-slate-500">Latitud: </span>
                          <span className="font-mono font-bold text-slate-800">
                            {typeof formNueva.latitud === 'number' ? formNueva.latitud.toFixed(6) : formNueva.latitud}
                          </span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-500">Longitud: </span>
                          <span className="font-mono font-bold text-slate-800">
                            {typeof formNueva.longitud === 'number' ? formNueva.longitud.toFixed(6) : formNueva.longitud}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ================================================================= */}
                  {/* CARD 3: REQUISITOS DOCUMENTALES EN PDF                            */}
                  {/* ================================================================= */}
                  <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
                    <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                          Requisitos para Habilitación, Apertura y Funcionamiento de Laboratorios
                        </h3>
                        <p className="text-xs font-bold text-[#005596] uppercase tracking-wider mt-0.5">
                          ADJUNTE CADA DOCUMENTO EN FORMATO PDF (MÁXIMO 10MB POR ARCHIVO)
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                          {Object.keys(documentosAdjuntos).length} adjuntados
                        </span>
                      </div>
                    </div>

                    {/* Grupos de Requisitos Dinámicos */}
                    <div className="space-y-6">
                      {seccionesRequisitos.map((grupo) => (
                        <div key={grupo.id || grupo.codigo} className="space-y-3">
                          
                          {/* Encabezado del Grupo */}
                          <div className="flex items-center space-x-2.5 pb-1 border-b border-slate-100">
                            <span className="bg-[#005596] text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                              {grupo.codigo}
                            </span>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight uppercase">
                                {grupo.titulo}
                              </h4>
                              {grupo.subtitulo && (
                                <p className="text-[11px] text-slate-400 font-medium">
                                  {grupo.subtitulo}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Lista de Requisitos del Grupo */}
                          <div className="divide-y divide-slate-100 bg-slate-50/50 rounded-xl border border-slate-200/80 overflow-hidden">
                            {grupo.requisitos.map((req, idx) => {
                              if (req.esSubtitulo || req.es_subtitulo) {
                                return (
                                  <div key={req.id || idx} className="p-3 bg-slate-100/70 border-y border-slate-200/60">
                                    <h5 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                                      <FileCheck2 className="w-3.5 h-3.5 text-[#005596]" />
                                      <span>{req.texto || req.nombre || req.nombre_documento}</span>
                                    </h5>
                                  </div>
                                );
                              }

                              const reqKey = req.id || `req-${grupo.codigo}-${idx}`;
                              const docAdjunto = documentosAdjuntos[reqKey];
                              const esObligatorio = req.es_obligatorio !== false;

                              return (
                                <div 
                                  key={reqKey} 
                                  className={`p-3 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-white transition ${
                                    !docAdjunto && esObligatorio ? 'bg-white' : ''
                                  }`}
                                >
                                  <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                      docAdjunto 
                                        ? 'bg-emerald-500 ring-2 ring-emerald-200' 
                                        : esObligatorio 
                                          ? 'bg-blue-600 ring-2 ring-blue-100' 
                                          : 'bg-amber-400 ring-2 ring-amber-100'
                                    }`}></span>
                                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                      <p className="text-xs font-medium text-slate-700 leading-snug">
                                        {req.texto || req.nombre || req.nombre_documento}
                                      </p>
                                      {esObligatorio ? (
                                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-[#005596] border border-blue-200/80 select-none">
                                          <span>Obligatorio</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 select-none">
                                          <span>Opcional</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                                    {docAdjunto ? (
                                      <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg text-xs font-bold shadow-2xs">
                                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                                        <span className="max-w-[140px] truncate">{docAdjunto.nombre}</span>
                                        <span className="text-[10px] text-emerald-600 font-normal">({docAdjunto.size})</span>
                                        <button
                                          type="button"
                                          onClick={() => handleQuitarPdf(reqKey)}
                                          className="p-0.5 text-emerald-700 hover:text-rose-600 rounded transition cursor-pointer"
                                          title="Eliminar archivo adjunto"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    ) : (
                                      <label className="inline-flex items-center space-x-1.5 bg-white hover:bg-blue-50 text-[#005596] border border-slate-200 hover:border-[#005596]/40 text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-2xs cursor-pointer">
                                        <Upload className="w-3 h-3 text-[#005596]" />
                                        <span>Subir Archivo</span>
                                        <input
                                          type="file"
                                          accept=".pdf"
                                          onChange={(e) => handleAdjuntarPdf(reqKey, e)}
                                          className="hidden"
                                        />
                                      </label>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ================================================================= */}
                  {/* BARRA DE ACCIONES INFERIOR                                        */}
                  {/* ================================================================= */}
                  <div className="bg-[#fffbeb] border border-[#fef08a] rounded-2xl p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                    <div className="flex items-center space-x-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-[#f59e0b] shrink-0" />
                      <p className="text-xs sm:text-sm font-medium text-amber-900">
                        Recuerde completar todos los campos requeridos antes de enviar la solicitud.
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={handleGuardarBorrador}
                        className="flex-1 sm:flex-none bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-2xs"
                      >
                        Guardar Borrador
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmittingNueva}
                        className="flex-1 sm:flex-none bg-[#005596] hover:bg-[#003e6d] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmittingNueva ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-white" />
                            <span>Enviar Solicitud</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </form>
              )}

            </div>
          )}



        </main>

      </div>

      {/* ===================================================================== */}
      {/* 4. MODAL INTERACTIVO: EDITAR PÁGINA DEL LABORATORIO                   */}
      {/* ===================================================================== */}
      {modalEditarOpen && labEditando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
            
            {/* Header del Modal */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#0073c6] flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900">Editar Información Pública</h2>
                  <p className="text-xs text-slate-500">
                    Establecimiento: <strong>{labEditando.nombre_comercial}</strong> (CUE: {labEditando.codigo_cue})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalEditarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensajes de feedback */}
            {saveSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccess}</span>
              </div>
            )}

            {saveError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            {/* Formulario de Edición */}
            <form onSubmit={handleGuardarCambios} className="space-y-6">
              
              {/* Horario de Atención Asistido */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Horario de Atención al Público
                </label>
                <HorarioPicker
                  value={formEdit.horario}
                  onChange={(nuevoHorario) => setFormEdit({ ...formEdit, horario: nuevoHorario })}
                />
              </div>

              {/* Teléfono y Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono / Celular de Contacto
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formEdit.telefono}
                      onChange={(e) => setFormEdit({ ...formEdit, telefono: e.target.value })}
                      placeholder="Ej. +591 4 4251890 / 71723456"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico de Contacto
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={formEdit.email_contacto}
                      onChange={(e) => setFormEdit({ ...formEdit, email_contacto: e.target.value })}
                      placeholder="contacto@laboratorio.bo"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6]"
                    />
                  </div>
                </div>
              </div>

              {/* Campo: Descripción / Presentación del Establecimiento */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción / Presentación del Laboratorio (Ficha Pública)
                </label>
                <textarea
                  rows="3"
                  value={formEdit.descripcion}
                  onChange={(e) => setFormEdit({ ...formEdit, descripcion: e.target.value })}
                  placeholder="Establecimiento de salud acreditado para la toma de muestras, diagnóstico clínico y análisis microbiológicos bajo normativa sanitaria vigente del Departamento de Cochabamba."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6]"
                />
              </div>

              {/* Campo: Fotografía / Imagen de Portada del Laboratorio */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">
                    Fotografía del Establecimiento (Imagen de la Ficha Pública)
                  </label>
                  <span className="text-[11px] text-slate-400 font-medium">
                    JPG, PNG o WEBP (Máx. 5 MB)
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  {/* Vista previa de la fotografía */}
                  <div className="relative w-full sm:w-44 h-28 rounded-xl overflow-hidden shadow-xs border border-slate-200 bg-slate-200 shrink-0">
                    <img
                      src={previewImagen || heroBg}
                      alt="Vista previa de portada"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = heroBg; }}
                    />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-black/70 text-white backdrop-blur-xs">
                      {archivoImagen ? 'Nueva seleccionada' : (previewImagen ? 'Foto actual' : 'Predeterminada')}
                    </span>
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-2 w-full text-center sm:text-left">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      Esta imagen se mostrará en la cabecera de la página de su laboratorio para los pacientes y el SEDES.
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5">
                      <label className="inline-flex items-center space-x-1.5 bg-[#0073c6] hover:bg-[#005da3] text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer shadow-xs transition">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{previewImagen ? 'Cambiar Fotografía' : 'Subir Fotografía'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleSeleccionarImagen}
                          className="hidden"
                        />
                      </label>

                      {previewImagen && (
                        <button
                          type="button"
                          onClick={() => {
                            setArchivoImagen(null);
                            setPreviewImagen(null);
                            setFormEdit(prev => ({ ...prev, imagen_url: '' }));
                          }}
                          className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-2 rounded-xl border border-rose-200 transition cursor-pointer"
                          title="Restablecer a la imagen oficial por defecto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Restablecer predeterminada</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de Acción del Modal */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalEditarOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#0073c6] hover:bg-[#005da3] text-white text-xs sm:text-sm font-bold shadow-md flex items-center space-x-2 cursor-pointer disabled:opacity-75"
                >
                  {isSaving ? (
                    <span>Guardando cambios...</span>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Información</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: DOCUMENTOS OBLIGATORIOS FALTANTES                              */}
      {/* ===================================================================== */}
      {faltantesModal.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Cabecera del Modal */}
            <div className="bg-amber-50/80 border-b border-amber-100 p-6 flex items-start space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Documentación Obligatoria Pendiente
                  </h3>
                  <button
                    type="button"
                    onClick={() => setFaltantesModal([])}
                    className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  Para registrar su solicitud ante el SEDES Cochabamba, debe adjuntar todos los documentos normativos marcados como obligatorios.
                </p>
              </div>
            </div>

            {/* Lista de Documentos Faltantes con Scroll */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Requisitos pendientes por subir:
                </span>
                <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  {faltantesModal.length} faltante{faltantesModal.length > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2">
                {faltantesModal.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start space-x-3 text-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5 ring-2 ring-amber-200"></span>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {item.seccionCodigo && (
                          <span className="font-bold text-[#005596] bg-blue-50 px-1.5 py-0.5 rounded text-[10px]">
                            Secc. {item.seccionCodigo}
                          </span>
                        )}
                        <span className="font-bold text-slate-800">{item.seccionTitulo}</span>
                      </div>
                      <p className="text-slate-600 mt-0.5 text-xs font-medium">
                        {item.nombre}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie del Modal */}
            <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setFaltantesModal([])}
                className="w-full sm:w-auto bg-[#005596] hover:bg-[#003e6d] text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-md cursor-pointer"
              >
                Entendido, voy a adjuntarlos
              </button>
            </div>

          </div>
        </div>
      )}
      {/* ===================================================================== */}
      {/* MODAL MODERNO: FEEDBACK Y NOTIFICACIONES DE ACCIONES                 */}
      {/* ===================================================================== */}
      {modalFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col transform transition-all scale-100">
            
            <div className="p-6 text-center">
              {/* Icono del Modal */}
              <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner ${
                modalFeedback.tipo === 'success'
                  ? 'bg-emerald-100 text-emerald-600'
                  : modalFeedback.tipo === 'error'
                    ? 'bg-rose-100 text-rose-600'
                    : 'bg-blue-100 text-[#005596]'
              }`}>
                {modalFeedback.tipo === 'success' ? (
                  <CheckCircle2 className="w-8 h-8" />
                ) : (
                  <AlertCircle className="w-8 h-8" />
                )}
              </div>

              {/* Título */}
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">
                {modalFeedback.titulo}
              </h3>

              {/* Mensaje */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {modalFeedback.mensaje}
              </p>
            </div>

            {/* Botón de Acción */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-center">
              <button
                type="button"
                onClick={() => setModalFeedback(null)}
                className={`w-full text-white text-xs sm:text-sm font-bold px-6 py-2.5 rounded-xl transition shadow-md cursor-pointer ${
                  modalFeedback.tipo === 'success'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : modalFeedback.tipo === 'error'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-[#005596] hover:bg-[#003e6d]'
                }`}
              >
                Aceptar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL: SUBIR PAPELES PARA REHABILITACIÓN DE LABORATORIO               */}
      {/* ===================================================================== */}
      {modalRehabilitacionOpen && labRehabilitando && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8">
            
            {/* Cabecera del Modal */}
            <div className="p-6 bg-gradient-to-r from-[#005596] to-[#0077c8] text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-white/15 backdrop-blur-md">
                  <UploadCloud className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-cyan-100 px-2 py-0.5 rounded-full">
                    Proceso de Rehabilitación Normativa
                  </span>
                  <h3 className="text-lg font-black tracking-tight mt-0.5">
                    Subir Papeles para Rehabilitación
                  </h3>
                  <p className="text-xs text-cyan-100 font-medium truncate max-w-md">
                    Establecimiento: {labRehabilitando.nombre_comercial} ({labRehabilitando.municipio})
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalRehabilitacionOpen(false)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuerpo del Formulario */}
            <form onSubmit={handleEnviarRehabilitacion} className="p-6 space-y-5 text-xs text-slate-700">
              
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-2xl text-blue-900 space-y-1">
                <p className="font-bold flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 text-[#0060a8] shrink-0" />
                  <span>Documentación oficial requerida por SEDES:</span>
                </p>
                <p className="text-[11px] leading-relaxed text-blue-800">
                  Para renovar y rehabilitar el acta de su laboratorio, debe adjuntar los siguientes 3 documentos reglamentarios en formato PDF. Al enviarlos, el Coordinador los revisará y programará la nueva inspección de campo.
                </p>
              </div>

              {/* Documento 1: Contrato EMSA */}
              <div className="space-y-1.5 p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 text-xs flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-[#0060a8]" />
                    <span>1. Contrato de recojo de residuos infecciosos (EMSA) *</span>
                  </label>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Obligatorio (PDF)
                  </span>
                </div>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  required
                  onChange={(e) => setFileEmsa(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#005596] file:text-white hover:file:bg-[#003e6d] file:cursor-pointer cursor-pointer bg-white p-2 border border-slate-200 rounded-xl"
                />
                {fileEmsa && (
                  <p className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Archivo seleccionado: {fileEmsa.name}</span>
                  </p>
                )}
              </div>

              {/* Documento 2: Certificado COZBES */}
              <div className="space-y-1.5 p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 text-xs flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#0060a8]" />
                    <span>2. Certificado de bioseguridad (COZBES) *</span>
                  </label>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Obligatorio (PDF)
                  </span>
                </div>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  required
                  onChange={(e) => setFileCozbes(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#005596] file:text-white hover:file:bg-[#003e6d] file:cursor-pointer cursor-pointer bg-white p-2 border border-slate-200 rounded-xl"
                />
                {fileCozbes && (
                  <p className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Archivo seleccionado: {fileCozbes.name}</span>
                  </p>
                )}
              </div>

              {/* Documento 3: Memorial correspondiente */}
              <div className="space-y-1.5 p-4 rounded-2xl border border-slate-200 bg-slate-50/60">
                <div className="flex items-center justify-between">
                  <label className="font-black text-slate-800 text-xs flex items-center space-x-1.5">
                    <FileCheck2 className="w-4 h-4 text-[#0060a8]" />
                    <span>3. Memorial correspondiente *</span>
                  </label>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Obligatorio (PDF)
                  </span>
                </div>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  required
                  onChange={(e) => setFileMemorial(e.target.files?.[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#005596] file:text-white hover:file:bg-[#003e6d] file:cursor-pointer cursor-pointer bg-white p-2 border border-slate-200 rounded-xl"
                />
                {fileMemorial && (
                  <p className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Archivo seleccionado: {fileMemorial.name}</span>
                  </p>
                )}
              </div>

              {/* Pie con Botones */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalRehabilitacionOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviandoRehabilitacion || !fileEmsa || !fileCozbes || !fileMemorial}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition flex items-center space-x-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  {enviandoRehabilitacion ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando Solicitud...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Solicitud de Rehabilitación</span>
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
