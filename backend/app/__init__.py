from flask import Flask
from flask_cors import CORS
import logging

def create_app():
    app = Flask(__name__, static_folder='react_build', static_url_path='/')
    
    # Configuration CORS
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

    # Configurer la journalisation
    logging.basicConfig(level=logging.INFO)
    
    with app.app_context():
        # Importer les routes ici pour éviter les importations circulaires
        from . import routes
        app.register_blueprint(routes.bp)

    return app
