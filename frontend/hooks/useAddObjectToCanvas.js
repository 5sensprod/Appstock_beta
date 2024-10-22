import { useCallback } from 'react'
import * as fabric from 'fabric'
import { mmToPx } from '../utils/conversionUtils' // Assure-toi que tu as la fonction de conversion

const useAddObjectToCanvas = (canvas, labelConfig, selectedColor) => {
  const addObjectToCanvas = useCallback(
    (object) => {
      if (!canvas) return

      const centerX = mmToPx(labelConfig.labelWidth / 2)
      const centerY = mmToPx(labelConfig.labelHeight / 2)

      object.set({
        left: centerX - (object.width || 0) / 2,
        top: centerY - (object.height || 0) / 2
      })

      canvas.add(object)
      canvas.setActiveObject(object)
      canvas.renderAll()
    },
    [canvas, labelConfig] // Dépendances pour que la fonction soit recalculée lorsque nécessaire
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

  return {
    onAddCircle,
    onAddRectangle,
    onAddText
  }
}

export default useAddObjectToCanvas
