import uuid
from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import desc

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
    estado: str = Field(..., description="Nuevo estado: 'Aprobado', 'Observado', 'Pendiente'")
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
    responsable: Optional[str] = "Lic. Patricia Rojas"

# ==============================================================================
# DATOS SEMILLA EN MEMORIA / BASE DE DATOS
# ==============================================================================

SEED_TRAMITES = [
    {
        "id": "REQ-0041",
        "tipo": "Apertura",
        "tipoBadgeColor": "bg-cyan-50 text-cyan-700 border-cyan-200",
        "fecha": "11 Ago 2026",
        "fechaISO": "2026-08-11",
        "establecimiento": "Farmacia Nova",
        "categoria": "Farmacia / Botica Privada",
        "propietario": "Lic. Mariana Dávila Pardo",
        "direccion": "Av. América Este #842, Zona Cala Cala, Cochabamba",
        "estado": "Esperando Revisión",
        "estadoColor": "bg-amber-100 text-amber-800 border-amber-300",
        "supervisorAsignado": "Dra. Patricia Valenzuela",
        "fechaInspeccion": "10/08/2026",
        "veredictoSupervisor": "FAVORABLE",
        "documentos": [
            { "id": "lic_mun", "nombre": "Licencia Municipal", "estado": "Aprobado", "numRegistro": "MUN-CBA-2026-7731", "fechaEmision": "02 de Agosto de 2026" },
            { "id": "plan_arq", "nombre": "Plano Arquitectónico", "estado": "Aprobado", "numRegistro": "COL-ARQ-8821", "fechaEmision": "28 de Julio de 2026" },
            { "id": "cert_san", "nombre": "Certificado Sanitario", "estado": "Aprobado", "numRegistro": "CS-SEDES-2026-302", "fechaEmision": "05 de Agosto de 2026" },
            { "id": "cont_alq", "nombre": "Contrato de Alquiler", "estado": "Aprobado", "numRegistro": "NOT-12-P-902", "fechaEmision": "15 de Julio de 2026" },
            { "id": "senasag", "nombre": "Registro de SENASAG", "estado": "Aprobado", "numRegistro": "SENASAG-CBA-1109", "fechaEmision": "01 de Agosto de 2026" }
        ],
        "observacionesSupervisor": [
            "Área de dispensación cumple con estándares de ventilación e iluminación.",
            "Almacén de medicamentos cuenta con termohidrómetros calibrados.",
            "Documentación del regente farmacéutico al día."
        ]
    },
    {
        "id": "REQ-0042",
        "tipo": "Renovación",
        "tipoBadgeColor": "bg-sky-50 text-sky-700 border-sky-200",
        "fecha": "12 Ago 2026",
        "fechaISO": "2026-08-12",
        "establecimiento": "Clínica Sur",
        "categoria": "Establecimiento de Salud de 2do Nivel",
        "propietario": "Dr. Roberto Salvatierra Flores",
        "direccion": "Av. Rector #105, Zona Queru Queru, Cochabamba",
        "estado": "Esperando Revisión",
        "estadoColor": "bg-amber-100 text-amber-800 border-amber-300",
        "supervisorAsignado": "Ing. Carlos Ruiz",
        "fechaInspeccion": "11/08/2026",
        "veredictoSupervisor": "CON OBSERVACIONES",
        "documentos": [
            { "id": "lic_mun", "nombre": "Licencia de Funcionamiento", "estado": "Aprobado", "numRegistro": "MUN-CBA-2026-9912", "fechaEmision": "10 de Enero de 2026" },
            { "id": "plan_arq", "nombre": "Plano de Infraestructura", "estado": "Aprobado", "numRegistro": "COL-ARQ-3310", "fechaEmision": "12 de Enero de 2026" },
            { "id": "cert_san", "nombre": "Certificado de Bioseguridad", "estado": "Pendiente", "numRegistro": "CS-SEDES-2026-550", "fechaEmision": "01 de Agosto de 2026" },
            { "id": "cont_alq", "nombre": "Contrato Notariado de Regencia", "estado": "Aprobado", "numRegistro": "NOT-04-REG-102", "fechaEmision": "05 de Enero de 2026" },
            { "id": "senasag", "nombre": "Certificación Ambiental", "estado": "Rechazado", "numRegistro": "AMB-CBA-4401", "fechaEmision": "15 de Mayo de 2026" }
        ],
        "observacionesSupervisor": [
            "Cadena de frío en sala de reactivos presentó fluctuaciones de temperatura.",
            "Manejo de residuos biológicos requiere actualizar contrato de recolección.",
            "Personal técnico cuenta con vacunas y credenciales al día."
        ]
    },
    {
        "id": "REQ-0043",
        "tipo": "Apertura",
        "tipoBadgeColor": "bg-cyan-50 text-cyan-700 border-cyan-200",
        "fecha": "08 Ago 2026",
        "fechaISO": "2026-08-08",
        "establecimiento": "Clínica Esperanza",
        "categoria": "Policlínico de Atención Integral",
        "propietario": "Dra. Beatriz Guzmán Rios",
        "direccion": "Av. Heroínas #720 esquina 16 de Julio",
        "estado": "Esperando Revisión",
        "estadoColor": "bg-amber-100 text-amber-800 border-amber-300",
        "supervisorAsignado": "Dra. Patricia Valenzuela",
        "fechaInspeccion": "07/08/2026",
        "veredictoSupervisor": "FAVORABLE",
        "documentos": [
            { "id": "lic_mun", "nombre": "Licencia Municipal", "estado": "Aprobado", "numRegistro": "MUN-CBA-2026-4401", "fechaEmision": "05 de Febrero de 2026" },
            { "id": "plan_arq", "nombre": "Plano Arquitectónico", "estado": "Aprobado", "numRegistro": "COL-ARQ-1102", "fechaEmision": "08 de Febrero de 2026" },
            { "id": "cert_san", "nombre": "Certificado Sanitario", "estado": "Aprobado", "numRegistro": "CS-SEDES-2026-788", "fechaEmision": "10 de Febrero de 2026" },
            { "id": "cont_alq", "nombre": "Contrato de Alquiler", "estado": "Aprobado", "numRegistro": "NOT-15-CLIN-401", "fechaEmision": "02 de Febrero de 2026" },
            { "id": "senasag", "nombre": "Registro de SENASAG", "estado": "Aprobado", "numRegistro": "SENASAG-CBA-9002", "fechaEmision": "12 de Febrero de 2026" }
        ],
        "observacionesSupervisor": [
            "Instalaciones en perfecto estado de conservación y limpieza.",
            "Planes de manejo de residuos biológicos debidamente implementados."
        ]
    }
]

