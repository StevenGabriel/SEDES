import hmac
import hashlib
import base64
import json
import time
import os

SECRET_KEY = os.getenv("SECRET_KEY", "sedes-secret-key-laboratorios-2026-secure-token-98745")
EXPIRATION_SECONDS = 600  # 10 minutos de vigencia

def generate_password_reset_token(email: str, user_id: str) -> str:
    """
    Genera un token criptográfico firmado HMAC-SHA256 con fecha de caducidad exacta de 10 minutos.
    """
    now = int(time.time())
    payload = {
        "email": email.strip().lower(),
        "uid": str(user_id),
        "iat": now,
        "exp": now + EXPIRATION_SECONDS
    }
    payload_bytes = json.dumps(payload, separators=(',', ':')).encode("utf-8")
    payload_b64 = base64.urlsafe_b64encode(payload_bytes).decode("utf-8").rstrip("=")
    
    signature = hmac.new(
        SECRET_KEY.encode("utf-8"),
        payload_b64.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    
    return f"{payload_b64}.{signature}"

def verify_password_reset_token(token: str) -> dict:
    """
    Verifica la integridad de la firma y el tiempo de expiración (máx 10 minutos).
    """
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return {"valid": False, "error": "El formato del token de seguridad es inválido."}
        
        payload_b64, signature = parts
        
        # 1. Verificar firma HMAC
        expected_signature = hmac.new(
            SECRET_KEY.encode("utf-8"),
            payload_b64.encode("utf-8"),
            hashlib.sha256
        ).hexdigest()
        
        if not hmac.compare_digest(signature, expected_signature):
            return {"valid": False, "error": "El enlace de seguridad es inválido o ha sido alterado."}
        
        # 2. Decodificar payload
        rem = len(payload_b64) % 4
        if rem > 0:
            payload_b64 += "=" * (4 - rem)
        
        payload = json.loads(base64.urlsafe_b64decode(payload_b64.encode("utf-8")).decode("utf-8"))
        
        # 3. Comprobar expiración de 10 minutos
        now = int(time.time())
        if now > payload.get("exp", 0):
            return {
                "valid": False, 
                "error": "El enlace de recuperación ha expirado (duración máxima de 10 minutos). Por favor solicite uno nuevo."
            }
        
        return {
            "valid": True, 
            "email": payload.get("email"), 
            "uid": payload.get("uid")
        }
    except Exception as e:
        return {"valid": False, "error": f"Error al procesar el token: {str(e)}"}
