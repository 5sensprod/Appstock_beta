import { useCallback } from 'react'
import { useCanvas } from '../context/CanvasContext'

export const STROKE_DASH_PATTERNS = {
  solid: [], // Changé de null à tableau vide pour meilleure compatibilité
  dashed: [12, 8],
  dotted: [3, 3],
  dashedDotted: [12, 6, 3, 6],
  longDashed: [24, 12]
}

export const useStrokeManager = () => {
  const { canvas, selectedObject, dispatchCanvasAction } = useCanvas()

  const handleStrokeChange = useCallback(
    (strokeProps, isClosing = false) => {
      if (!selectedObject) return

      // Forcer la mise à jour des propriétés sur l'objet
      if ('strokeDashArray' in strokeProps) {
        // Convertir explicitement en tableau vide pour le style solide
        const dashArray =
          Array.isArray(strokeProps.strokeDashArray) && strokeProps.strokeDashArray.length > 0
            ? strokeProps.strokeDashArray
            : []

        selectedObject.set('strokeDashArray', dashArray)
      }

      if ('strokeWidth' in strokeProps) {
        selectedObject.set('strokeWidth', strokeProps.strokeWidth)
      }

      if ('stroke' in strokeProps) {
        selectedObject.set('stroke', strokeProps.stroke)
      }

      // Toujours maintenir strokeUniform à true
      selectedObject.set('strokeUniform', true)

      // Forcer la mise à jour du canvas
      selectedObject.setCoords()
      canvas.requestRenderAll()

      if (isClosing) {
        canvas.fire('object:modified')
      }

      // Mettre à jour l'état global avec les mêmes valeurs
      dispatchCanvasAction({
        type: 'SET_STROKE_PROPERTIES',
        payload: {
          ...(strokeProps.strokeDashArray !== undefined && {
            strokeDashArray:
              Array.isArray(strokeProps.strokeDashArray) && strokeProps.strokeDashArray.length > 0
                ? strokeProps.strokeDashArray
                : []
          }),
          ...(strokeProps.strokeWidth !== undefined && {
            strokeWidth: strokeProps.strokeWidth
          }),
          ...(strokeProps.stroke !== undefined && {
            stroke: strokeProps.stroke
          })
        }
      })
    },
    [selectedObject, canvas, dispatchCanvasAction]
  )

  // Retourner les valeurs actuelles avec gestion explicite du cas solide
  const currentStrokeDashArray = selectedObject?.strokeDashArray
  const isPatternEmpty =
    !currentStrokeDashArray ||
    (Array.isArray(currentStrokeDashArray) && currentStrokeDashArray.length === 0)

  return {
    currentStroke: selectedObject?.stroke || '#000000',
    currentStrokeWidth: selectedObject?.strokeWidth || 0,
    currentStrokeDashArray: isPatternEmpty ? [] : currentStrokeDashArray,
    handleStrokeChange
  }
}
