/**
 * Hook personnalisé pour gérer le zoom du canevas.
 * Ce hook ajuste la taille du canevas et des objets en fonction du niveau de zoom
 * sélectionné par l'utilisateur.
 *
 * @param {fabric.Canvas} canvas - Instance de Fabric.js du canevas
 * @param {number} zoomLevel - Niveau de zoom actuel
 * @param {Function} setZoomLevel - Fonction pour mettre à jour le niveau de zoom
 * @param {Object} labelConfig - Configuration actuelle des dimensions du canevas
 */

import { useCallback } from 'react'

const useCanvasZoom = (canvas, zoomLevel, setZoomLevel, labelConfig) => {
  const mmToPx = (mm) => (mm / 25.4) * 72
  const handleZoomChange = useCallback(
    (e) => {
      const newZoom = parseFloat(e.target.value)
      const scaleFactor = newZoom / zoomLevel
      setZoomLevel(newZoom)

      if (canvas) {
        // Ajuster la taille du canevas
        const newWidth = mmToPx(labelConfig.labelWidth) * newZoom
        const newHeight = mmToPx(labelConfig.labelHeight) * newZoom
        canvas.setWidth(newWidth)
        canvas.setHeight(newHeight)

        // Mettre à l'échelle tous les objets présents sur le canevas
        canvas.getObjects().forEach((obj) => {
          obj.scaleX = obj.scaleX * scaleFactor
          obj.scaleY = obj.scaleY * scaleFactor
          obj.left = obj.left * scaleFactor
          obj.top = obj.top * scaleFactor
          obj.setCoords() // Mettre à jour les coordonnées après redimensionnement
        })

        canvas.renderAll() // Redessiner le canevas avec les nouvelles dimensions
      }
    },
    [canvas, zoomLevel, setZoomLevel, labelConfig]
  )

  return handleZoomChange
}

export default useCanvasZoom
