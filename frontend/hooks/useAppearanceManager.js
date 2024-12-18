import { useCallback } from 'react'
import { useCanvas } from '../context/CanvasContext'
import { GradientService } from '../services/GradientService'

export const GRADIENT_TYPES = {
  none: 'none',
  linear: 'linear',
  radial: 'radial'
}

export const useAppearanceManager = (onUpdateQrCode = null) => {
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

  const handleQrCodeColorChange = useCallback(
    (color) => {
      if (!selectedObject || !onUpdateQrCode) return

      // Mise à jour immédiate du QR code avec la nouvelle couleur
      onUpdateQrCode(selectedObject.qrText, color)

      // Mise à jour du state global
      dispatchCanvasAction({
        type: 'SET_OBJECT_PROPERTIES',
        payload: { color }
      })
    },
    [selectedObject, onUpdateQrCode, dispatchCanvasAction]
  )

  const removeGradient = useCallback(() => {
    if (!selectedObject) return

    const currentFill = selectedObject.get('fill')
    const newColor = currentFill?.colorStops?.[0]?.color || '#000000'

    // Si c'est un QR code, utiliser la fonction spéciale
    if (selectedObject.isQRCode && onUpdateQrCode) {
      handleQrCodeColorChange(newColor)
      return
    }

    selectedObject.set('fill', newColor)
    canvas.renderAll()

    dispatchCanvasAction({
      type: 'SET_OBJECT_PROPERTIES',
      payload: { gradientType: 'none' }
    })
  }, [selectedObject, canvas, dispatchCanvasAction, handleQrCodeColorChange, onUpdateQrCode])

  const createGradient = useCallback(
    (type, colors, direction = 0, offsets = [0, 1]) => {
      if (!selectedObject) return

      if (type === 'none') {
        removeGradient()
        return
      }

      // Pour les QR codes, on n'applique que la première couleur du gradient
      if (selectedObject.isQRCode && onUpdateQrCode) {
        handleQrCodeColorChange(colors[0])
        return
      }

      const gradient = GradientService.createGradient(
        selectedObject,
        type,
        colors,
        direction,
        offsets
      )

      selectedObject.set('fill', gradient)
      canvas.renderAll()

      dispatchCanvasAction({
        type: 'SET_OBJECT_PROPERTIES',
        payload: {
          gradientType: type,
          gradientColors: colors,
          gradientDirection: direction,
          gradientOffsets: offsets,
          gradientCoords: GradientService.serializeGradient(selectedObject).coords
        }
      })
    },
    [
      selectedObject,
      canvas,
      dispatchCanvasAction,
      removeGradient,
      handleQrCodeColorChange,
      onUpdateQrCode
    ]
  )

  const getCurrentObjectColor = useCallback(() => {
    if (!selectedObject) return '#000000'

    if (selectedObject.isQRCode) {
      return selectedObject.fill || '#000000'
    }

    const fill = selectedObject.get('fill')
    if (typeof fill === 'string') return fill
    if (fill?.colorStops) return fill.colorStops[0].color
    return '#000000'
  }, [selectedObject])

  return {
    currentOpacity: selectedObject?.opacity || 1,
    currentGradientType: selectedObject?.isQRCode
      ? 'none'
      : selectedObject?.get('fill')?.type || 'none',
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
    handleQrCodeColorChange,
    currentColor: getCurrentObjectColor()
  }
}
