import { useEffect } from 'react'

const useCanvasObjectHandler = (canvas, selectedObject, selectedColor, selectedFont, dispatch) => {
  useEffect(() => {
    if (!canvas) return

    const updateSelectedObject = () => {
      const activeObject = canvas.getActiveObject()
      dispatch({ type: 'SET_SELECTED_OBJECT', payload: activeObject })

      if (activeObject && activeObject.fill) {
        dispatch({ type: 'SET_COLOR', payload: activeObject.fill })
      }
      if (activeObject && activeObject.fontFamily) {
        dispatch({ type: 'SET_FONT', payload: activeObject.fontFamily })
      }
    }

    canvas.on('selection:created', updateSelectedObject)
    canvas.on('selection:updated', updateSelectedObject)
    canvas.on('selection:cleared', () => {
      dispatch({ type: 'SET_SELECTED_OBJECT', payload: null })
    })

    return () => {
      canvas.off('selection:created', updateSelectedObject)
      canvas.off('selection:updated', updateSelectedObject)
      canvas.off('selection:cleared')
    }
  }, [canvas, dispatch])

  useEffect(() => {
    if (selectedObject && 'set' in selectedObject) {
      selectedObject.set('fill', selectedColor)
      canvas.renderAll()
    }
  }, [selectedColor, selectedObject, canvas])

  useEffect(() => {
    if (
      selectedObject &&
      'set' in selectedObject &&
      (selectedObject.type === 'i-text' || selectedObject.type === 'textbox')
    ) {
      // Stocker les valeurs originales importantes
      const originalText = selectedObject.text
      const originalLeft = selectedObject.left
      const originalTop = selectedObject.top
      const originalFontSize = selectedObject.fontSize
      const originalScaleX = selectedObject.scaleX
      const originalScaleY = selectedObject.scaleY

      // Réinitialiser temporairement les échelles
      selectedObject.set({
        scaleX: 1,
        scaleY: 1
      })

      // Mettre à jour la police
      selectedObject.set({
        fontFamily: selectedFont,
        dirty: true
      })

      // Forcer une réinitialisation complète
      selectedObject.set({
        text: originalText,
        left: originalLeft,
        top: originalTop,
        fontSize: originalFontSize,
        scaleX: originalScaleX,
        scaleY: originalScaleY
      })

      // Forcer la mise à jour des dimensions
      selectedObject.set('dirty', true)
      selectedObject.initDimensions()
      selectedObject.setCoords()

      // Si le texte est en mode édition, le rafraîchir
      if (selectedObject.isEditing) {
        const isEditing = selectedObject.isEditing
        if (isEditing) {
          selectedObject.exitEditing()
          selectedObject.enterEditing()
        }
      }

      // Force un recalcul complet du canvas
      canvas.calcOffset()
      canvas.requestRenderAll()
    }
  }, [selectedFont, selectedObject, canvas])
}

export default useCanvasObjectHandler
