import React, { useState, useRef, useEffect } from 'react'
import IconButton from '../../ui/IconButton'
import ColorPicker from '../texttool/ColorPicker'
import { faQrcode, faPalette, faSync } from '@fortawesome/free-solid-svg-icons'
import { useCanvas } from '../../../context/CanvasContext'

export default function QrMenu({ onAddQrCode, onUpdateQrCode, selectedQrText }) {
  const { selectedColor, dispatch } = useCanvas()
  const [qrText, setQrText] = useState(selectedQrText || '')
  const [isModified, setIsModified] = useState(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const pickerRef = useRef(null)

  useEffect(() => {
    if (selectedQrText) {
      setQrText(selectedQrText)
      setIsModified(false)
    }
  }, [selectedQrText])

  const handleValidate = () => {
    if (qrText.trim()) {
      onAddQrCode(qrText)
      setQrText('')
      setIsModified(false)
    }
  }

  const handleUpdate = () => {
    if (isModified && qrText.trim()) {
      onUpdateQrCode(qrText, selectedColor)
      setIsModified(false)
    }
  }

  const handleTextChange = (e) => {
    setQrText(e.target.value)
    setIsModified(true)
  }

  const handleColorChangeAndUpdate = (color) => {
    dispatch({ type: 'SET_COLOR', payload: color })
    if (qrText.trim()) {
      onUpdateQrCode(qrText, color)
    }
  }

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
          <ColorPicker color={selectedColor} setSelectedColor={handleColorChangeAndUpdate} />
        </div>
      )}
    </div>
  )
}
