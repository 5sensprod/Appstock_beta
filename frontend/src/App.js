import React, { useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [message, setMessage] = useState('') // État pour stocker le message

  // Fonction pour gérer l'impression
  const handlePrint = async () => {
    try {
      // Envoie une requête POST au serveur Flask pour imprimer et afficher le message sur l'écran LCD
      const response = await axios.post('http://localhost:5000/print', {
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
