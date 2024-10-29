import { useEffect, useCallback } from 'react'

const useCanvasObjectHandler = (canvas, selectedObject, selectedColor, selectedFont, dispatch) => {
  const updateCanvasObjects = useCallback(() => {
    const objectsData = canvas.getObjects().map((obj, index) => ({
      id: obj.id || `temp-${index}`,
      design: {
        fill: obj.fill,
        fontFamily: obj.fontFamily
      },
      data: {
        content: obj.type === 'i-text' || obj.type === 'textbox' ? obj.text : obj.data
      }
    }))
    dispatch({ type: 'SET_OBJECTS', payload: objectsData })
  }, [canvas, dispatch])

  const updateSelectedObject = useCallback(() => {
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      dispatch({
        type: 'UPDATE_SELECTED_OBJECT',
        payload: {
          object: activeObject,
          color: activeObject.fill,
          font: activeObject.fontFamily
        }
      })
    } else {
      dispatch({ type: 'SET_SELECTED_OBJECT', payload: null })
    }
  }, [canvas, dispatch])

  const addCanvasListeners = useCallback(() => {
    if (!canvas) return

    const listeners = [
      { event: 'object:modified', handler: updateCanvasObjects },
      { event: 'object:added', handler: updateCanvasObjects },
      { event: 'object:removed', handler: updateCanvasObjects },
      { event: 'selection:created', handler: updateSelectedObject },
      { event: 'selection:updated', handler: updateSelectedObject },
      {
        event: 'selection:cleared',
        handler: () => dispatch({ type: 'SET_SELECTED_OBJECT', payload: null })
      }
    ]

    listeners.forEach(({ event, handler }) => canvas.on(event, handler))

    return () => listeners.forEach(({ event, handler }) => canvas.off(event, handler))
  }, [canvas, updateCanvasObjects, updateSelectedObject, dispatch])

  useEffect(addCanvasListeners, [addCanvasListeners])

  useEffect(() => {
    if (selectedObject && 'set' in selectedObject) {
      selectedObject.set({
        fill: selectedColor,
        fontFamily: selectedFont,
        dirty: true
      })
      canvas.requestRenderAll()
      updateCanvasObjects()
    }
  }, [selectedColor, selectedFont, selectedObject, canvas, updateCanvasObjects])
}

export default useCanvasObjectHandler
