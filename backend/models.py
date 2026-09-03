import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Text,
    DateTime,
    Date,
    ForeignKey,
    func
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry

from database import Base

# ==============================================================================
# 1. TABLA: ROLES
# ==============================================================================
class Role(Base):
    __tablename__ = "roles"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre = Column(String(50), unique=True, nullable=False)

    # Columnas de Auditoría
    estado = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime, default=func.now(), nullable=False)
    fecha_modificacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    usuarios = relationship("Usuario", back_populates="rol")


# ==============================================================================
# 2. TABLA: USUARIOS
# ==============================================================================
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False)
    nombres = Column(String(100), nullable=False)
    apellidos = Column(String(100), nullable=False)
    ci_nit = Column(String(30), unique=True, nullable=False, index=True)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    telefono = Column(String(30), nullable=True)

    # Columnas de Auditoría
    estado = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime, default=func.now(), nullable=False)
    fecha_modificacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    rol = relationship("Role", back_populates="usuarios")
    establecimientos = relationship("Establecimiento", back_populates="propietario")
    tramites_supervisados = relationship("Tramite", back_populates="supervisor_asignado", foreign_keys="Tramite.supervisor_asignado_id")
    inspecciones = relationship("Inspeccion", back_populates="supervisor")
    citaciones_emitidas = relationship("CitacionInfraccion", back_populates="supervisor")
    notificaciones = relationship("Notificacion", back_populates="usuario")


# ==============================================================================
# 3. TABLA: ESTABLECIMIENTOS (Laboratorios / Farmacias con PostGIS)
# ==============================================================================
class Establecimiento(Base):
    __tablename__ = "establecimientos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    propietario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    codigo_cue = Column(String(50), nullable=True, index=True)  # Código CUE oficial (ej: '3L0267', 'Nuevo')
    nombre_comercial = Column(String(200), nullable=False)
    tipo = Column(String(100), nullable=False)  # Ej: 'Laboratorio Clínico Privado', 'Privado'
    nivel = Column(String(50), nullable=False)  # Ej: 'Nivel 1', 'Nivel 2'
    municipio = Column(String(100), nullable=False) # Ej: 'CERCADO', 'QUILLACOLLO', 'PUNATA'
    responsable_laboratorio = Column(String(200), nullable=True) # Responsable técnico
    responsables_areas = Column(String(255), nullable=True) # Especialidades/Áreas
    direccion = Column(Text, nullable=False)
    coordenadas = Column(Geometry(geometry_type='POINT', srid=4326), nullable=True)  # PostGIS Point (Lat/Lng)
    horario = Column(String(100), default="Lun-Vie 7:00 - 19:00, Sáb 8:00 - 13:00", nullable=True)
    telefono = Column(String(50), nullable=True)
    email_contacto = Column(String(150), nullable=True)
    descripcion = Column(Text, nullable=True)
    imagen_url = Column(Text, nullable=True)
    servicios = Column(Text, nullable=True)
    observaciones = Column(Text, nullable=True)
    estado_operativo = Column(String(50), default="Habilitado", nullable=False) # 'Habilitado', 'En Trámite', 'Renovación', 'Clausurado'

    # Columnas de Auditoría
    estado = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime, default=func.now(), nullable=False)
    fecha_modificacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    propietario = relationship("Usuario", back_populates="establecimientos")
    tramites = relationship("Tramite", back_populates="establecimiento")
    citaciones = relationship("CitacionInfraccion", back_populates="establecimiento")


# ==============================================================================
# 4. TABLA: TRAMITES
# ==============================================================================
class Tramite(Base):
    __tablename__ = "tramites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    establecimiento_id = Column(UUID(as_uuid=True), ForeignKey("establecimientos.id"), nullable=False)
    supervisor_asignado_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=True)
    tipo_tramite = Column(String(100), nullable=False)  # 'Apertura', 'Renovación', 'Acreditación', 'Traslado'
    estado_tramite = Column(String(50), default="Pendiente", nullable=False) # 'Pendiente', 'En Revisión', 'Observado', 'Inspección Programada', 'Aprobado', 'Rechazado'
    fecha_ingreso = Column(Date, default=func.current_date(), nullable=False)

    # Columnas de Auditoría
    estado = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime, default=func.now(), nullable=False)
    fecha_modificacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    establecimiento = relationship("Establecimiento", back_populates="tramites")
    supervisor_asignado = relationship("Usuario", back_populates="tramites_supervisados", foreign_keys=[supervisor_asignado_id])
    documentos = relationship("TramiteDocumento", back_populates="tramite")
    inspecciones = relationship("Inspeccion", back_populates="tramite")


