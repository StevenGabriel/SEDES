import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FileText,
  Award,
  History,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  User,
  MapPin,
  ShieldCheck,
  Send,
  Download,
  Printer,
  Edit3,
  Edit2,
  Check,
  X,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Search,
  Filter,
  Eye,
  LogOut,
  Bell,
  Menu,
  FileCheck,
  ExternalLink,
  Lock,
  FlaskConical
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import logoL1 from '../assets/L1.png';
import logoL2 from '../assets/L2.png';
import { generarComunicacionInternaPDF } from '../components/coordinador/ComunicacionInternaPDF';
import { generarResolucionAdministrativaPDF } from '../components/abogado/ResolucionAdministrativaPDF';

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

export default function AbogadoPage() {
  const navigate = useNavigate();
  const { seccion } = useParams();

  const SECCIONES_VALIDAS = ['informes-recibidos', 'resolucion-administrativa', 'historial'];
  const seccionActiva = SECCIONES_VALIDAS.includes(seccion) ? seccion : 'informes-recibidos';

  const menuItems = [
    {
      id: 'informes-recibidos',
      path: '/abogado/informes-recibidos',
      label: 'Informes Recibidos',
      icon: FileText
    },
    {
      id: 'resolucion-administrativa',
      path: '/abogado/resolucion-administrativa',
      label: 'Resolución Administrativa',
      icon: Award
    },
    {
      id: 'historial',
      path: '/abogado/historial',
      label: 'Historial',
      icon: History
    }
  ];

  // Estado del usuario y menú
  const [usuario, setUsuario] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Lista de informes/trámites
  const [informes, setInformes] = useState([]);
  const [cargandoInformes, setCargandoInformes] = useState(true);
  const [tramiteSeleccionadoId, setTramiteSeleccionadoId] = useState(null);

  // Detalle del Informe Técnico (Vista 1)
  const [detalleInforme, setDetalleInforme] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [observacionesCoordinadorEdicion, setObservacionesCoordinadorEdicion] = useState('');
  const [dictamenSeleccionado, setDictamenSeleccionado] = useState('Favorabilidad Concedida (Favorable)');
  const [pdfInformeBlobUrl, setPdfInformeBlobUrl] = useState(null);
  const [generandoPdfInforme, setGenerandoPdfInforme] = useState(false);
  const [tabInformeActiva, setTabInformeActiva] = useState('pdf'); // 'pdf' | 'ficha'

  // Borrador de Resolución Administrativa (Vista 2)
  const [borradorResolucion, setBorradorResolucion] = useState(null);
  const [cargandoBorrador, setCargandoBorrador] = useState(false);
  const [guardandoResolucion, setGuardandoResolucion] = useState(false);
  const [enviandoCoordinador, setEnviandoCoordinador] = useState(false);

  // Campos Editables de la Resolución (Vista 2)
  const [editNumeroResolucion, setEditNumeroResolucion] = useState('55/2026');
  const [editFechaEmision, setEditFechaEmision] = useState('18 de septiembre del 2026');
  const [editEstablecimiento, setEditEstablecimiento] = useState('');
  const [editRazonSocial, setEditRazonSocial] = useState('');
  const [editCiNit, setEditCiNit] = useState('');
  const [editRegente, setEditRegente] = useState('');
  const [editCiRegente, setEditCiRegente] = useState('');
  const [editTipoEstablecimiento, setEditTipoEstablecimiento] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [editAntecedentes, setEditAntecedentes] = useState('');
  const [editFundamentoLegal, setEditFundamentoLegal] = useState('');
  const [editArticuloPrimero, setEditArticuloPrimero] = useState('');
  const [editArticuloSegundo, setEditArticuloSegundo] = useState('');
  const [editArticuloTercero, setEditArticuloTercero] = useState('');
  const [editObservacionesLegales, setEditObservacionesLegales] = useState('');
  const [editVigenciaRango, setEditVigenciaRango] = useState('18 de Septiembre de 2026 - 18 de Septiembre de 2031');

  // PDF Preview y Pestaña Activa en la Resolución Administrativa (Vista 2)
  const [pdfResolucionBlobUrl, setPdfResolucionBlobUrl] = useState(null);
  const [generandoPdfResolucion, setGenerandoPdfResolucion] = useState(false);
  const [tabResolucionActiva, setTabResolucionActiva] = useState('pdf'); // 'pdf' | 'editor'
  const pdfResolucionUrlRef = useRef(null);
  const pdfInformeUrlRef = useRef(null);

  // Limpieza de URLs blob al desmontar componente
  useEffect(() => {
    return () => {
      if (pdfResolucionUrlRef.current) {
        URL.revokeObjectURL(pdfResolucionUrlRef.current);
      }
      if (pdfInformeUrlRef.current) {
        URL.revokeObjectURL(pdfInformeUrlRef.current);
      }
    };
  }, []);

  // Historial de Resoluciones (Vista 3)
  const [historialList, setHistorialList] = useState([]);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);
  const [busquedaHistorial, setBusquedaHistorial] = useState('');
  const [filtroEstadoHistorial, setFiltroEstadoHistorial] = useState('Todos');

  // Helper Toast
  const mostrarToast = (mensaje, tipo = 'info') => {
    setToast({ mensaje, tipo });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Cargar usuario en sesión
  useEffect(() => {
    const rawUser = localStorage.getItem('usuario');
    if (rawUser) {
      try {
        const u = JSON.parse(rawUser);
        setUsuario(u);
      } catch (err) {
        console.warn('Error al parsear usuario:', err);
      }
    } else {
      // Datos por defecto del Asesor Legal según Figma
      setUsuario({
        nombres: 'Dr. Marco',
        apellidos: 'Villanueva',
        email: 'abogado@sedes.gob.bo',
        cargo: 'Asesor Legal SEDES',
        rol_nombre: 'Abogado'
      });
    }
  }, []);

  // Cargar historial de resoluciones y dictámenes reales
  const cargarHistorial = useCallback(async (searchQuery = '', estado = 'Todos') => {
    setCargandoHistorial(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery && searchQuery.trim()) params.append('search', searchQuery.trim());
      if (estado && estado !== 'Todos') params.append('estado_filtro', estado);
      const res = await fetch(`http://localhost:8000/api/abogado/historial?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setHistorialList(data.resoluciones || []);
      }
    } catch (err) {
      console.warn('Error al cargar historial:', err);
    } finally {
      setCargandoHistorial(false);
    }
  }, []);

  useEffect(() => {
    cargarHistorial(busquedaHistorial, filtroEstadoHistorial);
  }, [cargarHistorial, busquedaHistorial, filtroEstadoHistorial, seccionActiva]);

  // 1. Cargar lista de informes reales desde el backend
  const cargarInformes = useCallback(async () => {
    setCargandoInformes(true);
    try {
      const res = await fetch('http://localhost:8000/api/abogado/informes');
      if (res.ok) {
        const data = await res.json();
        const lista = data.informes || [];
        setInformes(lista);
        if (lista.length > 0) {
          setTramiteSeleccionadoId(prev => {
            const existe = lista.find(x => x.id === prev);
            return existe ? prev : lista[0].id;
          });
        } else {
          setTramiteSeleccionadoId(null);
          setDetalleInforme(null);
          setBorradorResolucion(null);
        }
      }
    } catch (err) {
      console.warn('Error al cargar informes:', err);
    } finally {
      setCargandoInformes(false);
    }
  }, []);

  useEffect(() => {
    cargarInformes();
  }, [cargarInformes]);

  // 2. Cargar detalle del informe seleccionado (para Vista 1 e inicializar Vista 2)
  const cargarDetalleInforme = useCallback(async (tId) => {
    if (!tId) {
      setDetalleInforme(null);
      return;
    }
    setCargandoDetalle(true);
    try {
      const res = await fetch(`http://localhost:8000/api/abogado/informe/${encodeURIComponent(tId)}`);
      if (res.ok) {
        const data = await res.json();
        setDetalleInforme(data);
        setObservacionesCoordinadorEdicion(data.observaciones_coordinador || '');
        setDictamenSeleccionado(data.dictamen_final || 'Favorabilidad Concedida (Favorable)');
      } else {
        setDetalleInforme(null);
      }
    } catch (err) {
      console.warn('Error al cargar detalle de informe:', err);
      setDetalleInforme(null);
    } finally {
      setCargandoDetalle(false);
    }
  }, []);

  // Helper builders para generar textos jurídicos estandarizados y en sincronía
  const construirVistos = (propietario, ci, regente, ciReg, estab, dir, tramite, fecha) => {
    return `La solicitud presentada en fecha ${fecha || '18 de septiembre del 2026'}, de propiedad del ${(propietario || 'SR. PROPIETARIO REGISTRADO').toUpperCase()}, representado por el titular con C.I. Nº ${ci || ''}, siendo Responsable Técnica la profesional ${(regente || propietario || 'PROFESIONAL').toUpperCase()} con C.I. Nº ${ciReg || ci || ''}, quien solicita a la Señora Directora Departamental de Salud, la Resolución Administrativa de ${(tramite || 'APERTURA Y HABILITACIÓN').toUpperCase()} del ${(estab || 'LABORATORIO CLÍNICO').toUpperCase()}, ubicado en ${dir || 'Cochabamba'}, del Departamento de Cochabamba, y demás antecedentes.`;
  };

  const construirFundamentoLegal = (estab, tipoEst, regente, ciReg, tramite, cite, fechaInforme, coord) => {
    return `Que, asimismo el Servicio Departamental de Salud Cochabamba regido por el D.S. 25233 establece la Estructura de los SEDES, ejerciendo como Autoridad Sanitaria y velando por la calidad de los servicios de salud a cargo de prestadores públicos y privados. Asimismo conforme la Resolución Ministerial Nº 0202 del 22.03.2010 que aprueba el Reglamento General para la Habilitación y Funcionamiento de Laboratorios. El Informe Técnico de fecha ${fechaInforme || '18 de septiembre del 2026'} con No. CITE: ${cite || 'CODELAB/SEDES/71/2026'}, en la que la Responsable CODELAB, ${coord || 'Dra. Claudia Morales Valenzuela'}, concluye que es procedente la ${(tramite || 'APERTURA Y HABILITACIÓN').toUpperCase()} del establecimiento ${(estab || 'LABORATORIO CLÍNICO').toUpperCase()}, ${tipoEst || 'LABORATORIO CLÍNICO PÚBLICO'}, quedando como regente técnica la profesional ${(regente || 'PROFESIONAL').toUpperCase()} con C.I. Nº ${ciReg || ''}.`;
  };

  const construirArticuloPrimero = (tramite, estab, tipoEst, dir, propietario, ci, regente, ciReg) => {
    return `Autorizar la ${(tramite || 'APERTURA Y HABILITACIÓN').toUpperCase()} del establecimiento de salud denominado ${(estab || 'LABORATORIO CLÍNICO').toUpperCase()}, ${tipoEst || 'LABORATORIO CLÍNICO PÚBLICO'}, ubicado en ${dir || 'Cochabamba'}, representado por el titular D./Dña. ${(propietario || 'TITULAR').toUpperCase()} con C.I. Nº ${ci || ''}, bajo la regencia técnica de la profesional ${(regente || propietario || 'PROFESIONAL').toUpperCase()} con C.I. Nº ${ciReg || ci || ''}.`;
  };

  const construirArticuloSegundo = (anios, vigencia) => {
    return `Asimismo se hace constar que la presente resolución administrativa tiene vigencia de ${anios || 5} años a partir de la emisión de la presente resolución (${vigencia || '18 de Septiembre de 2026 - 18 de Septiembre de 2031'}).`;
  };

  // 3. Cargar borrador de resolución administrativa (para Vista 2)
  const cargarBorradorResolucion = useCallback(async (tId) => {
    if (!tId) {
      setBorradorResolucion(null);
      return;
    }
    setCargandoBorrador(true);
    try {
      const res = await fetch(`http://localhost:8000/api/abogado/resolucion-borrador/${encodeURIComponent(tId)}`);
      if (res.ok) {
        const data = await res.json();
        setBorradorResolucion(data);
        const numRA = data.numero_resolucion || '55/2026';
        const fechaEm = data.fecha_emision || '21 Sep 2026';
        const de = data.datos_establecimiento || {};
        const est = de.establecimiento || '';
        const prop = de.razon_social || '';
        const ciProp = de.ci_nit || '';
        const reg = de.regente || de.razon_social || '';
        const ciReg = de.ci_regente || de.ci_nit || '';
        const tipoEst = de.tipo_establecimiento || 'LABORATORIO CLÍNICO PÚBLICO';
        const dir = de.direccion || '';
        const tram = data.tipo_tramite || 'APERTURA Y HABILITACIÓN';
        const citeInf = de.cite_informe || 'CODELAB/SEDES/71/2026';
        const fechaInf = de.fecha_informe || fechaEm;
        const vigRango = data.vigencia_rango || '18 de Septiembre de 2026 - 18 de Septiembre de 2031';

        setEditNumeroResolucion(numRA);
        setEditFechaEmision(fechaEm);
        setEditEstablecimiento(est);
        setEditRazonSocial(prop);
        setEditCiNit(ciProp);
        setEditRegente(reg);
        setEditCiRegente(ciReg);
        setEditTipoEstablecimiento(tipoEst);
        setEditDireccion(dir);
        setEditVigenciaRango(vigRango);

        setEditAntecedentes(data.antecedentes || construirVistos(prop, ciProp, reg, ciReg, est, dir, tram, fechaInf));
        setEditFundamentoLegal(data.fundamento_legal || construirFundamentoLegal(est, tipoEst, reg, ciReg, tram, citeInf, fechaInf, 'Dra. Claudia Morales Valenzuela'));
        setEditArticuloPrimero(data.articulo_primero || construirArticuloPrimero(tram, est, tipoEst, dir, prop, ciProp, reg, ciReg));
        setEditArticuloSegundo(data.articulo_segundo || construirArticuloSegundo(5, vigRango));
        setEditArticuloTercero(data.articulo_tercero || 'El establecimiento queda sujeto a las normas sanitarias vigentes y a las inspecciones periódicas de control que la Autoridad Departamental de Salud considere pertinentes.');
        setEditObservacionesLegales(data.observaciones_legales || '');
      } else {
        setBorradorResolucion(null);
      }
    } catch (err) {
      console.warn('Error al cargar borrador de resolución:', err);
      setBorradorResolucion(null);
    } finally {
      setCargandoBorrador(false);
    }
  }, []);

  // Handlers para edición en vivo de campos con sincronización de textos y PDF
  const handleCambioEstablecimiento = (val) => {
    setEditEstablecimiento(val);
    setEditAntecedentes(construirVistos(editRazonSocial, editCiNit, editRegente, editCiRegente, val, editDireccion, detalleInforme?.tipo_tramite, editFechaEmision));
    setEditFundamentoLegal(construirFundamentoLegal(val, editTipoEstablecimiento, editRegente, editCiRegente, detalleInforme?.tipo_tramite, borradorResolucion?.datos_establecimiento?.cite_informe, editFechaEmision, 'Dra. Claudia Morales Valenzuela'));
    setEditArticuloPrimero(construirArticuloPrimero(detalleInforme?.tipo_tramite, val, editTipoEstablecimiento, editDireccion, editRazonSocial, editCiNit, editRegente, editCiRegente));
  };

  const handleCambioPropietario = (val) => {
    setEditRazonSocial(val);
    setEditAntecedentes(construirVistos(val, editCiNit, editRegente, editCiRegente, editEstablecimiento, editDireccion, detalleInforme?.tipo_tramite, editFechaEmision));
    setEditArticuloPrimero(construirArticuloPrimero(detalleInforme?.tipo_tramite, editEstablecimiento, editTipoEstablecimiento, editDireccion, val, editCiNit, editRegente, editCiRegente));
  };

  const handleCambioCiNit = (val) => {
    setEditCiNit(val);
    setEditAntecedentes(construirVistos(editRazonSocial, val, editRegente, editCiRegente, editEstablecimiento, editDireccion, detalleInforme?.tipo_tramite, editFechaEmision));
    setEditArticuloPrimero(construirArticuloPrimero(detalleInforme?.tipo_tramite, editEstablecimiento, editTipoEstablecimiento, editDireccion, editRazonSocial, val, editRegente, editCiRegente));
  };

  const handleCambioRegente = (val) => {
    setEditRegente(val);
    setEditAntecedentes(construirVistos(editRazonSocial, editCiNit, val, editCiRegente, editEstablecimiento, editDireccion, detalleInforme?.tipo_tramite, editFechaEmision));
    setEditFundamentoLegal(construirFundamentoLegal(editEstablecimiento, editTipoEstablecimiento, val, editCiRegente, detalleInforme?.tipo_tramite, borradorResolucion?.datos_establecimiento?.cite_informe, editFechaEmision, 'Dra. Claudia Morales Valenzuela'));
    setEditArticuloPrimero(construirArticuloPrimero(detalleInforme?.tipo_tramite, editEstablecimiento, editTipoEstablecimiento, editDireccion, editRazonSocial, editCiNit, val, editCiRegente));
  };

  const handleCambioCiRegente = (val) => {
    setEditCiRegente(val);
    setEditAntecedentes(construirVistos(editRazonSocial, editCiNit, editRegente, val, editEstablecimiento, editDireccion, detalleInforme?.tipo_tramite, editFechaEmision));
    setEditFundamentoLegal(construirFundamentoLegal(editEstablecimiento, editTipoEstablecimiento, editRegente, val, detalleInforme?.tipo_tramite, borradorResolucion?.datos_establecimiento?.cite_informe, editFechaEmision, 'Dra. Claudia Morales Valenzuela'));
    setEditArticuloPrimero(construirArticuloPrimero(detalleInforme?.tipo_tramite, editEstablecimiento, editTipoEstablecimiento, editDireccion, editRazonSocial, editCiNit, editRegente, val));
  };

  const handleCambioDireccion = (val) => {
    setEditDireccion(val);
    setEditAntecedentes(construirVistos(editRazonSocial, editCiNit, editRegente, editCiRegente, editEstablecimiento, val, detalleInforme?.tipo_tramite, editFechaEmision));
    setEditArticuloPrimero(construirArticuloPrimero(detalleInforme?.tipo_tramite, editEstablecimiento, editTipoEstablecimiento, val, editRazonSocial, editCiNit, editRegente, editCiRegente));
  };

  const handleCambioTipoEstablecimiento = (val) => {
    setEditTipoEstablecimiento(val);
    setEditFundamentoLegal(construirFundamentoLegal(editEstablecimiento, val, editRegente, editCiRegente, detalleInforme?.tipo_tramite, borradorResolucion?.datos_establecimiento?.cite_informe, editFechaEmision, 'Dra. Claudia Morales Valenzuela'));
    setEditArticuloPrimero(construirArticuloPrimero(detalleInforme?.tipo_tramite, editEstablecimiento, val, editDireccion, editRazonSocial, editCiNit, editRegente, editCiRegente));
  };

  const handleCambioFechaEmision = (val) => {
    setEditFechaEmision(val);
    setEditAntecedentes(construirVistos(editRazonSocial, editCiNit, editRegente, editCiRegente, editEstablecimiento, editDireccion, detalleInforme?.tipo_tramite, val));
  };

  const handleCambioVigenciaRango = (val) => {
    setEditVigenciaRango(val);
    setEditArticuloSegundo(construirArticuloSegundo(5, val));
  };

  // Efecto al cambiar de trámite seleccionado
  useEffect(() => {
    if (tramiteSeleccionadoId) {
      cargarDetalleInforme(tramiteSeleccionadoId);
      cargarBorradorResolucion(tramiteSeleccionadoId);
    }
  }, [tramiteSeleccionadoId, cargarDetalleInforme, cargarBorradorResolucion]);

  // Generar dinámicamente la vista previa en PDF del Informe Técnico (Comunicación Interna)
  useEffect(() => {
    let activo = true;

    const generarPdf = async () => {
      if (!detalleInforme) {
        if (pdfInformeUrlRef.current) {
          URL.revokeObjectURL(pdfInformeUrlRef.current);
          pdfInformeUrlRef.current = null;
        }
        setPdfInformeBlobUrl(null);
        return;
      }

      setGenerandoPdfInforme(true);
      try {
        const tramiteParaPdf = {
          id: detalleInforme.tramite_id,
          codigo: detalleInforme.codigo,
          establecimiento: detalleInforme.establecimiento_nombre,
          nombre_comercial: detalleInforme.establecimiento_nombre,
          propietario: detalleInforme.razon_social_propietario,
          representante_legal: detalleInforme.razon_social_propietario,
          ci_nit: detalleInforme.ci_nit_solicitante,
          tipo: detalleInforme.tipo_tramite,
          direccion: detalleInforme.direccion,
          supervisorAsignado: detalleInforme.inspeccion_campo?.supervisor || 'Supervisor de Área SEDES',
          fechaInspeccion: detalleInforme.inspeccion_campo?.fecha || '18/09/2026',
          documentosAprobados: (detalleInforme.documentacion_legal || [])
            .filter(d => d.aprobado)
            .map(d => d.nombre),
          resultadoGeneral: detalleInforme.inspeccion_campo?.resultado || 'Favorable (Cumple con estándares vigentes de bioseguridad)',
          observacionesCampo: detalleInforme.inspeccion_campo?.observaciones || 'Infraestructura adecuada, manejo de residuos patógenos correcto y señalización de seguridad implementada.',
          regente: detalleInforme.razon_social_propietario,
          observaciones_coordinador: observacionesCoordinadorEdicion || detalleInforme.observaciones_coordinador
        };

        const doc = await generarComunicacionInternaPDF(tramiteParaPdf, {
          cite: detalleInforme.cite_informe || `CODELAB/SEDES/${(detalleInforme.codigo || '71').replace('REQ-', '')}/2026`,
          destinatario: detalleInforme.destinatario_informe ? detalleInforme.destinatario_informe.split(' - ')[0] : (usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos || ''}`.trim() : 'Dr. Marco Villanueva'),
          destinatarioCargo: detalleInforme.destinatario_informe && detalleInforme.destinatario_informe.includes(' - ') ? detalleInforme.destinatario_informe.split(' - ')[1] : 'ASESOR LEGAL - UNIDAD DE HABILITACIÓN SEDES',
          via: 'Dra. Karina Soliz Villarroel',
          viaCargo: 'JEFE DE LA UNIDAD DE CALIDAD Y SERVICIOS a.i.',
          remitente: detalleInforme.coordinador_nombre || 'Dra. Claudia Morales Valenzuela',
          remitenteCargo: 'RESPONSABLE DEPARTAMENTAL DE LABORATORIOS CODELAB - SEDES',
          regente: detalleInforme.regente_tecnico || detalleInforme.razon_social_propietario,
          ciRegente: detalleInforme.ci_regente || detalleInforme.ci_nit_solicitante,
          observaciones: observacionesCoordinadorEdicion || detalleInforme.observaciones_coordinador
        });

        if (!activo) return;
        const blob = doc.output('blob');
        const nuevaUrl = URL.createObjectURL(blob);
        if (pdfInformeUrlRef.current) {
          URL.revokeObjectURL(pdfInformeUrlRef.current);
        }
        pdfInformeUrlRef.current = nuevaUrl;
        setPdfInformeBlobUrl(nuevaUrl);
      } catch (err) {
        console.error('Error generando PDF de Informe Técnico en Abogado:', err);
      } finally {
        if (activo) setGenerandoPdfInforme(false);
      }
    };

    generarPdf();

    return () => {
      activo = false;
    };
  }, [detalleInforme, observacionesCoordinadorEdicion, usuario]);

  // Generar dinámicamente la vista previa en PDF de la Resolución Administrativa Oficial con Debounce
  useEffect(() => {
    let activo = true;

    const actualizarPdfRA = async () => {
      if (!borradorResolucion && !editEstablecimiento) {
        if (pdfResolucionUrlRef.current) {
          URL.revokeObjectURL(pdfResolucionUrlRef.current);
          pdfResolucionUrlRef.current = null;
        }
        setPdfResolucionBlobUrl(null);
        return;
      }

      setGenerandoPdfResolucion(true);
      try {
        const datosParaPdf = {
          numero_resolucion: editNumeroResolucion,
          fecha_emision: editFechaEmision,
          establecimiento: editEstablecimiento,
          establecimiento_nombre: editEstablecimiento,
          propietario: editRazonSocial,
          razon_social: editRazonSocial,
          razon_social_propietario: editRazonSocial,
          ci_nit: editCiNit,
          ci_nit_solicitante: editCiNit,
          regente: editRegente || editRazonSocial,
          regente_nombre: editRegente || editRazonSocial,
          ci_regente: editCiRegente || editCiNit,
          tipo_tramite: detalleInforme?.tipo_tramite || 'APERTURA Y HABILITACIÓN',
          direccion: editDireccion,
          direccion_registrada: editDireccion,
          tipo_establecimiento: editTipoEstablecimiento,
          cite_informe: borradorResolucion?.datos_establecimiento?.cite_informe || detalleInforme?.cite_informe || 'CODELAB/SEDES/71/2026',
          fecha_informe: borradorResolucion?.datos_establecimiento?.fecha_informe || detalleInforme?.fecha_informe || editFechaEmision,
          coordinador_nombre: borradorResolucion?.datos_establecimiento?.coordinador_nombre || detalleInforme?.coordinador_nombre || 'Dra. Claudia Morales Valenzuela',
          abogado_nombre: usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos || ''}`.trim() : 'Dr. Marco Villanueva',
          vigencia_anios: 5,
          vigencia_rango: editVigenciaRango,
          antecedentes: editAntecedentes,
          vistos: editAntecedentes,
          fundamento_legal: editFundamentoLegal,
          articulo_primero: editArticuloPrimero,
          articulo_segundo: editArticuloSegundo,
          articulo_tercero: editArticuloTercero,
          observaciones_legales: editObservacionesLegales
        };

        const doc = await generarResolucionAdministrativaPDF(datosParaPdf);

        if (!activo) return;
        const blob = doc.output('blob');
        const nuevaUrl = URL.createObjectURL(blob);
        if (pdfResolucionUrlRef.current) {
          URL.revokeObjectURL(pdfResolucionUrlRef.current);
        }
        pdfResolucionUrlRef.current = nuevaUrl;
        setPdfResolucionBlobUrl(nuevaUrl);
      } catch (err) {
        console.error('Error generando PDF en vivo de Resolución:', err);
      } finally {
        if (activo) setGenerandoPdfResolucion(false);
      }
    };

    const timer = setTimeout(actualizarPdfRA, 100);

    return () => {
      activo = false;
      clearTimeout(timer);
    };
  }, [
    borradorResolucion,
    editNumeroResolucion,
    editFechaEmision,
    editEstablecimiento,
    editRazonSocial,
    editCiNit,
    editRegente,
    editCiRegente,
    editTipoEstablecimiento,
    editDireccion,
    editAntecedentes,
    editFundamentoLegal,
    editArticuloPrimero,
    editArticuloSegundo,
    editArticuloTercero,
    editObservacionesLegales,
    editVigenciaRango,
    detalleInforme,
    usuario
  ]);

  // Descargar el PDF oficial del Informe Técnico
  const handleDescargarInformePDF = async () => {
    if (!detalleInforme) return;
    try {
      const tramiteParaPdf = {
        id: detalleInforme.tramite_id,
        codigo: detalleInforme.codigo,
        establecimiento: detalleInforme.establecimiento_nombre,
        nombre_comercial: detalleInforme.establecimiento_nombre,
        propietario: detalleInforme.razon_social_propietario,
        representante_legal: detalleInforme.razon_social_propietario,
        ci_nit: detalleInforme.ci_nit_solicitante,
        tipo: detalleInforme.tipo_tramite,
        direccion: detalleInforme.direccion,
        supervisorAsignado: detalleInforme.inspeccion_campo?.supervisor || 'Supervisor de Área SEDES',
        fechaInspeccion: detalleInforme.inspeccion_campo?.fecha || '18/09/2026',
        documentosAprobados: (detalleInforme.documentacion_legal || [])
          .filter(d => d.aprobado)
          .map(d => d.nombre),
        resultadoGeneral: detalleInforme.inspeccion_campo?.resultado || 'Favorable (Cumple con estándares vigentes de bioseguridad)',
        observacionesCampo: detalleInforme.inspeccion_campo?.observaciones || 'Infraestructura adecuada, manejo de residuos patógenos correcto y señalización de seguridad implementada.',
        regente: detalleInforme.razon_social_propietario,
        observaciones_coordinador: observacionesCoordinadorEdicion || detalleInforme.observaciones_coordinador
      };

      const doc = await generarComunicacionInternaPDF(tramiteParaPdf, {
        cite: detalleInforme.cite_informe || `CODELAB/SEDES/${(detalleInforme.codigo || '71').replace('REQ-', '')}/2026`,
        destinatario: detalleInforme.destinatario_informe ? detalleInforme.destinatario_informe.split(' - ')[0] : (usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos || ''}`.trim() : 'Dr. Marco Villanueva'),
        destinatarioCargo: detalleInforme.destinatario_informe && detalleInforme.destinatario_informe.includes(' - ') ? detalleInforme.destinatario_informe.split(' - ')[1] : 'ASESOR LEGAL - UNIDAD DE HABILITACIÓN SEDES',
        via: 'Dra. Karina Soliz Villarroel',
        viaCargo: 'JEFE DE LA UNIDAD DE CALIDAD Y SERVICIOS a.i.',
        remitente: detalleInforme.coordinador_nombre || 'Dra. Claudia Morales Valenzuela',
        remitenteCargo: 'RESPONSABLE DEPARTAMENTAL DE LABORATORIOS CODELAB - SEDES',
        regente: detalleInforme.regente_tecnico || detalleInforme.razon_social_propietario,
        ciRegente: detalleInforme.ci_regente || detalleInforme.ci_nit_solicitante,
        observaciones: observacionesCoordinadorEdicion || detalleInforme.observaciones_coordinador
      });

      doc.save(`Informe_Tecnico_${detalleInforme.codigo || 'SEDES'}.pdf`);
      mostrarToast(`Informe Técnico descargado exitosamente.`, 'success');
    } catch (e) {
      mostrarToast('Error al descargar el PDF del Informe Técnico.', 'warning');
    }
  };

  // Abrir el PDF oficial en pestaña completa
  const handleAbrirInformePDFNuevaPestana = () => {
    if (pdfInformeBlobUrl) {
      window.open(pdfInformeBlobUrl, '_blank');
    }
  };

  // Transicionar de Vista 1 a Vista 2 (Generar Resolución Administrativa)
  const handleIrAGenerarResolucion = () => {
    navigate('/abogado/resolucion-administrativa');
    mostrarToast('Listo para editar y generar la Resolución Administrativa.', 'info');
  };

  // Guardar modificaciones del borrador en el Backend
  const handleGuardarBorrador = async () => {
    if (!borradorResolucion || !borradorResolucion.tramite_id) {
      mostrarToast('No hay un trámite seleccionado para guardar.', 'warning');
      return;
    }
    setGuardandoResolucion(true);
    try {
      const payload = {
        tramite_id: borradorResolucion.tramite_id,
        numero_resolucion: editNumeroResolucion,
        fecha_emision: editFechaEmision,
        establecimiento_nombre: editEstablecimiento,
        razon_social_propietario: editRazonSocial,
        ci_nit_solicitante: editCiNit,
        tipo_establecimiento: editTipoEstablecimiento,
        direccion_registrada: editDireccion,
        regente: editRegente,
        ci_regente: editCiRegente,
        tipo_tramite: detalleInforme?.tipo_tramite || 'APERTURA Y HABILITACIÓN',
        cite_informe: borradorResolucion?.datos_establecimiento?.cite_informe || 'CODELAB/SEDES/71/2026',
        fecha_informe: borradorResolucion?.datos_establecimiento?.fecha_informe || editFechaEmision,
        antecedentes: editAntecedentes,
        vistos: editAntecedentes,
        fundamento_legal: editFundamentoLegal,
        articulo_primero: editArticuloPrimero,
        articulo_segundo: editArticuloSegundo,
        articulo_tercero: editArticuloTercero,
        vigencia_rango: editVigenciaRango,
        observaciones_legales: editObservacionesLegales,
        observaciones_coordinador: observacionesCoordinadorEdicion,
        dictamen_final: dictamenSeleccionado
      };

      const res = await fetch('http://localhost:8000/api/abogado/guardar-resolucion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        mostrarToast('Borrador y modificaciones guardadas con éxito.', 'success');
        cargarBorradorResolucion(borradorResolucion.tramite_id);
      } else {
        mostrarToast('Error al guardar las modificaciones.', 'warning');
      }
    } catch (err) {
      console.error('Error guardando resolución:', err);
      mostrarToast('Error de conexión al guardar.', 'warning');
    } finally {
      setGuardandoResolucion(false);
    }
  };

  // Enviar resolución final al Coordinador para firma y archivo
  const handleEnviarAlCoordinador = async () => {
    if (!borradorResolucion || !borradorResolucion.tramite_id) {
      mostrarToast('No hay un trámite seleccionado para enviar.', 'warning');
      return;
    }
    setEnviandoCoordinador(true);
    try {
      const payload = {
        tramite_id: borradorResolucion.tramite_id,
        numero_resolucion: editNumeroResolucion,
        fecha_emision: editFechaEmision,
        establecimiento_nombre: editEstablecimiento,
        razon_social_propietario: editRazonSocial,
        ci_nit_solicitante: editCiNit,
        tipo_establecimiento: editTipoEstablecimiento,
        direccion_registrada: editDireccion,
        antecedentes: editAntecedentes,
        fundamento_legal: editFundamentoLegal,
        articulo_primero: editArticuloPrimero,
        articulo_segundo: editArticuloSegundo,
        articulo_tercero: editArticuloTercero,
        vigencia_rango: editVigenciaRango,
        observaciones_legales: editObservacionesLegales,
        observaciones: editObservacionesLegales,
        abogado_nombre: usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos || ''}`.trim() : 'Dr. Marco Villanueva'
      };

      const res = await fetch('http://localhost:8000/api/abogado/enviar-coordinador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        mostrarToast('Resolución Administrativa remitida exitosamente al Coordinador.', 'success');
        await cargarInformes();
        await cargarHistorial();
        navigate('/abogado/historial');
      } else {
        mostrarToast('Error al enviar la resolución al Coordinador.', 'warning');
      }
    } catch (err) {
      console.error('Error enviando al coordinador:', err);
      mostrarToast('Error de conexión al enviar.', 'warning');
    } finally {
      setEnviandoCoordinador(false);
    }
  };

  // Descargar PDF de una Resolución específica del Historial
  const handleDescargarResolucionHistorial = async (h) => {
    try {
      const res = await fetch(`http://localhost:8000/api/abogado/resolucion-borrador/${encodeURIComponent(h.tramite_id || h.id)}`);
      let datosParaPdf;
      if (res.ok) {
        const data = await res.json();
        const de = data.datos_establecimiento || {};
        datosParaPdf = {
          numero_resolucion: data.numero_resolucion || h.numero_resolucion,
          fecha_emision: data.fecha_emision || h.fecha_emision,
          establecimiento: de.establecimiento || h.establecimiento,
          establecimiento_nombre: de.establecimiento || h.establecimiento,
          propietario: de.razon_social || h.propietario,
          razon_social: de.razon_social || h.propietario,
          razon_social_propietario: de.razon_social || h.propietario,
          ci_nit: de.ci_nit || '',
          ci_nit_solicitante: de.ci_nit || '',
          regente: de.regente || h.propietario,
          regente_nombre: de.regente || h.propietario,
          ci_regente: de.ci_regente || de.ci_nit || '',
          tipo_tramite: h.tipo_tramite || 'APERTURA Y HABILITACIÓN',
          direccion: de.direccion || '',
          direccion_registrada: de.direccion || '',
          tipo_establecimiento: de.tipo_establecimiento || 'LABORATORIO CLÍNICO PÚBLICO',
          cite_informe: de.cite_informe || 'CODELAB/SEDES/71/2026',
          fecha_informe: de.fecha_informe || data.fecha_emision,
          coordinador_nombre: de.coordinador_nombre || 'Dra. Claudia Morales Valenzuela',
          abogado_nombre: usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos || ''}`.trim() : 'Dr. Marco Villanueva',
          vigencia_anios: 5,
          vigencia_rango: data.vigencia_rango || '18 de Septiembre de 2026 - 18 de Septiembre de 2031',
          antecedentes: data.antecedentes,
          vistos: data.antecedentes,
          fundamento_legal: data.fundamento_legal,
          articulo_primero: data.articulo_primero,
          articulo_segundo: data.articulo_segundo,
          articulo_tercero: data.articulo_tercero,
          observaciones_legales: data.observaciones_legales
        };
      } else {
        datosParaPdf = {
          numero_resolucion: h.numero_resolucion,
          fecha_emision: h.fecha_emision,
          establecimiento: h.establecimiento,
          establecimiento_nombre: h.establecimiento,
          propietario: h.propietario,
          razon_social: h.propietario,
          tipo_tramite: h.tipo_tramite,
          abogado_nombre: usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos || ''}`.trim() : 'Dr. Marco Villanueva'
        };
      }
      const doc = await generarResolucionAdministrativaPDF(datosParaPdf);
      const cleanNum = (h.numero_resolucion || 'RA-2026').replace(/\//g, '_');
      doc.save(`Resolucion_Administrativa_${cleanNum}.pdf`);
      mostrarToast(`Resolución ${h.numero_resolucion} descargada con éxito.`, 'success');
    } catch (err) {
      console.error('Error descargando PDF de historial:', err);
      mostrarToast('Error al descargar el PDF de la Resolución.', 'warning');
    }
  };

  // Descargar la Resolución Administrativa Oficial en PDF (2 Páginas)
  const handleDescargarResolucionPDF = async () => {
    try {
      const datosParaPdf = {
        numero_resolucion: editNumeroResolucion,
        fecha_emision: editFechaEmision,
        establecimiento: editEstablecimiento,
        establecimiento_nombre: editEstablecimiento,
        propietario: editRazonSocial,
        razon_social: editRazonSocial,
        razon_social_propietario: editRazonSocial,
        ci_nit: editCiNit,
        ci_nit_solicitante: editCiNit,
        regente: editRegente || editRazonSocial,
        regente_nombre: editRegente || editRazonSocial,
        ci_regente: editCiRegente || editCiNit,
        tipo_tramite: detalleInforme?.tipo_tramite || 'APERTURA Y HABILITACIÓN',
        direccion: editDireccion,
        direccion_registrada: editDireccion,
        tipo_establecimiento: editTipoEstablecimiento,
        cite_informe: borradorResolucion?.datos_establecimiento?.cite_informe || detalleInforme?.cite_informe || 'CODELAB/SEDES/71/2026',
        fecha_informe: borradorResolucion?.datos_establecimiento?.fecha_informe || detalleInforme?.fecha_informe || editFechaEmision,
        coordinador_nombre: borradorResolucion?.datos_establecimiento?.coordinador_nombre || detalleInforme?.coordinador_nombre || 'Dra. Claudia Morales Valenzuela',
        abogado_nombre: usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos || ''}`.trim() : 'Dr. Marco Villanueva',
        vigencia_anios: 5,
        vigencia_rango: editVigenciaRango,
        antecedentes: editAntecedentes,
        vistos: editAntecedentes,
        fundamento_legal: editFundamentoLegal,
        articulo_primero: editArticuloPrimero,
        articulo_segundo: editArticuloSegundo,
        articulo_tercero: editArticuloTercero,
        observaciones_legales: editObservacionesLegales
      };

      const doc = await generarResolucionAdministrativaPDF(datosParaPdf);
      const cleanNum = (editNumeroResolucion || 'RA-2026').replace(/\//g, '_');
      doc.save(`Resolucion_Administrativa_${cleanNum}.pdf`);
      mostrarToast('Resolución Administrativa Oficial descargada con éxito.', 'success');
    } catch (err) {
      mostrarToast('Error al descargar el PDF de la Resolución.', 'warning');
    }
  };

  // Abrir la Resolución Administrativa Oficial en pestaña completa
  const handleAbrirResolucionPDFNuevaPestana = () => {
    if (pdfResolucionBlobUrl) {
      window.open(pdfResolucionBlobUrl, '_blank');
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  // Conteo de pendientes y filtrado según sección activa:
  // - En 'informes-recibidos': solo los que están pendientes de procesar/emitir RA (no enviados ni aprobados)
  // - En 'resolucion-administrativa': los pendientes de resolución y en edición final
  const informesPendientes = (informes || []).filter(x => x.estado_proceso !== 'Emitido' && x.estado_proceso !== 'Aprobado' && x.estado_proceso !== 'Enviado a Coordinador');
  const totalPendientes = informesPendientes.length;

  const listaCardsMostrada = informesPendientes;

  useEffect(() => {
    if (listaCardsMostrada.length > 0) {
      if (!tramiteSeleccionadoId || !listaCardsMostrada.some(x => x.id === tramiteSeleccionadoId)) {
        setTramiteSeleccionadoId(listaCardsMostrada[0].id);
      }
    } else {
      setTramiteSeleccionadoId(null);
    }
  }, [listaCardsMostrada, tramiteSeleccionadoId]);

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
      {/* 2. ÁREA PRINCIPAL DE CONTENIDO                                            */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">

        {/* ------------------------------------------------------------------- */}
        {/* HEADER SUPERIOR                                                     */}
        {/* ------------------------------------------------------------------- */}
        <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
          
          {/* Breadcrumb + Botón móvil */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="text-xs sm:text-sm text-slate-500 font-medium flex items-center space-x-1.5 truncate">
              <span className="hover:text-slate-700 cursor-pointer">Consola del Abogado</span>
              <span className="text-slate-300">/</span>
              <span className="font-bold text-slate-800">
                {seccionActiva === 'informes-recibidos'
                  ? 'Informes Recibidos'
                  : seccionActiva === 'resolucion-administrativa'
                    ? 'Resolución Administrativa'
                    : 'Historial y Trazabilidad'}
              </span>
            </div>
          </div>

          {/* Perfil del Usuario: Dr. Marco Villanueva */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                {usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos}` : 'Dr. Marco Villanueva'}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                {usuario?.cargo || 'Asesor Legal SEDES'}
              </p>
            </div>

            {/* Avatar de Iniciales */}
            <div className={`w-9 h-9 rounded-full ${getAvatarColor(usuario?.nombres || 'Dr. Marco Villanueva')} text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-slate-100 select-none tracking-tight`}>
              <span>{getInitials(usuario || { nombreCompleto: 'Dr. Marco Villanueva' })}</span>
            </div>

            <button
              type="button"
              onClick={handleCerrarSesion}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-1 cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </header>

        {/* ------------------------------------------------------------------- */}
        {/* TOAST FLOTANTE DE NOTIFICACIONES                                    */}
        {/* ------------------------------------------------------------------- */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 animate-bounce">
            <div className={`
              px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-bold border
              ${toast.tipo === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : toast.tipo === 'warning'
                  ? 'bg-amber-900 text-white border-amber-700'
                  : 'bg-slate-900 text-white border-slate-700'}
            `}>
              {toast.tipo === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span>{toast.mensaje}</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------- */}
        {/* CUERPO PRINCIPAL A 2 COLUMNAS (DISEÑO FIGMA)                        */}
        {/* ------------------------------------------------------------------- */}
        <main className="p-4 sm:p-8 flex-1">

          {seccionActiva === 'historial' ? (
            /* ================================================================= */
            /* VISTA 3: HISTORIAL DE RESOLUCIONES                                */
            /* ================================================================= */
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Historial de Resoluciones Administrativas
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Registro y trazabilidad de todas las resoluciones jurídicas emitidas.
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar por código o establecimiento..."
                      value={busquedaHistorial}
                      onChange={(e) => setBusquedaHistorial(e.target.value)}
                      className="pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                    />
                  </div>

                  <select
                    value={filtroEstadoHistorial}
                    onChange={(e) => setFiltroEstadoHistorial(e.target.value)}
                    className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Todos">Todos los estados</option>
                    <option value="Enviado a Coordinador">Enviado a Coordinador</option>
                    <option value="Emitido">Emitido</option>
                    <option value="En edición final">En edición final</option>
                  </select>
                </div>
              </div>

              {/* Tabla de Historial */}
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                      <tr>
                        <th className="py-3.5 px-5">Nº Resolución</th>
                        <th className="py-3.5 px-5">Trámite</th>
                        <th className="py-3.5 px-5">Establecimiento</th>
                        <th className="py-3.5 px-5">Fecha Emisión</th>
                        <th className="py-3.5 px-5">Vigencia</th>
                        <th className="py-3.5 px-5">Estado</th>
                        <th className="py-3.5 px-5 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cargandoHistorial ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                            <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#0060a8]" />
                            <span className="block mt-2 text-xs">Cargando historial de resoluciones...</span>
                          </td>
                        </tr>
                      ) : historialList.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-slate-400 font-medium space-y-2">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                            <p className="text-xs font-bold text-slate-700">Sin resoluciones en el historial</p>
                            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                              Las resoluciones administrativas elaboradas y enviadas al Coordinador aparecerán registradas aquí.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        historialList.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-50/60 transition">
                            <td className="py-3.5 px-5 font-black text-slate-900">
                              {h.numero_resolucion}
                            </td>
                            <td className="py-3.5 px-5 font-bold text-[#0060a8]">
                              {h.codigo_tramite}
                            </td>
                            <td className="py-3.5 px-5 font-bold text-slate-800">
                              {h.establecimiento}
                            </td>
                            <td className="py-3.5 px-5 text-slate-500 font-medium">
                              {h.fecha_emision}
                            </td>
                            <td className="py-3.5 px-5 font-semibold text-slate-600">
                              {h.vigencia}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                h.estado === 'Emitido' || h.estado === 'Aprobado'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : h.estado === 'Enviado a Coordinador'
                                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}>
                                {h.estado}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-right">
                              <button
                                type="button"
                                onClick={() => handleDescargarResolucionHistorial(h)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition cursor-pointer"
                                title={`Descargar PDF de ${h.numero_resolucion}`}
                              >
                                <Download className="w-4 h-4 text-[#0060a8]" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* ================================================================= */
            /* LAYOUT PRINCIPAL A 2 COLUMNAS (FIGMA IMÁGENES 1 Y 2)              */
            /* ================================================================= */
            <div className="flex flex-col lg:flex-row gap-6 items-start max-w-7xl mx-auto">

              {/* --------------------------------------------------------------- */}
              {/* COLUMNA IZQUIERDA: LISTADO DE INFORMES CONVERTIDOS EN RA        */}
              {/* --------------------------------------------------------------- */}
              <div className="w-full lg:w-80 xl:w-96 space-y-3.5 shrink-0">
                
                {/* Cabecera Columna Izquierda */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-tight">
                    Informes convertidos en resoluciones administrativas
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                    {totalPendientes} pendientes
                  </span>
                </div>

                {/* Lista de Tarjetas */}
                <div className="space-y-2.5">
                  {cargandoInformes ? (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#0060a8]" />
                      <p className="text-xs text-slate-500 font-medium mt-2">Cargando expedientes...</p>
                    </div>
                  ) : listaCardsMostrada.length === 0 ? (
                    <div className="p-6 text-center bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-700">Sin informes técnicos pendientes</p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {seccionActiva === 'informes-recibidos'
                          ? 'Todos los informes recibidos han sido convertidos en resoluciones y remitidos a Coordinación.'
                          : 'No hay resoluciones pendientes de revisión en este momento.'}
                      </p>
                    </div>
                  ) : (
                    listaCardsMostrada.map((item) => {
                      const isSelected = tramiteSeleccionadoId === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setTramiteSeleccionadoId(item.id)}
                          className={`
                            p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left relative group
                            ${isSelected
                              ? 'bg-white border-2 border-slate-900 shadow-md ring-2 ring-slate-900/5'
                              : 'bg-white hover:bg-slate-50/80 border-slate-200/90 shadow-2xs'
                            }
                          `}
                        >
                          {/* Fila 1: Código + Tipo Badge + Fecha */}
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-black text-slate-900">
                                {item.codigo}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-sky-100 text-sky-800">
                                {item.tipo_tramite}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 font-medium">
                              {item.fecha_ingreso}
                            </span>
                          </div>

                          {/* Fila 2: Título / Nombre */}
                          <p className="text-xs font-bold text-slate-800 truncate mb-2.5">
                            {item.titulo_card || `${item.establecimiento} — Resolución administrativa`}
                          </p>

                          {/* Fila 3: Badge de Estado + Flecha */}
                          <div className="flex items-center justify-between">
                            <span className={`
                              px-2.5 py-0.5 rounded-full text-[10px] font-black border
                              ${item.estado_proceso === 'En edición final'
                                ? 'bg-amber-50 text-amber-800 border-amber-200'
                                : item.estado_proceso === 'En Proceso'
                                  ? 'bg-sky-50 text-sky-800 border-sky-200'
                                  : item.estado_proceso === 'Aprobado' || item.estado_proceso === 'Enviado a Coordinador'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-yellow-50 text-yellow-800 border-yellow-200'
                              }
                            `}>
                              {item.estado_proceso}
                            </span>

                            <ChevronRight className={`w-4 h-4 transition ${isSelected ? 'text-slate-900 translate-x-0.5' : 'text-slate-300 group-hover:text-slate-500'}`} />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

              {/* --------------------------------------------------------------- */}
              {/* COLUMNA DERECHA: VISTA 1 (INFORME TÉCNICO) O VISTA 2 (RA)       */}
              {/* --------------------------------------------------------------- */}
              <div className="flex-1 w-full space-y-4">

                {seccionActiva === 'informes-recibidos' ? (
                  /* =========================================================== */
                  /* VISTA 1: INFORME TÉCNICO (FIGMA IMAGEN 1)                   */
                  /* =========================================================== */
                  !detalleInforme ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-2xs space-y-3">
                      <div className="w-14 h-14 bg-sky-50 text-[#0060a8] rounded-2xl flex items-center justify-center mx-auto border border-sky-100">
                        <FileText className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">No hay informes técnicos pendientes</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        En este módulo se listarán únicamente los expedientes que el Coordinador Departamental haya validado y derivado formalmente a Asesoría Legal mediante Informe Técnico.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      {/* Cabecera y Controles del Informe Técnico */}
                      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
                        
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                              <span className="px-2.5 py-1 bg-sky-100 text-[#0060a8] font-black rounded-lg border border-sky-200 text-xs">
                                {detalleInforme.cite_informe ? `CITE: ${detalleInforme.cite_informe}` : (detalleInforme.numero_resolucion ? `CITE: CODELAB/SEDES/${detalleInforme.codigo.replace('REQ-', '')}/2026` : 'CITE: CODELAB/SEDES/71/2026')}
                              </span>
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-lg border border-emerald-200 text-xs">
                                {detalleInforme.tipo_tramite || 'Apertura'}
                              </span>
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-semibold rounded-lg border border-slate-200 text-xs">
                                {detalleInforme.estado_proceso || 'En Asesoría Legal'}
                              </span>
                            </div>
                            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                              {detalleInforme.codigo} — Informe Técnico: {detalleInforme.establecimiento_nombre}
                            </h2>
                            <p className="text-xs text-slate-500 font-medium">
                              Comunicación Interna oficial emitida por la Coordinación Departamental de Laboratorios (SEDES)
                            </p>
                          </div>

                          {/* Botones Rápidos de Acción */}
                          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                            <button
                              type="button"
                              onClick={handleAbrirInformePDFNuevaPestana}
                              disabled={!pdfInformeBlobUrl}
                              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200 flex items-center space-x-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                              title="Abrir en pestaña nueva"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                              <span className="hidden sm:inline">Abrir PDF</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleDescargarInformePDF}
                              className="px-3.5 py-2 bg-[#0073c6] hover:bg-[#005fa6] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                              title="Descargar documento oficial en PDF"
                            >
                              <Download className="w-3.5 h-3.5 text-white" />
                              <span>Descargar PDF</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleIrAGenerarResolucion}
                              className="px-4 py-2 bg-[#0e533c] hover:bg-[#093d2b] text-white rounded-xl text-xs font-black transition shadow-sm flex items-center space-x-1.5 cursor-pointer"
                            >
                              <Award className="w-3.5 h-3.5 text-white" />
                              <span>Emitir RA</span>
                            </button>
                          </div>
                        </div>

                        {/* Selector de Pestañas: Documento PDF vs Ficha de Datos */}
                        <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setTabInformeActiva('pdf')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                              tabInformeActiva === 'pdf'
                                ? 'bg-[#0060a8] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Documento PDF Oficial (Informe Técnico)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setTabInformeActiva('ficha')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                              tabInformeActiva === 'ficha'
                                ? 'bg-[#0060a8] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                            }`}
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Ficha de Datos Resumida</span>
                          </button>
                        </div>

                      </div>

                      {/* ======================================================= */}
                      {/* PESTAÑA 1: VISOR INTERACTIVO DEL PDF OFICIAL (3 PÁGINAS) */}
                      {/* ======================================================= */}
                      {tabInformeActiva === 'pdf' && (
                        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3">
                          
                          {/* Barra de estado del visor */}
                          <div className="flex items-center justify-between px-2 py-1 text-xs">
                            <div className="flex items-center space-x-2 text-slate-600 font-bold">
                              <FileCheck className="w-4 h-4 text-emerald-600" />
                              <span>Documento oficial de 3 páginas con membretes institucionales, CITE y dictamen</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {generandoPdfInforme && (
                                <span className="flex items-center space-x-1.5 text-xs text-[#0060a8] font-bold">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Actualizando documento...</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Contenedor del Iframe con el PDF Renderizado */}
                          <div className="bg-[#eef2f6] border border-slate-200/80 rounded-2xl p-2 sm:p-4 min-h-[600px] flex items-center justify-center overflow-hidden">
                            {generandoPdfInforme && !pdfInformeBlobUrl ? (
                              <div className="text-center p-12 space-y-3">
                                <RefreshCw className="w-8 h-8 text-[#0060a8] animate-spin mx-auto" />
                                <p className="text-xs font-bold text-slate-700">Generando documento oficial de Informe Técnico...</p>
                                <p className="text-[11px] text-slate-400">Compilando datos reales de inspección, carpeta legal y CITE oficial.</p>
                              </div>
                            ) : pdfInformeBlobUrl ? (
                              <iframe
                                src={pdfInformeBlobUrl}
                                title={`Informe Técnico Oficial — ${detalleInforme.codigo}`}
                                className="w-full h-[780px] rounded-xl border border-slate-300 bg-white shadow-md"
                              />
                            ) : (
                              <div className="text-center p-12 space-y-3">
                                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                                <p className="text-xs font-bold text-slate-700">No se pudo cargar la vista previa del PDF.</p>
                              </div>
                            )}
                          </div>

                        </div>
                      )}

                      {/* ======================================================= */}
                      {/* PESTAÑA 2: FICHA DE DATOS RESUMIDA (DATOS TABULARES)     */}
                      {/* ======================================================= */}
                      {tabInformeActiva === 'ficha' && (
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">

                          {/* 1. Datos del Establecimiento */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                              Datos del Establecimiento
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                              <div>
                                <span className="text-slate-400 font-medium block">Establecimiento:</span>
                                <span className="font-bold text-slate-800">{detalleInforme.establecimiento_nombre}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium block">Razón Social / Propietario:</span>
                                <span className="font-bold text-slate-800">{detalleInforme.razon_social_propietario}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium block">Dirección:</span>
                                <span className="font-bold text-slate-800">{detalleInforme.direccion}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium block">Tipo de Establecimiento:</span>
                                <span className="font-bold text-slate-800">{detalleInforme.tipo_establecimiento}</span>
                              </div>
                            </div>
                          </div>

                          {/* 2. Resumen de Documentación Legal */}
                          <div className="space-y-3 pt-2 border-t border-slate-100">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                              Resumen de Documentación Legal ({detalleInforme.documentacion_legal?.length || 0} requisitos validados)
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs max-h-60 overflow-y-auto pr-1">
                              {(detalleInforme.documentacion_legal && detalleInforme.documentacion_legal.length > 0) ? (
                                detalleInforme.documentacion_legal.map((doc, dIdx) => (
                                  <div key={dIdx} className="flex items-center space-x-2 text-slate-700 font-semibold p-1.5 bg-slate-50 rounded-lg">
                                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${doc.aprobado ? 'text-emerald-600' : 'text-amber-500'}`} />
                                    <span className="truncate">{doc.nombre}</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400">Sin documentos registrados</p>
                              )}
                            </div>
                          </div>

                          {/* 3. Resumen de Inspección de Campo */}
                          <div className="space-y-3 pt-2 border-t border-slate-100">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                              Resumen de Inspección de Campo
                            </h4>
                            <div className="space-y-2 text-xs bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <span className="text-slate-400 font-medium block">Fecha de Inspección:</span>
                                  <span className="font-bold text-slate-800">{detalleInforme.inspeccion_campo?.fecha || 'Fecha no registrada'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 font-medium block">Supervisor Asignado:</span>
                                  <span className="font-bold text-[#0060a8]">{detalleInforme.inspeccion_campo?.supervisor || 'Supervisor SEDES'}</span>
                                </div>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium block">Resultado General:</span>
                                <span className="font-bold text-emerald-700">{detalleInforme.inspeccion_campo?.resultado || 'Favorable'}</span>
                              </div>
                              <div>
                                <span className="text-slate-400 font-medium block">Observaciones de Campo:</span>
                                <span className="text-slate-700 font-medium leading-relaxed">{detalleInforme.inspeccion_campo?.observaciones || 'Inspección técnica conforme.'}</span>
                              </div>
                            </div>
                          </div>

                          {/* 4. Observaciones del Coordinador */}
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                              Observaciones del Coordinador (Edición)
                            </h4>
                            <textarea
                              rows={3}
                              value={observacionesCoordinadorEdicion}
                              onChange={(e) => setObservacionesCoordinadorEdicion(e.target.value)}
                              className="w-full p-4 bg-slate-50 hover:bg-slate-50/90 border border-slate-200 rounded-2xl text-xs text-slate-800 font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#0073c6]"
                            />
                          </div>

                          {/* 5. Conclusión y Dictamen Técnico */}
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                              Conclusión y Dictamen Técnico
                            </h4>
                            <div className="flex items-center space-x-3">
                              <span className="text-xs text-slate-500 font-semibold">Dictamen Final:</span>
                              <div className="relative">
                                <select
                                  value={dictamenSeleccionado}
                                  onChange={(e) => setDictamenSeleccionado(e.target.value)}
                                  className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-black px-4 py-2 rounded-full focus:outline-none cursor-pointer appearance-none pr-8"
                                >
                                  <option value="Favorabilidad Concedida (Favorable)">● Favorabilidad Concedida (Favorable)</option>
                                  <option value="Con Observaciones Menores">● Con Observaciones Menores</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-emerald-700 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                              </div>
                            </div>
                          </div>

                        </div>
                      )}

                      {/* Botones de Acción Inferiores */}
                      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={handleDescargarInformePDF}
                          className="w-full sm:w-auto px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-slate-600" />
                          <span>Descargar Informe Técnico (PDF)</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleIrAGenerarResolucion}
                          className="w-full sm:w-auto px-7 py-3 bg-[#0e533c] hover:bg-[#093d2b] text-white rounded-xl text-xs font-extrabold transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                        >
                          <span>Genera Resolucion administrativa</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  )
                ) : (
                  /* =========================================================== */
                  /* VISTA 2: RESOLUCIÓN ADMINISTRATIVA OFICIAL (FIGMA IMAGEN 2)  */
                  /* =========================================================== */
                  !borradorResolucion ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-2xs space-y-3">
                      <div className="w-14 h-14 bg-sky-50 text-[#0060a8] rounded-2xl flex items-center justify-center mx-auto border border-sky-100">
                        <Award className="w-7 h-7" />
                      </div>
                      <h3 className="text-base font-bold text-slate-800">Ningún borrador de resolución disponible</h3>
                      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                        Seleccione un informe técnico de la lista lateral para redactar, editar y emitir la Resolución Administrativa.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      
                      {/* Cabecera y Controles de la Resolución Administrativa */}
                      {(() => {
                        const estadoResActual = borradorResolucion.estado_resolucion || detalleInforme?.estado_proceso || '';
                        const yaEnviadoCoordinador = estadoResActual === 'Enviado a Coordinador' || estadoResActual === 'Aprobado' || estadoResActual === 'Emitido';

                        return (
                          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-2xs space-y-4">
                            
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <span className="px-2.5 py-1 bg-sky-100 text-[#0060a8] font-black rounded-lg border border-sky-200 text-xs">
                                    RA Nº {editNumeroResolucion || '55/2026'}
                                  </span>
                                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 font-bold rounded-lg border border-emerald-200 text-xs">
                                    {editTipoEstablecimiento || 'Laboratorio Clínico'}
                                  </span>
                                  <span className={`px-2.5 py-1 font-bold rounded-lg border text-xs flex items-center space-x-1 ${
                                    yaEnviadoCoordinador
                                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                  }`}>
                                    {yaEnviadoCoordinador && <Check className="w-3 h-3 stroke-[3] text-emerald-700 inline mr-1" />}
                                    <span>{yaEnviadoCoordinador ? 'Remitido a Coordinación (Para Firma)' : (borradorResolucion.estado_resolucion || 'En edición final')}</span>
                                  </span>
                                </div>
                                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                  Resolución Administrativa — {borradorResolucion.codigo}: {editEstablecimiento || 'Establecimiento'}
                                </h2>
                                <p className="text-xs text-slate-500 font-medium">
                                  Edición de datos preliminares y generación del documento oficial de habilitación sanitaria (SEDES Cochabamba)
                                </p>
                              </div>

                              {/* Botones Rápidos de Acción */}
                              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                                <button
                                  type="button"
                                  onClick={handleAbrirResolucionPDFNuevaPestana}
                                  disabled={!pdfResolucionBlobUrl}
                                  className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition border border-slate-200 flex items-center space-x-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                                  title="Abrir en pestaña nueva"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                                  <span className="hidden sm:inline">Abrir PDF</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={handleGuardarBorrador}
                                  disabled={guardandoResolucion || yaEnviadoCoordinador}
                                  className={`px-3.5 py-2 bg-white text-slate-700 rounded-xl text-xs font-bold transition border border-slate-300 flex items-center space-x-1.5 shadow-2xs ${
                                    yaEnviadoCoordinador ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50 cursor-pointer'
                                  }`}
                                  title={yaEnviadoCoordinador ? 'La resolución ya fue remitida a Coordinación.' : 'Guardar cambios en la base de datos'}
                                >
                                  {guardandoResolucion ? (
                                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0060a8]" />
                                  ) : (
                                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                                  )}
                                  <span>Guardar</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={handleDescargarResolucionPDF}
                                  className="px-3.5 py-2 bg-[#0073c6] hover:bg-[#005fa6] text-white rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                                  title="Descargar documento oficial en PDF"
                                >
                                  <Download className="w-3.5 h-3.5 text-white" />
                                  <span>Descargar RA</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={handleEnviarAlCoordinador}
                                  disabled={enviandoCoordinador || yaEnviadoCoordinador}
                                  className={`px-4 py-2 text-white rounded-xl text-xs font-black transition shadow-sm flex items-center space-x-1.5 ${
                                    yaEnviadoCoordinador
                                      ? 'bg-emerald-800 text-emerald-100 cursor-not-allowed opacity-90'
                                      : 'bg-[#0e533c] hover:bg-[#093d2b] cursor-pointer'
                                  }`}
                                  title={yaEnviadoCoordinador ? 'La resolución ya fue enviada a Coordinación para firma oficial.' : 'Enviar resolución final al Coordinador para firma'}
                                >
                                  {yaEnviadoCoordinador ? (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                                      <span>Enviado al Coordinador</span>
                                    </>
                                  ) : enviandoCoordinador ? (
                                    <>
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                                      <span>Enviando...</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                      <span>Enviar al Coordinador</span>
                                    </>
                                  )}
                                </button>
                              </div>

                            </div>

                            {/* Selector de Pestañas: Documento PDF vs Formulario de Edición */}
                            <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                              <button
                                type="button"
                                onClick={() => setTabResolucionActiva('pdf')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                                  tabResolucionActiva === 'pdf'
                                    ? 'bg-[#0060a8] text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                                }`}
                              >
                                <FileText className="w-3.5 h-3.5" />
                                <span>Documento PDF Oficial (Resolución Administrativa)</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setTabResolucionActiva('editor')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
                                  tabResolucionActiva === 'editor'
                                    ? 'bg-[#0060a8] text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                                }`}
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>Formulario de Edición de Datos</span>
                              </button>
                            </div>

                          </div>
                        );
                      })()}

                      {/* ======================================================= */}
                      {/* PESTAÑA 1: VISOR INTERACTIVO DEL PDF OFICIAL (2 PÁGINAS) */}
                      {/* ======================================================= */}
                      {tabResolucionActiva === 'pdf' && (
                        <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-2xs space-y-3">
                          
                          {/* Barra de estado del visor */}
                          <div className="flex items-center justify-between px-2 py-1 text-xs">
                            <div className="flex items-center space-x-2 text-slate-700 font-bold">
                              <FileCheck className="w-4 h-4 text-emerald-600" />
                              <span>Resolución Oficial (2 Páginas) con membretes oficiales y 4 firmas institucionales</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              {generandoPdfResolucion && (
                                <span className="flex items-center space-x-1.5 text-xs text-[#0060a8] font-bold">
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>Actualizando PDF...</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Contenedor del Iframe con el PDF de la Resolución */}
                          <div className="bg-[#eef2f6] border border-slate-200/80 rounded-2xl p-2 sm:p-4 min-h-[680px] flex items-center justify-center overflow-hidden">
                            {generandoPdfResolucion && !pdfResolucionBlobUrl ? (
                              <div className="text-center p-12 space-y-3">
                                <RefreshCw className="w-8 h-8 text-[#0060a8] animate-spin mx-auto" />
                                <p className="text-xs font-bold text-slate-700">Generando documento oficial de Resolución Administrativa...</p>
                                <p className="text-[11px] text-slate-400">Compilando artículos, considerandos, sellos y firmas oficiales.</p>
                              </div>
                            ) : pdfResolucionBlobUrl ? (
                              <iframe
                                key={pdfResolucionBlobUrl}
                                src={pdfResolucionBlobUrl}
                                title={`Resolución Administrativa Oficial — ${editNumeroResolucion}`}
                                className="w-full h-[850px] rounded-xl border border-slate-300 bg-white shadow-md"
                              />
                            ) : (
                              <div className="text-center p-12 space-y-3">
                                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
                                <p className="text-xs font-bold text-slate-700">No se pudo cargar la vista previa de la Resolución.</p>
                              </div>
                            )}
                          </div>

                        </div>
                      )}

                      {/* ======================================================= */}
                      {/* PESTAÑA 2: FORMULARIO COMPLETO DE EDICIÓN DE DATOS      */}
                      {/* ======================================================= */}
                      {tabResolucionActiva === 'editor' && (
                        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">

                          {/* 1. Identificación y CITE de la Resolución */}
                          <div className="space-y-3">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                              <Award className="w-4 h-4 text-[#0060a8]" />
                              <span>1. Identificación de la Resolución Administrativa</span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                  Nº DE RESOLUCIÓN ADMINISTRATIVA
                                </label>
                                <input
                                  type="text"
                                  value={editNumeroResolucion}
                                  onChange={(e) => setEditNumeroResolucion(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                  FECHA DE EMISIÓN OFICIAL
                                </label>
                                <input
                                  type="text"
                                  value={editFechaEmision}
                                  onChange={(e) => handleCambioFechaEmision(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 2. Datos del Establecimiento y Representación */}
                          <div className="space-y-3 pt-2 border-t border-slate-100">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                              <Building2 className="w-4 h-4 text-[#0060a8]" />
                              <span>2. Datos del Establecimiento y Representación Técnica</span>
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                  ESTABLECIMIENTO
                                </label>
                                <input
                                  type="text"
                                  value={editEstablecimiento}
                                  onChange={(e) => handleCambioEstablecimiento(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                  RAZÓN SOCIAL / PROPIETARIO
                                </label>
                                <input
                                  type="text"
                                  value={editRazonSocial}
                                  onChange={(e) => handleCambioPropietario(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                  CI / NIT DEL PROPIETARIO
                                </label>
                                <input
                                  type="text"
                                  value={editCiNit}
                                  onChange={(e) => handleCambioCiNit(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                  REGENTE BIOQUÍMICO RESPONSABLE
                                </label>
                                <input
                                  type="text"
                                  value={editRegente}
                                  onChange={(e) => handleCambioRegente(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                  CI DE LA REGENTE
                                </label>
                                <input
                                  type="text"
                                  value={editCiRegente}
                                  onChange={(e) => handleCambioCiRegente(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                  TIPO DE ESTABLECIMIENTO / NIVEL
                                </label>
                                <input
                                  type="text"
                                  value={editTipoEstablecimiento}
                                  onChange={(e) => handleCambioTipoEstablecimiento(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                                />
                              </div>

                              <div className="sm:col-span-2 space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                                  DIRECCIÓN REGISTRADA
                                </label>
                                <input
                                  type="text"
                                  value={editDireccion}
                                  onChange={(e) => handleCambioDireccion(e.target.value)}
                                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 3. VISTOS y CONSIDERANDOS */}
                          <div className="space-y-3 pt-2 border-t border-slate-100">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                              <FileText className="w-4 h-4 text-[#0060a8]" />
                              <span>3. VISTOS y CONSIDERANDO (Narrativa Jurídica)</span>
                            </h4>

                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                                  VISTOS (Solicitud y Antecedentes)
                                </label>
                                <textarea
                                  rows={4}
                                  value={editAntecedentes}
                                  onChange={(e) => setEditAntecedentes(e.target.value)}
                                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium leading-relaxed focus:bg-white focus:ring-2 focus:ring-[#0073c6]"
                                />
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                                  CONSIDERANDO (Marco Legal y Dictamen de Coordinación)
                                </label>
                                <textarea
                                  rows={4}
                                  value={editFundamentoLegal}
                                  onChange={(e) => setEditFundamentoLegal(e.target.value)}
                                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium leading-relaxed focus:bg-white focus:ring-2 focus:ring-[#0073c6]"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 4. POR TANTO y ARTÍCULOS RESOLUTIVOS */}
                          <div className="space-y-3 pt-2 border-t border-slate-100">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                              <ShieldCheck className="w-4 h-4 text-[#0060a8]" />
                              <span>4. POR TANTO y Artículos Resolutivos</span>
                            </h4>

                            <div className="space-y-3">
                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
                                  ARTÍCULO PRIMERO (Autorización de Funcionamiento)
                                </label>
                                <textarea
                                  rows={3}
                                  value={editArticuloPrimero}
                                  onChange={(e) => setEditArticuloPrimero(e.target.value)}
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
                                  ARTÍCULO SEGUNDO (Vigencia)
                                </label>
                                <textarea
                                  rows={2}
                                  value={editArticuloSegundo}
                                  onChange={(e) => setEditArticuloSegundo(e.target.value)}
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white"
                                />
                                <div className="flex items-center space-x-2 pt-1">
                                  <span className="text-[11px] font-bold text-slate-500">Rango de Vigencia:</span>
                                  <input
                                    type="text"
                                    value={editVigenciaRango}
                                    onChange={(e) => handleCambioVigenciaRango(e.target.value)}
                                    className="px-3 py-1 bg-sky-50 border border-sky-200 rounded-lg text-xs font-black text-sky-900"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
                                  ARTÍCULO TERCERO (Inspecciones Periódicas)
                                </label>
                                <textarea
                                  rows={2}
                                  value={editArticuloTercero}
                                  onChange={(e) => setEditArticuloTercero(e.target.value)}
                                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white"
                                />
                              </div>
                            </div>
                          </div>

                          {/* 5. Notas de Asesoría Legal */}
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                              5. Dictamen y Notas de Asesoría Legal
                            </h4>
                            <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-4">
                              <textarea
                                rows={3}
                                value={editObservacionesLegales}
                                onChange={(e) => setEditObservacionesLegales(e.target.value)}
                                className="w-full bg-transparent border-none text-xs text-sky-950 font-medium leading-relaxed focus:outline-none"
                              />
                            </div>
                          </div>

                        </div>
                      )}

                      {/* Barra de Acciones Inferior */}
                      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center space-x-2 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleGuardarBorrador}
                            disabled={guardandoResolucion}
                            className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition shadow-2xs cursor-pointer flex items-center justify-center space-x-1.5"
                          >
                            {guardandoResolucion ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#0060a8]" />
                            ) : (
                              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                            )}
                            <span>Guardar Modificaciones</span>
                          </button>

                          {tabResolucionActiva === 'editor' && (
                            <button
                              type="button"
                              onClick={() => setTabResolucionActiva('pdf')}
                              className="w-full sm:w-auto px-5 py-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0060a8] rounded-xl text-xs font-black transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-2xs"
                            >
                              <FileText className="w-4 h-4" />
                              <span>Ver Documento PDF Oficial</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={handleDescargarResolucionPDF}
                            className="w-full sm:w-auto px-6 py-2.5 bg-[#0073c6] hover:bg-[#005fa6] text-white rounded-xl text-xs font-extrabold transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <Download className="w-4 h-4 text-white" />
                            <span>Descargar Resolución (PDF)</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleEnviarAlCoordinador}
                            disabled={enviandoCoordinador}
                            className="w-full sm:w-auto px-7 py-2.5 bg-[#0e533c] hover:bg-[#093d2b] text-white rounded-xl text-xs font-extrabold transition shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                          >
                            {enviandoCoordinador ? (
                              <RefreshCw className="w-4 h-4 animate-spin text-white" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            )}
                            <span>Enviar al Coordinador</span>
                          </button>
                        </div>
                      </div>

                    </div>
                )
              )}

              </div>

            </div>
          )}

        </main>

      </div>

    </div>
  );
}
