from flask import Blueprint, request, jsonify, send_from_directory
from .services import print_ticket, display_on_lcd, get_local_ip, shutdown_server
import os

bp = Blueprint('main', __name__)

@bp.route('/print', methods=['POST'])
def print_route():
    return print_ticket(request.json)

@bp.route('/get_local_ip', methods=['GET'])
def local_ip():
    return jsonify({"local_ip": get_local_ip()})

@bp.route('/shutdown', methods=['POST'])
def shutdown():
    token = request.headers.get('Authorization')
    if token == os.getenv('FLASK_SECRET_TOKEN'):
        return shutdown_server()
    else:
        return 'Non autorisé.', 401

@bp.route('/', defaults={'path': ''})
@bp.route('/<path:path>')
def serve_react_app(path):
    if path and os.path.exists(os.path.join(bp.static_folder, path)):
        return send_from_directory(bp.static_folder, path)
    else:
        return send_from_directory(bp.static_folder, 'index.html')
