// frontend/hooks/useCanvasEvents.js
import { useEffect } from 'react'

const useCanvasEvents = (canvas, setSelectedObject, setSelectedColor) => {
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
      setSelectedColor('#000000') // Remettre à la couleur par défaut
    })

    // Nettoyer les événements lors du démontage
    return () => {
      canvas.off('selection:created', updateSelectedObject)
      canvas.off('selection:updated', updateSelectedObject)
      canvas.off('selection:cleared')
    }
  }, [canvas, setSelectedObject, setSelectedColor])
}

export default useCanvasEvents
