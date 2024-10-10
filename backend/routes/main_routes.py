# backend/routes/main_routes.py
from flask import send_from_directory, jsonify
import os
import socket
from .main_bp import main_bp
import logging

# Route pour servir l'application React
@main_bp.route('/', defaults={'path': ''})
@main_bp.route('/<path:path>')
def serve_react_app(path):
    static_folder = 'react_build'  # Répertoire contenant le build React
    if path and os.path.exists(os.path.join(static_folder, path)):
        return send_from_directory(static_folder, path)
    else:
        return send_from_directory(static_folder, 'index.html')

# Route pour obtenir l'adresse IP locale du serveur Flask
@main_bp.route('/get_local_ip', methods=['GET'])
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
    except Exception as e:
        logging.error(f"Erreur lors de l'obtention de l'adresse IP locale : {e}")
        local_ip = '127.0.0.1'
    finally:
        s.close()
    return jsonify({"local_ip": local_ip})
