# backend/routes/auth_routes.py
from flask import jsonify, request, session, make_response
from models import User
from .main_bp import main_bp  # Import du Blueprint principal
from werkzeug.security import generate_password_hash

# Route de connexion (login)
@main_bp.route('/api/login', methods=['POST'])
def login():
    """Route pour gérer l'authentification de l'utilisateur."""
    data = request.get_json()
    username = data.get('username')
    pin = data.get('pin')

    # Rechercher l'utilisateur dans la base de données
    user = User.query.filter_by(username=username).first()

    if user and user.check_pin(pin):
        # Authentification réussie : stocker l'ID utilisateur dans la session
        session['user_id'] = user.id
        return jsonify({'success': True}), 200
    else:
        # Échec de l'authentification
        return jsonify({'success': False, 'message': 'Nom d’utilisateur ou code PIN incorrect'}), 401

# Route pour vérifier la session utilisateur
@main_bp.route('/api/check-session', methods=['GET'])
def check_session():
    """Vérifie si l'utilisateur est authentifié."""
    if 'user_id' in session:
        return jsonify({'authenticated': True}), 200
    else:
        return jsonify({'authenticated': False}), 401

# Route de déconnexion (logout)
@main_bp.route('/api/logout', methods=['POST'])
def logout():
    """Déconnecte l'utilisateur en supprimant sa session."""
    session.pop('user_id', None)
    return jsonify({'success': True}), 200
