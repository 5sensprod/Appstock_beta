import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTextHeight, faPalette } from '@fortawesome/free-solid-svg-icons'
import ColorPicker from '../texttool/ColorPicker'
import { useInstance } from '../../../context/InstanceContext'

export default function TextMenu({ onAddText }) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const { selectedColor, handleColorChange, selectedFont, setSelectedFont } = useInstance() // Utiliser setSelectedFont
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
        onChange={(e) => setSelectedFont(e.target.value)} // Utiliser setSelectedFont ici
        className="rounded border bg-white p-2 shadow"
      >
        <option value="Arial">Arial</option>
        <option value="Courier New">Courier New</option>
        <option value="Georgia">Georgia</option>
        <option value="Times New Roman">Times New Roman</option>
        <option value="Verdana">Verdana</option>
      </select>
    </div>
  )
}
