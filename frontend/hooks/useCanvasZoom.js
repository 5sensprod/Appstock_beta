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

        // Appliquer les transformations de vue au canevas (pour réagir au zoom)
        const vpt = canvas.viewportTransform
        vpt[4] = (canvas.getWidth() - newWidth) / 2 // Centrer horizontalement
        vpt[5] = (canvas.getHeight() - newHeight) / 2 // Centrer verticalement
        canvas.setViewportTransform(vpt)

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
