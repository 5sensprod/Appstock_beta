// src/components/PrintManager.js
import React, { useState } from 'react'
import TextInput from './TextInput'
import PrintButton from './PrintButton'
import { printMessage } from '../services/printService'
import useServerIp from '../hooks/useServerIp'

const PrintManager = () => {
  const [message, setMessage] = useState('')
  const serverIp = useServerIp() // Utilisation du hook pour obtenir l'IP du serveur

  const handlePrint = async () => {
    try {
      const responseMessage = await printMessage(message, serverIp)
      alert(responseMessage) // Affiche une alerte avec le message de réponse du serveur
    } catch (error) {
      alert(error.message) // Affiche une alerte en cas d'erreur
    }
  }

  return (
    <div>
      <TextInput value={message} onChange={setMessage} />
      <PrintButton onClick={handlePrint} />
    </div>
  )
}

export default PrintManager
