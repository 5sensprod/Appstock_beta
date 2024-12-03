import { createQRCodeFabricImage } from '../utils/fabricUtils'
import { useCallback } from 'react'
import * as fabric from 'fabric'
import QRCode from 'qrcode'
import { rgbToHex, mmToPx } from '../utils/conversionUtils'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddQRCode = (canvas, labelConfig, selectedColor) => {
  const { centerObject } = useAddObjectToCanvas(labelConfig)

  const onAddQrCode = useCallback(
    async (text) => {
      if (!canvas) return
      try {
        const fabricImg = await createQRCodeFabricImage(text, {
          color: selectedColor,
          width: mmToPx(labelConfig.labelWidth / 2),
          height: mmToPx(labelConfig.labelWidth / 2)
        })
        centerObject(fabricImg)
        canvas.add(fabricImg)
        canvas.setActiveObject(fabricImg)
        canvas.renderAll()
      } catch (err) {
        console.error('Error adding QR code:', err)
      }
    },
    [canvas, selectedColor, labelConfig, centerObject]
  )

  const onUpdateQrCode = useCallback(
    async (newText, newColor) => {
      if (!canvas) return

      const activeObject = canvas.getActiveObject()
      if (activeObject && activeObject.isQRCode) {
        try {
          const fabricImg = await createQRCodeFabricImage(newText, {
            color: newColor || selectedColor,
            width: activeObject.width,
            height: activeObject.height
          })
          activeObject.setElement(fabricImg.getElement())
          activeObject.qrText = newText
          canvas.renderAll()
        } catch (err) {
          console.error('Error updating QR code:', err)
        }
      }
    },
    [canvas, selectedColor]
  )

  return {
    onAddQrCode,
    onUpdateQrCode
  }
}

export default useAddQRCode
