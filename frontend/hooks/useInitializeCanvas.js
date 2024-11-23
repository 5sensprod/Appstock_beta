import { useEffect } from 'react'
import * as fabric from 'fabric'
import { mmToPx } from '../utils/conversionUtils'

export default function useInitializeCanvas(canvas, labelConfig, dispatchCanvasAction, canvasRef) {
  useEffect(() => {
    if (!canvas && canvasRef.current) {
      console.log('Initializing Fabric canvas:', canvasRef.current)
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        preserveObjectStacking: true
      })

      fabricCanvas.backgroundColor = labelConfig.backgroundColor || 'white'
      fabricCanvas.renderAll()

      dispatchCanvasAction({ type: 'SET_CANVAS', payload: fabricCanvas })
    }
  }, [canvas, canvasRef, dispatchCanvasAction, labelConfig.backgroundColor])

  useEffect(() => {
    if (canvas) {
      console.log('Updating Fabric canvas dimensions')
      canvas.setWidth(mmToPx(labelConfig.labelWidth || 200))
      canvas.setHeight(mmToPx(labelConfig.labelHeight || 100))
      canvas.renderAll()
    }
  }, [canvas, labelConfig.labelWidth, labelConfig.labelHeight])
}
