// useCanvasObjectUpdater.js
import { useCallback } from 'react'

// useCanvasObjectUpdater.js
const useCanvasObjectUpdater = (canvas, dispatchCanvasAction) => {
  return useCallback(
    (object, properties) => {
      if (!object || !properties || !canvas) return

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

      // État local uniquement
      dispatchCanvasAction({
        type: 'SET_OBJECT_PROPERTIES',
        payload: properties
      })
    },
    [canvas, dispatchCanvasAction]
  )
}

export default useCanvasObjectUpdater
