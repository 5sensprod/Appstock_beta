from db import db
from werkzeug.security import generate_password_hash, check_password_hash

# Modèle de produit existant
class Product(db.Model):
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    stock = db.Column(db.Integer, default=0)

    def to_dict(self):
        """Convertit l'objet Product en dictionnaire pour une utilisation facile dans les réponses JSON."""
        return {
            'id': self.id,
            'name': self.name,
            'price': self.price,
            'stock': self.stock
        }

    def __repr__(self):
        return f'<Product {self.name}>'


# Nouveau modèle utilisateur
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    pin_hash = db.Column(db.String(200), nullable=False)

    def set_pin(self, pin):
        """
        Hash et enregistre le code PIN pour l'utilisateur.
        """
        self.pin_hash = generate_password_hash(pin)

    def check_pin(self, pin):
        """
        Vérifie si le code PIN entré correspond au hash enregistré.
        """
        return check_password_hash(self.pin_hash, pin)

    def __repr__(self):
        return f'<User {self.username}>'
