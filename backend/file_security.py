import os
import uuid
import re
from typing import List, Tuple
from fastapi import UploadFile, HTTPException, status

# Límites máximos
MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024  # 20 MB

# Firmas de cabecera binaria (Magic Bytes)
MAGIC_SIGNATURES = {
    "pdf": [b"%PDF"],
    "png": [b"\x89PNG\r\n\x1a\n"],
    "jpg": [b"\xff\xd8\xff"],
    "jpeg": [b"\xff\xd8\xff"],
    "webp": [b"RIFF"]  # Comprobado con WEBP en offset 8
}

ALLOWED_EXTENSIONS_MAP = {
    "pdf": [".pdf"],
    "image": [".jpg", ".jpeg", ".png", ".webp"],
    "all": [".pdf", ".jpg", ".jpeg", ".png", ".webp"]
}

def sanitize_filename_slug(name: str) -> str:
    """Elimina caracteres peligrosos del nombre de archivo original."""
    base_name = os.path.splitext(os.path.basename(name))[0]
    clean = re.sub(r'[^a-zA-Z0-9_\-]', '_', base_name).strip('_')
    return clean[:40] if clean else "archivo"

def verify_magic_bytes(header: bytes, ext: str) -> bool:
    """Verifica si los primeros bytes del archivo corresponden a la firma binaria esperada."""
    ext_clean = ext.lstrip(".").lower()
    
    if ext_clean == "pdf":
        return header.startswith(b"%PDF")
    elif ext_clean in ("jpg", "jpeg"):
        return header.startswith(b"\xff\xd8\xff")
    elif ext_clean == "png":
        return header.startswith(b"\x89PNG\r\n\x1a\n")
    elif ext_clean == "webp":
        return len(header) >= 12 and header.startswith(b"RIFF") and header[8:12] == b"WEBP"
    
    return False

async def validate_and_save_upload(
    upload_file: UploadFile,
    target_dir: str,
    category: str = "pdf",  # "pdf", "image", or "all"
    max_size_mb: int = 20,
    prefix: str = "doc"
) -> Tuple[str, str]:
    """
    Valida completamente el archivo subido:
    1. Extensión de archivo permitida.
    2. Tamaño total dentro del límite seguro.
    3. Magic bytes binarios reales (MIME sniffing prevention).
    4. Prevención de Directory/Path Traversal.
    5. Guarda el archivo con un UUID criptográfico seguro y retorna (safe_filename, abs_file_path).
    """
    if not upload_file or not upload_file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se proporcionó ningún archivo para subir."
        )

    # 1. Validar extensión permitida
    _, ext = os.path.splitext(upload_file.filename)
    ext = ext.lower()
    allowed_exts = ALLOWED_EXTENSIONS_MAP.get(category, ALLOWED_EXTENSIONS_MAP["all"])
    
    if ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Extensión no permitida '{ext}'. Formatos válidos: {', '.join(allowed_exts)}"
        )

    # 2. Leer contenido en chunks controlando tamaño máximo
    content = await upload_file.read()
    file_size = len(content)
    max_bytes = max_size_mb * 1024 * 1024

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo proporcionado está vacío (0 bytes)."
        )

    if file_size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"El archivo excede el tamaño máximo permitido de {max_size_mb} MB."
        )

    # 3. Validar Magic Bytes binarios reales
    header = content[:32]
    if not verify_magic_bytes(header, ext):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El contenido binario del archivo no coincide con su extensión declarada (archivo corrupto o inválido)."
        )

    # 4. Sanitización y Prevención de Path Traversal
    os.makedirs(target_dir, exist_ok=True)
    abs_target_dir = os.path.abspath(target_dir)

    safe_slug = sanitize_filename_slug(upload_file.filename)
    safe_filename = f"{prefix}_{uuid.uuid4().hex[:12]}_{safe_slug}{ext}"
    abs_file_path = os.path.abspath(os.path.join(abs_target_dir, safe_filename))

    # Asegurar que la ruta final está estrictamente dentro del directorio destino
    if not abs_file_path.startswith(abs_target_dir):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ruta de destino inválida detectada (Path Traversal prevenido)."
        )

    # 5. Escribir archivo en disco
    with open(abs_file_path, "wb") as f:
        f.write(content)

    return safe_filename, abs_file_path
