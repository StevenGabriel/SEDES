from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import asc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_db
import models

router = APIRouter(tags=["Catálogo de Requisitos Normativos"])

# ==============================================================================
# SCHEMAS PYDANTIC
# ==============================================================================

class RequisitoItemOut(BaseModel):
    id: int
    texto: str
    categoria: Optional[str] = "General"
    es_obligatorio: bool = True
    esSubtitulo: bool = False
    orden: int = 1
    estado: bool = True

class SeccionRequisitosOut(BaseModel):
    id: str
    codigo: str
    titulo: str
    subtitulo: Optional[str] = ""
    requisitos: List[RequisitoItemOut] = []

class RequisitoCreate(BaseModel):
    seccion_codigo: str
    seccion_titulo: Optional[str] = None
    seccion_subtitulo: Optional[str] = None
    texto: str
    es_obligatorio: bool = True
    es_subtitulo: bool = False
    categoria: Optional[str] = "General"

class RequisitoUpdate(BaseModel):
    texto: Optional[str] = None
    es_obligatorio: Optional[bool] = None
    es_subtitulo: Optional[bool] = None
    seccion_codigo: Optional[str] = None
    seccion_titulo: Optional[str] = None
    seccion_subtitulo: Optional[str] = None
    estado: Optional[bool] = None

class SeccionCreate(BaseModel):
    codigo: str
    titulo: str
    subtitulo: Optional[str] = ""

