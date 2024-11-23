import { useCallback } from 'react'

const useCanvasSerialization = (canvas, dispatchCanvasAction) => {
  const saveCanvasState = useCallback(() => {
    if (!canvas) {
      console.error('Canvas is not initialized.')
      return null
    }

    const serializedState = canvas.toJSON()
    dispatchCanvasAction?.({
      type: 'SAVE_CANVAS_STATE',
      payload: serializedState
    })

    return serializedState
  }, [canvas, dispatchCanvasAction])

  const loadCanvasState = useCallback(
    (serializedState) => {
      if (!canvas) {
        console.error('Canvas is not initialized.')
        return
      }

      canvas.loadFromJSON(serializedState, () => {
        canvas.renderAll()
        dispatchCanvasAction?.({ type: 'SET_CANVAS_LOADED' })
      })
    },
    [canvas, dispatchCanvasAction]
  )

  return { saveCanvasState, loadCanvasState }
}

export default useCanvasSerialization
