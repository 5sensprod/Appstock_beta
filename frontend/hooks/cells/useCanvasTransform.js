import { useCallback } from 'react'
import { mmToPx } from '../../utils/conversionUtils'

const useCanvasTransform = (canvas, labelConfig, dispatchCanvasAction) => {
  const updateCanvasSize = useCallback(
    (newSize) => {
      if (canvas) {
        const newWidthPx = mmToPx(newSize.labelWidth || labelConfig.labelWidth)
        const newHeightPx = mmToPx(newSize.labelHeight || labelConfig.labelHeight)

        // Mettre à jour la configuration du label
        dispatchCanvasAction({
          type: 'SET_LABEL_CONFIG',
          payload: {
            ...labelConfig,
            ...newSize
          }
        })

        // Réinitialiser le niveau de zoom à 1
        canvas.setZoom(1)
        dispatchCanvasAction({ type: 'SET_ZOOM', payload: 1 })

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
    [canvas, labelConfig, dispatchCanvasAction]
  )

  const handleZoomChange = useCallback(
    (newZoom) => {
      if (canvas) {
        // Utiliser les valeurs actuelles de labelConfig pour le calcul des nouvelles dimensions
        const width = mmToPx(labelConfig.labelWidth)
        const height = mmToPx(labelConfig.labelHeight)

        // Appliquer le zoom au canevas et redimensionner
        const newWidth = width * newZoom
        const newHeight = height * newZoom
        canvas.setWidth(newWidth)
        canvas.setHeight(newHeight)

        // Appliquer le zoom à la vue globale
        canvas.setZoom(newZoom)

        // Centrer les objets en ajustant la transformation de la vue
        const vpt = canvas.viewportTransform
        vpt[4] = (newWidth - width * newZoom) / 2 // Décalage horizontal
        vpt[5] = (newHeight - height * newZoom) / 2 // Décalage vertical
        canvas.setViewportTransform(vpt)

        // Mettre à jour le niveau de zoom global via dispatchCanvasAction pour synchroniser avec le curseur
        dispatchCanvasAction({ type: 'SET_ZOOM', payload: newZoom })

        // Rendu de tous les changements
        canvas.requestRenderAll()
      }
    },
    [canvas, dispatchCanvasAction, labelConfig] // Ajouter labelConfig aux dépendances
  )

  return { updateCanvasSize, handleZoomChange }
}

export default useCanvasTransform
