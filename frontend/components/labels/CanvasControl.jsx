import React, { useEffect, useContext } from 'react'
import * as fabric from 'fabric'
import styles from './FabricDesigner.module.css'
import { useCanvas } from '../../context/CanvasContext'
import { GridContext } from '../../context/GridContext'

// Conversion des données de contenu en objets Fabric
function convertCellContentToCanvasObjects(cellContent) {
  return cellContent.map((item) => ({
    text: item.text,
    left: item.left,
    top: item.top,
    fontSize: item.fontSize,
    fill: item.fill,
    id: item.id,
    fontFamily: item.fontFamily || 'Arial',
    angle: item.angle || 0,
    scaleX: item.scaleX || 1, // Applique la valeur par défaut si non spécifiée
    scaleY: item.scaleY || 1, // Applique la valeur par défaut si non spécifiée
    editable: true
  }))
}

export default function CanvasControl() {
  const { canvasRef, canvas } = useCanvas()
  const { state, dispatch, findLinkedGroup } = useContext(GridContext)
  const { selectedCellId, cellContents } = state

  useEffect(() => {
    if (!canvas) return

    const loadCanvasObjects = () => {
      if (
        !selectedCellId ||
        !cellContents[selectedCellId] ||
        cellContents[selectedCellId].length === 0
      ) {
        canvas.clear()
        canvas.renderAll()
        return
      }

      const existingObjects = canvas.getObjects()
      const newObjects = convertCellContentToCanvasObjects(cellContents[selectedCellId])

      // Comparer les objets actuels avec ceux du canvas
      if (JSON.stringify(existingObjects) === JSON.stringify(newObjects)) {
        return
      }

      canvas.clear()
      newObjects.forEach((obj) => {
        const { text, ...fabricOptions } = obj
        const fabricObject = new fabric.IText(text, fabricOptions)
        canvas.add(fabricObject)
      })
      canvas.renderAll()
    }

    const handleModification = () => {
      const activeObject = canvas.getActiveObject() // Sauvegarder l'objet actif

      const updatedObjects = canvas.getObjects().map((obj) => ({
        id: obj.id,
        type: obj.type,
        text: obj.text,
        left: obj.left,
        top: obj.top,
        fontSize: obj.fontSize,
        fill: obj.fill, // Capture la couleur
        fontFamily: obj.fontFamily, // Capture la police
        angle: obj.angle || 0, // Capture l'angle
        scaleX: obj.scaleX, // Capture le scale horizontal
        scaleY: obj.scaleY // Capture le scale vertical
      }))

      dispatch({
        type: 'UPDATE_CELL_CONTENT',
        payload: { id: selectedCellId, content: updatedObjects }
      })

      const linkedGroup = findLinkedGroup(selectedCellId)
      if (linkedGroup && linkedGroup.length > 1) {
        const layout = updatedObjects.reduce((acc, item) => {
          acc[item.id] = {
            left: item.left,
            top: item.top,
            fill: item.fill,
            scaleX: item.scaleX,
            scaleY: item.scaleY,
            fontFamily: item.fontFamily,
            angle: item.angle || 0
          }
          return acc
        }, {})

        dispatch({
          type: 'SYNC_CELL_LAYOUT',
          payload: { sourceId: selectedCellId, layout }
        })
      }

      if (activeObject) {
        canvas.setActiveObject(activeObject) // Restaurer l'objet actif
      }
      canvas.renderAll()
    }

    // Charger les objets initiaux
    loadCanvasObjects()

    const handleEvents = ['object:modified', 'object:changed']
    handleEvents.forEach((event) => canvas.on(event, handleModification))

    return () => {
      handleEvents.forEach((event) => canvas.off(event, handleModification))
    }
  }, [canvas, selectedCellId, cellContents, dispatch, findLinkedGroup])

  return (
    <div className={styles.canvasContainer}>
      <canvas ref={canvasRef} className={styles.sampleCanvas} />
    </div>
  )
}
