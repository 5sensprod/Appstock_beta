import React, { useEffect, useContext } from 'react'
import * as fabric from 'fabric'
import styles from './FabricDesigner.module.css'
import { useCanvas } from '../../context/CanvasContext'
import { GridContext } from '../../context/GridContext'

function convertCellContentToCanvasObjects(cellContent) {
  return cellContent.map((item) => ({
    text: item.text,
    left: item.left,
    top: item.top,
    fontSize: item.fontSize,
    fill: item.fill,
    id: item.id,
    fontFamily: 'Arial',
    angle: 0,
    editable: true
  }))
}

export default function CanvasControl() {
  const { canvasRef, canvas } = useCanvas()
  const { state, dispatch, findLinkedGroup } = useContext(GridContext) // Inclure findLinkedGroup
  const { selectedCellId, cellContents } = state

  useEffect(() => {
    if (canvas && selectedCellId && cellContents[selectedCellId]) {
      const objects = convertCellContentToCanvasObjects(cellContents[selectedCellId])

      canvas.clear()

      objects.forEach((obj) => {
        const { text, ...fabricOptions } = obj
        const fabricObject = new fabric.IText(text, fabricOptions)
        canvas.add(fabricObject)
      })

      canvas.renderAll()
    }
  }, [canvas, selectedCellId, cellContents])

  useEffect(() => {
    if (!canvas || !selectedCellId) return

    const handleObjectModified = () => {
      const updatedObjects = canvas.getObjects().map((obj) => ({
        id: obj.id,
        type: 'IText',
        text: obj.text,
        left: obj.left,
        top: obj.top,
        fontSize: obj.fontSize,
        fill: obj.fill
      }))

      // Dispatch UPDATE_CELL_CONTENT
      dispatch({
        type: 'UPDATE_CELL_CONTENT',
        payload: { id: selectedCellId, content: updatedObjects }
      })

      // Vérifier si la cellule appartient à un groupe lié
      const linkedGroup = findLinkedGroup(selectedCellId)
      if (linkedGroup && linkedGroup.length > 1) {
        // Construire le layout
        const layout = updatedObjects.reduce((acc, item) => {
          acc[item.id] = { left: item.left, top: item.top }
          return acc
        }, {})

        // Dispatch SYNC_CELL_LAYOUT
        dispatch({
          type: 'SYNC_CELL_LAYOUT',
          payload: { sourceId: selectedCellId, layout }
        })
      }
    }

    canvas.on('object:modified', handleObjectModified)

    return () => {
      canvas.off('object:modified', handleObjectModified)
    }
  }, [canvas, selectedCellId, dispatch, findLinkedGroup])

  return (
    <div className={styles.canvasContainer}>
      <canvas ref={canvasRef} className={styles.sampleCanvas} />
    </div>
  )
}
