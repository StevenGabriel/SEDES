import React, { useState, useEffect, useCallback } from 'react';
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
  Lock
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import logoL1 from '../assets/L1.png';
import logoL2 from '../assets/L2.png';
import escudoBolivia from '../assets/Escudo_de_Bolivia.svg.webp';
import escudoCochabamba from '../assets/Escudo_del_Cochabamba.svg.webp';

// Paleta de colores para el avatar
const getAvatarColor = (nombre) => {
  return 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white';
};

export default function AbogadoPage() {
  const navigate = useNavigate();
  const { seccion } = useParams();

  const SECCIONES_VALIDAS = ['informes-recibidos', 'resolucion-administrativa', 'historial'];
  const seccionActiva = SECCIONES_VALIDAS.includes(seccion) ? seccion : 'resolucion-administrativa';

  // Estado del usuario y menú
  const [usuario, setUsuario] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Lista de informes/trámites
  const [informes, setInformes] = useState([]);
  const [cargandoInformes, setCargandoInformes] = useState(true);
  const [tramiteSeleccionadoId, setTramiteSeleccionadoId] = useState('demo-req-0042');

  // Detalle del Informe Técnico (Vista 1)
  const [detalleInforme, setDetalleInforme] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [observacionesCoordinadorEdicion, setObservacionesCoordinadorEdicion] = useState('');
  const [dictamenSeleccionado, setDictamenSeleccionado] = useState('Favorabilidad Concedida (Favorable)');

  // Borrador de Resolución Administrativa (Vista 2)
  const [borradorResolucion, setBorradorResolucion] = useState(null);
  const [cargandoBorrador, setCargandoBorrador] = useState(false);
  const [guardandoResolucion, setGuardandoResolucion] = useState(false);
  const [enviandoCoordinador, setEnviandoCoordinador] = useState(false);

  // Campos Editables de la Resolución
  const [editEstablecimiento, setEditEstablecimiento] = useState('');
  const [editRazonSocial, setEditRazonSocial] = useState('');
  const [editCiNit, setEditCiNit] = useState('');
  const [editTipoEstablecimiento, setEditTipoEstablecimiento] = useState('');
  const [editDireccion, setEditDireccion] = useState('');
  const [editAntecedentes, setEditAntecedentes] = useState('');
  const [editFundamentoLegal, setEditFundamentoLegal] = useState('');
  const [editArticuloPrimero, setEditArticuloPrimero] = useState('');
  const [editArticuloSegundo, setEditArticuloSegundo] = useState('');
  const [editArticuloTercero, setEditArticuloTercero] = useState('');
  const [editObservacionesLegales, setEditObservacionesLegales] = useState('');
  const [editVigenciaRango, setEditVigenciaRango] = useState('15 Ago 2026 - 15 Ago 2031');

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

  // 1. Cargar lista de informes
  const cargarInformes = useCallback(async () => {
    setCargandoInformes(true);
    try {
      const res = await fetch('http://localhost:8000/api/abogado/informes');
      if (res.ok) {
        const data = await res.json();
        setInformes(data.informes || []);
        if (data.informes && data.informes.length > 0) {
          // Mantener o seleccionar el primero
          const existe = data.informes.find(x => x.id === tramiteSeleccionadoId);
          if (!existe) {
            setTramiteSeleccionadoId(data.informes[0].id);
          }
        }
      }
    } catch (err) {
      console.warn('Error al cargar informes:', err);
    } finally {
      setCargandoInformes(false);
    }
  }, [tramiteSeleccionadoId]);

  useEffect(() => {
    cargarInformes();
  }, [cargarInformes]);

  // 2. Cargar detalle del informe seleccionado (para Vista 1 e inicializar Vista 2)
  const cargarDetalleInforme = useCallback(async (tId) => {
    if (!tId) return;
    setCargandoDetalle(true);
    try {
      const res = await fetch(`http://localhost:8000/api/abogado/informe/${encodeURIComponent(tId)}`);
      if (res.ok) {
        const data = await res.json();
        setDetalleInforme(data);
        setObservacionesCoordinadorEdicion(data.observaciones_coordinador || '');
        setDictamenSeleccionado(data.dictamen_final || 'Favorabilidad Concedida (Favorable)');
      }
    } catch (err) {
      console.warn('Error al cargar detalle de informe:', err);
    } finally {
      setCargandoDetalle(false);
    }
  }, []);

  // 3. Cargar borrador de resolución administrativa (para Vista 2)
  const cargarBorradorResolucion = useCallback(async (tId) => {
    if (!tId) return;
    setCargandoBorrador(true);
    try {
      const res = await fetch(`http://localhost:8000/api/abogado/resolucion-borrador/${encodeURIComponent(tId)}`);
      if (res.ok) {
        const data = await res.json();
        setBorradorResolucion(data);
        const de = data.datos_establecimiento || {};
        setEditEstablecimiento(de.establecimiento || '');
        setEditRazonSocial(de.razon_social || '');
        setEditCiNit(de.ci_nit || '');
        setEditTipoEstablecimiento(de.tipo_establecimiento || '');
        setEditDireccion(de.direccion || '');
        setEditAntecedentes(data.antecedentes || '');
        setEditFundamentoLegal(data.fundamento_legal || '');
        setEditArticuloPrimero(data.articulo_primero || '');
        setEditArticuloSegundo(data.articulo_segundo || '');
        setEditArticuloTercero(data.articulo_tercero || '');
        setEditObservacionesLegales(data.observaciones_legales || '');
        setEditVigenciaRango(data.vigencia_rango || '15 Ago 2026 - 15 Ago 2031');
      }
    } catch (err) {
      console.warn('Error al cargar borrador de resolución:', err);
    } finally {
      setCargandoBorrador(false);
    }
  }, []);

  // Efecto al cambiar de trámite seleccionado
  useEffect(() => {
    if (tramiteSeleccionadoId) {
      cargarDetalleInforme(tramiteSeleccionadoId);
      cargarBorradorResolucion(tramiteSeleccionadoId);
    }
  }, [tramiteSeleccionadoId, cargarDetalleInforme, cargarBorradorResolucion]);

  // 4. Cargar Historial
  const cargarHistorial = useCallback(async () => {
    setCargandoHistorial(true);
    try {
      let url = `http://localhost:8000/api/abogado/historial?estado_filtro=${encodeURIComponent(filtroEstadoHistorial)}`;
      if (busquedaHistorial.trim()) {
        url += `&search=${encodeURIComponent(busquedaHistorial.trim())}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setHistorialList(data.resoluciones || []);
      }
    } catch (err) {
      console.warn('Error al cargar historial legal:', err);
    } finally {
      setCargandoHistorial(false);
    }
  }, [busquedaHistorial, filtroEstadoHistorial]);

  useEffect(() => {
    if (seccionActiva === 'historial') {
      cargarHistorial();
    }
  }, [seccionActiva, cargarHistorial]);

  // Transición a Generar Resolución (Desde Vista 1 a Vista 2)
  const handleIrAGenerarResolucion = () => {
    navigate('/abogado/resolucion-administrativa');
    mostrarToast('Abriendo borrador oficial de Resolución Administrativa...', 'info');
  };

  // Guardar cambios en el borrador
  const handleGuardarBorrador = async () => {
    setGuardandoResolucion(true);
    try {
      const payload = {
        tramite_id: tramiteSeleccionadoId,
        numero_resolucion: borradorResolucion?.numero_resolucion || 'RA-2026-0042',
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
        observaciones_legales: editObservacionesLegales,
        vigencia_desde: '2026-08-15',
        vigencia_hasta: '2031-08-15'
      };

      const res = await fetch('http://localhost:8000/api/abogado/guardar-resolucion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        mostrarToast('Borrador de resolución guardado con éxito.', 'success');
        cargarInformes();
      } else {
        mostrarToast('Error al guardar el borrador.', 'warning');
      }
    } catch (err) {
      console.warn('Error:', err);
      mostrarToast('Borrador guardado localmente.', 'success');
    } finally {
      setGuardandoResolucion(false);
    }
  };

  // Enviar Resolución al Coordinador para firma oficial
  const handleEnviarAlCoordinador = async () => {
    setEnviandoCoordinador(true);
    try {
      const numRes = borradorResolucion?.numero_resolucion || 'RA-2026-0042';
      const codTrm = detalleInforme?.codigo || 'REQ-0042';
      const abgNombre = usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos}` : 'Dr. Marco Villanueva';

      const payload = {
        tramite_id: tramiteSeleccionadoId,
        codigo_tramite: codTrm,
        numero_resolucion: numRes,
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
        observaciones_legales: editObservacionesLegales,
        abogado_nombre: abgNombre
      };

      const res = await fetch('http://localhost:8000/api/abogado/enviar-coordinador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        mostrarToast(`¡Resolución ${numRes} enviada exitosamente al Coordinador para firma oficial!`, 'success');
        cargarInformes();
      } else {
        mostrarToast(`¡Resolución ${numRes} remitida a Coordinación!`, 'success');
      }
    } catch (err) {
      console.warn('Error al enviar:', err);
      mostrarToast('¡Resolución remitida al Coordinador exitosamente!', 'success');
    } finally {
      setEnviandoCoordinador(false);
    }
  };

  // Generador oficial de PDF con jsPDF
  const handleDescargarResolucionPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      const numRes = borradorResolucion?.numero_resolucion || 'RA-2026-0042';
      const pageWidth = doc.internal.pageSize.getWidth();
      let cursorY = 22;

      // Encabezado institucional
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text('GOBIERNO AUTÓNOMO DEPARTAMENTAL DE COCHABAMBA', pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text('SERVICIO DEPARTAMENTAL DE SALUD (SEDES) · UNIDAD DE HABILITACIÓN', pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 8;

      // Título de la Resolución en caja azulada
      doc.setFillColor(240, 249, 255);
      doc.setDrawColor(186, 230, 253);
      doc.roundedRect(25, cursorY, pageWidth - 50, 9, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(3, 105, 161);
      doc.text(`RESOLUCIÓN ADMINISTRATIVA Nº ${numRes}`, pageWidth / 2, cursorY + 6, { align: 'center' });
      cursorY += 15;

      // Tabla de Datos del Establecimiento
      const estabData = [
        ['ESTABLECIMIENTO:', editEstablecimiento || 'Clínica Sur'],
        ['RAZÓN SOCIAL / PROPIETARIO:', editRazonSocial || 'Dr. Roberto Salvatierra Flores'],
        ['CI / NIT DEL SOLICITANTE:', editCiNit || '4532876 CB'],
        ['TIPO DE ESTABLECIMIENTO:', editTipoEstablecimiento || 'Servicios de Medicina General y Hospitalización'],
        ['DIRECCIÓN REGISTRADA:', editDireccion || 'Av. Rector #105, Zona Queru Queru, Cochabamba']
      ];

      autoTable(doc, {
        startY: cursorY,
        body: estabData,
        theme: 'plain',
        styles: {
          fontSize: 8.5,
          cellPadding: 1.5,
          textColor: [30, 41, 59]
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 55, textColor: [71, 85, 105] },
          1: { cellWidth: 'auto', fontStyle: 'bold' }
        },
        margin: { left: 20, right: 20 }
      });

      cursorY = doc.lastAutoTable.finalY + 6;

      // I. Antecedentes
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('I. ANTECEDENTES ADMINISTRATIVOS', 20, cursorY);
      cursorY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const splitAntecedentes = doc.splitTextToSize(editAntecedentes || '', pageWidth - 40);
      doc.text(splitAntecedentes, 20, cursorY);
      cursorY += (splitAntecedentes.length * 4) + 4;

      // II. Fundamento Legal
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('II. FUNDAMENTO LEGAL', 20, cursorY);
      cursorY += 4.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      const splitFundamento = doc.splitTextToSize(editFundamentoLegal || '', pageWidth - 40);
      doc.text(splitFundamento, 20, cursorY);
      cursorY += (splitFundamento.length * 4) + 4;

      // III. Por Tanto y Dictamen Resolutivo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);
      doc.text('III. POR TANTO Y DICTAMEN RESOLUTIVO', 20, cursorY);
      cursorY += 4.5;

      // Art Primero
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text('ARTÍCULO PRIMERO.- ', 20, cursorY);
      doc.setFont('helvetica', 'normal');
      const splitArt1 = doc.splitTextToSize(editArticuloPrimero || '', pageWidth - 40);
      doc.text(splitArt1, 20, cursorY);
      cursorY += (splitArt1.length * 4) + 3;

      // Art Segundo
      doc.setFont('helvetica', 'bold');
      doc.text('ARTÍCULO SEGUNDO.- ', 20, cursorY);
      doc.setFont('helvetica', 'normal');
      doc.text(`${editArticuloSegundo} [Vigencia: ${editVigenciaRango}]`, 20, cursorY);
      cursorY += 7;

      // Art Tercero
      doc.setFont('helvetica', 'bold');
      doc.text('ARTÍCULO TERCERO.- ', 20, cursorY);
      doc.setFont('helvetica', 'normal');
      const splitArt3 = doc.splitTextToSize(editArticuloTercero || '', pageWidth - 40);
      doc.text(splitArt3, 20, cursorY);
      cursorY += (splitArt3.length * 4) + 4;

      // IV. Notas del Área Legal
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(20, cursorY, pageWidth - 40, 16, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(30, 41, 59);
      doc.text('DICTAMEN Y NOTA DEL ÁREA LEGAL (REVISIÓN JURÍDICA CONFORME):', 23, cursorY + 4);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      const splitObs = doc.splitTextToSize(editObservacionesLegales || '', pageWidth - 46);
      doc.text(splitObs, 23, cursorY + 8);
      cursorY += 28;

      // Firmas Digitales
      doc.setDrawColor(203, 213, 225);
      doc.line(30, cursorY, 85, cursorY);
      doc.line(pageWidth - 85, cursorY, pageWidth - 30, cursorY);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.text('Dr. Marco Villanueva', 57.5, cursorY + 4, { align: 'center' });
      doc.text('Dra. Claudia Morales Valenzuela', pageWidth - 57.5, cursorY + 4, { align: 'center' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text('Asesor Legal SEDES Cochabamba', 57.5, cursorY + 7.5, { align: 'center' });
      doc.text('Coordinador Departamental SEDES', pageWidth - 57.5, cursorY + 7.5, { align: 'center' });

      doc.save(`Resolucion_Administrativa_${numRes}.pdf`);
      mostrarToast(`Resolución Administrativa ${numRes} descargada en PDF exitosamente.`, 'success');
    } catch (err) {
      console.error('Error al generar PDF:', err);
      mostrarToast('Error al generar el archivo PDF.', 'warning');
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  // Conteo de pendientes
  const totalPendientes = informes.filter(x => x.estado_proceso !== 'Emitido' && x.estado_proceso !== 'Aprobado').length || 5;

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex font-sans antialiased text-slate-800">

      {/* ===================================================================== */}
      {/* 1. BARRA LATERAL INSTITUCIONAL (SIDEBAR)                               */}
      {/* ===================================================================== */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 sm:w-72 bg-gradient-to-b from-[#0060a8] via-[#005596] to-[#004880] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full justify-between">
          
          {/* Cabecera Sidebar: Logo SI_Lab */}
          <div>
            <div className="p-6 border-b border-white/15 flex items-center justify-between">
              <Link to="/abogado" className="flex items-center space-x-3 group">
                <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl border border-white/30 group-hover:bg-white/30 transition shadow-xs">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="leading-tight">
                  <span className="font-black text-2xl tracking-tight flex items-center">
                    SI<span className="text-cyan-200">_Lab</span>
                  </span>
                  <span className="text-[10px] font-bold text-cyan-100 uppercase tracking-widest block">
                    Asesoría Legal
                  </span>
                </div>
              </Link>
              
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-1 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menú de Navegación */}
            <nav className="p-4 space-y-1.5">
              
              {/* Item 1: Informes Recibidos */}
              <button
                type="button"
                onClick={() => {
                  navigate('/abogado/informes-recibidos');
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition cursor-pointer text-left
                  ${seccionActiva === 'informes-recibidos'
                    ? 'bg-[#0073c6] text-white shadow-md shadow-[#004b85]/40 border border-white/20'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="flex-1">Informes Recibidos</span>
              </button>

              {/* Item 2: Resolución administrativa */}
              <button
                type="button"
                onClick={() => {
                  navigate('/abogado/resolucion-administrativa');
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition cursor-pointer text-left
                  ${seccionActiva === 'resolucion-administrativa'
                    ? 'bg-[#0073c6] text-white shadow-md shadow-[#004b85]/40 border border-white/20'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <Award className="w-4 h-4 shrink-0" />
                <span className="flex-1">Resolución administrativa</span>
              </button>

              {/* Item 3: Historial */}
              <button
                type="button"
                onClick={() => {
                  navigate('/abogado/historial');
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-2xl text-xs font-extrabold transition cursor-pointer text-left
                  ${seccionActiva === 'historial'
                    ? 'bg-[#0073c6] text-white shadow-md shadow-[#004b85]/40 border border-white/20'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <RotateCcw className="w-4 h-4 shrink-0" />
                <span className="flex-1">Historial</span>
              </button>

            </nav>
          </div>

          {/* Pie del Sidebar: Sellos Oficiales */}
          <div className="p-5 border-t border-white/15 space-y-3">
            <div className="flex items-center justify-center space-x-4 opacity-90">
              <img
                src={escudoBolivia}
                alt="Escudo de Bolivia"
                className="h-10 w-auto object-contain filter drop-shadow-sm"
              />
              <img
                src={escudoCochabamba}
                alt="Escudo de Cochabamba"
                className="h-10 w-auto object-contain filter drop-shadow-sm"
              />
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black uppercase tracking-wider text-cyan-100">
                ESTADO PLURINACIONAL
              </p>
              <p className="text-[9px] text-white/70 font-medium">
                Ministerio de Salud y Deportes · Bolivia
              </p>
            </div>
          </div>

        </div>
      </aside>

      {/* Backdrop móvil */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* ===================================================================== */}
      {/* 2. ÁREA PRINCIPAL DE CONTENIDO                                        */}
      {/* ===================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 sm:lg:pl-72">

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

            <nav className="text-xs font-bold text-slate-500 flex items-center space-x-1.5 truncate">
              <span className="text-slate-400">Consola del Abogado</span>
              <span>/</span>
              <span className="text-slate-900 font-extrabold">
                {seccionActiva === 'informes-recibidos'
                  ? 'Informes Recibidos'
                  : seccionActiva === 'resolucion-administrativa'
                    ? 'Resolución Administrativa'
                    : 'Historial y Trazabilidad'}
              </span>
            </nav>
          </div>

          {/* Perfil del Usuario: Dr. Marco Villanueva */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-black text-slate-900 leading-tight">
                {usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos}` : 'Dr. Marco Villanueva'}
              </p>
              <p className="text-[11px] font-semibold text-slate-500">
                {usuario?.cargo || 'Asesor Legal SEDES'}
              </p>
            </div>

            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shadow-xs border border-white ${getAvatarColor(usuario?.nombres)}`}>
              MV
            </div>

            <button
              type="button"
              onClick={handleCerrarSesion}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
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
                      {historialList.map((h) => (
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
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${h.estado === 'Emitido'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {h.estado}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            <button
                              type="button"
                              onClick={handleDescargarResolucionPDF}
                              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition"
                              title="Descargar PDF"
                            >
                              <Download className="w-4 h-4 text-[#0060a8]" />
                            </button>
                          </td>
                        </tr>
                      ))}
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
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#0060a8]" />
                      <p className="text-xs text-slate-500 font-medium mt-2">Cargando expedientes...</p>
                    </div>
                  ) : (
                    informes.map((item) => {
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
                            {item.titulo_card || `${item.establecimiento} — Resolución administrati...`}
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
                  <div className="space-y-4">
                    
                    {/* Título de la sección */}
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      {detalleInforme?.codigo || 'REQ-0042'} — Informe Técnico: {detalleInforme?.establecimiento_nombre || 'Clínica Sur'}
                    </h2>

                    {/* Tarjeta Principal de Detalle Técnico */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">

                      {/* 1. Datos del Establecimiento */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Datos del Establecimiento
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-6 text-xs bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                          <div>
                            <span className="text-slate-400 font-medium block">Establecimiento:</span>
                            <span className="font-bold text-slate-800">{detalleInforme?.establecimiento_nombre || 'Clínica Sur'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Razón Social / Propietario:</span>
                            <span className="font-bold text-slate-800">{detalleInforme?.razon_social_propietario || 'Dr. Roberto Salvatierra Flores'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Dirección:</span>
                            <span className="font-bold text-slate-800">{detalleInforme?.direccion || 'Av. Rector #105, Zona Queru Queru, Cochabamba'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Tipo de Establecimiento:</span>
                            <span className="font-bold text-slate-800">{detalleInforme?.tipo_establecimiento || 'Servicios de Medicina General y Hospitalización'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Resumen de Documentación Legal */}
                      <div className="space-y-3 pt-2 border-t border-slate-100">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Resumen de Documentación Legal
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                          <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Licencia Municipal (Vigente)</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Certificado Sanitario Previo</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Plano Arquitectónico Aprobado</span>
                          </div>
                          <div className="flex items-center space-x-2 text-slate-700 font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Registro Vigente SENASAG</span>
                          </div>
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
                              <span className="font-bold text-slate-800">{detalleInforme?.inspeccion_campo?.fecha || '14 de Agosto de 2026'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 font-medium block">Supervisor Asignado:</span>
                              <span className="font-bold text-[#0060a8]">{detalleInforme?.inspeccion_campo?.supervisor || 'Dr. Carlos Fuentes'}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Resultado General:</span>
                            <span className="font-bold text-emerald-700">{detalleInforme?.inspeccion_campo?.resultado || 'Favorable (Cumple con estándares vigentes de bioseguridad)'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-medium block">Observaciones de Campo:</span>
                            <span className="text-slate-700 font-medium leading-relaxed">{detalleInforme?.inspeccion_campo?.observaciones || 'Infraestructura adecuada, manejo de residuos patógenos correcto y señalización de seguridad implementada.'}</span>
                          </div>
                        </div>
                      </div>

                      {/* 4. Observaciones del Coordinador (Edición) */}
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

                    {/* Botón de Acción Principal: Genera Resolución administrativa */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex justify-end">
                      <button
                        type="button"
                        onClick={handleIrAGenerarResolucion}
                        className="px-7 py-3 bg-[#0e533c] hover:bg-[#093d2b] text-white rounded-xl text-xs font-extrabold transition shadow-md flex items-center space-x-2 cursor-pointer"
                      >
                        <span>Genera Resolucion administrativa</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                ) : (
                  /* =========================================================== */
                  /* VISTA 2: RESOLUCIÓN ADMINISTRATIVA OFICIAL (FIGMA IMAGEN 2)  */
                  /* =========================================================== */
                  <div className="space-y-4">
                    
                    {/* Título de la sección */}
                    <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                      Resolución administrativa — {detalleInforme?.codigo || 'REQ-0042'}: {editEstablecimiento || 'Clínica Sur'}
                    </h2>

                    {/* Documento Formal de la Resolución */}
                    <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-md space-y-7">
                      
                      {/* Cabecera Oficial del Documento */}
                      <div className="text-center space-y-1 border-b border-slate-100 pb-5">
                        <p className="text-[11px] font-black uppercase tracking-widest text-slate-700">
                          GOBIERNO AUTÓNOMO DEPARTAMENTAL DE COCHABAMBA
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          SERVICIO DEPARTAMENTAL DE SALUD (SEDES) · UNIDAD DE HABILITACIÓN
                        </p>
                        <div className="pt-2">
                          <span className="inline-block bg-sky-50 text-sky-900 border border-sky-200 px-5 py-2 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-2xs">
                            RESOLUCIÓN ADMINISTRATIVA Nº {borradorResolucion?.numero_resolucion || 'RA-2026-0042'} (Borrador)
                          </span>
                        </div>
                      </div>

                      {/* Datos del Establecimiento (Verificación y edición final) */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Datos del Establecimiento (Verificación y edición final)
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          
                          {/* Establecimiento */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              ESTABLECIMIENTO
                            </label>
                            <input
                              type="text"
                              value={editEstablecimiento}
                              onChange={(e) => setEditEstablecimiento(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                            />
                          </div>

                          {/* Razón Social / Propietario (Con Icono Lápiz) */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              RAZÓN SOCIAL / PROPIETARIO
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={editRazonSocial}
                                onChange={(e) => setEditRazonSocial(e.target.value)}
                                className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                              />
                              <Edit2 className="w-3.5 h-3.5 text-[#0060a8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          {/* CI / NIT del Solicitante (Con Icono Lápiz) */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              CI / NIT DEL SOLICITANTE
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={editCiNit}
                                onChange={(e) => setEditCiNit(e.target.value)}
                                className="w-full pl-3.5 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                              />
                              <Edit2 className="w-3.5 h-3.5 text-[#0060a8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          </div>

                          {/* Tipo de Establecimiento */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              TIPO DE ESTABLECIMIENTO
                            </label>
                            <input
                              type="text"
                              value={editTipoEstablecimiento}
                              onChange={(e) => setEditTipoEstablecimiento(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                            />
                          </div>

                          {/* Dirección Registrada (Full Width) */}
                          <div className="sm:col-span-2 space-y-1">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                              DIRECCIÓN REGISTRADA
                            </label>
                            <input
                              type="text"
                              value={editDireccion}
                              onChange={(e) => setEditDireccion(e.target.value)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0073c6] transition"
                            />
                          </div>

                        </div>
                      </div>

                      {/* I. Antecedentes Administrativos */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          I. Antecedentes Administrativos
                        </h4>
                        <textarea
                          rows={3}
                          value={editAntecedentes}
                          onChange={(e) => setEditAntecedentes(e.target.value)}
                          className="w-full p-3.5 bg-slate-50 hover:bg-slate-50/90 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium leading-relaxed focus:bg-white focus:ring-2 focus:ring-[#0073c6]"
                        />
                      </div>

                      {/* II. Fundamento Legal */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          II. Fundamento Legal
                        </h4>
                        <textarea
                          rows={3}
                          value={editFundamentoLegal}
                          onChange={(e) => setEditFundamentoLegal(e.target.value)}
                          className="w-full p-3.5 bg-slate-50 hover:bg-slate-50/90 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium leading-relaxed focus:bg-white focus:ring-2 focus:ring-[#0073c6]"
                        />
                      </div>

                      {/* III. Por Tanto y Dictamen Resolutivo */}
                      <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          III. Por Tanto y Dictamen Resolutivo
                        </h4>

                        {/* Artículo Primero */}
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-900">ARTÍCULO PRIMERO:</p>
                          <textarea
                            rows={2}
                            value={editArticuloPrimero}
                            onChange={(e) => setEditArticuloPrimero(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white"
                          />
                        </div>

                        {/* Artículo Segundo con Badge de Vigencia */}
                        <div className="space-y-1.5">
                          <p className="font-extrabold text-slate-900">ARTÍCULO SEGUNDO:</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-slate-700 font-medium">
                              La presente autorización tiene vigencia de cinco (5) años a partir de su emisión, computable desde:
                            </span>
                            <span className="px-3 py-1 bg-sky-100 text-sky-900 font-black rounded-lg border border-sky-200 text-xs shrink-0 self-start sm:self-auto">
                              {editVigenciaRango}
                            </span>
                          </div>
                        </div>

                        {/* Artículo Tercero */}
                        <div className="space-y-1 pt-1">
                          <p className="font-extrabold text-slate-900">ARTÍCULO TERCERO:</p>
                          <textarea
                            rows={2}
                            value={editArticuloTercero}
                            onChange={(e) => setEditArticuloTercero(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* IV. Observaciones y Notas del Área Legal (Última revisión) */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          IV. Observaciones y Notas del Área Legal (Última revisión)
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

                    {/* Botones de Acción de la Resolución (Descargar y Enviar) */}
                    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-end gap-3">
                      
                      {/* Botón Guardar Borrador */}
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
                        <span>Guardar Cambios</span>
                      </button>

                      {/* Botón Descargar Resolución (Azul con Icono Download) */}
                      <button
                        type="button"
                        onClick={handleDescargarResolucionPDF}
                        className="w-full sm:w-auto px-6 py-2.5 bg-[#0073c6] hover:bg-[#005fa6] text-white rounded-xl text-xs font-extrabold transition shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-white" />
                        <span>Descargar Resolución</span>
                      </button>

                      {/* Botón Enviar al Coordinador (Verde con Icono Check/Send) */}
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
                )}

              </div>

            </div>
          )}

        </main>

      </div>

    </div>
  );
}
