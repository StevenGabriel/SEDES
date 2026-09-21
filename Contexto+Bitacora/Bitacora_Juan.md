# Bitácora de Avance - Juan

---

## [2026-09-21] Sincronización en Tiempo Real de Modificaciones en el PDF de Resolución Administrativa y Gestión de Pestañas

### 📌 Objetivos
1. **Sincronización Bidireccional en Vivo de Ediciones y PDF:** Garantizar que cualquier edición realizada en los campos del *"Formulario de Edición de Datos"* (nombre del establecimiento, razón social, C.I., regente técnico, dirección, C.I. de la regente, tipo de establecimiento, número de resolución, fecha de emisión, rango de vigencia, antecedentes/vistos, fundamentos legales y artículos resolutivos) se refleje de manera inmediata e íntegra en el documento oficial en PDF (2 páginas) de la Resolución Administrativa.
2. **Corrección de Revocación Prematura de Object URLs:** Subsanar el problema de revocación de URLs blob en los efectos de React mediante referencias persistentes (`useRef`), evitando pantallas en blanco o documentos desactualizados al alternar entre pestañas.
3. **Navegación Fluida por Pestañas Separadas (Sin Split-Screen):** Mantener las 2 pestañas individuales e independientes:
   * **Pestaña 1:** *Documento PDF Oficial (Resolución Administrativa)* — Visor `iframe` interactivo en alta fidelidad con membretes y las 4 firmas institucionales.
   * **Pestaña 2:** *Formulario de Edición de Datos* — Formulario completo de edición modular con sincronización algorítmica de los párrafos jurídicos normativos.
4. **Accesos Rápidos de Previsualización y Descarga:** Incorporar el botón *"Ver Documento PDF Oficial"* en la barra de acciones inferior del editor y asegurar que tanto la visualización directa como la descarga del archivo compilen los datos modificados.

---

### 🛠️ Archivos Modificados

#### 1. `frontend/src/pages/AbogadoPage.jsx` [MODIFICADO]
* **Gestión de URLs Blob con `useRef`:** Implementación de `pdfResolucionUrlRef` y `pdfInformeUrlRef` para liberar la memoria de las URLs blob anteriores únicamente cuando se crea un nuevo blob o al desmontar el componente, eliminando la revocación prematura en los ciclos de debounce.
* **Sincronización de Entradas y Builders:** Actualización de los manejadores `handleCambioEstablecimiento`, `handleCambioPropietario`, `handleCambioCiNit`, `handleCambioRegente`, `handleCambioCiRegente`, `handleCambioDireccion`, `handleCambioTipoEstablecimiento`, `handleCambioFechaEmision` y `handleCambioVigenciaRango` para reconstruir en tiempo real los textos de *Vistos*, *Considerandos*, *Artículo Primero* y *Artículo Segundo*.
* **Botón de Acción Directa:** Inclusión del botón *"Ver Documento PDF Oficial"* en la barra de acciones inferior para conmutar directamente al visor del PDF con los cambios ya renderizados.

#### 2. `frontend/src/components/abogado/ResolucionAdministrativaPDF.js` [VERIFICADO]
* Confirmación de inyección directa de todos los parámetros editados (`numero_resolucion`, `fecha_emision`, `establecimiento`, `propietario`, `ci_nit`, `regente`, `ci_regente`, `direccion`, `tipo_establecimiento`, `antecedentes`, `fundamento_legal`, `articulo_primero`, `articulo_segundo`, `articulo_tercero`) a lo largo de las 2 páginas oficiales con sus 4 firmas y sellos institucionales.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación de Producción:** Ejecución exitosa de `npm run build` en el frontend (código de salida 0, sin errores).
* **Flujo de Edición y Previsualización:** Verificación de cambios de texto en vivo (ej. nombre de establecimiento, propietario y regente) reflejándose inmediatamente al pasar a la pestaña de PDF o descargar la Resolución Oficial.

---

## [2026-09-21] Integración Exclusiva de Datos Reales en Asesoría Legal: Filtro Estricto de Informes Técnicos Derivados por Coordinación

### 📌 Objetivos
1. **Eliminación Total de Datos Simulados/Mock en el Módulo de Asesoría Legal:** Suprimir por completo los registros estáticos y de demostración (`demo-req-0042`, `Clinica Sur`, `Farmacia Nova`, etc.) en todos los servicios del backend (`backend/abogado.py`) y en las vistas del frontend (`AbogadoPage.jsx`).
2. **Filtrado Estricto de Trámites Derivados por el Coordinador:** Asegurar que en la lista de *"Informes Recibidos"* del Asesor Legal únicamente se listen los trámites reales de PostgreSQL en los que el Coordinador haya generado el Informe Técnico y derivado formalmente el expediente a Asesoría Legal (`estado_tramite` en `'Derivado a Asesoría Legal'`, `'En Asesoría Legal'`, `'En Informe Técnico'`, o `'Aprobado'`).
3. **Visor Interactivo del PDF Oficial del Informe Técnico (Comunicación Interna):** Integrar en la consola del Abogado la visualización directa del documento oficial en PDF de 3 páginas de Informe Técnico / Comunicación Interna emitido por Coordinación (con membretes del Estado Plurinacional, Cochabamba y SEDES, CITE oficial, memorándum, tabla de inspección y dictamen), permitiendo previsualizar el PDF en un `iframe` interactivo, abrirlo en nueva pestaña, descargarlo o conmutar a la ficha de datos.
4. **Carga Dinámica de Información Legal y de Campo:** Obtener dinámicamente desde PostgreSQL todos los datos del establecimiento, titular/propietario, CI/NIT, dirección, documentos reglamentarios validados, veredicto del supervisor asignado y el dictamen/observaciones técnicas emitidas por el Coordinador en el log de actividades.
5. **Estados Vacíos Institucionales y Resiliencia en Renderizado:** Implementar tarjetas de estado vacío elegantes cuando no existan informes técnicos pendientes o cuando ningún borrador esté seleccionado, evitando errores en tiempo de ejecución o conteos artificiales de pendientes.

---

### 🛠️ Archivos Modificados

#### 1. `backend/abogado.py` [MODIFICADO]
* **`GET /api/abogado/informes`:** Se eliminó la inyección de `demo_records`. La consulta filtra directamente sobre `models.Tramite` con relaciones a `models.Establecimiento` y `models.ResolucionAdministrativa`, ordenando por prioridad de atención legal (`Derivado a Asesoría Legal` primero).
* **`GET /api/abogado/informe/{tramite_id}`:** Resolución dinámica por UUID o prefijo de código real en PostgreSQL. Extracción de documentación reglamentaria real del trámite, datos del supervisor, fecha programada, dictamen de inspección y observaciones oficiales del Coordinador desde `models.HistorialActividad`.
* **`GET /api/abogado/resolucion-borrador/{tramite_id}`:** Generación y recuperación de antecedentes, fundamentos legales, artículos resolutivos y notas jurídicas vinculadas al ID real del trámite.
* **`POST /api/abogado/guardar-resolucion` & `POST /api/abogado/enviar-coordinador`:** Persistencia transaccional directa en `models.ResolucionAdministrativa` y registro de auditoría en `models.HistorialActividad`.
* **`GET /api/abogado/historial`:** Consulta 100% en PostgreSQL de resoluciones emitidas o enviadas al Coordinador.

#### 2. `frontend/src/pages/AbogadoPage.jsx` [MODIFICADO]
* **Estados y Selección Inicial:** Se eliminó el ID de mock por defecto (`demo-req-0042`), inicializando en `null` o seleccionando automáticamente el primer trámite real disponible tras consultar la API.
* **Cómputo Preciso de Pendientes:** Se corrigió el cálculo de pendientes (`total_pendientes` real de la base de datos sin fallbacks artificiales de `|| 5`).
* **Renderizado Dinámico de Documentos Legales:** Mapeo directo de `detalleInforme.documentacion_legal` con sus nombres y estados reales de validación.
* **Manejo de Estados Vacíos:** Inclusión de pantallas de cortesía cuando no existen expedientes derivados por el Coordinador.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de Endpoints Backend:**
  * `GET http://localhost:8000/api/abogado/informes` retorna con éxito únicamente los trámites reales (`cd3d206c` - *Lab prueba 2* y `70b05a6f` - *Laboratorio Clínico Boliviano*).
  * `GET http://localhost:8000/api/abogado/informe/cd3d206c-2853-4931-abdb-951fdddf1aae` responde con los 44 requisitos normativos reales, propietario (*Steven Gabriel Claros Tapia*), supervisor (*Andrea Torrico*) e informe técnico oficial (*CODELAB/SEDES/71/2026*).
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores de sintaxis o empaquetado.

---

## [2026-09-21] Homologación y Estandarización del Menú Lateral Institucional en el Módulo de Asesoría Legal (AbogadoPage)

