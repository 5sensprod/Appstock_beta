// hooks/useInitializeCanvas.js

import { useEffect } from 'react'
import * as fabric from 'fabric'
import { mmToPx } from '../utils/conversionUtils'

export default function useInitializeCanvas(canvas, labelConfig, dispatchCanvasAction, canvasRef) {
  useEffect(() => {
    if (!canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        width: mmToPx(labelConfig.labelWidth || 200),
        height: mmToPx(labelConfig.labelHeight || 100),
        preserveObjectStacking: true
      })

      // Utiliser backgroundColor de labelConfig
      fabricCanvas.backgroundColor = labelConfig.backgroundColor || 'white'
      fabricCanvas.renderAll()
      dispatchCanvasAction({ type: 'SET_CANVAS', payload: fabricCanvas })
    } else {
      canvas.setWidth(mmToPx(labelConfig.labelWidth || 200))
      canvas.setHeight(mmToPx(labelConfig.labelHeight || 100))
      canvas.backgroundColor = labelConfig.backgroundColor || 'white' // Applique la couleur de fond
      canvas.renderAll()
    }
  }, [canvas, labelConfig, dispatchCanvasAction, canvasRef])
}
