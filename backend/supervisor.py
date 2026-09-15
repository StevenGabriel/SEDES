import math
import uuid
from datetime import datetime, date, timedelta, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_, cast, Date
from geoalchemy2.functions import ST_X, ST_Y

from database import get_db
import models
from notificaciones import crear_notificacion_db

router = APIRouter(
    prefix="/api/supervisor",
    tags=["Supervisor SEDES"]
)

# Zona horaria de Bolivia (UTC-4) — se usa para validaciones de fecha/hora
TZ_BOLIVIA = timezone(timedelta(hours=-4))

# ==============================================================================
# SCHEMAS DE ENTRADA
# ==============================================================================

class AgendarInspeccionRequest(BaseModel):
    tramite_id: str
    supervisor_id: Optional[str] = None
    fecha: str = Field(..., description="Fecha en formato YYYY-MM-DD")
    hora_inicio: str = Field(..., description="Hora de inicio en formato HH:MM (ej: 09:30)")
    hora_fin: Optional[str] = Field(None, description="Hora de fin en formato HH:MM (ej: 11:00)")
    duracion_minutos: Optional[int] = Field(90, description="Duración estimada en minutos")
    observaciones: Optional[str] = None

class ReprogramarInspeccionRequest(BaseModel):
    inspeccion_id: str
    fecha: str
    hora_inicio: str
    hora_fin: Optional[str] = None
    duracion_minutos: Optional[int] = 90
    motivo: Optional[str] = None

class DesagendarInspeccionRequest(BaseModel):
    inspeccion_id: str
    motivo: Optional[str] = None

# ==============================================================================
# HELPERS DE FECHAS Y SERIALIZACIÓN
# ==============================================================================

MESES_ESPANOL = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

DIAS_NOMBRES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

def obtener_lunes_de_semana(fecha_base: date, offset_semanas: int = 0) -> date:
    # weekday: 0 es Lunes, 6 es Domingo
    dias_al_lunes = fecha_base.weekday()
    lunes = fecha_base - timedelta(days=dias_al_lunes) + timedelta(weeks=offset_semanas)
    return lunes

def ahora_bolivia() -> datetime:
    """Retorna la hora actual de Bolivia (UTC-4) como datetime naive (sin tz),
    para comparar contra las fechas parseadas que también son naive."""
    return datetime.now(tz=TZ_BOLIVIA).replace(tzinfo=None)

def parsear_fecha_hora(fecha_str: str, hora_str: str) -> datetime:
    """Parsea fechas en cualquier formato (ISO, YYYY-MM-DD, DD/MM/YYYY, etc.) de manera tolerante."""
    if not fecha_str:
        raise ValueError("Fecha no proporcionada")
    
    fecha_limpia = str(fecha_str).strip().split("T")[0].split(" ")[0]
    hora_limpia = str(hora_str or "00:00").strip().split("T")[-1].split(" ")[-1]
    
    año, mes, dia = 2026, 1, 1
    if "-" in fecha_limpia:
        partes = [int(p) for p in fecha_limpia.split("-") if p.isdigit()]
        if len(partes) >= 3:
            if partes[0] > 1000:
                año, mes, dia = partes[0], partes[1], partes[2]
            else:
                dia, mes, año = partes[0], partes[1], partes[2]
    elif "/" in fecha_limpia:
        partes = [int(p) for p in fecha_limpia.split("/") if p.isdigit()]
        if len(partes) >= 3:
            if partes[0] > 1000:
                año, mes, dia = partes[0], partes[1], partes[2]
            else:
                dia, mes, año = partes[0], partes[1], partes[2]
    else:
        raise ValueError(f"Formato de fecha no reconocido: '{fecha_str}'")

    partes_hora = [int(p) for p in hora_limpia.split(":") if p.isdigit()]
    hora = partes_hora[0] if len(partes_hora) > 0 else 0
    minuto = partes_hora[1] if len(partes_hora) > 1 else 0

    return datetime(año, mes, dia, hora, minuto, 0)

