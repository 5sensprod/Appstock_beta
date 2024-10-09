# utils/lcd.py
import serial
import logging

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
