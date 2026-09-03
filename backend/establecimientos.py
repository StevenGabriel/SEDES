import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from geoalchemy2.functions import ST_X, ST_Y
import uuid

from database import get_db
import models
import schemas

router = APIRouter(prefix="/api/establecimientos", tags=["Establecimientos y Laboratorios"])

def serializar_establecimiento(e: models.Establecimiento, db: Session) -> dict:
    lat = None
    lng = None
    if e.coordenadas is not None:
        try:
            # Extraer X (Longitud) y Y (Latitud) mediante funciones espaciales PostGIS
            coords = db.query(ST_X(e.coordenadas), ST_Y(e.coordenadas)).filter(models.Establecimiento.id == e.id).first()
            if coords:
                lng, lat = coords
        except Exception:
            pass

    prop_nombre = f"{e.propietario.nombres} {e.propietario.apellidos}" if e.propietario else "No asignado"

    return {
        "id": str(e.id),
        "codigo_cue": e.codigo_cue or "Nuevo",
        "nombre_comercial": e.nombre_comercial,
        "tipo": e.tipo,
        "nivel": e.nivel,
        "municipio": e.municipio,
        "responsable_laboratorio": e.responsable_laboratorio,
        "responsables_areas": e.responsables_areas,
        "direccion": e.direccion,
        "horario": e.horario or "Lun-Vie 7:00 - 19:00, Sáb 8:00 - 13:00",
        "telefono": e.telefono or "+591 4 4000000",
        "email_contacto": e.email_contacto or "contacto@sedescbba.gob.bo",
        "descripcion": e.descripcion or "Establecimiento de salud acreditado para la toma de muestras, diagnóstico clínico y análisis microbiológicos bajo normativa sanitaria vigente del Departamento de Cochabamba.",
        "imagen_url": e.imagen_url,
        "servicios": e.servicios or "Análisis Clínicos Generales",
        "observaciones": e.observaciones,
        "estado_operativo": e.estado_operativo,
        "latitud": float(lat) if lat is not None else -17.3895,
        "longitud": float(lng) if lng is not None else -66.1568,
        "propietario_id": str(e.propietario_id),
        "propietario_nombre": prop_nombre,
        "fecha_creacion": e.fecha_creacion.isoformat() if e.fecha_creacion else None,
        "fecha_modificacion": e.fecha_modificacion.isoformat() if e.fecha_modificacion else None
    }

