import { useCallback, useEffect } from 'react'

const useCanvasSerialization = (canvas, dispatchCanvasAction) => {
  // Effet pour configurer les écouteurs d'événements du canvas
  useEffect(() => {
    if (!canvas) return

    console.log('Canvas initialized in serialization hook', canvas)

    const handleObjectAdded = (e) => {
      console.log('Object added to canvas:', e.target)
      const state = canvas.toJSON()
      console.log('New canvas state after object added:', state)
    }

    const handleObjectModified = (e) => {
      console.log('Object modified on canvas:', e.target)
      const state = canvas.toJSON()
      console.log('New canvas state after modification:', state)
    }

    const handleObjectRemoved = (e) => {
      console.log('Object removed from canvas:', e.target)
      const state = canvas.toJSON()
      console.log('New canvas state after removal:', state)
    }

    // Ajouter les écouteurs d'événements
    canvas.on('object:added', handleObjectAdded)
    canvas.on('object:modified', handleObjectModified)
    canvas.on('object:removed', handleObjectRemoved)

    // Nettoyage des écouteurs lors du démontage
    return () => {
      canvas.off('object:added', handleObjectAdded)
      canvas.off('object:modified', handleObjectModified)
      canvas.off('object:removed', handleObjectRemoved)
    }
  }, [canvas])

  const saveCanvasState = useCallback(() => {
    if (!canvas) {
      console.error('Canvas is not initialized.')
      return null
    }

    try {
      console.log('Saving canvas state...')
      console.log('Current objects on canvas:', canvas.getObjects())
      const serializedState = canvas.toJSON()
      console.log('Serialized state:', serializedState)

      if (dispatchCanvasAction) {
        dispatchCanvasAction({
          type: 'SAVE_CANVAS_STATE',
          payload: serializedState
        })
        console.log('State dispatched to reducer')
      }

      return serializedState
    } catch (error) {
      console.error('Error in saveCanvasState:', error)
      return null
    }
  }, [canvas, dispatchCanvasAction])

  const loadCanvasState = useCallback(
    (serializedState) => {
      if (!canvas || !serializedState) {
        console.error('Canvas or state missing:', { canvas: !!canvas, state: !!serializedState })
        return
      }

      try {
        console.log('Loading state:', serializedState)
        canvas.loadFromJSON(serializedState, () => {
          console.log('State loaded successfully')
          console.log('Current objects:', canvas.getObjects())
          canvas.renderAll()
          dispatchCanvasAction?.({ type: 'SET_CANVAS_LOADED' })
        })
      } catch (error) {
        console.error('Error in loadCanvasState:', error)
      }
    },
    [canvas, dispatchCanvasAction]
  )

  // Fonction utilitaire pour vérifier l'état actuel
  const logCurrentState = useCallback(() => {
    if (!canvas) {
      console.log('Canvas not available')
      return
    }
    console.log('Current canvas objects:', canvas.getObjects())
    console.log('Current canvas state:', canvas.toJSON())
  }, [canvas])

  return {
    saveCanvasState,
    loadCanvasState,
    logCurrentState
  }
}

export default useCanvasSerialization