SUPERVISORES_DATA = [
    {
        "id": "sup_1",
        "iniciales": "MV",
        "nombre": "Ing. Marco Vargas",
        "especialidad": "Laboratorios",
        "asignados": 3,
        "maxCapacidad": 5,
        "zona": "Cercado Norte & Queru Queru"
    },
    {
        "id": "sup_2",
        "iniciales": "LF",
        "nombre": "Dra. Lucía Fernández",
        "especialidad": "Farmacias",
        "asignados": 2,
        "maxCapacidad": 5,
        "zona": "Cala Cala & Sarco"
    },
    {
        "id": "sup_3",
        "iniciales": "RQ",
        "nombre": "Lic. Roberto Quiroga",
        "especialidad": "Hospitales",
        "asignados": 5,
        "maxCapacidad": 5,
        "zona": "Quillacollo & Colcapirhua"
    },
    {
        "id": "sup_4",
        "iniciales": "AT",
        "nombre": "Ing. Ana Torrez",
        "especialidad": "Clínicas",
        "asignados": 1,
        "maxCapacidad": 5,
        "zona": "Zona Sur & Central"
    }
]

TRAMITES_ASIGNACION_DATA = [
    {
        "codigo": "REQ-0042",
        "establecimiento": "Clínica Sur",
        "tipo": "Renovación",
        "fechaIngreso": "12 Ago 2026",
        "supervisorAsignado": ""
    },
    {
        "codigo": "REQ-0041",
        "establecimiento": "Farmacia Nova",
        "tipo": "Apertura",
        "fechaIngreso": "11 Ago 2026",
        "supervisorAsignado": "Dra. Lucía Fernández"
    },
    {
        "codigo": "REQ-0043",
        "establecimiento": "Lab. Génesis",
        "tipo": "Apertura",
        "fechaIngreso": "12 Ago 2026",
        "supervisorAsignado": ""
    },
    {
        "codigo": "REQ-0044",
        "establecimiento": "Hospital del Valle",
        "tipo": "Renovación",
        "fechaIngreso": "13 Ago 2026",
        "supervisorAsignado": ""
    }
]

