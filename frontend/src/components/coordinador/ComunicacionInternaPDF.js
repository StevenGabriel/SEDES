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
        console.warn('Error convirtiendo imagen:', e);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

// Helper para parsear responsables de áreas de especialidad
export const parsearResponsablesAreas = (rawRespAreas) => {
  if (!rawRespAreas) return [];
  if (Array.isArray(rawRespAreas)) return rawRespAreas;
  if (typeof rawRespAreas !== 'string') return [];

  const str = rawRespAreas.trim();
  if (!str) return [];

  // Si ya es un texto completo con "como responsable de..."
  if (str.toLowerCase().startsWith('como responsable de') || str.toLowerCase().startsWith(', como responsable de')) {
    const regex = /(?:como\s+responsable\s+de\s+)([^,y]+?)\s+(?:la\s+|el\s+|el\/la\s+)?(DRA\.|DR\.|LIC\.|SRA\.|SR\.|[A-ZÁÉÍÓÚÑa-záéíóúñ\s.]+?)(?:\s+con\s+C\.?I\.?\s*(?:Nro\.?)?\s*([^,y]+?))(?=(?:,\s*como\s+responsable|\s+y\s+como\s+responsable|$))/gi;
    let match;
    const items = [];
    while ((match = regex.exec(str)) !== null) {
      items.push({
        area: match[1].trim(),
        nombre: match[2].trim(),
        ci: match[3] ? match[3].trim() : ''
      });
    }
    if (items.length > 0) return items;
  }

  // Separar por ';' o saltos de línea
  const items = str.split(/[;\n]+/).map(s => s.trim()).filter(Boolean);
  const resultado = [];

  for (const item of items) {
    // Patrón típico: "Inmunología: DRA. MARIA ANGELICA RIVERA (CI: 1932727)"
    const parts = item.split(':');
    if (parts.length >= 2) {
      const area = parts[0].trim();
      const resto = parts.slice(1).join(':').trim();
      const ciMatch = resto.match(/\((?:CI:?|C\.I\.?:?|Nro\.?:?)?\s*([^)]+)\)/i) || resto.match(/con C\.?I\.?\s*(?:Nro\.?)?\s*([0-9a-zA-Z\s]+)/i);
      const ci = ciMatch ? ciMatch[1].trim() : '';
      const nombre = resto.replace(/\((?:CI:?|C\.I\.?:?|Nro\.?:?)?\s*([^)]+)\)/i, '').replace(/con C\.?I\.?\s*(?:Nro\.?)?\s*([0-9a-zA-Z\s]+)/i, '').trim();
      if (area && nombre) {
        resultado.push({ area, nombre, ci });
        continue;
      }
    }

    // Si viene solo nombre del área sin encargado registrado aún
    if (item && item.length > 2 && !item.includes('(')) {
      resultado.push({ area: item, nombre: '', ci: '' });
    }
  }

  return resultado;
};

// Helper para armar la redacción fluida de responsables de área en Párrafo 1 y 3
export const formatearTextoResponsablesAreasP1 = (areasList, rawString = '') => {
  const validAreas = (areasList || []).filter(a => a.nombre && a.nombre.trim());
  if (validAreas.length === 0) {
    if (rawString && rawString.trim()) {
      const trimmed = rawString.trim();
      if (trimmed.toLowerCase().startsWith('como responsable de')) {
        return `, ${trimmed}`;
      } else if (trimmed.toLowerCase().startsWith(', como responsable de')) {
        return trimmed;
      }
    }
    return '';
  }

  const fragmentos = validAreas.map(a => {
    const ciTxt = a.ci ? ` con C.I. Nro. ${a.ci}` : '';
    return `como responsable de ${a.area} ${a.nombre}${ciTxt}`;
  });

  if (fragmentos.length === 1) {
    return `, ${fragmentos[0]}`;
  } else if (fragmentos.length === 2) {
    return `, ${fragmentos[0]} y ${fragmentos[1]}`;
  } else {
    const todosMenosUltimo = fragmentos.slice(0, -1).join(', ');
    const ultimo = fragmentos[fragmentos.length - 1];
    return `, ${todosMenosUltimo} y ${ultimo}`;
  }
};

