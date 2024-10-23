import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTextHeight, faPalette } from '@fortawesome/free-solid-svg-icons'
import ColorPicker from '../texttool/ColorPicker'
import { useInstance } from '../../../context/InstanceContext'

export default function TextMenu({ onAddText }) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const { selectedColor, handleColorChange, handleFontChange, selectedFont } = useInstance()
  const pickerRef = useRef(null)

  const toggleColorPicker = () => {
    setIsColorPickerOpen((prev) => !prev)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsColorPickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className="relative flex w-auto space-x-2 rounded bg-white p-2 shadow-lg">
      <button
        onClick={onAddText}
        className="flex items-center justify-center rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
        title="Ajouter du texte"
      >
        <FontAwesomeIcon icon={faTextHeight} className="text-xl" />
      </button>
      <button
        onClick={toggleColorPicker}
        className="flex items-center justify-center rounded bg-gray-500 p-2 text-white hover:bg-gray-600"
        title="Choisir une couleur"
      >
        <FontAwesomeIcon icon={faPalette} className="text-xl" />
      </button>
      {isColorPickerOpen && (
        <div className="absolute top-full z-10 mt-2" ref={pickerRef}>
          <ColorPicker color={selectedColor} setSelectedColor={handleColorChange} />
        </div>
      )}

      {/* Sélecteur de police */}
      <select
        value={selectedFont}
        onChange={(e) => handleFontChange(e.target.value)}
        className="rounded border bg-white p-2 shadow"
      >
        <option value="Lato">Lato</option>
        <option value="Merriweather">Merriweather</option>
        <option value="Nunito">Nunito</option>
        <option value="Open Sans">Open Sans</option>
        <option value="Pacifico">Pacifico</option>
        <option value="Playfair Display">Playfair Display</option>
        <option value="Roboto">Roboto</option>
      </select>
    </div>
  )
}
