import uuid
from datetime import datetime, date, timedelta
from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_

from database import get_db
import models
from notificaciones import crear_notificacion_db, notificar_a_rol_db

router = APIRouter(
    prefix="/api/abogado",
    tags=["Asesor Legal / Abogado SEDES"]
)

MESES_ESPANOL = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
]

MESES_ABR = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
]

def formatear_fecha_es(fecha_val, con_hora=False):
    if not fecha_val:
        return "Fecha no especificada"
    if isinstance(fecha_val, datetime):
        dt = fecha_val
    elif isinstance(fecha_val, date):
        dt = datetime.combine(fecha_val, datetime.min.time())
    else:
        try:
            dt = datetime.fromisoformat(str(fecha_val))
        except Exception:
            return str(fecha_val)
    
    dia = dt.day
    mes_txt = MESES_ABR[dt.month - 1]
    año = dt.year
    if con_hora:
        return f"{dia:02d} {mes_txt} {año} - {dt.strftime('%H:%M')}"
    return f"{dia:02d} {mes_txt} {año}"

def formatear_fecha_larga(fecha_val):
    if not fecha_val:
        return "Fecha no especificada"
    if isinstance(fecha_val, datetime):
        dt = fecha_val
    elif isinstance(fecha_val, date):
        dt = datetime.combine(fecha_val, datetime.min.time())
    else:
        try:
            dt = datetime.fromisoformat(str(fecha_val))
        except Exception:
            return str(fecha_val)
    
    dia = dt.day
    mes_txt = MESES_ESPANOL[dt.month - 1]
    año = dt.year
    return f"{dia} de {mes_txt} de {año}"


# ==============================================================================
# SCHEMAS PYDANTIC
# ==============================================================================
class GuardarResolucionRequest(BaseModel):
    tramite_id: Optional[str] = None
    codigo_tramite: Optional[str] = None
    numero_resolucion: Optional[str] = None
    establecimiento_nombre: Optional[str] = None
    razon_social_propietario: Optional[str] = None
    ci_nit_solicitante: Optional[str] = None
    tipo_establecimiento: Optional[str] = None
    direccion_registrada: Optional[str] = None
    antecedentes: Optional[str] = None
    fundamento_legal: Optional[str] = None
    articulo_primero: Optional[str] = None
    articulo_segundo: Optional[str] = None
    articulo_tercero: Optional[str] = None
    observaciones_legales: Optional[str] = None
    vigencia_anios: Optional[int] = 5
    vigencia_desde: Optional[str] = None
    vigencia_hasta: Optional[str] = None
    observaciones_coordinador: Optional[str] = None
    dictamen_final: Optional[str] = "Favorabilidad Concedida (Favorable)"

class EnviarCoordinadorRequest(GuardarResolucionRequest):
    abogado_id: Optional[str] = None
    abogado_nombre: Optional[str] = "Dr. Marco Villanueva"


