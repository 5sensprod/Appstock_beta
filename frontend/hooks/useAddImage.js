import { useCallback } from 'react'
import * as fabric from 'fabric'
import { mmToPx } from '../utils/conversionUtils'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddImage = (canvas, labelConfig) => {
  const { centerObject } = useAddObjectToCanvas(labelConfig) // Extraire uniquement la logique de centrage

  return useCallback(
    (file) => {
      if (!canvas || !file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const imgElement = new Image()
        imgElement.src = event.target.result

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

          // Ajoute un ID unique à l'image
          fabricImg.id = Math.random().toString(36).substring(2, 11)

          centerObject(fabricImg) // Centrer l'image
          canvas.add(fabricImg)
          canvas.setActiveObject(fabricImg)
          canvas.renderAll()
        }

        imgElement.onerror = () => {
          // Gestion des erreurs lors du chargement de l'image
        }
      }

      reader.readAsDataURL(file)
    },
    [canvas, labelConfig, centerObject]
  )
}

export default useAddImage
