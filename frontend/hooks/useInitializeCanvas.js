import { useEffect } from 'react'
import * as fabric from 'fabric'
import { mmToPx } from '../utils/conversionUtils'

export default function useInitializeCanvas(canvas, labelConfig, dispatchCanvasAction, canvasRef) {
  // Initialisation du canvas Fabric.js
  useEffect(() => {
    if (!canvas && canvasRef.current) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        preserveObjectStacking: true
      })

      fabricCanvas.backgroundColor = labelConfig.backgroundColor || 'white'
      fabricCanvas.renderAll()

      dispatchCanvasAction({ type: 'SET_CANVAS', payload: fabricCanvas })
    }
  }, [canvas, canvasRef, dispatchCanvasAction, labelConfig.backgroundColor])

  // Mise à jour de la configuration du canvas lorsque `labelConfig` change
  useEffect(() => {
    if (canvas) {
      canvas.setWidth(mmToPx(labelConfig.labelWidth))
      canvas.setHeight(mmToPx(labelConfig.labelHeight))

      // Mettre à jour le background si nécessaire
      canvas.backgroundColor = labelConfig.backgroundColor || 'white'
      canvas.renderAll()
    }
  }, [canvas, labelConfig.labelWidth, labelConfig.labelHeight, labelConfig.backgroundColor])
}
