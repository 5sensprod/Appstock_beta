import React, { useState, useRef, useEffect } from 'react'
import IconButton from '../../ui/IconButton'
import ColorPicker from '../texttool/ColorPicker' // Importer le ColorPicker
import { faQrcode, faPalette } from '@fortawesome/free-solid-svg-icons' // Importer l'icône QR code et palette
import { useInstance } from '../../../context/InstanceContext' // Utiliser InstanceContext pour gérer les couleurs

export default function QrMenu({ onAddQrCode }) {
  const { selectedColor, handleColorChange } = useInstance() // Récupérer la couleur sélectionnée et la fonction de changement de couleur
  const [qrText, setQrText] = useState('') // État pour stocker le texte à encoder dans le QR
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false) // État pour gérer l'ouverture du ColorPicker
  const pickerRef = useRef(null) // Référence pour le ColorPicker

  // Gestion de la validation du texte et de la génération du QR code
  const handleValidate = () => {
    if (qrText.trim()) {
      onAddQrCode(qrText) // Ajouter le QR code avec le texte fourni dans le canevas
      setQrText('') // Réinitialiser le champ après validation
    }
  }

  // Gestion de l'ouverture/fermeture du ColorPicker
  const toggleColorPicker = () => {
    setIsColorPickerOpen((prev) => !prev)
  }

  // Fermer le ColorPicker lorsqu'on clique en dehors
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
    <div className="relative flex items-center space-x-2">
      {/* Input pour entrer le texte à encoder */}
      <input
        type="text"
        placeholder="Entrez votre texte ou URL"
        value={qrText}
        onChange={(e) => setQrText(e.target.value)}
        className="w-64 rounded border p-2"
      />

      {/* Bouton pour valider et ajouter le QR code */}
      <IconButton
        onClick={handleValidate}
        icon={faQrcode}
        title="Ajouter QR Code"
        className="bg-blue-500 text-white hover:bg-blue-600"
        size="w-9 h-12"
        iconSize="text-xl"
      />

      {/* Bouton pour ouvrir le ColorPicker */}
      <IconButton
        onClick={toggleColorPicker}
        icon={faPalette}
        title="Choisir une couleur"
        className="bg-gray-500 hover:bg-gray-600"
        size="w-9 h-12"
        iconSize="text-xl"
      />

      {/* Afficher le ColorPicker quand il est ouvert */}
      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2" ref={pickerRef}>
          <ColorPicker color={selectedColor} setSelectedColor={handleColorChange} />
        </div>
      )}
    </div>
  )
}
