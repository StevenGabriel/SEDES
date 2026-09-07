import uuid
import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

# ==============================================================================
# SCHEMAS DE AUTENTICACIÓN Y RECUPERACIÓN DE CONTRASEÑAS
# ==============================================================================

EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"

class UsuarioRegistro(BaseModel):
    nombres: str = Field(..., min_length=2, max_length=100, description="Nombres del solicitante")
    apellidos: str = Field(..., min_length=2, max_length=100, description="Apellidos del solicitante")
    ci_nit: str = Field(..., min_length=4, max_length=30, description="Número de C.I. o NIT")
    email: str = Field(..., max_length=150, description="Correo electrónico válido")
    telefono: Optional[str] = Field(None, max_length=30, description="Teléfono o celular de contacto")
    password: str = Field(..., min_length=6, description="Contraseña segura (mínimo 6 caracteres)")

    @field_validator("email")
    @classmethod
    def validar_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(EMAIL_REGEX, v):
            raise ValueError("El correo electrónico no tiene un formato válido.")
        return v

class UsuarioLogin(BaseModel):
    email: str = Field(..., description="Correo electrónico registrado")
    password: str = Field(..., min_length=1, description="Contraseña del usuario")

# --- Flujo de Recuperación por Correo y Token (10 minutos) ---

class SolicitarResetPasswordRequest(BaseModel):
    email: str = Field(..., max_length=150, description="Correo electrónico registrado")

    @field_validator("email")
    @classmethod
    def validar_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(EMAIL_REGEX, v):
            raise ValueError("El correo electrónico no tiene un formato válido.")
        return v

class RestablecerPasswordConTokenRequest(BaseModel):
    token: str = Field(..., min_length=10, description="Token firmado de recuperación")
    nueva_password: str = Field(..., min_length=6, description="Nueva contraseña (mínimo 6 caracteres)")

class VerificarTokenResponse(BaseModel):
    valido: bool
    email: Optional[str] = None
    mensaje: Optional[str] = None

class EstablecimientoCreate(BaseModel):
    propietario_id: str
    nombre_comercial: str
    municipio: str
    tipo: Optional[str] = "Laboratorio Clínico Privado"
    nivel: Optional[str] = "Nivel 1"
    direccion: str
    telefono: Optional[str] = None
    email_contacto: Optional[str] = None
    responsable_laboratorio: Optional[str] = None
    responsables_areas: Optional[str] = None
    horario: Optional[str] = "Lun-Vie 7:00 - 19:00, Sáb 8:00 - 13:00"
    descripcion: Optional[str] = None
    servicios: Optional[str] = None
    imagen_url: Optional[str] = None
    latitud: Optional[float] = -17.3895
    longitud: Optional[float] = -66.1568

class EstablecimientoUpdate(BaseModel):
    horario: Optional[str] = None
    telefono: Optional[str] = None
    email_contacto: Optional[str] = None
    descripcion: Optional[str] = None
    servicios: Optional[str] = None
    direccion: Optional[str] = None
    responsable_laboratorio: Optional[str] = None
    responsables_areas: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    imagen_url: Optional[str] = None

# --- Respuestas Generales ---

class UsuarioResponse(BaseModel):
    id: uuid.UUID
    rol_id: int
    rol_nombre: Optional[str] = None
    nombres: str
    apellidos: str
    ci_nit: str
    email: str
    telefono: Optional[str] = None
    estado: bool
    fecha_creacion: datetime

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    mensaje: str
    usuario: UsuarioResponse

class MensajeRespuesta(BaseModel):
    mensaje: str
    usuario: Optional[UsuarioResponse] = None
    dev_link: Optional[str] = None

# ==============================================================================
# SCHEMAS PARA GESTIÓN DE USUARIOS (PANEL ADMINISTRADOR)
# ==============================================================================

class UsuarioAdminCreate(BaseModel):
    nombres: str = Field(..., min_length=2, max_length=100)
    apellidos: str = Field(..., min_length=2, max_length=100)
    ci_nit: str = Field(..., min_length=4, max_length=30)
    email: str = Field(..., max_length=150)
    telefono: Optional[str] = Field(None, max_length=30)
    rol: str = Field(..., description="Nombre del rol (ej: Supervisor Técnico, Coordinador SEDES)")
    password: Optional[str] = Field("Sedes2026!", min_length=6)

    @field_validator("email")
    @classmethod
    def validar_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(EMAIL_REGEX, v):
            raise ValueError("El correo electrónico no tiene un formato válido.")
        return v

class UsuarioAdminUpdate(BaseModel):
    nombres: Optional[str] = None
    apellidos: Optional[str] = None
    ci_nit: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    rol: Optional[str] = None
    estado: Optional[bool] = None

class UsuarioAdminResponse(BaseModel):
    id: str
    nombres: str
    apellidos: str
    nombreCompleto: str
    ci: str
    email: str
    telefono: Optional[str] = None
    rol: str
    rolBadgeColor: str
    ultimaConexion: str
    estado: str
    avatar: str
    fecha_creacion: Optional[str] = None