# ==============================================================================
# 1. LISTADO DE INFORMES RECIBIDOS / RESOLUCIONES PENDIENTES
# ==============================================================================
@router.get("/informes", summary="Obtener lista de informes técnicos para conversión en resoluciones")
def listar_informes_recibidos(db: Session = Depends(get_db)):
    """
    Retorna los informes técnicos y trámites enviados por el Coordinador
    listos para revisión jurídica y elaboración de la Resolución Administrativa.
    """
    # Trámites reales de la base de datos (priorizando los derivados a asesoría legal y más recientes)
    tramites_db = db.query(models.Tramite).join(models.Establecimiento).filter(
        models.Tramite.estado == True
    ).all()

    def obtener_prioridad_tramite(t):
        est = (t.estado_tramite or "").strip()
        if est == "Derivado a Asesoría Legal":
            return (0, -(t.fecha_ingreso.toordinal() if t.fecha_ingreso else 0))
        elif est in ["En Informe Técnico", "En Asesoría Legal"]:
            return (1, -(t.fecha_ingreso.toordinal() if t.fecha_ingreso else 0))
        elif est == "Aprobado":
            return (2, -(t.fecha_ingreso.toordinal() if t.fecha_ingreso else 0))
        else:
            return (3, -(t.fecha_ingreso.toordinal() if t.fecha_ingreso else 0))

    tramites_db = sorted(tramites_db, key=obtener_prioridad_tramite)

    # Resoluciones ya registradas
    resoluciones_db = {str(r.tramite_id): r for r in db.query(models.ResolucionAdministrativa).filter(models.ResolucionAdministrativa.estado == True).all()}

    lista_informes = []
    
    # 1. Procesar trámites reales de PostgreSQL
    for idx, t in enumerate(tramites_db, start=1):
        estab = t.establecimiento
        prop = estab.propietario if estab else None
        t_id_str = str(t.id)
        
        # Correlativo institucional
        cod_tramite = f"REQ-{str(t.id)[:4].upper()}" if len(str(t.id)) >= 4 else f"REQ-00{idx:02d}"
        
        # Verificar si ya existe resolución guardada
        resol = resoluciones_db.get(t_id_str)
        
        if resol:
            estado_proceso = resol.estado_resolucion
        elif t.estado_tramite == "Derivado a Asesoría Legal":
            estado_proceso = "Pendiente de Revisión"
        elif t.estado_tramite == "Aprobado":
            estado_proceso = "Aprobado"
        elif t.estado_tramite == "En Informe Técnico":
            estado_proceso = "En Informe Técnico"
        else:
            estado_proceso = "En Proceso" if idx <= 3 else "Pendiente de Revisión"
        
        estab_nombre = estab.nombre_comercial if estab else f"Establecimiento #{idx}"
        
        f_ingreso = t.fecha_ingreso or (t.fecha_creacion.date() if t.fecha_creacion else date.today())
        
        lista_informes.append({
            "id": t_id_str,
            "tramite_id": t_id_str,
            "codigo": cod_tramite,
            "codigo_completo": f"{cod_tramite} — {estab_nombre}",
            "titulo_card": f"{estab_nombre} — Resolución administrati...",
            "establecimiento": estab_nombre,
            "tipo_tramite": t.tipo_tramite or "Renovación",
            "fecha_ingreso": formatear_fecha_es(f_ingreso),
            "fecha_iso": f_ingreso.isoformat() if hasattr(f_ingreso, 'isoformat') else str(f_ingreso),
            "estado_proceso": estado_proceso,
            "tiene_resolucion": resol is not None,
            "numero_resolucion": resol.numero_resolucion if resol else f"RA-2026-{cod_tramite.replace('REQ-', '')}"
        })

    # Si hay pocos trámites en BD, complementar con los registros institucionales de diseño de Figma
    if len(lista_informes) < 5:
        demo_records = [
            {
                "id": "demo-req-0042",
                "tramite_id": "demo-req-0042",
                "codigo": "REQ-0042",
                "codigo_completo": "REQ-0042 — Clínica Sur",
                "titulo_card": "Clínica Sur — Resolución administrati...",
                "establecimiento": "Clínica Sur",
                "tipo_tramite": "Renovación",
                "fecha_ingreso": "12 Ago 2026",
                "fecha_iso": "2026-08-12",
                "estado_proceso": "En edición final",
                "tiene_resolucion": True,
                "numero_resolucion": "RA-2026-0042"
            },
            {
                "id": "demo-req-0041",
                "tramite_id": "demo-req-0041",
                "codigo": "REQ-0041",
                "codigo_completo": "REQ-0041 — Apertura Farmacia Nova",
                "titulo_card": "Apertura Farmacia Nova",
                "establecimiento": "Farmacia Nova",
                "tipo_tramite": "Apertura",
                "fecha_ingreso": "11 Ago 2026",
                "fecha_iso": "2026-08-11",
                "estado_proceso": "En Proceso",
                "tiene_resolucion": False,
                "numero_resolucion": "RA-2026-0041"
            },
            {
                "id": "demo-req-0040",
                "tramite_id": "demo-req-0040",
                "codigo": "REQ-0040",
                "codigo_completo": "REQ-0040 — Laboratorio BioTest",
                "titulo_card": "Laboratorio BioTest",
                "establecimiento": "Laboratorio BioTest",
                "tipo_tramite": "Renovación",
                "fecha_ingreso": "10 Ago 2026",
                "fecha_iso": "2026-08-10",
                "estado_proceso": "En Proceso",
                "tiene_resolucion": False,
                "numero_resolucion": "RA-2026-0040"
            },
            {
                "id": "demo-req-0038",
                "tramite_id": "demo-req-0038",
                "codigo": "REQ-0038",
                "codigo_completo": "REQ-0038 — Clínica Esperanza",
                "titulo_card": "Clínica Esperanza",
                "establecimiento": "Clínica Esperanza",
                "tipo_tramite": "Renovación",
                "fecha_ingreso": "08 Ago 2026",
                "fecha_iso": "2026-08-08",
                "estado_proceso": "Pendiente de Revisión",
                "tiene_resolucion": False,
                "numero_resolucion": "RA-2026-0038"
            },
            {
                "id": "demo-req-0037",
                "tramite_id": "demo-req-0037",
                "codigo": "REQ-0037",
                "codigo_completo": "REQ-0037 — Consultorio Dental El Alto",
                "titulo_card": "Consultorio Dental El Alto",
                "establecimiento": "Consultorio Dental El Alto",
                "tipo_tramite": "Apertura",
                "fecha_ingreso": "05 Ago 2026",
                "fecha_iso": "2026-08-05",
                "estado_proceso": "Pendiente de Revisión",
                "tiene_resolucion": False,
                "numero_resolucion": "RA-2026-0037"
            }
        ]
        
        # Combinar priorizando reales
        ids_existentes = {x["codigo"] for x in lista_informes}
        for dr in demo_records:
            if dr["codigo"] not in ids_existentes:
                lista_informes.append(dr)

    # Conteo de pendientes
    pendientes_count = len([x for x in lista_informes if x["estado_proceso"] != "Emitido" and x["estado_proceso"] != "Aprobado"])

    return {
        "informes": lista_informes,
        "total": len(lista_informes),
        "total_pendientes": pendientes_count
    }


