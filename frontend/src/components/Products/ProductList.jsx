// frontend/src/components/Products/ProductList.jsx
import React, { useEffect, useState } from 'react'
import { fetchProducts } from '../../services/productService'
import './ProductList.css' // Nous allons ajouter du style pour rendre la liste plus jolie

const ProductList = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts()
        setProducts(data)
      } catch (error) {
        setError(
          'Erreur lors de la récupération des produits. Veuillez réessayer plus tard.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  if (loading) {
    return <div>Chargement des produits...</div>
  }

  if (error) {
    return <div className="error-message">{error}</div>
  }

  return (
    <div className="product-list">
      <h2>Liste des Produits</h2>
      {products.length === 0 ? (
        <p>Aucun produit trouvé.</p>
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
