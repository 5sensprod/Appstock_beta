import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle, faSquare, faPalette } from '@fortawesome/free-solid-svg-icons'
import ColorPicker from '../texttool/ColorPicker'
import { useInstance } from '../../../context/InstanceContext'

export default function ShapeMenu({ onAddCircle, onAddRectangle }) {
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
    <div className="relative flex w-auto space-x-2 rounded bg-white pl-2 shadow-lg">
      <button
        onClick={onAddCircle}
        className="flex items-center justify-center rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
        title="Ajouter un cercle"
      >
        <FontAwesomeIcon icon={faCircle} className="text-xl" />
      </button>
      <button
        onClick={onAddRectangle}
        className="flex items-center justify-center rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
        title="Ajouter un rectangle"
      >
        <FontAwesomeIcon icon={faSquare} className="text-xl" />
      </button>
      <button
        onClick={toggleColorPicker}
        className="flex items-center justify-center rounded bg-gray-500 p-2 text-white hover:bg-gray-600"
        title="Choisir une couleur"
      >
        <FontAwesomeIcon icon={faPalette} className="text-xl" />
      </button>
      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2" ref={pickerRef}>
          <ColorPicker color={selectedColor} setSelectedColor={handleColorChange} />
        </div>
      )}
    </div>
  )
}
