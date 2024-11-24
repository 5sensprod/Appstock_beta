import { useCallback, useEffect } from 'react'

const useCanvasSerialization = (canvas, dispatchCanvasAction) => {
  // Fonction utilitaire pour gérer les erreurs
  const safelyExecute = useCallback((fn, context) => {
    try {
      fn()
    } catch (error) {
      console.error('Error in:', context, error)
    }
  }, [])

  // Sauvegarder l'état du canvas
  const saveAndUpdateState = useCallback(() => {
    if (!canvas) return

    safelyExecute(() => {
      const serializedState = canvas.toJSON(['id', 'selectable', 'scaleX', 'scaleY'])
      dispatchCanvasAction({
        type: 'SAVE_CANVAS_STATE',
        payload: serializedState
      })
      console.log('Canvas state saved:', serializedState)
    }, 'saveAndUpdateState')
  }, [canvas, dispatchCanvasAction, safelyExecute])

  // Gestionnaire d'événements pour le canvas
  const handleCanvasEvent = useCallback(
    (e) => {
      if (!e?.target) return

      const target = e.target
      console.log('Event triggered:', e.e?.type || 'non-native-event', {
        type: target.type,
        scaleX: target.scaleX,
        scaleY: target.scaleY
      })

      saveAndUpdateState()
    },
    [saveAndUpdateState]
  )

  // Ajout d'écouteurs d'événements
  useEffect(() => {
    if (!canvas) return

    console.log('Canvas initialized in serialization hook:', canvas)

    const events = ['object:added', 'object:modified', 'object:scaled', '']

    // Enregistrement des événements
    events.forEach((event) => canvas.on(event, handleCanvasEvent))

    // Nettoyage des événements
    return () => {
      events.forEach((event) => canvas.off(event, handleCanvasEvent))
    }
  }, [canvas, handleCanvasEvent])

  // Mise à jour des propriétés d'un objet
  const updateObjectProperties = useCallback(
    (object, properties) => {
      if (!object || !properties || !canvas) return

      safelyExecute(() => {
        const updates = {
          ...(properties.color && { fill: properties.color }),
          ...(properties.font &&
            ['i-text', 'textbox'].includes(object.type) && {
              fontFamily: properties.font
            })
        }

        console.log('Updating object properties:', { object, properties, updates })
        object.set(updates)
        object.setCoords()
        canvas.renderAll()

        dispatchCanvasAction({
          type: 'SET_OBJECT_PROPERTIES',
          payload: properties
        })

        saveAndUpdateState()
      }, 'updateObjectProperties')
    },
    [canvas, dispatchCanvasAction, saveAndUpdateState, safelyExecute]
  )

  return { updateObjectProperties }
}

export default useCanvasSerialization
