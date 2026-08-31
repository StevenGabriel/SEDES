# Bitácora de Avance - Juan

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

### 📂 Estructura del Enrutamiento Actualizada

```text
Ruta Principal:     http://localhost:5173/            (LandingPage)
Ruta Alias:         http://localhost:5173/landingpage (LandingPage)
Ruta Requisitos:    http://localhost:5173/requisitos  (RequisitosPage)
Ruta Login:         http://localhost:5173/login       (LoginPage)
Ruta Alias Login:   http://localhost:5173/loginpage   (LoginPage)
```

---

### 🎨 Tecnologías y Estilos Aplicados
* **React 19 & React Router 7:** Manejo de estado local con `useState`, navegación programática con `useNavigate` y rutas SPA.
* **Tailwind CSS v4:** Maquetación responsiva con grid/flexbox (*mobile-first* y *split-screen* en pantallas grandes), paleta de colores institucional del SEDES y efectos de elevación (*drop-shadow*, *transitions*, *backdrop-blur*).
* **Lucide React:** Iconografía vectorial institucional (`FlaskConical`, `Eye`, `EyeOff`, `Check`, `ArrowLeft`).

---
*Bitácora actualizada por: Juan*
