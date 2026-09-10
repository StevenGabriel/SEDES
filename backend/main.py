from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from database import get_db, engine
from init_db import init_database
import models
import auth
import establecimientos
import admin_usuarios
import requisitos
import coordinador
import tramites
import notificaciones

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Inicializar PostGIS, crear tablas y poblar datos base al arrancar
    try:
        init_database()
    except Exception as e:
        print(f"Advertencia al inicializar la base de datos: {e}")
    yield

app = FastAPI(
    title="API SEDES Lab",
    description="Backend oficial del Sistema de Gestión y Trámites de Laboratorios - SEDES Cochabamba",
    version="1.0.0",
    lifespan=lifespan
)

# Habilitar CORS para permitir peticiones desde el frontend (React + Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
import os

# Crear directorio de subidas si no existe y servir archivos estáticos
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Incluir Rutas del Sistema
app.include_router(auth.router)
app.include_router(establecimientos.router)
app.include_router(admin_usuarios.router)
app.include_router(requisitos.router)
app.include_router(coordinador.router)
app.include_router(tramites.router)
app.include_router(notificaciones.router)

@app.get("/", tags=["Diagnóstico"])
def leer_raiz():
    return {
        "sistema": "SEDES Lab - API Backend",
        "estado": "Online",
        "mensaje": "¡El backend del SEDES está funcionando perfectamente!"
    }

@app.get("/health/db", tags=["Diagnóstico"])
def verificar_base_datos(db: Session = Depends(get_db)):
    try:
        # Verificar conexión y versión de PostGIS
        postgis_ver = db.execute(text("SELECT PostGIS_Version();")).scalar()
        roles_count = db.query(models.Role).count()
        requisitos_count = db.query(models.CatalogoRequisito).count()
        
        return {
            "status": "Conectado",
            "base_de_datos": "PostgreSQL + PostGIS",
            "postgis_version": postgis_ver,
            "roles_registrados": roles_count,
            "requisitos_catalogo": requisitos_count
        }
    except Exception as e:
        return {
            "status": "Error",
            "detalle": str(e)
        }