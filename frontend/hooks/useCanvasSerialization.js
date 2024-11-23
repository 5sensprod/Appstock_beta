import { useCallback, useEffect } from 'react'

const useCanvasSerialization = (canvas, dispatchCanvasAction) => {
  // Fonction pour sauvegarder l'état du canvas
  const saveAndUpdateState = useCallback(() => {
    if (!canvas) return
    try {
      const serializedState = canvas.toJSON(['id', 'selectable', 'scaleX', 'scaleY'])

      // Sauvegarder l'état du canvas
      dispatchCanvasAction({
        type: 'SAVE_CANVAS_STATE',
        payload: serializedState
      })

      console.log('Canvas state saved after modification:', serializedState)
    } catch (error) {
      console.error('Error saving canvas state:', error)
    }
  }, [canvas, dispatchCanvasAction])

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

    const handleObjectModified = (e) => {
      if (!e?.target) return

      const target = e.target
      console.log('Object modified:', {
        type: target.type,
        scaleX: target.scaleX,
        scaleY: target.scaleY
      })

      // Sauvegarde après modification
      saveAndUpdateState()
    }

    const handleObjectScaled = (e) => {
      if (!e?.target) return

      const target = e.target
      console.log('Object scaled:', {
        type: target.type,
        scaleX: target.scaleX,
        scaleY: target.scaleY
      })

      // Sauvegarde après redimensionnement
      saveAndUpdateState()
    }

    // Ajouter les écouteurs pour les événements pertinents
    canvas.on('object:added', handleObjectAdded)
    canvas.on('object:modified', handleObjectModified)
    canvas.on('object:scaled', handleObjectScaled)

    // Nettoyage
    return () => {
      canvas.off('object:added', handleObjectAdded)
      canvas.off('object:modified', handleObjectModified)
      canvas.off('object:scaled', handleObjectScaled)
    }
  }, [canvas, dispatchCanvasAction, saveAndUpdateState])

  // Fonction pour mettre à jour les propriétés des objets
  const updateObjectProperties = useCallback(
    (object, properties) => {
      if (!object || !properties) return

      try {
        const updates = {}

        // Appliquer les modifications de couleur pour tous les types d'objets
        if (properties.color) {
          updates.fill = properties.color
        }

        // Appliquer des modifications spécifiques aux types de texte
        if (object.type === 'i-text' || object.type === 'textbox') {
          if (properties.font) {
            updates.fontFamily = properties.font
          }
        }

        object.set(updates)
        object.setCoords() // Met à jour les coordonnées après modification
        canvas?.renderAll()

        // Dispatch les changements globaux
        dispatchCanvasAction({
          type: 'SET_OBJECT_PROPERTIES',
          payload: properties
        })

        // Sauvegarder l'état après mise à jour
        saveAndUpdateState()
      } catch (error) {
        console.error('Error updating object properties:', error)
      }
    },
    [canvas, dispatchCanvasAction, saveAndUpdateState]
  )

  return {
    updateObjectProperties
  }
}

export default useCanvasSerialization
