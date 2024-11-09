// frontend/hooks/useAddQrCodeCsv.js

import { useCallback } from 'react'
import * as fabric from 'fabric'
import QRCode from 'qrcode'
import { rgbToHex, mmToPx } from '../utils/conversionUtils'
import { useCanvas } from '../context/CanvasContext'
import { useCellManagerContext } from '../context/CellManagerContext'

const useAddQrCodeCsv = () => {
  const { canvas, labelConfig } = useCanvas()
  const { state, dispatch } = useCellManagerContext()
  const { objectColors, objectProperties } = state

  const addQrCode = useCallback(
    (text, callback) => {
      if (!canvas) return

      const minDimension = Math.min(labelConfig.labelWidth, labelConfig.labelHeight)
      const qrSize = minDimension / 2
      const qrColor = rgbToHex(objectColors.gencode || '#000000')

      QRCode.toDataURL(
        text,
        {
          width: qrSize,
          margin: 2,
          color: { dark: qrColor, light: '#ffffff' }
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

            let fabricImg = canvas.getObjects().find((o) => o._objectType === 'gencode')

            if (!fabricImg) {
              // Créer un nouvel objet image pour le QR code
              fabricImg = new fabric.FabricImage(imgElement, {
                scaleX: objectProperties.gencode.scaleX || scaleFactor,
                scaleY: objectProperties.gencode.scaleY || scaleFactor,
                left: objectProperties.gencode.left || 10,
                top: objectProperties.gencode.top || 50,
                angle: objectProperties.gencode.angle || 0
              })
              fabricImg._objectType = 'gencode'
              canvas.add(fabricImg)
            } else {
              // Mettre à jour l'élément de l'image existante avec le nouveau QR code
              fabricImg.setElement(imgElement)
              fabricImg.set({
                scaleX: objectProperties.gencode.scaleX || scaleFactor,
                scaleY: objectProperties.gencode.scaleY || scaleFactor,
                left: objectProperties.gencode.left || 10,
                top: objectProperties.gencode.top || 50,
                angle: objectProperties.gencode.angle || 0
              })
            }

            fabricImg.set({
              isQRCode: true,
              qrText: text
            })

            fabricImg.off('modified') // Supprimer les anciens écouteurs pour éviter les doublons
            fabricImg.on('modified', () => {
              dispatch({
                type: 'UPDATE_OBJECT_PROPERTIES',
                payload: {
                  objectType: 'gencode',
                  left: fabricImg.left,
                  top: fabricImg.top,
                  scaleX: fabricImg.scaleX,
                  scaleY: fabricImg.scaleY,
                  angle: fabricImg.angle
                }
              })
            })

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
    [canvas, labelConfig, objectColors, objectProperties, dispatch]
  )

  return addQrCode
}

export default useAddQrCodeCsv
