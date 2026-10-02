import json
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
import models

router = APIRouter(
    prefix="/api/plantillas-documentos",
    tags=["Plantillas de Documentos Oficiales"]
)

# Plantilla oficial por defecto para Comunicación Interna / Informe Técnico CODELAB
PLANTILLA_DEFAULT_CODELAB = {
    "titulo_documento": "COMUNICACIÓN INTERNA",
    "destinatario_nombre": "Dra. Mery D. Loroño V.",
    "destinatario_cargo": "ASESOR LEGAL (UNIDAD DE CALIDAD Y SERVICIOS)",
    "via_nombre": "Dra. Karina Soliz Villarroel",
    "via_cargo": "JEFE DE LA UNIDAD DE CALIDAD Y SERVICIOS a.i.",
    "remitente_nombre": "Dra. Claudia Morales Valenzuela",
    "remitente_cargo": "RESPONSABLE DEPARTAMENTAL CODELAB",
    "parrafo1": 'Mediante la presente y en cumplimiento a las funciones específicas de mi cargo dentro los alcances de los Art. 28 y Art. 38 de la Ley 1178, adjunto al presente informe para su conocimiento requisitos en general para la {TIPO_TRAMITE} del establecimiento "{ESTABLECIMIENTO}" ubicado en {DIRECCION}, {MUNICIPIO}, siendo propiedad de {PROPIETARIO} con C.I. Nro. {CI_PROPIETARIO}, y regentado actualmente por el/la profesional {REGENTE} con C.I. Nro. {CI_REGENTE}{RESPONSABLES_AREAS}. En el marco de la normativa actual vigente aprobada por R.M. 0202 de fecha 22 de marzo del 2010 donde están descritos los requisitos técnicos, administrativos, legales y técnicos, en la evaluación realizada se verificó los requisitos mínimos que deben cumplir los establecimientos de salud en cuanto a documentación, gestión de calidad, bioseguridad, competencia técnica, etc., pero principalmente se hace una trazabilidad de sus procesos y procedimientos técnicos para validar la calidad de los resultados que emiten. El proceso de habilitación es análogo al de acreditación (ISO 9001 y la 15189) y la norma señala que es de responsabilidad de los SEDES para garantizar la calidad de los resultados de diagnóstico laboratorial en beneficio de la población.',
    "parrafo2": "La Evaluación técnica IN SITU para la {TIPO_TRAMITE_MIN} fue realizada en fecha {FECHA_INSPECCION} por el evaluador de campo {SUPERVISOR}, bajo la supervisión y conducción de {REMITENTE} - {REMITENTE_CARGO} y personal técnico de esa repartición del Ministerio de Salud y Deportes de Bolivia.",
    "parrafo3": "Según Resolución Ministerial N° 847 de fecha 30 de noviembre donde indica que el ente regulador y coordinador de la Red Departamental de Laboratorios será la Coordinación Departamental de Laboratorios (CODELAB) dependientes de los Servicios Departamentales de Salud; de esta red dependerán los laboratorios de servicio público, de los seguros de salud a corto plazo y privados con y sin fines de lucro, así mismo en aplicación a la Resolución Ministerial N° 0936 de fecha 16 de diciembre del 2005 que en el Artículo Quinto designa en el nivel departamental como responsable de coordinar la Red Departamental de Laboratorios de Salud en el departamento de Cochabamba al Laboratorio de SEDES Cochabamba.",
    "parrafo_requisitos_tecnicos": "- EN APLICACIÓN DEL REGLAMENTO DE HABILITACIÓN DE LABORATORIOS Y ESTABLECIMIENTOS DE SALUD (La Habilitación y/o Renovación de habilitación es extendida a los establecimientos solicitantes que cumplen con estos requisitos mínimos), por lo que la Evaluación del establecimiento IN SITU FUE REALIZADA POR LOS EVALUADORES, LIDERIZADA Y CONDUCIDA POR CODELAB SEDES y donde el establecimiento cuenta con una gestión de calidad en cuanto a bioseguridad en el proceso de evaluación en la presente gestión. Se adjunta Lista de verificación de requisitos técnicos con el que fue evaluado y el acta de evaluación in situ para la habilitación del establecimiento.",
    "parrafo_financiero": "En los mismos se concluye autorizando la habilitación respectiva habiendo cumplido con el depósito de aranceles de Ley, toda vez que la principal función del SEDES no es recaudar fondos sino velar porque todos los Establecimientos de Salud estén debidamente normados y reglamentados velando la calidad y calidez de atención a la población usuaria.",
    "parrafo_conclusion": 'Que siendo la habilitación según la R.M. N° 0202 de fecha 22/03/2010, en actual vigencia, la Sub Unidad de CODELAB, solicita la emisión de la resolución administrativa que realiza Asesoría Legal, de tal forma se determina, concluye y autoriza al establecimiento la {TIPO_TRAMITE} - "{ESTABLECIMIENTO}", en aplicación a la normativa ministerial vigente.',
    "parrafo5_pagina3": "TRANSMITIDAS POR VECTORES (ETVs) Y OTRAS ENFERMEDADES EMERGENTES Y REEMERGENTES, ubicado en {DIRECCION}, {MUNICIPIO}, siendo propiedad de {PROPIETARIO}, regentado actualmente por el/la profesional {REGENTE} con C.I. Nro. {CI_REGENTE}{RESPONSABLES_AREAS}, según normativa vigente establecida en el Código de Salud R.M. 0847/06 y R.M. 0202/10, habiéndose sometido a la evaluación documental y técnica INSITU, trazabilidad de sus procesos y procedimientos para la validación de localidad de sus resultados, realizada por los evaluadores conducida y liderada por CODELAB- SEDES, de acuerdo a las listas de verificación para la aplicación del reglamento de habilitación, por lo que corresponde la extensión de la R.A. en la que se declara PROCEDENTE LA {TIPO_TRAMITE} al {ESTABLECIMIENTO} ante el Ministerio de Salud y el Servicio Departamental de Salud.",
    "leyenda_adjunto": "Se adjunta toda la documentación que cursa en la Sub Unidad de CODELAB Para la revisión y firma correspondiente.",
    "iniciales_archivo": "I.F.R./J.P.I.S./K.S.V."
}