# ==============================================================================
# 2. DETALLE DE INFORME TÉCNICO (VISTA 1 DE FIGMA)
# ==============================================================================
@router.get("/informe/{tramite_id}", summary="Obtener detalle técnico de informe para revisión del abogado")
def obtener_detalle_informe(tramite_id: str, db: Session = Depends(get_db)):
    """
    Retorna el informe técnico consolidado: datos del establecimiento,
    resumen de carpeta legal, dictamen de inspección de campo y observaciones del coordinador.
    """
    # Buscar trámite en BD
    tramite = None
    try:
        if "-" in tramite_id and len(tramite_id) >= 32:
            tramite = db.query(models.Tramite).filter(models.Tramite.id == uuid.UUID(tramite_id)).first()
    except Exception:
        pass

    if not tramite:
        clean_code = tramite_id.replace("TRM-", "").replace("REQ-", "").strip().lower()
        tramites = db.query(models.Tramite).filter(models.Tramite.estado == True).all()
        for t in tramites:
            if str(t.id).lower().startswith(clean_code) or str(t.id).lower() == clean_code:
                tramite = t
                break

    if not tramite and not tramite_id.startswith("demo-"):
        # Priorizar trámites en estado "Derivado a Asesoría Legal"
        tramite = db.query(models.Tramite).filter(
            models.Tramite.estado_tramite == "Derivado a Asesoría Legal"
        ).first() or db.query(models.Tramite).first()

    # Si hay trámite real
    if tramite and not tramite_id.startswith("demo-"):
        estab = tramite.establecimiento
        prop = estab.propietario if estab else None
        insp = db.query(models.Inspeccion).filter(models.Inspeccion.tramite_id == tramite.id).order_by(desc(models.Inspeccion.fecha_programada)).first()
        sup = (insp.supervisor if insp else None) or tramite.supervisor_asignado
        
        sup_nombre = f"{sup.nombres} {sup.apellidos}" if sup else "Dr. Carlos Fuentes"
        if not sup_nombre.startswith("Dr.") and not sup_nombre.startswith("Lic.") and not sup_nombre.startswith("Ing."):
            sup_nombre = f"Dr. {sup_nombre}"

        prop_nombre = f"{prop.nombres} {prop.apellidos}" if prop else "Dr. Roberto Salvatierra Flores"
        prop_ci = prop.ci_nit if prop else "4532876 CB"
        
        estab_nombre = estab.nombre_comercial if estab else "Clínica Sur"
        estab_dir = estab.direccion if estab else "Av. Rector #105, Zona Queru Queru, Cochabamba"
        estab_tipo = estab.tipo if estab else "Servicios de Medicina General y Hospitalización"
        
        cod_trm = f"REQ-{str(tramite.id)[:4].upper()}"
        
        f_insp = insp.fecha_programada if (insp and insp.fecha_programada) else date.today()
        f_insp_txt = formatear_fecha_larga(f_insp)

        # Documentos reales del trámite si existen
        docs_list = []
        if tramite.documentos:
            for td in tramite.documentos:
                req_nom = td.requisito.nombre_documento if td.requisito else "Documento Requerido"
                docs_list.append({
                    "nombre": req_nom,
                    "estado": td.estado_validacion or "Aprobado",
                    "aprobado": (td.estado_validacion or "").lower() == "aprobado"
                })
        if not docs_list:
            docs_list = [
                {"nombre": "Licencia Municipal (Vigente)", "estado": "Vigente", "aprobado": True},
                {"nombre": "Certificado Sanitario Previo", "estado": "Vigente", "aprobado": True},
                {"nombre": "Plano Arquitectónico Aprobado", "estado": "Aprobado", "aprobado": True},
                {"nombre": "Registro Vigente SENASAG", "estado": "Vigente", "aprobado": True}
            ]

        # Veredicto de supervisor
        veredicto_sup_txt = (insp.veredicto_final if insp and insp.veredicto_final else None) or "Favorable (Cumple con estándares vigentes de bioseguridad)"
        obs_campo_txt = (insp.observaciones if insp and insp.observaciones else None) or (insp.veredicto_final if insp and insp.veredicto_final else None) or "Infraestructura adecuada, manejo de residuos patógenos correcto y señalización de seguridad implementada."

        # Estado del proceso
        if tramite.estado_tramite == "Derivado a Asesoría Legal":
            estado_proceso_val = "Pendiente de Revisión"
        elif tramite.estado_tramite == "Aprobado":
            estado_proceso_val = "Aprobado"
        else:
            estado_proceso_val = "En edición final"

        return {
            "tramite_id": str(tramite.id),
            "codigo": cod_trm,
            "establecimiento_nombre": estab_nombre,
            "razon_social_propietario": prop_nombre,
            "ci_nit_solicitante": prop_ci,
            "direccion": estab_dir,
            "tipo_establecimiento": estab_tipo,
            "tipo_tramite": tramite.tipo_tramite or "Renovación",
            "documentacion_legal": docs_list,
            "inspeccion_campo": {
                "fecha": f_insp_txt,
                "supervisor": sup_nombre,
                "resultado": veredicto_sup_txt,
                "observaciones": obs_campo_txt
            },
            "observaciones_coordinador": "Habiéndose verificado tanto el cumplimiento estricto de la carpeta legal como la conformidad en el informe de campo emitido por el supervisor de área, se concluye que el establecimiento cuenta con las garantías técnicas requeridas para su normal funcionamiento.",
            "dictamen_final": "Favorabilidad Concedida (Favorable)",
            "estado_proceso": estado_proceso_val,
            "numero_resolucion": f"RA-2026-{cod_trm.replace('REQ-', '')}"
        }

    # Datos específicos por código (según capturas de Figma)
    if tramite_id == "demo-req-0041" or "0041" in tramite_id:
        return {
            "tramite_id": "demo-req-0041",
            "codigo": "REQ-0041",
            "establecimiento_nombre": "Farmacia Nova",
            "razon_social_propietario": "Lic. Marcela Gómez Torrico",
            "ci_nit_solicitante": "5198204 CB",
            "direccion": "Av. América Este #450, Zona Cala Cala, Cochabamba",
            "tipo_establecimiento": "Farmacia de Primera Categoría",
            "tipo_tramite": "Apertura",
            "documentacion_legal": [
                {"nombre": "Licencia Municipal (Vigente)", "estado": "Vigente", "aprobado": True},
                {"nombre": "Certificado Sanitario Previo", "estado": "Vigente", "aprobado": True},
                {"nombre": "Plano Arquitectónico Aprobado", "estado": "Aprobado", "aprobado": True},
                {"nombre": "Registro Vigente SENASAG", "estado": "Vigente", "aprobado": True}
            ],
            "inspeccion_campo": {
                "fecha": "11 de Agosto de 2026",
                "supervisor": "Dra. Patricia Valenzuela",
                "resultado": "Favorable (Cumple con estándares vigentes de bioseguridad)",
                "observaciones": "Área de dispensación y cadena de frío de medicamentos termolábiles en total conformidad técnica."
            },
            "observaciones_coordinador": "Se constató la documentación completa del Regente Farmacéutico y la infraestructura adecuada para apertura legal.",
            "dictamen_final": "Favorabilidad Concedida (Favorable)",
            "estado_proceso": "En Proceso",
            "numero_resolucion": "RA-2026-0041"
        }

    # Fallback predeterminado fiel a REQ-0042: Clínica Sur (Figma Imagen 1)
    return {
        "tramite_id": "demo-req-0042",
        "codigo": "REQ-0042",
        "establecimiento_nombre": "Clínica Sur",
        "razon_social_propietario": "Dr. Roberto Salvatierra Flores",
        "ci_nit_solicitante": "4532876 CB",
        "direccion": "Av. Rector #105, Zona Queru Queru, Cochabamba",
        "tipo_establecimiento": "Servicios de Medicina General y Hospitalización",
        "tipo_tramite": "Renovación",
        "documentacion_legal": [
            {"nombre": "Licencia Municipal (Vigente)", "estado": "Vigente", "aprobado": True},
            {"nombre": "Certificado Sanitario Previo", "estado": "Vigente", "aprobado": True},
            {"nombre": "Plano Arquitectónico Aprobado", "estado": "Aprobado", "aprobado": True},
            {"nombre": "Registro Vigente SENASAG", "estado": "Vigente", "aprobado": True}
        ],
        "inspeccion_campo": {
            "fecha": "14 de Agosto de 2026",
            "supervisor": "Dr. Carlos Fuentes",
            "resultado": "Favorable (Cumple con estándares vigentes de bioseguridad)",
            "observaciones": "Infraestructura adecuada, manejo de residuos patógenos correcto y señalización de seguridad implementada."
        },
        "observaciones_coordinador": "Habiéndose verificado tanto el cumplimiento estricto de la carpeta legal como la conformidad en el informe de campo emitido por el supervisor de área, se concluye que el establecimiento cuenta con las garantías técnicas requeridas para su normal funcionamiento.",
        "dictamen_final": "Favorabilidad Concedida (Favorable)",
        "estado_proceso": "En edición final",
        "numero_resolucion": "RA-2026-0042"
    }


