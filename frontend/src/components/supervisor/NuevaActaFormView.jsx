import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  AlertCircle,
  Download,
  RotateCcw,
  Upload,
  Eye,
  Trash2,
  FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import logoL1 from '../../assets/L1.png';
import logoL2 from '../../assets/L2.png';
import escudoBolivia from '../../assets/Escudo_de_Bolivia.svg.webp';
import escudoCochabamba from '../../assets/Escudo_del_Cochabamba.svg.webp';

// Helper para convertir imágenes a DataURL para jsPDF
const cargarImagenComoPngDataUrl = (url) => {
  return new Promise((resolve) => {
    if (!url) return resolve(null);
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 140;
        canvas.height = img.naturalHeight || img.height || 140;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch (err) {
        console.warn('Error al convertir imagen a data URL:', err);
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
};

// ==============================================================================
// CATÁLOGO OFICIAL DE LA LISTA DE VERIFICACIÓN (R.M. 0202 - SEDES COCHABAMBA)
// Extraído fielmente del formulario oficial "Acta-Ejemplo.pdf"
// ==============================================================================
export const SECCIONES_FORMULARIO = [
  {
    id: 'sec1',
    codigo: 'I',
    titulo: 'DE LAS INSTALACIONES',
    subtitulo: 'Condiciones edilicias, delimitación física, saneamiento básico e instalaciones eléctricas.',
    peso: 20,
    criterios: [
      {
        id: 'art40_a',
        articulo: 'Art. 40',
        inciso: 'a',
        criterio: '¿El laboratorio se encuentra construido en zona no vulnerable a desastres, y está instalado en área independiente al ambiente de una vivienda?',
        estandar: 'Verificar el área de construcción y separación física efectiva del laboratorio con el ambiente de una vivienda.',
        pesoItem: 1
      },
      {
        id: 'art41_a',
        articulo: 'Art. 41',
        inciso: 'a',
        criterio: '¿El laboratorio cuenta con sala de espera destinada al laboratorio o de uso común?',
        estandar: 'La sala de espera es acorde a la demanda de atención del laboratorio.',
        pesoItem: 1
      },
      {
        id: 'art41_b',
        articulo: 'Art. 41',
        inciso: 'b',
        criterio: '¿El laboratorio cuenta con baños para pacientes?',
        estandar: 'La sala de espera cuenta con baño accesible para el paciente.',
        pesoItem: 1
      },
      {
        id: 'art41_c',
        articulo: 'Art. 41',
        inciso: 'c',
        criterio: '¿El laboratorio cuenta con área de recepción de muestras?',
        estandar: 'Verificar la existencia de área señalizada para recepción de muestras.',
        pesoItem: 1
      },
      {
        id: 'art41_d',
        articulo: 'Art. 41',
        inciso: 'd',
        criterio: '¿El laboratorio cuenta con Ambiente de toma de muestras?',
        estandar: 'El ambiente de toma de muestras está separada física y efectivamente del área analítica y administrativa, que asegure la privacidad del paciente.',
        pesoItem: 1
      },
      {
        id: 'art41_e',
        articulo: 'Art. 41',
        inciso: 'e',
        criterio: '¿El laboratorio cuenta con un Área o ambiente administrativo?',
        estandar: 'Verificar la existencia de un área o ambiente exclusivo para administración.',
        pesoItem: 1
      },
      {
        id: 'art41_f',
        articulo: 'Art. 41',
        inciso: 'f',
        criterio: '¿El laboratorio cuenta con el ambiente de procesamiento analítico de muestras separado y diferenciado?',
        estandar: 'El ambiente de procesamiento general tiene separación física y efectiva de áreas técnicamente incompatibles.',
        pesoItem: 1
      },
      {
        id: 'art41_g',
        articulo: 'Art. 41',
        inciso: 'g',
        criterio: '¿Cumple el ambiente de procesamiento analítico con las dimensiones mínimas de 16 mt²?',
        estandar: 'Verificar las medidas mínimas.',
        pesoItem: 1
      },
      {
        id: 'art41_h',
        articulo: 'Art. 41',
        inciso: 'h',
        criterio: '¿El laboratorio cuenta con ambiente separado para microbiología? *',
        estandar: 'Verificar si el laboratorio cuenta con un ambiente exclusivo para microbiología.',
        pesoItem: 1
      },
      {
        id: 'art41_i',
        articulo: 'Art. 41',
        inciso: 'i',
        criterio: '¿* El laboratorio cuenta con ambiente separado para preparación de medios para microbiología? *',
        estandar: 'Verificar si el laboratorio cuenta con un ambiente exclusivo para preparación de medios para microbiología.',
        pesoItem: 1
      },
      {
        id: 'art41_j',
        articulo: 'Art. 41',
        inciso: 'j',
        criterio: '¿El laboratorio cuenta con área de lavado de materiales?',
        estandar: 'Verificar si el laboratorio cuenta con un área de lavado de materiales.',
        pesoItem: 1
      },
      {
        id: 'art41_k',
        articulo: 'Art. 41',
        inciso: 'k',
        criterio: '¿El laboratorio cuenta con un área o ambiente de depósito para almacenamiento de reactivos, materiales e insumos?',
        estandar: 'Verificar si el laboratorio cuenta con un ambiente o área identificada para depósito o almacenamiento de reactivos, materiales e insumos.',
        pesoItem: 1
      },
      {
        id: 'art41_l',
        articulo: 'Art. 41',
        inciso: 'l',
        criterio: '¿El laboratorio cuenta con vestidor o casilleros para el personal de laboratorio?',
        estandar: 'Verificar la existencia de vestidor o casilleros individuales para el guardado de ropa y enseres personales.',
        pesoItem: 1
      },
      {
        id: 'art41_m',
        articulo: 'Art. 41',
        inciso: 'm',
        criterio: '¿El laboratorio tiene baños para el personal de laboratorio?',
        estandar: 'Verificar la existencia de baños para el personal de laboratorio.',
        pesoItem: 1
      },
      {
        id: 'art41_n',
        articulo: 'Art. 41',
        inciso: 'n',
        criterio: '¿El laboratorio tiene un área de descanso para el personal cuando se hacen turnos de guardia?',
        estandar: 'Verificar el área de descanso cuando aplique.',
        pesoItem: 1
      },
      {
        id: 'art42_a',
        articulo: 'Art. 42',
        inciso: 'a',
        criterio: 'El laboratorio tiene techos lisos, impermeables y lavables libres de fisura',
        estandar: 'Verificar la calidad de los materiales en la construcción del laboratorio.',
        pesoItem: 1
      },
      {
        id: 'art42_b',
        articulo: 'Art. 42',
        inciso: 'b',
        criterio: 'El laboratorio tiene Paredes revocadas, lisas, pintadas con material impermeable, colores mate, libres de fisuras',
        estandar: 'Verificar la calidad de los materiales en la construcción del laboratorio.',
        pesoItem: 1
      },
      {
        id: 'art42_c',
        articulo: 'Art. 42',
        inciso: 'c',
        criterio: 'El laboratorio tiene Pisos lisos, lavables, libres de fisuras',
        estandar: 'Verificar la calidad de los materiales en la construcción del laboratorio.',
        pesoItem: 1
      },
      {
        id: 'art42_d',
        articulo: 'Art. 42',
        inciso: 'd',
        criterio: 'El laboratorio tiene Puertas y ventanas impermeables y lavables con protectores para vectores',
        estandar: 'Verificar la calidad de los materiales de las puertas y ventanas del laboratorio.',
        pesoItem: 1
      },
      {
        id: 'art42_e',
        articulo: 'Art. 42',
        inciso: 'e',
        criterio: 'El laboratorio cuenta con Mesones rígidos con superficies lisas, impermeables y lavables con el ancho de medidas estándar',
        estandar: 'Verificar la calidad y cantidad de mesones.',
        pesoItem: 1
      },
      {
        id: 'art43_a',
        articulo: 'Art. 43',
        inciso: 'a',
        criterio: 'El laboratorio cuenta con iluminación natural y artificial adecuada',
        estandar: 'Verificar la calidad de iluminación.',
        pesoItem: 1
      },
      {
        id: 'art43_b',
        articulo: 'Art. 43',
        inciso: 'b',
        criterio: '¿Se cuenta con ventilación natural o artificial adecuada?',
        estandar: 'Verificar la calidad de ventilación.',
        pesoItem: 1
      },
      {
        id: 'art43_c',
        articulo: 'Art. 43',
        inciso: 'c',
        criterio: '¿Extractor de aire? (si aplica)',
        estandar: 'Verificar funcionamiento de extractor.',
        pesoItem: 1
      },
      {
        id: 'art43_d',
        articulo: 'Art. 43',
        inciso: 'd',
        criterio: '¿Aire acondicionado? (si aplica)',
        estandar: 'Verificar sistema de climatización si aplica.',
        pesoItem: 1
      },
      {
        id: 'art43_e',
        articulo: 'Art. 43',
        inciso: 'e',
        criterio: '¿El laboratorio cuenta con puntos de agua potable?',
        estandar: 'Verificar las conexiones de agua potable continua.',
        pesoItem: 1
      },
      {
        id: 'art43_f',
        articulo: 'Art. 43',
        inciso: 'f',
        criterio: '¿El laboratorio cuenta con instalaciones eléctricas?',
        estandar: 'Verificar la instalación de energía eléctrica segura.',
        pesoItem: 1
      },
      {
        id: 'art43_g',
        articulo: 'Art. 43',
        inciso: 'g',
        criterio: '¿El laboratorio utiliza un tomacorrientes para cada equipo?',
        estandar: 'Verificar los puntos de toma corriente exclusivos sin sobrecarga.',
        pesoItem: 1
      },
      {
        id: 'art43_h',
        articulo: 'Art. 43',
        inciso: 'h',
        criterio: '¿La instalación eléctrica cuenta con línea a tierra y estabilizadores de corriente?',
        estandar: 'Verificar la instalación con línea a tierra y estabilizadores de corriente.',
        pesoItem: 1
      },
      {
        id: 'art43_i',
        articulo: 'Art. 43',
        inciso: 'i',
        criterio: '¿El laboratorio cuenta con puntos de desagüe?',
        estandar: 'Verificar los puntos de desagüe y sifones.',
        pesoItem: 1
      },
      {
        id: 'art43_j',
        articulo: 'Art. 43',
        inciso: 'j',
        criterio: '¿El laboratorio cuenta con lavaderos de material impermeable?',
        estandar: 'Verificar la calidad de los lavaderos.',
        pesoItem: 1
      },
      {
        id: 'art43_k',
        articulo: 'Art. 43',
        inciso: 'k',
        criterio: '¿El laboratorio cuenta con alcantarillado o pozo séptico?',
        estandar: 'Verificar la instalación sanitaria legal.',
        pesoItem: 1
      },
      {
        id: 'art44_a',
        articulo: 'Art. 44',
        inciso: 'a',
        criterio: '¿El laboratorio tiene señalización de acceso restringido a los ambientes del laboratorio?',
        estandar: 'Verificar la señalización de advertencia y restricción de paso.',
        pesoItem: 1
      }
    ]
  },
  {
    id: 'sec2',
    codigo: 'II',
    titulo: 'DE LOS REQUISITOS DE EQUIPAMIENTO E INSUMOS',
    subtitulo: 'Disponibilidad de aparatos diagnósticos, inventario, calibración y bitácoras técnicas.',
    peso: 15,
    criterios: [
      {
        id: 'art47_a',
        articulo: 'Art. 47',
        inciso: 'a',
        criterio: '¿El laboratorio dispone de equipos necesarios acorde a la oferta de servicios?',
        estandar: 'Verificar si cuenta con equipos enumerados en el Anexo 3 del Reglamento General de Habilitación por especialidades.',
        pesoItem: 1
      },
      {
        id: 'art47_b',
        articulo: 'Art. 47',
        inciso: 'b',
        criterio: '¿Cuenta con silla de toma de muestra?',
        estandar: 'Verificar existencia y estado ergonómico con descansabrazos.',
        pesoItem: 1
      },
      {
        id: 'art47_c',
        articulo: 'Art. 47',
        inciso: 'c',
        criterio: '¿Cuenta con camilla para toma de muestras?',
        estandar: 'Verificar existencia de camilla ginecológica o clínica.',
        pesoItem: 1
      },
      {
        id: 'art48_a',
        articulo: 'Art. 48',
        inciso: 'a',
        criterio: '¿El laboratorio cuenta con un Inventario actualizado de los Equipos?',
        estandar: 'Verificar existencia de Inventario y Kardex de los Equipos.',
        pesoItem: 1
      },
      {
        id: 'art48_b',
        articulo: 'Art. 48',
        inciso: 'b',
        criterio: '¿El laboratorio cuenta con un programa de mantenimiento preventivo de equipos?',
        estandar: 'Verificar Fichas técnicas de mantenimiento preventivo y correctivo.',
        pesoItem: 1
      },
      {
        id: 'art48_c',
        articulo: 'Art. 48',
        inciso: 'c',
        criterio: '¿El laboratorio cuenta con registros de control de temperatura de los diferentes equipos?',
        estandar: 'Verificar existencia de registros de control de temperaturas, refrigerador, baño María y estufas.',
        pesoItem: 1
      },
      {
        id: 'art48_d',
        articulo: 'Art. 48',
        inciso: 'd',
        criterio: '¿El laboratorio cuenta con registros de control de temperatura de equipos de uso en el área de bacteriología? *',
        estandar: 'Verificar existencia de registros de control de temperatura de estufa de incubación, estufa pupinel, refrigerador del área de bacteriología.',
        pesoItem: 1
      },
      {
        id: 'art48_e',
        articulo: 'Art. 48',
        inciso: 'e',
        criterio: '¿El laboratorio cuenta con Procedimientos técnicos escritos de uso de los equipos?',
        estandar: 'Verificar la existencia de procedimientos técnicos de uso de cada uno de los equipos (POEs).',
        pesoItem: 1
      },
      {
        id: 'art48_f',
        articulo: 'Art. 48',
        inciso: 'f',
        criterio: '¿El laboratorio cuenta con fichas de registro histórico de cada equipo?',
        estandar: 'Verificar la existencia de fichas de Registro y trazabilidad de los equipos.',
        pesoItem: 1
      }
    ]
  },
  {
    id: 'sec3',
    codigo: 'III',
    titulo: 'DE LOS REQUISITOS DE REACTIVOS',
    subtitulo: 'Inventario de reactivos, control de vencimiento, almacenamiento y registro sanitario AGEMED.',
    peso: 15,
    criterios: [
      {
        id: 'art49_a',
        articulo: 'Art. 49',
        inciso: 'a',
        criterio: '¿El laboratorio cuenta con un inventario de los reactivos en uso, y de fecha vigente?',
        estandar: 'Verificar el Inventario General de Reactivos y fechas de vencimiento.',
        pesoItem: 1
      },
      {
        id: 'art49_b',
        articulo: 'Art. 49',
        inciso: 'b',
        criterio: '¿El laboratorio cuenta con fichas de Reactivos en uso con fecha vigente?',
        estandar: 'Verificar las fichas y fechas de caducidad de los reactivos.',
        pesoItem: 1
      },
      {
        id: 'art49_c',
        articulo: 'Art. 49',
        inciso: 'c',
        criterio: '¿El laboratorio cuenta con reactivos preparados en laboratorio con Identificación y fecha de elaboración?',
        estandar: 'Verificar los Reactivos preparados, rótulos con identificación, concentración y fechas de elaboración.',
        pesoItem: 1
      },
      {
        id: 'art49_d',
        articulo: 'Art. 49',
        inciso: 'd',
        criterio: '¿El laboratorio cumple las condiciones de almacenamiento indicadas por el fabricante de reactivos?',
        estandar: 'Verificar la conservación adecuada (cadena de frío, protección de luz, humedad).',
        pesoItem: 1
      },
      {
        id: 'art51_a',
        articulo: 'Art. 51',
        inciso: 'a',
        criterio: '¿El laboratorio cuenta con la lista de reactivos con Registro Sanitario vigente?',
        estandar: 'Verificar la lista de reactivos con Registro Sanitario otorgado por AGEMED.',
        pesoItem: 1
      }
    ]
  },
  {
    id: 'sec4',
    codigo: 'IV',
    titulo: 'DE LOS RECURSOS HUMANOS',
    subtitulo: 'Acreditación profesional, regencia bioquímica y cualificación del personal técnico y auxiliar.',
    peso: 10,
    criterios: [
      {
        id: 'art29_a',
        articulo: 'Art. 29',
        inciso: 'a',
        criterio: '¿El Laboratorio cuenta con un Regente Bioquímico?',
        estandar: 'Verificar título habilitante en Provisión Nacional y Matrícula del profesional Bioquímico Regente.',
        pesoItem: 1
      },
      {
        id: 'art29_b',
        articulo: 'Art. 29',
        inciso: 'b',
        criterio: '¿El Laboratorio cuenta con profesionales Bioquímicos por áreas?',
        estandar: 'Verificar título habilitante del personal profesional Bioquímico asignado.',
        pesoItem: 1
      },
      {
        id: 'art29_c',
        articulo: 'Art. 29',
        inciso: 'c',
        criterio: '¿El Laboratorio cuenta con Técnicos Superiores de Laboratorio?',
        estandar: 'Verificar título habilitante del Técnico Superior de Laboratorio.',
        pesoItem: 1
      },
      {
        id: 'art29_d',
        articulo: 'Art. 29',
        inciso: 'd',
        criterio: '¿El Laboratorio cuenta con personal auxiliar de laboratorio? (Secretaria, manuales y otros)',
        estandar: 'Verificar la certificación e inducción del personal auxiliar de Laboratorios.',
        pesoItem: 1
      }
    ]
  },
  {
    id: 'sec5',
    codigo: 'V',
    titulo: 'DE LA GESTIÓN DE CALIDAD',
    subtitulo: 'Documentación normativa, control interno/externo, POEs, entrega y custodia de resultados.',
    peso: 20,
    criterios: [
      {
        id: 'art52_a',
        articulo: 'Art. 52',
        inciso: 'a',
        criterio: '¿El Laboratorio se encuentra Registrado ante la autoridad Competente?',
        estandar: 'Verificar registro o resolución de autorización de apertura en lugar visible.',
        pesoItem: 1
      },
      {
        id: 'art52_b',
        articulo: 'Art. 52',
        inciso: 'b',
        criterio: '¿El Laboratorio cuenta con la descripción de su Misión y Visión?',
        estandar: 'Verificar la descripción documentada de la Misión y Visión.',
        pesoItem: 1
      },
      {
        id: 'art52_c',
        articulo: 'Art. 52',
        inciso: 'c',
        criterio: '¿El Laboratorio cuenta con su organigrama y descripción de funciones?',
        estandar: 'Verificar existencia del organigrama y manual de funciones.',
        pesoItem: 1
      },
      {
        id: 'art52_d',
        articulo: 'Art. 52',
        inciso: 'd',
        criterio: '¿El Laboratorio cuenta con la lista de las determinaciones que oferta a los usuarios?',
        estandar: 'Verificar la lista de determinaciones y cartera de servicios ofertada.',
        pesoItem: 1
      },
      {
        id: 'art52_e',
        articulo: 'Art. 52',
        inciso: 'e',
        criterio: '¿El Laboratorio cuenta con el personal capacitado para las funciones que realizan?',
        estandar: 'Verificar certificaciones de capacitación del personal, registro de capacitaciones y cronograma anual.',
        pesoItem: 1
      },
      {
        id: 'art52_f',
        articulo: 'Art. 52',
        inciso: 'f',
        criterio: '¿El Laboratorio cuenta con Procedimientos Técnicos escritos para las pruebas que realiza?',
        estandar: 'Verificar los Procedimientos Técnicos escritos (insertos provistos por fabricantes acordes con el lote de reactivo en uso).',
        pesoItem: 1
      },
      {
        id: 'art52_g',
        articulo: 'Art. 52',
        inciso: 'g',
        criterio: '¿El Laboratorio cuenta con Criterios de Aceptación y Rechazo de Muestras de forma escrita?',
        estandar: 'Verificar el documento de criterios de aceptación y rechazo y guías para garantizar la calidad analítica.',
        pesoItem: 1
      },
      {
        id: 'art52_h',
        articulo: 'Art. 52',
        inciso: 'h',
        criterio: '¿El laboratorio cuenta con sistema de control de la documentación y Mantiene actualizados sus registros?',
        estandar: 'Verificar que los registros se encuentran al día a la fecha de inspección.',
        pesoItem: 1
      },
      {
        id: 'art52_i',
        articulo: 'Art. 52',
        inciso: 'i',
        criterio: '¿El laboratorio cuenta con un manual de Toma y Manejo de muestras?',
        estandar: 'Verificar Manual de toma y manejo de muestras disponible para el personal técnico.',
        pesoItem: 1
      },
      {
        id: 'art52_j',
        articulo: 'Art. 52',
        inciso: 'j',
        criterio: '¿El laboratorio cuenta con un sistema de control de calidad interno?',
        estandar: 'Verificar registros de Control de Calidad Interno (gráficas de Levey-Jennings) y acciones correctivas aplicadas.',
        pesoItem: 1
      },
      {
        id: 'art52_k',
        articulo: 'Art. 52',
        inciso: 'k',
        criterio: '¿El laboratorio participa al menos de un programa de evaluación externa de la calidad?',
        estandar: 'Verificar constancia y resultados de participación en programas de evaluación externa (PEEC / redes de vigilancia).',
        pesoItem: 1
      },
      {
        id: 'art52_l',
        articulo: 'Art. 52',
        inciso: 'l',
        criterio: '¿El laboratorio cuenta con un sistema de información que asegure la confidencialidad, integridad y restricción del acceso?',
        estandar: 'Verificar acceso restringido a la información y compromiso escrito de confidencialidad del personal.',
        pesoItem: 1
      },
      {
        id: 'art52_m',
        articulo: 'Art. 52',
        inciso: 'm',
        criterio: '¿El laboratorio cuenta con convenios, contratos escritos para la derivación de muestras a otros laboratorios?',
        estandar: 'Verificar convenios o contratos de derivación vigentes con laboratorios de referencia autorizados.',
        pesoItem: 1
      },
      {
        id: 'art53_a',
        articulo: 'Art. 53',
        inciso: 'a',
        criterio: '¿El laboratorio cumple la emisión del informe de resultados con el formato oficial indicado en el Art. 2.10?',
        estandar: 'Verificar que el formato de los informes de resultados cumple con la normativa SEDES.',
        pesoItem: 1
      },
      {
        id: 'art55_a',
        articulo: 'Art. 55',
        inciso: 'a',
        criterio: '¿El laboratorio cuenta con un registro de liberación de resultados?',
        estandar: 'Verificar registro de entrega a paciente ambulatorio, médico tratante, representante legal o personal de piso.',
        pesoItem: 1
      },
      {
        id: 'art56_a',
        articulo: 'Art. 56',
        inciso: 'a',
        criterio: '¿El laboratorio cumple con la notificación inmediata de los resultados que impliquen un riesgo de salud pública?',
        estandar: 'Verificar registro de informes a médicos solicitantes ante valores de alerta crítica.',
        pesoItem: 1
      },
      {
        id: 'art56_b',
        articulo: 'Art. 56',
        inciso: 'b',
        criterio: '¿El laboratorio cumple con la información y notificación obligatoria a la autoridad sanitaria?',
        estandar: 'Verificar registro de informes del formulario 303 para vigilancia epidemiológica.',
        pesoItem: 1
      },
      {
        id: 'art60_a',
        articulo: 'Art. 60',
        inciso: 'a',
        criterio: '¿El laboratorio cuenta con archivos de registros de los cinco años?',
        estandar: 'Verificar custodia de archivos por 5 años en condiciones que aseguren su integridad y rápida recuperación.',
        pesoItem: 1
      }
    ]
  },
  {
    id: 'sec6',
    codigo: 'VI',
    titulo: 'DE LA BIOSEGURIDAD',
    subtitulo: 'Salud ocupacional, esquema de vacunación, dotación de insumos y evaluación COSBES.',
    peso: 10,
    criterios: [
      {
        id: 'art61_a',
        articulo: 'Art. 61',
        inciso: 'a',
        criterio: '¿El laboratorio cuenta con un programa de control de salud ocupacional del personal y con la aplicación del esquema de vacunación completa?',
        estandar: 'Verificar las fichas médicas y carnets de vacunación completa de cada funcionario del laboratorio.',
        pesoItem: 1
      },
      {
        id: 'art61_b',
        articulo: 'Art. 61',
        inciso: 'b',
        criterio: '¿El laboratorio cuenta con los recursos previstos para dotar de los insumos necesarios para el cumplimiento de la Norma de Bioseguridad y de Residuos?',
        estandar: 'Verificar los POAS y gestiones administrativas para confirmar la dotación continua de EPPs y bolsas/recipientes RPBI.',
        pesoItem: 1
      },
      {
        id: 'art61_c',
        articulo: 'Art. 61',
        inciso: 'c',
        criterio: '¿El laboratorio cuenta con la última evaluación realizada por COSBES?',
        estandar: 'Verificar y solicitar copia de la evaluación del Comité Departamental de Bioseguridad.',
        pesoItem: 1
      },
      {
        id: 'art61_d',
        articulo: 'Art. 61',
        inciso: 'd',
        criterio: '¿El laboratorio cuenta con un sistema de gestión de bioseguridad implementado?',
        estandar: 'Verificar manuales de bioseguridad y protocolos de contingencia ante derrames o accidentes.',
        pesoItem: 1
      }
    ]
  },
  {
    id: 'sec7',
    codigo: 'VII',
    titulo: 'DE LOS PRINCIPIOS ÉTICOS',
    subtitulo: 'Código de ética profesional, confidencialidad y principios declarados.',
    peso: 5,
    criterios: [
      {
        id: 'art69_a',
        articulo: 'Art. 69',
        inciso: 'a',
        criterio: '¿El laboratorio cuenta con un Código de Ética escrito y de conocimiento de todo el personal del laboratorio?',
        estandar: 'Verificar el documento escrito y firmado por el personal.',
        pesoItem: 1
      },
      {
        id: 'art69_b',
        articulo: 'Art. 69',
        inciso: 'b',
        criterio: '¿El Código de Ética manifiesta los principios del Laboratorio?',
        estandar: 'Verificar instructivos que certifiquen el cumplimiento estricto de los principios éticos en la atención.',
        pesoItem: 1
      }
    ]
  },
  {
    id: 'sec8',
    codigo: 'VIII',
    titulo: 'TRAZABILIDAD',
    subtitulo: 'Evaluación de las tres fases del proceso analítico: Preanalítica, Analítica y Posanalítica.',
    peso: 5,
    criterios: [
      {
        id: 'art52_j1',
        articulo: 'Art. 52',
        inciso: 'j (1)',
        criterio: 'FASE PREANALÍTICA',
        estandar: 'Verificar en recepción atención al paciente, registro adecuado, instructivos para preparación de muestra, criterios de rechazo/aceptación y privacidad.',
        pesoItem: 1
      },
      {
        id: 'art52_j2',
        articulo: 'Art. 52',
        inciso: 'j (2)',
        criterio: 'FASE ANALÍTICA',
        estandar: 'Verificar sistema de validación de resultados, POEs al alcance de operadores y correcta utilización de reactivos e instrumental.',
        pesoItem: 1
      },
      {
        id: 'art52_j3',
        articulo: 'Art. 52',
        inciso: 'j (3)',
        criterio: 'FASE POSANALÍTICA',
        estandar: 'Verificar sistema adecuado de liberación de resultados, cuadernos de no conformidades y aplicación de acciones correctivas/preventivas.',
        pesoItem: 1
      }
    ]
  }
];

export default function NuevaActaFormView({ usuario, onVolver, onActaGuardada, mostrarToast }) {
  // Datos Generales
  const [inspeccionesDisponibles, setInspeccionesDisponibles] = useState([]);
  const [inspeccionSeleccionadaId, setInspeccionSeleccionadaId] = useState('');
  const [establecimientoNombre, setEstablecimientoNombre] = useState('');
  const [propietarioNombre, setPropietarioNombre] = useState('');
  const [tipoTramite, setTipoTramite] = useState('Apertura');
  const [direccionTexto, setDireccionTexto] = useState('');
  const [municipioTexto, setMunicipioTexto] = useState('CERCADO');
  const [codigoTramite, setCodigoTramite] = useState('');
  const [fechaInspeccion, setFechaInspeccion] = useState(() => new Date().toISOString().slice(0, 10));

  // Respuestas del checklist: { [criterioId]: 'SI' | 'NO' | 'NA' }
  const [evaluaciones, setEvaluaciones] = useState(() => {
    const init = {};
    SECCIONES_FORMULARIO.forEach(sec => {
      sec.criterios.forEach(c => {
        init[c.id] = 'SI'; // Por defecto "SÍ"
      });
    });
    return init;
  });

  // Observaciones específicas por criterio: { [criterioId]: string }
  const [observacionesItems, setObservacionesItems] = useState({});

  // Segunda Evaluación Después de Observado: { [criterioId]: string }
  const [segundaEvaluacionItems, setSegundaEvaluacionItems] = useState({});

  // Dictamen y Conclusiones Finales
  const [resultadoFinal, setResultadoFinal] = useState('Aprobado');
  const [plazoSubsanacionDias, setPlazoSubsanacionDias] = useState(10);
  const [conclusionesGenerales, setConclusionesGenerales] = useState(
    'El establecimiento cumple con los requerimientos técnicos y sanitarios establecidos en el Reglamento General de Habilitación de Laboratorios (R.M. 0202) del SEDES Cochabamba.'
  );
  const [guardando, setGuardando] = useState(false);

  // Subida de documento firmado (Sección 3)
  const fileInputRef = useRef(null);
  const [archivoFirmado, setArchivoFirmado] = useState(null);
  const [archivoFirmadoUrl, setArchivoFirmadoUrl] = useState('');
  const [archivoFirmadoNombre, setArchivoFirmadoNombre] = useState('');
  const [archivoFirmadoEsPdf, setArchivoFirmadoEsPdf] = useState(false);

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
            setPropietarioNombre(first.responsable_laboratorio || first.propietario || 'Responsable Técnico');
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
      setPropietarioNombre(item.responsable_laboratorio || item.propietario || 'Responsable Técnico');
      setTipoTramite(item.tipo || 'Apertura');
      setDireccionTexto(item.direccion || 'Cochabamba');
      setMunicipioTexto(item.municipio || 'CERCADO');
      setCodigoTramite(item.codigo_tramite || item.codigo || 'TRM-001');
    }
  };

  // 2. Calcular porcentaje de cumplimiento en tiempo real
  const { puntajeTotal, maxPuntaje, porcentaje, conteoSI, conteoNO, conteoNA } = useMemo(() => {
    let total = 0;
    let max = 0;
    let si = 0;
    let no = 0;
    let na = 0;

    SECCIONES_FORMULARIO.forEach(sec => {
      sec.criterios.forEach(crit => {
        const estado = evaluaciones[crit.id] || 'SI';
        if (estado === 'SI') {
          total += crit.pesoItem;
          max += crit.pesoItem;
          si++;
        } else if (estado === 'NO') {
          max += crit.pesoItem;
          no++;
        } else {
          // 'NA' no penaliza el total máximo
          na++;
        }
      });
    });

    const pct = max > 0 ? Math.round((total / max) * 100) : 100;
    return { puntajeTotal: total, maxPuntaje: max, porcentaje: pct, conteoSI: si, conteoNO: no, conteoNA: na };
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

  // Cambiar evaluación de un criterio (SI, NO, NA)
  const handleCambiarEvaluacion = (criterioId, valor) => {
    setEvaluaciones(prev => ({ ...prev, [criterioId]: valor }));
  };

  // Cambiar observación específica
  const handleCambiarObservacion = (criterioId, texto) => {
    setObservacionesItems(prev => ({ ...prev, [criterioId]: texto }));
  };

  // Cambiar segunda evaluación después de observado
  const handleCambiarSegundaEvaluacion = (criterioId, texto) => {
    setSegundaEvaluacionItems(prev => ({ ...prev, [criterioId]: texto }));
  };

  // Manejo de archivo firmado
  const handleArchivoSeleccionado = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const esPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const esImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png)$/i.test(file.name);

    if (!esPdf && !esImg) {
      mostrarToast?.('Por favor seleccione un archivo en formato PDF o Imagen (JPG, PNG).', 'warning');
      return;
    }

    setArchivoFirmado(file);
    setArchivoFirmadoNombre(file.name);
    setArchivoFirmadoEsPdf(esPdf);
    const objectUrl = URL.createObjectURL(file);
    setArchivoFirmadoUrl(objectUrl);
    mostrarToast?.(`Documento "${file.name}" cargado para vista previa.`, 'success');
  };

  const handleQuitarDocumento = () => {
    setArchivoFirmado(null);
    setArchivoFirmadoUrl('');
    setArchivoFirmadoNombre('');
    setArchivoFirmadoEsPdf(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    mostrarToast?.('Documento quitado.', 'info');
  };

  const handleVerPdf = () => {
    if (!archivoFirmadoUrl) {
      mostrarToast?.('No hay ningún documento cargado para visualizar.', 'warning');
      return;
    }
    window.open(archivoFirmadoUrl, '_blank');
  };

  // Generador de PDF oficial de la lista de verificación (R.M. 0202)
  const handleDescargarFormularioPDF = async () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'letter'
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      // Cargar imágenes de los escudos oficiales
      const [imgBolivia, imgCbba] = await Promise.all([
        cargarImagenComoPngDataUrl(escudoBolivia),
        cargarImagenComoPngDataUrl(escudoCochabamba)
      ]);

      // Función modular para dibujar la cabecera oficial en cualquier página
      const dibujarEncabezadoInstitucional = (d, boliviaImg, cbbaImg, w) => {
        // 1. Escudo de Bolivia (Izquierda)
        if (boliviaImg) {
          d.addImage(boliviaImg, 'PNG', 14, 6, 21, 21);
        }

        // 2. Escudo de Cochabamba (Derecha)
        if (cbbaImg) {
          d.addImage(cbbaImg, 'PNG', w - 14 - 21, 6, 21, 21);
        }

        // 3. Textos Institucionales Centrales
        d.setFont('times', 'italic');
        d.setFontSize(9.5);
        d.setTextColor(20, 20, 20);
        d.text('ESTADO PLURINACIONAL DE BOLIVIA', w / 2, 11, { align: 'center' });
        d.text('GOBIERNO AUTÓNOMO DEPARTAMENTAL', w / 2, 15, { align: 'center' });

        d.setFont('helvetica', 'bold');
        d.setFontSize(7.5);
        d.setTextColor(30, 30, 30);
        d.text('SECRETARIA DEPARTAMENTAL DE DESARROLLO HUMANO INTEGRAL', w / 2, 19, { align: 'center' });
        d.text('SERVICIO DEPARTAMENTAL DE SALUD COCHABAMBA', w / 2, 22.5, { align: 'center' });
        d.text('COORDINACION DEPARTAMENTAL DE LABORATORIOS', w / 2, 26, { align: 'center' });

        // Línea divisoria horizontal superior
        d.setDrawColor(0, 0, 0);
        d.setLineWidth(0.6);
        d.line(14, 28.5, w - 14, 28.5);
      };

      // Dibujar cabecera en Página 1
      dibujarEncabezadoInstitucional(doc, imgBolivia, imgCbba, pageWidth);

      // Título del Formulario (solo Página 1)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(0, 0, 0);
      doc.text(
        'LISTA DE VERIFICACION PARA LA APLICACIÓN DEL REGLAMENTO DE HABILITACION',
        pageWidth / 2,
        33.5,
        { align: 'center' }
      );

      // Párrafo normativo oficial
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(20, 20, 20);
      const subtexto = 'La renovación de habilitación es extendida a los laboratorios que demuestran mejora continua y/o sostenibilidad de su sistema de gestión de calidad, marco Normativo aprobado por R.M. 0202';
      const splitSubtexto = doc.splitTextToSize(subtexto, pageWidth - 28);
      doc.text(splitSubtexto, 14, 38);

      // Línea de Resultados INSITU y Gestión
      const anioActual = fechaInspeccion ? fechaInspeccion.slice(0, 4) : new Date().getFullYear();
      const labNombre = (establecimientoNombre || 'Laboratorio Clínico').toUpperCase();
      const yLineInfo = 45.5;

      const prefix = 'Resultados de la evaluación INSITU a Laboratorio: ';
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(prefix, 14, yLineInfo);

      const prefixWidth = doc.getTextWidth(prefix);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 50, 120);
      doc.text(labNombre, 14 + prefixWidth, yLineInfo);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(`Gestión: ${anioActual}`, pageWidth - 14, yLineInfo, { align: 'right' });

      // Construcción de filas de la tabla
      const tableRows = [];

      SECCIONES_FORMULARIO.forEach((sec) => {
        tableRows.push([
          {
            content: `${sec.codigo}. ${sec.titulo} (Ponderación: ${sec.peso}%)`,
            colSpan: 6,
            styles: {
              fillColor: [0, 85, 150],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              fontSize: 7,
              halign: 'left'
            }
          }
        ]);

        sec.criterios.forEach((crit) => {
          const evalVal = evaluaciones[crit.id] || 'SI';
          const obsVal = observacionesItems[crit.id] || '';
          const segVal = segundaEvaluacionItems[crit.id] || '';

          tableRows.push([
            crit.articulo,
            crit.inciso,
            `${crit.criterio}\n[Criterio: ${crit.estandar}]`,
            evalVal,
            obsVal,
            segVal
          ]);
        });
      });

      autoTable(doc, {
        startY: 49.5,
        head: [
          [
            'ART.',
            'INC.',
            'REQUISITO Y CRITERIOS DE EVALUACIÓN',
            'EVAL.',
            'OBSERVACIONES',
            'SEGUNDA EVALUACIÓN TRAS OBSERVADO'
          ]
        ],
        body: tableRows,
        theme: 'grid',
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontSize: 6.5,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle'
        },
        bodyStyles: {
          fontSize: 6,
          textColor: [15, 23, 42],
          cellPadding: 1.2,
          valign: 'top'
        },
        columnStyles: {
          0: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 9, halign: 'center', fontStyle: 'bold' },
          2: { cellWidth: 80 },
          3: { cellWidth: 14, halign: 'center', fontStyle: 'bold' },
          4: { cellWidth: 36 },
          5: { cellWidth: 35 }
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        margin: { top: 32, bottom: 15, left: 14, right: 14 },
        didDrawPage: function () {
          dibujarEncabezadoInstitucional(doc, imgBolivia, imgCbba, pageWidth);
        },
        didParseCell: function (data) {
          if (data.column.index === 3 && data.section === 'body') {
            if (data.cell.raw === 'SI') {
              data.cell.styles.textColor = [16, 185, 129];
              data.cell.styles.fontStyle = 'bold';
            } else if (data.cell.raw === 'NO') {
              data.cell.styles.textColor = [225, 29, 72];
              data.cell.styles.fontStyle = 'bold';
            } else if (data.cell.raw === 'NA') {
              data.cell.styles.textColor = [100, 116, 139];
            }
          }
        }
      });

      // Espacio para Dictamen en la última página o nueva página
      let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : 200;
      if (finalY > doc.internal.pageSize.getHeight() - 50) {
        doc.addPage();
        dibujarEncabezadoInstitucional(doc, imgBolivia, imgCbba, pageWidth);
        finalY = 34;
      }

      // Cuadro de Dictamen Final
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(14, finalY, pageWidth - 28, 20, 1.5, 1.5, 'FD');

      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('DICTAMEN TÉCNICO Y CONCLUSIONES:', 18, finalY + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      const splitConclusiones = doc.splitTextToSize(conclusionesGenerales || 'Sin observaciones.', pageWidth - 36);
      doc.text(splitConclusiones, 18, finalY + 8.5);

      doc.setFont('helvetica', 'bold');
      doc.text(`Cumplimiento: ${porcentaje}% (${puntajeTotal}/${maxPuntaje} pts)   |   Veredicto Oficial: ${resultadoFinal.toUpperCase()}`, 18, finalY + 16.5);

      // Pie de página oficial en todas las páginas generadas
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Página ${i} de ${totalPages}   |   SEDES Cochabamba - R.M. 0202 Formulario Oficial de Inspección In-Situ`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 6,
          { align: 'center' }
        );
      }

      // Guardar PDF
      const nombreArchivo = `Formulario_Inspeccion_RM0202_${(establecimientoNombre || 'Establecimiento').replace(/[^a-zA-Z0-9]/g, '_')}_${fechaInspeccion || '2026'}.pdf`;
      doc.save(nombreArchivo);
      mostrarToast?.('Formulario oficial PDF generado y descargado con éxito.', 'success');
    } catch (err) {
      console.error('Error al generar PDF del formulario:', err);
      mostrarToast?.('Error al generar el PDF del formulario.', 'warning');
    }
  };

  // Limpiar Formulario
  const handleLimpiarFormulario = () => {
    if (window.confirm('¿Está seguro de que desea limpiar todos los campos y restablecer el formulario a sus valores por defecto?')) {
      const resetEvals = {};
      SECCIONES_FORMULARIO.forEach(sec => {
        sec.criterios.forEach(crit => {
          resetEvals[crit.id] = 'SI';
        });
      });
      setEvaluaciones(resetEvals);
      setObservacionesItems({});
      setSegundaEvaluacionItems({});
      setConclusionesGenerales('El establecimiento cumple con los requerimientos técnicos y sanitarios establecidos en el Reglamento General de Habilitación de Laboratorios (R.M. 0202) del SEDES Cochabamba.');
      setArchivoFirmado(null);
      setArchivoFirmadoUrl('');
      setArchivoFirmadoNombre('');
      setArchivoFirmadoEsPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      mostrarToast?.('Formulario restablecido correctamente.', 'info');
    }
  };

  // Notas del supervisor generadas dinámicamente según observaciones
  const notasSupervisor = useMemo(() => {
    const items = [];
    SECCIONES_FORMULARIO.forEach(sec => {
      sec.criterios.forEach(crit => {
        const evalVal = evaluaciones[crit.id];
        const obsVal = observacionesItems[crit.id]?.trim();
        const segVal = segundaEvaluacionItems[crit.id]?.trim();

        if (evalVal === 'NO') {
          items.push(`• [${crit.articulo} Inc. ${crit.inciso}] ${crit.criterio}${obsVal ? ` — Obs: ${obsVal}` : ''}${segVal ? ` (Segunda evaluación: ${segVal})` : ''}`);
        } else if (obsVal) {
          items.push(`• [${crit.articulo} Inc. ${crit.inciso}] ${obsVal}`);
        }
      });
    });

    if (items.length === 0) {
      return [
        '• Se verificó el cumplimiento de las condiciones edilicias y de bioseguridad conforme a la R.M. 0202.',
        '• Toda la documentación y manuales de procedimientos técnicos se encuentran disponibles para auditoría.',
        '• No se detectaron no-conformidades críticas en la presente evaluación in-situ.'
      ];
    }
    return items;
  }, [evaluaciones, observacionesItems, segundaEvaluacionItems]);

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

      // 1. Subir archivo firmado si fue adjuntado por el supervisor
      let urlFirmado = null;
      if (archivoFirmado) {
        try {
          const formData = new FormData();
          formData.append('file', archivoFirmado);
          if (inspeccionSeleccionadaId) {
            formData.append('inspeccion_id', inspeccionSeleccionadaId);
          }
          const uploadRes = await fetch('http://localhost:8000/api/supervisor/subir-acta-firmada', {
            method: 'POST',
            body: formData
          });
          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            urlFirmado = uploadData.url;
          }
        } catch (uploadErr) {
          console.warn('Error al subir documento firmado:', uploadErr);
        }
      }

      // Recopilar observaciones de ítems observados y segundas evaluaciones
      const noCumplidos = [];
      const detallesObservaciones = [];

      SECCIONES_FORMULARIO.forEach(sec => {
        sec.criterios.forEach(crit => {
          const evalItem = evaluaciones[crit.id];
          const obsItem = observacionesItems[crit.id]?.trim();
          const segItem = segundaEvaluacionItems[crit.id]?.trim();

          if (evalItem === 'NO') {
            const detalleObs = obsItem ? ` | Obs: ${obsItem}` : '';
            const detalleSeg = segItem ? ` | 2da Eval: ${segItem}` : '';
            noCumplidos.push(`• [${crit.articulo} - Inc. ${crit.inciso}] ${crit.criterio}${detalleObs}${detalleSeg}`);
          }

          if (obsItem || segItem) {
            detallesObservaciones.push({
              id: crit.id,
              articulo: crit.articulo,
              inciso: crit.inciso,
              evaluacion: evalItem,
              observacion: obsItem || '',
              segunda_evaluacion: segItem || ''
            });
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
          archivo_pdf_firmado_url: urlFirmado,
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
    : 'Supervisor Técnico SEDES';

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
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase bg-blue-50 text-[#0060a8] border border-blue-200 px-2.5 py-0.5 rounded-full">
                Formulario Oficial SEDES
              </span>
              <span className="text-xs font-bold text-slate-500">
                Reglamento de Habilitación R.M. 0202
              </span>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Lista de Verificación para la Aplicación del Reglamento de Habilitación
            </h2>
          </div>
        </div>

        {/* Medidor de Puntaje y Botón de Emisión */}
        <div className="flex items-center space-x-4 self-end md:self-auto">

          {/* Indicador de Porcentaje */}
          <div className="text-right">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              Cumplimiento
            </div>
            <div className={`text-xl font-black ${porcentaje >= 85 ? 'text-emerald-600' : porcentaje >= 70 ? 'text-amber-600' : 'text-rose-600'
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
            {codigoTramite || 'TRM-SEDES'}
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
                readOnly
                value={establecimientoNombre || 'Laboratorio Clínico Registrado'}
                className="w-full px-4 py-2.5 bg-slate-100/90 border border-slate-200 rounded-2xl font-bold text-slate-700 cursor-not-allowed select-none outline-none"
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
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-slate-600 block uppercase tracking-wider">
                Responsable / Director Técnico:
              </label>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Oficial</span>
            </div>
            <input
              type="text"
              readOnly
              value={propietarioNombre || 'Responsable Registrado'}
              title="Dato oficial registrado en SEDES (Solo lectura)"
              className="w-full px-4 py-2.5 bg-slate-100/90 border border-slate-200 rounded-2xl font-bold text-slate-700 cursor-not-allowed select-none outline-none"
            />
          </div>

          {/* Dirección */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-slate-600 block uppercase tracking-wider">
                Dirección del Establecimiento:
              </label>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Oficial</span>
            </div>
            <input
              type="text"
              readOnly
              value={direccionTexto || 'Dirección Registrada'}
              title="Dato oficial registrado en SEDES (Solo lectura)"
              className="w-full px-4 py-2.5 bg-slate-100/90 border border-slate-200 rounded-2xl font-bold text-slate-700 cursor-not-allowed select-none outline-none"
            />
          </div>

          {/* Supervisor Técnico */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-extrabold text-slate-600 block uppercase tracking-wider">
                Supervisor Acreditado SEDES:
              </label>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Oficial</span>
            </div>
            <input
              type="text"
              readOnly
              value={supervisorNombre}
              title="Supervisor acreditado SEDES en sesión"
              className="w-full px-4 py-2.5 bg-slate-100/90 border border-slate-200 rounded-2xl font-bold text-slate-700 cursor-not-allowed select-none outline-none"
            />
          </div>

        </div>

      </div>

      {/* ===================================================================== */}
      {/* 3. TABLAS DE EVALUACIÓN OFICIAL POR SECCIONES (I a VIII)              */}
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

            {/* Tabla de Criterios Oficiales */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">

                <thead className="bg-white text-[10px] sm:text-[11px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-3 py-3 w-20 text-center">ARTÍCULO</th>
                    <th className="px-2 py-3 w-12 text-center">INCISO</th>
                    <th className="px-4 py-3 min-w-[280px]">REQUISITO Y CRITERIOS DE EVALUACIÓN</th>
                    <th className="px-4 py-3 w-36 text-center">EVALUACIÓN</th>
                    <th className="px-3 py-3 min-w-[180px]">OBSERVACIONES</th>
                    <th className="px-3 py-3 min-w-[180px]">SEGUNDA EVALUACIÓN DESPUÉS DE OBSERVADO</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium">
                  {sec.criterios.map((crit) => {
                    const evalActual = evaluaciones[crit.id] || 'SI';
                    const obsActual = observacionesItems[crit.id] || '';
                    const segActual = segundaEvaluacionItems[crit.id] || '';

                    return (
                      <tr
                        key={crit.id}
                        className={`
                          transition-colors
                          ${evalActual === 'NO' ? 'bg-rose-50/40' : evalActual === 'NA' ? 'bg-slate-50/40' : 'hover:bg-slate-50/70'}
                        `}
                      >
                        {/* Artículo */}
                        <td className="px-3 py-3.5 text-center font-extrabold text-slate-700 whitespace-nowrap text-[11px]">
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
                            {crit.articulo}
                          </span>
                        </td>

                        {/* Inciso */}
                        <td className="px-2 py-3.5 text-center font-black text-[#0060a8] text-xs">
                          {crit.inciso}
                        </td>

                        {/* Requisito y Criterios */}
                        <td className="px-4 py-3.5 space-y-1">
                          <p className="font-extrabold text-slate-900 text-xs leading-snug">
                            {crit.criterio}
                          </p>
                          <p className="text-[11px] text-slate-500 leading-relaxed font-normal">
                            <span className="font-semibold text-slate-600">Criterio:</span> {crit.estandar}
                          </p>
                        </td>

                        {/* Botones de Evaluación: SÍ / NO / NA */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="inline-flex items-center p-1 bg-slate-100 rounded-xl space-x-1 border border-slate-200 shadow-2xs">

                            {/* SÍ */}
                            <button
                              type="button"
                              onClick={() => handleCambiarEvaluacion(crit.id, 'SI')}
                              className={`
                                px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer
                                ${evalActual === 'SI'
                                  ? 'bg-emerald-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                                }
                              `}
                              title="Cumple con el requisito (SÍ)"
                            >
                              SÍ
                            </button>

                            {/* NO */}
                            <button
                              type="button"
                              onClick={() => handleCambiarEvaluacion(crit.id, 'NO')}
                              className={`
                                px-2.5 py-1 rounded-lg text-[11px] font-black transition cursor-pointer
                                ${evalActual === 'NO'
                                  ? 'bg-rose-600 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                                }
                              `}
                              title="No cumple con el requisito (NO)"
                            >
                              NO
                            </button>

                            {/* NA */}
                            <button
                              type="button"
                              onClick={() => handleCambiarEvaluacion(crit.id, 'NA')}
                              className={`
                                px-2 py-1 rounded-lg text-[11px] font-black transition cursor-pointer
                                ${evalActual === 'NA'
                                  ? 'bg-slate-700 text-white shadow-2xs'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                                }
                              `}
                              title="No aplica a este nivel (N/A)"
                            >
                              N/A
                            </button>

                          </div>
                        </td>

                        {/* Campo 1: Observaciones */}
                        <td className="px-3 py-3.5">
                          <input
                            type="text"
                            placeholder={evalActual === 'NO' ? 'Especifique deficiencia u observación...' : 'Observación (opcional)...'}
                            value={obsActual}
                            onChange={(e) => handleCambiarObservacion(crit.id, e.target.value)}
                            className={`
                              w-full px-3 py-1.5 rounded-xl text-xs font-medium outline-none transition border
                              ${evalActual === 'NO'
                                ? 'bg-white border-rose-300 text-rose-900 focus:ring-2 focus:ring-rose-400 placeholder-rose-300 font-semibold'
                                : 'bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#0060a8]'
                              }
                            `}
                          />
                        </td>

                        {/* Campo 2: Segunda Evaluación Después de Observado */}
                        <td className="px-3 py-3.5">
                          <input
                            type="text"
                            placeholder="Segunda evaluación tras observación..."
                            value={segActual}
                            onChange={(e) => handleCambiarSegundaEvaluacion(crit.id, e.target.value)}
                            className="w-full px-3 py-1.5 rounded-xl text-xs font-medium outline-none transition border bg-slate-50 border-slate-200 text-slate-700 focus:bg-white focus:ring-2 focus:ring-[#0060a8]"
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
      {/* BOTONES DE ACCIÓN: DESCARGAR FORMULARIO Y LIMPIAR FORMULARIO          */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={handleDescargarFormularioPDF}
          className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 transition cursor-pointer shadow-2xs flex items-center space-x-2"
          title="Descargar formulario oficial en formato PDF para impresión y firmas"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Descargar Formulario</span>
        </button>

        <button
          type="button"
          onClick={handleLimpiarFormulario}
          className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-800 font-bold text-xs hover:bg-slate-50 transition cursor-pointer shadow-2xs flex items-center space-x-2"
          title="Restablecer todos los campos del formulario"
        >
          <RotateCcw className="w-4 h-4 text-slate-600" />
          <span>Limpiar Formulario</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* SECCIÓN 3: SUBIR DOCUMENTO CON FIRMAS AUTORIZADAS                     */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">

        <div>
          <h3 className="text-base sm:text-lg font-black text-[#1e293b] tracking-tight">
            Sección 3: Subir Documento con Firmas Autorizadas
          </h3>
          <p className="text-xs font-bold text-slate-600 mt-1">
            Suba su Archivo Formato PDF
          </p>
        </div>

        {/* Botones de Archivo */}
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleArchivoSeleccionado}
            accept=".pdf,image/png,image/jpeg,image/jpg"
            className="hidden"
          />

          {/* Subir archivo */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs flex items-center space-x-2"
          >
            <Upload className="w-4 h-4 text-slate-700" />
            <span>Subir archivo</span>
          </button>

          {/* Ver PDF */}
          <button
            type="button"
            onClick={handleVerPdf}
            disabled={!archivoFirmadoUrl}
            className="px-4 py-2 bg-white hover:bg-slate-50 border-2 border-slate-900 text-slate-900 font-black text-xs rounded-xl transition cursor-pointer shadow-2xs flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Eye className="w-4 h-4" />
            <span>Ver PDF</span>
          </button>

          {/* Quitar documento */}
          <button
            type="button"
            onClick={handleQuitarDocumento}
            disabled={!archivoFirmadoUrl}
            className="px-4 py-2 bg-[#e53e3e] hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-2xs flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            <span>Quitar documento</span>
          </button>

          {archivoFirmadoNombre && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              ✓ {archivoFirmadoNombre}
            </span>
          )}
        </div>

        {/* Visor / Vista Previa del Documento */}
        <div className="bg-[#eef2f6] border border-slate-200/80 rounded-2xl p-4 sm:p-6 min-h-[480px] flex items-center justify-center overflow-hidden">
          {archivoFirmadoUrl ? (
            archivoFirmadoEsPdf ? (
              <iframe
                src={archivoFirmadoUrl}
                title="Vista previa del documento oficial firmado"
                className="w-full h-[650px] rounded-xl border border-slate-300 bg-white shadow-md"
              />
            ) : (
              <div className="max-h-[650px] overflow-auto flex items-center justify-center w-full">
                <img
                  src={archivoFirmadoUrl}
                  alt="Acta Oficial Escaneada"
                  className="max-h-[620px] w-auto max-w-full object-contain rounded-lg shadow-md bg-white"
                />
              </div>
            )
          ) : (
            <div className="text-center p-8 space-y-3 max-w-md">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-xs text-slate-400">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-sm font-black text-slate-700">
                Ningún documento firmado cargado todavía
              </p>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Descargue el formulario, imprímalo, recabe las firmas y sellos en campo con el Director Técnico del laboratorio, y luego cárguelo aquí en formato PDF o imagen escaneada.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer inline-flex items-center space-x-1.5 shadow-2xs mt-2"
              >
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Seleccionar archivo para subir</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* ===================================================================== */}
      {/* NOTAS DEL SUPERVISOR                                                  */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight">
          Notas del Supervisor
        </h3>

        <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-5 text-xs text-slate-700 leading-relaxed font-medium space-y-2">
          {notasSupervisor.map((nota, idx) => (
            <p key={idx} className="text-slate-800 font-semibold">
              {nota}
            </p>
          ))}
        </div>
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
          <span className={`text-xs font-black px-3 py-1 rounded-full border ${resultadoFinal === 'Aprobado'
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
              <p className="text-[10px] uppercase text-emerald-700">Requisitos Cumplidos (SÍ)</p>
              <p className="text-lg font-black">{conteoSI} ítems</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center space-x-3 text-rose-900">
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
            <div>
              <p className="text-[10px] uppercase text-rose-700">No Cumplidos (NO)</p>
              <p className="text-lg font-black">{conteoNO} ítems</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3 text-slate-700">
            <Info className="w-6 h-6 text-slate-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase text-slate-500">No Aplican (N/A)</p>
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
                <p className="text-[11px] text-slate-500 mt-0.5">Cumplimiento &ge; 85% sin observaciones críticas.</p>
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
