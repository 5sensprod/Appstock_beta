import React, { useState } from 'react'
import { useProductContext } from '../../context/ProductContext'

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
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-md rounded bg-white p-6 shadow-md dark:bg-gray-900"
    >
      <h3 className="mb-4 text-center text-2xl font-semibold text-black dark:text-white">
        Ajouter un nouveau produit
      </h3>
      {error && <p className="mb-4 text-center text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Nom du produit"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="mb-4 w-full rounded border border-gray-300 p-3 dark:bg-gray-800 dark:text-white"
      />
      <input
        type="number"
        placeholder="Prix du produit"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="mb-4 w-full rounded border border-gray-300 p-3 dark:bg-gray-800 dark:text-white"
      />
      <input
        type="number"
        placeholder="Stock"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="mb-4 w-full rounded border border-gray-300 p-3 dark:bg-gray-800 dark:text-white"
      />
      <button
        type="submit"
        className="mt-4 w-full rounded bg-blue-500 p-3 text-white transition-colors duration-300 hover:bg-blue-700"
      >
        Ajouter
      </button>
    </form>
  )
}

export default ProductForm
