# backend/sockets/websocket_routes.py
from flask_sock import Sock
from sockets import add_websocket, remove_websocket
from flask import current_app

sock = Sock()

@sock.route('/ws')
def websocket_route(ws):
    # Ajouter la connexion WebSocket active
    add_websocket(ws)

    try:
        while True:
            message = ws.receive()
            if message:
                current_app.logger.info(f'Message reçu : {message}')
                ws.send(f'Message reçu : {message}')
    except Exception as e:
        current_app.logger.error(f'Erreur WebSocket : {e}')
    finally:
        # Supprimer la connexion WebSocket lorsque le client se déconnecte
        remove_websocket(ws)
