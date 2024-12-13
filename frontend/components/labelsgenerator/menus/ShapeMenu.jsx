import React, { useState, useEffect, useRef } from 'react'
import { faCircle, faSquare } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'
import { useShapeManager } from '../../../hooks/useShapeManager'
import { useCanvas } from '../../../context/CanvasContext'
import { StrokeControls } from '../StrokeControls'
import { ShadowControls } from '../ShadowControls'
import { AppearanceControls } from '../AppearanceControls'
import { useStyle } from '../../../context/StyleContext'

export default function ShapeMenu({ onAddCircle, onAddRectangle, onUpdateQrCode }) {
  const [, setIsColorPickerOpen] = useState(false)
  const [isStrokeControlOpen, setIsStrokeControlOpen] = useState(false)
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false)

  const pickerRef = useRef(null)
  const strokePickerRef = useRef(null)
  const appearancePickerRef = useRef(null)
  const hasModifications = useRef(false)
  const { handleStrokeChange, handleOpacityChange, createGradient, removeGradient } = useStyle()
  const [isShadowOpen, setIsShadowOpen] = useState(false)
  const shadowPickerRef = useRef(null)

  const { currentColor } = useShapeManager()

  const { canvas, selectedObject } = useCanvas()

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
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsColorPickerOpen(false)
        if (hasModifications.current) {
          setTimeout(() => {
            canvas?.fire('object:modified')
            canvas?.renderAll()
          }, 0)
        }
      }

      if (strokePickerRef.current && !strokePickerRef.current.contains(event.target)) {
        setIsStrokeControlOpen(false)
        if (hasModifications.current) {
          setTimeout(() => {
            canvas?.fire('object:modified')
            canvas?.renderAll()
          }, 0)
        }
      }

      // Ajout de la gestion du clic extérieur pour AppearanceControls
      if (appearancePickerRef.current && !appearancePickerRef.current.contains(event.target)) {
        setIsAppearanceOpen(false)
        if (hasModifications.current) {
          setTimeout(() => {
            canvas?.fire('object:modified')
            canvas?.renderAll()
          }, 0)
        }
      }
      if (shadowPickerRef.current && !shadowPickerRef.current.contains(event.target)) {
        setIsShadowOpen(false)
        if (hasModifications.current) {
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

  const handleStrokeChangeWithFlag = (...args) => {
    handleStrokeChange(...args)
    handleModification()
  }

  const handleAppearanceChangeWithFlag = (props) => {
    const isQrCode = selectedObject?.isQRCode

    if (props.type === 'gradient') {
      // Pour les QR codes, on applique directement la couleur
      if (isQrCode && props.colors?.length > 0) {
        onUpdateQrCode(selectedObject.qrText, props.colors[0])
        // Mettre à jour l'état global pour maintenir la couleur
        canvas?.getActiveObject()?.set('fill', props.colors[0])
        canvas?.renderAll()
        handleModification()
        return
      }

      if (props.gradientType === 'none') {
        removeGradient()
        const color = props.colors[0] || currentColor
        canvas?.getActiveObject()?.set('fill', color)
        canvas?.renderAll()
      } else {
        createGradient(props.gradientType, props.colors, props.direction, props.offsets)
      }
    } else if (props.type === 'opacity') {
      handleOpacityChange(props.opacity)
    }
    handleModification()
  }

  const handleShadowChangeWithFlag = (...args) => {
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
        onModification={handleAppearanceChangeWithFlag}
      />
      <ShadowControls
        isOpen={isShadowOpen}
        onToggle={() => {
          setIsShadowOpen(!isShadowOpen)
          resetModificationFlag()
        }}
        onModification={handleShadowChangeWithFlag}
        pickerRef={shadowPickerRef}
      />
    </div>
  )
}
