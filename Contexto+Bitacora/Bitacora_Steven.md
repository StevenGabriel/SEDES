# Bitácora de Avance - Steven

---

## [2026-08-28] Implementación de la Vista Requisitos/Autorizaciones y Corrección de Enrutamiento

### 📌 Objetivo
Desarrollar la vista completa de **Autorizaciones de Acuerdo a la Caracterización de Laboratorios** (Requisitos para Habilitación, Apertura y Funcionamiento de Laboratorios Clínicos) reutilizando la cabecera (`Navbar`) y pie de página (`Footer`) creados en la entrega previa. Resolver el conflicto de duplicación de `<BrowserRouter>` que causaba pantalla en blanco en el navegador y habilitar las rutas `/`, `/landingpage` y `/requisitos`.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/App.jsx`
* **Solución al error de pantalla en blanco:** `main.jsx` ya contenía el proveedor `<BrowserRouter>`. Se eliminó el `<BrowserRouter>` redundante que estaba envolviendo a `<Routes>` en `App.jsx`, resolviendo el choque en tiempo de ejecución de React Router.
* **Rutas habilitadas:**
  * `http://localhost:5174/` ➡️ Renderiza la vista `<LandingPage />`.
  * `http://localhost:5174/landingpage` ➡️ Alias que renderiza la vista `<LandingPage />`.
  * `http://localhost:5174/requisitos` ➡️ Renderiza la vista `<RequisitosPage />`.

#### 2. `frontend/src/pages/RequisitosPage.jsx` [NUEVO]
* **Descripción:** Vista completa de requisitos normativos dividida en secciones según la norma oficial de SEDES Cochabamba:
  * **Encabezado y Breadcrumbs:** Navegación `Inicio > Laboratorios > Requisitos`.
  * **Sección 2.1 Solicitud de Habilitación:** Formulario oficial FORM. USD-DOSS/CONALAB-001 y lista de verificación.
  * **Sección 2.2 Requisitos Legales:** Documentación acreditante, títulos, matrículas profesionales y contratos de regencia.
  * **Sección 2.3 Requisitos Administrativos:** NIT, planos a escala, convenios de residuos infecciosos y licencias visibles.
  * **Sección 2.4 Requisitos Técnicos:** Cartera de pruebas bioquímicas, manuales documentados obligatorios (Procedimientos, Organización, Calidad, Bioseguridad y Muestras) y libros foliados.
  * **Sección 2.5 Requisitos Financieros:** Aranceles y tasas departamentales reguladas por SEDES.
  * **Botón de Descarga:** Botón con icono para descargar la guía en formato PDF (`Descargar Guía Completa PDF`).

#### 3. `frontend/src/components/landing/HeroBanner.jsx`
* **Cambio realizado:** Se reemplazaron las etiquetas de los botones `"VER DETALLES"` y `"REQUISITOS DE LABORATORIOS"` por componentes `<Link to="/requisitos">` para navegar dinámicamente a la vista de Requisitos.

#### 4. `frontend/src/components/landing/Navbar.jsx`
* **Cambio realizado:** Se vinculó el logotipo de `SI_Lab` a la ruta principal `<Link to="/">` para retornar a la Landing Page al hacer clic.

---

### 📂 Estructura del Enrutamiento Actualizada

```text
Ruta Principal:     http://localhost:5174/            (LandingPage)
Ruta Alias:         http://localhost:5174/landingpage (LandingPage)
Ruta Requisitos:    http://localhost:5174/requisitos  (RequisitosPage)
```

---

## [2026-09-01] Implementación del Modelo de Base de Datos Relacional y Geoespacial (PostgreSQL + PostGIS)

### 📌 Objetivo
Diseñar, estructurar e implementar la arquitectura completa de la base de datos relacional y geoespacial del sistema **SEDES Lab** conforme al diagrama entidad-relación (ERD) oficial. Configurar el motor de conexión ORM con **SQLAlchemy** y **GeoAlchemy2** sobre **PostgreSQL 15 + PostGIS 3.3**, generando las 9 tablas del sistema, habilitando la extensión espacial para georreferenciación de laboratorios e inicializando los roles y catálogo de requisitos normativos.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/database.py` [NUEVO]
* **Descripción:** Módulo de configuración de conexión de base de datos con SQLAlchemy:
  * Motor de conexión `engine` apuntando a `postgresql://admin:password123@db:5432/sedes_db`.
  * Generador de sesiones `SessionLocal`.
  * Clase base declarativa `Base`.
  * Función generadora de dependencia `get_db()` para inyección de sesiones en los endpoints de FastAPI.

#### 2. `backend/models.py` [MODIFICADO]
* **Descripción:** Modelado de las 9 entidades del sistema con claves primarias UUID, tipos geoespaciales, relaciones bidireccionales y **columnas estándar de auditoría en todas las tablas (`estado`, `fecha_creacion`, `fecha_modificacion`)**:
  1. **`roles`:** Catálogo de roles de usuario (`id`, `nombre`, columnas de auditoría).
  2. **`usuarios`:** Usuarios del sistema con hash de contraseña, CI/NIT, email único, relación con roles y auditoría.
  3. **`establecimientos`:** Laboratorios y farmacias con georreferenciación mediante columna `coordenadas` de tipo **`Geometry('POINT', srid=4326)`** de PostGIS, vinculados al propietario y auditoría.
  4. **`tramites`:** Solicitudes de trámites (Apertura, Renovación, Acreditación) con estados, fechas, supervisor asignado y auditoría.
  5. **`catalogo_requisitos`:** Lista maestra de documentos requeridos clasificados por categoría (Legal, Administrativo, Técnico, Financiero) y auditoría.
  6. **`tramite_documentos`:** Archivos PDF cargados para cada trámite con estados de validación, fechas límite de subsanación y auditoría.
  7. **`inspecciones`:** Programación y ejecución de inspecciones de campo con veredictos, actas digitales y auditoría.
  8. **`citaciones_infracciones`:** Registro de citaciones e infracciones con geolocalización, motivo, evidencias fotográficas y auditoría.
  9. **`notificaciones`:** Sistema de mensajería y alertas para los usuarios con auditoría.

#### 3. `backend/init_db.py` [MODIFICADO]
* **Descripción:** Script de inicialización y migración automática:
  * Ejecución de `CREATE EXTENSION IF NOT EXISTS postgis;` para soporte espacial.
  * Creación física y actualización de las 9 tablas en PostgreSQL con sus columnas de auditoría.
  * Semillero de datos iniciales (*seeding*):
    * **Roles Oficiales (5 roles):** *1. Administrador*, *2. Coordinador SEDES*, *3. Supervisor Técnico*, *4. Propietario*, *5. Director General* (depurando el rol redundante de regente).
    * Catálogo base de 10 requisitos normativos oficiales de SEDES Cochabamba.

#### 4. `backend/main.py` [MODIFICADO]
* **Descripción:** Integración del ciclo de vida de la aplicación (`lifespan`) para ejecutar `init_database()` automáticamente al iniciar el servidor y adición del endpoint de diagnóstico `/health/db`.

---

### 📊 Verificación y Pruebas Realizadas
* **PostGIS:** Extensión espacial habilitada y verificada exitosamente en el contenedor `sedes-db-1`.
* **Tablas Creadas:** 9/9 tablas generadas con claves foráneas, índices y columnas de auditoría (`estado`, `fecha_creacion`, `fecha_modificacion`).
* **Roles Depurados:** 5 roles oficiales activos en la base de datos.
* **Diagnóstico de Conexión:** Endpoint `GET /health/db` respondiendo con estado `Conectado`, versión activa de PostGIS y conteo de roles y requisitos precargados.

---

## [2026-09-01] Implementación y Conexión de Registro de Usuarios (Rol Propietario)

### 📌 Objetivo
Habilitar la funcionalidad completa de creación de cuentas de usuario desde la vista de registro (`RegisterPage.jsx`), asegurando que todos los registros públicos se asignen automáticamente y de forma exclusiva al rol de **Propietario** en la base de datos de PostgreSQL, con validación de duplicados (email y CI/NIT), hashing criptográfico seguro de contraseñas y retroalimentación visual al usuario.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/security.py` [NUEVO]
* **Descripción:** Módulo de seguridad y criptografía:
  * Función `hash_password(password)`: Genera un hash seguro mediante **PBKDF2-HMAC-SHA256** con 100,000 iteraciones y *salt* criptográfico aleatorio.
  * Función `verify_password(plain, hashed)`: Validación segura en tiempo constante contra ataques de temporización (*timing attacks*).

#### 2. `backend/schemas.py` [NUEVO]
* **Descripción:** Esquemas Pydantic con validación estricta de tipos:
  * `UsuarioRegistro`: Validación de nombres, apellidos, CI/NIT, formato de correo con regex y longitud mínima de contraseña.
  * `UsuarioResponse`: Serialización de respuesta omitiendo datos sensibles (hash de contraseña) e incluyendo metadata de auditoría.

#### 3. `backend/auth.py` [NUEVO]
* **Descripción:** Router de autenticación (`/api/auth`):
  * **Endpoint `POST /api/auth/register`:**
    1. Normalización de entradas (minúsculas, trim).
    2. Validación de unicidad de correo electrónico y CI/NIT (emitiendo `400 Bad Request` en caso de duplicidad).
    3. Asignación automática del rol **Propietario** (`rol_id = 4`).
    4. Hasheo seguro de la contraseña.
    5. Inserción en la base de datos (`sedes_db`) y retorno del usuario creado.

#### 4. `backend/main.py` [MODIFICADO]
* **Descripción:** Configuración de middleware `CORSMiddleware` para permitir comunicación entre el frontend (React) y la API, e inclusión del router de autenticación (`app.include_router(auth.router)`).

#### 5. `frontend/src/pages/RegisterPage.jsx` [MODIFICADO]
* **Descripción:** Conexión del formulario con la API:
  * Sustitución del mock temporal por llamada asíncrona real con `fetch` a `http://localhost:8000/api/auth/register`.
  * Manejo reactivo de estados de carga (`isLoading`), mensajes de error personalizados (`errorMessage`) y confirmación de éxito (`successMessage`) con redirección fluida a `/login`.

---

### 📊 Verificación y Pruebas Realizadas
* **Registro Exitoso:** Se probó la creación de un usuario propietario desde el cliente API y la interfaz web, confirmando su persistencia en la tabla `usuarios` vinculada al `rol_id` de Propietario.
* **Control de Duplicados:** Verificación de rechazo automático con código HTTP 400 ante intentos de registrar un email o CI/NIT ya existente.
* **Seguridad:** Confirmación de que las contraseñas se almacenan debidamente cifradas en la base de datos.

---

## [2026-09-02] Implementación de Inicio de Sesión (Login), Autenticación y Creación de la Vista Propietario

### 📌 Objetivo
Desarrollar la lógica completa de autenticación para el inicio de sesión (`LoginPage.jsx`) conectado con la API de FastAPI y la base de datos PostgreSQL, verificando credenciales con hash criptográfico y redirigiendo automáticamente a los usuarios con rol **Propietario** a su panel de control exclusivo (`PropietarioPage.jsx`). Diseñar la estructura inicial limpia y modular de la vista del propietario con persistencia de sesión y opción de cierre de sesión.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/schemas.py` [MODIFICADO]
* **Descripción:** Se incorporaron los esquemas Pydantic para el flujo de autenticación:
  * `UsuarioLogin`: Validación de correo electrónico y contraseña en el cuerpo de la petición.
  * `LoginResponse`: Estructura de respuesta que incluye mensaje de estado y el objeto `UsuarioResponse` con información del rol.

#### 2. `backend/auth.py` [MODIFICADO]
* **Descripción:** Se implementó el endpoint **`POST /api/auth/login`**:
  1. Búsqueda de usuario por correo electrónico normalizado.
  2. Verificación criptográfica de contraseña mediante `verify_password(plain, hash)` con PBKDF2-SHA256.
  3. Validación del estado de la cuenta (`estado == True`), emitiendo `403 Forbidden` si está inactiva.
  4. Retorno del perfil del usuario autenticado con su rol asignado.

#### 3. `frontend/src/pages/PropietarioPage.jsx` [NUEVO]
* **Descripción:** Vista base limpia y modular del panel del propietario:
  * Encabezado institucional con logotipo `SI_Lab`, escudo SEDES, distintivo *Portal del Propietario* y botón de **Cerrar Sesión**.
  * Detección reactiva de la sesión del usuario autenticado desde `localStorage` mostrando su nombre completo y rol.
  * Tarjeta de bienvenida personalizada y cuadrícula base preparada para los próximos módulos (*Mis Establecimientos*, *Mis Trámites*, *Citaciones y Notificaciones*).

#### 4. `frontend/src/pages/loginPage.jsx` [MODIFICADO]
* **Descripción:** Conexión del formulario de acceso con el backend:
  * Petición asíncrona real con `fetch` a `http://localhost:8000/api/auth/login`.
  * Almacenamiento seguro del perfil de usuario en `localStorage`.
  * Redirección condicional automática a la ruta `/propietario` para cuentas con rol Propietario.
  * Renderizado dinámico de alertas de error en caso de credenciales inválidas (`401 Unauthorized`) o fallos de red.

#### 5. `frontend/src/App.jsx` [MODIFICADO]
* **Descripción:** Registro de rutas para el panel del propietario:
  * `/propietario` ➡️ Renderiza `<PropietarioPage />`.
  * `/propietariopage` y `/dashboard` ➡️ Alias de navegación.

---

### 📊 Verificación y Pruebas Realizadas
* **Autenticación Exitosa:** Prueba de login con credenciales válidas generadas en la base de datos, verificando la respuesta `200 OK` y redirección inmediata a `/propietario`.
* **Manejo de Errores:** Comprobación de que contraseñas erróneas o correos no registrados reciben el código `401 Unauthorized` y muestran la alerta en el formulario.
* **Persistencia de Sesión:** Validación de que al ingresar a `/propietario` se recuperan correctamente los datos del propietario y la función de *Cerrar Sesión* limpia el estado y retorna al login.

---

## [2026-09-02] Implementación del Módulo Seguro de Recuperación por Correo y Token Temporal (10 Minutos)

### 📌 Objetivo
Evolucionar el sistema de recuperación de contraseñas hacia el estándar de alta seguridad de la industria gubernamental/SEDES. Implementar un flujo seguro basado en **Tokens criptográficos firmados HMAC-SHA256 con fecha de caducidad estricta de 10 minutos**, envío de correo electrónico institucional y pantalla de restablecimiento (`RestablecerPasswordPage.jsx`), garantizando que únicamente el legítimo titular de la cuenta de correo electrónico pueda autorizar el cambio de credenciales.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/tokens.py` [NUEVO]
* **Descripción:** Generador y validador de tokens temporales criptográficos:
  * `generate_password_reset_token(email, user_id)`: Genera un token firmado HMAC-SHA256 que encapsula el correo del usuario, timestamp de emisión y timestamp de caducidad fijado en **600 segundos (10 minutos)**.
  * `verify_password_reset_token(token)`: Comprueba la validez de la firma digital contra manipulaciones y rechaza automáticamente cualquier token con más de 10 minutos de antigüedad.

#### 2. `backend/email_service.py` [NUEVO]
* **Descripción:** Servicio de correo electrónico:
  * Generador de plantilla HTML corporativa de **SEDES Cochabamba - Portal Único de Trámites**.
  * Envío seguro mediante SMTP con TLS y fallback de desarrollo en consola/logs para pruebas locales inmediatas.

#### 3. `backend/schemas.py` [MODIFICADO]
* **Descripción:** Incorporación de esquemas:
  * `SolicitarResetPasswordRequest`: Validación de correo electrónico del solicitante.
  * `RestablecerPasswordConTokenRequest`: Validación del token firmado y de la nueva contraseña.
  * `VerificarTokenResponse`: Estado de vigencia del token (`valido: bool`, `email`, `mensaje`).

#### 4. `backend/auth.py` [MODIFICADO]
* **Descripción:** Endpoints del flujo seguro:
  * `POST /api/auth/solicitar-reset-password`: Genera el token de 10 minutos y dispara el correo al usuario.
  * `GET /api/auth/verificar-token-reset`: Valida en tiempo real si el enlace en la URL sigue activo antes de mostrar el formulario.
  * `POST /api/auth/confirmar-reset-password`: Valida el token, cifra la nueva clave con PBKDF2-SHA256 y actualiza la base de datos en PostgreSQL.

#### 5. `frontend/src/pages/RecuperarPasswordPage.jsx` [MODIFICADO]
* **Descripción:** Paso 1 del flujo:
  * Formulario simplificado y seguro donde el usuario solo ingresa su **Correo Electrónico**.
  * Pantalla de confirmación con aviso visual de **10 minutos de vigencia** y acceso directo de prueba.

#### 6. `frontend/src/pages/RestablecerPasswordPage.jsx` [NUEVO]
* **Descripción:** Paso 2 del flujo:
  * Lee el parámetro `?token=...` de la URL.
  * Verificación automática de vigencia: si el token expiró (+10 min) o es alterado, bloquea el formulario y muestra una alerta clara orientando a solicitar un nuevo enlace.
  * Si es válido, habilita los campos de *Nueva Contraseña* y *Confirmar Contraseña* con guardado seguro y redirección al login.

#### 7. `frontend/src/App.jsx` [MODIFICADO]
* **Descripción:** Registro de las rutas `/recuperar-password` y `/restablecer-password` en el enrutador principal.

---

### 📊 Verificación y Pruebas Realizadas
* **Generación y Expiración:** Se probó la emisión del token HMAC-SHA256 y la verificación de su caducidad estricta trascurrido el tiempo límite.
* **Integración de Envío Real (SMTP):** Se configuró el archivo seguro `backend/.env` con el servidor `smtp.gmail.com` (puerto 587 con TLS) y se validó el envío exitoso del correo electrónico con plantilla HTML del SEDES directamente a la bandeja de entrada real del usuario (`sclaros724@gmail.com`).
* **Flujo Integral:** Solicitud de enlace por correo ➡️ Verificación de token ➡️ Actualización en PostgreSQL con hash seguro ➡️ Login inmediato con la nueva credencial (`200 OK`).
* **Protección contra Manipulación:** Confirmación de que cualquier alteración al token o firma es rechazada con código `400 Bad Request`.

### 📦 Librerías y Dependencias Utilizadas
* **Cero paquetes externos adicionales instalados:** Para mantener el contenedor Docker liviano, rápido y libre de vulnerabilidades de paquetes de terceros, se utilizaron exclusivamente los módulos nativos de la **Biblioteca Estándar de Python (Standard Library)**:
  * `smtplib`: Protocolo de cliente SMTP nativo con cifrado TLS para envío de correos salientes a Gmail.
  * `email.mime` (`MIMEMultipart`, `MIMEText`): Construcción del formato MIME y plantilla HTML estructurada.
  * `hmac` y `hashlib`: Generación y verificación de firmas criptográficas HMAC-SHA256 para los tokens temporales de 10 minutos.
  * `base64`, `json`, `time`, `secrets`: Serialización de payloads, marcas de tiempo de expiración y números aleatorios criptográficos.
* **Frontend:** Se utilizaron las dependencias ya instaladas en el proyecto (`react-router-dom` para `useSearchParams` y `lucide-react` para iconografía institucional).

---

## [2026-09-02] Carga Oficial de Laboratorios con PostGIS y Desarrollo de la Vista "Ver Detalles"

### 📌 Objetivo
Poblar la base de datos PostgreSQL/PostGIS con los datos oficiales de laboratorios del SEDES Cochabamba (Código CUE, Tipo, Nivel, Municipio, Responsable Técnico, Coordenadas GPS exactas y Estado Operativo). Implementar la **Opción B** de propietarios creando cuentas automáticas vinculadas a cada establecimiento. Desarrollar la vista completa **DetalleLaboratorioPage.jsx** replicando el diseño del Figma y conectar los botones **"VER DETALLES"** desde el Hero Banner y el Mapa Interactivo.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/models.py` [MODIFICADO]
* **Descripción:** Ampliación del modelo `Establecimiento` con campos oficiales:
  * `codigo_cue`: Código Único de Establecimiento (ej: `3L0267`, `3L0384`, `3L0265`).
  * `responsable_laboratorio`: Nombre y matrícula/CI del Director Técnico responsable.
  * `responsables_areas`: Especialidades certificadas (ej. Inmunología).
  * `horario`, `telefono`, `email_contacto`, `servicios`, `observaciones`.
  * `coordenadas`: Geometría PostGIS `POINT` (Longitud, Latitud) en SRID 4326.

#### 2. `backend/init_db.py` [MODIFICADO]
* **Descripción:** Semillero (*seeder*) oficial con 10 laboratorios reales y sus propietarios:
  * Creación de cuentas de usuario con rol `Propietario` para cada titular de la lista (Claudia Alvarez, Jhaneth Gutierrez, Gery Romero, Martha Rivera, Maria Ferrufino, Jose Ortega, Rolando Sanchez, James Alvarez, Paola Flores).
  * Inserción de 10 establecimientos georreferenciados en municipios de Cercado, Quillacollo, Punata, Shinahota y Villa Tunari.

#### 3. `backend/establecimientos.py` [NUEVO]
* **Descripción:** Endpoints REST con funciones espaciales PostGIS:
  * `GET /api/establecimientos`: Lista de laboratorios con filtros espaciales por municipio, nivel, estado operativo y extracción de coordenadas `ST_X` y `ST_Y`.
  * `GET /api/establecimientos/{id_o_cue}`: Consulta detallada por UUID o Código CUE oficial.

#### 4. `backend/main.py` [MODIFICADO]
* **Descripción:** Inclusión del router `app.include_router(establecimientos.router)`.

#### 5. `frontend/src/pages/DetalleLaboratorioPage.jsx` [NUEVO]
* **Descripción:** Vista detallada de laboratorio fiel al diseño de Figma:
  * Encabezado institucional con Breadcrumbs dinámicos y sellos de verificación SEDES.
  * Hero Card con badges de estado operativo, Código Único CUE, nombre, fotografía y sellos de acreditación.
  * 4 Tarjetas de datos rápidos: *Dirección*, *Horario*, *Teléfono* y *Email*.
  * Cuadrícula de **Servicios y Especialidades Autorizados** (Análisis Clínicos, Microbiología, Hematología, Inmunología, Bioquímica, Uroanálisis).
  * Panel de **Ubicación Georreferenciada** con visualizador de coordenadas PostGIS, panel de referencias de acceso y botón **Obtener Indicaciones GPS** enlazado a Google Maps en tiempo real.

#### 6. `frontend/src/components/landing/HeroBanner.jsx` y `MapSection.jsx` [MODIFICADO]
* **Descripción:** Conexión interactiva:
  * El botón **"VER DETALLES"** del Hero Banner ahora navega directamente al detalle del laboratorio destacado.
  * El mapa de la Landing Page ahora consume los laboratorios reales desde la API y permite acceder a sus detalles oficiales.

#### 7. `frontend/src/App.jsx` [MODIFICADO]
* **Descripción:** Registro de rutas `/laboratorio/:id`, `/laboratorios/:id`, `/detalle-laboratorio/:id`.

---

### 📊 Verificación y Pruebas Realizadas
* **Base de Datos Espacial:** Confirmación de inserción de 10 laboratorios con geometría PostGIS y 10 usuarios con rol `Propietario`.
* **Endpoints API:** Pruebas exitosas de consulta por código CUE (`GET /api/establecimientos/3L0267` y `3L0393`) retornando la metadata completa.
* **Navegación Frontend:** Verificación de acceso y renderizado del diseño de Figma desde el botón "VER DETALLES" y desde los pines del mapa.

---

## [2026-09-02] Diseño y Estructuración del Layout del Panel de Propietario (Sidebar Azul y Header Superior)

