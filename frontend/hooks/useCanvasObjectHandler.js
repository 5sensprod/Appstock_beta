// frontend/hooks/useCanvasObjectHandler.js

import { useEffect, useCallback } from 'react'

const useCanvasObjectHandler = (canvas, selectedObject, dispatch) => {
  // Vérifie le type de l'objet sélectionné
  const isShapeSelected = useCallback(
    () => selectedObject?.type === 'circle' || selectedObject?.type === 'rect',
    [selectedObject]
  )

  const isTextSelected = useCallback(
    () => selectedObject?.type === 'i-text' || selectedObject?.type === 'textbox',
    [selectedObject]
  )

  const isImageSelected = useCallback(() => selectedObject?.type === 'image', [selectedObject])

  const isQRCodeSelected = useCallback(() => selectedObject?.isQRCode === true, [selectedObject])

  // Fonction pour mettre à jour l'objet sélectionné
  const updateSelectedObject = useCallback(() => {
    if (!canvas) return

    const activeObject = canvas.getActiveObject()
    dispatch({ type: 'SET_SELECTED_OBJECT', payload: activeObject })

    if (activeObject) {
      // Centraliser les mises à jour
      const updates = {}
      if (activeObject.fill) updates.color = activeObject.fill
      if (activeObject.fontFamily) updates.font = activeObject.fontFamily

      dispatch({ type: 'SET_OBJECT_PROPERTIES', payload: updates })
    }
  }, [canvas, dispatch])

  // Fonction pour synchroniser l'état des objets du canevas
  const updateCanvasObjects = useCallback(() => {
    if (!canvas) return
    const objectsData = canvas.getObjects().map((obj) => obj.toObject())
    dispatch({ type: 'SET_OBJECTS', payload: objectsData })
  }, [canvas, dispatch])

  // Gestion de la sélection effacée
  const handleSelectionCleared = useCallback(() => {
    dispatch({ type: 'SET_SELECTED_OBJECT', payload: null })
  }, [dispatch])

  useEffect(() => {
    if (!canvas) return

    const eventHandlers = {
      'object:modified': updateCanvasObjects,
      'object:added': updateCanvasObjects,
      'object:removed': updateCanvasObjects,
      'selection:created': updateSelectedObject,
      'selection:updated': updateSelectedObject,
      'selection:cleared': handleSelectionCleared
    }

    Object.entries(eventHandlers).forEach(([event, handler]) => canvas.on(event, handler))

    return () => {
      Object.entries(eventHandlers).forEach(([event, handler]) => canvas.off(event, handler))
    }
  }, [canvas, updateCanvasObjects, updateSelectedObject, handleSelectionCleared])

  // Gestion de la suppression via la touche "Delete"

  const handleDeleteKey = useCallback(() => {
    const activeObject = canvas?.getActiveObject()
    if (activeObject) {
      canvas.remove(activeObject)
      canvas.discardActiveObject()
      canvas.renderAll()
      updateCanvasObjects()
    }
  }, [canvas, updateCanvasObjects])

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
