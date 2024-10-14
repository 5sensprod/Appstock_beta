# backend/routes/session_routes.py
from flask import make_response
from .main_bp import main_bp  # Import du Blueprint principal

# Désactivation du cache en ajoutant un en-tête Cache-Control pour toutes les réponses
@main_bp.after_app_request
def add_header(response):
    """Ajoute des en-têtes pour désactiver la mise en cache."""
    response.headers['Cache-Control'] = 'no-store'  # Désactive la mise en cache
    return response
