import React, { useState, useEffect, useCallback } from 'react'
import { faAdjust } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../ui/IconButton'
import ColorPicker from './texttool/ColorPicker'
import { GRADIENT_TYPES, useAppearanceManager } from '../../hooks/useAppearanceManager'
import { useCanvas } from '../../context/CanvasContext'

export const AppearanceControls = ({ isOpen, onToggle, pickerRef }) => {
  const { canvas } = useCanvas()
  const {
    currentOpacity,
    currentGradientType,
    currentGradientColors,
    currentGradientDirection,
    handleOpacityChange,
    createGradient,
    removeGradient
  } = useAppearanceManager()

  const [gradientColors, setGradientColors] = useState(currentGradientColors)
  const [gradientDirection, setGradientDirection] = useState(currentGradientDirection)

  // Utiliser useCallback pour la fonction handleGradientChange
  const handleGradientChange = useCallback(
    (type, colors, direction) => {
      if (type === 'none') {
        removeGradient()
      } else {
        createGradient(type, colors, direction)
      }
      canvas?.fire('object:modified')
    },
    [canvas, createGradient, removeGradient]
  )

  // Synchroniser uniquement quand les valeurs changent réellement
  useEffect(() => {
    const colorsChanged = JSON.stringify(gradientColors) !== JSON.stringify(currentGradientColors)
    if (colorsChanged) {
      setGradientColors(currentGradientColors)
    }
  }, [currentGradientColors])

  useEffect(() => {
    if (gradientDirection !== currentGradientDirection) {
      setGradientDirection(currentGradientDirection)
    }
  }, [currentGradientDirection])

  const handleOpacityChangeEnd = () => {
    handleOpacityChange(currentOpacity, true)
    canvas?.fire('object:modified')
  }

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
    >
      <div className="space-y-4">
        {/* Opacité */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Opacité</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={currentOpacity}
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
            onMouseUp={handleOpacityChangeEnd}
            onTouchEnd={handleOpacityChangeEnd}
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
                onClick={() => handleGradientChange(type, gradientColors, gradientDirection)}
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

        {/* Couleurs du dégradé */}
        {currentGradientType !== 'none' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Couleurs du dégradé</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Début</label>
                  <ColorPicker
                    color={gradientColors[0]}
                    setSelectedColor={(color) => {
                      const newColors = [color, gradientColors[1]]
                      setGradientColors(newColors)
                      handleGradientChange(currentGradientType, newColors, gradientDirection)
                    }}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Fin</label>
                  <ColorPicker
                    color={gradientColors[1]}
                    setSelectedColor={(color) => {
                      const newColors = [gradientColors[0], color]
                      setGradientColors(newColors)
                      handleGradientChange(currentGradientType, newColors, gradientDirection)
                    }}
                  />
                </div>
              </div>
            </div>

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
                    const direction = parseInt(e.target.value)
                    setGradientDirection(direction)
                    handleGradientChange(currentGradientType, gradientColors, direction)
                  }}
                  className="w-full"
                />
                <div className="text-right text-sm text-gray-500">{gradientDirection}°</div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
