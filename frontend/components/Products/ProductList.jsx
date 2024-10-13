import React from 'react'
import { useProductContext } from '../../context/ProductContext'
import ProductForm from './ProductForm'

const ProductList = () => {
  const { products, loading, error } = useProductContext()

  if (loading) {
    return <div className="py-4 text-center">Chargement des produits...</div>
  }

  if (error) {
    return <div className="text-center font-semibold text-red-500">{error}</div>
  }

  return (
    <div className="rounded bg-white p-6 shadow-md dark:bg-gray-900">
      <h2 className="mb-6 text-center text-2xl font-bold text-black dark:text-white">
        Liste des Produits
      </h2>
      <ProductForm />
      {products.length === 0 ? (
        <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
          Aucune donnée actuellement.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex items-center justify-between rounded border border-gray-300 p-4 dark:border-gray-700"
            >
              <span className="font-semibold text-black dark:text-white">{product.name}</span>
              <span className="text-black dark:text-white">{product.price}€</span>
              <span className="text-gray-600 dark:text-gray-400">Stock: {product.stock}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default ProductList
