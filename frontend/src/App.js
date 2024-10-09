import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [message, setMessage] = useState('') // État pour stocker le message
  const [serverIp, setServerIp] = useState('') // État pour stocker l'IP du serveur

  // Fonction pour récupérer l'IP dynamique si disponible
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // En développement, pas besoin de serverIp
      console.log(
        'Mode développement : utilisation du proxy pour les appels API.',
      )
    } else {
      // En production ou en mode Electron, on utilise la logique existante
      if (window.api && typeof window.api.getServerIp === 'function') {
        // Récupérer l'IP dynamique via le module preload d'Electron
        window.api
          .getServerIp()
          .then((ip) => {
            setServerIp(ip) // Mettre à jour l'IP si récupérée
            console.log(`IP du serveur Flask récupérée : ${ip}`)
          })
          .catch((error) => {
            console.error(
              "Erreur lors de la récupération de l'IP via Electron :",
              error,
            )
          })
      } else {
        // Si on est dans un navigateur classique, utiliser window.location.hostname
        const ip = window.location.hostname
        setServerIp(ip)
        console.log(
          `Utilisation de l'IP du serveur Flask depuis window.location.hostname : ${ip}`,
        )
      }
    }
  }, [])

  // Fonction pour gérer l'impression
  const handlePrint = async () => {
    try {
      let url = '/print' // Par défaut, utiliser le chemin relatif
      if (process.env.NODE_ENV !== 'development') {
        // En production ou en mode Electron, utiliser serverIp
        url = `http://${serverIp}:5000/print`
      }
      const response = await axios.post(url, {
        message,
      })
      alert(response.data.message) // Affiche une alerte en fonction de la réponse du serveur
    } catch (error) {
      alert("Erreur lors de l'impression : " + error.message) // Affiche une alerte en cas d'erreur
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>POSES Printer App</h1>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Entrez le message à imprimer"
        />
        <button onClick={handlePrint}>Imprimer</button>
      </header>
    </div>
  )
}

export default App
