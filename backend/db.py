# backend/db.py
from flask_sqlalchemy import SQLAlchemy

# Créez une instance de SQLAlchemy, mais ne la liez pas encore à l'application
db = SQLAlchemy()