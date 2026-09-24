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

// Cache en memoria para logos ya convertidos
let cachedLogos = null;
export const precargarLogos = async () => {
  if (cachedLogos) return cachedLogos;
  const [imgChakana, imgCochabamba2, imgCochabamba3] = await Promise.all([
    cargarImagenComoPng(logoChakana, 360, 360),
    cargarImagenComoPng(logoCochabamba2, 360, 360),
    cargarImagenComoPng(logoCochabamba3, 360, 360)
  ]);
  cachedLogos = { imgChakana, imgCochabamba2, imgCochabamba3 };
  return cachedLogos;
};

/**
 * Genera el documento oficial de RESOLUCIÓN ADMINISTRATIVA (2 Páginas)
 * Siguiendo el formato y redacción exacta de la Gobernación de Cochabamba / SEDES.
 */
export async function generarResolucionAdministrativaPDF(datos = {}, opciones = {}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 215.9 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 279.4 mm
  const marginX = 22;
  const contentWidth = pageWidth - (marginX * 2);

  // Cargar logos (desde caché instantáneo)
  const { imgChakana, imgCochabamba2, imgCochabamba3 } = await precargarLogos();

  // Datos normalizados
  const numeroRA = datos.numero_resolucion || '55/2026';
  const fechaEmision = datos.fecha_emision || '18 de septiembre del 2026';
  const estabNombre = (datos.establecimiento || datos.establecimiento_nombre || 'LABORATORIO CLÍNICO').toUpperCase();
  const propietarioNombre = (datos.propietario || datos.razon_social || datos.razon_social_propietario || 'SR. PROPIETARIO REGISTRADO').toUpperCase();
  const ciPropietario = datos.ci_nit || datos.ci_nit_solicitante || '14147585 CB.';
  const regenteNombre = (datos.regente || datos.regente_nombre || datos.director_tecnico || propietarioNombre).toUpperCase();
  const ciRegente = datos.ci_regente || ciPropietario;
  const tipoTramite = (datos.tipo_tramite || 'APERTURA Y HABILITACIÓN').toUpperCase();
  const direccion = datos.direccion || datos.direccion_registrada || 'Calle teniente coronel jordan, Cochabamba';
  const nivelEstablecimiento = datos.tipo_establecimiento || 'LABORATORIO CLÍNICO PÚBLICO';
  const citeInformeTecnico = datos.cite_informe || 'CODELAB/SEDES/71/2026';
  const fechaInformeTecnico = datos.fecha_informe || '18 de septiembre del 2026';
  const coordinadorNombre = datos.coordinador_nombre || 'Dra. Claudia Morales Valenzuela';
  const vigenciaAnios = datos.vigencia_anios || 5;
  const vigenciaRango = datos.vigencia_rango || '18 de Septiembre de 2026 - 18 de Septiembre de 2031';
  
  // Textos y Artículos
  const vistosTexto = datos.antecedentes || datos.vistos || (
    `La solicitud presentada en fecha ${fechaInformeTecnico}, de propiedad del ${propietarioNombre}, ` +
    `representado por el titular con C.I. Nº ${ciPropietario}, siendo Responsable Técnica la profesional ${regenteNombre} ` +
    `con C.I. Nº ${ciRegente}, quien solicita a la Señora Directora Departamental de Salud, la Resolución Administrativa de ` +
    `${tipoTramite} del ${estabNombre}, ubicado en ${direccion}, del Departamento de Cochabamba, y demás antecedentes.`
  );

  const considerando1 = (
    "Que, en el marco de la Constitución Política del Estado Plurinacional de Bolivia; el Decreto Supremo 29894 " +
    "de 07 de febrero del 2009 Estructura Organizativa del Órgano Ejecutivo, y el Decreto Supremo de Estructura " +
    "y Organización de los SEDES No. 25233 de 27 de noviembre de 1998, que señala que el Servicio Departamental " +
    "de Salud, es un órgano desconcentrado de la Gobernación con estructura propia e independencia de gestión " +
    "administrativa y competencia departamental y su misión institucional es ejercer como Autoridad de Salud en el ámbito Departamental."
  );

  const considerando2 = datos.fundamento_legal || (
    `Que, asimismo el Servicio Departamental de Salud Cochabamba regido por el D.S. 25233 establece la Estructura ` +
    `de los SEDES, ejerciendo como Autoridad Sanitaria y velando por la calidad de los servicios de salud a cargo de ` +
    `prestadores públicos y privados. Asimismo conforme la Resolución Ministerial Nº 0202 del 22.03.2010 que aprueba ` +
    `el Reglamento General para la Habilitación y Funcionamiento de Laboratorios. El Informe Técnico de fecha ${fechaInformeTecnico} ` +
    `con No. CITE: ${citeInformeTecnico}, en la que la Responsable CODELAB, ${coordinadorNombre}, concluye que es procedente ` +
    `la ${tipoTramite} del establecimiento ${estabNombre}, ${nivelEstablecimiento}, quedando como regente técnica ` +
    `la profesional ${regenteNombre} con C.I. Nº ${ciRegente}.`
  );

  const considerando3 = (
    `Asimismo se tiene el informe de inspección técnica de campo favorable emitido por el supervisor de área, ` +
    `donde se constata que el establecimiento ${estabNombre} cuenta con las condiciones técnicas, normativas, ` +
    `de infraestructura y bioseguridad necesarias para su habilitación y funcionamiento formal.`
  );

  const articuloPrimero = datos.articulo_primero || (
    `Autorizar la ${tipoTramite} del establecimiento de salud denominado ` +
    `${estabNombre}, ${nivelEstablecimiento}, ubicado en ${direccion}, ` +
    `representado por el titular D./Dña. ${propietarioNombre} con C.I. Nº ${ciPropietario}, ` +
    `bajo la regencia técnica de la profesional ${regenteNombre} con C.I. Nº ${ciRegente}.`
  );

  const articuloSegundo = datos.articulo_segundo || (
    `Asimismo se hace constar que la presente resolución administrativa tiene vigencia de ${vigenciaAnios} ` +
    `años a partir de la emisión de la presente resolución (${vigenciaRango}).`
  );

  const articuloTercero = datos.articulo_tercero || (
    `El establecimiento queda sujeto a las normas sanitarias vigentes y a las inspecciones periódicas ` +
    `de control que la Autoridad Departamental de Salud considere pertinentes.`
  );

  // Función para dibujar Cabecera Oficial
  const dibujarCabecera = (docInstance) => {
    // 1. Logo Chakana / Estado Plurinacional (Izquierda)
    if (imgChakana) {
      try {
        docInstance.addImage(imgChakana, 'PNG', marginX, 6.5, 26, 29);
      } catch (e) {}
    }

    // 2. Logo Cochabamba Escudo Oficial (Centro)
    if (imgCochabamba2) {
      try {
        docInstance.addImage(imgCochabamba2, 'PNG', (pageWidth / 2) - 13.5, 7, 27, 27);
      } catch (e) {}
    }

    // 3. Logo Cochabamba Lema (Derecha)
    if (imgCochabamba3) {
      try {
        docInstance.addImage(imgCochabamba3, 'PNG', pageWidth - marginX - 28, 7, 28, 28);
      } catch (e) {}
    }
  };

  // Función para dibujar Pie de Página Oficial
  const dibujarPiePagina = (docInstance) => {
    const yFooter = pageHeight - 14;
    docInstance.setDrawColor(180, 180, 180);
    docInstance.setLineWidth(0.3);
    docInstance.line(marginX, yFooter, pageWidth - marginX, yFooter);

    docInstance.setFont('helvetica', 'normal');
    docInstance.setFontSize(6.5);
    docInstance.setTextColor(70, 70, 70);
    docInstance.text('Av. Aroma Nº: O-327 - Plaza San Sebastián • Telf. central piloto: 4500530 • Fax: 4258066', pageWidth / 2, yFooter + 4, { align: 'center' });
    docInstance.text('www.gobernaciondecochabamba.bo • E-mail: gobernacion@gobernaciondecochabamba.bo • Cochabamba - Bolivia', pageWidth / 2, yFooter + 7.5, { align: 'center' });
  };

  // ============================================================================
  // PÁGINA 1
  // ============================================================================
  dibujarCabecera(doc);

  let y = 43;

  // Título Principal de la Resolución Administrativa
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  const tituloRA = `RESOLUCIÓN ADMINISTRATIVA No ${numeroRA}`;
  doc.text(tituloRA, pageWidth / 2, y, { align: 'center' });
  doc.setLineWidth(0.4);
  const textW = doc.getTextWidth(tituloRA);
  doc.line((pageWidth / 2) - (textW / 2), y + 1, (pageWidth / 2) + (textW / 2), y + 1);

  y += 6;
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text(`A: ${fechaEmision}`, pageWidth / 2, y, { align: 'center' });

  y += 7;

  // 1. VISTOS
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('VISTOS:', marginX, y);
  
  doc.setFont('helvetica', 'normal');
  const vistosLines = doc.splitTextToSize(vistosTexto, contentWidth);
  doc.text(vistosLines, marginX, y + 4.5, { align: 'justify', maxWidth: contentWidth });
  y += (vistosLines.length * 3.7) + 7;

  // 2. CONSIDERANDO
  doc.setFont('helvetica', 'bold');
  doc.text('CONSIDERANDO:', marginX, y);
  y += 4.5;

  doc.setFont('helvetica', 'normal');
  const c1Lines = doc.splitTextToSize(considerando1, contentWidth);
  doc.text(c1Lines, marginX, y, { align: 'justify', maxWidth: contentWidth });
  y += (c1Lines.length * 3.7) + 3.5;

  const c2Lines = doc.splitTextToSize(considerando2, contentWidth);
  doc.text(c2Lines, marginX, y, { align: 'justify', maxWidth: contentWidth });
  y += (c2Lines.length * 3.7) + 3.5;

  const c3Lines = doc.splitTextToSize(considerando3, contentWidth);
  doc.text(c3Lines, marginX, y, { align: 'justify', maxWidth: contentWidth });
  y += (c3Lines.length * 3.7) + 5;

  // 3. POR TANTO
  doc.setFont('helvetica', 'bold');
  const porTantoText = 'POR TANTO: El SEDES a través de la CODELAB con la Facultad conferida por la normativa vigente:';
  doc.text(porTantoText, marginX, y);
  y += 5;

  doc.setFontSize(9);
  doc.text('RESUELVE:', marginX, y);
  y += 5.5;

  // ARTICULO UNO
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ARTICULO UNO. -', marginX, y);
  doc.setFont('helvetica', 'normal');
  const art1Lines = doc.splitTextToSize(articuloPrimero, contentWidth - 30);
  doc.text(art1Lines, marginX + 30, y, { align: 'justify', maxWidth: contentWidth - 30 });

  dibujarPiePagina(doc);

  // ============================================================================
  // PÁGINA 2
  // ============================================================================
  doc.addPage();
  dibujarCabecera(doc);

  let y2 = 45;

  // ARTICULO DOS (VIGENCIA)
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ARTICULO DOS. -', marginX, y2);
  doc.setFont('helvetica', 'normal');
  const art2Lines = doc.splitTextToSize(articuloSegundo, contentWidth - 30);
  doc.text(art2Lines, marginX + 30, y2, { align: 'justify', maxWidth: contentWidth - 30 });
  y2 += Math.max(art2Lines.length * 4, 8) + 4;

  // ARTICULO TERCERO
  if (articuloTercero) {
    doc.setFont('helvetica', 'bold');
    doc.text('ARTICULO TRES. -', marginX, y2);
    doc.setFont('helvetica', 'normal');
    const art3Lines = doc.splitTextToSize(articuloTercero, contentWidth - 30);
    doc.text(art3Lines, marginX + 30, y2, { align: 'justify', maxWidth: contentWidth - 30 });
    y2 += (art3Lines.length * 4) + 8;
  }

  // Cláusula de cierre
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('NOTIFÍQUESE, CÚMPLASE Y REGÍSTRESE.', marginX, y2);

  y2 += 22;

  // ============================================================================
  // BLOQUE DE LAS 4 FIRMAS OFICIALES (2 x 2)
  // ============================================================================
  const col1X = marginX + 8;
  const col2X = marginX + (contentWidth / 2) + 8;
  const firmaWidth = (contentWidth / 2) - 16;

  // Sello Vo.Bo. Asesoría Jurídica
  doc.setDrawColor(0, 96, 168);
  doc.setLineWidth(0.6);
  doc.circle(marginX + 8, y2 + 10, 10);
  doc.setFontSize(5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 96, 168);
  doc.text('SEDES', marginX + 8, y2 + 8, { align: 'center' });
  doc.text('V° B°', marginX + 8, y2 + 11, { align: 'center' });
  doc.text('ASESORÍA', marginX + 8, y2 + 13.5, { align: 'center' });
  doc.text('JURÍDICA', marginX + 8, y2 + 16, { align: 'center' });

  // Fila 1 de Firmas: Coordinador CODELAB & Jefa Unidad de Calidad
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.35);
  doc.setTextColor(20, 20, 20);

  // 1. Coordinador CODELAB
  doc.line(col1X + 15, y2 + 15, col1X + firmaWidth, y2 + 15);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(coordinadorNombre, col1X + (firmaWidth / 2) + 7, y2 + 19, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('RESPONSABLE DE LA COORDINACIÓN', col1X + (firmaWidth / 2) + 7, y2 + 22, { align: 'center' });
  doc.text('DEPARTAMENTAL DE LABORATORIOS - CODELAB', col1X + (firmaWidth / 2) + 7, y2 + 25, { align: 'center' });
  doc.text('SERVICIO DPTAL. DE SALUD COCHABAMBA', col1X + (firmaWidth / 2) + 7, y2 + 28, { align: 'center' });

  // 2. Jefa Unidad de Calidad y Servicios
  doc.line(col2X, y2 + 15, col2X + firmaWidth, y2 + 15);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Dra. Karina Soliz Villarroel', col2X + (firmaWidth / 2), y2 + 19, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('JEFA DE LA UNIDAD DE', col2X + (firmaWidth / 2), y2 + 22, { align: 'center' });
  doc.text('CALIDAD Y SERVICIOS a.i.', col2X + (firmaWidth / 2), y2 + 25, { align: 'center' });
  doc.text('SERVICIO DPTAL. DE SALUD COCHABAMBA', col2X + (firmaWidth / 2), y2 + 28, { align: 'center' });

  y2 += 42;

  // Fila 2 de Firmas: Asesor Legal & Directora Técnica SEDES
  // 3. Asesor Legal
  doc.line(col1X, y2 + 15, col1X + firmaWidth, y2 + 15);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(datos.abogado_nombre || 'Dr. Marco Villanueva', col1X + (firmaWidth / 2), y2 + 19, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('ASESOR LEGAL', col1X + (firmaWidth / 2), y2 + 22, { align: 'center' });
  doc.text('UNIDAD DE HABILITACIÓN / JURÍDICA', col1X + (firmaWidth / 2), y2 + 25, { align: 'center' });
  doc.text('SERVICIO DPTAL. DE SALUD COCHABAMBA', col1X + (firmaWidth / 2), y2 + 28, { align: 'center' });

  // 4. Directora Técnica SEDES
  doc.line(col2X, y2 + 15, col2X + firmaWidth, y2 + 15);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('Dra. Jenny Cintia Rojas Mamani', col2X + (firmaWidth / 2), y2 + 19, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6);
  doc.text('DIRECTORA TÉCNICA', col2X + (firmaWidth / 2), y2 + 22, { align: 'center' });
  doc.text('SERVICIO DEPARTAMENTAL DE SALUD', col2X + (firmaWidth / 2), y2 + 25, { align: 'center' });
  doc.text('Gob. Autónomo Dptal. Cochabamba', col2X + (firmaWidth / 2), y2 + 28, { align: 'center' });

  // Pie de Fecha al final de la página
  y2 += 36;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  doc.text(`Cochabamba, ${fechaEmision}`, pageWidth - marginX - 10, y2, { align: 'right' });

  dibujarPiePagina(doc);

  return doc;
}