/**
 * Genera el documento oficial de 3 páginas de 'COMUNICACIÓN INTERNA'
 * Siguiendo la estructura fiel del documento oficial de SEDES Cochabamba.
 */
export async function generarComunicacionInternaPDF(tramite, opciones = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 215.9 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 279.4 mm
  const marginX = 22;
  const contentWidth = pageWidth - (marginX * 2);

  // Cargar los 3 logos oficiales con alta definición
  const [imgChakana, imgCochabamba2, imgCochabamba3] = await Promise.all([
    cargarImagenComoPng(logoChakana, 360, 360),
    cargarImagenComoPng(logoCochabamba2, 360, 360),
    cargarImagenComoPng(logoCochabamba3, 360, 360)
  ]);

  // Datos normalizados del trámite
  const estabNombre = (tramite?.establecimiento || tramite?.nombre_comercial || 'LABORATORIO CENTRAL BIOTEST').toUpperCase();
  const propietarioNombre = (tramite?.propietario || tramite?.representante_legal || 'Dr. Roberto Salvatierra Flores').toUpperCase();
  const ciPropietario = tramite?.ci_nit || tramite?.ci || '3799203 CB.';
  const tipoTramite = (tramite?.tipo || 'RENOVACIÓN DE HABILITACIÓN').toUpperCase();
  const direccion = tramite?.direccion || 'Calle Aurelio Melean s/n casi pasaje Rouma, zona Muyurina';
  const municipio = tramite?.municipio || 'Cochabamba';
  const supervisorNombre = tramite?.supervisorAsignado || tramite?.supervisor_nombre || 'Dra. Fabiola Montesinos';
  const fechaInspeccion = tramite?.fechaInspeccion || '19/03/2026';
  const regenteNombre = (opciones?.regente || tramite?.director_tecnico || tramite?.regente || tramite?.responsable_laboratorio || 'DRA. NORMA VILLAVICENCIO SILES').toUpperCase();
  const ciRegente = opciones?.ciRegente || tramite?.ci_regente || tramite?.ci_responsable || tramite?.regente_ci || tramite?.director_tecnico_ci || '3799203 CB.';
  const rawRespAreas = opciones?.responsables_areas || tramite?.responsables_areas || '';
  const listaRespAreas = parsearResponsablesAreas(rawRespAreas);
  const textoRespAreasP1 = formatearTextoResponsablesAreasP1(listaRespAreas, rawRespAreas);
  const citeNumero = opciones?.cite || tramite?.resolucion?.cite_informe || tramite?.cite_informe || `CODELAB/SEDES/1/${new Date().getFullYear()}`;
  const destinatario = opciones?.destinatario || 'Dra. Mery D. Loroño V.';
  const destinatarioCargo = opciones?.destinatarioCargo || 'ASESOR LEGAL - UNIDAD DE CALIDAD Y SERVICIOS';
  const via = opciones?.via || 'Dra. Karina Soliz Villarroel';
  const viaCargo = opciones?.viaCargo || 'JEFE DE LA UNIDAD DE CALIDAD Y SERVICIOS a.i.';
  const remitente = opciones?.remitente || 'Dra. Claudia Morales Valenzuela';
  const remitenteCargo = opciones?.remitenteCargo || 'RESPONSABLE DEPARTAMENTAL DE LABORATORIOS CODELAB - SEDES';
  const fechaDoc = opciones?.fechaDoc || `Cochabamba, ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  const observacionesExtra = opciones?.observaciones || tramite?.observaciones_coordinador || 'Habiéndose verificado tanto el cumplimiento estricto de la carpeta legal como la conformidad en el informe de campo emitido por el supervisor de área, se concluye que el establecimiento cuenta con las garantías técnicas requeridas para su normal funcionamiento.';

  // Función para dibujar Cabecera Oficial con los 3 Logos ampliados
  const dibujarCabecera = (docInstance) => {
    // 1. Logo Chakana / Estado Plurinacional (Izquierda)
    if (imgChakana) {
      try {
        docInstance.addImage(imgChakana, 'PNG', marginX, 6.5, 26, 29);
      } catch (e) { }
    }

    // 2. Logo Cochabamba Escudo Oficial (Centro)
    if (imgCochabamba2) {
      try {
        docInstance.addImage(imgCochabamba2, 'PNG', (pageWidth / 2) - 13.5, 7, 27, 27);
      } catch (e) { }
    }

    // 3. Logo Cochabamba Lema (Derecha)
    if (imgCochabamba3) {
      try {
        docInstance.addImage(imgCochabamba3, 'PNG', pageWidth - marginX - 28, 7, 28, 28);
      } catch (e) { }
    }
  };

  // Función para dibujar Pie de Página Oficial SEDES
  const dibujarPiePagina = (docInstance) => {
    const yFooter = pageHeight - 17;
    docInstance.setDrawColor(80, 80, 80);
    docInstance.setLineWidth(0.35);
    docInstance.line(marginX, yFooter, pageWidth - marginX, yFooter);

    docInstance.setFont('helvetica', 'bold');
    docInstance.setFontSize(7);
    docInstance.setTextColor(40, 40, 40);
    docInstance.text('SECRETARÍA DEPARTAMENTAL DE SALUD - SDS', pageWidth / 2, yFooter + 3.5, { align: 'center' });
    docInstance.text('SERVICIO DEPARTAMENTAL DE SALUD - SEDES', pageWidth / 2, yFooter + 6.5, { align: 'center' });

    docInstance.setFont('helvetica', 'normal');
    docInstance.setFontSize(6.5);
    docInstance.setTextColor(60, 60, 60);
    docInstance.text('Av. Aniceto Arce, Esquina Pasteur Nº 2876 • Telfs.: 4-221889 - 4-221891 • Fax: 4- 221897 • www.sedescochabamba.gob.bo', pageWidth / 2, yFooter + 9.5, { align: 'center' });
    docInstance.text('• E-mail: info@sedescochabamba.gob.bo • Cochabamba – Bolivia', pageWidth / 2, yFooter + 12.5, { align: 'center' });
  };

  // ============================================================================
  // PÁGINA 1
  // ============================================================================
  dibujarCabecera(doc);

  // Título Principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('COMUNICACIÓN INTERNA', pageWidth / 2, 45, { align: 'center' });

  // CITE
  doc.setFontSize(9.5);
  doc.text(`Nº CITE: ${citeNumero}`, pageWidth - marginX, 51, { align: 'right' });

  // Tabla / Membrete de Comunicación Interna
  let curY = 56;
  const memoRows = [
    { campo: 'A:', val1: destinatario, val2: destinatarioCargo },
    { campo: 'VIA:', val1: via, val2: viaCargo },
    { campo: 'DE:', val1: remitente, val2: remitenteCargo },
    { campo: 'MOTIVO:', val1: `${tipoTramite} "${estabNombre}"`, val2: '' },
    { campo: 'FECHA:', val1: fechaDoc, val2: '' }
  ];

  const colVal1X = marginX + 14;
  const colVal2X = marginX + 64;
  const maxVal1W = 48;
  const maxVal2W = contentWidth - 64;

  memoRows.forEach(row => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(row.campo, marginX, curY);

    const linesVal1 = doc.splitTextToSize(row.val1, row.val2 ? maxVal1W : (contentWidth - 14));
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(linesVal1, colVal1X, curY);

    let linesVal2 = [];
    if (row.val2) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      linesVal2 = doc.splitTextToSize(row.val2, maxVal2W);
      doc.text(linesVal2, colVal2X, curY);
    }

    const numLines = Math.max(linesVal1.length, linesVal2.length, 1);
    const rowHeight = numLines > 1 ? (numLines * 3.6 + 1.2) : 5.5;
    curY += rowHeight;
  });

  // Línea divisoria
  curY += 1;
  doc.setDrawColor(60, 60, 60);
  doc.setLineWidth(0.4);
  doc.line(marginX, curY, pageWidth - marginX, curY);
  curY += 5;

  // De nuestra consideración
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);
  doc.text('De nuestra consideración:', marginX, curY);
  curY += 5;

  // Párrafo 1
  const textoP1 = `Mediante la presente y en cumplimiento a las funciones específicas de mi cargo dentro los alcances de los Art. 28 y Art. 38 de la Ley 1178, adjunto al presente informe para su conocimiento requisitos en general para la ${tipoTramite} del establecimiento "${estabNombre}" ubicado en ${direccion}, ${municipio}, siendo propiedad de ${propietarioNombre} con C.I. Nro. ${ciPropietario}, y regentado actualmente por el/la profesional ${regenteNombre} con C.I. Nro. ${ciRegente}${textoRespAreasP1}. En el marco de la normativa actual vigente aprobada por R.M. 0202 de fecha 22 de marzo del 2010 donde están descritos los requisitos técnicos, administrativos, legales y técnicos, en la evaluación realizada se verificó los requisitos mínimos que deben cumplir los establecimientos de salud en cuanto a documentación, gestión de calidad, bioseguridad, competencia técnica, etc., pero principalmente se hace una trazabilidad de sus procesos y procedimientos técnicos para validar la calidad de los resultados que emiten. El proceso de habilitación es análogo al de acreditación (ISO 9001 y la 15189) y la norma señala que es de responsabilidad de los SEDES para garantizar la calidad de los resultados de diagnóstico laboratorial en beneficio de la población.`;

  const splitP1 = doc.splitTextToSize(textoP1, contentWidth);
  doc.text(splitP1, marginX, curY, { align: 'justify', maxWidth: contentWidth });
  curY += splitP1.length * 3.8 + 3;

  // Párrafo 2
  const textoP2 = `La Evaluación técnica IN SITU para la ${tipoTramite.toLowerCase()} fue realizada en fecha ${fechaInspeccion} por el evaluador de campo ${supervisorNombre}, bajo la supervisión y conducción de ${remitente} - ${remitenteCargo} y personal técnico de esa repartición del Ministerio de Salud y Deportes de Bolivia.`;
  const splitP2 = doc.splitTextToSize(textoP2, contentWidth);
  doc.text(splitP2, marginX, curY, { align: 'justify', maxWidth: contentWidth });
  curY += splitP2.length * 3.8 + 3;

  // Párrafo 3
  const textoP3 = `Según Resolución Ministerial N° 847 de fecha 30 de noviembre donde indica que el ente regulador y coordinador de la Red Departamental de Laboratorios será la Coordinación Departamental de Laboratorios (CODELAB) dependientes de los Servicios Departamentales de Salud; de esta red dependerán los laboratorios de servicio público, de los seguros de salud a corto plazo y privados con y sin fines de lucro, así mismo en aplicación a la Resolución Ministerial N° 0936 de fecha 16 de diciembre del 2005 que en el Artículo Quinto designa en el nivel departamental como responsable de coordinar la Red Departamental de Laboratorios de Salud en el departamento de Cochabamba al Laboratorio de SEDES Cochabamba.`;
  const splitP3 = doc.splitTextToSize(textoP3, contentWidth);
  doc.text(splitP3, marginX, curY, { align: 'justify', maxWidth: contentWidth });
  curY += splitP3.length * 3.8 + 4;

  // Propietario / Datos Clave
  doc.setFont('helvetica', 'bold');
  doc.text(`PROPIETARIO: ${propietarioNombre}`, marginX, curY);

  dibujarPiePagina(doc);

  // ============================================================================
  // PÁGINA 2
  // ============================================================================
  doc.addPage();
  dibujarCabecera(doc);

  curY = 46;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);

  doc.text(`REPRESENTANTE LEGAL: ${propietarioNombre}`, marginX, curY);
  curY += 4.5;
  doc.text(`REGENTE: ${regenteNombre} con C.I. Nro. ${ciRegente}`, marginX, curY);
  curY += 4.5;

  // Responsables de Áreas de Especialidad
  const validAreas = (listaRespAreas || []).filter(a => a.nombre && a.nombre.trim());
  validAreas.forEach(a => {
    const ciTxt = a.ci ? ` con C.I. Nro. ${a.ci}` : '';
    doc.text(`RESPONSABLE DE ${a.area.toUpperCase()}: ${a.nombre.toUpperCase()}${ciTxt}`, marginX, curY);
    curY += 4.5;
  });

  doc.text(`UBICACIÓN ACTUAL DEL ESTABLECIMIENTO: ${direccion}, ${municipio}`, marginX, curY);
  curY += 6;

  // 1. REQUISITOS LEGALES
  doc.setFont('helvetica', 'bold');
  doc.text('1. REQUISITOS LEGALES.', marginX, curY);
  curY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.text('- Carta dirigida a la Dirección del Servicio Departamental de Salud para el trámite de habilitación.', marginX + 2, curY);
  curY += 4;
  doc.text('- Fotocopia legalizada de Cédula de Identidad y Matrícula Profesional vigente.', marginX + 2, curY);
  curY += 4;
  doc.text('- Registro de Inscripción en Colegio Profesional correspondiente y Poder Notarial.', marginX + 2, curY);
  curY += 6;

  // 2. REQUISITOS ADMINISTRATIVOS
  doc.setFont('helvetica', 'bold');
  doc.text('2. REQUISITOS ADMINISTRATIVOS', marginX, curY);
  curY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.text('- Certificado de Registro emitido por el SEDES / COSBES vigente.', marginX + 2, curY);
  curY += 4;
  doc.text('- Contrato vigente de recojo, tratamiento y disposición de residuos biopatológicos (EMSA).', marginX + 2, curY);
  curY += 4;
  doc.text('- Licencia Municipal de Funcionamiento y Plano Arquitectónico aprobado.', marginX + 2, curY);
  curY += 6;

  // 3. REQUISITOS TECNICOS
  doc.setFont('helvetica', 'bold');
  doc.text('3. REQUISITOS TECNICOS.', marginX, curY);
  curY += 4.5;
  const textoP4 = `- EN APLICACIÓN DEL REGLAMENTO DE HABILITACIÓN DE LABORATORIOS Y ESTABLECIMIENTOS DE SALUD (La Habilitación y/o Renovación de habilitación es extendida a los establecimientos solicitantes que cumplen con estos requisitos mínimos), por lo que la Evaluación del establecimiento IN SITU FUE REALIZADA POR LOS EVALUADORES, LIDERIZADA Y CONDUCIDA POR CODELAB SEDES y donde el establecimiento cuenta con una gestión de calidad en cuanto a bioseguridad en el proceso de evaluación en la presente gestión. Se adjunta Lista de verificación de requisitos técnicos con el que fue evaluado y el acta de evaluación in situ para la habilitación del establecimiento.`;
  const splitP4 = doc.splitTextToSize(textoP4, contentWidth - 4);
  doc.setFont('helvetica', 'normal');
  doc.text(splitP4, marginX + 2, curY, { align: 'justify', maxWidth: contentWidth - 4 });
  curY += splitP4.length * 3.8 + 2;

  doc.text('- Cumplimiento verificado de normas de bioseguridad y control de calidad analítico.', marginX + 2, curY);
  curY += 6;

  // 4. REQUISITOS FINANCIEROS
  doc.setFont('helvetica', 'bold');
  doc.text('4. REQUISITOS FINANCIEROS', marginX, curY);
  curY += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.text('Se adjunta:', marginX + 2, curY);
  curY += 4;
  doc.text('a. Comprobante y boleta de pago de arancel correspondiente al trámite de habilitación SEDES.', marginX + 6, curY);
  curY += 4;
  doc.text('b. Verificación de liquidación arancelaria emitida por la Unidad Administrativa Financiera.', marginX + 6, curY);
  curY += 5;

  const textoFinanciero = `En los mismos se concluye autorizando la habilitación respectiva habiendo cumplido con el depósito de aranceles de Ley, toda vez que la principal función del SEDES no es recaudar fondos sino velar porque todos los Establecimientos de Salud estén debidamente normados y reglamentados velando la calidad y calidez de atención a la población usuaria.`;
  const splitFinanciero = doc.splitTextToSize(textoFinanciero, contentWidth);
  doc.text(splitFinanciero, marginX, curY, { align: 'justify', maxWidth: contentWidth });
  curY += splitFinanciero.length * 3.8 + 4;

  // CONCLUSIONES
  doc.setFont('helvetica', 'bold');
  doc.text('CONCLUSIONES De lo referido anteriormente se concluye:', marginX, curY);
  curY += 4.5;
  const textoConcl = `Que siendo la habilitación según la R.M. N° 0202 de fecha 22/03/2010, en actual vigencia, la Sub Unidad de CODELAB, solicita la emisión de la resolución administrativa que realiza Asesoría Legal, de tal forma se determina, concluye y autoriza al establecimiento la ${tipoTramite} - "${estabNombre}", en aplicación a la normativa ministerial vigente.`;
  const splitConcl = doc.splitTextToSize(textoConcl, contentWidth);
  doc.setFont('helvetica', 'normal');
  doc.text(splitConcl, marginX, curY, { align: 'justify', maxWidth: contentWidth });

  dibujarPiePagina(doc);

  // ============================================================================
  // PÁGINA 3
  // ============================================================================
  doc.addPage();
  dibujarCabecera(doc);

  curY = 46;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);

  const textoP5 = `TRANSMITIDAS POR VECTORES (ETVs) Y OTRAS ENFERMEDADES EMERGENTES Y REEMERGENTES, ubicado en ${direccion}, ${municipio}, siendo propiedad de ${propietarioNombre}, regentado actualmente por el/la profesional ${regenteNombre} con C.I. Nro. ${ciRegente}${textoRespAreasP1}, según normativa vigente establecida en el Código de Salud R.M. 0847/06 y R.M. 0202/10, habiéndose sometido a la evaluación documental y técnica INSITU, trazabilidad de sus procesos y procedimientos para la validación de localidad de sus resultados, realizada por los evaluadores conducida y liderada por CODELAB- SEDES, de acuerdo a las listas de verificación para la aplicación del reglamento de habilitación, por lo que corresponde la extensión de la R.A. en la que se declara PROCEDENTE LA ${tipoTramite} al ${estabNombre} ante el Ministerio de Salud y el Servicio Departamental de Salud.`;
  const splitP5 = doc.splitTextToSize(textoP5, contentWidth);
  doc.text(splitP5, marginX, curY, { align: 'justify', maxWidth: contentWidth });
  curY += splitP5.length * 3.8 + 4;

  // Observaciones del Coordinador si existen
  if (observacionesExtra) {
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVACIONES DE LA COORDINACIÓN:', marginX, curY);
    curY += 4.5;
    doc.setFont('helvetica', 'italic');
    const splitObs = doc.splitTextToSize(observacionesExtra, contentWidth);
    doc.text(splitObs, marginX, curY, { align: 'justify', maxWidth: contentWidth });
    curY += splitObs.length * 3.8 + 5;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Se adjunta toda la documentación que cursa en la Sub Unidad de CODELAB Para la revisión y firma correspondiente.', marginX, curY);
  curY += 28;

  // Espacio para Firmas Oficiales
  const col1X = marginX + 10;
  const col2X = marginX + 90;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 30, 30);

  // Firma 1 (Izquierda)
  doc.text('1..................................................', col1X, curY);

  // Firma 2 (Derecha)
  doc.text('2..................................................', col2X, curY);

  // Iniciales de Archivo
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(80, 80, 80);
  doc.text('I.F.R./J.P.I.S./K.S.V.', marginX, pageHeight - 24);
  doc.text('CC/Arch', marginX, pageHeight - 21);

  dibujarPiePagina(doc);

  return doc;
}
