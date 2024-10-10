// frontend/src/services/printService.js
import axios from 'axios'
import config from '../config'

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
})

export const printMessage = async (message) => {
  try {
    const response = await apiClient.post('/print', { message })
    return response.data.message
  } catch (error) {
    throw new Error("Erreur lors de l'impression : " + error.message)
  }
}
