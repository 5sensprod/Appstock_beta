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
    currentColor,
    handleOpacityChange,
    createGradient,
    removeGradient
  } = useAppearanceManager()

  const [activeColorStop, setActiveColorStop] = useState(0) // 0 = début, 1 = fin
  const [gradientColors, setGradientColors] = useState(currentGradientColors)
  const [gradientDirection, setGradientDirection] = useState(currentGradientDirection)

  // Gestion unifiée du changement de couleur
  const handleColorChange = useCallback(
    (color) => {
      if (currentGradientType === 'none') {
        canvas?.getActiveObject()?.set('fill', color)
        canvas?.renderAll()
        canvas?.fire('object:modified')
      } else {
        const newColors = [...gradientColors]
        newColors[activeColorStop] = color
        setGradientColors(newColors)
        handleGradientChange(currentGradientType, newColors, gradientDirection)
      }
    },
    [canvas, currentGradientType, gradientColors, gradientDirection, activeColorStop]
  )

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

  // Synchronisation avec l'état global
  useEffect(() => {
    const colorsChanged = JSON.stringify(gradientColors) !== JSON.stringify(currentGradientColors)
    if (colorsChanged) {
      setGradientColors(currentGradientColors)
    }
  }, [currentGradientColors])

  if (!isOpen)
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
            onChange={(e) => handleOpacityChange(parseFloat(e.target.value))}
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

        {/* Gradient Color Stops */}
        {currentGradientType !== 'none' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Couleurs du dégradé</label>
            <div
              className="relative h-8 rounded-lg"
              style={{
                background: `linear-gradient(to right, ${gradientColors[0]}, ${gradientColors[1]})`
              }}
            >
              {/* Bouton couleur de début */}
              <button
                className={`absolute left-0 top-1/2 -ml-2 -mt-2 h-4 w-4 rounded-full border-2 ${activeColorStop === 0 ? 'border-blue-500' : 'border-white'}`}
                style={{ background: gradientColors[0] }}
                onClick={() => setActiveColorStop(0)}
              />
              {/* Bouton couleur de fin */}
              <button
                className={`absolute right-0 top-1/2 -mr-2 -mt-2 h-4 w-4 rounded-full border-2 ${activeColorStop === 1 ? 'border-blue-500' : 'border-white'}`}
                style={{ background: gradientColors[1] }}
                onClick={() => setActiveColorStop(1)}
              />
            </div>
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
                const direction = parseInt(e.target.value)
                setGradientDirection(direction)
                handleGradientChange(currentGradientType, gradientColors, direction)
              }}
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
