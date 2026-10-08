from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
import models.models as models
import schemas.schemas as schemas
from core.database import get_db
from core.security import hash_password, verify_password, create_access_token
from core.tokens import generate_password_reset_token, verify_password_reset_token
from core.email_service import send_password_reset_email
from core.auth_dependencies import get_current_user
from core.rate_limiter import login_rate_limiter, reset_rate_limiter, register_rate_limiter
from core.security_logger import log_security_event, extract_client_ip

router = APIRouter(prefix="/api/auth", tags=["Autenticación"])

# ==============================================================================
# 1. REGISTRO DE USUARIO (PROPIETARIO)
# ==============================================================================
@router.post(
    "/register", 
    response_model=schemas.UsuarioResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Registrar nuevo usuario con rol Propietario",
    dependencies=[Depends(register_rate_limiter)]
)
def registrar_propietario(
    datos_usuario: schemas.UsuarioRegistro, 
    request: Request,
    db: Session = Depends(get_db)
):
    email_normalizado = datos_usuario.email.strip().lower()
    ci_nit_normalizado = datos_usuario.ci_nit.strip().upper()
    client_ip = extract_client_ip(request)

    # Validar unicidad
    if db.query(models.Usuario).filter(models.Usuario.email == email_normalizado).first():
        log_security_event(
            event_type="AUTH_REGISTER_FAILED",
            action="Registro de Propietario",
            outcome="FAILED",
            detail="Intento de registro con correo electrónico ya existente.",
            email=email_normalizado,
            ip_address=client_ip
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo electrónico ya se encuentra registrado en el sistema."
        )

    if db.query(models.Usuario).filter(models.Usuario.ci_nit == ci_nit_normalizado).first():
        log_security_event(
            event_type="AUTH_REGISTER_FAILED",
            action="Registro de Propietario",
            outcome="FAILED",
            detail="Intento de registro con CI/NIT ya existente.",
            email=email_normalizado,
            ip_address=client_ip
        )
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

    log_security_event(
        event_type="AUTH_REGISTER_SUCCESS",
        action="Registro de Propietario",
        outcome="SUCCESS",
        detail="Nueva cuenta de Propietario creada exitosamente.",
        email=email_normalizado,
        user_id=str(nuevo_usuario.id),
        ip_address=client_ip
    )

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
    summary="Iniciar sesión en el sistema",
    dependencies=[Depends(login_rate_limiter)]
)
def iniciar_sesion(
    credenciales: schemas.UsuarioLogin,
    request: Request,
    db: Session = Depends(get_db)
):
    email_normalizado = credenciales.email.strip().lower()
    client_ip = extract_client_ip(request)

    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == email_normalizado
    ).first()

    if not usuario or not verify_password(credenciales.password, usuario.password_hash):
        log_security_event(
            event_type="AUTH_LOGIN_FAILED",
            action="Inicio de Sesión",
            outcome="FAILED",
            detail="Credenciales incorrectas o usuario inexistente.",
            email=email_normalizado,
            ip_address=client_ip
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas. Verifique su correo o contraseña."
        )

    if not usuario.estado:
        log_security_event(
            event_type="AUTH_LOGIN_BLOCKED",
            action="Inicio de Sesión",
            outcome="BLOCKED",
            detail="Intento de acceso con cuenta desactivada.",
            email=email_normalizado,
            user_id=str(usuario.id),
            ip_address=client_ip
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Su cuenta se encuentra inactiva o deshabilitada. Contacte con administración del SEDES."
        )

    rol_nombre = usuario.rol.nombre if usuario.rol else "Desconocido"

    # Generar token de acceso firmado JWT
    token_data = {
        "sub": str(usuario.id),
        "email": usuario.email,
        "rol": rol_nombre
    }
    access_token = create_access_token(token_data)

    log_security_event(
        event_type="AUTH_LOGIN_SUCCESS",
        action="Inicio de Sesión",
        outcome="SUCCESS",
        detail=f"Sesión iniciada con rol '{rol_nombre}'.",
        email=email_normalizado,
        user_id=str(usuario.id),
        ip_address=client_ip
    )

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
        access_token=access_token,
        token_type="bearer",
        usuario=usuario_resp
    )

