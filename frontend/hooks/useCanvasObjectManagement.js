// hooks/useCanvasObjectManagement.js
import { useEffect, useCallback } from 'react'

export default function useCanvasObjectManagement(canvas, selectedObject, onDeleteObject) {
  // Détecte si un objet de type spécifique est sélectionné
  const isShapeSelected = () => selectedObject?.type === 'circle' || selectedObject?.type === 'rect'
  const isTextSelected = () =>
    selectedObject?.type === 'i-text' || selectedObject?.type === 'textbox'
  const isImageSelected = () => selectedObject?.type === 'image'
  const isQRCodeSelected = useCallback(() => selectedObject?.isQRCode === true, [selectedObject])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete') onDeleteObject()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onDeleteObject])

  return { isShapeSelected, isTextSelected, isImageSelected, isQRCodeSelected }
}
