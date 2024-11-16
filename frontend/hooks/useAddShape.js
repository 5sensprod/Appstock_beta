import { useCallback } from 'react'
import * as fabric from 'fabric'
import useAddObjectToCanvas from './useAddObjectToCanvas'

const useAddShape = (canvas, labelConfig, selectedColor) => {
  const { centerObject } = useAddObjectToCanvas(labelConfig)

  const onAddCircle = useCallback(() => {
    if (!canvas) {
      console.error('Canvas is not initialized.')
      return
    }

    const minDimension = Math.min(labelConfig.labelWidth, labelConfig.labelHeight)
    const circleRadius = minDimension / 2.5

    const circle = new fabric.Circle({
      radius: circleRadius,
      fill: selectedColor,
      stroke: '#aaf',
      strokeWidth: 2,
      strokeUniform: true
    })

    centerObject(circle) // Centrer le cercle
    canvas.add(circle)
    canvas.setActiveObject(circle)
    canvas.renderAll()
  }, [canvas, labelConfig, selectedColor, centerObject])

  const onAddRectangle = useCallback(() => {
    if (!canvas) {
      console.error('Canvas is not initialized.')
      return
    }

    const rectWidth = labelConfig.labelWidth / 1.1
    const rectHeight = labelConfig.labelHeight / 1.1

    const rectangle = new fabric.Rect({
      width: rectWidth,
      height: rectHeight,
      fill: selectedColor
    })

    centerObject(rectangle) // Centrer le rectangle
    canvas.add(rectangle)
    canvas.setActiveObject(rectangle)
    canvas.renderAll()
  }, [canvas, labelConfig, selectedColor, centerObject])

  return { onAddCircle, onAddRectangle }
}

export default useAddShape
