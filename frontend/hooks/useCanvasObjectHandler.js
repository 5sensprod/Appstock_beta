import { useEffect } from 'react'

const useCanvasObjectHandler = (canvas, selectedObject, selectedColor, selectedFont, dispatch) => {
  useEffect(() => {
    if (!canvas) return

    const updateSelectedObject = () => {
      const activeObject = canvas.getActiveObject()
      dispatch({ type: 'SET_SELECTED_OBJECT', payload: activeObject })

      if (activeObject && activeObject.fill) {
        dispatch({ type: 'SET_COLOR', payload: activeObject.fill })
      }
      if (activeObject && activeObject.fontFamily) {
        dispatch({ type: 'SET_FONT', payload: activeObject.fontFamily })
      }
    }

    // Fonction pour sauvegarder l'état complet des objets sur le canevas
    const updateCanvasObjects = () => {
      const objectsData = canvas.getObjects().map((obj) => obj.toObject())
      dispatch({ type: 'SET_OBJECTS', payload: objectsData }) // Met à jour l'état `objects` dans le reducer
    }

    // Écoute les événements pour synchroniser l'état des objets
    canvas.on('object:modified', updateCanvasObjects)
    canvas.on('object:added', updateCanvasObjects)
    canvas.on('object:removed', updateCanvasObjects)

    // Gestion des événements de sélection
    canvas.on('selection:created', updateSelectedObject)
    canvas.on('selection:updated', updateSelectedObject)
    canvas.on('selection:cleared', () => {
      dispatch({ type: 'SET_SELECTED_OBJECT', payload: null })
    })

    return () => {
      // Nettoyage des écouteurs d'événements
      canvas.off('object:modified', updateCanvasObjects)
      canvas.off('object:added', updateCanvasObjects)
      canvas.off('object:removed', updateCanvasObjects)
      canvas.off('selection:created', updateSelectedObject)
      canvas.off('selection:updated', updateSelectedObject)
      canvas.off('selection:cleared')
    }
  }, [canvas, dispatch])

  useEffect(() => {
    if (selectedObject && 'set' in selectedObject) {
      selectedObject.set('fill', selectedColor)
      canvas.requestRenderAll()

      // Met à jour l'état des objets après modification de couleur
      const objectsData = canvas.getObjects().map((obj) => obj.toObject())
      dispatch({ type: 'SET_OBJECTS', payload: objectsData })
    }
  }, [selectedColor, selectedObject, canvas, dispatch])

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

      // Met à jour l'état des objets après modification de la police
      const objectsData = canvas.getObjects().map((obj) => obj.toObject())
      dispatch({ type: 'SET_OBJECTS', payload: objectsData })
    }
  }, [selectedFont, selectedObject, canvas, dispatch])
}

export default useCanvasObjectHandler
