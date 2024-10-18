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

const useCanvasZoom = (canvas, zoomLevel, setZoomLevel) => {
  const handleZoomChange = useCallback(
    (newZoom) => {
      if (canvas) {
        // Dimensions initiales du canevas pour calculer la taille lors du zoom
        const initialWidth = canvas.originalWidth || canvas.getWidth() // Stocker la largeur initiale
        const initialHeight = canvas.originalHeight || canvas.getHeight() // Stocker la hauteur initiale

        // Si c'est la première fois, sauvegarder les dimensions initiales
        if (!canvas.originalWidth) canvas.originalWidth = initialWidth
        if (!canvas.originalHeight) canvas.originalHeight = initialHeight

        // Appliquer le zoom aux objets dans le canevas
        canvas.setZoom(newZoom)

        // Ajuster la taille du canevas HTML en fonction du niveau de zoom
        const newWidth = initialWidth * newZoom
        const newHeight = initialHeight * newZoom
        canvas.setWidth(newWidth)
        canvas.setHeight(newHeight)

        // Mettre à jour le niveau de zoom
        setZoomLevel(newZoom)

        // Redessiner le canevas
        canvas.renderAll()
      }
    },
    [canvas, setZoomLevel]
  )

  return handleZoomChange
}

export default useCanvasZoom