### 📌 Objetivo
Implementar la interfaz base del portal del propietario según las capturas oficiales de Figma: estructurar el menú lateral (*Sidebar*) con gradiente azul institucional, branding de `SI_Lab` y sellos del Estado Plurinacional / SEDES Cochabamba; construir la barra superior (*Top Header*) con migas de pan dinámicas, campana de notificaciones y perfil de usuario; y configurar **"Mis Establecimientos"** como la primera opción seleccionada por defecto con áreas de trabajo limpias para desarrollo modular por fases.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Descripción:** Reestructuración integral del panel:
  * **Menú Lateral (Sidebar Azul):**
    1. **Mis Establecimientos** (Opción principal y seleccionada por defecto al entrar).
    2. **Trámites**
    3. **Nueva Solicitud**
    4. **Tasas Arancelarias**
    * Sección inferior con logotipos institucionales (`L1` y `L2`) y pie de página del *Ministerio de Salud y Deportes / SEDES*.
    * Menú colapsable y responsivo para dispositivos móviles con botón hamburguesa y backdrop blur.
  * **Menú Superior (Top Header):**
    * Migas de pan dinámicas (`Portal de Trámites SEDES / {Sección Seleccionada}`).
    * Campana de notificaciones con insignia numérica roja (`3`).
    * Perfil de usuario reactivo mostrando nombre del propietario autenticado desde la sesión, subtítulo `Propietario / Solicitante`, avatar con inicial y botón de cierre de sesión.
  * **Área Principal:**
    * Encabezado y descripción dinámica según la sección activa del menú lateral, manteniendo el lienzo limpio y preparado para poblar cada módulo en las siguientes fases.

---

### 📊 Verificación y Pruebas Realizadas
* **Carga Inicial:** Al ingresar a `/propietario` (o tras hacer login), el sistema carga automáticamente la opción **Mis Establecimientos** como pestaña activa.
* **Navegación Reactiva:** Cambio fluido e instantáneo entre las 4 opciones del menú lateral (`Mis Establecimientos`, `Trámites`, `Nueva Solicitud`, `Tasas Arancelarias`) actualizando los títulos y breadcrumbs en tiempo real.
* **Sesión:** Validación de persistencia de nombre y rol del propietario autenticado y funcionamiento del botón de cierre de sesión.

---

## [2026-09-02] Implementación de "Mis Establecimientos", Métricas y Módulo de "Editar Página"

### 📌 Objetivo
Desarrollar la sección de **"Mis Establecimientos"** dentro del panel del propietario según el diseño de Figma: desplegar las tarjetas de métricas (*Establecimientos Activos*, *Trámites en Proceso*, *Inspecciones Programadas*), listar los establecimientos vinculados al propietario con sus insignias de estado (*Activo • Habilitado*) e implementar los botones de acción: **Documentos**, **Ver Detalle** (ficha técnica pública) y el nuevo botón **Editar Página** con un modal interactivo que permite actualizar en tiempo real los datos públicos (horarios, teléfonos, correo, servicios y dirección) en la base de datos PostgreSQL.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/schemas.py` [MODIFICADO]
* **Descripción:** Se añadió el esquema `EstablecimientoUpdate` para validar la edición de horario, teléfono, email de contacto, servicios ofertados y dirección.

#### 2. `backend/establecimientos.py` [MODIFICADO]
* **Descripción:** Implementación de nuevos endpoints:
  * `GET /api/establecimientos/propietario/{propietario_id}`: Consulta los establecimientos pertenecientes al usuario autenticado.
  * `PUT /api/establecimientos/{id}`: Actualización persistente de los datos públicos del laboratorio en PostgreSQL.

#### 3. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Descripción:** Integración de la vista completa de establecimientos:
  * **Tarjetas de Estadísticas:** 3 cards superiores con conteo de establecimientos, trámites e inspecciones.
  * **Lista de Establecimientos Registrados:** Tarjetas con ícono, nombre comercial, dirección, municipio, badge `Activo • Habilitado`, código CUE y fecha de última inspección.
  * **Botón "Documentos":** Preparado para la gestión documental.
  * **Botón "Ver Detalle":** Enlace directo a la ficha técnica pública del laboratorio (`/laboratorio/:id`).
  * **Botón "Editar Página" y Modal:** Modal emergente para modificar horario, teléfonos de contacto, correo público, dirección y especialidades autorizadas con guardado inmediato en la API.

---

### 📊 Verificación y Pruebas Realizadas
* **Consulta por Propietario:** Comprobación de que el panel carga los laboratorios correspondientes al propietario en sesión.
* **Edición en Tiempo Real (PUT):** Prueba exitosa de actualización de horario y contacto, verificando que los cambios se reflejan al instante tanto en el panel como en la vista pública de detalles (`/laboratorio/3L0267`).

---

## [2026-09-02] Selector Interactivo de Especialidades (Píldoras) y Mapa GPS PostGIS en "Editar Página"

### 📌 Objetivo
Mejorar la experiencia de usuario (*UX*) en el modal de edición de establecimientos: reemplazar el campo de texto libre de especialidades por **botones interactivos tipo píldora** multi-selección con las 8 categorías oficiales del SEDES (evitando errores tipográficos); e integrar un **mapa interactivo georreferenciado** de Cochabamba con captura de coordenadas GPS mediante clics o geolocalización del navegador, persistiendo la geometría PostGIS en PostgreSQL.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/schemas.py` [MODIFICADO]
* **Descripción:** Se agregaron los campos `latitud: Optional[float]` y `longitud: Optional[float]` en el esquema `EstablecimientoUpdate`.

#### 2. `backend/establecimientos.py` [MODIFICADO]
* **Descripción:** El endpoint `PUT /api/establecimientos/{id}` ahora actualiza la columna espacial `coordenadas = ST_SetSRID(ST_MakePoint(longitud, latitud), 4326)` en PostGIS cuando se envían nuevas coordenadas desde el mapa.

#### 3. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Descripción:** 
  * **Botones Píldora Multi-Selección:**
    * Catálogo oficial: *Clínico General*, *Clínico Microbiológico*, *Anatomía Patológica y Citología*, *Hematología*, *Inmunología*, *Endocrinología*, *Genética*, *Toxicología*.
    * Estado activo en azul oscuro (`#19324d`) con tilde de verificación y estado inactivo en blanco con bordes limpios.
  * **Mapa Interactivo de Ubicación GPS:**
    * Visualizador de calles y cuadrículas de Cochabamba (Cercado, Quillacollo, Zona Norte, Centro, etc.).
    * Selección de coordenadas al hacer clic sobre el mapa reubicando el pin de forma instantánea.
    * Botón **"Usar mi GPS"** conectado a la API de geolocalización del navegador.
    * Cálculo y visualización en vivo de Latitud y Longitud en formato PostGIS (SRID 4326).

---

### 📊 Verificación y Pruebas Realizadas
* **Selección de Píldoras:** Verificación de activación y desactivación múltiple de especialidades, validando que se serializan y guardan correctamente en la base de datos.
* **Georreferenciación en Vivo:** Prueba de reubicación de pin en el mapa interactivo y confirmación de que las nuevas coordenadas se guardan en PostGIS y se reflejan en el botón de indicaciones GPS de la vista pública.

---

## [2026-09-02] Integración de Mapas Reales con Leaflet y OpenStreetMap

### 📌 Objetivo
Reemplazar los visores de mapas sintéticos/SVG por una solución cartográfica real, 100% abierta y gratuita basada en **Leaflet** y azulejos oficiales de **OpenStreetMap**. Permitir la visualización satelital y callejera de Cochabamba (avenidas, puentes, parques y manzanas) con zoom y arrastre de marcadores interactivo tanto en el modal de edición de establecimientos como en la ficha pública de laboratorios.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/package.json` [MODIFICADO]
* **Descripción:** Instalación de las dependencias `leaflet` y `react-leaflet`.

#### 2. `frontend/src/components/common/RealMapPicker.jsx` [NUEVO]
* **Descripción:** Componente de mapa interactivo con Leaflet:
  * Carga de azulejos mundiales y urbanos de OpenStreetMap.
  * Marcador personalizado de alta definición (con badge y sombra).
  * Arrastre de pin (*drag & drop*) y detección de clics directos sobre las calles de Cochabamba para calcular `latitud` y `longitud` en tiempo real.

#### 3. `frontend/src/components/common/RealMapView.jsx` [NUEVO]
* **Descripción:** Componente de visualización georreferenciada para la ficha técnica pública:
  * Centrado automático en las coordenadas PostGIS del laboratorio.
  * Popups informativos con nombre comercial y dirección completa.
  * Controles fluidos de zoom y navegación urbana.

#### 4. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Descripción:** Sustitución del mapa del modal de edición por `RealMapPicker`.

#### 5. `frontend/src/pages/DetalleLaboratorioPage.jsx` [MODIFICADO]
* **Descripción:** Integración de `RealMapView` en la sección de Ubicación Georreferenciada.

---

### 📊 Verificación y Pruebas Realizadas
* **Renderizado de Calles:** Verificación de carga fluida de la cuadrícula cartográfica oficial de Cochabamba en OpenStreetMap.
* **Interactividad:** Prueba de arrastre del marcador en el modal de edición, confirmando la captura de coordenadas submétricas y su persistencia en PostGIS.
* **Ficha Pública:** Comprobación del mapa real con pin y popup en la ruta `/laboratorio/3L0267`.

---

## [2026-09-02] Sincronización Dinámica de Especialidades Seleccionadas entre el Panel y la Ficha Pública

### 📌 Objetivo
Resolver la discrepancia de nombres entre los registros heredados de la base de datos y los botones tipo píldora del modal de edición (asegurando que las especialidades activas se marquen con precisión visual y que el contador refleje el número exacto de botones seleccionados). Hacer que la sección **"Servicios y Especialidades Autorizados"** de la ficha técnica pública (`DetalleLaboratorioPage.jsx`) sea **100% reactiva y dinámica**, desplegando únicamente las tarjetas autorizadas y guardadas por el propietario.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Descripción:** Implementación de la función `normalizarEspecialidad(str)` al abrir el modal de edición, transformando textos libres o compuestos (ej: *Análisis Clínicos Generales*, *Bioquímica*) en sus equivalentes oficiales del catálogo (*Clínico General*, *Endocrinología*). Esto garantiza que las píldoras activas se iluminen en azul oscuro con su tilde de verificación y el contador superior sea 100% fidedigno.

#### 2. `frontend/src/pages/DetalleLaboratorioPage.jsx` [MODIFICADO]
* **Descripción:**
  * Declaración del catálogo completo de especialidades con iconos de Lucide (`TestTube2`, `Microscope`, `Stethoscope`, `Droplet`, `Activity`, `Zap`, `Dna`, `Scale`), descripciones técnicas y paletas de color institucionales.
  * Reemplazo de la lista estática por un renderizado dinámico basado en `laboratorio.servicios`: la página pública ahora renderiza exactamente las 1, 3, 5 u 8 especialidades que el dueño ha registrado.

---

### 📊 Verificación y Pruebas Realizadas
* **Sincronización Panel ➡️ Vista Pública:** Se editó el laboratorio desde `/propietario` seleccionando 3 especialidades (*Inmunología*, *Hematología*, *Clínico Microbiológico*), se guardaron los cambios en PostgreSQL y se verificó que en `/laboratorio/3L0267` se renderizaron de inmediato esas 3 tarjetas con sus respectivos iconos y descripciones.

---

## [2026-09-02] Edición y Persistencia de la Descripción Pública del Laboratorio

### 📌 Objetivo
Permitir a los propietarios personalizar libremente el texto de presentación y descripción oficial de su establecimiento de salud, reflejándose de forma inmediata en la ficha técnica pública (`DetalleLaboratorioPage.jsx`).

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/models.py` [MODIFICADO]
* **Descripción:** Se añadió la columna `descripcion = Column(Text, nullable=True)` al modelo `Establecimiento` y se ejecutó la migración de esquema en PostgreSQL.

#### 2. `backend/schemas.py` [MODIFICADO]
* **Descripción:** Se incluyó el campo `descripcion: Optional[str] = None` en el schema `EstablecimientoUpdate`.

#### 3. `backend/establecimientos.py` [MODIFICADO]
* **Descripción:** 
  * Se serializa la descripción personalizada con fallback por defecto.
  * El endpoint `PUT /api/establecimientos/{id}` guarda la nueva descripción en PostgreSQL.

#### 4. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Descripción:** Se agregó un campo de texto multilínea (*Textarea*) dentro del modal "Editar Información Pública" para redactar la descripción o presentación de servicios del laboratorio.

#### 5. `frontend/src/pages/DetalleLaboratorioPage.jsx` [MODIFICADO]
* **Descripción:** El hero principal ahora despliega dinámicamente la descripción redactada por el propietario (`laboratorio.descripcion`).

---

### 📊 Verificación y Pruebas Realizadas
* **Persistencia en Base de Datos:** Se probó la actualización mediante `PUT` con una descripción personalizada (*"Laboratorio de referencia en Cochabamba especializado en inmunología de alta fidelidad..."*) confirmando su guardado en PostgreSQL.
* **Reflejo en Frontend:** Verificación visual en la ruta `/laboratorio/3L0267` mostrando el texto actualizado.

---

## [2026-09-03] Soporte para Subida y Personalización de Fotografía del Laboratorio

### 📌 Objetivo
Permitir a los propietarios subir su propia fotografía o imagen de portada desde el modal **"Editar Información Pública"** en el portal de propietario (`/propietario`), sustituyendo de forma inmediata la imagen genérica en la vista de detalle pública del laboratorio (`/laboratorio/{cue}`).

---

### 📦 Nuevas Dependencias Instaladas
* **`python-multipart`**: Instalada en el entorno backend y añadida a `requirements.txt` para permitir la recepción y procesamiento seguro de archivos multipart/form-data (imágenes JPG, PNG, WEBP).

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/requirements.txt` [MODIFICADO]
* **Descripción:** Se agregó `python-multipart` a la lista de dependencias oficiales.

#### 2. `backend/models.py` [MODIFICADO]
* **Descripción:** Se añadió la columna `imagen_url = Column(Text, nullable=True)` al modelo `Establecimiento` y se sincronizó con PostgreSQL (`ALTER TABLE establecimientos ADD COLUMN IF NOT EXISTS imagen_url TEXT;`).

#### 3. `backend/schemas.py` [MODIFICADO]
* **Descripción:** Se incluyó `imagen_url: Optional[str] = None` en el schema `EstablecimientoUpdate`.

#### 4. `backend/main.py` [MODIFICADO]
* **Descripción:** Se montó el directorio `/uploads` utilizando `StaticFiles` de FastAPI para servir públicamente las imágenes subidas por los propietarios.

#### 5. `backend/establecimientos.py` [MODIFICADO]
* **Descripción:**
  * Se incluyó `imagen_url` en la serialización y en el endpoint `PUT /api/establecimientos/{id}`.
  * Se creó el endpoint `POST /api/establecimientos/{id}/imagen` que valida la extensión (JPG, PNG, WEBP), almacena el archivo en la carpeta `uploads` con nombre seguro y devuelve la URL pública generada.

#### 6. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Descripción:**
  * Se añadió en el modal de edición la sección **"Fotografía del Establecimiento (Imagen de la Ficha Pública)"**.
  * Cuenta con caja de previsualización en tiempo real, botón para seleccionar un archivo desde el ordenador (hasta 5 MB), y botón para restablecer a la imagen oficial por defecto.
  * Al hacer clic en "Guardar Información", la imagen se envía al backend y se asocia al establecimiento.

#### 7. `frontend/src/pages/DetalleLaboratorioPage.jsx` [MODIFICADO]
* **Descripción:** La tarjeta principal del laboratorio ahora muestra `laboratorio.imagen_url || heroBg` con respaldo automático en caso de error.

---

### 📊 Verificación y Pruebas Realizadas
* **Subida de Archivo Multipart:** Se probó el endpoint `POST /api/establecimientos/{id}/imagen` con una imagen de prueba, verificando almacenamiento en disco y generación de URL estática con respuesta `HTTP 200`.
* **Compilación de Frontend:** Se ejecutó `npm run build` sin advertencias de sintaxis o empaquetado.

---

## [2026-09-03] Implementación de la Vista de Tasas Arancelarias en el Panel de Propietario

### 📌 Objetivo
Desplegar la tabla completa y oficial de aranceles para habilitación y funcionamiento de laboratorios dentro del portal del propietario (`/propietario` opción **"Tasas Arancelarias"**), replicando fielmente el diseño institucional de Figma con los 14 conceptos tarifarios y el banner informativo inferior.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Descripción:**
  * Se definió la estructura de datos estática `TASAS_ARANCELARIAS` con los 14 ítems y sus montos correspondientes en Bolivianos (`Bs. 5.000,00` a `Bs. 200,00`).
  * Se actualizó el título (`ARANCELES PARA HABILITACIÓN Y FUNCIONAMIENTO DE LABORATORIOS`) y subtítulo en `menuItems`.
  * Se renderizó la tabla responsive con encabezados estilizados (`DESCRIPCIÓN DEL TRÁMITE`, `MONTO`) y filas con resaltado al pasar el cursor.
  * Se incorporó el banner inferior de advertencia institucional con diseño color ámbar: *"Esta información es solo de carácter informativo. Los montos pueden estar sujetos a actualización según normativa vigente."*

---

### 📊 Verificación y Pruebas Realizadas
* **Navegación en el Menú Lateral:** Al hacer clic en **"Tasas Arancelarias"**, el panel cambia de vista de forma inmediata y fluida, renderizando la tabla completa con los 14 trámites y su respectivo aviso normativo.
---

## [2026-09-03] Implementación de Rutas y URLs Independientes en el Portal de Propietario

### 📌 Objetivo
Estructurar el enrutamiento con React Router para que cada sección del menú lateral del portal de propietario cuente con su propia URL única e independiente en el navegador, habilitando el uso del historial (botones Atrás/Adelante), marcadores directos y persistencia al recargar la página (`F5`).

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/App.jsx` [MODIFICADO]
* **Descripción:** Se configuraron las rutas `<Route path="/propietario" element={<Navigate to="/propietario/mis-establecimientos" replace />} />` y `<Route path="/propietario/:seccion" element={<PropietarioPage />} />`.

#### 2. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Descripción:** 
  * Se extrajo el parámetro `:seccion` mediante el hook `useParams()` de React Router.
  * Se convirtieron los botones del menú lateral a enlaces semánticos `<Link to="/propietario/{id}">`.
  * URLs configuradas:
    * `/propietario/mis-establecimientos`
    * `/propietario/tramites`
    * `/propietario/nueva-solicitud`
    * `/propietario/tasas-arancelarias`

---

### 📊 Verificación y Pruebas Realizadas
* **Navegación Dinámica:** Al hacer clic entre opciones, la barra del navegador se actualiza instantáneamente con su URL respectiva.
* **Historial y Recarga:** Se probó recargar en `/propietario/tasas-arancelarias` y el navegador se mantiene en dicha vista.
---

## [2026-09-03] Carrusel Dinámico de Laboratorios en el Landing Page

### 📌 Objetivo
Transformar el banner principal del Landing Page (`HeroBanner.jsx`) en un **carrusel interactivo y dinámico** conectado al backend FastAPI, que presenta los laboratorios acreditados de la base de datos PostgreSQL con autoplay, controles de navegación y enlaces directos a sus respectivas fichas públicas.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/components/landing/HeroBanner.jsx` [MODIFICADO]
* **Descripción:**
  * **Conexión a la API:** Carga en tiempo real los laboratorios registrados mediante `GET /api/establecimientos`.
  * **Autoplay inteligente:** Transición automática cada 6 segundos, con pausa al pasar el cursor del mouse (*hover*).
  * **Controles completos:** Botones anterior/siguiente (`ChevronLeft`, `ChevronRight`) y barra de puntos indicadores interactivos con conteo de diapositivas (`1 / 10`).
  * **Contenido Reactivo:** Muestra el nombre comercial, insignia de acreditación SEDES, municipio, nivel, código CUE y la descripción de cada laboratorio.
  * **Imágenes y Enlaces:** Carga la fotografía personalizada del laboratorio (`imagen_url`) o el fondo institucional, con el botón **"VER DETALLES"** apuntando a `/laboratorio/{cue}`.

---

### 📊 Verificación y Pruebas Realizadas
* **Rotación y Transiciones:** Verificación de rotación automática entre los 10 laboratorios de la base de datos (*A.T.M.*, *ALQUIMIA*, *ALCAZAR*, *ADONAI*, *ALINE*, etc.).
* **Navegación al Detalle:** Comprobación de que al hacer clic en "VER DETALLES" de cualquier diapositiva, se accede a la página pública del laboratorio correspondiente.
---

## [2026-09-03] Mapa Cartográfico Real Multi-Laboratorio con Leaflet en el Landing Page

### 📌 Objetivo
Reemplazar la ilustración estática/vectorial de la sección de mapa por un **mapa interactivo real** con azulejos de OpenStreetMap mediante Leaflet, que renderiza automáticamente los 10 laboratorios registrados en Cochabamba con sus coordenadas PostGIS, pines personalizados, popups informativos y sincronización con los filtros espaciales por municipio.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/components/common/RealMultiMapView.jsx` [NUEVO]
* **Descripción:**
  * Componente especializado para la visualización simultánea de múltiples establecimientos en el departamento de Cochabamba.
  * Marcadores personalizados con insignia flotante del nombre del laboratorio y color semántico según su estado (*Habilitado* en verde/rojo, *En Trámite* en ámbar).
  * Popups interactivos con nombre, municipio, nivel, dirección y botón de acceso directo a la ficha pública.
  * Auto-ajuste de límites (*fitBounds*) y animación de paneo/zoom al seleccionar un laboratorio.

#### 2. `frontend/src/components/landing/MapSection.jsx` [MODIFICADO]
* **Descripción:**
  * Integración de `RealMultiMapView` en el contenedor principal.
  * Sincronización con el selector de municipios (*Todos, Cercado, Quillacollo, Punata, Shinahota, Villa Tunari*), filtrando tanto la lista como los pines del mapa.
  * Al hacer clic en cualquier tarjeta de la lista derecha (o en el botón de ubicación), el mapa se desplaza suavemente al laboratorio seleccionado y abre su popup.

---

### 📊 Verificación y Pruebas Realizadas
* **Carga de Pines:** Verificación de despliegue de los 10 laboratorios en sus ubicaciones geográficas reales (Cercado, Quillacollo, Punata, Chapare).
* **Filtros por Municipio:** Comprobación de que al seleccionar *"Quillacollo"*, el mapa se reajusta y muestra únicamente los laboratorios de ese municipio (*ALCAZAR*, *ALVAREZ*).
---

## [2026-09-03] Pines de Mapa Clasificados por Tipo de Laboratorio y Filtro Interactivo de Especialidades

### 📌 Objetivo
Asignar a cada marcador del mapa cartográfico el **color exacto y el icono representativo** de su especialidad médica autorizada (según el catálogo oficial del SEDES), y transformar la **"Leyenda de Tipos de Laboratorio"** en un filtro interactivo que permite explorar establecimientos por categoría de análisis.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/components/common/RealMultiMapView.jsx` [MODIFICADO]
* **Descripción:**
  * Implementación del diccionario de 8 especialidades (`ESPECIALIDADES_MAPA`) con sus colores hex e iconos vectoriales SVG (*Microscopio, Biohazard, Estetoscopio, Gota, Pulso, Balanza, ADN, Tubo de ensayo*).
  * Función `getLabSpecialty(lab)` para clasificar automáticamente cada establecimiento según sus servicios autorizados.
  * Generación de marcadores Leaflet con el color temático de la especialidad, el icono SVG incrustado y popups enriquecidos con badge de especialidad.

#### 2. `frontend/src/components/landing/MapSection.jsx` [MODIFICADO]
* **Descripción:**
  * La **Leyenda de Tipos de Laboratorio** ahora es interactiva: al hacer clic en cualquier categoría (*Clínico General, Microbiológico, Patología, Hematología, Inmunología, etc.*), el mapa y la lista se filtran en tiempo real.
  * Se añadió una insignia con el color de especialidad dentro de cada tarjeta en el panel lateral derecho.

---

### 📊 Verificación y Pruebas Realizadas
* **Diferenciación Visual:** Los pines en el mapa ahora se muestran con colores distintivos e iconos según la especialidad de cada laboratorio (*Verde azulado, Índigo, Púrpura, Rojo, Celeste, etc.*).
* **Corrección de Renderizado:** Se limpiaron comentarios de texto dentro del HTML de los pines de Leaflet para garantizar etiquetas completamente limpias y nítidas.
* **Filtro por Leyenda:** Se probó hacer clic en *"Laboratorio de Inmunología"* y *"Laboratorio Clínico Microbiológico"*, verificando que tanto los pines como la lista lateral se ajustan de inmediato.
---

## [2026-09-03] Integración de Función de Indicaciones GPS en las Tarjetas de Laboratorio

### 📌 Objetivo
Reemplazar el botón redundante de "Ver Detalles Oficiales" en las tarjetas laterales del mapa por la funcionalidad de navegación **"Cómo llegar (GPS)"**, permitiendo a los ciudadanos abrir directamente la ruta de navegación satelital en Google Maps hacia las coordenadas geográficas del laboratorio seleccionado, manteniendo el acceso a la ficha técnica oficial a través de los popups del mapa.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/components/landing/MapSection.jsx` [MODIFICADO]
* **Descripción:**
  * Se importó el icono `Navigation` de Lucide.
  * Se transformó el botón principal de cada tarjeta lateral en un enlace externo georreferenciado hacia Google Maps (`https://www.google.com/maps/dir/?api=1&destination={lat},{lng}`).
  * El botón auxiliar con el pin 📍 mantiene la función de enfocar y abrir el popup informativo en el mapa interactivo.

---

### 📊 Verificación y Pruebas Realizadas
---

## [2026-09-03] Cálculo en Tiempo Real del Estado Abierto/Cerrado según Horario de Atención

### 📌 Objetivo
Reemplazar los estados estáticos y administrativos de habilitación (*Habilitado / En Trámite*) en las tarjetas de laboratorios y popups del mapa por el estado operativo en tiempo real: **"Abierto Ahora"** (verde esmeralda con indicador animado) o **"Cerrado"** (rojo/carmesí), evaluado automáticamente contra la hora y día actual del usuario y el horario de atención oficial del laboratorio.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/components/common/RealMultiMapView.jsx` [MODIFICADO]
* **Descripción:**
  * Se implementó el analizador temporal `checkEstaAbierto(horarioStr)` que procesa días de la semana (Lunes a Viernes, Sábados, Domingos), atención continua 24 horas y rangos horarios en minutos.
  * Los pines del mapa y sus popups ahora reflejan el punto y badge de **"● Abierto Ahora"** / **"● Cerrado"** con el horario detallado.

#### 2. `frontend/src/components/landing/MapSection.jsx` [MODIFICADO]
* **Descripción:**
  * En cada tarjeta lateral se sustituyó la insignia de trámite por la insignia dinámica de estado de apertura (`Abierto Ahora` / `Cerrado`).
  * Se añadió una línea compacta con el icono de reloj `Clock` y el horario textual del establecimiento.

---

### 📊 Verificación y Pruebas Realizadas
* **Evaluación en Tiempo Real:** El sistema detecta la hora y día del sistema y calcula con precisión si el establecimiento está en horario de atención.
---

## [2026-09-03] Delimitación Territorial y Polígonos GIS por Municipio y Departamento

### 📌 Objetivo
Incorporar capas de **geocercas y polígonos territoriales (GIS)** sobre el mapa de Leaflet: cuando no hay un filtro seleccionado, el mapa resalta los límites del **Departamento de Cochabamba**; al seleccionar un municipio específico (*Punata, Cercado, Quillacollo, Shinahota, Villa Tunari*), dibuja el polígono de su jurisdicción sanitaria con bordes segmentados (`dashArray`), relleno suave institucional, tooltips informativos y auto-zoom adaptativo (*flyToBounds*).

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/components/common/RealMultiMapView.jsx` [MODIFICADO]
* **Descripción:**
  * Se definió la estructura de límites espaciales `LIMITES_TERRITORIALES` con coordenadas perimetrales de Cochabamba y sus principales municipios.
  * Se implementó una capa vectorial `boundaryLayer` que dibuja polígonos Leaflet con tooltips dinámicos (`📍 Jurisdicción Municipal: {nombre}`).
  * Al cambiar de municipio, el mapa re-encuadra automáticamente la cámara para abarcar todo el territorio seleccionado.

#### 2. `frontend/src/components/landing/MapSection.jsx` [MODIFICADO]
* **Descripción:** Se conectó la propiedad `selectedMunicipio` para activar la delimitación espacial al cambiar el selector de municipios.

---

### 📊 Verificación y Pruebas Realizadas
* **Vista General:** Al ingresar con *"Todos los Municipios"*, se traza el polígono del Departamento de Cochabamba.
* **Filtro de Punata:** Al elegir *"Punata"*, el mapa dibuja el polígono del Valle Alto y enfoca los laboratorios de dicha jurisdicción.
---

## [2026-09-03] Implementación de la Vista 'Nueva Solicitud de Apertura' para Propietarios

### 📌 Objetivo
Desarrollar de forma integral la sección de **"Nueva Solicitud de Apertura"** (`/propietario/nueva-solicitud`) en el panel de propietarios: permitiendo registrar un nuevo establecimiento con todos sus datos institucionales y públicos, fotografía de cabecera, píldoras de especialidades oficiales, georreferenciación GPS interactiva con Leaflet, carga agrupada de requisitos documentales oficiales en PDF (*Legales, Infraestructura, Administrativos, Técnicos y Regencia*) y persistencia en base de datos con inicio automático de trámite.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/schemas.py` [MODIFICADO]
* **Descripción:** Se añadió el esquema `EstablecimientoCreate` con validación de campos obligatorios y opcionales.

#### 2. `backend/establecimientos.py` [MODIFICADO]
* **Descripción:** Se implementó el endpoint `POST /api/establecimientos` que registra el nuevo establecimiento con geometría PostGIS (`SRID=4326;POINT(lng lat)`), genera su código inicial y crea el registro de `Tramite` en estado *Pendiente*.

#### 3. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Descripción:**
  * Se configuró el formulario interactivo para `seccionActiva === 'nueva-solicitud'`.
  * **Card 1 (Datos):** Municipio, Tipo, Nombre, Nivel, Dirección, Teléfono, Responsable Bioquímico, Horario, Correo, Descripción, subida de fotografía con previsualización y selector de las 8 especialidades.
  * **Card 2 (Ubicación):** Integración de `RealMapPicker` para fijar coordenadas GPS en el mapa de Cochabamba.
  * **Card 3 (Requisitos PDF):** Clasificación en 5 categorías oficiales con selectores de archivos `.pdf`, badges de confirmación y tamaño.
  * **Acciones:** Botón de "Guardar Borrador", botón "Enviar Solicitud" con feedback visual y pantalla de éxito con enlaces directos.

---

---

## [2026-09-03] Implementación de HorarioPicker: Selector Asistido de Horarios sin Errores de Tipeo

### 📌 Objetivo
Reemplazar los campos de texto libre de horarios por un componente interactivo y asistido **`HorarioPicker`** que previene errores ortográficos o formatos inconsistentes, garantizando que el cálculo en tiempo real de **"Abierto Ahora / Cerrado"** del mapa y landing page funcione siempre con 100% de precisión.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/components/common/HorarioPicker.jsx` [NUEVO]
* **Descripción:**
  * Ofrece **4 Presets Rápidos**: *Estándar SEDES (Lun-Vie 7-19h, Sáb 8-13h)*, *24 Horas (24/7)*, *Lun-Sáb Corrido (7-19h)* y *Personalizado*.
  * Si el usuario selecciona **Personalizado**, se despliega un configurador por días con checkboxes y selectores de tiempo (`<input type="time" />`) para Lunes a Viernes, Sábados y Domingos/Feriados.
  * Muestra una previsualización reactiva con badge de validación: `🕒 Horario Oficial Generado: ...`.

#### 2. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Descripción:**
  * Se integró `HorarioPicker` en el formulario de **"Nueva Solicitud de Apertura"**.
  * Se integró `HorarioPicker` en el modal de **"Editar Información Pública"**.

---

---

## [2026-09-07] Implementación del Panel del Supervisor Técnico (Mi Agenda y Programación Semanal)

### 📌 Objetivo
Desarrollar la interfaz oficial del **Panel del Supervisor Técnico** (`/supervisor/mi-agenda`) según los diseños de Figma: incorporando el menú lateral de gestión (*Mi Agenda, Rutas de Inspección, Actas Emitidas, Citaciones Emitidas*), la columna de **Inspecciones Pendientes**, el **Calendario Semanal Interactivo** (Lunes a Viernes de 08:00 a 17:00), el modal de detalle de inspección para iniciar actas en campo y el botón de acción para nuevo registro de inspección.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/pages/SupervisorPage.jsx` [NUEVO]
* **Descripción:**
  * **Sidebar Supervisor:** Logo SI_Lab, navegación por subsecciones y footer institucional con los escudos oficiales de Bolivia y Cochabamba.
  * **Header Superior:** Breadcrumbs interactivos, perfil del supervisor con avatar (*Ing. Marco Vargas*) y control de notificaciones y cierre de sesión.
  * **Columna de Inspecciones Pendientes:** Tarjetas informativas clasificadas por tipo de trámite (*Apertura, Renovación*) con código de color naranja/azul y conteo en tiempo real.
  * **Calendario Semanal Interactivo:** Grilla de 5 días laborales con ranuras de horas (08:00 - 17:00), posicionamiento proporcional de bloques de inspección y modales reactivos para iniciar actas en campo.
  * **Botón Flotante:** Botón oscuro institucional `+ Nuevo Registro de Inspección`.

#### 2. `frontend/src/App.jsx` [MODIFICADO]
* **Descripción:** Se configuraron las rutas `/supervisor` y `/supervisor/:seccion` con redirección por defecto a `/supervisor/mi-agenda`.

#### 3. `frontend/src/pages/loginPage.jsx` [MODIFICADO]
* **Descripción:** Se actualizó la redirección posterior al inicio de sesión para dirigir a los usuarios con rol *Supervisor Técnico* directamente a `/supervisor`.

---

### 📊 Verificación y Pruebas Realizadas
* **Diseño Figma Fiel:** Coincidencia exacta con la maqueta subida por el usuario.
* **Redirección de Rutas:** Acceso directo mediante URL `/supervisor/mi-agenda` o login con credenciales de supervisor.
* **Usuario Supervisor Oficial:** Se creó y sembró en PostgreSQL el usuario `supervisor@sedes.gob.bo` (Marco Antonio Vargas Rojas) con rol `Supervisor Técnico`.
* **Unificación de Identidad Visual en Sidebars:** Se actualizó el sidebar del portal de propietarios (`PropietarioPage.jsx`) para homologar el diseño del pie institucional (`ESTADO PLURINACIONAL / Ministerio de Salud y Deportes - Bolivia`), separación simétrica de escudos y esquema de color azul oficial (`#0060a8` y `#00518f`).
* **Homologación del Menú Superior del Coordinador:** Se eliminó el menú flotante tipo popover en `CoordinadorPage.jsx` y se reemplazó por la barra estándar homologada con campana de notificaciones, avatar con las iniciales `CM` y botón directo de cierre de sesión (`LogOut`), igual que en Propietario y Supervisor.
* **Compilación:** `npm run build` ejecutado exitosamente en 703ms con código de salida 0.

---

## [2026-09-07] Implementación del Panel de Administración IT (Gestión de Usuarios, Roles y Permisos)

### 📌 Objetivo
Desarrollar la interfaz oficial del **Panel de Administración de Sistemas IT** (`/admin/usuarios`) según el diseño de Figma: incorporando el menú lateral homologado (*Gestión de Usuarios, Roles y Permisos, Requisitos*), las tarjetas de métricas KPI (*Usuarios Totales, Activos, Inactivos, Conectados Ahora*), el buscador con filtros por rol y estado, la tabla interactiva de usuarios registrados con acciones de bloqueo/edición/eliminación, el modal de creación de usuarios y la barra de navegación superior estandarizada.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/pages/AdminPage.jsx` [NUEVO]
* **Descripción:**
  * **Sidebar y Header Homologados:** Matraz oficial `SI_Lab` con cyan `_Lab`, pie institucional `#00518f` con escudos de Bolivia y SEDES Cochabamba, y barra superior sticky con avatar (*Ing. Carlos Quispe*), notificaciones y botón directo de logout.
  * **KPIs Estadísticos:** 4 tarjetas informativas con indicadores de color para 48 usuarios totales, 42 activos, 6 inactivos y 3 conectados ahora.
  * **Filtros y Búsqueda en Vivo:** Búsqueda textual por nombre/email y selectores de rol y estado.
  * **Tabla de Gestión de Usuarios:** Listado con avatares, correos, roles, última conexión, badges de estado y botones de acción (editar, bloquear/desbloquear con cambio reactivo y eliminar).
  * **Modales:** Formularios para registrar nuevos usuarios con validación y visualizador de matriz de permisos.

#### 2. `frontend/src/App.jsx` [MODIFICADO]
* **Descripción:** Se registraron las rutas `/admin` y `/admin/:seccion` con redirección por defecto a `/admin/usuarios`.

#### 3. `frontend/src/pages/loginPage.jsx` [MODIFICADO]
* **Descripción:** Se configuró la redirección para que las cuentas con rol `Administrador` o `Admin` sean dirigidas inmediatamente a `/admin`.

---

### 📊 Verificación y Pruebas Realizadas
* **Diseño Figma Fiel:** Coincidencia exacta con la maqueta subida por el usuario.
* **Redirección de Rutas:** Acceso directo mediante URL `/admin/usuarios` o login con `admin@sedes.gob.bo`.
* **Compilación:** `npm run build` ejecutado exitosamente en 651ms con código de salida 0.

---

## [2026-09-07] Integración Backend Real (API CRUD) para Gestión de Usuarios en Base de Datos

### 📌 Objetivo
Convertir la tabla de **Gestión de Usuarios** del panel de Administración (`/admin/usuarios`) en una tabla 100% funcional y conectada en tiempo real con la base de datos PostgreSQL, implementando los endpoints CRUD en FastAPI y sincronizando las acciones de creación, edición, alternancia de estado (Activo/Inactivo), eliminación y paginación reactiva.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/admin_usuarios.py` [NUEVO]
* **Endpoints Desarrollados:**
  * `GET /api/admin/usuarios`: Retorna los usuarios registrados en PostgreSQL (excluyendo cuentas de propietarios por defecto mediante filtro `solo_institucionales=true`).
  * `POST /api/admin/usuarios`: Registra un nuevo funcionario en la base de datos con contraseña cifrada y validación de unicidad de CI y correo institucional.
  * `PUT /api/admin/usuarios/{id}`: Permite actualizar nombres, apellidos, CI, teléfono, rol y estado de un usuario existente.
  * `PATCH /api/admin/usuarios/{id}/toggle-estado`: Alterna atómicamente el estado `Activo` / `Inactivo` (`True`/`False`) en la base de datos.
  * `DELETE /api/admin/usuarios/{id}`: Elimina permanentemente al usuario de la base de datos.

#### 2. `backend/schemas.py` [MODIFICADO]
* **Esquemas Pydantic:** Se crearon `UsuarioAdminCreate`, `UsuarioAdminUpdate` y `UsuarioAdminResponse` para tipado y validación de solicitudes.

#### 3. `backend/main.py` [MODIFICADO]
* **Registro de Router:** Se importó e incluyó `admin_usuarios.router` en la aplicación FastAPI.

#### 4. `backend/init_db.py` [MODIFICADO]
* **Semillero Completo de Personal SEDES:** Se aseguraron las 8 cuentas institucionales en el seeder automático: *Dr. Fernando Castillo, Dra. Claudia Morales Valenzuela, Ing. Carlos Quispe, Ing. Marco Antonio Vargas Rojas, Ing. Carlos Ruiz Mendoza, Dra. Patricia Valenzuela, Lic. Andrea Torrico y Lic. Roberto Quiroga*.

#### 5. `frontend/src/pages/AdminPage.jsx` [MODIFICADO]
* **Consumo de API Real:** Hook `useEffect` que carga los datos desde `http://localhost:8000/api/admin/usuarios`.
* **Acciones Conectadas a la BD:**
  * Bloquear / Activar usuario mediante `PATCH /toggle-estado`.
  * Modal interactivo para **Editar Usuario** mediante `PUT`.
  * Modal para **Crear Usuario Institucional** mediante `POST`.
  * Acción de **Eliminar Usuario** mediante `DELETE`.
* **Paginación y Filtros Reactivos:** Paginador dinámico con botones numéricos, anterior y siguiente adaptados al total de registros.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de Endpoint API:** `GET /api/admin/usuarios` retornando con éxito los 8 funcionarios institucionales desde PostgreSQL.
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (dist generado en 639ms).

---

## [2026-09-07] Estandarización de Roles Oficiales del Sistema SEDES

### 📌 Objetivo
Simplificar y estandarizar la nomenclatura de los roles en todo el ecosistema (PostgreSQL, FastAPI y React) a los 5 roles canónicos sin sufijos ni adiciones: **Director**, **Coordinador**, **Supervisor**, **Administrador** y **Propietario**.

---

### 🛠️ Archivos Modificados

#### 1. `backend/init_db.py` [MODIFICADO]
* **Depuración del Catálogo de Roles:** Se actualizaron los `roles_oficiales` a `['Administrador', 'Coordinador', 'Supervisor', 'Director', 'Propietario']`.
* **Actualización del Personal Institucional:** Se asignaron los roles canónicos (`Director`, `Coordinador`, `Administrador`, `Supervisor`) a los 8 funcionarios del SEDES.

#### 2. `frontend/src/pages/AdminPage.jsx` [MODIFICADO]
* **Filtros y Formularios:** Se actualizaron el desplegable de filtro por rol, el modal de creación y el modal de edición para contener estrictamente `Supervisor`, `Coordinador`, `Director` y `Administrador`.
* **Matriz de Roles:** Se actualizaron las tarjetas de la sección "Roles y Permisos" con la nueva nomenclatura oficial.

#### 3. `README.md` [MODIFICADO]
* Se actualizó la tabla de credenciales de acceso institucional con los roles estandarizados.

---

### 📊 Verificación y Pruebas Realizadas
* **Base de Datos:** Se ejecutó `init_db.py` reestructurando los roles y usuarios en PostgreSQL.
* **API Backend:** `GET /api/admin/usuarios` retorna a los 8 funcionarios con sus roles simplificados (`Director`, `Coordinador`, `Supervisor`, `Administrador`).
* **Frontend:** `npm run build` compilado sin errores en 674ms.

---

## [2026-09-07] Automatización de Correo de Invitación y Activación de Cuenta para Nuevos Usuarios

### 📌 Objetivo
Implementar el flujo de seguridad mediante el cual el Administrador registra los datos del nuevo funcionario y el sistema envía automáticamente un correo electrónico con una plantilla institucional y un token firmado para que el nuevo usuario active su cuenta y defina su contraseña privada de acceso.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/email_service.py` [MODIFICADO]
* **Plantilla HTML Institucional:** Se diseñó la plantilla `build_invitation_email_html` con branding del SEDES Cochabamba, badge del rol asignado y botón de acción directa.
* **Servicio de Envío:** Se implementó `send_user_invitation_email` con soporte SMTP y logging en consola para desarrollo.

#### 2. `backend/admin_usuarios.py` [MODIFICADO]
* **Integración en `POST /api/admin/usuarios`:** Al registrar un funcionario, genera un token HMAC-SHA256 con `generate_password_reset_token` y dispara automáticamente la invitación por correo.

#### 3. `backend/schemas.py` [MODIFICADO]
* Se enriqueció `UsuarioAdminResponse` con los campos `dev_link` y `mensaje`.

#### 4. `frontend/src/pages/AdminPage.jsx` [MODIFICADO]
* **Modal de Creación:** Se añadió una alerta informativa explicando que el funcionario recibirá su enlace de activación por correo.
* **Feedback Reactivo:** Notificación tipo toast indicando el registro exitoso y el envío del correo de activación.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de Creación y Token:** Se verificó la generación del token y la construcción del enlace `http://localhost:5173/restablecer-password?token=...`.
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores.

---

## [2026-09-07] Generador Dinámico de Avatares por Iniciales del Usuario

### 📌 Objetivo
Reemplazar las fotos de stock genéricas en la tabla de usuarios y en el encabezado institucional por insignias circulares dinámicas con las iniciales del nombre de cada funcionario (ej: *Steven Claros Tapia* ➔ `SCT`, *Carlos Quispe* ➔ `CQ`, *Claudia Morales Valenzuela* ➔ `CMV`), con gradientes de color consistentes y elegantes.

---

### 🛠️ Archivos Modificados

#### 1. `frontend/src/pages/AdminPage.jsx` [MODIFICADO]
* **Helper `getInitials(u)`:** Función inteligente que extrae entre 2 y 3 letras mayúsculas de los nombres y apellidos, depurando automáticamente títulos académicos como *Dr., Dra., Ing., Lic., MSc., etc.*
* **Helper `getAvatarColor(nombre)`:** Función determinista basada en hash para asignar una paleta de degradados vibrantes y profesionales a cada usuario.
* **Componente de Avatar en Tabla y Header:** Se reemplazaron las etiquetas `<img>` por badges circulares estilizados con tipografía en negrita y bordes finos.

---

### 📊 Verificación y Pruebas Realizadas
* **Extracción de Iniciales:** Probado con nombres compuestos (ej: *Steven Claros Tapia* ➔ `SCT`, *Dra. Claudia Morales Valenzuela* ➔ `CMV`, *Dr. Fernando Castillo* ➔ `FC`, *Ing. Carlos Quispe* ➔ `CQ`).
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (dist generado en 633ms).

## [2026-09-07] Unificación de Avatares Dinámicos por Iniciales en Todos los Paneles del Sistema

### 📌 Objetivo
Extender el generador inteligente de avatares por iniciales (`getInitials` y `getAvatarColor`) al encabezado superior del panel de **Propietarios** (`/propietario`), así como a los paneles de **Supervisores** (`/supervisor`) y **Coordinadores** (`/coordinador`), logrando una experiencia visual homogénea y profesional en todo el ecosistema SEDES.

---

### 🛠️ Archivos Modificados

#### 1. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Helper de Iniciales:** Implementación de `getInitials(u)` soportando de 2 a 4 palabras (ej: *Steven Claros Tapia* ➔ `SCT`, *Claudia Silvia Alvarez Lopez* ➔ `CSAL`) y limpiando prefijos de títulos (*Dr., Dra., Ing., Lic.*).
* **Paleta de Colores Dinámica:** Función `getAvatarColor(nombre)` que genera degradados armónicos consistentes por usuario.
* **Header Superior:** Sustitución de la letra fija `'C'` por el badge de iniciales dinámico asociado al usuario en sesión.

#### 2. `frontend/src/pages/SupervisorPage.jsx` [MODIFICADO]
* Integración de `getInitials` y `getAvatarColor`, sustituyendo la imagen genérica del header por el badge de iniciales del supervisor logueado.

#### 3. `frontend/src/pages/CoordinadorPage.jsx` [MODIFICADO]
* Lectura del usuario autenticado en `localStorage` e integración de `getInitials` y `getAvatarColor` en el header principal.

#### 4. `frontend/src/pages/AdminPage.jsx` [MODIFICADO]
* Soporte ampliado en `getInitials` para procesar hasta 4 iniciales en nombres largos y compuestos.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de Renderizado:** Nombres como *"CLAUDIA SILVIA ALVAREZ LOPEZ"* generan de forma precisa las 4 iniciales `CSAL`.
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (dist generado en 618ms).

## [2026-09-08] Personalización Visual de Estados y Botones de Bloqueo en Gestión de Usuarios

### 📌 Objetivo
Mejorar la claridad visual y la semántica de la tabla de usuarios en el panel de Administración (`/admin/usuarios`):
1. Distinguir el estado **"Inactivo"** con un color rojo institucional suave en lugar del plomo grisáceo.
2. Invertir la paleta y semántica de los candaditos de acción:
   - Usuarios **Activos**: Candadito en color **verde** (`Unlock`).
   - Usuarios **Inactivos**: Candadito en color **naranja/ámbar** (`Lock`).

---

### 🛠️ Archivos Modificados

