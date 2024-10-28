import { useEffect, useCallback } from 'react'

const useCanvasObjectHandler = (canvas, selectedObject, selectedColor, selectedFont, dispatch) => {
  const updateCanvasObjects = useCallback(() => {
    const objectsData = canvas.getObjects().map((obj, index) => ({
      id: obj.id || `temp-${index}`,
      design: {
        fill: obj.fill,
        fontFamily: obj.fontFamily
        // Ajoutez ici d'autres propriétés de design si nécessaire
      },
      data: {
        content: obj.type === 'i-text' || obj.type === 'textbox' ? obj.text : obj.data
      }
    }))

    dispatch({ type: 'SET_OBJECTS', payload: objectsData })
  }, [canvas, dispatch])

  const updateSelectedObject = useCallback(() => {
    const activeObject = canvas.getActiveObject()
    dispatch({ type: 'SET_SELECTED_OBJECT', payload: activeObject })

    if (activeObject) {
      dispatch({ type: 'SET_COLOR', payload: activeObject.fill })
      dispatch({ type: 'SET_FONT', payload: activeObject.fontFamily })
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
      selectedObject.set('fill', selectedColor)
      canvas.requestRenderAll()
      updateCanvasObjects()
    }
  }, [selectedColor, selectedObject, canvas, updateCanvasObjects])

  useEffect(() => {
    if (
      selectedObject &&
      'set' in selectedObject &&
      (selectedObject.type === 'i-text' || selectedObject.type === 'textbox')
    ) {
      selectedObject.set({ fontFamily: selectedFont, dirty: true })
      canvas.requestRenderAll()
      updateCanvasObjects()
    }
  }, [selectedFont, selectedObject, canvas, updateCanvasObjects])
}

export default useCanvasObjectHandler
