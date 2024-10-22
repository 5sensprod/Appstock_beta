import { useCallback } from 'react'
import * as fabric from 'fabric'
import { mmToPx } from '../utils/conversionUtils' // Assure-toi que tu as la fonction de conversion

const useAddObjectToCanvas = (canvas, labelConfig, selectedColor) => {
  const addObjectToCanvas = useCallback(
    (object) => {
      if (!canvas) return

      // Calcul des coordonnées centrales du canevas
      const centerX = mmToPx(labelConfig.labelWidth / 2)
      const centerY = mmToPx(labelConfig.labelHeight / 2)

      object.set({
        left: centerX - object.getScaledWidth() / 2, // Centre horizontalement
        top: centerY - object.getScaledHeight() / 2 // Centre verticalement
      })

      canvas.add(object)
      canvas.setActiveObject(object)
      canvas.renderAll()
    },
    [canvas, labelConfig]
  )

  // Fonction pour ajouter un cercle
  const onAddCircle = useCallback(() => {
    const minDimension = Math.min(labelConfig.labelWidth, labelConfig.labelHeight)
    const circleRadius = minDimension / 2.5

    const circle = new fabric.Circle({
      radius: circleRadius,
      fill: selectedColor,
      stroke: '#aaf',
      strokeWidth: 2,
      strokeUniform: true
    })

    addObjectToCanvas(circle)
  }, [selectedColor, labelConfig, addObjectToCanvas])

  // Fonction pour ajouter un rectangle
  const onAddRectangle = useCallback(() => {
    const rectWidth = labelConfig.labelWidth / 1.1
    const rectHeight = labelConfig.labelHeight / 1.1

    const rectangle = new fabric.Rect({
      width: rectWidth,
      height: rectHeight,
      fill: selectedColor
    })

    addObjectToCanvas(rectangle)
  }, [selectedColor, labelConfig, addObjectToCanvas])

  // Fonction pour ajouter du texte
  const onAddText = useCallback(() => {
    const fontSize = labelConfig.labelWidth / 5

    const text = new fabric.IText('Votre texte ici', {
      fontSize: fontSize,
      fill: selectedColor
    })

    addObjectToCanvas(text)
  }, [selectedColor, labelConfig, addObjectToCanvas])

  // Fonction pour ajouter une image à partir d'une URL
  const onAddImage = useCallback(
    (file) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imgElement = new Image()
        imgElement.src = event.target.result

        imgElement.onload = () => {
          // Obtenir les dimensions de l'image chargée
          const imgWidth = imgElement.naturalWidth
          const imgHeight = imgElement.naturalHeight

          // Obtenir les dimensions du canevas
          const canvasWidth = mmToPx(labelConfig.labelWidth)
          const canvasHeight = mmToPx(labelConfig.labelHeight)

          // Calculer le facteur de réduction pour conserver les proportions
          const scaleFactor = Math.min(canvasWidth / imgWidth, canvasHeight / imgHeight)

          // Créer une instance de fabric.Image avec les dimensions ajustées
          const fabricImg = new fabric.Image(imgElement, {
            scaleX: scaleFactor, // Appliquer le facteur de réduction
            scaleY: scaleFactor
          })

          // Ajouter l'image au canevas en la centrant
          addObjectToCanvas(fabricImg)
        }

        imgElement.onerror = () => {
          console.error("Échec du chargement de l'image.")
        }
      }

      if (file) {
        reader.readAsDataURL(file) // Lire le fichier image sélectionné
      }
    },
    [addObjectToCanvas, labelConfig]
  )
  return {
    onAddCircle,
    onAddRectangle,
    onAddText,
    onAddImage
  }
}

export default useAddObjectToCanvas