@router.get(
    "",
    summary="Listar todos los laboratorios con filtros y georreferenciación PostGIS"
)
def listar_establecimientos(
    municipio: Optional[str] = Query(None, description="Filtrar por municipio (CERCADO, QUILLACOLLO, etc.)"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    nivel: Optional[str] = Query(None, description="Filtrar por nivel"),
    estado: Optional[str] = Query(None, description="Filtrar por estado operativo"),
    q: Optional[str] = Query(None, description="Búsqueda por nombre, código CUE o dirección"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Establecimiento).filter(models.Establecimiento.estado == True)

    if municipio and municipio.lower() != "todos":
        query = query.filter(models.Establecimiento.municipio.ilike(f"%{municipio.strip()}%"))

    if tipo and tipo.lower() != "todos los tipos":
        query = query.filter(models.Establecimiento.tipo.ilike(f"%{tipo.strip()}%"))

    if nivel and nivel.lower() != "todos":
        query = query.filter(models.Establecimiento.nivel.ilike(f"%{nivel.strip()}%"))

    if estado and estado.lower() != "todos":
        query = query.filter(models.Establecimiento.estado_operativo.ilike(f"%{estado.strip()}%"))

    if q:
        termino = f"%{q.strip()}%"
        query = query.filter(
            or_(
                models.Establecimiento.nombre_comercial.ilike(termino),
                models.Establecimiento.codigo_cue.ilike(termino),
                models.Establecimiento.direccion.ilike(termino),
                models.Establecimiento.municipio.ilike(termino)
            )
        )

    establecimientos = query.order_by(models.Establecimiento.nombre_comercial.asc()).all()
    return [serializar_establecimiento(e, db) for e in establecimientos]

@router.get(
    "/propietario/{propietario_id}",
    summary="Obtener los establecimientos registrados pertenecientes a un propietario"
)
def obtener_establecimientos_propietario(
    propietario_id: str,
    db: Session = Depends(get_db)
):
    try:
        uuid_val = uuid.UUID(propietario_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de propietario inválido."
        )

    establecimientos = db.query(models.Establecimiento).filter(
        models.Establecimiento.propietario_id == uuid_val,
        models.Establecimiento.estado == True
    ).order_by(models.Establecimiento.nombre_comercial.asc()).all()

    # Si el usuario es nuevo y aún no tiene asignado, retornar lista vacía (o sus laboratorios)
    return [serializar_establecimiento(e, db) for e in establecimientos]

@router.get(
    "/{id_o_cue}",
    summary="Obtener detalle completo de un laboratorio por ID o código CUE"
)
def obtener_detalle_establecimiento(
    id_o_cue: str,
    db: Session = Depends(get_db)
):
    estab = None

    # Intentar buscar por UUID
    try:
        uuid_val = uuid.UUID(id_o_cue)
        estab = db.query(models.Establecimiento).filter(
            models.Establecimiento.id == uuid_val,
            models.Establecimiento.estado == True
        ).first()
    except ValueError:
        pass

    # Si no es UUID o no se encontró, buscar por código CUE o nombre
    if not estab:
        estab = db.query(models.Establecimiento).filter(
            or_(
                models.Establecimiento.codigo_cue.ilike(id_o_cue.strip()),
                models.Establecimiento.nombre_comercial.ilike(id_o_cue.strip())
            ),
            models.Establecimiento.estado == True
        ).first()

    if not estab:
        if "biotest" in id_o_cue.lower() or "central" in id_o_cue.lower():
            estab = db.query(models.Establecimiento).filter(models.Establecimiento.estado == True).first()

    if not estab:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Laboratorio no encontrado."
        )

    return serializar_establecimiento(estab, db)

@router.put(
    "/{id}",
    summary="Editar información pública de la página de un laboratorio"
)
def actualizar_establecimiento(
    id: str,
    datos: schemas.EstablecimientoUpdate,
    db: Session = Depends(get_db)
):
    try:
        uuid_val = uuid.UUID(id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de establecimiento inválido."
        )

    estab = db.query(models.Establecimiento).filter(
        models.Establecimiento.id == uuid_val,
        models.Establecimiento.estado == True
    ).first()

    if not estab:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establecimiento no encontrado."
        )

    # Actualizar campos permitidos
    if datos.horario is not None:
        estab.horario = datos.horario.strip()
    if datos.telefono is not None:
        estab.telefono = datos.telefono.strip()
    if datos.email_contacto is not None:
        estab.email_contacto = datos.email_contacto.strip().lower()
    if datos.descripcion is not None:
        estab.descripcion = datos.descripcion.strip()
    if datos.servicios is not None:
        estab.servicios = datos.servicios.strip()
    if datos.direccion is not None:
        estab.direccion = datos.direccion.strip()
    if datos.responsable_laboratorio is not None:
        estab.responsable_laboratorio = datos.responsable_laboratorio.strip()
    if datos.responsables_areas is not None:
        estab.responsables_areas = datos.responsables_areas.strip()
    if datos.latitud is not None and datos.longitud is not None:
        estab.coordenadas = f"SRID=4326;POINT({datos.longitud} {datos.latitud})"
    if datos.imagen_url is not None:
        estab.imagen_url = datos.imagen_url.strip()

    db.commit()
    db.refresh(estab)

    return {
        "mensaje": "Información del establecimiento actualizada exitosamente.",
        "establecimiento": serializar_establecimiento(estab, db)
    }

@router.post(
    "/{id}/imagen",
    summary="Subir y actualizar la fotografía oficial del establecimiento"
)
async def subir_imagen_establecimiento(
    id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        uuid_val = uuid.UUID(id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de establecimiento inválido."
        )

    estab = db.query(models.Establecimiento).filter(
        models.Establecimiento.id == uuid_val,
        models.Establecimiento.estado == True
    ).first()

    if not estab:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Establecimiento no encontrado."
        )

    # Validar extensión del archivo
    extension = os.path.splitext(file.filename)[1].lower()
    if extension not in [".jpg", ".jpeg", ".png", ".webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato no permitido. Solo se aceptan imágenes JPG, PNG o WEBP."
        )

    # Crear nombre único para la imagen
    os.makedirs("uploads", exist_ok=True)
    nombre_archivo = f"lab_{estab.id}_{uuid.uuid4().hex[:8]}{extension}"
    ruta_destino = os.path.join("uploads", nombre_archivo)

    try:
        with open(ruta_destino, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al guardar la imagen: {str(err)}"
        )

    # Guardar URL accesible
    url_publica = f"http://localhost:8000/uploads/{nombre_archivo}"
    estab.imagen_url = url_publica
    db.commit()
    db.refresh(estab)

    return {
        "mensaje": "Fotografía actualizada exitosamente.",
        "imagen_url": url_publica,
        "establecimiento": serializar_establecimiento(estab, db)
    }
