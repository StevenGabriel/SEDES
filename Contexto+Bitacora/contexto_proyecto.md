
# Documento de Contexto y Alcance: Sistema SEDES Lab

## 1. Visión General del Proyecto

El proyecto **SEDES Lab** es una plataforma web centralizada diseñada para la digitalización, automatización y control de los trámites de habilitación, apertura y renovación de laboratorios clínicos y establecimientos de salud bajo la jurisdicción del **SEDES Cochabamba**.

El objetivo principal es eliminar la burocracia del papel, transparentar los tiempos de revisión y proporcionar herramientas georreferenciadas tanto para los funcionarios públicos como para la ciudadanía.

---

## 2. Actores del Sistema (Roles y Permisos)

El sistema soporta una arquitectura multi-rol, donde cada actor tiene vistas y flujos de trabajo específicos:

1. **Público General (Sin autenticación):**

   * Acceso al portal informativo y normativas.
   * Visualización de un mapa georreferenciado con los laboratorios habilitados.
   * Búsqueda de laboratorios por nombre, especialidad y estado operativo.
2. **Propietario / Regente (Solicitante):**

   * Creación de cuenta y registro de sus establecimientos.
   * Inicio de trámites de apertura o renovación 100% digitales.
   * Carga de requisitos (Legales, Administrativos, Técnicos).
   * Recepción de notificaciones automáticas (alertas de vencimiento de licencias) y subsanación de observaciones.
3. **Coordinador SEDES:**

   * Bandeja de entrada para revisión de documentación (validación de PDFs, licencias, etc.).
   * Asignación inteligente de inspecciones a los supervisores de campo basados en su carga de trabajo.
   * Emisión de dictámenes finales (Aprobado, Observado, Rechazado).
4. **Supervisor Técnico / de Campo:**

   * Visualización de su agenda semanal y rutas de inspección optimizadas en mapa.
   * Llenado de actas de inspección in-situ de forma digital.
   * Emisión de citaciones e infracciones con carga de evidencia (fotos).
5. **Director General / Gerencia:**

   * Acceso al Dashboard (Panel de Control).
   * Visualización de métricas en tiempo real: tasa de aprobación, tiempos promedio de resolución, desempeño de supervisores y estadísticas por municipio.
6. **Administrador del Sistema:**

   * Gestión de roles y permisos.
   * Configuración dinámica de los requisitos para los trámites (agregar o quitar documentos obligatorios).

---

## 3. Arquitectura y Stack Tecnológico

El sistema está diseñado bajo una arquitectura moderna basada en contenedores (Docker), garantizando escalabilidad y fácil despliegue.

* **Frontend (Interfaz de Usuario):**

  * **Framework:** React.js optimizado con Vite.
  * **Estilos:** Tailwind CSS (diseño responsivo y alineado a los colores institucionales).
  * **Mapas:** React-Leaflet (renderizado de mapas interactivos y rutas).
  * **Enrutamiento:** React Router.
* **Backend (Lógica de Negocios y API):**

  * **Framework:** FastAPI (Python) para alto rendimiento y documentación automática (Swagger).
  * **ORM:** SQLAlchemy y GeoAlchemy2 para manejo de datos espaciales.
  * **Generación de Documentos:** ReportLab / WeasyPrint (para actas y certificados en PDF).
  * **Seguridad:** PyJWT y Passlib para autenticación basada en tokens.
* **Base de Datos:**

  * **Motor:** PostgreSQL.
  * **Extensión Espacial:** PostGIS (esencial para almacenar coordenadas y realizar cálculos de distancia/rutas de supervisores).
* **Orquestación:**

  * Docker y Docker Compose.

---

## 4. Flujo de Trabajo Principal (Workflow del Trámite)

1. **Solicitud:** El Propietario llena el formulario digital, ubica su laboratorio en el mapa y sube los documentos requeridos.
2. **Revisión de Gabinete:** El Coordinador revisa los documentos. Si hay errores, devuelve el trámite para subsanación. Si todo está correcto, asigna un Supervisor.
3. **Inspección de Campo:** El Supervisor visita el laboratorio guiado por la ruta GPS, llena el acta digital (aprobando o emitiendo observaciones físicas).
4. **Resolución:** Si la inspección es exitosa, el sistema emite el certificado/resolución de habilitación.
5. **Vigilancia:** El sistema entra en modo monitoreo, emitiendo alertas a los 11 y 12 meses para iniciar la renovación.
