# backend/routes/network_routes.py
from flask import jsonify
import socket
import logging
from .main_bp import main_bp

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
