// hooks/useAddQRCode.js

import { useCallback } from 'react'
import * as fabric from 'fabric'
import QRCode from 'qrcode'
import { rgbToHex, mmToPx } from '../utils/conversionUtils'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddQRCode = (canvas, labelConfig, selectedColor) => {
  const { addObjectToCanvas } = useAddObjectToCanvas(canvas, labelConfig)

  const onAddQrCode = useCallback(
    (text) => {
      if (!canvas) return

      const minDimension = Math.min(labelConfig.labelWidth, labelConfig.labelHeight)
      const qrSize = minDimension / 2
      const validColor = rgbToHex(selectedColor || '#000000')

      QRCode.toDataURL(
        text,
        {
          width: qrSize,
          margin: 2,
          color: { dark: validColor, light: '#ffffff' }
        },
        (err, url) => {
          if (err) {
            console.error('Erreur lors de la génération du QR code :', err)
            return
          }

          const imgElement = new Image()
          imgElement.src = url

          imgElement.onload = () => {
            const imgWidth = imgElement.naturalWidth
            const imgHeight = imgElement.naturalHeight

            const canvasWidth = mmToPx(labelConfig.labelWidth)
            const canvasHeight = mmToPx(labelConfig.labelHeight)
            const scaleFactor = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)

            const fabricImg = new fabric.FabricImage(imgElement, {
              scaleX: scaleFactor,
              scaleY: scaleFactor
            })

            fabricImg.set({
              isQRCode: true,
              qrText: text
            })

            fabricImg.toObject = (function (toObject) {
              return function () {
                return Object.assign(toObject.call(this), {
                  isQRCode: true,
                  qrText: text
                })
              }
            })(fabricImg.toObject)

            addObjectToCanvas(fabricImg)
          }

          imgElement.onerror = () => {
            console.error("Erreur lors du chargement de l'image QR code.")
          }
        }
      )
    },
    [selectedColor, labelConfig, addObjectToCanvas, canvas]
  )

  const onUpdateQrCode = useCallback(
    (newText, newColor) => {
      if (!canvas) return

      const activeObject = canvas.getActiveObject()
      if (activeObject && activeObject.isQRCode) {
        const validColor = rgbToHex(newColor || selectedColor || '#000000')

        QRCode.toDataURL(
          newText,
          {
            width: activeObject.width,
            margin: 2,
            color: { dark: validColor, light: '#ffffff' }
          },
          (err, url) => {
            if (err) {
              console.error('Erreur lors de la génération du QR code :', err)
              return
            }

            const imgElement = new Image()
            imgElement.src = url

            imgElement.onload = () => {
              activeObject.setElement(imgElement)
              activeObject.qrText = newText // Mettre à jour le texte associé au QR code
              canvas.renderAll()
            }

            imgElement.onerror = () => {
              console.error("Erreur lors du chargement de l'image QR code.")
            }
          }
        )
      }
    },
    [canvas, selectedColor]
  )

  const onAddQrCodeCsv = useCallback(
    (text, callback) => {
      if (!canvas) return

      const minDimension = Math.min(labelConfig.labelWidth, labelConfig.labelHeight)
      const qrSize = minDimension / 2
      const validColor = rgbToHex(selectedColor)

      QRCode.toDataURL(
        text,
        {
          width: qrSize,
          margin: 2,
          color: { dark: validColor || '#000000', light: '#ffffff' }
        },
        (err, url) => {
          if (err) {
            console.error('Erreur lors de la génération du QR code :', err)
            return callback && callback()
          }

          const imgElement = new Image()
          imgElement.src = url

          imgElement.onload = () => {
            const imgWidth = imgElement.naturalWidth
            const imgHeight = imgElement.naturalHeight

            const canvasWidth = mmToPx(labelConfig.labelWidth)
            const canvasHeight = mmToPx(labelConfig.labelHeight)
            const scaleFactor = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)

            const fabricImg = new fabric.FabricImage(imgElement, {
              scaleX: scaleFactor,
              scaleY: scaleFactor
            })

            fabricImg.set({
              isQRCode: true,
              qrText: text
            })

            fabricImg.toObject = (function (toObject) {
              return function () {
                return Object.assign(toObject.call(this), {
                  isQRCode: true,
                  qrText: text
                })
              }
            })(fabricImg.toObject)

            addObjectToCanvas(fabricImg)

            if (callback) callback()
          }

          imgElement.onerror = () => {
            console.error("Erreur lors du chargement de l'image QR code.")
            if (callback) callback()
          }
        }
      )
    },
    [selectedColor, labelConfig, addObjectToCanvas, canvas]
  )

  return { onAddQrCode, onUpdateQrCode, onAddQrCodeCsv }
}

export default useAddQRCode
