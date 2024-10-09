# routes/__init__.py
from flask import Blueprint

main_bp = Blueprint('main', __name__)

from . import print_routes, shutdown_routes

# Utilisation des modules pour éviter le warning
_ = print_routes
_ = shutdown_routes