# ==============================================================================
# 3. OBTENER PERFIL DE USUARIO AUTENTICADO
# ==============================================================================
@router.get(
    "/me",
    response_model=schemas.UsuarioResponse,
    status_code=status.HTTP_200_OK,
    summary="Obtener información del usuario autenticado"
)
def obtener_perfil_actual(
    usuario_actual: models.Usuario = Depends(get_current_user)
):
    rol_nombre = usuario_actual.rol.nombre if usuario_actual.rol else "Desconocido"
    return schemas.UsuarioResponse(
        id=usuario_actual.id,
        rol_id=usuario_actual.rol_id,
        rol_nombre=rol_nombre,
        nombres=usuario_actual.nombres,
        apellidos=usuario_actual.apellidos,
        ci_nit=usuario_actual.ci_nit,
        email=usuario_actual.email,
        telefono=usuario_actual.telefono,
        estado=usuario_actual.estado,
        fecha_creacion=usuario_actual.fecha_creacion
    )

# ==============================================================================
# 4. RECUPERACIÓN DE CONTRASEÑA POR TOKEN (10 MINUTOS)
# ==============================================================================
@router.post(
    "/solicitar-reset-password",
    response_model=schemas.MensajeRespuesta,
    status_code=status.HTTP_200_OK,
    summary="Solicitar envío de enlace temporal por correo electrónico",
    dependencies=[Depends(reset_rate_limiter)]
)
def solicitar_reset_password(
    solicitud: schemas.SolicitarResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    email_normalizado = solicitud.email.strip().lower()
    client_ip = extract_client_ip(request)
    
    usuario = db.query(models.Usuario).filter(
        models.Usuario.email == email_normalizado,
        models.Usuario.estado == True
    ).first()

    if usuario:
        # Generar token temporal firmado de 10 minutos
        token = generate_password_reset_token(usuario.email, str(usuario.id))
        
        # Enviar correo electrónico
        send_password_reset_email(usuario.email, usuario.nombres, token)

        log_security_event(
            event_type="AUTH_RESET_REQUESTED",
            action="Solicitud de Recuperación de Contraseña",
            outcome="SUCCESS",
            detail="Token temporal de recuperación generado y enviado por correo.",
            email=usuario.email,
            user_id=str(usuario.id),
            ip_address=client_ip
        )
    else:
        log_security_event(
            event_type="AUTH_RESET_REQUESTED",
            action="Solicitud de Recuperación de Contraseña",
            outcome="SUCCESS",
            detail="Solicitud recibida para correo no registrado (respuesta genérica).",
            email=email_normalizado,
            ip_address=client_ip
        )

    return schemas.MensajeRespuesta(
        mensaje="Si el correo electrónico está registrado en el sistema, hemos enviado un enlace de recuperación con vigencia de 10 minutos. Por favor revise su bandeja de entrada o spam."
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
    summary="Restablecer la contraseña utilizando el token temporal",
    dependencies=[Depends(reset_rate_limiter)]
)
def confirmar_reset_password(
    datos: schemas.RestablecerPasswordConTokenRequest,
    request: Request,
    db: Session = Depends(get_db)
):
    client_ip = extract_client_ip(request)

    # 1. Validar token y tiempo de expiración (10 min)
    resultado = verify_password_reset_token(datos.token)
    if not resultado["valid"]:
        log_security_event(
            event_type="AUTH_RESET_CONFIRM_FAILED",
            action="Confirmación de Recuperación",
            outcome="FAILED",
            detail=f"Token inválido o expirado: {resultado.get('error')}",
            ip_address=client_ip
        )
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
        log_security_event(
            event_type="AUTH_RESET_CONFIRM_FAILED",
            action="Confirmación de Recuperación",
            outcome="FAILED",
            detail="Usuario no encontrado o inactivo para el token proporcionado.",
            email=email_usuario,
            ip_address=client_ip
        )
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró una cuenta activa asociada a este enlace."
        )

    # 3. Hashear y actualizar contraseña
    nuevo_hash = hash_password(datos.nueva_password)
    usuario.password_hash = nuevo_hash
    db.commit()

    log_security_event(
        event_type="AUTH_RESET_CONFIRM_SUCCESS",
        action="Confirmación de Recuperación",
        outcome="SUCCESS",
        detail="Contraseña institucional actualizada exitosamente mediante token temporal.",
        email=usuario.email,
        user_id=str(usuario.id),
        ip_address=client_ip
    )

    return schemas.MensajeRespuesta(
        mensaje="¡Contraseña restablecida exitosamente! Ya puede iniciar sesión con su nueva clave."
    )
