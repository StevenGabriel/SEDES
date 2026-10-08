import time
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    """
    Limitador de tasa de peticiones en memoria mediante ventana deslizante (Sliding Window).
    Limpia automáticamente peticiones antiguas y calcula el tiempo de espera (Retry-After).
    """
    def __init__(self, max_requests: int, window_seconds: int):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = defaultdict(list)

    def is_rate_limited(self, key: str) -> Tuple[bool, int]:
        """
        Evalúa si la clave ha excedido el número máximo de peticiones dentro de la ventana.
        Retorna (is_limited, retry_after_seconds).
        """
        now = time.time()
        window_start = now - self.window_seconds
        
        # Descartar registros anteriores al inicio de la ventana actual
        valid_timestamps = [t for t in self.requests[key] if t > window_start]
        self.requests[key] = valid_timestamps
        
        if len(valid_timestamps) >= self.max_requests:
            oldest = valid_timestamps[0]
            retry_after = int(self.window_seconds - (now - oldest)) + 1
            return True, max(retry_after, 1)
        
        self.requests[key].append(now)
        return False, 0

def create_rate_limiter(max_requests: int = 5, window_seconds: int = 60, name: str = "general"):
    """
    Genera una dependencia FastAPI para aplicar rate limiting por IP de origen.
    """
    limiter = InMemoryRateLimiter(max_requests=max_requests, window_seconds=window_seconds)
    
    async def dependency(request: Request):
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.client.host if request.client else "127.0.0.1"
            
        key = f"{name}:{client_ip}"
        is_limited, retry_after = limiter.is_rate_limited(key)
        
        if is_limited:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Demasiadas solicitudes consecutivas. Por motivos de seguridad institucional, por favor espere {retry_after} segundos antes de volver a intentar.",
                headers={"Retry-After": str(retry_after)}
            )
    return dependency

# Instancias preconfiguradas
login_rate_limiter = create_rate_limiter(max_requests=5, window_seconds=60, name="login")
reset_rate_limiter = create_rate_limiter(max_requests=3, window_seconds=300, name="reset_password")
register_rate_limiter = create_rate_limiter(max_requests=5, window_seconds=300, name="register")
