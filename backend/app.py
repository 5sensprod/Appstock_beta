from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS  # Importer CORS pour gérer les requêtes cross-origin
import win32print
import serial
import logging
import os

# Initialisation de l'application Flask
app = Flask(__name__, static_folder='react_build', static_url_path='/')
CORS(app)

# Configuration de la journalisation pour le débogage
logging.basicConfig(level=logging.INFO)

# Fonction pour envoyer le message à l'écran LCD via le port COM 11
def display_on_lcd(message):
    try:
        ser = serial.Serial(port='COM11', baudrate=9600, timeout=1)
        if ser.is_open:
            logging.info("Port COM11 ouvert avec succès.")
            ser.write(message.encode('utf-8'))  # Envoyer le message à l'écran LCD
            logging.info(f"Message envoyé à l'écran LCD : {message}")
            ser.close()
        else:
            logging.error("Impossible d'ouvrir le port COM11 pour l'affichage sur l'écran LCD.")
    except Exception as e:
        logging.error(f"Erreur lors de la communication avec l'écran LCD : {e}")

# Route pour l'impression
@app.route('/print', methods=['POST'])
def print_ticket():
    data = request.json  # Récupère le texte à imprimer depuis la requête JSON
    message = data.get('message', 'Hello!')

    try:
        printer_name = "POS80"  # Assurez-vous que ce nom correspond à celui de votre imprimante
        hPrinter = win32print.OpenPrinter(printer_name)
        hJob = win32print.StartDocPrinter(hPrinter, 1, ("Ticket Print", None, "RAW"))
        win32print.StartPagePrinter(hPrinter)

        full_message = message + "\n\n\n"  # Ajouter des sauts de ligne pour faire avancer le papier
        # cut_command = "\x1d\x56\x41\x03"   Commande ESC/POS pour couper le papier

        win32print.WritePrinter(hPrinter, full_message.encode('cp437'))  # Utiliser l'encodage cp437
       # win32print.WritePrinter(hPrinter, cut_command.encode('cp437'))   Envoyer la commande de coupe

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
    # Vérifier si le chemin demandé existe dans le dossier build
    if path and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        # Si le chemin n'existe pas, retourner index.html (React gérera la navigation côté client)
        return send_from_directory(app.static_folder, 'index.html')

# Lancer l'application Flask
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)  # Activation du mode debug pour plus d'informations