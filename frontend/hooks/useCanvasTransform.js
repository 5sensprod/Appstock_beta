import { useCallback } from 'react'
import { mmToPx } from '../utils/conversionUtils'

const useCanvasTransform = (canvas, labelConfig, dispatch) => {
  const updateCanvasSize = useCallback(
    (newSize) => {
      if (canvas) {
        const newWidthPx = mmToPx(newSize.labelWidth || labelConfig.labelWidth)
        const newHeightPx = mmToPx(newSize.labelHeight || labelConfig.labelHeight)

        // Mettre à jour la configuration du label
        dispatch({
          type: 'SET_LABEL_CONFIG',
          payload: {
            ...labelConfig,
            ...newSize
          }
        })

        // Réinitialiser le niveau de zoom à 1
        canvas.setZoom(1)
        dispatch({ type: 'SET_ZOOM', payload: 1 })

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
    [canvas, labelConfig, dispatch]
  )

  const handleZoomChange = useCallback(
    (newZoom) => {
      if (canvas) {
        // Calculer les dimensions d'origine si elles ne sont pas définies
        const initialWidth = canvas.originalWidth || canvas.getWidth()
        const initialHeight = canvas.originalHeight || canvas.getHeight()

        if (!canvas.originalWidth) canvas.originalWidth = initialWidth
        if (!canvas.originalHeight) canvas.originalHeight = initialHeight

        // Appliquer le zoom au canevas et redimensionner
        const newWidth = initialWidth * newZoom
        const newHeight = initialHeight * newZoom
        canvas.setWidth(newWidth)
        canvas.setHeight(newHeight)

        // Appliquer le zoom à la vue globale
        canvas.setZoom(newZoom)

        // Centrer les objets en ajustant la transformation de la vue
        const vpt = canvas.viewportTransform
        vpt[4] = (newWidth - initialWidth * newZoom) / 2 // Décalage horizontal
        vpt[5] = (newHeight - initialHeight * newZoom) / 2 // Décalage vertical
        canvas.setViewportTransform(vpt)

        // Mettre à jour le niveau de zoom global via dispatch pour synchroniser avec le curseur
        dispatch({ type: 'SET_ZOOM', payload: newZoom })

        // Rendu de tous les changements
        canvas.requestRenderAll()
      }
    },
    [canvas, dispatch]
  )

  return { updateCanvasSize, handleZoomChange }
}

export default useCanvasTransform
