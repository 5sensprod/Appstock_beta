// useCanvasObjectUpdater.js
import { useCallback } from 'react'

const useCanvasObjectUpdater = (canvas, dispatchCanvasAction) => {
  return useCallback(
    (object, properties) => {
      if (!object || !properties || !canvas) return

      try {
        const updates = {
          ...(properties.color && { fill: properties.color }),
          ...(properties.font &&
            ['i-text', 'textbox'].includes(object.type) && {
              fontFamily: properties.font
            })
        }

        object.set(updates)
        object.setCoords()
        canvas.renderAll()

        dispatchCanvasAction({
          type: 'SET_OBJECT_PROPERTIES',
          payload: properties
        })
      } catch (error) {
        console.error('Erreur mise à jour propriétés:', error)
      }
    },
    [canvas, dispatchCanvasAction]
  )
}

export default useCanvasObjectUpdater
