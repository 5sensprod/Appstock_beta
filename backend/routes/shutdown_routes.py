# backend/routes/shutdown_routes.py
from flask import request, jsonify
import logging
import os
from .main_bp import main_bp
from config import Config

def shutdown_server():
    logging.info('Arrêt du serveur Flask via os._exit(0)')
    os._exit(0)

@main_bp.route('/shutdown', methods=['POST'])
def shutdown():
    token = request.headers.get('Authorization')
    logging.info(f"Requête de shutdown reçue avec le token : {token}")
    if token == Config.SECRET_TOKEN:
        logging.info("Token valide, arrêt du serveur en cours...")
        shutdown_server()
        return jsonify({'message': 'Arrêt du serveur initié.'}), 200
    else:
        logging.warning('Tentative d\'arrêt non autorisée.')
        return jsonify({'error': 'Non autorisé.'}), 401
