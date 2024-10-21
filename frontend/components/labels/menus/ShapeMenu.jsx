import React, { useState } from 'react'
import { faCircle, faSquare, faPalette } from '@fortawesome/free-solid-svg-icons' // Icône palette
import IconButton from '../../ui/IconButton'
import ColorPicker from '../texttool/ColorPicker'
import { useInstance } from '../../../context/InstanceContext' // Importer le contexte

export default function ShapeMenu({ onAddCircle, onAddRectangle }) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false) // Gérer l'ouverture du ColorPicker
  const { selectedColor, handleColorChange } = useInstance() // Obtenir la couleur et la fonction de mise à jour du contexte

  const toggleColorPicker = () => {
    setIsColorPickerOpen((prev) => !prev)
  }

  return (
    <div className="relative flex space-x-2 rounded bg-white shadow-lg">
      <IconButton
        onClick={onAddCircle}
        icon={faCircle}
        title="Ajouter un cercle"
        className="flex size-12 items-center justify-center rounded bg-blue-500 text-white hover:bg-blue-600"
      />
      <IconButton
        onClick={onAddRectangle}
        icon={faSquare}
        title="Ajouter un rectangle"
        className="flex size-12 items-center justify-center rounded bg-blue-500 text-white hover:bg-blue-600"
      />

      {/* Bouton pour ouvrir le sélecteur de couleurs */}
      <IconButton
        onClick={toggleColorPicker}
        icon={faPalette} // Icône de palette
        title="Choisir une couleur"
        className="flex size-12 items-center justify-center rounded bg-gray-500 text-white hover:bg-gray-600"
      />

      {/* Afficher le ColorPicker si l'état isColorPickerOpen est vrai */}
      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2">
          <ColorPicker
            color={selectedColor} // Utiliser la couleur actuelle du contexte
            setSelectedColor={handleColorChange} // Utiliser handleColorChange pour mettre à jour la couleur
          />
        </div>
      )}
    </div>
  )
}
