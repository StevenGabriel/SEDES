# SEDES - Práctica Profesional 2026-1

Sistema de gestión e información geográfica para el SEDES.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React 19, Vite, Tailwind CSS
- **Backend:** Python 3.10, FastAPI, SQLAlchemy, Uvicorn
- **Base de Datos:** PostgreSQL 15 con extensión PostGIS
- **Contenerización:** Docker & Docker Compose

---

## 🚀 Pasos para Ejecutar el Proyecto

### Opción 1: Ejecución con Docker Compose (Recomendado)

La forma más sencilla de ejecutar todo el stack (Frontend, Backend y Base de Datos PostGIS) es utilizando Docker Compose.

#### Pre-requisitos:

- Tener instalado [Docker Desktop](https://www.docker.com/products/docker-desktop/).

#### Instrucciones:

1. **Clonar o abrir la carpeta del repositorio:**

   ```bash
   cd SEDES
   ```
2. **Levantar los servicios:**
   Ejecuta el siguiente comando en la raíz del proyecto para construir y levantar los contenedores:

   ```bash
   docker compose up --build
   ```

   *(En versiones anteriores de Docker, usa `docker-compose up --build`)*

   > **Tip:** Para ejecutar en segundo plano (modo desatendido / detached):
   >
   > ```bash
   > docker compose up -d --build
   > ```
   >
3. **Acceder a los servicios:**

   - 🌐 **Frontend (Vite + React):** [http://localhost:5173/](http://localhost:5173/)
   - ⚙️ **Backend (FastAPI):** [http://localhost:8000/](http://localhost:8000/)
   - 📖 **Documentación Interactiva (Swagger API):** [http://localhost:8000/docs](http://localhost:8000/docs)
   - 🗄️ **Base de Datos (PostGIS):** `localhost:5432`
     - **Usuario:** `admin`
     - **Contraseña:** `password123`
     - **Base de Datos:** `sedes_db`
4. **Detener la aplicación:**
   Para detener los contenedores en ejecución:

   ```bash
   docker compose down
   ```

---

### Opción 2: Ejecución Manual Local (Sin Docker)

Si prefieres ejecutar el frontend y el backend en tu entorno local de desarrollo:

#### Pre-requisitos:

- **Node.js** (v20 o superior) y **npm**
- **Python** (v3.10 o superior)
- Servidor **PostgreSQL** con PostGIS activo en el puerto `5432`

---

#### 1. Configurar y Ejecutar el Backend

1. Navega a la carpeta `backend`:

   ```bash
   cd backend
   ```
2. *(Opcional)* Crea y activa un entorno virtual de Python:

   - **Windows:**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Linux/macOS:**
     ```bash
     source venv/bin/activate
     ```
3. Instala las dependencias requeridas:

   ```bash
   pip install -r requirements.txt
   ```
4. Inicia el servidor del backend:

   ```bash
   uvicorn main:app --reload --port 8000
   ```

   El backend estará accesible en `http://localhost:8000`.

---

#### 2. Configurar y Ejecutar el Frontend

1. Abre otra terminal y navega a la carpeta `frontend`:

   ```bash
   cd frontend
   ```
2. Instala las dependencias del proyecto:

   ```bash
   npm install
   ```
3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   El frontend estará accesible en `http://localhost:5173`.

---

## 📋 Comandos Útiles de Docker

- **Ver logs de los servicios en tiempo real:**
  ```bash
  docker compose logs -f
  ```
- **Ver logs de un servicio específico (ej. backend):**
  ```bash
  docker compose logs -f backend
  ```
- **Reiniciar los contenedores:**
  ```bash
  docker compose restart
  ```
- **Eliminar contenedores y volúmenes de datos:**
  ```bash
  docker compose down -v
  ```
