# Bitácora de Avance - Juan

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
