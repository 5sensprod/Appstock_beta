// frontend/hooks/useInitializeCanvas.js

import { useEffect } from 'react'
import * as fabric from 'fabric'
import { mmToPx } from '../utils/conversionUtils'
import { useContext } from 'react'
import { GridContext } from '../context/GridContext'

export default function useInitializeCanvas(canvas, dispatchCanvasAction, canvasRef) {
  const { state: gridState } = useContext(GridContext)
  const { config } = gridState

  useEffect(() => {
    if (!canvas) {
      const fabricCanvas = new fabric.Canvas(canvasRef.current, {
        preserveObjectStacking: true
      })

      // Utilisation des configurations depuis gridReducer
      fabricCanvas.backgroundColor = config.backgroundColor
      fabricCanvas.renderAll()

      dispatchCanvasAction({ type: 'SET_CANVAS', payload: fabricCanvas })
    }
  }, [canvas, canvasRef, dispatchCanvasAction, config.backgroundColor])

  useEffect(() => {
    if (canvas) {
      canvas.setWidth(mmToPx(config.cellWidth))
      canvas.setHeight(mmToPx(config.cellHeight))
      canvas.renderAll()
    }
  }, [canvas, config.cellWidth, config.cellHeight])
}
