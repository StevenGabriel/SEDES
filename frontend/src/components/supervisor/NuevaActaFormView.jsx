import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  Calendar as CalendarIcon,
  User,
  MapPin,
  Clock,
  ShieldCheck,
  Save,
  Check,
  Printer,
  Info,
  Layers,
  Award,
  AlertCircle
} from 'lucide-react';

import logoL1 from '../../assets/L1.png';
import logoL2 from '../../assets/L2.png';

// CATÁLOGO OFICIAL DE CRITERIOS DE INSPECCIÓN SEDES COCHABAMBA
const SECCIONES_FORMULARIO = [
  {
    id: 'sec1',
    codigo: 'I',
    titulo: 'INFRAESTRUCTURA Y AMBIENTES FÍSICOS',
    subtitulo: 'Condiciones edilicias, delimitación de áreas y saneamiento básico.',
    peso: 25,
    criterios: [
      {
        id: 'c1',
        num: '1.1',
        criterio: 'Sala de Espera y Recepción de Pacientes',
        estandar: 'Espacio ventilado, iluminado, con asientos confortables y cartelera informativa de horarios y aranceles.',
        pesoItem: 3
      },
      {
        id: 'c2',
        num: '1.2',
        criterio: 'Área de Toma de Muestras Biológicas',
        estandar: 'Sillón de flebotomía con descansabrazos, lavamanos con jabón antiséptico, toallas desechables y camilla ginecológica si aplica.',
        pesoItem: 4
      },
      {
        id: 'c3',
        num: '1.3',
        criterio: 'Área Técnica / Analítica Principal',
        estandar: 'Mesones lisos de material lavable no poroso (granito/cerámica), resistentes a ácidos, con tomas eléctricas con conexión a tierra.',
        pesoItem: 5
      },
      {
        id: 'c4',
        num: '1.4',
        criterio: 'Área de Lavado y Esterilización de Material',
        estandar: 'Fregadero con doble poceta, provisión continua de agua potable y drenaje adecuado para desechos líquidos.',
        pesoItem: 4
      },
      {
        id: 'c5',
        num: '1.5',
        criterio: 'Almacén y Depósito de Reactivos',
        estandar: 'Ambiente exclusivo, fresco, protegido de la radiación solar directa, con estantes metálicos seguros.',
        pesoItem: 3
      },
      {
        id: 'c6',
        num: '1.6',
        criterio: 'Servicios Higiénicos Diferenciados',
        estandar: 'Baño para pacientes y baño independiente para el personal técnico, provistos de insumos de aseo continuo.',
        pesoItem: 3
      },
      {
        id: 'c7',
        num: '1.7',
        criterio: 'Señalización y Rutas de Evacuación',
        estandar: 'Señalética de seguridad, salida de emergencia, riesgo biológico e iluminación de emergencia funcional.',
        pesoItem: 3
      }
    ]
  },
  {
    id: 'sec2',
    codigo: 'II',
    titulo: 'BIOSEGURIDAD Y GESTIÓN DE RESIDUOS SÓLIDOS',
    subtitulo: 'Protocolos de protección personal, manejo de RPBI y contingencias.',
    peso: 25,
    criterios: [
      {
        id: 'c8',
        num: '2.1',
        criterio: 'Uso Obligatorio de Equipos de Protección Personal (EPP)',
        estandar: 'Uso permanente de bata blanca abotonada, guantes de látex/nitrilo, mascarilla quirúrgica/KN95 y gafas de bioseguridad.',
        pesoItem: 4
      },
      {
        id: 'c9',
        num: '2.2',
        criterio: 'Segregación de Residuos Infecciosos (Bolsa Roja)',
        estandar: 'Basureros de pedal con bolsa roja rotulada para gasas, torundas, guantes y muestras biológicas.',
        pesoItem: 4
      },
      {
        id: 'c10',
        num: '2.3',
        criterio: 'Contenedores Rígidos para Cortopunzantes',
        estandar: 'Recipientes plásticos rígidos e impermeables con tapa hermética para agujas, lancetas y capilares al 75% de llenado.',
        pesoItem: 5
      },
      {
        id: 'c11',
        num: '2.4',
        criterio: 'Segregación de Residuos Comunes (Bolsa Negra)',
        estandar: 'Tachos con bolsa negra para papeles, envoltorios y residuos no biológicos en salas de espera y oficinas.',
        pesoItem: 3
      },
      {
        id: 'c12',
        num: '2.5',
        criterio: 'Contrato y Registro de Disposición Final de Residuos',
        estandar: 'Contrato vigente con empresa de recojo de residuos biocontaminados y manifiestos de retiro al día.',
        pesoItem: 4
      },
      {
        id: 'c13',
        num: '2.6',
        criterio: 'Extintores con Carga y Sello Vigentes',
        estandar: 'Extintores ABC y CO2 con prueba hidrostática y carga vigente, instalados a 1.50 metros sobre el nivel del suelo.',
        pesoItem: 3
      },
      {
        id: 'c14',
        num: '2.7',
        criterio: 'Manual de Bioseguridad y Kit ante Derrames',
        estandar: 'Manual de bioseguridad accesible y kit de neutralización (hipoclorito 5%, aserrín/arena, guantes gruesos).',
        pesoItem: 2
      }
    ]
  },
  {
    id: 'sec3',
    codigo: 'III',
    titulo: 'EQUIPAMIENTO, INSTRUMENTAL Y CALIBRACIÓN',
    subtitulo: 'Aparatos de diagnóstico analítico, registros de mantenimiento y calibración.',
    peso: 25,
    criterios: [
      {
        id: 'c15',
        num: '3.1',
        criterio: 'Microscopio Óptico Binocular',
        estandar: 'En óptimo estado de alineación y limpieza, con objetivos 10x, 40x y 100x de inmersión y aceite de inmersión de calidad.',
        pesoItem: 4
      },
      {
        id: 'c16',
        num: '3.2',
        criterio: 'Centrífuga de Tubos Analítica',
        estandar: 'Centrífuga con tacómetro, control de tiempo, freno gradual y certificación de mantenimiento semestral.',
        pesoItem: 4
      },
      {
        id: 'c17',
        num: '3.3',
        criterio: 'Baño María / Incubadora Termostática',
        estandar: 'Termostato constante regulado a 37°C con termómetro calibrado sumergido en agua para verificación diaria.',
        pesoItem: 3
      },
      {
        id: 'c18',
        num: '3.4',
        criterio: 'Espectrofotómetro / Analizador Bioquímico',
        estandar: 'Analizador clínico calibrado con curvas de calibración vigentes y registros de mantenimiento preventivo.',
        pesoItem: 5
      },
      {
        id: 'c19',
        num: '3.5',
        criterio: 'Refrigerador Exclusivo para Reactivos',
        estandar: 'Heladera con termómetro de máxima y mínima colocado en estante medio (rango obligatorio entre 2°C y 8°C).',
        pesoItem: 4
      },
      {
        id: 'c20',
        num: '3.6',
        criterio: 'Micropipetas Automáticas Calibradas',
        estandar: 'Micropipetas de volumen variable con puntas estériles y certificados de calibración periódica.',
        pesoItem: 3
      },
      {
        id: 'c21',
        num: '3.7',
        criterio: 'Programa de Control de Calidad Interno y Externo',
        estandar: 'Planillas de control de calidad interno (gráficos de Levey-Jennings) y constancia de participación en PEEC.',
        pesoItem: 2
      }
    ]
  },
  {
    id: 'sec4',
    codigo: 'IV',
    titulo: 'RECURSOS HUMANOS Y DOCUMENTACIÓN NORMATIVA',
    subtitulo: 'Acreditación profesional, registros de pacientes y expedientes.',
    peso: 15,
    criterios: [
      {
        id: 'c22',
        num: '4.1',
        criterio: 'Título en Provisión Nacional y Matrícula Profesional',
        estandar: 'Título de Bioquímico(a) / Farmacéutico(a) y Matrícula Profesional emitida por el Ministerio de Salud / SEDES.',
        pesoItem: 4
      },
      {
        id: 'c23',
        num: '4.2',
        criterio: 'Registro en Colegio de Bioquímica y Farmacia',
        estandar: 'Certificado de compatibilidad horaria y constancia de inscripción colegiada vigente.',
        pesoItem: 3
      },
      {
        id: 'c24',
        num: '4.3',
        criterio: 'Libro de Registro de Pacientes Foliado / Digital',
        estandar: 'Libro foliado notariado o sistema informático con control de accesos y respaldo diario de datos.',
        pesoItem: 4
      },
      {
        id: 'c25',
        num: '4.4',
        criterio: 'Archivo y Custodia de Resultados (Mínimo 5 Años)',
        estandar: 'Archivo físico ordenado o base de datos digital garantizando confidencialidad y conservación por 5 años.',
        pesoItem: 4
      }
    ]
  },
  {
    id: 'sec5',
    codigo: 'V',
    titulo: 'REACTIVOS, MATERIALES Y SUMINISTROS',
    subtitulo: 'Registro sanitario AGEMED, conservación y trazabilidad.',
    peso: 10,
    criterios: [
      {
        id: 'c26',
        num: '5.1',
        criterio: 'Registro Sanitario Vigente (AGEMED)',
        estandar: 'Kits y reactivos diagnósticos con Registro Sanitario vigente otorgado por AGEMED.',
        pesoItem: 4
      },
      {
        id: 'c27',
        num: '5.2',
        criterio: 'Control Estricto de Fechas de Vencimiento',
        estandar: 'Inexistencia total de reactivos, tiras o insumos con fecha de caducidad expirada en estanterías o heladera.',
        pesoItem: 3
      },
      {
        id: 'c28',
        num: '5.3',
        criterio: 'Provisión de Agua de Calidad Analítica',
        estandar: 'Agua destilada o desionizada para lavado de material crítico y preparación de soluciones.',
        pesoItem: 3
      }
    ]
  }
];

