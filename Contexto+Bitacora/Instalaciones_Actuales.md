# Reporte de Instalaciones y Configuración del Proyecto SEDES

> **Última actualización:** 28 de Agosto de 2026  
> **Estado del Sistema:** Operativo y Verificado (Docker Compose)

---

## 1. Resumen de Arquitectura General

El proyecto **SEDES** está estructurado como una aplicación web full-stack containerizada mediante **Docker Compose**, compuesta por 3 capas principales:

```
[ Frontend: React 19 + Vite 8 + Tailwind CSS 4 + React Router 7 ] (Puerto 5173)
                                 │
                                 ▼
         [ Backend: Python 3.10 + FastAPI + SQLAlchemy ] (Puerto 8000)
                                 │
                                 ▼
             [ Base de Datos: PostgreSQL 15 + PostGIS 3.3 ] (Puerto 5432)
```

---

## 2. Infraestructura y Orquestación (Docker)

La orquestación de la aplicación se gestiona desde el archivo [`docker-compose.yml`](file:///c:/Users/ASUS/Music/SEDES/docker-compose.yml).

### 2.1 Servicios Configurados

| Servicio | Imagen / Build | Puerto Host : Contenedor | Volumen / Persistencia |
| :--- | :--- | :--- | :--- |
| **`db`** | `postgis/postgis:15-3.3` | `5432:5432` | `postgres_data` -> `/var/lib/postgresql/data` |
| **`backend`** | Build `./backend` (`python:3.10-slim`) | `8000:8000` | `./backend` -> `/app` |
| **`frontend`** | Build `./frontend` (`node:20-alpine`) | `5173:5173` | `./frontend` -> `/app`, `/app/node_modules` |

---

## 3. Frontend (React + Vite)

Ubicación del código fuente: [`frontend/`](file:///c:/Users/ASUS/Music/SEDES/frontend)  
Configurado en: [`package.json`](file:///c:/Users/ASUS/Music/SEDES/frontend/package.json), [`Dockerfile`](file:///c:/Users/ASUS/Music/SEDES/frontend/Dockerfile), y [`vite.config.js`](file:///c:/Users/ASUS/Music/SEDES/frontend/vite.config.js).

### 3.1 Entorno de Ejecución
* **Runtime:** Node.js v20 (Alpine Linux: `node:20-alpine`)
* **Servidor Dev:** Vite v8.2.2 (con soporte para Hot Module Replacement y `host: 0.0.0.0`)

### 3.2 Dependencias Principales (`dependencies`)
* **`react`** (`^19.2.8`): Librería principal de interfaz de usuario (React 19).
* **`react-dom`** (`^19.2.8`): Renderizado de React en el DOM.
* **`react-router-dom`** (`^7.2.0`): Enrutamiento dinámico SPA para navegación entre páginas.

### 3.3 Dependencias de Desarrollo (`devDependencies`)
* **`vite`** (`^8.2.2`): Bundler y servidor de desarrollo ultrarrápido.
* **`tailwindcss`** (`^4.0.9`): Framework de estilos utility-first (Tailwind CSS v4).
* **`@tailwindcss/vite`** (`^4.0.9`): Plugin oficial de integración de Tailwind v4 con Vite.
* **`@vitejs/plugin-react`** (`^6.1.0`): Plugin de React para Vite.
* **`eslint`** (`^10.9.0`) & **`@eslint/js`** (`^10.0.1`): Linter para calidad y estándares de código.
* **`eslint-plugin-react-hooks`** (`^7.1.1`) & **`eslint-plugin-react-refresh`** (`^0.5.4`): Reglas de linteo para React Hooks y Fast Refresh.

---

## 4. Backend (Python + FastAPI)

Ubicación del código fuente: [`backend/`](file:///c:/Users/ASUS/Music/SEDES/backend)  
Configurado en: [`requirements.txt`](file:///c:/Users/ASUS/Music/SEDES/backend/requirements.txt) y [`Dockerfile`](file:///c:/Users/ASUS/Music/SEDES/backend/Dockerfile).

### 4.1 Entorno de Ejecución
* **Runtime:** Python 3.10 (Debian Slim: `python:3.10-slim`)
* **Servidor ASGI:** Uvicorn con `--reload` habilitado para desarrollo.

### 4.2 Paquetes Instalados (`requirements.txt`)
* **`fastapi`**: Framework web de alto rendimiento para creación de APIs REST.
* **`uvicorn[standard]`**: Servidor ASGI rápido basado en `uvloop` y `httptools`.
* **`SQLAlchemy`**: ORM (Object-Relational Mapping) para interacción con la base de datos.
* **`GeoAlchemy2`**: Extensión de SQLAlchemy para trabajar con tipos de datos espaciales y geometría PostGIS.
* **`psycopg2-binary`**: Driver de conexión PostgreSQL para Python.

---

## 5. Base de Datos Geoespacial (PostGIS)

Configurado en: [`docker-compose.yml`](file:///c:/Users/ASUS/Music/SEDES/docker-compose.yml).

* **Motor:** PostgreSQL 15 con extensión geoespacial **PostGIS 3.3**.
* **Contenedor:** `postgis/postgis:15-3.3`
* **Credenciales por defecto:**
  * **Usuario:** `admin`
  * **Contraseña:** `password123`
  * **Nombre de Base de Datos:** `sedes_db`
  * **Puerto Host:** `5432`

---

## 6. Comandos Principales de Gestión

### Iniciar todos los servicios
```bash
docker-compose up -d --build
```

### Ver logs en tiempo real
```bash
docker-compose logs -f
```

### Detener los servicios y limpiar volúmenes
```bash
docker-compose down -v
```
