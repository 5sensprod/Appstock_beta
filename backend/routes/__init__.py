from .main_bp import main_bp

# Importer les modules de routes pour enregistrer les routes avec le Blueprint
from . import print_routes
from . import shutdown_routes

__all__ = ['main_bp']