import React, { useState } from 'react'
import { useProductContext } from '../../context/ProductContext'
import styles from './ProductForm.module.css'

const ProductForm = () => {
  const { handleAddProduct } = useProductContext()
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!name || !price || !stock) {
      setError('Tous les champs sont obligatoires.')
      return
    }

    const newProduct = {
      name,
      price: parseFloat(price),
      stock: parseInt(stock)
    }

    try {
      await handleAddProduct(newProduct)
      setName('')
      setPrice('')
      setStock('')
      setError(null)
    } catch {
      setError("Erreur lors de l'ajout du produit. Veuillez réessayer.")
    }
  }

  return (
    <form className={styles.productForm} onSubmit={handleSubmit}>
      <h3 className={styles.heading}>Ajouter un nouveau produit</h3>
      {error && <p className={styles.errorMessage}>{error}</p>}
      <input
        type="text"
        placeholder="Nom du produit"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
      />
      <input
        type="number"
        placeholder="Prix du produit"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className={styles.input}
      />
      <input
        type="number"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className={styles.input}
      />
      <button type="submit" className={styles.button}>
        Ajouter
      </button>
    </form>
  )
}

export default ProductForm
