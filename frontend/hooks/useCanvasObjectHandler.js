import { useEffect, useCallback } from 'react'

const useCanvasObjectHandler = (canvas, selectedObject, dispatch) => {
  // Générique : Vérifie si un type d'objet est sélectionné
  const isTypeSelected = useCallback(
    (types) => types.includes(selectedObject?.type),
    [selectedObject]
  )

  // Sélecteurs spécifiques
  const isShapeSelected = useCallback(() => isTypeSelected(['circle', 'rect']), [isTypeSelected])
  const isTextSelected = useCallback(() => isTypeSelected(['i-text', 'textbox']), [isTypeSelected])
  const isImageSelected = useCallback(() => isTypeSelected(['image']), [isTypeSelected])
  const isQRCodeSelected = useCallback(() => selectedObject?.isQRCode === true, [selectedObject])

  // Fonction pour mettre à jour l'objet sélectionné
  const updateSelectedObject = useCallback(() => {
    if (!canvas) return
    dispatch({ type: 'SET_SELECTED_OBJECT', payload: canvas.getActiveObject() })
  }, [canvas, dispatch])

  // Gestion de la sélection effacée
  const handleSelectionCleared = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_OBJECT', payload: null })
  }, [dispatch])

  useEffect(() => {
    if (!canvas) return

    const eventHandlers = {
      'selection:created': updateSelectedObject,
      'selection:updated': updateSelectedObject,
      'selection:cleared': handleSelectionCleared
    }

    Object.entries(eventHandlers).forEach(([event, handler]) => canvas.on(event, handler))

    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => canvas.off(event, handler))
    }
  }, [canvas, updateSelectedObject, handleSelectionCleared])

  // Gestion de la suppression via la touche "Delete"
  const handleDeleteKey = useCallback(() => {
    const activeObject = canvas?.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject)
      canvas.discardActiveObject()
      canvas.renderAll()
    }
  }, [canvas])

  useEffect(() => {
    if (!canvas || !canvas.wrapperEl) return

    const handleKeyDown = (event) => {
      if (event.key === 'Delete' && document.activeElement === canvas.wrapperEl) {
        handleDeleteKey()
      }
    }

    canvas.wrapperEl.tabIndex = canvas.wrapperEl.tabIndex || 1000
    canvas.wrapperEl.addEventListener('keydown', handleKeyDown)

    return () => {
      canvas.wrapperEl.removeEventListener('keydown', handleKeyDown)
    }
  }, [canvas, handleDeleteKey])

  return {
    isShapeSelected,
    isTextSelected,
    isImageSelected,
    isQRCodeSelected
  }
}

export default useCanvasObjectHandler