DICCIONARIO_PLANTILLAS_DEFAULT = {
    "COMUNICACION_INTERNA_CODELAB": {
        "nombre": "Comunicación Interna / Informe Técnico CODELAB",
        "descripcion": "Plantilla oficial de 3 páginas para la remisión del informe técnico y evaluación in situ a Asesoría Legal.",
        "contenido": PLANTILLA_DEFAULT_CODELAB
    }
}

class ActualizarPlantillaSchema(BaseModel):
    contenido: Dict[str, Any]
    actualizado_por: Optional[str] = "Dirección General SEDES"

@router.get("/{codigo}", summary="Obtener la configuración y párrafos de una plantilla de documento oficial")
def obtener_plantilla(codigo: str, db: Session = Depends(get_db)):
    """
    Retorna el contenido estructurado de la plantilla solicitada.
    Si aún no fue personalizada en BD, devuelve la plantilla oficial por defecto.
    """
    codigo_norm = codigo.strip().upper()
    plantilla_db = db.query(models.PlantillaDocumento).filter(
        models.PlantillaDocumento.codigo == codigo_norm,
        models.PlantillaDocumento.estado == True
    ).first()

    default_info = DICCIONARIO_PLANTILLAS_DEFAULT.get(codigo_norm, {
        "nombre": f"Plantilla {codigo_norm}",
        "descripcion": "Plantilla de documento oficial del sistema",
        "contenido": PLANTILLA_DEFAULT_CODELAB
    })

    if not plantilla_db:
        return {
            "codigo": codigo_norm,
            "nombre": default_info["nombre"],
            "descripcion": default_info["descripcion"],
            "contenido": default_info["contenido"],
            "es_personalizada": False,
            "actualizado_por": "Sistema (Predeterminado)",
            "fecha_modificacion": None
        }

    try:
        contenido_dict = json.loads(plantilla_db.contenido)
    except Exception:
        contenido_dict = default_info["contenido"]

    return {
        "codigo": plantilla_db.codigo,
        "nombre": plantilla_db.nombre,
        "descripcion": plantilla_db.descripcion,
        "contenido": contenido_dict,
        "es_personalizada": True,
        "actualizado_por": plantilla_db.actualizado_por,
        "fecha_modificacion": plantilla_db.fecha_modificacion.isoformat() if plantilla_db.fecha_modificacion else None
    }

