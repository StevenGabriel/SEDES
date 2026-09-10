import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import or_

from database import get_db
import models

router = APIRouter(prefix="/api/tramites", tags=["Trámites y Documentos"])

# Directorio base para almacenar documentos
UPLOAD_DIR = os.path.join(os.getcwd(), "uploads", "tramites")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/{tramite_id}/documentos", summary="Subir documento PDF para un trámite")
async def subir_documento_tramite(
    tramite_id: str,
    requisito_id: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Recibe un archivo PDF para un requisito de un trámite, lo almacena
    físicamente en uploads/tramites/{tramite_id}/ y registra la metadata en tramite_documentos.
    """
    try:
        t_uuid = uuid.UUID(tramite_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de trámite inválido."
        )

    tramite = db.query(models.Tramite).filter(models.Tramite.id == t_uuid).first()
    if not tramite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trámite no encontrado."
        )

    # Validar que sea un PDF
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se admiten documentos en formato PDF."
        )

    # Resolver el requisito_id numérico en catalogo_requisitos
    req_db = None
    if requisito_id.isdigit():
        req_db = db.query(models.CatalogoRequisito).filter(
            models.CatalogoRequisito.id == int(requisito_id)
        ).first()
    
    if not req_db:
        # Si vino una clave no numérica (ej: 'req-2.1-1' o texto), buscar por coincidencia o primer activo
        req_db = db.query(models.CatalogoRequisito).filter(
            models.CatalogoRequisito.estado == True,
            models.CatalogoRequisito.es_subtitulo == False
        ).first()

    if not req_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se encontró el requisito asociado en el catálogo."
        )

    # Crear carpeta física para el trámite
    tramite_folder = os.path.join(UPLOAD_DIR, str(t_uuid))
    os.makedirs(tramite_folder, exist_ok=True)

    # Sanitizar y generar nombre de archivo seguro
    clean_name = "".join(c for c in file.filename if c.isalnum() or c in "._- ")
    filename = f"req_{req_db.id}_{uuid.uuid4().hex[:8]}_{clean_name}"
    file_path = os.path.join(tramite_folder, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    archivo_url = f"/uploads/tramites/{str(t_uuid)}/{filename}"

    # Guardar o actualizar en la tabla tramite_documentos
    doc_existente = db.query(models.TramiteDocumento).filter(
        models.TramiteDocumento.tramite_id == t_uuid,
        models.TramiteDocumento.requisito_id == req_db.id,
        models.TramiteDocumento.estado == True
    ).first()

    if doc_existente:
        doc_existente.archivo_url = archivo_url
        doc_existente.estado_validacion = "En Revisión"
        doc_existente.observaciones_supervisor = None
        db.commit()
        db.refresh(doc_existente)
        doc_res = doc_existente
    else:
        nuevo_doc = models.TramiteDocumento(
            id=uuid.uuid4(),
            tramite_id=t_uuid,
            requisito_id=req_db.id,
            archivo_url=archivo_url,
            estado_validacion="En Revisión"
        )
        db.add(nuevo_doc)
        db.commit()
        db.refresh(nuevo_doc)
        doc_res = nuevo_doc

    return {
        "mensaje": "Documento subido y registrado exitosamente.",
        "documento_id": str(doc_res.id),
        "archivo_url": archivo_url,
        "requisito_id": req_db.id,
        "nombre_archivo": file.filename
    }

@router.get("/propietario/{propietario_id}", summary="Obtener todos los trámites de un propietario con el estado de sus documentos")
def obtener_tramites_propietario(
    propietario_id: str,
    db: Session = Depends(get_db)
):
    try:
        p_uuid = uuid.UUID(propietario_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="ID de propietario inválido."
        )

    # Obtener establecimientos del propietario
    establecimientos = db.query(models.Establecimiento).filter(
        models.Establecimiento.propietario_id == p_uuid,
        models.Establecimiento.estado == True
    ).all()

    if not establecimientos:
        return []

    estab_ids = [e.id for e in establecimientos]
    estab_map = {e.id: e for e in establecimientos}

    # Obtener trámites de estos establecimientos
    tramites = db.query(models.Tramite).filter(
        models.Tramite.establecimiento_id.in_(estab_ids),
        models.Tramite.estado == True
    ).order_by(models.Tramite.fecha_creacion.desc()).all()

    # Catálogo de requisitos activos
    cat_requisitos = db.query(models.CatalogoRequisito).filter(
        models.CatalogoRequisito.estado == True,
        models.CatalogoRequisito.es_subtitulo == False
    ).order_by(models.CatalogoRequisito.orden.asc()).all()

    resultado = []
    for t in tramites:
        estab = estab_map.get(t.establecimiento_id)
        
        # Mapear documentos ya subidos para este trámite
        docs_db = db.query(models.TramiteDocumento).filter(
            models.TramiteDocumento.tramite_id == t.id,
            models.TramiteDocumento.estado == True
        ).all()
        docs_map = {d.requisito_id: d for d in docs_db}

        # Generar lista estructurada con todos los requisitos del catálogo
        documentos_lista = []
        for req in cat_requisitos:
            doc = docs_map.get(req.id)
            if doc:
                estado_actual = doc.estado_validacion
                if doc.archivo_url and estado_actual == "Pendiente":
                    estado_actual = "En Revisión"

                documentos_lista.append({
                    "documento_id": str(doc.id),
                    "requisito_id": req.id,
                    "requisito_nombre": req.nombre_documento,
                    "seccion_codigo": req.seccion_codigo or "2.1",
                    "es_obligatorio": req.es_obligatorio,
                    "archivo_url": doc.archivo_url,
                    "estado_validacion": estado_actual, # 'En Revisión', 'Aprobado', 'Rechazado'
                    "observaciones_supervisor": doc.observaciones_supervisor,
                    "fecha_creacion": doc.fecha_creacion.isoformat() if doc.fecha_creacion else None,
                    "tiene_archivo": bool(doc.archivo_url)
                })
            else:
                documentos_lista.append({
                    "documento_id": None,
                    "requisito_id": req.id,
                    "requisito_nombre": req.nombre_documento,
                    "seccion_codigo": req.seccion_codigo or "2.1",
                    "es_obligatorio": req.es_obligatorio,
                    "archivo_url": None,
                    "estado_validacion": "Pendiente",
                    "observaciones_supervisor": None,
                    "fecha_creacion": None,
                    "tiene_archivo": False
                })

        codigo_tramite = f"TRÁMITE Nº {str(t.id)[:8].upper()}-A"
        resultado.append({
            "tramite_id": str(t.id),
            "codigo_tramite": codigo_tramite,
            "tipo_tramite": t.tipo_tramite,
            "estado_tramite": t.estado_tramite,
            "fecha_ingreso": t.fecha_ingreso.isoformat() if t.fecha_ingreso else None,
            "establecimiento_id": str(estab.id) if estab else None,
            "establecimiento_nombre": estab.nombre_comercial if estab else "Laboratorio",
            "establecimiento_direccion": estab.direccion if estab else "",
            "establecimiento_municipio": estab.municipio if estab else "",
            "documentos": documentos_lista
        })

    return resultado

@router.post("/{tramite_id}/documentos/{documento_id}/subsanar", summary="Subsanar/reemplazar un documento rechazado")
async def subsanar_documento_tramite(
    tramite_id: str,
    documento_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        t_uuid = uuid.UUID(tramite_id)
        d_uuid = uuid.UUID(documento_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="IDs de trámite o documento inválidos."
        )

    doc = db.query(models.TramiteDocumento).filter(
        models.TramiteDocumento.id == d_uuid,
        models.TramiteDocumento.tramite_id == t_uuid,
        models.TramiteDocumento.estado == True
    ).first()

    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento no encontrado para este trámite."
        )

    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se admiten documentos en formato PDF."
        )

    # Carpeta del trámite
    tramite_folder = os.path.join(UPLOAD_DIR, str(t_uuid))
    os.makedirs(tramite_folder, exist_ok=True)

    clean_name = "".join(c for c in file.filename if c.isalnum() or c in "._- ")
    filename = f"req_{doc.requisito_id}_{uuid.uuid4().hex[:8]}_{clean_name}"
    file_path = os.path.join(tramite_folder, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    archivo_url = f"/uploads/tramites/{str(t_uuid)}/{filename}"

    # Actualizar estado a 'En Revisión' y limpiar observaciones previas
    doc.archivo_url = archivo_url
    doc.estado_validacion = "En Revisión"
    doc.observaciones_supervisor = None
    db.commit()
    db.refresh(doc)

    return {
        "mensaje": "Documento subsanado y reenviado exitosamente a revisión.",
        "documento_id": str(doc.id),
        "archivo_url": archivo_url,
        "estado_validacion": doc.estado_validacion
    }
