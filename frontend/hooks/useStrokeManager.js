import { useCallback } from 'react'
import { useCanvas } from '../context/CanvasContext'

export const STROKE_PATTERN_TYPES = {
  solid: 'solid',
  dashed: 'dashed',
  dotted: 'dotted'
}

const generatePattern = (type, density = 5, visualStrokeWidth = 1) => {
  const baseSpacing = 24
  const spacing = baseSpacing / density

  switch (type) {
    case 'dotted':
      // Même pattern pour tous les objets
      return [1, spacing * 2]
    case 'dashed':
      return [spacing, spacing]
    case 'solid':
    default:
      return []
  }
}

const getStrokeWidthFactor = (object) => {
  if (!object) return 1

  if (object.type === 'image' || object.id?.startsWith('gencode-')) {
    return 1.2
  }

  return 1
}

export const useStrokeManager = () => {
  const { canvas, selectedObject, dispatchCanvasAction } = useCanvas()

  const handleStrokeChange = useCallback(
    (strokeProps, isClosing = false) => {
      if (!selectedObject) return

      const updates = {}
      const strokeWidthFactor = getStrokeWidthFactor(selectedObject)
      const visualStrokeWidth =
        strokeProps.strokeWidth || selectedObject.strokeWidth / strokeWidthFactor

      if ('strokeWidth' in strokeProps) {
        // Garder strokeUniform: true pour tous les objets avec stroke
        updates.strokeWidth = strokeProps.strokeWidth * strokeWidthFactor
        updates.strokeUniform = true
      }

      if ('stroke' in strokeProps) {
        updates.stroke = strokeProps.stroke
      }

      if ('patternType' in strokeProps || 'density' in strokeProps || strokeProps.forceUpdate) {
        const type = strokeProps.patternType || selectedObject.patternType || 'solid'
        const density = strokeProps.density || selectedObject.patternDensity || 5

        updates.patternType = type
        updates.patternDensity = density
        updates.strokeDashArray = generatePattern(type, density, visualStrokeWidth)

        if (type === 'dotted') {
          updates.strokeLineCap = 'round'
          // Forcer strokeUniform pour tous les points
          updates.strokeUniform = true
        } else {
          updates.strokeLineCap = 'butt'
        }
      }

      selectedObject.set(updates)

      if (selectedObject.patternType === 'dotted') {
        selectedObject.set('strokeLineCap', 'round')
      }

      selectedObject.setCoords()
      canvas.renderAll()

      if (isClosing) {
        canvas.fire('object:modified')
      }

      const stateUpdates = {
        ...updates,
        strokeWidth: visualStrokeWidth,
        strokeLineCap: updates.strokeLineCap
      }

      dispatchCanvasAction({
        type: 'SET_STROKE_PROPERTIES',
        payload: stateUpdates
      })
    },
    [selectedObject, canvas, dispatchCanvasAction]
  )

  return {
    currentStroke: selectedObject?.stroke || '#000000',
    currentStrokeWidth: (selectedObject?.strokeWidth || 0) / getStrokeWidthFactor(selectedObject),
    currentPatternType: selectedObject?.patternType || 'solid',
    currentPatternDensity: selectedObject?.patternDensity || 5,
    handleStrokeChange
  }
}
