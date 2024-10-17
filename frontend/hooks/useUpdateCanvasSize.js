import { useCallback } from 'react'
import * as fabric from 'fabric'

const mmToPx = (mm) => (mm / 25.4) * 72 // Conversion millimètres en pixels

const useUpdateCanvasSize = (canvas, labelConfig, zoomLevel, setZoomLevel) => {
  const updateCanvasSize = useCallback(
    (newSize) => {
      if (!canvas) return

      const newWidthPx = mmToPx(newSize.labelWidth || labelConfig.labelWidth)
      const newHeightPx = mmToPx(newSize.labelHeight || labelConfig.labelHeight)

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
    [canvas, labelConfig, zoomLevel, setZoomLevel]
  )

  return updateCanvasSize
}

export default useUpdateCanvasSize
