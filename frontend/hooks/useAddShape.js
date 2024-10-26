import { useCallback } from 'react'
import * as fabric from 'fabric'

const useAddShape = (canvas, labelConfig, selectedColor, addObjectToCanvas) => {
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

  return { onAddCircle, onAddRectangle }
}

export default useAddShape