# Inicializar historial en BD si no existen registros
def asegurar_historial_inicial(db: Session):
    try:
        count = db.query(models.HistorialActividad).count()
        if count == 0:
            historial_base = [
                models.HistorialActividad(
                    codigo_tramite="REQ-0042",
                    establecimiento="Clínica Sur",
                    accion="Documento aprobado: Licencia Municipal verificada en sistema.",
                    responsable="Lic. Patricia Rojas",
                    estado_resultado="Aprobado",
                    estado_badge="bg-emerald-50 text-emerald-700 border-emerald-200",
                    fecha_hora_formato="13 Ago 2026 - 14:30"
                ),
                models.HistorialActividad(
                    codigo_tramite="REQ-0044",
                    establecimiento="Hospital del Valle",
                    accion="Trámite asignado a Ing. Marco Vargas para inspección in situ.",
                    responsable="Lic. Patricia Rojas",
                    estado_resultado="Asignado",
                    estado_badge="bg-sky-50 text-sky-700 border-sky-200",
                    fecha_hora_formato="13 Ago 2026 - 11:15"
                ),
                models.HistorialActividad(
                    codigo_tramite="REQ-0041",
                    establecimiento="Farmacia Nova",
                    accion="Observación emitida: Plano ilegible en área de almacenamiento.",
                    responsable="Dra. Lucía Fernández",
                    estado_resultado="Observado",
                    estado_badge="bg-amber-50 text-amber-700 border-amber-200",
                    fecha_hora_formato="12 Ago 2026 - 16:45"
                ),
                models.HistorialActividad(
                    codigo_tramite="REQ-0040",
                    establecimiento="Laboratorio BioTest",
                    accion="Trámite finalizado - Aprobación y Resolución RES-2026/8910 emitida.",
                    responsable="Ing. Marco Vargas",
                    estado_resultado="Aprobado",
                    estado_badge="bg-emerald-50 text-emerald-700 border-emerald-200",
                    fecha_hora_formato="11 Ago 2026 - 09:20"
                ),
                models.HistorialActividad(
                    codigo_tramite="REQ-0039",
                    establecimiento="Centro Dental Smile",
                    accion="Documento rechazado: Certificado ambiental caducado.",
                    responsable="Lic. Patricia Rojas",
                    estado_resultado="Rechazado",
                    estado_badge="bg-rose-50 text-rose-700 border-rose-200",
                    fecha_hora_formato="10 Ago 2026 - 15:30"
                )
            ]
            db.add_all(historial_base)
            db.commit()
    except Exception as e:
        print(f"Error al verificar historial inicial: {e}")
        db.rollback()


# ==============================================================================
# 1. BANDEJA DE ENTRADA Y GESTIÓN DE TRÁMITES
# ==============================================================================

@router.get("/tramites", summary="Listar trámites pendientes para el Coordinador")
def listar_tramites_coordinador(db: Session = Depends(get_db)):
    """Obtiene la lista completa de trámites pendientes con sus bitácoras legal y de campo."""
    return {
        "total": len(SEED_TRAMITES),
        "tramites": SEED_TRAMITES
    }

@router.get("/tramites/{tramite_id}", summary="Obtener detalle de un trámite")
def obtener_detalle_tramite(tramite_id: str, db: Session = Depends(get_db)):
    """Retorna el expediente completo de un trámite."""
    tramite = next((t for t in SEED_TRAMITES if t["id"] == tramite_id), None)
    if not tramite:
        raise HTTPException(status_code=404, detail="Trámite no encontrado.")
    return tramite

@router.patch("/documentos/{documento_id}/validar", summary="Validar o Rechazar un Documento Legal")
def validar_documento_legal(
    documento_id: str,
    payload: ValidarDocumentoRequest,
    codigo_tramite: Optional[str] = Query("REQ-0042"),
    db: Session = Depends(get_db)
):
    """Actualiza el estado de validación de un documento y registra la auditoría."""
    tramite = next((t for t in SEED_TRAMITES if t["id"] == codigo_tramite), SEED_TRAMITES[1])
    doc = next((d for d in tramite["documentos"] if d["id"] == documento_id), None)
    
    if not doc:
        raise HTTPException(status_code=404, detail="Documento legal no encontrado.")

    doc["estado"] = payload.estado

    # Registrar en auditoría
    badge = "bg-emerald-50 text-emerald-700 border-emerald-200" if payload.estado == "Aprobado" else "bg-rose-50 text-rose-700 border-rose-200"
    ahora_formato = datetime.now().strftime("%d %b %Y - %H:%M")
    
    nuevo_log = models.HistorialActividad(
        codigo_tramite=tramite["id"],
        establecimiento=tramite["establecimiento"],
        accion=f"Documento {payload.estado.lower()}: {doc['nombre']} (Reg: {doc['numRegistro']}). {payload.observacion or ''}".strip(),
        responsable=payload.responsable or "Dra. Claudia Morales V.",
        estado_resultado=payload.estado,
        estado_badge=badge,
        fecha_hora_formato=ahora_formato
    )
    db.add(nuevo_log)
    db.commit()

    return {
        "mensaje": f"Documento '{doc['nombre']}' marcado como {payload.estado}.",
        "documento": doc,
        "tramite_id": tramite["id"]
    }

