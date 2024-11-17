// frontend/hooks/useCanvasTransformAndConstraints.js

import { useCallback, useEffect } from 'react'
import { mmToPx } from '../utils/conversionUtils'

const useCanvasTransformAndConstraints = (canvas, labelConfig, dispatchCanvasAction) => {
  // Mise à jour de la taille du canevas
  const updateCanvasSize = useCallback(
    (newSize) => {
      if (canvas) {
        const newWidthPx = mmToPx(newSize.labelWidth || labelConfig.labelWidth)
        const newHeightPx = mmToPx(newSize.labelHeight || labelConfig.labelHeight)

        dispatchCanvasAction({
          type: 'SET_LABEL_CONFIG',
          payload: { ...labelConfig, ...newSize }
        })

        canvas.setZoom(1)
        dispatchCanvasAction({ type: 'SET_ZOOM', payload: 1 })

        canvas.setWidth(newWidthPx)
        canvas.setHeight(newHeightPx)

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
    [canvas, labelConfig, dispatchCanvasAction]
  )

  // Gestion du zoom
  const handleZoomChange = useCallback(
    (newZoom) => {
      if (canvas) {
        const width = mmToPx(labelConfig.labelWidth)
        const height = mmToPx(labelConfig.labelHeight)

        const newWidth = width * newZoom
        const newHeight = height * newZoom
        canvas.setWidth(newWidth)
        canvas.setHeight(newHeight)

        canvas.setZoom(newZoom)

        const vpt = canvas.viewportTransform
        vpt[4] = (newWidth - width * newZoom) / 2
        vpt[5] = (newHeight - height * newZoom) / 2
        canvas.setViewportTransform(vpt)

        dispatchCanvasAction({ type: 'SET_ZOOM', payload: newZoom })
        canvas.requestRenderAll()
      }
    },
    [canvas, dispatchCanvasAction, labelConfig]
  )

  // Restrictions sur les objets (mouvement/redimensionnement)
  const restrictObjectMovement = useCallback(
    (e) => {
      const obj = e.target
      obj.setCoords()

      const zoom = canvas.getZoom()
      const boundingRect = obj.getBoundingRect()

      const canvasWidth = canvas.getWidth() / zoom
      const canvasHeight = canvas.getHeight() / zoom

      if (boundingRect.left < 0) obj.left -= boundingRect.left
      if (boundingRect.left + boundingRect.width > canvasWidth)
        obj.left -= boundingRect.left + boundingRect.width - canvasWidth

      if (boundingRect.top < 0) obj.top -= boundingRect.top
      if (boundingRect.top + boundingRect.height > canvasHeight)
        obj.top -= boundingRect.top + boundingRect.height - canvasHeight

      obj.setCoords()
    },
    [canvas]
  )

  useEffect(() => {
    if (!canvas) return

    canvas.on('object:moving', restrictObjectMovement)
    canvas.on('object:scaling', restrictObjectMovement)

    return () => {
      canvas.off('object:moving', restrictObjectMovement)
      canvas.off('object:scaling', restrictObjectMovement)
    }
  }, [canvas, restrictObjectMovement])

  return { updateCanvasSize, handleZoomChange }
}

export default useCanvasTransformAndConstraints
