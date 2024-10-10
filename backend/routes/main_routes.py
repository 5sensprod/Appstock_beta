# backend/routes/main_routes.py
from flask import send_from_directory
import os
from .main_bp import main_bp

# Route pour servir l'application React
@main_bp.route('/', defaults={'path': ''})
@main_bp.route('/<path:path>')
def serve_react_app(path):
    static_folder = 'react_build'  # Répertoire contenant le build React
    if path and os.path.exists(os.path.join(static_folder, path)):
        return send_from_directory(static_folder, path)
    else:
        return send_from_directory(static_folder, 'index.html')
