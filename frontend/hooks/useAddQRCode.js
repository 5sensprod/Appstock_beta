import { useCallback } from 'react'
import * as fabric from 'fabric'
import QRCode from 'qrcode'
import { rgbToHex, mmToPx } from '../utils/conversionUtils'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddQRCode = (canvas, labelConfig, selectedColor) => {
  const { centerObject } = useAddObjectToCanvas(labelConfig)

  // Fonction utilitaire pour générer un QR code en tant qu'image
  const generateQRCode = useCallback(
    (text, color, callback) => {
      const validColor = rgbToHex(color || '#000000')

      QRCode.toDataURL(
        text,
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

          imgElement.onload = () => callback(null, imgElement)
          imgElement.onerror = () => callback("Erreur lors du chargement de l'image QR code.", null)
        }
      )
    },
    [labelConfig]
  )

  // Fonction utilitaire pour créer un objet `fabric.Image` avec les propriétés QR code
  const createQRCodeFabricImage = useCallback(
    (imgElement, text) => {
      const fabricImg = new fabric.FabricImage(imgElement, {
        width: mmToPx(labelConfig.labelWidth / 2),
        height: mmToPx(labelConfig.labelWidth / 2)
      })

      fabricImg.set({
        isQRCode: true,
        qrText: text,
        id: Math.random().toString(36).substring(2, 11) // ID unique
      })

      // Ajouter des propriétés personnalisées à la sérialisation
      fabricImg.toObject = (function (toObject) {
        return function () {
          return Object.assign(toObject.call(this), {
            isQRCode: true,
            qrText: text,
            id: this.id
          })
        }
      })(fabricImg.toObject)

      return fabricImg
    },
    [labelConfig]
  )

  const onAddQrCode = useCallback(
    (text) => {
      if (!canvas) return

      generateQRCode(text, selectedColor, (err, imgElement) => {
        if (err) {
          console.error(err)
          return
        }

        const fabricImg = createQRCodeFabricImage(imgElement, text)

        // Centre et ajoute le QR code au canvas
        centerObject(fabricImg)
        canvas.add(fabricImg)
        canvas.setActiveObject(fabricImg)
        canvas.renderAll()
      })
    },
    [canvas, selectedColor, centerObject, generateQRCode, createQRCodeFabricImage]
  )

  const onUpdateQrCode = useCallback(
    (newText, newColor) => {
      if (!canvas) return

      const activeObject = canvas.getActiveObject()
      if (activeObject && activeObject.isQRCode) {
        generateQRCode(newText, newColor || selectedColor, (err, imgElement) => {
          if (err) {
            console.error(err)
            return
          }

          // Met à jour l'image et le texte QR code
          activeObject.setElement(imgElement)
          activeObject.qrText = newText
          canvas.renderAll()
        })
      }
    },
    [canvas, selectedColor, generateQRCode]
  )

  return { onAddQrCode, onUpdateQrCode }
}

export default useAddQRCode