export default function NuevaActaFormView({ usuario, onVolver, onActaGuardada, mostrarToast }) {
  // Datos Generales
  const [inspeccionesDisponibles, setInspeccionesDisponibles] = useState([]);
  const [inspeccionSeleccionadaId, setInspeccionSeleccionadaId] = useState('');
  const [establecimientoNombre, setEstablecimientoNombre] = useState('Laboratorio Prueba 2');
  const [propietarioNombre, setPropietarioNombre] = useState('Dr. Juan Pérez');
  const [tipoTramite, setTipoTramite] = useState('Apertura');
  const [direccionTexto, setDireccionTexto] = useState('Av. Juan de la Rosa #1234');
  const [municipioTexto, setMunicipioTexto] = useState('CERCADO');
  const [codigoTramite, setCodigoTramite] = useState('TRM-EA5A7A75');
  const [fechaInspeccion, setFechaInspeccion] = useState(() => new Date().toISOString().slice(0, 10));

  // Respuestas del checklist: { [criterioId]: 'C' | 'NC' | 'NA' }
  const [evaluaciones, setEvaluaciones] = useState(() => {
    const init = {};
    SECCIONES_FORMULARIO.forEach(sec => {
      sec.criterios.forEach(c => {
        init[c.id] = 'C'; // Por defecto "Cumple"
      });
    });
    return init;
  });

  // Observaciones específicas por criterio: { [criterioId]: string }
  const [observacionesItems, setObservacionesItems] = useState({});

  // Dictamen y Conclusiones Finales
  const [resultadoFinal, setResultadoFinal] = useState('Aprobado');
  const [plazoSubsanacionDias, setPlazoSubsanacionDias] = useState(10);
  const [conclusionesGenerales, setConclusionesGenerales] = useState(
    'El establecimiento cumple satisfactoriamente con los requisitos de infraestructura, equipamiento calibrado y personal técnico acreditado según la normativa de salud de SEDES Cochabamba.'
  );
  const [guardando, setGuardando] = useState(false);

  // 1. Cargar inspecciones desde el backend
  useEffect(() => {
    const cargarInspecciones = async () => {
      const supId = usuario?.id || usuario?.email || (usuario?.nombres ? `${usuario.nombres} ${usuario.apellidos}` : '');
      if (!supId) return;
      try {
        const res = await fetch(`http://localhost:8000/api/supervisor/${encodeURIComponent(supId)}/agenda`);
        if (res.ok) {
          const data = await res.json();
          const lista = [...(data.eventos || []), ...(data.pendientes || [])];
          setInspeccionesDisponibles(lista);
          if (lista.length > 0) {
            const first = lista[0];
            setInspeccionSeleccionadaId(first.inspeccion_id || first.id || '');
            setEstablecimientoNombre(first.establecimiento || first.nombre || '');
            setPropietarioNombre(first.propietario || 'Responsable Técnico');
            setTipoTramite(first.tipo || 'Apertura');
            setDireccionTexto(first.direccion || 'Cochabamba');
            setMunicipioTexto(first.municipio || 'CERCADO');
            setCodigoTramite(first.codigo_tramite || first.codigo || 'TRM-001');
          }
        }
      } catch (err) {
        console.warn('Error al cargar agenda para acta:', err);
      }
    };
    cargarInspecciones();
  }, [usuario]);

  // Manejar cambio de establecimiento seleccionado
  const handleSeleccionarEstablecimiento = (e) => {
    const id = e.target.value;
    setInspeccionSeleccionadaId(id);
    const item = inspeccionesDisponibles.find(i => (i.inspeccion_id === id || i.id === id));
    if (item) {
      setEstablecimientoNombre(item.establecimiento || item.nombre || '');
      setPropietarioNombre(item.propietario || 'Responsable Técnico');
      setTipoTramite(item.tipo || 'Apertura');
      setDireccionTexto(item.direccion || 'Cochabamba');
      setMunicipioTexto(item.municipio || 'CERCADO');
      setCodigoTramite(item.codigo_tramite || item.codigo || 'TRM-001');
    }
  };

  // 2. Calcular porcentaje de cumplimiento en tiempo real
  const { puntajeTotal, maxPuntaje, porcentaje, conteoC, conteoNC, conteoNA } = useMemo(() => {
    let total = 0;
    let max = 0;
    let c = 0;
    let nc = 0;
    let na = 0;

    SECCIONES_FORMULARIO.forEach(sec => {
      sec.criterios.forEach(crit => {
        const estado = evaluaciones[crit.id] || 'C';
        if (estado === 'C') {
          total += crit.pesoItem;
          max += crit.pesoItem;
          c++;
        } else if (estado === 'NC') {
          max += crit.pesoItem;
          nc++;
        } else {
          // 'NA' no penaliza el total máximo
          na++;
        }
      });
    });

    const pct = max > 0 ? Math.round((total / max) * 100) : 100;
    return { puntajeTotal: total, maxPuntaje: max, porcentaje: pct, conteoC: c, conteoNC: nc, conteoNA: na };
  }, [evaluaciones]);

  // Actualizar dictamen sugerido automáticamente según porcentaje
  useEffect(() => {
    if (porcentaje >= 85) {
      setResultadoFinal('Aprobado');
    } else if (porcentaje >= 70) {
      setResultadoFinal('Con Observaciones');
    } else {
      setResultadoFinal('Rechazado');
    }
  }, [porcentaje]);

  // Cambiar evaluación de un criterio (C, NC, NA)
  const handleCambiarEvaluacion = (criterioId, valor) => {
    setEvaluaciones(prev => ({ ...prev, [criterioId]: valor }));
  };

  // Cambiar observación específica
  const handleCambiarObservacion = (criterioId, texto) => {
    setObservacionesItems(prev => ({ ...prev, [criterioId]: texto }));
  };

  // Guardar y Emitir Acta Oficial
  const handleEmitirActa = async (e) => {
    e.preventDefault();
    if (!conclusionesGenerales.trim()) {
      mostrarToast?.('Por favor redacte las conclusiones y recomendaciones técnicas del acta.', 'warning');
      return;
    }

    setGuardando(true);
    try {
      const supId = usuario?.id || usuario?.email || `${usuario?.nombres || ''} ${usuario?.apellidos || ''}`.trim();
      const ahora = new Date();
      const numActaGenerado = `ACT-${ahora.getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, '0')}`;

      // Recopilar observaciones de ítems con no cumplimiento
      const noCumplidos = [];
      SECCIONES_FORMULARIO.forEach(sec => {
        sec.criterios.forEach(crit => {
          if (evaluaciones[crit.id] === 'NC') {
            const obs = observacionesItems[crit.id] ? ` (${observacionesItems[crit.id]})` : '';
            noCumplidos.push(`• [${crit.num}] ${crit.criterio}${obs}`);
          }
        });
      });

      let obsCompuesta = conclusionesGenerales.trim();
      if (noCumplidos.length > 0) {
        obsCompuesta += `\n\nAspectos observados a subsanar:\n${noCumplidos.join('\n')}`;
      }
      if (resultadoFinal === 'Con Observaciones') {
        obsCompuesta += `\n\nPlazo de subsanación fijado: ${plazoSubsanacionDias} días hábiles.`;
      }

      const response = await fetch('http://localhost:8000/api/supervisor/registrar-acta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inspeccion_id: inspeccionSeleccionadaId || null,
          supervisor_id: supId,
          resultado: resultadoFinal,
          tipo_inspeccion: tipoTramite,
          observaciones: obsCompuesta,
          numero_acta: numActaGenerado,
          cumple_infraestructura: porcentaje >= 70,
          cumple_equipamiento: porcentaje >= 70,
          cumple_personal: porcentaje >= 70,
          cumple_bioseguridad: porcentaje >= 70
        })
      });

      if (response.ok) {
        const data = await response.json();
        mostrarToast?.(data.mensaje || `¡Acta oficial ${numActaGenerado} emitida con éxito!`, 'success');
        onActaGuardada?.();
      } else {
        const err = await response.json();
        mostrarToast?.(err.detail || 'Error al emitir el acta técnica.', 'warning');
      }
    } catch (err) {
      console.warn('Error al emitir acta técnica:', err);
      mostrarToast?.('Error de conexión al emitir el acta.', 'warning');
    } finally {
      setGuardando(false);
    }
  };

  const supervisorNombre = usuario 
    ? `${usuario.nombres} ${usuario.apellidos}` 
    : 'Supervisor Técnico';

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* ===================================================================== */}
      {/* 1. CABECERA CON BOTÓN VOLVER Y ACCIÓN DE EMISIÓN                      */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-16 z-20">
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onVolver}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Volver al historial de actas"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-[#0060a8] border border-blue-200 px-2.5 py-0.5 rounded-full">
                Formulario Oficial SEDES
              </span>
              <span className="text-xs font-bold text-slate-400">
                Resolución Ministerial Nº 0127
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Instrumento de Evaluación Técnica de Laboratorios
            </h2>
          </div>
        </div>

        {/* Medidor de Puntaje y Botón de Emisión */}
        <div className="flex items-center space-x-4 self-end md:self-auto">
          
          {/* Indicador de Porcentaje */}
          <div className="text-right">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Puntaje Global
            </div>
            <div className={`text-xl font-black ${
              porcentaje >= 85 ? 'text-emerald-600' : porcentaje >= 70 ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {porcentaje}% <span className="text-xs font-bold text-slate-400">({puntajeTotal}/{maxPuntaje} pts)</span>
            </div>
          </div>

          {/* Botón Primario Emitir */}
          <button
            type="button"
            onClick={handleEmitirActa}
            disabled={guardando}
            className="px-6 py-3 rounded-2xl bg-[#1b2533] hover:bg-[#111827] text-white font-black text-xs sm:text-sm transition shadow-md hover:shadow-xl inline-flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {guardando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Firmando Acta...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Emitir y Firmar Acta</span>
              </>
            )}
          </button>

        </div>

      </div>

      {/* ===================================================================== */}
      {/* 2. SECCIÓN: DATOS GENERALES DEL ESTABLECIMIENTO                       */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-5">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-[#0060a8]" />
            <span>1. DATOS GENERALES DEL ESTABLECIMIENTO INSPECCIONADO</span>
          </h3>
          <span className="text-xs font-bold text-slate-400">
            {codigoTramite}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Selector Establecimiento */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-[11px] font-extrabold text-slate-600 block uppercase tracking-wider">
              Establecimiento Asignado / Trámite:
            </label>
            {inspeccionesDisponibles.length > 0 ? (
              <select
                value={inspeccionSeleccionadaId}
                onChange={handleSeleccionarEstablecimiento}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0060a8] outline-none cursor-pointer"
              >
                {inspeccionesDisponibles.map((item) => (
                  <option key={item.inspeccion_id || item.id} value={item.inspeccion_id || item.id}>
                    {item.establecimiento || item.nombre} — ({item.tipo || 'Inspección'} / {item.municipio || 'Cercado'})
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={establecimientoNombre}
                onChange={(e) => setEstablecimientoNombre(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0060a8] outline-none"
              />
            )}
          </div>

          {/* Fecha Inspección */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-600 block uppercase tracking-wider">
              Fecha de Inspección In-Situ:
            </label>
            <input
              type="date"
              value={fechaInspeccion}
              onChange={(e) => setFechaInspeccion(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0060a8] outline-none cursor-pointer"
            />
          </div>

          {/* Director Técnico / Propietario */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-600 block uppercase tracking-wider">
              Responsable / Director Técnico:
            </label>
            <input
              type="text"
              value={propietarioNombre}
              onChange={(e) => setPropietarioNombre(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0060a8] outline-none"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-600 block uppercase tracking-wider">
              Dirección del Establecimiento:
            </label>
            <input
              type="text"
              value={direccionTexto}
              onChange={(e) => setDireccionTexto(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0060a8] outline-none"
            />
          </div>

          {/* Supervisor Técnico */}
          <div className="space-y-1">
            <label className="text-[11px] font-extrabold text-slate-600 block uppercase tracking-wider">
              Supervisor Acreditado SEDES:
            </label>
            <input
              type="text"
              disabled
              value={supervisorNombre}
              className="w-full px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-slate-700 cursor-not-allowed"
            />
          </div>

        </div>

      </div>

      {/* ===================================================================== */}
      {/* 3. TABLAS DE EVALUACIÓN POR CATEGORÍAS NORMATIVAS (I a V)            */}
      {/* ===================================================================== */}
      <div className="space-y-6">
        {SECCIONES_FORMULARIO.map((sec) => (
          <div 
            key={sec.id}
            className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden"
          >
            {/* Cabecera de la Sección */}
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-lg bg-[#005596] text-white flex items-center justify-center font-extrabold text-xs shrink-0">
                    {sec.codigo}
                  </span>
                  <span>{sec.titulo}</span>
                </h4>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5 pl-8">
                  {sec.subtitulo}
                </p>
              </div>

              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-blue-50 text-[#005596] border border-blue-200 self-start sm:self-auto">
                Ponderación: {sec.peso}%
              </span>
            </div>

            {/* Tabla de Criterios */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                
                <thead className="bg-white text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3 w-12 text-center">Nº</th>
                    <th className="px-4 py-3 min-w-[260px]">CRITERIO Y EXIGENCIA NORMATIVA</th>
                    <th className="px-4 py-3 w-48 text-center">EVALUACIÓN</th>
                    <th className="px-4 py-3 min-w-[200px]">HALLAZGOS / OBSERVACIONES</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium">
                  {sec.criterios.map((crit) => {
                    const evalActual = evaluaciones[crit.id] || 'C';
                    const obsActual = observacionesItems[crit.id] || '';

                    return (
                      <tr 
                        key={crit.id}
                        className={`
                          transition-colors
                          ${evalActual === 'NC' ? 'bg-rose-50/40' : evalActual === 'NA' ? 'bg-slate-50/40' : 'hover:bg-slate-50/70'}
                        `}
                      >
                        {/* Número */}
                        <td className="px-4 py-3.5 text-center font-extrabold text-slate-500">
                          {crit.num}
                        </td>

                        {/* Criterio y Estándar */}
                        <td className="px-4 py-3.5 space-y-0.5">
                          <p className="font-extrabold text-slate-900 text-xs">
                            {crit.criterio}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-snug">
                            {crit.estandar}
                          </p>
                        </td>

                        {/* Botones de Evaluación: Cumple / No Cumple / No Aplica */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl space-x-1 border border-slate-200">
                            
                            {/* Cumple (C) */}
                            <button
                              type="button"
                              onClick={() => handleCambiarEvaluacion(crit.id, 'C')}
                              className={`
                                px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer
                                ${evalActual === 'C' 
                                  ? 'bg-emerald-600 text-white shadow-2xs' 
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                                }
                              `}
                              title="Cumple con el estándar normativo"
                            >
                              C
                            </button>

                            {/* No Cumple (NC) */}
                            <button
                              type="button"
                              onClick={() => handleCambiarEvaluacion(crit.id, 'NC')}
                              className={`
                                px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer
                                ${evalActual === 'NC' 
                                  ? 'bg-rose-600 text-white shadow-2xs' 
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                                }
                              `}
                              title="No cumple con el estándar"
                            >
                              NC
                            </button>

                            {/* No Aplica (NA) */}
                            <button
                              type="button"
                              onClick={() => handleCambiarEvaluacion(crit.id, 'NA')}
                              className={`
                                px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer
                                ${evalActual === 'NA' 
                                  ? 'bg-slate-700 text-white shadow-2xs' 
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                                }
                              `}
                              title="No aplica a este nivel de complejidad"
                            >
                              NA
                            </button>

                          </div>
                        </td>

                        {/* Observación Específica */}
                        <td className="px-4 py-3.5">
                          <input
                            type="text"
                            placeholder={evalActual === 'NC' ? 'Especifique la deficiencia...' : 'Observación (opcional)...'}
                            value={obsActual}
                            onChange={(e) => handleCambiarObservacion(crit.id, e.target.value)}
                            className={`
                              w-full px-3 py-1.5 rounded-xl text-xs font-semibold outline-none transition border
                              ${evalActual === 'NC' 
                                ? 'bg-white border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-400 placeholder-rose-300' 
                                : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#0060a8]'
                              }
                            `}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>

          </div>
        ))}
      </div>

      {/* ===================================================================== */}
      {/* 4. SECCIÓN FINAL: DICTAMEN, CONCLUSIONES Y FIRMAS                     */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
        
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight flex items-center space-x-2">
            <Award className="w-4 h-4 text-[#0060a8]" />
            <span>DICTAMEN TÉCNICO Y CONCLUSIONES DEL INSPECTOR</span>
          </h3>
          <span className={`text-xs font-black px-3 py-1 rounded-full border ${
            resultadoFinal === 'Aprobado'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : resultadoFinal === 'Con Observaciones'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            Veredicto: {resultadoFinal}
          </span>
        </div>

        {/* Resumen de Cumplimiento */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
          
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center space-x-3 text-emerald-900">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[10px] uppercase text-emerald-700">Criterios Cumplidos (C)</p>
              <p className="text-lg font-black">{conteoC} ítems</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-900">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <p className="text-[10px] uppercase text-rose-700">No Cumplidos (NC)</p>
              <p className="text-lg font-black">{conteoNC} ítems</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3 text-slate-700">
            <Info className="w-6 h-6 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase text-slate-500">No Aplican (NA)</p>
              <p className="text-lg font-black">{conteoNA} ítems</p>
            </div>
          </div>

        </div>

        {/* Selección del Veredicto Final */}
        <div className="space-y-2">
          <label className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">
            Dictamen Oficial Definitivo:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Aprobado */}
            <button
              type="button"
              onClick={() => setResultadoFinal('Aprobado')}
              className={`
                p-4 rounded-2xl border text-left transition cursor-pointer flex items-start space-x-3
                ${resultadoFinal === 'Aprobado'
                  ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-200'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
                }
              `}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-slate-900 text-xs">APROBADO (Favorable)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Cumplimiento &ge; 85% sin infracciones críticas.</p>
              </div>
            </button>

            {/* Con Observaciones */}
            <button
              type="button"
              onClick={() => setResultadoFinal('Con Observaciones')}
              className={`
                p-4 rounded-2xl border text-left transition cursor-pointer flex items-start space-x-3
                ${resultadoFinal === 'Con Observaciones'
                  ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-200'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
                }
              `}
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-slate-900 text-xs">CON OBSERVACIONES</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Requiere subsanación con plazo perentorio.</p>
              </div>
            </button>

            {/* Rechazado */}
            <button
              type="button"
              onClick={() => setResultadoFinal('Rechazado')}
              className={`
                p-4 rounded-2xl border text-left transition cursor-pointer flex items-start space-x-3
                ${resultadoFinal === 'Rechazado'
                  ? 'bg-rose-50/90 border-rose-500 ring-2 ring-rose-200'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
                }
              `}
            >
              <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-black text-slate-900 text-xs">RECHAZADO (Desfavorable)</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Incumplimiento crítico o puntaje inferior al 70%.</p>
              </div>
            </button>

          </div>
        </div>

        {/* Plazo de Subsanación (si es con observaciones) */}
        {resultadoFinal === 'Con Observaciones' && (
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 animate-fadeIn text-xs">
            <label className="font-black text-amber-900 block">
              Plazo de Subsanación Otorgado al Laboratorio (Días Hábiles):
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                min="5"
                max="30"
                value={plazoSubsanacionDias}
                onChange={(e) => setPlazoSubsanacionDias(Number(e.target.value))}
                className="w-28 px-3 py-2 bg-white border border-amber-300 rounded-xl font-black text-slate-800 focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <span className="text-amber-800 font-bold">
                días hábiles para presentar descargos técnicos ante SEDES.
              </span>
            </div>
          </div>
        )}

        {/* Conclusiones Técnicas */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-extrabold text-slate-700 block uppercase tracking-wider">
            Conclusiones, Recomendaciones y Fundamento del Inspector:
          </label>
          <textarea
            rows={4}
            value={conclusionesGenerales}
            onChange={(e) => setConclusionesGenerales(e.target.value)}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#0060a8] outline-none leading-relaxed"
            placeholder="Redacte las conclusiones técnicas del acta..."
            required
          />
        </div>

        {/* Firmas Institucionales */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <p className="font-black text-slate-900">{supervisorNombre}</p>
            <p className="text-[10px] text-slate-500 font-bold">Supervisor Técnico Acreditado</p>
            <p className="text-[9px] text-[#0060a8] font-bold">SEDES Cochabamba</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
            <p className="font-black text-slate-900">{propietarioNombre}</p>
            <p className="text-[10px] text-slate-500 font-bold">Director Técnico / Responsable</p>
            <p className="text-[9px] text-slate-400">{establecimientoNombre}</p>
          </div>
        </div>

        {/* Barra Inferior de Guardado */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onVolver}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
          >
            Cancelar y Volver
          </button>

          <button
            type="button"
            onClick={handleEmitirActa}
            disabled={guardando}
            className="px-8 py-3 rounded-2xl bg-[#1b2533] hover:bg-[#111827] text-white font-black text-xs sm:text-sm transition shadow-lg hover:shadow-xl inline-flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {guardando ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Firmando y Emitiendo Acta...</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-4 h-4 text-emerald-400" />
                <span>Emitir y Firmar Acta Oficial</span>
              </>
            )}
          </button>
        </div>

      </div>

    </div>
  );
}
