# routes/shutdown_routes.py
from flask import request
import logging
import os
from . import main_bp
from config import SECRET_TOKEN

def shutdown_server():
    logging.info('Arrêt du serveur Flask via os._exit(0)')
    os._exit(0)

@main_bp.route('/shutdown', methods=['POST'])
def shutdown():
    token = request.headers.get('Authorization')
    logging.info(f"Requête de shutdown reçue avec le token: {token}")
    if token == SECRET_TOKEN:
        logging.info("Token valide, arrêt du serveur en cours...")
        return shutdown_server()
    else:
        logging.warning('Tentative d\'arrêt non autorisée.')
        return 'Non autorisé.', 401
