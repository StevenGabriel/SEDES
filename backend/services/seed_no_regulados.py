import os
import json
import logging
import uuid
from sqlalchemy import func, text
from core.database import SessionLocal, engine
from models.models import Establecimiento

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed_no_regulados")

def poblar_laboratorios_no_regulados():
    json_path = os.path.join(os.path.dirname(__file__), "..", "data", "laboratorios_no_regulados.json")
    if not os.path.exists(json_path):
        logger.error(f"Archivo {json_path} no existe.")
        return 0

    with open(json_path, "r", encoding="utf-8") as f:
        labs_data = json.load(f)

    db = SessionLocal()
    try:
        # Asegurar columnas si hiciera falta
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE establecimientos ADD COLUMN IF NOT EXISTS es_regulado BOOLEAN DEFAULT TRUE;"))
            conn.execute(text("ALTER TABLE establecimientos ALTER COLUMN propietario_id DROP NOT NULL;"))
            conn.commit()

        insertados = 0
        actualizados = 0

        for item in labs_data:
            nombre = item["nombre_comercial"].strip()
            mun = item["municipio"].strip().upper()
            lat = float(item["latitud"])
            lng = float(item["longitud"])
            obs = item.get("observaciones") or f"Red {item.get('red', '')} - Establecimiento de salud no regulado / externo".strip()

            # Buscar si ya existe por nombre comercial y municipio (es_regulado == False)
            estab = db.query(Establecimiento).filter(
                func.lower(Establecimiento.nombre_comercial) == nombre.lower(),
                func.lower(Establecimiento.municipio) == mun.lower(),
                Establecimiento.es_regulado == False
            ).first()

            if estab:
                estab.coordenadas = f"SRID=4326;POINT({lng} {lat})"
                estab.observaciones = obs
                estab.estado = True
                estab.estado_operativo = "No Regulado"
                actualizados += 1
            else:
                nuevo = Establecimiento(
                    id=uuid.uuid4(),
                    propietario_id=None,
                    codigo_cue=item.get("codigo_cue") or "NO-REGULADO",
                    nombre_comercial=nombre,
                    tipo="Laboratorio Externo (No Regulado)",
                    nivel="No Regulado",
                    municipio=mun,
                    responsable_laboratorio="Sin Regencia SEDES",
                    ci_responsable=None,
                    responsables_areas="No Supervisado",
                    direccion=item.get("direccion") or f"Ubicación georreferenciada en {item['municipio']}",
                    coordenadas=f"SRID=4326;POINT({lng} {lat})",
                    horario="No registrado / Variable",
                    telefono=None,
                    email_contacto=None,
                    descripcion="Establecimiento no regulado por el SEDES Cochabamba. No cuenta con acreditación sanitaria oficial ni supervisión técnica.",
                    imagen_url=None,
                    servicios="No Verificado por SEDES",
                    observaciones=obs,
                    estado_operativo="No Regulado",
                    es_regulado=False,
                    estado=True
                )
                db.add(nuevo)
                insertados += 1

        db.commit()
        logger.info(f"✅ Población completada: {insertados} insertados, {actualizados} actualizados.")
        return insertados + actualizados
    except Exception as e:
        db.rollback()
        logger.error(f"Error poblando laboratorios no regulados: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    poblar_laboratorios_no_regulados()