# ==============================================================================
# 3. BORRADOR DE RESOLUCIÓN ADMINISTRATIVA (VISTA 2 DE FIGMA)
# ==============================================================================
@router.get("/resolucion-borrador/{tramite_id}", summary="Obtener el borrador estructurado de la Resolución Administrativa")
def obtener_borrador_resolucion(tramite_id: str, db: Session = Depends(get_db)):
    """
    Retorna los textos y artículos jurídicos redactados para la Resolución Administrativa (Borrador),
    listos para verificación, edición de campos, descarga en PDF o envío al Coordinador.
    """
    info = obtener_detalle_informe(tramite_id, db)
    
    cod_clean = info["codigo"].replace("REQ-", "")
    num_res = f"RA-2026-{cod_clean}"
    
    # Fechas de vigencia de 5 años
    hoy = date.today()
    f_desde = "15 Ago 2026"
    f_hasta = "15 Ago 2031"
    
    tipo_trm = info.get("tipo_tramite", "Apertura / Renovación")
    estab_upper = info["establecimiento_nombre"].upper()
    
    antecedentes_txt = (
        f"Vistos el trámite de solicitud presentado por el interesado, el Informe Técnico de Habilitación Nº INF-TEC-{cod_clean} "
        f"emitido favorablemente por el Coordinador de SEDES en fecha 14 de Agosto de 2026, donde se certifica que la inspección "
        f"de campo realizada constató el cumplimiento de todos los requisitos de infraestructura, equipamiento y bioseguridad "
        f"requeridos para el óptimo funcionamiento del establecimiento."
    )
    
    fundamento_txt = (
        "Que el Artículo 18 de la Ley de Medicamento Nº 1737 de 17 de diciembre de 1996, así como el Decreto Supremo Reglamentario "
        "Nº 25235, confieren atribuciones expresas a los Servicios Departamentales de Salud (SEDES) para autorizar y regular el "
        "funcionamiento de establecimientos de salud y conexos dentro de su jurisdicción territorial, velando por la salud pública "
        "del Estado Plurinacional de Bolivia."
    )
    
    art1_txt = (
        f"Se AUTORIZA el funcionamiento legal y la correspondiente Apertura / Renovación del establecimiento de salud denominado "
        f"{estab_upper}, bajo la representación técnica y profesional de su titular registrado."
    )
    
    art2_txt = (
        f"La presente autorización tiene vigencia de cinco (5) años a partir de su emisión, computable desde:"
    )
    
    art3_txt = (
        "El establecimiento queda sujeto a las re-inspecciones periódicas de control sanitario que la autoridad departamental "
        "considere oportunas en resguardo de la comunidad."
    )
    
    obs_legal_txt = (
        "Revisada la carpeta legal y constatándose que los antecedentes de la inspección técnica de campo gozan de plena "
        "conformidad, no encontrándose vicio ni defecto de forma jurídica, se eleva la presente Resolución administrativa para su "
        "revisión final y firma del Coordinador."
    )

    return {
        "tramite_id": info["tramite_id"],
        "codigo": info["codigo"],
        "numero_resolucion": num_res,
        "titulo_documento": f"RESOLUCIÓN ADMINISTRATIVA Nº {num_res} (Borrador)",
        "organismo": "GOBIERNO AUTÓNOMO DEPARTAMENTAL DE COCHABAMBA",
        "dependencia": "SERVICIO DEPARTAMENTAL DE SALUD (SEDES) · UNIDAD DE HABILITACIÓN",
        "datos_establecimiento": {
            "establecimiento": info["establecimiento_nombre"],
            "razon_social": info["razon_social_propietario"],
            "ci_nit": info["ci_nit_solicitante"],
            "tipo_establecimiento": info["tipo_establecimiento"],
            "direccion": info["direccion"]
        },
        "antecedentes": antecedentes_txt,
        "fundamento_legal": fundamento_txt,
        "articulo_primero": art1_txt,
        "articulo_segundo": art2_txt,
        "vigencia_desde": f_desde,
        "vigencia_hasta": f_hasta,
        "vigencia_rango": f"{f_desde} - {f_hasta}",
        "articulo_tercero": art3_txt,
        "observaciones_legales": obs_legal_txt,
        "estado_resolucion": info.get("estado_proceso", "En edición final")
    }


