import React, { useState, useRef, useEffect } from 'react'
import IconButton from '../../ui/IconButton'
import ColorPicker from '../texttool/ColorPicker'
import { faQrcode, faPalette, faSync } from '@fortawesome/free-solid-svg-icons'
import { useCanvas } from '../../../context/CanvasContext'
import useCanvasSerialization from '../../../hooks/useCanvasSerialization'

export default function QrMenu({ onAddQrCode, onUpdateQrCode, selectedQrText }) {
  const { canvas, selectedColor, selectedObject, dispatchCanvasAction } = useCanvas()
  const { updateObjectProperties } = useCanvasSerialization(canvas, dispatchCanvasAction)
  const [qrText, setQrText] = useState(selectedQrText || '')
  const [isModified, setIsModified] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const pickerRef = useRef(null)

  // Synchronise le texte du QR Code sélectionné
  useEffect(() => {
    if (selectedQrText) {
      setQrText(selectedQrText)
      setIsModified(false)
    }
  }, [selectedQrText])

  // Ajoute un nouveau QR Code
  const handleValidate = () => {
    if (qrText.trim()) {
      onAddQrCode(qrText)
      setQrText('')
      setIsModified(false)
    }
  }

  // Met à jour un QR Code existant
  const handleUpdate = () => {
    if (isModified && qrText.trim()) {
      onUpdateQrCode(qrText, selectedColor)
      setIsModified(false)
    }
  }

  // Met à jour le texte du QR Code
  const handleTextChange = (e) => {
    setQrText(e.target.value)
    setIsModified(true)
  }

  // Change la couleur et met à jour le QR Code sélectionné si applicable
  const handleColorChangeAndUpdate = (color) => {
    dispatchCanvasAction({ type: 'SET_COLOR', payload: color })

    // Vérifie si un objet QR Code est sélectionné
    if (selectedObject && selectedObject.type === 'image') {
      // Utilise `updateObjectProperties` pour centraliser la mise à jour
      updateObjectProperties(selectedObject, { color })

      // Mise à jour via onUpdateQrCode
      if (qrText.trim()) {
        onUpdateQrCode(qrText, color)
      }
    } else if (qrText.trim()) {
      // Applique la couleur via onUpdateQrCode si aucun QR Code n'est sélectionné
      onUpdateQrCode(qrText, color)
    }
  }

  // Ferme le `ColorPicker` si l'utilisateur clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsColorPickerOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative flex w-auto space-x-2 rounded bg-white p-2 shadow-lg">
      <input
        type="text"
        placeholder="Entrez votre texte ou URL"
        value={qrText}
        onChange={handleTextChange}
        className="w-64 rounded border p-2"
      />

      <IconButton
        onClick={handleValidate}
        icon={faQrcode}
        title="Ajouter QR Code"
        className="bg-blue-500 text-white hover:bg-blue-600"
        size="w-9 h-12"
        iconSize="text-xl"
      />

      {selectedQrText && isModified && (
        <IconButton
          onClick={handleUpdate}
          icon={faSync}
          title="Mettre à jour le QR Code"
          className="bg-green-500 text-white hover:bg-green-600"
          size="w-9 h-12"
          iconSize="text-xl"
        />
      )}

      <IconButton
        onClick={() => setIsColorPickerOpen((prev) => !prev)}
        icon={faPalette}
        title="Choisir une couleur"
        className="bg-gray-500 hover:bg-gray-600"
        size="w-9 h-12"
        iconSize="text-xl"
      />

      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2" ref={pickerRef}>
          <ColorPicker
            color={selectedObject?.fill || selectedColor} // Affiche la couleur actuelle
            setSelectedColor={handleColorChangeAndUpdate}
          />
        </div>
      )}
    </div>
  )
}
