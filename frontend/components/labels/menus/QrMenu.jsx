import React, { useState, useRef, useEffect } from 'react'
import IconButton from '../../ui/IconButton'
import ColorPicker from '../texttool/ColorPicker'
import { faQrcode, faPalette, faSync } from '@fortawesome/free-solid-svg-icons' // Importer l'icône de rafraîchissement
import { useInstance } from '../../../context/InstanceContext'

export default function QrMenu({ onAddQrCode, onUpdateQrCode, selectedQrText }) {
  const { selectedColor, handleColorChange } = useInstance() // Récupérer la couleur sélectionnée et la fonction de changement de couleur
  const [qrText, setQrText] = useState(selectedQrText || '') // État pour stocker le texte à encoder dans le QR
  const [isModified, setIsModified] = useState(false) // État pour vérifier si le QR code a été modifié
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false) // État pour gérer l'ouverture du ColorPicker
  const pickerRef = useRef(null) // Référence pour le ColorPicker

  useEffect(() => {
    if (selectedQrText) {
      setQrText(selectedQrText) // Mettre à jour si un texte est sélectionné
      setIsModified(false) // Réinitialiser l'état de modification quand on sélectionne un nouveau QR code
    }
  }, [selectedQrText])

  // Gestion de la validation du texte et de la génération du QR code
  const handleValidate = () => {
    if (qrText.trim()) {
      onAddQrCode(qrText) // Ajouter le QR code avec le texte fourni dans le canevas
      setQrText('') // Réinitialiser le champ après validation
      setIsModified(false) // Réinitialiser l'état de modification
    }
  }

  // Gestion de la mise à jour du QR code
  const handleUpdate = () => {
    if (isModified && qrText.trim()) {
      onUpdateQrCode(qrText, selectedColor) // Mettre à jour avec le texte et la couleur actuelle
      setIsModified(false) // Désactiver l'icône de rafraîchissement après mise à jour
    }
  }

  // Détecter si le texte a été modifié
  const handleTextChange = (e) => {
    setQrText(e.target.value)
    setIsModified(true) // Activer l'icône de rafraîchissement
  }

  // Détecter si la couleur a été modifiée
  const handleColorChangeAndUpdate = (color) => {
    handleColorChange(color) // Mettre à jour la couleur dans le contexte
    if (qrText.trim()) {
      onUpdateQrCode(qrText, color) // Mettre à jour immédiatement le QR code avec la nouvelle couleur
    }
  }
  // Fermer le ColorPicker lorsqu'on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsColorPickerOpen(false) // Fermer le ColorPicker si on clique en dehors
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside) // Nettoyer l'écouteur d'événements
    }
  }, [])

  return (
    <div className="relative flex w-auto space-x-2 rounded bg-white p-2 shadow-lg">
      {/* Input pour entrer le texte à encoder */}
      <input
        type="text"
        placeholder="Entrez votre texte ou URL"
        value={qrText}
        onChange={handleTextChange} // Appeler la fonction lors de la modification du texte
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

      {/* Icône de rafraîchissement activée seulement si le texte ou la couleur a changé */}
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
      {/* Bouton pour ouvrir le ColorPicker */}
      <IconButton
        onClick={() => setIsColorPickerOpen((prev) => !prev)}
        icon={faPalette}
        title="Choisir une couleur"
        className="bg-gray-500 hover:bg-gray-600"
        size="w-9 h-12"
        iconSize="text-xl"
      />

      {/* Afficher le ColorPicker quand il est ouvert */}
      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2" ref={pickerRef}>
          <ColorPicker color={selectedColor} setSelectedColor={handleColorChangeAndUpdate} />
        </div>
      )}
    </div>
  )
}
