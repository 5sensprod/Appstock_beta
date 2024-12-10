import React, { useState, useEffect } from 'react'
import { faRuler } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../ui/IconButton'
import ColorPicker from './texttool/ColorPicker'
import { STROKE_PATTERN_TYPES } from '../../hooks/useStrokeManager'

export const StrokeControls = ({
  isOpen,
  onToggle,
  strokeWidth,
  strokeColor,
  patternType,
  patternDensity = 5,
  onStrokeChange,
  pickerRef
}) => {
  // State local pour suivre le type de motif
  const [activePattern, setActivePattern] = useState(patternType || 'solid')
  const [localPatternDensity, setLocalPatternDensity] = useState(patternDensity)

  // Synchroniser l'état local avec les props
  useEffect(() => {
    setActivePattern(patternType)
  }, [patternType])

  useEffect(() => {
    setLocalPatternDensity(patternDensity)
  }, [patternDensity])

  const handlePatternChange = (type) => {
    setActivePattern(type)
    onStrokeChange({
      patternType: type,
      density: localPatternDensity,
      forceUpdate: true
    })
  }

  const handleDensityChange = (newDensity) => {
    setLocalPatternDensity(newDensity)
    onStrokeChange({
      density: newDensity,
      patternType: activePattern,
      forceUpdate: true
    })
  }

  if (!isOpen) {
    return (
      <IconButton
        onClick={onToggle}
        icon={faRuler}
        title="Paramètres de bordure"
        className="bg-gray-500 hover:bg-gray-600"
        size="w-12 h-12"
        iconSize="text-xl"
      />
    )
  }

  return (
    <div className="absolute top-full z-20 mt-2 rounded-lg bg-white p-4 shadow-xl" ref={pickerRef}>
      <div className="space-y-4">
        {/* Épaisseur de la bordure */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Épaisseur</label>
          <input
            type="range"
            min="0"
            max="20"
            value={strokeWidth}
            onChange={(e) => onStrokeChange({ strokeWidth: parseInt(e.target.value, 10) })}
            className="w-full"
          />
          <div className="text-right text-sm text-gray-500">{strokeWidth}px</div>
        </div>

        {/* Couleur de la bordure */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Couleur</label>
          <ColorPicker
            color={strokeColor}
            setSelectedColor={(color) => onStrokeChange({ stroke: color })}
          />
        </div>

        {/* Style de la bordure */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Style</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(STROKE_PATTERN_TYPES).map(([type, label]) => (
              <button
                key={type}
                onClick={() => handlePatternChange(type)}
                className={`flex h-8 items-center justify-center rounded border ${
                  activePattern === type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="relative h-0.5 w-16">
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        type === 'solid'
                          ? 'black'
                          : type === 'dotted'
                            ? 'linear-gradient(to right, black 1px, transparent 1px)'
                            : 'linear-gradient(to right, black 8px, transparent 8px)',
                      backgroundSize: type === 'solid' ? 'auto' : '12px 100%'
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Densité du motif */}
        {activePattern !== 'solid' && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Densité {activePattern === 'dotted' ? 'des points' : 'des traits'}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={localPatternDensity}
              onChange={(e) => handleDensityChange(parseInt(e.target.value, 10))}
              className="w-full"
            />
            <div className="text-right text-sm text-gray-500">{localPatternDensity}</div>
          </div>
        )}
      </div>
    </div>
  )
}
