# backend/app.py
from flask import Flask, current_app  # Ajout de current_app pour manipuler les WebSockets
from flask_cors import CORS
from flask_sock import Sock
import logging
import os
from config import Config
from db import db
from routes import main_bp
from db_initializer import init_demo_products

# Initialisation de l'application Flask
app = Flask(__name__, static_folder='react_build', static_url_path='/')

# Chargement de la configuration de l'application depuis config.py
app.config.from_object(Config)

# Initialisation de la base de données avec l'application
db.init_app(app)

# Initialisation de Flask-Sock pour les WebSockets
sock = Sock(app)

# Configuration de CORS pour permettre les requêtes depuis n'importe quelle origine
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

# Configuration de la journalisation
logging.basicConfig(level=logging.INFO)

# Enregistrement du Blueprint principal
app.register_blueprint(main_bp)

# Gestionnaire centralisé des connexions WebSocket
app.config['active_websockets'] = set()

# Route WebSocket pour gérer les communications en temps réel
@sock.route('/ws')
def websocket_route(ws):
    # Ajouter la connexion WebSocket active à l'ensemble
    current_app.config['active_websockets'].add(ws)
    app.logger.info('Client WebSocket connecté.')

    try:
        while True:
            message = ws.receive()
            if message:
                app.logger.info(f'Message reçu : {message}')
                ws.send(f'Message reçu : {message}')
    except Exception as e:
        app.logger.error(f'Erreur WebSocket : {e}')
    finally:
        # Supprimer la connexion WebSocket lorsque le client se déconnecte
        current_app.config['active_websockets'].remove(ws)
        app.logger.info('Client WebSocket déconnecté.')

# Création des tables de la base de données et ajout des produits de démonstration si nécessaire
with app.app_context():
    db.create_all()
    init_demo_products(app)

# Lancement de l'application Flask
if __name__ == '__main__':
    debug_mode = os.environ.get('FLASK_ENV') == 'development'
    app.run(host='0.0.0.0', port=5000, debug=debug_mode)
