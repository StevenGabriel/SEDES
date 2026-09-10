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
  FolderOpen
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
    tipo: 'Laboratorio Clínico Privado',
    nombre_comercial: '',
    nivel: 'Nivel 1',
    direccion: '',
    telefono: '',
    responsable_laboratorio: '',
    horario: 'Lun-Vie 7:00 - 19:00, Sáb 8:00 - 13:00',
    email_contacto: '',
    descripcion: '',
    servicios: ['Clínico General'],
    latitud: -17.3895,
    longitud: -66.1568
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

  // Catálogo dinámico de requisitos gestionado por el Administrador
  const [seccionesRequisitos, setSeccionesRequisitos] = useState(DEFAULT_SECCIONES_REQUISITOS);
  const [cargandoRequisitos, setCargandoRequisitos] = useState(false);

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
      } catch (e) {
        console.error('Error al leer sesión:', e);
        fetchMisEstablecimientos(null);
      }
    } else {
      fetchMisEstablecimientos(null);
    }
    cargarRequisitosDesdeAPI();
  }, [seccionActiva]);

  // 2. Cargar establecimientos del propietario desde el Backend
  const fetchMisEstablecimientos = async (propietarioId) => {
    setIsLoadingLabs(true);
    try {
      if (propietarioId) {
        const res = await fetch(`http://localhost:8000/api/establecimientos/propietario/${propietarioId}`);
        if (res.ok) {
          const data = await res.json();
          setMisEstablecimientos(Array.isArray(data) ? data : []);
          setIsLoadingLabs(false);
          return;
        }
      }
      setMisEstablecimientos([]);
    } catch (err) {
      console.error('Error cargando establecimientos del propietario:', err);
      setMisEstablecimientos([]);
    } finally {
      setIsLoadingLabs(false);
    }
  };

  // 3. Cargar trámites y estado documental del propietario
  const fetchTramitesUsuario = async (propietarioId) => {
    if (!propietarioId) return;
    setCargandoTramites(true);
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
      setCargandoTramites(false);
    }
  };

  // 4. Subsanar documento rechazado
  const handleSubsanarDocumento = async (tramiteId, docId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Solo se admiten documentos en formato PDF.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setSubiendoSubsanacion(true);
    try {
      const res = await fetch(`http://localhost:8000/api/tramites/${tramiteId}/documentos/${docId}/subsanar`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Error al subsanar documento.');
      }

      alert('¡Documento subsanado exitosamente! Ha pasado al estado "En Revisión".');
      if (usuario?.id) {
        await fetchTramitesUsuario(usuario.id);
      }
    } catch (err) {
      alert(err.message || 'Error al conectar con el servidor.');
    } finally {
      setSubiendoSubsanacion(false);
    }
  };

  // 5. Subir documento pendiente
  const handleSubirNuevoDocumentoTramite = async (tramiteId, requisitoId, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Solo se admiten documentos en formato PDF.');
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

      alert('¡Documento cargado exitosamente! Ha pasado al estado "En Revisión".');
      if (usuario?.id) {
        await fetchTramitesUsuario(usuario.id);
      }
    } catch (err) {
      alert(err.message || 'Error al conectar con el servidor.');
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
    setFormNueva((prev) => {
      const existe = prev.servicios.includes(esp);
      const nuevos = existe 
        ? prev.servicios.filter(s => s !== esp) 
        : [...prev.servicios, esp];
      return { ...prev, servicios: nuevos.length > 0 ? nuevos : [esp] };
    });
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

    // 1. Validar que todos los documentos marcados como OBLIGATORIOS hayan sido adjuntados
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
      // 2. Crear el establecimiento en PostgreSQL
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
        responsables_areas: formNueva.servicios.join(', '),
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
          <div className="w-full px-4 sm:px-8 h-16 flex items-center justify-between">
            
            {/* Breadcrumb / Ruta Actual */}
            <div className="flex items-center space-x-3 truncate">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 mr-1"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="text-xs sm:text-sm font-medium text-slate-500 truncate flex items-center space-x-1.5">
                <span>Portal de Trámites SEDES</span>
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
            <div className="space-y-8">
              
              {/* Tarjetas de Métricas Superiores (Figma) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Métrica 1: Establecimientos Activos */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">
                      {misEstablecimientos.filter(lab => lab.estado_operativo === 'Habilitado').length}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Establecimientos Activos
                    </p>
                  </div>
                </div>

                {/* Métrica 2: Trámites en Proceso */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0073c6] flex items-center justify-center font-bold">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">
                      {misEstablecimientos.filter(lab => lab.estado_operativo !== 'Habilitado').length}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Trámites en Proceso
                    </p>
                  </div>
                </div>

                {/* Métrica 3: Inspecciones Programadas */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">
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
                <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Establecimientos Registrados
                </h2>

                {isLoadingLabs ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400">
                    Cargando sus establecimientos...
                  </div>
                ) : misEstablecimientos.length === 0 ? (
                  <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-4 shadow-2xs">
                    <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 text-base">No tiene establecimientos registrados a su nombre</p>
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
                        className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                      >
                        
                        {/* Info Izquierda */}
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-[#005596] flex items-center justify-center shrink-0 mt-0.5">
                            <Building2 className="w-6 h-6" />
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                {lab.nombre_comercial}
                              </h3>

                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                                lab.estado_operativo === 'Habilitado'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {lab.estado_operativo === 'Habilitado' ? 'Activo • Habilitado' : 'En Trámite'}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{lab.direccion}, {lab.municipio}</span>
                            </p>

                            <p className="text-[11px] text-slate-400 font-medium pt-1">
                              🕒 Última inspección SEDES: 15/07/2026 • CUE: <strong className="text-slate-700">{lab.codigo_cue}</strong>
                            </p>
                          </div>
                        </div>

                        {/* Botones de Acción (Figma + Editar Página) */}
                        <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-center">
                          
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
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
                            title="Ver seguimiento de trámites y documentación"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-500" />
                            <span>Documentos</span>
                          </button>

                          {/* Botón 2: Ver Detalle */}
                          <Link
                            to={`/laboratorio/${encodeURIComponent(lab.codigo_cue !== 'Nuevo' ? lab.codigo_cue : lab.id)}`}
                            className="bg-[#19324d] hover:bg-[#122438] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                          >
                            <Eye className="w-3.5 h-3.5 text-white" />
                            <span>Ver Detalle</span>
                          </Link>

                          {/* Botón 3: Editar Página (Nuevo) */}
                          <button
                            type="button"
                            onClick={() => handleAbrirEditar(lab)}
                            className="bg-[#0073c6] hover:bg-[#005da3] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer"
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
                                const estado = doc.estado_validacion || (doc.tiene_archivo ? 'En Revisión' : 'Pendiente');
                                const esRechazado = estado === 'Rechazado' || estado === 'Observado';
                                const esAprobado = estado === 'Aprobado';
                                const esEnRevision = estado === 'En Revisión';

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
                                          
                                          {/* Observación del Supervisor en Rojo (si fue Rechazado) */}
                                          {doc.observaciones_supervisor && (
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
                                        <label className="inline-flex items-center space-x-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer">
                                          <RefreshCw className="w-3.5 h-3.5 text-white" />
                                          <span>Volver a Subir</span>
                                          <input
                                            type="file"
                                            accept=".pdf"
                                            disabled={subiendoSubsanacion}
                                            onChange={(e) => {
                                              if (doc.documento_id) {
                                                handleSubsanarDocumento(tramiteActual.tramite_id, doc.documento_id, e);
                                              } else {
                                                handleSubirNuevoDocumentoTramite(tramiteActual.tramite_id, doc.requisito_id, e);
                                              }
                                            }}
                                            className="hidden"
                                          />
                                        </label>
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
                                              if (doc.documento_id) {
                                                handleSubsanarDocumento(tramiteActual.tramite_id, doc.documento_id, e);
                                              } else {
                                                handleSubirNuevoDocumentoTramite(tramiteActual.tramite_id, doc.requisito_id, e);
                                              }
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      
                      {/* Municipio */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          MUNICIPIO <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formNueva.municipio}
                          onChange={(e) => setFormNueva({ ...formNueva, municipio: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium cursor-pointer"
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
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium cursor-pointer"
                        >
                          <option value="Laboratorio Clínico Privado">Laboratorio Clínico Privado</option>
                          <option value="Laboratorio Clínico Público">Laboratorio Clínico Público</option>
                          <option value="Laboratorio de Referencia">Laboratorio de Referencia</option>
                          <option value="Laboratorio de Seguridad Social a Corto Plazo">Laboratorio de Seguridad Social a Corto Plazo</option>
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
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium"
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
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium cursor-pointer"
                        >
                          <option value="Nivel 1">Nivel 1 (Baja Complejidad)</option>
                          <option value="Nivel 2">Nivel 2 (Mediana Complejidad)</option>
                          <option value="Nivel 3">Nivel 3 (Alta Complejidad)</option>
                          <option value="Nivel 4">Nivel 4 (Referencia e Investigación)</option>
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
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium"
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
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium"
                        />
                      </div>

                      {/* Responsable Técnico */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">
                          RESPONSABLE TÉCNICO / BIOQUÍMICO REGENTE <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formNueva.responsable_laboratorio}
                          onChange={(e) => setFormNueva({ ...formNueva, responsable_laboratorio: e.target.value })}
                          placeholder="Ej: DRA. MARIA ELENA VARGAS ROJAS - 5489632 CBBA"
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium"
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
                          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium"
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
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-[#0077be] font-medium resize-y"
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

                    {/* Servicios y Especialidades Autorizados (Píldoras) */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase">
                          SERVICIOS Y ESPECIALIDADES AUTORIZADOS
                        </label>
                        <span className="text-[11px] font-bold text-[#005596] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {formNueva.servicios.length} seleccionada(s)
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Haga clic para activar o desactivar las áreas autorizadas de su laboratorio:
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {ESPECIALIDADES_OFICIALES.map((esp) => {
                          const isSelected = formNueva.servicios.includes(esp);
                          return (
                            <button
                              key={esp}
                              type="button"
                              onClick={() => handleToggleEspecialidadNueva(esp)}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                                isSelected
                                  ? 'bg-[#0f172a] text-white shadow-xs'
                                  : 'bg-white text-slate-700 border border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                              <span>{esp}</span>
                            </button>
                          );
                        })}
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
              
              {/* ============================================================= */}
              {/* SECCIÓN A: SERVICIOS Y ESPECIALIDADES (BOTONES TIPO PÍLDORA)  */}
              {/* ============================================================= */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Servicios y Especialidades Autorizados
                  </label>
                  <span className="text-[11px] text-[#0073c6] font-semibold">
                    {formEdit.servicios.length} seleccionada(s)
                  </span>
                </div>

                <p className="text-xs text-slate-500">
                  Haga clic para activar o desactivar las áreas autorizadas de su laboratorio:
                </p>

                {/* Grid de Píldoras según diseño */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {ESPECIALIDADES_OFICIALES.map((esp) => {
                    const isSelected = formEdit.servicios.some(s => s.toLowerCase() === esp.toLowerCase());

                    return (
                      <button
                        type="button"
                        key={esp}
                        onClick={() => toggleEspecialidad(esp)}
                        className={`
                          px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center space-x-1.5 border
                          ${isSelected
                            ? 'bg-[#19324d] text-white border-[#19324d] shadow-sm ring-2 ring-[#19324d]/15'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }
                        `}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        <span>{esp}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ============================================================= */}
              {/* SECCIÓN B: HORARIO, CONTACTO Y RESPONSABLE                    */}
              {/* ============================================================= */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                
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

                {/* Responsable Técnico */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Responsable Técnico del Laboratorio
                  </label>
                  <input
                    type="text"
                    value={formEdit.responsable_laboratorio}
                    onChange={(e) => setFormEdit({ ...formEdit, responsable_laboratorio: e.target.value })}
                    placeholder="Nombre y Matrícula Profesional"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6]"
                  />
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

              </div>

              {/* ============================================================= */}
              {/* SECCIÓN C: DIRECCIÓN Y MAPA INTERACTIVO DE COORDENADAS GPS     */}
              {/* ============================================================= */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Ubicación y Coordenadas GPS (PostGIS)
                  </label>

                  <button
                    type="button"
                    onClick={handleObtenerUbicacionActual}
                    className="inline-flex items-center space-x-1.5 text-xs font-bold text-[#0073c6] hover:text-[#005da3] bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5" />
                    <span>Usar mi GPS</span>
                  </button>
                </div>

                {/* Campo Texto Dirección */}
                <div>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formEdit.direccion}
                      onChange={(e) => setFormEdit({ ...formEdit, direccion: e.target.value })}
                      placeholder="Av. Ayacucho Nº 345 entre Ecuador y Mayor Rocha"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6]"
                    />
                  </div>
                </div>

                {/* Mapa Real Interactivo (Leaflet + OpenStreetMap) */}
                <div className="space-y-2">
                  <p className="text-[11px] text-slate-500">
                    💡 <strong>Haga clic o arrastre el marcador</strong> en el mapa satelital/callejero real de Cochabamba para fijar la ubicación exacta de su laboratorio:
                  </p>

                  <RealMapPicker
                    latitud={formEdit.latitud}
                    longitud={formEdit.longitud}
                    onChange={({ lat, lng }) => {
                      setFormEdit(prev => ({
                        ...prev,
                        latitud: lat,
                        longitud: lng
                      }));
                    }}
                    height="260px"
                  />

                  {/* Insignia Inferior de Coordenadas PostGIS */}
                  <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                    <span className="font-semibold">
                      📍 Lat: <strong className="text-slate-900">{formEdit.latitud.toFixed(6)}</strong> • Lng: <strong className="text-slate-900">{formEdit.longitud.toFixed(6)}</strong>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      PostGIS SRID 4326
                    </span>
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

    </div>
  );
}
