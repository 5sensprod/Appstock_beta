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

    const restrictObjectMovement = (e) => {
      const obj = e.target
      obj.setCoords()

      const zoom = canvas.getZoom() // Récupérer le niveau de zoom actuel
      const boundingRect = obj.getBoundingRect()

      // Ajuster les dimensions du canevas en fonction du zoom
      const canvasWidth = canvas.getWidth() / zoom
      const canvasHeight = canvas.getHeight() / zoom

      // Limiter le mouvement sur l'axe X
      if (boundingRect.left < 0) {
        obj.left -= boundingRect.left
      }
      if (boundingRect.left + boundingRect.width > canvasWidth) {
        obj.left -= boundingRect.left + boundingRect.width - canvasWidth
      }

      // Limiter le mouvement sur l'axe Y
      if (boundingRect.top < 0) {
        obj.top -= boundingRect.top
      }
      if (boundingRect.top + boundingRect.height > canvasHeight) {
        obj.top -= boundingRect.top + boundingRect.height - canvasHeight
      }

      obj.setCoords() // Recalculer les coordonnées après modification
    }

    // Écouter les événements de sélection et de mouvement
    canvas.on('selection:created', updateSelectedObject)
    canvas.on('selection:updated', updateSelectedObject)
    canvas.on('selection:cleared', () => {
      setSelectedObject(null)
      setSelectedColor('#000000') // Remettre à la couleur par défaut
    })

    canvas.on('object:moving', restrictObjectMovement)
    canvas.on('object:scaling', restrictObjectMovement)

    // Nettoyer les événements lors du démontage
    return () => {
      canvas.off('selection:created', updateSelectedObject)
      canvas.off('selection:updated', updateSelectedObject)
      canvas.off('selection:cleared')
      canvas.off('object:moving', restrictObjectMovement)
      canvas.off('object:scaling', restrictObjectMovement)
    }
  }, [canvas, setSelectedObject, setSelectedColor])
}

export default useCanvasEvents
