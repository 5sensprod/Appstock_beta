import React, { useRef, useEffect, useState } from 'react'
import { useCellManagerContext } from '../../context/CellManagerContext'
import * as fabric from 'fabric'

const SelectedCellDisplay = () => {
  const canvasRef = useRef(null)
  const { state, dispatch } = useCellManagerContext()
  const { selectedCellIndex, cells, objectProperties, style, objectColors } = state
  const selectedCell = cells[selectedCellIndex]
  const [, setTempProperties] = useState({})

  useEffect(() => {
    if (!canvasRef.current || !selectedCell) return

    let canvas = canvasRef.current._fabricCanvas

    if (!canvas) {
      canvas = new fabric.Canvas(canvasRef.current)
      canvasRef.current._fabricCanvas = canvas
      canvas.setDimensions({ width: 180, height: 100 })
    } else {
      canvas.clear()
    }

    const createTextObject = (text, objectType) => {
      const objProperties = objectProperties[objectType]

      const obj = new fabric.IText(text, {
        left: objProperties.left,
        top: objProperties.top,
        scaleX: objProperties.scaleX,
        scaleY: objProperties.scaleY,
        angle: objProperties.angle,
        fontSize: parseInt(style.fontSize),
        fill: objectColors[objectType]
      })

      // Mise à jour des propriétés en temps réel pendant les interactions
      obj.on('moving', () => {
        setTempProperties({
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle
        })
      })

      obj.on('scaling', () => {
        setTempProperties({
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle
        })
      })

      obj.on('rotating', () => {
        setTempProperties({
          left: obj.left,
          top: obj.top,
          scaleX: obj.scaleX,
          scaleY: obj.scaleY,
          angle: obj.angle
        })
      })

      // Synchroniser les modifications de design avec le contexte
      obj.on('modified', () => {
        dispatch({
          type: 'UPDATE_OBJECT_PROPERTIES',
          payload: {
            objectType,
            left: obj.left,
            top: obj.top,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle
          }
        })
      })

      canvas.add(obj)
    }

    createTextObject(selectedCell.name, 'name')
    createTextObject(`${selectedCell.price}€`, 'price')
    createTextObject(selectedCell.gencode, 'gencode')

    canvas.renderAll()
  }, [selectedCell, objectProperties, style.fontSize, objectColors, dispatch])

  useEffect(() => {
    const canvasElement = canvasRef.current
    return () => {
      if (canvasElement && canvasElement._fabricCanvas) {
        canvasElement._fabricCanvas.dispose()
      }
    }
  }, [])

  return (
    <div className="selected-cell-display rounded border border-gray-300 p-4 shadow-md">
      <canvas ref={canvasRef} width={180} height={100} />
    </div>
  )
}

export default React.memo(SelectedCellDisplay)
