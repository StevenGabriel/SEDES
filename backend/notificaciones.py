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

    # Mapa de estado actual de establecimientos del usuario para depurar notificaciones obsoletas
    mis_estabs = db.query(models.Establecimiento).filter(
        models.Establecimiento.propietario_id == u_uuid,
        models.Establecimiento.estado == True
    ).all()
    estab_obs_map = {}
    for e in mis_estabs:
        sigue_obs = bool(e.observaciones and e.observaciones.strip().startswith("OBSERVADO"))
        estab_obs_map[e.nombre_comercial.strip().lower()] = sigue_obs

    # Obtener notificaciones activas
    notificaciones_db = db.query(models.Notificacion).filter(
        models.Notificacion.usuario_id == u_uuid,
        models.Notificacion.estado == True
    ).order_by(desc(models.Notificacion.fecha_creacion)).limit(limite).all()

    # Desactivar notificaciones de observación para laboratorios que ya NO están observados
    notifs_validas = []
    hubo_limpieza = False
    for n in notificaciones_db:
        tit_low = (n.titulo or "").lower()
        msg_low = (n.mensaje or "").lower()
        if "observad" in tit_low or ("observad" in msg_low and "establecimiento" in msg_low):
            # Verificar si corresponde a un establecimiento del usuario que ya fue validado/subsanado
            es_obsoleto = False
            for nom_estab, esta_obs in estab_obs_map.items():
                if (nom_estab in tit_low or nom_estab in msg_low) and not esta_obs:
                    es_obsoleto = True
                    break
            if es_obsoleto:
                n.estado = False
                hubo_limpieza = True
                continue
        notifs_validas.append(n)

    if hubo_limpieza:
        try:
            db.commit()
        except Exception:
            db.rollback()

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
            "tiempoRelativo": formatear_tiempo(n.fecha_creacion),
            "fecha_creacion": n.fecha_creacion.isoformat() if n.fecha_creacion else datetime.now().isoformat()
        }
        for n in notifs_validas
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
            "tiempoRelativo": formatear_tiempo(n.fecha_creacion),
            "fecha_creacion": n.fecha_creacion.isoformat() if n.fecha_creacion else datetime.now().isoformat()
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

@router.delete("/usuario/{usuario_id}/limpiar", summary="Limpiar/eliminar todas las notificaciones de un usuario")
def limpiar_todas_notificaciones(
    usuario_id: str,
    db: Session = Depends(get_db)
):
    try:
        u_uuid = uuid.UUID(usuario_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de usuario inválido.")

    borradas = db.query(models.Notificacion).filter(
        models.Notificacion.usuario_id == u_uuid
    ).delete(synchronize_session=False)
    db.commit()

    return {"mensaje": f"Se eliminaron {borradas} notificaciones correctamente.", "total_eliminadas": borradas}

@router.delete("/rol/{rol_nombre}/limpiar", summary="Limpiar/eliminar todas las notificaciones de un rol")
def limpiar_todas_notificaciones_rol(
    rol_nombre: str,
    db: Session = Depends(get_db)
):
    usuarios = db.query(models.Usuario).join(models.Role).filter(
        models.Role.nombre.ilike(rol_nombre.strip()),
        models.Usuario.estado == True
    ).all()

    if not usuarios:
        return {"mensaje": "No se encontraron usuarios para este rol.", "total_eliminadas": 0}

    u_ids = [u.id for u in usuarios]
    borradas = db.query(models.Notificacion).filter(
        models.Notificacion.usuario_id.in_(u_ids)
    ).delete(synchronize_session=False)
    db.commit()

    return {"mensaje": f"Se eliminaron {borradas} notificaciones del rol {rol_nombre}.", "total_eliminadas": borradas}

@router.patch("/rol/{rol_nombre}/leer-todas", summary="Marcar todas las notificaciones de un rol como leídas")
def marcar_todas_leidas_rol(
    rol_nombre: str,
    db: Session = Depends(get_db)
):
    usuarios = db.query(models.Usuario).join(models.Role).filter(
        models.Role.nombre.ilike(rol_nombre.strip()),
        models.Usuario.estado == True
    ).all()

    if not usuarios:
        return {"mensaje": "No se encontraron usuarios para este rol."}

    u_ids = [u.id for u in usuarios]
    db.query(models.Notificacion).filter(
        models.Notificacion.usuario_id.in_(u_ids),
        models.Notificacion.leido == False
    ).update({"leido": True}, synchronize_session=False)
    db.commit()

    return {"mensaje": f"Todas las notificaciones del rol {rol_nombre} fueron marcadas como leídas."}

@router.delete("/{notificacion_id}", summary="Eliminar una notificación individual")
def eliminar_notificacion_individual(
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

    db.delete(notif)
    db.commit()

    return {"mensaje": "Notificación eliminada exitosamente.", "id": str(n_uuid)}
