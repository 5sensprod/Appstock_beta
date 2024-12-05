import React from 'react'
import { faRuler } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../ui/IconButton'
import ColorPicker from './texttool/ColorPicker'
import { STROKE_DASH_PATTERNS } from '../../hooks/useStrokeManager'

export const StrokeControls = ({
  isOpen,
  onToggle,
  strokeWidth,
  strokeColor,
  strokePattern,
  onStrokeChange,
  pickerRef
}) => {
  // Helper pour comparer les patterns
  const isPatternActive = (pattern) => {
    const currentPattern = strokePattern || []
    const comparePattern = pattern || []

    // Si les deux sont vides ou null, ils sont considérés comme égaux (trait solide)
    if (
      (!currentPattern || currentPattern.length === 0) &&
      (!comparePattern || comparePattern.length === 0)
    ) {
      return true
    }

    return JSON.stringify(currentPattern) === JSON.stringify(comparePattern)
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
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(STROKE_DASH_PATTERNS).map(([name, pattern]) => (
              <button
                key={name}
                onClick={() => onStrokeChange({ strokeDashArray: pattern })}
                className={`flex h-8 items-center justify-center rounded border ${
                  isPatternActive(pattern)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div
                  className="h-0.5 w-16"
                  style={{
                    background:
                      pattern && pattern.length > 0
                        ? `repeating-linear-gradient(
                          to right,
                          black 0,
                          black ${pattern[0]}px,
                          transparent ${pattern[0]}px,
                          transparent ${pattern[0] + (pattern[1] || 0)}px
                        )`
                        : 'black'
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
