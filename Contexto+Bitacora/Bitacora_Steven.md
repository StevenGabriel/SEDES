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
*Bitácora actualizada por: Steven*