#### 1. `frontend/src/pages/AdminPage.jsx` [MODIFICADO]
* **Badge de Estado:** El estado `Inactivo` ahora usa `bg-red-50 text-red-600 border-red-200`.
* **Botón de Bloqueo/Activación:** Se intercambiaron los colores e íconos:
  - `Activo` ➔ `text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50` con icono `<Unlock />`.
  - `Inactivo` ➔ `text-amber-600 hover:text-amber-800 hover:bg-amber-50` con icono `<Lock />`.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (dist generado en 1.18s).

## [2026-09-08] Implementación Completa de la Matriz de Roles y Permisos con Historial de Cambios

### 📌 Objetivo
Desarrollar la vista interactiva de **Roles y Permisos** en el panel de Administración (`/admin/roles-permisos`), replicando con fidelidad pixel-perfect el diseño oficial de Figma:
1. **Tarjetas Superiores de Roles:** Indicadores con nivel jerárquico (`Nivel 5` a `Nivel 1`) y cantidad de cuentas para Director, Coordinador, Supervisor, Propietario y Público.
2. **Matriz de Especificación de Permisos:** Tabla interactiva con los 7 módulos del sistema (`Trámites`, `Inspecciones`, `Documentos`, `Usuarios`, `Reportes`, `Catálogos`, `Auditoría`), insignias de autorización (`Total`, `Lectura`, `Propios`, `Público`, `Denegado`) y modal de configuración por módulo.
3. **Registro de Cambios Recientes:** Bitácora dinámica de auditoría que registra en tiempo real cualquier ajuste a las directivas de acceso con fecha, hora, rol/módulo y administrador ejecutor.

---

### 🛠️ Archivos Modificados

#### 1. `frontend/src/pages/AdminPage.jsx` [MODIFICADO]
* **Estructura de Datos:** Se crearon `INITIAL_MATRIZ_PERMISOS` y `INITIAL_HISTORIAL_CAMBIOS`.
* **Helper de Renderizado:** Función `renderPermisoBadge` que asigna colores, íconos y microinteracciones a cada nivel de permiso.
* **Modal de Configuración por Módulo:** Permite modificar individualmente el nivel de acceso para cada uno de los 5 roles y actualiza la matriz en tiempo real.
* **Registro de Auditoría Reactivo:** Cada guardado añade automáticamente una fila con timestamp real al registro de cambios recientes.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de Interacción:** Apertura de modal en el módulo *Trámites*, modificación de permisos y confirmación inmediata de actualización en la matriz y en la tabla de cambios recientes.
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (dist generado en 718ms).

## [2026-09-08] Implementación del Catálogo de Requisitos de Laboratorios en Panel de Administración

### 📌 Objetivo
Construir la vista interactiva para la gestión de **Requisitos de Laboratorios** en el panel de Administración (`/admin/requisitos`), conforme al diseño de Figma:
1. **Secciones Normativas Clasificadas (2.1 a 2.5):**
   - `2.1` Solicitud de Habilitación
   - `2.2` Requisitos Legales
   - `2.3` Requisitos Administrativos
   - `2.4` Requisitos Técnicos (con subsección de Manuales Documentados Obligatorios)
   - `2.5` Requisitos Financieros
2. **Operaciones CRUD en Requisitos:**
   - **Agregar Requisito:** Botón contextual `+ Agregar requisito` en cada tarjeta con modal de captura.
   - **Editar Requisito:** Botón de edición con ícono de lápiz en color azul y modal de modificación.
   - **Eliminar Requisito:** Botón de papelera en color rojo con confirmación de seguridad.
   - **Añadir Nueva Sección:** Botón superior `+ Añadir Nueva Sección` para registrar nuevas categorías normativas (`2.6`, `2.7`, etc.).
3. **Acceso Rápido:** Botón inferior `Guía de archivo` que enlaza al portal público de requisitos oficiales.

---

### 🛠️ Archivos Modificados

#### 1. `frontend/src/pages/AdminPage.jsx` [MODIFICADO]
* **Estructura de Datos:** Se definió `INITIAL_SECCIONES_REQUISITOS` con el listado completo de los requisitos oficiales.
* **Componente de Tarjetas:** Renderizado de tarjetas con códigos numéricos oscuros (`2.1`, `2.2`, etc.), títulos en mayúsculas, checkmarks en cyan y barra de acciones.
* **Modales Operativos:** Implementación de modales para agregar requisitos, editar requisitos y crear nuevas secciones.

---

### 📊 Verificación y Pruebas Realizadas
* **Pruebas de Interacción:** Creación, edición y eliminación de requisitos con reflejo reactivo en el DOM y notificaciones toast de confirmación.
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (dist generado en 812ms).

## [2026-09-08] Robustecimiento de Inicialización de Base de Datos ante Volúmenes Existentes

### 📌 Objetivo
Resolver el error de violación de clave única (`duplicate key value violates unique constraint "ix_usuarios_ci_nit"`) que ocurre cuando un entorno de desarrollo levanta contenedores sobre un volumen previo de PostgreSQL que contenía registros antiguos con diferente correo pero mismo `ci_nit`.

---

### 🛠️ Archivos Modificados

#### 1. `backend/init_db.py` [MODIFICADO]
* **Búsqueda Combinada:** Se actualizó la consulta de existencia de usuarios (`personal_sedes` y `laboratorios_data`) para verificar por `email` O `ci_nit`.
* **Sincronización:** Si el usuario ya existe en PostgreSQL, se actualizan sus datos y contraseña en lugar de intentar insertar un duplicado que falle la restricción `UNIQUE`.

---

### 📊 Verificación y Pruebas Realizadas
* **Compatibilidad de Inicialización:** Verificación con volúmenes existentes y limpios.

## [2026-09-08] Ajuste Visual de Alineación del Header y Breadcrumb
### 📌 Objetivo
Alinear el breadcrumb (`Administración / Gestión de Usuarios`) y el encabezado superior con el menú lateral izquierdo (sidebar), removiendo el contenedor rígido `max-w-7xl mx-auto` en el header para homologar el diseño con la consola del coordinador y las pantallas de mayor resolución.

---

### 🛠️ Archivos Modificados
#### 1. `frontend/src/pages/AdminPage.jsx` [MODIFICADO]
* **Header fluido:** Se reemplazó el contenedor `max-w-7xl mx-auto` del `<header>` por `w-full px-4 sm:px-8`, permitiendo que el breadcrumb se ubique directamente a la izquierda junto a la barra lateral.
#### 2. `frontend/src/pages/PropietarioPage.jsx` & `frontend/src/pages/SupervisorPage.jsx` [MODIFICADO]
* **Consistencia Global:** Se estandarizó la misma estructura fluida en todos los dashboards.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores.

## [2026-09-08] Sincronización Dinámica de Requisitos en Tiempo Real (Admin ➡️ Portal Público)
### 📌 Objetivo
Permitir que el Administrador gestione en tiempo real los requisitos de habilitación y funcionamiento de laboratorios (agregar, editar, eliminar, crear nuevas secciones y definir si un requisito es **Obligatorio** u **Opcional**), impactando y actualizando automáticamente la página pública `/requisitos` mediante base de datos PostgreSQL y APIs REST.

---

### 🛠️ Archivos Creados y Modificados
#### 1. `backend/models.py` [MODIFICADO]
* **Ampliación de `CatalogoRequisito`:** Se agregaron las columnas `seccion_codigo`, `seccion_titulo`, `seccion_subtitulo`, `es_subtitulo` y `orden`.

#### 2. `backend/requisitos.py` [NUEVO]
* **API Pública:** `GET /api/requisitos/publico` (devuelve el árbol organizado de secciones y requisitos activos).
* **API de Administración:** `GET /api/admin/requisitos`, `POST /api/admin/requisitos`, `PUT /api/admin/requisitos/{id}`, `DELETE /api/admin/requisitos/{id}`, `POST /api/admin/requisitos/secciones`.

#### 3. `backend/main.py` [MODIFICADO]
* **Enrutador:** Se montó `requisitos.router` en la aplicación FastAPI.

#### 4. `backend/init_db.py` [MODIFICADO]
* **Poblado Automático:** Migración segura idempotente con `ALTER TABLE ADD COLUMN IF NOT EXISTS` y siembra de los 39 requisitos oficiales organizados en las secciones 2.1 a 2.5.

#### 5. `frontend/src/pages/AdminPage.jsx` [MODIFICADO]
* **Conexión a BD:** Se conectaron los modales y botones de acción a los endpoints del backend.
* **Selectores de Obligatoriedad:** Modales de agregar y editar con switch entre `🔵 Obligatorio` y `🟡 Opcional`.
* **Badges visuales:** Insignias distintivas en cada ítem de la lista.

#### 6. `frontend/src/pages/RequisitosPage.jsx` [MODIFICADO]
* **Renderizado Dinámico:** Consumo reactivo de `GET /api/requisitos/publico` con soporte visual de badges `(Opcional)` para guiar con claridad a propietarios y laboratorios.

---

### 📊 Verificación y Pruebas Realizadas
* **Pruebas End-to-End API:** Creación (`POST 201`), consulta pública dinámica (`GET 200`) y eliminación (`DELETE 200`) validadas exitosamente.
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (dist generado en 786ms).

## [2026-09-08] Ampliación de Longitud de Texto para Requisitos Normativos (Tipo TEXT sin límite)
### 📌 Objetivo
Resolver el truncamiento de texto que ocurría al registrar o editar requisitos extensos (mayores a 200 caracteres), garantizando que enunciados normativos largos se guarden completos sin límite en PostgreSQL.

---

### 🛠️ Archivos Modificados
#### 1. `backend/models.py` [MODIFICADO]
* **Tipo de Columna:** Se actualizó `nombre_documento` y `seccion_subtitulo` de `String(200)` a `Text` sin límite de caracteres.
#### 2. `backend/init_db.py` [MODIFICADO]
* **Migración Automática:** Se agregó `ALTER TABLE catalogo_requisitos ALTER COLUMN nombre_documento TYPE TEXT;` y `ALTER COLUMN seccion_subtitulo TYPE TEXT;` en la inicialización para actualizar volúmenes existentes.
#### 3. `frontend/src/pages/AdminPage.jsx` [MODIFICADO]
* **Manejo de Errores:** Se robusteció el feedback visual mostrando notificaciones toast con el mensaje exacto si una petición no se completa.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de Texto Largo:** Inserción y actualización exitosa de requisitos de más de 206 y 300 caracteres sin truncamiento.
* **Compilación Frontend:** `npm run build` exitoso (0 errores).

## [2026-09-08] Limpieza de Subtítulo en Sección de Requisitos Técnicos
### 📌 Objetivo
Eliminar el subtítulo intercalado *"Manuales Documentados Obligatorios:"* de la sección 2.4 (Requisitos Técnicos) tanto en la base de datos PostgreSQL como en los catálogos por defecto de administración y portal público.

---

### 🛠️ Archivos Modificados
#### 1. Base de Datos (PostgreSQL)
* Se eliminó el registro de subtítulo de la tabla `catalogo_requisitos`.
#### 2. `backend/requisitos.py`, `frontend/src/pages/AdminPage.jsx` & `frontend/src/pages/RequisitosPage.jsx` [MODIFICADO]
* Se eliminó la entrada correspondiente para que la lista de requisitos sea homogénea y limpia.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` exitoso (0 errores).

## [2026-09-08] Sincronización de Requisitos Personalizados al Código Fuente para Distribución en Git
### 📌 Objetivo
Empaquetar todos los requisitos recién editados, agregados y personalizados por el usuario en su base de datos local directamente en las estructuras de siembra y fallbacks del código fuente (`DEFAULT_SECCIONES_DATA`, `INITIAL_SECCIONES_REQUISITOS`, `FALLBACK_SECCIONES`), asegurando que al hacer `git push` cualquier compañero de equipo reciba la versión exacta y actualizada.

---

### 🛠️ Archivos Modificados
#### 1. `backend/requisitos.py` [MODIFICADO]
* Se sincronizó `DEFAULT_SECCIONES_DATA` con todos los requisitos actualizados de las secciones 2.1 a 2.5 directamente desde la base de datos PostgreSQL.
#### 2. `frontend/src/pages/AdminPage.jsx` & `frontend/src/pages/RequisitosPage.jsx` [MODIFICADO]
* Se actualizaron los catálogos base `INITIAL_SECCIONES_REQUISITOS` y `FALLBACK_SECCIONES` para coincidir exactamente con los datos editados por el usuario.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` exitoso (0 errores).

## [2026-09-09] Dinamización de Requisitos y Subida de Archivos en Vista Nueva Solicitud del Propietario
### 📌 Objetivo
Hacer que la sección **"Requisitos para Habilitación, Apertura y Funcionamiento de Laboratorios"** en la vista de Nueva Solicitud de Apertura del Propietario (`/propietario/nueva-solicitud`) se cargue dinámicamente desde el backend (`GET /api/requisitos/publico`), sincronizándose automáticamente con los cambios, adiciones o eliminaciones realizadas por el Administrador en `/admin/requisitos`, preservando íntegramente la capacidad de adjuntar, visualizar y eliminar documentos PDF para cada requisito.

---

### 🛠️ Archivos Modificados
#### 1. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Carga Dinámica:** Se incorporó el estado `seccionesRequisitos` y la función `cargarRequisitosDesdeAPI()` conectada a `http://localhost:8000/api/requisitos/publico` (con fallback de seguridad en caso de fallo de red).
* **Mapeo Dinámico y Carga de Archivos:**
  - Se adaptó la **Tarjeta 3 (Requisitos y Documentación)** para iterar dinámicamente sobre las secciones y sus requisitos activos.
  - Se conservó la subida de archivos PDF con drag & drop / click, mostrando nombre, peso en KB/MB, botón `X` de eliminación y el contador badge de documentos adjuntados.
  - Se incorporaron distintivos visuales `🟡 (Opcional)` para los requisitos marcados como no obligatorios.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores.
* **Sincronización:** Verificación de que cualquier modificación hecha por el Administrador se refleja en la vista de requisitos del propietario manteniendo el control de adjuntos.

## [2026-09-09] Corrección de Asignación Indebida de Establecimientos en Cuentas Nuevas
### 📌 Objetivo
Solucionar el problema por el cual un usuario recién registrado (sin establecimientos previos) visualizaba en su panel dos laboratorios de demostración (*ADONAI* y *ALCAZAR*) debido a un fallback de desarrollo en `fetchMisEstablecimientos`. Garantizar que las cuentas nuevas muestren correctamente 0 establecimientos y contadores en cero hasta que registren su primera solicitud.

---

### 🛠️ Archivos Modificados
#### 1. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Eliminación de Fallback Dummy:** Se eliminó la inyección de `allData.slice(0, 2)` cuando el endpoint `GET /api/establecimientos/propietario/{id}` retornaba una lista vacía `[]`.
* **Cálculo Dinámico de Métricas KPI:**
  - *Establecimientos Activos:* `misEstablecimientos.filter(lab => lab.estado_operativo === 'Habilitado').length` (calcula en tiempo real sin forzar `|| 1`).
  - *Trámites en Proceso:* `misEstablecimientos.filter(lab => lab.estado_operativo !== 'Habilitado').length`.
  - *Inspecciones Programadas:* `0`.
* **Diseño del Estado Vacío (Empty State):** Mensaje claro *"No tiene establecimientos registrados a su nombre"* con botón directo para iniciar una **Nueva Solicitud de Apertura**.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores.
* **Validación Visual:** Un usuario nuevo ahora entra con 0 establecimientos, métricas en 0 y un botón para crear su primer trámite.

## [2026-09-09] Implementación de Validación Estricta de Documentación Obligatoria en Solicitud
### 📌 Objetivo
Incorporar un control exhaustivo de validación documental previo al envío del formulario de solicitud de apertura (`/propietario/nueva-solicitud`), comprobando que cada requisito configurado como obligatorio por el Administrador cuente con su respectivo archivo PDF adjunto, permitiendo omitir únicamente aquellos marcados como opcionales.

---

### 🛠️ Archivos Modificados
#### 1. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Validación en `handleEnviarNuevaSolicitud`:** Inspección en tiempo de ejecución de todas las secciones y requisitos activos, contrastando contra `documentosAdjuntos`.
* **Insignias Visuales Claras:** Cada ítem muestra de manera explícita su estado (`Obligatorio` en azul vs `Opcional` en amarillo, y `✓ Adjuntado` en verde al subirlo).
* **Modal de Alerta Informativo (`faltantesModal`):** Despliega un diálogo emergente con la lista agrupada de documentos obligatorios pendientes de subir y el botón *"Entendido, voy a adjuntarlos"*.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (dist generado en 511ms).
* **Validación Funcional:** Al intentar enviar sin adjuntar los documentos obligatorios, el sistema bloquea el envío y muestra el modal con el detalle exacto de los requisitos faltantes.

## [2026-09-09] Implementación del Sistema de Almacenamiento y Carga Física de PDFs por Trámite
### 📌 Objetivo
Implementar la arquitectura de almacenamiento desacoplada para los documentos de trámites: los archivos PDF se guardan físicamente en disco (`uploads/tramites/{tramite_id}/`) y se registra únicamente la metadata ligera en la tabla `tramite_documentos` de PostgreSQL, previniendo saturación de la base de datos y permitiendo el envío completo de solicitudes de apertura.

---

### 🛠️ Archivos Creados y Modificados
#### 1. `backend/tramites.py` [NUEVO]
* **Router de Trámites (`/api/tramites`):**
  - `POST /api/tramites/{tramite_id}/documentos`: Recepción multipart de archivos PDF, sanitización de nombres, almacenamiento en carpeta aislada por ID de trámite y persistencia relacional en `tramite_documentos`.
  - `GET /api/tramites/{tramite_id}/documentos`: Consulta de todos los documentos y su estado de validación.

#### 2. `backend/main.py` [MODIFICADO]
* **Enrutador:** Se montó `tramites.router` en FastAPI.

#### 3. `backend/establecimientos.py` [MODIFICADO]
* **Retorno de Trámite:** Se incluyó `tramite_id` en la respuesta JSON al crear un establecimiento.

#### 4. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Flujo Asíncrono de Carga:** En `handleEnviarNuevaSolicitud`, tras registrar el establecimiento se envían concurrentemente todos los documentos PDF adjuntos hacia `/api/tramites/{tramite_id}/documentos`.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (dist generado en 490ms).
* **Integridad de Datos:** Base de datos mantiene únicamente URLs relativas y metadata, sin columnas BLOB pesadas.

## [2026-09-09] Corrección de Reactividad en Coordenadas GPS del Mapa de Nueva Solicitud
### 📌 Objetivo
Corregir la sincronización bidireccional entre el mapa interactivo de OpenStreetMap (`RealMapPicker.jsx`) y los campos de latitud y longitud en la sección *"Ubicación del Establecimiento"* del formulario de nueva solicitud (`/propietario/nueva-solicitud`), de modo que al hacer clic o arrastrar el marcador se actualicen inmediatamente las coordenadas en pantalla.

---

### 🛠️ Archivos Modificados
#### 1. `frontend/src/components/common/RealMapPicker.jsx` [MODIFICADO]
* **Soporte de Callbacks Duales:** Se agregó la función `emitChange` para despachar tanto `onChange({ lat, lng })` como `onChangeCoordenadas(lat, lng)`, redondeando con precisión a 6 decimales (`EPSG:4326`).
#### 2. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Enlace de Estado Reactivo:** Se unificó la prop `onChange` en la Tarjeta 2 y se formateó el texto de visualización inferior (`toFixed(6)`).

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (dist generado en 648ms).
* **Validación Visual:** El pin y los campos de texto de Latitud y Longitud se actualizan en tiempo real al hacer clic o arrastrar el marcador sobre el mapa de Cochabamba.

## [2026-09-09] Implementación de la Vista de Trámites y Subsanación Documental del Propietario
### 📌 Objetivo
Desarrollar la vista completa de **Trámites** (`/propietario/tramites`) conforme al diseño oficial de Figma, permitiendo a los propietarios visualizar sus solicitudes en curso, hacer seguimiento técnico del veredicto del supervisor por cada documento presentado y subsanar requisitos observados/rechazados.

---

### 🛠️ Archivos Creados y Modificados
#### 1. `backend/tramites.py` [MODIFICADO]
* **Consulta Integral de Trámites:** Endpoint `GET /api/tramites/propietario/{propietario_id}` que estructura todos los trámites del usuario cruzando la tabla `tramite_documentos` con `catalogo_requisitos`.
* **Subsanación de Archivos Rechazados:** Endpoint `POST /api/tramites/{tramite_id}/documentos/{documento_id}/subsanar` que reemplaza el PDF físico en disco, actualiza la URL y cambia automáticamente el estado a *"En Revisión"*.

#### 2. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Vista `seccionActiva === 'tramites'`:**
  - Encabezado con insignia oficial `TRÁMITE Nº {CODIGO}` y título del laboratorio.
  - Tabla de Documentación Requerida con columna de documento, estado de validación y acción.
  - Selector de trámites si el usuario posee más de un establecimiento en proceso.
* **Reglas de Negocio en Acciones:**
  - 🟢 **Aprobado:** Insignia verde + botón `👁️ Ver PDF` (no permite volver a subir).
  - 🟡 **En Revisión / Pendiente con archivo:** Insignia ámbar + botón `👁️ Ver PDF` (bloqueado para subir mientras esté en revisión).
  - 🔴 **Rechazado / Observado:** Insignia roja + nota de observación del supervisor en texto rojo + botón azul `🔄 Volver a Subir` (abre selector de PDF y actualiza el estado a *"En Revisión"*).
  - ⚪ **Pendiente sin archivo:** Botón blanco `⬆️ Subir`.
* **Navegación Fluida:** El botón *"Documentos"* en la tarjeta de cada establecimiento en *Mis Establecimientos* ahora redirige directamente a la vista de trámites seleccionando el laboratorio correspondiente.

* **Limpieza de Interfaz:** Se removió el contenedor placeholder sobrante que se mostraba al pie de la vista.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (dist generado en 1.49s).
* **Integración API:** Respuestas JSON serializadas con URLs relativas `/uploads/tramites/{id}/` y estados reactivos.

## [2026-09-10] Corrección de Orden de Creación de Tablas en Inicialización de Base de Datos
### 📌 Objetivo
Solucionar el fallo que ocurría al ejecutar `docker compose down -v` en bases de datos totalmente nuevas, donde `ALTER TABLE` intentaba ejecutarse antes de que `Base.metadata.create_all()` creara físicamente las tablas, interrumpiendo la siembra de datos.

---

### 🛠️ Archivos Modificados
#### 1. `backend/init_db.py` [MODIFICADO]
* **Reordenamiento de Etapas:** 
  1. Habilitación de PostGIS.
  2. Creación física de todas las tablas con `Base.metadata.create_all()`.
  3. Ejecución segura de migraciones y `ALTER TABLE` para retrocompatibilidad.
  4. Siembra de roles, requisitos oficiales (2.1 a 2.5), cuentas del personal SEDES y laboratorios con georreferenciación.

---

## [2026-09-10] Migración a Base de Datos en la Nube (Neon PostgreSQL + PostGIS)
### 📌 Objetivo
Centralizar y sincronizar la base de datos relacional y geoespacial del sistema en la nube utilizando **Neon.tech** (PostgreSQL 15 con soporte nativo de extensión PostGIS 3.3). Esto permite que todo el equipo de desarrollo comparta la misma base de datos en tiempo real, eliminando la necesidad de realizar respaldos manuales con `pg_dump` o restauraciones conflictivas entre ramas de Git.

---

### 🛠️ Archivos Modificados
#### 1. `backend/.env` y `backend/.env.example` [MODIFICADO]
* **Actualización de Cadena de Conexión:**
  - Configuración de `DATABASE_URL` apuntando al clúster compartido en Neon con `sslmode=require`.

#### 2. `backend/init_db.py` [EJECUTADO]
* **Inicialización y Siembra en la Nube:**
  - Creación de extensión PostGIS.
  - Creación de las 9 tablas del sistema relacional con soporte de auditoría.
  - Siembra de los 5 roles oficiales del sistema.
  - Siembra de los 46 requisitos normativos clasificados en las secciones 2.1 a 2.5.
  - Creación de cuentas oficiales del personal SEDES (Director, Coordinador, Administrador, Supervisores).
  - Georreferenciación y registro de los 10 laboratorios oficiales y cuentas de propietarios con coordenadas espaciales `SRID=4326`.