# Coordenadas Oficiales SEDES Cochabamba (Oficina Central)
SEDES_CBBA_LAT = -17.39352
SEDES_CBBA_LNG = -66.15705
SEDES_CBBA_DIRECCION = "Av. Aniceto Arce #2875, Cochabamba"

def calcular_distancia_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calcula la distancia aproximada por ruta vial urbana entre 2 coordenadas (en km)."""
    try:
        R = 6371.0  # Radio de la Tierra en km
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distancia_lineal = R * c
        # Factor de corrección vial en trama urbana de Cochabamba (aprox 1.25x distancia euclidiana directa)
        return round(distancia_lineal * 1.25, 1)
    except Exception:
        return 2.5

def buscar_supervisor_por_id_o_nombre(identificador: str, db: Session) -> Optional[models.Usuario]:
    """Busca supervisor por UUID, email o nombre."""
    if not identificador:
        return None
    
    # 1. Por UUID
    try:
        sup_uuid = uuid.UUID(identificador)
        u = db.query(models.Usuario).filter(models.Usuario.id == sup_uuid).first()
        if u:
            return u
    except ValueError:
        pass

    # 2. Por Email
    u = db.query(models.Usuario).filter(models.Usuario.email.ilike(identificador.strip())).first()
    if u:
        return u

    # 3. Por coincidencia en Nombres y Apellidos
    clean_id = identificador.replace("Lic.", "").replace("Dra.", "").replace("Dr.", "").replace("Ing.", "").strip()
    u = db.query(models.Usuario).join(models.Role).filter(
        models.Role.nombre.ilike("%Supervisor%"),
        (models.Usuario.nombres + " " + models.Usuario.apellidos).ilike(f"%{clean_id}%")
    ).first()
    if u:
        return u

    return None

# ==============================================================================
# ENDPOINTS
# ==============================================================================

@router.get("/{supervisor_id}/agenda", summary="Obtener agenda semanal e inspecciones pendientes del supervisor")
def obtener_agenda_supervisor(
    supervisor_id: str,
    offset_semanas: int = Query(0, description="Desplazamiento de semanas respecto a la actual"),
    db: Session = Depends(get_db)
):
    """
    Retorna:
    1. Lista de trámites asignados al supervisor que están pendientes de programar.
    2. Eventos/Inspecciones ya programadas para la semana solicitada (Lunes a Viernes).
    3. Estructura de días y fechas de la semana.
    """
    supervisor = buscar_supervisor_por_id_o_nombre(supervisor_id, db)
    if not supervisor:
        # Si no se encuentra exactamente, buscar el primer supervisor disponible
        supervisor = db.query(models.Usuario).join(models.Role).filter(
            models.Role.nombre.ilike("%Supervisor%"),
            models.Usuario.estado == True
        ).first()

    if not supervisor:
        raise HTTPException(status_code=404, detail="No se encontró ningún supervisor técnico registrado.")

    hoy = date.today()
    lunes_semana = obtener_lunes_de_semana(hoy, offset_semanas)
    viernes_semana = lunes_semana + timedelta(days=4)
    domingo_semana = lunes_semana + timedelta(days=6)

    # Construir objeto de días de la semana (Lunes a Viernes)
    dias_semana_info = []
    for i in range(5):
        dia_fecha = lunes_semana + timedelta(days=i)
        dias_semana_info.append({
            "key": DIAS_NOMBRES[i],
            "nombre": DIAS_NOMBRES[i],
            "numero": dia_fecha.day,
            "fecha_iso": dia_fecha.isoformat(),
            "mes": MESES_ESPANOL[dia_fecha.month - 1]
        })

    # Rango de texto de la semana (ej: "Semana del 11 - 15 Agosto 2026")
    mes_lunes = MESES_ESPANOL[lunes_semana.month - 1]
    mes_viernes = MESES_ESPANOL[viernes_semana.month - 1]
    if mes_lunes == mes_viernes:
        rango_texto = f"Semana del {lunes_semana.day} - {viernes_semana.day} de {mes_lunes} {viernes_semana.year}"
    else:
        rango_texto = f"Semana del {lunes_semana.day} {mes_lunes} - {viernes_semana.day} {mes_viernes} {viernes_semana.year}"

    # 1. Obtener todos los trámites asignados al supervisor
    tramites_asignados = db.query(models.Tramite).filter(
        models.Tramite.supervisor_asignado_id == supervisor.id,
        models.Tramite.estado == True
    ).order_by(models.Tramite.fecha_creacion.desc()).all()

    pendientes = []
    eventos_semana = []

    # Fecha de inicio y fin de la semana para filtrar inspecciones (lunes 00:00:00 a domingo 23:59:59)
    inicio_semana_dt = datetime.combine(lunes_semana, datetime.min.time())
    fin_semana_dt = datetime.combine(domingo_semana, datetime.max.time())

    for trm in tramites_asignados:
        estab = trm.establecimiento
        prop = estab.propietario if estab else None
        
        # Buscar inspección asociada
        insp = db.query(models.Inspeccion).filter(
            models.Inspeccion.tramite_id == trm.id,
            models.Inspeccion.estado == True
        ).order_by(models.Inspeccion.fecha_creacion.desc()).first()

        tipo_tramite = trm.tipo_tramite or "Apertura"
        tag_color = "blue" if "apertura" in tipo_tramite.lower() else "orange"
        estab_nombre = estab.nombre_comercial if estab else f"Establecimiento ({str(trm.id)[:8]})"
        estab_dir = estab.direccion if estab else "Cochabamba"
        estab_mun = (estab.municipio if estab and estab.municipio else "CERCADO").upper()
        estab_nivel = estab.nivel if estab and estab.nivel else "Nivel 1"
        estab_telefono = estab.telefono if estab else (prop.telefono if prop else "N/A")
        f_solicitud = trm.fecha_ingreso.strftime("%d/%m/%Y") if trm.fecha_ingreso else (
            trm.fecha_creacion.strftime("%d/%m/%Y") if trm.fecha_creacion else "Hoy"
        )

        es_programada = insp and insp.estado_inspeccion in ["Programada", "Reprogramada", "Completada"] and insp.fecha_programada is not None

        prop_nombre = f"{prop.nombres} {prop.apellidos}" if prop else "Propietario / Responsable"
        cod_estab = f"EST-{str(estab.id)[:8].upper()}" if (estab and estab.id) else f"TRM-{str(trm.id)[:8].upper()}"

        if not es_programada:
            # Está pendiente de programar fecha/hora
            pendientes.append({
                "id": str(insp.id) if insp else str(trm.id),
                "tramite_id": str(trm.id),
                "inspeccion_id": str(insp.id) if insp else None,
                "codigo": f"TRM-{str(trm.id)[:8].upper()}",
                "codigo_establecimiento": cod_estab,
                "propietario": prop_nombre,
                "tipo": tipo_tramite,
                "tipoTag": tipo_tramite,
                "tagColor": tag_color,
                "nombre": f"{tipo_tramite} - {estab_nombre}",
                "establecimiento": estab_nombre,
                "direccion": estab_dir,
                "municipio": estab_mun,
                "nivel": estab_nivel,
                "telefono": estab_telefono,
                "fechaSolicitud": f_solicitud,
                "estado_tramite": trm.estado_tramite or "Pendiente",
                "estado_inspeccion": insp.estado_inspeccion if insp else "Pendiente"
            })
        else:
            # Está programada, verificar si cae en la semana seleccionada
            dt_prog = insp.fecha_programada
            if inicio_semana_dt <= dt_prog <= fin_semana_dt:
                dia_semana_idx = dt_prog.weekday() # 0 = Lunes, 4 = Viernes
                if dia_semana_idx < 5:
                    hora_ini_str = dt_prog.strftime("%H:%M")
                    # Calculamos fin sumando 90 minutos por defecto
                    dt_fin = dt_prog + timedelta(minutes=90)
                    hora_fin_str = dt_fin.strftime("%H:%M")

                    start_minutes = dt_prog.hour * 60 + dt_prog.minute
                    duration_minutes = 90

                    eventos_semana.append({
                        "id": str(insp.id),
                        "inspeccion_id": str(insp.id),
                        "tramite_id": str(trm.id),
                        "codigo_tramite": f"TRM-{str(trm.id)[:8].upper()}",
                        "fecha": dt_prog.date().isoformat(),
                        "dia": DIAS_NOMBRES[dia_semana_idx],
                        "diaIndex": dia_semana_idx,
                        "horaInicio": hora_ini_str,
                        "horaFin": hora_fin_str,
                        "startMinutes": start_minutes,
                        "durationMinutes": duration_minutes,
                        "titulo": f"{tipo_tramite} - {estab_nombre[:12]}...",
                        "subtitulo": f"{hora_ini_str} - {hora_fin_str}",
                        "establecimiento": estab_nombre,
                        "direccion": estab_dir,
                        "municipio": estab_mun,
                        "nivel": estab_nivel,
                        "telefono": estab_telefono,
                        "tipo": tipo_tramite,
                        "color": "blue" if tag_color == "blue" else "amber",
                        "estado_inspeccion": insp.estado_inspeccion,
                        "veredicto_final": insp.veredicto_final or "Pendiente de Inspección"
                    })

    return {
        "supervisor": {
            "id": str(supervisor.id),
            "nombres": supervisor.nombres,
            "apellidos": supervisor.apellidos,
            "nombreCompleto": f"{supervisor.nombres} {supervisor.apellidos}",
            "email": supervisor.email,
            "telefono": supervisor.telefono
        },
        "semana": {
            "offset": offset_semanas,
            "rango_texto": rango_texto,
            "lunes": lunes_semana.isoformat(),
            "viernes": viernes_semana.isoformat(),
            "dias": dias_semana_info
        },
        "pendientes": pendientes,
        "eventos": eventos_semana
    }

@router.post("/agendar-inspeccion", summary="Programar una fecha y hora de inspección técnica en el calendario")
def agendar_inspeccion(
    payload: AgendarInspeccionRequest,
    db: Session = Depends(get_db)
):
    """
    Asigna una fecha y hora a la inspección de un trámite asignado,
    pasando su estado a 'Programada' y actualizando el trámite y notificaciones.
    """
    # 1. Buscar trámite
    tramite = None
    try:
        t_uuid = uuid.UUID(payload.tramite_id)
        tramite = db.query(models.Tramite).filter(models.Tramite.id == t_uuid).first()
    except ValueError:
        pass

    if not tramite:
        clean_code = payload.tramite_id.replace("TRM-", "").replace("REQ-", "").strip().lower()
        tramites = db.query(models.Tramite).filter(models.Tramite.estado == True).all()
        for t in tramites:
            if str(t.id).lower().startswith(clean_code):
                tramite = t
                break

    if not tramite:
        raise HTTPException(status_code=404, detail="Trámite no encontrado para agendar inspección.")

    # 2. Parsear fecha y hora
    try:
        fecha_prog_dt = parsear_fecha_hora(payload.fecha, payload.hora_inicio)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Formato de fecha u hora inválido ({payload.fecha} {payload.hora_inicio}): {e}")

    # Validación de fecha y hora futura (con margen de 2 minutos por desfase de reloj)
    ahora_tolerante = ahora_bolivia() - timedelta(minutes=2)
    if fecha_prog_dt < ahora_tolerante:
        raise HTTPException(
            status_code=400,
            detail=f"No es posible agendar una inspección en una fecha u hora pasada ({fecha_prog_dt.strftime('%d/%m/%Y %H:%M')}). Por favor seleccione una fecha y horario actual o posterior."
        )

    # 3. Buscar o crear inspección
    insp = db.query(models.Inspeccion).filter(
        models.Inspeccion.tramite_id == tramite.id,
        models.Inspeccion.estado == True
    ).first()

    sup_id = tramite.supervisor_asignado_id
    if payload.supervisor_id:
        sup_obj = buscar_supervisor_por_id_o_nombre(payload.supervisor_id, db)
        if sup_obj:
            sup_id = sup_obj.id

    if not sup_id:
        sup_default = db.query(models.Usuario).join(models.Role).filter(
            models.Role.nombre.ilike("%Supervisor%"),
            models.Usuario.estado == True
        ).first()
        if sup_default:
            sup_id = sup_default.id

    if not insp:
        insp = models.Inspeccion(
            id=uuid.uuid4(),
            tramite_id=tramite.id,
            supervisor_id=sup_id,
            fecha_programada=fecha_prog_dt,
            estado_inspeccion="Programada",
            veredicto_final="Pendiente de Inspección"
        )
        db.add(insp)
    else:
        insp.fecha_programada = fecha_prog_dt
        insp.estado_inspeccion = "Programada"
        if sup_id:
            insp.supervisor_id = sup_id

    # Actualizar estado de trámite
    tramite.estado_tramite = "Inspección Programada"

    # 4. Registrar en Auditoría (HistorialActividad)
    sup_usuario = db.query(models.Usuario).filter(models.Usuario.id == sup_id).first() if sup_id else None
    sup_nombre = f"{sup_usuario.nombres} {sup_usuario.apellidos}" if sup_usuario else "Supervisor SEDES"
    estab_nombre = tramite.establecimiento.nombre_comercial if tramite.establecimiento else "Establecimiento"
    f_str = fecha_prog_dt.strftime("%d/%m/%Y a las %H:%M")
    cod_trm = f"TRM-{str(tramite.id)[:8].upper()}"
    ahora_formato = ahora_bolivia().strftime("%d %b %Y - %H:%M")

    try:
        nuevo_log = models.HistorialActividad(
            id=uuid.uuid4(),
            codigo_tramite=cod_trm,
            establecimiento=estab_nombre,
            accion=f"Inspección técnica de campo agendada para el {f_str} por {sup_nombre}. {payload.observaciones or ''}".strip(),
            responsable=sup_nombre,
            estado_resultado="Programada",
            estado_badge="bg-purple-50 text-purple-700 border-purple-200",
            fecha_hora_formato=ahora_formato
        )
        db.add(nuevo_log)
    except Exception as e:
        print(f"Error al registrar historial: {e}")

    # 5. Notificar al Propietario del Laboratorio
    try:
        if tramite.establecimiento and tramite.establecimiento.propietario_id:
            crear_notificacion_db(
                db,
                usuario_id=tramite.establecimiento.propietario_id,
                titulo="📅 Inspección Técnica Programada",
                mensaje=f"Su trámite de {tramite.tipo_tramite} para '{estab_nombre}' ha sido agendado para inspección in-situ el día {f_str} por {sup_nombre}."
            )
    except Exception as e:
        print(f"Error al crear notificación para propietario: {e}")

    db.commit()
    db.refresh(insp)

    return {
        "mensaje": f"¡Inspección agendada con éxito para el {f_str}!",
        "inspeccion_id": str(insp.id),
        "tramite_id": str(tramite.id),
        "fecha_programada": insp.fecha_programada.isoformat(),
        "estado": insp.estado_inspeccion
    }

@router.post("/reprogramar-inspeccion", summary="Reprogramar una inspección agendada")
def reprogramar_inspeccion(
    payload: ReprogramarInspeccionRequest,
    db: Session = Depends(get_db)
):
    """Permite al supervisor modificar la fecha u hora de una inspección ya agendada."""
    insp = None
    try:
        i_uuid = uuid.UUID(payload.inspeccion_id)
        insp = db.query(models.Inspeccion).filter(models.Inspeccion.id == i_uuid).first()
    except ValueError:
        pass

    if not insp:
        raise HTTPException(status_code=404, detail="Inspección no encontrada.")

    try:
        nueva_fecha_dt = parsear_fecha_hora(payload.fecha, payload.hora_inicio)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Fecha u hora inválida: {e}")

    # Validación de fecha y hora futura (con margen de 2 minutos por desfase)
    ahora_tolerante = ahora_bolivia() - timedelta(minutes=2)
    if nueva_fecha_dt < ahora_tolerante:
        raise HTTPException(
            status_code=400,
            detail=f"No es posible reprogramar una inspección en una fecha u hora pasada ({nueva_fecha_dt.strftime('%d/%m/%Y %H:%M')}). Por favor seleccione una fecha y horario actual o posterior."
        )

    insp.fecha_programada = nueva_fecha_dt
    insp.estado_inspeccion = "Reprogramada"

    tramite = insp.tramite
    f_str = nueva_fecha_dt.strftime("%d/%m/%Y a las %H:%M")
    sup_nombre = f"{insp.supervisor.nombres} {insp.supervisor.apellidos}" if insp.supervisor else "Supervisor"
    estab_nombre = tramite.establecimiento.nombre_comercial if (tramite and tramite.establecimiento) else "Establecimiento"

    if tramite:
        try:
            nuevo_log = models.HistorialActividad(
                id=uuid.uuid4(),
                codigo_tramite=f"TRM-{str(tramite.id)[:8].upper()}",
                establecimiento=estab_nombre,
                accion=f"Inspección reprogramada para el {f_str}. Motivo: {payload.motivo or 'Ajuste de cronograma técnico'}",
                responsable=sup_nombre,
                estado_resultado="Reprogramada",
                estado_badge="bg-amber-50 text-amber-700 border-amber-200",
                fecha_hora_formato=ahora_bolivia().strftime("%d %b %Y - %H:%M")
            )
            db.add(nuevo_log)
        except Exception as e:
            print(f"Error al registrar historial: {e}")

        try:
            if tramite.establecimiento and tramite.establecimiento.propietario_id:
                crear_notificacion_db(
                    db,
                    usuario_id=tramite.establecimiento.propietario_id,
                    titulo="⚠️ Inspección Técnica Reprogramada",
                    mensaje=f"La inspección técnica para '{estab_nombre}' ha sido reprogramada para el día {f_str}."
                )
        except Exception as e:
            print(f"Error al notificar al propietario: {e}")

    db.commit()
    db.refresh(insp)

    return {
        "mensaje": f"¡Inspección reprogramada con éxito para el {f_str}!",
        "inspeccion_id": str(insp.id),
        "nueva_fecha": insp.fecha_programada.isoformat()
    }

@router.post("/desagendar-inspeccion", summary="Cancelar o devolver inspección a la lista de pendientes")
def desagendar_inspeccion(
    payload: DesagendarInspeccionRequest,
    db: Session = Depends(get_db)
):
    """Devuelve la inspección a estado Pendiente para reprogramarla libremente."""
    try:
        i_uuid = uuid.UUID(payload.inspeccion_id)
        insp = db.query(models.Inspeccion).filter(models.Inspeccion.id == i_uuid).first()
    except ValueError:
        insp = None

    if not insp:
        raise HTTPException(status_code=404, detail="Inspección no encontrada.")

    insp.estado_inspeccion = "Pendiente"
    db.commit()

    return {
        "mensaje": "Inspección devuelta a la lista de pendientes.",
        "inspeccion_id": str(insp.id)
    }

@router.get("/{supervisor_id}/rutas", summary="Obtener paradas y ruta de inspección diaria del supervisor")
def obtener_rutas_supervisor(
    supervisor_id: str,
    fecha: Optional[str] = Query(None, description="Fecha en formato YYYY-MM-DD (por defecto hoy en Bolivia)"),
    origen_lat: Optional[float] = Query(None, description="Latitud GPS actual del supervisor"),
    origen_lng: Optional[float] = Query(None, description="Longitud GPS actual del supervisor"),
    db: Session = Depends(get_db)
):
    """
    Retorna la secuencia de paradas de inspección asignadas y programadas para el supervisor en un día específico,
    incluyendo coordenadas GPS, distancia acumulada, tiempo de recorrido y punto de partida (GPS actual o SEDES).
    """
    supervisor = buscar_supervisor_por_id_o_nombre(supervisor_id, db)
    if not supervisor:
        supervisor = db.query(models.Usuario).join(models.Role).filter(
            models.Role.nombre.ilike("%Supervisor%"),
            models.Usuario.estado == True
        ).first()

    if not supervisor:
        raise HTTPException(status_code=404, detail="No se encontró supervisor registrado.")

    # Determinar fecha objetivo
    if fecha:
        try:
            fecha_target = parsear_fecha_hora(fecha, "00:00").date()
        except Exception:
            fecha_target = ahora_bolivia().date()
    else:
        fecha_target = ahora_bolivia().date()

    # Formatear texto de la fecha (ej: "Miércoles, 13 de Agosto")
    dias_semana_full = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    dia_nombre = dias_semana_full[fecha_target.weekday()]
    mes_nombre = MESES_ESPANOL[fecha_target.month - 1]
    fecha_formateada = f"{dia_nombre}, {fecha_target.day} de {mes_nombre}"
    fecha_badge = f"Día: {dia_nombre} {fecha_target.day} {mes_nombre[:3]}"

    # Buscar todas las inspecciones programadas del supervisor en esa fecha
    inspecciones_dia = db.query(models.Inspeccion).join(models.Tramite).filter(
        or_(
            models.Inspeccion.supervisor_id == supervisor.id,
            models.Tramite.supervisor_asignado_id == supervisor.id
        ),
        cast(models.Inspeccion.fecha_programada, Date) == fecha_target,
        models.Inspeccion.estado == True,
        models.Inspeccion.estado_inspeccion.in_(["Programada", "Reprogramada", "Completada"])
    ).order_by(models.Inspeccion.fecha_programada.asc()).all()

    # También obtener lista de todas las fechas que tienen inspecciones programadas para el selector
    todas_inspecciones = db.query(models.Inspeccion).join(models.Tramite).filter(
        or_(
            models.Inspeccion.supervisor_id == supervisor.id,
            models.Tramite.supervisor_asignado_id == supervisor.id
        ),
        models.Inspeccion.estado == True,
        models.Inspeccion.fecha_programada.isnot(None),
        models.Inspeccion.estado_inspeccion.in_(["Programada", "Reprogramada", "Completada"])
    ).order_by(models.Inspeccion.fecha_programada.asc()).all()

    fechas_disponibles_set = set()
    fechas_disponibles = []
    for insp in todas_inspecciones:
        f_iso = insp.fecha_programada.date().isoformat()
        if f_iso not in fechas_disponibles_set:
            fechas_disponibles_set.add(f_iso)
            f_date = insp.fecha_programada.date()
            d_nom = dias_semana_full[f_date.weekday()]
            m_nom = MESES_ESPANOL[f_date.month - 1]
            fechas_disponibles.append({
                "fecha_iso": f_iso,
                "label": f"{d_nom} {f_date.day} {m_nom[:3]}",
                "label_completo": f"{d_nom}, {f_date.day} de {m_nom} {f_date.year}"
            })

    # Asegurar que la fecha actual esté en las opciones si no está
    f_hoy_iso = ahora_bolivia().date().isoformat()
    if f_hoy_iso not in fechas_disponibles_set:
        d_nom = dias_semana_full[ahora_bolivia().date().weekday()]
        m_nom = MESES_ESPANOL[ahora_bolivia().date().month - 1]
        fechas_disponibles.insert(0, {
            "fecha_iso": f_hoy_iso,
            "label": f"Hoy ({d_nom[:3]} {ahora_bolivia().date().day} {m_nom[:3]})",
            "label_completo": f"{d_nom}, {ahora_bolivia().date().day} de {m_nom}"
        })

    # Punto de origen (GPS actual del supervisor o sede SEDES)
    if origen_lat is not None and origen_lng is not None:
        origen = {
            "nombre": "Mi Ubicación Actual (GPS)",
            "direccion": "Ubicación en tiempo real del supervisor",
            "lat": float(origen_lat),
            "lng": float(origen_lng),
            "es_gps_vivo": True
        }
        prev_lat = float(origen_lat)
        prev_lng = float(origen_lng)
    else:
        origen = {
            "nombre": "Inicio (Oficina SEDES)",
            "direccion": SEDES_CBBA_DIRECCION,
            "lat": SEDES_CBBA_LAT,
            "lng": SEDES_CBBA_LNG,
            "es_gps_vivo": False
        }
        prev_lat = SEDES_CBBA_LAT
        prev_lng = SEDES_CBBA_LNG

    paradas = []
    distancia_total_km = 0.0

    for idx, insp in enumerate(inspecciones_dia, start=1):
        trm = insp.tramite
        estab = trm.establecimiento if trm else None
        prop = estab.propietario if estab else None

        # Coordenadas PostGIS
        lat = None
        lng = None
        if estab and estab.coordenadas is not None:
            try:
                coords = db.query(ST_X(estab.coordenadas), ST_Y(estab.coordenadas)).filter(models.Establecimiento.id == estab.id).first()
                if coords and coords[0] is not None and coords[1] is not None:
                    lng, lat = float(coords[0]), float(coords[1])
            except Exception:
                pass

        # Coordenadas de respaldo si no tiene
        if lat is None or lng is None:
            offsets = [
                (-17.4044, -66.2824),
                (-17.3712, -66.1587),
                (-17.3747, -66.1554),
                (-17.3897, -66.1595),
                (-17.4572, -66.1568),
            ]
            fallback_coord = offsets[(idx - 1) % len(offsets)]
            lat, lng = fallback_coord

        # Calcular distancia desde la parada anterior
        dist_tramo = calcular_distancia_km(prev_lat, prev_lng, lat, lng)
        distancia_total_km += dist_tramo
        prev_lat, prev_lng = lat, lng

        tipo_tramite = trm.tipo_tramite if trm and trm.tipo_tramite else "Apertura"
        tag_color = "blue" if "apertura" in tipo_tramite.lower() else "orange"
        hora_ini_str = insp.fecha_programada.strftime("%H:%M")
        hora_fin_dt = insp.fecha_programada + timedelta(minutes=90)
        hora_fin_str = hora_fin_dt.strftime("%H:%M")

        estab_nombre = estab.nombre_comercial if estab else f"Establecimiento #{idx}"
        estab_dir = estab.direccion if estab else "Av. Blanco Galindo Km 5"
        estab_mun = (estab.municipio if estab and estab.municipio else "CERCADO").upper()
        estab_tel = estab.telefono if estab and estab.telefono else (prop.telefono if prop else "N/A")
        prop_nombre = f"{prop.nombres} {prop.apellidos}" if prop else "Propietario / Responsable"

        paradas.append({
            "numero": idx,
            "inspeccion_id": str(insp.id),
            "tramite_id": str(trm.id) if trm else None,
            "codigo_tramite": f"TRM-{str(trm.id)[:8].upper()}" if trm else f"INSP-{idx}",
            "nombre": estab_nombre,
            "establecimiento": estab_nombre,
            "propietario": prop_nombre,
            "direccion": estab_dir,
            "municipio": estab_mun,
            "telefono": estab_tel,
            "tipo": tipo_tramite,
            "tipoTag": tipo_tramite,
            "tagColor": tag_color,
            "hora_inicio": hora_ini_str,
            "hora_fin": hora_fin_str,
            "horario": f"{hora_ini_str} - {hora_fin_str}",
            "lat": lat,
            "lng": lng,
            "distancia_tramo_km": dist_tramo,
            "estado_inspeccion": insp.estado_inspeccion
        })

    # Calcular tiempo estimado total (aprox 25 km/h velocidad media en ciudad + paradas)
    tiempo_estimado_min = int(round((distancia_total_km / 25.0) * 60)) if len(paradas) > 0 else 0
    if len(paradas) > 0 and tiempo_estimado_min < 15:
        tiempo_estimado_min = 15 * len(paradas)

    return {
        "supervisor": {
            "id": str(supervisor.id),
            "nombres": supervisor.nombres,
            "apellidos": supervisor.apellidos,
            "nombreCompleto": f"{supervisor.nombres} {supervisor.apellidos}"
        },
        "fecha": {
            "iso": fecha_target.isoformat(),
            "formato": fecha_formateada,
            "badge": fecha_badge,
            "dia_nombre": dia_nombre,
            "dia_numero": fecha_target.day,
            "mes_nombre": mes_nombre,
            "año": fecha_target.year
        },
        "fechas_disponibles": fechas_disponibles,
        "origen": origen,
        "paradas": paradas,
        "resumen": {
            "distancia_total_km": round(distancia_total_km, 1),
            "tiempo_estimado_min": tiempo_estimado_min,
            "total_paradas": len(paradas)
        }
    }