@router.post("/tramites/{tramite_id}/reinspeccion", summary="Agendar Re-Inspección Técnica")
def agendar_reinspeccion(
    tramite_id: str,
    payload: AgendarReinspeccionRequest,
    db: Session = Depends(get_db)
):
    """Programa una re-inspección de campo y notifica al supervisor asignado."""
    tramite = next((t for t in SEED_TRAMITES if t["id"] == tramite_id), None)
    if not tramite:
        raise HTTPException(status_code=404, detail="Trámite no encontrado.")

    tramite["estado"] = "Re-Inspección Programada"
    tramite["estadoColor"] = "bg-purple-100 text-purple-800 border-purple-300"
    tramite["supervisorAsignado"] = payload.supervisor
    tramite["fechaInspeccion"] = payload.fecha

    # Registrar en bitácora de auditoría
    ahora_formato = datetime.now().strftime("%d %b %Y - %H:%M")
    nuevo_log = models.HistorialActividad(
        codigo_tramite=tramite["id"],
        establecimiento=tramite["establecimiento"],
        accion=f"Re-inspección técnica agendada para el {payload.fecha} a las {payload.hora}. Inspector: {payload.supervisor}. Motivo: {payload.motivo}",
        responsable=payload.responsable or "Dra. Claudia Morales V.",
        estado_resultado="Asignado",
        estado_badge="bg-sky-50 text-sky-700 border-sky-200",
        fecha_hora_formato=ahora_formato
    )
    db.add(nuevo_log)
    db.commit()

    return {
        "mensaje": f"Re-inspección asignada exitosamente a {payload.supervisor} para el {payload.fecha}.",
        "tramite": tramite
    }

@router.post("/tramites/{tramite_id}/aprobar", summary="Emitir Aprobación Oficial y Resolución")
def aprobar_tramite(
    tramite_id: str,
    payload: AprobarTramiteRequest,
    db: Session = Depends(get_db)
):
    """Aprueba el trámite emitiendo la resolución administrativa oficial."""
    tramite = next((t for t in SEED_TRAMITES if t["id"] == tramite_id), None)
    if not tramite:
        raise HTTPException(status_code=404, detail="Trámite no encontrado.")

    tramite["estado"] = "Aprobado"
    tramite["estadoColor"] = "bg-emerald-100 text-emerald-800 border-emerald-300"

    # Registrar en bitácora de auditoría
    ahora_formato = datetime.now().strftime("%d %b %Y - %H:%M")
    nuevo_log = models.HistorialActividad(
        codigo_tramite=tramite["id"],
        establecimiento=tramite["establecimiento"],
        accion=f"Trámite APROBADO oficialmente. Resolución emitida: {payload.codigo_resolucion} (Vigencia: {payload.vigencia_anios}).",
        responsable=payload.responsable or "Dra. Claudia Morales V.",
        estado_resultado="Aprobado",
        estado_badge="bg-emerald-50 text-emerald-700 border-emerald-200",
        fecha_hora_formato=ahora_formato
    )
    db.add(nuevo_log)
    db.commit()

    return {
        "mensaje": f"¡Trámite {tramite_id} aprobado exitosamente! Resolución: {payload.codigo_resolucion}.",
        "tramite": tramite
    }

# ==============================================================================
# 2. ASIGNACIÓN DE SUPERVISORES
# ==============================================================================

@router.get("/supervisores", summary="Listar supervisores de campo y carga operativa")
def listar_supervisores_campo(db: Session = Depends(get_db)):
    """Retorna la lista de supervisores con carga operativa en tiempo real."""
    return {
        "total": len(SUPERVISORES_DATA),
        "supervisores": SUPERVISORES_DATA
    }

