import { useEffect, useCallback } from 'react'

const useCanvasObjectHandler = (
  canvas,
  selectedObject,
  selectedColor,
  selectedFont,
  dispatchCanvasAction
) => {
  const updateCanvasObjects = useCallback(() => {
    const objectsData = canvas.getObjects().map((obj, index) => {
      if (obj.isQRCode) {
        // Gestion spécifique pour les QR codes
        return {
          id: obj.id || `temp-${index}`,
          design: {
            color: obj.fill || selectedColor // Couleur du QR code
          },
          data: {
            qrText: obj.qrText // Texte associé au QR code
          }
        }
      } else {
        // Gestion des autres objets (texte, etc.)
        return {
          id: obj.id || `temp-${index}`,
          design: {
            fill: obj.fill,
            fontFamily: obj.fontFamily
          },
          data: {
            content: obj.type === 'i-text' || obj.type === 'textbox' ? obj.text : obj.data
          }
        }
      }
    })
    dispatchCanvasAction({ type: 'SET_OBJECTS', payload: objectsData })
  }, [canvas, dispatchCanvasAction, selectedColor])

  // Mise à jour de l'objet sélectionné
  const updateSelectedObject = useCallback(() => {
    const activeObject = canvas.getActiveObject()
    if (activeObject) {
      dispatchCanvasAction({
        type: 'UPDATE_SELECTED_OBJECT',
        payload: {
          object: activeObject,
          color: activeObject.fill,
          font: activeObject.fontFamily,
          qrText: activeObject.isQRCode ? activeObject.qrText : undefined // QR code spécifique
        }
      })
    } else {
      dispatchCanvasAction({ type: 'SET_SELECTED_OBJECT', payload: null })
    }
  }, [canvas, dispatchCanvasAction])

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
        handler: () => dispatchCanvasAction({ type: 'SET_SELECTED_OBJECT', payload: null })
      }
    ]

    listeners.forEach(({ event, handler }) => canvas.on(event, handler))

    return () => listeners.forEach(({ event, handler }) => canvas.off(event, handler))
  }, [canvas, updateCanvasObjects, updateSelectedObject, dispatchCanvasAction])

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