# ==============================================================================
# 4. GUARDAR CAMBIOS DE LA RESOLUCIÓN ADMINISTRATIVA
# ==============================================================================
@router.post("/guardar-resolucion", summary="Guardar cambios editados en el borrador de resolución")
def guardar_resolucion(payload: GuardarResolucionRequest, db: Session = Depends(get_db)):
    """
    Permite al abogado guardar modificaciones en los campos editables
    (razón social, CI/NIT, artículos o notas legales) en PostgreSQL.
    """
    # Intentar buscar trámite real o persistir
    t_id = None
    try:
        if payload.tramite_id and "-" in payload.tramite_id and not payload.tramite_id.startswith("demo"):
            t_id = uuid.UUID(payload.tramite_id)
    except Exception:
        pass

    if not t_id:
        primer_trm = db.query(models.Tramite).first()
        t_id = primer_trm.id if primer_trm else uuid.uuid4()

    estab = db.query(models.Establecimiento).first()
    estab_id = estab.id if estab else uuid.uuid4()

    abogado = db.query(models.Usuario).join(models.Role).filter(models.Role.nombre.ilike("%Abogado%")).first()
    abogado_id = abogado.id if abogado else None

    num_res = payload.numero_resolucion or f"RA-2026-0042"

    resol = db.query(models.ResolucionAdministrativa).filter(
        (models.ResolucionAdministrativa.numero_resolucion == num_res) |
        (models.ResolucionAdministrativa.tramite_id == t_id)
    ).first()

    if not resol:
        resol = models.ResolucionAdministrativa(
            numero_resolucion=num_res,
            tramite_id=t_id,
            establecimiento_id=estab_id,
            abogado_id=abogado_id,
            establecimiento_nombre=payload.establecimiento_nombre,
            razon_social_propietario=payload.razon_social_propietario,
            ci_nit_solicitante=payload.ci_nit_solicitante,
            tipo_establecimiento=payload.tipo_establecimiento,
            direccion_registrada=payload.direccion_registrada,
            antecedentes=payload.antecedentes,
            fundamento_legal=payload.fundamento_legal,
            articulo_primero=payload.articulo_primero,
            articulo_segundo=payload.articulo_segundo,
            articulo_tercero=payload.articulo_tercero,
            observaciones_legales=payload.observaciones_legales,
            estado_resolucion="En edición final"
        )
        db.add(resol)
    else:
        resol.establecimiento_nombre = payload.establecimiento_nombre or resol.establecimiento_nombre
        resol.razon_social_propietario = payload.razon_social_propietario or resol.razon_social_propietario
        resol.ci_nit_solicitante = payload.ci_nit_solicitante or resol.ci_nit_solicitante
        resol.tipo_establecimiento = payload.tipo_establecimiento or resol.tipo_establecimiento
        resol.direccion_registrada = payload.direccion_registrada or resol.direccion_registrada
        resol.antecedentes = payload.antecedentes or resol.antecedentes
        resol.fundamento_legal = payload.fundamento_legal or resol.fundamento_legal
        resol.articulo_primero = payload.articulo_primero or resol.articulo_primero
        resol.articulo_segundo = payload.articulo_segundo or resol.articulo_segundo
        resol.articulo_tercero = payload.articulo_tercero or resol.articulo_tercero
        resol.observaciones_legales = payload.observaciones_legales or resol.observaciones_legales
        resol.estado_resolucion = "En edición final"

    db.commit()

    return {
        "status": "success",
        "mensaje": f"Borrador de {num_res} guardado correctamente.",
        "numero_resolucion": num_res
    }