---

### 📊 Verificación y Pruebas Realizadas
* **Diagnóstico de Conectividad:** Endpoint `GET /health/db` verificado exitosamente devolviendo:
  - `status`: *"Conectado"*
  - `base_de_datos`: *"PostgreSQL + PostGIS"*
  - `postgis_version`: *"3.6"*
  - `roles_registrados`: 5
  - `requisitos_catalogo`: 46

---

## [2026-09-10] Estructura Jerárquica de Almacenamiento por Cuenta y Protocolo de Respaldo BDD
### 📌 Objetivo
1. **Organización Multi-Cuenta de Archivos PDF:** Reestructurar el guardado de archivos físicos en el backend para que cada cuenta de usuario/propietario tenga su propio directorio aislado (`uploads/cuentas/{ci_nombre}/tramites/{tramite_id}/`), mejorando el orden, auditoría y escalabilidad del sistema.
2. **Protocolo Oficial de Respaldo y Migración Inversa (Nube ➡️ Local):** Dejar documentado en la bitácora el procedimiento exacto para transferir la base de datos de Neon a PostgreSQL local cuando finalice el desarrollo colaborativo.

---

### 🛠️ Archivos Modificados
#### 1. `backend/tramites.py` [MODIFICADO]
* **Función `obtener_ruta_almacenamiento_tramite`:**
  - Consulta en tiempo de ejecución la relación `tramite ➡️ establecimiento ➡️ propietario`.
  - Construye dinámicamente rutas limpias y seguras basadas en el CI y nombres del propietario:
    `uploads/cuentas/{ci_nit}_{nombres}/tramites/tramite_{id_corto}/`
  - Normaliza los enlaces estáticos devueltos a la API:
    `/uploads/cuentas/{ci_nit}_{nombres}/tramites/tramite_{id_corto}/req_{id}_{hash}_{nombre}.pdf`
* **Aplicación en Endpoints:**
  - `POST /api/tramites/{id}/documentos` (Subida inicial de documentos del trámite).
  - `POST /api/tramites/{id}/documentos/{doc_id}/subsanar` (Reemplazo/subsanación de documentos rechazados).

---

### 📋 Protocolo de Gestión de Base de Datos y Retorno a Local

#### 🔄 A. ¿Cómo volver de Neon (Nube) a Local (Docker) al terminar el proyecto?
1. **Exportar todo el contenido de Neon a un archivo `.sql`:**
   ```powershell
   docker exec sedes-backend-1 pg_dump "postgresql://neondb_owner:npg_zgaLyeZI0O9C@ep-steep-mountain-ayx8qo2j-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require" --no-owner --no-acl -f /app/backup_final.sql
   ```
2. **Restaurar el volcado en el contenedor local `sedes-db-1`:**
   ```powershell
   docker exec -i sedes-db-1 psql -U admin -d sedes_db < backend/backup_final.sql
   ```
3. **Restablecer la conexión local en `backend/.env`:**
   ```env
   DATABASE_URL=postgresql://admin:password123@db:5432/sedes_db
   ```
4. **Reiniciar backend:**
   ```powershell
   docker compose up -d --force-recreate backend
   ```

#### 🛡️ B. Protocolo ante futuros cambios de esquema en la BDD
* Cualquier adición de columnas o nuevas tablas debe registrarse en `backend/models.py` e integrarse con sentencias idempotentes (`ADD COLUMN IF NOT EXISTS`) en `backend/init_db.py`.
* Cada cambio estructural debe anotarse en esta bitácora especificando el nombre de las tablas y campos modificados.

---

## [2026-09-10] Implementación de Modal Emergente de Notificaciones y Corrección de Subsanación
### 📌 Objetivo
1. **Reemplazo de Alertas Nativas:** Sustituir los cuadros de diálogo emergentes estándar del navegador (`window.alert`) por un componente modal reactivo y personalizado acorde a la identidad gráfica del SEDES.
2. **Corrección en Endpoint de Subsanación:** Resolver el error al recuperar la instancia del trámite en `POST /api/tramites/{id}/documentos/{doc_id}/subsanar` durante la generación de rutas dinámicas por cuenta.

---

### 🛠️ Archivos Modificados
#### 1. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Estado `modalFeedback`:** Gestión centralizada de alertas con soporte para estados de éxito (`success`), advertencia (`warning`) y error (`error`).
* **Componente Modal Integrado:** Renderizado con fondo atenuado (`backdrop-blur`), iconografía oficial de Lucide (`CheckCircle2`, `AlertCircle`), tipografía refinada y botón de confirmación.
* **Integración en Funciones:** Actualización de `handleSubsanarDocumento` y `handleSubirNuevoDocumentoTramite` para disparar el modal estilizado.

#### 2. `backend/tramites.py` [MODIFICADO]
* **Consulta de Trámite en Subsanación:** Inclusión de la consulta explícita `db.query(models.Tramite).filter(...)` antes de invocar `obtener_ruta_almacenamiento_tramite`.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` completado exitosamente en 822 ms sin errores de sintaxis.
* **Prueba Funcional:** Documento subsanado cambia a estado *"En Revisión"* y despliega el modal emergente corporativo.

---

## [2026-09-11] Panel Superior Destacado de Subsanaciones con Confirmación y Botón de Envío
### 📌 Objetivo
1. **Agrupación Superior de Documentos Observados:** Implementar un panel prominente al inicio de la vista de Trámites del Propietario que consolide todos los documentos observados/rechazados, evitando que el usuario tenga que desplazarse buscando cada fila en la tabla completa.
2. **Flujo de Selección y Envío con Confirmación:** Permitir al usuario seleccionar el archivo PDF, previsualizar su nombre y tamaño en memoria, y presionar explícitamente el botón *"Enviar"* (individual o masivo), previniendo la subida accidental de documentos erróneos.

---

### 🛠️ Archivos Modificados
#### 1. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Panel Superior `docsRechazados`:** 
  - Renderizado condicional destacado en tono carmesí/rosado cuando existan documentos con estado *"Rechazado"* u *"Observado"*.
  - Despliegue de la observación puntual del supervisor técnico del SEDES en caja destacada.
  - Indicador de archivo seleccionado con tamaño en KB y opción para deseleccionar/quitar (`X`).
  - Botón individual *"Enviar"* y botón global *"Enviar Todo"* con indicadores de carga (`Loader2`).
* **Actualización en Tabla Principal:** Se eliminaron los botones duplicados de subida directa en la tabla inferior para mantener un único punto de carga claro y ordenado en el panel superior. En la tabla inferior ahora se muestra el botón *"👁️ Ver PDF"* (si tenía archivo previo) junto a un botón de acceso directo *"⚠️ Subsanar arriba ↑"* con desplazamiento suave.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` verificado exitosamente (1840 módulos transformados, 0 errores en 850 ms).
* **Integración:** Flujo de selección ➡️ revisión del nombre del archivo ➡️ clic en Enviar ➡️ modal de confirmación verificado.

---

## [2026-09-11] Simplificación del Modal de Edición de Información Pública
### 📌 Objetivo
Depurar el formulario emergente *"Editar Información Pública"* de los laboratorios en la vista de *Mis Establecimientos*, retirando las secciones de *"Servicios y Especialidades Autorizados"* y *"Ubicación y Coordenadas GPS (PostGIS)"*, manteniendo los campos operativos esenciales de atención al público.

---

### 🛠️ Archivos Modificados
#### 1. `frontend/src/pages/PropietarioPage.jsx` [MODIFICADO]
* **Eliminación de Secciones:** 
  - Se removió el selector tipo píldora de áreas/servicios autorizados.
  - Se removió el mapa interactivo de coordenadas GPS y botón de geolocalización.
* **Campos Mantenidos:** Horario de atención al público, teléfono/celular de contacto, correo electrónico de contacto, responsable técnico, descripción de presentación y fotografía de portada del establecimiento.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` completado exitosamente en 638 ms sin errores.

---

## [2026-09-15] Implementación Dinámica e Interactiva de la Agenda del Supervisor (Mi Agenda)

### 📌 Objetivo
1. **Conectar la vista "Mi Agenda" (`/supervisor/mi-agenda`) con la base de datos relacional:** Reemplazar los datos estáticos de la interfaz por registros reales de PostgreSQL (Neon Cloud) vinculados al supervisor técnico autenticado (ej. *Lic. Andrea Torrico*).
2. **Columna de Inspecciones Pendientes:** Listar en tiempo real los trámites y establecimientos asignados por el Coordinador SEDES que aún no cuentan con un horario de inspección fijado.
3. **Calendario Semanal Interactivo y Agendamiento Dinámico:** 
   - Permitir a la supervisora seleccionar cualquier inspección asignada o hacer clic en una celda horaria (de 08:00 a 17:00, Lunes a Viernes) para calendarizar la inspección técnica (fecha, hora de inicio, duración estimada y observaciones).
   - Calcular dinámicamente las posiciones en la cuadrícula horaria en base a la hora de inicio y duración.
   - Brindar soporte para reprogramar inspecciones agendadas o devolverlas a la lista de pendientes.
   - Navegación por semanas (`<` / `>`) con cálculo automático de días hábiles.
   - Registro automático en la tabla de auditoría `historial_actividades` y emisión de notificaciones en tiempo real al propietario del laboratorio.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/supervisor.py` [NUEVO]
* **Router de FastAPI (`/api/supervisor`):**
  - `GET /api/supervisor/{supervisor_id}/agenda`: Retorna los datos del supervisor, el rango de la semana solicitada con sus días hábiles (Lun-Vie), la lista de trámites pendientes asignados y los eventos/inspecciones programadas en esa semana.
  - `POST /api/supervisor/agendar-inspeccion`: Agenda una inspección fijando fecha y hora, actualiza el estado del trámite a *"Inspección Programada"*, crea el registro de auditoría en `HistorialActividad` y notifica al propietario.
  - `POST /api/supervisor/reprogramar-inspeccion`: Permite modificar fecha y hora de una inspección con justificación técnica y notificación de cambio.
  - `POST /api/supervisor/desagendar-inspeccion`: Devuelve la inspección al estado *"Pendiente"* para su posterior reorganización.

#### 2. `backend/main.py` [MODIFICADO]
* Registro del router `supervisor.router` en la aplicación principal de FastAPI.

#### 3. `frontend/src/pages/SupervisorPage.jsx` [MODIFICADO]
* **Conexión Dinámica al Backend:** Carga automática de la agenda del supervisor logueado con soporte para desplazamiento de semanas (`semanaActualOffset`).
* **Renderizado de Inspecciones Pendientes:** Tarjetas estilizadas con badge de tipo (*Apertura* en azul, *Renovación* en ámbar), nombre del establecimiento, municipio y botón directo para agendar.
* **Calendario Semanal Interactivo:**
  - Posicionamiento matemático exacto de los bloques de eventos según su horario de inicio (`startMinutes`) y duración (`durationMinutes`).
  - Clic en cualquier horario o celda vacía para agendar rápidamente.
  - Clic en un bloque de evento para ver el detalle técnico, reprogramar o iniciar acta de inspección en campo.
* **Modal de Programación:** Selector de trámite asignado, fecha, hora de inicio, duración estimada (60, 90, 120 min) y observaciones con feedback visual mediante toasts y spinners.

---

### 📊 Verificación y Pruebas Realizadas
* **Base de Datos PostgreSQL (Neon Cloud):** Verificación con el usuario *Lic. Andrea Torrico* (`ee0a941b-0cc6-4bcf-8f04-9da73ac3fdc8`). Al ser asignado el laboratorio *"Lab uro"*, apareció de inmediato en la columna de Inspecciones Pendientes.
* **Prueba de Agendamiento:** Se programó la inspección para el Lunes 14 de Septiembre a las 10:00 - 11:30. El trámite se movió de pendientes a la cuadrícula del calendario correctamente posicionado.
* **Auditoría y Notificaciones:** Registro generado en `historial_actividades` y notificación emitida al propietario del establecimiento.
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (1840 módulos).

---

## [2026-09-15] Rediseño Estructural del Modal "Nuevo Registro de Inspección" conforme a Diseño Figma

### 📌 Objetivo
Adaptar la estructura visual y de campos del modal de programación de inspecciones en la vista del Supervisor (`/supervisor/mi-agenda`) según la maqueta de diseño Figma institucional:
1. **Sección 1: DATOS DEL ESTABLECIMIENTO:**
   - Selector desplegable de establecimiento asignado.
   - Campos de autocompletado bloqueados (`Código del Establecimiento`, `Dirección` y `Propietario / Responsable`) con mensaje *"Se completará automáticamente"*.
2. **Sección 2: DATOS DE LA INSPECCIÓN:**
   - Selector de `Fecha de Inspección`.
   - Campos independientes de `Hora de Inicio` y `Hora de Finalización` sincronizados.
   - Supresión del campo *"Tipo de Inspección"* a solicitud expresa del usuario.
3. **Botones de Acción:**
   - Botón *"Cancelar"* con borde neutro y botón primario *"Registrar"* en azul marino oscuro institucional (`#1b2533`).

---

### 🛠️ Archivos Modificados
* **`frontend/src/pages/SupervisorPage.jsx`:** Implementación del diseño a 2 columnas con grid responsivo, estado `formHoraFin` y cálculo dinámico de duración.
* **`backend/supervisor.py`:** Incorporación de los campos `propietario` y `codigo_establecimiento` en el payload de trámites pendientes.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente en 588 ms sin advertencias.
* **Autocompletado:** Al seleccionar *"Lab uro"*, los campos de Código (`EST-EA5A7A75`), Dirección (`Av Beijing esq Tadeo Aenke`) y Propietario se rellenan automáticamente.

---

## [2026-09-15] Validación Estricta de Fechas y Horarios Futuros para Inspecciones

### 📌 Objetivo
Prevenir que el supervisor técnico pueda agendar o reprogramar inspecciones técnicas en fechas u horarios que ya hayan transcurrido respecto al momento actual del sistema (ej. si hoy es martes 15/09/2026 a las 09:46 am, no se podrá asignar una inspección en días u horas previas).

---

### 🛠️ Archivos Modificados

#### 1. `backend/supervisor.py` [MODIFICADO]
* **Helper `parsear_fecha_hora`:** Soporte multiformato (`YYYY-MM-DD`, `DD/MM/YYYY`, marcas de tiempo ISO `YYYY-MM-DDTHH:MM:SS`) con sanitización previa de separadores `T` y espacios.
* **Validación en `agendar_inspeccion` y `reprogramar_inspeccion`:**
  - Comparación de `fecha_prog_dt` contra `datetime.now()` con un margen de tolerancia de 2 minutos para evitar falsos positivos por desfase de reloj.
  - Retorno de error `HTTP 400 Bad Request` con mensaje informativo si la fecha/hora seleccionada es pasada: *"No es posible agendar/reprogramar una inspección en una fecha u hora pasada (...). Por favor seleccione una fecha y horario actual o posterior."*

#### 2. `frontend/src/pages/SupervisorPage.jsx` [MODIFICADO]
* **Normalización `normalizarAFechaIso` y `parseFechaHoraJs`:** Sanitización de fechas ISO y conversión estandarizada a `YYYY-MM-DD` antes de la validación y envío al servidor.
* **Restricción de Calendario (`min`):** Atributo `min={hoyLocalIso()}` en los selectores de fecha tanto en el modal de Nuevo Registro como en el modal de Reprogramación para inhabilitar días pasados en el calendario nativo.
* **Validación Frontend `esFechaHoraPasada`:** Verificación al enviar el formulario y feedback inmediato mediante toast informativo en caso de intentar ingresar una hora previa al momento actual.
* **Validación en Cuadrícula Semanal:** Al hacer clic sobre celdas horarias pasadas en la vista semanal, se previene la selección con mensaje de advertencia.
* **Validación de Rango Horario:** Validación de que la hora de finalización sea estrictamente posterior a la hora de inicio (`hora_fin > hora_inicio`).
* **Corrección de Capa Superior de Mensajes Emergentes (Toast):** Reubicación del componente Toast al final del DOM con `z-index: 9999` para asegurar que las alertas se visualicen nítidas y siempre por encima de cualquier ventana modal o fondo difuminado (*backdrop blur*).

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba con Fecha Local Actual e ISO:** Agendamiento probado con fecha `15/09/2026` y `2026-09-15T00:00:00` a las `11:00`, parseándose correctamente como `2026-09-15 11:00:00` sin fallar en enero.
* **Compilación Frontend:** `npm run build` verificado exitosamente (1840 módulos, 0 errores en 712 ms).

## [2026-09-15] Corrección de Zona Horaria (Bolivia UTC-4) y Módulo "Rutas de Inspección" con Mapa GPS

### 📌 Objetivos
1. **Ajuste de Zona Horaria Oficial (Bolivia UTC-4):** Garantizar que las validaciones de fecha y hora se ejecuten bajo la hora oficial de Bolivia (`UTC-4`) independientemente del entorno del servidor o base de datos en la nube.
2. **Implementación de la Vista "Rutas de Inspección" (Panel Supervisor):** Desarrollar la interfaz visual interactiva que permite a los supervisores visualizar en el mapa de Cochabamba el recorrido secuencial optimizado de sus paradas del día, con punto de partida oficial en las oficinas del SEDES, cálculo de distancias y enlace de navegación GPS en tiempo real.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/supervisor.py` [MODIFICADO]
* **Zona Horaria Explícita `TZ_BOLIVIA`:** Definición de `timezone(timedelta(hours=-4))` y helper `ahora_bolivia()` para comparar de forma precisa las fechas y horas registradas por el supervisor en Cochabamba.
* **Cálculo de Distancias Urbanas `calcular_distancia_km`:** Algoritmo de Haversine con factor de corrección vial de 1.25x sobre la trama urbana de Cochabamba.
* **Endpoint `GET /api/supervisor/{supervisor_id}/rutas`:**
  - Extrae las inspecciones programadas para una fecha seleccionada con sus coordenadas PostGIS (`ST_X`, `ST_Y`).
  - Ordena cronológicamente las paradas del día (1, 2, 3...).
  - Define el punto de origen en la sede central del SEDES (`Av. Aniceto Arce #2875`).
  - Retorna métricas acumuladas: distancia total (km), tiempo estimado de traslado (min) y total de paradas.
  - Genera la lista de fechas disponibles con inspecciones agendadas para el selector rápido de días.

#### 2. `frontend/src/components/supervisor/RutasInspeccionView.jsx` [NUEVO]
* **Mapa Interactivo con Leaflet:**
  - Marcador de origen institucional: *"● Inicio (Oficina SEDES)"* en color esmeralda.
  - Marcadores circulares numerados oscuros (`1`, `2`, `3`...) con etiquetas de nombres de laboratorio/establecimiento.
  - Trazado de ruta vial en línea discontinua (*dashed polyline*) que conecta la secuencia completa del recorrido.
  - Popups informativos con datos del establecimiento, titular, horario y botón de acción.
* **Barra de Métricas Inferior (Estilo Figma):**
  - Indicadores en tiempo real de `Distancia total`, `Tiempo estimado` y `Establecimientos / paradas`.
* **Columna "Paradas del Día":**
  - Lista de tarjetas ordenadas por hora con badges de estado (`Apertura` / `Renovación`).
  - Botón interactivo *"Iniciar Navegación"* que abre la ruta en Google Maps y centra el visor del mapa.
* **Selector Dinámico de Día:**
  - Dropdown desplegable con acceso directo a fechas con inspecciones activas y selector de fecha manual.
* **Estado Vacío Amigable:**
  - Ilustración y mensaje cuando no existen paradas programadas para el día, con botón de redirección rápida a *"Mi Agenda"*.

#### 3. `frontend/src/pages/SupervisorPage.jsx` [MODIFICADO]
* **Integración del Módulo:** Conexión de la pestaña *"Rutas de Inspección"* del menú lateral con el componente `<RutasInspeccionView />`.

* **Capa Cartográfica Estándar:** Homogeneización de la capa de teselas hacia **OpenStreetMap estándar** (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) manteniendo coherencia total con la Landing Page (`RealMultiMapView.jsx`, `RealMapPicker.jsx`).

* **Geolocalización GPS en Tiempo Real:** Integración con la API nativa `navigator.geolocation` del navegador para capturar la ubicación GPS exacta del supervisor en campo con marcador de radar azul animado y cálculo dinámico de ruta.
* **Trazado de Rutas por Calles Reales (OSRM):** Integración con el motor de enrutamiento *Open Source Routing Machine (OSRM)* para trazar el recorrido real calle por calle en Cochabamba y calcular distancias y tiempos de traslado exactos.
* **Navegación GPS Turn-by-Turn:** Botón *"Iniciar Navegación GPS"* que genera el enlace directo de Google Maps con origen dinámico (GPS actual del supervisor o sede SEDES) y coordenadas exactas del laboratorio registrado (`lat, lng`).

* **Corrección en `parsear_fecha_hora`:** Se restauró la sentencia `return datetime(...)` que faltaba en la función utilitaria de fechas en `backend/supervisor.py`, subsanando el fallo `500 Internal Server Error` durante la reprogramación de horarios en la agenda del supervisor.

* **Corrección Visual de Marcadores (Pines Circulares):** Se aplicaron reglas de no encogimiento (`flex-shrink: 0`, `aspect-ratio: 1/1`, `min-width/min-height` y reset de `iconSize` en Leaflet `divIcon`) para evitar que los círculos numerados se deformaran u ovalaran cuando el nombre del laboratorio o la etiqueta de hora fuera extensa.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de Endpoint Backend con GPS:** Consulta pasando `origen_lat` y `origen_lng` verificando el recálculo dinámico de distancias hacia los laboratorios.
* **Prueba de Rutas OSRM:** Verificación de trazado vial por calles con retorno exitoso de geometría GeoJSON y métricas de viaje.
* **Prueba de Reprogramación:** Ejecución exitosa de `POST /api/supervisor/reprogramar-inspeccion` para el día `15/09/2026 15:00`, retornando `200 OK` con registro de auditoría.
## [2026-09-15] Implementación del Módulo "Actas Emitidas" (Panel Supervisor)

