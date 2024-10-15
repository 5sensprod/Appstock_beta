from flask import send_from_directory
import os
import sys  # Importer sys pour vérifier si l'application est packagée
from .main_bp import main_bp

# Route pour servir l'application React
@main_bp.route('/', defaults={'path': ''})
@main_bp.route('/<path:path>')
def serve_react_app(path):
    # Vérifie si on est dans un environnement packagé (PyInstaller)
    if getattr(sys, 'frozen', False):  
        # Si l'application est packagée avec PyInstaller, utilisez le chemin interne _MEIPASS
        static_folder = os.path.join(sys._MEIPASS, 'react_build')
    else:
        # Sinon, utilisez le chemin standard en développement
        static_folder = os.path.join(os.path.dirname(__file__), '../dist/react_build')

    # Si le fichier demandé existe, on le sert
    if path and os.path.exists(os.path.join(static_folder, path)):
        return send_from_directory(static_folder, path)
    else:
        return send_from_directory(static_folder, 'index.html')
