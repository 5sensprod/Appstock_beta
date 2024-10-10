# backend/app.py
from flask import Flask
from flask_cors import CORS
import logging
import os
from config import Config
from db import db
from routes import main_bp
from db_initializer import init_demo_products
from sockets.websocket_routes import sock  # Import du sock configuré

# Initialisation de l'application Flask
app = Flask(__name__, static_folder='react_build', static_url_path='/')

# Chargement de la configuration de l'application depuis config.py
app.config.from_object(Config)

# Initialisation de la base de données avec l'application
db.init_app(app)

# Initialisation de Flask-Sock pour les WebSockets avec l'application
sock.init_app(app)

# Configuration de CORS pour permettre les requêtes depuis n'importe quelle origine
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Configuration de la journalisation
logging.basicConfig(level=logging.INFO)

# Enregistrement du Blueprint principal
app.register_blueprint(main_bp)

# Gestionnaire centralisé des connexions WebSocket
app.config['active_websockets'] = set()

# Création des tables de la base de données et ajout des produits de démonstration si nécessaire
with app.app_context():
    db.create_all()
    init_demo_products(app)

# Lancement de l'application Flask
if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
