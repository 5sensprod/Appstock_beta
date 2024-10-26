import { useCallback } from 'react'
import * as fabric from 'fabric'
import { mmToPx } from '../utils/conversionUtils'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddImage = (canvas, labelConfig) => {
  const { addObjectToCanvas } = useAddObjectToCanvas(canvas, labelConfig) // Assurez-vous de bien extraire addObjectToCanvas

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

          // Utiliser addObjectToCanvas pour centrer et ajouter l'image au canevas
          addObjectToCanvas(fabricImg)
        }

        imgElement.onerror = () => {
          console.error("Erreur lors du chargement de l'image.")
        }
      }

      reader.readAsDataURL(file)
    },
    [canvas, labelConfig, addObjectToCanvas]
  )
}

export default useAddImage
