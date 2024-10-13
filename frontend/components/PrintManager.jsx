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
    <div className="mx-auto w-full max-w-md rounded-md p-6 shadow-md">
      <h2 className="mb-4 text-center text-2xl font-semibold">Gérer l'impression</h2>
      <TextInput value={message} onChange={setMessage} />
      <div className="mt-4 text-center">
        <PrintButton onClick={handlePrint} />
      </div>
    </div>
  )
}

export default PrintManager
