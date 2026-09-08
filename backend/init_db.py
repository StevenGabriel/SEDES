import logging
from sqlalchemy import text
from geoalchemy2 import WKTElement
from database import engine, Base, SessionLocal
from models import Role, Usuario, Establecimiento, CatalogoRequisito
from security import hash_password

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
        logger.info("✅ Todas las tablas (con columnas de auditoría y georreferenciación) creadas en PostgreSQL.")

        db = SessionLocal()

        # 3. Poblar roles oficiales actualizados
        roles_oficiales = [
            "Administrador",
            "Coordinador",
            "Supervisor",
            "Director",
            "Propietario"
        ]

        for nombre_rol in roles_oficiales:
            existe = db.query(Role).filter(Role.nombre == nombre_rol).first()
            if not existe:
                db.add(Role(nombre=nombre_rol))
        db.commit()
        logger.info("✅ Roles del sistema actualizados (5 roles oficiales).")

        rol_propietario = db.query(Role).filter(Role.nombre == "Propietario").first()
        rol_supervisor = db.query(Role).filter(Role.nombre == "Supervisor").first()

        password_default_hash = hash_password("password123")

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

        # 5. Poblar Cuentas Administrativas Oficiales del SEDES (Coordinador, Administrador, Supervisores, Director)
        password_default_hash = hash_password("Sedes2026!")

        personal_sedes = [
            {
                "email": "f.castillo@sedes.gob.bo",
                "rol": "Director",
                "nombres": "Dr. Fernando",
                "apellidos": "Castillo",
                "ci_nit": "3489102 CB",
                "telefono": "72210045",
                "estado": True
            },
            {
                "email": "coordinador@sedes.gob.bo",
                "rol": "Coordinador",
                "nombres": "Dra. Claudia",
                "apellidos": "Morales Valenzuela",
                "ci_nit": "4589201 CB",
                "telefono": "71789012",
                "estado": True
            },
            {
                "email": "admin@sedes.gob.bo",
                "rol": "Administrador",
                "nombres": "Ing. Carlos",
                "apellidos": "Quispe",
                "ci_nit": "1000001 CB",
                "telefono": "70000001",
                "estado": True
            },
            {
                "email": "supervisor@sedes.gob.bo",
                "rol": "Supervisor",
                "nombres": "Ing. Marco Antonio",
                "apellidos": "Vargas Rojas",
                "ci_nit": "6549871 CB",
                "telefono": "71239845",
                "estado": True
            },
            {
                "email": "carlos.ruiz@sedes.gob.bo",
                "rol": "Supervisor",
                "nombres": "Ing. Carlos",
                "apellidos": "Ruiz Mendoza",
                "ci_nit": "5921840 CB",
                "telefono": "71239846",
                "estado": True
            },
            {
                "email": "patricia.valenzuela@sedes.gob.bo",
                "rol": "Supervisor",
                "nombres": "Dra. Patricia",
                "apellidos": "Valenzuela",
                "ci_nit": "4892103 CB",
                "telefono": "71239847",
                "estado": True
            },
            {
                "email": "andrea.torrico@sedes.gob.bo",
                "rol": "Supervisor",
                "nombres": "Lic. Andrea",
                "apellidos": "Torrico",
                "ci_nit": "5291048 CB",
                "telefono": "71239848",
                "estado": True
            },
            {
                "email": "r.quiroga@sedes.gob.bo",
                "rol": "Supervisor",
                "nombres": "Lic. Roberto",
                "apellidos": "Quiroga",
                "ci_nit": "5192834 CB",
                "telefono": "71239849",
                "estado": False
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

        # 6. Poblar los 10 Laboratorios Oficiales y sus Cuentas de Propietario (Opción B)
        laboratorios_data = [
            {
                "prop_nombre": "CLAUDIA SILVIA",
                "prop_apellidos": "ALVAREZ LOPEZ",
                "prop_ci": "3528447 CB",
                "prop_email": "claudia.alvarez@propietario.sedes.bo",
                "prop_tel": "71723456",
                "cue": "3L0267",
                "nombre": "A.T.M.",
                "tipo": "Privado",
                "nivel": "Nivel 2",
                "municipio": "CERCADO",
                "resp_lab": "ALVAREZ LOPEZ CLAUDIA SILVIA - 3528447",
                "resp_areas": "Inmunología: CLAUDIA SILVIA ALVAREZ LOPEZ",
                "direccion": "Av. Ayacucho Nº 345 entre Ecuador y Mayor Rocha",
                "lat": -17.38975019,
                "lng": -66.15951246,
                "estado_op": "Habilitado",
                "horario": "Lun-Vie 7:00 - 19:00, Sáb 8:00 - 13:00",
                "telefono": "+591 4 4251890",
                "email": "contacto@atm-lab.bo",
                "servicios": "Inmunología, Análisis Clínicos Generales, Bioquímica, Hematología, Microbiología, Uroanálisis"
            },
            {
                "prop_nombre": "JHANETH",
                "prop_apellidos": "GUTIERREZ SAIGUA",
                "prop_ci": "8726834 CB",
                "prop_email": "jhaneth.gutierrez@propietario.sedes.bo",
                "prop_tel": "72234567",
                "cue": "3L0384",
                "nombre": "ADONAI",
                "tipo": "Privado",
                "nivel": "Nivel 1",
                "municipio": "PUNATA",
                "resp_lab": "JHANETH GUTIERREZ SAIGUA - 8726834",
                "resp_areas": "Análisis Clínicos Básicos",
                "direccion": "Calle Cobija s/n entre las Calles Ingavi y Ayacucho, zona central de Punata",
                "lat": -17.54556494,
                "lng": -65.83973058,
                "estado_op": "En Trámite",
                "horario": "Lun-Vie 7:30 - 18:00, Sáb 8:00 - 12:00",
                "telefono": "+591 4 4578120",
                "email": "lab.adonai.punata@gmail.com",
                "servicios": "Análisis Clínicos Generales, Hematología Básica, Bioquímica General"
            },
            {
                "prop_nombre": "GERY IVAN",
                "prop_apellidos": "ROMERO TAPIA",
                "prop_ci": "5123984 CB",
                "prop_email": "gery.romero@propietario.sedes.bo",
                "prop_tel": "70712389",
                "cue": "3L0265",
                "nombre": "ALCAZAR",
                "tipo": "Privado",
                "nivel": "Nivel 1",
                "municipio": "QUILLACOLLO",
                "resp_lab": "DANIELA OMONTE QUIROZ - 9340566",
                "resp_areas": "Bioquímica y Hematología",
                "direccion": "Av. Blanco Galindo Km 13 - Municipio Quillacollo",
                "lat": -17.40445636,
                "lng": -66.28240982,
                "estado_op": "En Trámite",
                "horario": "Lun-Vie 7:00 - 18:30, Sáb 8:00 - 13:00",
                "telefono": "+591 4 4367890",
                "email": "alcazar.lab.cbba@gmail.com",
                "servicios": "Análisis Clínicos Generales, Hematología, Bioquímica, Coproparasitología"
            },
            {
                "prop_nombre": "MARTHA MAYTE",
                "prop_apellidos": "RIVERA OLGUIN",
                "prop_ci": "6412980 CB",
                "prop_email": "martha.rivera@propietario.sedes.bo",
                "prop_tel": "76451230",
                "cue": "Nuevo",
                "nombre": "ALFA",
                "tipo": "Privado",
                "nivel": "Nivel 1",
                "municipio": "CERCADO",
                "resp_lab": "MARTHA MAYTE RIVERA OLGUIN - 6412980",
                "resp_areas": "Análisis Clínicos de Rutina",
                "direccion": "Av. Encañada y Av. Alonso Yañez Mendoza, Cochabamba",
                "lat": -17.45721955,
                "lng": -66.1568581,
                "estado_op": "Habilitado",
                "horario": "Lun-Vie 7:00 - 19:00, Sáb 8:00 - 12:30",
                "telefono": "+591 4 4112233",
                "email": "laboratorioalfa.cbba@gmail.com",
                "servicios": "Análisis Clínicos Generales, Hematología, Bioquímica, Uroanálisis"
            },
            {
                "prop_nombre": "MARIA RUTH",
                "prop_apellidos": "FERRUFINO GONZALES",
                "prop_ci": "4981273 CB",
                "prop_email": "maria.ferrufino@propietario.sedes.bo",
                "prop_tel": "79784512",
                "cue": "Nuevo",
                "nombre": "ALFA & OMEGA",
                "tipo": "Privado",
                "nivel": "Nivel 1",
                "municipio": "CERCADO",
                "resp_lab": "MARIA EUGENIA CABEZAS ALANIZ - 9483829",
                "resp_areas": "Microbiología y Análisis Clínico",
                "direccion": "Calle M. Torrico esq. Av. Portales Edf. Portales",
                "lat": -17.37478496,
                "lng": -66.15546581,
                "estado_op": "En Trámite",
                "horario": "Lun-Vie 7:00 - 20:00, Sáb 7:30 - 14:00",
                "telefono": "+591 4 4299100",
                "email": "alfaomega.lab@sedes.bo",
                "servicios": "Análisis Clínicos Generales, Microbiología, Hematología, Bioquímica"
            },
            {
                "prop_nombre": "JOSE ARMANDO",
                "prop_apellidos": "ORTEGA CHOQUE",
                "prop_ci": "7198234 CB",
                "prop_email": "jose.ortega@propietario.sedes.bo",
                "prop_tel": "73789012",
                "cue": "3L0335",
                "nombre": "ALINE",
                "tipo": "Privado",
                "nivel": "Nivel 1",
                "municipio": "SHINAHOTA",
                "resp_lab": "MAYRA ESTHEFI RAMOS GUTIERREZ - 14555529",
                "resp_areas": "Bioquímica y Análisis de Emergencia",
                "direccion": "Calle Comercio entre Calle Tajibos y Germán Busch - Shinahota",
                "lat": -16.99415843,
                "lng": -65.24484581,
                "estado_op": "En Trámite",
                "horario": "Lun-Dom 7:00 - 21:00 (Atención Continua)",
                "telefono": "+591 4 4136655",
                "email": "lab.aline.shinahota@gmail.com",
                "servicios": "Análisis Clínicos Generales, Hematología, Bioquímica, Pruebas Rápidas"
            },
            {
                "prop_nombre": "JOSE ARMANDO",
                "prop_apellidos": "ORTEGA CHOQUE",
                "prop_ci": "7198234 CB",
                "prop_email": "jose.ortega@propietario.sedes.bo",
                "prop_tel": "73789012",
                "cue": "Nuevo",
                "nombre": "ALINE SUCURSAL 1",
                "tipo": "Privado",
                "nivel": "Nivel 1",
                "municipio": "VILLA TUNARI",
                "resp_lab": "JANETH ESTRADA LOPEZ - 8406211",
                "resp_areas": "Análisis Clínico Tropical y General",
                "direccion": "Av. de la Resistencia lado mercado 14 de mayo, Eterazama",
                "lat": -16.8209865,
                "lng": -65.467362,
                "estado_op": "En Trámite",
                "horario": "Lun-Sáb 7:00 - 18:00",
                "telefono": "+591 4 4138899",
                "email": "aline.eterazama@gmail.com",
                "servicios": "Análisis Clínicos Generales, Detección de Enfermedades Tropicales, Hematología"
            },
            {
                "prop_nombre": "ROLANDO",
                "prop_apellidos": "SANCHEZ RAMOS",
                "prop_ci": "4129845 CB",
                "prop_email": "rolando.sanchez@propietario.sedes.bo",
                "prop_tel": "71490123",
                "cue": "3L0393",
                "nombre": "ALQUIMIA",
                "tipo": "Privado",
                "nivel": "Nivel 2",
                "municipio": "CERCADO",
                "resp_lab": "MARCELA SCARLEN BARRON GAMBOA - 12906321",
                "resp_areas": "Inmunología: MARCELA SCARLEN BARRON GAMBOA",
                "direccion": "Av. América Nro. 595 esquina Potosí",
                "lat": -17.371239,
                "lng": -66.158721,
                "estado_op": "Habilitado",
                "horario": "Lun-Vie 7:00 - 19:30, Sáb 8:00 - 14:00",
                "telefono": "+591 4 4458900",
                "email": "informes@alquimia-lab.com.bo",
                "servicios": "Inmunología, Hormonas, Marcadores Tumorales, Bioquímica, Hematología, Microbiología"
            },
            {
                "prop_nombre": "JAMES ALEX",
                "prop_apellidos": "ALVAREZ GONZALES",
                "prop_ci": "5904922 CB",
                "prop_email": "james.alvarez@propietario.sedes.bo",
                "prop_tel": "70761234",
                "cue": "3L0320",
                "nombre": "ALVAREZ",
                "tipo": "Privado",
                "nivel": "Nivel 1",
                "municipio": "QUILLACOLLO",
                "resp_lab": "ALVAREZ GONZALES JAMES ALEX - 5904922",
                "resp_areas": "Análisis de Rutina y Urgencias",
                "direccion": "Calle Carreras Nº 134 - Municipio Quillacollo",
                "lat": -17.39626288,
                "lng": -66.29433138,
                "estado_op": "Habilitado",
                "horario": "Lun-Vie 7:00 - 18:00, Sáb 8:00 - 13:00",
                "telefono": "+591 4 4268811",
                "email": "lab.alvarez.quillacollo@gmail.com",
                "servicios": "Análisis Clínicos Generales, Hematología, Bioquímica, Coproparasitología"
            },
            {
                "prop_nombre": "PAOLA ANDREA",
                "prop_apellidos": "FLORES BONIFACIO",
                "prop_ci": "7288372 CB",
                "prop_email": "paola.flores@propietario.sedes.bo",
                "prop_tel": "78345678",
                "cue": "Nuevo",
                "nombre": "AMERICA",
                "tipo": "Privado",
                "nivel": "Nivel 1",
                "municipio": "CERCADO",
                "resp_lab": "PAOLA ANDREA FLORES BONIFACIO - 7288372",
                "resp_areas": "Bioquímica y Análisis Clínico",
                "direccion": "Av. Blanco Galindo Km 2 ½ esq. Zoilo Linares y A. Morón, zona Hipódromo",
                "lat": -17.39338147,
                "lng": -66.18197477,
                "estado_op": "En Trámite",
                "horario": "Lun-Vie 7:00 - 19:00, Sáb 8:00 - 13:00",
                "telefono": "+591 4 4118800",
                "email": "laboratorio.america.cbba@gmail.com",
                "servicios": "Análisis Clínicos Generales, Hematología, Bioquímica, Uroanálisis, Pruebas Rápidas"
            }
        ]

        for lab in laboratorios_data:
            # 1. Crear usuario propietario si no existe
            usuario_prop = db.query(Usuario).filter(
                (Usuario.email == lab["prop_email"]) | (Usuario.ci_nit == lab["prop_ci"])
            ).first()
            if not usuario_prop:
                usuario_prop = Usuario(
                    rol_id=rol_propietario.id,
                    nombres=lab["prop_nombre"],
                    apellidos=lab["prop_apellidos"],
                    ci_nit=lab["prop_ci"],
                    email=lab["prop_email"],
                    password_hash=password_default_hash,
                    telefono=lab["prop_tel"],
                    estado=True
                )
                db.add(usuario_prop)
                db.commit()
                db.refresh(usuario_prop)
            else:
                usuario_prop.rol_id = rol_propietario.id
                usuario_prop.nombres = lab["prop_nombre"]
                usuario_prop.apellidos = lab["prop_apellidos"]
                usuario_prop.ci_nit = lab["prop_ci"]
                usuario_prop.email = lab["prop_email"]
                usuario_prop.telefono = lab["prop_tel"]
                db.commit()

            # 2. Crear establecimiento georreferenciado con PostGIS si no existe
            estab_existente = db.query(Establecimiento).filter(
                Establecimiento.nombre_comercial == lab["nombre"],
                Establecimiento.municipio == lab["municipio"]
            ).first()

            if not estab_existente:
                punto_geo = f"SRID=4326;POINT({lab['lng']} {lab['lat']})"
                nuevo_estab = Establecimiento(
                    propietario_id=usuario_prop.id,
                    codigo_cue=lab["cue"],
                    nombre_comercial=lab["nombre"],
                    tipo=lab["tipo"],
                    nivel=lab["nivel"],
                    municipio=lab["municipio"],
                    responsable_laboratorio=lab["resp_lab"],
                    responsables_areas=lab["resp_areas"],
                    direccion=lab["direccion"],
                    coordenadas=punto_geo,
                    horario=lab["horario"],
                    telefono=lab["telefono"],
                    email_contacto=lab["email"],
                    servicios=lab["servicios"],
                    estado_operativo=lab["estado_op"],
                    estado=True
                )
                db.add(nuevo_estab)

        db.commit()
        logger.info(f"✅ Se han registrado los 10 laboratorios oficiales y sus respectivos propietarios en PostGIS.")

        db.close()
        logger.info("🚀 Base de datos inicializada y lista para su uso.")

    except Exception as e:
        logger.error(f"❌ Error al inicializar la base de datos: {e}")
        raise e

if __name__ == "__main__":
    init_database(reset_tables=True)
