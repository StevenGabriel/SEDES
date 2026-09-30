import os
import shutil
from datetime import date, timedelta, datetime
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

    # Consultar última inspección completada para control de vencimiento y rehabilitación
    ultima_insp = db.query(models.Inspeccion).join(models.Tramite).filter(
        models.Tramite.establecimiento_id == e.id,
        models.Inspeccion.estado == True,
        models.Inspeccion.estado_inspeccion == "Completada"
    ).order_by(models.Inspeccion.fecha_creacion.desc()).first()

    # Verificar si ya tiene un trámite de rehabilitación en curso
    tramite_rehab_activo = db.query(models.Tramite).filter(
        models.Tramite.establecimiento_id == e.id,
        models.Tramite.tipo_tramite.ilike("%rehabilitac%"),
        models.Tramite.estado_tramite.in_(["Pendiente", "En Revisión", "Inspección Programada", "Observado"]),
        models.Tramite.estado == True
    ).first()

    fecha_insp_str = None
    fecha_venc_str = None
    dias_restantes = None
    proximo_a_vencer = False
    vencido = False
    puede_renovar = False
    plazo_acta_str = "1 año"

    if ultima_insp:
        plazo_acta_str = getattr(ultima_insp, 'plazo_subsanacion', None) or "1 año"
        dt_base = ultima_insp.fecha_programada if ultima_insp.fecha_programada else ultima_insp.fecha_creacion
        f_insp = dt_base.date() if dt_base else date.today()
        fecha_insp_str = f_insp.strftime("%d/%m/%Y")

        f_venc = getattr(ultima_insp, 'fecha_vencimiento_acta', None)
        if not f_venc:
            if "día" in plazo_acta_str.lower():
                dias_cant = int(''.join(c for c in plazo_acta_str if c.isdigit()) or '30')
                f_venc = f_insp + timedelta(days=dias_cant)
            else:
                f_venc = f_insp + timedelta(days=365)
        
        fecha_venc_str = f_venc.strftime("%d/%m/%Y")
        hoy = date.today()
        dias_restantes = (f_venc - hoy).days
        proximo_a_vencer = (dias_restantes <= 30)
        vencido = (dias_restantes <= 0)
        puede_renovar = proximo_a_vencer or vencido

        # 1. Alerta a los 30 días si restan 30 días o menos (y aún no ha sido enviada)
        if dias_restantes <= 30 and not getattr(ultima_insp, 'alerta_30_dias_enviada', False) and e.propietario_id:
            try:
                notif_venc_30 = models.Notificacion(
                    id=uuid.uuid4(),
                    usuario_id=e.propietario_id,
                    titulo=f"Aviso de Renovación Disponible (30 días) - {e.nombre_comercial}",
                    mensaje=f"El acta de inspección in-situ de su laboratorio '{e.nombre_comercial}' vencerá el {fecha_venc_str} ({max(0, dias_restantes)} días restantes). Ya puede iniciar su proceso de Rehabilitación / Renovación subiendo la documentación reglamentaria requerida (EMSA, COZBES y Memorial).",
                    leido=False
                )
                db.add(notif_venc_30)
                ultima_insp.alerta_30_dias_enviada = True
                db.commit()
            except Exception as e_notif:
                print(f"Error al enviar notificación de vencimiento (30 días): {e_notif}")

        # 2. Alerta urgente a los 15 días si restan 15 días o menos (y aún no ha sido enviada)
        if dias_restantes <= 15 and not getattr(ultima_insp, 'alerta_15_dias_enviada', False) and e.propietario_id:
            try:
                notif_venc_15 = models.Notificacion(
                    id=uuid.uuid4(),
                    usuario_id=e.propietario_id,
                    titulo=f"Recordatorio Urgente de Renovación (15 días) - {e.nombre_comercial}",
                    mensaje=f"Recordatorio importante: El acta de inspección in-situ de su laboratorio '{e.nombre_comercial}' vencerá en {max(0, dias_restantes)} días (el {fecha_venc_str}). Por favor realice su trámite de Rehabilitación / Renovación a la brevedad para mantener la vigencia reglamentaria.",
                    leido=False
                )
                db.add(notif_venc_15)
                ultima_insp.alerta_15_dias_enviada = True
                db.commit()
            except Exception as e_notif:
                print(f"Error al enviar notificación de vencimiento (15 días): {e_notif}")

    return {
        "id": str(e.id),
        "codigo_cue": e.codigo_cue or "Nuevo",
        "nombre_comercial": e.nombre_comercial,
        "tipo": e.tipo,
        "nivel": e.nivel,
        "municipio": e.municipio,
        "responsable_laboratorio": e.responsable_laboratorio,
        "ci_responsable": e.ci_responsable,
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
        "fecha_ultima_inspeccion": fecha_insp_str or "15/07/2026",
        "fecha_vencimiento_acta": fecha_venc_str or "15/07/2027",
        "dias_para_vencer": dias_restantes if dias_restantes is not None else 365,
        "proximo_a_vencer": proximo_a_vencer,
        "vencido": vencido,
        "puede_renovar": puede_renovar,
        "plazo_acta": plazo_acta_str,
        "tiene_rehabilitacion_pendiente": bool(tramite_rehab_activo),
        "rehabilitacion_tramite_id": str(tramite_rehab_activo.id) if tramite_rehab_activo else None,
        "fecha_creacion": e.fecha_creacion.isoformat() if e.fecha_creacion else None,
        "fecha_modificacion": e.fecha_modificacion.isoformat() if e.fecha_modificacion else None
    }