### 📌 Objetivos
1. **Homologación Visual y Arquitectónica del Sidebar:** Rediseñar la barra de navegación lateral en la consola del Asesor Legal (`AbogadoPage.jsx`) para ajustarse con exactitud al formato institucional implementado en la consola del Coordinador (`CoordinadorPage.jsx`), Director (`DirectorPage.jsx`) y Supervisor (`SupervisorPage.jsx`).
2. **Estandarización de Identidad Visual y Logotipo:** Reemplazar los componentes aislados de logotipo por el contenedor oficial de isotipo `FlaskConical` con tarjeta translúcida (`bg-white/20`, borde suave y backdrop blur) y la marca institucional `SI_Lab` con el sufijo `_Lab` en celeste brillante.
3. **Optimización de Navegación y Estados Activos:** Unificar el comportamiento de los enlaces del menú mediante el arreglo `menuItems`, asegurando la navegación fluida a `/abogado/informes-recibidos`, `/abogado/resolucion-administrativa` y `/abogado/historial`, con el indicador activo `#004b85` con borde izquierdo blanco (`border-l-4 border-white`) y sombreado interior.
4. **Pie Institucional Oficial (Footer):** Integrar el bloque inferior `#00518f` con los escudos departamental y nacional oficiales (`logoL1` y `logoL2`), separador vertical y la leyenda reglamentaria del Ministerio de Salud y Deportes.
5. **Normalización del Header y Avatar Dinámico:** Adaptar el encabezado superior con breadcrumbs estándar y avatar de iniciales dinámicas (`getInitials` y `getAvatarColor`).

---

### 🛠️ Archivos Modificados

#### 1. `frontend/src/pages/AbogadoPage.jsx` [MODIFICADO]
* **Barra Lateral (`<aside>`):**
  * Se migró la estructura del sidebar al formato `w-72 bg-[#0060a8] text-white fixed lg:static flex flex-col justify-between` con soporte completo para backdrop en dispositivos móviles.
  * Se implementó el logotipo oficial con enlace a la raíz (`/`), icono `FlaskConical` estilizado y tipografía `SI_Lab`.
  * Se configuró la lista de navegación estructurada:
    * *Informes Recibidos* (`/abogado/informes-recibidos` con icono `FileText`).
    * *Resolución Administrativa* (`/abogado/resolucion-administrativa` con icono `Award`).
    * *Historial* (`/abogado/historial` con icono `History`).
  * Se incorporó el pie institucional con los escudos oficiales (`L1.png` y `L2.png`) y la leyenda de acreditación gubernamental.
* **Header y Perfil de Usuario:**
  * Se adaptó la barra superior para reflejar la ruta breadcrumb activa (`Consola del Abogado / [Sección]`).
  * Se integró el generador algorítmico de avatar con iniciales automáticas (`getInitials`) y paleta armónica institucional.
* **Layout Responsivo:**
  * Se sincronizó el contenedor principal a `min-h-screen bg-[#f3f6f9] flex overflow-hidden` y el área de contenido con scroll independiente (`overflow-y-auto`).

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación en Producción:** Se ejecutó `npm run build` en el frontend, verificando una compilación limpia (código de salida 0) sin errores de sintaxis, dependencias ni advertencias críticas.
* **Inspección Visual y Responsiva:** Se comprobó que el menú lateral se renderiza de manera idéntica al diseño del Coordinador, con navegación funcional entre las tres vistas del módulo legal y apertura/cierre responsivo en móviles.

---

## [2026-09-18] Homologación del Visor de Documentos/PDF en Citaciones Emitidas (Estilo Actas Oficiales) y Sincronización de Dependencias Docker

### 📌 Objetivos
1. **Resolución y Estabilización de Dependencias en Contenedores Docker:** Subsanar el error de resolución de módulos en Vite (`Failed to resolve import "jspdf-autotable"`), garantizando la correcta instalación y sincronización de las librerías `jspdf` y `jspdf-autotable` dentro del volumen de dependencias del contenedor de desarrollo (`sedes-frontend-1`).
2. **Verificación y Trazabilidad de Registros Reales en PostgreSQL (Neon Cloud):** Auditar el origen de los datos presentados en el historial de citaciones emitidas (registro `CT-2026-001` de *Laboratorio Clínico Boliviano*), constatando la persistencia directa de la base de datos relacional y el descarte absoluto de mocks o datos estáticos en el frontend.
3. **Rediseño Integral del Visor de Adjuntos y Documentos (Homologación con Actas):** Transformar la sección de **Adjuntos** en el formulario de registro de citaciones (`CitacionesEmitidasView.jsx`) para replicar con exactitud el estándar visual y funcional del módulo de **Actas de Inspección** (`NuevaActaFormView.jsx`), incorporando previsualización interactiva en tiempo real para documentos escaneados en formato PDF (ej. CamScanner) e imágenes fotográficas de alta resolución.
4. **Experiencia de Usuario y Acciones de Archivo:** Implementar la barra de herramientas de documentos: botón interactivo *Subir archivo*, botón *Ver PDF / Documento* (apertura en nueva pestaña), botón *Quitar documento* con advertencia/limpieza inmediata, y etiqueta verde con el nombre del archivo cargado.

---

### 🛠️ Archivos Modificados y Desarrollados

#### 1. `frontend/src/components/supervisor/CitacionesEmitidasView.jsx` [MODIFICADO]
* **Visor Interactivo de Documentos Integrado (Iframe embebido de 650px):**
  * Se sustituyó la tarjeta estática de archivo por un visor central responsivo (`min-h-[480px]`) con `iframe` de 650px de altura para documentos PDF y renderizador con escala optimizada para fotografías/imágenes.
  * Permite al supervisor técnico revisar, hojear páginas y hacer zoom sobre el acta escaneada o evidencia directamente en el formulario antes de guardar.
* **Barra de Acciones de Documento (Estilo Actas):**
  * Integración de botones con diseño idéntico a `NuevaActaFormView`:
    * Botón **"Subir archivo"** con selector universal de imágenes y documentos PDF (`.pdf,image/png,image/jpeg,image/webp`).
    * Botón **"Ver PDF / Ver Documento"** con icono `Eye` para consulta en pantalla completa.
    * Botón **"Quitar documento"** (`#e53e3e` / `Trash2`) con deshabilitación inteligente y limpieza de referencias.
    * Indicador con badge verde de confirmación (`✓ [nombre_archivo]`).
* **Manejo de Blob URLs y Carga Asíncrona:**
  * Generación inmediata de `URL.createObjectURL` para renderizado instantáneo en el visor del cliente en paralelo con la subida al servidor FastAPI (`/api/supervisor/subir-evidencia-citacion`).
* **Visor en Modal de Detalle de Citación:**
  * Actualización del modal de consulta (`modalDetalleOpen`) para renderizar el documento PDF embebido o imagen fotográfica con enlace directo para apertura completa.

#### 2. `frontend/package.json` & Entorno Docker [SINCRONIZADO]
* Ejecución de instalación interna de `jspdf-autotable` y `jspdf` en el contenedor `sedes-frontend-1` (`docker compose exec frontend npm install jspdf-autotable jspdf`).
* Re-optimización de dependencias en Vite y confirmación de build limpio sin advertencias de importación.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de Carga y Previsualización de PDF:** Se cargó un archivo escaneado de CamScanner en formato PDF comprobando su renderizado nítido en el visor interactivo de 650px.
* **Prueba de Botones de Acción:** Se verificaron las funciones *Subir archivo*, *Ver PDF* (apertura en nueva pestaña) y *Quitar documento* (retorno al placeholder inicial con iconografía institucional).
* **Persistencia en Neon PostgreSQL:** Se confirmó que la URL pública de la evidencia se asocia correctamente al registro en la tabla `citaciones_infracciones`.
* **Hot Module Replacement (HMR):** Vite procesó las actualizaciones en `/src/components/supervisor/CitacionesEmitidasView.jsx` con 0 errores en consola.

---

## [2026-09-17] Implementación Integral del Módulo de Citaciones Emitidas por Infracción (Panel del Supervisor + Registro con Alertas + Base de Datos Real)

