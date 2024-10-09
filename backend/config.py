# config.py
import os

SECRET_TOKEN = os.environ.get('FLASK_SECRET_TOKEN', 'mon_token_secret')
