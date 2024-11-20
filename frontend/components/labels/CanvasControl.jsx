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
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents } = state

  useEffect(() => {
    if (!canvas) return

    // Nettoyer le canevas si la cellule sélectionnée est vide ou inexistante
    if (
      !selectedCellId ||
      !cellContents[selectedCellId] ||
      cellContents[selectedCellId].length === 0
    ) {
      canvas.clear()
      canvas.renderAll()
      return
    }

    // Charger les objets si la cellule contient des données
    const objects = convertCellContentToCanvasObjects(cellContents[selectedCellId])

    canvas.clear()

    objects.forEach((obj) => {
      const { text, ...fabricOptions } = obj
      const fabricObject = new fabric.IText(text, fabricOptions)
      canvas.add(fabricObject)
    })

    canvas.renderAll()
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

      dispatch({
        type: 'UPDATE_CELL_CONTENT',
        payload: { id: selectedCellId, content: updatedObjects }
      })

      const linkedGroup = findLinkedGroup(selectedCellId)
      if (linkedGroup && linkedGroup.length > 1) {
        const layout = updatedObjects.reduce((acc, item) => {
          acc[item.id] = { left: item.left, top: item.top }
          return acc
        }, {})

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
