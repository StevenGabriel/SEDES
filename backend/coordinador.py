import uuid
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from database import get_db
import models

router = APIRouter(
    prefix="/api/coordinador",
    tags=["Coordinador SEDES"]
)

# ==============================================================================
# SCHEMAS DE ENTRADA Y RESPUESTA
# ==============================================================================

class ValidarDocumentoRequest(BaseModel):
    estado: str = Field(..., description="Nuevo estado: 'Aprobado', 'Observado', 'Rechazado', 'En Revisión'")
    observacion: Optional[str] = None
    responsable: Optional[str] = "Dra. Claudia Morales V."

class AgendarReinspeccionRequest(BaseModel):
    supervisor: str
    fecha: str
    hora: Optional[str] = "09:30"
    prioridad: Optional[str] = "Alta"
    motivo: str
    responsable: Optional[str] = "Dra. Claudia Morales V."

class AprobarTramiteRequest(BaseModel):
    codigo_resolucion: str
    vigencia_anios: str
    observacion_final: Optional[str] = None
    responsable: Optional[str] = "Dra. Claudia Morales V."

class AsignarSupervisorRequest(BaseModel):
    codigo_tramite: str
    supervisor_nombre: str
    responsable: Optional[str] = "Dra. Claudia Morales V."

class NotificarReingresoRequest(BaseModel):
    motivo: Optional[str] = "La inspección de campo no fue favorable. Debe subsanar las observaciones y cargar nuevamente todos los requisitos requeridos."
    responsable: Optional[str] = "Dra. Claudia Morales V."

class DerivarAreaLegalRequest(BaseModel):
    codigo_cite: Optional[str] = None
    destinatario: Optional[str] = "Dra. Mery D. Loroño V. - ASESOR LEGAL"
    dictamen: Optional[str] = "Favorabilidad Concedida (Favorable)"
    observaciones: Optional[str] = None
    responsable: Optional[str] = "Dra. Claudia Morales V."

class PasarInformeTecnicoRequest(BaseModel):
    responsable: Optional[str] = "Dra. Claudia Morales V."

# ==============================================================================
# HELPERS DE SERIALIZACIÓN REAL DESDE BASE DE DATOS
# ==============================================================================

def get_estado_color(estado: str) -> str:
    est = (estado or "").lower()
    if "informe" in est:
        return "bg-sky-100 text-sky-800 border-sky-300"
    if "aprobado" in est:
        return "bg-emerald-100 text-emerald-800 border-emerald-300"
    if "observado" in est or "rechazado" in est:
        return "bg-rose-100 text-rose-800 border-rose-300"
    if "inspección" in est or "re-inspección" in est:
        return "bg-purple-100 text-purple-800 border-purple-300"
    if "revisión" in est:
        return "bg-amber-100 text-amber-800 border-amber-300"
    return "bg-sky-100 text-sky-800 border-sky-300"

def get_tipo_badge_color(tipo: str) -> str:
    t = (tipo or "").lower()
    if "apertura" in t:
        return "bg-cyan-50 text-cyan-700 border-cyan-200"
    if "renovación" in t or "renovacion" in t:
        return "bg-sky-50 text-sky-700 border-sky-200"
    return "bg-indigo-50 text-indigo-700 border-indigo-200"

