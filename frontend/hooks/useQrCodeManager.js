// hooks/useQrCodeManager.js
import { useState, useEffect } from 'react'
import { useCanvas } from '../context/CanvasContext'
import useCanvasObjectUpdater from './useCanvasObjectUpdater'

export const useQrCodeManager = (onAddQrCode, onUpdateQrCode) => {
  const { canvas, selectedObject, dispatchCanvasAction } = useCanvas()
  const updateObjectProperties = useCanvasObjectUpdater(canvas, dispatchCanvasAction)
  const [qrText, setQrText] = useState('')
  const [isModified, setIsModified] = useState(false)

  useEffect(() => {
    if (selectedObject?.qrText) {
      setQrText(selectedObject.qrText)
      setIsModified(false)
    }
  }, [selectedObject])

  const handleColorChange = (color) => {
    dispatchCanvasAction({ type: 'SET_COLOR', payload: color })

    if (selectedObject?.type === 'image') {
      updateObjectProperties(selectedObject, { color })
      if (qrText.trim()) onUpdateQrCode(qrText, color)
    } else if (qrText.trim()) {
      onUpdateQrCode(qrText, color)
    }
  }

  return {
    qrText,
    isModified,
    setQrText,
    setIsModified,
    handleColorChange
  }
}
