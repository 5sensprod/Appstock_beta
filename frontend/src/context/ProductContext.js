// frontend/src/context/ProductContext.js
import React, { createContext, useState, useEffect, useContext } from 'react'
import { fetchProducts, addProduct } from '../services/productService'
import { connectWebSocket, closeWebSocket } from '../services/websocketService' // Import du service WebSocket

// Création du contexte pour les produits
const ProductContext = createContext()

// Hook personnalisé pour accéder au contexte des produits
export const useProductContext = () => {
  const context = useContext(ProductContext)
  if (!context) {
    throw new Error('useProductContext must be used within a ProductProvider')
  }
  return context
}

// Composant fournisseur qui gère l'état et les interactions des produits
export const ProductProvider = ({ children }) => {
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

    // Connexion au WebSocket via le service
    connectWebSocket((message) => {
      console.log('Message WebSocket reçu :', message)

      // Mettre à jour l'état des produits en fonction du message reçu
      if (message.event === 'product_added') {
        setProducts((prevProducts) => [...prevProducts, message.product])
      } else if (message.event === 'product_updated') {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === message.product.id ? message.product : product,
          ),
        )
      } else if (message.event === 'product_deleted') {
        setProducts((prevProducts) =>
          prevProducts.filter((product) => product.id !== message.product_id),
        )
      }
    })

    // Fermer la connexion WebSocket proprement lors du démontage du composant
    return () => {
      closeWebSocket()
    }
  }, [])

  // Fonction pour ajouter un produit et mettre à jour la liste des produits
  const handleAddProduct = async (newProduct) => {
    try {
      const addedProduct = await addProduct(newProduct)
      setProducts((prevProducts) => [...prevProducts, addedProduct])
    } catch (error) {
      setError("Erreur lors de l'ajout du produit. Veuillez réessayer.")
    }
  }

  return (
    <ProductContext.Provider
      value={{ products, loading, error, handleAddProduct }}
    >
      {children}
    </ProductContext.Provider>
  )
}
