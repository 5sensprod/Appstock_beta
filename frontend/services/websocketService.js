// frontend/src/services/websocketService.js
import config from '../config'

let socket = null

export const connectWebSocket = (onMessageCallback) => {
  // Construire dynamiquement l'URL WebSocket
  const socketUrl = config.apiBaseUrl.replace('http', 'ws') + '/ws'

  // Créer une nouvelle connexion WebSocket
  socket = new WebSocket(socketUrl)

  // Gérer la connexion ouverte
  socket.onopen = () => {
    console.log('Connexion WebSocket ouverte.')
  }

  // Gérer les messages reçus
  socket.onmessage = (event) => {
    if (onMessageCallback) {
      const message = JSON.parse(event.data)
      onMessageCallback(message)
    }
  }

  // Gérer les erreurs WebSocket
  socket.onerror = (error) => {
    console.error('Erreur WebSocket:', error)
  }
}

export const closeWebSocket = () => {
  if (socket) {
    socket.close()
    console.log('Connexion WebSocket fermée.')
  }
}