# ==============================================================================
# SECCIONES Y REQUISITOS POR DEFECTO (SEED FALLBACK)
# ==============================================================================
DEFAULT_SECCIONES_DATA = [
    {
        "codigo": "2.1",
        "titulo": "SOLICITUD DE HABILITACIÓN",
        "subtitulo": "Formulario oficial FORM. USD-DOSS/CONALAB-001 debidamente llenado.",
        "categoria": "Habilitación",
        "requisitos": [
            {"texto": "Señalar claramente el Tipo y Nivel de complejidad solicitados.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Datos completos del profesional Bioquímico responsable.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Declaración del horario de atención propuesto para el establecimiento.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Inventario detallado de mobiliario, equipos médicos y reactivos químicos.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Inventario de manuales operativos y técnicos disponibles.", "es_obligatorio": True, "es_subtitulo": False}
        ]
    },
    {
        "codigo": "2.2",
        "titulo": "REQUISITOS LEGALES",
        "subtitulo": "Documentación habilitante y acreditación legal del personal técnico.",
        "categoria": "Legal",
        "requisitos": [
            {"texto": "Memorial dirigido al Director Departamental de Salud (SEDES).", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Título en Provisión Nacional del Bioquímico (fotocopia legalizada).", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Diploma Académico correspondiente.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Matrícula Profesional emitida por el Ministerio de Salud.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Carnet del Colegio Departamental de Bioquímica y Farmacia.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Certificado de compatibilidad horaria otorgado por el SEDES.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Cédula de Identidad vigente y fotografía tamaño carnet de fondo azul.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Contrato del Director Técnico o Regente del Laboratorio.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Contratos de los profesionales bioquímicos y especialistas adjuntos.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Título de Especialidad médica (para laboratorios de alta complejidad).", "es_obligatorio": False, "es_subtitulo": False},
            {"texto": "Contratos del personal técnico y auxiliares de laboratorio.", "es_obligatorio": True, "es_subtitulo": False}
        ]
    },
    {
        "codigo": "2.3",
        "titulo": "REQUISITOS ADMINISTRATIVOS",
        "subtitulo": "Infraestructura, registros sanitarios y normativa de higiene.",
        "categoria": "Administrativo",
        "requisitos": [
            {"texto": "Número de Identificación Tributaria (NIT) del establecimiento.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Plano detallado de distribución de instalaciones a escala.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Certificado de instalación sanitaria adecuada (desagües químicos).", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Convenio vigente para la recolección y tratamiento de residuos infecciosos.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Letrero exterior visible que identifique el nombre del laboratorio.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Copia de la Resolución Administrativa de apertura en lugar visible.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Nombres y títulos de los profesionales bioquímicos expuestos públicamente.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Instalaciones que cumplan estrictamente con las normas vigentes de higiene.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Distintivo de identificación obligatorio para todo el personal de turno.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Señalamiento explícito y público de los horarios de atención al paciente.", "es_obligatorio": True, "es_subtitulo": False}
        ]
    },
    {
        "codigo": "2.4",
        "titulo": "REQUISITOS TÉCNICOS",
        "subtitulo": "Cartera de servicios, control de calidad y manuales operativos obligatorios.",
        "categoria": "Técnico",
        "requisitos": [
            {"texto": "Lista oficial de exámenes y pruebas bioquímicas habilitadas por nivel.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Inventario certificado de mobiliario técnico, equipos de análisis, material de vidrio y reactivos.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Manual de Procedimientos Técnicos por área de análisis.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Manual de Organización y Funciones del personal administrativo y técnico.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Manual de Control de Calidad interno y externo.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Manual de Bioseguridad y gestión de riesgos sanitarios.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Manual para la toma y transporte seguro de muestras biológicas.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Convenio formal de derivación de muestras con laboratorios acreditados de mayor nivel.", "es_obligatorio": False, "es_subtitulo": False},
            {"texto": "Libros de control foliados (registro de pacientes, reportes y entrega de resultados).", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Formulario oficial 302 de notificación obligatoria del Ministerio de Salud.", "es_obligatorio": True, "es_subtitulo": False},
            {"texto": "Bibliografía científica de referencia técnica actualizada en físico o digital.", "es_obligatorio": True, "es_subtitulo": False}
        ]
    },
    {
        "codigo": "2.5",
        "titulo": "REQUISITOS FINANCIEROS",
        "subtitulo": "Tasas departamentales reguladas.",
        "categoria": "Financiero",
        "requisitos": [
            {"texto": "Cancelación de valores por derecho de Inspección y Habilitación según tasas arancelarias del SEDES dependientes del nivel de complejidad (Baja, Mediana, Alta Complejidad).", "es_obligatorio": True, "es_subtitulo": False}
        ]
    }
]

def obtener_secciones_agrupadas(db: Session, solo_activos: bool = True) -> List[dict]:
    """Helper para consultar requisitos en la BD y agruparlos por sección ordenada."""
    query = db.query(models.CatalogoRequisito)
    if solo_activos:
        query = query.filter(models.CatalogoRequisito.estado == True)
    
    items = query.order_by(
        models.CatalogoRequisito.seccion_codigo.asc(),
        models.CatalogoRequisito.orden.asc(),
        models.CatalogoRequisito.id.asc()
    ).all()

    # Si la base de datos no tiene requisitos estructurados con secciones, poblar desde DEFAULT_SECCIONES_DATA
    if not items or all(item.seccion_codigo is None for item in items):
        for sec in DEFAULT_SECCIONES_DATA:
            for idx, r in enumerate(sec["requisitos"]):
                nuevo = models.CatalogoRequisito(
                    seccion_codigo=sec["codigo"],
                    seccion_titulo=sec["titulo"],
                    seccion_subtitulo=sec["subtitulo"],
                    nombre_documento=r["texto"],
                    categoria=sec["categoria"],
                    es_obligatorio=r.get("es_obligatorio", True),
                    es_subtitulo=r.get("es_subtitulo", False),
                    orden=idx + 1,
                    estado=True
                )
                db.add(nuevo)
        db.commit()
        query = db.query(models.CatalogoRequisito)
        if solo_activos:
            query = query.filter(models.CatalogoRequisito.estado == True)
        items = query.order_by(
            models.CatalogoRequisito.seccion_codigo.asc(),
            models.CatalogoRequisito.orden.asc(),
            models.CatalogoRequisito.id.asc()
        ).all()

    # Agrupar por sección
    secciones_map = {}
    for item in items:
        cod = item.seccion_codigo or "2.1"
        if cod not in secciones_map:
            secciones_map[cod] = {
                "id": f"sec-{cod}",
                "codigo": cod,
                "titulo": item.seccion_titulo or f"SECCIÓN {cod}",
                "subtitulo": item.seccion_subtitulo or "",
                "requisitos": []
            }
        
        secciones_map[cod]["requisitos"].append({
            "id": item.id,
            "texto": item.nombre_documento,
            "categoria": item.categoria,
            "es_obligatorio": item.es_obligatorio,
            "esSubtitulo": bool(item.es_subtitulo),
            "orden": item.orden,
            "estado": item.estado
        })

    # Convertir a lista ordenada por código de sección
    return list(secciones_map.values())

# ==============================================================================
# ENDPOINTS PÚBLICOS
# ==============================================================================

@router.get("/api/requisitos/publico", response_model=List[SeccionRequisitosOut])
def listar_requisitos_publicos(db: Session = Depends(get_db)):
    """Endpoint público para la página /requisitos consultada por propietarios y público."""
    return obtener_secciones_agrupadas(db, solo_activos=True)

# ==============================================================================
# ENDPOINTS ADMINISTRATIVOS (/api/admin/requisitos)
# ==============================================================================

@router.get("/api/admin/requisitos", response_model=List[SeccionRequisitosOut])
def listar_requisitos_admin(db: Session = Depends(get_db)):
    """Lista completa de secciones y requisitos para el panel de administración."""
    return obtener_secciones_agrupadas(db, solo_activos=False)

@router.post("/api/admin/requisitos", status_code=status.HTTP_201_CREATED)
def crear_requisito(payload: RequisitoCreate, db: Session = Depends(get_db)):
    """Crear un nuevo requisito dentro de una sección normativa."""
    texto_limpio = payload.texto.strip()
    if not texto_limpio:
        raise HTTPException(status_code=400, detail="El texto del requisito no puede estar vacío.")

    # Obtener el último orden dentro de la sección
    max_orden = db.query(models.CatalogoRequisito).filter(
        models.CatalogoRequisito.seccion_codigo == payload.seccion_codigo
    ).count()

    # Si no se envía el título de la sección, buscar uno existente con ese código
    sec_existente = db.query(models.CatalogoRequisito).filter(
        models.CatalogoRequisito.seccion_codigo == payload.seccion_codigo
    ).first()

    titulo = payload.seccion_titulo or (sec_existente.seccion_titulo if sec_existente else f"SECCIÓN {payload.seccion_codigo}")
    subtitulo = payload.seccion_subtitulo if payload.seccion_subtitulo is not None else (sec_existente.seccion_subtitulo if sec_existente else "")
    categoria = payload.categoria or (sec_existente.categoria if sec_existente else "General")

    nuevo = models.CatalogoRequisito(
        seccion_codigo=payload.seccion_codigo,
        seccion_titulo=titulo,
        seccion_subtitulo=subtitulo,
        nombre_documento=texto_limpio,
        categoria=categoria,
        es_obligatorio=payload.es_obligatorio,
        es_subtitulo=payload.es_subtitulo,
        orden=max_orden + 1,
        estado=True
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    return {
        "mensaje": "Requisito agregado exitosamente.",
        "requisito": {
            "id": nuevo.id,
            "texto": nuevo.nombre_documento,
            "es_obligatorio": nuevo.es_obligatorio,
            "esSubtitulo": bool(nuevo.es_subtitulo),
            "seccion_codigo": nuevo.seccion_codigo
        }
    }

@router.put("/api/admin/requisitos/{requisito_id}")
def actualizar_requisito(requisito_id: int, payload: RequisitoUpdate, db: Session = Depends(get_db)):
    """Modificar un requisito existente (texto, obligatorio/opcional, etc.)."""
    requisito = db.query(models.CatalogoRequisito).filter(models.CatalogoRequisito.id == requisito_id).first()
    if not requisito:
        raise HTTPException(status_code=404, detail="El requisito no fue encontrado.")

    if payload.texto is not None:
        texto_limpio = payload.texto.strip()
        if not texto_limpio:
            raise HTTPException(status_code=400, detail="El texto del requisito no puede estar vacío.")
        requisito.nombre_documento = texto_limpio

    if payload.es_obligatorio is not None:
        requisito.es_obligatorio = payload.es_obligatorio

    if payload.es_subtitulo is not None:
        requisito.es_subtitulo = payload.es_subtitulo

    if payload.seccion_codigo is not None:
        requisito.seccion_codigo = payload.seccion_codigo

    if payload.seccion_titulo is not None:
        requisito.seccion_titulo = payload.seccion_titulo

    if payload.seccion_subtitulo is not None:
        requisito.seccion_subtitulo = payload.seccion_subtitulo

    if payload.estado is not None:
        requisito.estado = payload.estado

    db.commit()
    db.refresh(requisito)

    return {
        "mensaje": "Requisito actualizado correctamente.",
        "requisito": {
            "id": requisito.id,
            "texto": requisito.nombre_documento,
            "es_obligatorio": requisito.es_obligatorio,
            "esSubtitulo": bool(requisito.es_subtitulo),
            "seccion_codigo": requisito.seccion_codigo
        }
    }

@router.delete("/api/admin/requisitos/{requisito_id}")
def eliminar_requisito(requisito_id: int, db: Session = Depends(get_db)):
    """Eliminar o desactivar un requisito normativo."""
    requisito = db.query(models.CatalogoRequisito).filter(models.CatalogoRequisito.id == requisito_id).first()
    if not requisito:
        raise HTTPException(status_code=404, detail="El requisito no fue encontrado.")

    db.delete(requisito)
    db.commit()

    return {"mensaje": "Requisito eliminado exitosamente del catálogo."}

@router.post("/api/admin/requisitos/secciones", status_code=status.HTTP_201_CREATED)
def crear_seccion_requisitos(payload: SeccionCreate, db: Session = Depends(get_db)):
    """Crear una nueva sección normativa con un requisito base inicial."""
    codigo_limpio = payload.codigo.strip()
    titulo_limpio = payload.titulo.strip().upper()

    if not codigo_limpio or not titulo_limpio:
        raise HTTPException(status_code=400, detail="El código y título de la sección son requeridos.")

    # Verificar si ya existe algún requisito en esta sección
    existente = db.query(models.CatalogoRequisito).filter(
        models.CatalogoRequisito.seccion_codigo == codigo_limpio
    ).first()

    if existente:
        raise HTTPException(status_code=400, detail=f"Ya existe una sección registrada con el código '{codigo_limpio}'.")

    # Crear requisito inicial plantilla para que la sección exista en base de datos
    primer_requisito = models.CatalogoRequisito(
        seccion_codigo=codigo_limpio,
        seccion_titulo=titulo_limpio,
        seccion_subtitulo=payload.subtitulo.strip() if payload.subtitulo else "",
        nombre_documento="Requisito general de cumplimiento obligatorio según normativa departamental.",
        categoria="General",
        es_obligatorio=True,
        es_subtitulo=False,
        orden=1,
        estado=True
    )
    db.add(primer_requisito)
    db.commit()

    return {"mensaje": f"Sección {codigo_limpio} creada exitosamente."}