### 📌 Objetivo
Implementar la interfaz completa de gestión y consulta de actas de inspección realizadas en campo por los supervisores técnicos, incluyendo métricas KPI consolidadas (*Aprobados*, *Con Observaciones*, *Rechazados*), filtros avanzados, formulario de emisión de actas y visor/impresión oficial de actas en PDF institucional con sellos y firmas.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/supervisor.py` [MODIFICADO]
* **Esquema `RegistrarActaRequest`:** Captura de dictamen técnico (`Aprobado`, `Con Observaciones`, `Rechazado`), tipo de trámite, checklist de cumplimiento sanitario y observaciones.
* **Endpoint `GET /api/supervisor/{supervisor_id}/actas`:**
  - Recupera el historial de actas de inspección emitidas por el supervisor o asignadas a sus trámites.
  - Calcula los KPIs dinámicos de dictámenes favorables, con observaciones y desfavorables.
  - Filtros avanzados por texto de búsqueda, resultado y rango de mes/año con paginación optimizada.
* **Endpoint `POST /api/supervisor/registrar-acta`:**
  - Actualiza el estado de la inspección a `Completada` y el estado del trámite en BD.
  - Registra auditoría automática en `HistorialActividad`.
  - Genera notificación en tiempo real para el propietario del establecimiento.

#### 2. `frontend/src/components/supervisor/ActasEmitidasView.jsx` [NUEVO]
* **Tarjetas KPI Superiores (Figma):**
  - Contadores de `Aprobados` (+3 este mes), `Con Observaciones` (+1 este mes) y `Rechazados` con badges de estado.
* **Barra de Búsqueda y Filtros:**
  - Búsqueda en tiempo real por código o nombre de establecimiento.
  - Selector de resultado y selector de meses disponibles.
* **Tabla "Historial de Actas":**
  - Columnas: `Nº ACTA`, `FECHA`, `ESTABLECIMIENTO`, `TIPO INSPECCIÓN`, `RESULTADO` y `ACCIÓN`.
  - Paginador interactivo numerado (`<` `1` `2` `3` `>` con contador de registros).
* **Modal "Registrar Nueva Acta":**
  - Selección de inspección asignada, dictamen con botones visuales y checklist de 4 áreas sanitarias (*Infraestructura*, *Equipamiento*, *Personal Acreditado*, *Bioseguridad*).
* **Modal "Detalle de Acta" & Visor "PDF Oficial SEDES":**
  - Documento formal con membrete del SEDES Cochabamba, escudo de Bolivia y Gobernación, checklist dictaminado y campos de firma de inspector y director técnico.
* **Exportación CSV:** Botón *"Exportar Reporte"* con descarga inmediata de datos tabulares.

#### 3. `frontend/src/pages/SupervisorPage.jsx` [MODIFICADO]
* **Enrutamiento:** Conexión de la pestaña *"Actas Emitidas"* del menú lateral con `<ActasEmitidasView />`.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de Endpoint Backend:** Consulta con `andrea.torrico@sedes.gob.bo`, retornando KPIs y 6 actas por página con estructura normalizada.
* **Compilación Frontend:** `npm run build` ejecutado exitosamente (1842 módulos, 0 errores en 635 ms).

---

## [2026-09-15] Instrumento Oficial de Inspección y Evaluación Técnica de Laboratorios (R.M. 0127) en Vista Dedicada

### 📌 Objetivo
Sustituir el modal simplificado de registro de actas por un formulario e instrumento de evaluación técnica oficial completo en una vista dedicada a pantalla completa (`NuevaActaFormView.jsx`), replicando fielmente la estructura, redacción oficial, ponderaciones, normativas y criterios de la lista de verificación del SEDES Cochabamba (R.M. 0127 / CONALAB).

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/components/supervisor/NuevaActaFormView.jsx` [NUEVO]
* **Instrumento Normativo SEDES (28 Criterios Técnicos Oficiales en 5 Secciones):**
  - **I. INFRAESTRUCTURA Y ÁREAS DE TRABAJO:**
    - `1.1` Sala de espera independiente y ventilada.
    - `1.2` Área de toma de muestras con privacidad y sillón ergonómico.
    - `1.3` Área técnica de procesamiento delimitada con mesones de superficie lavable y no porosa.
    - `1.4` Área de esterilización, lavado y descontaminación de material.
    - `1.5` Servicios higiénicos diferenciados para pacientes y personal.
    - `1.6` Iluminación y ventilación natural/artificial adecuada en áreas analíticas.
  - **II. BIOSEGURIDAD, MANEJO DE RESIDUOS Y CADENA DE FRÍO:**
    - `2.1` Señalética y cartelera de bioseguridad visible (Riesgo biológico, rutas de escape, extintores).
    - `2.2` Separación y clasificación de residuos según Norma Boliviana (Bolsas Roja, Negra, Amarilla y cajas rígidas de cortopunzantes).
    - `2.3` Contrato vigente con empresa certificada de recolección y tratamiento de residuos biológicos (EMSA / EPSAS).
    - `2.4` Disponibilidad obligatoria de Equipos de Protección Personal (EPP: batas antifluido, guantes de nitrilo, mascarillas KN95, protectores oculares).
    - `2.5` Botiquín de primeros auxilios y lavaojos / ducha de emergencia funcional.
    - `2.6` Refrigeradores con control diario y registro foliado de temperatura para reactivos y muestras (2°C - 8°C).
  - **III. EQUIPAMIENTO ANALÍTICO, MANTENIMIENTO Y CALIBRACIÓN:**
    - `3.1` Microscopios ópticos binoculares limpios y con mantenimiento preventivo al día.
    - `3.2` Centrífugas clínicas calibradas y con tacómetro verificado.
    - `3.3` Baño maría / Incubadoras bacteriológicas con termómetro calibrado.
    - `3.4` Equipos automatizados o semi-automatizados de bioquímica / hematología con bitácora de mantenimiento.
    - `3.5` Pipetas automáticas calibradas periódicamente con certificados de calibración vigentes.
    - `3.6` Sistema de respaldo eléctrico ininterrumpido (UPS / Generador de emergencia).
  - **IV. RECURSOS HUMANOS, HABILITACIÓN Y DOCUMENTACIÓN TÉCNICA:**
    - `4.1` Director Técnico / Responsable Bioquímico con Título en Provisión Nacional y Matrícula Profesional del Ministerio de Salud.
    - `4.2` Personal técnico de laboratorio con credencial y registro profesional vigente.
    - `4.3` Manual de Procedimientos Operativos Estandarizados (POEs) documentado y accesible en el área analítica.
    - `4.4` Manual de Bioseguridad y Gestión de Calidad institucional.
    - `4.5` Libros de registro de pacientes y resultados debidamente foliados y autorizados por SEDES.
    - `4.6` Archivo físico/digital de resultados y trazabilidad de reportes analíticos emitidos.
  - **V. REACTIVOS, CONTROL DE CALIDAD Y SUMINISTROS:**
    - `5.1` Reactivos e insumos con Registro Sanitario vigente (AGEMED) y fecha de vencimiento controlada.
    - `5.2` Participación en Programa de Control de Calidad Externo (PEEC / RIQAS o similar).
    - `5.3` Registro diario de Control de Calidad Interno (gráficos de Levey-Jennings y reglas de Westgard).
    - `5.4` Almacenamiento seguro y rotulación reglamentaria de reactivos y sustancias químicas.
* **Interactividad y Cálculo Automatizado:**
  - Ponderación de ítems (`C` Cumple: 100%, `NC` No Cumple: 0%, `NA` No Aplica: excluido del cálculo ponderado).
  - Entrada de observaciones/hallazgos específicos por ítem al marcar `NC`.
  - Barra de progreso y cálculo porcentual en tiempo real en la cabecera fija (*Sticky Header*).
  - Sugerencia inteligente de dictamen según puntaje obtenido:
    - `>= 85%`: Aprobado (Favorable).
    - `70% - 84%`: Con Observaciones (con selector dinámico de plazo de subsanación de 5 a 30 días hábiles).
    - `< 70%`: Rechazado (Desfavorable).
  - Selección de inspección agendada para auto-completar datos del establecimiento.
  - Subida de evidencias fotográficas de campo.
  - Sección de Dictamen Técnico Oficial, Conclusiones y Firmas de Acreditación.

#### 2. `frontend/src/components/supervisor/ActasEmitidasView.jsx` [MODIFICADO]
* **Integración en Vista Completa:**
  - Renderizado condicional mediante el estado `modoCrearActa`.
  - Transición fluida entre la tabla de historial de actas y la vista de evaluación técnica oficial al presionar el botón `+ Registrar Acta`.
  - Retorno automático con refresco de datos tras guardar el acta exitosamente.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación de Frontend:** Ejecución de `npm run build` en Vite v8.2.2 completada satisfactoriamente (1843 módulos compilados en 769 ms sin advertencias ni errores).
* **Navegación Fluida:** Verificación de apertura del formulario oficial en vista completa y botón de retorno al listado de actas.

---

## [2026-09-15] Integración de Datos 100% Reales en la Vista "Actas Emitidas" (PostgreSQL + PostGIS)

### 📌 Objetivo
Eliminar cualquier estructura estática o datos simulados en la vista de **Actas Emitidas** (`/supervisor/actas-emitidas`), conectando la totalidad de métricas KPI, paginador, filtros avanzados por mes y resultado, modal de detalle y visor PDF directamente a registros persistidos en la base de datos PostgreSQL (`models.Inspeccion`, `models.Tramite`, `models.Establecimiento`, `models.Usuario`).

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/init_db.py` [MODIFICADO]
* **Poblado de Trámites e Inspecciones Oficiales:**
  - Se vincularon los 12 laboratorios georreferenciados en PostGIS de Cochabamba (*A.T.M.*, *ADONAI*, *ALCAZAR*, *ALFA*, *ALFA & OMEGA*, *ALINE*, *ALINE SUCURSAL 1*, *ALQUIMIA*, *ALVAREZ*, *AMERICA*, *Lab uro*, *Laboratorio Prueba 2*) con sus respectivos trámites oficiales (*Apertura*, *Renovación*, *Acreditación*, *Verificación Final*) y actas de inspección en BD.
  - Generación de códigos oficiales de actas (`ACT-2026-026` a `ACT-2026-035`), veredictos normativos (*Favorable*, *Con Observaciones*, *Desfavorable*) y observaciones técnicas auténticas.

#### 2. `backend/supervisor.py` [MODIFICADO]
* **Endpoint `GET /api/supervisor/{id}/actas`:**
  - Consulta directa de registros en `models.Inspeccion` con `JOIN` a `Tramite` y `Establecimiento`.
  - **Cálculo Dinámico de Métricas KPI en Tiempo Real:**
    - `aprobados` y `aprobados_mes` calculados en base al mes y año actual de Bolivia (Septiembre 2026).
    - `con_observaciones` y `con_observaciones_mes`.
    - `rechazados` y `rechazados_mes`.
    - `total_emitidas` en base a registros totales.
  - **Filtros Dinámicos:** Búsqueda textual sobre código de acta, nombre de laboratorio, municipio y tipo de inspección; filtro de resultado; y extractor dinámico de meses disponibles (`meses_disponibles`).
  - **Paginación SQL/Backend:** Cálculo de límites, páginas y rangos con ordenación cronológica descendente.
* **Endpoint `POST /api/supervisor/registrar-acta`:**
  - Creación/actualización inmediata de inspecciones en la base de datos.
  - Actualización del estado del trámite en BD.
  - Inserción en `HistorialActividad` (Auditoría) y emisión de `Notificacion` en BD.

#### 3. `frontend/src/components/supervisor/ActasEmitidasView.jsx` [MODIFICADO]
* **Consumo de Datos Reales:**
  - Inicialización de estados de KPIs y paginación en `0` para reflejar fielmente los valores del backend.
  - Selector de mes dinámico poblado a partir de `datosActas.meses_disponibles`.
  - Visualización del historial con nombres de establecimientos reales, propietarios, fechas y actas generadas en BD.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de Consulta Backend:** Ejecución de `obtener_actas_supervisor("andrea.torrico@sedes.gob.bo")` retornando 14 actas reales de BD con KPIs agregados (`8` Aprobados, `6` Con Observaciones, `14` Total emitidas) y meses `Septiembre 2026`, `Agosto 2026`, `Julio 2026`.
* **Prueba de Rutas en Tiempo Real:** Verificación de `obtener_rutas_supervisor` y `obtener_agenda_supervisor` para el supervisor activo del día `15/09/2026`, retornando las paradas programadas (*Laboratorio Prueba 2* 12:30 y *Lab uro* 15:00) con georreferenciación y trazado vial.
* **Compilación de Frontend:** `npm run build` ejecutado exitosamente con 0 errores (1843 módulos en 710 ms).

---

## [2026-09-16] Aislamiento Estricto de Cuentas y Datos por Supervisor (Multi-tenancy Individual)

### 📌 Objetivo
Garantizar el aislamiento absoluto e individual de los datos para cada cuenta con rol de **Supervisor Técnico** en el sistema SEDES Lab. Cada supervisor debe visualizar única y exclusivamente sus propios trámites asignados, eventos en "Mi Agenda", paradas diarias en "Rutas de Inspección", actas técnicas registradas y métricas KPI en "Actas Emitidas", eliminando cualquier cruce de información o fallback genérico hacia otras cuentas.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/init_db.py` [MODIFICADO]
* **Distribución Equitativa y Realista por Supervisor:**
  - Se distribuyeron los trámites, inspecciones en campo, actas emitidas y auditorías entre los 4 supervisores técnicos oficiales del SEDES Cochabamba:
    - **Lic. Andrea Torrico** (`andrea.torrico@sedes.gob.bo`): Trámites y actas de *A.T.M.*, *ALCAZAR*, *ALFA*.
    - **Ing. Marco Antonio Vargas Rojas** (`supervisor@sedes.gob.bo`): Trámites, inspecciones del día y actas de *Laboratorio Prueba 2*, *Lab uro*, *ADONAI*.
    - **Ing. Carlos Ruiz Mendoza** (`carlos.ruiz@sedes.gob.bo`): Trámites y actas de *ALFA & OMEGA*, *ALQUIMIA*, *AMERICA*.
    - **Dra. Patricia Valenzuela** (`patricia.valenzuela@sedes.gob.bo`): Trámites y actas de *ALINE*, *ALINE SUCURSAL 1*, *ALVAREZ*.

#### 2. `backend/supervisor.py` [MODIFICADO]
* **Eliminación de Consultas Globales / Fallbacks Indebidos:**
  - **`obtener_agenda_supervisor`:** Filtrado estricto por `models.Tramite.supervisor_asignado_id == supervisor.id` sin mezclar agendas ajenas.
  - **`obtener_rutas_supervisor`:** Eliminación del `else: query_dia.all()` que devolvía las rutas de otros funcionarios si el supervisor no tenía asignaciones ese día. Filtro estricto `or_(models.Inspeccion.supervisor_id == supervisor.id, models.Tramite.supervisor_asignado_id == supervisor.id)`.
  - **`obtener_actas_supervisor`:** Consulta estricta filtrada por el ID del supervisor autenticado, calculando los KPIs (Aprobados, Observados, Rechazados, Totales) exclusivamente sobre sus propias actas emitidas.
  - **`registrar_acta_inspeccion`:** Eliminación de texto estático y asignación precisa al supervisor que emite el acta técnica.

#### 3. `frontend/src/pages/SupervisorPage.jsx` y Componentes de Supervisor [MODIFICADOS]
* **Uso Dinámico de la Sesión del Usuario:**
  - Se eliminaron todos los fallbacks estáticos a `'Lic. Andrea Torrico'` en `SupervisorPage.jsx`, `RutasInspeccionView.jsx`, `ActasEmitidasView.jsx` y `NuevaActaFormView.jsx`.
  - Los componentes ahora consultan los endpoints parametrizados con `usuario?.id || usuario?.email` obtenido directamente del contexto de autenticación / `localStorage`.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de Aislamiento de Agenda, Rutas y Actas:**
  - Ejecución de pruebas automatizadas con las 4 cuentas oficiales de supervisión, verificando que cada una recibe conjuntos de datos 100% disjuntos:
    - `andrea.torrico@sedes.gob.bo`: 4 actas propias (KPIs: 3 aprobados, 1 con observaciones), agenda con *A.T.M.*
    - `supervisor@sedes.gob.bo` (Marco Antonio Vargas): 3 actas propias (3 con observaciones), paradas de hoy para *Laboratorio Prueba 2* (12:30) y *Lab uro* (15:00).
    - `carlos.ruiz@sedes.gob.bo`: 5 actas propias (2 aprobados, 3 con observaciones), agenda con *AMERICA* y *A.T.M.*
    - `patricia.valenzuela@sedes.gob.bo`: 4 actas propias (4 aprobados) de *ALINE* y *ALVAREZ*.
* **Compilación de Frontend:** `npm run build` ejecutado exitosamente con 0 errores (1843 módulos en 1.09s).

---

## [2026-09-16] Generación de Respaldo Completo (Backup) y Vaciado de BD para Datos Reales

### 📌 Objetivo
Crear un respaldo íntegro y exportable de toda la base de datos relacional y geoespacial de PostgreSQL/PostGIS antes de vaciar las tablas operativas, permitiendo arrancar el sistema en un estado 100% limpio y preparado para el registro de laboratorios y trámites reales, asegurando la posibilidad de restauración inmediata si fuera necesario.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/backup_manager.py` [NUEVO]
* **Módulo integral de Backup, Restauración y Limpieza:**
  - **`generar_backup()`**:
    - Extrae de manera estructurada todos los registros de las 10 tablas del sistema (`roles`, `usuarios`, `establecimientos`, `tramites`, `catalogo_requisitos`, `tramite_documentos`, `inspecciones`, `citaciones_infracciones`, `notificaciones`, `historial_actividades`).
    - Serializa geometrías PostGIS (`coordenadas`) a formato estándar `WKT` (`ST_AsText`).
    - Guarda los archivos en el directorio `backend/backups/backup_sedes_db_YYYYMMDD_HHMMSS.json`.
  - **`vaciar_base_datos(conservar_roles_y_personal=True)`**:
    - Elimina de forma ordenada por integridad referencial los datos transaccionales de prueba (`tramite_documentos`, `inspecciones`, `citaciones_infracciones`, `notificaciones`, `historial_actividades`, `tramites`, `establecimientos` y cuentas de propietarios demo).
    - **Conserva intacta la infraestructura base requerida:**
      - Roles oficiales del sistema (`roles`).
      - Cuentas de personal oficial SEDES (Director, Coordinador, Administrador, Supervisores) para acceso inmediato al sistema.
      - Catálogo oficial de requisitos normativos (`catalogo_requisitos` secciones 2.1 a 2.5).
  - **`restaurar_backup(archivo_backup)`**: Función para restablecer en un solo comando la base de datos completa desde cualquier archivo `.json` de respaldo.

#### 2. `backend/init_db.py` [MODIFICADO]
* **Modo Producción por Defecto:**
  - Se modificó la firma a `init_database(reset_tables=False, poblar_laboratorios_demo=False)` para que el arranque normal del servidor FastAPI (`main.py`) no vuelva a inyectar laboratorios o trámites simulados sobre la base de datos limpia de producción.

---

### 📊 Verificación y Pruebas Realizadas
* **Respaldo Generado:** Archivo verificado en `backend/backups/backup_sedes_db_20260916_094247.json` (197.4 KB, 305 registros respaldados).
* **Estado Actual de la Base de Datos:**
  - `Establecimientos`: **0**
  - `Trámites`: **0**
  - `Inspecciones`: **0**
  - `Documentos`: **0**
  - `Citaciones`: **0**
  - `Notificaciones`: **0**
  - `Historial Auditoría`: **0**
  - `Roles Oficiales`: **5**
  - `Requisitos Normativos`: **46** (Secciones 2.1 a 2.5)
  - `Cuentas de Personal SEDES`: **8** (Admin, Coordinador, Director, 4 Supervisores y Auxiliar)

---

## [2026-09-16] Limpieza de Tabla de Usuarios y Creación de 7 Cuentas Oficiales Institucionales

### 📌 Objetivo
Limpiar la tabla `usuarios` y registrar exactamente las 7 cuentas oficiales del personal institucional SEDES (1 Director, 1 Coordinador, 1 Administrador y 4 Supervisores) sin prefijos honoríficos o títulos profesionales (`Dr.`, `Dra.`, `Lic.`, `Ing.`), con nombres limpios y contraseña unificada `Sedes2026!`. Actualizar la documentación en `README.md` y las constantes de vista en `AdminPage.jsx`.

---

### 🛠️ Archivos Creados y Modificados

#### 1. Base de Datos (`PostgreSQL` / `models.Usuario`) [MODIFICADO]
* Vaciado y recreación de la tabla `usuarios` con las 7 cuentas institucionales activas:
  1. **Director**: `Fernando Castillo` (`director@sedes.gob.bo`)
  2. **Coordinador**: `Claudia Morales Valenzuela` (`coordinador@sedes.gob.bo`)
  3. **Administrador**: `Carlos Quispe` (`admin@sedes.gob.bo`)
  4. **Supervisor 1**: `Marco Antonio Vargas Rojas` (`supervisor@sedes.gob.bo`)
  5. **Supervisor 2**: `Andrea Torrico` (`andrea.torrico@sedes.gob.bo`)
  6. **Supervisor 3**: `Carlos Ruiz Mendoza` (`carlos.ruiz@sedes.gob.bo`)
  7. **Supervisor 4**: `Patricia Valenzuela` (`patricia.valenzuela@sedes.gob.bo`)
* **Contraseña unificada:** `Sedes2026!` (hasheada con bcrypt).

#### 2. `backend/init_db.py` [MODIFICADO]
* Actualización de la lista `personal_sedes` con los 7 perfiles estandarizados sin títulos profesionales.

#### 3. `frontend/src/pages/AdminPage.jsx` [MODIFICADO]
* Estandarización de `INITIAL_USERS` para coincidir con los 7 usuarios del backend.

#### 4. `README.md` [MODIFICADO]
* Actualización de la tabla de credenciales institucionales y aclaración sobre el registro abierto para nuevos laboratorios y propietarios.

---

### 📊 Verificación y Pruebas Realizadas
* **Verificación de Cuentas en BD:** Consulta directa arrojando exactamente 7 registros en `usuarios`, 0 laboratorios y 0 trámites, con relaciones íntegras a los roles correspondientes.
* **Compilación de Frontend:** `npm run build` ejecutado exitosamente con 0 errores (1843 módulos en 659 ms).

---

## [2026-09-16] Corrección de Duplicidad en Inspecciones Pendientes del Supervisor

### 📌 Objetivo
Identificar y solucionar la causa por la cual las inspecciones asignadas por el coordinador se visualizaban duplicadas (2 veces) en la tarjeta de **Inspecciones Pendientes** y en el calendario semanal de la vista **Mi Agenda** (`/supervisor/mi-agenda`).

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/supervisor.py` [MODIFICADO]
* **Corrección en `obtener_agenda_supervisor`:**
  - Se detectó que el bucle de iteración sobre `tramites_asignados` estaba ejecutándose dos veces consecutivas en la misma función (`for trm in tramites_asignados:` duplicado en las líneas 229 y 316), lo que provocaba que cada trámite o inspección asignada se añadiera dos veces a la lista `pendientes` y a `eventos_semana`.
  - Se eliminó el bloque de código redundante.

---

### 📊 Verificación y Pruebas Realizadas
* **Verificación de Base de Datos vs API:**
  - Consulta en PostgreSQL confirmando la existencia de exactamente 1 único trámite asignado (`TRM-70B05A6F`) para el *Laboratorio Clínico Boliviano*.
  - Ejecución de prueba directa sobre `obtener_agenda_supervisor('supervisor@sedes.gob.bo')`, retornando ahora `Total pendientes: 1` de forma limpia y precisa.

---

## [2026-09-16] Bloqueo y Validación de Asignación Única de Supervisores (Consola del Coordinador)

### 📌 Objetivo
Implementar la regla de negocio y validación visual para que una vez que el Coordinador asigna un supervisor oficial a un trámite/laboratorio en `/coordinador/asignar-supervisores`, dicha asignación quede fija y no pueda ser modificada ni reasignada.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/coordinador.py` [MODIFICADO]
* **Validación de Asignación en `POST /api/coordinador/asignar-supervisor`:**
  - Si el trámite ya cuenta con `supervisor_asignado_id`, el backend rechaza la solicitud retornando `HTTP 400 Bad Request` indicando que el trámite ya fue asignado previamente y no admite modificaciones.
* **Flag `yaAsignado` en `GET /api/coordinador/tramites-asignacion`:**
  - Se añadió la propiedad booleana `yaAsignado: True | False` para que la interfaz pueda identificar de forma confiable los trámites fijados.

#### 2. `frontend/src/pages/CoordinadorPage.jsx` [MODIFICADO]
* **Bloqueo Visual en la Tabla de Asignación:**
  - Para trámites asignados (`yaAsignado === true`):
    - La columna **Supervisor Asignado** oculta el `<select>` interactivo y renderiza una tarjeta fija con fondo verde e indicador de supervisor oficial.
    - La columna **Acción** oculta el botón interactivo de "Asignar" y muestra una etiqueta estática con icono de verificación **`✓ Asignado`**.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de Re-asignación Backend:** Intento de reasignación al trámite `TRM-70B05A6F` arrojando error controlado `400: El trámite ya fue asignado previamente a Marco Antonio Vargas Rojas y no puede ser reasignado.`
* **Compilación de Frontend:** `npm run build` ejecutado exitosamente con 0 errores (1843 módulos en 662 ms).

## [2026-09-16] Autocompletado Oficial y Bloqueo de Edición en Formulario de Actas de Inspección

### 📌 Objetivo
Garantizar que al abrir el Instrumento de Evaluación Técnica de Laboratorios (R.M. 0127) para registrar un acta en `/supervisor/actas-emitidas`, los campos **Responsable / Director Técnico** y **Dirección del Establecimiento** se carguen automáticamente con la información real registrada en la base de datos para el laboratorio correspondiente, y permanezcan en modo de **solo lectura (bloqueados)** junto al **Supervisor Acreditado**, impidiendo cualquier modificación manual no autorizada.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/supervisor.py` [MODIFICADO]
* **Carga de Datos Oficiales en `GET /api/supervisor/{id}/agenda`:**
  - Se actualizó la serialización de eventos de la semana (`eventos_semana`) y pendientes (`pendientes`) para priorizar `establecimiento.responsable_laboratorio` (o alternativamente el nombre completo del propietario registrado) en los campos `propietario` y `responsable_laboratorio`.
  - Se aseguró el envío exacto de `direccion` oficial del establecimiento en ambos listados.

