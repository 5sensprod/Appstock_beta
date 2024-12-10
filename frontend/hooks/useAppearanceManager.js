import { useCallback } from 'react'
import { useCanvas } from '../context/CanvasContext'
import { GradientService } from '../services/GradientService'

export const GRADIENT_TYPES = {
  none: 'none',
  linear: 'linear',
  radial: 'radial'
}

export const useAppearanceManager = () => {
  const { canvas, selectedObject, dispatchCanvasAction } = useCanvas()

  const handleOpacityChange = useCallback(
    (opacity) => {
      if (!selectedObject) return

      selectedObject.set('opacity', opacity)
      canvas.renderAll()

      dispatchCanvasAction({
        type: 'SET_OBJECT_PROPERTIES',
        payload: { opacity }
      })
    },
    [selectedObject, canvas, dispatchCanvasAction]
  )

  const createGradient = useCallback(
    (type, colors, direction = 0, offsets = [0, 1]) => {
      if (!selectedObject) return

      if (type === 'none') {
        removeGradient()
        return
      }

      // Créer le gradient avec les offsets existants
      const gradient = GradientService.createGradient(
        selectedObject,
        type,
        colors,
        direction,
        offsets
      )

      selectedObject.set('fill', gradient)
      canvas.renderAll()

      // Sauvegarder les propriétés du gradient dans le state global
      dispatchCanvasAction({
        type: 'SET_OBJECT_PROPERTIES',
        payload: {
          gradientType: type,
          gradientColors: colors,
          gradientDirection: direction,
          gradientOffsets: offsets, // Sauvegarder les offsets dans le state global
          gradientCoords: GradientService.serializeGradient(selectedObject).coords
        }
      })
    },
    [selectedObject, canvas, dispatchCanvasAction]
  )

  const removeGradient = useCallback(() => {
    if (!selectedObject) return

    const currentFill = selectedObject.get('fill')
    selectedObject.set('fill', currentFill?.colorStops?.[0]?.color || '#000000')
    canvas.renderAll()

    dispatchCanvasAction({
      type: 'SET_OBJECT_PROPERTIES',
      payload: { gradientType: 'none' }
    })
  }, [selectedObject, canvas, dispatchCanvasAction])

  const getCurrentObjectColor = useCallback(() => {
    if (!selectedObject) return '#000000'
    const fill = selectedObject.get('fill')

    // Si c'est une couleur unie
    if (typeof fill === 'string') {
      return fill
    }
    // Si c'est un gradient, retourner la première couleur
    if (fill?.colorStops) {
      return fill.colorStops[0].color
    }
    return '#000000'
  }, [selectedObject])

  return {
    currentOpacity: selectedObject?.opacity || 1,
    currentGradientType: selectedObject?.get('fill')?.type || 'none',
    currentGradientColors: [
      selectedObject?.get('fill')?.colorStops?.[0]?.color || '#000000',
      selectedObject?.get('fill')?.colorStops?.[1]?.color || '#ffffff'
    ],
    currentGradientDirection: selectedObject?.gradientDirection || 0,
    currentGradientOffsets: selectedObject?.get('fill')?.colorStops
      ? [
          selectedObject.get('fill').colorStops[0].offset,
          selectedObject.get('fill').colorStops[1].offset
        ]
      : [0, 1],
    handleOpacityChange,
    createGradient,
    removeGradient,
    currentColor: getCurrentObjectColor()
  }
}
