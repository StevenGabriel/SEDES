import logging
from sqlalchemy import text
from database import engine, Base, SessionLocal
from models import Role, CatalogoRequisito

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database(reset_tables: bool = False):
    try:
        # 1. Habilitar extensión espacial PostGIS
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            conn.commit()
            logger.info("✅ Extensión PostGIS verificada/habilitada exitosamente.")

        # 2. Recrear o crear tablas según corresponda
        if reset_tables:
            Base.metadata.drop_all(bind=engine)
            logger.info("🔄 Tablas anteriores eliminadas para actualización de esquema.")
        
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Todas las tablas (con columnas de auditoría) creadas en PostgreSQL.")

        # 3. Poblar roles oficiales actualizados
        db = SessionLocal()
        
        # Eliminar el rol si existía previamente
        db.query(Role).filter(Role.nombre == "Regente Bioquímico-Farmacéutico").delete()
        db.commit()

        roles_oficiales = [
            "Administrador",
            "Coordinador SEDES",
            "Supervisor Técnico",
            "Propietario",
            "Director General"
        ]

        for nombre_rol in roles_oficiales:
            existe = db.query(Role).filter(Role.nombre == nombre_rol).first()
            if not existe:
                db.add(Role(nombre=nombre_rol))
        db.commit()
        logger.info("✅ Roles del sistema actualizados (5 roles oficiales).")

        # 4. Poblar catálogo base de requisitos si está vacío
        if db.query(CatalogoRequisito).count() == 0:
            requisitos_base = [
                # Requisitos Legales
                CatalogoRequisito(nombre_documento="Título en Provisión Nacional del Regente", categoria="Legal", aplica_a="Todos", es_obligatorio=True),
                CatalogoRequisito(nombre_documento="Matrícula Profesional del Ministerio de Salud", categoria="Legal", aplica_a="Todos", es_obligatorio=True),
                CatalogoRequisito(nombre_documento="Contrato de Trabajo o Regencia Notariado", categoria="Legal", aplica_a="Todos", es_obligatorio=True),
                # Requisitos Administrativos
                CatalogoRequisito(nombre_documento="Número de Identificación Tributaria (NIT)", categoria="Administrativo", aplica_a="Todos", es_obligatorio=True),
                CatalogoRequisito(nombre_documento="Plano Arquitectónico a Escala del Establecimiento", categoria="Administrativo", aplica_a="Todos", es_obligatorio=True),
                CatalogoRequisito(nombre_documento="Convenio de Manejo y Disposición de Residuos Biológicos", categoria="Administrativo", aplica_a="Todos", es_obligatorio=True),
                # Requisitos Técnicos
                CatalogoRequisito(nombre_documento="Manual de Procedimientos Técnicos y de Bioseguridad", categoria="Técnico", aplica_a="Todos", es_obligatorio=True),
                CatalogoRequisito(nombre_documento="Inventario y Calibración de Equipos Médicos/Bioquímicos", categoria="Técnico", aplica_a="Todos", es_obligatorio=True),
                CatalogoRequisito(nombre_documento="Cartera de Pruebas y Servicios Ofertados", categoria="Técnico", aplica_a="Todos", es_obligatorio=True),
                # Requisitos Financieros
                CatalogoRequisito(nombre_documento="Comprobante de Pago de Tasa Departamental SEDES", categoria="Financiero", aplica_a="Todos", es_obligatorio=True),
            ]
            db.add_all(requisitos_base)
            db.commit()
            logger.info("✅ Catálogo inicial de requisitos normativos registrado.")

        db.close()
        logger.info("🚀 Base de datos inicializada y lista para su uso.")

    except Exception as e:
        logger.error(f"❌ Error al inicializar la base de datos: {e}")
        raise e

if __name__ == "__main__":
    init_database(reset_tables=True)
