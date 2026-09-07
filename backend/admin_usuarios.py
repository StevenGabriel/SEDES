from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
import uuid

import models
import schemas
from database import get_db
from security import hash_password
from tokens import generate_password_reset_token
from email_service import send_user_invitation_email

router = APIRouter(prefix="/api/admin/usuarios", tags=["Gestión de Usuarios - Admin"])

def get_rol_badge_color(rol_nombre: str) -> str:
    rol_lower = rol_nombre.lower()
    if "director" in rol_lower:
        return "bg-indigo-50 text-indigo-700 border-indigo-200"
    elif "coordinador" in rol_lower:
        return "bg-sky-50 text-sky-700 border-sky-200"
    elif "administrador" in rol_lower:
        return "bg-slate-100 text-slate-800 border-slate-300"
    elif "supervisor" in rol_lower:
        return "bg-amber-50 text-amber-700 border-amber-200"
    elif "propietario" in rol_lower:
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
    return "bg-slate-50 text-slate-700 border-slate-200"

def get_avatar_url(email: str, nombres: str) -> str:
    # Mapeo de fotos oficiales
    avatars = {
        "f.castillo@sedes.gob.bo": "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=100&auto=format&fit=crop&q=80",
        "coordinador@sedes.gob.bo": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80",
        "admin@sedes.gob.bo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80",
        "supervisor@sedes.gob.bo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        "carlos.ruiz@sedes.gob.bo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        "patricia.valenzuela@sedes.gob.bo": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80",
        "andrea.torrico@sedes.gob.bo": "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=100&auto=format&fit=crop&q=80",
        "r.quiroga@sedes.gob.bo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&auto=format&fit=crop&q=80"
    }
    if email in avatars:
        return avatars[email]
    return f"https://ui-avatars.com/api/?name={nombres}&background=0077c8&color=fff&size=100"

def serializar_usuario(u: models.Usuario) -> schemas.UsuarioAdminResponse:
    rol_nombre = u.rol.nombre if u.rol else "Sin Rol"
    nombre_completo = f"{u.nombres} {u.apellidos}".strip()
    return schemas.UsuarioAdminResponse(
        id=str(u.id),
        nombres=u.nombres,
        apellidos=u.apellidos,
        nombreCompleto=nombre_completo,
        ci=u.ci_nit,
        email=u.email,
        telefono=u.telefono,
        rol=rol_nombre,
        rolBadgeColor=get_rol_badge_color(rol_nombre),
        ultimaConexion="En línea" if u.estado else "Inactivo",
        estado="Activo" if u.estado else "Inactivo",
        avatar=get_avatar_url(u.email, u.nombres),
        fecha_creacion=u.fecha_creacion.strftime("%Y-%m-%d %H:%M") if u.fecha_creacion else None
    )