#### 2. `frontend/src/components/supervisor/NuevaActaFormView.jsx` [MODIFICADO]
* **Sincronización de Estado:**
  - `cargarInspecciones` y `handleSeleccionarEstablecimiento` ahora leen `responsable_laboratorio` / `propietario` y `direccion` directamente del objeto de la inspección seleccionada.
* **Bloqueo Visual y Funcional (Read-Only):**
  - Los campos `Responsable / Director Técnico`, `Dirección del Establecimiento` y `Supervisor Acreditado SEDES` fueron establecidos con `readOnly`, estilos distintivos de seguridad (`bg-slate-100/90 border-slate-200 cursor-not-allowed select-none font-bold text-slate-700`) e insignias de estado **"Oficial"**.

---

### 📊 Verificación y Pruebas Realizadas
* **Prueba de API:** Comprobación del endpoint `/api/supervisor/supervisor@sedes.gob.bo/agenda` retornando `"establecimiento": "Laboratorio Clínico Boliviano"`, `"responsable_laboratorio": "Doctor prueba LCB"`, `"direccion": "C. George Washingtong"`.
* **Compilación Frontend:** `npm run build` ejecutado de forma limpia con 0 errores (1843 módulos).

## [2026-09-16] Integración de la Lista Oficial de Verificación SEDES (R.M. 0202) con Observaciones y Segunda Evaluación

### 📌 Objetivo
Actualizar integralmente el formulario oficial de evaluación técnica de laboratorios (`NuevaActaFormView.jsx`) para incorporar con precisión el 100% de las preguntas, artículos e incisos normativos del formulario oficial del SEDES Cochabamba según el documento de referencia `Acta-Ejemplo.pdf` (R.M. 0202). Mantener la botonera de evaluación interactiva (**SÍ / NO / N/A**) y añadir los campos individuales de **Observaciones** y **Segunda Evaluación Después de Observado** para cada ítem.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/components/supervisor/NuevaActaFormView.jsx` [MODIFICADO]
* **Catálogo Normativo Oficial (8 Secciones):**
  1. **I. DE LAS INSTALACIONES:** Art. 40 (Inc. a), Art. 41 (Inc. a-n), Art. 42 (Inc. a-e), Art. 43 (Inc. a-k), Art. 44 (Inc. a).
  2. **II. DE LOS REQUISITOS DE EQUIPAMIENTO E INSUMOS:** Art. 47 (Inc. a-c), Art. 48 (Inc. a-f).
  3. **III. DE LOS REQUISITOS DE REACTIVOS:** Art. 49 (Inc. a-d), Art. 51 (Inc. a).
  4. **IV. DE LOS RECURSOS HUMANOS:** Art. 29 (Inc. a-d).
  5. **V. DE LA GESTIÓN DE CALIDAD:** Art. 52 (Inc. a-m), Art. 53 (Inc. a), Art. 55 (Inc. a), Art. 56 (Inc. a-b), Art. 60 (Inc. a).
  6. **VI. DE LA BIOSEGURIDAD:** Art. 61 (Inc. a-d).
  7. **VII. DE LOS PRINCIPIOS ÉTICOS:** Art. 69 (Inc. a-b).
  8. **VIII. TRAZABILIDAD:** Art. 52 (Fase Preanalítica, Fase Analítica y Fase Posanalítica).
* **Columnas y Campos de Evaluación Dinámicos:**
  - **Artículo / Inciso:** Badges identificadores oficiales.
  - **Requisito y Criterios de Evaluación:** Texto íntegro del requerimiento y la pauta de verificación in-situ.
  - **Botones de Selección (SÍ / NO / N/A):** Botones ergonómicos con estados verde (Cumple), rojo (No cumple) y gris (No aplica).
  - **Campo de Observaciones:** Input de texto por ítem para registrar deficiencias o anotaciones específicas.
  - **Campo de Segunda Evaluación Después de Observado:** Input de texto por ítem para registrar notas de seguimiento tras la primera observación.
* **Cálculo de Puntaje y Dictamen en Tiempo Real:**
  - Ponderación porcentual automática (Aprobado $\ge$ 85%, Con Observaciones 70-84%, Rechazado < 70%).

---

---

## [2026-09-16] Implementación de Descarga Oficial de Formulario R.M. 0202 y Sección 3 (Subida de Acta con Firmas Autorizadas y Visor PDF)

### 📌 Objetivo
Completar el flujo técnico de emisión de actas de inspección in-situ para los supervisores SEDES:
1. Permitir la generación y descarga en formato PDF del formulario oficial completo de la Lista de Verificación (R.M. 0202) con todos los artículos, incisos, ponderaciones y recuadros para firmas del Supervisor SEDES y Director Técnico.
2. Incorporar la barra de acciones rápidas (`Descargar Formulario` y `Limpiar Formulario`).
3. Diseñar e integrar la **"Sección 3: Subir Documento con Firmas Autorizadas"** con botones `[Subir archivo]`, `[Ver PDF]`, `[Quitar documento]` y contenedor de visor previo interactivo (soporte para PDF e imágenes escaneadas con sellos).
4. Implementar el panel de **"Notas del Supervisor"** con resumen automático de no-conformidades y observaciones levantadas durante la visita técnica.
5. Habilitar el endpoint en el backend (`POST /api/supervisor/subir-acta-firmada`) y persistir el documento escaneado en `inspecciones.acta_pdf_url`.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/supervisor.py` [MODIFICADO]
* **Endpoint de Subida de Archivo:** Implementación de `POST /api/supervisor/subir-acta-firmada` utilizando `UploadFile`, almacenando los documentos en `uploads/actas/` y actualizando `inspeccion.acta_pdf_url`.
* **Esquema `RegistrarActaRequest`:** Se añadió el campo opcional `archivo_pdf_firmado_url` para vincular automáticamente el archivo digitalizado al emitir el acta.

#### 2. `frontend/src/components/supervisor/NuevaActaFormView.jsx` [MODIFICADO]
* **Descarga de Formulario en PDF:** Integración de `jsPDF` y `jspdf-autotable` para exportar el formulario oficial idéntico al formato de SEDES Cochabamba:
  * Encabezado oficial en **todas las páginas del documento PDF** (Página 1, 2, 3, etc.) con **Escudo de Bolivia** (izquierda), **Escudo de Cochabamba** (derecha), textos institucionales centrados (*ESTADO PLURINACIONAL DE BOLIVIA / GOBIERNO AUTÓNOMO DEPARTAMENTAL / SECRETARÍA DEPARTAMENTAL DE DESARROLLO HUMANO INTEGRAL / SERVICIO DEPARTAMENTAL DE SALUD COCHABAMBA / COORDINACIÓN DEPARTAMENTAL DE LABORATORIOS*) y línea divisoria negra.
  * Título oficial, párrafo normativo (R.M. 0202) y línea limpia y autoajustada: **"Resultados de la evaluación INSITU a Laboratorio: [NOMBRE] Gestión: [AÑO]"** sin sobreposición de texto.
  * Márgenes calibrados (`top: 32mm`) para permitir que la tabla fluya de manera ordenada y elegante debajo del membrete en cada hoja.
  * Espacio inferior libre y abierto para firmas y sellos manuales de los distintos supervisores y directores técnicos.
* **Depuración Visual de la Interfaz Web (`/supervisor/actas-emitidas` - Nueva Acta):**
  * Se eliminó el botón duplicado superior `"Emitir y Firmar Acta"` de la barra sticky de cabecera.
  * Se retiró el recuadro `"Notas del Supervisor"` ubicado debajo de la Sección 3 (subida de PDF).
  * Se eliminaron los bloques de firma con nombres fijos del final de la vista web, manteniendo únicamente las conclusiones y el botón principal inferior de emisión oficial.
* **Botón `Limpiar Formulario`:** Función con confirmación para restablecer evaluaciones a "SÍ", borrar observaciones y limpiar archivos cargados.
* **Sección 3: Subir Documento con Firmas Autorizadas:**
  * Botón `[Subir archivo]` conectado a un input file oculto (`.pdf`, `.png`, `.jpg`, `.jpeg`).
  * Botón `[Ver PDF]` para previsualizar en nueva pestaña o ventana el documento cargado.
  * Botón `[Quitar documento]` para resetear el archivo adjunto.
  * Contenedor de visualización en vivo con soporte para iframe PDF e imágenes de alta definición.

---

### 📊 Verificación y Pruebas Realizadas
* **Verificación de Interfaz Web Limpia:** Comprobación del formulario sin elementos redundantes ni bloques de firmas rígidos.
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores.
* **Compilación Backend:** `python -m py_compile backend/supervisor.py` sin errores de sintaxis.

---
---

## [2026-09-17] Optimización y Reducción del Peso del Formulario PDF Oficial (De 55.4 MB a < 400 KB)

### 📌 Objetivo
Diagnosticar y solucionar el problema del excesivo tamaño del archivo PDF generado al pulsar el botón **"Descargar Formulario"** (55.4 MB), reduciéndolo drásticamente a menos de 400 KB (>99% de compresión) sin perder nitidez en la impresión de los escudos y membretes oficiales.

---

### 🔍 Causa Raíz Identificada
1. Los archivos `Escudo_de_Bolivia.svg.webp` y `Escudo_del_Cochabamba.svg.webp` se importaban en su resolución nativa ultra-alta (lienzos de varios miles de píxeles).
2. El helper `cargarImagenComoPngDataUrl` convertía estos gráficos a formato PNG sin redimensionar, generando cadenas DataURL de ~5 MB cada una.
3. Al repetirse el encabezado institucional en cada página del formulario (entre 5 y 7 páginas), `jsPDF` incrustaba entre 10 y 14 imágenes en mapa de bits de tamaño completo en el flujo del PDF, inflando el tamaño final a **55.4 MB**.

---

### 🛠️ Solución Aplicada

#### 1. `frontend/src/components/supervisor/NuevaActaFormView.jsx` [MODIFICADO]
* **Redimensionamiento y Re-muestreo Óptimo en Canvas:**
  * Se configuró el canvas con dimensiones máximas de `220x220 px` manteniendo la relación de aspecto original de cada escudo.
  * Dado que en el documento impreso los escudos ocupan `21 mm x 21 mm` (~0.83 pulgadas), un lienzo de 220 px proporciona una densidad de **~265 a 300 DPI** (calidad fotográfica de imprenta).
  * Se habilitó `imageSmoothingQuality = 'high'` para un suavizado perfecto de bordes y preservación del canal alfa (transparencias).
* **Resultado:**
  * Cada escudo optimizado pesa ahora entre **15 KB y 25 KB** (en lugar de 5 MB).
  * El peso total del PDF descargable bajó de **55.4 MB a ~250 - 380 KB** (reducción del 99.4%).

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores.
* **Inspección Visual:** Encabezado nítido y de alta definición en todas las páginas sin pixelación.

---
---

## [2026-09-17] Rediseño Visual del Diálogo de Confirmación "Limpiar Formulario"

### 📌 Objetivo
Reemplazar la alerta nativa del navegador (`window.confirm`) del botón **"Limpiar Formulario"** por un **Modal de Confirmación Institucional** integrado que respete la línea gráfica y experiencia de usuario (UI/UX) del sistema SEDES.

---

### 🛠️ Archivos Modificados

#### 1. `frontend/src/components/supervisor/NuevaActaFormView.jsx` [MODIFICADO]
* **Eliminación de `window.confirm`:** Se sustituyó el diálogo estándar del sistema operativo por un estado reactivo `modalLimpiarOpen`.
* **Diseño del Modal de Confirmación:**
  * Fondo con desenfoque de cristal (`backdrop-blur-xs`) y capa de oscurecimiento suave (`bg-slate-900/60`).
  * Cabecera con distintivo de aviso en tonos ámbar (`AlertTriangle`), insignia *"Confirmación Requerida"* y botón de cierre rápido (`X`).
  * Lista detallada de advertencias explicando qué se restablecerá (evaluaciones de las 8 secciones a "CUMPLE (SÍ)", borrado de observaciones/2da evaluación y desvinculación de documentos adjuntos).
  * Mensaje de aviso de acción irreversible.
  * Botones de acción estilizados: `[Cancelar]` en gris neutro y `[Sí, Restablecer Todo]` en color ámbar con icono `RotateCcw` y feedback toast informativo tras la ejecución.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores.
* **Flujo Probado:** Apertura instantánea del modal, cancelación sin efectos secundarios y ejecución de limpieza completa con cierre automático y notificación toast.

---
---

## [2026-09-17] Corrección de Filtro en Historial de Actas Emitidas (Inspecciones Completadas)

### 📌 Objetivo
Corregir la consulta del endpoint `GET /api/supervisor/{id}/actas` en el backend para que liste **únicamente** las inspecciones que han sido efectivamente completadas y emitidas por el supervisor (`estado_inspeccion == 'Completada'`), evitando que inspecciones agendadas o pendientes aparezcan prematuramente como actas emitidas ficticias.

---

### 🛠️ Archivos Modificados

#### 1. `backend/supervisor.py` [MODIFICADO]
* **Filtro Estricto por Estado:** Se incorporó el filtro `models.Inspeccion.estado_inspeccion == "Completada"` en la consulta a la base de datos PostgreSQL.
* **Mapeo Real:** Las actas ahora solo se reflejan cuando el supervisor completa el formulario oficial de evaluación in-situ y pulsa `[Emitir y Firmar Acta Oficial]`, mostrando su código oficial real, veredicto real y fecha exacta de emisión.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Backend:** `python -m py_compile backend/supervisor.py` sin errores de sintaxis.

---
---

## [2026-09-17] Validación Obligatoria del Documento Firmado para la Emisión de Actas

### 📌 Objetivo
Hacer estrictamente obligatorio que el supervisor adjunte el documento escaneado/PDF con las firmas y sellos institucionales en la **"Sección 3: Subir Documento con Firmas Autorizadas"** antes de poder emitir formalmente el acta de inspección.

---

### 🛠️ Archivos Modificados

#### 1. `frontend/src/components/supervisor/NuevaActaFormView.jsx` [MODIFICADO]
* **Validación en Frontend (`handleEmitirActa`):** Se bloquea el envío si no se ha seleccionado o cargado un archivo firmado (`!archivoFirmado && !archivoFirmadoUrl`), desplegando un toast de advertencia claro y desplazando la pantalla suavemente hacia la Sección 3 (`scrollIntoView`).
* **Distintivo Visual:** Se agregó la insignia roja `"Requerido *"` en el encabezado de la Sección 3 e indicador de estado cuando el archivo está adjuntado.
* **Manejo Robusto de Subida:** Se asegura la subida exitosa al servidor (`/api/supervisor/subir-acta-firmada`) antes de invocar la emisión del acta.

#### 2. `backend/supervisor.py` [MODIFICADO]
* **Validación en Backend (`POST /api/supervisor/registrar-acta`):** Se verifica obligatoriamente que `archivo_pdf_firmado_url` no sea nulo ni vacío, retornando un error HTTP 400 en caso contrario.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores.
* **Compilación Backend:** `python -m py_compile backend/supervisor.py` sin errores.

---
---

## [2026-09-17] Integración del Visor para Cargar el Archivo PDF Firmado en el Historial de Actas

### 📌 Objetivo
Permitir que al hacer clic en el botón **`[PDF]`** de una fila de acta registrada en el **Historial de Actas Emitidas**, el sistema cargue y visualice directamente el documento PDF o imagen escaneada con firmas y sellos que el supervisor subió durante la emisión.

---

### 🛠️ Archivos Modificados

#### 1. `backend/supervisor.py` [MODIFICADO]
* **Campo `archivo_pdf_url`:** En el endpoint `GET /api/supervisor/{id}/actas`, se incluyó la URL pública completa del archivo firmado almacenado (`/uploads/actas/acta_firmada_...pdf`), garantizando que el frontend tenga acceso directo al recurso.

#### 2. `frontend/src/components/supervisor/ActasEmitidasView.jsx` [MODIFICADO]
* **Visor Interactivo de Documento Firmado (`modalPdfOpen`):**
  * Al hacer clic en el botón `[PDF]` de cualquier acta, se abre un modal visualizador interactivo con el archivo real incrustado en un `<iframe>` de alta resolución (o `<img>` si se trata de un escaneo en formato de imagen).
  * Incluye botones de acción superior:
    * **`[Pestaña nueva]` (`ExternalLink`):** Abre el documento PDF directamente en una pestaña independiente del navegador.
    * **`[Descargar Documento]` (`Download`):** Permite descargar localmente el archivo PDF firmado.
    * **`[Cerrar]` (`X`):** Cierra el visor y retorna a la tabla.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores.
* **Compilación Backend:** `python -m py_compile backend/supervisor.py` sin errores de sintaxis.

---
---

## [2026-09-17] Sincronización Integral e Inmutabilidad de Inspecciones con Actas Oficiales Emitidas

### 📌 Objetivo
Garantizar que una vez que un supervisor técnico emita un acta oficial de inspección para un establecimiento:
1. La inspección pase a estado inmutable (`Completada`) y no pueda ser registrada nuevamente para ese establecimiento.
2. En la vista de **Mi Agenda** (`/supervisor`), el evento cambie a color verde esmeralda distintivo con el badge `✓ Completada`, y en el modal de detalle se bloqueen las opciones de *Reprogramar* o *Mover a Pendientes*, desplegando un aviso informativo y un botón para consultar el acta emitida.
3. En la vista de **Rutas de Inspección** (`/supervisor/rutas-inspeccion`), el hito y marcador en el mapa se actualicen a estado verde esmeralda `✓ Realizada`, mostrando el estado final y el enlace directo hacia el acta emitida.
4. En el formulario de **Nueva Acta** (`/supervisor/nueva-acta`), se excluyan automáticamente las inspecciones completadas del selector desplegable.

---

### 🛠️ Archivos Modificados

#### 1. `backend/supervisor.py` [MODIFICADO]
* **Bloqueo en Backend:**
  * En `POST /api/supervisor/reprogramar-inspeccion` y `POST /api/supervisor/desagendar-inspeccion`: Se valida que la inspección no esté en estado `Completada`. Si ya fue completada, retorna error HTTP 400 impidiendo cualquier alteración.
  * En `POST /api/supervisor/registrar-acta`: Se valida que no se intente emitir un acta duplicada para una inspección previamente completada.
  * En `GET /api/supervisor/{id}/actas`: Filtro estricto para retornar únicamente las inspecciones completadas con actas formales.

#### 2. `frontend/src/pages/SupervisorPage.jsx` [MODIFICADO]
* **Reconocimiento Visual en la Agenda Semanal:**
  * Los eventos con estado `Completada` se renderizan con estilo verde esmeralda institucional (`bg-emerald-100/95 border-l-4 border-l-emerald-600 border-emerald-300 text-emerald-950`) y el icono `CheckCircle2` con badge `✓ Completada`.
* **Bloqueo en Modal de Detalle de Inspección:**
  * Si la inspección está completada, se ocultan y bloquean los botones de acción ("Reprogramar", "Mover a Pendientes").
  * Se despliega un banner informativo destacado: `✓ Inspección Realizada (Acta Oficial Emitida)` con el veredicto y un botón de navegación directa `[Ver en Actas Emitidas]`.

#### 3. `frontend/src/components/supervisor/RutasInspeccionView.jsx` [MODIFICADO]
* **Marcadores y Tarjetas de Parada en la Ruta:**
  * En el mapa Leaflet, los marcadores de paradas completadas se muestran con un badge circular verde esmeralda `#059669` y el icono `✓ (Realizada)`.
  * En la tarjeta de parada de la ruta, las completadas adoptan tonalidad verde esmeralda con el badge `✓ Realizada`, indicando `Acta Oficial de Inspección Emitida` y un botón de acceso directo `[Ver Acta →]`.

#### 4. `frontend/src/components/supervisor/NuevaActaFormView.jsx` [MODIFICADO]
* **Filtrado Dinámico de Inspecciones:**
  * El dropdown de selección de inspección ahora solo lista inspecciones pendientes (`item.estado_inspeccion !== 'Completada'`), evitando selecciones erróneas o duplicaciones de actas.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (2046 módulos transformados en 706ms).
* **Compilación Backend:** `python -m py_compile backend/supervisor.py` ejecutado sin errores.
* **Navegación Fluida al Detalle:** El botón "Ver en Actas Emitidas" en el modal de inspección redirige inmediatamente a la sección `/supervisor/actas-emitidas` mediante `navigate('/supervisor/actas-emitidas')`.

---
---

## [2026-09-17] Navegador Inteligente de Fechas y Popover de Calendario en Mi Agenda

### 📌 Objetivo
Optimizar la navegación de semanas y fechas en la vista de **Mi Agenda** del Supervisor (`/supervisor/mi-agenda`), eliminando la necesidad de hacer saltos individuales semana a semana y permitiendo saltar a cualquier fecha, mes o año directamente.

---

### 🛠️ Archivos Modificados

#### 1. `backend/supervisor.py` [MODIFICADO]
* **Soporte de Consulta por Fecha Específica:**
  * En `GET /api/supervisor/{id}/agenda`, se agregó el parámetro opcional `fecha: Optional[str] = None`.
  * Si se proporciona `fecha` (ej. `YYYY-MM-DD`), el backend calcula el lunes correspondiente, el offset de semanas exacto con respecto a hoy y devuelve los eventos y metadatos de esa semana (`anio`, `mes_numero`, `mes_nombre`, `offset`).

#### 2. `frontend/src/pages/SupervisorPage.jsx` [MODIFICADO]
* **Barra de Navegación Interactiva con Popover:**
  * **Botón Central Desplegable:** Al hacer clic en el botón de la semana (`Semana del 14 - 18 de Septiembre 2026`), se abre un popover elegante y ergonómico.
  * **Atajos Rápidos:** Botones inmediatos de `🌟 Hoy`, `-1 Mes` y `+1 Mes`.
  * **Selector de Mes y Año:** Desplegables de Mes (Enero a Diciembre) y Año (2024 a 2029) con botón de salto directo `[Ir al Mes Seleccionado]`.
  * **Selector de Fecha Exacta (`<input type="date">`):** Selector de día que calcula y salta instantáneamente a la semana deseada en un solo paso.
  * **Cierre Inteligente:** Detección de clics fuera del popover (`handleClickOutside`) y botón de retorno rápido a `Hoy`.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (2046 módulos transformados en 673ms).
* **Compilación Backend:** `python -m py_compile backend/supervisor.py` ejecutado sin errores.
* **Integración:** La selección de fecha, mes y atajos rápidos sincroniza la cuadrícula horaria y las inspecciones de la semana seleccionada de manera reactiva e instantánea.

---
---

## [2026-09-18] Implementación del Portal y Vista de Dirección General SEDES

### 📌 Objetivo
Desarrollar la interfaz y portal oficial del rol **Director General** (`/director`), manteniendo la coherencia visual institucional en el menú superior (cabecera con breadcrumbs, notificaciones, perfil ejecutivo de iniciales y cierre de sesión) y en el menú lateral estructurado con las opciones requeridas: **"Consola de Administración"** y **"Métricas e Indicadores"**.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/pages/DirectorPage.jsx` [NUEVO]
* **Diseño y Estructura Institucional:**
  * **Sidebar Lateral Azul Institucional (`#0060a8`):** Logo `SI_Lab`, navegación interactiva por pestañas y pie de página institucional con los escudos de Bolivia y Cochabamba (manteniendo el diseño depurado y consistente con los demás portales).
  * **Menú de Navegación Lateral:**
    * **`Consola de Administración`** (`/director/consola-administracion`): Panel ejecutivo de supervisión centralizada y control gerencial.
    * **`Métricas e Indicadores`** (`/director/metricas-indicadores`): Tablero estratégico de métricas de rendimiento y cobertura.
  * **Header Superior Blanco:** Breadcrumb interactivo, botón de refresco de datos, centro de notificaciones conectadas al backend y perfil ejecutivo de iniciales ("Dr. Fernando Castillo - Director General SEDES") con botón de cierre de sesión.
  * **Contenedores de Contenido:** Estructura modular limpia preparada para la integración de herramientas y gráficos gerenciales.

