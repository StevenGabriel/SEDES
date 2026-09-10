# Bitácora de Avance - Juan

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
*Bitácora actualizada por: Juan*
