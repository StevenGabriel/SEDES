from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import uuid

import models
from database import get_db
from security import decode_access_token

# Esquema de autenticación Bearer para Swagger UI y clientes API
security_bearer = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> models.Usuario:
    """
    Extrae y valida el JWT Bearer token de las cabeceras HTTP Authorization.
    Recupera el registro del usuario activo desde la base de datos PostgreSQL.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Autenticación requerida. Inicie sesión para acceder a este recurso.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de sesión inválido o expirado. Por favor vuelva a iniciar sesión.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id_str = payload.get("sub")
    if not user_id_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticación no contiene un identificador de usuario válido.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identificador de usuario inválido en el token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    usuario = db.query(models.Usuario).filter(models.Usuario.id == user_uuid).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="El usuario asociado a este token no existe en el sistema.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not usuario.estado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Su cuenta de usuario institucional se encuentra desactivada.",
        )
        
    return usuario

def get_current_active_user(
    current_user: models.Usuario = Depends(get_current_user)
) -> models.Usuario:
    """Dependencia alias para garantizar que el usuario se encuentra activo."""
    return current_user

def require_roles(allowed_roles: List[str]):
    """
    Generador de dependencias para Control de Acceso Basado en Roles (RBAC).
    Permite el acceso si el rol del usuario autenticado coincide con alguno de los roles permitidos
    o si el usuario posee el rol maestro 'Administrador'.
    """
    def role_checker(current_user: models.Usuario = Depends(get_current_user)) -> models.Usuario:
        user_role = current_user.rol.nombre if current_user.rol else ""
        allowed_normalized = [r.strip().lower() for r in allowed_roles]
        
        # El Administrador del sistema tiene acceso total
        if user_role.strip().lower() == "administrador" or user_role.strip().lower() in allowed_normalized:
            return current_user
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Acceso denegado: El rol '{user_role}' no cuenta con los privilegios requeridos para esta operación institucional."
        )
    return role_checker
