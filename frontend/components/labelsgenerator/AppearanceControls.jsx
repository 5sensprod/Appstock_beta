import React, { useState, useEffect, useCallback, useRef } from 'react'
import { faAdjust } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../ui/IconButton'
import ColorPicker from './texttool/ColorPicker'
import GradientSlider from './GradientSlider'
import { GRADIENT_TYPES, useAppearanceManager } from '../../hooks/useAppearanceManager'
import { useCanvas } from '../../context/CanvasContext'

export const AppearanceControls = ({ isOpen, onToggle, pickerRef }) => {
  const { canvas, handleCanvasModification } = useCanvas()
  const pendingChangesRef = useRef(false)
  const {
    currentOpacity,
    currentGradientType,
    currentGradientColors,
    currentGradientDirection,
    currentGradientOffsets,
    currentColor,
    handleOpacityChange,
    createGradient,
    removeGradient
  } = useAppearanceManager()

  const [activeColorStop, setActiveColorStop] = useState(0)
  const [gradientColors, setGradientColors] = useState(currentGradientColors)
  const [gradientDirection, setGradientDirection] = useState(currentGradientDirection)
  const [isDragging, setIsDragging] = useState(false)

  // Nouvelle fonction pour gérer les modifications en attente
  const setPendingChanges = useCallback(() => {
    pendingChangesRef.current = true
  }, [])

  // Synchronisation des modifications lors de la fermeture du menu
  useEffect(() => {
    if (!isOpen && pendingChangesRef.current) {
      handleCanvasModification()
      pendingChangesRef.current = false
    }
  }, [isOpen, handleCanvasModification])

  const handleColorChange = useCallback(
    (color) => {
      if (currentGradientType === 'none') {
        canvas?.getActiveObject()?.set('fill', color)
        canvas?.renderAll()
        setPendingChanges()
      } else {
        const newColors = [...gradientColors]
        newColors[activeColorStop] = color
        setGradientColors(newColors)
        handleGradientChange(currentGradientType, newColors, gradientDirection)
        setPendingChanges()
      }
    },
    [
      canvas,
      currentGradientType,
      gradientColors,
      gradientDirection,
      activeColorStop,
      setPendingChanges
    ]
  )

  useEffect(() => {
    setGradientDirection(currentGradientDirection)
  }, [currentGradientDirection])

  const handleGradientChange = useCallback(
    (type, colors = gradientColors, newDirection = gradientDirection) => {
      if (type === 'none') {
        removeGradient()
      } else {
        const currentOffsets = canvas?.getActiveObject()?.get('fill')?.colorStops
          ? [
              canvas.getActiveObject().get('fill').colorStops[0].offset,
              canvas.getActiveObject().get('fill').colorStops[1].offset
            ]
          : currentGradientOffsets

        const direction = type === 'linear' ? newDirection : 0
        createGradient(type, colors, direction, currentOffsets)
      }
      setPendingChanges()
    },
    [
      gradientColors,
      gradientDirection,
      currentGradientOffsets,
      createGradient,
      removeGradient,
      setPendingChanges,
      canvas
    ]
  )

  const handleDirectionChange = useCallback(
    (newDirection) => {
      setGradientDirection(newDirection)
      const currentOffsets = canvas?.getActiveObject()?.get('fill')?.colorStops
        ? [
            canvas.getActiveObject().get('fill').colorStops[0].offset,
            canvas.getActiveObject().get('fill').colorStops[1].offset
          ]
        : currentGradientOffsets

      createGradient(currentGradientType, gradientColors, newDirection, currentOffsets)
      setPendingChanges()
    },
    [currentGradientType, gradientColors, currentGradientOffsets, createGradient, setPendingChanges]
  )

  // Modification du gestionnaire d'opacité
  const handleOpacityChangeWithDelay = useCallback(
    (value) => {
      handleOpacityChange(value)
      setPendingChanges()
    },
    [handleOpacityChange, setPendingChanges]
  )

  useEffect(() => {
    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        setPendingChanges()
      }
    }
    window.addEventListener('mouseup', handleMouseUp)
    return () => window.removeEventListener('mouseup', handleMouseUp)
  }, [isDragging, setPendingChanges])

  useEffect(() => {
    const colorsChanged = JSON.stringify(gradientColors) !== JSON.stringify(currentGradientColors)
    if (colorsChanged) {
      setGradientColors(currentGradientColors)
    }
  }, [currentGradientColors])

  // Assurez-vous d'appliquer les changements en attente lors du démontage
  useEffect(() => {
    return () => {
      if (pendingChangesRef.current) {
        handleCanvasModification()
      }
    }
  }, [handleCanvasModification])

  if (!isOpen) {
    return (
      <IconButton
        onClick={onToggle}
        icon={faAdjust}
        title="Apparence"
        className="bg-gray-500 hover:bg-gray-600"
        size="w-12 h-12"
        iconSize="text-xl"
      />
    )
  }

  return (
    <div
      className="absolute left-0 top-2 z-50 mt-2 w-64 rounded-lg bg-white p-4 shadow-xl"
      ref={pickerRef}
      onMouseDown={() => setIsDragging(true)}
    >
      <div className="space-y-4">
        {/* ColorPicker principal */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {currentGradientType === 'none'
              ? 'Couleur'
              : `Couleur ${activeColorStop === 0 ? 'de début' : 'de fin'}`}
          </label>
          <ColorPicker
            color={currentGradientType === 'none' ? currentColor : gradientColors[activeColorStop]}
            setSelectedColor={handleColorChange}
          />
        </div>

        {/* Opacité */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Opacité</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={currentOpacity}
            onChange={(e) => handleOpacityChangeWithDelay(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-right text-sm text-gray-500">
            {Math.round(currentOpacity * 100)}%
          </div>
        </div>

        {/* Type de dégradé */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Type de dégradé</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(GRADIENT_TYPES).map(([type, label]) => (
              <button
                key={type}
                onClick={() => handleGradientChange(type)}
                className={`rounded border px-3 py-1 text-sm ${
                  currentGradientType === type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {label === 'none' ? 'Aucun' : label === 'linear' ? 'Linéaire' : 'Radial'}
              </button>
            ))}
          </div>
        </div>

        {/* Gradient Color Stops */}
        {currentGradientType !== 'none' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Couleurs du dégradé</label>
            <GradientSlider
              colors={gradientColors}
              activeStop={activeColorStop}
              onStopSelect={setActiveColorStop}
              onPositionChange={(stopIndex, offset) => {
                const newOffsets = [...currentGradientOffsets]
                newOffsets[stopIndex] = offset
                createGradient(currentGradientType, gradientColors, gradientDirection, newOffsets)
              }}
              offsets={currentGradientOffsets}
            />
          </div>
        )}
        {/* Direction (uniquement pour le dégradé linéaire) */}
        {currentGradientType === 'linear' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Direction (degrés)</label>
            <input
              type="range"
              min="0"
              max="360"
              value={gradientDirection}
              onChange={(e) => {
                const newDirection = parseInt(e.target.value)
                handleDirectionChange(newDirection)
              }}
              onMouseUp={() => canvas?.fire('object:modified')}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-500">{gradientDirection}°</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppearanceControls
