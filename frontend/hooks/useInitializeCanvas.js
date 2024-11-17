// frontend/hooks/useInitializeCanvas.js

import { useEffect } from 'react'
import * as fabric from 'fabric'
import { mmToPx } from '../utils/conversionUtils'

export default function useInitializeCanvas(canvas, labelConfig, dispatchCanvasAction, canvasRef) {
  // Initialisation du canevas uniquement une fois
  useEffect(() => {
    if (!canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        preserveObjectStacking: true
      })

      // Configurer le fond par défaut
      fabricCanvas.backgroundColor = labelConfig.backgroundColor || 'white'
      fabricCanvas.renderAll()

      dispatchCanvasAction({ type: 'SET_CANVAS', payload: fabricCanvas })
    }
  }, [canvas, canvasRef, dispatchCanvasAction, labelConfig.backgroundColor])

  // Mise à jour des dimensions du canevas lorsque labelConfig change
  useEffect(() => {
    if (canvas) {
      canvas.setWidth(mmToPx(labelConfig.labelWidth || 200))
      canvas.setHeight(mmToPx(labelConfig.labelHeight || 100))
      canvas.renderAll()
    }
  }, [canvas, labelConfig.labelWidth, labelConfig.labelHeight])
}
