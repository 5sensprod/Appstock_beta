import React, { useState } from 'react'
import TextInput from './TextInput'
import PrintButton from './PrintButton'
import { printMessage } from '../services/printService'

const PrintManager = () => {
  const [message, setMessage] = useState('')

  const handlePrint = async () => {
    try {
      const responseMessage = await printMessage(message)
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
