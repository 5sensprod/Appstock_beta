import { useCallback } from 'react'
import * as fabric from 'fabric'
import QRCode from 'qrcode'
import { rgbToHex, mmToPx } from '../utils/conversionUtils'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddQRCode = (canvas, labelConfig, selectedColor) => {
  const { centerObject } = useAddObjectToCanvas(labelConfig)

  const onAddQrCode = useCallback(
    (text) => {
      if (!canvas) return

      const validColor = rgbToHex(selectedColor || '#000000')

      QRCode.toDataURL(
        text,
        {
          width: mmToPx(labelConfig.labelWidth / 2), // Utiliser la moitié de la largeur de l'étiquette
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
            const fabricImg = new fabric.Image(imgElement, {
              width: mmToPx(labelConfig.labelWidth / 2),
              height: mmToPx(labelConfig.labelWidth / 2)
            })

            // Ajout des propriétés personnalisées
            fabricImg.set({
              isQRCode: true,
              qrText: text,
              id: Math.random().toString(36).substring(2, 11) // Ajout d'un ID unique
            })

            // Ajout à la sérialisation
            fabricImg.toObject = (function (toObject) {
              return function () {
                return Object.assign(toObject.call(this), {
                  isQRCode: true,
                  qrText: text,
                  id: this.id
                })
              }
            })(fabricImg.toObject)

            // Centre et ajoute le QR code au canvas
            centerObject(fabricImg)
            canvas.add(fabricImg)
            canvas.setActiveObject(fabricImg)
            canvas.renderAll()
          }

          imgElement.onerror = () => {
            console.error("Erreur lors du chargement de l'image QR code.")
          }
        }
      )
    },
    [selectedColor, labelConfig, centerObject, canvas]
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
            width: mmToPx(labelConfig.labelWidth / 2),
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
    [canvas, selectedColor, labelConfig]
  )

  const onAddQrCodeCsv = useCallback(
    (text, callback) => {
      if (!canvas) return

      const validColor = rgbToHex(selectedColor || '#000000')

      QRCode.toDataURL(
        text,
        {
          width: mmToPx(labelConfig.labelWidth / 2), // Utiliser la moitié de la largeur de l'étiquette
          margin: 2,
          color: { dark: validColor, light: '#ffffff' }
        },
        (err, url) => {
          if (err) {
            console.error('Erreur lors de la génération du QR code :', err)
            return callback && callback()
          }

          const imgElement = new Image()
          imgElement.src = url

          imgElement.onload = () => {
            const fabricImg = new fabric.Image(imgElement, {
              width: mmToPx(labelConfig.labelWidth / 2),
              height: mmToPx(labelConfig.labelWidth / 2)
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

            centerObject(fabricImg) // Centrer le QR code
            canvas.add(fabricImg)
            canvas.setActiveObject(fabricImg)
            canvas.renderAll()

            if (callback) callback()
          }

          imgElement.onerror = () => {
            console.error("Erreur lors du chargement de l'image QR code.")
            if (callback) callback()
          }
        }
      )
    },
    [selectedColor, labelConfig, centerObject, canvas]
  )

  return { onAddQrCode, onUpdateQrCode, onAddQrCodeCsv }
}

export default useAddQRCode