### 📌 Objetivos
1. **Implementación de la Vista de Citaciones Emitidas (`/supervisor/citaciones-emitidas`):** Desarrollar la interfaz visual completa del historial de citaciones sanitarias para el Supervisor Técnico, replicando fielmente el diseño institucional de Figma: cabecera con acciones ("Exportar Reporte", "Registrar Acta"), barra de filtros interactiva (búsqueda por código/establecimiento, selector de resultado, selector mensual y botón "Filtrar"), tabla de historial con badge contador, columnas oficiales y paginación ergonómica.
2. **Historial Estricto de Citaciones Rechazadas:** Garantizar que en el historial de citaciones se listen únicamente los registros dictaminados con veredicto o resultado **"Rechazado"** por infracciones sanitarias o incumplimiento normativo, utilizando exclusivamente datos reales registrados en la base de datos PostgreSQL (`citaciones_infracciones` e `inspecciones`), sin datos falsos ni mocks.
3. **Formulario de Emisión "Registrar Citación":** Crear el formulario interactivo de registro de citaciones dividido en 4 secciones funcionales:
   * **Sección 1 (Establecimiento):** Selector desplegable con establecimientos reales de la BD y autocompletado de nombre, dirección y municipio.
   * **Sección 2 (Citación):** Correlativo sugerido automático (ej. `CT-2026-001`), selector de fecha de emisión y campo de motivo/infracción observada.
   * **Sección 3 (Adjuntos):** Carga y almacenamiento en servidor de evidencia fotográfica o informe en PDF con área de vista previa y botón para remover.
   * **Sección 4 (Alertas automáticas):** Switches interactivos para configurar alertas de 5 días antes (notificación al supervisor y establecimiento), 10 días antes (recordatorio de subsanación) y 15 días antes (sanciones administrativas).
4. **Backend y Persistencia en PostgreSQL (FastAPI + SQLAlchemy):** Implementar y exponer los endpoints RESTful para consulta paginada con filtros, listado de establecimientos, subida de evidencias a disco (`/uploads/citaciones/`) y registro con trazabilidad en auditoría (`historial_actividades`) y mensajería (`notificaciones`).
5. **Visor de Detalle y Exportación de Reportes:** Integrar modal de consulta detallada con visualizador de evidencias fotográficas/documentales y exportador de reportes en formato CSV/Excel compatible con hojas de cálculo.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/models.py` [MODIFICADO]
* **Ampliación del Modelo `CitacionInfraccion`:**
  * Se añadieron las columnas `numero_citacion` (VARCHAR 50), `tipo_inspeccion` (VARCHAR 100), `inspeccion_id` (UUID ForeignKey a `inspecciones.id`), `alerta_5_dias` (Boolean default True), `alerta_10_dias` (Boolean default False) y `alerta_15_dias` (Boolean default False).
  * Se definió la relación ORM con el modelo `Inspeccion`.

#### 2. `backend/supervisor.py` [MODIFICADO]
* **Schema de Entrada Pydantic:**
  * Se creó `RegistrarCitacionRequest` con validaciones de campos requeridos (establecimiento, motivo de citación, fecha de emisión, tipo de inspección, evidencia y switches de alerta).
* **Endpoints API REST:**
  * `GET /api/supervisor/{supervisor_id}/citaciones`: Consulta paginada y filtrada (búsqueda por texto, resultado y mes/año) que recupera únicamente registros con resultado `"Rechazado"`.
  * `GET /api/supervisor/{supervisor_id}/establecimientos-citacion`: Retorna los establecimientos registrados en la base de datos con sus respectivos propietarios y direcciones.
  * `POST /api/supervisor/registrar-citacion`: Inserta el registro en `citaciones_infracciones`, genera el registro de trazabilidad en `historial_actividades` y dispara la notificación correspondiente en `notificaciones`.
  * `POST /api/supervisor/subir-evidencia-citacion`: Almacena el archivo fotográfico o documento PDF de la evidencia en `uploads/citaciones/` y retorna la URL pública de acceso.

#### 3. `frontend/src/components/supervisor/CitacionesEmitidasView.jsx` [NUEVO / CREADO]
* **Vista de Historial de Citaciones:**
  * Encabezado con título "Citaciones Emitidas", subtítulo institucional y botones "Exportar Reporte" y "Registrar Acta".
  * Barra de filtros con buscador dinámico, dropdown de estado, selector de mes y botón "Filtrar".
  * Tabla con insignia de conteo de actas/citaciones emitidas, filas con badge rojo `Rechazado` y botón `Ver`.
  * Paginación dinámica que calcula el rango mostrado sobre el total de registros reales.
  * Modal detallado con datos de la citación, motivo técnico, visualizador de imagen/PDF de evidencia y estado de alertas.
  * Modal de exportación de reporte en formato CSV descargable.
* **Vista de Formulario de Registro:**
  * Formulario estructurado en 4 secciones exactas a la maqueta de Figma (Establecimiento, Citación, Adjuntos y Alertas automáticas con switches interactivos).
  * Conexión asíncrona a los endpoints de subida de archivos y guardado en base de datos con feedback visual mediante notificaciones toast.

#### 4. `frontend/src/pages/SupervisorPage.jsx` [MODIFICADO]
* **Integración en el Enrutador del Supervisor:**
  * Importación de `CitacionesEmitidasView`.
  * Renderizado condicional en el contenedor principal cuando `seccionActiva === 'citaciones-emitidas'`.
  * Sincronización con el ítem de navegación lateral activo.

---

### 📊 Verificación y Pruebas Realizadas
* **Base de Datos PostgreSQL (Neon):** Se verificó la ejecución de las migraciones de columnas y la persistencia de citaciones vinculadas a los establecimientos registrados en el sistema.
* **Prueba de Endpoints Backend:** Se validó la ejecución de `GET /citaciones`, `GET /establecimientos-citacion` y `POST /registrar-citacion` retornando status HTTP 200 con formato JSON íntegro.
* **Compilación Frontend:** Ejecución exitosa de `npm run build` con 0 errores y 2047 módulos transformados correctamente por Vite.
* **Navegación Fluida:** Verificación del flujo de apertura del formulario, subida de evidencias, selección de establecimientos, guardado y retorno automático al historial actualizado.

---

### 📌 Objetivos
1. **Flujo y Limpieza Automática de Observaciones Técnicas:** Garantizar que cuando un documento es observado o rechazado por Coordinación, al momento en que el Propietario vuelve a subir el PDF corregido (subsanación), las observaciones previas se limpien automáticamente en PostgreSQL (`observaciones_supervisor = None`) y el documento pase a estado *"En Revisión"*. Asimismo, asegurar que tanto en la vista del Propietario como en la del Coordinador desaparezcan las notas de observación roja y avisos residuales al subsanar o aprobar el documento.
2. **Navegación Directa de Agendamiento de Inspección de Campo:** Cambiar el comportamiento del botón *"Agendar Inspección de Campo"* en la consola de Coordinación para redirigir directamente a la vista de **Asignar Supervisores** (`/coordinador/asignar-supervisores`), eliminando la ventana emergente (*popup modal*) para una navegación más fluida y centralizada.
3. **Rediseño, Formato y Títulos Completos en Notificaciones:** Solucionar el truncamiento de títulos a 40 caracteres, eliminar el error visual de `Invalid Date` y ampliar las dimensiones del menú desplegable de notificaciones con diseño responsivo, iconos temáticos por tipo de evento y marcas temporales relativas (*"Hace 5 min"*, *"Hace 1 h"*).

---

### 🛠️ Archivos Modificados y Desarrollados

#### 1. `backend/coordinador.py` [MODIFICADO]
* **Limpieza de Observaciones al Validar/Aprobar:**
  * En `PATCH /api/coordinador/documentos/{documento_id}/validar`, al dictaminar un documento como `"Aprobado"` o `"En Revisión"`, se limpian automáticamente las observaciones en la base de datos (`doc.observaciones_supervisor = None`), evitando que observaciones antiguas persistan en documentos ya conformes.
  * Si el documento es `"Observado"` o `"Rechazado"`, se almacena el motivo técnico ingresado en el modal.
* **Títulos Completos en Notificaciones:**
  * Se eliminó el truncamiento de 40 caracteres (`[:40]`), permitiendo que el título completo del requisito normativo sea visible sin recortes (`⚠️ Documento Observado: {nombre_doc}` y `✓ Documento Aprobado: {nombre_doc}`).

#### 2. `backend/tramites.py` [MODIFICADO]
* **Restablecimiento y Limpieza en Subsanación:**
  * En `POST /api/tramites/{tramite_id}/documentos/{documento_id}/subsanar` y `POST /api/tramites/{tramite_id}/documentos`, al subir el propietario el nuevo PDF corregido, se actualiza la URL del archivo, el estado de validación se restablece a `"En Revisión"` y se limpian las observaciones técnicas previas (`doc.observaciones_supervisor = None`).
  * Se notifica de inmediato a los Coordinadores y al Supervisor asignado sobre la subsanación.

#### 3. `backend/notificaciones.py` [MODIFICADO]
* **Estructura Enriquecida de Notificaciones:**
  * Se añadió el campo `fecha_creacion` en formato ISO estándar (`isoformat()`), `fecha` formateada y `tiempoRelativo` (*"Hace un momento"*, *"Hace X min"*, *"Ayer"*), proveyendo al frontend datos fiables de tiempo.

#### 4. `frontend/src/pages/CoordinadorPage.jsx` [MODIFICADO]
* **Flujo de Documentos y Observaciones:**
  * Al aprobar un documento en el visor, el estado local y backend se actualizan sin conservar observaciones residuales.
  * Los tags y cajas de alerta de observaciones técnicas ahora sólo se muestran si el documento se encuentra activamente en estado `Observado` o `Rechazado`.
* **Redirección de Agendar Inspección:**
  * El botón *"Agendar Inspección de Campo"* (en ambas pestañas de Documentación y Fiscalización) ejecuta `navigate('/coordinador/asignar-supervisores')` directamente.
  * Se removió el modal emergente de re-inspección (`modalReinspeccionOpen`) para unificar la asignación y fiscalización en la tabla de supervisores.
* **Rediseño del Dropdown de Notificaciones:**
  * Se amplió el ancho del panel (`w-96 sm:w-[460px] md:w-[500px]`) con bordes redondeados y sombra profunda.
  * Integración de iconos contextuales con badges temáticos (rojo para observaciones, verde para aprobaciones, azul para documentos/subsanaciones y violeta para inspecciones/supervisores).
  * Despliegue de títulos completos, mensaje con interlineado adecuado, timestamp relativo con icono de reloj y botón de recarga rápida.

#### 5. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Experiencia de Subsanación Documental:**
  * Al enviar una subsanación individual o masiva, el documento desaparece inmediatamente de la tarjeta de *Documentos Observados que Requieren Subsanación*.
  * En la tabla general de requisitos, la observación roja se oculta automáticamente al pasar a estado `"En Revisión"`.
* **Menú Desplegable de Notificaciones Mejorado:**
  * Diseño sincronizado con cabecera oscura moderna, títulos completos sin recortar, badges de tiempo relativo y botón de acción directa *"Ir a Subsanar →"* para documentos con observaciones.

#### 6. `Base de Datos PostgreSQL (Neon)` [DEPURACIÓN Y LIMPIEZA]
* Se ejecutó script de depuración sobre la tabla `tramite_documentos` para limpiar observaciones residuales en documentos aprobados (`DOC-4093800F` - *Horario de atención del establecimiento*).
* Se actualizaron en la tabla `notificaciones` los títulos truncados previamente registrados.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de Subsanación en Vivo:** Se verificó el flujo completo: Coordinador observa -> Propietario recibe notificación completa -> Propietario sube PDF -> Documento se limpia de observaciones -> Coordinador lo recibe en *"En Revisión"* limpio -> Coordinador lo aprueba y queda sin observaciones.
* **Navegación de Inspección:** Clic en *"Agendar Inspección de Campo"* redirige inmediatamente a la ruta `/coordinador/asignar-supervisores` sin mostrar popup.
* **Dropdown de Notificaciones:** Verificación visual del nuevo layout responsivo, títulos completos y visualización correcta de fechas relativas (sin `Invalid Date`).
* **Compilación de Producción:** Ejecución de `npm run build` en el frontend finalizada con 0 errores y 1840 módulos transformados con éxito.

---

## [2026-09-10] Implementación del Sistema Integral de Notificaciones en Tiempo Real (PostgreSQL + Coordinador + Propietario + Subsanaciones)

### 📌 Objetivo
Desarrollar y conectar el sistema integral de notificaciones automáticas y persistentes en base de datos (`models.Notificacion` en Neon PostgreSQL) para avisar oportunamente a los diferentes actores del sistema:
1. **Al Coordinador / Personal SEDES:** Cuando un solicitante envía un nuevo trámite de apertura o cuando un propietario vuelve a subir (subsana) un documento observado.
2. **Al Propietario / Solicitante:** Cuando el Coordinador observa o rechaza un documento con el detalle del motivo para que vuelva a subirlo, cuando se asigna un supervisor, cuando se agenda una re-inspección o cuando el trámite es aprobado con resolución administrativa.
3. **UI Interactiva:** Integrar en los encabezados (`CoordinadorPage.jsx` y `PropietarioPage.jsx`) un menú flotante desplegable (*dropdown popover*) sobre el icono de campana con contador de no leídas (*unread badge*), marcado individual y masivo como leído, y redirección directa hacia el módulo de subsanación de trámites.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/notificaciones.py` [NUEVO / CREADO]
* **Módulo API REST de Notificaciones (`prefix="/api/notificaciones"`):**
  * `GET /api/notificaciones/usuario/{usuario_id}`: Retorna el listado ordenado cronológicamente de notificaciones del usuario y el conteo de `no_leidas`.
  * `GET /api/notificaciones/rol/{rol_nombre}`: Consulta notificaciones dirigidas al rol (ej. *Coordinador*, *Supervisor*).
  * `PATCH /api/notificaciones/{notificacion_id}/leer`: Marca una notificación individual como leída (`leido = True`).
  * `PATCH /api/notificaciones/usuario/{usuario_id}/leer-todas`: Marca todas las notificaciones pendientes de un usuario como leídas.
