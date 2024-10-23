import React, { useState, useEffect, useRef } from 'react'
import { faTextHeight, faPalette } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton' // Importer IconButton
import ColorPicker from '../texttool/ColorPicker'
import { useInstance } from '../../../context/InstanceContext'

export default function TextMenu({ onAddText }) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false) // Gérer l'ouverture du ColorPicker
  const { selectedColor, handleColorChange } = useInstance() // Obtenir la couleur et la fonction de mise à jour du contexte
  const pickerRef = useRef(null) // Référence pour le ColorPicker

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
    <div className="relative flex w-auto space-x-2 rounded bg-white p-2 shadow-lg">
      {/* Utilisation d'IconButton pour le bouton "Ajouter du texte" */}
      <IconButton
        onClick={onAddText}
        icon={faTextHeight}
        title="Ajouter du texte"
        className="bg-blue-500 hover:bg-blue-600" // Personnaliser la couleur
        size="w-12 h-12" // Taille du bouton
        iconSize="text-xl" // Taille de l'icône
      />

      {/* Utilisation d'IconButton pour le ColorPicker */}
      <IconButton
        onClick={toggleColorPicker}
        icon={faPalette}
        title="Choisir une couleur"
        className="bg-gray-500 hover:bg-gray-600" // Personnaliser la couleur
        size="w-12 h-12" // Taille du bouton
        iconSize="text-xl" // Taille de l'icône
      />

      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2" ref={pickerRef}>
          <ColorPicker color={selectedColor} setSelectedColor={handleColorChange} />
        </div>
      )}
    </div>
  )
}