# ==============================================================================
# 5. ENVIAR RESOLUCIÓN AL COORDINADOR (APROBACIÓN FINAL)
# ==============================================================================
@router.post("/enviar-coordinador", summary="Elevar Resolución Administrativa al Coordinador para firma oficial")
def enviar_resolucion_coordinador(payload: EnviarCoordinadorRequest, db: Session = Depends(get_db)):
    """
    Valida legalmente el expediente y envía la Resolución Administrativa elaborada
    al Coordinador del SEDES para firma y emisión de Resolución definitiva.
    """
    num_res = payload.numero_resolucion or "RA-2026-0042"
    estab_nombre = payload.establecimiento_nombre or "Clínica Sur"
    cod_trm = payload.codigo_tramite or "REQ-0042"

    # Guardar en BD
    guardar_resolucion(payload, db)

    # Actualizar estado a 'Enviado a Coordinador'
    resol = db.query(models.ResolucionAdministrativa).filter(
        models.ResolucionAdministrativa.numero_resolucion == num_res
    ).first()
    if resol:
        resol.estado_resolucion = "Enviado a Coordinador"
        db.commit()

    # 1. Registrar evento en Historial de Auditoría (historial_actividades)
    ahora_formateado = formatear_fecha_es(datetime.now(), con_hora=True)
    actividad = models.HistorialActividad(
        codigo_tramite=cod_trm,
        establecimiento=estab_nombre,
        accion=f"Resolución Administrativa {num_res} elaborada y enviada a Coordinación para firma oficial.",
        responsable=payload.abogado_nombre or "Dr. Marco Villanueva (Asesor Legal SEDES)",
        estado_resultado="Aprobado por Legal",
        estado_badge="bg-emerald-50 text-emerald-800 border-emerald-200",
        fecha_hora_formato=ahora_formateado
    )
    db.add(actividad)

    # 2. Notificar a los Coordinadores
    notificar_a_rol_db(
        db,
        "Coordinador",
        f"⚖️ Resolución Lista para Firma: {estab_nombre}",
        f"El Asesor Legal ({payload.abogado_nombre}) ha revisado y remitido la Resolución Administrativa {num_res} para el trámite {cod_trm} ({estab_nombre})."
    )

    db.commit()

    return {
        "status": "success",
        "mensaje": f"¡Resolución Administrativa {num_res} enviada exitosamente al Coordinador!",
        "numero_resolucion": num_res,
        "estado_resultado": "Enviado a Coordinador"
    }


