# backend/sockets/__init__.py

# Exposer les fonctions du websocket_manager pour une importation facile
from .websocket_manager import add_websocket, remove_websocket, broadcast_message

__all__ = ['add_websocket', 'remove_websocket', 'broadcast_message']
