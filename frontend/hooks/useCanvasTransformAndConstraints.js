import { useCallback, useEffect } from 'react'
import { mmToPx } from '../utils/conversionUtils'

const useCanvasTransformAndConstraints = (
  canvas,
  labelConfig,
  canvasState,
  dispatchCanvasAction
) => {
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

  // Synchroniser zoom et dimensions
  useEffect(() => {
    if (canvas) {
      console.log('Synchronizing zoom and dimensions in useCanvasTransformAndConstraints')
      const newWidth = mmToPx(labelConfig.labelWidth) * canvasState.zoomLevel
      const newHeight = mmToPx(labelConfig.labelHeight) * canvasState.zoomLevel

      canvas.setWidth(newWidth)
      canvas.setHeight(newHeight)
      canvas.setZoom(canvasState.zoomLevel)

      canvas.renderAll()
    }
  }, [canvas, labelConfig, canvasState.zoomLevel])

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

  return { handleZoomChange }
}

export default useCanvasTransformAndConstraints
