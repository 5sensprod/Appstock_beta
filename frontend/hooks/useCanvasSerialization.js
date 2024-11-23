import { useCallback, useEffect } from 'react'

const useCanvasSerialization = (canvas, dispatchCanvasAction) => {
  // Effet pour la surveillance des changements de propriétés
  useEffect(() => {
    if (!canvas) return

    console.log('Canvas initialized in serialization hook', canvas)

    const handleObjectAdded = (e) => {
      if (e.target) {
        console.log('Object added to canvas:', e.target)
        saveAndUpdateState()
      }
    }

    const handleTextModified = (e) => {
      if (!e?.target) return

      const target = e.target
      if (target.type === 'i-text' || target.type === 'textbox') {
        console.log('Text object modified:', {
          type: target.type,
          color: target.fill,
          font: target.fontFamily,
          text: target.text
        })

        // Mettre à jour les propriétés globales si nécessaire
        dispatchCanvasAction({
          type: 'SET_OBJECT_PROPERTIES',
          payload: {
            color: target.fill,
            font: target.fontFamily
          }
        })

        saveAndUpdateState()
      }
    }

    const saveAndUpdateState = () => {
      try {
        const serializedState = canvas.toJSON(['id', 'selectable'])

        // Sauvegarder l'état du canvas
        dispatchCanvasAction({
          type: 'SAVE_CANVAS_STATE',
          payload: serializedState
        })

        console.log('Canvas state saved after modification:', serializedState)
      } catch (error) {
        console.error('Error saving canvas state:', error)
      }
    }

    // Ajouter les écouteurs spécifiques au texte
    canvas.on('object:added', handleObjectAdded)
    canvas.on('object:modified', handleTextModified)
    canvas.on('selection:created', handleTextModified)
    canvas.on('selection:updated', handleTextModified)
    canvas.on('text:changed', handleTextModified)

    // Nettoyage
    return () => {
      canvas.off('object:added', handleObjectAdded)
      canvas.off('object:modified', handleTextModified)
      canvas.off('selection:created', handleTextModified)
      canvas.off('selection:updated', handleTextModified)
      canvas.off('text:changed', handleTextModified)
    }
  }, [canvas, dispatchCanvasAction])

  // Fonction pour mettre à jour les propriétés du texte
  const updateTextProperties = useCallback(
    (object, properties) => {
      if (!object || !properties) return

      try {
        const updates = {}

        if (properties.color) {
          updates.fill = properties.color
        }
        if (properties.font) {
          updates.fontFamily = properties.font
        }

        object.set(updates)
        canvas?.renderAll()

        // Dispatch les changements globaux
        dispatchCanvasAction({
          type: 'SET_OBJECT_PROPERTIES',
          payload: properties
        })

        // Sauvegarder l'état
        const serializedState = canvas.toJSON(['id', 'selectable'])
        dispatchCanvasAction({
          type: 'SAVE_CANVAS_STATE',
          payload: serializedState
        })

        console.log('Text properties updated:', updates)
      } catch (error) {
        console.error('Error updating text properties:', error)
      }
    },
    [canvas, dispatchCanvasAction]
  )

  return {
    updateTextProperties
  }
}

export default useCanvasSerialization