@router.post(
    "",
    status_code=status.HTTP_201_CREATED,
    summary="Registrar una nueva solicitud de apertura de establecimiento"
)
def crear_establecimiento(
    datos: schemas.EstablecimientoCreate,
    db: Session = Depends(get_db)
):
    try:
        prop_uuid = uuid.UUID(datos.propietario_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de propietario inválido."
        )

    propietario = db.query(models.Usuario).filter(models.Usuario.id == prop_uuid).first()
    if not propietario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Propietario no encontrado en el sistema."
        )

    lat = datos.latitud if datos.latitud is not None else -17.3895
    lng = datos.longitud if datos.longitud is not None else -66.1568

    nuevo_estab = models.Establecimiento(
        id=uuid.uuid4(),
        propietario_id=prop_uuid,
        codigo_cue="Nuevo",
        nombre_comercial=datos.nombre_comercial.strip(),
        tipo=datos.tipo.strip() if datos.tipo else "Privado",
        nivel=datos.nivel.strip() if datos.nivel else "Nivel 1",
        municipio=datos.municipio.strip().upper(),
        responsable_laboratorio=datos.responsable_laboratorio.strip() if datos.responsable_laboratorio else f"{propietario.nombres} {propietario.apellidos}",
        ci_responsable=datos.ci_responsable.strip() if datos.ci_responsable else None,
        responsables_areas=datos.responsables_areas.strip() if datos.responsables_areas else datos.servicios,
        direccion=datos.direccion.strip(),
        coordenadas=f"SRID=4326;POINT({lng} {lat})",
        horario=datos.horario.strip() if datos.horario else "Lun-Vie 7:00 - 19:00, Sáb 8:00 - 13:00",
        telefono=datos.telefono.strip() if datos.telefono else propietario.telefono,
        email_contacto=datos.email_contacto.strip().lower() if datos.email_contacto else propietario.email,
        descripcion=datos.descripcion.strip() if datos.descripcion else "Establecimiento de salud acreditado para la toma de muestras y diagnóstico clínico bajo normativa sanitaria de Cochabamba.",
        imagen_url=datos.imagen_url,
        servicios=datos.servicios.strip() if datos.servicios else "Clínico General",
        estado_operativo="En Trámite",
        estado=True
    )

    db.add(nuevo_estab)
    db.flush()

    # Crear el trámite de Apertura asociado
    nuevo_tramite = models.Tramite(
        id=uuid.uuid4(),
        establecimiento_id=nuevo_estab.id,
        tipo_tramite="Apertura",
        estado_tramite="Pendiente"
    )
    db.add(nuevo_tramite)
    db.flush()

    # Generar Notificaciones en PostgreSQL
    try:
        from notificaciones import crear_notificacion_db, notificar_a_rol_db
        # Notificar al propietario
        crear_notificacion_db(
            db,
            usuario_id=prop_uuid,
            titulo="Solicitud de Apertura Enviada",
            mensaje=f"Su solicitud de apertura para '{nuevo_estab.nombre_comercial}' fue recibida en SEDES Cochabamba y se encuentra en revisión."
        )
        # Notificar a los Coordinadores
        notificar_a_rol_db(
            db,
            rol_nombre="Coordinador",
            titulo="Nueva Solicitud de Apertura",
            mensaje=f"El establecimiento '{nuevo_estab.nombre_comercial}' ({nuevo_estab.municipio}) de {propietario.nombres} {propietario.apellidos} ha enviado su solicitud de apertura para revisión técnica."
        )
    except Exception as e:
        print(f"Error al generar notificaciones: {e}")

    db.commit()
    db.refresh(nuevo_estab)

    return {
        "mensaje": "Solicitud de apertura registrada exitosamente.",
        "establecimiento": serializar_establecimiento(nuevo_estab, db),
        "tramite_id": str(nuevo_tramite.id)
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

    # Actualizar campos de registro institucional (en caso de subsanación o actualización)
    if datos.nombre_comercial is not None and datos.nombre_comercial.strip():
        estab.nombre_comercial = datos.nombre_comercial.strip()
    if datos.municipio is not None and datos.municipio.strip():
        estab.municipio = datos.municipio.strip().upper()
    if datos.tipo is not None and datos.tipo.strip():
        estab.tipo = datos.tipo.strip()
    if datos.nivel is not None and datos.nivel.strip():
        estab.nivel = datos.nivel.strip()

    # Actualizar campos operativos y públicos
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
    if datos.ci_responsable is not None:
        estab.ci_responsable = datos.ci_responsable.strip()
    if datos.responsables_areas is not None:
        estab.responsables_areas = datos.responsables_areas.strip()
    if datos.latitud is not None and datos.longitud is not None:
        estab.coordenadas = f"SRID=4326;POINT({datos.longitud} {datos.latitud})"
    if datos.imagen_url is not None:
        estab.imagen_url = datos.imagen_url.strip()

    # Si el establecimiento estaba observado o se marca explícitamente como subsanación
    estaba_observado = bool(estab.observaciones and "OBSERVADO" in estab.observaciones.upper())
    if datos.es_subsanacion or estaba_observado:
        ahora_dt = datetime.now()
        estab.observaciones = f"CORREGIDO por el propietario el {ahora_dt.strftime('%d/%m/%Y %H:%M')} (Pendiente de nueva revisión del Coordinador)"
        
        # Registrar en HistorialActividad y notificar al Coordinador
        try:
            from notificaciones import notificar_a_rol_db
            prop_nombre = f"{estab.propietario.nombres} {estab.propietario.apellidos}" if estab.propietario else "Solicitante"
            
            # Buscar trámite relacionado para el código
            tramite_rel = db.query(models.Tramite).filter(models.Tramite.establecimiento_id == estab.id, models.Tramite.estado == True).first()
            cod_trm = f"TRM-{str(tramite_rel.id)[:8].upper()}" if tramite_rel else f"LAB-{str(estab.id)[:8].upper()}"

            nuevo_log = models.HistorialActividad(
                id=uuid.uuid4(),
                codigo_tramite=cod_trm,
                establecimiento=estab.nombre_comercial,
                accion=f"Subsanación de datos del establecimiento: El propietario {prop_nombre} ha corregido y reenviado la información para revisión.",
                responsable=prop_nombre,
                estado_resultado="Subsanado",
                estado_badge="bg-amber-50 text-amber-800 border-amber-200",
                fecha_hora_formato=ahora_dt.strftime("%d %b %Y - %H:%M")
            )
            db.add(nuevo_log)

            notificar_a_rol_db(
                db,
                "Coordinador",
                f"✓ Datos Corregidos por Solicitante - {estab.nombre_comercial}",
                f"El propietario {prop_nombre} ha subsanado y actualizado los datos observados de '{estab.nombre_comercial}'. Ya puede revisarlos y validarlos en la bandeja de trámites."
            )
        except Exception as e_notif:
            print(f"Error al registrar historial o notificar al coordinador: {e_notif}")

        # Desactivar notificaciones de observación previas de este establecimiento para el propietario
        if estab.propietario_id:
            try:
                notifs_obs = db.query(models.Notificacion).filter(
                    models.Notificacion.usuario_id == estab.propietario_id,
                    models.Notificacion.estado == True
                ).all()
                for n in notifs_obs:
                    t_low = (n.titulo or "").lower()
                    m_low = (n.mensaje or "").lower()
                    if "observad" in t_low and estab.nombre_comercial.lower() in t_low:
                        n.estado = False
            except Exception as e_clean:
                print(f"Error al desactivar notificaciones de observación: {e_clean}")

    db.commit()
    db.refresh(estab)

    return {
        "mensaje": "Información del establecimiento actualizada y enviada exitosamente.",
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
