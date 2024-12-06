import React, { useState, useEffect, useRef } from 'react'
import { faCircle, faSquare, faPalette } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'
import ColorPicker from '../texttool/ColorPicker'
import { useShapeManager } from '../../../hooks/useShapeManager'
import { useStrokeManager } from '../../../hooks/useStrokeManager'
import { useCanvas } from '../../../context/CanvasContext'
import { StrokeControls } from '../StrokeControls'
import { AppearanceControls } from '../AppearanceControls'

export default function ShapeMenu({ onAddCircle, onAddRectangle }) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [isStrokeControlOpen, setIsStrokeControlOpen] = useState(false)
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false)

  const pickerRef = useRef(null)
  const strokePickerRef = useRef(null)
  const appearancePickerRef = useRef(null)

  const { currentColor, handleColorChange } = useShapeManager()
  const { currentStroke, currentStrokeWidth, currentStrokeDashArray, handleStrokeChange } =
    useStrokeManager()
  const { canvas } = useCanvas()

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Gestion du clic en dehors du color picker
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsColorPickerOpen(false)
        setTimeout(() => {
          handleColorChange(currentColor, true)
          canvas?.fire('object:modified')
          canvas?.renderAll()
        }, 0)
      }

      // Gestion du clic en dehors des contrôles de bordure
      if (strokePickerRef.current && !strokePickerRef.current.contains(event.target)) {
        setIsStrokeControlOpen(false)
        setTimeout(() => {
          handleStrokeChange(
            {
              stroke: currentStroke,
              strokeWidth: currentStrokeWidth,
              strokeDashArray: currentStrokeDashArray
            },
            true
          )
          canvas?.fire('object:modified')
          canvas?.renderAll()
        }, 0)
      }
      if (appearancePickerRef.current && !appearancePickerRef.current.contains(event.target)) {
        setIsAppearanceOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [
    handleColorChange,
    handleStrokeChange,
    currentColor,
    currentStroke,
    currentStrokeWidth,
    currentStrokeDashArray,
    canvas
  ])

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

      <StrokeControls
        isOpen={isStrokeControlOpen}
        onToggle={() => setIsStrokeControlOpen((prev) => !prev)}
        strokeWidth={currentStrokeWidth}
        strokeColor={currentStroke}
        strokePattern={currentStrokeDashArray}
        onStrokeChange={handleStrokeChange}
        pickerRef={strokePickerRef}
      />

      <AppearanceControls
        isOpen={isAppearanceOpen}
        onToggle={() => setIsAppearanceOpen((prev) => !prev)}
        pickerRef={appearancePickerRef}
      />

      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2" ref={pickerRef}>
          <ColorPicker color={currentColor} setSelectedColor={handleColorChange} />
        </div>
      )}
    </div>
  )
}
