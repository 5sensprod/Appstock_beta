import React, { useState, useEffect } from 'react'
import { faSquare } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../ui/IconButton'
import ColorPicker from './texttool/ColorPicker'
import { useStyle } from '../../context/StyleContext'

export const ShadowControls = ({ isOpen, onToggle, onModification, pickerRef }) => {
  const { currentShadow, handleShadowChange } = useStyle()
  const [localOpacity, setLocalOpacity] = useState(currentShadow?.opacity ?? 0.5)

  // Synchroniser avec currentShadow uniquement quand le menu s'ouvre
  useEffect(() => {
    if (isOpen) {
      setLocalOpacity(currentShadow?.opacity ?? 0.5)
    }
  }, [isOpen, currentShadow?.opacity])

  const handleOpacityChange = (event) => {
    const newOpacity = parseFloat(event.target.value)
    setLocalOpacity(newOpacity) // Pour le mouvement fluide du curseur
    handleShadowChange({ opacity: newOpacity }) // Pour l'effet sur l'ombre
    onModification()
  }

  if (!isOpen) {
    return (
      <IconButton
        onClick={onToggle}
        icon={faSquare}
        title="Ombre"
        className="bg-gray-500 hover:bg-gray-600"
        size="w-12 h-12"
        iconSize="text-xl"
      />
    )
  }

  return (
    <div className="absolute top-full z-20 mt-2 rounded-lg bg-white p-4 shadow-xl" ref={pickerRef}>
      <div className="space-y-4">
        {/* Couleur de l'ombre */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Couleur</label>
          <ColorPicker
            color={currentShadow.color}
            setSelectedColor={(color) => {
              handleShadowChange({ color })
              onModification()
            }}
          />
        </div>

        {/* Flou */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Flou</label>
          <input
            type="range"
            min="0"
            max="50"
            value={currentShadow.blur}
            onChange={(e) => {
              handleShadowChange({ blur: parseInt(e.target.value, 10) })
              onModification()
            }}
            className="w-full"
          />
          <div className="text-right text-sm text-gray-500">{currentShadow.blur}px</div>
        </div>

        {/* Offset X */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Décalage X</label>
          <input
            type="range"
            min="-50"
            max="50"
            value={currentShadow.offsetX}
            onChange={(e) => {
              handleShadowChange({ offsetX: parseInt(e.target.value, 10) })
              onModification()
            }}
            className="w-full"
          />
          <div className="text-right text-sm text-gray-500">{currentShadow.offsetX}px</div>
        </div>

        {/* Offset Y */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Décalage Y</label>
          <input
            type="range"
            min="-50"
            max="50"
            value={currentShadow.offsetY}
            onChange={(e) => {
              handleShadowChange({ offsetY: parseInt(e.target.value, 10) })
              onModification()
            }}
            className="w-full"
          />
          <div className="text-right text-sm text-gray-500">{currentShadow.offsetY}px</div>
        </div>

        {/* Opacité */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Opacité</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={localOpacity}
            onChange={handleOpacityChange}
            className="w-full"
          />
          <div className="text-right text-sm text-gray-500">{Math.round(localOpacity * 100)}%</div>
        </div>
      </div>
    </div>
  )
}

export default ShadowControls