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
*Bitácora actualizada por: Steven*
