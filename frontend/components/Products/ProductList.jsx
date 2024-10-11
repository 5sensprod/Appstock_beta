import React from 'react'
import { useProductContext } from '../../context/ProductContext'
import ProductForm from './ProductForm'
import styles from './ProductList.module.css'

const ProductList = () => {
  const { products, loading, error } = useProductContext()

  if (loading) {
    return <div>Chargement des produits...</div>
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>
  }

  return (
    <div className={styles.productList}>
      <h2 className={styles.heading}>Liste des Produits</h2>
      <ProductForm />
      {products.length === 0 ? (
        <p className={styles.noDataMessage}>Aucune donnée actuellement.</p>
      ) : (
        <ul>
          {products.map((product) => (
            <li key={product.id} className={styles.productItem}>
              <span className={styles.productName}>{product.name}</span>
              <span className={styles.productPrice}>{product.price}€</span>
              <span className={styles.productStock}>
                Stock: {product.stock}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProductList
