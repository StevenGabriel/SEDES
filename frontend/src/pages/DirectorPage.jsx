import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  ChevronLeft,
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
  Search,
  Edit3,
  FileEdit,
  Copy,
  Save,
  Undo2,
  Eye,
  Info,
  HelpCircle,
  FileCheck,
  FolderOpen,
  AlertCircle,
  ExternalLink,
  Phone,
  Mail,
  ClipboardList,
  FileWarning
} from 'lucide-react';

import logoL1 from '../assets/L1.png';
import logoL2 from '../assets/L2.png';
import { generarComunicacionInternaPDF } from '../components/coordinador/ComunicacionInternaPDF';
import { generarResolucionAdministrativaPDF } from '../components/abogado/ResolucionAdministrativaPDF';
import EditarPlantillasView from '../components/common/EditarPlantillasView';
import { REGIONES_MUNICIPIOS } from '../components/landing/MapSection';

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

  const SECCIONES_VALIDAS = ['consola-administracion', 'metricas-indicadores', 'editar-documentos'];
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

  // Estados para búsqueda, filtro y paginación de la Bitácora de Trazabilidad
  const [filtroBitacoraTexto, setFiltroBitacoraTexto] = useState('');
  const [filtroBitacoraTipo, setFiltroBitacoraTipo] = useState('Todos');
  const [paginaBitacora, setPaginaBitacora] = useState(1);
  const [itemsPorPaginaBitacora, setItemsPorPaginaBitacora] = useState(10);

  // Filtrado reactivo de la bitácora
  const bitacoraFiltrada = useMemo(() => {
    const lista = datosConsola.trazabilidad_reciente || [];
    return lista.filter((row) => {
      const q = filtroBitacoraTexto.toLowerCase().trim();
      const matchTexto = !q ||
        (row.funcionario || '').toLowerCase().includes(q) ||
        (row.accion || '').toLowerCase().includes(q) ||
        (row.expediente || '').toLowerCase().includes(q) ||
        (row.establecimiento || '').toLowerCase().includes(q) ||
        (row.fecha || '').toLowerCase().includes(q);

      const esSistema = row.es_sistema || (row.funcionario || '').toLowerCase() === 'sistema';
      let matchTipo = true;
      if (filtroBitacoraTipo === 'Funcionario') {
        matchTipo = !esSistema;
      } else if (filtroBitacoraTipo === 'Sistema') {
        matchTipo = esSistema;
      }

      return matchTexto && matchTipo;
    });
  }, [datosConsola.trazabilidad_reciente, filtroBitacoraTexto, filtroBitacoraTipo]);

  // Cálculos de paginación
  const totalRegistrosBitacora = bitacoraFiltrada.length;
  const totalPaginasBitacora = Math.max(1, Math.ceil(totalRegistrosBitacora / itemsPorPaginaBitacora));
  const inicioBitacora = (paginaBitacora - 1) * itemsPorPaginaBitacora;
  const finBitacora = inicioBitacora + itemsPorPaginaBitacora;
  const bitacoraPaginada = bitacoraFiltrada.slice(inicioBitacora, finBitacora);

  // Reiniciar a la primera página al cambiar filtros o tamaño de página
  useEffect(() => {
    setPaginaBitacora(1);
  }, [filtroBitacoraTexto, filtroBitacoraTipo, itemsPorPaginaBitacora]);

  // Generador inteligente de botones de página con elipsis (...)
  const getNumeroPaginasBitacora = () => {
    const paginas = [];
    if (totalPaginasBitacora <= 7) {
      for (let i = 1; i <= totalPaginasBitacora; i++) {
        paginas.push(i);
      }
    } else {
      if (paginaBitacora <= 4) {
        for (let i = 1; i <= 5; i++) paginas.push(i);
        paginas.push('...');
        paginas.push(totalPaginasBitacora);
      } else if (paginaBitacora >= totalPaginasBitacora - 3) {
        paginas.push(1);
        paginas.push('...');
        for (let i = totalPaginasBitacora - 4; i <= totalPaginasBitacora; i++) {
          paginas.push(i);
        }
      } else {
        paginas.push(1);
        paginas.push('...');
        paginas.push(paginaBitacora - 1);
        paginas.push(paginaBitacora);
        paginas.push(paginaBitacora + 1);
        paginas.push('...');
        paginas.push(totalPaginasBitacora);
      }
    }
    return paginas;
  };

  // Obtener estilo e información de estado/resultado
  const getBadgeResultado = (row) => {
    const res = (row.resultado || '').toLowerCase().trim();
    const acc = (row.accion || '').toLowerCase().trim();

    if (res.includes('aprobado') || res.includes('favorable') || res.includes('procedente') || acc.includes('aprobado') || acc.includes('resolución administrativa emitida') || acc.includes('resolucion administrativa')) {
      return {
        texto: row.resultado || 'Aprobado',
        clase: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
      };
    }
    if (res.includes('observad') || res.includes('rechazad') || acc.includes('observ') || acc.includes('rechaz')) {
      return {
        texto: row.resultado || 'Observado',
        clase: 'bg-amber-50 text-amber-700 border-amber-200/80'
      };
    }
    if (res.includes('derivado') || acc.includes('asign') || acc.includes('deriv')) {
      return {
        texto: row.resultado || 'Derivado',
        clase: 'bg-blue-50 text-blue-700 border-blue-200/80'
      };
    }
    if (res.includes('concluid') || acc.includes('habilit') || acc.includes('final')) {
      return {
        texto: row.resultado || 'Concluido',
        clase: 'bg-purple-50 text-purple-700 border-purple-200/80'
      };
    }
    return {
      texto: row.resultado || 'Registrado',
      clase: 'bg-slate-50 text-slate-600 border-slate-200/80'
    };
  };

  // Estados para Modal de Expediente Digital desde la Bitácora
  const [modalExpedienteBitacoraOpen, setModalExpedienteBitacoraOpen] = useState(false);
  const [tramiteBitacoraSeleccionado, setTramiteBitacoraSeleccionado] = useState(null);
  const [cargandoDetalleBitacora, setCargandoDetalleBitacora] = useState(false);
  const [tabModalBitacora, setTabModalBitacora] = useState('documentos');
  const [generandoPdfBitacora, setGenerandoPdfBitacora] = useState(false);

  // Abrir Expediente Digital desde la Bitácora del Director o Modal de Supervisor
  const handleAbrirExpedienteBitacora = async (param) => {
    setCargandoDetalleBitacora(true);
    setModalExpedienteBitacoraOpen(true);
    setTabModalBitacora('documentos');

    const lookupId = typeof param === 'string' ? param : (param?.expediente || param?.codigo || param?.tramite_id || param?.id);
    if (lookupId && lookupId !== 'N/A') {
      try {
        const res = await fetch(`http://localhost:8000/api/coordinador/tramites/${lookupId}`);
        if (res.ok) {
          const freshData = await res.json();
          setTramiteBitacoraSeleccionado(freshData);
          setCargandoDetalleBitacora(false);
          return;
        }
      } catch (e) {
        console.warn('Error al obtener detalle del expediente:', e);
      }
    }

    const rowObj = typeof param === 'object' && param !== null ? param : { expediente: lookupId };
    setTramiteBitacoraSeleccionado({
      id: rowObj.expediente || rowObj.id || lookupId,
      codigo: rowObj.expediente || rowObj.codigo || lookupId,
      establecimiento: rowObj.establecimiento || 'Establecimiento de Salud',
      estado: rowObj.resultado || rowObj.estado || 'Registrado',
      fecha: rowObj.fecha,
      responsable: rowObj.funcionario || rowObj.responsable,
      documentos: []
    });
    setCargandoDetalleBitacora(false);
  };

  // Descargar Resolución desde el modal de Expediente
  const handleDescargarResolucionBitacora = async (tramite) => {
    if (!tramite) return;
    setGenerandoPdfBitacora(true);
    try {
      const res = tramite.resolucion || {};
      const datosParaPdf = {
        numero_resolucion: res.numero_resolucion || tramite.resolucion_numero || `RA-${new Date().getFullYear()}-SEDES`,
        fecha_emision: res.fecha_emision || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        establecimiento: res.establecimiento_nombre || tramite.establecimiento,
        establecimiento_nombre: res.establecimiento_nombre || tramite.establecimiento,
        propietario: res.razon_social_propietario || tramite.propietario,
        razon_social: res.razon_social_propietario || tramite.propietario,
        razon_social_propietario: res.razon_social_propietario || tramite.propietario,
        ci_nit: res.ci_nit_solicitante || tramite.propietario_ci || tramite.ci_nit,
        ci_nit_solicitante: res.ci_nit_solicitante || tramite.propietario_ci || tramite.ci_nit,
        regente: res.regente_tecnico || tramite.regente || tramite.propietario,
        regente_nombre: res.regente_tecnico || tramite.regente || tramite.propietario,
        ci_regente: res.ci_regente || tramite.regente_ci || tramite.ci_responsable,
        tipo_tramite: tramite.tipo || 'APERTURA Y HABILITACIÓN',
        direccion: res.direccion_registrada || tramite.direccion,
        direccion_registrada: res.direccion_registrada || tramite.direccion,
        tipo_establecimiento: res.tipo_establecimiento || tramite.categoria || 'Laboratorio Clínico',
        cite_informe: res.cite_informe || `CODELAB/SEDES/1/${new Date().getFullYear()}`,
        fecha_informe: res.fecha_emision || 'Reciente',
        coordinador_nombre: 'Dra. Claudia Morales Valenzuela',
        abogado_nombre: res.abogado_nombre || 'Dr. Marco Villanueva (Asesor Legal SEDES)',
        vigencia_anios: res.vigencia_anios || 5,
        antecedentes: res.antecedentes,
        vistos: res.antecedentes,
        fundamento_legal: res.fundamento_legal,
        articulo_primero: res.articulo_primero,
        articulo_segundo: res.articulo_segundo,
        articulo_tercero: res.articulo_tercero,
        observaciones_legales: res.observaciones_legales
      };
      const doc = await generarResolucionAdministrativaPDF(datosParaPdf);
      doc.save(`Resolucion_Administrativa_${(datosParaPdf.numero_resolucion || 'SEDES').replace(/\//g, '_')}.pdf`);
      mostrarToast('Resolución Administrativa descargada con éxito.', 'success');
    } catch (e) {
      console.error('Error al generar PDF de Resolución:', e);
      mostrarToast('Error al generar PDF de Resolución', 'warning');
    } finally {
      setGenerandoPdfBitacora(false);
    }
  };

  // Descargar Informe Técnico desde el modal de Expediente
  const handleDescargarInformeBitacora = async (tramite) => {
    if (!tramite) return;
    setGenerandoPdfBitacora(true);
    try {
      const cite = tramite.resolucion?.cite_informe || `CODELAB/SEDES/1/${new Date().getFullYear()}`;
      const doc = await generarComunicacionInternaPDF(tramite, {
        cite: cite,
        destinatario: 'Dra. Mery D. Loroño V.',
        destinatarioCargo: 'ASESOR LEGAL - UNIDAD DE CALIDAD Y SERVICIOS',
        via: 'Dra. Karina Soliz Villarroel',
        viaCargo: 'JEFE DE LA UNIDAD DE CALIDAD Y SERVICIOS a.i.',
        remitente: 'Dra. Claudia Morales Valenzuela',
        remitenteCargo: 'RESPONSABLE DEPARTAMENTAL DE LABORATORIOS CODELAB - SEDES',
        regente: tramite.regente,
        ciRegente: tramite.ci_regente || tramite.regente_ci || tramite.ci_responsable,
        responsables_areas: tramite.responsables_areas,
        observaciones: tramite.resolucion?.observaciones_coordinador || 'Conformidad técnica y regulatoria verificada en expediente digital.',
      });
      doc.save(`Informe_Tecnico_${cite.replace(/\//g, '_')}.pdf`);
      mostrarToast('Informe Técnico descargado con éxito.', 'success');
    } catch (e) {
      console.error('Error al generar Informe Técnico PDF:', e);
      mostrarToast('Error al generar Informe Técnico PDF', 'warning');
    } finally {
      setGenerandoPdfBitacora(false);
    }
  };

  // Previsualizar PDF en pestaña nueva
  const handlePrevisualizarPdfBitacora = async (tipo, tramite) => {
    if (!tramite) return;
    setGenerandoPdfBitacora(true);
    try {
      let doc;
      if (tipo === 'resolucion') {
        const res = tramite.resolucion || {};
        const datosParaPdf = {
          numero_resolucion: res.numero_resolucion || tramite.resolucion_numero || `RA-${new Date().getFullYear()}-SEDES`,
          fecha_emision: res.fecha_emision || new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
          establecimiento: res.establecimiento_nombre || tramite.establecimiento,
          establecimiento_nombre: res.establecimiento_nombre || tramite.establecimiento,
          propietario: res.razon_social_propietario || tramite.propietario,
          razon_social: res.razon_social_propietario || tramite.propietario,
          razon_social_propietario: res.razon_social_propietario || tramite.propietario,
          ci_nit: res.ci_nit_solicitante || tramite.propietario_ci || tramite.ci_nit,
          ci_nit_solicitante: res.ci_nit_solicitante || tramite.propietario_ci || tramite.ci_nit,
          regente: res.regente_tecnico || tramite.regente || tramite.propietario,
          regente_nombre: res.regente_tecnico || tramite.regente || tramite.propietario,
          ci_regente: res.ci_regente || tramite.regente_ci || tramite.ci_responsable,
          tipo_tramite: tramite.tipo || 'APERTURA Y HABILITACIÓN',
          direccion: res.direccion_registrada || tramite.direccion,
          direccion_registrada: res.direccion_registrada || tramite.direccion,
          tipo_establecimiento: res.tipo_establecimiento || tramite.categoria || 'Laboratorio Clínico',
          cite_informe: res.cite_informe || `CODELAB/SEDES/1/${new Date().getFullYear()}`,
          fecha_informe: res.fecha_emision || 'Reciente',
          coordinador_nombre: 'Dra. Claudia Morales Valenzuela',
          abogado_nombre: res.abogado_nombre || 'Dr. Marco Villanueva (Asesor Legal SEDES)',
          vigencia_anios: res.vigencia_anios || 5,
          antecedentes: res.antecedentes,
          vistos: res.antecedentes,
          fundamento_legal: res.fundamento_legal,
          articulo_primero: res.articulo_primero,
          articulo_segundo: res.articulo_segundo,
          articulo_tercero: res.articulo_tercero,
          observaciones_legales: res.observaciones_legales
        };
        doc = await generarResolucionAdministrativaPDF(datosParaPdf);
      } else {
        const cite = tramite.resolucion?.cite_informe || `CODELAB/SEDES/1/${new Date().getFullYear()}`;
        doc = await generarComunicacionInternaPDF(tramite, {
          cite: cite,
          destinatario: 'Dra. Mery D. Loroño V.',
          destinatarioCargo: 'ASESOR LEGAL - UNIDAD DE CALIDAD Y SERVICIOS',
          via: 'Dra. Karina Soliz Villarroel',
          viaCargo: 'JEFE DE LA UNIDAD DE CALIDAD Y SERVICIOS a.i.',
          remitente: 'Dra. Claudia Morales Valenzuela',
          remitenteCargo: 'RESPONSABLE DEPARTAMENTAL DE LABORATORIOS CODELAB - SEDES',
          regente: tramite.regente,
          ciRegente: tramite.ci_regente || tramite.regente_ci || tramite.ci_responsable,
          responsables_areas: tramite.responsables_areas,
          observaciones: tramite.resolucion?.observaciones_coordinador || 'Conformidad técnica y regulatoria verificada en expediente digital.',
        });
      }
      if (doc) {
        const blob = doc.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
      }
    } catch (e) {
      console.error('Error al previsualizar PDF:', e);
      mostrarToast('Error al previsualizar documento PDF', 'warning');
    } finally {
      setGenerandoPdfBitacora(false);
    }
  };

  // Exportar Bitácora a Excel (CSV con formato UTF-8 BOM para soporte completo de caracteres y compatibilidad con MS Excel)
  const handleExportarBitacoraExcel = () => {
    if (!bitacoraFiltrada || bitacoraFiltrada.length === 0) {
      mostrarToast('No hay registros en la bitácora para exportar.', 'warning');
      return;
    }

    const headers = [
      'FECHA Y HORA',
      'EXPEDIENTE',
      'ESTABLECIMIENTO',
      'ACCION REALIZADA',
      'RESPONSABLE / FUNCIONARIO',
      'TIPO DE ACTOR',
      'ESTADO / RESULTADO'
    ];

    const rows = bitacoraFiltrada.map(row => {
      const esSistema = row.es_sistema || (row.funcionario || '').toLowerCase() === 'sistema';
      const actorTipo = esSistema ? 'Sistema Automatizado' : 'Funcionario SEDES';
      const badge = getBadgeResultado(row);
      const sanitize = (text) => `"${(text || '').toString().replace(/"/g, '""')}"`;

      return [
        sanitize(row.fecha),
        sanitize(row.expediente),
        sanitize(row.establecimiento || 'N/A'),
        sanitize(row.accion),
        sanitize(row.funcionario),
        sanitize(actorTipo),
        sanitize(badge.texto)
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Bitacora_Trazabilidad_SEDES_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    mostrarToast('Bitácora exportada en formato Excel (.csv) exitosamente.', 'success');
  };

  // Estados para la sección de Métricas e Indicadores
  const [filtros, setFiltros] = useState({
    periodo_predefinido: 'todos', // 'todos', 'este_mes', 'ultimos_30', 'ultimos_7', 'personalizado'
    fecha_inicio: '',
    fecha_fin: '',
    periodo_anio: 2026,
    periodo_mes: '',
    municipio: '',
    tipo_laboratorio: '',
    tipo_tramite: '',
    estado: '',
    estado_tramite: '',
    supervisor: '',
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
    tipos_tramite: [],
    estados_tramite: [],
    supervisores: [],
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
  const [tabGeo, setTabGeo] = useState('regiones'); // 'regiones' | 'municipios'
  const [filtroMunBusqueda, setFiltroMunBusqueda] = useState('');
  const [rangoMunVista, setRangoMunVista] = useState('top10'); // 'top5', 'top10', 'todos'

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
      if (filtros.periodo_predefinido) params.append('periodo_predefinido', filtros.periodo_predefinido);
      if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
      if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
      if (filtros.periodo_anio) params.append('periodo_anio', filtros.periodo_anio);
      if (filtros.periodo_mes) params.append('periodo_mes', filtros.periodo_mes);
      if (filtros.municipio) params.append('municipio', filtros.municipio);
      if (filtros.tipo_laboratorio) params.append('tipo_laboratorio', filtros.tipo_laboratorio);
      if (filtros.tipo_tramite) params.append('tipo_tramite', filtros.tipo_tramite);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.estado_tramite) params.append('estado_tramite', filtros.estado_tramite);
      if (filtros.supervisor) params.append('supervisor', filtros.supervisor);
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
      periodo_predefinido: 'todos',
      fecha_inicio: '',
      fecha_fin: '',
      periodo_anio: 2026,
      periodo_mes: '',
      municipio: '',
      tipo_laboratorio: '',
      tipo_tramite: '',
      estado: '',
      estado_tramite: '',
      supervisor: '',
      nombre_laboratorio: '',
      nivel: '',
      propietario: '',
      responsable_laboratorio: '',
      responsables_areas: '',
      direccion: ''
    });
    mostrarToast('Filtros de métricas restablecidos.', 'info');
  };

  const handleDescargarInforme = () => {
    window.print();
  };

  // =====================================================================
  // Estado para Edición de Plantillas de Documentos (Comunicación Interna)
  // =====================================================================
  const PLANTILLA_DEFAULT_CODELAB = {
    titulo_documento: 'COMUNICACIÓN INTERNA',
    parrafo1: `Mediante la presente y en cumplimiento a las funciones específicas de mi cargo dentro los alcances de los Art. 28 y Art. 38 de la Ley 1178, adjunto al presente informe para su conocimiento requisitos en general para la {TIPO_TRAMITE} del establecimiento "{ESTABLECIMIENTO}" ubicado en {DIRECCION}, {MUNICIPIO}, siendo propiedad de {PROPIETARIO} con C.I. Nro. {CI_PROPIETARIO}, y regentado actualmente por el/la profesional {REGENTE} con C.I. Nro. {CI_REGENTE}{RESPONSABLES_AREAS}. En el marco de la normativa actual vigente aprobada por R.M. 0202 de fecha 22 de marzo del 2010 donde están descritos los requisitos técnicos, administrativos, legales y técnicos, en la evaluación realizada se verificó los requisitos mínimos que deben cumplir los establecimientos de salud en cuanto a documentación, gestión de calidad, bioseguridad, competencia técnica, etc., pero principalmente se hace una trazabilidad de sus procesos y procedimientos técnicos para validar la calidad de los resultados que emiten. El proceso de habilitación es análogo al de acreditación (ISO 9001 y la 15189) y la norma señala que es de responsabilidad de los SEDES para garantizar la calidad de los resultados de diagnóstico laboratorial en beneficio de la población.`,
    parrafo2: `La Evaluación técnica IN SITU para la {TIPO_TRAMITE_MIN} fue realizada en fecha {FECHA_INSPECCION} por el evaluador de campo {SUPERVISOR}, bajo la supervisión y conducción de {REMITENTE} - {REMITENTE_CARGO} y personal técnico de esa repartición del Ministerio de Salud y Deportes de Bolivia.`,
    parrafo3: `Según Resolución Ministerial N° 847 de fecha 30 de noviembre donde indica que el ente regulador y coordinador de la Red Departamental de Laboratorios será la Coordinación Departamental de Laboratorios (CODELAB) dependientes de los Servicios Departamentales de Salud; de esta red dependerán los laboratorios de servicio público, de los seguros de salud a corto plazo y privados con y sin fines de lucro, así mismo en aplicación a la Resolución Ministerial N° 0936 de fecha 16 de diciembre del 2005 que en el Artículo Quinto designa en el nivel departamental como responsable de coordinar la Red Departamental de Laboratorios de Salud en el departamento de Cochabamba al Laboratorio de SEDES Cochabamba.`,
    parrafo_requisitos_tecnicos: `- EN APLICACIÓN DEL REGLAMENTO DE HABILITACIÓN DE LABORATORIOS Y ESTABLECIMIENTOS DE SALUD (La Habilitación y/o Renovación de habilitación es extendida a los establecimientos solicitantes que cumplen con estos requisitos mínimos), por lo que la Evaluación del establecimiento IN SITU FUE REALIZADA POR LOS EVALUADORES, LIDERIZADA Y CONDUCIDA POR CODELAB SEDES y donde el establecimiento cuenta con una gestión de calidad en cuanto a bioseguridad en el proceso de evaluación en la presente gestión. Se adjunta Lista de verificación de requisitos técnicos con el que fue evaluado y el acta de evaluación in situ para la habilitación del establecimiento.`,
    parrafo_financiero: `En los mismos se concluye autorizando la habilitación respectiva habiendo cumplido con el depósito de aranceles de Ley, toda vez que la principal función del SEDES no es recaudar fondos sino velar porque todos los Establecimientos de Salud estén debidamente normados y reglamentados velando la calidad y calidez de atención a la población usuaria.`,
    parrafo_conclusion: `Que siendo la habilitación según la R.M. N° 0202 de fecha 22/03/2010, en actual vigencia, la Sub Unidad de CODELAB, solicita la emisión de la resolución administrativa que realiza Asesoría Legal, de tal forma se determina, concluye y autoriza al establecimiento la {TIPO_TRAMITE} - "{ESTABLECIMIENTO}", en aplicación a la normativa ministerial vigente.`,
    parrafo5_pagina3: `TRANSMITIDAS POR VECTORES (ETVs) Y OTRAS ENFERMEDADES EMERGENTES Y REEMERGENTES, ubicado en {DIRECCION}, {MUNICIPIO}, siendo propiedad de {PROPIETARIO}, regentado actualmente por el/la profesional {REGENTE} con C.I. Nro. {CI_REGENTE}{RESPONSABLES_AREAS}, según normativa vigente establecida en el Código de Salud R.M. 0847/06 y R.M. 0202/10, habiéndose sometido a la evaluación documental y técnica INSITU, trazabilidad de sus procesos y procedimientos para la validación de localidad de sus resultados, realizada por los evaluadores conducida y liderada por CODELAB- SEDES, de acuerdo a las listas de verificación para la aplicación del reglamento de habilitación, por lo que corresponde la extensión de la R.A. en la que se declara PROCEDENTE LA {TIPO_TRAMITE} al {ESTABLECIMIENTO} ante el Ministerio de Salud y el Servicio Departamental de Salud.`,
    leyenda_adjunto: `Se adjunta toda la documentación que cursa en la Sub Unidad de CODELAB Para la revisión y firma correspondiente.`,
    iniciales_archivo: `I.F.R./J.P.I.S./K.S.V.`
  };

  const [plantillaDoc, setPlantillaDoc] = useState(PLANTILLA_DEFAULT_CODELAB);
  const [plantillaMetadata, setPlantillaMetadata] = useState({
    nombre: 'Comunicación Interna / Informe Técnico CODELAB',
    actualizado_por: 'Sistema (Predeterminado)',
    fecha_modificacion: null,
    es_personalizada: false
  });
  const [cargandoPlantilla, setCargandoPlantilla] = useState(false);
  const [guardandoPlantilla, setGuardandoPlantilla] = useState(false);
  const [generandoPdfPreview, setGenerandoPdfPreview] = useState(false);
  const [cambiosPendientes, setCambiosPendientes] = useState(false);
  const [modalRestablecerOpen, setModalRestablecerOpen] = useState(false);
  const [tagCopiada, setTagCopiada] = useState(null);

  const cargarPlantillaDesdeBD = useCallback(async () => {
    setCargandoPlantilla(true);
    try {
      const res = await fetch('http://localhost:8000/api/plantillas-documentos/COMUNICACION_INTERNA_CODELAB');
      if (res.ok) {
        const data = await res.json();
        if (data?.contenido) {
          setPlantillaDoc({ ...PLANTILLA_DEFAULT_CODELAB, ...data.contenido });
          setPlantillaMetadata({
            nombre: data.nombre || 'Comunicación Interna / Informe Técnico CODELAB',
            actualizado_por: data.actualizado_por || 'Sistema',
            fecha_modificacion: data.fecha_modificacion,
            es_personalizada: !!data.es_personalizada
          });
          setCambiosPendientes(false);
          localStorage.setItem('sedes_plantilla_comunicacion', JSON.stringify(data.contenido));
        }
      }
    } catch (err) {
      console.warn('Error al cargar plantilla desde BD, usando respaldo local:', err);
    } finally {
      setCargandoPlantilla(false);
    }
  }, []);

  const updatePlantillaCampo = (campo, valor) => {
    setPlantillaDoc(prev => ({ ...prev, [campo]: valor }));
    setCambiosPendientes(true);
  };

  const handleGuardarPlantilla = async () => {
    setGuardandoPlantilla(true);
    try {
      const nombreAutor = usuario 
        ? `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() || 'Dirección General SEDES'
        : 'Dirección General SEDES';

      const res = await fetch('http://localhost:8000/api/plantillas-documentos/COMUNICACION_INTERNA_CODELAB', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenido: plantillaDoc,
          actualizado_por: nombreAutor
        })
      });

      if (res.ok) {
        localStorage.setItem('sedes_plantilla_comunicacion', JSON.stringify(plantillaDoc));
        setCambiosPendientes(false);
        setPlantillaMetadata(prev => ({
          ...prev,
          actualizado_por: nombreAutor,
          fecha_modificacion: new Date().toISOString(),
          es_personalizada: true
        }));
        mostrarToast('Plantilla oficial guardada exitosamente en el sistema.', 'success');
      } else {
        mostrarToast('No se pudo guardar la plantilla en el servidor.', 'warning');
      }
    } catch (err) {
      console.error('Error al guardar plantilla:', err);
      mostrarToast('Error de conexión al guardar la plantilla.', 'warning');
    } finally {
      setGuardandoPlantilla(false);
    }
  };

  const handleRestablecerPlantilla = async () => {
    setCargandoPlantilla(true);
    try {
      const res = await fetch('http://localhost:8000/api/plantillas-documentos/COMUNICACION_INTERNA_CODELAB/restablecer', {
        method: 'POST'
      });
      if (res.ok) {
        setPlantillaDoc(PLANTILLA_DEFAULT_CODELAB);
        localStorage.setItem('sedes_plantilla_comunicacion', JSON.stringify(PLANTILLA_DEFAULT_CODELAB));
        setCambiosPendientes(false);
        setPlantillaMetadata(prev => ({
          ...prev,
          actualizado_por: 'Sistema (Restablecido)',
          fecha_modificacion: new Date().toISOString(),
          es_personalizada: false
        }));
        mostrarToast('Plantilla restablecida a la redacción oficial original.', 'info');
      }
    } catch (err) {
      setPlantillaDoc(PLANTILLA_DEFAULT_CODELAB);
      localStorage.setItem('sedes_plantilla_comunicacion', JSON.stringify(PLANTILLA_DEFAULT_CODELAB));
      mostrarToast('Plantilla restablecida localmente.', 'info');
    } finally {
      setCargandoPlantilla(false);
      setModalRestablecerOpen(false);
    }
  };

  const handleProbarVistaPreviaPDF = async () => {
    setGenerandoPdfPreview(true);
    try {
      const tramitePrueba = {
        id: 'demo-preview',
        codigo: 'TR-DEMO-2026',
        establecimiento: 'LABORATORIO CLÍNICO SAN GABRIEL',
        propietario: 'Dr. Roberto Salvatierra Flores',
        ci_nit: '3799203 CB',
        tipo: 'APERTURA Y HABILITACIÓN',
        direccion: 'Av. Libertador Bolívar Nº 1420, Zona Cala Cala',
        municipio: 'Cochabamba',
        supervisor_nombre: 'Dra. Fabiola Montesinos',
        fechaInspeccion: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
        regente: 'DRA. NORMA VILLAVICENCIO SILES',
        ci_regente: '4589102 CB',
        responsables_areas: 'Inmunología: Dra. Patricia Claros (CI 5678901), Hematología: Dr. Andrés Gómez (CI 6789012)'
      };

      const doc = await generarComunicacionInternaPDF(tramitePrueba, {
        plantilla: plantillaDoc,
        cite: `CODELAB/SEDES/01/${new Date().getFullYear()}`,
        destinatario: 'Dra. Mery D. Loroño V.',
        destinatarioCargo: 'ASESOR LEGAL - UNIDAD DE CALIDAD Y SERVICIOS',
        via: 'Dra. Karina Soliz Villarroel',
        viaCargo: 'JEFE DE LA UNIDAD DE CALIDAD Y SERVICIOS a.i.',
        remitente: 'Dra. Claudia Morales Valenzuela',
        remitenteCargo: 'RESPONSABLE DEPARTAMENTAL DE LABORATORIOS CODELAB - SEDES',
        regente: 'DRA. NORMA VILLAVICENCIO SILES',
        ciRegente: '4589102 CB',
        responsables_areas: tramitePrueba.responsables_areas,
        observaciones: 'El establecimiento ha cumplido satisfactoriamente con todos los estándares técnicos y normativos exigidos por el SEDES.'
      });

      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      mostrarToast('Vista previa del PDF generada y abierta.', 'success');
    } catch (err) {
      console.error('Error generando vista previa:', err);
      mostrarToast('Error al generar la vista previa del PDF.', 'warning');
    } finally {
      setGenerandoPdfPreview(false);
    }
  };

  const copiarTag = (tag) => {
    navigator.clipboard.writeText(tag);
    setTagCopiada(tag);
    mostrarToast(`Etiqueta ${tag} copiada al portapapeles.`, 'info');
    setTimeout(() => setTagCopiada(null), 2500);
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
    cargarPlantillaDesdeBD();
  }, [cargarDatosConsolaBackend, cargarPlantillaDesdeBD]);

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
    },
    {
      id: 'editar-documentos',
      path: '/director/editar-documentos',
      label: 'Editar Documentos',
      icon: FileEdit,
      tituloBreadcrumb: 'Editor de Plantillas de Documentos Oficiales',
      descripcion: 'Personalice los textos normativos, párrafos y fundamentos de los informes técnicos emitidos por el SEDES.'
    }
  ];

  // Estados para filtro de períodos de fechas y modal de desglose de supervisores
  const [periodoSupervisores, setPeriodoSupervisores] = useState('todos'); // 'todos', 'este_mes', 'ultimos_30', 'ultimos_7', 'personalizado'
  const [fechaInicioSup, setFechaInicioSup] = useState('');
  const [fechaFinSup, setFechaFinSup] = useState('');
  const [modalSupervisorOpen, setModalSupervisorOpen] = useState(false);
  const [supervisorSeleccionadoModal, setSupervisorSeleccionadoModal] = useState(null);
  const [filtroInspTextoModal, setFiltroInspTextoModal] = useState('');
  const [filtroInspVeredictoModal, setFiltroInspVeredictoModal] = useState('Todos');

  const itemActivo = menuItems.find(item => item.id === seccionActiva) || menuItems[0];

  const nombreDirector = usuario 
    ? (usuario.nombres && usuario.apellidos ? `${usuario.nombres} ${usuario.apellidos}` : (usuario.nombre || usuario.nombreCompleto || 'Fernando Castillo').replace(/^Dr\.\s*/i, '')) 
    : 'Fernando Castillo';

  // Filtrado reactivo de supervisores por período de fechas
  const { supervisoresFiltrados, maxActasFiltradas, totalActasFiltradas } = useMemo(() => {
    const rawList = datosConsola.rendimiento_supervisores || [];
    const ahora = new Date();

    let fInicio = null;
    let fFin = null;

    if (periodoSupervisores === 'este_mes') {
      fInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fFin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59);
    } else if (periodoSupervisores === 'ultimos_30') {
      fInicio = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
      fFin = ahora;
    } else if (periodoSupervisores === 'ultimos_7') {
      fInicio = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
      fFin = ahora;
    } else if (periodoSupervisores === 'personalizado') {
      if (fechaInicioSup) fInicio = new Date(`${fechaInicioSup}T00:00:00`);
      if (fechaFinSup) fFin = new Date(`${fechaFinSup}T23:59:59`);
    }

    const processed = rawList.map(sup => {
      const allInsp = sup.inspecciones || [];
      const inspFiltradas = allInsp.filter(insp => {
        if (!fInicio && !fFin) return true;
        if (!insp.fecha_iso) return true;
        const d = new Date(`${insp.fecha_iso}T12:00:00`);
        if (fInicio && d < fInicio) return false;
        if (fFin && d > fFin) return false;
        return true;
      });

      const actasEmitidasPeriodo = inspFiltradas.filter(i => 
        (i.estado_inspeccion || '').toLowerCase() === 'completada' ||
        (i.estado_inspeccion || '').toLowerCase() === 'aprobada' ||
        (i.estado_inspeccion || '').toLowerCase() === 'finalizada' ||
        Boolean(i.acta_pdf_url)
      ).length;

      return {
        ...sup,
        actas_emitidas_periodo: actasEmitidasPeriodo,
        inspecciones_periodo: inspFiltradas
      };
    });

    // Ordenar de mayor a menor por actas en el período seleccionado
    processed.sort((a, b) => b.actas_emitidas_periodo - a.actas_emitidas_periodo);

    const maxA = Math.max(...processed.map(s => s.actas_emitidas_periodo), 1);
    const totA = processed.reduce((acc, curr) => acc + curr.actas_emitidas_periodo, 0);

    return {
      supervisoresFiltrados: processed,
      maxActasFiltradas: maxA,
      totalActasFiltradas: totA
    };
  }, [datosConsola.rendimiento_supervisores, periodoSupervisores, fechaInicioSup, fechaFinSup]);

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

                {/* COLUMNA IZQUIERDA: Rendimiento por Supervisor con Filtros de Período y Acceso a Desglose */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
                  
                  {/* Cabecera de la Tarjeta con Filtro de Período */}
                  <div className="flex flex-col gap-3 border-b border-slate-100 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2.5">
                          <h3 className="text-base font-bold text-slate-900 tracking-tight">
                            Rendimiento por Supervisor
                          </h3>
                          <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            {supervisoresFiltrados.length} supervisores
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          Medido por actas oficiales de inspección emitidas en campo
                        </p>
                      </div>

                      {/* Selector de Período de Tiempo */}
                      <div className="flex items-center space-x-2 shrink-0">
                        <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                        <select
                          value={periodoSupervisores}
                          onChange={(e) => setPeriodoSupervisores(e.target.value)}
                          className="text-xs font-bold bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl px-3 py-1.5 border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#0077c8] cursor-pointer transition"
                        >
                          <option value="todos">Todo el Historial</option>
                          <option value="este_mes">Este Mes</option>
                          <option value="ultimos_30">Últimos 30 días</option>
                          <option value="ultimos_7">Últimos 7 días</option>
                          <option value="personalizado">Personalizado...</option>
                        </select>
                      </div>
                    </div>

                    {/* Inputs de Rango de Fechas si se selecciona Personalizado */}
                    {periodoSupervisores === 'personalizado' && (
                      <div className="flex flex-wrap items-center gap-2 p-2.5 bg-sky-50/60 rounded-xl border border-sky-100 text-xs text-slate-700">
                        <span className="font-bold text-sky-800 text-[11px] uppercase tracking-wider">Rango personalizado:</span>
                        <div className="flex items-center space-x-1.5">
                          <label className="text-[11px] text-slate-500 font-medium">Desde:</label>
                          <input
                            type="date"
                            value={fechaInicioSup}
                            onChange={(e) => setFechaInicioSup(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium focus:ring-2 focus:ring-[#0077c8] focus:outline-hidden"
                          />
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <label className="text-[11px] text-slate-500 font-medium">Hasta:</label>
                          <input
                            type="date"
                            value={fechaFinSup}
                            onChange={(e) => setFechaFinSup(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-700 font-medium focus:ring-2 focus:ring-[#0077c8] focus:outline-hidden"
                          />
                        </div>
                        {(fechaInicioSup || fechaFinSup) && (
                          <button
                            type="button"
                            onClick={() => { setFechaInicioSup(''); setFechaFinSup(''); }}
                            className="text-[10px] font-bold text-sky-700 hover:text-sky-900 underline ml-auto cursor-pointer"
                          >
                            Limpiar fechas
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Lista de Barras Horizontales (Supervisores Interactivos) */}
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                    {supervisoresFiltrados.length === 0 ? (
                      <div className="py-10 text-center text-slate-400">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-600">No hay supervisores para el período seleccionado</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Ajuste el rango de fechas para visualizar los registros.</p>
                      </div>
                    ) : (
                      supervisoresFiltrados.map((sup, index) => {
                        const val = sup.actas_emitidas_periodo ?? 0;
                        const widthPercent = maxActasFiltradas > 0 ? Math.min(100, Math.max(val > 0 ? 8 : 2, (val / maxActasFiltradas) * 100)) : 0;

                        return (
                          <div
                            key={sup.id || index}
                            onClick={() => {
                              setSupervisorSeleccionadoModal(sup);
                              setFiltroInspTextoModal('');
                              setFiltroInspVeredictoModal('Todos');
                              setModalSupervisorOpen(true);
                            }}
                            className="space-y-1.5 group p-2.5 rounded-xl hover:bg-sky-50/60 border border-transparent hover:border-sky-200 transition cursor-pointer"
                            title="Haz clic para ver el desglose detallado de inspecciones y actas"
                          >
                            {/* Fila Superior: Posición + Avatar + Nombre + Conteo de Actas */}
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2.5 min-w-0">
                                {/* Medalla o Número de Puesto */}
                                <span className={`w-5.5 h-5.5 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 ${
                                  index === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                  index === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                                  index === 2 ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                                  'bg-slate-100 text-slate-500'
                                }`}>
                                  #{index + 1}
                                </span>

                                {/* Avatar con Iniciales */}
                                <div className={`w-7 h-7 rounded-full ${getAvatarColor(sup.nombre_completo || sup.nombre_corto)} text-white flex items-center justify-center font-bold text-[10px] shrink-0 shadow-xs`}>
                                  <span>{getInitials({ nombreCompleto: sup.nombre_completo || sup.nombre_corto })}</span>
                                </div>

                                {/* Nombre Completo del Supervisor */}
                                <div className="min-w-0 truncate">
                                  <div className="flex items-center space-x-1.5">
                                    <span className="font-bold text-slate-800 truncate block text-xs group-hover:text-[#0077c8] transition" title={sup.nombre_completo}>
                                      {sup.nombre_completo || sup.nombre_corto}
                                    </span>
                                  </div>
                                  {sup.email && (
                                    <span className="text-[10px] text-slate-400 font-normal truncate block">
                                      {sup.email}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Badges de Actas e Inspecciones en Curso */}
                              <div className="flex items-center space-x-2.5 shrink-0 pl-2">
                                {sup.asignados > 0 && (
                                  <span className="text-[10px] text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md font-bold">
                                    {sup.asignados} en curso
                                  </span>
                                )}
                                <div className="flex items-center space-x-1 text-right">
                                  <span className="font-extrabold text-slate-900 text-xs">
                                    {val}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    {val === 1 ? 'acta' : 'actas'}
                                  </span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#0077c8] group-hover:translate-x-0.5 transition" />
                              </div>
                            </div>

                            {/* Barra Horizontal de Progreso */}
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${widthPercent}%` }}
                                className="h-full bg-linear-to-r from-[#1e2d42] to-[#005596] rounded-full transition-all duration-500 group-hover:brightness-110"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Resumen al Pie */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-400 font-medium">
                    <span className="flex items-center space-x-1 text-sky-700 font-semibold">
                      <span>💡</span>
                      <span>Haz clic en un supervisor para ver su desglose de actas e inspecciones</span>
                    </span>
                    <span className="font-bold text-slate-700 shrink-0">
                      Total: {totalActasFiltradas} actas emitidas
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
              {/* FILA 3: BITÁCORA DE TRAZABILIDAD RECIENTE (TABLA CON PAGINACIÓN)  */}
              {/* ----------------------------------------------------------------- */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Bitácora de Trazabilidad Reciente
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Registro de auditoría de trámites, emisión de actos administrativos y actividades del sistema
                    </p>
                  </div>

                  {/* Controles de Búsqueda y Filtro de Actor */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Búsqueda por texto */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Buscar funcionario, acción, CUE..."
                        value={filtroBitacoraTexto}
                        onChange={(e) => {
                          setFiltroBitacoraTexto(e.target.value);
                          setPaginaBitacora(1);
                        }}
                        className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0077c8]/20 focus:border-[#0077c8] w-48 sm:w-60 transition"
                      />
                    </div>

                    {/* Selector de Actor */}
                    <div className="relative">
                      <select
                        value={filtroBitacoraTipo}
                        onChange={(e) => {
                          setFiltroBitacoraTipo(e.target.value);
                          setPaginaBitacora(1);
                        }}
                        className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#0077c8]/20 focus:border-[#0077c8] cursor-pointer transition shadow-2xs"
                      >
                        <option value="Todos">Todos los actores</option>
                        <option value="Funcionario">Solo Funcionarios</option>
                        <option value="Sistema">Solo Sistema</option>
                      </select>
                    </div>

                    {/* Botón Exportar Excel / CSV */}
                    <button
                      type="button"
                      onClick={handleExportarBitacoraExcel}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition shadow-2xs cursor-pointer active:scale-95"
                      title="Exportar registros filtrados a formato compatible con Excel (.csv)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar Excel</span>
                    </button>
                  </div>
                </div>

                {/* Tabla de Registros */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[750px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/40 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-6">FUNCIONARIO</th>
                        <th className="py-3.5 px-6">ACCIÓN REALIZADA</th>
                        <th className="py-3.5 px-6 text-center">ESTADO / RESULTADO</th>
                        <th className="py-3.5 px-6">FECHA</th>
                        <th className="py-3.5 px-6 text-right">EXPEDIENTE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {bitacoraPaginada.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-slate-400">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-xs font-bold text-slate-600">
                              {datosConsola.trazabilidad_reciente?.length === 0
                                ? 'Sin registros de trazabilidad recientes'
                                : 'No se encontraron registros que coincidan con la búsqueda'}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {datosConsola.trazabilidad_reciente?.length === 0
                                ? 'Las acciones del sistema y funcionarios quedarán auditadas aquí en tiempo real.'
                                : 'Pruebe modificando el término de búsqueda o el filtro de actor.'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        bitacoraPaginada.map((row, idx) => {
                          const esSistema = row.es_sistema || row.funcionario?.toLowerCase() === 'sistema';
                          const badge = getBadgeResultado(row);
                          return (
                            <tr
                              key={row.id || idx}
                              onClick={() => handleAbrirExpedienteBitacora(row)}
                              className="hover:bg-sky-50/70 transition-colors cursor-pointer group"
                              title="Haga clic para abrir el Expediente Digital completo y ver documentos oficiales"
                            >
                              {/* Funcionario con Dot de Estado */}
                              <td className="py-4 px-6 font-bold text-slate-900">
                                <div className="flex items-center space-x-2.5">
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${esSistema ? 'bg-rose-500' : 'bg-blue-600'}`} />
                                  <span className="truncate">{row.funcionario}</span>
                                </div>
                              </td>

                              {/* Acción */}
                              <td className="py-4 px-6 text-slate-600 font-medium">
                                <div>
                                  <span className="group-hover:text-slate-900 transition-colors">{row.accion}</span>
                                  {row.establecimiento && (
                                    <span className="block text-[11px] text-slate-400 font-normal mt-0.5 group-hover:text-[#0077c8] transition-colors">
                                      {row.establecimiento}
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Estado / Resultado Badge */}
                              <td className="py-4 px-6 text-center whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${badge.clase}`}>
                                  {badge.texto}
                                </span>
                              </td>

                              {/* Fecha */}
                              <td className="py-4 px-6 text-slate-500 font-medium whitespace-nowrap">
                                {row.fecha}
                              </td>

                              {/* Expediente Badge con Indicador de Click */}
                              <td className="py-4 px-6 text-right whitespace-nowrap">
                                <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-[11px] font-extrabold tracking-wide border shadow-2xs group-hover:ring-2 group-hover:ring-[#0077c8]/30 transition-all ${
                                  esSistema
                                    ? 'bg-rose-50 text-rose-700 border-rose-200/80'
                                    : 'bg-blue-50 text-[#0077c8] border-blue-200/80'
                                }`}>
                                  <span>{row.expediente}</span>
                                  <FolderOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0077c8]" />
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pie de Tabla: Paginación, selector de cantidad y contador de registros */}
                <div className="p-4 sm:px-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs bg-slate-50/40">
                  {/* Conteo de registros + Selector de tamaño de página */}
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-slate-500 font-medium">
                      Mostrando {totalRegistrosBitacora === 0 ? 0 : inicioBitacora + 1}-{Math.min(finBitacora, totalRegistrosBitacora)} de {totalRegistrosBitacora} registros
                    </span>

                    <div className="flex items-center space-x-1.5 pl-2 sm:border-l sm:border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-400">Mostrar:</span>
                      <select
                        value={itemsPorPaginaBitacora}
                        onChange={(e) => {
                          setItemsPorPaginaBitacora(Number(e.target.value));
                          setPaginaBitacora(1);
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
                  {totalPaginasBitacora > 1 && (
                    <div className="flex items-center space-x-1.5">
                      {/* Botón Anterior < */}
                      <button
                        type="button"
                        onClick={() => setPaginaBitacora(prev => Math.max(1, prev - 1))}
                        disabled={paginaBitacora === 1}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer transition shadow-2xs bg-white"
                        title="Página anterior"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Botones de número de página con soporte de elipsis */}
                      {getNumeroPaginasBitacora().map((p, idx) => (
                        p === '...' ? (
                          <span key={`dots-${idx}`} className="w-8 h-8 flex items-center justify-center text-slate-400 text-xs font-bold select-none">
                            ...
                          </span>
                        ) : (
                          <button
                            key={`page-${p}`}
                            type="button"
                            onClick={() => setPaginaBitacora(p)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              paginaBitacora === p
                                ? 'bg-[#1e2d42] text-white border border-[#1e2d42] shadow-xs'
                                : 'border border-slate-200 text-slate-700 hover:bg-white bg-white'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      ))}

                      {/* Botón Siguiente > */}
                      <button
                        type="button"
                        onClick={() => setPaginaBitacora(prev => Math.min(totalPaginasBitacora, prev + 1))}
                        disabled={paginaBitacora === totalPaginasBitacora}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-white hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-semibold cursor-pointer transition shadow-2xs bg-white"
                        title="Página siguiente"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          )}

          {/* VISTA 2: MÉTRICAS E INDICADORES (COMPLETA Y REACTIVA) */}
          {seccionActiva === 'metricas-indicadores' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* ============================================================= */}
              {/* CABECERA: TÍTULO + SELECTOR PERIODO DINÁMICO + DESCARGAR INFORME */}
              {/* ============================================================= */}
              <div className="flex flex-col gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                      Métricas e Indicadores
                      {cargandoMetricas && (
                        <RefreshCw className="w-4 h-4 text-[#0077c8] animate-spin" />
                      )}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Análisis departamental integral, seguimiento temporal y fiscalización técnica de laboratorios.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    {/* Selector de Período Temporal Dinámico */}
                    <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                      <Calendar className="w-4 h-4 text-slate-400 ml-1.5 shrink-0" />
                      <select
                        value={filtros.periodo_predefinido}
                        onChange={(e) => handleFiltroChange('periodo_predefinido', e.target.value)}
                        className="bg-transparent text-slate-800 text-xs font-bold py-1 px-2 focus:outline-hidden cursor-pointer"
                      >
                        <option value="todos">Todo el Historial / 2026</option>
                        <option value="este_mes">Este Mes</option>
                        <option value="ultimos_30">Últimos 30 días</option>
                        <option value="ultimos_7">Últimos 7 días</option>
                        <option value="personalizado">Personalizado...</option>
                      </select>
                    </div>

                    {/* Botón Descargar Informe */}
                    <button
                      type="button"
                      onClick={handleDescargarInforme}
                      className="inline-flex items-center space-x-2 bg-[#1e2d42] hover:bg-[#2b3d56] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs"
                      title="Imprimir o exportar informe de métricas"
                    >
                      <Download className="w-4 h-4 text-cyan-300" />
                      <span>Descargar Informe</span>
                    </button>
                  </div>
                </div>

                {/* Barra de Fechas si se selecciona Rango Personalizado */}
                {filtros.periodo_predefinido === 'personalizado' && (
                  <div className="flex flex-wrap items-center gap-3 p-3 bg-sky-50/70 rounded-xl border border-sky-100 text-xs text-slate-700 animate-fadeIn">
                    <span className="font-bold text-sky-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Rango Personalizado:</span>
                    </span>
                    <div className="flex items-center space-x-1.5">
                      <label className="text-[11px] text-slate-500 font-medium">Desde:</label>
                      <input
                        type="date"
                        value={filtros.fecha_inicio}
                        onChange={(e) => handleFiltroChange('fecha_inicio', e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:ring-2 focus:ring-[#0077c8] focus:outline-hidden"
                      />
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <label className="text-[11px] text-slate-500 font-medium">Hasta:</label>
                      <input
                        type="date"
                        value={filtros.fecha_fin}
                        onChange={(e) => handleFiltroChange('fecha_fin', e.target.value)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:ring-2 focus:ring-[#0077c8] focus:outline-hidden"
                      />
                    </div>
                    {(filtros.fecha_inicio || filtros.fecha_fin) && (
                      <button
                        type="button"
                        onClick={() => { handleFiltroChange('fecha_inicio', ''); handleFiltroChange('fecha_fin', ''); }}
                        className="text-[10px] font-bold text-sky-700 hover:text-sky-900 underline ml-auto cursor-pointer"
                      >
                        Limpiar fechas
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* ============================================================= */}
              {/* BARRA DE FILTROS AVANZADOS MULTIDIMENSIONALES REACTIVOS       */}
              {/* ============================================================= */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2 text-slate-800">
                    <Filter className="w-4 h-4 text-[#0077c8]" />
                    <span className="text-xs font-black tracking-wide uppercase">Filtros Avanzados y Segmentación</span>
                    
                    {/* Contador de Filtros Activos */}
                    {(() => {
                      const activos = Object.entries(filtros).filter(([k, v]) => 
                        Boolean(v) && k !== 'periodo_anio' && !(k === 'periodo_predefinido' && v === 'todos')
                      ).length;
                      return activos > 0 ? (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-extrabold text-[10px]">
                          {activos} {activos === 1 ? 'filtro activo' : 'filtros activos'}
                        </span>
                      ) : null;
                    })()}
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

                {/* Chips de Filtros Activos para Descarte Rápido */}
                {(() => {
                  const chips = Object.entries(filtros).filter(([k, v]) => 
                    Boolean(v) && k !== 'periodo_anio' && !(k === 'periodo_predefinido' && v === 'todos')
                  );
                  if (chips.length === 0) return null;

                  return (
                    <div className="flex flex-wrap items-center gap-1.5 pb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Aplicados:</span>
                      {chips.map(([key, val]) => (
                        <span
                          key={key}
                          className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 text-[11px] font-semibold"
                        >
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <strong className="truncate max-w-[120px]">{String(val)}</strong>
                          <button
                            type="button"
                            onClick={() => handleFiltroChange(key, key === 'periodo_predefinido' ? 'todos' : '')}
                            className="hover:text-rose-600 ml-1 cursor-pointer"
                            title={`Remover filtro ${key}`}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  );
                })()}

                {/* Grid de Selectores */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                  
                  {/* 1. Municipio */}
                  <div className="relative">
                    <select
                      value={filtros.municipio}
                      onChange={(e) => handleFiltroChange('municipio', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.municipio ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Municipio (Todos - 47) ▾</option>
                      {REGIONES_MUNICIPIOS.map((reg) => (
                        <optgroup key={reg.region} label={`${reg.icono} ${reg.region}`}>
                          {reg.municipios.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 2. Tipo de Trámite */}
                  <div className="relative">
                    <select
                      value={filtros.tipo_tramite}
                      onChange={(e) => handleFiltroChange('tipo_tramite', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.tipo_tramite ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Tipo de Trámite ▾</option>
                      {opcionesFiltros.tipos_tramite?.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 3. Supervisor Asignado */}
                  <div className="relative">
                    <select
                      value={filtros.supervisor}
                      onChange={(e) => handleFiltroChange('supervisor', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.supervisor ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Supervisor Asignado ▾</option>
                      {opcionesFiltros.supervisores?.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 4. Estado de Trámite */}
                  <div className="relative">
                    <select
                      value={filtros.estado_tramite}
                      onChange={(e) => handleFiltroChange('estado_tramite', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.estado_tramite ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Estado del Trámite ▾</option>
                      {opcionesFiltros.estados_tramite?.map((et) => (
                        <option key={et} value={et}>{et}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 5. Tipo / Sector de Establecimiento */}
                  <div className="relative">
                    <select
                      value={filtros.tipo_laboratorio}
                      onChange={(e) => handleFiltroChange('tipo_laboratorio', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.tipo_laboratorio ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Sector / Tipo de Lab ▾</option>
                      {opcionesFiltros.tipos?.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 6. Estado Operativo del Establecimiento */}
                  <div className="relative">
                    <select
                      value={filtros.estado}
                      onChange={(e) => handleFiltroChange('estado', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.estado ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Estado Operativo ▾</option>
                      {opcionesFiltros.estados?.map((est) => (
                        <option key={est} value={est}>{est}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 7. Nivel */}
                  <div className="relative">
                    <select
                      value={filtros.nivel}
                      onChange={(e) => handleFiltroChange('nivel', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.nivel ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Nivel de Complejidad ▾</option>
                      {opcionesFiltros.niveles?.map((nv) => (
                        <option key={nv} value={nv}>{nv}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 8. Nombre del Laboratorio */}
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

                  {/* 9. Propietario */}
                  <div className="relative">
                    <select
                      value={filtros.propietario}
                      onChange={(e) => handleFiltroChange('propietario', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.propietario ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Propietario / Solicitante ▾</option>
                      {opcionesFiltros.propietarios?.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 10. Responsable del Laboratorio */}
                  <div className="relative">
                    <select
                      value={filtros.responsable_laboratorio}
                      onChange={(e) => handleFiltroChange('responsable_laboratorio', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.responsable_laboratorio ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Regente / Director Técnico ▾</option>
                      {opcionesFiltros.responsables_laboratorio?.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {/* 11. Responsables de Áreas */}
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

                  {/* 12. Dirección */}
                  <div className="relative">
                    <select
                      value={filtros.direccion}
                      onChange={(e) => handleFiltroChange('direccion', e.target.value)}
                      className={`w-full bg-slate-50 border text-slate-800 rounded-xl px-3 py-2 pr-7 text-xs font-medium focus:ring-2 focus:ring-[#0077c8] cursor-pointer truncate ${
                        filtros.direccion ? 'border-[#0077c8] bg-sky-50/50 font-bold text-[#0077c8]' : 'border-slate-200'
                      }`}
                    >
                      <option value="">Dirección / Zona ▾</option>
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

                {/* CENTRO DE ALERTAS Y CUELLOS DE BOTELLA OPERATIVOS */}
                <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          Alertas Operativas y Cuellos de Botella
                        </h3>
                      </div>
                      {datosMetricas?.cuellos_botella?.cumplimiento_pct !== undefined && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          datosMetricas.cuellos_botella.cumplimiento_pct >= 80
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : datosMetricas.cuellos_botella.cumplimiento_pct >= 50
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        }`}>
                          {datosMetricas.cuellos_botella.cumplimiento_pct}% en plazo
                        </span>
                      )}
                    </div>

                    {/* Barra de Cumplimiento Normativo */}
                    {datosMetricas?.cuellos_botella?.cumplimiento_pct !== undefined && (
                      <div className="mt-3 bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="text-[11px] font-semibold text-slate-600">Cumplimiento Normativo SEDES</span>
                        </div>
                        <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden ml-3">
                          <div
                            style={{ width: `${datosMetricas.cuellos_botella.cumplimiento_pct}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              datosMetricas.cuellos_botella.cumplimiento_pct >= 80 ? 'bg-emerald-500' : datosMetricas.cuellos_botella.cumplimiento_pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Grid de 4 Alertas Operativas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Array.isArray(datosMetricas?.cuellos_botella?.items) ? (
                      datosMetricas.cuellos_botella.items.map((alerta) => {
                        const isRose = alerta.color === 'rose';
                        const isAmber = alerta.color === 'amber';
                        const isSky = alerta.color === 'sky';

                        const bgClass = isRose
                          ? (alerta.conteo > 0 ? 'bg-rose-50/60 border-rose-200/80 hover:bg-rose-50' : 'bg-slate-50/60 border-slate-200/60')
                          : isAmber
                          ? (alerta.conteo > 0 ? 'bg-amber-50/60 border-amber-200/80 hover:bg-amber-50' : 'bg-slate-50/60 border-slate-200/60')
                          : isSky
                          ? (alerta.conteo > 0 ? 'bg-sky-50/60 border-sky-200/80 hover:bg-sky-50' : 'bg-slate-50/60 border-slate-200/60')
                          : (alerta.conteo > 0 ? 'bg-teal-50/60 border-teal-200/80 hover:bg-teal-50' : 'bg-slate-50/60 border-slate-200/60');

                        const badgeClass = isRose
                          ? (alerta.conteo > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-200/70 text-slate-600')
                          : isAmber
                          ? (alerta.conteo > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200/70 text-slate-600')
                          : isSky
                          ? (alerta.conteo > 0 ? 'bg-sky-100 text-sky-800' : 'bg-slate-200/70 text-slate-600')
                          : (alerta.conteo > 0 ? 'bg-teal-100 text-teal-800' : 'bg-slate-200/70 text-slate-600');

                        const iconColor = isRose
                          ? (alerta.conteo > 0 ? 'text-rose-600' : 'text-slate-400')
                          : isAmber
                          ? (alerta.conteo > 0 ? 'text-amber-600' : 'text-slate-400')
                          : isSky
                          ? (alerta.conteo > 0 ? 'text-sky-600' : 'text-slate-400')
                          : (alerta.conteo > 0 ? 'text-teal-600' : 'text-slate-400');

                        const IconComponent =
                          alerta.icono === 'Clock' ? Clock :
                          alerta.icono === 'FileWarning' ? FileWarning :
                          alerta.icono === 'ClipboardList' ? ClipboardList :
                          FileCheck;

                        return (
                          <div
                            key={alerta.id}
                            className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${bgClass}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`p-1.5 rounded-lg bg-white shadow-2xs ${iconColor}`}>
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-800 leading-tight">
                                  {alerta.titulo}
                                </span>
                              </div>
                              <span className={`text-sm font-black px-2 py-0.5 rounded-lg ${badgeClass}`}>
                                {alerta.conteo}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium mt-2 leading-tight">
                              {alerta.subtexto}
                            </p>
                          </div>
                        );
                      })
                    ) : Array.isArray(datosMetricas?.cuellos_botella) ? (
                      datosMetricas.cuellos_botella.map((cb) => {
                        const dotColor = cb.color === 'rose' ? 'bg-rose-500 ring-rose-200' : cb.color === 'amber' ? 'bg-amber-500 ring-amber-200' : 'bg-emerald-500 ring-emerald-200';
                        return (
                          <div key={cb.id} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100 col-span-2">
                            <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ring-4 ${dotColor}`} />
                            <p className="text-xs font-medium text-slate-700 leading-snug">
                              {cb.mensaje}
                            </p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-xs text-slate-400 py-6 text-center col-span-2">Sin cuellos de botella detectados.</p>
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

                {/* DISTRIBUCIÓN TERRITORIAL DE LABORATORIOS (REGIONES + MUNICIPIOS) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  {/* Cabecera con Selector de Pestañas Geográficas */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-2 rounded-xl bg-blue-50 text-[#0077c8] border border-blue-100/80">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          Distribución Territorial
                        </h3>
                        <p className="text-[11px] text-slate-400 font-medium">
                          5 Macro-Regiones SEDES y 47 Municipios
                        </p>
                      </div>
                    </div>

                    {/* Toggle Pestañas: Regiones vs Municipios */}
                    <div className="flex items-center space-x-2">
                      <div className="bg-slate-100 p-0.5 rounded-xl flex items-center">
                        <button
                          type="button"
                          onClick={() => setTabGeo('regiones')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            tabGeo === 'regiones'
                              ? 'bg-[#0077c8] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Macro-Regiones (5)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTabGeo('municipios')}
                          className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                            tabGeo === 'municipios'
                              ? 'bg-[#0077c8] text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Por Municipio
                        </button>
                      </div>

                      {/* Leyenda Privados / Públicos */}
                      <div className="hidden xl:flex items-center space-x-3 text-[11px] font-bold pl-2 border-l border-slate-200">
                        <div className="flex items-center space-x-1">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#0077c8]" />
                          <span className="text-slate-700">Privados</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span className="w-2.5 h-2.5 rounded-xs bg-[#22b8cf]" />
                          <span className="text-slate-700">Públicos/Seguros</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CONTENIDO PESTAÑA 1: MACRO-REGIONES */}
                  {tabGeo === 'regiones' && (
                    <div className="space-y-3.5 my-auto">
                      {(!datosMetricas?.distribucion_regiones || datosMetricas.distribucion_regiones.length === 0) ? (
                        <p className="text-xs text-slate-400 py-8 text-center">No hay datos de distribución por región.</p>
                      ) : (
                        datosMetricas.distribucion_regiones.map((reg, idx) => {
                          const maxRegTotal = Math.max(...datosMetricas.distribucion_regiones.map(r => r.total), 1);
                          const barWidthPct = Math.max((reg.total / maxRegTotal) * 100, 6);
                          const pctPriv = reg.total > 0 ? (reg.privados / reg.total) * 100 : 0;
                          const pctPub = reg.total > 0 ? (reg.publicos / reg.total) * 100 : 0;

                          return (
                            <div key={idx} className="space-y-1.5 p-2.5 rounded-xl bg-slate-50/50 hover:bg-blue-50/40 border border-slate-100 transition-colors">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center space-x-2 min-w-0">
                                  <span className="font-extrabold text-slate-800 truncate">
                                    {reg.region}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                                    ({reg.municipios_count} municipio{reg.municipios_count === 1 ? '' : 's'} con laboratorios)
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2 shrink-0">
                                  <span className="font-black text-slate-900">
                                    {reg.total} <span className="font-normal text-slate-400">({reg.porcentaje}%)</span>
                                  </span>
                                </div>
                              </div>

                              {/* Barra Bicolor de Privados vs Públicos (Azul SEDES + Cyan Salud) */}
                              <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden flex">
                                {reg.total > 0 ? (
                                  <div
                                    style={{ width: `${barWidthPct}%` }}
                                    className="h-full flex rounded-full overflow-hidden transition-all duration-500"
                                  >
                                    <div
                                      style={{ width: `${pctPriv}%` }}
                                      className="h-full bg-[#0077c8] transition-all"
                                      title={`Privados: ${reg.privados}`}
                                    />
                                    <div
                                      style={{ width: `${pctPub}%` }}
                                      className="h-full bg-[#22b8cf] transition-all"
                                      title={`Públicos: ${reg.publicos}`}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-full h-full bg-slate-200/50" />
                                )}
                              </div>

                              {/* Subtotales en texto corporativo */}
                              <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 pt-0.5">
                                <span>Privados: <b className="text-[#0077c8]">{reg.privados}</b></span>
                                <span>Públicos / Seguros: <b className="text-[#0891b2]">{reg.publicos}</b></span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {/* CONTENIDO PESTAÑA 2: POR MUNICIPIO */}
                  {tabGeo === 'municipios' && (
                    <div className="space-y-3">
                      {/* Sub-barra de Búsqueda y Rango de Municipios */}
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 bg-slate-50/80 p-2 rounded-xl border border-slate-100">
                        <div className="relative w-full sm:w-56">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={filtroMunBusqueda}
                            onChange={(e) => setFiltroMunBusqueda(e.target.value)}
                            placeholder="Buscar municipio..."
                            className="w-full pl-8 pr-7 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:border-[#0077c8]"
                          />
                          {filtroMunBusqueda && (
                            <button
                              type="button"
                              onClick={() => setFiltroMunBusqueda('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Selector de Rango */}
                        <div className="flex items-center space-x-1.5 self-end sm:self-auto text-[11px] font-bold">
                          <button
                            type="button"
                            onClick={() => setRangoMunVista('top5')}
                            className={`px-2.5 py-0.5 rounded-md transition-all ${
                              rangoMunVista === 'top5' ? 'bg-[#0077c8] text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Top 5
                          </button>
                          <button
                            type="button"
                            onClick={() => setRangoMunVista('top10')}
                            className={`px-2.5 py-0.5 rounded-md transition-all ${
                              rangoMunVista === 'top10' ? 'bg-[#0077c8] text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Top 10
                          </button>
                          <button
                            type="button"
                            onClick={() => setRangoMunVista('todos')}
                            className={`px-2.5 py-0.5 rounded-md transition-all ${
                              rangoMunVista === 'todos' ? 'bg-[#0077c8] text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Todos ({datosMetricas?.cantidad_municipios?.length || 0})
                          </button>
                        </div>
                      </div>

                      {/* Lista con Scroll de Municipios */}
                      {(() => {
                        const lista = datosMetricas?.cantidad_municipios || [];
                        const filtrados = lista.filter((m) =>
                          !filtroMunBusqueda || m.municipio.toLowerCase().includes(filtroMunBusqueda.toLowerCase().trim())
                        );
                        const mostrados = rangoMunVista === 'top5' ? filtrados.slice(0, 5) : rangoMunVista === 'top10' ? filtrados.slice(0, 10) : filtrados;

                        if (mostrados.length === 0) {
                          return (
                            <p className="text-xs text-slate-400 py-10 text-center">
                              No se encontraron municipios con el término "{filtroMunBusqueda}".
                            </p>
                          );
                        }

                        const maxMunTotal = Math.max(...lista.map(m => m.total), 1);

                        return (
                          <div className="max-h-56 overflow-y-auto pr-1 space-y-2 divide-y divide-slate-100">
                            {mostrados.map((m, idx) => {
                              const barWidth = Math.max((m.total / maxMunTotal) * 100, 8);
                              const pctPriv = m.total > 0 ? (m.privados / m.total) * 100 : 0;
                              const pctPub = m.total > 0 ? (m.publicos / m.total) * 100 : 0;

                              return (
                                <div key={m.municipio} className="pt-2 first:pt-0 flex flex-col space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center space-x-2 min-w-0">
                                      <span className={`font-black text-[11px] w-5 ${idx === 0 ? 'text-amber-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-amber-700' : 'text-slate-300'}`}>
                                        #{idx + 1}
                                      </span>
                                      <span className="font-bold text-slate-800 truncate" title={m.municipio}>
                                        {m.municipio}
                                      </span>
                                      {m.region && (
                                        <span className="text-[10px] bg-blue-50/80 text-[#0077c8] border border-blue-100 font-semibold px-1.5 py-0.2 rounded-md">
                                          {m.region}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center space-x-2 shrink-0 text-xs">
                                      <span className="text-[10px] font-bold text-[#0077c8] bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200/60">
                                        {m.privados} priv
                                      </span>
                                      <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-1.5 py-0.2 rounded border border-cyan-200/60">
                                        {m.publicos} púb
                                      </span>
                                      <span className="font-extrabold text-slate-900 w-12 text-right text-xs">
                                        {m.total} <span className="font-normal text-slate-400 text-[10px]">({m.porcentaje}%)</span>
                                      </span>
                                    </div>
                                  </div>

                                  {/* Barra Horizontal Proporcional Bicolor (Azul SEDES + Cyan) */}
                                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                                    <div
                                      style={{ width: `${barWidth}%` }}
                                      className="h-full flex rounded-full overflow-hidden transition-all duration-500"
                                    >
                                      <div style={{ width: `${pctPriv}%` }} className="h-full bg-[#0077c8]" />
                                      <div style={{ width: `${pctPub}%` }} className="h-full bg-[#22b8cf]" />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* POR NIVEL DE LABORATORIO */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <div className="p-1.5 rounded-lg bg-blue-50 text-[#0077c8]">
                      <FlaskConical className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Por nivel de Laboratorio
                    </h3>
                  </div>

                  <div className="space-y-3.5 my-auto">
                    {(!datosMetricas?.por_nivel || datosMetricas.por_nivel.length === 0) ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No hay registros con los filtros seleccionados.</p>
                    ) : (
                      datosMetricas.por_nivel.map((item, idx) => {
                        const getNivelStyle = (nivel, i) => {
                          const n = (nivel || '').toLowerCase();
                          if (n.includes('ref')) return { bar: 'bg-[#0077c8]', badge: 'text-[#0077c8] bg-blue-50 border-blue-200/60' };
                          if (n.includes('3')) return { bar: 'bg-[#22b8cf]', badge: 'text-cyan-800 bg-cyan-50 border-cyan-200/60' };
                          if (n.includes('2')) return { bar: 'bg-[#0284c7]', badge: 'text-sky-800 bg-sky-50 border-sky-200/60' };
                          if (n.includes('1')) return { bar: 'bg-[#1e2d42]', badge: 'text-slate-800 bg-slate-100 border-slate-200/60' };
                          const palette = ['bg-[#0077c8]', 'bg-[#22b8cf]', 'bg-[#0284c7]', 'bg-[#1e2d42]'];
                          return { bar: palette[i % palette.length], badge: 'text-slate-700 bg-slate-50 border-slate-200' };
                        };

                        const style = getNivelStyle(item.nivel, idx);

                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-slate-800 truncate" title={item.nivel}>
                                {item.nivel}
                              </span>
                              <span className="font-extrabold text-slate-900 shrink-0">
                                {item.cantidad} <span className="font-normal text-slate-400">({item.porcentaje}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.max(item.porcentaje, 4)}%` }}
                                className={`h-full ${style.bar} rounded-full transition-all duration-500`}
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
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <div className="p-1.5 rounded-lg bg-cyan-50 text-cyan-700">
                      <Layers className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Por tipo de Laboratorio
                    </h3>
                  </div>

                  <div className="space-y-3 my-auto">
                    {(!datosMetricas?.por_tipo_laboratorio || datosMetricas.por_tipo_laboratorio.length === 0) ? (
                      <p className="text-xs text-slate-400 py-6 text-center">Sin datos de tipología disponibles.</p>
                    ) : (
                      datosMetricas.por_tipo_laboratorio.map((item, idx) => {
                        const getSectorColor = (sector, i) => {
                          const s = (sector || '').toLowerCase();
                          if (s.includes('privad')) return 'bg-[#0077c8]';
                          if (s.includes('públic') || s.includes('public')) return 'bg-[#22b8cf]';
                          if (s.includes('seguro') || s.includes('caja')) return 'bg-[#1e2d42]';
                          if (s.includes('iglesia')) return 'bg-teal-600';
                          if (s.includes('ong')) return 'bg-indigo-600';
                          if (s.includes('armad') || s.includes('militar')) return 'bg-slate-600';
                          if (s.includes('universidad')) return 'bg-sky-600';
                          const palette = ['bg-[#0077c8]', 'bg-[#22b8cf]', 'bg-[#1e2d42]', 'bg-teal-600', 'bg-indigo-600', 'bg-sky-600', 'bg-slate-600'];
                          return palette[i % palette.length];
                        };

                        const barColor = getSectorColor(item.sector, idx);

                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2 min-w-0">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${barColor}`} />
                                <span className="font-bold text-slate-800 truncate" title={item.sector}>
                                  {item.sector}
                                </span>
                              </div>
                              <span className="font-extrabold text-slate-900 shrink-0">
                                {item.cantidad} <span className="font-normal text-slate-400">({item.porcentaje}%)</span>
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.max(item.porcentaje, 2)}%` }}
                                className={`h-full ${barColor} rounded-full transition-all duration-500`}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* ESTADO / SITUACIÓN DEL LABORATORIO (DONUT MULTI-SEGMENTO) */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                      <Activity className="w-4 h-4" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Estado / Situación del Laboratorio
                    </h3>
                  </div>

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
                              Establecimientos
                            </span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Leyenda Detallada */}
                    <div className="space-y-2 text-xs">
                      {datosMetricas?.estado_situacion?.items?.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-4">
                          <div className="flex items-center space-x-2 min-w-0">
                            <span style={{ backgroundColor: item.color }} className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-slate-100" />
                            <span className="font-bold text-slate-700 truncate">{item.label}</span>
                          </div>
                          <span className="font-extrabold text-slate-900 shrink-0">
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

          {/* =================================================================== */}
          {/* SECCIÓN 3: EDITAR PLANTILLAS DE DOCUMENTOS OFICIALES               */}
          {/* =================================================================== */}
          {seccionActiva === 'editar-documentos' && (
            <EditarPlantillasView
              usuario={usuarioLogueado}
              mostrarToast={mostrarToast}
            />
          )}

        </main>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: EXPEDIENTE DIGITAL Y DOCUMENTACIÓN OFICIAL (DIRECTOR BITÁCORA)    */}
      {/* ========================================================================= */}
      {modalExpedienteBitacoraOpen && tramiteBitacoraSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
            
            {/* Cabecera Estilo Institucional */}
            <div className="bg-linear-to-r from-[#19324d] via-[#102235] to-[#0060a8] text-white p-5 sm:p-6 flex items-start justify-between relative shrink-0">
              <div className="flex items-center space-x-3.5 pr-8">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shrink-0 shadow-inner">
                  <FolderOpen className="w-6 h-6 text-sky-300" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30 uppercase tracking-wide">
                      {tramiteBitacoraSeleccionado.id || tramiteBitacoraSeleccionado.codigo || 'TRM'}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/20 text-emerald-200 border-emerald-400/30">
                      {tramiteBitacoraSeleccionado.estado || 'Registrado'}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1">
                    {tramiteBitacoraSeleccionado.establecimiento || tramiteBitacoraSeleccionado.nombre_comercial || 'Establecimiento de Salud'}
                  </h2>
                  <p className="text-xs text-sky-200/90 font-medium">
                    Expediente Digital Centralizado &bull; SEDES Cochabamba CODELAB
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalExpedienteBitacoraOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                title="Cerrar expediente"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Pestañas del Modal */}
            <div className="bg-slate-50 border-b border-slate-200 px-6 pt-3 flex space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setTabModalBitacora('documentos')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-t border-x cursor-pointer ${
                  tabModalBitacora === 'documentos'
                    ? 'bg-white text-[#0077c8] border-slate-200 border-b-white -mb-px shadow-xs'
                    : 'bg-transparent text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Documentos Emitidos (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => setTabModalBitacora('resumen')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-t border-x cursor-pointer ${
                  tabModalBitacora === 'resumen'
                    ? 'bg-white text-[#0077c8] border-slate-200 border-b-white -mb-px shadow-xs'
                    : 'bg-transparent text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Ficha Técnica del Establecimiento</span>
              </button>

              <button
                type="button"
                onClick={() => setTabModalBitacora('requisitos')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition border-t border-x cursor-pointer ${
                  tabModalBitacora === 'requisitos'
                    ? 'bg-white text-[#0077c8] border-slate-200 border-b-white -mb-px shadow-xs'
                    : 'bg-transparent text-slate-500 border-transparent hover:text-slate-800'
                }`}
              >
                <FileCheck className="w-4 h-4" />
                <span>Requisitos Adjuntos ({tramiteBitacoraSeleccionado.documentos?.length || 0})</span>
              </button>
            </div>

            {/* Cuerpo del Modal con Scroll */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/50 space-y-5">

              {cargandoDetalleBitacora ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-[#0077c8]" />
                  <p className="text-xs font-semibold">Cargando expediente digital completo...</p>
                </div>
              ) : (
                <>
                  {/* TAB 1: DOCUMENTOS EMITIDOS OFICIALES */}
                  {tabModalBitacora === 'documentos' && (() => {
                    const estNorm = (tramiteBitacoraSeleccionado.estado_tramite_raw || tramiteBitacoraSeleccionado.estado || '').toLowerCase();
                    const esAprobadoFinal = Boolean(
                      tramiteBitacoraSeleccionado.es_aprobado_final ||
                      estNorm === 'aprobado' ||
                      (tramiteBitacoraSeleccionado.estado_operativo || '').toLowerCase() === 'habilitado'
                    );

                    const tieneResolucionEmitida = Boolean(
                      esAprobadoFinal ||
                      tramiteBitacoraSeleccionado.resolucion_lista_para_firma ||
                      tramiteBitacoraSeleccionado.resolucion?.numero_resolucion ||
                      tramiteBitacoraSeleccionado.resolucion_numero
                    );

                    const tieneInformeEmitido = Boolean(
                      tieneResolucionEmitida ||
                      tramiteBitacoraSeleccionado.informe_tecnico_aprobado ||
                      tramiteBitacoraSeleccionado.derivado_a_legal ||
                      estNorm.includes('legal') ||
                      estNorm.includes('informe') ||
                      estNorm.includes('derivado') ||
                      tramiteBitacoraSeleccionado.resolucion?.cite_informe
                    );

                    const veredictoSupRaw = (tramiteBitacoraSeleccionado.veredicto_supervisor_raw || tramiteBitacoraSeleccionado.veredictoSupervisor || '').toLowerCase();
                    const tieneInspeccionRealizada = Boolean(
                      tramiteBitacoraSeleccionado.inspeccion_aprobada ||
                      tramiteBitacoraSeleccionado.inspeccion_rechazada ||
                      tramiteBitacoraSeleccionado.inspeccion_con_observaciones ||
                      tramiteBitacoraSeleccionado.acta_pdf_url ||
                      (veredictoSupRaw && !veredictoSupRaw.includes('pendiente') && !veredictoSupRaw.includes('sin asignar') && !veredictoSupRaw.includes('no asignado'))
                    );

                    return (
                      <div className="space-y-4">
                        {/* Mensaje de Cabecera Informativo */}
                        <div className={`rounded-2xl p-4 flex items-start space-x-3 border ${
                          tieneResolucionEmitida
                            ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                            : tieneInformeEmitido
                            ? 'bg-sky-50/60 border-sky-200/80 text-sky-950'
                            : 'bg-amber-50/60 border-amber-200/80 text-amber-950'
                        }`}>
                          <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                            tieneResolucionEmitida ? 'text-emerald-600' : tieneInformeEmitido ? 'text-[#0077c8]' : 'text-amber-600'
                          }`} />
                          <div className="text-xs leading-relaxed font-medium">
                            <strong>Repositorio Oficial de Documentos:</strong> {tieneResolucionEmitida 
                              ? 'Este trámite ha completado satisfactoriamente el circuito administrativo. Puede visualizar y descargar las copias oficiales de los documentos emitidos.'
                              : tieneInformeEmitido
                              ? 'El Informe Técnico fue emitido y remitido a Asesoría Legal. La Resolución Administrativa se habilitará una vez aprobada por el área legal y el Coordinador.'
                              : 'Este trámite se encuentra en etapa inicial de revisión documental. Los documentos oficiales (Informe Técnico y Resolución Administrativa) se habilitarán a medida que se cumplan las inspecciones y dictámenes correspondientes.'}
                          </div>
                        </div>

                        {/* 1. Tarjeta: Resolución Administrativa Oficial */}
                        <div className={`rounded-2xl border p-5 transition-all ${
                          tieneResolucionEmitida
                            ? 'bg-white border-slate-200/90 shadow-xs hover:border-emerald-300'
                            : 'bg-slate-50/60 border-slate-200/70 opacity-90'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start space-x-4">
                              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${
                                tieneResolucionEmitida
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                                  : 'bg-slate-100 border-slate-200 text-slate-400'
                              }`}>
                                <Award className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className={`text-sm font-black ${tieneResolucionEmitida ? 'text-slate-900' : 'text-slate-700'}`}>
                                    Resolución Administrativa SEDES
                                  </h3>
                                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${
                                    tieneResolucionEmitida
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}>
                                    {tieneResolucionEmitida ? 'Documento Legal Oficial' : 'Pendiente de Emisión'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-1">
                                  {tieneResolucionEmitida
                                    ? (tramiteBitacoraSeleccionado.resolucion?.numero_resolucion || tramiteBitacoraSeleccionado.resolucion_numero
                                        ? `Resolución N° ${tramiteBitacoraSeleccionado.resolucion?.numero_resolucion || tramiteBitacoraSeleccionado.resolucion_numero} • Vigencia: ${tramiteBitacoraSeleccionado.resolucion?.vigencia_anios || 5} años`
                                        : 'Resolución Administrativa Oficial de Habilitación y Funcionamiento')
                                    : 'La Resolución Administrativa será emitida por Asesoría Legal tras aprobar el Informe Técnico.'}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-medium mt-2">
                                  <span>Asesor Legal: <strong className={tieneResolucionEmitida ? 'text-slate-700' : 'text-slate-500'}>{tramiteBitacoraSeleccionado.resolucion?.abogado_nombre || 'Asesoría Jurídica SEDES'}</strong></span>
                                  <span>&bull;</span>
                                  <span>Estado: <strong className={tieneResolucionEmitida ? 'text-emerald-700' : 'text-slate-500'}>{tieneResolucionEmitida ? (tramiteBitacoraSeleccionado.resolucion?.fecha_emision || 'Emitida / Oficial') : 'En Espera de Informe Técnico'}</strong></span>
                                </div>
                              </div>
                            </div>

                            {/* Acciones de Resolución */}
                            <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                              {tieneResolucionEmitida ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handlePrevisualizarPdfBitacora('resolucion', tramiteBitacoraSeleccionado)}
                                    disabled={generandoPdfBitacora}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                                    title="Ver vista previa de la Resolución"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Vista Previa</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDescargarResolucionBitacora(tramiteBitacoraSeleccionado)}
                                    disabled={generandoPdfBitacora}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-xs transition cursor-pointer disabled:opacity-50 active:scale-95"
                                    title="Descargar Resolución Administrativa en PDF"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Descargar (PDF)</span>
                                  </button>
                                </>
                              ) : (
                                <span className="inline-flex items-center space-x-1.5 text-slate-500 bg-slate-100 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>No Emitido Aún</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 2. Tarjeta: Informe Técnico / Comunicación Interna */}
                        <div className={`rounded-2xl border p-5 transition-all ${
                          tieneInformeEmitido
                            ? 'bg-white border-slate-200/90 shadow-xs hover:border-sky-300'
                            : 'bg-slate-50/60 border-slate-200/70 opacity-90'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start space-x-4">
                              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${
                                tieneInformeEmitido
                                  ? 'bg-sky-50 border-sky-200 text-[#0077c8]'
                                  : 'bg-slate-100 border-slate-200 text-slate-400'
                              }`}>
                                <FileText className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className={`text-sm font-black ${tieneInformeEmitido ? 'text-slate-900' : 'text-slate-700'}`}>
                                    Informe Técnico / Comunicación Interna CODELAB
                                  </h3>
                                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${
                                    tieneInformeEmitido
                                      ? 'bg-sky-50 text-[#0077c8] border border-sky-200'
                                      : 'bg-slate-100 text-slate-500 border-slate-200'
                                  }`}>
                                    {tieneInformeEmitido ? 'Dictamen Favorable' : 'Pendiente de Elaboración'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-1">
                                  {tieneInformeEmitido
                                    ? `CITE: ${tramiteBitacoraSeleccionado.resolucion?.cite_informe || `CODELAB/SEDES/1/${new Date().getFullYear()}`} • Remisión oficial a Asesoría Legal`
                                    : 'El Informe Técnico se generará una vez que la inspección in-situ concluya favorablemente.'}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-medium mt-2">
                                  <span>Emitido por: <strong className={tieneInformeEmitido ? 'text-slate-700' : 'text-slate-500'}>Dra. Claudia Morales Valenzuela</strong></span>
                                  <span>&bull;</span>
                                  <span>Destino: <strong className={tieneInformeEmitido ? 'text-slate-700' : 'text-slate-500'}>Asesoría Legal SEDES</strong></span>
                                </div>
                              </div>
                            </div>

                            {/* Acciones de Informe */}
                            <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                              {tieneInformeEmitido ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handlePrevisualizarPdfBitacora('informe', tramiteBitacoraSeleccionado)}
                                    disabled={generandoPdfBitacora}
                                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer disabled:opacity-50"
                                    title="Ver vista previa del Informe Técnico"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Vista Previa</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleDescargarInformeBitacora(tramiteBitacoraSeleccionado)}
                                    disabled={generandoPdfBitacora}
                                    className="px-3.5 py-2 bg-[#19324d] hover:bg-[#102235] text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-xs transition cursor-pointer disabled:opacity-50 active:scale-95"
                                    title="Descargar Comunicación Interna en PDF"
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>Descargar (PDF)</span>
                                  </button>
                                </>
                              ) : (
                                <span className="inline-flex items-center space-x-1.5 text-slate-500 bg-slate-100 border border-slate-200 text-xs font-bold px-3 py-2 rounded-xl">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>En Espera de Inspección</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 3. Tarjeta: Acta de Fiscalización e Inspección Técnica In-Situ */}
                        <div className={`rounded-2xl border p-5 transition-all ${
                          tieneInspeccionRealizada
                            ? 'bg-white border-slate-200/90 shadow-xs hover:border-indigo-300'
                            : 'bg-slate-50/60 border-slate-200/70 opacity-90'
                        }`}>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start space-x-4">
                              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs ${
                                tieneInspeccionRealizada
                                  ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                                  : 'bg-slate-100 border-slate-200 text-slate-400'
                              }`}>
                                <ShieldCheck className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className={`text-sm font-black ${tieneInspeccionRealizada ? 'text-slate-900' : 'text-slate-700'}`}>
                                    Acta de Fiscalización e Inspección Técnica In-Situ
                                  </h3>
                                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md border ${
                                    tieneInspeccionRealizada
                                      ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                      : 'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}>
                                    {tieneInspeccionRealizada ? 'Inspección de Campo' : 'Inspección Pendiente'}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-1">
                                  Veredicto: <strong className={tieneInspeccionRealizada ? 'text-emerald-700' : 'text-amber-700'}>
                                    {tramiteBitacoraSeleccionado.veredictoSupervisor || 'PENDIENTE DE ASIGNACIÓN'}
                                  </strong> &bull; Supervisor: <strong className="text-slate-700">{tramiteBitacoraSeleccionado.supervisorAsignado || 'Sin Asignar'}</strong>
                                </p>
                                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-medium mt-2">
                                  <span>Fecha Inspección: <strong className="text-slate-700">{tramiteBitacoraSeleccionado.fechaInspeccion || 'Pendiente de Programación'}</strong></span>
                                </div>
                              </div>
                            </div>

                            {/* Acciones de Acta */}
                            <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                              {tieneInspeccionRealizada ? (
                                tramiteBitacoraSeleccionado.acta_pdf_url ? (
                                  <a
                                    href={
                                      tramiteBitacoraSeleccionado.acta_pdf_url.startsWith('http')
                                        ? tramiteBitacoraSeleccionado.acta_pdf_url
                                        : `http://localhost:8000/${tramiteBitacoraSeleccionado.acta_pdf_url.replace(/^\/+/, '')}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    <span>Ver Acta Firmada</span>
                                  </a>
                                ) : (
                                  <span className="inline-flex items-center space-x-1 text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold text-xs px-3 py-1.5 rounded-xl">
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <span>Inspección Validada</span>
                                  </span>
                                )
                              ) : (
                                <span className="inline-flex items-center space-x-1.5 text-amber-700 bg-amber-50 border border-amber-200 text-xs font-bold px-3 py-2 rounded-xl">
                                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Sin Inspección In-Situ</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                      </div>
                    );
                  })()}

                  {/* TAB 2: FICHA DEL ESTABLECIMIENTO */}
                  {tabModalBitacora === 'resumen' && (
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-5">
                      <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-3">
                        Datos del Establecimiento y Titular Registrado
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Establecimiento / Razón Comercial</span>
                          <span className="font-bold text-slate-800 text-sm block mt-0.5">{tramiteBitacoraSeleccionado.establecimiento || tramiteBitacoraSeleccionado.nombre_comercial}</span>
                          <span className="text-slate-500 block mt-0.5">{tramiteBitacoraSeleccionado.categoria || 'Laboratorio Clínico'}</span>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Ubicación y Jurisdicción</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{tramiteBitacoraSeleccionado.municipio || 'CERCADO'}</span>
                          <span className="text-slate-500 block mt-0.5">{tramiteBitacoraSeleccionado.direccion || 'Cochabamba'}</span>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Propietario / Razón Social</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{tramiteBitacoraSeleccionado.propietario || 'No especificado'}</span>
                          <span className="text-slate-500 block mt-0.5">CI/NIT: {tramiteBitacoraSeleccionado.propietario_ci || tramiteBitacoraSeleccionado.ci_nit || 'S/N'}</span>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Regente Técnico / Director</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{tramiteBitacoraSeleccionado.regente || tramiteBitacoraSeleccionado.director_tecnico || 'No asignado'}</span>
                          <span className="text-slate-500 block mt-0.5">CI Regente: {tramiteBitacoraSeleccionado.regente_ci || tramiteBitacoraSeleccionado.director_tecnico_ci || 'S/N'}</span>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Contacto y Horario</span>
                          <span className="font-bold text-slate-800 block mt-0.5">{tramiteBitacoraSeleccionado.telefono || 'Sin teléfono'} &bull; {tramiteBitacoraSeleccionado.email || 'Sin email'}</span>
                          <span className="text-slate-500 block mt-0.5">{tramiteBitacoraSeleccionado.horario || 'Lun-Vie 7:00 - 19:00'}</span>
                        </div>

                        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Tipo de Trámite</span>
                          <span className="font-bold text-[#0077c8] block mt-0.5">{tramiteBitacoraSeleccionado.tipo || 'Apertura y Habilitación'}</span>
                          <span className="text-slate-500 block mt-0.5">Código CUE: {tramiteBitacoraSeleccionado.codigo_cue || 'Nuevo'}</span>
                        </div>
                      </div>

                      {tramiteBitacoraSeleccionado.responsables_areas && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          <span className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1.5">Responsables de Áreas de Especialidad</span>
                          <p className="text-slate-700 font-medium leading-relaxed">
                            {tramiteBitacoraSeleccionado.responsables_areas}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: REQUISITOS ADJUNTOS */}
                  {tabModalBitacora === 'requisitos' && (
                    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
                      <h3 className="font-black text-sm text-slate-900 border-b border-slate-100 pb-3">
                        Documentación y Requisitos Presentados
                      </h3>

                      <div className="divide-y divide-slate-100">
                        {tramiteBitacoraSeleccionado.documentos?.map((doc, idx) => (
                          <div key={doc.id || idx} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                            <div className="flex items-start space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 font-bold text-[11px]">
                                #{idx + 1}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-800">{doc.nombre || doc.nombre_requisito || 'Documento Legal'}</h4>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                  Categoría: {doc.tipo || 'Legal / Técnico'} &bull; Subido el {doc.fecha_subida || 'Registro inicial'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
                              <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                                (doc.estado || '').toLowerCase() === 'aprobado'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {doc.estado || 'Aprobado'}
                              </span>

                              {doc.archivo_url && (
                                <a
                                  href={
                                    doc.archivo_url.startsWith('http')
                                      ? doc.archivo_url
                                      : `http://localhost:8000/${doc.archivo_url.replace(/^\/+/, '')}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-2.5 py-1 bg-slate-100 hover:bg-[#0077c8] hover:text-white text-slate-600 rounded-lg text-[11px] font-bold transition flex items-center space-x-1"
                                >
                                  <Eye className="w-3 h-3" />
                                  <span>Ver Archivo</span>
                                </a>
                              )}
                            </div>
                          </div>
                        ))}

                        {(!tramiteBitacoraSeleccionado.documentos || tramiteBitacoraSeleccionado.documentos.length === 0) && (
                          <p className="py-6 text-center text-slate-400 text-xs font-medium">
                            No se encontraron archivos adjuntos para este expediente.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>

            {/* Pie de Modal Expediente */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
              <div className="text-slate-400 font-medium">
                SEDES Cochabamba &bull; CODELAB Sistema de Habilitación &bull; Consulta de Dirección
              </div>
              <button
                type="button"
                onClick={() => setModalExpedienteBitacoraOpen(false)}
                className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MODAL DE DESGLOSE DE INSPECCIONES Y ACTAS POR SUPERVISOR               */}
      {/* ========================================================================= */}
      {modalSupervisorOpen && supervisorSeleccionadoModal && (() => {
        const listaInsp = supervisorSeleccionadoModal.inspecciones_periodo || supervisorSeleccionadoModal.inspecciones || [];
        const searchLower = filtroInspTextoModal.toLowerCase().trim();

        const inspFiltradas = listaInsp.filter(insp => {
          if (searchLower) {
            const matchText = (
              (insp.establecimiento || '') + ' ' +
              (insp.codigo_tramite || '') + ' ' +
              (insp.municipio || '') + ' ' +
              (insp.tipo_tramite || '')
            ).toLowerCase();
            if (!matchText.includes(searchLower)) return false;
          }
          if (filtroInspVeredictoModal !== 'Todos') {
            const v = (insp.veredicto || '').toUpperCase();
            const e = (insp.estado_inspeccion || '').toLowerCase();
            if (filtroInspVeredictoModal === 'FAVORABLE') {
              if (v !== 'FAVORABLE' && e !== 'aprobada') return false;
            } else if (filtroInspVeredictoModal === 'OBSERVADO') {
              if (v !== 'OBSERVADO' && v !== 'NO FAVORABLE' && e !== 'observada') return false;
            } else if (filtroInspVeredictoModal === 'PENDIENTE') {
              if (e !== 'pendiente' && e !== 'en proceso' && e !== 'asignada' && e !== 'asignado') return false;
            }
          }
          return true;
        });

        const favCount = listaInsp.filter(i => (i.veredicto || '').toUpperCase() === 'FAVORABLE' || (i.estado_inspeccion || '').toLowerCase() === 'aprobada').length;
        const obsCount = listaInsp.filter(i => (i.veredicto || '').toUpperCase() === 'OBSERVADO' || (i.veredicto || '').toUpperCase() === 'NO FAVORABLE' || (i.estado_inspeccion || '').toLowerCase() === 'observada').length;
        const actasTotalPeriodo = supervisorSeleccionadoModal.actas_emitidas_periodo ?? listaInsp.filter(i => (i.estado_inspeccion || '').toLowerCase() === 'completada' || Boolean(i.acta_pdf_url)).length;

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-50 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in duration-200">

              {/* Cabecera del Supervisor */}
              <div className="bg-linear-to-r from-[#1e2d42] to-[#005596] p-5 sm:p-6 text-white shrink-0 relative">
                <button
                  type="button"
                  onClick={() => setModalSupervisorOpen(false)}
                  className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className={`w-14 h-14 rounded-2xl ${getAvatarColor(supervisorSeleccionadoModal.nombre_completo || supervisorSeleccionadoModal.nombre_corto)} text-white flex items-center justify-center font-black text-lg shadow-md shrink-0 border-2 border-white/20`}>
                    <span>{getInitials({ nombreCompleto: supervisorSeleccionadoModal.nombre_completo || supervisorSeleccionadoModal.nombre_corto })}</span>
                  </div>

                  <div className="min-w-0 pr-8">
                    <div className="flex items-center space-x-2">
                      <h2 className="text-xl font-bold tracking-tight text-white truncate">
                        {supervisorSeleccionadoModal.nombre_completo || supervisorSeleccionadoModal.nombre_corto}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-400/20 text-sky-200 border border-sky-300/30">
                        Supervisor de Campo
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-sky-100/80 mt-1 font-medium">
                      {supervisorSeleccionadoModal.email && (
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3.5 h-3.5 opacity-80" />
                          <span>{supervisorSeleccionadoModal.email}</span>
                        </span>
                      )}
                      {supervisorSeleccionadoModal.telefono && (
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3.5 h-3.5 opacity-80" />
                          <span>{supervisorSeleccionadoModal.telefono}</span>
                        </span>
                      )}
                      <span className="text-sky-300/60">&bull;</span>
                      <span className="text-sky-200 font-semibold">
                        Período: {periodoSupervisores === 'todos' ? 'Todo el historial' :
                                  periodoSupervisores === 'este_mes' ? 'Este mes' :
                                  periodoSupervisores === 'ultimos_30' ? 'Últimos 30 días' :
                                  periodoSupervisores === 'ultimos_7' ? 'Últimos 7 días' : 'Personalizado'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Métricas Rápidas del Supervisor en el Período */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-5 bg-white border-b border-slate-200/80 shrink-0">
                <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Actas en Período</span>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">{actasTotalPeriodo}</p>
                  <span className="text-[10px] text-slate-500 font-medium">Oficiales emitidas</span>
                </div>

                <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-100">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Favorables</span>
                  <p className="text-2xl font-black text-emerald-700 mt-0.5">{favCount}</p>
                  <span className="text-[10px] text-emerald-600 font-medium">Dictamen conforme</span>
                </div>

                <div className="bg-rose-50/60 rounded-2xl p-3.5 border border-rose-100">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Observadas</span>
                  <p className="text-2xl font-black text-rose-700 mt-0.5">{obsCount}</p>
                  <span className="text-[10px] text-rose-500 font-medium">Con observaciones</span>
                </div>

                <div className="bg-sky-50/60 rounded-2xl p-3.5 border border-sky-100">
                  <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider block">En Trámite</span>
                  <p className="text-2xl font-black text-sky-800 mt-0.5">{supervisorSeleccionadoModal.asignados || 0}</p>
                  <span className="text-[10px] text-sky-600 font-medium">Asignados en curso</span>
                </div>
              </div>

              {/* Barra de Filtros y Búsqueda */}
              <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar por laboratorio, código o municipio..."
                    value={filtroInspTextoModal}
                    onChange={(e) => setFiltroInspTextoModal(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#0077c8]"
                  />
                  {filtroInspTextoModal && (
                    <button
                      type="button"
                      onClick={() => setFiltroInspTextoModal('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtro de Veredicto */}
                <div className="flex items-center space-x-1.5 self-start sm:self-auto overflow-x-auto">
                  {['Todos', 'FAVORABLE', 'OBSERVADO', 'PENDIENTE'].map((ver) => (
                    <button
                      key={ver}
                      type="button"
                      onClick={() => setFiltroInspVeredictoModal(ver)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        filtroInspVeredictoModal === ver
                          ? 'bg-[#0077c8] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {ver === 'Todos' ? 'Todos' :
                       ver === 'FAVORABLE' ? 'Favorables' :
                       ver === 'OBSERVADO' ? 'Observados' : 'En proceso'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lista / Tabla de Inspecciones */}
              <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
                {inspFiltradas.length === 0 ? (
                  <div className="py-14 text-center bg-white rounded-2xl border border-slate-200/80">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-slate-700">No se encontraron inspecciones</h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      No hay registros de inspección que coincidan con los filtros aplicados para este supervisor.
                    </p>
                    {(filtroInspTextoModal || filtroInspVeredictoModal !== 'Todos') && (
                      <button
                        type="button"
                        onClick={() => { setFiltroInspTextoModal(''); setFiltroInspVeredictoModal('Todos'); }}
                        className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
                    {inspFiltradas.map((insp, idx) => {
                      const veredictoUpper = (insp.veredicto || '').toUpperCase();
                      const estadoLower = (insp.estado_inspeccion || '').toLowerCase();
                      const esFavorable = veredictoUpper === 'FAVORABLE' || estadoLower === 'aprobada';
                      const esObservado = veredictoUpper === 'OBSERVADO' || veredictoUpper === 'NO FAVORABLE' || estadoLower === 'observada';

                      return (
                        <div key={insp.id || idx} className="p-4 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                          {/* Info Principal */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-[11px]">
                                {insp.codigo_tramite || 'TRM-S/N'}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{insp.fecha || insp.fecha_iso || 'Sin fecha'}</span>
                              </span>
                              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {insp.tipo_tramite || 'Apertura y Habilitación'}
                              </span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                              <h4 className="font-bold text-slate-900 text-sm truncate">
                                {insp.establecimiento || 'Laboratorio Clínico'}
                              </h4>
                            </div>

                            {insp.municipio && (
                              <div className="flex items-center space-x-1 text-[11px] text-slate-500">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>Municipio: <strong className="text-slate-700">{insp.municipio}</strong></span>
                              </div>
                            )}
                          </div>

                          {/* Estado / Veredicto + Botones de Acción */}
                          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-center">
                            {/* Badge de Veredicto */}
                            <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold border ${
                              esFavorable
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : esObservado
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {esFavorable ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Favorable / Aprobada</span>
                                </>
                              ) : esObservado ? (
                                <>
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Con Observaciones</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{insp.estado_inspeccion || 'En Curso'}</span>
                                </>
                              )}
                            </span>

                            {/* Botón Ver Acta Firmada */}
                            {insp.acta_pdf_url && (
                              <a
                                href={
                                  insp.acta_pdf_url.startsWith('http')
                                    ? insp.acta_pdf_url
                                    : `http://localhost:8000/${insp.acta_pdf_url.replace(/^\/+/, '')}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-xs"
                                title="Ver Acta Oficial de Inspección Firmada en PDF"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                <span>Ver Acta Firmada</span>
                              </a>
                            )}

                            {/* Botón Ver Expediente */}
                            <button
                              type="button"
                              onClick={() => handleAbrirExpedienteBitacora(insp.tramite_id || insp.codigo_tramite)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-[#0077c8] hover:text-white text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 border border-slate-200 cursor-pointer"
                              title="Abrir Expediente Digital Completo"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Expediente</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pie del Modal */}
              <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
                <span className="text-slate-500 font-medium">
                  Mostrando <strong className="text-slate-800">{inspFiltradas.length}</strong> de <strong className="text-slate-800">{listaInsp.length}</strong> inspecciones registradas.
                </span>
                <button
                  type="button"
                  onClick={() => setModalSupervisorOpen(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                >
                  Cerrar
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}