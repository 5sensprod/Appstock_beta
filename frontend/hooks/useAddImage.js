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

          const fabricImg = new fabric.Image(imgElement, {
            scaleX: scaleFactor,
            scaleY: scaleFactor
          })

          centerObject(fabricImg) // Centrer l'image
          canvas.add(fabricImg)
          canvas.setActiveObject(fabricImg)
          canvas.renderAll()
        }

        imgElement.onerror = () => {
          console.error("Erreur lors du chargement de l'image.")
        }
      }

      reader.readAsDataURL(file)
    },
    [canvas, labelConfig, centerObject]
  )
}

export default useAddImage
