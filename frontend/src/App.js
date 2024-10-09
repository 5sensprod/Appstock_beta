import React, { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [message, setMessage] = useState('') // État pour stocker le message
  const [serverIp, setServerIp] = useState('localhost') // Par défaut, utiliser localhost

  // Fonction pour récupérer l'IP dynamique si disponible
  useEffect(() => {
    // Vérifiez si l'application s'exécute dans Electron
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
  }, [])

  // Fonction pour gérer l'impression
  const handlePrint = async () => {
    try {
      // Utiliser l'IP dynamique ou par défaut pour faire la requête au serveur Flask
      const response = await axios.post(`http://${serverIp}:5000/print`, {
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
        <h1>POS Printer App</h1>
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
