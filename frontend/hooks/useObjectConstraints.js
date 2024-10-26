import { useEffect } from 'react'

const useObjectConstraints = (canvas, zoomLevel) => {
  useEffect(() => {
    if (!canvas) return

    const restrictObjectMovement = (e) => {
      const obj = e.target
      obj.setCoords()

      const boundingRect = obj.getBoundingRect()

      // Ajuster les dimensions du canevas en fonction du zoom passé
      const canvasWidth = canvas.getWidth() / zoomLevel
      const canvasHeight = canvas.getHeight() / zoomLevel

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

      obj.setCoords()
    }

    // Écouter les événements de mouvement et de mise à l'échelle des objets
    canvas.on('object:moving', restrictObjectMovement)
    canvas.on('object:scaling', restrictObjectMovement)

    // Nettoyer les événements lors du démontage du hook
    return () => {
      canvas.off('object:moving', restrictObjectMovement)
      canvas.off('object:scaling', restrictObjectMovement)
    }
  }, [canvas, zoomLevel])
}

export default useObjectConstraints
