// frontend/src/services/productService.js
import axios from 'axios'
import config from '../config'

const apiClient = axios.create({
  baseURL: config.apiBaseUrl
})

export const fetchProducts = async () => {
  try {
    const response =
      await apiClient.get('/products')
    return response.data
  } catch (error) {
    console.error(
      'Erreur lors de la récupération des produits:',
      error
    )
    throw error
  }
}

export const addProduct = async (product) => {
  try {
    const response = await apiClient.post(
      '/products',
      product
    )
    return response.data
  } catch (error) {
    console.error(
      "Erreur lors de l'ajout du produit:",
      error
    )
    throw error
  }
}