* **Funciones Utilitarias de Notificación en BD:**
  * `crear_notificacion_db(db, usuario_id, titulo, mensaje)`: Inserta un registro persistente en `models.Notificacion`.
  * `notificar_a_rol_db(db, rol_nombre, titulo, mensaje)`: Envía la notificación a todos los usuarios activos que posean dicho rol institucional.

#### 2. `backend/main.py` [MODIFICADO]
* Registro del router `notificaciones.router` en la aplicación principal de FastAPI.

#### 3. `backend/establecimientos.py` [MODIFICADO]
* Al crearse un nuevo establecimiento y trámite de solicitud (`POST /api/establecimientos`), dispara automáticamente:
  * Notificación de confirmación al Propietario con el código correlativo de trámite generado.
  * Notificación a todos los Coordinadores del SEDES comunicando la llegada de una nueva solicitud lista para revisión documental.

#### 4. `backend/coordinador.py` [MODIFICADO]
* **Observación / Rechazo de Documentos:** En `PATCH /api/coordinador/documentos/{id}/validar`, cuando el coordinador dictamina *Observado* o *Rechazado*, se genera una notificación urgente al propietario indicando el nombre del requisito, el motivo u observación técnica ingresada y la instrucción de volver a subir el documento corregido.
* **Aprobación de Documento:** Notifica al propietario la conformidad del documento.
* **Asignación de Inspector y Re-inspección:** Notifica al supervisor asignado y al propietario con los datos de fecha y hora.
* **Aprobación Final de Trámite:** Notifica al propietario la emisión de la Resolución Administrativa y la habilitación operativa de su laboratorio.

#### 5. `backend/tramites.py` [MODIFICADO]
* En el endpoint de subsanación (`POST /api/tramites/{tramite_id}/documentos/{documento_id}/subsanar`), al subir el propietario el archivo PDF corregido, se genera una notificación al rol de *Coordinador* notificando que el documento fue subsanado y se encuentra listo para segunda revisión.

#### 6. `frontend/src/pages/CoordinadorPage.jsx` [MODIFICADO]
* **Campana Interactiva:** Dropdown flotante en la cabecera que consulta en vivo `GET /api/notificaciones/rol/Coordinador`.
* Conteo dinámico de no leídas, visualización de mensajes con fecha y hora, y botón para marcar todas como leídas.

#### 7. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Campana Interactiva con Enlace a Subsanación:** Dropdown flotante en la cabecera que consulta `GET /api/notificaciones/usuario/{usuario_id}`.
* Al hacer clic en una notificación de documento observado, marca la notificación como leída y redirige automáticamente al usuario a la vista de **Trámites (`/propietario/tramites`)** para que proceda a subsanar el documento con el botón *"Volver a Subir"*.

---

### 📊 Verificación y Pruebas Realizadas
* **Notificación de Documentos Observados:** Se probó el dictamen de un documento con observación técnica y se validó la creación del registro en la tabla `notificaciones` de PostgreSQL.
* **Flujo Propietario -> Subsanación:** Comprobación del dropdown en la consola del propietario, visualización del motivo y redirección al módulo de trámites.
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores.

---

## [2026-09-10] Conexión Integral de la Consola del Coordinador a Datos Reales (Neon PostgreSQL + Visor PDF + Dictamen de Trámites)

### 📌 Objetivo
Eliminar por completo todos los datos ficticios y simulaciones en la **Consola del Coordinador (`CoordinadorPage.jsx`)** y en el backend (`backend/coordinador.py`), conectando todos los módulos directamente a la base de datos relacional en la nube (**Neon PostgreSQL**). Habilitar la recepción, visualización y dictamen en tiempo real de las solicitudes de apertura enviadas por los propietarios (como la solicitud real de *Lab uro* enviada por Steven Claros con 45 documentos PDF adjuntos), integrando un visor interactivo de PDFs, filtros por secciones normativas (2.1 a 2.5), dictamen individual por documento con registro de observaciones y persistencia de auditoría en la tabla `historial_actividades`.

