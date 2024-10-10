# backend/sockets/websocket_manager.py
from flask import current_app
import json

def add_websocket(ws):
    """Ajouter une nouvelle connexion WebSocket à la liste des connexions actives."""
    current_app.config['active_websockets'].add(ws)
    current_app.logger.info('Client WebSocket connecté.')

def remove_websocket(ws):
    """Supprimer une connexion WebSocket de la liste des connexions actives."""
    current_app.config['active_websockets'].remove(ws)
    current_app.logger.info('Client WebSocket déconnecté.')

def broadcast_message(message):
    """Envoyer un message à tous les clients WebSocket connectés."""
    serialized_message = json.dumps(message)
    for ws in current_app.config['active_websockets']:
        try:
            ws.send(serialized_message)
        except Exception as e:
            current_app.logger.error(f'Erreur lors de l\'envoi de l\'événement WebSocket : {e}')
