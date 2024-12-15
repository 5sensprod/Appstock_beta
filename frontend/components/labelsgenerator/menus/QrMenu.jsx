import React from 'react'
import IconButton from '../../ui/IconButton'
import { faQrcode, faSync } from '@fortawesome/free-solid-svg-icons'
import { useQrCodeManager } from '../../../hooks/useQrCodeManager'
import { useCanvas } from '../../../context/CanvasContext'

export default function QrMenu({ onAddQrCode, onUpdateQrCode }) {
  const { selectedObject } = useCanvas()
  const { qrText, isModified, setQrText, setIsModified } = useQrCodeManager(
    onAddQrCode,
    onUpdateQrCode
  )

  const handleValidate = () => {
    if (qrText.trim()) {
      onAddQrCode(qrText)
      setQrText('')
      setIsModified(false)
    }
  }

  const handleUpdate = () => {
    if (isModified && qrText.trim()) {
      onUpdateQrCode(qrText)
      setIsModified(false)
    }
  }

  const handleTextChange = (e) => {
    setQrText(e.target.value)
    setIsModified(true)
  }

  return (
    <div className="p-.5 relative flex w-auto space-x-2 rounded bg-white shadow-lg">
      <input
        type="text"
        placeholder="Entrez votre texte ou URL"
        value={qrText}
        onChange={handleTextChange}
        className="w-40 rounded border p-2"
      />
      <IconButton
        onClick={handleValidate}
        icon={faQrcode}
        title="Ajouter QR Code"
        className="bg-blue-500 text-white hover:bg-blue-600"
        size="w-9 h-9"
        iconSize="text-xl"
      />
      {selectedObject?.qrText && isModified && (
        <IconButton
          onClick={handleUpdate}
          icon={faSync}
          title="Mettre à jour le QR Code"
          className="bg-green-500 text-white hover:bg-green-600"
          size="w-9 h-9"
          iconSize="text-xl"
        />
      )}
    </div>
  )
}