def serializar_tramite_coordinador(tramite: models.Tramite, db: Session) -> dict:
    estab = tramite.establecimiento
    propietario = estab.propietario if estab else None
    supervisor = tramite.supervisor_asignado

    # Formatear ID visual
    codigo_visual = f"TRM-{str(tramite.id)[:8].upper()}"

    # Última inspección si existe
    ultima_inspeccion = db.query(models.Inspeccion).filter(
        models.Inspeccion.tramite_id == tramite.id,
        models.Inspeccion.estado == True
    ).order_by(models.Inspeccion.fecha_creacion.desc()).first()

    # Documentos adjuntos
    docs_db = db.query(models.TramiteDocumento).filter(
        models.TramiteDocumento.tramite_id == tramite.id,
        models.TramiteDocumento.estado == True
    ).order_by(models.TramiteDocumento.fecha_creacion.asc()).all()

    docs_serializados = []
    for d in docs_db:
        req = d.requisito
        nombre_doc = req.nombre_documento if req else "Documento Requerido"
        seccion_cod = req.seccion_codigo if req else "2.1"
        seccion_tit = req.seccion_titulo if req else "Documentación Legal"
        
        # Fecha formateada
        f_emision = d.fecha_creacion.strftime("%d de %B de %Y") if d.fecha_creacion else "Reciente"

        docs_serializados.append({
            "id": str(d.id),
            "doc_uuid": str(d.id),
            "requisito_id": d.requisito_id,
            "nombre": nombre_doc,
            "seccion": seccion_cod,
            "seccion_titulo": seccion_tit,
            "categoria": req.categoria if req else "General",
            "es_obligatorio": req.es_obligatorio if req else True,
            "estado": d.estado_validacion or "En Revisión",
            "numRegistro": f"DOC-{str(d.id)[:8].upper()}",
            "archivo_url": d.archivo_url,
            "observaciones_supervisor": d.observaciones_supervisor,
            "fechaEmision": f_emision
        })

    # Observaciones del supervisor
    observaciones = []
    if ultima_inspeccion and ultima_inspeccion.veredicto_final:
        observaciones.append(f"Veredicto técnico emitido en acta: {ultima_inspeccion.veredicto_final}.")
    
    # Recoger observaciones de documentos observados
    for d in docs_db:
        if d.observaciones_supervisor:
            observaciones.append(f"{d.requisito.nombre_documento if d.requisito else 'Doc'}: {d.observaciones_supervisor}")

    if not observaciones:
        if supervisor:
            observaciones.append(f"Trámite bajo fiscalización técnica de {supervisor.nombres} {supervisor.apellidos}.")
            observaciones.append("Documentación cargada en plataforma en espera de inspección in-situ.")
        else:
            observaciones.append("Documentación digital ingresada por el propietario en espera de revisión y asignación de supervisor.")

    fecha_formateada = tramite.fecha_ingreso.strftime("%d %b %Y") if tramite.fecha_ingreso else (
        tramite.fecha_creacion.strftime("%d %b %Y") if tramite.fecha_creacion else datetime.now().strftime("%d %b %Y")
    )
    fecha_iso = tramite.fecha_ingreso.isoformat() if tramite.fecha_ingreso else (
        tramite.fecha_creacion.date().isoformat() if tramite.fecha_creacion else date.today().isoformat()
    )

    prop_nombre = f"{propietario.nombres} {propietario.apellidos}" if propietario else "Propietario no registrado"
    sup_nombre = f"{supervisor.nombres} {supervisor.apellidos}" if supervisor else "Sin Asignar"

    veredicto_sup = "PENDIENTE DE ASIGNACIÓN"
    if supervisor:
        veredicto_sup = "PENDIENTE DE INSPECCIÓN"
    if ultima_inspeccion and ultima_inspeccion.veredicto_final:
        veredicto_sup = ultima_inspeccion.veredicto_final.upper()

    f_insp = ultima_inspeccion.fecha_programada.strftime("%d/%m/%Y") if (ultima_inspeccion and ultima_inspeccion.fecha_programada) else "Pendiente"
    estado_insp = ultima_inspeccion.estado_inspeccion if ultima_inspeccion else "Pendiente"
    acta_pdf = ultima_inspeccion.acta_pdf_url if ultima_inspeccion else None

    # Validaciones de flujo:
    total_docs_count = len(docs_db)
    docs_aprobados_count = sum(1 for d in docs_db if (d.estado_validacion or "").lower() == "aprobado")
    todos_docs_aprobados = (total_docs_count > 0 and docs_aprobados_count == total_docs_count)

    veredicto_raw = ultima_inspeccion.veredicto_final if ultima_inspeccion else None
    es_acta_aprobada = bool(
        ultima_inspeccion and
        veredicto_raw and
        veredicto_raw.lower() in ["favorable", "aprobado"]
    )
    es_acta_rechazada = bool(
        ultima_inspeccion and
        veredicto_raw and
        veredicto_raw.lower() in ["desfavorable", "rechazado"]
    )
    es_acta_con_observaciones = bool(
        ultima_inspeccion and
        veredicto_raw and
        "observa" in veredicto_raw.lower()
    )

    ya_en_etapa_posterior = (tramite.estado_tramite or "") in ["En Informe Técnico", "Derivado a Asesoría Legal", "Resolución Lista para Firma", "Aprobado", "Rechazado - Requiere Reingreso", "Rechazado"]
    puede_aprobar = (todos_docs_aprobados and (supervisor is not None) and es_acta_aprobada and not ya_en_etapa_posterior)

    # Consultar si el Asesor Legal ya emitió y elevó la Resolución Administrativa
    resol = db.query(models.ResolucionAdministrativa).filter(
        models.ResolucionAdministrativa.tramite_id == tramite.id,
        models.ResolucionAdministrativa.estado == True
    ).order_by(models.ResolucionAdministrativa.fecha_creacion.desc()).first()

    resolucion_lista_para_firma = bool(
        (tramite.estado_tramite in ["Resolución Lista para Firma", "Aprobado por Legal", "Enviado a Coordinador"]) or
        (resol and resol.estado_resolucion in ["Enviado a Coordinador", "Aprobado por Legal", "Emitida", "Firmada"])
    )

    resolucion_dict = None
    if resol:
        resolucion_dict = {
            "id": str(resol.id),
            "numero_resolucion": resol.numero_resolucion,
            "establecimiento_nombre": resol.establecimiento_nombre,
            "razon_social_propietario": resol.razon_social_propietario,
            "ci_nit_solicitante": resol.ci_nit_solicitante,
            "tipo_establecimiento": resol.tipo_establecimiento,
            "direccion_registrada": resol.direccion_registrada,
            "regente_tecnico": resol.regente_tecnico,
            "ci_regente": resol.ci_regente,
            "cite_informe": resol.cite_informe,
            "observaciones_coordinador": resol.observaciones_coordinador,
            "dictamen_coordinador": resol.dictamen_coordinador,
            "antecedentes": resol.antecedentes,
            "fundamento_legal": resol.fundamento_legal,
            "articulo_primero": resol.articulo_primero,
            "articulo_segundo": resol.articulo_segundo,
            "articulo_tercero": resol.articulo_tercero,
            "observaciones_legales": resol.observaciones_legales,
            "fecha_emision": resol.fecha_emision.strftime("%d de %B de %Y") if resol.fecha_emision else None,
            "vigencia_anios": resol.vigencia_anios or 5,
            "estado_resolucion": resol.estado_resolucion,
            "abogado_nombre": f"{resol.abogado.nombres} {resol.abogado.apellidos}" if resol.abogado else "Dr. Marco Villanueva"
        }

    return {
        "id": codigo_visual,
        "tramite_uuid": str(tramite.id),
        "tipo": tramite.tipo_tramite or "Apertura",
        "tipoBadgeColor": get_tipo_badge_color(tramite.tipo_tramite),
        "fecha": fecha_formateada,
        "fechaISO": fecha_iso,
        "establecimiento": resol.establecimiento_nombre if (resol and resol.establecimiento_nombre) else (estab.nombre_comercial if estab else "Establecimiento"),
        "categoria": f"{estab.tipo if estab else 'Laboratorio Clínico'} ({estab.nivel if estab else 'Nivel 1'})",
        "municipio": estab.municipio if estab else "CERCADO",
        "direccion": resol.direccion_registrada if (resol and resol.direccion_registrada) else (estab.direccion if estab else "Cochabamba"),
        "telefono": estab.telefono if estab else (propietario.telefono if propietario else ""),
        "email": estab.email_contacto if estab else (propietario.email if propietario else ""),
        "propietario": resol.razon_social_propietario if (resol and resol.razon_social_propietario) else prop_nombre,
        "propietario_ci": resol.ci_nit_solicitante if (resol and resol.ci_nit_solicitante) else (propietario.ci_nit if propietario else ""),
        "propietario_email": propietario.email if propietario else "",
        "estado": tramite.estado_tramite or "Pendiente",
        "estadoColor": get_estado_color(tramite.estado_tramite),
        "supervisorAsignado": sup_nombre,
        "supervisor_id": str(supervisor.id) if supervisor else None,
        "fechaInspeccion": f_insp,
        "estadoInspeccion": estado_insp,
        "estado_inspeccion": estado_insp,
        "veredictoSupervisor": veredicto_sup,
        "veredicto_supervisor_raw": veredicto_raw,
        "acta_pdf_url": acta_pdf,
        "documentos": docs_serializados,
        "total_documentos": len(docs_serializados),
        "docs_aprobados_count": docs_aprobados_count,
        "todos_docs_aprobados": todos_docs_aprobados,
        "inspeccion_aprobada": es_acta_aprobada,
        "inspeccion_rechazada": es_acta_rechazada,
        "inspeccion_con_observaciones": es_acta_con_observaciones,
        "puede_aprobar": puede_aprobar,
        "resolucion_lista_para_firma": resolucion_lista_para_firma,
        "resolucion_numero": resol.numero_resolucion if resol else None,
        "resolucion_estado": resol.estado_resolucion if resol else None,
        "resolucion": resolucion_dict,
        "observacionesSupervisor": observaciones
    }