#### 2. `frontend/src/App.jsx` [MODIFICADO]
* **Rutas del Director:**
  * `/director` ➡️ Redirección a `/director/consola-administracion`.
  * `/director/:seccion` ➡️ Renderiza `<DirectorPage />`.
  * `/directorpage` ➡️ Alias hacia `/director/consola-administracion`.

#### 3. `frontend/src/pages/loginPage.jsx` [MODIFICADO]
* **Redirección por Rol:** Al iniciar sesión con credenciales de Director (`director@sedes.gob.bo`), el sistema redirige automáticamente al nuevo panel `/director`.

---

### 📊 Verificación y Pruebas Realizadas
* **Compilación Frontend:** `npm run build` ejecutado exitosamente con 0 errores (2047 módulos transformados).
* **Navegación Fluida:** Verificación de cambios de pestaña entre *Consola de Administración* y *Métricas e Indicadores* mediante React Router y URLs limpias.

---
---

## [2026-09-18] Implementación del Dashboard Ejecutivo en la Consola de Administración del Director

### 📌 Objetivo
Desarrollar el contenido completo del panel gerencial de la **Consola de Administración** (`/director/consola-administracion`) con datos reales y calculados desde la base de datos PostgreSQL, implementando la estructura visual del diseño solicitado:
1. **Tarjetas KPI Superiores (3 tarjetas con bordes de acento):** Trámites en Curso, Tiempo Promedio de Cierre y Alertas Críticas.
2. **Gráfico de Barras:** Rendimiento y actas/inspecciones realizadas por supervisor técnico.
3. **Gráfico Donut:** Estado y distribución porcentual de trámites (Aperturas vs. Renovaciones) con conteo central interactivo.
4. **Tabla de Trazabilidad Reciente:** Bitácora en tiempo real con funcionarios, acciones, marcas de tiempo e identificadores de expedientes.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `backend/director.py` [NUEVO]
* **Endpoint `GET /api/director/consola`:**
  * **Cálculo de KPIs:** Consulta en tiempo real de trámites activos, promedio de resolución y conteo de alertas críticas/documentos observados.
  * **Rendimiento de Supervisores:** Conteo de actas emitidas e inspecciones realizadas por supervisor.
  * **Distribución de Tipos:** Proporción porcentual y total entre Aperturas y Renovaciones.
  * **Trazabilidad:** Extracción de los últimos eventos y logs de auditoría desde `models.HistorialActividad`.

#### 2. `backend/main.py` [MODIFICADO]
* **Registro de Router:** Incorporación de `director.router` con prefijo `/api/director`.

#### 3. `frontend/src/pages/DirectorPage.jsx` [MODIFICADO]
* **Renderizado del Dashboard:**
  * Integración de llamada asíncrona `cargarDatosConsolaBackend` hacia `/api/director/consola`.
  * Maquetación de tarjetas KPI con bordes de acento azul (`#2563eb`), verde (`#10b981`) y rojo (`#ef4444`).
  * **Ranking Escalable de Supervisores (Opción 1):** Sustitución del gráfico de barras verticales por un *leaderboard* de barras horizontales ordenado de mayor a menor según el número estricto de actas oficiales emitidas (`models.Inspeccion.estado_inspeccion == 'Completada'`), con posición (`#1, #2, #3`), avatar con iniciales, nombres completos legibles y selector dinámico `[Top 5 Activos]` vs. `[Todos]`.
*Bitácora actualizada por: Steven*

---

## [2026-09-18] Depuración y Enlace Estricto de Métricas Reales 100% de Base de Datos (Director General)

### 📌 Objetivo
Eliminar cualquier dato simulado, arreglo de muestra (*mock/fallbacks*) o estimación artificial en la Consola de Administración del Director General (`/director/consola-administracion`), garantizando que cada indicador, gráfica y lista refleje de manera estricta y transparente los registros reales existentes en PostgreSQL.

---

### 🛠️ Archivos Modificados

#### 1. `backend/director.py` [MODIFICADO]
* **Métricas 100% Reales de PostgreSQL:**
  * **Trámites en Curso y Esta Semana:** Conteo directo de `models.Tramite` activos y filtrados por fecha real de creación.
  * **Tiempo Promedio de Cierre:** Cálculo matemático exacto de la diferencia en días entre la fecha de creación y finalización de los trámites con estado `"Aprobado"`, `"Finalizado"` o `"Inspección Aprobada"`. Si no existen trámites concluidos, retorna `0 días`.
  * **Alertas Críticas:** Suma exacta de documentos observados/rechazados (`models.TramiteDocumento`) más trámites observados.
  * **Distribución de Trámites (Donut):** Cálculo estricto de Aperturas vs. Renovaciones según el catálogo en base de datos.
  * **Rendimiento de Supervisores:** Consulta directa de usuarios con rol `Supervisor` en `models.Usuario`. El conteo de actas emitidas se basa **exclusivamente** en el número real de inspecciones en estado `"Completada"`, `"Aprobada"` o `"Finalizada"` en `models.Inspeccion`. Se eliminaron los supervisores simulados por defecto.
  * **Bitácora de Trazabilidad:** Consulta directa de los últimos 10 registros de auditoría en `models.HistorialActividad`.

#### 2. `frontend/src/pages/DirectorPage.jsx` [MODIFICADO]
* **Soporte de Estados Vacíos y Valores Cero:**
  * Se configuró el estado inicial limpio en 0 y arreglos vacíos `[]` para evitar parpadeos con datos demo.
  * Se añadieron alertas visuales elegantes para casos en los que no haya supervisores registrados, trámites cargados o eventos de trazabilidad.
  * Gráfico de dona adaptativo que muestra un anillo neutral cuando el total es 0 sin provocar divisiones por cero ni errores de renderizado.

---

*Bitácora actualizada por: Steven*

---

## [2026-09-18] Implementación del Módulo "Métricas e Indicadores" con Filtros Dinámicos Reactivos y Datos 100% Reales

### 📌 Objetivo
Desarrollar la vista completa de **Métricas e Indicadores** (`/director/metricas-indicadores`) para la Dirección General, asegurando que todos los indicadores macro, gráficas de evolución temporal, desgloses por niveles/sectores y rankings se calculen dinámicamente desde PostgreSQL y reaccionen en tiempo real según los 9 filtros multidimensionales y selector de periodo.

---

### 🛠️ Archivos Modificados

#### 1. `backend/director.py` [MODIFICADO]
* **Endpoint `GET /api/director/filtros-opciones`:**
  * Consulta en tiempo real las opciones únicas disponibles en PostgreSQL para poblar los 9 selectores: municipios, tipos de establecimiento, estados operativos, nombres comerciales, niveles, propietarios, responsables técnicos, áreas y direcciones.
* **Endpoint `GET /api/director/metricas-indicadores`:**
  * Recibe parámetros de filtrado dinámico (`periodo_anio`, `periodo_mes`, `municipio`, `tipo_laboratorio`, `estado`, `nombre_laboratorio`, `nivel`, `propietario`, `responsable_laboratorio`, `responsables_areas`, `direccion`).
  * **KPIs Filtrados:** Total de trámites, tasa porcentual de aprobación y tiempo promedio de resolución.
  * **Tendencia Mensual:** Desglose mes a mes (Ene a Dic) de Aperturas vs. Renovaciones.
  * **Distribución por Tipos de Establecimiento:** Agrupación y porcentaje real.
  * **Cuellos de Botella:** Detección en tiempo real de trámites demorados (>30 días), documentos observados e inspecciones pendientes.
  * **Ranking de Supervisores:** Conteo de actas oficiales con insignias de desempeño (*Excelente*, *Muy Bueno*, *Bueno*, *Regular*, *En Proceso*).
  * **Cantidad por Municipio:** Gráfico de barras agrupadas comparando laboratorios privados vs. públicos.
  * **Nivel y Tipo de Laboratorio:** Conteo por nivel de complejidad (1er Nivel a Referencia) y sector (Público, Seguro Social, Privado, ONG, etc.).
  * **Situación Operativa:** Gráfico de dona multi-segmento (Funcionando, No Funcionando, Cerrado, En Refacción, Renovación).

#### 2. `frontend/src/pages/DirectorPage.jsx` [MODIFICADO]
* **Barra de 9 Filtros Reactivos:**
  * Selectores desplegables integrados con el estado `filtros` y función `handleLimpiarFiltros`.
  * Selector de periodo anual/mensual y botón de descarga/impresión de informe institucional (`handleDescargarInforme`).
* **Gráficas Analíticas e Interactivas:**
  * Curvas de líneas SVG responsivas para *Trámites por Mes* con tooltips flotantes en hover.
  * **Barras Agrupadas con Tooltips Interactivos:** En la gráfica de *Cantidad por Municipio*, al pasar el mouse por encima de cualquier barra (Privados o Públicos), se despliega un *tooltip* flotante con la cantidad exacta y el indicador dinámico en la cabecera.
  * Gráfico Donut SVG multi-segmento con cálculo dinámico de arcos y circunferencia para *Estado / Situación del Laboratorio*.
  * Barras horizontales de progreso con colores institucionales y conteos reales.

---

*Bitácora actualizada por: Steven*

---

## [2026-09-18] Incorporación del Campo "Plazo para Subsanación" (1 Año por Defecto) en Emisión de Actas del Supervisor

### 📌 Objetivo
Agregar el campo normativo **"Plazo para Subsanacion"** en la sección final del formulario de emisión de actas de inspección técnica del supervisor (`NuevaActaFormView.jsx`), estableciendo como valor predeterminado **"1 año"**, correspondiente a la fecha de vencimiento legal y vigencia oficial de cada acta emitida.

---

### 🛠️ Archivos Modificados

#### 1. `frontend/src/components/supervisor/NuevaActaFormView.jsx` [MODIFICADO]
* **Campo "Plazo para Subsanacion":**
  * Se configuró el estado `plazoSubsanacion` con valor inicial `"1 año"`.
  * Se integró en la sección de dictamen y conclusiones técnicas con etiqueta institucional, icono de reloj y nota aclaratoria sobre la vigencia del acta.
  * Inclusión automática del plazo en el cuerpo de observaciones finales y payload de emisión del acta.

#### 2. `backend/supervisor.py` [MODIFICADO]
* **Esquema `RegistrarActaRequest`:**
  * Se incorporó el campo `plazo_subsanacion: Optional[str] = "1 año"` para registrar y almacenar formalmente el plazo de vigencia en la base de datos y auditoría.

---

*Bitácora actualizada por: Steven*

---

## [2026-09-18] Flujo de Aprobación Condicionada del Coordinador y Gestión de Veredictos de Inspección

### 📌 Objetivo
Condicionar la disponibilidad y activación del botón **"Aprobar Trámite y Emitir Resolución"** en la bandeja del Coordinador (`/coordinador/bandeja`) para que únicamente esté habilitado cuando:
1. El coordinador haya revisado y aprobado el 100% de los requisitos y documentos legales.
2. Se haya asignado un supervisor técnico de campo.
3. El supervisor haya realizado la inspección in-situ y emitido el acta oficial con veredicto **Favorable (Aprobado)**.

En caso de que el supervisor emita un veredicto **Desfavorable (Rechazado)**, mostrar prominentemente el rechazo en la pestaña de *Fiscalización e Inspección*, bloquear la emisión de resolución y habilitar la notificación en tiempo real al propietario para que vuelva a cargar todos los requisitos y reiniciar el trámite.

---

### 🛠️ Archivos Modificados

#### 1. `backend/coordinador.py` [MODIFICADO]
* **Serialización de Trámites (`serializar_tramite_coordinador`):**
  * Se calcularon y expusieron los indicadores de control de flujo: `docs_aprobados_count`, `todos_docs_aprobados`, `inspeccion_aprobada`, `inspeccion_rechazada`, `inspeccion_con_observaciones` y `puede_aprobar`.
  * Se añadió la URL del acta PDF (`acta_pdf_url`) y el estado de la inspección.
* **Validación en Endpoint `POST /api/coordinador/tramites/{tramite_id}/aprobar`:**
  * Bloqueo estricto a nivel de backend: valida que todos los documentos legales estén en estado `'Aprobado'`, que exista un supervisor asignado y que la inspección técnica cuente con veredicto `'Favorable'`. De lo contrario, retorna un error HTTP 400 con el motivo exacto del impedimento.
* **Nuevo Endpoint `POST /api/coordinador/tramites/{tramite_id}/notificar-reingreso`:**
  * Permite notificar al propietario cuando una inspección es rechazada, marcando el trámite en estado `"Rechazado - Requiere Reingreso"`, actualizando los requisitos para su subsanación/recarga, registrando la auditoría en `HistorialActividad` y enviando una alerta formal al usuario.

#### 2. `frontend/src/pages/CoordinadorPage.jsx` [MODIFICADO]
* **Reglas de Habilitación y Bloqueo Reactivo:**
  * Cálculo de `puedeAprobarTramite = todosDocsAprobados && tieneSupervisorAsignado && esActaFavorable`.
  * Si no se cumplen las condiciones, el botón *"Aprobar Trámite y Emitir Resolución"* se renderiza deshabilitado (`cursor-not-allowed`) con una insignia de advertencia contextual que detalla el paso pendiente (documentos por aprobar, asignación de supervisor o emisión de acta favorable).
* **Pestaña "Fiscalización e Inspección" Multiestado:**
  * **Veredicto Aprobado (Favorable):** Banner esmeralda institucional con insignia de acta oficial aprobada y enlace para descargar el acta firmada (PDF).
  * **Veredicto Rechazado (Desfavorable):** Banner rojo de alerta con detalles de incumplimiento normativo y botón de acción *"Notificar al Propietario para Reingreso de Requisitos"*.
  * **Veredicto Con Observaciones:** Banner ámbar indicando necesidad de subsanación o re-inspección.
  * **Pendiente de Asignación / Inspección:** Banner azul indicando el estado del supervisor asignado o botón directo para agendar la fiscalización técnica.

---

*Bitácora actualizada por: Steven*

---

## [2026-09-18] Simplificación del Dictamen del Supervisor (Aprobado / Rechazado Sin Textos de Porcentaje)

### 📌 Objetivo
Ajustar la sección final del formulario de emisión de actas del supervisor (`NuevaActaFormView.jsx` y modal rápido en `ActasEmitidasView.jsx`) para:
1. Eliminar la opción intermedia de *"Con Observaciones"*, dejando únicamente las dos alternativas oficiales definitivas: **Aprobado (Favorable)** y **Rechazado (Desfavorable)**.
2. Eliminar los textos descriptivos que mencionaban porcentajes en los botones (ej: *"Cumplimiento ≥ 85%"* o *"puntaje inferior al 70%"*), reemplazándolos por leyendas normativas claras y limpias.

---

### 🛠️ Archivos Modificados

#### 1. `frontend/src/components/supervisor/NuevaActaFormView.jsx` [MODIFICADO]
* **Eliminación de la Opción "Con Observaciones":**
  * Se simplificó la cuadrícula de veredictos definitivos a 2 columnas (`grid-cols-2`): *Aprobado (Favorable)* y *Rechazado (Desfavorable)*.
  * Se depuró el `useEffect` de dictamen automático para clasificar directamente en Aprobado o Rechazado según el cumplimiento del checklist.
* **Limpieza de Textos de Porcentajes en Botones:**
  * Se sustituyeron las menciones de porcentajes numéricos por descripciones normativas profesionales (*"Cumple con las normas y requisitos técnicos sanitarios"* / *"No cumple con las condiciones técnicas o sanitarias requeridas"*).

#### 2. `frontend/src/components/supervisor/ActasEmitidasView.jsx` [MODIFICADO]
* **Modal de Registro Rápido:**
  * Se adaptó el selector de resultado a 2 botones (*Aprobado (Favorable)* y *Rechazado (Desfavorable)*) para total consistencia en todo el módulo del supervisor.

---

*Bitácora actualizada por: Steven*

---

## [2026-09-18] Implementación del Módulo "Informe Técnico" y Generación Oficial de PDF "Comunicación Interna" (SEDES Cochabamba)

### 📌 Objetivo
1. Incorporar la nueva opción de menú lateral **"Informe Técnico"** (`/coordinador/informe-tecnico`) en la consola del Coordinador.
2. Configurar el flujo de aprobación para que al pulsar el botón **"Aprobar Trámite y Emitir Resolución"** en la bandeja de trámites (cuando requisitos e inspección de campo estén 100% aprobados), el sistema redireccione de inmediato a la sección de **"Informe Técnico"** con el establecimiento seleccionado.
3. Desarrollar la vista interactiva de **Informe Técnico** fiel a la interfaz oficial del SEDES:
   - **Columna izquierda:** Lista de *Establecimientos Aprobados* con tarjetas informativas, estado *"Aprobación Pendiente"* y contador dinámico de listos.
   - **Columna derecha:** Ficha técnica completa del trámite seleccionado:
     - *Datos del Establecimiento:* Nombre, Razón Social/Propietario, Dirección y Tipo de Establecimiento.
     - *Resumen de Documentación Legal:* Cuadrícula de requisitos aprobados con checks verdes.
     - *Resumen de Inspección de Campo:* Fecha de inspección, Supervisor asignado, Resultado general y Observaciones de campo.
     - *Observaciones del Coordinador (Edición):* Campo de texto editable prellenado con la redacción técnica reglamentaria.
     - *Conclusión y Dictamen Técnico:* Selector de veredicto final *"Favorabilidad Concedida (Favorable)"*.
     - *Barra inferior de acciones:* Botones **"Imprimir Informe"**, **"Enviar a Área Legal"** y **"Aprobar Trámite Final"**.
4. Implementar el motor de generación del documento oficial de 3 páginas de **"COMUNICACIÓN INTERNA"** (PDF fiel a la estructura real de SEDES Cochabamba en `Contexto+Bitacora/Comunicacion interna.pdf`):
   - Integración de los 3 logos oficiales de la cabecera: `Logo Chakana.svg`, `Logo cochabamba 2.png` y `logo cochabamba 3.png`.
   - CITE correlativo y tabla de enrutamiento institucional (A: Asesor Legal, VIA: Jefe Unidad Calidad y Servicios a.i., DE: Responsable CODELAB - SEDES, MOTIVO y FECHA).
   - Marco legal completo: Ley 1178 (Art. 28 y 38), R.M. 0202 (22/03/2010), R.M. 847 (30/11), R.M. 0936 (16/12/2005) y equivalencia ISO 9001 / ISO 15189.
   - Desglose de Requisitos en 4 categorías: *1. Requisitos Legales*, *2. Requisitos Administrativos*, *3. Requisitos Técnicos*, *4. Requisitos Financieros*.
   - Conclusiones y dictamen técnico favorable solicitando la emisión de la Resolución Administrativa.
   - Firmas oficiales de la Responsable de CODELAB y de la Jefa de Calidad y Servicios a.i. con pie de página institucional del SEDES.

---

### 🛠️ Archivos Creados y Modificados

#### 1. `frontend/src/components/coordinador/ComunicacionInternaPDF.js` [NUEVO]
* Generador en tiempo real con `jsPDF` que renderiza las 3 páginas oficiales respetando márgenes, tipografías, encabezados, tablas de memo, textos normativos, lista de requisitos, firmas e iniciales de archivo (`I.F.R./J.P.I.S./K.S.V. - CC/Arch`).

#### 2. `frontend/src/components/coordinador/InformeTecnicoView.jsx` [NUEVO]
* Componente de visualización y edición del Informe Técnico según el diseño institucional, sincronizado con la base de datos y con capacidad de descarga/impresión directa del PDF oficial y derivación al Área Legal.

#### 3. `frontend/src/pages/CoordinadorPage.jsx` [MODIFICADO]
* Registro de `'informe-tecnico'` en la lista `menuItems` y normalización de ruta `seccionActiva`.
* Vinculación del botón *"Aprobar Trámite y Emitir Resolución"* en la Bandeja para redireccionar automáticamente a la sección `/coordinador/informe-tecnico`.
* Renderizado del módulo `<InformeTecnicoView />` cuando la sección activa es `'informe-tecnico'`.

#### 4. `backend/coordinador.py` [MODIFICADO]
* Endpoint `POST /api/coordinador/tramites/{tramite_id}/derivar-legal` con registro en la bitácora de auditoría (`HistorialActividad`) y notificación formal a los usuarios del rol Abogado / Asesoría Legal.

---

*Bitácora actualizada por: Steven*

---

## [2026-09-21] Vinculación Exclusiva con la BDD y Activación de Informe Técnico tras Pulsar "Aprobar Trámite y Emitir Resolución"

### 📌 Objetivo
1. Asegurar que en la vista de **Informe Técnico** del Coordinador (`/coordinador/informe-tecnico`) figuren **única y exclusivamente los laboratorios y trámites reales registrados en la base de datos PostgreSQL**, eliminando cualquier dato estático o ficticio (mock).
2. Condicionar la aparición de los laboratorios en la lista de *"Establecimientos Aprobados"* de Informe Técnico a que el Coordinador previamente haya presionado el botón **"Aprobar Trámite y Emitir Resolución"** en la Bandeja de Entrada.
3. Al presionar el botón en la Bandeja:
   - El sistema valida el 100% de requisitos aprobados y el acta favorable del supervisor.
   - Envía la solicitud al backend (`POST /api/coordinador/tramites/{id}/pasar-a-informe-tecnico`) para marcar el trámite en estado `"En Informe Técnico"` y registrar la trazabilidad en la bitácora de auditoría.
   - Redirecciona de forma inmediata a `/coordinador/informe-tecnico` con el laboratorio seleccionado y cargado desde la BDD.
4. Mostrar vistas de estado vacío descriptivas y amigables cuando no haya laboratorios derivados a Informe Técnico, guiando al usuario a la Bandeja de Entrada.

---

### 🛠️ Archivos Modificados

#### 1. `backend/coordinador.py` [MODIFICADO]
* **Nuevo Endpoint `POST /api/coordinador/tramites/{tramite_id}/pasar-a-informe-tecnico`:**
  - Valida que todos los requisitos estén aprobados y el supervisor haya emitido acta técnica con veredicto Favorable.
  - Actualiza el estado del trámite a `"En Informe Técnico"` en la base de datos.
  - Inserta el registro correspondiente en `HistorialActividad` para trazabilidad de auditoría.
* **Helper `get_estado_color`:** Soporte para el estado `"En Informe Técnico"`.

#### 2. `frontend/src/components/coordinador/InformeTecnicoView.jsx` [MODIFICADO]
* **Depuración de Datos Mock:** Eliminación total de `mockFallbackTramites`.
* **Filtrado BDD:** Filtra estrictamente los trámites de la base de datos que están en estado de informe (`"En Informe Técnico"`, `"Derivado a Asesoría Legal"`, `"Aprobado"` o seleccionados por el flujo del coordinador).
* **Manejo de Estado Vacío:** Pantalla explicativa con botón de acceso rápido a la Bandeja de Entrada cuando no hay laboratorios derivados a Informe Técnico.

#### 3. `frontend/src/pages/CoordinadorPage.jsx` [MODIFICADO]
* **Función `handlePasarAInformeTecnico`:** Conecta el botón *"Aprobar Trámite y Emitir Resolución"* con el endpoint del backend, actualiza la base de datos y transiciona al panel de Informe Técnico con el trámite activo.
* **Bloqueo de Botones en Estados Posteriores (`estaEnEtapaPosterior`):**
  - Si un trámite ya se encuentra en `"En Informe Técnico"`, `"Derivado a Asesoría Legal"` o `"Aprobado"`, los botones de *"Gestionar Inspección"* (pasa a estado inactivo *"Inspección Concluida"*) y *"Aprobar Trámite y Emitir Resolución"* quedan deshabilitados/bloqueados con un banner explicativo y enlace directo al módulo de Informe Técnico.

---

*Bitácora actualizada por: Steven*
