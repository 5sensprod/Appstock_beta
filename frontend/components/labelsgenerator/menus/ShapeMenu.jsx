import React, { useState, useEffect, useRef } from 'react'
import { faCircle, faSquare, faPalette } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'
import ColorPicker from '../texttool/ColorPicker'
import { useShapeManager } from '../../../hooks/useShapeManager'
import { useStrokeManager } from '../../../hooks/useStrokeManager'
import { useCanvas } from '../../../context/CanvasContext'
import { StrokeControls } from '../StrokeControls'
import { AppearanceControls } from '../AppearanceControls'
import { useStyle } from '../../../context/StyleContext'

export default function ShapeMenu({ onAddCircle, onAddRectangle }) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const [isStrokeControlOpen, setIsStrokeControlOpen] = useState(false)
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false)

  const pickerRef = useRef(null)
  const strokePickerRef = useRef(null)
  const appearancePickerRef = useRef(null)
  const hasModifications = useRef(false)
  const { handleStrokeChange, currentStroke, currentStrokeWidth, currentPatternType } = useStyle()

  const { currentColor, handleColorChange } = useShapeManager()

  const { canvas } = useCanvas()

  // Reset du flag quand on ouvre un contrôle
  const resetModificationFlag = () => {
    hasModifications.current = false
  }

  // Handler pour marquer qu'il y a eu une modification
  const handleModification = () => {
    hasModifications.current = true
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log('Click outside detected') // Debug
      if (strokePickerRef.current && !strokePickerRef.current.contains(event.target)) {
        console.log('Click outside stroke picker') // Debug
        setIsStrokeControlOpen(false)
        if (hasModifications.current) {
          console.log('Has modifications, firing object:modified') // Debug
          setTimeout(() => {
            canvas?.fire('object:modified')
            canvas?.renderAll()
          }, 0)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [canvas])

  const handleColorChangeWithFlag = (color) => {
    handleColorChange(color)
    handleModification()
  }

  const handleStrokeChangeWithFlag = (...args) => {
    handleStrokeChange(...args)
    handleModification()
  }

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
        onToggle={() => {
          setIsStrokeControlOpen(!isStrokeControlOpen)
          resetModificationFlag()
        }}
        onStrokeChange={handleStrokeChangeWithFlag} // Passer le handler avec flag
        pickerRef={strokePickerRef}
      />

      <AppearanceControls
        isOpen={isAppearanceOpen}
        onToggle={() => {
          setIsAppearanceOpen(!isAppearanceOpen)
          setIsColorPickerOpen(false)
          setIsStrokeControlOpen(false)
          resetModificationFlag()
        }}
        pickerRef={appearancePickerRef}
        onModification={handleModification}
      />

      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2" ref={pickerRef}>
          <ColorPicker color={currentColor} setSelectedColor={handleColorChangeWithFlag} />
        </div>
      )}
    </div>
  )
}
