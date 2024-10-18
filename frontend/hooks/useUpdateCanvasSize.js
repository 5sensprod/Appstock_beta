/**
 * Hook personnalisé pour gérer la mise à jour des dimensions du canevas.
 * Ce hook permet de redimensionner le canevas et de réajuster les objets avec animation,
 * tout en mettant à jour la configuration des étiquettes (labelConfig).
 *
 * @param {fabric.Canvas} canvas - Instance de Fabric.js du canevas
 * @param {Object} labelConfig - Configuration actuelle des dimensions de l'étiquette
 * @param {number} zoomLevel - Niveau de zoom actuel
 * @param {Function} setZoomLevel - Fonction pour réinitialiser le niveau de zoom
 * @param {Function} setLabelConfig - Fonction pour mettre à jour la configuration des étiquettes
 */

import { useCallback } from 'react'
import * as fabric from 'fabric'

// Conversion mm -> pixels
const mmToPx = (mm) => (mm / 25.4) * 72

const useUpdateCanvasSize = (canvas, labelConfig, zoomLevel, setZoomLevel, setLabelConfig) => {
  const updateCanvasSize = useCallback(
    (newSize) => {
      if (!canvas) return

      const newWidthPx = mmToPx(newSize.labelWidth || labelConfig.labelWidth)
      const newHeightPx = mmToPx(newSize.labelHeight || labelConfig.labelHeight)

      // Mise à jour de la configuration du label
      setLabelConfig((prevConfig) => ({
        ...prevConfig,
        ...newSize
      }))

      // Réinitialiser le niveau de zoom à 1
      setZoomLevel(1)

      // Animer la taille du canevas
      fabric.util.animate({
        startValue: canvas.getWidth(),
        endValue: newWidthPx,
        duration: 500,
        onChange: (value) => {
          canvas.setWidth(value)
          canvas.renderAll()
        }
      })

      fabric.util.animate({
        startValue: canvas.getHeight(),
        endValue: newHeightPx,
        duration: 500,
        onChange: (value) => {
          canvas.setHeight(value)
          canvas.renderAll()
        }
      })

      // Remettre à l'échelle les objets avec animation
      canvas.getObjects().forEach((obj) => {
        const originalScaleX = obj.scaleX / zoomLevel
        const originalScaleY = obj.scaleY / zoomLevel
        const originalLeft = obj.left / zoomLevel
        const originalTop = obj.top / zoomLevel

        fabric.util.animate({
          startValue: obj.scaleX,
          endValue: originalScaleX,
          duration: 500,
          onChange: (value) => {
            obj.scaleX = value
            obj.setCoords()
            canvas.renderAll()
          }
        })

        fabric.util.animate({
          startValue: obj.scaleY,
          endValue: originalScaleY,
          duration: 500,
          onChange: (value) => {
            obj.scaleY = value
            obj.setCoords()
            canvas.renderAll()
          }
        })

        fabric.util.animate({
          startValue: obj.left,
          endValue: originalLeft,
          duration: 500,
          onChange: (value) => {
            obj.left = value
            obj.setCoords()
            canvas.renderAll()
          }
        })

        fabric.util.animate({
          startValue: obj.top,
          endValue: originalTop,
          duration: 500,
          onChange: (value) => {
            obj.top = value
            obj.setCoords()
            canvas.renderAll()
          }
        })
      })
    },
    [canvas, labelConfig, zoomLevel, setZoomLevel, setLabelConfig]
  )

  return updateCanvasSize
}

export default useUpdateCanvasSize
