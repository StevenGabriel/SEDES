import logging
from datetime import datetime
from typing import Optional, Dict, Any
from fastapi import Request

# Logger estructurado de seguridad institucional
sec_logger = logging.getLogger("sedes.seguridad")
if not sec_logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [SEGURIDAD-%(levelname)s] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    sec_logger.addHandler(handler)
    sec_logger.setLevel(logging.INFO)

def extract_client_ip(request: Optional[Request] = None) -> str:
    """Extrae la dirección IP real del cliente."""
    if not request:
        return "N/A"
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"

def log_security_event(
    event_type: str,           # ej: "AUTH_LOGIN", "AUTH_RESET_PASSWORD", "ADMIN_USER_CREATE", "ADMIN_STATUS_CHANGE"
    action: str,               # ej: "Inicio de sesión", "Solicitud de restablecimiento"
    outcome: str,              # "SUCCESS", "FAILED", "BLOCKED"
    detail: str,
    email: Optional[str] = None,
    user_id: Optional[str] = None,
    ip_address: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None
):
    """
    Registra un evento de auditoría de seguridad en los logs del servidor.
    """
    user_identifier = email or user_id or "Anónimo"
    log_msg = f"[{outcome}] ({event_type}) {action} | Identificador: {user_identifier} | IP: {ip_address or 'N/A'} | Detalle: {detail}"

    if outcome == "SUCCESS":
        sec_logger.info(log_msg)
    elif outcome in ("FAILED", "BLOCKED"):
        sec_logger.warning(log_msg)
    else:
        sec_logger.info(log_msg)
