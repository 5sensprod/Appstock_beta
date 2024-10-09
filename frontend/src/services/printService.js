// src/services/printService.js
import axios from 'axios'

export const printMessage = async (message, serverIp) => {
  try {
    let url = '/print' // Par défaut, utiliser le chemin relatif
    if (process.env.NODE_ENV !== 'development') {
      url = `http://${serverIp}:5000/print`
    }
    const response = await axios.post(url, { message })
    return response.data.message // Retourne le message de réponse du serveur
  } catch (error) {
    throw new Error("Erreur lors de l'impression : " + error.message)
  }
}
