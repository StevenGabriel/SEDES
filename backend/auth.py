from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import models
import schemas
from database import get_db
from security import hash_password

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

@router.post(
    "/register", 
    response_model=schemas.UsuarioResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo usuario con rol Propietario"
)
def registrar_propietario(
    datos_usuario: schemas.UsuarioRegistro, 
    db: Session = Depends(get_db)
):
    # 1. Normalizar entradas
    email_normalizado = datos_usuario.email.strip().lower()
    ci_nit_normalizado = datos_usuario.ci_nit.strip().upper()

    # 2. Validar si el correo electrónico ya está registrado
    usuario_existente_email = db.query(models.Usuario).filter(
        models.Usuario.email == email_normalizado
    ).first()
    if usuario_existente_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado en el sistema."
        )

    # 3. Validar si el CI / NIT ya está registrado
    usuario_existente_ci = db.query(models.Usuario).filter(
        models.Usuario.ci_nit == ci_nit_normalizado
    ).first()
    if usuario_existente_ci:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de CI / NIT ya se encuentra registrado."
        )

    # 4. Obtener el rol 'Propietario'
    rol_propietario = db.query(models.Role).filter(
        models.Role.nombre == "Propietario"
    ).first()
    
    if not rol_propietario:
        # Si por alguna razón no existiera, se inicializa automáticamente
        rol_propietario = models.Role(nombre="Propietario")
        db.add(rol_propietario)
        db.commit()
        db.refresh(rol_propietario)

    # 5. Generar hash seguro de la contraseña
    password_hasheada = hash_password(datos_usuario.password)

    # 6. Crear nuevo registro de usuario
    nuevo_usuario = models.Usuario(
        rol_id=rol_propietario.id,
        nombres=datos_usuario.nombres.strip(),
        apellidos=datos_usuario.apellidos.strip(),
        ci_nit=ci_nit_normalizado,
        email=email_normalizado,
        password_hash=password_hasheada,
        telefono=datos_usuario.telefono.strip() if datos_usuario.telefono else None,
        estado=True
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    # Preparar respuesta
    return schemas.UsuarioResponse(
        id=nuevo_usuario.id,
        rol_id=nuevo_usuario.rol_id,
        rol_nombre=rol_propietario.nombre,
        nombres=nuevo_usuario.nombres,
        apellidos=nuevo_usuario.apellidos,
        ci_nit=nuevo_usuario.ci_nit,
        email=nuevo_usuario.email,
        telefono=nuevo_usuario.telefono,
        estado=nuevo_usuario.estado,
        fecha_creacion=nuevo_usuario.fecha_creacion
    )