# ==============================================================================
# 5. TABLA: CATALOGO_REQUISITOS
# ==============================================================================
class CatalogoRequisito(Base):
    __tablename__ = "catalogo_requisitos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_documento = Column(String(200), nullable=False)
    categoria = Column(String(50), nullable=False)  # 'Legal', 'Administrativo', 'Técnico', 'Financiero'
    aplica_a = Column(String(100), default="Todos", nullable=False)
    es_obligatorio = Column(Boolean, default=True, nullable=False)

    # Columnas de Auditoría
    estado = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime, default=func.now(), nullable=False)
    fecha_modificacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    tramite_documentos = relationship("TramiteDocumento", back_populates="requisito")


# ==============================================================================
# 6. TABLA: TRAMITE_DOCUMENTOS
# ==============================================================================
class TramiteDocumento(Base):
    __tablename__ = "tramite_documentos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tramite_id = Column(UUID(as_uuid=True), ForeignKey("tramites.id"), nullable=False)
    requisito_id = Column(Integer, ForeignKey("catalogo_requisitos.id"), nullable=False)
    archivo_url = Column(String(500), nullable=False)
    estado_validacion = Column(String(50), default="Pendiente", nullable=False) # 'Pendiente', 'Aprobado', 'Observado'
    observaciones_supervisor = Column(Text, nullable=True)
    fecha_limite_subsanacion = Column(Date, nullable=True)

    # Columnas de Auditoría
    estado = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime, default=func.now(), nullable=False)
    fecha_modificacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    tramite = relationship("Tramite", back_populates="documentos")
    requisito = relationship("CatalogoRequisito", back_populates="tramite_documentos")


# ==============================================================================
# 7. TABLA: INSPECCIONES
# ==============================================================================
class Inspeccion(Base):
    __tablename__ = "inspecciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    tramite_id = Column(UUID(as_uuid=True), ForeignKey("tramites.id"), nullable=False)
    supervisor_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    fecha_programada = Column(DateTime, nullable=False)
    estado_inspeccion = Column(String(50), default="Pendiente", nullable=False) # 'Pendiente', 'Completada', 'Cancelada', 'Reprogramada'
    veredicto_final = Column(String(50), nullable=True) # 'Favorable', 'Desfavorable', 'Con Observaciones'
    acta_pdf_url = Column(String(500), nullable=True)

    # Columnas de Auditoría
    estado = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime, default=func.now(), nullable=False)
    fecha_modificacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    tramite = relationship("Tramite", back_populates="inspecciones")
    supervisor = relationship("Usuario", back_populates="inspecciones")


# ==============================================================================
# 8. TABLA: CITACIONES_INFRACCIONES
# ==============================================================================
class CitacionInfraccion(Base):
    __tablename__ = "citaciones_infracciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    establecimiento_id = Column(UUID(as_uuid=True), ForeignKey("establecimientos.id"), nullable=False)
    supervisor_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    motivo_citacion = Column(Text, nullable=False)
    evidencia_foto_url = Column(String(500), nullable=True)
    fecha_emision = Column(Date, default=func.current_date(), nullable=False)
    alerta_enviada = Column(Boolean, default=False, nullable=False)

    # Columnas de Auditoría
    estado = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime, default=func.now(), nullable=False)
    fecha_modificacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    establecimiento = relationship("Establecimiento", back_populates="citaciones")
    supervisor = relationship("Usuario", back_populates="citaciones_emitidas")


# ==============================================================================
# 9. TABLA: NOTIFICACIONES
# ==============================================================================
class Notificacion(Base):
    __tablename__ = "notificaciones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    usuario_id = Column(UUID(as_uuid=True), ForeignKey("usuarios.id"), nullable=False)
    titulo = Column(String(200), nullable=False)
    mensaje = Column(Text, nullable=False)
    leido = Column(Boolean, default=False, nullable=False)

    # Columnas de Auditoría
    estado = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime, default=func.now(), nullable=False)
    fecha_modificacion = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    # Relaciones
    usuario = relationship("Usuario", back_populates="notificaciones")
