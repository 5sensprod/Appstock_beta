# app.py
from flask import Flask, send_from_directory, jsonify  # Ajout de jsonify ici
from flask_cors import CORS
import logging
import os
from routes import main_bp  # Importer le Blueprint
import socket

# Initialisation de l'application Flask
app = Flask(__name__, static_folder='react_build', static_url_path='/')

# Configuration de CORS pour permettre les requêtes depuis n'importe quelle origine
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Configuration de la journalisation
logging.basicConfig(level=logging.INFO)

# Enregistrement du Blueprint
app.register_blueprint(main_bp)

# Route pour servir l'application React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Nouvelle route pour obtenir l'adresse IP locale du serveur Flask
@app.route('/get_local_ip', methods=['GET'])
def get_local_ip():
    hostname = socket.gethostname()
    local_ip = socket.gethostbyname(hostname)
    return jsonify({"local_ip": local_ip})

# Lancement de l'application Flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
