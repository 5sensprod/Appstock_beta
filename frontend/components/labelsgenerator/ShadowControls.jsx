import React, { useState, useEffect } from 'react'
import { faCube } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../ui/IconButton'
import ColorPicker from './texttool/ColorPicker'
import { useStyle } from '../../context/StyleContext'
import LabelWithValue from '../ui/LabelWithValue'

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
        icon={faCube}
        title="Ombre"
        className="bg-gray-500 hover:bg-gray-600"
        size="w-8 h-8"
        iconSize="text-sm"
      />
    )
  }

  return (
    <div className="absolute top-full z-20 mt-2 rounded-lg bg-white p-4 shadow-xl" ref={pickerRef}>
      <div className="space-y-1">
        {/* Couleur de l'ombre */}
        <div className="mb-4 space-y-1">
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
        <div className="space-y-1">
          <LabelWithValue label="Flou" value={`${currentShadow.blur}px`} />
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
        </div>

        {/* Décalage X */}
        <div className="space-y-1">
          <LabelWithValue label="Décalage X" value={`${currentShadow.offsetX}px`} />
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
        </div>

        {/* Décalage Y */}
        <div className="space-y-1">
          <LabelWithValue label="Décalage Y" value={`${currentShadow.offsetY}px`} />
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
        </div>

        {/* Opacité */}
        <div className="space-y-1">
          <LabelWithValue label="Opacité" value={`${Math.round(localOpacity * 100)}%`} />
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={localOpacity}
            onChange={handleOpacityChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  )
}

export default ShadowControls
