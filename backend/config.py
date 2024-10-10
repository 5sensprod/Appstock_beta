# backend/config.py
import os

class Config:
    # Définir le chemin de la base de données SQLite dans le dossier utilisateur
    if os.name == 'nt':  # Pour Windows
        DB_PATH = os.path.join(os.environ['APPDATA'], 'POSApp', 'app.db')
    else:  # Pour macOS et Linux
        DB_PATH = os.path.join(os.path.expanduser('~'), '.posapp', 'app.db')

    # Créez le répertoire de destination s'il n'existe pas encore
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

    # Configuration de la base de données SQLite
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DB_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Gestion du secret token
    SECRET_TOKEN = os.environ.get('FLASK_SECRET_TOKEN', 'mon_token_secret')
