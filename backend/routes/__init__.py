# backend/routes/__init__.py
from .main_bp import main_bp

# Importation des modules de routes pour enregistrer les routes avec le Blueprint
from . import main_routes
from . import print_routes
from . import shutdown_routes
from . import product_routes
from . import network_routes

__all__ = ['main_bp']