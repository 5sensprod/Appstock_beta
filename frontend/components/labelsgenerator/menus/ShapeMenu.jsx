import React, { useState, useEffect, useRef } from 'react'
import { faCircle, faSquare, faPalette } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'
import ColorPicker from '../texttool/ColorPicker'
import { useShapeManager } from '../../../hooks/useShapeManager'
import { useCanvas } from '../../../context/CanvasContext'

export default function ShapeMenu({ onAddCircle, onAddRectangle }) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const pickerRef = useRef(null)
  const { currentColor, handleColorChange } = useShapeManager()
  const { canvas } = useCanvas()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsColorPickerOpen(false)
        setTimeout(() => {
          handleColorChange(currentColor, true)
          canvas?.fire('object:modified')
          canvas?.renderAll()
        }, 0)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleColorChange, currentColor, canvas])

  return (
    <div className="relative flex w-auto space-x-2 rounded bg-white p-2 shadow-lg">
      <IconButton
        onClick={onAddCircle}
        icon={faCircle}
        title="Ajouter un cercle"
        className="bg-blue-500 hover:bg-blue-600"
        size="w-12 h-12"
        iconSize="text-xl"
      />
      <IconButton
        onClick={onAddRectangle}
        icon={faSquare}
        title="Ajouter un rectangle"
        className="bg-blue-500 hover:bg-blue-600"
        size="w-12 h-12"
        iconSize="text-xl"
      />
      <IconButton
        onClick={() => setIsColorPickerOpen((prev) => !prev)}
        icon={faPalette}
        title="Choisir une couleur"
        className="bg-gray-500 hover:bg-gray-600"
        size="w-12 h-12"
        iconSize="text-xl"
      />
      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2" ref={pickerRef}>
          <ColorPicker color={currentColor} setSelectedColor={handleColorChange} />
        </div>
      )}
    </div>
  )
}
