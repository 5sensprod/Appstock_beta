// hooks/useInitializeCanvas.js
import { useEffect } from 'react'
import * as fabric from 'fabric'
import { mmToPx } from '../utils/conversionUtils'

export default function useInitializeCanvas(canvas, labelConfig, dispatch, canvasRef) {
  useEffect(() => {
    if (!canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: mmToPx(labelConfig.labelWidth),
        height: mmToPx(labelConfig.labelHeight),
        preserveObjectStacking: true
      })

      fabricCanvas.backgroundColor = 'white'
      fabricCanvas.renderAll()
      dispatch({ type: 'SET_CANVAS', payload: fabricCanvas })
    } else {
      canvas.setWidth(mmToPx(labelConfig.labelWidth))
      canvas.setHeight(mmToPx(labelConfig.labelHeight))
      canvas.renderAll()
    }
  }, [canvas, labelConfig, dispatch, canvasRef])
}