# ==============================================================================
# 6. HISTORIAL DE RESOLUCIONES Y TRAZABILIDAD LEGAL
# ==============================================================================
@router.get("/historial", summary="Obtener historial de resoluciones y dictámenes legales")
def obtener_historial_legal(
    search: Optional[str] = Query(None),
    estado_filtro: Optional[str] = Query("Todos"),
    db: Session = Depends(get_db)
):
    """
    Retorna el listado histórico de todas las resoluciones administrativas elaboradas,
    enviadas y emitidas en el SEDES.
    """
    resoluciones = [
        {
            "id": "1",
            "numero_resolucion": "RA-2026-0042",
            "codigo_tramite": "REQ-0042",
            "establecimiento": "Clínica Sur",
            "propietario": "Dr. Roberto Salvatierra Flores",
            "tipo_tramite": "Renovación",
            "fecha_emision": "14 Ago 2026",
            "vigencia": "5 años (2026 - 2031)",
            "estado": "Enviado a Coordinador",
            "abogado": "Dr. Marco Villanueva"
        },
        {
            "id": "2",
            "numero_resolucion": "RA-2026-0040",
            "codigo_tramite": "REQ-0040",
            "establecimiento": "Laboratorio BioTest",
            "propietario": "Dra. Carmen Rosa Salinas",
            "tipo_tramite": "Renovación",
            "fecha_emision": "11 Ago 2026",
            "vigencia": "5 años (2026 - 2031)",
            "estado": "Emitido",
            "abogado": "Dr. Marco Villanueva"
        },
        {
            "id": "3",
            "numero_resolucion": "RA-2026-0035",
            "codigo_tramite": "REQ-0035",
            "establecimiento": "Laboratorio Clínico Central",
            "propietario": "Lic. Mario Fernández",
            "tipo_tramite": "Apertura",
            "fecha_emision": "02 Ago 2026",
            "vigencia": "5 años (2026 - 2031)",
            "estado": "Emitido",
            "abogado": "Dr. Marco Villanueva"
        }
    ]

    # Cargar también de BD si existen
    resol_db = db.query(models.ResolucionAdministrativa).filter(models.ResolucionAdministrativa.estado == True).all()
    for r in resol_db:
        if r.numero_resolucion not in [x["numero_resolucion"] for x in resoluciones]:
            resoluciones.insert(0, {
                "id": str(r.id),
                "numero_resolucion": r.numero_resolucion,
                "codigo_tramite": f"REQ-{str(r.tramite_id)[:4].upper()}" if r.tramite_id else "REQ-0042",
                "establecimiento": r.establecimiento_nombre or "Establecimiento",
                "propietario": r.razon_social_propietario or "Responsable Legal",
                "tipo_tramite": "Apertura / Renovación",
                "fecha_emision": formatear_fecha_es(r.fecha_emision),
                "vigencia": f"{r.vigencia_anios or 5} años",
                "estado": r.estado_resolucion or "Enviado a Coordinador",
                "abogado": "Dr. Marco Villanueva"
            })

    if search and search.strip():
        s = search.lower()
        resoluciones = [r for r in resoluciones if s in r["establecimiento"].lower() or s in r["numero_resolucion"].lower() or s in r["codigo_tramite"].lower()]

    if estado_filtro and estado_filtro != "Todos":
        resoluciones = [r for r in resoluciones if r["estado"].lower() == estado_filtro.lower()]

    return {
        "resoluciones": resoluciones,
        "total": len(resoluciones)
    }