@router.get("/tramites-asignacion", summary="Listar trámites pendientes de asignación")
def listar_tramites_asignacion(db: Session = Depends(get_db)):
    """Retorna los trámites esperando asignación de supervisor."""
    return {
        "total": len(TRAMITES_ASIGNACION_DATA),
        "tramites": TRAMITES_ASIGNACION_DATA
    }

@router.post("/asignar-supervisor", summary="Asignar un supervisor a un trámite")
def asignar_supervisor(
    payload: AsignarSupervisorRequest,
    db: Session = Depends(get_db)
):
    """Asigna un supervisor al trámite e incrementa su carga operativa."""
    tramite = next((t for t in TRAMITES_ASIGNACION_DATA if t["codigo"] == payload.codigo_tramite), None)
    if not tramite:
        raise HTTPException(status_code=404, detail="Trámite no encontrado en la lista de asignación.")

    supervisor = next((s for s in SUPERVISORES_DATA if s["nombre"] == payload.supervisor_nombre), None)
    if not supervisor:
        raise HTTPException(status_code=404, detail="Supervisor no encontrado.")

    if supervisor["asignados"] >= supervisor["maxCapacidad"]:
        raise HTTPException(
            status_code=400,
            detail=f"El supervisor {supervisor['nombre']} ha alcanzado su capacidad máxima ({supervisor['maxCapacidad']}/{supervisor['maxCapacidad']})."
        )

    # Actualizar asignación
    tramite["supervisorAsignado"] = supervisor["nombre"]
    supervisor["asignados"] += 1

    # Registrar en auditoría
    ahora_formato = datetime.now().strftime("%d %b %Y - %H:%M")
    nuevo_log = models.HistorialActividad(
        codigo_tramite=tramite["codigo"],
        establecimiento=tramite["establecimiento"],
        accion=f"Trámite asignado a {supervisor['nombre']} para auditoría en zona {supervisor.get('zona', 'Departamental')}.",
        responsable=payload.responsable or "Lic. Patricia Rojas",
        estado_resultado="Asignado",
        estado_badge="bg-sky-50 text-sky-700 border-sky-200",
        fecha_hora_formato=ahora_formato
    )
    db.add(nuevo_log)
    db.commit()

    return {
        "mensaje": f"Trámite {payload.codigo_tramite} asignado exitosamente a {supervisor['nombre']}.",
        "tramite": tramite,
        "supervisor": supervisor
    }

# ==============================================================================
# 3. HISTORIAL Y TRAZABILIDAD (AUDITORÍA)
# ==============================================================================

@router.get("/historial", summary="Consultar bitácora de auditoría y trazabilidad")
def consultar_historial(
    buscar: Optional[str] = Query(None, description="Término de búsqueda por código o establecimiento"),
    estado: Optional[str] = Query("Todos", description="Filtrar por estado"),
    supervisor: Optional[str] = Query("Todos", description="Filtrar por supervisor"),
    desde: Optional[str] = Query(None, description="Fecha inicial ISO"),
    hasta: Optional[str] = Query(None, description="Fecha final ISO"),
    pagina: int = Query(1, ge=1),
    limite: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Consulta la bitácora de movimientos y auditoría con filtros multicriterio."""
    asegurar_historial_inicial(db)

    query = db.query(models.HistorialActividad).order_by(desc(models.HistorialActividad.fecha_creacion))

    if buscar and buscar.strip():
        termino = f"%{buscar.strip()}%"
        query = query.filter(
            (models.HistorialActividad.codigo_tramite.ilike(termino)) |
            (models.HistorialActividad.establecimiento.ilike(termino)) |
            (models.HistorialActividad.accion.ilike(termino))
        )

    if estado and estado != "Todos":
        query = query.filter(models.HistorialActividad.estado_resultado == estado)

    if supervisor and supervisor != "Todos":
        query = query.filter(models.HistorialActividad.responsable == supervisor)

    total_registros = query.count()
    offset = (pagina - 1) * limite
    registros_db = query.offset(offset).limit(limite).all()

    resultados = [
        {
            "id": str(r.id),
            "fechaHora": r.fecha_hora_formato,
            "codigo": r.codigo_tramite,
            "establecimiento": r.establecimiento,
            "accion": r.accion,
            "responsable": r.responsable,
            "estado": r.estado_resultado,
            "estadoBadge": r.estado_badge
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