# ==============================================================================
# 1. BANDEJA DE ENTRADA Y GESTIÓN DE TRÁMITES REALES
# ==============================================================================

@router.get("/tramites", summary="Listar trámites pendientes reales para el Coordinador")
def listar_tramites_coordinador(db: Session = Depends(get_db)):
    """Obtiene la lista completa de trámites reales registrados en la base de datos."""
    tramites = db.query(models.Tramite).filter(
        models.Tramite.estado == True
    ).order_by(models.Tramite.fecha_creacion.desc()).all()

    tramites_serializados = [serializar_tramite_coordinador(t, db) for t in tramites]

    return {
        "total": len(tramites_serializados),
        "tramites": tramites_serializados
    }

@router.get("/tramites/{tramite_id}", summary="Obtener expediente completo de un trámite")
def obtener_detalle_tramite(tramite_id: str, db: Session = Depends(get_db)):
    """Retorna el expediente completo de un trámite por UUID o código visual."""
    tramite = None
    try:
        t_uuid = uuid.UUID(tramite_id)
        tramite = db.query(models.Tramite).filter(models.Tramite.id == t_uuid).first()
    except ValueError:
        pass

    if not tramite:
        clean_code = tramite_id.replace("TRM-", "").replace("REQ-", "").strip().lower()
        tramites = db.query(models.Tramite).filter(models.Tramite.estado == True).all()
        for t in tramites:
            if str(t.id).lower().startswith(clean_code):
                tramite = t
                break

    if not tramite:
        raise HTTPException(status_code=404, detail="Trámite no encontrado en la base de datos.")

    return serializar_tramite_coordinador(tramite, db)

