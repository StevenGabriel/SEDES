import logging
from sqlalchemy import text
from geoalchemy2 import WKTElement
from database import engine, Base, SessionLocal
from models import Role, Usuario, Establecimiento, CatalogoRequisito
from security import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database(reset_tables: bool = False, poblar_laboratorios_demo: bool = False):
    try:
        # 1. Habilitar extensión espacial PostGIS
        with engine.connect() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            conn.commit()
            logger.info("✅ Extensión PostGIS habilitada o verificada.")

        # 2. Recrear o crear tablas según corresponda
        if reset_tables:
            Base.metadata.drop_all(bind=engine)
            logger.info("🔄 Tablas anteriores eliminadas para actualización de esquema.")
        
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Todas las tablas (con columnas de auditoría y georreferenciación) creadas en PostgreSQL.")

        # 3. Migraciones idempotentes para columnas de secciones en catalogo_requisitos (para actualizar esquemas existentes)
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE catalogo_requisitos ADD COLUMN IF NOT EXISTS seccion_codigo VARCHAR(20) DEFAULT '2.1';"))
                conn.execute(text("ALTER TABLE catalogo_requisitos ADD COLUMN IF NOT EXISTS seccion_titulo VARCHAR(300);"))
                conn.execute(text("ALTER TABLE catalogo_requisitos ADD COLUMN IF NOT EXISTS seccion_subtitulo TEXT;"))
                conn.execute(text("ALTER TABLE catalogo_requisitos ADD COLUMN IF NOT EXISTS es_subtitulo BOOLEAN DEFAULT FALSE;"))
                conn.execute(text("ALTER TABLE catalogo_requisitos ADD COLUMN IF NOT EXISTS orden INTEGER DEFAULT 1;"))
                conn.execute(text("ALTER TABLE catalogo_requisitos ALTER COLUMN nombre_documento TYPE TEXT;"))
                conn.execute(text("ALTER TABLE catalogo_requisitos ALTER COLUMN seccion_subtitulo TYPE TEXT;"))
                conn.commit()
                logger.info("✅ Esquema de catálogo de requisitos (con TEXT sin límite) verificado.")
            except Exception as e_mig:
                logger.warning(f"Aviso en migración de columnas: {e_mig}")

        db = SessionLocal()

        # 3. Poblar roles oficiales actualizados
        roles_oficiales = [
            "Administrador",
            "Coordinador",
            "Supervisor",
            "Director",
            "Abogado",
            "Propietario"
        ]

        for nombre_rol in roles_oficiales:
            existe = db.query(Role).filter(Role.nombre == nombre_rol).first()
            if not existe:
                db.add(Role(nombre=nombre_rol))
        db.commit()
        logger.info("✅ Roles del sistema actualizados (6 roles oficiales incluyendo Abogado).")

        rol_propietario = db.query(Role).filter(Role.nombre == "Propietario").first()
        rol_supervisor = db.query(Role).filter(Role.nombre == "Supervisor").first()

        # 4. Poblar catálogo base completo de requisitos estructurados por secciones 2.1 a 2.5
        from requisitos import DEFAULT_SECCIONES_DATA
        if db.query(CatalogoRequisito).count() == 0 or db.query(CatalogoRequisito).filter(CatalogoRequisito.seccion_codigo.isnot(None)).count() == 0:
            db.query(CatalogoRequisito).delete()
            for sec in DEFAULT_SECCIONES_DATA:
                for idx, r in enumerate(sec["requisitos"]):
                    db.add(CatalogoRequisito(
                        seccion_codigo=sec["codigo"],
                        seccion_titulo=sec["titulo"],
                        seccion_subtitulo=sec["subtitulo"],
                        nombre_documento=r["texto"],
                        categoria=sec["categoria"],
                        es_obligatorio=r.get("es_obligatorio", True),
                        es_subtitulo=r.get("es_subtitulo", False),
                        orden=idx + 1,
                        estado=True
                    ))
            db.commit()
            logger.info("✅ Catálogo oficial de requisitos por secciones (2.1 a 2.5) registrado.")

        # 5. Poblar Cuentas Administrativas Oficiales del SEDES (Coordinador, Administrador, Supervisores, Director, Abogado)
        password_default_hash = hash_password("Sedes2026!")

        personal_sedes = [
            {
                "email": "abogado@sedes.gob.bo",
                "rol": "Abogado",
                "nombres": "Dr. Marco",
                "apellidos": "Villanueva",
                "ci_nit": "4532876 CB",
                "telefono": "71458920",
                "estado": True
            },
            {
                "email": "director@sedes.gob.bo",
                "rol": "Director",
                "nombres": "Fernando",
                "apellidos": "Castillo",
                "ci_nit": "3489102 CB",
                "telefono": "72210045",
                "estado": True
            },
            {
                "email": "coordinador@sedes.gob.bo",
                "rol": "Coordinador",
                "nombres": "Claudia",
                "apellidos": "Morales Valenzuela",
                "ci_nit": "4589201 CB",
                "telefono": "71789012",
                "estado": True
            },
            {
                "email": "admin@sedes.gob.bo",
                "rol": "Administrador",
                "nombres": "Carlos",
                "apellidos": "Quispe",
                "ci_nit": "1000001 CB",
                "telefono": "70000001",
                "estado": True
            },
            {
                "email": "supervisor@sedes.gob.bo",
                "rol": "Supervisor",
                "nombres": "Marco Antonio",
                "apellidos": "Vargas Rojas",
                "ci_nit": "6549871 CB",
                "telefono": "71239845",
                "estado": True
            },
            {
                "email": "andrea.torrico@sedes.gob.bo",
                "rol": "Supervisor",
                "nombres": "Andrea",
                "apellidos": "Torrico",
                "ci_nit": "5291048 CB",
                "telefono": "71239848",
                "estado": True
            },
            {
                "email": "carlos.ruiz@sedes.gob.bo",
                "rol": "Supervisor",
                "nombres": "Carlos",
                "apellidos": "Ruiz Mendoza",
                "ci_nit": "5921840 CB",
                "telefono": "71239846",
                "estado": True
            },
            {
                "email": "patricia.valenzuela@sedes.gob.bo",
                "rol": "Supervisor",
                "nombres": "Patricia",
                "apellidos": "Valenzuela",
                "ci_nit": "4892103 CB",
                "telefono": "71239847",
                "estado": True
            }
        ]

        for p in personal_sedes:
            usuario_existente = db.query(Usuario).filter(
                (Usuario.email == p["email"]) | (Usuario.ci_nit == p["ci_nit"])
            ).first()
            rol_obj = db.query(Role).filter(Role.nombre == p["rol"]).first()
            
            if not usuario_existente and rol_obj:
                nuevo_personal = Usuario(
                    rol_id=rol_obj.id,
                    nombres=p["nombres"],
                    apellidos=p["apellidos"],
                    ci_nit=p["ci_nit"],
                    email=p["email"],
                    password_hash=password_default_hash,
                    telefono=p["telefono"],
                    estado=p.get("estado", True)
                )
                db.add(nuevo_personal)
            elif usuario_existente and rol_obj:
                usuario_existente.password_hash = password_default_hash
                usuario_existente.rol_id = rol_obj.id
                usuario_existente.nombres = p["nombres"]
                usuario_existente.apellidos = p["apellidos"]
                usuario_existente.ci_nit = p["ci_nit"]
                usuario_existente.email = p["email"]
                usuario_existente.telefono = p["telefono"]
                usuario_existente.estado = p.get("estado", True)

        db.commit()
        logger.info("✅ Cuentas de Personal SEDES (Coordinador, Administrador, Supervisores Oficiales) inicializadas con correos únicos.")

        if poblar_laboratorios_demo:
            poblar_laboratorios_y_tramites_demo(db)
        else:
            logger.info("ℹ️ Base de datos inicializada sin datos demo (modo producción / datos reales).")

        db.close()
        logger.info("🚀 Base de datos inicializada y lista para su uso.")

    except Exception as e:
        logger.error(f"❌ Error al inicializar la base de datos: {e}")
        raise e

if __name__ == "__main__":
    init_database(reset_tables=True)
