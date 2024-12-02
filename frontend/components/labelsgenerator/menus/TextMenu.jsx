// TextMenu.jsx
import React, { useState, useEffect, useRef } from 'react'
import { faTextHeight, faPalette } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'
import ColorPicker from '../texttool/ColorPicker'
import { useTextManager } from '../../../hooks/useTextManager'

export default function TextMenu({ onAddText }) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const pickerRef = useRef(null)
  const { isTextSelected, currentColor, currentFont, handleColorChange, handleFontChange } =
    useTextManager()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsColorPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative flex w-auto space-x-2 rounded bg-white p-2 shadow-lg">
      <IconButton
        onClick={onAddText}
        icon={faTextHeight}
        title="Ajouter du texte"
        className="bg-blue-500 hover:bg-blue-600"
        size="w-9 h-12"
        iconSize="text-xl"
      />
      <IconButton
        onClick={() => setIsColorPickerOpen((prev) => !prev)}
        icon={faPalette}
        title="Choisir une couleur"
        className="bg-gray-500 hover:bg-gray-600"
        size="w-9 h-12"
        iconSize="text-xl"
      />
      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2" ref={pickerRef}>
          <ColorPicker color={currentColor} setSelectedColor={handleColorChange} />
        </div>
      )}
      <select
        value={currentFont}
        onChange={(e) => handleFontChange(e.target.value)}
        className="rounded border bg-white p-2 shadow"
      >
        {[
          'Lato',
          'Merriweather',
          'Nunito',
          'Open Sans',
          'Pacifico',
          'Playfair Display',
          'Roboto'
        ].map((font) => (
          <option key={font} value={font}>
            {font}
          </option>
        ))}
      </select>
    </div>
  )
}