@router.patch("/documentos/{documento_id}/validar", summary="Validar o Rechazar un Documento Legal")
def validar_documento_legal(
    documento_id: str,
    payload: ValidarDocumentoRequest,
    codigo_tramite: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Actualiza en tiempo real el estado de validación de un documento en PostgreSQL y registra la auditoría."""
    try:
        d_uuid = uuid.UUID(documento_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="ID de documento inválido.")

    doc = db.query(models.TramiteDocumento).filter(models.TramiteDocumento.id == d_uuid).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Documento no encontrado en la base de datos.")

    doc.estado_validacion = payload.estado
    if payload.estado in ["Aprobado", "En Revisión"]:
        # Al aprobar o restablecer a revisión, se eliminan las observaciones previas a menos que se especifique una nota
        doc.observaciones_supervisor = payload.observacion.strip() if (payload.observacion and payload.observacion.strip()) else None
    else:
        # En caso de rechazo u observación, guardar el motivo
        doc.observaciones_supervisor = payload.observacion.strip() if (payload.observacion and payload.observacion.strip()) else "Documento observado para corrección."
    
    db.commit()
    db.refresh(doc)

    tramite = doc.tramite
    req = doc.requisito
    nombre_doc = req.nombre_documento if req else "Documento"
    estab_nombre = tramite.establecimiento.nombre_comercial if (tramite and tramite.establecimiento) else "Establecimiento"
    cod_trm = f"TRM-{str(tramite.id)[:8].upper()}" if tramite else "TRM-0000"

    # No registrar aprobaciones individuales de documentos en el historial general (solo eventos clave de trámites)
    if payload.estado in ["Rechazado", "Observado"]:
        badge = "bg-rose-50 text-rose-700 border-rose-200" if payload.estado == "Rechazado" else "bg-amber-50 text-amber-700 border-amber-200"
        ahora_formato = datetime.now().strftime("%d %b %Y - %H:%M")
        obs_texto = f" Obs: {payload.observacion}" if payload.observacion else ""
        nuevo_log = models.HistorialActividad(
            id=uuid.uuid4(),
            codigo_tramite=cod_trm,
            establecimiento=estab_nombre,
            accion=f"Observación de requisito: {nombre_doc}.{obs_texto}",
            responsable=payload.responsable or "Dra. Claudia Morales V.",
            estado_resultado=payload.estado,
            estado_badge=badge,
            fecha_hora_formato=ahora_formato
        )
        db.add(nuevo_log)

    # Notificar al propietario en tiempo real
    try:
        from notificaciones import crear_notificacion_db
        if tramite and tramite.establecimiento and tramite.establecimiento.propietario_id:
            prop_id = tramite.establecimiento.propietario_id
            if payload.estado in ["Observado", "Rechazado"]:
                obs_detalle = f" Motivo: '{payload.observacion}'." if payload.observacion else ""
                crear_notificacion_db(
                    db,
                    usuario_id=prop_id,
                    titulo=f"⚠️ Documento Observado: {nombre_doc}",
                    mensaje=f"El documento '{nombre_doc}' de su trámite para '{estab_nombre}' ha sido {payload.estado.lower()}.{obs_detalle} Por favor ingrese a la sección 'Trámites' para subsanar y volver a subir el archivo corregido en PDF."
                )
            elif payload.estado == "Aprobado":
                crear_notificacion_db(
                    db,
                    usuario_id=prop_id,
                    titulo=f"✓ Documento Aprobado: {nombre_doc}",
                    mensaje=f"El documento '{nombre_doc}' de su establecimiento '{estab_nombre}' ha sido verificado y aprobado satisfactoriamente por Coordinación."
                )
    except Exception as e:
        print(f"Error al generar notificación de documento: {e}")

    db.commit()

    return {
        "mensaje": f"Documento '{nombre_doc}' marcado como {payload.estado}.",
        "documento_id": str(doc.id),
        "estado": doc.estado_validacion,
        "observaciones": doc.observaciones_supervisor
    }

@router.post("/tramites/{tramite_id}/reinspeccion", summary="Agendar Re-Inspección Técnica")
def agendar_reinspeccion(
    tramite_id: str,
    payload: AgendarReinspeccionRequest,
    db: Session = Depends(get_db)
):
    """Programa una re-inspección de campo en la base de datos PostgreSQL y registra auditoría."""
    tramite = None
    try:
        t_uuid = uuid.UUID(tramite_id)
        tramite = db.query(models.Tramite).filter(models.Tramite.id == t_uuid).first()
    except ValueError:
        pass

    if not tramite:
        clean_code = tramite_id.replace("TRM-", "").replace("REQ-", "").strip().lower()
        tramites = db.query(models.Tramite).filter(models.Tramite.estado == True).all()
        for t in tramites:
            if str(t.id).lower().startswith(clean_code):
                tramite = t
                break

    if not tramite:
        raise HTTPException(status_code=404, detail="Trámite no encontrado.")

    # Buscar supervisor por nombre o asignar
    supervisor = db.query(models.Usuario).join(models.Role).filter(
        models.Role.nombre == "Supervisor",
        (models.Usuario.nombres + " " + models.Usuario.apellidos).ilike(f"%{payload.supervisor.replace('Ing.', '').replace('Dra.', '').replace('Lic.', '').strip()}%")
    ).first()

    if supervisor:
        tramite.supervisor_asignado_id = supervisor.id

    tramite.estado_tramite = "Re-Inspección Programada"

    # Crear o actualizar inspección en PostgreSQL
    try:
        fecha_dt = datetime.strptime(f"{payload.fecha} {payload.hora}", "%Y-%m-%d %H:%M")
    except Exception:
        fecha_dt = datetime.now()

    nueva_inspeccion = models.Inspeccion(
        id=uuid.uuid4(),
        tramite_id=tramite.id,
        supervisor_id=supervisor.id if supervisor else tramite.supervisor_asignado_id or tramite.establecimiento.propietario_id,
        fecha_programada=fecha_dt,
        estado_inspeccion="Reprogramada",
        veredicto_final="Con Observaciones"
    )
    db.add(nueva_inspeccion)
    db.commit()
    db.refresh(tramite)

    estab_nombre = tramite.establecimiento.nombre_comercial if tramite.establecimiento else "Establecimiento"
    cod_trm = f"TRM-{str(tramite.id)[:8].upper()}"
    ahora_formato = datetime.now().strftime("%d %b %Y - %H:%M")

    nuevo_log = models.HistorialActividad(
        id=uuid.uuid4(),
        codigo_tramite=cod_trm,
        establecimiento=estab_nombre,
        accion=f"Re-inspección técnica agendada para el {payload.fecha} a las {payload.hora}. Inspector: {payload.supervisor}. Motivo: {payload.motivo}",
        responsable=payload.responsable or "Dra. Claudia Morales V.",
        estado_resultado="Asignado",
        estado_badge="bg-sky-50 text-sky-700 border-sky-200",
        fecha_hora_formato=ahora_formato
    )
    db.add(nuevo_log)

    # Notificar al supervisor y al propietario
    try:
        from notificaciones import crear_notificacion_db
        if supervisor:
            crear_notificacion_db(
                db,
                usuario_id=supervisor.id,
                titulo="📅 Inspección Técnica Agendada",
                mensaje=f"Se le ha programado visita de inspección in situ en '{estab_nombre}' para el {payload.fecha} a las {payload.hora}. Motivo: {payload.motivo}"
            )
        if tramite.establecimiento and tramite.establecimiento.propietario_id:
            crear_notificacion_db(
                db,
                usuario_id=tramite.establecimiento.propietario_id,
                titulo="📅 Visita de Inspección Programada",
                mensaje=f"Se ha agendado la inspección de campo de su establecimiento '{estab_nombre}' para el día {payload.fecha} a las {payload.hora} con el inspector {payload.supervisor}."
            )
    except Exception as e:
        print(f"Error al notificar re-inspección: {e}")

    db.commit()

    return {
        "mensaje": f"Re-inspección asignada exitosamente a {payload.supervisor} para el {payload.fecha}.",
        "tramite": serializar_tramite_coordinador(tramite, db)
    }

@router.post("/tramites/{tramite_id}/aprobar", summary="Emitir Aprobación Oficial y Resolución en PostgreSQL")
def aprobar_tramite(
    tramite_id: str,
    payload: AprobarTramiteRequest,
    db: Session = Depends(get_db)
):
    """Aprueba el trámite emitiendo la resolución administrativa oficial y habilitando el establecimiento."""
    tramite = None
    try:
        t_uuid = uuid.UUID(tramite_id)
        tramite = db.query(models.Tramite).filter(models.Tramite.id == t_uuid).first()
    except ValueError:
        pass

    if not tramite:
        clean_code = tramite_id.replace("TRM-", "").replace("REQ-", "").strip().lower()
        tramites = db.query(models.Tramite).filter(models.Tramite.estado == True).all()
        for t in tramites:
            if str(t.id).lower().startswith(clean_code):
                tramite = t
                break

    if not tramite:
        raise HTTPException(status_code=404, detail="Trámite no encontrado.")

    # 1. Validar que todos los documentos del trámite estén en estado 'Aprobado'
    docs_db = db.query(models.TramiteDocumento).filter(
        models.TramiteDocumento.tramite_id == tramite.id,
        models.TramiteDocumento.estado == True
    ).all()
    if not docs_db:
        raise HTTPException(
            status_code=400,
            detail="No se puede aprobar el trámite: El expediente no contiene documentos registrados."
        )
    
    docs_no_aprobados = [d for d in docs_db if (d.estado_validacion or "").lower() != "aprobado"]
    if docs_no_aprobados:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede aprobar el trámite: Existen {len(docs_no_aprobados)} documento(s) pendientes de aprobación o con observaciones."
        )

    # 2. Validar que un supervisor haya sido asignado
    if not tramite.supervisor_asignado_id:
        raise HTTPException(
            status_code=400,
            detail="No se puede aprobar el trámite: Debe asignar previamente un supervisor técnico para la inspección in-situ."
        )

    # 3. Validar que la inspección esté completada con acta oficial y veredicto Favorable (Aprobado)
    ultima_inspeccion = db.query(models.Inspeccion).filter(
        models.Inspeccion.tramite_id == tramite.id,
        models.Inspeccion.estado == True
    ).order_by(models.Inspeccion.fecha_creacion.desc()).first()

    if not ultima_inspeccion or not ultima_inspeccion.veredicto_final:
        raise HTTPException(
            status_code=400,
            detail="No se puede aprobar el trámite: El supervisor aún no ha emitido el acta oficial de inspección técnica."
        )

    veredicto_lower = (ultima_inspeccion.veredicto_final or "").lower()
    if veredicto_lower not in ["favorable", "aprobado"]:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede aprobar el trámite: El veredicto técnico del acta es '{ultima_inspeccion.veredicto_final}'. Solo se permite aprobación con dictamen Favorable."
        )

    tramite.estado_tramite = "Aprobado"
    if tramite.establecimiento:
        tramite.establecimiento.estado_operativo = "Habilitado"

    db.commit()
    db.refresh(tramite)

    estab_nombre = tramite.establecimiento.nombre_comercial if tramite.establecimiento else "Establecimiento"
    cod_trm = f"TRM-{str(tramite.id)[:8].upper()}"
    ahora_formato = datetime.now().strftime("%d %b %Y - %H:%M")

    nuevo_log = models.HistorialActividad(
        id=uuid.uuid4(),
        codigo_tramite=cod_trm,
        establecimiento=estab_nombre,
        accion=f"Trámite APROBADO oficialmente. Resolución emitida: {payload.codigo_resolucion} (Vigencia: {payload.vigencia_anios}).",
        responsable=payload.responsable or "Dra. Claudia Morales V.",
        estado_resultado="Aprobado",
        estado_badge="bg-emerald-50 text-emerald-700 border-emerald-200",
        fecha_hora_formato=ahora_formato
    )
    db.add(nuevo_log)

    # Notificar al propietario de la aprobación final
    try:
        from notificaciones import crear_notificacion_db
        if tramite.establecimiento and tramite.establecimiento.propietario_id:
            crear_notificacion_db(
                db,
                usuario_id=tramite.establecimiento.propietario_id,
                titulo="🎉 ¡Trámite Aprobado y Resolución Emitida!",
                mensaje=f"¡Felicitaciones! Su trámite para '{estab_nombre}' ha sido APROBADO oficialmente por Coordinación SEDES bajo la Resolución {payload.codigo_resolucion} (Vigencia: {payload.vigencia_anios})."
            )
    except Exception as e:
        print(f"Error al notificar aprobación: {e}")

    db.commit()

    return {
        "mensaje": f"¡Trámite {cod_trm} aprobado exitosamente! Resolución: {payload.codigo_resolucion}.",
        "tramite": serializar_tramite_coordinador(tramite, db)
    }

@router.post("/tramites/{tramite_id}/notificar-reingreso", summary="Notificar al propietario tras inspección rechazada para reiniciar requisitos")
def notificar_reingreso_requisitos(
    tramite_id: str,
    payload: Optional[NotificarReingresoRequest] = None,
    db: Session = Depends(get_db)
):
    """Notifica al propietario que la inspección fue desfavorable y que debe subsanar y volver a subir sus requisitos."""
    tramite = None
    try:
        t_uuid = uuid.UUID(tramite_id)
        tramite = db.query(models.Tramite).filter(models.Tramite.id == t_uuid).first()
    except ValueError:
        pass

    if not tramite:
        clean_code = tramite_id.replace("TRM-", "").replace("REQ-", "").strip().lower()
        tramites = db.query(models.Tramite).filter(models.Tramite.estado == True).all()
        for t in tramites:
            if str(t.id).lower().startswith(clean_code):
                tramite = t
                break

    if not tramite:
        raise HTTPException(status_code=404, detail="Trámite no encontrado.")

    motivo = payload.motivo if (payload and payload.motivo) else "La fiscalización técnica in situ resultó Desfavorable. Se requiere subsanación y reingreso de requisitos."
    responsable = payload.responsable if (payload and payload.responsable) else "Dra. Claudia Morales V."

    tramite.estado_tramite = "Rechazado - Requiere Reingreso"

    # Marcar los documentos como observados para habilitar su recarga por parte del usuario
    docs_db = db.query(models.TramiteDocumento).filter(
        models.TramiteDocumento.tramite_id == tramite.id,
        models.TramiteDocumento.estado == True
    ).all()
    for d in docs_db:
        d.estado_validacion = "Observado"
        d.observaciones_supervisor = f"Reingreso requerido por acta de inspección rechazada: {motivo}"

    db.commit()
    db.refresh(tramite)

    estab_nombre = tramite.establecimiento.nombre_comercial if tramite.establecimiento else "Establecimiento"
    cod_trm = f"TRM-{str(tramite.id)[:8].upper()}"
    ahora_formato = datetime.now().strftime("%d %b %Y - %H:%M")

    # Auditoría
    nuevo_log = models.HistorialActividad(
        id=uuid.uuid4(),
        codigo_tramite=cod_trm,
        establecimiento=estab_nombre,
        accion=f"Notificación de inspección rechazada enviada al propietario. Trámite reiniciado para reingreso de requisitos. Motivo: {motivo}",
        responsable=responsable,
        estado_resultado="Rechazado",
        estado_badge="bg-rose-50 text-rose-700 border-rose-200",
        fecha_hora_formato=ahora_formato
    )
    db.add(nuevo_log)

    # Notificación al propietario
    try:
        from notificaciones import crear_notificacion_db
        if tramite.establecimiento and tramite.establecimiento.propietario_id:
            crear_notificacion_db(
                db,
                usuario_id=tramite.establecimiento.propietario_id,
                titulo="❌ Inspección de Campo Rechazada - Reingreso de Requisitos Requerido",
                mensaje=f"La fiscalización técnica in-situ para '{estab_nombre}' ha sido RECHAZADA. Motivo: {motivo}. Debe ingresar a la plataforma y volver a subir todos sus requisitos actualizados para reiniciar la evaluación de su trámite."
            )
    except Exception as e:
        print(f"Error al notificar reingreso de requisitos: {e}")

    db.commit()

    return {
        "mensaje": f"Notificación enviada al propietario de '{estab_nombre}'. El trámite ha sido reiniciado para la recarga de requisitos.",
        "tramite": serializar_tramite_coordinador(tramite, db)
    }

@router.post("/tramites/{tramite_id}/pasar-a-informe-tecnico", summary="Mover trámite a Informe Técnico tras validación completa")
def pasar_tramite_a_informe_tecnico(
    tramite_id: str,
    payload: Optional[PasarInformeTecnicoRequest] = None,
    db: Session = Depends(get_db)
):
    """Marca el trámite como 'En Informe Técnico' para que aparezca en el módulo de Informe Técnico."""
    tramite = None
    try:
        t_uuid = uuid.UUID(tramite_id)
        tramite = db.query(models.Tramite).filter(models.Tramite.id == t_uuid).first()
    except ValueError:
        pass

    if not tramite:
        clean_code = tramite_id.replace("TRM-", "").replace("REQ-", "").strip().lower()
        tramites = db.query(models.Tramite).filter(models.Tramite.estado == True).all()
        for t in tramites:
            if str(t.id).lower().startswith(clean_code):
                tramite = t
                break

    if not tramite:
        raise HTTPException(status_code=404, detail="Trámite no encontrado.")

    # Validar que todos los documentos estén aprobados
    docs_db = db.query(models.TramiteDocumento).filter(
        models.TramiteDocumento.tramite_id == tramite.id,
        models.TramiteDocumento.estado == True
    ).all()
    docs_pendientes = [d for d in docs_db if (d.estado_validacion or "").lower() != "aprobado"]
    if docs_pendientes:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede emitir informe: Hay {len(docs_pendientes)} documentos pendientes de validación."
        )

    if not tramite.supervisor_asignado_id:
        raise HTTPException(
            status_code=400,
            detail="No se puede emitir informe: No se ha asignado un supervisor para la fiscalización técnica."
        )

    ultima_inspeccion = db.query(models.Inspeccion).filter(
        models.Inspeccion.tramite_id == tramite.id,
        models.Inspeccion.estado == True
    ).order_by(models.Inspeccion.fecha_creacion.desc()).first()

    if not ultima_inspeccion or not ultima_inspeccion.veredicto_final:
        raise HTTPException(
            status_code=400,
            detail="No se puede emitir informe: El supervisor aún no ha emitido el acta oficial de inspección técnica."
        )

    veredicto_lower = (ultima_inspeccion.veredicto_final or "").lower()
    if veredicto_lower not in ["favorable", "aprobado"]:
        raise HTTPException(
            status_code=400,
            detail=f"No se puede emitir informe: El veredicto técnico es '{ultima_inspeccion.veredicto_final}'. Solo se permite con dictamen Favorable."
        )

    tramite.estado_tramite = "En Informe Técnico"
    db.commit()
    db.refresh(tramite)

    estab_nombre = tramite.establecimiento.nombre_comercial if tramite.establecimiento else "Establecimiento"
    cod_trm = f"TRM-{str(tramite.id)[:8].upper()}"
    ahora_formato = datetime.now().strftime("%d %b %Y - %H:%M")
    resp = (payload and payload.responsable) or "Dra. Claudia Morales V."

    nuevo_log = models.HistorialActividad(
        id=uuid.uuid4(),
        codigo_tramite=cod_trm,
        establecimiento=estab_nombre,
        accion="Trámite habilitado y derivado a Informe Técnico tras cumplimiento del 100% de requisitos y acta técnica favorable.",
        responsable=resp,
        estado_resultado="En Informe Técnico",
        estado_badge="bg-sky-50 text-sky-700 border-sky-200",
        fecha_hora_formato=ahora_formato
    )
    db.add(nuevo_log)
    db.commit()

    return {
        "mensaje": f"Trámite {cod_trm} ('{estab_nombre}') enviado a Informe Técnico exitosamente.",
        "tramite": serializar_tramite_coordinador(tramite, db)
    }

@router.post("/tramites/{tramite_id}/derivar-legal", summary="Derivar Informe Técnico a Asesoría Legal en PostgreSQL")
def derivar_area_legal(
    tramite_id: str,
    payload: DerivarAreaLegalRequest,
    db: Session = Depends(get_db)
):
    """Registra la derivación formal del Informe Técnico (Comunicación Interna) a la Unidad de Asesoría Legal."""
    tramite = None
    try:
        t_uuid = uuid.UUID(tramite_id)
        tramite = db.query(models.Tramite).filter(models.Tramite.id == t_uuid).first()
    except ValueError:
        pass

    if not tramite:
        clean_code = tramite_id.replace("TRM-", "").replace("REQ-", "").strip().lower()
        tramites = db.query(models.Tramite).filter(models.Tramite.estado == True).all()
        for t in tramites:
            if str(t.id).lower().startswith(clean_code):
                tramite = t
                break

    if not tramite:
        raise HTTPException(status_code=404, detail="Trámite no encontrado.")

    tramite.estado_tramite = "Derivado a Asesoría Legal"
    db.commit()
    db.refresh(tramite)

    estab_nombre = tramite.establecimiento.nombre_comercial if tramite.establecimiento else "Establecimiento"
    cod_trm = f"TRM-{str(tramite.id)[:8].upper()}"
    ahora_formato = datetime.now().strftime("%d %b %Y - %H:%M")
    # Guardar/Actualizar expediente técnico en ResolucionAdministrativa para revisión del Asesor Legal
    estab = tramite.establecimiento
    prop = estab.propietario if estab else None
    prop_nom = f"{prop.nombres} {prop.apellidos}" if prop else "Propietario Registrado"
    prop_ci = prop.ci_nit if prop else ""
    regente_nom = estab.responsable_laboratorio if (estab and estab.responsable_laboratorio) else prop_nom
    
    num_res_default = f"RA-2026-{str(tramite.id)[:4].upper()}"
    resol = db.query(models.ResolucionAdministrativa).filter(
        models.ResolucionAdministrativa.tramite_id == tramite.id
    ).first()

    abogado_user = db.query(models.Usuario).join(models.Role).filter(models.Role.nombre.ilike("%Abogado%")).first()

    if not resol:
        resol = models.ResolucionAdministrativa(
            id=uuid.uuid4(),
            numero_resolucion=num_res_default,
            tramite_id=tramite.id,
            establecimiento_id=estab.id if estab else uuid.uuid4(),
            abogado_id=abogado_user.id if abogado_user else None,
            establecimiento_nombre=estab.nombre_comercial if estab else "Establecimiento",
            razon_social_propietario=prop_nom,
            ci_nit_solicitante=prop_ci,
            tipo_establecimiento=estab.tipo if estab else "Laboratorio Clínico",
            direccion_registrada=estab.direccion if estab else "Cochabamba",
            regente_tecnico=regente_nom,
            ci_regente=prop_ci,
            cite_informe=cite,
            observaciones_coordinador=payload.observaciones or "Habiéndose verificado tanto el cumplimiento estricto de la carpeta legal como la conformidad en el informe de campo emitido por el supervisor de área, se concluye que el establecimiento cuenta con las garantías técnicas requeridas para su normal funcionamiento.",
            dictamen_coordinador=payload.dictamen or "Favorabilidad Concedida (Favorable)",
            destinatario_informe=payload.destinatario or "Dr. Marco Villanueva - ASESOR LEGAL",
            coordinador_nombre=payload.responsable or "Dra. Claudia Morales Valenzuela",
            fecha_informe=date.today(),
            estado_resolucion="Pendiente de Revisión"
        )
        db.add(resol)
    else:
        resol.cite_informe = cite
        resol.observaciones_coordinador = payload.observaciones or resol.observaciones_coordinador
        resol.dictamen_coordinador = payload.dictamen or resol.dictamen_coordinador
        resol.destinatario_informe = payload.destinatario or resol.destinatario_informe
        resol.coordinador_nombre = payload.responsable or resol.coordinador_nombre
        resol.fecha_informe = date.today()
        resol.regente_tecnico = regente_nom
        resol.ci_regente = prop_ci
        if resol.estado_resolucion not in ["Aprobado", "Emitido"]:
            resol.estado_resolucion = "Pendiente de Revisión"

    nuevo_log = models.HistorialActividad(
        id=uuid.uuid4(),
        codigo_tramite=cod_trm,
        establecimiento=estab_nombre,
        accion=f"Informe Técnico ({cite}) derivado formalmente a Asesoría Legal con Dictamen '{payload.dictamen}'. {payload.observaciones or ''}",
        responsable=payload.responsable or "Dra. Claudia Morales V.",
        estado_resultado="Derivado",
        estado_badge="bg-indigo-50 text-indigo-700 border-indigo-200",
        fecha_hora_formato=ahora_formato
    )
    db.add(nuevo_log)

    # Notificar a los asesores legales y al propietario
    try:
        from notificaciones import crear_notificacion_db
        abogados = db.query(models.Usuario).join(models.Role).filter(models.Role.nombre.ilike("%Abogado%")).all()
        for ab in abogados:
            crear_notificacion_db(
                db,
                usuario_id=ab.id,
                titulo=f"📑 Nuevo Informe Técnico Recibido: {estab_nombre}",
                mensaje=f"Se ha derivado el Informe Técnico {cite} para '{estab_nombre}' ({cod_trm}) con dictamen favorable para la emisión de Resolución Administrativa."
            )
    except Exception as e:
        print(f"Error al notificar derivación a área legal: {e}")

    db.commit()

    return {
        "mensaje": f"¡Informe Técnico {cite} derivado con éxito a Asesoría Legal para '{estab_nombre}'!",
        "tramite": serializar_tramite_coordinador(tramite, db)
    }

# ==============================================================================
# 2. ASIGNACIÓN DE SUPERVISORES REALES DE SEDES
# ==============================================================================

@router.get("/supervisores", summary="Listar supervisores de campo reales y carga operativa")
def listar_supervisores_campo(db: Session = Depends(get_db)):
    """Retorna los supervisores institucionales registrados en la base de datos con su carga real."""
    supervisores_db = db.query(models.Usuario).join(models.Role).filter(
        models.Role.nombre == "Supervisor",
        models.Usuario.estado == True
    ).order_by(models.Usuario.apellidos.asc()).all()

    resultados = []
    for s in supervisores_db:
        # Calcular trámites asignados activos
        asignados_count = db.query(models.Tramite).filter(
            models.Tramite.supervisor_asignado_id == s.id,
            models.Tramite.estado == True,
            models.Tramite.estado_tramite.notin_(["Aprobado", "Rechazado"])
        ).count()

        # Extraer iniciales
        nombre_completo = f"{s.nombres} {s.apellidos}"
        clean_name = nombre_completo.replace("Ing.", "").replace("Dra.", "").replace("Lic.", "").replace("Dr.", "").strip()
        words = clean_name.split()
        iniciales = "".join([w[0] for w in words[:2]]).upper() if words else "SP"

        resultados.append({
            "id": str(s.id),
            "iniciales": iniciales,
            "nombre": nombre_completo,
            "email": s.email,
            "telefono": s.telefono or "+591 4 4256789",
            "especialidad": "Laboratorios Clínicos / Farmacias",
            "asignados": asignados_count,
            "maxCapacidad": 5,
            "zona": "Cochabamba - Departamental"
        })

    return {
        "total": len(resultados),
        "supervisores": resultados
    }

@router.get("/tramites-asignacion", summary="Listar trámites reales para asignación de supervisor")
def listar_tramites_asignacion(db: Session = Depends(get_db)):
    """Retorna los trámites reales que requieren supervisión técnica."""
    tramites = db.query(models.Tramite).filter(
        models.Tramite.estado == True
    ).order_by(models.Tramite.fecha_creacion.desc()).all()

    resultados = []
    for t in tramites:
        estab = t.establecimiento
        sup = t.supervisor_asignado
        f_ingreso = t.fecha_ingreso.strftime("%d %b %Y") if t.fecha_ingreso else (
            t.fecha_creacion.strftime("%d %b %Y") if t.fecha_creacion else "Hoy"
        )
        sup_nombre = f"{sup.nombres} {sup.apellidos}" if sup else ""

        esta_asignado = bool(t.supervisor_asignado_id)

        resultados.append({
            "codigo": f"TRM-{str(t.id)[:8].upper()}",
            "tramite_uuid": str(t.id),
            "establecimiento": estab.nombre_comercial if estab else "Establecimiento",
            "municipio": estab.municipio if estab else "CERCADO",
            "tipo": t.tipo_tramite or "Apertura",
            "estado": t.estado_tramite or "Pendiente",
            "fechaIngreso": f_ingreso,
            "supervisorAsignado": sup_nombre,
            "supervisor_id": str(sup.id) if sup else "",
            "yaAsignado": esta_asignado
        })

    return {
        "total": len(resultados),
        "tramites": resultados
    }

@router.post("/asignar-supervisor", summary="Asignar un supervisor a un trámite en PostgreSQL")
def asignar_supervisor(
    payload: AsignarSupervisorRequest,
    db: Session = Depends(get_db)
):
    """Asigna un supervisor al trámite en la base de datos relacional y programa inspección."""
    tramite = None
    try:
        t_uuid = uuid.UUID(payload.codigo_tramite)
        tramite = db.query(models.Tramite).filter(models.Tramite.id == t_uuid).first()
    except ValueError:
        pass

    if not tramite:
        clean_code = payload.codigo_tramite.replace("TRM-", "").replace("REQ-", "").strip().lower()
        tramites = db.query(models.Tramite).filter(models.Tramite.estado == True).all()
        for t in tramites:
            if str(t.id).lower().startswith(clean_code):
                tramite = t
                break

    if not tramite:
        raise HTTPException(status_code=404, detail="Trámite no encontrado en la base de datos.")

    # Validar que no haya sido asignado previamente
    if tramite.supervisor_asignado_id is not None:
        sup_actual = tramite.supervisor_asignado
        sup_act_nombre = f"{sup_actual.nombres} {sup_actual.apellidos}" if sup_actual else "un supervisor oficial"
        raise HTTPException(
            status_code=400,
            detail=f"El trámite ya fue asignado previamente a {sup_act_nombre} y no puede ser reasignado."
        )

    # Buscar supervisor por ID o por nombre
    supervisor = None
    try:
        s_uuid = uuid.UUID(payload.supervisor_nombre)
        supervisor = db.query(models.Usuario).filter(models.Usuario.id == s_uuid).first()
    except ValueError:
        pass

    if not supervisor:
        clean_sup = payload.supervisor_nombre.replace("Ing.", "").replace("Dra.", "").replace("Lic.", "").replace("Dr.", "").strip()
        supervisor = db.query(models.Usuario).join(models.Role).filter(
            models.Role.nombre == "Supervisor",
            (models.Usuario.nombres + " " + models.Usuario.apellidos).ilike(f"%{clean_sup}%")
        ).first()

    if not supervisor:
        raise HTTPException(status_code=404, detail="Supervisor institucional no encontrado.")

    # Asignar supervisor y actualizar estado
    tramite.supervisor_asignado_id = supervisor.id
    if tramite.estado_tramite in ["Pendiente", "Esperando Revisión"]:
        tramite.estado_tramite = "Inspección Programada"

    # Crear registro de inspección inicial si no existe
    insp_existente = db.query(models.Inspeccion).filter(
        models.Inspeccion.tramite_id == tramite.id,
        models.Inspeccion.estado == True
    ).first()

    if not insp_existente:
        nueva_insp = models.Inspeccion(
            id=uuid.uuid4(),
            tramite_id=tramite.id,
            supervisor_id=supervisor.id,
            fecha_programada=datetime.now(),
            estado_inspeccion="Pendiente",
            veredicto_final="Pendiente de Inspección"
        )
        db.add(nueva_insp)

    db.commit()
    db.refresh(tramite)

    sup_nombre = f"{supervisor.nombres} {supervisor.apellidos}"
    estab_nombre = tramite.establecimiento.nombre_comercial if tramite.establecimiento else "Establecimiento"
    cod_trm = f"TRM-{str(tramite.id)[:8].upper()}"
    ahora_formato = datetime.now().strftime("%d %b %Y - %H:%M")

    # Registrar en auditoría
    nuevo_log = models.HistorialActividad(
        id=uuid.uuid4(),
        codigo_tramite=cod_trm,
        establecimiento=estab_nombre,
        accion=f"Trámite asignado a {sup_nombre} para auditoría e inspección técnica in situ.",
        responsable=payload.responsable or "Dra. Claudia Morales V.",
        estado_resultado="Asignado",
        estado_badge="bg-sky-50 text-sky-700 border-sky-200",
        fecha_hora_formato=ahora_formato
    )
    db.add(nuevo_log)

    # Notificar al supervisor y al propietario
    try:
        from notificaciones import crear_notificacion_db
        crear_notificacion_db(
            db,
            usuario_id=supervisor.id,
            titulo="📋 Nuevo Trámite Asignado",
            mensaje=f"Se le ha asignado el trámite {cod_trm} de '{estab_nombre}' ({tramite.establecimiento.municipio}) para auditoría e inspección técnica in situ."
        )
        if tramite.establecimiento and tramite.establecimiento.propietario_id:
            crear_notificacion_db(
                db,
                usuario_id=tramite.establecimiento.propietario_id,
                titulo="Supervisor Técnico Asignado",
                mensaje=f"Se ha asignado a {sup_nombre} como supervisor técnico para la fiscalización de su establecimiento '{estab_nombre}'."
            )
    except Exception as e:
        print(f"Error al notificar asignación de supervisor: {e}")

    db.commit()

    return {
        "mensaje": f"Trámite {cod_trm} asignado exitosamente a {sup_nombre}.",
        "tramite_id": str(tramite.id),
        "supervisor_nombre": sup_nombre
    }

# ==============================================================================
# 3. HISTORIAL Y TRAZABILIDAD (AUDITORÍA REAL)
# ==============================================================================

@router.get("/historial", summary="Consultar bitácora real de auditoría y trazabilidad")
def consultar_historial(
    buscar: Optional[str] = Query(None, description="Término de búsqueda"),
    estado: Optional[str] = Query("Todos", description="Filtrar por estado"),
    supervisor: Optional[str] = Query("Todos", description="Filtrar por supervisor"),
    desde: Optional[str] = Query(None, description="Fecha inicial ISO"),
    hasta: Optional[str] = Query(None, description="Fecha final ISO"),
    pagina: int = Query(1, ge=1),
    limite: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Consulta la bitácora real de movimientos y auditoría con filtros multicriterio (solo eventos de trámites)."""
    query = db.query(models.HistorialActividad).filter(
        models.HistorialActividad.estado == True,
        ~models.HistorialActividad.accion.ilike("%Documento aprobado%")
    ).order_by(desc(models.HistorialActividad.fecha_creacion))

    if buscar and buscar.strip():
        termino = f"%{buscar.strip()}%"
        query = query.filter(
            (models.HistorialActividad.codigo_tramite.ilike(termino)) |
            (models.HistorialActividad.establecimiento.ilike(termino)) |
            (models.HistorialActividad.accion.ilike(termino))
        )

    if estado and estado != "Todos":
        query = query.filter(models.HistorialActividad.estado_resultado.ilike(f"%{estado.strip()}%"))

    if supervisor and supervisor != "Todos":
        clean_sup = supervisor.replace("Ing.", "").replace("Dra.", "").replace("Lic.", "").replace("Dr.", "").strip()
        query = query.filter(models.HistorialActividad.responsable.ilike(f"%{clean_sup}%"))

    total_registros = query.count()
    offset = (pagina - 1) * limite
    registros_db = query.offset(offset).limit(limite).all()

    resultados = [
        {
            "id": str(r.id),
            "fechaHora": r.fecha_hora_formato or (r.fecha_creacion.strftime("%d %b %Y - %H:%M") if r.fecha_creacion else "Reciente"),
            "codigo": r.codigo_tramite,
            "establecimiento": r.establecimiento,
            "accion": r.accion,
            "responsable": r.responsable,
            "estado": r.estado_resultado,
            "estadoBadge": r.estado_badge or "bg-sky-50 text-sky-700 border-sky-200"
        }
        for r in registros_db
    ]

    return {
        "total": total_registros,
        "pagina": pagina,
        "limite": limite,
        "total_paginas": max(1, (total_registros + limite - 1) // limite),
        "actividades": resultados
    }
