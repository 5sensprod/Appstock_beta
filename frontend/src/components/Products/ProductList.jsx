import React from 'react'
import { useProductContext } from '../../context/ProductContext'
import ProductForm from './ProductForm'
import './ProductList.css'

const ProductList = () => {
  const { products, loading, error } = useProductContext()

  if (loading) {
    return <div>Chargement des produits...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="product-list">
      <h2>Liste des Produits</h2>
      <ProductForm />
      {products.length === 0 ? (
        <p className="no-data-message">Aucune donnée actuellement.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id} className="product-item">
              <span className="product-name">{product.name}</span>
              <span className="product-price">{product.price}€</span>
              <span className="product-stock">Stock: {product.stock}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProductList
