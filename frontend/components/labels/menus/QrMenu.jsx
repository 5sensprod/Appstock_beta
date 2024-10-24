import React, { useState, useRef, useEffect } from 'react'
import IconButton from '../../ui/IconButton'
import ColorPicker from '../texttool/ColorPicker'
import { faQrcode, faPalette, faSyncAlt } from '@fortawesome/free-solid-svg-icons' // Ajouter l'icône de rafraîchissement
import { useInstance } from '../../../context/InstanceContext'

export default function QrMenu({ onAddQrCode, selectedQrText, onUpdateQrCode }) {
  const { selectedColor, handleColorChange } = useInstance()
  const [qrText, setQrText] = useState(selectedQrText || '') // État pour stocker le texte QR
  const [isModified, setIsModified] = useState(false) // Nouvel état pour suivre les modifications du texte
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false) // État pour gérer l'ouverture du ColorPicker
  const pickerRef = useRef(null)

  useEffect(() => {
    if (selectedQrText) {
      setQrText(selectedQrText)
      setIsModified(false) // Réinitialiser l'état de modification quand on sélectionne un nouveau QR code
    }
  }, [selectedQrText])

  // Gestion de la validation du texte et de la génération du QR code
  const handleValidate = () => {
    if (qrText.trim()) {
      onAddQrCode(qrText)
      setQrText('')
    }
  }

  // Détecter les changements de texte pour activer l'icône de rafraîchissement
  const handleInputChange = (e) => {
    const newText = e.target.value
    setQrText(newText)
    setIsModified(newText !== selectedQrText) // Activer/désactiver l'icône selon si le texte est modifié
  }

  // Gestion de la mise à jour du QR code
  const handleUpdate = () => {
    if (isModified && qrText.trim()) {
      onUpdateQrCode(qrText) // Appeler la fonction de mise à jour avec le nouveau texte
      setIsModified(false) // Désactiver l'icône de rafraîchissement après mise à jour
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
        onChange={handleInputChange} // Détecter les changements
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

      {/* Bouton pour mettre à jour le QR code */}
      <IconButton
        onClick={handleUpdate}
        icon={faSyncAlt}
        title="Mettre à jour QR Code"
        className={`bg-gray-500 text-white hover:bg-gray-600 ${isModified ? 'opacity-100' : 'cursor-not-allowed opacity-50'}`}
        size="w-9 h-12"
        iconSize="text-xl"
        disabled={!isModified} // Désactiver le bouton si rien n'est modifié
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
