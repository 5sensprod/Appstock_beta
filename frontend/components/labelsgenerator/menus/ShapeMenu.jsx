import React, { useState, useEffect, useRef } from 'react'
import { faCircle, faSquare, faPalette } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'
import ColorPicker from '../texttool/ColorPicker'
import { useCanvas } from '../../../context/CanvasContext'
import useCanvasSerialization from '../../../hooks/useCanvasSerialization'

export default function ShapeMenu({ onAddCircle, onAddRectangle }) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const { canvas, selectedColor, selectedObject, setSelectedColor, dispatchCanvasAction } =
    useCanvas()
  const { updateObjectProperties } = useCanvasSerialization(canvas, dispatchCanvasAction)
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

  // Met à jour la couleur en fonction de l'objet sélectionné ou de la couleur globale
  const handleColorChange = (color) => {
    if (selectedObject && (selectedObject.type === 'circle' || selectedObject.type === 'rect')) {
      // Met à jour la couleur de l'objet sélectionné
      updateObjectProperties(selectedObject, { color })
    } else {
      // Sinon, met à jour la couleur globale
      setSelectedColor(color)
    }
  }

  return (
    <div className="relative flex w-auto space-x-2 rounded bg-white p-2 shadow-lg">
      {/* Ajouter un cercle */}
      <IconButton
        onClick={onAddCircle}
        icon={faCircle}
        title="Ajouter un cercle"
        className="bg-blue-500 hover:bg-blue-600"
        size="w-12 h-12"
        iconSize="text-xl"
      />

      {/* Ajouter un rectangle */}
      <IconButton
        onClick={onAddRectangle}
        icon={faSquare}
        title="Ajouter un rectangle"
        className="bg-blue-500 hover:bg-blue-600"
        size="w-12 h-12"
        iconSize="text-xl"
      />

      {/* Choisir une couleur */}
      <IconButton
        onClick={toggleColorPicker}
        icon={faPalette}
        title="Choisir une couleur"
        className="bg-gray-500 hover:bg-gray-600"
        size="w-12 h-12"
        iconSize="text-xl"
      />

      {/* Color Picker */}
      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2" ref={pickerRef}>
          <ColorPicker
            // La couleur affichée dans le ColorPicker dépend de l'objet sélectionné
            color={selectedObject?.fill || selectedColor}
            setSelectedColor={handleColorChange}
          />
        </div>
      )}
    </div>
  )
}
