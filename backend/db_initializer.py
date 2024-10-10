# backend/db_initializer.py
from models import Product
from db import db

def init_demo_products(app):
    with app.app_context():
        if Product.query.first() is None:  # Vérifie si la base de données est vide
            demo_products = [
                Product(name='Produit Démo 1', price=10.99, stock=100),
                Product(name='Produit Démo 2', price=20.99, stock=50),
                Product(name='Produit Démo 3', price=5.49, stock=200),
            ]
            db.session.add_all(demo_products)
            db.session.commit()
            print('Produits de démonstration ajoutés à la base de données.')