---

### 🛠️ Archivos Modificados y Desarrollados

#### 1. `backend/database.py` [MODIFICADO]
* **Carga Segura de Entorno `.env`:**
  * Se implementó la carga automática de variables de entorno desde `backend/.env` (vía `dotenv` con fallback de lectura de archivo), garantizando que tanto el servidor FastAPI como los scripts de consulta conecten al clúster compartido en la nube de Neon (`postgresql://neondb_owner:...@ep-steep-mountain...`).

#### 2. `backend/coordinador.py` [MODIFICADO / REESTRUCTURADO]
* **Depuración de Datos Mock:**
  * Se removieron los arreglos estáticos ficticios (`SEED_TRAMITES`, `SUPERVISORES_DATA`, `TRAMITES_ASIGNACION_DATA`).
* **Endpoints Conectados a PostgreSQL:**
  * `GET /api/coordinador/tramites`: Consulta todas las solicitudes reales (`models.Tramite`), relacionando el establecimiento (`models.Establecimiento`), titular propietario (`models.Usuario`), supervisor asignado, inspecciones (`models.Inspeccion`) y la lista completa de documentos cargados (`models.TramiteDocumento` cruzado con `models.CatalogoRequisito`).
  * `GET /api/coordinador/tramites/{tramite_id}`: Retorna el expediente digital completo por UUID o código correlativo (`TRM-XXXXXXXX`).
  * `PATCH /api/coordinador/documentos/{documento_id}/validar`: Actualiza en tiempo real el estado de validación (`Aprobado`, `Observado`, `Rechazado`, `En Revisión`) y las observaciones técnicas en la tabla `tramite_documentos`, registrando la bitácora en `historial_actividades`.
  * `GET /api/coordinador/supervisores`: Consulta al personal de supervisores institucionales de la base de datos (`Ing. Marco Antonio Vargas Rojas`, `Dra. Patricia Valenzuela`, `Ing. Carlos Ruiz Mendoza`, `Lic. Roberto Quiroga`, `Lic. Andrea Torrico`) y calcula su carga operativa real en base a trámites asignados activos.
  * `GET /api/coordinador/tramites-asignacion`: Lista todos los trámites reales de PostgreSQL listos para asignación técnica.
  * `POST /api/coordinador/asignar-supervisor`: Asigna el inspector en la base de datos relacional (`supervisor_asignado_id`), programa el registro de inspección y registra el movimiento en auditoría.
  * `POST /api/coordinador/tramites/{tramite_id}/reinspeccion`: Crea/actualiza registros en `models.Inspeccion` y cambia el estado del trámite a *Re-Inspección Programada*.
  * `POST /api/coordinador/tramites/{tramite_id}/aprobar`: Dictamina la aprobación definitiva, emite la resolución administrativa y habilita el establecimiento (`estado_operativo = 'Habilitado'`).
  * `GET /api/coordinador/historial`: Consulta la bitácora de auditoría real en `historial_actividades` con filtros multicriterio.

#### 3. `frontend/src/pages/CoordinadorPage.jsx` [MODIFICADO / ACTUALIZADO]
* **Bandeja de Entrada con Trámites Reales:**
  * Carga y selección automática de las solicitudes reales desde PostgreSQL (ej. `TRM-EA5A7A75` de *Lab uro*).
  * Despliegue de datos del titular (nombre completo, CI, email, teléfono, dirección y municipio).
* **Navegador y Filtro de Requisitos Normativos:**
  * Botones de filtrado rápido por sección oficial: `Todas`, `Sección 2.1` (Habilitación), `Sección 2.2` (Legales), `Sección 2.3` (Administrativos), `Sección 2.4` (Técnicos) y `Sección 2.5` (Financieros).
  * Buscador interactivo de documentos por nombre y código.
  * Indicadores visuales de obligatoriedad (`Obligatorio` vs `Opcional`), badges de estado (`En Revisión`, `Aprobado`, `Observado`) y notas de observaciones técnicas.
* **Visor Interactivo de Documentos PDF Reales:**
  * Integración de `iframe` embebido para visualizar directamente los archivos PDF subidos por los solicitantes (`/uploads/tramites/{id}/...`).
  * Botón de **"Abrir PDF"** para previsualizar en pestaña independiente y botón de **"Descargar"** para obtener el archivo original.
* **Dictamen por Documento:**
  * Botón directo **"Aprobar Documento"** (actualiza a `Aprobado` en BD y recarga auditoría).
  * Botón y modal **"Observar / Rechazar"** para registrar el motivo técnico específico (ej. *"Falta firma del regente"*, *"Documento ilegible"*).
* **Asignación de Supervisores e Historial:**
  * Sincronización en tiempo real con la lista de supervisores y trámites de PostgreSQL.
  * Actualización reactiva de la bitácora de auditoría y trazabilidad.

---

### 📊 Verificación y Pruebas Realizadas

* **Consulta de Solicitud Real:** Se verificó la recepción de la solicitud de Steven Claros (`Lab uro`, CI/NIT: `sclaros724@gmail.com`) con sus **45 documentos PDF adjuntos**, cargándose con éxito en la consola.
* **Prueba de Dictamen y Persistencia:** Se validó la actualización de documentos mediante `PATCH /api/coordinador/documentos/{id}/validar`, confirmando el guardado en PostgreSQL y la creación de logs en `historial_actividades`.
* **Asignación de Supervisores:** Comprobación del listado de 4 supervisores institucionales oficiales de SEDES y asignación persistente.
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (dist generado en 1.19s).

---

## [2026-09-08] Desarrollo Integral del Backend para la Consola del Coordinador (API REST + PostgreSQL + Trazabilidad)

