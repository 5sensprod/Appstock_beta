# backend/models.py
from db import db

class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)

    def to_dict(self):
        """
        Convertit l'objet Product en dictionnaire pour une utilisation facile dans les réponses JSON.
        """
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'stock': self.stock
        }

    def __repr__(self):
        return f'<Product {self.name}>'
