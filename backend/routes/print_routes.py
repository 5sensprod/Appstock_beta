# routes/print_routes.py
from flask import request, jsonify
import win32print
import logging
from . import main_bp
from utils.lcd import display_on_lcd

@main_bp.route('/print', methods=['POST'])
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
