# backend/app.py
from flask import Flask
from flask_cors import CORS
import logging
import os
from config import Config  # Import de la configuration pour des paramètres centralisés
from db import db  # Import de la base de données
from routes import main_bp  # Import du Blueprint principal

# Initialisation de l'application Flask
app = Flask(__name__, static_folder='react_build', static_url_path='/')

# Chargement de la configuration de l'application depuis config.py
app.config.from_object(Config)

# Initialisation de la base de données avec l'application
db.init_app(app)

# Configuration de CORS pour permettre les requêtes depuis n'importe quelle origine
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Configuration de la journalisation
logging.basicConfig(level=logging.INFO)

# Enregistrement du Blueprint principal
app.register_blueprint(main_bp)

# Création des tables de la base de données si elles n'existent pas encore
with app.app_context():
    db.create_all()

# Lancement de l'application Flask
if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
