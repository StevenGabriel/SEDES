"""
SEDES Cochabamba - Backend Package
"""
import sys
import os

# Asegurar que el directorio de backend esté en sys.path para compatibilidad de imports
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
