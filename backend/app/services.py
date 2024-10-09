import win32print
import serial
import logging
import socket
import os
from flask import jsonify

# Configuration de la journalisation
logging.basicConfig(level=logging.INFO)

def display_on_lcd(message):
    """
    Envoie un message à l'écran LCD via le port série.
    
    :param message: Le message à afficher sur l'écran LCD
    """
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

def print_message(message):
    """
    Gère l'impression d'un message sur l'imprimante POS80.

    :param message: Le message à imprimer
    :return: Un tuple contenant le statut de l'impression et le message correspondant
    """
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
        return {"status": "success", "message": "Impression réussie et message affiché sur l'écran LCD !"}
    except Exception as e:
        logging.error(f"Erreur lors de l'impression ou de l'affichage sur l'écran LCD : {e}")
        return {"status": "error", "message": f"Erreur lors de l'impression ou de l'affichage sur l'écran LCD : {e}"}

def get_local_ip():
    hostname = socket.gethostname()
    return socket.gethostbyname(hostname)

def shutdown_server():
    logging.info('Arrêt du serveur Flask via os._exit(0)')
    os._exit(0)
