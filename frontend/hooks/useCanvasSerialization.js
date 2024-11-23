import { useCallback, useEffect } from 'react'

const useCanvasSerialization = (canvas, dispatchCanvasAction) => {
  // Fonction pour sauvegarder l'état du canvas - simplifiée avec early return
  const saveAndUpdateState = useCallback(() => {
    if (!canvas) return

    try {
      const serializedState = canvas.toJSON(['id', 'selectable', 'scaleX', 'scaleY'])
      dispatchCanvasAction({
        type: 'SAVE_CANVAS_STATE',
        payload: serializedState
      })
      console.log('Canvas state saved:', serializedState)
    } catch (error) {
      console.error('Error saving canvas state:', error)
    }
  }, [canvas, dispatchCanvasAction])

  // Gestionnaire d'événements unifié
  const handleCanvasEvent = useCallback(
    (e) => {
      if (!e?.target) return

      const target = e.target
      const eventDetails = {
        type: target.type,
        scaleX: target.scaleX,
        scaleY: target.scaleY
      }

      // Vérification sécurisée pour éviter "undefined"
      const nativeEventType = e.e?.type || 'non-native-event'

      console.log(`Event triggered: ${nativeEventType}, Details:`, eventDetails)
      saveAndUpdateState()
    },
    [saveAndUpdateState]
  )

  // Effet pour la surveillance des changements
  useEffect(() => {
    if (!canvas) return

    console.log('Canvas initialized in serialization hook:', canvas)

    // Configuration des événements
    const events = ['object:added', 'object:modified', 'object:scaled']

    // Ajout des écouteurs
    events.forEach((event) => canvas.on(event, handleCanvasEvent))

    // Nettoyage
    return () => events.forEach((event) => canvas.off(event, handleCanvasEvent))
  }, [canvas, handleCanvasEvent])

  // Fonction pour mettre à jour les propriétés des objets - simplifiée
  const updateObjectProperties = useCallback(
    (object, properties) => {
      if (!object || !properties || !canvas) return

      const updates = {
        ...(properties.color && { fill: properties.color }),
        ...(properties.font &&
          ['i-text', 'textbox'].includes(object.type) && {
            fontFamily: properties.font
          })
      }

      try {
        console.log('Updating object properties:', { object, properties, updates })
        object.set(updates)
        object.setCoords()
        canvas.renderAll()

        dispatchCanvasAction({
          type: 'SET_OBJECT_PROPERTIES',
          payload: properties
        })

        saveAndUpdateState()
      } catch (error) {
        console.error('Error updating object properties:', error)
      }
    },
    [canvas, dispatchCanvasAction, saveAndUpdateState]
  )

  return { updateObjectProperties }
}

export default useCanvasSerialization
