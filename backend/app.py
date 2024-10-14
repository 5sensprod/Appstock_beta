from flask import Flask
from flask_cors import CORS
import os
import logging
from config import Config
from db import db
from routes import main_bp  # Import du blueprint principal pour toutes les routes
from db_initializer import init_demo_products  # Pour initialiser la base de données avec des produits démo
from sockets.websocket_routes import sock  # Import du sock configuré pour les WebSockets
from werkzeug.security import generate_password_hash  # Si nécessaire, l'importer ici

# Initialisation de l'application Flask
app = Flask(__name__, static_folder='react_build', static_url_path='/')

# Ajout de la clé secrète pour la gestion des sessions
app.secret_key = os.environ.get('SECRET_KEY', 'supersecretkey')  # Définit une clé secrète sécurisée

# Chargement de la configuration de l'application depuis config.py
app.config.from_object(Config)

# Initialisation de la base de données avec l'application
db.init_app(app)

# Initialisation de Flask-Sock pour les WebSockets
sock.init_app(app)

# Configuration de CORS pour permettre les requêtes depuis n'importe quelle origine
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Enregistrement du blueprint principal, qui inclut toutes les routes
app.register_blueprint(main_bp)

# Gestionnaire centralisé des connexions WebSocket
app.config['active_websockets'] = set()

# Initialisation de la base de données et création de l'utilisateur admin et des produits démo
with app.app_context():
    db.create_all()  # Création des tables
    init_demo_products(app)  # Ajout des produits démo

# Lancement de l'application Flask
if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
