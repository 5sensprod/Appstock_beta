import { useEffect, useCallback } from 'react'

const useCanvasObjectHandler = (canvas, selectedObject, selectedColor, selectedFont, dispatch) => {
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

  useEffect(() => {
    if (!canvas) return

    // Fonction pour mettre à jour l'objet sélectionné
    const updateSelectedObject = () => {
      const activeObject = canvas.getActiveObject()
      dispatch({ type: 'SET_SELECTED_OBJECT', payload: activeObject })

      // Met à jour la couleur et la police si disponibles
      if (activeObject) {
        if (activeObject.fill) {
          dispatch({ type: 'SET_COLOR', payload: activeObject.fill })
        }
        if (activeObject.fontFamily) {
          dispatch({ type: 'SET_FONT', payload: activeObject.fontFamily })
        }
      }
    }

    // Fonction pour synchroniser l'état des objets du canevas
    const updateCanvasObjects = () => {
      const objectsData = canvas.getObjects().map((obj) => obj.toObject())
      dispatch({ type: 'SET_OBJECTS', payload: objectsData }) // Met à jour l'état global des objets
    }

    // Ajout des écouteurs d'événements
    canvas.on('object:modified', updateCanvasObjects)
    canvas.on('object:added', updateCanvasObjects)
    canvas.on('object:removed', updateCanvasObjects)
    canvas.on('selection:created', updateSelectedObject)
    canvas.on('selection:updated', updateSelectedObject)
    canvas.on('selection:cleared', () => {
      dispatch({ type: 'SET_SELECTED_OBJECT', payload: null }) // Efface l'objet sélectionné
    })

    // Nettoyage des écouteurs d'événements lors du démontage
    return () => {
      canvas.off('object:modified', updateCanvasObjects)
      canvas.off('object:added', updateCanvasObjects)
      canvas.off('object:removed', updateCanvasObjects)
      canvas.off('selection:created', updateSelectedObject)
      canvas.off('selection:updated', updateSelectedObject)
      canvas.off('selection:cleared')
    }
  }, [canvas, dispatch])

  // Synchronisation de la couleur de l'objet sélectionné avec l'état global
  useEffect(() => {
    if (selectedObject && 'set' in selectedObject) {
      selectedObject.set('fill', selectedColor)
      canvas.requestRenderAll()

      // Met à jour les données des objets après modification
      const objectsData = canvas.getObjects().map((obj) => obj.toObject())
      dispatch({ type: 'SET_OBJECTS', payload: objectsData })
    }
  }, [selectedColor, selectedObject, canvas, dispatch])

  // Synchronisation de la police de l'objet sélectionné avec l'état global
  useEffect(() => {
    if (
      selectedObject &&
      'set' in selectedObject &&
      (selectedObject.type === 'i-text' || selectedObject.type === 'textbox')
    ) {
      selectedObject.set({
        fontFamily: selectedFont,
        dirty: true
      })

      canvas.requestRenderAll()

      // Met à jour les données des objets après modification
      const objectsData = canvas.getObjects().map((obj) => obj.toObject())
      dispatch({ type: 'SET_OBJECTS', payload: objectsData })
    }
  }, [selectedFont, selectedObject, canvas, dispatch])

  // Gestion de la suppression via la touche "Delete"
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Delete') {
        const activeObject = canvas.getActiveObject()
        if (activeObject) {
          canvas.remove(activeObject)
          canvas.discardActiveObject()
          canvas.renderAll()

          // Met à jour les données des objets après suppression
          const objectsData = canvas.getObjects().map((obj) => obj.toObject())
          dispatch({ type: 'SET_OBJECTS', payload: objectsData })
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [canvas, dispatch])

  return {
    isShapeSelected,
    isTextSelected,
    isImageSelected,
    isQRCodeSelected
  }
}

export default useCanvasObjectHandler
