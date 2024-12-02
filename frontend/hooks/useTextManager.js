// hooks/useTextManager.js
import { useCanvas } from '../context/CanvasContext'
import useCanvasObjectUpdater from './useCanvasObjectUpdater'
import FontFaceObserver from 'fontfaceobserver'

// useTextManager.js
export const useTextManager = () => {
  const { canvas, selectedColor, selectedFont, selectedObject, dispatchCanvasAction } = useCanvas()
  const updateObjectProperties = useCanvasObjectUpdater(canvas, dispatchCanvasAction)

  const handleColorChange = (color, isClosing = false) => {
    if (selectedObject?.type === 'i-text' || selectedObject?.type === 'textbox') {
      updateObjectProperties(selectedObject, { color })
      if (isClosing) {
        canvas?.fire('object:modified')
      }
    } else {
      dispatchCanvasAction({ type: 'SET_COLOR', payload: color })
    }
  }

  const handleFontChange = async (fontFamily) => {
    try {
      await new FontFaceObserver(fontFamily).load()
      if (selectedObject?.type === 'i-text' || selectedObject?.type === 'textbox') {
        updateObjectProperties(selectedObject, { font: fontFamily })
        canvas?.fire('object:modified')
      } else {
        dispatchCanvasAction({ type: 'SET_FONT', payload: fontFamily })
      }
    } catch (error) {
      console.error(`Erreur chargement police ${fontFamily}:`, error)
    }
  }

  return {
    isTextSelected: selectedObject?.type === 'i-text' || selectedObject?.type === 'textbox',
    currentColor: selectedObject?.fill || selectedColor,
    currentFont: selectedObject?.fontFamily || selectedFont,
    handleColorChange,
    handleFontChange
  }
}
