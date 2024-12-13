import { useCallback } from 'react'
import * as fabric from 'fabric'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddShape = (canvas, labelConfig, selectedColor) => {
  const { centerObject } = useAddObjectToCanvas(labelConfig)

  const addShape = useCallback(
    (shape) => {
      if (!canvas) {
        console.error('Canvas is not initialized.')
        return
      }

      shape.id = Math.random().toString(36).substring(2, 11)
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
      stroke: '#000000',
      strokeWidth: 0,
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
      fill: selectedColor,
      stroke: '#000000',
      strokeWidth: 0,
      strokeUniform: true
    })

    addShape(rectangle)
  }, [labelConfig, selectedColor, addShape])

  return { onAddCircle, onAddRectangle }
}

export default useAddShape
