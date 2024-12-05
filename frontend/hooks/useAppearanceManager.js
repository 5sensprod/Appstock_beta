import { useCallback } from 'react'
import { useCanvas } from '../context/CanvasContext'
import * as fabric from 'fabric'

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
    (type, colors, direction = 0) => {
      if (!selectedObject) return

      let gradientOptions
      const width = selectedObject.width * selectedObject.scaleX
      const height = selectedObject.height * selectedObject.scaleY

      if (type === 'linear') {
        const angleRad = (direction * Math.PI) / 180
        gradientOptions = {
          type: 'linear',
          coords: {
            x1: -width / 2,
            y1: -height / 2,
            x2: width / 2,
            y2: height / 2
          }
        }
      } else if (type === 'radial') {
        const radius = Math.min(width, height) / 2
        gradientOptions = {
          type: 'radial',
          coords: {
            r1: 0,
            r2: radius,
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0
          }
        }
      }

      if (gradientOptions) {
        gradientOptions.colorStops = [
          { offset: 0, color: colors[0] },
          { offset: 1, color: colors[1] }
        ]

        selectedObject.set('fill', new fabric.Gradient(gradientOptions))
        canvas.renderAll()

        dispatchCanvasAction({
          type: 'SET_OBJECT_PROPERTIES',
          payload: {
            gradientType: type,
            gradientColors: colors,
            gradientDirection: direction
          }
        })
      }
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

  return {
    currentOpacity: selectedObject?.opacity || 1,
    currentGradientType: selectedObject?.get('fill')?.type || 'none',
    currentGradientColors: [
      selectedObject?.get('fill')?.colorStops?.[0]?.color || '#000000',
      selectedObject?.get('fill')?.colorStops?.[1]?.color || '#ffffff'
    ],
    currentGradientDirection: selectedObject?.gradientDirection || 0,
    handleOpacityChange,
    createGradient,
    removeGradient
  }
}
