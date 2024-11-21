import { useCallback } from 'react'
import * as fabric from 'fabric'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddShape = (canvas, labelConfig, selectedColor) => {
  const { centerObject } = useAddObjectToCanvas(labelConfig)

  // Fonction générique pour ajouter une forme
  const addShape = useCallback(
    (shape) => {
      if (!canvas) {
        console.error('Canvas is not initialized.')
        return
      }

      // Ajoute un ID unique à la forme
      shape.id = Math.random().toString(36).substring(2, 11)

      // Centre et ajoute la forme au canvas
      centerObject(shape)
      canvas.add(shape)
      canvas.setActiveObject(shape)
      canvas.renderAll()
    },
    [canvas, centerObject]
  )

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

    addShape(circle)
  }, [labelConfig, selectedColor, addShape])

  const onAddRectangle = useCallback(() => {
    const rectWidth = labelConfig.labelWidth / 1.1
    const rectHeight = labelConfig.labelHeight / 1.1

    const rectangle = new fabric.Rect({
      width: rectWidth,
      height: rectHeight,
      fill: selectedColor
    })

    addShape(rectangle)
  }, [labelConfig, selectedColor, addShape])

  return { onAddCircle, onAddRectangle }
}

export default useAddShape
