import { useCallback } from 'react'
import { mmToPx } from '../utils/conversionUtils'

const useCanvasTransform = (canvas, labelConfig, setLabelConfig, zoomLevel, setZoomLevel) => {
  // Fonction pour mettre à jour la taille du canevas
  const updateCanvasSize = useCallback(
    (newSize) => {
      if (canvas) {
        const newWidthPx = mmToPx(newSize.labelWidth || labelConfig.labelWidth)
        const newHeightPx = mmToPx(newSize.labelHeight || labelConfig.labelHeight)

        // Mettre à jour la configuration du label
        setLabelConfig((prevConfig) => ({
          ...prevConfig,
          ...newSize
        }))

        // Réinitialiser le niveau de zoom à 1
        canvas.setZoom(1)
        setZoomLevel(1)

        // Réinitialiser la taille du canevas
        canvas.setWidth(newWidthPx)
        canvas.setHeight(newHeightPx)

        // Remettre les objets à leur position et échelle d'origine
        canvas.getObjects().forEach((obj) => {
          obj.scaleX = obj.originalScaleX || obj.scaleX
          obj.scaleY = obj.originalScaleY || obj.scaleY
          obj.left = obj.originalLeft || obj.left
          obj.top = obj.originalTop || obj.top
          obj.setCoords()
        })

        canvas.renderAll()
      }
    },
    [canvas, labelConfig, setLabelConfig, setZoomLevel]
  )

  // Fonction pour gérer les changements de zoom
  const handleZoomChange = useCallback(
    (newZoom) => {
      if (canvas) {
        const initialWidth = canvas.originalWidth || canvas.getWidth()
        const initialHeight = canvas.originalHeight || canvas.getHeight()

        if (!canvas.originalWidth) canvas.originalWidth = initialWidth
        if (!canvas.originalHeight) canvas.originalHeight = initialHeight

        // Appliquer le zoom aux objets du canevas
        canvas.setZoom(newZoom)

        const newWidth = initialWidth * newZoom
        const newHeight = initialHeight * newZoom
        canvas.setWidth(newWidth)
        canvas.setHeight(newHeight)

        // Appliquer la transformation de la vue pour centrer
        const vpt = canvas.viewportTransform
        vpt[4] = (canvas.getWidth() - newWidth) / 2
        vpt[5] = (canvas.getHeight() - newHeight) / 2
        canvas.setViewportTransform(vpt)

        // Mettre à jour le niveau de zoom
        setZoomLevel(newZoom)

        canvas.renderAll()
      }
    },
    [canvas, setZoomLevel]
  )

  return { updateCanvasSize, handleZoomChange }
}

export default useCanvasTransform
