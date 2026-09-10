import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc

from database import get_db
import models

router = APIRouter(
    prefix="/api/notificaciones",
    tags=["Notificaciones del Sistema"]
)

# ==============================================================================
# SCHEMAS
# ==============================================================================

class NotificacionCreate(BaseModel):
    usuario_id: str
    titulo: str
    mensaje: str

# ==============================================================================
# FUNCIONES AUXILIARES PARA CREACIÓN DE NOTIFICACIONES
# ==============================================================================

def crear_notificacion_db(
    db: Session,
    usuario_id: uuid.UUID,
    titulo: str,
    mensaje: str
) -> models.Notificacion:
    """Crea y persiste una nueva notificación para un usuario específico."""
    notif = models.Notificacion(
        id=uuid.uuid4(),
        usuario_id=usuario_id,
        titulo=titulo,
        mensaje=mensaje,
        leido=False,
        estado=True
    )
    db.add(notif)
    return notif

def notificar_a_rol_db(
    db: Session,
    rol_nombre: str,
    titulo: str,
    mensaje: str
) -> int:
    """Envía una notificación a todos los usuarios activos con un rol específico."""
    usuarios = db.query(models.Usuario).join(models.Role).filter(
        models.Role.nombre.ilike(rol_nombre.strip()),
        models.Usuario.estado == True
    ).all()

    for u in usuarios:
        crear_notificacion_db(db, u.id, titulo, mensaje)

    return len(usuarios)

# ==============================================================================
# ENDPOINTS REST DE NOTIFICACIONES
# ==============================================================================

@router.get("/usuario/{usuario_id}", summary="Obtener notificaciones de un usuario")
def obtener_notificaciones_usuario(
    usuario_id: str,
    limite: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    try:
        u_uuid = uuid.UUID(usuario_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de usuario inválido.")

    # Buscar usuario
    usuario = db.query(models.Usuario).filter(models.Usuario.id == u_uuid).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    # Si es Coordinador o Director, traer tanto las directas como las generales
    notificaciones_db = db.query(models.Notificacion).filter(
        models.Notificacion.usuario_id == u_uuid,
        models.Notificacion.estado == True
    ).order_by(desc(models.Notificacion.fecha_creacion)).limit(limite).all()

    no_leidas = db.query(models.Notificacion).filter(
        models.Notificacion.usuario_id == u_uuid,
        models.Notificacion.leido == False,
        models.Notificacion.estado == True
    ).count()

    ahora = datetime.now()

    def formatear_tiempo(fecha_dt):
        if not fecha_dt:
            return "Hace un momento"
        diff = ahora - fecha_dt
        segundos = int(diff.total_seconds())
        if segundos < 60:
            return "Hace un momento"
        elif segundos < 3600:
            minutos = segundos // 60
            return f"Hace {minutos} min"
        elif segundos < 86400:
            horas = segundos // 3600
            return f"Hace {horas} h"
        else:
            dias = segundos // 86400
            if dias == 1:
                return "Ayer"
            return f"Hace {dias} días"

    resultados = [
        {
            "id": str(n.id),
            "titulo": n.titulo,
            "mensaje": n.mensaje,
            "leido": n.leido,
            "fecha": n.fecha_creacion.strftime("%d %b %Y - %H:%M") if n.fecha_creacion else "Hoy",
            "tiempoRelativo": formatear_tiempo(n.fecha_creacion)
        }
        for n in notificaciones_db
    ]

    return {
        "usuario_id": str(u_uuid),
        "total": len(resultados),
        "no_leidas": no_leidas,
        "notificaciones": resultados
    }

@router.get("/rol/{rol_nombre}", summary="Obtener notificaciones para funcionarios por rol (ej: Coordinador)")
def obtener_notificaciones_por_rol(
    rol_nombre: str,
    limite: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    usuarios = db.query(models.Usuario).join(models.Role).filter(
        models.Role.nombre.ilike(rol_nombre.strip()),
        models.Usuario.estado == True
    ).all()

    if not usuarios:
        return {"total": 0, "no_leidas": 0, "notificaciones": []}

    u_ids = [u.id for u in usuarios]
    notifs = db.query(models.Notificacion).filter(
        models.Notificacion.usuario_id.in_(u_ids),
        models.Notificacion.estado == True
    ).order_by(desc(models.Notificacion.fecha_creacion)).limit(limite).all()

    no_leidas = db.query(models.Notificacion).filter(
        models.Notificacion.usuario_id.in_(u_ids),
        models.Notificacion.leido == False,
        models.Notificacion.estado == True
    ).count()

    ahora = datetime.now()
    def formatear_tiempo(fecha_dt):
        if not fecha_dt:
            return "Hace un momento"
        diff = ahora - fecha_dt
        segundos = int(diff.total_seconds())
        if segundos < 60:
            return "Hace un momento"
        elif segundos < 3600:
            return f"Hace {segundos // 60} min"
        elif segundos < 86400:
            return f"Hace {segundos // 3600} h"
        return f"Hace {segundos // 86400} días"

    resultados = [
        {
            "id": str(n.id),
            "titulo": n.titulo,
            "mensaje": n.mensaje,
            "leido": n.leido,
            "fecha": n.fecha_creacion.strftime("%d %b %Y - %H:%M") if n.fecha_creacion else "Hoy",
            "tiempoRelativo": formatear_tiempo(n.fecha_creacion)
        }
        for n in notifs
    ]

    return {
        "rol": rol_nombre,
        "total": len(resultados),
        "no_leidas": no_leidas,
        "notificaciones": resultados
    }

@router.patch("/{notificacion_id}/leer", summary="Marcar notificación como leída")
def marcar_notificacion_leida(
    notificacion_id: str,
    db: Session = Depends(get_db)
):
    try:
        n_uuid = uuid.UUID(notificacion_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de notificación inválido.")

    notif = db.query(models.Notificacion).filter(models.Notificacion.id == n_uuid).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notificación no encontrada.")

    notif.leido = True
    db.commit()

    return {"mensaje": "Notificación marcada como leída.", "id": str(notif.id)}

@router.patch("/usuario/{usuario_id}/leer-todas", summary="Marcar todas las notificaciones como leídas")
def marcar_todas_leidas(
    usuario_id: str,
    db: Session = Depends(get_db)
):
    try:
        u_uuid = uuid.UUID(usuario_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de usuario inválido.")

    db.query(models.Notificacion).filter(
        models.Notificacion.usuario_id == u_uuid,
        models.Notificacion.leido == False
    ).update({"leido": True})
    db.commit()

    return {"mensaje": "Todas las notificaciones fueron marcadas como leídas."}
