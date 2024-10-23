import React, { useState, useEffect, useRef } from 'react'
import { faTextHeight, faPalette, faTrash } from '@fortawesome/free-solid-svg-icons' // Ajoute faTrash pour le bouton de suppression
import IconButton from '../../ui/IconButton' // Importer IconButton
import ColorPicker from '../texttool/ColorPicker'
import { useInstance } from '../../../context/InstanceContext'

export default function TextMenu({ onAddText }) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const {
    selectedColor,
    handleColorChange,
    handleFontChange,
    selectedFont,
    onDeleteObject,
    isTextSelected
  } = useInstance()
  const pickerRef = useRef(null)

  const toggleColorPicker = () => {
    setIsColorPickerOpen((prev) => !prev)
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
      {/* Utilisation d'IconButton pour ajouter du texte */}
      <IconButton
        onClick={onAddText}
        icon={faTextHeight}
        title="Ajouter du texte"
        className="bg-blue-500 hover:bg-blue-600" // Personnaliser la couleur
        size="w-9 h-12" // Taille du bouton
        iconSize="text-xl" // Taille de l'icône
      />

      {/* Afficher le bouton de suppression uniquement si un texte est sélectionné */}
      {isTextSelected() && (
        <IconButton
          onClick={onDeleteObject}
          icon={faTrash}
          title="Supprimer l'élément"
          className="bg-red-500 hover:bg-red-600"
          size="w-9 h-12"
          iconSize="text-xl"
        />
      )}

      {/* Utilisation d'IconButton pour le ColorPicker */}
      <IconButton
        onClick={toggleColorPicker}
        icon={faPalette}
        title="Choisir une couleur"
        className="bg-gray-500 hover:bg-gray-600" // Personnaliser la couleur
        size="w-9 h-12" // Taille du bouton
        iconSize="text-xl" // Taille de l'icône
      />

      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2" ref={pickerRef}>
          <ColorPicker color={selectedColor} setSelectedColor={handleColorChange} />
        </div>
      )}

      {/* Sélecteur de police */}
      <select
        value={selectedFont}
        onChange={(e) => handleFontChange(e.target.value)}
        className="rounded border bg-white p-2 shadow"
      >
        <option value="Lato">Lato</option>
        <option value="Merriweather">Merriweather</option>
        <option value="Nunito">Nunito</option>
        <option value="Open Sans">Open Sans</option>
        <option value="Pacifico">Pacifico</option>
        <option value="Playfair Display">Playfair Display</option>
        <option value="Roboto">Roboto</option>
      </select>
    </div>
  )
}
