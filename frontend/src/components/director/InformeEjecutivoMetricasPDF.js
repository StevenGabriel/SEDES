import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import logoChakana from '../../assets/Logo Chakana.svg';
import logoCochabamba2 from '../../assets/Logo cochabamba 2.png';
import logoCochabamba3 from '../../assets/logo cochabamba 3.png';

// Helper para convertir cualquier imagen/SVG a PNG DataURL para jsPDF
export const cargarImagenComoPng = (url, maxWidth = 300, maxHeight = 300) => {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        let w = img.naturalWidth || img.width || maxWidth;
        let h = img.naturalHeight || img.height || maxHeight;
        if (w > maxWidth || h > maxHeight) {
          const ratio = Math.min(maxWidth / w, maxHeight / h);
          w = Math.round(maxWidth > 0 ? w * ratio : w);
          h = Math.round(maxHeight > 0 ? h * ratio : h);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      } catch (e) {
        console.warn('Error convirtiendo imagen a PNG:', e);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

/**
 * Genera y descarga el Informe Ejecutivo Oficial de Métricas e Indicadores del SEDES en formato PDF.
 * @param {Object} datosMetricas - Datos estructurados provenientes del endpoint /api/director/metricas-indicadores
 * @param {Object} filtros - Filtros aplicados en la interfaz (período, municipio, supervisor, tipo, etc.)
 * @param {Object} usuario - Usuario logueado (Director General)
 */
export const generarInformeEjecutivoMetricasPDF = async (datosMetricas, filtros = {}, usuario = null) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter' // 215.9 x 279.4 mm
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 16;
  let currentY = 14;

  // Cargar Logos Institucionales
  const [imgChakana, imgCochabamba] = await Promise.all([
    cargarImagenComoPng(logoChakana, 240, 100),
    cargarImagenComoPng(logoCochabamba2 || logoCochabamba3, 240, 100)
  ]);

  // =========================================================================
  // 1. CABECERA INSTITUCIONAL OFICIAL
  // =========================================================================
  if (imgChakana) {
    doc.addImage(imgChakana, 'PNG', marginX, currentY, 28, 14);
  }
  if (imgCochabamba) {
    doc.addImage(imgCochabamba, 'PNG', pageWidth - marginX - 32, currentY, 32, 14);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('ESTADO PLURINACIONAL DE BOLIVIA', pageWidth / 2, currentY + 3, { align: 'center' });

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('GOBIERNO AUTÓNOMO DEPARTAMENTAL DE COCHABAMBA', pageWidth / 2, currentY + 7, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(0, 119, 200); // Azul SEDES #0077c8
  doc.text('SERVICIO DEPARTAMENTAL DE SALUD - SEDES COCHABAMBA', pageWidth / 2, currentY + 11, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('DIRECCIÓN GENERAL | COORDINACIÓN DEPARTAMENTAL DE LABORATORIOS (CODELAB)', pageWidth / 2, currentY + 15, { align: 'center' });

  // Línea divisoria superior institucional bicolor
  currentY += 19;
  doc.setDrawColor(0, 119, 200); // Azul SEDES
  doc.setLineWidth(1.2);
  doc.line(marginX, currentY, pageWidth - marginX, currentY);

  doc.setDrawColor(34, 184, 207); // Cyan SEDES
  doc.setLineWidth(0.4);
  doc.line(marginX, currentY + 1.2, pageWidth - marginX, currentY + 1.2);

  // =========================================================================
  // 2. TÍTULO Y METADATOS DEL INFORME
  // =========================================================================
  currentY += 7;
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(marginX, currentY, pageWidth - marginX * 2, 22, 2.5, 2.5, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, currentY, pageWidth - marginX * 2, 22, 2.5, 2.5, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('INFORME EJECUTIVO DE MÉTRICAS, INDICADORES Y FISCALIZACIÓN', marginX + 4, currentY + 6);

  const ahora = new Date();
  const fechaStr = ahora.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  const horaStr = ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

  // Periodo formateado
  let periodoLabel = 'Todo el Historial / 2026';
  if (filtros.periodo_predefinido === 'este_mes') periodoLabel = 'Mes en Curso';
  else if (filtros.periodo_predefinido === 'ultimos_30') periodoLabel = 'Últimos 30 días';
  else if (filtros.periodo_predefinido === 'ultimos_7') periodoLabel = 'Últimos 7 días';
  else if (filtros.periodo_predefinido === 'personalizado') {
    periodoLabel = `Desde ${filtros.fecha_inicio || 'Inicio'} hasta ${filtros.fecha_fin || 'Hoy'}`;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Fecha y Hora de Emisión: ${fechaStr}, ${horaStr}`, marginX + 4, currentY + 11.5);
  doc.text(`Período Consultado: ${periodoLabel}`, marginX + 4, currentY + 16);

  // Autoridad emisora a la derecha
  const nombreAutoridad = usuario ? `${usuario.nombres || ''} ${usuario.apellidos || ''}`.trim() : 'Dr. Fernando Castillo';
  doc.text(`Emisor: ${nombreAutoridad} (Director General)`, pageWidth - marginX - 4, currentY + 11.5, { align: 'right' });
  doc.text(`Sistema: SI_Lab - Vigilancia Sanitaria SEDES`, pageWidth - marginX - 4, currentY + 16, { align: 'right' });

  // =========================================================================
  // 3. SECCIÓN: INDICADORES CLAVE DE GESTIÓN (KPIS)
  // =========================================================================
  currentY += 27;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 119, 200);
  doc.text('1. INDICADORES CLAVE DE GESTIÓN OPERATIVA (KPIs)', marginX, currentY);

  currentY += 3;
  const kpisData = [
    [
      { content: 'Total Trámites Registrados', styles: { fontStyle: 'bold' } },
      { content: String(datosMetricas?.kpis?.total_tramites?.valor ?? 0), styles: { fontStyle: 'bold', halign: 'center', textColor: [0, 119, 200] } },
      { content: 'Tasa de Aprobación Global', styles: { fontStyle: 'bold' } },
      { content: String(datosMetricas?.kpis?.tasa_aprobacion?.valor ?? '0%'), styles: { fontStyle: 'bold', halign: 'center', textColor: [16, 185, 129] } }
    ],
    [
      { content: 'Tiempo Promedio de Resolución', styles: { fontStyle: 'bold' } },
      { content: String(datosMetricas?.kpis?.tiempo_promedio?.valor ?? '0 días'), styles: { fontStyle: 'bold', halign: 'center', textColor: [14, 165, 233] } },
      { content: 'Cumplimiento Normativo SEDES', styles: { fontStyle: 'bold' } },
      { content: `${datosMetricas?.cuellos_botella?.cumplimiento_pct ?? 100}%`, styles: { fontStyle: 'bold', halign: 'center', textColor: (datosMetricas?.cuellos_botella?.cumplimiento_pct ?? 100) >= 80 ? [16, 185, 129] : [245, 158, 11] } }
    ]
  ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    body: kpisData,
    theme: 'grid',
    styles: { fontSize: 8.5, cellPadding: 2.2 },
    bodyStyles: { fillColor: [255, 255, 255], textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    tableLineColor: [226, 232, 240],
    tableLineWidth: 0.2
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // =========================================================================
  // 4. SECCIÓN: ALERTAS OPERATIVAS Y CUELLOS DE BOTELLA
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 119, 200);
  doc.text('2. CENTRO DE ALERTAS OPERATIVAS Y FISCALIZACIÓN', marginX, currentY);

  currentY += 3;
  const alertasItems = Array.isArray(datosMetricas?.cuellos_botella?.items)
    ? datosMetricas.cuellos_botella.items
    : [];

  const tablaAlertas = alertasItems.map((a) => [
    a.titulo,
    String(a.conteo),
    a.nivel.toUpperCase(),
    a.subtexto
  ]);

  if (tablaAlertas.length === 0) {
    tablaAlertas.push(['Alertas Generales', '0', 'ÓPTIMO', 'Sin cuellos de botella detectados en el período']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [['Categoría de Alerta', 'Cantidad', 'Nivel de Severidad', 'Diagnóstico Operativo']],
    body: tablaAlertas,
    theme: 'grid',
    headStyles: { fillColor: [30, 45, 66], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 32, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 'auto' }
    },
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 2) {
        const txt = String(data.cell.raw || '').toLowerCase();
        if (txt.includes('critico') || txt.includes('crítico')) {
          data.cell.styles.textColor = [225, 29, 72]; // Rose
        } else if (txt.includes('advertencia')) {
          data.cell.styles.textColor = [217, 119, 6]; // Amber
        } else {
          data.cell.styles.textColor = [16, 185, 129]; // Emerald
        }
      }
    }
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // =========================================================================
  // 5. SECCIÓN: DISTRIBUCIÓN TERRITORIAL EN 5 MACRO-REGIONES
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 119, 200);
  doc.text('3. DISTRIBUCIÓN TERRITORIAL (5 MACRO-REGIONES DE COCHABAMBA)', marginX, currentY);

  currentY += 3;
  const regionesData = Array.isArray(datosMetricas?.distribucion_regiones)
    ? datosMetricas.distribucion_regiones
    : [];

  const tablaRegiones = regionesData.map((r) => [
    r.region,
    `${r.municipios_count} municipio(s)`,
    String(r.privados),
    String(r.publicos),
    String(r.total),
    `${r.porcentaje}%`
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [['Macro-Región', 'Municipios con Labs', 'Sector Privado', 'Públicos / Seguros', 'Total Labs', '% Departamental']],
    body: tablaRegiones,
    theme: 'grid',
    headStyles: { fillColor: [0, 119, 200], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 1.8 },
    columnStyles: {
      0: { fontStyle: 'bold' },
      1: { halign: 'center' },
      2: { halign: 'center', textColor: [0, 119, 200], fontStyle: 'bold' },
      3: { halign: 'center', textColor: [8, 145, 178], fontStyle: 'bold' },
      4: { halign: 'center', fontStyle: 'bold' },
      5: { halign: 'center', fontStyle: 'bold' }
    }
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // =========================================================================
  // 6. SECCIÓN: CLASIFICACIÓN POR NIVEL, SECTOR Y SITUACIÓN
  // =========================================================================
  // Si queda poco espacio para la siguiente tabla, agregar página
  if (currentY > pageHeight - 65) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 119, 200);
  doc.text('4. CLASIFICACIÓN POR NIVEL, TIPOLOGÍA Y SITUACIÓN OPERATIVA', marginX, currentY);

  currentY += 3;
  const nivelesData = Array.isArray(datosMetricas?.por_nivel) ? datosMetricas.por_nivel : [];
  const tiposData = Array.isArray(datosMetricas?.por_tipo_laboratorio) ? datosMetricas.por_tipo_laboratorio : [];
  const situacionData = Array.isArray(datosMetricas?.estado_situacion?.items) ? datosMetricas.estado_situacion.items : [];

  const maxRows = Math.max(nivelesData.length, tiposData.length, situacionData.length);
  const tablaMixta = [];

  for (let i = 0; i < maxRows; i++) {
    const niv = nivelesData[i] ? `${nivelesData[i].nivel}: ${nivelesData[i].cantidad} (${nivelesData[i].porcentaje}%)` : '-';
    const tip = tiposData[i] ? `${tiposData[i].sector}: ${tiposData[i].cantidad} (${tiposData[i].porcentaje}%)` : '-';
    const sit = situacionData[i] ? `${situacionData[i].label}: ${situacionData[i].cantidad} (${situacionData[i].porcentaje}%)` : '-';
    tablaMixta.push([niv, tip, sit]);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [['Nivel de Complejidad', 'Tipología / Sector', 'Estado / Situación']],
    body: tablaMixta,
    theme: 'grid',
    headStyles: { fillColor: [30, 45, 66], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 1.8 }
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // =========================================================================
  // 7. SECCIÓN: RANKING DE SUPERVISORES E INSPECCIONES
  // =========================================================================
  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 119, 200);
  doc.text('5. RENDIMIENTO DEL CUERPO DE SUPERVISORES Y FISCALIZADORES', marginX, currentY);

  currentY += 3;
  const supervisoresData = Array.isArray(datosMetricas?.ranking_supervisores) ? datosMetricas.ranking_supervisores : [];
  const tablaSupervisores = supervisoresData.map((s, idx) => [
    `#${idx + 1}`,
    s.nombre,
    `${s.actas} actas registradas`,
    s.calificacion
  ]);

  if (tablaSupervisores.length === 0) {
    tablaSupervisores.push(['-', 'Sin supervisores con actas en el período seleccionado', '0 actas', 'N/A']);
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: marginX, right: marginX },
    head: [['Posición', 'Supervisor / Fiscalizador Asignado', 'Actas de Inspección', 'Calificación de Rendimiento']],
    body: tablaSupervisores,
    theme: 'grid',
    headStyles: { fillColor: [0, 119, 200], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 1.8 },
    columnStyles: {
      0: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      1: { fontStyle: 'bold' },
      2: { cellWidth: 45, halign: 'center' },
      3: { cellWidth: 45, halign: 'center', fontStyle: 'bold' }
    }
  });

  // =========================================================================
  // 8. PIE DE PÁGINA INSTITUCIONAL EN TODAS LAS PÁGINAS
  // =========================================================================
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPaginas; p++) {
    doc.setPage(p);

    // Línea de pie de página
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('SEDES Cochabamba - Documento Oficial de Análisis Estadístico y Toma de Decisiones', marginX, pageHeight - 8);
    doc.text(`Página ${p} de ${totalPaginas}`, pageWidth - marginX, pageHeight - 8, { align: 'right' });
  }

  // Guardar archivo directamente
  const fileName = `Informe_Ejecutivo_Metricas_SEDES_${ahora.toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
  return doc;
};