### 📌 Objetivo
Implementar la capa backend completa y robusta en FastAPI + SQLAlchemy + PostgreSQL para soportar toda la funcionalidad de la **Consola del Coordinador (`CoordinadorPage.jsx`)**, conservando estrictamente el diseño institucional, la estructura del menú lateral y la barra superior. El backend provee endpoints para la gestión de trámites en bandeja, validación de documentación legal, agendamiento de re-inspecciones técnicas, emisión de resoluciones administrativas aprobatorias, asignación de supervisores de campo con control de carga laboral, y persistencia automática de bitácoras de auditoría en la tabla `historial_actividades`.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/models.py` [MODIFICADO]
* **Nuevo Modelo `HistorialActividad` (Tabla `historial_actividades`):**
  * `id`: Identificador único (UUID).
  * `codigo_tramite`: Código del trámite (`REQ-0042`, `REQ-0041`, etc.).
  * `establecimiento`: Nombre del laboratorio, clínica o farmacia.
  * `accion`: Detalle explicativo de la acción realizada (aprobación de documento, asignación, re-inspección, resolución).
  * `responsable`: Nombre del coordinador o supervisor que ejecutó la acción.
  * `estado_resultado`: Resultado de la acción (*Aprobado*, *Asignado*, *Observado*, *Rechazado*).
  * `estado_badge`: Clases de Tailwind CSS asociadas al badge de estado.
  * `fecha_hora_formato`: Marca de tiempo legible (ej. *13 Ago 2026 - 14:30*).
  * Columnas de auditoría estándar (`estado`, `fecha_creacion`, `fecha_modificacion`).

#### 2. `backend/coordinador.py` [CREADO / IMPLEMENTADO]
* **Módulo API REST del Coordinador (`prefix="/api/coordinador"`):**
  * **Bandeja de Entrada & Bitácoras:**
    * `GET /api/coordinador/tramites`: Listado integral de trámites en proceso con sus 5 documentos legales normativos, estado de inspección in situ y notas de supervisor.
    * `GET /api/coordinador/tramites/{tramite_id}`: Detalle exhaustivo de un expediente específico.
    * `PATCH /api/coordinador/documentos/{documento_id}/validar`: Dictamen sobre documento legal (*Aprobado* / *Observado* / *Pendiente*) con registro automático en auditoría.
    * `POST /api/coordinador/tramites/{tramite_id}/reinspeccion`: Programación de re-inspección técnica (supervisor, fecha, hora, prioridad, motivo) y actualización de estado.
    * `POST /api/coordinador/tramites/{tramite_id}/aprobar`: Dictamen favorable y emisión de Resolución Administrativa con vigencia en años y firma digital.
  * **Asignación de Supervisores:**
    * `GET /api/coordinador/supervisores`: Monitoreo de inspectores activos, especialidad, zonas asignadas y carga de trabajo en tiempo real (*X/5 asignados* con semáforo *Disponible* o *Capacidad Llena*).
    * `GET /api/coordinador/tramites-asignacion`: Listado de trámites pendientes de asignación técnica.
    * `POST /api/coordinador/asignar-supervisor`: Asignación validada de inspector con incremento de carga operativa y registro en bitácora.
  * **Historial y Trazabilidad:**
    * `GET /api/coordinador/historial`: Consulta paginada y filtrada multicriterio (búsqueda textual, estado, supervisor, rango de fechas).

#### 3. `backend/main.py` [MODIFICADO]
* **Registro de Rutas:** Se importó e incluyó `coordinador.router` en la aplicación FastAPI principal.

#### 4. `frontend/src/pages/CoordinadorPage.jsx` [ACTUALIZADO / CONECTADO]
* **Integración Asíncrona Frontend-Backend:**
  * Consumo asíncrono con `fetch` hacia los endpoints `/api/coordinador/*` en carga inicial y eventos de usuario.
  * Mecanismo resiliente (*optimistic UI* con fallback local) para garantizar funcionamiento continuo en cualquier entorno.
  * Recarga reactiva en tiempo real del historial de auditoría tras cada acción de dictamen, asignación o resolución.
  * Mantenimiento exacto del diseño institucional, paleta de colores del sidebar (`#0060a8` / `#004b85`) y header superior.

---

## [2026-09-08] Implementación de la Sección "Historial y Trazabilidad" en CoordinadorPage

### 📌 Objetivo
Desarrollar e integrar el módulo completo de **Historial y Trazabilidad** en la Consola del Coordinador (`CoordinadorPage.jsx`), replicando fielmente el diseño institucional de auditoría y monitoreo. El módulo provee una barra de filtros multicriterio (búsqueda por texto/código, estado del trámite, supervisor asignado, rango de fechas desde/hasta) y una tabla centralizada de **Registro de Actividad** con paginación interactiva, badges por estado y trazabilidad cronológica de movimientos.

---

### 🛠️ Archivos Modificados

#### 1. `frontend/src/pages/CoordinadorPage.jsx` [MODIFICADO / ACTUALIZADO]
* **Barra de Filtros y Búsqueda Avanzada:**
  * **Campo de Búsqueda:** Input con icono `Search` para filtrar por código correlativo (`REQ-0042`, `REQ-0041`, etc.), nombre de establecimiento o detalle de la acción.
  * **Selector de Estado:** Dropdown interactivo con opciones (*Todos*, *Aprobado*, *Asignado*, *Observado*, *Rechazado*).
  * **Selector de Supervisor:** Filtro por responsable de la auditoría (*Lic. Patricia Rojas*, *Ing. Marco Vargas*, *Dra. Lucía Fernández*, *Lic. Roberto Quiroga*, *Ing. Ana Torrez*).
  * **Rango de Fechas:** Selectores de calendario nativos para fechas `DESDE` (`10 Ago 2026`) y `HASTA` (`13 Ago 2026`).
  * **Botón Filtrar:** Botón de acción institucional en azul marino (`#19324d`) con micro-interacciones.
* **Tabla de "Registro de Actividad":**
  * Columnas: `FECHA / HORA`, `CÓDIGO`, `ESTABLECIMIENTO`, `ACCIÓN REALIZADA`, `RESPONSABLE` y `ESTADO`.
  * Registros mostrados:
    * `13 Ago 2026 - 14:30` | `REQ-0042` | **Clínica Sur** | *Documento aprobado: Licencia Municipal...* | Lic. Patricia Rojas | Badge verde **Aprobado**.
    * `13 Ago 2026 - 11:15` | `REQ-0044` | **Hospital del Valle** | *Trámite asignado a Ing. Marco Vargas...* | Lic. Patricia Rojas | Badge azul **Asignado**.
    * `12 Ago 2026 - 16:45` | `REQ-0041` | **Farmacia Nova** | *Observación emitida: Plano ilegible en área de...* | Dra. Lucía Fernández | Badge ámbar **Observado**.
    * `11 Ago 2026 - 09:20` | `REQ-0040` | **Laboratorio BioTest** | *Trámite finalizado - Aprobación emitida...* | Ing. Marco Vargas | Badge verde **Aprobado**.
    * `10 Ago 2026 - 15:30` | `REQ-0039` | **Centro Dental Smile** | *Documento rechazado: Certificado caducado...* | Lic. Patricia Rojas | Badge rojo **Rechazado**.
* **Paginación y Footer:**
  * Indicador de conteo: `Mostrando 1-5 de 48 registros`.
  * Controles de paginación con selector numérico activo (`< 1 2 3 ... 8 >`).
* **Consistencia Visual:**
  * Se respetaron estrictamente los colores institucionales del menú lateral (`#0060a8` / `#004b85`), breadcrumb dinámico (`Consola del Coordinador / Historial y Trazabilidad`) y diseño adaptativo.

---

## [2026-09-08] Implementación de la Sección "Asignar Supervisores" en CoordinadorPage

### 📌 Objetivo
Desarrollar e integrar la interfaz de **Asignación de Supervisores** en la Consola del Coordinador (`CoordinadorPage.jsx`), replicando fielmente el diseño del mockup institucional provisto. La vista permite a los coordinadores del SEDES visualizar en tiempo real la disponibilidad y carga operativa del equipo de supervisores de campo, así como asignar trámites pendientes a inspectores habilitados mediante selectores dinámicos y acciones interactivas.

---

### 🛠️ Archivos Modificados

#### 1. `frontend/src/pages/CoordinadorPage.jsx` [MODIFICADO / ACTUALIZADO]
* **Corrección de Runtime:** Se incorporó la importación de `useEffect` en React, solucionando el problema de pantalla en blanco al ingresar con credenciales de coordinador.
* **Sección "Supervisores Disponibles":**
  * Grid responsivo de tarjetas para el personal auditor de campo:
    * `Ing. Marco Vargas` (Especialidad: *Laboratorios* | Carga: 3/5 asignados | *Disponible*).
    * `Dra. Lucía Fernández` (Especialidad: *Farmacias* | Carga: 2/5 asignados | *Disponible*).
    * `Lic. Roberto Quiroga` (Especialidad: *Hospitales* | Carga: 5/5 asignados | *Capacidad Llena*).
    * `Ing. Ana Torrez` (Especialidad: *Clínicas* | Carga: 1/5 asignados | *Disponible*).
  * Badges con iniciales en fondos suaves según estado (`MV`, `LF`, `RQ`, `AT`).
  * Indicadores dinámicos de estado (*Disponible* en verde, *Capacidad Llena* en rojo).
  * Barras de progreso de carga de trabajo proporcionales al número de inspecciones asignadas.
* **Sección "Trámites Pendientes de Asignación":**
  * Contenedor institucional con badge de conteo (`4 pendientes`).
  * Tabla con estructura de columnas: `CÓDIGO`, `ESTABLECIMIENTO`, `TIPO DE TRÁMITE`, `FECHA INGRESO`, `SUPERVISOR ASIGNADO` y `ACCIÓN`.
  * Trámites listados:
    * `REQ-0042` - Clínica Sur (Renovación | 12 Ago 2026).
    * `REQ-0041` - Farmacia Nova (Apertura | 11 Ago 2026).
    * `REQ-0043` - Lab. Génesis (Apertura | 12 Ago 2026).
    * `REQ-0044` - Hospital del Valle (Renovación | 13 Ago 2026).
  * Dropdown selector de supervisores que valida y deshabilita inspectores con capacidad máxima colmada (5/5).
  * Botón **"Asignar"** en azul marino oscuro institucional (`#19324d`) con actualización reactiva de la carga del supervisor y notificaciones flotantes (*Toast*).
* **Consistencia Institucional:**
  * Se respetaron estrictamente los colores de la barra lateral (`#0060a8`, `#004b85`), tipografía institucional, escudos oficiales y navegación por URL (`/coordinador/asignar-supervisores`).

---

## [2026-09-07] Implementación de la Vista CoordinadorPage (Consola del Coordinador) con Bitácoras Legal y de Campo

### 📌 Objetivo
Desarrollar la vista completa de la **Consola del Coordinador (CoordinadorPage)** conforme al diseño institucional de SEDES Cochabamba / SI_Lab provisto en los mockups de diseño. La vista integra de manera interactiva la gestión de trámites en proceso, la bitácora de **Documentación Legal** con visor interactivo de resoluciones/patentes municipales, la bitácora de **Inspección de Campo** con dictamen técnico in situ del supervisor, y los flujos de trabajo para agendar re-inspecciones y emitir aprobaciones oficiales. Asimismo, registrar un usuario con rol de **Coordinador SEDES** en la base de datos PostgreSQL para pruebas de autenticación y flujo integral.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/pages/CoordinadorPage.jsx` [CREADO / IMPLEMENTADO]
* **Descripción:** Panel de control para coordinadores y fiscalizadores del SEDES con estructura modular e interactiva:
  * **Barra Lateral Institucional (Sidebar):**
    * Logotipo **`SI_Lab`** interactivo con distintivos visuales.
    * Navegación por módulos: **Bandeja de Entrada**, **Asignar Supervisores** e **Historial y Trazabilidad**.
    * Sellos oficiales del Escudo de Bolivia y SEDES Cochabamba con acreditación del Ministerio de Salud y Deportes.
  * **Bandeja de Trámites en Proceso (Columna Izquierda):**
    * Contador dinámico de trámites pendientes (`12 pendientes`).
    * Buscador en tiempo real por código (`REQ-0042`, `REQ-0041`, etc.) o nombre comercial.
    * Tarjetas de trámites con badges de tipo (*Apertura*, *Renovación*), fecha de ingreso y estados de avance (*Esperando Revisión*, *Observado*, *Aprobado*).
  * **Bitácora 1: Documentación Legal (Pestaña 1):**
    * Listado de los 5 requisitos legales normativos (*Licencia Municipal*, *Plano Arquitectónico*, *Certificado Sanitario*, *Contrato de Alquiler* y *Registro de SENASAG*).
    * **Visor Interactivo de Documentos:** Renderizado del certificado oficial de funcionamiento del Gobierno Autónomo Municipal de Cochabamba con razón social, propietario, dirección, actividad, fecha, sello de verificación de la Alcaldía y firma autorizada.
    * Botones interactivos de dictamen por documento (**Aprobado** / **Rechazado**).
    * Acciones globales: **Agendar Re-Inspección** y **Aprobar Trámite**.
  * **Bitácora 2: Inspección de Campo (Pestaña 2):**
    * Banner de alerta con el veredicto del supervisor: `Veredicto del Supervisor: OBSERVADO` (*Realizado por: Ing. Carlos Ruiz - 14/08/2026*).
    * Sección de Documentación Requerida con acceso al acta y plazo de subsanación (*5 días hábiles*).
    * **Visor del Acta de Inspección in situ:** Planilla técnica de evaluación con checklist de bioseguridad, cadena de frío, extintores y sellos de fiscalización.
    * Panel de **Notas del Supervisor** con las observaciones críticas identificadas in situ.
  * **Modales y Diálogos:**
    * Modal de **Agendar Re-Inspección Técnica** (asignación de inspector, prioridad, fecha, hora y motivo).
    * Modal de **Aprobación Oficial y Emisión de Resolución Administrativa** con código correlativo y firma digital.
    * Modal de **Visor de Expediente Técnico Completo** en pantalla completa.

#### 2. `frontend/src/App.jsx` [MODIFICADO]
* **Enrutamiento:** Se importó `CoordinadorPage` y se agregaron las siguientes rutas en el switch de `<Routes>`:
  * `http://localhost:5173/coordinador` ➡️ Renderiza la vista `<CoordinadorPage />`.
  * `http://localhost:5173/coordinador/:seccion` ➡️ Permite navegar directamente a las secciones de la consola.
  * `http://localhost:5173/coordinadorpage` ➡️ Alias que redirige a `/coordinador`.

#### 3. `frontend/src/pages/loginPage.jsx` [MODIFICADO]
* **Redirección por Rol:** Se actualizó la lógica de inicio de sesión para que los usuarios con rol de **Coordinador** o **Administrador** sean redirigidos automáticamente a la ruta `/coordinador` al autenticarse.

#### 4. `backend/models.py` & Base de Datos PostgreSQL [ACTUALIZADO / REGISTRADO]
* **Usuario de Prueba Creado:** Se registró un usuario oficial con rol de **Coordinador SEDES** en la base de datos para pruebas funcionales.

---

### 🔑 Credenciales de Prueba para Coordinador

```text
Rol:              Coordinador SEDES
Nombre Completo:  Dra. Claudia Morales Valenzuela
Correo / Email:   coordinador@sedes.gob.bo
Contraseña:       Sedes2026!
CI / Documento:   4589201 CB
```

---

### 🎨 Tecnologías y Estilos Aplicados
* **React 19 & React Router 7:** Enrutamiento dinámico, pestañas de bitácoras, estados locales reactivos y modales interactivos.
* **Tailwind CSS v4:** Maquetación responsiva a dos columnas (*Master-Detail*), componentes institucionales, badges de estado y diseño adaptativo.
* **Lucide React:** Iconografía vectorial institucional (`Inbox`, `UserCheck`, `History`, `FileText`, `ShieldCheck`, `AlertTriangle`, `Calendar`, `Award`).

---

## [2026-08-31] Implementación de la Vista RegisterPage (Crear Cuenta) y Enrutamiento

### 📌 Objetivo
Desarrollar la vista completa de **Registro de Nuevos Propietarios y Regentes (RegisterPage / Crear Cuenta)** conforme al diseño institucional de SEDES Cochabamba en Figma (`figma.pdf`). El objetivo es proveer un formulario de registro digital seguro, validado e intuitivo que permita a los propietarios de laboratorios y establecimientos de salud crear su cuenta para iniciar trámites en el sistema. Integrar la vista en el enrutador principal con React Router 7 e interconectar los accesos entre Login y Registro.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/pages/RegisterPage.jsx` [CREADO / IMPLEMENTADO]
* **Descripción:** Vista completa con diseño de pantalla dividida (*split-screen*) responsiva:
  * **Panel Lateral Institucional (Izquierdo):**
    * Logotipo institucional de **`SI_Lab`** con enlace interactivo al portal de inicio.
    * Encabezado con distintivo del **GOBIERNO AUTÓNOMO DEPARTAMENTAL** y barra indicadora dorada.
    * Título institucional: **"Portal Único de Trámites y Requisitos"**.
    * Texto descriptivo sobre la digitalización de trámites para laboratorios y farmacias en Cochabamba.
    * Pie institucional: **"SERVICIO DEPARTAMENTAL DE SALUD - Cochabamba • Bolivia"**.
    * Fondos vectoriales abstractos con gradientes institucionales (`#006cb8` a `#0094e6`).
  * **Panel de Formulario de Registro (Derecho):**
    * Tarjeta flotante con fondo blanco, bordes redondeados (`rounded-3xl`) y sombra suave elevada.
    * Encabezado con título **"Crear Cuenta"** y subtítulo: *"Regístrese como propietario de establecimiento."*
    * **Campos Nombres y Apellidos:** Disposición en grid de 2 columnas en pantallas medianas/grandes con placeholders (`Ej. Carlos`, `Ej. Pérez`).
    * **Campo Número de CI / NIT:** Input para identificación tributaria o personal (`Ej. 1234567 LP`).
    * **Campo Correo Electrónico:** Input con validación de formato de email (`propietario@ejemplo.com`).
    * **Campo Teléfono de Contacto:** Input numérico/telefónico (`Ej. 71234567`).
    * **Campo Contraseña:** Input con botón toggle de visibilidad (`Eye` / `EyeOff`) e **indicador dinámico de seguridad/fuerza de contraseña** (con barras de progreso visual y etiquetas: *Débil*, *Media*, *Segura*, *Muy Segura*).
    * **Campo Confirmar Contraseña:** Input con botón toggle de visibilidad y validación de coincidencia de contraseñas.
    * **Aceptación de Términos:** Checkbox personalizado para la aceptación obligatoria de los **Términos y Condiciones** y la **Política de Privacidad**.
    * **Botón de Acción Principal:** Botón **"Crear Mi Cuenta"** en azul marino institucional (`#19324d`) con animación de carga (*spinner*) y redirección programática a la vista de login.
    * **Navegación Secundaria:** Enlace directo a **"Iniciar Sesión"** (`/login`) y botón para retornar a la página principal.

#### 2. `frontend/src/pages/loginPage.jsx` [MODIFICADO]
* **Enlace de Registro:** Se actualizó el botón secundario en el pie del formulario conectándolo directamente a la ruta `<Link to="/register">` para una navegación fluida entre Inicio de Sesión y Registro.

#### 3. `frontend/src/App.jsx` [MODIFICADO]
* **Enrutamiento:** Se importó el componente `RegisterPage` y se configuraron las siguientes rutas en el switch de `<Routes>`:
  * `http://localhost:5173/register` ➡️ Renderiza la vista `<RegisterPage />`.
  * `http://localhost:5173/registerpage` ➡️ Alias que renderiza la vista `<RegisterPage />`.
  * `http://localhost:5173/registro` ➡️ Alias en español que renderiza la vista `<RegisterPage />`.

---

### 📂 Estructura del Enrutamiento Actualizada

```text
Ruta Principal:       http://localhost:5173/            (LandingPage)
Ruta Alias:           http://localhost:5173/landingpage (LandingPage)
Ruta Requisitos:      http://localhost:5173/requisitos  (RequisitosPage)
Ruta Login:           http://localhost:5173/login       (LoginPage)
Ruta Alias Login:     http://localhost:5173/loginpage   (LoginPage)
Ruta Registro:        http://localhost:5173/register    (RegisterPage)
Ruta Alias Registro:  http://localhost:5173/registerpage(RegisterPage)
Ruta Alias Español:   http://localhost:5173/registro    (RegisterPage)
```

---

### 🎨 Tecnologías y Estilos Aplicados
* **React 19 & React Router 7:** Manejo de estado (`useState`), navegación (`useNavigate`, `<Link>`) y validación de formularios en cliente.
* **Tailwind CSS v4:** Diseño responsivo con sistema de rejilla (*grid* de 2 columnas para nombres y filas de formulario), paleta de colores institucional del SEDES y micro-interacciones (foco, transiciones, medidor de seguridad).
* **Lucide React:** Iconos vectoriales (`FlaskConical`, `Eye`, `EyeOff`, `Check`, `ArrowLeft`).

---

## [2026-08-31] Implementación de la Vista LoginPage (Inicio de Sesión) y Enrutamiento

### 📌 Objetivo
Desarrollar la vista completa de **Inicio de Sesión (LoginPage)** conforme al diseño institucional de SEDES Cochabamba definido en Figma (`figma.pdf`), proporcionando una interfaz de acceso segura, moderna y accesible para propietarios de laboratorios, regentes bioquímicos-farmacéuticos y personal del SEDES. Integrar la vista en el sistema de enrutamiento con React Router 7 y vincularla a la barra de navegación principal (`Navbar`).

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/pages/loginPage.jsx` [CREADO / IMPLEMENTADO]
* **Descripción:** Vista completa con diseño de pantalla dividida (*split-screen*) adaptada a resoluciones de escritorio y dispositivos móviles:
  * **Panel Lateral Institucional (Izquierdo):**
    * Logotipo institucional de **`SI_Lab`** con enlace interactivo al portal de inicio.
    * Encabezado con distintivo del **GOBIERNO AUTÓNOMO DEPARTAMENTAL** y barra indicadora dorada.
    * Título de alto impacto visual: **"Portal Único de Trámites y Requisitos"**.
    * Párrafo descriptivo sobre la gestión digital de trámites de salud en Cochabamba.
    * Pie de página institucional: **"SERVICIO DEPARTAMENTAL DE SALUD - Cochabamba • Bolivia"**.
    * Fondos geométricos vectoriales abstractos y gradiente institucional en tonos azulados (`#006cb8` a `#0094e6`).
  * **Panel de Formulario de Autenticación (Derecho):**
    * Tarjeta estilizada con fondo blanco, bordes redondeados (`rounded-3xl`), borde sutil y sombra suave elevada (*floating card*).
    * Encabezado con título **"Iniciar Sesión"** y texto secundario orientativo.
    * **Campo Correo Electrónico:** Input con validación HTML5 (`type="email"`), placeholder institucional (`usuario@ejemplo.com`) y estados activos de foco con ring azul.
    * **Campo Contraseña:** Input con botón toggle interactivo para alternar visibilidad de contraseña (iconos `Eye` / `EyeOff` de Lucide).
    * **Opciones del Usuario:** Checkbox personalizado para **"Recordar mi sesión"** y enlace para recuperación de credenciales **"¿Olvidó su contraseña?"**.
    * **Botón de Acción Principal:** Botón **"Iniciar Sesión"** en azul marino institucional (`#19324d`) con retroalimentación de estado de carga (*loading spinner*) y simulación de redirección.
    * **Navegación Secundaria:** Enlace directo a **"Registrarse aquí"** y botón para retornar a la página de inicio.

#### 2. `frontend/src/App.jsx` [MODIFICADO]
* **Enrutamiento:** Se importó el componente `LoginPage` y se agregaron las siguientes rutas en el switch de `<Routes>`:
  * `http://localhost:5173/login` ➡️ Renderiza la vista `<LoginPage />`.
  * `http://localhost:5173/loginpage` ➡️ Alias que renderiza la vista `<LoginPage />`.

#### 3. `frontend/src/components/landing/Navbar.jsx` [MODIFICADO]
* **Navegación:** Se actualizó el botón **"Iniciar Sesión / Registrarse"** sustituyendo el botón estático por un componente `<Link to="/login">` para permitir que los usuarios naveguen de forma directa a la pantalla de login desde la Landing Page.

---

## [2026-09-21] Implementación del Módulo Legal / Abogado: Generador Oficial y Previsualizador de Resolución Administrativa (PDF) con Edición Previa

### 📌 Objetivo
Desarrollar y consolidar el módulo integral del **Asesor Legal / Abogado** en el sistema `SI_Lab` del SEDES Cochabamba. Permitir la recepción de Informes Técnicos emitidos por el Coordinador Departamental (`CODELAB`), la transición fluida a la pantalla de emisión de la **Resolución Administrativa**, la edición completa previa a la emisión (Nº de RA, Fecha, Regente, C.I., Vistos, Considerandos, Artículos 1, 2, 3 y Vigencia de 5 años), y la previsualización interactiva en tiempo real (*split-screen*) del documento oficial en PDF con formato exacto de 2 páginas y 4 firmas/sellos institucionales.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/components/abogado/ResolucionAdministrativaPDF.js` [CREADO / IMPLEMENTADO]
* **Generador jsPDF Oficial (2 Páginas):**
  * **Página 1:** Cabecera oficial con triple logotipo (*Chakana del Bicentenario*, *Escudo de Cochabamba* y *Lema Cochabamba Unir, Trabajar y Crecer*), Título y CITE formal (`RESOLUCIÓN ADMINISTRATIVA No XX/2026`), sección **VISTOS** con datos del titular, establecimiento, regente bioquímica y C.I., sección **CONSIDERANDO** (marco legal D.S. 29894, D.S. 25233, R.M. 0202 e Informe Técnico CODELAB), y fórmula resolutiva **POR TANTO / RESUELVE: ARTÍCULO UNO**.
  * **Página 2:** **ARTÍCULO DOS (Vigencia de 5 años)**, **ARTÍCULO TRES (Sujeción a inspecciones periódicas)**, cláusula de cierre (*"NOTIFÍQUESE, CÚMPLASE Y REGÍSTRESE"*), bloque de **4 Firmas y Sellos Institucionales en cuadrícula 2x2** (Coordinador CODELAB, Jefa Unidad de Calidad y Servicios, Asesor Legal SEDES y Directora Técnica del SEDES) con Sello Circular de **V° B° ASESORÍA JURÍDICA**. Pie de página institucional y fecha final.

#### 2. `frontend/src/pages/AbogadoPage.jsx` [MODIFICADO / OPTIMIZADO]
* **Flujo de Navegación y Pestañas Individuales:**
  * Vista 1 (`/abogado/informes-recibidos`): Visor interactivo en PDF de la Comunicación Interna / Informe Técnico emitido por el Coordinador, con botón **"Emitir RA" / "Genera Resolucion administrativa"**.
  * Vista 2 (`/abogado/resolucion-administrativa`): Se estructuró en **2 pestañas limpias e individuales** (idéntico al formato del Coordinador):
    * **📄 Pestaña 1: Documento PDF Oficial (Resolución Administrativa):** Visor completo y nítido del PDF de 2 páginas con membretes y 4 firmas institucionales.
    * **✏️ Pestaña 2: Formulario de Edición de Datos:** Formulario estructurado para editar todos los campos (Identificación, Establecimiento, Propietario, C.I., Regente, Vistos, Considerandos, Artículos y Notas Legales).
  * **Sincronización Reactiva:** Constructores automáticos de texto (`construirVistos`, `construirFundamentoLegal`, `construirArticuloPrimero`, `construirArticuloSegundo`) que actualizan en tiempo real los textos legales y regeneran el PDF oficial en vivo ante cualquier cambio en el formulario de edición.
  * **Caché de Imágenes y Rendimiento:** Se optimizó `ResolucionAdministrativaPDF.js` con caché en memoria de logos institucionales para lograr una regeneración del PDF instantánea.
  * Funciones de descarga directa en PDF (`handleDescargarResolucionPDF`), guardado de borrador en backend (`handleGuardarBorrador`) y remisión final al Coordinador (`handleEnviarAlCoordinador`).

#### 3. `backend/abogado.py` y `backend/schemas.py` [MODIFICADO]
* Endpoints para obtener el borrador enriquecido (`/api/abogado/resolucion-borrador/{tramite_id}`), guardar modificaciones (`/api/abogado/guardar-resolucion`) y remitir al coordinador (`/api/abogado/enviar-coordinador`).
* Adaptación de validadores Pydantic compatibles con versiones v1 y v2.

---
*Bitácora actualizada por: Juan*


