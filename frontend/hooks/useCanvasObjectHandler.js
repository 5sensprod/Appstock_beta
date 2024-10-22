import { useEffect } from 'react'

const useCanvasObjectHandler = (
  canvas,
  selectedObject,
  selectedColor,
  setSelectedObject,
  setSelectedColor
) => {
  useEffect(() => {
    if (!canvas) return

    const updateSelectedObject = () => {
      const activeObject = canvas.getActiveObject()
      setSelectedObject(activeObject)
      if (activeObject && activeObject.fill) {
        setSelectedColor(activeObject.fill)
      }
    }

    // Écouter les événements de sélection
    canvas.on('selection:created', updateSelectedObject)
    canvas.on('selection:updated', updateSelectedObject)
    canvas.on('selection:cleared', () => {
      setSelectedObject(null)
    })

    // Nettoyer les événements lors du démontage
    return () => {
      canvas.off('selection:created', updateSelectedObject)
      canvas.off('selection:updated', updateSelectedObject)
      canvas.off('selection:cleared')
    }
  }, [canvas, setSelectedObject, setSelectedColor])

  // Appliquer la couleur sélectionnée à l'objet sélectionné
  useEffect(() => {
    if (selectedObject && 'set' in selectedObject) {
      selectedObject.set('fill', selectedColor)
      canvas.renderAll()
    }
  }, [selectedColor, selectedObject, canvas])
}

export default useCanvasObjectHandler
