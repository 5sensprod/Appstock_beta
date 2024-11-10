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

      // Configurer le fond par défaut, en s'assurant qu'il reste blanc
      fabricCanvas.backgroundColor = labelConfig.backgroundColor || 'white'
      fabricCanvas.renderAll()
      dispatchCanvasAction({ type: 'SET_CANVAS', payload: fabricCanvas })
    } else {
      // Appliquer le fond blanc chaque fois que le canevas est redimensionné
      canvas.setWidth(mmToPx(labelConfig.labelWidth || 200))
      canvas.setHeight(mmToPx(labelConfig.labelHeight || 100))
      canvas.backgroundColor = labelConfig.backgroundColor || 'white'
      canvas.renderAll()
    }
  }, [canvas, labelConfig, dispatchCanvasAction, canvasRef])
}
