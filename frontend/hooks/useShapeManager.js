// hooks/useShapeManager.js
import { useCanvas } from '../context/CanvasContext'
import useCanvasObjectUpdater from './useCanvasObjectUpdater'

export const useShapeManager = () => {
  const { canvas, selectedColor, selectedObject, dispatchCanvasAction } = useCanvas()
  const updateObjectProperties = useCanvasObjectUpdater(canvas, dispatchCanvasAction)

  const handleColorChange = (color, isClosing = false) => {
    if (
      selectedObject?.type === 'circle' ||
      selectedObject?.type === 'rect' ||
      selectedObject?.type === 'image'
    ) {
      updateObjectProperties(selectedObject, { color })
      if (isClosing) {
        canvas.fire('object:updated')
      }
    } else {
      dispatchCanvasAction({ type: 'SET_COLOR', payload: color })
    }
  }

  return {
    currentColor: selectedObject?.fill || selectedColor,
    handleColorChange
  }
}
