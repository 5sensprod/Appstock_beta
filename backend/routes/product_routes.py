from flask import jsonify, request, current_app
from .main_bp import main_bp
from db import db
from models import Product
from sockets import broadcast_message  # Importation depuis le module sockets

# Route pour ajouter un produit (CREATE)
@main_bp.route('/products', methods=['POST'])
def add_product():
    data = request.json
    if not data or not all(key in data for key in ['name', 'price', 'stock']):
        return jsonify({'error': 'Invalid input'}), 400

    new_product = Product(name=data['name'], price=data['price'], stock=data['stock'])
    db.session.add(new_product)
    db.session.commit()

    # Envoi de la notification WebSocket pour l'ajout de produit
    message = {'event': 'product_added', 'product': new_product.to_dict()}
    broadcast_message(message)  # Utilisation de la fonction centralisée pour diffuser le message

    return jsonify(new_product.to_dict()), 201

# Route pour récupérer tous les produits (READ)
@main_bp.route('/products', methods=['GET'])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products]), 200

# Route pour mettre à jour un produit (UPDATE)
@main_bp.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    product = Product.query.get_or_404(product_id)
    data = request.json
    if 'name' in data:
        product.name = data['name']
    if 'price' in data:
        product.price = data['price']
    if 'stock' in data:
        product.stock = data['stock']
    db.session.commit()

    # Envoi de la notification WebSocket pour la mise à jour du produit
    message = {'event': 'product_updated', 'product': product.to_dict()}
    broadcast_message(message)

    return jsonify(product.to_dict()), 200

# Route pour supprimer un produit (DELETE)
@main_bp.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()

    # Envoi de la notification WebSocket pour la suppression du produit
    message = {'event': 'product_deleted', 'product_id': product_id}
    broadcast_message(message)

    return jsonify({'message': 'Product deleted successfully'}), 200
