import { useCallback } from 'react'
import { useCanvas } from '../context/CanvasContext'

export const STROKE_PATTERN_TYPES = {
  solid: 'solid',
  dashed: 'dashed',
  dotted: 'dotted'
}

const generatePattern = (type, density = 5, strokeWidth = 1) => {
  const baseSpacing = 24
  const spacing = baseSpacing / density

  switch (type) {
    case 'dotted':
      // Pour les points, utiliser la strokeWidth comme base
      return [1, spacing * 2] // Un point de la taille du stroke, avec un espacement proportionnel
    case 'dashed':
      return [spacing, spacing]
    case 'solid':
    default:
      return []
  }
}

export const useStrokeManager = () => {
  const { canvas, selectedObject, dispatchCanvasAction } = useCanvas()

  const handleStrokeChange = useCallback(
    (strokeProps, isClosing = false) => {
      if (!selectedObject) return

      const updates = {}

      if ('strokeWidth' in strokeProps) {
        updates.strokeWidth = strokeProps.strokeWidth
      }

      if ('stroke' in strokeProps) {
        updates.stroke = strokeProps.stroke
      }

      // Gérer les changements de motif
      if ('patternType' in strokeProps || 'density' in strokeProps || strokeProps.forceUpdate) {
        const type = strokeProps.patternType || selectedObject.patternType || 'solid'
        const density = strokeProps.density || selectedObject.patternDensity || 5
        const currentStrokeWidth = updates.strokeWidth || selectedObject.strokeWidth || 1

        updates.patternType = type
        updates.patternDensity = density
        updates.strokeDashArray = generatePattern(type, density, currentStrokeWidth)
        updates.strokeLineCap = type === 'dotted' ? 'round' : 'butt'
        updates.strokeUniform = true
      }

      // Appliquer les mises à jour
      selectedObject.set(updates)

      // Si le motif est en points, forcer la mise à jour du strokeLineCap
      if (selectedObject.patternType === 'dotted') {
        selectedObject.set('strokeLineCap', 'round')
      }

      selectedObject.setCoords()
      canvas.renderAll()

      if (isClosing) {
        canvas.fire('object:modified')
      }

      dispatchCanvasAction({
        type: 'SET_STROKE_PROPERTIES',
        payload: {
          ...updates,
          strokeLineCap: updates.strokeLineCap
        }
      })
    },
    [selectedObject, canvas, dispatchCanvasAction]
  )

  // Détecter le type de motif actuel
  const currentPatternType = selectedObject?.patternType || 'solid'

  return {
    currentStroke: selectedObject?.stroke || '#000000',
    currentStrokeWidth: selectedObject?.strokeWidth || 0,
    currentPatternType,
    currentPatternDensity: selectedObject?.patternDensity || 5,
    handleStrokeChange
  }
}
