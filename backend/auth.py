from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import models
import schemas
from database import get_db
from security import hash_password, verify_password
from tokens import generate_password_reset_token, verify_password_reset_token
from email_service import send_password_reset_email

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

# ==============================================================================
# 1. REGISTRO DE USUARIO (PROPIETARIO)
# ==============================================================================
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
    email_normalizado = datos_usuario.email.strip().lower()
    ci_nit_normalizado = datos_usuario.ci_nit.strip().upper()

    # Validar unicidad
    if db.query(models.Usuario).filter(models.Usuario.email == email_normalizado).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado en el sistema."
        )

    if db.query(models.Usuario).filter(models.Usuario.ci_nit == ci_nit_normalizado).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El número de CI / NIT ya se encuentra registrado."
        )

    # Rol Propietario
    rol_propietario = db.query(models.Role).filter(models.Role.nombre == "Propietario").first()
    if not rol_propietario:
        rol_propietario = models.Role(nombre="Propietario")
        db.add(rol_propietario)
        db.commit()
        db.refresh(rol_propietario)

    password_hasheada = hash_password(datos_usuario.password)

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

# ==============================================================================
# 2. INICIO DE SESIÓN (LOGIN)
# ==============================================================================
@router.post(
    "/login",
    response_model=schemas.LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Iniciar sesión en el sistema"
)
def iniciar_sesion(
    credenciales: schemas.UsuarioLogin,
    db: Session = Depends(get_db)
):
    email_normalizado = credenciales.email.strip().lower()

    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == email_normalizado
    ).first()

    if not usuario or not verify_password(credenciales.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas. Verifique su correo o contraseña."
        )

    if not usuario.estado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Su cuenta se encuentra inactiva o deshabilitada. Contacte con administración del SEDES."
        )

    rol_nombre = usuario.rol.nombre if usuario.rol else "Desconocido"

    usuario_resp = schemas.UsuarioResponse(
        id=usuario.id,
        rol_id=usuario.rol_id,
        rol_nombre=rol_nombre,
        nombres=usuario.nombres,
        apellidos=usuario.apellidos,
        ci_nit=usuario.ci_nit,
        email=usuario.email,
        telefono=usuario.telefono,
        estado=usuario.estado,
        fecha_creacion=usuario.fecha_creacion
    )

    return schemas.LoginResponse(
        mensaje="Inicio de sesión exitoso.",
        usuario=usuario_resp
    )

# ==============================================================================
# 3. RECUPERACIÓN DE CONTRASEÑA POR TOKEN (10 MINUTOS)
# ==============================================================================
@router.post(
    "/solicitar-reset-password",
    response_model=schemas.MensajeRespuesta,
    status_code=status.HTTP_200_OK,
    summary="Solicitar envío de enlace temporal por correo electrónico"
)
def solicitar_reset_password(
    solicitud: schemas.SolicitarResetPasswordRequest,
    db: Session = Depends(get_db)
):
    email_normalizado = solicitud.email.strip().lower()
    
    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == email_normalizado,
        models.Usuario.estado == True
    ).first()

    dev_link = None
    if usuario:
        # Generar token temporal firmado de 10 minutos
        token = generate_password_reset_token(usuario.email, str(usuario.id))
        
        # Enviar correo electrónico
        resultado_envio = send_password_reset_email(usuario.email, usuario.nombres, token)
        dev_link = resultado_envio.get("reset_link")

    return schemas.MensajeRespuesta(
        mensaje="Si el correo electrónico está registrado en el sistema, hemos enviado un enlace de recuperación con vigencia de 10 minutos. Por favor revise su bandeja de entrada o spam.",
        dev_link=dev_link
    )

@router.get(
    "/verificar-token-reset",
    response_model=schemas.VerificarTokenResponse,
    summary="Verificar si el token de recuperación sigue vigente"
)
def verificar_token_reset(token: str = Query(..., description="Token de recuperación")):
    resultado = verify_password_reset_token(token)
    if not resultado["valid"]:
        return schemas.VerificarTokenResponse(
            valido=False,
            mensaje=resultado["error"]
        )
    
    return schemas.VerificarTokenResponse(
        valido=True,
        email=resultado.get("email"),
        mensaje="Token válido y activo."
    )

@router.post(
    "/confirmar-reset-password",
    response_model=schemas.MensajeRespuesta,
    status_code=status.HTTP_200_OK,
    summary="Restablecer la contraseña utilizando el token temporal"
)
def confirmar_reset_password(
    datos: schemas.RestablecerPasswordConTokenRequest,
    db: Session = Depends(get_db)
):
    # 1. Validar token y tiempo de expiración (10 min)
    resultado = verify_password_reset_token(datos.token)
    if not resultado["valid"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=resultado["error"]
        )
    
    email_usuario = resultado.get("email")
    
    # 2. Buscar usuario en base de datos
    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == email_usuario,
        models.Usuario.estado == True
    ).first()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró una cuenta activa asociada a este enlace."
        )

    # 3. Hashear y actualizar contraseña
    nuevo_hash = hash_password(datos.nueva_password)
    usuario.password_hash = nuevo_hash
    db.commit()

    return schemas.MensajeRespuesta(
        mensaje="¡Contraseña restablecida exitosamente! Ya puede iniciar sesión con su nueva clave."
    )
