// hooks/useTextManager.js
import { useCanvas } from '../context/CanvasContext'
import useCanvasObjectUpdater from './useCanvasObjectUpdater'
import FontFaceObserver from 'fontfaceobserver'

export const useTextManager = () => {
  const { canvas, selectedColor, selectedFont, selectedObject, dispatchCanvasAction } = useCanvas()
  const updateObjectProperties = useCanvasObjectUpdater(canvas, dispatchCanvasAction)

  const isTextSelected = selectedObject?.type === 'i-text' || selectedObject?.type === 'textbox'
  const currentColor = isTextSelected ? selectedObject.fill : selectedColor
  const currentFont = isTextSelected ? selectedObject.fontFamily : selectedFont

  const handleColorChange = (color) => {
    if (isTextSelected) {
      updateObjectProperties(selectedObject, { color })
    } else {
      dispatchCanvasAction({ type: 'SET_SELECTED_COLOR', payload: color })
    }
  }

  const handleFontChange = async (fontFamily) => {
    try {
      await new FontFaceObserver(fontFamily).load()
      if (isTextSelected) {
        updateObjectProperties(selectedObject, { font: fontFamily })
      } else {
        dispatchCanvasAction({ type: 'SET_SELECTED_FONT', payload: fontFamily })
      }
    } catch (error) {
      console.error(`Erreur chargement police ${fontFamily}:`, error)
    }
  }

  return {
    isTextSelected,
    currentColor,
    currentFont,
    handleColorChange,
    handleFontChange
  }
}
