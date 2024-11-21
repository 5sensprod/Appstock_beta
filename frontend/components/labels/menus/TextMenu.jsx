import React, { useState, useEffect, useRef } from 'react'
import { faTextHeight, faPalette } from '@fortawesome/free-solid-svg-icons'
import IconButton from '../../ui/IconButton'
import ColorPicker from '../texttool/ColorPicker'
import { useCanvas } from '../../../context/CanvasContext'
import FontFaceObserver from 'fontfaceobserver'

export default function TextMenu({ onAddText, selectedObject }) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)
  const { selectedColor, selectedFont, dispatchCanvasAction } = useCanvas()

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

  const isTextSelected =
    selectedObject && (selectedObject.type === 'i-text' || selectedObject.type === 'textbox')

  const currentColor = isTextSelected ? selectedObject.fill : selectedColor
  const currentFont = isTextSelected ? selectedObject.fontFamily : selectedFont

  const handleColorChange = (color) => {
    if (isTextSelected) {
      selectedObject.set({ fill: color })
      selectedObject.canvas.renderAll()
      dispatchCanvasAction({
        type: 'SET_OBJECT_PROPERTIES',
        payload: { id: selectedObject.id, properties: { color } }
      })
    } else {
      dispatchCanvasAction({
        type: 'SET_OBJECT_PROPERTIES',
        payload: { properties: { color } }
      })
    }
  }

  const handleFontChange = (fontFamily) => {
    if (isTextSelected) {
      const fontObserver = new FontFaceObserver(fontFamily)
      fontObserver
        .load()
        .then(() => {
          selectedObject.set({ fontFamily })
          selectedObject.canvas.renderAll()
          dispatchCanvasAction({
            type: 'SET_OBJECT_PROPERTIES',
            payload: { id: selectedObject.id, properties: { font: fontFamily } }
          })
        })
        .catch((e) => {
          console.error(`Error loading font ${fontFamily}`, e)
        })
    } else {
      dispatchCanvasAction({
        type: 'SET_OBJECT_PROPERTIES',
        payload: { properties: { font: fontFamily } }
      })
    }
  }

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
        onClick={toggleColorPicker}
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
