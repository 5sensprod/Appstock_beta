import { useCallback, useEffect } from 'react'

const useCanvasSerialization = (canvas, dispatchCanvasAction) => {
  const saveCanvasState = useCallback(() => {
    if (!canvas) return

    try {
      const serializedState = canvas.toJSON([
        'id',
        'selectable',
        'scaleX',
        'scaleY',
        'isQRCode',
        'qrText'
      ])

      dispatchCanvasAction({
        type: 'SAVE_CANVAS_STATE',
        payload: serializedState
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }, [canvas, dispatchCanvasAction])

  const handleCanvasEvent = useCallback(
    (event) => {
      const target = event?.target
      if (!target) return

      // Log uniquement en développement
      if (process.env.NODE_ENV === 'development') {
        console.log('Événement canvas:', {
          type: event.e?.type || 'événement-custom',
          properties: {
            type: target.type,
            scaleX: target.scaleX,
            scaleY: target.scaleY,
            isQRCode: target.isQRCode,
            qrText: target.qrText
          }
        })
      }

      saveCanvasState()
    },
    [saveCanvasState]
  )

  useEffect(() => {
    if (!canvas) return

    const events = ['object:added', 'object:modified', 'object:scaled']
    events.forEach((event) => canvas.on(event, handleCanvasEvent))

    return () => events.forEach((event) => canvas.off(event, handleCanvasEvent))
  }, [canvas, handleCanvasEvent])

  const updateObjectProperties = useCallback(
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

        saveCanvasState()
      } catch (error) {
        console.error('Erreur lors de la mise à jour:', error)
      }
    },
    [canvas, dispatchCanvasAction, saveCanvasState]
  )

  return { updateObjectProperties }
}

export default useCanvasSerialization
