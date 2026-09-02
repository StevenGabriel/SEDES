import uuid
import re
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator

# ==============================================================================
# SCHEMAS DE AUTENTICACIÓN Y REGISTRO DE USUARIOS
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

class MensajeRespuesta(BaseModel):
    mensaje: str
    usuario: Optional[UsuarioResponse] = None
