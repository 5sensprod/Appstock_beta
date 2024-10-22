import React, { useState, useEffect, useRef } from 'react'
import { faTextHeight, faPalette } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'
import ColorPicker from '../texttool/ColorPicker'
import { useInstance } from '../../../context/InstanceContext' // Importer le contexte

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
    <div className="relative flex w-48 space-x-2 rounded bg-white p-2 shadow-lg">
      {' '}
      {/* Largeur fixée à 48 unités */}
      <IconButton
        onClick={onAddText}
        icon={faTextHeight}
        title="Ajouter du texte"
        className="flex size-12 items-center justify-center rounded bg-blue-500 text-white hover:bg-blue-600"
      />
      <IconButton
        onClick={toggleColorPicker}
        icon={faPalette}
        title="Choisir une couleur"
        className="flex size-12 items-center justify-center rounded bg-gray-500 text-white hover:bg-gray-600"
      />
      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2" ref={pickerRef}>
          <ColorPicker color={selectedColor} setSelectedColor={handleColorChange} />
        </div>
      )}
    </div>
  )
}
