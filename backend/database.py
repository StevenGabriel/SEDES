import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Configuración de URL de conexión a PostgreSQL / PostGIS
# Por defecto conecta al contenedor 'db' en Docker, o a 'localhost' si se corre localmente
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://admin:password123@db:5432/sedes_db"
)

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependencia para inyección de sesiones en endpoints de FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
