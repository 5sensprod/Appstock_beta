import React, { useState, useEffect, useCallback } from 'react'
import { faAdjust } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../ui/IconButton'
import ColorPicker from './texttool/ColorPicker'
import GradientSlider from './GradientSlider'
import { GRADIENT_TYPES } from '../../hooks/useAppearanceManager'
import { useStyle } from '../../context/StyleContext'

// AppearanceControls.jsx
export const AppearanceControls = ({ isOpen, onToggle, pickerRef, onModification }) => {
  const {
    currentOpacity,
    currentGradientType,
    currentGradientColors,
    currentGradientDirection,
    currentGradientOffsets,
    currentColor
  } = useStyle()

  // États locaux pour le gradient
  const [activeColorStop, setActiveColorStop] = useState(0)
  const [localGradientColors, setLocalGradientColors] = useState([])
  const [localGradientDirection, setLocalGradientDirection] = useState(0)

  // Initialisation
  useEffect(() => {
    setLocalGradientColors(currentGradientColors)
    setLocalGradientDirection(currentGradientDirection)
  }, [currentGradientColors, currentGradientDirection])

  const handleGradientChange = (type) => {
    onModification({
      type: 'gradient',
      gradientType: type,
      colors: localGradientColors,
      direction: localGradientDirection,
      offsets: currentGradientOffsets
    })
  }

  const handleColorChange = useCallback(
    (color) => {
      if (currentGradientType === 'none') {
        // Pour une couleur unie, utiliser directement onModification
        onModification({
          type: 'gradient', // On utilise le même type pour unifier la logique
          gradientType: 'none',
          colors: [color], // La première couleur sera utilisée comme couleur unie
          direction: 0,
          offsets: [0, 1]
        })
      } else {
        const newColors = [...localGradientColors]
        newColors[activeColorStop] = color
        setLocalGradientColors(newColors)
        onModification({
          type: 'gradient',
          gradientType: currentGradientType,
          colors: newColors,
          direction: localGradientDirection,
          offsets: currentGradientOffsets
        })
      }
    },
    [
      currentGradientType,
      localGradientColors,
      localGradientDirection,
      activeColorStop,
      currentGradientOffsets,
      onModification
    ]
  )

  const handleDirectionChange = (newDirection) => {
    setLocalGradientDirection(newDirection)
    onModification({
      type: 'gradient',
      gradientType: currentGradientType,
      colors: localGradientColors,
      direction: newDirection,
      offsets: currentGradientOffsets
    })
  }

  const handleOpacityChange = (opacity) => {
    onModification({
      type: 'opacity',
      opacity: parseFloat(opacity)
    })
  }

  if (!isOpen) {
    return (
      <IconButton
        onClick={onToggle}
        icon={faAdjust}
        title="Apparence"
        className="bg-gray-500 hover:bg-gray-600"
        size="w-8 h-8"
        iconSize="text-sm"
      />
    )
  }

  return (
    <div
      className="absolute left-0 top-2 z-50 mt-2 w-64 rounded-lg bg-white p-4 shadow-xl"
      ref={pickerRef}
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
            color={
              currentGradientType === 'none' ? currentColor : localGradientColors[activeColorStop]
            }
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
            onChange={(e) => handleOpacityChange(e.target.value)}
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
              colors={localGradientColors}
              activeStop={activeColorStop}
              onStopSelect={setActiveColorStop}
              offsets={currentGradientOffsets}
              onPositionChange={(stopIndex, offset) => {
                onModification({
                  type: 'gradient',
                  gradientType: currentGradientType,
                  colors: localGradientColors,
                  direction: localGradientDirection,
                  offsets: [
                    stopIndex === 0 ? offset : currentGradientOffsets[0],
                    stopIndex === 1 ? offset : currentGradientOffsets[1]
                  ]
                })
              }}
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
              value={localGradientDirection}
              onChange={(e) => handleDirectionChange(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-500">{localGradientDirection}°</div>
          </div>
        )}
      </div>
    </div>
  )
}
