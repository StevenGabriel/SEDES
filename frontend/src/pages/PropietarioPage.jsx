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
  Image as ImageIcon
} from 'lucide-react';

import logoL1 from '../assets/L1.png';
import logoL2 from '../assets/L2.png';
import heroBg from '../assets/hero_bg.jpg';
import RealMapPicker from '../components/common/RealMapPicker';

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

  // 1. Cargar sesión de usuario
  useEffect(() => {
    const sessionUser = localStorage.getItem('usuario');
    if (sessionUser) {
      try {
        const parsed = JSON.parse(sessionUser);
        setUsuario(parsed);
        fetchMisEstablecimientos(parsed.id);
      } catch (e) {
        console.error('Error al leer sesión:', e);
        fetchMisEstablecimientos(null);
      }
    } else {
      fetchMisEstablecimientos(null);
    }
  }, []);

  // 2. Cargar establecimientos del propietario desde el Backend
  const fetchMisEstablecimientos = async (propietarioId) => {
    setIsLoadingLabs(true);
    try {
      if (propietarioId) {
        const res = await fetch(`http://localhost:8000/api/establecimientos/propietario/${propietarioId}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            setMisEstablecimientos(data);
            setIsLoadingLabs(false);
            return;
          }
        }
      }

      // Si es un usuario de prueba o no tiene aún, cargamos los primeros de la BD como ejemplo
      const resAll = await fetch('http://localhost:8000/api/establecimientos');
      if (resAll.ok) {
        const allData = await resAll.json();
        setMisEstablecimientos(allData.slice(0, 2)); // Mostrar 1 o 2 laboratorios
      }
    } catch (err) {
      console.error('Error cargando establecimientos del propietario:', err);
    } finally {
      setIsLoadingLabs(false);
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
      titulo: 'Nueva Solicitud',
      subtitulo: 'Inicie una nueva solicitud de apertura, traslado o renovación para su establecimiento de salud.'
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
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-64 sm:w-72 bg-gradient-to-b from-[#0077c8] via-[#0080d0] to-[#0062a8] text-white
        flex flex-col justify-between p-6 shadow-2xl lg:shadow-none
        transition-transform duration-300 ease-in-out shrink-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Superior del Sidebar: Logo SI_Lab */}
        <div>
          <div className="flex items-center justify-between pb-8">
            <Link to="/" className="flex items-center space-x-3 group" title="Ir a la página principal">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/30 group-hover:bg-white/30 transition">
                <FlaskConical className="w-6 h-6 text-white" />
              </div>
              <span className="font-black text-2xl tracking-tight text-white flex items-center">
                SI<span className="text-cyan-200">_Lab</span>
              </span>
            </Link>

            <button 
              onClick={() => setSidebarOpen(false)} 
              className="lg:hidden p-1.5 rounded-lg bg-white/15 text-white hover:bg-white/25"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Opciones de Navegación Lateral */}
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const estaSeleccionado = seccionActiva === item.id;

              return (
                <Link
                  key={item.id}
                  to={`/propietario/${item.id}`}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide transition-all duration-200 cursor-pointer text-left
                    ${estaSeleccionado 
                      ? 'bg-black/20 text-white shadow-inner border-l-4 border-cyan-300 backdrop-blur-md font-extrabold' 
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${estaSeleccionado ? 'text-cyan-200' : 'text-white/70'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Inferior del Sidebar: Logos y Branding Institucional */}
        <div className="pt-8 border-t border-white/15 space-y-4">
          <div className="flex items-center space-x-3">
            <img 
              src={logoL1} 
              alt="Escudo de Bolivia" 
              className="h-10 w-auto object-contain drop-shadow-sm opacity-95" 
            />
            <img 
              src={logoL2} 
              alt="Escudo SEDES Cochabamba" 
              className="h-10 w-auto object-contain drop-shadow-sm opacity-95" 
            />
          </div>

          <div className="text-[10px] uppercase tracking-wider text-cyan-100 font-semibold leading-relaxed">
            <p className="font-extrabold text-white">ESTADO PLURINACIONAL</p>
            <p className="text-cyan-200/90 text-[9px] lowercase first-letter:uppercase">Ministerio de Salud y Deportes - Bolivia</p>
          </div>
        </div>

      </aside>

      {/* ===================================================================== */}
      {/* 2. ÁREA PRINCIPAL Y MENÚ SUPERIOR                                     */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Barra Superior (Top Header) */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
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

                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#005596] to-[#0080d0] text-white flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-slate-100">
                  {usuario ? usuario.nombres?.charAt(0).toUpperCase() : 'C'}
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
                      {misEstablecimientos.length || 1}
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
                      1
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
                      1
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
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-3">
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto" />
                    <p className="font-semibold text-sm">No tiene establecimientos registrados a su nombre.</p>
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
                            onClick={() => alert(`Módulo de Documentación para ${lab.nombre_comercial} en desarrollo.`)}
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
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

          {/* OTRAS VISTAS DEL MENÚ LATERAL (LIENZO LIMPIO) */}
          {seccionActiva !== 'mis-establecimientos' && seccionActiva !== 'tasas-arancelarias' && (
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,35,70,0.03)] min-h-[420px] flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0073c6] flex items-center justify-center">
                <itemActivo.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Sección: {itemActivo.label}
              </h3>
              <p className="text-xs text-slate-400 max-w-md">
                Estructura base configurada. Listo para implementar los componentes y tablas de esta vista.
              </p>
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
                
                {/* Horario */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Horario de Atención al Público
                  </label>
                  <div className="relative flex items-center">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={formEdit.horario}
                      onChange={(e) => setFormEdit({ ...formEdit, horario: e.target.value })}
                      placeholder="Ej. Lun-Vie 7:00 - 19:00, Sáb 8:00 - 13:00"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0073c6]/20 focus:border-[#0073c6]"
                    />
                  </div>
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

    </div>
  );
}
