from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import win32print
import serial
import logging
import os
import sys

# Initialisation de l'application Flask
app = Flask(__name__, static_folder='react_build', static_url_path='/')
CORS(app)

# Configuration de la journalisation
logging.basicConfig(level=logging.INFO)

# Clé secrète pour sécuriser la route /shutdown
SECRET_TOKEN = os.environ.get('FLASK_SECRET_TOKEN', 'mon_token_secret')

# Fonction pour envoyer le message à l'écran LCD
def display_on_lcd(message):
    try:
        ser = serial.Serial(port='COM11', baudrate=9600, timeout=1)
        if ser.is_open:
            logging.info("Port COM11 ouvert avec succès.")
            ser.write(message.encode('utf-8'))
            logging.info(f"Message envoyé à l'écran LCD : {message}")
            ser.close()
        else:
            logging.error("Impossible d'ouvrir le port COM11 pour l'affichage sur l'écran LCD.")
    except Exception as e:
        logging.error(f"Erreur lors de la communication avec l'écran LCD : {e}")

# Route pour l'impression
@app.route('/print', methods=['POST'])
def print_ticket():
    data = request.json
    message = data.get('message', 'Hello!')

    try:
        printer_name = "POS80"
        hPrinter = win32print.OpenPrinter(printer_name)
        hJob = win32print.StartDocPrinter(hPrinter, 1, ("Ticket Print", None, "RAW"))
        win32print.StartPagePrinter(hPrinter)

        full_message = message + "\n\n\n"
        win32print.WritePrinter(hPrinter, full_message.encode('cp437'))

        win32print.EndPagePrinter(hPrinter)
        win32print.EndDocPrinter(hPrinter)
        win32print.ClosePrinter(hPrinter)

        display_on_lcd(message)

        logging.info("Impression réussie sur l'imprimante POS80 et message envoyé à l'écran LCD")
        return jsonify({"status": "success", "message": "Impression réussie et message affiché sur l'écran LCD !"})
    except Exception as e:
        logging.error(f"Erreur lors de l'impression ou de l'affichage sur l'écran LCD : {e}")
        return jsonify({"status": "error", "message": f"Erreur lors de l'impression ou de l'affichage sur l'écran LCD : {e}"}), 500

# Route pour servir l'application React
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

# Fonction pour arrêter le serveur
def shutdown_server():
    logging.info('Arrêt du serveur Flask via os._exit(0)')
    os._exit(0)

# Route pour arrêter le serveur Flask
@app.route('/shutdown', methods=['POST'])
def shutdown():
    token = request.headers.get('Authorization')
    logging.info(f"Requête de shutdown reçue avec le token: {token}")
    if token == SECRET_TOKEN:
        logging.info("Token valide, arrêt du serveur en cours...")
        return shutdown_server()
    else:
        logging.warning('Tentative d\'arrêt non autorisée.')
        return 'Non autorisé.', 401

# Lancement de l'application Flask
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)