# ==============================================================================
# 1. LISTAR USUARIOS (POR DEFECTO SOLO INSTITUCIONALES / SIN PROPIETARIOS)
# ==============================================================================
@router.get("", response_model=List[schemas.UsuarioAdminResponse], summary="Obtener usuarios registrados en la base de datos")
def listar_usuarios(
    solo_institucionales: bool = Query(True, description="Excluir usuarios con rol Propietario"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Usuario).join(models.Role)
    if solo_institucionales:
        query = query.filter(models.Role.nombre != "Propietario")
    
    usuarios = query.order_by(models.Role.id, models.Usuario.nombres).all()
    return [serializar_usuario(u) for u in usuarios]

# ==============================================================================
# 2. CREAR NUEVO USUARIO
# ==============================================================================
@router.post("", response_model=schemas.UsuarioAdminResponse, status_code=status.HTTP_201_CREATED, summary="Registrar nuevo usuario institucional")
def crear_usuario(
    datos: schemas.UsuarioAdminCreate,
    db: Session = Depends(get_db)
):
    email_norm = datos.email.strip().lower()
    ci_norm = datos.ci_nit.strip().upper()

    if db.query(models.Usuario).filter(models.Usuario.email == email_norm).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado."
        )

    if db.query(models.Usuario).filter(models.Usuario.ci_nit == ci_norm).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de CI ya se encuentra registrado."
        )

    rol_obj = db.query(models.Role).filter(models.Role.nombre == datos.rol).first()
    if not rol_obj:
        rol_obj = models.Role(nombre=datos.rol)
        db.add(rol_obj)
        db.commit()
        db.refresh(rol_obj)

    password_hash = hash_password(datos.password or "Sedes2026!")

    nuevo = models.Usuario(
        rol_id=rol_obj.id,
        nombres=datos.nombres.strip(),
        apellidos=datos.apellidos.strip(),
        ci_nit=ci_norm,
        email=email_norm,
        password_hash=password_hash,
        telefono=datos.telefono.strip() if datos.telefono else None,
        estado=True
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    # Generar token de activación y enviar correo de bienvenida
    token = generate_password_reset_token(nuevo.email, str(nuevo.id))
    resultado_email = send_user_invitation_email(
        to_email=nuevo.email,
        nombres=nuevo.nombres,
        rol=rol_obj.nombre,
        token=token
    )

    respuesta = serializar_usuario(nuevo)
    respuesta.dev_link = resultado_email.get("activation_link")
    respuesta.mensaje = f"Usuario registrado exitosamente y correo de activación enviado a {nuevo.email}"

    return respuesta

# ==============================================================================
# 3. ACTUALIZAR USUARIO
# ==============================================================================
@router.put("/{user_id}", response_model=schemas.UsuarioAdminResponse, summary="Editar datos de un usuario")
def actualizar_usuario(
    user_id: str,
    datos: schemas.UsuarioAdminUpdate,
    db: Session = Depends(get_db)
):
    try:
        u_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID de usuario inválido.")

    usuario = db.query(models.Usuario).filter(models.Usuario.id == u_uuid).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")

    if datos.email:
        email_norm = datos.email.strip().lower()
        existente = db.query(models.Usuario).filter(models.Usuario.email == email_norm, models.Usuario.id != u_uuid).first()
        if existente:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El correo ya está en uso por otro usuario.")
        usuario.email = email_norm

    if datos.ci_nit:
        ci_norm = datos.ci_nit.strip().upper()
        existente = db.query(models.Usuario).filter(models.Usuario.ci_nit == ci_norm, models.Usuario.id != u_uuid).first()
        if existente:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El CI ya está en uso por otro usuario.")
        usuario.ci_nit = ci_norm

    if datos.nombres is not None:
        usuario.nombres = datos.nombres.strip()
    if datos.apellidos is not None:
        usuario.apellidos = datos.apellidos.strip()
    if datos.telefono is not None:
        usuario.telefono = datos.telefono.strip()
    if datos.estado is not None:
        usuario.estado = datos.estado

    if datos.rol:
        rol_obj = db.query(models.Role).filter(models.Role.nombre == datos.rol).first()
        if not rol_obj:
            rol_obj = models.Role(nombre=datos.rol)
            db.add(rol_obj)
            db.commit()
            db.refresh(rol_obj)
        usuario.rol_id = rol_obj.id

    db.commit()
    db.refresh(usuario)
    return serializar_usuario(usuario)

# ==============================================================================
# 4. TOGGLE ESTADO (ACTIVAR / INACTIVAR)
# ==============================================================================
@router.patch("/{user_id}/toggle-estado", response_model=schemas.UsuarioAdminResponse, summary="Alternar estado Activo/Inactivo")
def toggle_estado_usuario(
    user_id: str,
    db: Session = Depends(get_db)
):
    try:
        u_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID de usuario inválido.")

    usuario = db.query(models.Usuario).filter(models.Usuario.id == u_uuid).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")

    usuario.estado = not usuario.estado
    db.commit()
    db.refresh(usuario)
    return serializar_usuario(usuario)

# ==============================================================================
# 5. ELIMINAR USUARIO
# ==============================================================================
@router.delete("/{user_id}", status_code=status.HTTP_200_OK, summary="Eliminar usuario de la base de datos")
def eliminar_usuario(
    user_id: str,
    db: Session = Depends(get_db)
):
    try:
        u_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ID de usuario inválido.")

    usuario = db.query(models.Usuario).filter(models.Usuario.id == u_uuid).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado.")

    db.delete(usuario)
    db.commit()
    return {"mensaje": f"Usuario {usuario.nombres} {usuario.apellidos} eliminado correctamente."}
