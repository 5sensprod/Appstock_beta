import axios from 'axios'
import config from '../config'

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  withCredentials: true // Pour envoyer et recevoir les cookies de session
})

// Fonction pour la connexion
export const login = async (username, pin) => {
  try {
    const response = await apiClient.post(
      '/api/login',
      {
        username,
        pin
      }
    )
    return response.data
  } catch (error) {
    console.error(
      'Erreur lors de la connexion:',
      error
    )
    throw error
  }
}

// Fonction pour vérifier si l'utilisateur est authentifié
export const checkSession = async () => {
  try {
    const response = await apiClient.get(
      '/api/check-session'
    )
    return response.data
  } catch (error) {
    console.error(
      'Erreur lors de la vérification de la session:',
      error
    )
    throw error
  }
}

// Fonction pour la déconnexion
export const logout = async () => {
  try {
    const response = await apiClient.post(
      '/api/logout'
    )
    return response.data
  } catch (error) {
    console.error(
      'Erreur lors de la déconnexion:',
      error
    )
    throw error
  }
}