@router.put("/{codigo}", summary="Actualizar o guardar una plantilla de documento oficial")
def guardar_plantilla(codigo: str, body: ActualizarPlantillaSchema, db: Session = Depends(get_db)):
    """
    Guarda o actualiza la plantilla para que todos los usuarios (incluyendo el Coordinador)
    generen los documentos con los nuevos textos normativos.
    """
    codigo_norm = codigo.strip().upper()
    plantilla_db = db.query(models.PlantillaDocumento).filter(
        models.PlantillaDocumento.codigo == codigo_norm
    ).first()

    default_info = DICCIONARIO_PLANTILLAS_DEFAULT.get(codigo_norm, {
        "nombre": f"Plantilla {codigo_norm}",
        "descripcion": "Plantilla de documento oficial del sistema",
        "contenido": PLANTILLA_DEFAULT_CODELAB
    })

    contenido_str = json.dumps(body.contenido, ensure_ascii=False)

    if not plantilla_db:
        plantilla_db = models.PlantillaDocumento(
            codigo=codigo_norm,
            nombre=default_info["nombre"],
            descripcion=default_info["descripcion"],
            contenido=contenido_str,
            actualizado_por=body.actualizado_por or "Dirección General SEDES",
            estado=True
        )
        db.add(plantilla_db)
    else:
        plantilla_db.contenido = contenido_str
        plantilla_db.actualizado_por = body.actualizado_por or "Dirección General SEDES"
        plantilla_db.estado = True
        plantilla_db.fecha_modificacion = datetime.now()

    db.commit()
    db.refresh(plantilla_db)

    return {
        "mensaje": f"Plantilla '{codigo_norm}' actualizada exitosamente.",
        "codigo": plantilla_db.codigo,
        "actualizado_por": plantilla_db.actualizado_por,
        "fecha_modificacion": plantilla_db.fecha_modificacion.isoformat() if plantilla_db.fecha_modificacion else None
    }

@router.post("/{codigo}/restablecer", summary="Restablecer una plantilla a los valores predeterminados de fábrica")
def restablecer_plantilla(codigo: str, db: Session = Depends(get_db)):
    """
    Elimina las personalizaciones guardadas y restablece los textos al formato oficial por defecto.
    """
    codigo_norm = codigo.strip().upper()
    default_info = DICCIONARIO_PLANTILLAS_DEFAULT.get(codigo_norm)
    if not default_info:
        raise HTTPException(status_code=404, detail="Plantilla no encontrada en el catálogo predeterminado.")

    plantilla_db = db.query(models.PlantillaDocumento).filter(
        models.PlantillaDocumento.codigo == codigo_norm
    ).first()

    contenido_default_str = json.dumps(default_info["contenido"], ensure_ascii=False)

    if plantilla_db:
        plantilla_db.contenido = contenido_default_str
        plantilla_db.actualizado_por = "Sistema (Restablecido por Dirección)"
        plantilla_db.fecha_modificacion = datetime.now()
        db.commit()

    return {
        "mensaje": f"Plantilla '{codigo_norm}' restablecida a los valores oficiales de fábrica.",
        "codigo": codigo_norm,
        "contenido": default_info["contenido"]
    }
