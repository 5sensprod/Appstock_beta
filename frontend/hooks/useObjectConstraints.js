// frontend/hooks/useObjectConstraints.js
import { useEffect } from 'react'

const useObjectConstraints = (canvas) => {
  useEffect(() => {
    if (!canvas) return

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

    // Écouter les événements de mouvement et de mise à l'échelle des objets
    canvas.on('object:moving', restrictObjectMovement)
    canvas.on('object:scaling', restrictObjectMovement)

    // Nettoyer les événements lors du démontage du hook
    return () => {
      canvas.off('object:moving', restrictObjectMovement)
      canvas.off('object:scaling', restrictObjectMovement)
    }
  }, [canvas])
}

export default useObjectConstraints
